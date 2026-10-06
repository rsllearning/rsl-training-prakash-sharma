import { InvalidHierarchyError } from "../errors/OrganizationError";
import { withArticle } from "../utils/validators";
import { Employee } from "./Employee";

/**
 * An employee who can never have reportees.
 * Overrides the reportee operations so any attempt to add one is rejected.
 */
export abstract class IndividualContributor extends Employee {
  public get reportees(): readonly string[] {
    return [];
  }

  public canHaveReportees(): boolean {
    return false;
  }

  public addReportee(employeeId: string): void {
    throw new InvalidHierarchyError(
      `${this.toString()} cannot have reportees; '${employeeId}' cannot report to ${withArticle(this.designation)}.`,
    );
  }

  public removeReportee(_employeeId: string): void {
    // Nothing to remove: an individual contributor never has reportees.
  }
}
