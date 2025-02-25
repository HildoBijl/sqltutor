import { useState, useEffect, useMemo } from 'react'

import { useSQL } from './components'

export function DatabaseTest({ query }) {
    const [error, setError] = useState()
    const [result, setResult] = useState()
    const SQL = useSQL()

    // Set up a database as soon as SQL.JS loads.
    const db = useMemo(() => {
        console.log(SQL)
        if (!SQL)
            return
        const db = new SQL.Database()
        const sqlstr = "CREATE TABLE users (id int, name char); \
INSERT INTO users VALUES (0, 'Polina'); \
INSERT INTO users VALUES (1, 'Tushar'); \
INSERT INTO users VALUES (2, 'Hildo');"
        db.run(sqlstr)
        return db
    }, [SQL])

    // When the query changes, rerun it on the database.
    useEffect(() => {
        if (!db)
            return
        try {
            const result = db.exec(query)
            setResult(result)
            setError()
        } catch (error) {
            setError(error)
            setResult()
        }
    }, [db, query])

    // Render the query and its result.
    if (!query)
        return <p>No query has been provided yet.</p>
    return <>
        <p>Your query is: <em>{query}</em></p>
        <QueryResults {...{ error, result }} />
    </>
}

function QueryResults({ error, result }) {
    console.log(result)
    if (error)
        return <p>There was an error: <em>{error.message}</em>.</p>
    if (result)
        return <p>Your query gave data:<br/>{JSON.stringify(result[0]?.values) || '[]'}</p>
    return <p>No data yet...</p>
}
