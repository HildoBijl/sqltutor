import { useState } from 'react'
import { Button, ButtonGroup, Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

import { firstOf, keysToObject } from 'util'
import { useQuery, useTableNames } from 'components'
import { useComponent } from 'edu'

import { useSkillDatabase } from './skillDatabase'

// DataExplorer takes the skill that is given in the URL, gets its database and shows an explorer tool for it.
export function DataExplorer() {
	// Load the skillId and the corresponding database.
	const skillId = useComponent()?.id
	const [database] = useSkillDatabase(skillId)

	// Render a loading message or the Data Explorer for the given database.
	if (!database)
		return <p>Loading database...</p>
	return <DataExplorerWithDatabase database={database} />
}

// DataExplorerWithDatabase renders the data explorer for the given database.
function DataExplorerWithDatabase({ database }) {
	// Set up a state for the table to show, using defaults when not defined yet.
	const [table, setTable] = useState()
	const tableNames = useTableNames(database)
	const tableToShow = table || firstOf(tableNames)

	// Show the explorer, with buttons (if needed) and a table to show (if known).
	return <>
		{tableNames.length >= 2 ? <TableTabs {...{ table: tableToShow, setTable, database }} /> : null}
		{tableToShow ? <DataTable key={tableToShow} database={database} table={tableToShow} /> : <p>Loading table list...</p>}
	</>
}

// TableTabs shows the buttons for all the possible tables in the database.
function TableTabs({ table, setTable, database }) {
	const tableNames = useTableNames(database)
	return <ButtonGroup variant="contained" color="primary" style={{ marginBottom: '16px' }}>
		{tableNames.map(tableName => <Button key={tableName} onClick={() => setTable(tableName)} variant={table === tableName ? 'contained' : 'outlined'}>{tableName}</Button>)}
	</ButtonGroup>
}

// DataTable takes a database and a table name and gets all the data from that table to display it.
function DataTable({ database, table }) {
	const result = useQuery(database, `SELECT * FROM ${table}`)
	if (!result.result)
		return <p>Loading {table} table...</p>
	return <DataTableWithData data={result.result[0]} />
}

// DataTableWithData takes data given by SQL.JS and shows it in an interactive table.
function DataTableWithData({ data }) {
	// Turn the data from the SQL database into a format needed by the DataGrid.
	const columns = data.columns.map(columnId => ({ field: columnId, headerName: columnId, flex: 1 })) // Add flex for styling.
	const rows = data.values.map(row => keysToObject(data.columns, (column, index) => row[index]))

	// Render the data grid.
	return (
		<Paper style={{ height: 600, width: '100%', padding: '16px', boxSizing: 'border-box' }}>
			<DataGrid
				rows={rows}
				columns={columns}
				pageSize={5}
				rowsPerPageOptions={[5, 10, 20]}
				checkboxSelection
				disableSelectionOnClick
				sortingOrder={['asc', 'desc']}
			/>
		</Paper>
	)
}
