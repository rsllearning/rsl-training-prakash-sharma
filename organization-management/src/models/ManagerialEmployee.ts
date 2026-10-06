import { Employee, EmployeeProps } from "./Employee";

/**
 * An employee who can have direct reportees (Lead, Manager, Director, CEO).
 * Reportee ids are kept in an insertion-ordered Set, so duplicates are impossible.
 */
export abstract class ManagerialEmployee extends Employee {
  private readonly _reportees: Set<string> = new Set<string>();

  protected constructor(props: EmployeeProps) {
    super(props);
  }

  public get reportees(): readonly string[] {
    return [...this._reportees];
  }

  public canHaveReportees(): boolean {
    return true;
  }

  public addReportee(employeeId: string): void {
    this._reportees.add(employeeId);
  }

  public removeReportee(employeeId: string): void {
    this._reportees.delete(employeeId);
  }
}
