import { Designation } from "../types";
import { EmployeeProps } from "./Employee";
import { ManagerialEmployee } from "./ManagerialEmployee";

/** Manager: reports to a Director; Leads report to the Manager. */
export class Manager extends ManagerialEmployee {
  public readonly designation: Designation.Manager = Designation.Manager;

  public constructor(props: EmployeeProps) {
    super(props);
    this.assertReportsToShape();
  }

  public describeRole(): string {
    return "Manages a group of Leads. Reports to a Director.";
  }
}
