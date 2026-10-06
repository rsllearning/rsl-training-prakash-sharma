/**
 * Shared type definitions for the Organization Management system.
 */

/** All designations available in the organization, from bottom to top of the hierarchy. */
export enum Designation {
  Engineer = "Engineer",
  Lead = "Lead",
  Manager = "Manager",
  Director = "Director",
  CEO = "CEO",
}

/**
 * Reporting rules: which designation each designation must report to.
 * `null` means "reports to no one" (only the CEO).
 */
export const REPORTS_TO_DESIGNATION: Readonly<Record<Designation, Designation | null>> = Object.freeze({
  [Designation.Engineer]: Designation.Lead,
  [Designation.Lead]: Designation.Manager,
  [Designation.Manager]: Designation.Director,
  [Designation.Director]: Designation.CEO,
  [Designation.CEO]: null,
});

/**
 * Reportee rules: which designation may report to each designation.
 * `null` means "cannot have reportees" (only the Engineer).
 */
export const REPORTEE_DESIGNATION: Readonly<Record<Designation, Designation | null>> = Object.freeze({
  [Designation.Engineer]: null,
  [Designation.Lead]: Designation.Engineer,
  [Designation.Manager]: Designation.Lead,
  [Designation.Director]: Designation.Manager,
  [Designation.CEO]: Designation.Director,
});

/** Input accepted when creating a new employee. */
export interface CreateEmployeeInput {
  id: string;
  name: string;
  /** Date of birth in mm/dd/yyyy format. */
  dateOfBirth: string;
  designation: Designation;
  /** Id of the manager. Must be `null`/omitted for the CEO and is required for everyone else. */
  reportsTo?: string | null;
  /** Optional extra field. */
  email?: string;
}

/**
 * Fields that can be changed on an existing employee.
 * The id is immutable; reportees are maintained by the organization itself.
 */
export interface UpdateEmployeeInput {
  name?: string;
  dateOfBirth?: string;
  designation?: Designation;
  reportsTo?: string | null;
  email?: string;
}

/** Options for deleting an employee who still has reportees. */
export interface DeleteEmployeeOptions {
  /**
   * Id of an employee with the same designation as the one being deleted.
   * When provided, all reportees of the deleted employee are moved to this employee.
   * When omitted, deleting an employee who has reportees is rejected.
   */
  reassignReporteesTo?: string;
}

/** Read-only, plain-object snapshot of an employee returned to callers. */
export interface EmployeeDTO {
  readonly id: string;
  readonly name: string;
  readonly dateOfBirth: string;
  readonly designation: Designation;
  readonly reportsTo: string | null;
  readonly reportees: readonly string[];
  readonly email?: string;
}
