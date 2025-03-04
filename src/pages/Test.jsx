import { useState, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { basicSetup } from 'codemirror'

import { useDatabase, useQuery } from 'components'

export function Test() {
	const initialValue = 'SELECT * FROM users'
	const [value, setValue] = useState(initialValue)
	const onChange = useCallback(value => setValue(value), [])

	return <>
	<p>This is the test page. Enter a query in the input field below and watch it being run on a real database.</p>

	<CodeMirror value={value} height="200px" extensions={[basicSetup, sql()]} onChange={onChange} />

	<h4>Results</h4>
	<DatabaseResults query={value} />
	</>
}

const initialData = `CREATE TABLE users (id int, name char);
INSERT INTO users VALUES (0, 'Polina');
INSERT INTO users VALUES (1, 'Tushar');
INSERT INTO users VALUES (2, 'Hildo');`

function DatabaseResults({ query }) {
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
		return <p>Your query gave data:<br />{JSON.stringify(result[0]?.values) || '[]'}</p>
	return <p>No data yet...</p>
}
