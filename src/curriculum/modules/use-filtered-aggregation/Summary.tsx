import { Page, Section, ISQL, Par, List, Warning, Info, Em } from '@/components';

import { FigureExampleQuery } from '@/curriculum/utils/queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>Aggregation can be combined with filtering.</Par>
      <List items={[
        <>To filter rows <Em>before</Em> aggregation is applied, use a <ISQL>WHERE</ISQL> clause <Em>before</Em> <ISQL>GROUP BY</ISQL>. It operates on the original table.</>,
        <>To filter rows <Em>after</Em> aggregation is applied, use a <ISQL>HAVING</ISQL> clause <Em>after</Em> <ISQL>GROUP BY</ISQL>. It operates on the aggregated table.</>,
      ]} />
      <Info>You may <Em>not</Em> use columns from the original table in the <ISQL>HAVING</ISQL> filter, other than those given at <ISQL>GROUP BY</ISQL>. You <Em>can</Em> use additional aggregation functions.</Info>
      <FigureExampleQuery query={`
SELECT fiscal_year, AVG(revenue) AS average_revenue_q12
FROM quarterly_performance
WHERE quarter <= 2
GROUP BY fiscal_year
HAVING AVG(revenue) > 5000000;`} tableScale={0.8} tableWidth={220} />
      <Warning>In most DBMSs you <Em>cannot</Em> use the aliases defined in the <ISQL>SELECT</ISQL> clause within the <ISQL>HAVING</ISQL> clause. This means you may have to repeat calculations.</Warning>
      <Par>When using aggregation, it is common to process values. This processing can happen both before and after aggregation.</Par>
      <FigureExampleQuery query={`
SELECT
  city,
  ROUND(AVG(current_salary / 12)) AS mean_monthly_salary,
  COUNT(*) AS nr_employees,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees) AS percentage
FROM employees
GROUP BY city;`} tableScale={0.8} tableWidth={440} />
    </Section>
  </Page>;
}
