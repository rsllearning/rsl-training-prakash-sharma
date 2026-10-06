# Organization Management System (TypeScript + OOP)

A console application, written in plain TypeScript, that manages the employees of an organization
with a strict reporting hierarchy:

```
CEO  ←  Director  ←  Manager  ←  Lead  ←  Engineer
```

It supports full CRUD on employees and enforces every rule from the assignment (unique ids, one CEO,
valid reporting lines, safe deletion, field and date validation). No UI and no runtime dependencies –
it runs on Node.js with mock data.

---

## 1. Setup & installation

**Prerequisites:** Node.js **22+** (includes npm) and Git.

```bash
git clone <your-repo-url>
cd organization-management
git checkout feature/organization-management
npm install
```

`npm install` only installs dev tools: `typescript`, `@types/node`, `eslint` and `typescript-eslint`.

## 2. Execution commands

| Command | What it does |
|---|---|
| `npm start` | Compiles and runs **all** demo scenarios one after another |
| `npm run demo:seed` | Builds the organization from mock data and prints the hierarchy tree |
| `npm run demo:create` | Adds new Engineer / Lead / Manager / Director |
| `npm run demo:read` | Retrieves all employees, one by id, by designation, reportees, reporting chain |
| `npm run demo:update` | Updates details, reassigns a manager, promotes an employee, updates a missing id |
| `npm run demo:delete` | Deletes an employee, rejects deleting one with reportees, deletes with reassignment |
| `npm run demo:validate` | Runs 31 invalid operations and shows that each is rejected with a clear error |
| `npm test` | Compiles and runs the unit test suite (32 tests, Node's built-in test runner) |
| `npm run lint` | ESLint: no explicit `any`, explicit return types on every function |
| `npm run typecheck` | Type-checks without emitting files |
| `npm run build` | Compiles TypeScript to `dist/` |

You can also run a scenario directly after building: `node dist/src/index.js update`.
Set `NO_COLOR=1` to disable colored output.

## 3. Project structure

```
organization-management/
├── src/
│   ├── index.ts                     # Entry point – picks a scenario from the command line
│   ├── types/index.ts               # Designation enum, hierarchy rules, input/DTO interfaces
│   ├── models/                      # OOP domain classes
│   │   ├── Employee.ts              # Abstract base class (shared fields, validation, DTO)
│   │   ├── IndividualContributor.ts # Abstract: employees who can never have reportees
│   │   ├── ManagerialEmployee.ts    # Abstract: employees who manage reportees
│   │   ├── Engineer.ts  Lead.ts  Manager.ts  Director.ts  CEO.ts   # Concrete classes
│   │   └── index.ts                 # Barrel export
│   ├── factory/EmployeeFactory.ts   # Creates the right class for a designation
│   ├── services/Organization.ts     # CRUD + all cross-employee business rules
│   ├── errors/OrganizationError.ts  # Custom error hierarchy with error codes
│   ├── utils/
│   │   ├── validators.ts            # id, name, mm/dd/yyyy date, email, designation checks
│   │   └── logger.ts                # Console output helpers (tables, ✔/✖, sections)
│   ├── data/mockData.ts             # Seed data: 1 CEO, 2 Directors, 3 Managers, 4 Leads, 6 Engineers
│   └── demo/scenarios.ts            # One runnable scenario per functionality
├── tests/organization.test.ts       # Unit tests (node:test + node:assert)
├── tsconfig.json                    # strict + noImplicitAny + noImplicitReturns + more
├── eslint.config.mjs                # explicit-function-return-type, no-explicit-any
└── package.json
```

## 4. Design approach

### Class hierarchy (OOP)

```
                    Employee  (abstract)
                   /                    \
   IndividualContributor (abstract)   ManagerialEmployee (abstract)
             |                        /      |        |       \
          Engineer                 Lead   Manager  Director   CEO
```

- **Encapsulation** – all employee state is in `private` fields exposed through getters; setters
  validate before assigning. Reportees are a private `Set`, so outside code can't edit them directly.
  Callers only ever receive frozen `EmployeeDTO` snapshots, never the live objects.
- **Abstraction** – `Employee` declares abstract `designation`, `reportees`, `addReportee`,
  `removeReportee`, `canHaveReportees` and `describeRole`.
- **Inheritance** – shared behavior lives in the two intermediate abstract classes, so each concrete
  class is only a few lines.
- **Polymorphism** – `Engineer.addReportee()` throws while `Lead.addReportee()` adds; the
  `Organization` calls the same method without checking types.
- **Factory pattern** – `EmployeeFactory` maps a `Designation` to its class, so there are no switch
  statements over designations. It is injected into `Organization` (dependency injection).
- **Single responsibility** – models validate themselves; `Organization` enforces rules that involve
  several employees; validators are pure functions; the logger only prints.

### Hierarchy rules as data

The reporting rules are two lookup tables in `types/index.ts` (`REPORTS_TO_DESIGNATION`,
`REPORTEE_DESIGNATION`). Validation reads these tables instead of hard-coding each level.
Because every level may only report to the level directly above it, **reporting cycles are impossible**.

### Consistency & atomicity

- `reportsTo` (child → parent) and `reportees` (parent → children) are always updated together by the
  `Organization`, so they never disagree. The tests check this after every operation.
- Every operation **validates everything first, then mutates**. A rejected add/update/delete leaves the
  organization exactly as it was.

### Error handling

All failures throw a subclass of `OrganizationError` with a machine-readable `code`:

| Error | Code | Raised when |
|---|---|---|
| `ValidationError` | `VALIDATION_ERROR` | empty/invalid field, bad date, bad payload |
| `DuplicateEmployeeError` | `DUPLICATE_ID` | id already exists |
| `EmployeeNotFoundError` | `EMPLOYEE_NOT_FOUND` | id or `reportsTo` reference doesn't exist |
| `InvalidHierarchyError` | `INVALID_HIERARCHY` | wrong manager level, self-reporting, CEO with a manager |
| `CEOAlreadyExistsError` | `CEO_ALREADY_EXISTS` | adding/promoting a second CEO |
| `HasReporteesError` | `HAS_REPORTEES` | deleting or changing the designation of someone with reportees |

### Validation summary

| Field | Rule |
|---|---|
| `id` | required, trimmed, 1–20 chars of letters/digits/`-`/`_`, unique (case-sensitive), immutable |
| `name` | required, trimmed, internal spaces collapsed, letters/spaces/`.`/`'`/`-`, max 100 chars |
| `dateOfBirth` | required, strict `mm/dd/yyyy` with 2-digit month/day, real calendar date (leap years checked), not in the future, age 18–100 |
| `designation` | one of `Engineer`, `Lead`, `Manager`, `Director`, `CEO` |
| `reportsTo` | required for everyone except the CEO; must exist and be exactly one level up; not self |
| `email` (extra, optional) | valid email format, stored in lowercase |

## 5. Operations

```ts
const org = new Organization("Raja Software Labs");

org.addEmployee({ id: "CEO-001", name: "Anita Deshmukh", dateOfBirth: "03/14/1970", designation: Designation.CEO });
org.getAllEmployees();                       // all, CEO first
org.getAllEmployees(Designation.Lead);       // filter by designation
org.getEmployee("LEAD-001");                 // throws EmployeeNotFoundError if missing
org.updateEmployee("ENG-003", { reportsTo: "LEAD-004" });          // reassign manager
org.updateEmployee("ENG-006", { designation: Designation.Lead, reportsTo: "MGR-002" }); // promote
org.deleteEmployee("ENG-002");
org.deleteEmployee("LEAD-003", { reassignReporteesTo: "LEAD-001" }); // move reportees, then delete
```

Extras: `findEmployee` (non-throwing), `getCEO`, `getReportees`, `getReportingChain`, `renderHierarchy`.

## 6. Assumptions

1. **Top-down creation.** A manager must exist before anyone can report to them, so the CEO is added
   first. `reportsTo` is required for all non-CEO employees.
2. **Reportees are derived, not entered.** The input never contains `reportees`; they're maintained
   automatically from each employee's `reportsTo`. Trying to update `reportees` directly is rejected.
3. **Deleting someone with reportees** is rejected by default. Passing `reassignReporteesTo` (an
   employee of the **same designation**) moves all reportees there and then deletes. The CEO can't be
   deleted while Directors report to them, because there is no second CEO to take them.
4. **Designation changes** (promotion/demotion) are allowed only for employees with no reportees, and
   the new `reportsTo` must fit the new level. Promoting to CEO is allowed only when no CEO exists.
5. **The id never changes.** To "change" an id, delete and re-add the employee.
6. **Minimum age is 18** and maximum is 100 – a sensible working-age range for a date of birth.
7. **Ids are case-sensitive** (`ENG-001` and `eng-001` are different) but are trimmed of whitespace.
8. **Data is in memory.** The assignment asks for mock data in Node.js, so nothing is persisted; each
   scenario starts from a freshly seeded organization so it can be run and recorded independently.

## 7. Type-safety settings

`tsconfig.json` enables `strict`, `noImplicitAny`, `noImplicitReturns`, `noUnusedLocals`,
`noUnusedParameters`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` and
`useUnknownInCatchVariables`. ESLint adds `explicit-function-return-type`, `no-explicit-any` and
`explicit-member-accessibility`, which covers the "no implicit any, no implicit return type" goal.
