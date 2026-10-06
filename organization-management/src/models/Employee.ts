import { InvalidHierarchyError } from "../errors/OrganizationError";
import { Designation, EmployeeDTO, REPORTEE_DESIGNATION, REPORTS_TO_DESIGNATION } from "../types";
import { validateDateOfBirth, validateEmail, validateId, validateName, withArticle } from "../utils/validators";

/** Constructor properties shared by every employee type. */
export interface EmployeeProps {
  id: string;
  name: string;
  dateOfBirth: string;
  reportsTo: string | null;
  email?: string;
}

/**
 * Abstract base class for every employee.
 *
 * - Encapsulation: state lives in private fields; changes go through validated setters/methods.
 * - Abstraction: subclasses must declare their `designation` and a role description.
 * - Polymorphism: reportee handling differs between individual contributors and managers.
 *
 * Note: an Employee validates only what it can know about itself (field formats, whether it may
 * report to someone). Rules that involve *other* employees (does the manager exist? is it the right
 * designation?) are enforced by the `Organization` service.
 */
export abstract class Employee {
  private readonly _id: string;
  private _name: string;
  private _dateOfBirth: string;
  private _email: string | undefined;
  private _reportsTo: string | null;

  /** The designation of this employee type. */
  public abstract readonly designation: Designation;

  protected constructor(props: EmployeeProps) {
    this._id = validateId(props.id);
    this._name = validateName(props.name);
    this._dateOfBirth = validateDateOfBirth(props.dateOfBirth);
    this._email = props.email === undefined ? undefined : validateEmail(props.email);
    this._reportsTo = props.reportsTo === null ? null : validateId(props.reportsTo, "reportsTo");
  }

  // ---------- identity & personal details ----------

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = validateName(value);
  }

  public get dateOfBirth(): string {
    return this._dateOfBirth;
  }

  public set dateOfBirth(value: string) {
    this._dateOfBirth = validateDateOfBirth(value);
  }

  public get email(): string | undefined {
    return this._email;
  }

  public set email(value: string | undefined) {
    this._email = value === undefined ? undefined : validateEmail(value);
  }

  // ---------- reporting line ----------

  public get reportsTo(): string | null {
    return this._reportsTo;
  }

  /** The designation this employee must report to (`null` for the CEO). */
  public get managerDesignation(): Designation | null {
    return REPORTS_TO_DESIGNATION[this.designation];
  }

  /** The designation allowed to report to this employee (`null` for the Engineer). */
  public get reporteeDesignation(): Designation | null {
    return REPORTEE_DESIGNATION[this.designation];
  }

  /** Sets the manager id. Ensures the CEO never reports to anyone and everyone else always does. */
  public setReportsTo(managerId: string | null): void {
    this.assertReportsToShape(managerId);
    this._reportsTo = managerId === null ? null : validateId(managerId, "reportsTo");
  }

  /** Must be called by subclasses at the end of their constructor (after `designation` is set). */
  protected assertReportsToShape(managerId: string | null = this._reportsTo): void {
    const required = this.managerDesignation;
    if (required === null && managerId !== null) {
      throw new InvalidHierarchyError(`${withArticle(this.designation, true)} reports to no one, so 'reportsTo' must be empty.`);
    }
    if (required !== null && managerId === null) {
      throw new InvalidHierarchyError(`${withArticle(this.designation, true)} must report to ${withArticle(required)}; 'reportsTo' is required.`);
    }
    if (managerId !== null && managerId === this._id) {
      throw new InvalidHierarchyError(`Employee '${this._id}' cannot report to themselves.`);
    }
  }

  // ---------- reportees (polymorphic) ----------

  /** Ids of the employees reporting directly to this employee. */
  public abstract get reportees(): readonly string[];

  public abstract canHaveReportees(): boolean;

  public abstract addReportee(employeeId: string): void;

  public abstract removeReportee(employeeId: string): void;

  public hasReportees(): boolean {
    return this.reportees.length > 0;
  }

  // ---------- presentation ----------

  /** Human readable summary of the role. Each subclass describes itself. */
  public abstract describeRole(): string;

  /** Returns an immutable plain-object snapshot, so callers cannot mutate internal state. */
  public toDTO(): EmployeeDTO {
    const dto: EmployeeDTO = {
      id: this._id,
      name: this._name,
      dateOfBirth: this._dateOfBirth,
      designation: this.designation,
      reportsTo: this._reportsTo,
      reportees: Object.freeze([...this.reportees]),
      ...(this._email !== undefined ? { email: this._email } : {}),
    };
    return Object.freeze(dto);
  }

  public toString(): string {
    return `${this.designation} ${this._name} (${this._id})`;
  }
}
