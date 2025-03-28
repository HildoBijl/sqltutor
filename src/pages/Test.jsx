import { useState, useCallback } from 'react'
import { useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { SQLInput, Subpage, useDatabase, useQuery } from 'components'

export function Test() {
	const initialValue = 'SELECT * FROM companies'
	const [value, setValue] = useState(initialValue)
	const onChange = useCallback(value => setValue(value), [])

	return <Subpage>
		<p>This is the test page. Enter a query in the input field below and watch it being run on a real database.</p>

		<SQLInput value={value} onChange={onChange} height="200px" />

		<h4>Results</h4>
		<DatabaseResults query={value} />
	</Subpage>
}

const initialData = `CREATE TABLE companies (id int, company_name char, country char);
INSERT INTO companies VALUES (1, 'LinkedIn', 'United States');
INSERT INTO companies VALUES (2, 'Meta', 'United States');
INSERT INTO companies VALUES (3, 'ING', 'Netherlands');
INSERT INTO companies VALUES (4, 'KPMG', 'Netherlands');
INSERT INTO companies VALUES (5, 'PwC', 'Netherlands');
INSERT INTO companies VALUES (6, 'Deloitte', 'Netherlands');
INSERT INTO companies VALUES (7, 'EY', 'Netherlands');
INSERT INTO companies VALUES (8, 'TikTok', 'United States');
INSERT INTO companies VALUES (9, 'Twitter', 'United States');
INSERT INTO companies VALUES (10, 'Google', 'United States');
INSERT INTO companies VALUES (11, 'Apple', 'United States');
INSERT INTO companies VALUES (12, 'Microsoft', 'United States');
INSERT INTO companies VALUES (13, 'Rabobank', 'Netherlands');
INSERT INTO companies VALUES (14, 'ASML', 'Netherlands');
INSERT INTO companies VALUES (15, 'Philips', 'Netherlands');
INSERT INTO companies VALUES (16, 'NXP', 'Netherlands');
INSERT INTO companies VALUES (17, 'Unilever', 'United Kingdom');
INSERT INTO companies VALUES (18, 'Shell', 'Netherlands');`

const oneDarkTheme = createTheme({
	palette: {
	  mode: 'dark',
	  background: {
		default: '#282C34', 
		paper: '#21252B',   
	  },
	  primary: {
		main: '#61AFEF', 
	  },
	  text: {
		primary: '#ABB2BF', 
	  },
	  divider: '#3E4451',  
	},
	components: {
	  MuiTableCell: {
		styleOverrides: {
		  root: {
			borderColor: '#3E4451', // Border color to match theme
		  },
		  // header of the table
		  head: {
			backgroundColor: '#282C34', 
			color: '#c81919',
			fontWeight: 'bold',
		  },
		  // body text in the row #ABB2BF - alternative color
		  body: {
			color: '#eaecf1', 
		  }
		}
	  },
	}
  });
  
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
	return (
		<ThemeProvider theme={oneDarkTheme}>
		  <TableContainer component={Paper}>
			<Table>
			  <TableHead>
				<TableRow>
				  {table.columns.map((columnName) => <TableCell key={columnName}>{columnName}</TableCell>)}
				</TableRow>
			  </TableHead>
			  <TableBody>
				{table.values.map((row, rowIndex) => (
				  <TableRow key={rowIndex}>
					{row.map((value, colIndex) => <TableCell key={table.columns[colIndex]}>{value}</TableCell>)}
				  </TableRow>
				))}
			  </TableBody>
			</Table>
		  </TableContainer>
		</ThemeProvider>
	  );
}

