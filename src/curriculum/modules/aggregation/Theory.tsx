import { Page, Section, Par, List, Info, Term, Em } from '@/components';

import { FigureSingleTable } from '@/curriculum/utils/queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We have seen various table operations like projection and filtering. A more special type of operation is <Term>aggregation</Term>. Let's study how it works.</Par>
    </Section>

    <Section title="Aggregation: combine multiple rows into a single value">
      <Par>Let's dive into the financial data. Let's consider the financial performance of the company per quarter.</Par>
      <FigureSingleTable query={`SELECT * FROM quarterly_performance`} tableScale={0.8} tableWidth={800} />
      <Par>Based on this table, we can find general statistics for the entire period we kept financial records. Think of ...
      </Par>
      <List items={[
        <>The <Term>total</Term> (summed) revenue.</>,
        <>The <Term>average</Term> revenue per quarter.</>,
        <>The <Term>highest</Term>/<Term>lowest</Term> revenue for any quarter.</>,
        <>Or something as simple as the <Term>number of quarters</Term> for which we tracked the finances.</>,
      ]} />
      <Par>To find any of these quantities, we need to take <Em>multiple</Em> rows and combine their data to find a <Em>single</Em> value. This idea of combining multiple rows to find a single value that says something about all respective rows is called <Term>aggregation</Term>.</Par>
      <Info>Aggregation is usually performed on <Em>numeric</Em> values. In theory aggregation can also be performed on <Em>text</Em> values. Given a column with for example email addresses, we could aggregate this into a single piece of text containing all email addresses, or we could calculate the maximum length of all email addresses, or anything else. <Em>Any</Em> operation that combines multiple rows into a single value is considered aggregation.</Info>
    </Section>

    <Section title="Grouped aggregation: aggregate groups of rows">
      <Par>We could apply aggregation to a <Em>full</Em> table, to turn the whole table into a few statistics. However, it is more common to first split the table up into <Term>groups</Term>. We could for instance check out the financial records per year. Then, for <Em>each year</Em>, we would find statistics like the total/average/highest revenue.</Par>
      <FigureSingleTable query={`SELECT fiscal_year, SUM(revenue) AS total_revenue, AVG(revenue) AS average_revenue, MAX(revenue) as highest_revenue, COUNT(1) AS num_quarters FROM quarterly_performance GROUP BY fiscal_year`} tableScale={0.8} tableWidth={500} />
      <Par>Grouped aggregation takes place in three steps.</Par>
      <List useNumbers items={[
        <>We specify by which attribute(s) we group: the <Term>grouping attributes</Term>. For example by year.</>,
        <>The original table is divided into <Term>groups</Term>: all rows that have the <Em>same</Em> value for the grouping attributes are grouped together.</>,
        <>Aggregation is performed separately within each group: each group is squashed into a single value. (Or multiple values, if we have multiple statistics.)</>,
      ]} />
      <Par>The result is a table containing both the grouping attributes (often on the left) and any aggregated statistics within each group (often on the right).</Par>
      <Info>Perhaps the above quarterly performance table is already the result of an aggregation? Maybe multiple months have been squashed into quarters? Or perhaps all transactions have been grouped by quarter and aggregated together?</Info>
    </Section>
  </Page>;
}
