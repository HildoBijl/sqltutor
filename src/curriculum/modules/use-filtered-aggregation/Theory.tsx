import { Page, Par, Section, Warning, Term, Em, ISQL } from '@/components';

import { FigureSingleTable, FigureExampleQuery } from '@/curriculum/utils/queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to aggregate columns using SQL, and we know how to apply filters. It is of course also possible to do both. However, there's an important distinction between applying a filter <Em>before</Em> and applying a filter <Em>after</Em> aggregation. Let's take a look at how it works.</Par>
    </Section>

    <Section title={<>Filter rows before aggregating using <ISQL>WHERE</ISQL></>}>
      <Par>Let's consider the financial performance of the company per quarter.</Par>
      <FigureSingleTable query={`SELECT * FROM quarterly_performance`} tableScale={0.8} tableWidth={800} />
      <Par>Suppose that we want to get the average revenue for the <Em>first half</Em> of each year (January through June). How would we do that?</Par>
      <Par>The key is to add a <ISQL>WHERE</ISQL> clause to select the rows that we want, throwing out the ones that we don't. So we start with </Par>
      <FigureExampleQuery query={`
SELECT *
FROM quarterly_performance
WHERE quarter <= 2;`} tableScale={0.8} tableWidth={800} below />
      <Par>Then we apply aggregation to this new table in the usual way. SQL will group the rows, calculate aggregates, and generate the output.</Par>
      <FigureExampleQuery query={`
SELECT fiscal_year, AVG(revenue) AS average_revenue_q12
FROM quarterly_performance
WHERE quarter <= 2
GROUP BY fiscal_year;`} tableScale={0.8} tableWidth={220} />
      <Par>Note that <ISQL>GROUP BY</ISQL> is written <Em>after</Em> the <ISQL>WHERE</ISQL> clause. This is to signify that the grouping (and subsequently the aggregation) is done <Em>after</Em> running the <ISQL>WHERE</ISQL> clause.</Par>
    </Section>

    <Section title={<>Filter rows after aggregating using <ISQL>HAVING</ISQL></>}>
      <Par>Suppose that we only care about the years whose average revenue in quarters 1 and 2 exceeded five million. In this case, we want to apply a filter to the <Em>aggregated</Em> table. Specifically, we want to filter on the new column "average_revenue_q12".</Par>
      <Par>The long and inconvenient way to do so, would be through a <Term>subquery</Term>.</Par>
      <FigureExampleQuery query={`
SELECT *
FROM (
  SELECT fiscal_year, AVG(revenue) AS average_revenue_q12
  FROM quarterly_performance
  WHERE quarter <= 2
  GROUP BY fiscal_year
) 
WHERE average_revenue_q12 > 5000000;`} tableScale={0.8} tableWidth={220} />
      <Par>Note that we took our aggregated table and treated it as a new table. It works, but it's a bit cumbersome, and since this is a use-case that occurs often in practice, SQL has a cleaner solution. We add a <ISQL>HAVING</ISQL> clause <Em>after</Em> the <ISQL>GROUP BY</ISQL> clause.</Par>
      <FigureExampleQuery query={`
SELECT fiscal_year, AVG(revenue) AS average_revenue_q12
FROM quarterly_performance
WHERE quarter <= 2
GROUP BY fiscal_year
HAVING AVG(revenue) > 5000000;`} tableScale={0.8} tableWidth={220} />
      <Par>This does the exact same thing, and it looks a lot cleaner!</Par>

      <Par>The <ISQL>HAVING</ISQL> clause works identically to the <ISQL>WHERE</ISQL> clause: you can set up any filter you like. However, keep in mind that the <ISQL>HAVING</ISQL> clause operates on the <Em>aggregated</Em> table. Just as within the <ISQL>SELECT</ISQL> clause, you may only use <Em>grouping columns</Em> and the <Em>results of aggregated functions</Em> within the filter. You cannot refer to the original columns, like "quarter" or similar, as those are not available anymore. (And doing so would also make no sense.)</Par>
      <Warning>
        <Par sx={{ mb: 1 }}>You may be wondering why we wrote <ISQL>{`HAVING AVG(revenue) > 5000000`}</ISQL> rather than <ISQL>{`HAVING average_revenue_q12 > 5000000`}</ISQL>. The latter would be clearer!</Par>
        <Par sx={{ mb: 1 }}>The problem here is the evaluation order that SQL uses. The <ISQL>SELECT</ISQL> clause (and with that the creation of the "average_revenue_q12" alias) is only run <Em>after</Em> the <ISQL>HAVING</ISQL> clause. So at the <ISQL>HAVING</ISQL> clause, the name "average_revenue_q12" does not exist yet! Most DBMSs will throw an error if you try to use an alias in your <ISQL>HAVING</ISQL> clause. Some DBMSs, like SQLite, do allow it through a work-around, but it's still not recommended.</Par>
        <Par>The solution is to write the same calculation again. It's not ideal, but it works. And you can of course use any other aggregation functions within the <ISQL>HAVING</ISQL> clause too, even ones that you don't use in the <ISQL>SELECT</ISQL> clause.</Par>
      </Warning>
    </Section>

    <Section title="Use further aggregation possibilities">
      <Par>Now that we're getting skilled at using aggregations, it's worthwhile to look at a few more creative possibilities of using aggregation.</Par>

      <Par>It is common to <Term>preprocess values before aggregation</Term>. Suppose that we want to find the average budget per employee for all departments. Then we first calculate the budget per employee for each department, and subsequently find their average.</Par>
      <FigureExampleQuery query={`
SELECT AVG(budget / nr_employees) AS average_budget_per_employee_ratio
FROM departments;`} tableScale={0.8} tableWidth={220} />
      <Par>Note that we perform arithmetics, running a calculation for every row, <Em>before</Em> doing the aggregation. We can also do further preprocessing, like using <ISQL>COALESCE</ISQL> to set up a fallback value in case of <ISQL>NULL</ISQL> values. The <ISQL>CASE WHEN ... THEN</ISQL> function provides even more possibilities.</Par>

      <Par>Another common thing to do is using the results of aggregated functions: we <Term>process values after aggregation</Term>. Suppose that we want to get an overview of the cities where employees live, how many people live there, and most of all <Em>which percentage</Em> of the total live in each city.</Par>
      <FigureExampleQuery query={`
SELECT
  city,
  COUNT(*) AS num_people,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees) AS percentage
FROM employees
GROUP BY city;`} tableScale={0.8} tableWidth={320} />
      <Par>Note that we have casually included a subquery within our calculations. SQL also allows that. After all, the subquery returns a single number, which can be used to calculate with.</Par>
    
      <Par>Though not as common, it's also possible to <Term>aggregate text</Term>. Most aggregation functions like <ISQL>SUM</ISQL> and <ISQL>AVG</ISQL> don't work for text, but a few are still relevant.</Par>
      <FigureExampleQuery query={`
SELECT
  MIN(d_name) AS first_in_alphabet,
  MAX(d_name) AS last_in_alphabet
FROM departments;`} tableScale={0.8} tableWidth={250} />

      <Par>One particular function that is useful in aggregating text is the <Term>string concatenation</Term> command. It concatenates all the values within a column, adding a separator in-between. It varies per DBMS what it's called: <ISQL>STRING_AGG</ISQL>, <ISQL>GROUP_CONCAT</ISQL>, or <ISQL>LISTAGG</ISQL>. We can for instance make a list of four-letter codes for each department.</Par>
      <FigureExampleQuery query={`
SELECT GROUP_CONCAT(SUBSTRING(d_name, 1, 4), " - ") AS department_codes
FROM departments;`} tableScale={0.8} tableWidth={200} />
      <Par>Admittedly, it's not the most sensible use-case, but the idea is clear: a <Em>lot</Em> is possible. The above examples are only the tip of the iceberg.</Par>
    </Section>
  </Page>;
}
