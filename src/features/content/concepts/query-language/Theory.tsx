import { Page, Section, Par, List, Warning, Info, Term, Link } from '@/components';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that a database can be seen as a collection of tables managed by a Database Management System (DBMS). How do we interact with this DBMS?</Par>
    </Section>
    <Section title="The idea behind a query language">
      <Par>Databases usually don't have a flashy interface with clear graphics, useful buttons and more. To interact with the database and make it do anything, we have to give the DBMS commands. Think of "Create a new table 'companies'", "Add a new record to the 'companies' table" or "Find all data science companies from the Netherlands." Such commands are known as <Term>queries</Term>: structured commands to extract/adjust data.</Par>
      <Warning>ToDo: add image</Warning>
      <Par>Sadly DBMSs do not understand English, or any spoken language for that matter. Spoken languages are far too ambiguous. Queries must therefore follow a very specific format. The exact format of how to set up queries and what can be put in them is known as the <Term>query language</Term>.</Par>
    </Section>
    <Section title="Examples of query languages">
      <Par>So what does a query look like? This depends on the query language. There is a large variety of query languages: every DBMS pretty much has its own query language. But to get a feeling of what queries may look like, we study a few examples.</Par>
      <Par>Suppose that we want to get a list of companies with more than 200.000 employees. In the <Term>SQL</Term> query language (the query language used by the most common/popular databases) that would be done through</Par>
      <Par><pre><code>{`SELECT company_name
FROM companies
WHERE num_employees > 200000
`}</code></pre></Par>
      <Par>In <Term>Datalog</Term> (a more modern and up-and-coming query language) this would be done with</Par>
      <Par><pre><code>{`largeCompanies(name) :- companies(_, name, _, _, num_employees, _), num_employees > 200000.
?- largeCompanies(name).`}</code></pre></Par>
      <Par>In <Term>relational algebra</Term> (a more theoretical and mathematical query language) this is done using</Par>
      <Par><pre><code>largeCompanies ← ∏<sub>company_name</sub>(σ<sub>num_employees &gt; 200000</sub>(companies))</code></pre></Par>
      <Par>Or in an object-database like <Link to="https://www.mongodb.com/">MongoDB</Link> the query looks like this.</Par>
      <Par><pre><code>{`db.companies.find(
  { num_employees: { $gt: 200000 } }, 
  { company_name: 1, _id: 0 }
)`}</code></pre></Par>
      <Par>You see that there is a large variety of query languages.</Par>
    </Section>
    <Section title="Two branches of query languages">
      <Par>Query languages usually consist of two parts (sublanguages) that work mostly independently from one another.</Par>
      <List items={[
        <>The so-called <Term>Data Definition Language</Term> (DDL) revolves around defining the structure of data: creating tables, adjusting tables, etcetera.</>,
        <>The <Term>Data Manipulation Language</Term> (DML) focuses on working with data: adding/updating records, retrieving the right data, and so forth.</>,
      ]} />
      <Par>When learning a query language, you usually start with the DML, and then you continue with the DDL. But in theory you could even learn the DDL without knowing the DML.</Par>
      <Info>Here at SQL Valley we obviously focus on the SQL query language. On top of this, we mainly focus on the DML side.</Info>
    </Section>
  </Page>;
}
