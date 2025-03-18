import { useState, useCallback } from 'react'
import { useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material'

import { SQLInput, Subpage, useDatabase, useQuery } from 'components'

export function Test() {
	const initialValue = 'SELECT * FROM users'
	const [value, setValue] = useState(initialValue)
	const onChange = useCallback(value => setValue(value), [])

	return <Subpage>
		<p>This is the test page. Enter a query in the input field below and watch it being run on a real database.</p>

		<SQLInput value={value} onChange={onChange} height="200px" />

		<h4>Results</h4>
		<DatabaseResults query={value} />
	</Subpage>
}

const initialData = `CREATE TABLE users (id int, name char);
INSERT INTO users VALUES (0, 'Polina');
INSERT INTO users VALUES (1, 'Tushar');
INSERT INTO users VALUES (2, 'Hildo');`

function DatabaseResults({ query }) {
	const [db] = useDatabase(initialData)
	const { result, error } = useQuery(db, query)

	// verification of the query and its result.
	console.log('Query:', query);
	console.log('Result:', result);
	console.log('Error:', error);

	// Render the query and its result.
	if (!query)
		return <p>No query has been provided yet.</p>
	return <>
		<p>Your query is: <em>{query}</em></p>
		<QueryResults {...{ error, result }} />
	</>
}

function QueryResults({ error, result }) {
	const theme = useTheme()
	console.log(theme)

	// On a faulty query, show an error.
	if (error)
		return <p style={{ color: '#00ff00', fontWeight: 'bold', marginLeft: 2, marginRight: 2 }}>There was an error: <em>{error.message}</em>.</p>

	// On a loading query, show a note.
	if (!result)
		return <p>No data yet...</p>
	window.r = result

	// On an empty result show a note.
	const table = result[0]
	if (!table)
		return <p>Zeros rows returned.</p>

	// There is a table. Render it.
	return <TableContainer component={Paper}>
		<Table>
			<TableHead>
				<TableRow>
					{table.columns.map((columnName) => <TableCell key={columnName} sx={{ color: theme.palette.primary.main }}>{columnName}</TableCell>)}
				</TableRow>
			</TableHead>
			<TableBody>
				{table.values.map((row, rowIndex) => <TableRow key={rowIndex}>
					{row.map((value, colIndex) => <TableCell key={table.columns[colIndex]}>{value}</TableCell>)}
				</TableRow>)}
			</TableBody>
		</Table>
	</TableContainer>
}
