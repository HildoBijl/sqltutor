import { useState } from 'react';
import { Button, ButtonGroup, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export function Test2() {
    const [selectedTable, setSelectedTable] = useState('companies'); // State to track selected table

    // Function to handle table selection
    const handleTableSelect = (tableName) => {
        setSelectedTable(tableName);
    };

    return (
        <ThemeProvider theme={oneDarkTheme}>
            <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2>Database Explorer</h2>

                {/* Buttons to select the table */}
                <ButtonGroup variant="contained" color="primary" style={{ marginBottom: '16px' }}>
                    <Button onClick={() => handleTableSelect('companies')}>Companies</Button>
                    <Button onClick={() => handleTableSelect('positions')}>Positions</Button>
                </ButtonGroup>

                {/* Data Table */}
                <DataTable selectedTable={selectedTable} />
            </div>
        </ThemeProvider>
    );
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


const initialData2 = `CREATE TABLE positions (id int, company_name char, country char, cite char, position char, salary int);
INSERT INTO positions VALUES (1, 'LinkedIn', 'United States', 'San Francisco', 'ML Engineer', 140000);
INSERT INTO positions VALUES (1, 'LinkedIn', 'United States', 'New York' ,'ML Engineer', 100000);
INSERT INTO positions VALUES (1, 'LinkedIn', 'United States', 'Sunnyvale' ,'Data Engineer', 110000);
INSERT INTO positions VALUES (2, 'Meta', 'United States', 'New York' , 'Data Analyst', 130000);
INSERT INTO positions VALUES (2, 'Meta', 'United States', 'San Francisco' ,'Data Engineer', 130000);
INSERT INTO positions VALUES (2, 'Meta', 'United Kingdom', 'London' ,'Data Engineer', 130000);
INSERT INTO positions VALUES (3, 'ING', 'Netherlands', 'Amsterdam' ,'Data Engineer', 80000);
INSERT INTO positions VALUES (3, 'ING', 'Netherlands', 'Amsterdam' ,'Data Analyst', 80000);
INSERT INTO positions VALUES (3, 'ING', 'Netherlands', 'Amsterdam' ,'Data Scientist', 82000);
INSERT INTO positions VALUES (4, 'KPMG', 'Netherlands', 'Amsterdam' ,'Data Engineer', 87000);
INSERT INTO positions VALUES (4, 'KPMG', 'Netherlands', 'Rotterdam' ,'Data Analyst', 80000);
INSERT INTO positions VALUES (4, 'KPMG', 'Netherlands', 'Amsterdam' ,'Data Scientist', 80000);
INSERT INTO positions VALUES (5, 'PwC', 'Netherlands', 'Amsterdam' ,'Data Engineer', 83000);
INSERT INTO positions VALUES (5, 'PwC', 'Netherlands', 'Amsterdam' ,'Data Analyst', 80000);
INSERT INTO positions VALUES (6, 'Deloitte', 'Netherlands', 'Amsterdam' ,'Data Engineer', 95000);
INSERT INTO positions VALUES (6, 'Deloitte', 'Netherlands', 'Amsterdam' ,'AI Consultant', 90000);
INSERT INTO positions VALUES (6, 'Deloitte', 'Netherlands', 'Amsterdam' ,'Data Scientist', 95000);
INSERT INTO positions VALUES (7, 'EY', 'Netherlands', 'Amsterdam' ,'Data Engineer', 85000);
INSERT INTO positions VALUES (7, 'EY', 'Netherlands', 'Rotterdam' ,'Data Scientist', 84000);
INSERT INTO positions VALUES (8, 'TikTok', 'United States', 'Los Angeles' ,'Data Engineer', 125000);
INSERT INTO positions VALUES (8, 'TikTok', 'United States', 'New York' ,'ML Engineer', 120000);
INSERT INTO positions VALUES (8, 'TikTok', 'United States', 'Los Angeles' ,'Data Scientist', 122000);
INSERT INTO positions VALUES (9, 'Twitter', 'United States', 'San Francisco' ,'Data Engineer', 130000);
INSERT INTO positions VALUES (9, 'Twitter', 'United States', 'New York' ,'Data Analyst', 120000);
INSERT INTO positions VALUES (9, 'Twitter', 'United States', 'San Francisco' ,'Data Scientist', 125000);
INSERT INTO positions VALUES (10, 'Google', 'United States', 'Mountain View' ,'Data Engineer', 140000);
INSERT INTO positions VALUES (10, 'Google', 'United States', 'New York' ,'Data Analyst', 130000);
INSERT INTO positions VALUES (10, 'Google', 'United States', 'Mountain View' ,'Data Scientist', 135000);
INSERT INTO positions VALUES (11, 'Apple', 'United States', 'Cupertino' ,'Data Engineer', 145000);
INSERT INTO positions VALUES (11, 'Apple', 'United States', 'New York' ,'Data Analyst', 135000);
INSERT INTO positions VALUES (11, 'Apple', 'United States', 'Cupertino' ,'Data Scientist', 140000);
INSERT INTO positions VALUES (12, 'Microsoft', 'United States', 'Redmond' ,'Data Engineer', 150000);
INSERT INTO positions VALUES (12, 'Microsoft', 'United States', 'New York' ,'Data Analyst', 140000);
INSERT INTO positions VALUES (12, 'Microsoft', 'United States', 'Redmond' ,'Data Scientist', 145000);
INSERT INTO positions VALUES (13, 'Rabobank', 'Netherlands', 'Utrecht' ,'Data Engineer', 80000);
INSERT INTO positions VALUES (13, 'Rabobank', 'Netherlands', 'Amsterdam' ,'Data Analyst', 80000);`



// Create a custom theme for the table to match the One Dark Pro theme.
const oneDarkTheme = createTheme({
	palette: {
	  mode: 'dark',
	  background: {
		default: '#282C34', 
		paper: '#21252B',   
	  },
	  primary: {
		main: '#c81919', 
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

  function parseSQLData(sqlData) {
    const lines = sqlData.split('\n').map(line => line.trim()).filter(line => line);
    const createTableLine = lines.find(line => line.startsWith('CREATE TABLE'));
    const insertLines = lines.filter(line => line.startsWith('INSERT INTO'));

    // Extract column definitions
    const columnDefinitions = createTableLine
        .match(/\(([^)]+)\)/)[1]
        .split(',')
        .map(col => col.trim().split(' ')[0]);

    const columns = columnDefinitions.map(col => ({
        field: col,
        headerName: col.charAt(0).toUpperCase() + col.slice(1),
        flex: 1,
    }));

    // Extract rows
    const rows = insertLines.map((line, index) => {
        const values = line.match(/\(([^)]+)\)/)[1].split(',').map(val => val.trim().replace(/'/g, ''));
        const row = {};
        columnDefinitions.forEach((col, i) => {
            row[col] = values[i];
        });
        row.id = index + 1; // Add unique ID for DataGrid
        return row;
    });

    return { columns, rows };
}
  
function DataTable({ selectedTable }) {
    // Parse the SQL data
    const tableData = {
        companies: parseSQLData(initialData),
        positions: parseSQLData(initialData2),
    };

    // Get the data for the selected table
    const { columns, rows } = tableData[selectedTable];
    console.log(columns, rows)

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
    );
}