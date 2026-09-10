# SQLValley Exercise Export

Generated from `src/curriculum/modules/*/exercise.tsx`.

Total ID-bearing exercises: 41

Note: RA and Datalog `Practice.tsx` pages contain manual practice items, but they are not exported here because they do not define stored `exerciseId` values or use the auto-graded exercise loader.

## Summary

| Module ID | Module Name | Subject | Exercise Count | Accessible Tables |
|---|---|---:|---:|---|
| aggregate-columns | Aggregate Columns | SQL | 3 | contracts, departments, employees, expenses, quarterlyPerformance, transactions |
| choose-columns | Choose Columns | SQL | 3 | contracts, departments, employees, transactions |
| filter-rows-on-multiple-criteria | Filter Rows on Multiple Criteria | SQL | 3 | contracts, departments, employees, expenses, transactions |
| filter-rows | Filter Rows | SQL | 4 | contracts, departments, employees, expenses, transactions |
| join-tables | Join Tables | SQL | 3 | accounts, contracts, departments, employees, expenses, products, transactions |
| process-columns | Process Columns | SQL | 3 | contracts, departments, employees, expenses, transactions |
| sort-rows | Sort Rows | SQL | 3 | contracts, departments, employees, expenses |
| use-filtered-aggregation | Use Filtered Aggregation | SQL | 3 | contracts, departments, employees, expenses, quarterlyPerformance, transactions |
| write-look-up-query | Write Look-up Query | SQL | 3 | accounts, contracts, departments, employees, expenses, transactions |
| write-multi-criterion-query | Write Multi-Criterion Query | SQL | 3 | contracts, departments, employees, expenses, transactions |
| write-multi-layered-query | Write Multi-Layered Query | SQL | 3 | accounts, allocations, contracts, departments, employees, expenses, products, quarterlyPerformance, transactions |
| write-multi-table-query | Write Multi-Table Query | SQL | 4 | accounts, allocations, contracts, departments, employees, expenses, products, transactions |
| write-single-criterion-query | Write Single-Criterion Query | SQL | 3 | contracts, departments, employees, expenses, transactions |

## Exercise Index

| Module | Exercise ID | Version | Referenced Tables | Problem |
|---|---|---:|---|---|
| aggregate-columns | aggregate-max-min-revenue | 1 | quarterly_performance | Create an overview of all fiscal years and, for each respective fiscal year, the lowest and highest revenue obtained by any asset category in any of its quarters. |
| aggregate-columns | aggregate-total-expenses | 1 | expenses | Create an overview of the IDs of all departments that ever had expenses and, for each respective department, the total expenses incurred. |
| aggregate-columns | aggregate-highest-expenses | 1 | expenses | Create an overview of the IDs of all departments that ever had expenses and, for each respective department, the highest expense it ever incurred. |
| choose-columns | choose-columns-contacts | 1 | employees | List the first name, last name, email, and phone number of all employees. Ensure that the phone number is called "number" as column name. |
| choose-columns | choose-columns-department-budgets | 1 | departments | Retrieve the department ID, department name and budget of all departments. Ensure that the budget is called "available_money" as column name. |
| choose-columns | choose-columns-cities | 1 | employees | Find the list of all cities in which the employees of the company live, without duplicates. |
| filter-rows-on-multiple-criteria | multi-filter-employees-between | 1 | departments | Retrieve all departments where the number of employees is not between 10 and 20 (inclusive), and whose budget is known. |
| filter-rows-on-multiple-criteria | multi-filter-on-leave | 1 | contracts | Retrieve all contracts where the employee is either on sick leave or paid leave, and the end date is after 2024. |
| filter-rows-on-multiple-criteria | multi-filter-phone-area | 1 | employees | Retrieve all employees whose phone number starts with 408 and who live in either Mountain View or Santa Clara. |
| filter-rows | filter-rows-lt-amount | 1 | contracts | Retrieve all contracts with performance score under 80. |
| filter-rows | filter-rows-equal-date | 1 | contracts | Retrieve all contracts where the start date and end date are the same. |
| filter-rows | filter-rows-string-like | 1 | contracts | Retrieve all contracts that have the word "sick" anywhere in the status. |
| filter-rows | filter-rows-gt-date | 1 | contracts | Find all contracts for employees that started after 2023. |
| join-tables | join-managers-hire-date | 1 | departments, employees | Retrieve the department names and manager names (first and last) of all departments whose manager was hired before 2018. |
| join-tables | join-employee-positions | 1 | contracts, employees | For all employees, make a list of the positions they have had. Give the first name, the last name and the position. A person may have multiple entries in case of multiple positions, but there should be no duplicates. Also include employees who never had a position. |
| join-tables | join-employee-leave | 1 | contracts, employees | Create an overview of all sick leaves. More specific: find the names (first and last) of all employees who have been on sick leave. Also include the starting date and ending date of the respective contract in which they had sick leave. (In case of multiple contracts with sick leave, include multiple rows.) |
| process-columns | process-pay-ratio | 1 | contracts | For all contracts, retrieve the employee ID, start date, and the ratio of salary to performance score. |
| process-columns | process-budget-per-employee | 1 | departments | Retrieve the department ID, budget, number of employees, and the budget per employee for all departments. |
| process-columns | process-date-flag | 1 | contracts | For all contracts, retrieve the employee ID and a flag indicating if the start date is after the end date. (The flag is TRUE or 1 when the start date is after the end date, and FALSE or 0 when this is not the case. When any of the dates is NULL, the flag is also NULL.) |
| sort-rows | sort-by-perf-salary | 1 | contracts | Retrieve all contracts, sorted first by performance score ascending, and for equal scores, by salary descending. |
| sort-rows | sort-dept-budget-skip | 1 | departments | Retrieve 5 departments with the smallest budgets, skipping the first 3. Put departments with unknown budget at the end. |
| sort-rows | sort-end-date-null-last | 1 | contracts | Retrieve all contracts of all employees, ordered by end date with later end dates shown first. Put everyone with an unlimited contract at the start. |
| use-filtered-aggregation | filtered-aggregation-perf-range | 1 | contracts | Create an overview of all employees (their IDs) and their lowest and highest performance score ever obtained since January 1st, 2020 (going by contract end date). Limit the output to fluctuating employees: those where the difference between the lowest and highest score in this time period exceeds 40. |
| use-filtered-aggregation | filtered-aggregation-rejected-tx | 1 | transactions | Create an overview of all vendors (their usernames), their total number of transactions with price larger than ten million, and the number of these that were rejected. Limit the output to those vendors with more than three such rejected large transactions. |
| use-filtered-aggregation | filtered-aggregation-product-revenue | 1 | transactions | Create an overview of all products (their IDs), the number of incomplete transactions, and the total revenue from those incomplete transactions. Limit the output to those products whose average transaction value at these incomplete transactions is less than one million. |
| write-look-up-query | lookup-manager-city | 1 | departments, employees | Find the names of the departments whose manager lives in Palo Alto. |
| write-look-up-query | lookup-employee-position | 1 | contracts, employees | Find the first and last name of all employees that have ever worked as a warehouse associate. |
| write-look-up-query | lookup-manager-sick | 1 | contracts, departments | Find the names of the departments whose manager has at some point been on sick leave. |
| write-multi-criterion-query | multi-criterion-start-date-range | 1 | contracts | Retrieve the first 10 employees (their ID, start date, position and performance score) whose start date falls between January 1 and September 30 of 2025 (inclusive), sorted by start date. |
| write-multi-criterion-query | multi-criterion-work-status-active | 1 | contracts | Retrieve the employee ID, status, and monthly salary of employees whose status is active and whose monthly salary is either above 10,000 or below 1,000. |
| write-multi-criterion-query | multi-criterion-departments-expenditure | 1 | departments | Retrieve an overview of department names and their budget per employee, sorted from highest to lowest. Exclude the departments of Human Resources, Customer Support and Public Relations in this overview. |
| write-multi-layered-query | multilayered-mock-dept-expense | 1 | departments, dept_budget, dept_expenses, expenses | Retrieve the id, budget and total amount spent of all the departments whose total recorded expenses never exceeded their allocated budget. |
| write-multi-layered-query | multilayered-mock-buyer-vendor | 1 | buyer_totals, transactions, vendor_totals | Identify the username, amount spent and amount earned, for all users whose total revenue as vendor exceeds their total spending as buyer. |
| write-multi-layered-query | multilayered-wrong-employee-counts | 1 | allocations, departments, emp_alloc_count, employees, single_alloc_per_dept, single_allocations, total_allocations | The employee count in the departments table seems to be inflated. Create an overview containing the department name, the number of employees as mentioned in the departments table, the total number of employees allocated to the department, the total number of employees that are ONLY allocated to this department, and the first and last name of the department manager. Only show those rows for departments where the difference between the estimated number of employees and the number of employees only allocated to this department is larger than 3. |
| write-multi-table-query | multitable-mock-join-le | 1 | accounts, products, transactions | List the email addresses of unverified accounts who have bought a product for less than half of its estimated value. |
| write-multi-table-query | multitable-mock-in-notin | 1 | accounts, products, transactions | Find the first name and last name of accounts who appear as buyers in transactions related to "Musical Instruments" products, but never sold anything (of any type). |
| write-multi-table-query | multitable-mock-intersect | 1 | products, transactions | Retrieve the usernames of all users who have at some point bought one or more products from the "Fine Art" category, and who also appear as owners of products categorized as "Designer Fashion". |
| write-multi-table-query | multitable-universal-query | 1 | employees, products, transactions | Find the product categories of which all transactions have been validated by employees whose current salary is less than 200000. |
| write-single-criterion-query | unknown-budget | 1 | departments | Find the ID and name of all the departments whose budget is not known. |
| write-single-criterion-query | large-earners | 1 | employees | Find the first and last names of all the employees who currently earn more than 150,000. Ensure there are no duplicates. |
| write-single-criterion-query | tough-positions | 1 | contracts | Find all the job positions where at some point someone performed less than a performance score of 60. Ensure there are no duplicates. |

## Full Details

### Aggregate Columns (aggregate-columns)

Subject: SQL
Source: `src/curriculum/modules/aggregate-columns/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `expenses`, `quarterlyPerformance`, `transactions`

#### aggregate-max-min-revenue

Version: 1
Referenced tables: `quarterly_performance`

Problem:

Create an overview of all fiscal years and, for each respective fiscal year, the lowest and highest revenue obtained by any asset category in any of its quarters.

Solution:

```sql
SELECT fiscal_year, MIN(revenue) AS min_revenue, MAX(revenue) AS max_revenue
FROM quarterly_performance
GROUP BY fiscal_year;
```

#### aggregate-total-expenses

Version: 1
Referenced tables: `expenses`

Problem:

Create an overview of the IDs of all departments that ever had expenses and, for each respective department, the total expenses incurred.

Solution:

```sql
SELECT d_id, SUM(amount) AS total_expenses
FROM expenses
GROUP BY d_id;
```

#### aggregate-highest-expenses

Version: 1
Referenced tables: `expenses`

Problem:

Create an overview of the IDs of all departments that ever had expenses and, for each respective department, the highest expense it ever incurred.

Solution:

```sql
SELECT d_id, MAX(amount) AS highest_expense
FROM expenses
GROUP BY d_id;
```

### Choose Columns (choose-columns)

Subject: SQL
Source: `src/curriculum/modules/choose-columns/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `transactions`

#### choose-columns-contacts

Version: 1
Referenced tables: `employees`

Problem:

List the first name, last name, email, and phone number of all employees. Ensure that the phone number is called "number" as column name.

Solution:

```sql
SELECT
  first_name,
  last_name,
  email,
  phone AS number
FROM employees;
```

#### choose-columns-department-budgets

Version: 1
Referenced tables: `departments`

Problem:

Retrieve the department ID, department name and budget of all departments. Ensure that the budget is called "available_money" as column name.

Solution:

```sql
SELECT
  d_id,
  d_name,
  budget AS available_money
FROM departments;
```

#### choose-columns-cities

Version: 1
Referenced tables: `employees`

Problem:

Find the list of all cities in which the employees of the company live, without duplicates.

Solution:

```sql
SELECT DISTINCT city
FROM employees;
```

### Filter Rows on Multiple Criteria (filter-rows-on-multiple-criteria)

Subject: SQL
Source: `src/curriculum/modules/filter-rows-on-multiple-criteria/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `expenses`, `transactions`

#### multi-filter-employees-between

Version: 1
Referenced tables: `departments`

Problem:

Retrieve all departments where the number of employees is not between 10 and 20 (inclusive), and whose budget is known.

Solution:

```sql
SELECT *
FROM departments
WHERE nr_employees NOT BETWEEN 10 AND 20
  AND budget IS NOT NULL;
```

#### multi-filter-on-leave

Version: 1
Referenced tables: `contracts`

Problem:

Retrieve all contracts where the employee is either on sick leave or paid leave, and the end date is after 2024.

Solution:

```sql
SELECT *
FROM contracts
WHERE (status = 'paid leave' OR status = 'sick leave')
  AND end_date > '2024-12-31';
```

#### multi-filter-phone-area

Version: 1
Referenced tables: `employees`

Problem:

Retrieve all employees whose phone number starts with 408 and who live in either Mountain View or Santa Clara.

Solution:

```sql
SELECT *
FROM employees
WHERE phone LIKE '408%'
  AND (city = 'Mountain View' OR city = 'Santa Clara');
```

### Filter Rows (filter-rows)

Subject: SQL
Source: `src/curriculum/modules/filter-rows/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `expenses`, `transactions`

#### filter-rows-lt-amount

Version: 1
Referenced tables: `contracts`

Problem:

Retrieve all contracts with performance score under 80.

Solution:

```sql
SELECT *
FROM contracts
WHERE perf_score < 80;
```

#### filter-rows-equal-date

Version: 1
Referenced tables: `contracts`

Problem:

Retrieve all contracts where the start date and end date are the same.

Solution:

```sql
SELECT *
FROM contracts
WHERE start_date = end_date;
```

#### filter-rows-string-like

Version: 1
Referenced tables: `contracts`

Problem:

Retrieve all contracts that have the word "sick" anywhere in the status.

Solution:

```sql
SELECT *
FROM contracts
WHERE status LIKE '%sick%';
```

#### filter-rows-gt-date

Version: 1
Referenced tables: `contracts`

Problem:

Find all contracts for employees that started after 2023.

Solution:

```sql
SELECT *
FROM contracts
WHERE start_date > '2023-12-31';
```

### Join Tables (join-tables)

Subject: SQL
Source: `src/curriculum/modules/join-tables/exercise.tsx`
Accessible tables: `accounts`, `contracts`, `departments`, `employees`, `expenses`, `products`, `transactions`

#### join-managers-hire-date

Version: 1
Referenced tables: `departments`, `employees`

Problem:

Retrieve the department names and manager names (first and last) of all departments whose manager was hired before 2018.

Solution:

```sql
SELECT d_name, first_name, last_name
FROM departments AS d
JOIN employees AS e
ON d.manager_id = e.e_id
WHERE e.hire_date < '2018-01-01';
```

#### join-employee-positions

Version: 1
Referenced tables: `contracts`, `employees`

Problem:

For all employees, make a list of the positions they have had. Give the first name, the last name and the position. A person may have multiple entries in case of multiple positions, but there should be no duplicates. Also include employees who never had a position.

Solution:

```sql
SELECT DISTINCT first_name, last_name, position
FROM employees
NATURAL LEFT JOIN contracts;
```

#### join-employee-leave

Version: 1
Referenced tables: `contracts`, `employees`

Problem:

Create an overview of all sick leaves. More specific: find the names (first and last) of all employees who have been on sick leave. Also include the starting date and ending date of the respective contract in which they had sick leave. (In case of multiple contracts with sick leave, include multiple rows.)

Solution:

```sql
SELECT first_name, last_name, start_date, end_date
FROM employees
NATURAL JOIN contracts
WHERE status = 'sick leave';
```

### Process Columns (process-columns)

Subject: SQL
Source: `src/curriculum/modules/process-columns/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `expenses`, `transactions`

#### process-pay-ratio

Version: 1
Referenced tables: `contracts`

Problem:

For all contracts, retrieve the employee ID, start date, and the ratio of salary to performance score.

Solution:

```sql
SELECT e_id, start_date, salary / perf_score AS pay_ratio
FROM contracts;
```

#### process-budget-per-employee

Version: 1
Referenced tables: `departments`

Problem:

Retrieve the department ID, budget, number of employees, and the budget per employee for all departments.

Solution:

```sql
SELECT d_id, budget, nr_employees,
       budget / nr_employees AS budget_per_employee
FROM departments;
```

#### process-date-flag

Version: 1
Referenced tables: `contracts`

Problem:

For all contracts, retrieve the employee ID and a flag indicating if the start date is after the end date. (The flag is TRUE or 1 when the start date is after the end date, and FALSE or 0 when this is not the case. When any of the dates is NULL, the flag is also NULL.)

Solution:

```sql
SELECT e_id, start_date > end_date AS wrong_info
FROM contracts;
```

### Sort Rows (sort-rows)

Subject: SQL
Source: `src/curriculum/modules/sort-rows/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `expenses`

#### sort-by-perf-salary

Version: 1
Referenced tables: `contracts`

Problem:

Retrieve all contracts, sorted first by performance score ascending, and for equal scores, by salary descending.

Solution:

```sql
SELECT *
FROM contracts
ORDER BY perf_score ASC, salary DESC;
```

#### sort-dept-budget-skip

Version: 1
Referenced tables: `departments`

Problem:

Retrieve 5 departments with the smallest budgets, skipping the first 3. Put departments with unknown budget at the end.

Solution:

```sql
SELECT *
FROM departments
ORDER BY budget ASC NULLS LAST
LIMIT 5 OFFSET 3;
```

#### sort-end-date-null-last

Version: 1
Referenced tables: `contracts`

Problem:

Retrieve all contracts of all employees, ordered by end date with later end dates shown first. Put everyone with an unlimited contract at the start.

Solution:

```sql
SELECT *
FROM contracts
ORDER BY end_date DESC NULLS FIRST;
```

### Use Filtered Aggregation (use-filtered-aggregation)

Subject: SQL
Source: `src/curriculum/modules/use-filtered-aggregation/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `expenses`, `quarterlyPerformance`, `transactions`

#### filtered-aggregation-perf-range

Version: 1
Referenced tables: `contracts`

Problem:

Create an overview of all employees (their IDs) and their lowest and highest performance score ever obtained since January 1st, 2020 (going by contract end date). Limit the output to fluctuating employees: those where the difference between the lowest and highest score in this time period exceeds 40.

Solution:

```sql
SELECT 
  e_id,
  MIN(perf_score) AS lowest_score,
  MAX(perf_score) AS highest_score
FROM contracts
WHERE end_date >= '2020-01-01'
GROUP BY e_id
HAVING MAX(perf_score) - MIN(perf_score) > 40;
```

#### filtered-aggregation-rejected-tx

Version: 1
Referenced tables: `transactions`

Problem:

Create an overview of all vendors (their usernames), their total number of transactions with price larger than ten million, and the number of these that were rejected. Limit the output to those vendors with more than three such rejected large transactions.

Solution:

```sql
SELECT 
  vendor,
  COUNT(*) AS total_tx,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_tx
FROM transactions
WHERE price > 10000000
GROUP BY vendor
HAVING SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) > 3;
```

#### filtered-aggregation-product-revenue

Version: 1
Referenced tables: `transactions`

Problem:

Create an overview of all products (their IDs), the number of incomplete transactions, and the total revenue from those incomplete transactions. Limit the output to those products whose average transaction value at these incomplete transactions is less than one million.

Solution:

```sql
SELECT 
    prod_id,
    COUNT(*) AS tx_count,
    SUM(price) AS revenue
FROM transactions
WHERE status <> 'completed'
GROUP BY prod_id
HAVING AVG(price) < 1000000;
```

### Write Look-up Query (write-look-up-query)

Subject: SQL
Source: `src/curriculum/modules/write-look-up-query/exercise.tsx`
Accessible tables: `accounts`, `contracts`, `departments`, `employees`, `expenses`, `transactions`

#### lookup-manager-city

Version: 1
Referenced tables: `departments`, `employees`

Problem:

Find the names of the departments whose manager lives in Palo Alto.

Solution:

```sql
SELECT d_name
FROM departments
WHERE manager_id IN (
    SELECT e_id
    FROM employees
    WHERE city = 'Palo Alto'
);
```

#### lookup-employee-position

Version: 1
Referenced tables: `contracts`, `employees`

Problem:

Find the first and last name of all employees that have ever worked as a warehouse associate.

Solution:

```sql
SELECT first_name, last_name
FROM employees
WHERE e_id IN (
    SELECT e_id
    FROM contracts
    WHERE position = 'warehouse associate'
);
```

#### lookup-manager-sick

Version: 1
Referenced tables: `contracts`, `departments`

Problem:

Find the names of the departments whose manager has at some point been on sick leave.

Solution:

```sql
SELECT d_name
FROM departments
WHERE manager_id IN (
    SELECT e_id
    FROM contracts
    WHERE status = 'sick leave'
);
```

### Write Multi-Criterion Query (write-multi-criterion-query)

Subject: SQL
Source: `src/curriculum/modules/write-multi-criterion-query/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `expenses`, `transactions`

#### multi-criterion-start-date-range

Version: 1
Referenced tables: `contracts`

Problem:

Retrieve the first 10 employees (their ID, start date, position and performance score) whose start date falls between January 1 and September 30 of 2025 (inclusive), sorted by start date.

Solution:

```sql
SELECT e_id, start_date, position, perf_score
FROM contracts
WHERE start_date BETWEEN '2025-01-01' AND '2025-09-30'
ORDER BY start_date
LIMIT 10;
```

#### multi-criterion-work-status-active

Version: 1
Referenced tables: `contracts`

Problem:

Retrieve the employee ID, status, and monthly salary of employees whose status is active and whose monthly salary is either above 10,000 or below 1,000.

Solution:

```sql
SELECT e_id, status, salary / 12 AS monthly_salary
FROM contracts
WHERE status = 'active'
  AND (salary / 12 > 10000 OR salary / 12 < 1000);
```

#### multi-criterion-departments-expenditure

Version: 1
Referenced tables: `departments`

Problem:

Retrieve an overview of department names and their budget per employee, sorted from highest to lowest. Exclude the departments of Human Resources, Customer Support and Public Relations in this overview.

Solution:

```sql
SELECT d_name AS name,
       budget / nr_employees AS expenditure
FROM departments
WHERE d_name NOT IN ('Human Resources', 'Customer Support', 'Public Relations')
ORDER BY expenditure DESC;
```

### Write Multi-Layered Query (write-multi-layered-query)

Subject: SQL
Source: `src/curriculum/modules/write-multi-layered-query/exercise.tsx`
Accessible tables: `accounts`, `allocations`, `contracts`, `departments`, `employees`, `expenses`, `products`, `quarterlyPerformance`, `transactions`

#### multilayered-mock-dept-expense

Version: 1
Referenced tables: `departments`, `dept_budget`, `dept_expenses`, `expenses`

Problem:

Retrieve the id, budget and total amount spent of all the departments whose total recorded expenses never exceeded their allocated budget.

Solution:

```sql
WITH dept_expenses AS (
	SELECT d_id, SUM(amount) AS total_spent
	FROM expenses
	GROUP BY d_id
),
dept_budget AS (
	SELECT d_id, budget
	FROM departments
)
SELECT b.d_id, b.budget, e.total_spent
FROM dept_budget b
JOIN dept_expenses e ON b.d_id = e.d_id
WHERE e.total_spent <= b.budget
```

#### multilayered-mock-buyer-vendor

Version: 1
Referenced tables: `buyer_totals`, `transactions`, `vendor_totals`

Problem:

Identify the username, amount spent and amount earned, for all users whose total revenue as vendor exceeds their total spending as buyer.

Solution:

```sql
WITH vendor_totals AS (
    SELECT vendor AS username, SUM(price) AS earned
    FROM transactions
    GROUP BY vendor
  ),
  buyer_totals AS (
    SELECT buyer AS username, SUM(price) AS spent
    FROM transactions
    GROUP BY buyer
  )
  SELECT v.username, v.earned, b.spent
  FROM vendor_totals v
  JOIN buyer_totals b ON v.username = b.username
  WHERE v.earned > b.spent;
```

#### multilayered-wrong-employee-counts

Version: 1
Referenced tables: `allocations`, `departments`, `emp_alloc_count`, `employees`, `single_alloc_per_dept`, `single_allocations`, `total_allocations`

Problem:

The employee count in the departments table seems to be inflated. Create an overview containing the department name, the number of employees as mentioned in the departments table, the total number of employees allocated to the department, the total number of employees that are ONLY allocated to this department, and the first and last name of the department manager. Only show those rows for departments where the difference between the estimated number of employees and the number of employees only allocated to this department is larger than 3.

Solution:

```sql
WITH emp_alloc_count AS (
	SELECT e_id, COUNT(d_id) AS alloc_count
	FROM allocations
	GROUP BY e_id
),
single_allocations AS (
	SELECT a.e_id, a.d_id
	FROM allocations a
	JOIN emp_alloc_count c ON a.e_id = c.e_id
	WHERE c.alloc_count = 1
),
total_allocations AS (
	SELECT d_id, COUNT(e_id) AS total_allocated
	FROM allocations
	GROUP BY d_id
),
single_alloc_per_dept AS (
	SELECT d_id, COUNT(e_id) AS only_allocated
	FROM single_allocations
	GROUP BY d_id
)
SELECT 
    d.d_name,
    d.nr_employees AS estimated_employees,
    ta.total_allocated,
    COALESCE(sa.only_allocated, 0) AS only_in_this_department,
    m.first_name,
    m.last_name
FROM departments d
JOIN total_allocations ta ON d.d_id = ta.d_id
JOIN single_alloc_per_dept sa ON d.d_id = sa.d_id
JOIN employees m ON d.manager_id = m.e_id
WHERE d.nr_employees - COALESCE(sa.only_allocated, 0) > 3;
```

### Write Multi-Table Query (write-multi-table-query)

Subject: SQL
Source: `src/curriculum/modules/write-multi-table-query/exercise.tsx`
Accessible tables: `accounts`, `allocations`, `contracts`, `departments`, `employees`, `expenses`, `products`, `transactions`

#### multitable-mock-join-le

Version: 1
Referenced tables: `accounts`, `products`, `transactions`

Problem:

List the email addresses of unverified accounts who have bought a product for less than half of its estimated value.

Solution:

```sql
SELECT email
FROM accounts
WHERE email_verified = FALSE AND username IN (
  SELECT t.buyer
  FROM products AS p
  JOIN transactions AS t
  ON t.prod_id = p.p_id
  WHERE t.price < 0.5*p.est_value
)
```

#### multitable-mock-in-notin

Version: 1
Referenced tables: `accounts`, `products`, `transactions`

Problem:

Find the first name and last name of accounts who appear as buyers in transactions related to "Musical Instruments" products, but never sold anything (of any type).

Solution:

```sql
SELECT first_name, last_name
FROM accounts
WHERE username IN (
	SELECT buyer
	FROM transactions
  WHERE prod_id IN (
    SELECT p_id
    FROM products
    WHERE category = 'Musical Instruments'
  )
) AND username NOT IN (
	SELECT vendor
	FROM transactions
)
```

#### multitable-mock-intersect

Version: 1
Referenced tables: `products`, `transactions`

Problem:

Retrieve the usernames of all users who have at some point bought one or more products from the "Fine Art" category, and who also appear as owners of products categorized as "Designer Fashion".

Solution:

```sql
SELECT DISTINCT buyer
FROM transactions
WHERE prod_id IN (
	SELECT p_id
	FROM products
	WHERE category = 'Fine Art'
)
INTERSECT
SELECT DISTINCT owned_by
FROM products
WHERE category = 'Designer Fashion'
```

#### multitable-universal-query

Version: 1
Referenced tables: `employees`, `products`, `transactions`

Problem:

Find the product categories of which all transactions have been validated by employees whose current salary is less than 200000.

Solution:

```sql
SELECT DISTINCT category FROM products
EXCEPT
SELECT DISTINCT category FROM products WHERE p_id IN (
  SELECT prod_id FROM transactions WHERE validated_by IN (
    SELECT e_id FROM employees WHERE current_salary >= 200000
  )
)
```

### Write Single-Criterion Query (write-single-criterion-query)

Subject: SQL
Source: `src/curriculum/modules/write-single-criterion-query/exercise.tsx`
Accessible tables: `contracts`, `departments`, `employees`, `expenses`, `transactions`

#### unknown-budget

Version: 1
Referenced tables: `departments`

Problem:

Find the ID and name of all the departments whose budget is not known.

Solution:

```sql
SELECT d_id, d_name
FROM departments
WHERE budget IS NULL;
```

#### large-earners

Version: 1
Referenced tables: `employees`

Problem:

Find the first and last names of all the employees who currently earn more than 150,000. Ensure there are no duplicates.

Solution:

```sql
SELECT DISTINCT first_name, last_name
FROM employees
WHERE current_salary > 150000;
```

#### tough-positions

Version: 1
Referenced tables: `contracts`

Problem:

Find all the job positions where at some point someone performed less than a performance score of 60. Ensure there are no duplicates.

Solution:

```sql
SELECT DISTINCT position
FROM contracts
WHERE perf_score < 60;
```
