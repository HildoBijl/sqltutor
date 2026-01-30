import { Page, Par, Quote, Section, Warning, Info, Term, Em, ISQL, Link } from '@/components';

import { FigureExampleQuery } from '@/curriculum/utils/queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to write basic queries for single tables. But tables are often linked to other tables through foreign keys. In SQL we can write queries involving multiple tables at the same time. Let's study a basic case, where we look up values from one table, based on a condition from another table.</Par>
    </Section>

    <Section title={<>Set up a look-up query using <ISQL>IN</ISQL></>}>
      <Par>Let's consider the employees and departments of a company. Suppose that we are told to gather the following data.</Par>
      <Quote>Find the IDs and names of all the managers who manage a department with more than ten employees.</Quote>
      <Par>To do so, we can first look at the departments and see which ones qualify.</Par>
      <FigureExampleQuery query={`SELECT *
FROM departments
WHERE nr_employees > 10;`} tableWidth={500} />
      <Par>After having filtered for the number of employees, we actually only care about the manager IDs. So we extract those.</Par>
      <FigureExampleQuery query={`SELECT manager_id
FROM departments
WHERE nr_employees > 10;`} tableWidth={100} />
      <Par>We now want to look up the names of the employees whose ID is <Em>in</Em> this list. But how can we do this? Exactly for this situation, SQL has the keyword <ISQL>IN</ISQL>. We can use it as shown.</Par>
      <FigureExampleQuery query={`SELECT e_id, first_name, last_name
FROM employees
WHERE e_id IN (
  SELECT manager_id
  FROM departments
  WHERE nr_employees > 10
);`} tableWidth={260} />
      <Par>Note that this query consists of an <Term>inner query</Term> and an <Term>outer query</Term>. To run the query, the DBMS first runs the inner query to find the list of manager IDs. It then runs the outer query, and for every row it checks if the employee ID is in the given list.</Par>
      <Warning>It is crucial to select the right (number of) columns in the inner query. If the attribute in front of <ISQL>IN</ISQL> is only one attribute, as in the example, then the inner query should export one column. Or similarly if there are two attributes in front of <ISQL>IN</ISQL> (like for instance in <ISQL>WHERE (first_name, last_name) IN (...)</ISQL>) then the inner query should select two columns. (The column names don't matter here. Only their order.)</Warning>
      <Info>Instead of using <ISQL>IN</ISQL> we can use <ISQL>NOT IN</ISQL> to find the names of all the managers whose ID is <Em>not</Em> in the given list.</Info>
    </Section>

    <Section title={<>Check conditions using <ISQL>EXISTS</ISQL></>}>
      <Par>We could have done the above task in a different way. We could rephrase the task to the following.</Par>
      <Quote>Find the IDs and names of all employees for which there exists a department with more than ten employees which they are the manager of.</Quote>
      <Par>Note that this comes down to exactly the same. Based on this rationale, we can set up the following query.</Par>
      <FigureExampleQuery query={`SELECT e_id, first_name, last_name
FROM employees
WHERE EXISTS (
  SELECT *
  FROM departments
  WHERE employees.e_id = departments.manager_id
    AND nr_employees > 10
);`} tableWidth={260} />
      <Par>There are two new things in this query. Most importantly, we now have an inner query that <Em>uses</Em> a table from the outer query. When this is the case, we call it a <Term>correlated query</Term>. (Contrary to the <Term>non-correlated query</Term> from before.)</Par>
      <Info>Within SQL, inner queries may always use tables from outer queries. The opposite is not true: outer queries may <Em>never</Em> use tables from inner queries. Such a query would also make no sense, so you likely won't be tempted to do so.</Info>
      <Par>When the DBMS receives a correlated query, it <Em>cannot</Em> first evaluate the inner query. Instead, it will start with the outer query, and for <Em>every</Em> row of the outer query, it runs the inner query. It then evaluates whatever condition is given.</Par>
      <Par>In this case the condition uses the keyword <ISQL>EXISTS</ISQL> (the second new thing in the query). This keyword resolves to <ISQL>TRUE</ISQL> if the given inner query returns <Em>any</Em> (non-zero) number of rows. On zero rows, it resolves as <ISQL>FALSE</ISQL>. So effectively, the above query checks for every employee whether there <Em>exists</Em> a department whose manager equals the employee's ID and which has at least ten employees.</Par>
      <Info>When using <ISQL>EXISTS</ISQL>, the contents of the rows are not important. To not require the DBMS to look up unnecessary data, people often don't use <ISQL>SELECT *</ISQL> (extract all columns) but use <ISQL>SELECT 1</ISQL> (extract a single column whose value always equals 1). It's a simple yet tiny performance improvement.</Info>
      <Warning>Keep in mind that correlated queries run the inner query multiple times. Non-correlated queries run the inner query only once. For larger tables, correlated queries can be slow. In many use cases, using some clever insights, you can rewrite a correlated query as a non-correlated query, improving performance. But in other use cases this may not be possible, and a correlated query is the only option.</Warning>
    </Section>

    <Section title={<>Compare rows with looked-up values</>}>
      <Par>We can also use looked-up <Em>values</Em> for comparisons. Consider the following request.</Par>
      <Quote>Find employee IDs and positions of all the people who at some point earned more than the current salary of Elvis Vallelonga (ID <ISQL>41651199</ISQL>).</Quote>
      <Par>To do this, we first have to find the respective salary from the <ISQL>employees</ISQL> table.</Par>
      <FigureExampleQuery query={`SELECT current_salary
FROM employees
WHERE e_id = 41651199;`} tableWidth={120} />
      <Par>Then we go through all the contracts in <ISQL>emp_data</ISQL> to find which ones had a higher salary. That can be done through the following query.</Par>
      <FigureExampleQuery query={`SELECT DISTINCT e_id, position
FROM emp_data
WHERE salary > (
  SELECT current_salary
  FROM employees
  WHERE e_id = 41651199
);`} tableWidth={260} />
      <Par>This works because the inner query returns a table with only one column and one row: it gives a single value.</Par>
      <Par>If we want to compare against <Em>multiple</Em> values, we can use the <ISQL>ANY</ISQL>/<ISQL>SOME</ISQL> and <ISQL>ALL</ISQL> keywords. (The keywords <ISQL>ANY</ISQL> and <ISQL>SOME</ISQL> do the exact same thing.) Consider for instance the following request.</Par>
      <Quote>Find the names of all employees who currently earn more than any current or past salary of Elvis Vallelonga (ID <ISQL>41651199</ISQL>).</Quote>
      <Par>We can find the current and past salaries through the <ISQL>emp_data</ISQL> table.</Par>
      <FigureExampleQuery query={`SELECT salary
FROM emp_data
WHERE e_id = 41651199 AND salary IS NOT NULL;`} tableWidth={260} />
      <Par>If we require some value to be bigger than <Em>all</Em> of these values, we use the <ISQL>ALL</ISQL> keyword.</Par>
      <FigureExampleQuery query={`SELECT first_name, last_name, current_salary
FROM employees
WHERE current_salary > ALL (
  SELECT salary
  FROM emp_data
  WHERE e_id = 41651199 AND salary IS NOT NULL
);`} actualQuery={`SELECT first_name, last_name, current_salary
FROM employees
WHERE current_salary > (
  SELECT MAX(salary)
  FROM emp_data
  WHERE e_id = 41651199 AND salary IS NOT NULL
);`} tableWidth={260} />
      <Warning>The <ISQL>ANY</ISQL>/<ISQL>SOME</ISQL> and <ISQL>ALL</ISQL> keywords work in nearly all DBMSs, but sadly not in SQLite. Since we use SQLite on SQL Valley, we cannot use those keywords on this site. Luckily there are various alternatives to do the same thing, for instance through <Link to="/skill/aggregate-columns">aggregation</Link>.</Warning>
    </Section>
  </Page>
}
