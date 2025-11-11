import { useState, useEffect } from 'react';

import { type QueryResult } from './useDatabase';

interface UseQueryReturn {
	loading: boolean;
	error: Error | null;
	results: QueryResult[] | null;
}

// Return { loading, error, results } for a given query, to update only when the database or query changes.
export function useQuery(database: any | null, query: string): UseQueryReturn {
	const [executing, setExecuting] = useState<boolean>(false);
	const [results, setResults] = useState<QueryResult[] | null>(null);
	const [error, setError] = useState<Error | null>(null);

	// On a change in query, update the result.
	useEffect(() => {
		if (!database)
			return;

		// Start running the query.
		try {
			setError(null);
			setResults(null);
			setExecuting(true);
			const results = database.exec(query);
			setResults(results);
		} catch (err) {
			const message = ((): string => {
				if (err instanceof Error) return err.message;
				if (typeof err === 'string') return err;
				try {
					return (err as any)?.message ?? JSON.stringify(err);
				} catch {
					return 'Query execution failed';
				}
			})();
			setError(new Error(message || 'Query execution failed'));
		} finally {
			setExecuting(false);
		}
	}, [database, query]);

	// On no database or an executing query, show a loading note.
	const loading = !database || executing;
	return { loading, error, results };
}

// Return only the query results (or null on non-existing).
export function useQueryResults(...args: Parameters<typeof useQuery>): ReturnType<typeof useQuery>["results"] {
	return useQuery(...args).results;
}

// Return only the first query result (or null on non-existing).
export function useQueryResult(...args: Parameters<typeof useQuery>): QueryResult | null {
	return useQueryResults(...args)?.[0] || null;
}
