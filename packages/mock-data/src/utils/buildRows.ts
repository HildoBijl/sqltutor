/**
 * Generic row builder that converts CSV records to SQL rows based on attribute definitions.
 */

import type { SqlCell, AttributeType, Attributes } from '../types';
import { idOrNull, numberOrNull, stringOrNull, booleanOrNull } from './parseCsv';

/**
 * Get the appropriate converter function for an attribute type.
 */
function getConverter(type: AttributeType): (value: string | undefined) => SqlCell {
  switch (type) {
    case 'id':
      return idOrNull;
    case 'number':
      return numberOrNull;
    case 'boolean':
      return booleanOrNull;
    case 'string':
    case 'date':
    default:
      return stringOrNull;
  }
}

/**
 * Build SQL rows from CSV records using attribute definitions.
 *
 * @param records - Parsed CSV records (array of key-value objects)
 * @param attributes - Object mapping CSV column names to their types
 * @returns Array of SQL row arrays
 *
 * @example
 * const attributes = { e_id: 'id', name: 'string', salary: 'number' };
 * const rows = buildRows(parseCsv(csvData), attributes);
 */
export function buildRows(
  records: Record<string, string>[],
  attributes: Attributes,
): SqlCell[][] {
  const keys = Object.keys(attributes);
  const converters = keys.map((key) => getConverter(attributes[key]));

  return records.map((record) =>
    keys.map((key, index) => converters[index](record[key])),
  );
}
