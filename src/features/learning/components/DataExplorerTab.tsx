import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { TableChart, AccountTree } from '@mui/icons-material';
import { DataTable } from '@/shared/components/DataTable';
import { useDatabase } from '@/shared/hooks/useDatabase';
import type { SchemaKey } from '@/features/database/schemas';
import { schemas } from '@/features/database/schemas';

interface DataExplorerTabProps {
  schema: SchemaKey;
}

interface TableInfo {
  name: string;
  columns: Column[];
  relationships: Relationship[];
}

interface Column {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
}

interface Relationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export function DataExplorerTab({ schema }: DataExplorerTabProps) {
  const [selectedSubTab, setSelectedSubTab] = useState(0);
  const [selectedTable, setSelectedTable] = useState<string>('');
  
  const { tableNames, executeQuery, queryResult } = useDatabase({
    context: 'concept',
    schema,
    resetOnSchemaChange: false,
    persistent: true,
  });

  // Parse schema to extract table information
  const tableInfo = parseSchemaForERDiagram(schemas[schema] || '');
  
  // Set default selected table
  if (!selectedTable && tableNames.length > 0) {
    setSelectedTable(tableNames[0]);
  }

  const handleSubTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedSubTab(newValue);
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    // Execute SELECT * to show table data
    executeQuery(`SELECT * FROM ${tableName} LIMIT 100`);
  };

  return (
    <Box>
      {/* Sub-tabs for ER Diagram and Table Data */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={selectedSubTab} 
          onChange={handleSubTabChange}
          variant="fullWidth"
        >
          <Tab 
            icon={<AccountTree />} 
            label="ER Diagram" 
            iconPosition="start"
          />
          <Tab 
            icon={<TableChart />} 
            label="Table Data" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* ER Diagram Tab */}
      {selectedSubTab === 0 && (
        <ERDiagramView tableInfo={tableInfo} />
      )}

      {/* Table Data Tab */}
      {selectedSubTab === 1 && (
        <TableDataView 
          tableNames={tableNames}
          selectedTable={selectedTable}
          onTableSelect={handleTableSelect}
          queryResult={queryResult}
        />
      )}
    </Box>
  );
}

function ERDiagramView({ tableInfo }: { tableInfo: TableInfo[] }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Entity Relationship Diagram
      </Typography>
      
      <Grid container spacing={3}>
        {tableInfo.map((table) => (
          <Grid item xs={12} md={6} lg={4} key={table.name}>
            <Card variant="outlined" sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography 
                  variant="h6" 
                  color="primary" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    borderBottom: 2,
                    borderColor: 'primary.main',
                    pb: 1,
                    mb: 2
                  }}
                >
                  {table.name}
                </Typography>
                
                <Box>
                  {table.columns.map((column, index) => (
                    <Box 
                      key={column.name}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        py: 0.5,
                        backgroundColor: index % 2 === 0 ? 'grey.50' : 'transparent',
                        px: 1,
                        borderRadius: 0.5
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: column.isPrimaryKey ? 'bold' : 'normal',
                          color: column.isPrimaryKey ? 'primary.main' : 'text.primary',
                          minWidth: 120
                        }}
                      >
                        {column.name}
                      </Typography>
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ ml: 1, minWidth: 60 }}
                      >
                        {column.type}
                      </Typography>
                      
                      <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                        {column.isPrimaryKey && (
                          <Chip 
                            label="PK" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        {column.isForeignKey && (
                          <Chip 
                            label="FK" 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
                
                {/* Show relationships */}
                {table.relationships.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Relationships:
                    </Typography>
                    {table.relationships.map((rel, index) => (
                      <Typography 
                        key={index} 
                        variant="caption" 
                        display="block" 
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {rel.fromColumn} → {rel.toTable}.{rel.toColumn}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Legend */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Legend:
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="PK" size="small" color="primary" variant="outlined" />
            <Typography variant="caption">Primary Key</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="FK" size="small" color="secondary" variant="outlined" />
            <Typography variant="caption">Foreign Key</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function TableDataView({ 
  tableNames, 
  selectedTable, 
  onTableSelect, 
  queryResult 
}: {
  tableNames: string[];
  selectedTable: string;
  onTableSelect: (tableName: string) => void;
  queryResult: any[] | null;
}) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Table Data Browser
      </Typography>
      
      {/* Table selector */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Select a table to view its data:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {tableNames.map((tableName) => (
            <Chip
              key={tableName}
              label={tableName}
              onClick={() => onTableSelect(tableName)}
              color={selectedTable === tableName ? 'primary' : 'default'}
              variant={selectedTable === tableName ? 'filled' : 'outlined'}
              clickable
            />
          ))}
        </Box>
      </Paper>
      
      {/* Table data */}
      {selectedTable && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedTable} Table
            </Typography>
            {queryResult && queryResult.length > 0 ? (
              <DataTable data={queryResult[0]} />
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                Click on a table to view its data
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// Parse SQL schema to extract table structure and relationships
function parseSchemaForERDiagram(schemaSQL: string): TableInfo[] {
  const tables: TableInfo[] = [];
  
  // Split by table definitions
  const tableMatches = schemaSQL.match(/CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi);
  
  if (!tableMatches) return tables;
  
  tableMatches.forEach((tableMatch) => {
    const tableNameMatch = tableMatch.match(/CREATE TABLE\s+(\w+)/i);
    if (!tableNameMatch) return;
    
    const tableName = tableNameMatch[1];
    const columnsPart = tableMatch.match(/\(([\s\S]*)\)/)?.[1] || '';
    
    const columns: Column[] = [];
    const relationships: Relationship[] = [];
    
    // Split by commas but handle nested parentheses
    const columnLines = columnsPart.split(/,\s*(?![^()]*\))/);
    
    columnLines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and constraints
      if (!trimmedLine || trimmedLine.startsWith('PRIMARY KEY') || 
          trimmedLine.startsWith('FOREIGN KEY') || 
          trimmedLine.startsWith('CHECK') ||
          trimmedLine.startsWith('UNIQUE')) {
        
        // Handle foreign key constraints
        const fkMatch = trimmedLine.match(/FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)/i);
        if (fkMatch) {
          relationships.push({
            fromTable: tableName,
            fromColumn: fkMatch[1],
            toTable: fkMatch[2],
            toColumn: fkMatch[3]
          });
        }
        return;
      }
      
      // Parse column definition
      const columnMatch = trimmedLine.match(/(\w+)\s+(\w+(?:\([^)]*\))?)/i);
      if (!columnMatch) return;
      
      const columnName = columnMatch[1];
      const columnType = columnMatch[2];
      
      const isPrimaryKey = /PRIMARY KEY/i.test(trimmedLine);
      const isForeignKey = /REFERENCES/i.test(trimmedLine);
      
      let references = '';
      if (isForeignKey) {
        const refMatch = trimmedLine.match(/REFERENCES\s+(\w+)\s*\((\w+)\)/i);
        if (refMatch) {
          references = `${refMatch[1]}.${refMatch[2]}`;
          relationships.push({
            fromTable: tableName,
            fromColumn: columnName,
            toTable: refMatch[1],
            toColumn: refMatch[2]
          });
        }
      }
      
      columns.push({
        name: columnName,
        type: columnType,
        isPrimaryKey,
        isForeignKey,
        references: references || undefined
      });
    });
    
    tables.push({
      name: tableName,
      columns,
      relationships
    });
  });
  
  return tables;
}


