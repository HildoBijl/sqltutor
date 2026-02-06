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
