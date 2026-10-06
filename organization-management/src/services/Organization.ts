import {
  CEOAlreadyExistsError,
  DuplicateEmployeeError,
  EmployeeNotFoundError,
  HasReporteesError,
  InvalidHierarchyError,
  ValidationError,
} from "../errors/OrganizationError";
import { EmployeeFactory } from "../factory/EmployeeFactory";
import { Employee, EmployeeProps } from "../models";
import {
  CreateEmployeeInput,
  DeleteEmployeeOptions,
  Designation,
  EmployeeDTO,
  REPORTS_TO_DESIGNATION,
  UpdateEmployeeInput,
} from "../types";
import {
  requireNonEmptyString,
  validateDateOfBirth,
  validateDesignation,
  validateEmail,
  validateId,
  validateName,
  withArticle,
} from "../utils/validators";

const UPDATABLE_FIELDS: ReadonlySet<string> = new Set<string>(["name", "dateOfBirth", "designation", "reportsTo", "email"]);

/**
 * The Organization owns every employee and is the single place where
 * cross-employee rules are enforced:
 *  - unique ids
 *  - a single CEO
 *  - valid reporting lines (Engineer → Lead → Manager → Director → CEO)
 *  - `reportsTo` and `reportees` always kept consistent in both directions
 *
 * Every public method validates *all* input before mutating anything, so a failed
 * operation never leaves the organization half-updated.
 *
 * Because each designation may only report to the designation directly above it,
 * reporting cycles are structurally impossible.
 */
export class Organization {
  public readonly name: string;
  private readonly employees: Map<string, Employee> = new Map<string, Employee>();
  private ceoId: string | null = null;
  private readonly factory: EmployeeFactory;

  public constructor(name: string, factory: EmployeeFactory = new EmployeeFactory()) {
    this.name = requireNonEmptyString(name, "organization name");
    this.factory = factory;
  }

  /** Number of employees in the organization. */
  public get size(): number {
    return this.employees.size;
  }

  // =====================================================================
  // CREATE
  // =====================================================================

  /** Adds a new employee and links them to their manager. Returns the created employee. */
  public addEmployee(input: CreateEmployeeInput): EmployeeDTO {
    if (typeof input !== "object" || input === null) {
      throw new ValidationError("employee", "input must be an object.");
    }
    const id = validateId(input.id);
    if (this.employees.has(id)) {
      throw new DuplicateEmployeeError(id);
    }
    const designation = validateDesignation(input.designation);
    if (designation === Designation.CEO && this.ceoId !== null) {
      throw new CEOAlreadyExistsError(this.ceoId);
    }
    const reportsTo = this.normalizeReportsTo(input.reportsTo);

    // Field-level validation (name, dob, email, CEO/non-CEO reportsTo shape) happens in the model.
    const props: EmployeeProps = {
      id,
      name: input.name,
      dateOfBirth: input.dateOfBirth,
      reportsTo,
      ...(input.email !== undefined ? { email: input.email } : {}),
    };
    const employee = this.factory.create(designation, props);

    // Cross-employee validation.
    const manager = reportsTo === null ? null : this.resolveManager(reportsTo, designation, id);

    // Commit.
    this.employees.set(id, employee);
    manager?.addReportee(id);
    if (designation === Designation.CEO) {
      this.ceoId = id;
    }
    return employee.toDTO();
  }

  // =====================================================================
  // READ
  // =====================================================================

  /** Returns all employees, optionally filtered by designation, ordered by hierarchy level then id. */
  public getAllEmployees(designation?: Designation): EmployeeDTO[] {
    const levels = Object.values(Designation);
    return [...this.employees.values()]
      .filter((e: Employee): boolean => designation === undefined || e.designation === designation)
      .sort(
        (a: Employee, b: Employee): number =>
          levels.indexOf(b.designation) - levels.indexOf(a.designation) || a.id.localeCompare(b.id),
      )
      .map((e: Employee): EmployeeDTO => e.toDTO());
  }

  /** Returns one employee or throws `EmployeeNotFoundError`. */
  public getEmployee(id: string): EmployeeDTO {
    return this.requireEmployee(id).toDTO();
  }

  /** Returns one employee or `undefined` (non-throwing lookup). */
  public findEmployee(id: string): EmployeeDTO | undefined {
    return this.employees.get(typeof id === "string" ? id.trim() : "")?.toDTO();
  }

  public getCEO(): EmployeeDTO | undefined {
    return this.ceoId === null ? undefined : this.getEmployee(this.ceoId);
  }

  /** Direct reportees of an employee. */
  public getReportees(id: string): EmployeeDTO[] {
    return this.requireEmployee(id).reportees.map((rid: string): EmployeeDTO => this.requireEmployee(rid).toDTO());
  }

  /** The full management chain above an employee, nearest manager first. */
  public getReportingChain(id: string): EmployeeDTO[] {
    const chain: EmployeeDTO[] = [];
    let current = this.requireEmployee(id);
    while (current.reportsTo !== null) {
      current = this.requireEmployee(current.reportsTo);
      chain.push(current.toDTO());
    }
    return chain;
  }

  // =====================================================================
  // UPDATE
  // =====================================================================

  /**
   * Updates an existing employee. Supports changing name, dateOfBirth, email,
   * reportsTo (re-assignment to another manager) and designation (promotion/demotion).
   * The id is immutable and reportees are managed automatically.
   */
  public updateEmployee(id: string, updates: UpdateEmployeeInput): EmployeeDTO {
    const employee = this.requireEmployee(id);
    this.assertValidUpdatePayload(updates);

    // ---- 1. Validate every field first (no mutation yet) ----
    const newName = updates.name !== undefined ? validateName(updates.name) : employee.name;
    const newDob = updates.dateOfBirth !== undefined ? validateDateOfBirth(updates.dateOfBirth) : employee.dateOfBirth;
    const newEmail = updates.email !== undefined ? validateEmail(updates.email) : employee.email;
    const newDesignation =
      updates.designation !== undefined ? validateDesignation(updates.designation) : employee.designation;
    const designationChanged = newDesignation !== employee.designation;

    let newReportsTo: string | null;
    if ("reportsTo" in updates) {
      newReportsTo = this.normalizeReportsTo(updates.reportsTo);
    } else if (designationChanged) {
      // Moving to a new level almost always needs a new manager; the CEO needs none.
      newReportsTo = newDesignation === Designation.CEO ? null : employee.reportsTo;
    } else {
      newReportsTo = employee.reportsTo;
    }

    if (designationChanged) {
      if (employee.hasReportees()) {
        throw new HasReporteesError(
          employee.id,
          employee.reportees,
          "Reassign or remove their reportees before changing the designation.",
        );
      }
      if (newDesignation === Designation.CEO && this.ceoId !== null && this.ceoId !== employee.id) {
        throw new CEOAlreadyExistsError(this.ceoId);
      }
    }

    const oldManagerId = employee.reportsTo;
    const managerChanged = newReportsTo !== oldManagerId;
    const newManager = newReportsTo === null ? null : this.resolveManager(newReportsTo, newDesignation, employee.id);

    // Build the updated instance. For a designation change this creates a new object of the right class;
    // otherwise we build a throw-away copy purely to validate the combination before mutating the real one.
    const props: EmployeeProps = {
      id: employee.id,
      name: newName,
      dateOfBirth: newDob,
      reportsTo: newReportsTo,
      ...(newEmail !== undefined ? { email: newEmail } : {}),
    };
    const candidate = this.factory.create(newDesignation, props);

    // ---- 2. Commit ----
    let updated: Employee;
    if (designationChanged) {
      updated = candidate;
      this.employees.set(employee.id, updated);
      if (employee.designation === Designation.CEO) {
        this.ceoId = null;
      }
      if (newDesignation === Designation.CEO) {
        this.ceoId = employee.id;
      }
    } else {
      updated = employee;
      updated.name = newName;
      updated.dateOfBirth = newDob;
      updated.email = newEmail;
      updated.setReportsTo(newReportsTo);
    }

    if (oldManagerId !== null && (managerChanged || designationChanged)) {
      this.employees.get(oldManagerId)?.removeReportee(employee.id);
    }
    newManager?.addReportee(employee.id);

    return updated.toDTO();
  }

  // =====================================================================
  // DELETE
  // =====================================================================

  /**
   * Deletes an employee.
   * - If the employee has no reportees, they are removed and unlinked from their manager.
   * - If they have reportees, deletion is rejected unless `reassignReporteesTo` names an
   *   existing employee of the same designation, who then inherits all the reportees.
   * Returns a snapshot of the deleted employee.
   */
  public deleteEmployee(id: string, options: DeleteEmployeeOptions = {}): EmployeeDTO {
    const employee = this.requireEmployee(id);
    const reportees = [...employee.reportees];

    let successor: Employee | null = null;
    if (reportees.length > 0) {
      if (options.reassignReporteesTo === undefined) {
        const hint =
          employee.designation === Designation.CEO
            ? "The CEO is unique, so their Directors cannot be reassigned; remove the Directors first."
            : `Pass 'reassignReporteesTo' with the id of another ${employee.designation} to move them before deleting.`;
        throw new HasReporteesError(employee.id, reportees, hint);
      }
      const successorId = validateId(options.reassignReporteesTo, "reassignReporteesTo");
      if (successorId === employee.id) {
        throw new InvalidHierarchyError("Cannot reassign reportees to the employee being deleted.");
      }
      successor = this.requireEmployee(successorId, "reassignReporteesTo");
      if (successor.designation !== employee.designation) {
        throw new InvalidHierarchyError(
          `Reportees of ${withArticle(employee.designation)} can only be reassigned to another ${employee.designation}; ` +
            `'${successor.id}' is ${withArticle(successor.designation)}.`,
        );
      }
    }

    // Commit.
    if (successor !== null) {
      for (const reporteeId of reportees) {
        this.requireEmployee(reporteeId).setReportsTo(successor.id);
        successor.addReportee(reporteeId);
      }
    }
    if (employee.reportsTo !== null) {
      this.employees.get(employee.reportsTo)?.removeReportee(employee.id);
    }
    this.employees.delete(employee.id);
    if (this.ceoId === employee.id) {
      this.ceoId = null;
    }
    // Snapshot after unlinking, but report the reportees the employee had.
    return Object.freeze({ ...employee.toDTO(), reportees: Object.freeze(reportees) });
  }

  // =====================================================================
  // DISPLAY HELPERS
  // =====================================================================

  /** Renders the organization as an indented tree, starting from the CEO. */
  public renderHierarchy(): string {
    const lines: string[] = [`${this.name}`];
    const visit = (employee: Employee, prefix: string, isLast: boolean): void => {
      lines.push(`${prefix}${isLast ? "└── " : "├── "}${employee.toString()}`);
      const children = employee.reportees.map((rid: string): Employee => this.requireEmployee(rid));
      children.forEach((child: Employee, index: number): void => {
        visit(child, `${prefix}${isLast ? "    " : "│   "}`, index === children.length - 1);
      });
    };
    if (this.ceoId !== null) {
      visit(this.requireEmployee(this.ceoId), "", true);
    } else {
      lines.push("└── (no CEO yet)");
    }
    return lines.join("\n");
  }

  // =====================================================================
  // PRIVATE HELPERS
  // =====================================================================

  private requireEmployee(id: string, context?: string): Employee {
    const key = validateId(id, context ?? "id");
    const employee = this.employees.get(key);
    if (employee === undefined) {
      throw new EmployeeNotFoundError(key, context);
    }
    return employee;
  }

  /** `undefined`, `null` and blank strings all mean "reports to no one". */
  private normalizeReportsTo(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value !== "string") {
      throw new ValidationError("reportsTo", "must be a string id or null.");
    }
    return value.trim() === "" ? null : validateId(value, "reportsTo");
  }

  /**
   * Checks that `managerId` exists and has the designation that `designation` must report to.
   * Returns the manager.
   */
  private resolveManager(managerId: string, designation: Designation, employeeId: string): Employee {
    const required = REPORTS_TO_DESIGNATION[designation];
    if (required === null) {
      throw new InvalidHierarchyError(`${withArticle(designation, true)} reports to no one, so 'reportsTo' must be empty.`);
    }
    if (managerId === employeeId) {
      throw new InvalidHierarchyError(`Employee '${employeeId}' cannot report to themselves.`);
    }
    const manager = this.employees.get(managerId);
    if (manager === undefined) {
      throw new EmployeeNotFoundError(managerId, "referenced by reportsTo");
    }
    if (manager.designation !== required) {
      throw new InvalidHierarchyError(
        `${withArticle(designation, true)} must report to ${withArticle(required)}, but '${managerId}' is ${withArticle(manager.designation)}.`,
      );
    }
    return manager;
  }

  private assertValidUpdatePayload(updates: UpdateEmployeeInput): void {
    if (typeof updates !== "object" || updates === null) {
      throw new ValidationError("updates", "must be an object.");
    }
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      throw new ValidationError("updates", "at least one field must be provided.");
    }
    for (const key of keys) {
      if (key === "id") {
        throw new ValidationError("id", "is immutable and cannot be updated.");
      }
      if (key === "reportees") {
        throw new ValidationError("reportees", "are managed automatically; update the reportee's 'reportsTo' instead.");
      }
      if (!UPDATABLE_FIELDS.has(key)) {
        throw new ValidationError(key, `is not an updatable field. Allowed: ${[...UPDATABLE_FIELDS].join(", ")}.`);
      }
    }
  }
}
