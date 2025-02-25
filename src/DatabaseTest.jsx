import { useState, useEffect } from 'react'
import initSqlJs from "sql.js"

const SQL = await initSqlJs({
    // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
    // You can omit locateFile completely when running in node
    locateFile: file => `https://sql.js.org/dist/${file}`
})

console.log(SQL)
const db = new SQL.Database();



let sqlstr = "CREATE TABLE hello (a int, b char); \
INSERT INTO hello VALUES (0, 'hello'); \
INSERT INTO hello VALUES (1, 'world');";
db.run(sqlstr)
window.db = db

const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval")

// Bind values to the parameters and fetch the results of the query
const result = stmt.getAsObject({ ':aval': 1, ':bval': 'world' })

console.log(db)
console.log(result)

export function DatabaseTest({ query }) {
    const [error, setError] = useState()
    const [result, setResult] = useState()

    useEffect(() => {
        try {
            const result = db.exec(query)
            setResult(result)
            setError()
        } catch (error) {
            setError(error)
            setResult()
        }
    }, [query])
    console.log(error, result)
    window.error = error
    window.result = result

    if (error)
        return <p>There was an error: {error.message}.</p>
    if (result)
        return <p>Valid query: {JSON.stringify(result[0].values)}</p>
    return <p>No data yet...</p>
}
