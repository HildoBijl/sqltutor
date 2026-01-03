import { Page, Section, Par, List, Term, Em } from '@/components';
import { ISQL } from '@/components';

export function Summary() {
  return <Page>
    <Section>
      <Par>There is no simple step-by-step plan to turn any English-language data request into a SQL query. However, there are various tricks which can help you in the process.</Par>
      <List useNumbers items={[
        <><strong>Improve your intuition of the data set: perform the query manually.</strong> By doing this for a few sample entries, you understand the steps required to get the right data, which helps you set up the query.</>,
        <><strong>Get rid of ambiguous language: rephrase the request.</strong> Change <Em>verbs</Em> to words SQL is familiar with (<ISQL>EXISTS</ISQL>, <ISQL>IN</ISQL>, and so forth). Change <Em>nouns</Em> to specific table rows or attributes. Use the word "corresponding" for foreign key references.</>,
        <><strong>Optimize the result: try different tools.</strong> Your first draft query might be both confusing for humans to read and inefficient for DBMSs to execute. Try to rewrite it, using various SQL tools, to see if you can make it more clear and/or more efficient.</>,
        <><strong>Work in steps: set up sub-queries from inside to outside.</strong> Especially for non-correlated queries, it is very helpful to start with the inner query and test it, then build a query around it and test it, and so forth. Testing early results in easy error fixes.</>,
        <><strong>Deal with the word "All": rephrase it using a double negative.</strong> For instance, to find the accounts that bought all available products, we have to find the accounts for which there does <Em>not</Em> exist a product they have <Em>not</Em> bought. Rephrasing the request in this way makes it far easier to set up the corresponding query.</>,
        <><strong>Check your result using an example.</strong> It's always worthwhile to manually verify for a few random entries that your output is correct. Do so for at least one <Term>positive</Term> sample (that <Em>does</Em> appear in our output) to ensure it belongs there, and for at least one <Term>negative</Term> sample (that does <Em>not</Em> appear in our output) to ensure it should be left out.</>,
      ]} />
      <Par>These tricks will help you get on your way when writing more complicated queries.</Par>
    </Section>
  </Page>;
}
