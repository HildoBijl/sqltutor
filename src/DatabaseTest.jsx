import { useDatabase, useQuery } from './components'

const initialData = `CREATE TABLE users (id int, name char);
INSERT INTO users VALUES (0, 'Polina');
INSERT INTO users VALUES (1, 'Tushar');
INSERT INTO users VALUES (2, 'Hildo');`

export function DatabaseTest({ query }) {
    const [db] = useDatabase(initialData)
    const { result, error } = useQuery(db, query)

    // Render the query and its result.
    if (!query)
        return <p>No query has been provided yet.</p>
    return <>
        <p>Your query is: <em>{query}</em></p>
        <QueryResults {...{ error, result }} />
    </>
}

function QueryResults({ error, result }) {
    if (error)
        return <p>There was an error: <em>{error.message}</em>.</p>
    if (result)
        return <p>Your query gave data:<br/>{JSON.stringify(result[0]?.values) || '[]'}</p>
    return <p>No data yet...</p>
}
