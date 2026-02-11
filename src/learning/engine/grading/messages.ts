/**
 * Feedback message constants for query result grading.
 */

export const EMPTY_RESULT_MESSAGE =
  'Your output seems to be empty. Some records were expected here, so something has gone wrong.';

export const TOO_MANY_COLUMNS_MESSAGE =
  'Your output seems to have more columns than was expected. Did you accidentally select too many columns?';

export const TOO_FEW_COLUMNS_MESSAGE =
  'Your output seems to have fewer columns than was expected. Check that you have included all required attributes.';

export const TOO_MANY_ROWS_MESSAGE =
  'You seem to have more rows than expected. Did you set up your filters well enough?';

export const TOO_FEW_ROWS_MESSAGE =
  'You seem to have fewer rows than expected. Check that you included all required entries.';

export const COLUMN_ORDER_MESSAGE =
  "It seems like you didn't give the columns in the required order. Please check the column order.";

export const ROW_VALUE_MISMATCH_MESSAGE =
  'There seem to be rows which do not match the expected values.';

export const SUCCESS_MESSAGE =
  'Perfect! Your query returned the correct results.';

export const ROW_DIFFERENCE_LABEL = (index: number): string =>
  `row ${index + 1}`;

export const DIFFERENCE_EXAMPLE_LABEL = (count: number): string =>
  count === 1 ? 'Example' : 'Examples';

export const ONE_MISSING_ONE_EXTRA_COLUMN_MESSAGE = (
  missingColumnName: string,
  extraColumnName: string,
): string =>
  `Your output seems to be missing a column. I expected there to be one named "${missingColumnName}". I did see "${extraColumnName}" though, so check spelling.`;

export const ONE_MISSING_COLUMN_MESSAGE = (missingColumnName: string): string =>
  `Your output seems to be missing a column. I expected there to be one named "${missingColumnName}".`;

export const MULTIPLE_MISSING_COLUMNS_MESSAGE = (
  formattedMissingColumnNames: string,
): string =>
  `Your output seems to be missing some columns. Check that you have ${formattedMissingColumnNames} in your result.`;

export const getColumnNameMismatchFeedback = (
  missingColumnNames: string[],
  extraColumnNames: string[],
  formattedMissingColumnNames: string,
): string | null => {
  if (missingColumnNames.length === 0 && extraColumnNames.length === 0) {
    return null;
  }

  if (missingColumnNames.length === 1) {
    const [missingColumnName] = missingColumnNames;
    if (extraColumnNames.length === 1) {
      return ONE_MISSING_ONE_EXTRA_COLUMN_MESSAGE(missingColumnName, extraColumnNames[0]);
    }
    return ONE_MISSING_COLUMN_MESSAGE(missingColumnName);
  }

  if (missingColumnNames.length > 1) {
    return MULTIPLE_MISSING_COLUMNS_MESSAGE(formattedMissingColumnNames);
  }

  return TOO_MANY_COLUMNS_MESSAGE;
};

export const INCORRECT_VALUES_IN_COLUMNS_MESSAGE = (
  formattedColumnNames?: string,
): string => {
  const hint = formattedColumnNames
    ? ` Check the values in ${formattedColumnNames}.`
    : ' Check the values in your columns.';
  return `There seem to be incorrect values in one or more columns.${hint}`;
};

export const INCORRECT_VALUES_IN_COLUMN_MESSAGE = (
  columnName?: string,
): string => {
  const columnLabel = columnName ? ` "${columnName}"` : '';
  return `There seem to be incorrect values in the column${columnLabel}. Check the values from this column.`;
};

export const ROW_VALUE_MISMATCH_FEEDBACK = (samples: string): string =>
  `${ROW_VALUE_MISMATCH_MESSAGE}${samples}`;
