import { useDatabaseContext } from './context'

// useSQL returns the SQL object of the database if it's been loaded and otherwise gives undefined.
export function useSQL() {
	return useDatabaseContext().SQL
}

// useDatabaseError returns the error that occurred on loading the database and otherwise (on no error) returns undefined.
export function useDatabaseError() {
	return useDatabaseContext().error
}
