import type { SchemaKey } from '@/features/database/schemas';
import { schemas } from '@/features/database/schemas';
import { parseSchemaRows } from '@/features/learning/exerciseEngine/schemaHelpers';

import { numberOrNull, stringify, stringOrNull } from './valueHelpers';

export interface EmployeeRow {
  id: number;
  name: string;
  department: string | null;
  position: string | null;
  salary: number | null;
  hire_date: string | null;
  manager_id: number | null;
}

export interface ProjectRow {
  id: number;
  name: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
}

export interface EmployeeProjectRow {
  employee_id: number;
  project_id: number;
  role: string | null;
  hours_allocated: number | null;
}

function mapEmployeeRow(raw: Record<string, unknown>): EmployeeRow {
  return {
    id: typeof raw.id === 'number' ? raw.id : Number(raw.id ?? 0),
    name: stringify(raw.name),
    department: stringOrNull(raw.department),
    position: stringOrNull(raw.position),
    salary: numberOrNull(raw.salary),
    hire_date: stringOrNull(raw.hire_date),
    manager_id: numberOrNull(raw.manager_id),
  };
}

function mapProjectRow(raw: Record<string, unknown>): ProjectRow {
  return {
    id: typeof raw.id === 'number' ? raw.id : Number(raw.id ?? 0),
    name: stringify(raw.name),
    budget: numberOrNull(raw.budget),
    start_date: stringOrNull(raw.start_date),
    end_date: stringOrNull(raw.end_date),
    status: stringOrNull(raw.status),
  };
}

function mapEmployeeProjectRow(raw: Record<string, unknown>): EmployeeProjectRow {
  return {
    employee_id: typeof raw.employee_id === 'number' ? raw.employee_id : Number(raw.employee_id ?? 0),
    project_id: typeof raw.project_id === 'number' ? raw.project_id : Number(raw.project_id ?? 0),
    role: stringOrNull(raw.role),
    hours_allocated: numberOrNull(raw.hours_allocated),
  };
}

export function parseEmployees(schemaSource: string = schemas.employees): EmployeeRow[] {
  return parseSchemaRows(schemaSource, 'employees').map(mapEmployeeRow);
}

export function parseProjects(schemaSource: string = schemas.employees): ProjectRow[] {
  return parseSchemaRows(schemaSource, 'projects').map(mapProjectRow);
}

export function parseEmployeeProjects(schemaSource: string = schemas.employees): EmployeeProjectRow[] {
  return parseSchemaRows(schemaSource, 'employee_projects').map(mapEmployeeProjectRow);
}

export function loadEmployees(schemaKey: SchemaKey): EmployeeRow[] {
  return parseEmployees(schemas[schemaKey]);
}

export function loadProjects(schemaKey: SchemaKey): ProjectRow[] {
  return parseProjects(schemas[schemaKey]);
}

export function loadEmployeeProjects(schemaKey: SchemaKey): EmployeeProjectRow[] {
  return parseEmployeeProjects(schemas[schemaKey]);
}

export const EMPLOYEES: readonly EmployeeRow[] = parseEmployees();
export const PROJECTS: readonly ProjectRow[] = parseProjects();
export const EMPLOYEE_PROJECTS: readonly EmployeeProjectRow[] = parseEmployeeProjects();

export function createEmployeeLookup(rows: readonly EmployeeRow[] = EMPLOYEES): Map<number, EmployeeRow> {
  return new Map(rows.map((employee) => [employee.id, employee]));
}

export function createProjectLookup(rows: readonly ProjectRow[] = PROJECTS): Map<number, ProjectRow> {
  return new Map(rows.map((project) => [project.id, project]));
}
