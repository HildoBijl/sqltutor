import { Page, Par, List, Section, Info, Warning, Term, Em, ISQL } from '@/components';

import { FigureSingleTable, FigureExampleQuery } from '@/curriculum/utils/queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to select columns with SQL. But how can we <Term>aggregate</Term> columns using SQL? Let's study that, first for full tables and then for groups within tables.</Par>
    </Section>

    <Section title="Aggregate columns using an aggregation function">
      <Par>Let's consider the financial performance of the company per quarter. How can we extract the total revenue throughout the years from this table?</Par>
      <FigureSingleTable query={`SELECT * FROM quarterly_performance`} tableScale={0.8} tableWidth={800} />
      <Par>To get the total revenue, we have to add up all the values from the <Em>revenue</Em> column. We can do this through the <Term>aggregation function</Term> <ISQL>SUM</ISQL>.</Par>
      <FigureExampleQuery query={`
SELECT SUM(revenue)
FROM quarterly_performance;`} tableWidth={160} />
      <Par>When SQL finds an aggregation function in the <ISQL>SELECT</ISQL> part, it realizes the query is an <Term>aggregation query</Term>. This means multiple rows will be squashed together into a single value.</Par>
      <Warning>
        <Par sx={{ mb: 1 }}>Whenever we set up an aggregated query (a query that uses an aggregation function), SQL <Em>will</Em> squash rows together. In this case, <Em>do not</Em> select regular columns in the query too. Most DBMSs would throw an error, while some more forgiving DBMSs just pick <Em>any</Em> row they can find, without any guarantees on which one.</Par>
        <FigureExampleQuery query={`
SELECT
  quarter,
  fiscal_year,
  revenue,
  SUM(revenue)
FROM quarterly_performance;`} tableWidth={340} /></Warning>
    </Section>

    <Section title="Use multiple aggregation functions">
      <Par>SQL has a variety of aggregation functions. The most commonly used ones are the following.</Par>
      <List items={[
        <><ISQL>SUM</ISQL>: finds the <Term>total (sum)</Term> of all the given values in the column.</>,
        <><ISQL>MAX</ISQL>: finds the <Term>highest</Term> value of the column.</>,
        <><ISQL>MIN</ISQL>: finds the <Term>lowest</Term> value of the column.</>,
        <><ISQL>COUNT</ISQL>: finds the <Term>number</Term> of rows within the column.</>,
        <><ISQL>AVG</ISQL>: finds the <Term>average</Term> value of the column. (So this is the <ISQL>SUM</ISQL> divided by the <ISQL>COUNT</ISQL>.)</>,
      ]} />
      <Par>We can use multiple aggregation functions at the same time. When doing so, it is recommended to give them descriptive names.</Par>
      <FigureExampleQuery query={`
SELECT
  MAX(revenue) AS highest_revenue,
  AVG(revenue) AS average_revenue,
  COUNT(revenue) AS num_quarters
FROM quarterly_performance;`} tableWidth={320} />
      <Info>
        <Par>Whenever aggregation functions encounter <ISQL>NULL</ISQL> values, they generally <Em>ignore</Em> them. Any <ISQL>NULL</ISQL> values are first removed, and <Em>only then</Em> will aggregation be applied. Aggregation functions only return <ISQL>NULL</ISQL> when <Em>all</Em> values in the column equal <ISQL>NULL</ISQL>. So as examples ...</Par>
        <List sx={{ my: 0.5 }} items={[
          <><ISQL>SUM(revenue)</ISQL> gives the sum of all non-<ISQL>NULL</ISQL> revenue values.</>,
          <><ISQL>COUNT(revenue)</ISQL> counts the number of entries in the "revenue" column that are not <ISQL>NULL</ISQL>.</>,
        ]} />
        <Par>To find the number of rows in the table, irrespective of <ISQL>NULL</ISQL> values, use <ISQL>COUNT(*)</ISQL> instead.</Par>
      </Info>
    </Section>

    <Section title="Group rows before aggregating">
      <Par>Aggregation becomes a lot more powerful when grouping is introduced. To set up <Term>grouped aggregation</Term> in SQL, add a <ISQL>GROUP BY</ISQL> statement right after <ISQL>FROM</ISQL> and specify one or more column names to group by. This causes the rows to first be grouped by equal grouping columns. Aggregation is then performed separately within each group.</Par>
      <FigureExampleQuery query={`
SELECT
  fiscal_year,
  MAX(revenue) AS highest_revenue,
  AVG(revenue) AS average_revenue,
  COUNT(revenue) AS num_quarters
FROM quarterly_performance
GROUP BY fiscal_year;`} tableWidth={480} />
      <Par>We could add multiple grouping columns, separated by commas. For our example that's not so useful, but if the table for instance had multiple entries per quarter (like one for each month) then a grouping by quarter <Em>would</Em> make sense.</Par>
      <FigureExampleQuery query={`
SELECT
  fiscal_year,
  quarter,
  MAX(revenue) AS highest_revenue,
  AVG(revenue) AS average_revenue,
  COUNT(revenue) AS num_quarters
FROM quarterly_performance
GROUP BY fiscal_year, quarter;`} tableWidth={480} />
      <Info>Earlier we saw that we should not add regular columns to a <ISQL>SELECT</ISQL> statement when using aggregation. Grouping is an exception: when we group by certain columns, then we <Em>can</Em> add these grouping columns to our <ISQL>SELECT</ISQL> statement. In fact, it's very helpful to do so, to get sensible data! After all, the above tables wouldn't make sense if we didn't show the "year" in them.</Info>
    </Section>
  </Page>;
}
