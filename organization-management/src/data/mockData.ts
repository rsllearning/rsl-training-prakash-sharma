import { CreateEmployeeInput, Designation } from "../types";

/**
 * Seed data for the demo. Ordered top-down (CEO first) because every employee
 * must reference a manager that already exists.
 */
export const MOCK_EMPLOYEES: readonly CreateEmployeeInput[] = [
  { id: "CEO-001", name: "Anita Deshmukh", dateOfBirth: "03/14/1970", designation: Designation.CEO, email: "anita@rajasoft.example" },

  { id: "DIR-001", name: "Rahul Mehta", dateOfBirth: "07/22/1975", designation: Designation.Director, reportsTo: "CEO-001" },
  { id: "DIR-002", name: "Sneha Kulkarni", dateOfBirth: "11/05/1978", designation: Designation.Director, reportsTo: "CEO-001" },

  { id: "MGR-001", name: "Vikram Joshi", dateOfBirth: "01/30/1982", designation: Designation.Manager, reportsTo: "DIR-001" },
  { id: "MGR-002", name: "Priya Nair", dateOfBirth: "09/12/1984", designation: Designation.Manager, reportsTo: "DIR-001" },
  { id: "MGR-003", name: "Arjun Patil", dateOfBirth: "05/18/1983", designation: Designation.Manager, reportsTo: "DIR-002" },

  { id: "LEAD-001", name: "Kavya Iyer", dateOfBirth: "02/27/1988", designation: Designation.Lead, reportsTo: "MGR-001" },
  { id: "LEAD-002", name: "Rohan Gupta", dateOfBirth: "12/03/1989", designation: Designation.Lead, reportsTo: "MGR-001" },
  { id: "LEAD-003", name: "Meera Shah", dateOfBirth: "06/16/1990", designation: Designation.Lead, reportsTo: "MGR-002" },
  { id: "LEAD-004", name: "Aditya Rao", dateOfBirth: "08/08/1987", designation: Designation.Lead, reportsTo: "MGR-003" },

  { id: "ENG-001", name: "Neha Singh", dateOfBirth: "04/11/1995", designation: Designation.Engineer, reportsTo: "LEAD-001" },
  { id: "ENG-002", name: "Karan Verma", dateOfBirth: "10/25/1996", designation: Designation.Engineer, reportsTo: "LEAD-001" },
  { id: "ENG-003", name: "Ishita Bose", dateOfBirth: "03/02/1997", designation: Designation.Engineer, reportsTo: "LEAD-002" },
  { id: "ENG-004", name: "Siddharth Jain", dateOfBirth: "12/19/1994", designation: Designation.Engineer, reportsTo: "LEAD-003" },
  { id: "ENG-005", name: "Pooja Reddy", dateOfBirth: "07/07/1998", designation: Designation.Engineer, reportsTo: "LEAD-003" },
  { id: "ENG-006", name: "Aman Khan", dateOfBirth: "01/15/1996", designation: Designation.Engineer, reportsTo: "LEAD-004" },
];
