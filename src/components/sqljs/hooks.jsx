import { useSQLJSContext } from './context'

// useSQLJS returns the SQLJS object if it's been loaded and otherwise gives undefined.
export function useSQLJS() {
	return useSQLJSContext().SQLJS
}

// useSQLJSError returns the error that occurred on loading SQL.JS and otherwise (on no error) returns undefined.
export function useSQLJSError() {
	return useSQLJSContext().error
}
