import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { createSeededOrganization } from "../src/demo/scenarios";
import {
  CEOAlreadyExistsError,
  DuplicateEmployeeError,
  EmployeeNotFoundError,
  HasReporteesError,
  InvalidHierarchyError,
  ValidationError,
} from "../src/errors/OrganizationError";
import { CEO, Engineer, Lead } from "../src/models";
import { Organization } from "../src/services/Organization";
import { CreateEmployeeInput, Designation, EmployeeDTO, UpdateEmployeeInput } from "../src/types";
import { calculateAge, parseDate, validateDateOfBirth } from "../src/utils/validators";

const engineer = (overrides: Partial<CreateEmployeeInput> = {}): CreateEmployeeInput => ({
  id: "ENG-100",
  name: "Test Engineer",
  dateOfBirth: "01/01/1995",
  designation: Designation.Engineer,
  reportsTo: "LEAD-001",
  ...overrides,
});

/** Every reportsTo has a matching reportees entry and vice versa. */
function assertConsistent(org: Organization): void {
  const all = org.getAllEmployees();
  const byId = new Map<string, EmployeeDTO>(all.map((e: EmployeeDTO): [string, EmployeeDTO] => [e.id, e]));
  for (const e of all) {
    if (e.reportsTo !== null) {
      assert.ok(byId.get(e.reportsTo)?.reportees.includes(e.id), `${e.reportsTo} should list ${e.id}`);
    }
    for (const r of e.reportees) {
      assert.equal(byId.get(r)?.reportsTo, e.id, `${r} should report to ${e.id}`);
    }
  }
  assert.equal(all.filter((e: EmployeeDTO): boolean => e.designation === Designation.CEO).length <= 1, true);
}

describe("Create", (): void => {
  let org: Organization;
  beforeEach((): void => {
    org = createSeededOrganization();
  });

  it("seeds 16 employees with a consistent hierarchy", (): void => {
    assert.equal(org.size, 16);
    assertConsistent(org);
  });

  it("adds an employee and links them to the manager's reportees", (): void => {
    const created = org.addEmployee(engineer());
    assert.equal(created.designation, Designation.Engineer);
    assert.ok(org.getEmployee("LEAD-001").reportees.includes("ENG-100"));
    assertConsistent(org);
  });

  it("trims and normalizes input", (): void => {
    const created = org.addEmployee(engineer({ id: "  ENG-101 ", name: "  Jane   Doe ", email: "JANE@Example.com" }));
    assert.equal(created.id, "ENG-101");
    assert.equal(created.name, "Jane Doe");
    assert.equal(created.email, "jane@example.com");
  });

  it("rejects duplicate ids", (): void => {
    assert.throws((): EmployeeDTO => org.addEmployee(engineer({ id: "ENG-001" })), DuplicateEmployeeError);
  });

  it("rejects a second CEO", (): void => {
    assert.throws(
      (): EmployeeDTO => org.addEmployee({ id: "CEO-002", name: "Second Boss", dateOfBirth: "01/01/1970", designation: Designation.CEO }),
      CEOAlreadyExistsError,
    );
  });

  it("allows a CEO in an empty organization and treats blank reportsTo as none", (): void => {
    const fresh = new Organization("Fresh Co");
    const ceo = fresh.addEmployee({ id: "C1", name: "Only Boss", dateOfBirth: "01/01/1970", designation: Designation.CEO, reportsTo: "  " });
    assert.equal(ceo.reportsTo, null);
  });

  it("enforces the reporting hierarchy for every level", (): void => {
    const cases: [Designation, string][] = [
      [Designation.Engineer, "MGR-001"],
      [Designation.Lead, "DIR-001"],
      [Designation.Lead, "ENG-001"],
      [Designation.Manager, "CEO-001"],
      [Designation.Director, "MGR-001"],
    ];
    for (const [designation, reportsTo] of cases) {
      assert.throws((): EmployeeDTO => org.addEmployee(engineer({ designation, reportsTo })), InvalidHierarchyError);
    }
  });

  it("requires reportsTo for non-CEOs and forbids it for the CEO", (): void => {
    assert.throws((): EmployeeDTO => org.addEmployee(engineer({ reportsTo: null })), InvalidHierarchyError);
    const fresh = new Organization("Fresh Co");
    assert.throws(
      (): EmployeeDTO => fresh.addEmployee({ id: "C1", name: "Boss", dateOfBirth: "01/01/1970", designation: Designation.CEO, reportsTo: "X1" }),
      InvalidHierarchyError,
    );
  });

  it("rejects references to non-existent managers", (): void => {
    assert.throws((): EmployeeDTO => org.addEmployee(engineer({ reportsTo: "LEAD-999" })), EmployeeNotFoundError);
  });

  it("validates required fields, formats and dates", (): void => {
    const invalid: Partial<CreateEmployeeInput>[] = [
      { id: "" },
      { id: "has space" },
      { name: "" },
      { name: "   " },
      { name: "R2D2" },
      { dateOfBirth: "" },
      { dateOfBirth: "25/12/1995" },
      { dateOfBirth: "1995-12-25" },
      { dateOfBirth: "02/30/1995" },
      { dateOfBirth: "02/29/1997" },
      { dateOfBirth: "1/5/1995" },
      { dateOfBirth: "01/01/2999" },
      { designation: "Intern" as Designation },
      { email: "not-an-email" },
    ];
    for (const overrides of invalid) {
      assert.throws((): EmployeeDTO => org.addEmployee(engineer(overrides)), ValidationError, JSON.stringify(overrides));
    }
    assert.equal(org.size, 16, "failed adds must not change the organization");
  });
});

describe("Read", (): void => {
  const org = createSeededOrganization();

  it("retrieves all employees, ordered CEO first", (): void => {
    const all = org.getAllEmployees();
    assert.equal(all.length, 16);
    assert.equal(all[0]?.designation, Designation.CEO);
  });

  it("filters by designation", (): void => {
    assert.equal(org.getAllEmployees(Designation.Lead).length, 4);
  });

  it("retrieves one employee by id or throws", (): void => {
    assert.equal(org.getEmployee("MGR-002").name, "Priya Nair");
    assert.throws((): EmployeeDTO => org.getEmployee("NOPE"), EmployeeNotFoundError);
    assert.equal(org.findEmployee("NOPE"), undefined);
  });

  it("returns immutable snapshots", (): void => {
    const dto = org.getEmployee("LEAD-001");
    assert.ok(Object.isFrozen(dto));
    assert.ok(Object.isFrozen(dto.reportees));
    assert.throws((): void => {
      (dto as { name: string }).name = "Hacked";
    }, TypeError);
    assert.equal(org.getEmployee("LEAD-001").name, "Kavya Iyer");
  });

  it("returns the reporting chain up to the CEO", (): void => {
    const chain = org.getReportingChain("ENG-006").map((e: EmployeeDTO): string => e.id);
    assert.deepEqual(chain, ["LEAD-004", "MGR-003", "DIR-002", "CEO-001"]);
  });
});

describe("Update", (): void => {
  let org: Organization;
  beforeEach((): void => {
    org = createSeededOrganization();
  });

  it("updates personal details", (): void => {
    const updated = org.updateEmployee("ENG-001", { name: "Neha S. Singh", dateOfBirth: "05/05/1995", email: "neha@x.io" });
    assert.equal(updated.name, "Neha S. Singh");
    assert.equal(updated.dateOfBirth, "05/05/1995");
  });

  it("reassigns to a new manager and keeps both reportee lists in sync", (): void => {
    org.updateEmployee("ENG-001", { reportsTo: "LEAD-004" });
    assert.ok(!org.getEmployee("LEAD-001").reportees.includes("ENG-001"));
    assert.ok(org.getEmployee("LEAD-004").reportees.includes("ENG-001"));
    assertConsistent(org);
  });

  it("promotes an employee with no reportees to a new designation", (): void => {
    const promoted = org.updateEmployee("ENG-006", { designation: Designation.Lead, reportsTo: "MGR-003" });
    assert.equal(promoted.designation, Designation.Lead);
    assert.ok(!org.getEmployee("LEAD-004").reportees.includes("ENG-006"));
    assert.ok(org.getEmployee("MGR-003").reportees.includes("ENG-006"));
    // The promoted Lead can now receive engineers.
    org.addEmployee(engineer({ reportsTo: "ENG-006" }));
    assertConsistent(org);
  });

  it("rejects a non-existent id", (): void => {
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-999", { name: "X" }), EmployeeNotFoundError);
  });

  it("rejects invalid payloads", (): void => {
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", {}), ValidationError);
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", { id: "Z" } as UpdateEmployeeInput), ValidationError);
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", { reportees: [] } as UpdateEmployeeInput), ValidationError);
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", { salary: 1 } as UpdateEmployeeInput), ValidationError);
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", { name: "" }), ValidationError);
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", { dateOfBirth: "13/01/2000" }), ValidationError);
  });

  it("rejects invalid hierarchy changes", (): void => {
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", { reportsTo: "MGR-001" }), InvalidHierarchyError);
    assert.throws((): EmployeeDTO => org.updateEmployee("LEAD-001", { reportsTo: "LEAD-001" }), InvalidHierarchyError);
    assert.throws((): EmployeeDTO => org.updateEmployee("CEO-001", { reportsTo: "DIR-001" }), InvalidHierarchyError);
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", { reportsTo: null }), InvalidHierarchyError);
  });

  it("rejects designation changes that would break rules", (): void => {
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-006", { designation: Designation.CEO }), CEOAlreadyExistsError);
    assert.throws(
      (): EmployeeDTO => org.updateEmployee("LEAD-001", { designation: Designation.Engineer, reportsTo: "LEAD-002" }),
      HasReporteesError,
    );
  });

  it("is atomic: a failed update changes nothing", (): void => {
    const before = org.getEmployee("ENG-001");
    assert.throws((): EmployeeDTO => org.updateEmployee("ENG-001", { name: "Valid Name", reportsTo: "MGR-001" }), InvalidHierarchyError);
    assert.deepEqual(org.getEmployee("ENG-001"), before);
    assertConsistent(org);
  });
});

describe("Delete", (): void => {
  let org: Organization;
  beforeEach((): void => {
    org = createSeededOrganization();
  });

  it("deletes an employee without reportees and unlinks them", (): void => {
    const deleted = org.deleteEmployee("ENG-002");
    assert.equal(deleted.id, "ENG-002");
    assert.equal(org.findEmployee("ENG-002"), undefined);
    assert.ok(!org.getEmployee("LEAD-001").reportees.includes("ENG-002"));
    assertConsistent(org);
  });

  it("rejects deleting an employee with reportees unless reassigned", (): void => {
    assert.throws((): EmployeeDTO => org.deleteEmployee("LEAD-003"), HasReporteesError);
    assert.equal(org.size, 16);
  });

  it("reassigns reportees to a same-level employee", (): void => {
    const deleted = org.deleteEmployee("LEAD-003", { reassignReporteesTo: "LEAD-001" });
    assert.deepEqual([...deleted.reportees], ["ENG-004", "ENG-005"]);
    assert.equal(org.getEmployee("ENG-004").reportsTo, "LEAD-001");
    assert.ok(!org.getEmployee("MGR-002").reportees.includes("LEAD-003"));
    assertConsistent(org);
  });

  it("validates the reassignment target", (): void => {
    assert.throws((): EmployeeDTO => org.deleteEmployee("LEAD-003", { reassignReporteesTo: "MGR-001" }), InvalidHierarchyError);
    assert.throws((): EmployeeDTO => org.deleteEmployee("LEAD-003", { reassignReporteesTo: "LEAD-003" }), InvalidHierarchyError);
    assert.throws((): EmployeeDTO => org.deleteEmployee("LEAD-003", { reassignReporteesTo: "LEAD-999" }), EmployeeNotFoundError);
    assert.equal(org.size, 16);
  });

  it("rejects a non-existent id", (): void => {
    assert.throws((): EmployeeDTO => org.deleteEmployee("ENG-999"), EmployeeNotFoundError);
  });

  it("allows a new CEO once the old one is removed", (): void => {
    const fresh = new Organization("Fresh Co");
    fresh.addEmployee({ id: "C1", name: "First Boss", dateOfBirth: "01/01/1970", designation: Designation.CEO });
    fresh.deleteEmployee("C1");
    const second = fresh.addEmployee({ id: "C2", name: "Next Boss", dateOfBirth: "01/01/1972", designation: Designation.CEO });
    assert.equal(fresh.getCEO()?.id, second.id);
  });
});

describe("Models & validators", (): void => {
  it("uses polymorphism for reportee handling", (): void => {
    const eng = new Engineer({ id: "E1", name: "Eng One", dateOfBirth: "01/01/1995", reportsTo: "L1" });
    const lead = new Lead({ id: "L1", name: "Lead One", dateOfBirth: "01/01/1990", reportsTo: "M1" });
    assert.equal(eng.canHaveReportees(), false);
    assert.throws((): void => eng.addReportee("X"), InvalidHierarchyError);
    lead.addReportee("E1");
    lead.addReportee("E1");
    assert.deepEqual([...lead.reportees], ["E1"], "reportees are de-duplicated");
    assert.equal(new CEO({ id: "C1", name: "Boss", dateOfBirth: "01/01/1970", reportsTo: null }).managerDesignation, null);
  });

  it("parses dates strictly", (): void => {
    assert.ok(parseDate("02/29/2000") !== null);
    assert.equal(parseDate("02/29/1900"), null);
    assert.equal(parseDate("00/10/2000"), null);
  });

  it("computes age correctly around birthdays", (): void => {
    const today = new Date(2026, 9, 6);
    assert.equal(calculateAge(new Date(2008, 9, 6), today), 18);
    assert.equal(calculateAge(new Date(2008, 9, 7), today), 17);
    assert.equal(validateDateOfBirth("10/06/2008", today), "10/06/2008");
    assert.throws((): string => validateDateOfBirth("10/07/2008", today), ValidationError);
  });
});
