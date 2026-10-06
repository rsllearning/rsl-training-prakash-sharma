import { Designation } from "../types";
import { EmployeeProps } from "./Employee";
import { ManagerialEmployee } from "./ManagerialEmployee";

/** Director: reports to the CEO; Managers report to the Director. */
export class Director extends ManagerialEmployee {
  public readonly designation: Designation.Director = Designation.Director;

  public constructor(props: EmployeeProps) {
    super(props);
    this.assertReportsToShape();
  }

  public describeRole(): string {
    return "Oversees Managers. Reports to the CEO.";
  }
}
