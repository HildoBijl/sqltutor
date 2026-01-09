/**
 * Type definitions for mock data tables.
 */

/** Available dataset sizes */
export type DatasetSize = 'full' | 'small';

/** SQL cell value types */
export type SqlCell = string | number | null | boolean;

/** Attribute type definitions for automatic row building */
export type AttributeType = 'id' | 'string' | 'number' | 'boolean' | 'date';

/** Map of column names to their attribute types */
export type Attributes = Record<string, AttributeType>;

/** Table definition with full and small row sets */
export interface TableDefinition {
  /** Table name in the database */
  name: string;
  /** Attribute definitions for each column (useful for ER diagrams, etc.) */
  attributes: Attributes;
  /** CREATE TABLE statement */
  createStatement: string;
  /** Row data for different dataset sizes */
  rows: {
    full: SqlCell[][];
    small: SqlCell[][];
  };
}
