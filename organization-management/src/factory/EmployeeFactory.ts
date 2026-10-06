import { CEO, Director, Employee, EmployeeProps, Engineer, Lead, Manager } from "../models";
import { Designation } from "../types";

type EmployeeConstructor = new (props: EmployeeProps) => Employee;

/**
 * Factory pattern: maps each designation to its concrete class, so the rest of the
 * application never needs a switch statement over designations.
 * Adding a new designation = add a class + one entry here (Open/Closed principle).
 * The Organization receives the factory through its constructor (dependency injection).
 */
export class EmployeeFactory {
  private readonly registry: Readonly<Record<Designation, EmployeeConstructor>> = {
    [Designation.Engineer]: Engineer,
    [Designation.Lead]: Lead,
    [Designation.Manager]: Manager,
    [Designation.Director]: Director,
    [Designation.CEO]: CEO,
  };

  public create(designation: Designation, props: EmployeeProps): Employee {
    const EmployeeClass = this.registry[designation];
    return new EmployeeClass(props);
  }
}
