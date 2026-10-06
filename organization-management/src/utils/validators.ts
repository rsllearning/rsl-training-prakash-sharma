import { ValidationError } from "../errors/OrganizationError";
import { Designation } from "../types";

/** Ids: 1–20 chars, letters, digits, '-' or '_'. Example: "ENG-001". */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,20}$/;
/** Names: letters (incl. accented), spaces, apostrophes, dots and hyphens. */
const NAME_PATTERN = /^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ .'-]*$/;
/** Strict mm/dd/yyyy with two-digit month and day. */
const DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_EMPLOYEE_AGE = 18;
export const MAX_EMPLOYEE_AGE = 100;
export const MAX_NAME_LENGTH = 100;

/** Ensures a value is a non-empty string and returns it trimmed. */
export function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(field, "is required and must be a string.");
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError(field, "must not be empty.");
  }
  return trimmed;
}

export function validateId(value: unknown, field: string = "id"): string {
  const id = requireNonEmptyString(value, field);
  if (!ID_PATTERN.test(id)) {
    throw new ValidationError(field, `'${id}' must be 1-20 characters of letters, digits, '-' or '_'.`);
  }
  return id;
}

export function validateName(value: unknown): string {
  const name = requireNonEmptyString(value, "name").replace(/\s+/g, " ");
  if (name.length > MAX_NAME_LENGTH) {
    throw new ValidationError("name", `must be at most ${MAX_NAME_LENGTH} characters.`);
  }
  if (!NAME_PATTERN.test(name)) {
    throw new ValidationError("name", `'${name}' may only contain letters, spaces, apostrophes, dots and hyphens.`);
  }
  return name;
}

/**
 * Parses a mm/dd/yyyy string into a Date, rejecting impossible calendar dates
 * such as 02/30/2000 or 13/01/1990. Returns `null` when the string is not a valid date.
 */
export function parseDate(value: string): Date | null {
  const match = DATE_PATTERN.exec(value);
  if (match === null) {
    return null;
  }
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
}

/** Whole years between `birth` and `today`. */
export function calculateAge(birth: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - birth.getFullYear();
  const birthdayNotYetReached =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (birthdayNotYetReached) {
    age -= 1;
  }
  return age;
}

/**
 * Validates a date of birth in mm/dd/yyyy format:
 * correct format, real calendar date, not in the future, and age within working range.
 */
export function validateDateOfBirth(value: unknown, today: Date = new Date()): string {
  const dob = requireNonEmptyString(value, "dateOfBirth");
  const date = parseDate(dob);
  if (date === null) {
    throw new ValidationError("dateOfBirth", `'${dob}' is not a valid date in mm/dd/yyyy format.`);
  }
  if (date.getTime() > today.getTime()) {
    throw new ValidationError("dateOfBirth", `'${dob}' is in the future.`);
  }
  const age = calculateAge(date, today);
  if (age < MIN_EMPLOYEE_AGE) {
    throw new ValidationError("dateOfBirth", `employee must be at least ${MIN_EMPLOYEE_AGE} years old (age ${age}).`);
  }
  if (age > MAX_EMPLOYEE_AGE) {
    throw new ValidationError("dateOfBirth", `age ${age} exceeds the maximum of ${MAX_EMPLOYEE_AGE}.`);
  }
  return dob;
}

export function validateDesignation(value: unknown): Designation {
  const allowed = Object.values(Designation) as string[];
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new ValidationError("designation", `'${String(value)}' must be one of: ${allowed.join(", ")}.`);
  }
  return value as Designation;
}

export function validateEmail(value: unknown): string {
  const email = requireNonEmptyString(value, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new ValidationError("email", `'${email}' is not a valid email address.`);
  }
  return email;
}

/** "a Lead", "an Engineer" – keeps error messages grammatical. */
export function withArticle(word: string, capitalized: boolean = false): string {
  const article = /^[AEIOU]/i.test(word) ? "an" : "a";
  return `${capitalized ? article.charAt(0).toUpperCase() + article.slice(1) : article} ${word}`;
}
