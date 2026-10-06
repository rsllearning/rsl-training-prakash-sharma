import { MOCK_EMPLOYEES } from "../data/mockData";
import { Organization } from "../services/Organization";
import { CreateEmployeeInput, Designation, EmployeeDTO, UpdateEmployeeInput } from "../types";
import { attempt, expectRejection, info, printEmployee, printEmployees, section, success } from "../utils/logger";

/** Builds a fresh organization populated with the mock data. */
export function createSeededOrganization(): Organization {
  const org = new Organization("Raja Software Labs");
  for (const employee of MOCK_EMPLOYEES) {
    org.addEmployee(employee);
  }
  return org;
}

export function seedScenario(): void {
  section("SEED: build the organization from mock data");
  const org = new Organization("Raja Software Labs");
  for (const employee of MOCK_EMPLOYEES) {
    const created = org.addEmployee(employee);
    success(`Added ${created.designation.padEnd(8)} ${created.id.padEnd(9)} ${created.name}`);
  }
  info(`Total employees: ${org.size}`);
  console.log(`\n${org.renderHierarchy()}`);
}

export function createScenario(): void {
  section("CREATE: add new employees");
  const org = createSeededOrganization();

  attempt(
    "Add a new Engineer ENG-007 reporting to Lead LEAD-002",
    (): EmployeeDTO =>
      org.addEmployee({
        id: "ENG-007",
        name: "Tanvi Agarwal",
        dateOfBirth: "09/09/1999",
        designation: Designation.Engineer,
        reportsTo: "LEAD-002",
        email: "tanvi@rajasoft.example",
      }),
    (e: EmployeeDTO): void => {
      success(`Created ${e.designation} ${e.name}`);
      printEmployee(e);
    },
  );

  attempt(
    "Add a new Lead LEAD-005 reporting to Manager MGR-003",
    (): EmployeeDTO =>
      org.addEmployee({ id: "LEAD-005", name: "Harsh Vardhan", dateOfBirth: "02/14/1991", designation: Designation.Lead, reportsTo: "MGR-003" }),
    (e: EmployeeDTO): void => success(`Created ${e.designation} ${e.name} (${e.id})`),
  );

  attempt(
    "Manager MGR-003 now lists LEAD-005 as a reportee automatically",
    (): EmployeeDTO => org.getEmployee("MGR-003"),
    printEmployee,
  );

  attempt(
    "Add a new Manager and Director as well",
    (): EmployeeDTO[] => [
      org.addEmployee({ id: "DIR-003", name: "Farah Sheikh", dateOfBirth: "04/04/1976", designation: Designation.Director, reportsTo: "CEO-001" }),
      org.addEmployee({ id: "MGR-004", name: "Gaurav Kapoor", dateOfBirth: "10/10/1985", designation: Designation.Manager, reportsTo: "DIR-003" }),
    ],
    printEmployees,
  );

  console.log(`\n${org.renderHierarchy()}`);
}

export function readScenario(): void {
  section("READ: retrieve employees");
  const org = createSeededOrganization();

  attempt("Retrieve ALL employees", (): EmployeeDTO[] => org.getAllEmployees(), printEmployees);
  attempt("Retrieve a specific employee by id (LEAD-003)", (): EmployeeDTO => org.getEmployee("LEAD-003"), printEmployee);
  attempt("Retrieve all Managers (filter by designation)", (): EmployeeDTO[] => org.getAllEmployees(Designation.Manager), printEmployees);
  attempt("Retrieve the CEO", (): EmployeeDTO | undefined => org.getCEO(), (ceo: EmployeeDTO | undefined): void => {
    if (ceo !== undefined) {
      printEmployee(ceo);
    }
  });
  attempt("Direct reportees of MGR-001", (): EmployeeDTO[] => org.getReportees("MGR-001"), printEmployees);
  attempt(
    "Reporting chain of ENG-005 (up to the CEO)",
    (): EmployeeDTO[] => org.getReportingChain("ENG-005"),
    (chain: EmployeeDTO[]): void => success(["ENG-005", ...chain.map((e: EmployeeDTO): string => `${e.id} (${e.designation})`)].join("  →  ")),
  );
  attempt("Retrieve a non-existent employee (ENG-999)", (): EmployeeDTO => org.getEmployee("ENG-999"), printEmployee);
}

export function updateScenario(): void {
  section("UPDATE: modify existing employees");
  const org = createSeededOrganization();

  attempt("Before: ENG-003", (): EmployeeDTO => org.getEmployee("ENG-003"), printEmployee);

  attempt(
    "Update name and date of birth of ENG-003",
    (): EmployeeDTO => org.updateEmployee("ENG-003", { name: "Ishita Bose-Sen", dateOfBirth: "03/12/1997" }),
    printEmployee,
  );

  attempt(
    "Reassign ENG-003 from LEAD-002 to LEAD-004 (reportsTo change)",
    (): EmployeeDTO => org.updateEmployee("ENG-003", { reportsTo: "LEAD-004" }),
    printEmployee,
  );
  attempt(
    "Both leads' reportee lists were updated automatically",
    (): EmployeeDTO[] => [org.getEmployee("LEAD-002"), org.getEmployee("LEAD-004")],
    printEmployees,
  );

  attempt(
    "Promote ENG-006 to Lead, reporting to MGR-002 (designation change)",
    (): EmployeeDTO => org.updateEmployee("ENG-006", { designation: Designation.Lead, reportsTo: "MGR-002" }),
    printEmployee,
  );
  attempt(
    "ENG-006 left LEAD-004's team and joined MGR-002's",
    (): EmployeeDTO[] => [org.getEmployee("LEAD-004"), org.getEmployee("MGR-002")],
    printEmployees,
  );

  attempt("Update a non-existent employee (MGR-999)", (): EmployeeDTO => org.updateEmployee("MGR-999", { name: "Ghost" }), printEmployee);

  console.log(`\n${org.renderHierarchy()}`);
}

export function deleteScenario(): void {
  section("DELETE: remove employees");
  const org = createSeededOrganization();

  attempt(
    "Delete Engineer ENG-002 (no reportees)",
    (): EmployeeDTO => org.deleteEmployee("ENG-002"),
    (e: EmployeeDTO): void => success(`Deleted ${e.designation} ${e.name} (${e.id})`),
  );
  attempt("LEAD-001 no longer lists ENG-002", (): EmployeeDTO => org.getEmployee("LEAD-001"), printEmployee);

  attempt(
    "Delete Lead LEAD-003 who still has reportees (no reassignment given)",
    (): EmployeeDTO => org.deleteEmployee("LEAD-003"),
  );

  attempt(
    "Delete LEAD-003 reassigning their reportees to LEAD-001",
    (): EmployeeDTO => org.deleteEmployee("LEAD-003", { reassignReporteesTo: "LEAD-001" }),
    (e: EmployeeDTO): void => success(`Deleted ${e.id}; reportees [${e.reportees.join(", ")}] moved to LEAD-001`),
  );
  attempt("LEAD-001 now leads the reassigned engineers", (): EmployeeDTO[] => org.getReportees("LEAD-001"), printEmployees);

  attempt("Delete a non-existent employee (ENG-999)", (): EmployeeDTO => org.deleteEmployee("ENG-999"));

  console.log(`\n${org.renderHierarchy()}`);
}

export function validationScenario(): void {
  section("VALIDATIONS & EDGE CASES (each of these must be rejected)");
  const org = createSeededOrganization();
  const base: CreateEmployeeInput = { id: "ENG-100", name: "Test User", dateOfBirth: "01/01/1995", designation: Designation.Engineer, reportsTo: "LEAD-001" };
  const add = (overrides: Partial<CreateEmployeeInput>): (() => EmployeeDTO) =>
    (): EmployeeDTO => org.addEmployee({ ...base, ...overrides });
  const before = org.size;

  const results: boolean[] = [
    // Unique ids
    expectRejection("Duplicate employee id (ENG-001 already exists)", add({ id: "ENG-001" })),
    expectRejection("Duplicate id with surrounding spaces (' ENG-001 ')", add({ id: " ENG-001 " })),
    // Single CEO
    expectRejection("Second CEO", add({ id: "CEO-002", designation: Designation.CEO, reportsTo: null })),
    expectRejection("Promote an Engineer to CEO while a CEO exists", (): EmployeeDTO => org.updateEmployee("ENG-006", { designation: Designation.CEO })),
    // Reporting hierarchy
    expectRejection("Engineer reporting to a Manager (must be a Lead)", add({ reportsTo: "MGR-001" })),
    expectRejection("Lead reporting to a Director (must be a Manager)", add({ designation: Designation.Lead, reportsTo: "DIR-001" })),
    expectRejection("Director reporting to a Manager (must be the CEO)", add({ designation: Designation.Director, reportsTo: "MGR-001" })),
    expectRejection("Engineer without reportsTo", add({ reportsTo: null })),
    expectRejection("CEO with a reportsTo", (): EmployeeDTO => org.updateEmployee("CEO-001", { reportsTo: "DIR-001" })),
    expectRejection("Employee reporting to themselves", (): EmployeeDTO => org.updateEmployee("LEAD-001", { reportsTo: "LEAD-001" })),
    expectRejection("Reassign an Engineer to an Engineer", (): EmployeeDTO => org.updateEmployee("ENG-001", { reportsTo: "ENG-002" })),
    // Invalid references
    expectRejection("reportsTo references a non-existent employee", add({ reportsTo: "LEAD-999" })),
    expectRejection("Update a non-existent employee", (): EmployeeDTO => org.updateEmployee("ENG-999", { name: "Nobody" })),
    expectRejection("Delete a non-existent employee", (): EmployeeDTO => org.deleteEmployee("ENG-999")),
    // Reportees on delete / designation change
    expectRejection("Delete the CEO who has reportees", (): EmployeeDTO => org.deleteEmployee("CEO-001")),
    expectRejection("Delete MGR-001 reassigning to a Lead (wrong level)", (): EmployeeDTO => org.deleteEmployee("MGR-001", { reassignReporteesTo: "LEAD-001" })),
    expectRejection("Demote a Lead who still has reportees", (): EmployeeDTO => org.updateEmployee("LEAD-001", { designation: Designation.Engineer, reportsTo: "LEAD-002" })),
    // Required fields
    expectRejection("Empty name", add({ name: "   " })),
    expectRejection("Empty id", add({ id: "" })),
    expectRejection("Name with digits", add({ name: "R2D2" })),
    expectRejection("Invalid designation 'Intern'", add({ designation: "Intern" as Designation })),
    // Dates
    expectRejection("Date in dd/mm/yyyy format (25/12/1995)", add({ dateOfBirth: "25/12/1995" })),
    expectRejection("Date in ISO format (1995-12-25)", add({ dateOfBirth: "1995-12-25" })),
    expectRejection("Impossible date (02/30/1995)", add({ dateOfBirth: "02/30/1995" })),
    expectRejection("Non-leap-year Feb 29 (02/29/1997)", add({ dateOfBirth: "02/29/1997" })),
    expectRejection("Date in the future (01/01/2999)", add({ dateOfBirth: "01/01/2999" })),
    expectRejection("Under 18 years old", add({ dateOfBirth: `01/01/${new Date().getFullYear() - 10}` })),
    expectRejection("Single-digit month/day (1/5/1995)", add({ dateOfBirth: "1/5/1995" })),
    // Update payload
    expectRejection("Try to change the immutable id", (): EmployeeDTO => org.updateEmployee("ENG-001", { id: "ENG-555" } as UpdateEmployeeInput)),
    expectRejection("Empty update payload", (): EmployeeDTO => org.updateEmployee("ENG-001", {})),
    expectRejection("Update with an invalid date", (): EmployeeDTO => org.updateEmployee("ENG-001", { dateOfBirth: "13/40/2000" })),
  ];

  const passed = results.filter((r: boolean): boolean => r).length;
  section(`Validation summary: ${passed}/${results.length} invalid operations correctly rejected`);
  info(`Organization unchanged by failed operations: ${org.size === before ? "yes" : "NO"} (${org.size} employees)`);
  attempt("Spot-check ENG-001 is untouched", (): EmployeeDTO => org.getEmployee("ENG-001"), printEmployee);
}

export const SCENARIOS: Readonly<Record<string, () => void>> = {
  seed: seedScenario,
  create: createScenario,
  read: readScenario,
  update: updateScenario,
  delete: deleteScenario,
  validate: validationScenario,
};
