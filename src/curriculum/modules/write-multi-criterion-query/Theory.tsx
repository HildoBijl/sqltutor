import { Page, Section, Par, Quote, List, Warning, Info, Term, Em } from '@/components';
import { ISQL } from '@/components';

import { FigureExampleQuery } from '@/curriculum/utils/queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>By now we know, for any database table, how to process column values to create new columns, how to set up advanced filters, and how to apply sorting/limiting to the results. Next, we combine all these steps to set up complex multi-criterion queries.</Par>
    </Section>

    <Section title="The five steps of setting up a query">
      <Par>Suppose that we are ordered to get specific data out of a table. For example:</Par>
      <Quote>Find the income taxes paid per position, but only for contracts that lasted exactly one year, and only for the top 5 performance scores.</Quote>
      <Par>To set up a query like this for a single table, there are generally five steps to follow. At first these steps add data, and then they start removing it, so that we only end up with the data that we need.</Par>
      <List useNumbers items={[
        <>Select all columns and where needed <Term>create extra columns</Term>. For our example, we need to calculate the taxes and the contract duration.</>,
        <>Set up the <Term>filter</Term> to only get the entries required. For the example, we only want contracts lasting longer than a year.</>,
        <>If needed, <Term>sort and limit</Term> the entries. For the example, we need to sort by performance score, and only take the top 5.</>,
        <><Term>Cut columns</Term> to only get the required output. For the example, we only want the position and the taxes paid.</>,
        <><Term>Remove duplicates</Term> if required. For the example, if there are two contracts with equal taxes and position, they should likely both be included, so this is not needed.</>
      ]} />
      <Par>To see how these steps work in practice, let's set up the corresponding query.</Par>
    </Section>

    <Section title="Practical application of the five steps">
      <Par>To start, we need to calculate the taxes and the contract duration. The taxes can be found through <ISQL>0.3*salary AS taxes</ISQL>. The contract duration is harder. How to find it depends on our DBMS, so we look this up. Google and Artificial Intelligence are your friends here.</Par>
      <Par>For SQLite, there apparently is the <ISQL>JULIANDAY(date)</ISQL> function that calculates the number of days since Nov 24, 4714 BC. We can use this to find the number of days of the contract, simply by finding the <Em>difference</Em> in number of days. So we use <ISQL>JULIANDAY(end_date) - JULIANDAY(start_date) AS duration</ISQL>. This leads to the following query.</Par>
      <FigureExampleQuery query={`SELECT
  *,
  0.3*salary AS taxes,
  JULIANDAY(end_date) - JULIANDAY(start_date) AS duration
FROM emp_data;`} tableWidth={800} tableScale={0.7} below />
      <Par>As second step, we want to apply the filter. We can add a <ISQL>WHERE</ISQL> clause with this newly found <ISQL>duration</ISQL>. There is one caveat though.</Par>
      <Warning>When the DBMS evaluates the query, it starts with <ISQL>FROM</ISQL>, then applies <ISQL>WHERE</ISQL>, then <ISQL>SELECT</ISQL> and it ends with <ISQL>ORDER BY</ISQL>. Newly created columns get created at the <ISQL>SELECT</ISQL> step. We therefore usually <Em>cannot</Em> use newly defined column names within the <ISQL>WHERE</ISQL> clause! So using <ISQL>duration BETWEEN 365 AND 366</ISQL> would fail. Some DBMSs do allow this through a work-around, but it's better not to count on this, and simply copy the full calculation into the <ISQL>WHERE</ISQL> clause.</Warning>
      <FigureExampleQuery query={`SELECT
  *,
  0.3*salary AS taxes,
  JULIANDAY(end_date) - JULIANDAY(start_date) AS duration
FROM emp_data
WHERE JULIANDAY(end_date) - JULIANDAY(start_date) BETWEEN 365 AND 366;`} tableWidth={800} tableScale={0.7} below />
      <Par>For the third step, we sort and limit the results. We want to sort by the performance score (high to low) and only take the top 5 performers.</Par>
      <FigureExampleQuery query={`SELECT
  *,
  0.3*salary AS taxes,
  JULIANDAY(end_date) - JULIANDAY(start_date) AS duration
FROM emp_data
WHERE JULIANDAY(end_date) - JULIANDAY(start_date) BETWEEN 365 AND 366
ORDER BY perf_score DESC
LIMIT 5;`} tableWidth={800} tableScale={0.7} below />
      <Par>As fourth step, we limit the columns we get. We were only instructed to find the taxes per position, so we select those two columns, cutting out the rest.</Par>
      <FigureExampleQuery query={`SELECT
  position,
  0.3*salary AS taxes
FROM emp_data
WHERE JULIANDAY(end_date) - JULIANDAY(start_date) BETWEEN 365 AND 366
ORDER BY perf_score DESC
LIMIT 5;`} tableWidth={240} tableScale={0.7} />
      <Par>Finally, we should check if we need to remove duplicates. For the example, this is not the case, and so we keep the query as is. And with this we are done setting up the query.</Par>
      <Info>If you're struggling to set up a complicated query, it helps to simply follow these five steps. They usually get you to the desired query. And if not, then you can ask for help related to a specific step, which is far more powerful than just telling someone "I don't know how to do it."</Info>
    </Section>
  </Page>;
}
