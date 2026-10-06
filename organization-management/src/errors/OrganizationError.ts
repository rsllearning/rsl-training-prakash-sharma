/**
 * Custom error hierarchy. Every error raised by the organization extends
 * `OrganizationError` and carries a machine-readable `code`.
 */

export enum ErrorCode {
  VALIDATION = "VALIDATION_ERROR",
  DUPLICATE_ID = "DUPLICATE_ID",
  NOT_FOUND = "EMPLOYEE_NOT_FOUND",
  INVALID_HIERARCHY = "INVALID_HIERARCHY",
  CEO_ALREADY_EXISTS = "CEO_ALREADY_EXISTS",
  HAS_REPORTEES = "HAS_REPORTEES",
}

export class OrganizationError extends Error {
  public readonly code: ErrorCode;

  public constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = new.target.name;
    // Keep the prototype chain intact so `instanceof` works for subclasses.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Invalid input: empty fields, bad date format, bad id format, etc. */
export class ValidationError extends OrganizationError {
  public readonly field: string;

  public constructor(field: string, message: string) {
    super(ErrorCode.VALIDATION, `Invalid '${field}': ${message}`);
    this.field = field;
  }
}

export class DuplicateEmployeeError extends OrganizationError {
  public constructor(id: string) {
    super(ErrorCode.DUPLICATE_ID, `An employee with id '${id}' already exists.`);
  }
}

export class EmployeeNotFoundError extends OrganizationError {
  public constructor(id: string, context?: string) {
    super(ErrorCode.NOT_FOUND, `No employee found with id '${id}'${context !== undefined ? ` (${context})` : ""}.`);
  }
}

/** A reporting relationship that breaks the Engineer → Lead → Manager → Director → CEO chain. */
export class InvalidHierarchyError extends OrganizationError {
  public constructor(message: string) {
    super(ErrorCode.INVALID_HIERARCHY, message);
  }
}

export class CEOAlreadyExistsError extends OrganizationError {
  public constructor(existingCeoId: string) {
    super(
      ErrorCode.CEO_ALREADY_EXISTS,
      `The organization already has a CEO (id '${existingCeoId}'). Only one CEO is allowed.`,
    );
  }
}

/** Attempt to delete (or demote) an employee who still has people reporting to them. */
export class HasReporteesError extends OrganizationError {
  public constructor(id: string, reportees: readonly string[], hint: string) {
    super(
      ErrorCode.HAS_REPORTEES,
      `Employee '${id}' still has ${reportees.length} reportee(s) [${reportees.join(", ")}]. ${hint}`,
    );
  }
}
