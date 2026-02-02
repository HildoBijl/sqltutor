import { Page, Section, ISQL, Par, Warning, Info, Term, Em } from '@/components';

import { FigureExampleQuery } from '@/curriculum/utils/queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>To use <Term>aggregation</Term> in SQL, add one or more <Term>aggregation functions</Term> to the <ISQL>SELECT</ISQL> part of a query. This turns it into an <Term>aggregated query</Term>, which means SQL will squash multiple rows into one or more <Term>aggregated statistics</Term>.</Par>
      <FigureExampleQuery query={`
SELECT
  SUM(revenue) AS total_revenue,
  MAX(revenue) AS highest_revenue,
  COUNT(revenue) AS num_quarters
FROM quarterly_performance;`} tableWidth={320} />

      <Par>Common aggregation functions include <ISQL>SUM</ISQL>, <ISQL>MAX</ISQL>, <ISQL>MIN</ISQL>, <ISQL>AVG</ISQL> and <ISQL>COUNT</ISQL>.</Par>
      <Info>Aggregation functions ignore <ISQL>NULL</ISQL> values: those are removed from a column <Em>before</Em> running the aggregation function.</Info>
      <Par>To set up <Term>grouped aggregation</Term>, add a <ISQL>GROUP BY</ISQL> statement (after the <ISQL>FROM</ISQL> clause) to specify one or more <Term>grouping columns</Term>. Rows are first grouped by equal grouping columns. Aggregation is then performed separately within each group.</Par>
      <FigureExampleQuery query={`
SELECT
  fiscal_year,
  SUM(revenue) AS total_revenue,
  MAX(revenue) AS highest_revenue,
  COUNT(revenue) AS num_quarters
FROM quarterly_performance
GROUP BY fiscal_year;`} tableWidth={400} />
      <Warning>When using an aggregated query, the <ISQL>SELECT</ISQL> clause may <Em>only</Em> contain columns from the <ISQL>GROUP BY</ISQL> clause and results from aggregation functions.</Warning>
    </Section>
  </Page>;
}
