# Mock Data

This folder contains all the mock data used within SQL Valley. It also has helper functions to easily load and work with this mock data.

## Folder set-up

This folder contains the following files/subfolders, in order of dependency.

- [types.ts](./types.ts) has the fundamental types related to tables.
- [utils/](./utils/) contains utility functions used internally to load and process tables. These functions are not exported elsewhere.
- [tables/](./tables/) has all the actual tables. Tables are stored as CSV files. Change the CSV files to change the mock data used within SQL Valley. To add a new table, copy an existing table and adjust as desired.
- [support/](./support/) has database-aware support functions that can be imported by other components. An example support function is the `buildSchema` function that sets up the `CREATE` and `INSERT` queries for any requested tables.
