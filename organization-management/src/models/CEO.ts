import { Designation } from "../types";
import { EmployeeProps } from "./Employee";
import { ManagerialEmployee } from "./ManagerialEmployee";

/** CEO: reports to no one; Directors report to the CEO. Only one may exist per organization. */
export class CEO extends ManagerialEmployee {
  public readonly designation: Designation.CEO = Designation.CEO;

  public constructor(props: EmployeeProps) {
    super(props);
    this.assertReportsToShape();
  }

  public describeRole(): string {
    return "Leads the organization. Reports to no one; Directors report to the CEO.";
  }
}
