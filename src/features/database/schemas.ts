// Define individual schemas
const companiesSchema = `
  CREATE TABLE companies (
    id INTEGER PRIMARY KEY,
    company_name TEXT NOT NULL,
    country TEXT NOT NULL,
    founded_year INTEGER,
    num_employees INTEGER,
    industry TEXT
  );
  
  INSERT INTO companies VALUES 
    (1, 'LinkedIn', 'United States', 2003, 20000, 'Social Media'),
    (2, 'Meta', 'United States', 2004, 77000, 'Social Media'),
    (3, 'ING', 'Netherlands', 1991, 57000, 'Banking'),
    (4, 'KPMG', 'Netherlands', 1987, 236000, 'Consulting'),
    (5, 'PwC', 'Netherlands', 1998, 328000, 'Consulting'),
    (6, 'Deloitte', 'Netherlands', 1845, 415000, 'Consulting'),
    (7, 'EY', 'Netherlands', 1989, 365000, 'Consulting'),
    (8, 'TikTok', 'United States', 2016, 150000, 'Social Media'),
    (9, 'Twitter', 'United States', 2006, 7500, 'Social Media'),
    (10, 'Google', 'United States', 1998, 190000, 'Technology'),
    (11, 'Apple', 'United States', 1976, 164000, 'Technology'),
    (12, 'Microsoft', 'United States', 1975, 221000, 'Technology'),
    (13, 'Rabobank', 'Netherlands', 1972, 43000, 'Banking'),
    (14, 'ASML', 'Netherlands', 1984, 40000, 'Technology'),
    (15, 'Philips', 'Netherlands', 1891, 78000, 'Healthcare'),
    (16, 'NXP', 'Netherlands', 2006, 34000, 'Semiconductors'),
    (17, 'Unilever', 'United Kingdom', 1929, 128000, 'Consumer Goods'),
    (18, 'Shell', 'Netherlands', 1907, 86000, 'Energy');
`;

const positionsSchema = `
  CREATE TABLE positions (
    id INTEGER PRIMARY KEY,
    company_id INTEGER,
    company_name TEXT,
    country TEXT,
    city TEXT,
    position TEXT,
    department TEXT,
    salary INTEGER,
    remote_allowed BOOLEAN,
    FOREIGN KEY (company_id) REFERENCES companies(id)
  );
  
  INSERT INTO positions VALUES
    (1, 1, 'LinkedIn', 'United States', 'San Francisco', 'ML Engineer', 'Engineering', 140000, 1),
    (2, 1, 'LinkedIn', 'United States', 'New York', 'ML Engineer', 'Engineering', 100000, 1),
    (3, 1, 'LinkedIn', 'United States', 'Sunnyvale', 'Data Engineer', 'Data', 110000, 0),
    (4, 2, 'Meta', 'United States', 'New York', 'Data Analyst', 'Analytics', 130000, 1),
    (5, 2, 'Meta', 'United States', 'San Francisco', 'Data Engineer', 'Data', 130000, 1),
    (6, 2, 'Meta', 'United Kingdom', 'London', 'Data Engineer', 'Data', 130000, 0),
    (7, 3, 'ING', 'Netherlands', 'Amsterdam', 'Data Engineer', 'Data', 80000, 0),
    (8, 3, 'ING', 'Netherlands', 'Amsterdam', 'Data Analyst', 'Analytics', 80000, 0),
    (9, 3, 'ING', 'Netherlands', 'Amsterdam', 'Data Scientist', 'Data Science', 82000, 1),
    (10, 4, 'KPMG', 'Netherlands', 'Amsterdam', 'Data Engineer', 'Data', 87000, 1),
    (11, 4, 'KPMG', 'Netherlands', 'Rotterdam', 'Data Analyst', 'Analytics', 80000, 0),
    (12, 4, 'KPMG', 'Netherlands', 'Amsterdam', 'Data Scientist', 'Data Science', 80000, 1),
    (13, 5, 'PwC', 'Netherlands', 'Amsterdam', 'Data Engineer', 'Data', 83000, 1),
    (14, 5, 'PwC', 'Netherlands', 'Amsterdam', 'Data Analyst', 'Analytics', 80000, 0),
    (15, 6, 'Deloitte', 'Netherlands', 'Amsterdam', 'Data Engineer', 'Data', 95000, 1),
    (16, 6, 'Deloitte', 'Netherlands', 'Amsterdam', 'AI Consultant', 'Consulting', 90000, 1),
    (17, 6, 'Deloitte', 'Netherlands', 'Amsterdam', 'Data Scientist', 'Data Science', 95000, 0),
    (18, 7, 'EY', 'Netherlands', 'Amsterdam', 'Data Engineer', 'Data', 85000, 1),
    (19, 7, 'EY', 'Netherlands', 'Rotterdam', 'Data Scientist', 'Data Science', 84000, 0),
    (20, 8, 'TikTok', 'United States', 'Los Angeles', 'Data Engineer', 'Data', 125000, 0),
    (21, 8, 'TikTok', 'United States', 'New York', 'ML Engineer', 'Engineering', 120000, 1),
    (22, 8, 'TikTok', 'United States', 'Los Angeles', 'Data Scientist', 'Data Science', 122000, 0),
    (23, 9, 'Twitter', 'United States', 'San Francisco', 'Data Engineer', 'Data', 130000, 1),
    (24, 9, 'Twitter', 'United States', 'New York', 'Data Analyst', 'Analytics', 120000, 1),
    (25, 9, 'Twitter', 'United States', 'San Francisco', 'Data Scientist', 'Data Science', 125000, 1),
    (26, 10, 'Google', 'United States', 'Mountain View', 'Data Engineer', 'Data', 140000, 0),
    (27, 10, 'Google', 'United States', 'New York', 'Data Analyst', 'Analytics', 130000, 1),
    (28, 10, 'Google', 'United States', 'Mountain View', 'Data Scientist', 'Data Science', 135000, 0),
    (29, 11, 'Apple', 'United States', 'Cupertino', 'Data Engineer', 'Data', 145000, 0),
    (30, 11, 'Apple', 'United States', 'New York', 'Data Analyst', 'Analytics', 135000, 0),
    (31, 11, 'Apple', 'United States', 'Cupertino', 'Data Scientist', 'Data Science', 140000, 0),
    (32, 12, 'Microsoft', 'United States', 'Redmond', 'Data Engineer', 'Data', 150000, 1),
    (33, 12, 'Microsoft', 'United States', 'New York', 'Data Analyst', 'Analytics', 140000, 1),
    (34, 12, 'Microsoft', 'United States', 'Redmond', 'Data Scientist', 'Data Science', 145000, 1),
    (35, 13, 'Rabobank', 'Netherlands', 'Utrecht', 'Data Engineer', 'Data', 80000, 0),
    (36, 13, 'Rabobank', 'Netherlands', 'Amsterdam', 'Data Analyst', 'Analytics', 80000, 1);
`;

const employeesSchema = `
  CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    position TEXT,
    salary INTEGER,
    hire_date DATE,
    manager_id INTEGER,
    FOREIGN KEY (manager_id) REFERENCES employees(id)
  );
  
  CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    budget INTEGER,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK(status IN ('Planning', 'Active', 'Completed', 'Cancelled'))
  );
  
  CREATE TABLE employee_projects (
    employee_id INTEGER,
    project_id INTEGER,
    role TEXT,
    hours_allocated INTEGER,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );
  
  -- Sample data
  INSERT INTO employees VALUES
    (1, 'Alice Johnson', 'Engineering', 'Director', 150000, '2019-01-15', NULL),
    (2, 'Bob Smith', 'Engineering', 'Senior Engineer', 120000, '2019-03-20', 1),
    (3, 'Carol White', 'Engineering', 'Engineer', 95000, '2020-06-10', 2),
    (4, 'David Brown', 'Engineering', 'Junior Engineer', 75000, '2021-08-01', 2),
    (5, 'Eve Davis', 'Product', 'Product Manager', 130000, '2019-11-05', NULL),
    (6, 'Frank Wilson', 'Product', 'Senior PM', 110000, '2020-02-15', 5),
    (7, 'Grace Lee', 'Data', 'Data Scientist', 125000, '2020-04-20', NULL),
    (8, 'Henry Martin', 'Data', 'Data Analyst', 90000, '2021-01-10', 7),
    (9, 'Iris Chen', 'Data', 'ML Engineer', 135000, '2019-09-01', 7),
    (10, 'Jack Taylor', 'HR', 'HR Manager', 95000, '2018-12-01', NULL);
  
  INSERT INTO projects VALUES
    (1, 'Website Redesign', 500000, '2024-01-01', '2024-06-30', 'Active'),
    (2, 'Mobile App v2.0', 750000, '2024-03-01', '2024-12-31', 'Active'),
    (3, 'Data Pipeline', 300000, '2023-09-01', '2024-03-31', 'Completed'),
    (4, 'ML Platform', 1000000, '2024-06-01', '2025-05-31', 'Planning'),
    (5, 'Customer Analytics', 400000, '2024-02-01', '2024-08-31', 'Active');
  
  INSERT INTO employee_projects VALUES
    (2, 1, 'Tech Lead', 400),
    (3, 1, 'Developer', 600),
    (4, 1, 'Developer', 800),
    (2, 2, 'Architect', 200),
    (3, 2, 'Developer', 400),
    (6, 2, 'Product Owner', 300),
    (7, 3, 'Lead', 600),
    (8, 3, 'Analyst', 800),
    (7, 5, 'Data Scientist', 400),
    (8, 5, 'Analyst', 600),
    (9, 4, 'ML Lead', 500);
`;

// Export schemas object
export const schemas = {
  companies: companiesSchema,
  positions: positionsSchema,
  companiesAndPositions: `${companiesSchema}\n\n${positionsSchema}`,
  employees: employeesSchema,
};

// Get all available table names for a schema
export function getTableNames(schema: string): string[] {
  const matches = schema.match(/CREATE TABLE (\w+)/gi);
  if (!matches) return [];

  return matches.map(match => match.replace(/CREATE TABLE /i, '').trim());
}

// Helper to get a user-friendly schema description
export function getSchemaDescription(schemaKey: keyof typeof schemas): string {
  const descriptions: Record<keyof typeof schemas, string> = {
    companies: 'Company information with basic details',
    positions: 'Job positions and salary information',
    companiesAndPositions: 'Companies and their available positions',
    employees: 'Employee management with projects and hierarchies',
  };

  return descriptions[schemaKey] || 'Database schema';
}

// Export schema keys for TypeScript
export type SchemaKey = keyof typeof schemas;
