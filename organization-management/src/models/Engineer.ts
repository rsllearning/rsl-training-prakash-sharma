import { Designation } from "../types";
import { EmployeeProps } from "./Employee";
import { IndividualContributor } from "./IndividualContributor";

/** Engineer: reports to a Lead and has no reportees. */
export class Engineer extends IndividualContributor {
  public readonly designation: Designation.Engineer = Designation.Engineer;

  public constructor(props: EmployeeProps) {
    super(props);
    this.assertReportsToShape();
  }

  public describeRole(): string {
    return "Builds the product. Reports to a Lead; has no reportees.";
  }
}
