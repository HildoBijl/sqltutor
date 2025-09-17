import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  TablePagination,
} from '@mui/material';
import { useState } from 'react';

interface DataTableProps {
  data: {
    columns: string[];
    values: any[][];
  };
  maxRows?: number;
  showPagination?: boolean;
  highlightHeader?: boolean;
  compact?: boolean;
  maxHeight?: number | string;
}

export function DataTable({
  data,
  maxRows = 100,
  showPagination = true,
  highlightHeader = true,
  compact = false,
  maxHeight = 400,
}: DataTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!data || !data.columns || !data.values) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No data to display</Typography>
      </Paper>
    );
  }

  const { columns, values } = data;

  // Limit rows if needed
  const displayValues = values.slice(0, maxRows);

  // Pagination
  const paginatedValues = showPagination
    ? displayValues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : displayValues;

  const handleChangePage = (_event: unknown, newPage: number) => {
    // reference param to satisfy noUnusedParameters
    void _event;
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format cell value
  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <Chip label="NULL" size="small" variant="outlined" />;
    }
    if (typeof value === 'boolean') {
      return (
        <Chip
          label={value ? 'TRUE' : 'FALSE'}
          size="small"
          color={value ? 'success' : 'default'}
          variant="outlined"
        />
      );
    }
    if (typeof value === 'number') {
      return (
        <Typography
          component="span"
          sx={{ fontFamily: 'monospace', color: 'info.main' }}
        >
          {value.toLocaleString()}
        </Typography>
      );
    }
    if (typeof value === 'string' && value.length > 50) {
      return (
        <Typography
          component="span"
          title={value}
          sx={{
            display: 'block',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
      );
    }
    return String(value);
  };

  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: maxHeight,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.hover',
            borderRadius: 1,
          },
        }}
      >
        <Table stickyHeader size={compact ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  sx={{
                    fontWeight: highlightHeader ? 'bold' : 'medium',
                    bgcolor: highlightHeader ? 'background.paper' : 'transparent',
                    color: highlightHeader ? 'primary.main' : 'text.primary',
                    borderBottom: 2,
                    borderColor: 'primary.main',
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedValues.length > 0 ? (
              paginatedValues.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  hover
                  sx={{
                    '&:nth-of-type(odd)': {
                      bgcolor: 'action.hover',
                    },
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{formatCellValue(cell)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography color="text.secondary">No rows returned</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && values.length > rowsPerPage && (
        <TablePagination
          component="div"
          count={displayValues.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}

      {values.length > maxRows && (
        <Box sx={{ p: 1, bgcolor: 'warning.main', color: 'warning.contrastText' }}>
          <Typography variant="caption">
            Showing first {maxRows} of {values.length} rows
          </Typography>
        </Box>
      )}
    </Box>
  );
}
