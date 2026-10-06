import { Designation } from "../types";
import { EmployeeProps } from "./Employee";
import { ManagerialEmployee } from "./ManagerialEmployee";

/** Lead: reports to a Manager; Engineers report to the Lead. */
export class Lead extends ManagerialEmployee {
  public readonly designation: Designation.Lead = Designation.Lead;

  public constructor(props: EmployeeProps) {
    super(props);
    this.assertReportsToShape();
  }

  public describeRole(): string {
    return "Guides a team of Engineers. Reports to a Manager.";
  }
}
