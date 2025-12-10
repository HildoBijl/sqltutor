import { Page, Par, List, Section, Info, Term } from '@/components';
import { ISQL } from '@/shared/components/SQLEditor';

import { FigureExampleQuery } from '../../components';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how we can select the columns from a table (<Term>projection</Term>, possibly coupled with <Term>renaming</Term>), and we know how to <Term>filter</Term> the rows based on some condition. If we combine these two skills, we can extract very specific data. Let's take a look at how that works.</Par>
    </Section>

    <Section title="The steps for a specific example">
      <Par>Suppose that, given a list of employees, we specifically want to know the cities in which there are employees who already worked for the company before 2015. To extract this data, we have to go through the following steps.</Par>
      <List items={[
        <>Find the employees that started before 2015. (Filtering)</>,
        <>Extract the cities where those employees live. (Projection)</>,
        <>Make sure all the cities we have are unique. (Removing duplicates)</>,
      ]} />
      <Par>This gets us the following query.</Par>
      <FigureExampleQuery query={`
SELECT DISTINCT city
FROM employees
WHERE hire_date < '2015-01-01';`} tableWidth={160} />
      <Par>This works, but what are the steps we have taken inside our mind to get here?</Par>
    </Section>

    <Section title="The general query writing strategy">
      <Par>Based on the above example, we can come up with a strategy for writing queries. We follow these steps in order.</Par>
      <List useNumbers={true} items={[
        <>Find which <Term>table</Term> we need data from. For the example, we write <ISQL>FROM employees</ISQL>.</>,
        <>Set up the required <Term>filter</Term>. For the example, we add <ISQL>{`WHERE hire_date < '2015-01-01'`}</ISQL>.</>,
        <>Pick the specific <Term>columns</Term> that we need, possibly renaming them to the required output format. For the example, we add <ISQL>SELECT city</ISQL> to the start of our query.</>,
        <>If we specifically want <Term>unique values</Term>, add <ISQL>DISTINCT</ISQL>. For the example, we indeed need this.</>
      ]} />
      <Par>Note that the steps above are not in the order in which the query is eventually written. The start of the query (the <ISQL>SELECT</ISQL> part) is usually only added at the end. Starting with <ISQL>FROM</ISQL>, continuing with <ISQL>WHERE</ISQL> and ending up with <ISQL>SELECT</ISQL> is a very normal way of writing queries.</Par>
      <Info>Sadly SQL does not allow another keyword order. It requires the action <ISQL>SELECT</ISQL> to be at the start. The query <ISQL>{`FROM employees WHERE hire_date < '2015-01-01' SELECT DISINCT city`}</ISQL> is not valid.</Info>
    </Section>
  </Page>;
}
