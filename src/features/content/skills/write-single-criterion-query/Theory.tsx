import { Page, Par, List, Section, Warning, Info, Term } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  return <Page>
    <Par>We know how we can select the columns from a table (<Term>projection</Term>, possibly coupled with <Term>renaming</Term>), and we know how to <Term>filter</Term> the rows based on some condition. If we combine these two skills, we can extract very specific data. Let's take a look at how we can do that.</Par>

    <Section title="The steps for a specific example">
      <Par>Suppose that we specifically want a list of all countries having consultancy companies. To extract this data, we have to go through the following steps.</Par>
      <List items={[
        <>Filter out all the non-consulting companies. (Filtering)</>,
        <>Extract the countries for these companies. (Projection)</>,
        <>Make sure all the countries we have are unique. (Removing duplicates)</>,
      ]} />
      <Par>This gets us the following query.</Par>
      <Warning>ToDo: add figure with the query. <SQLDisplay>{`SELECT DISTINCT country
FROM companies
WHERE industry='Consulting;`}</SQLDisplay></Warning>
      <Par>This works, but what are the steps we have taken inside our mind to get here?</Par>
    </Section>

    <Section title="The general query writing strategy">
      <Par>Based on the above example, we can come up with a strategy for writing queries.</Par>
      <List items={[
        <>Find which <Term>table</Term> we need data from. For the example, we write <SQLDisplay inline>FROM companies</SQLDisplay>.</>,
        <>Set up the required <Term>filter</Term>. For the example, we add <SQLDisplay inline>WHERE industry='Consulting'</SQLDisplay>.</>,
        <>Pick the specific <Term>columns</Term> that we need, possibly renaming them to the required output format. For the example, we add <SQLDisplay inline>SELECT country</SQLDisplay> to the start of our query.</>,
        <>If we specifically want <Term>unique values</Term>, add <SQLDisplay inline>DISTINCT</SQLDisplay>. For the example, we indeed need this.</>
      ]} />
      <Par>Note that the steps above are not in the order in which the query is eventually written. The start of the query (the <SQLDisplay inline>SELECT</SQLDisplay> part) is usually only added at the end. Starting with <SQLDisplay inline>FROM</SQLDisplay>, continuing with <SQLDisplay inline>WHERE</SQLDisplay> and ending up with <SQLDisplay inline>SELECT</SQLDisplay> is a very normal way of writing queries.</Par>
      <Info>Sadly SQL does not allow another keyword order. It requires the action <SQLDisplay inline>SELECT</SQLDisplay> to be at the start. The query <SQLDisplay inline>FROM companies WHERE industry='Consulting' SELECT DISINCT country</SQLDisplay> is not valid.</Info>
    </Section>
  </Page >;
}
