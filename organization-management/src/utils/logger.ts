import { OrganizationError } from "../errors/OrganizationError";
import { EmployeeDTO } from "../types";

const useColor = process.stdout.isTTY === true && process.env["NO_COLOR"] === undefined;

const paint = (code: number, text: string): string => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);

export const color = {
  bold: (t: string): string => paint(1, t),
  dim: (t: string): string => paint(2, t),
  red: (t: string): string => paint(31, t),
  green: (t: string): string => paint(32, t),
  yellow: (t: string): string => paint(33, t),
  cyan: (t: string): string => paint(36, t),
};

export function section(title: string): void {
  const line = "═".repeat(Math.max(title.length + 4, 60));
  console.log(`\n${color.cyan(line)}\n${color.bold(color.cyan(`  ${title}`))}\n${color.cyan(line)}`);
}

export function step(description: string): void {
  console.log(`\n${color.yellow("▶")} ${color.bold(description)}`);
}

export function success(message: string): void {
  console.log(`  ${color.green("✔")} ${message}`);
}

export function failure(error: unknown): void {
  if (error instanceof OrganizationError) {
    console.log(`  ${color.red("✖")} ${color.red(`[${error.code}]`)} ${error.message}`);
  } else if (error instanceof Error) {
    console.log(`  ${color.red("✖ Unexpected error:")} ${error.message}`);
  } else {
    console.log(`  ${color.red("✖ Unexpected error:")} ${String(error)}`);
  }
}

export function info(message: string): void {
  console.log(`  ${color.dim(message)}`);
}

/** Prints employees as a table (reportees joined for readability). */
export function printEmployees(employees: readonly EmployeeDTO[]): void {
  if (employees.length === 0) {
    info("(no employees)");
    return;
  }
  console.table(
    employees.map((e: EmployeeDTO): Record<string, string> => ({
      id: e.id,
      name: e.name,
      designation: e.designation,
      dateOfBirth: e.dateOfBirth,
      reportsTo: e.reportsTo ?? "—",
      reportees: e.reportees.length > 0 ? e.reportees.join(", ") : "—",
    })),
  );
}

export function printEmployee(employee: EmployeeDTO): void {
  printEmployees([employee]);
}

/**
 * Runs an action that is expected to succeed, printing the result or the error.
 * Returns the action's result, or `undefined` if it threw.
 */
export function attempt<T>(description: string, action: () => T, onSuccess?: (result: T) => void): T | undefined {
  step(description);
  try {
    const result = action();
    if (onSuccess !== undefined) {
      onSuccess(result);
    } else {
      success("Done.");
    }
    return result;
  } catch (error: unknown) {
    failure(error);
    return undefined;
  }
}

/** Runs an action that is expected to be rejected, so a thrown OrganizationError is the "pass" case. */
export function expectRejection(description: string, action: () => unknown): boolean {
  step(description);
  try {
    action();
    console.log(`  ${color.red("✖ Expected this to be rejected, but it succeeded!")}`);
    return false;
  } catch (error: unknown) {
    if (error instanceof OrganizationError) {
      console.log(`  ${color.green("✔ Rejected as expected →")} ${color.red(`[${error.code}]`)} ${error.message}`);
      return true;
    }
    failure(error);
    return false;
  }
}
