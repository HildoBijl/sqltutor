import { Fragment } from 'react'

import { Page, Section, Par, List, Warning, Info, Quote, Term, Em } from '@/components';

import { useQueryResult, type QueryResult } from '@/components/sql/sqljs';
import { useTheorySampleDatabase } from '@/learning/databases';
import { FigureSingleTable } from '@/curriculum/utils/queryFigures';

export function Theory() {
  const db = useTheorySampleDatabase();
  const q1 = 'SELECT * FROM employees';
  const q2 = 'SELECT * FROM employees WHERE current_salary >= 200000';
  const q3 = 'SELECT first_name, last_name FROM employees WHERE current_salary >= 200000';
  const data1 = useQueryResult(db?.database, q1);
  const data2 = useQueryResult(db?.database, q2);
  const data3 = useQueryResult(db?.database, q3);

  if (!data1 || !data2 || !data3)
    return null
  const e1 = data1.values[0]

  return <Page>
    <Section>
      <Par>We know there's a variety of query languages around. A very promising up-and-coming one is <Term>Datalog</Term>. It is based in logic theory, which requires a bit of a different way of thinking. To understand how it works, we slowly walk through the three steps of a Datalog program – the facts, the rules and the query – to see how it all works.</Par>
    </Section>

    <Section title="Step 1: the facts">
      <Par>Datalog works with so-called <Term>facts</Term>. Consider for instance the table of employees.</Par>
      <FigureSingleTable query={q1} title="List of employees" tableWidth={750} tableScale={0.6} />
      <Par>In Datalog this table isn't considered as a table, but as a list of facts.</Par>
      <DatalogFacts data={data1} predicate="employee" />
      <Par>What the first line here basically says is, "There is an employee with employee ID '{e1[0]}', first name '{e1[1]}', last name '{e1[2]}', and so forth." This is now treated as a known fact.</Par>
      <Info>Because of the way Datalog defines facts, <Term>duplicates facts</Term> are <Em>not</Em> possible. If we define the same fact twice, Datalog will still treat it as a single fact. It's just like how saying "The sky is blue" twice won't make the sky any more blue.</Info>
      <Warning>You may wonder, "Our table is called employees, not employee. This will fail!" You would be correct: we of course have to use the right name. The reason why we use "employee" here is a naming convention. In SQL tables are collections of rows like "the employees table" so table names are often <Term>plural</Term>. In Datalog, predicates describe properties like "This combination of values is an employee" so predicate names are often <Term>singular</Term>. That's why we use "employee" here in Datalog. It helps us get used to this convention.</Warning>
      <Par>In reality, Datalog scripts actually don't mention the facts at the top. To be precise: the facts step is usually skipped altogether, since the facts are assumed known, based on stored tables. But it's helpful to imagine the facts mentioned at the top of any script anyway.</Par>
    </Section>

    <Section title="Datalog terminology">
      <Par>You may have noticed that the terminology in Datalog is a bit different from what we are used to when dealing with tables. For clarity, let's go over all terminology, just so that we're all speaking the same language.</Par>
      <List items={[
        <>The name "employee" in the above example is called a <Term>predicate</Term>. We can see it as a claim we can make, "The given person is now defined as being an employee." Compared to tables, a predicate equates to a full table.</>,
        <>Predicates have a fixed number of <Term>arguments</Term>. These are the parameters we should provide to the predicate. Compared to tables, the arguments are the columns/attributes of tables.</>,
        <>For every predicate, there can be any number of <Term>facts</Term> (sometimes also called <Term>tuples</Term>). We've seen {data1.values.length} of these facts in the example above. Compared to tables, the facts are the rows of tables.</>,
      ]} />
      <Info>In Datalog, arguments have no names! Predicates are <Term>order-based</Term>: the order of the arguments determines what is what. When defining the predicate, we effectively agree, "The second argument of the 'employee' predicate is the first name." Datalog has no idea of the concept "first name". It doesn't even know the second argument is called "first name"! For Datalog, the only thing that matters is the number of arguments and their order.</Info>
    </Section>

    <Section title="Step 2: the rules">
      <Par>The main part of any Datalog program is the rules part. In Datalog, we define a <Term>rule</Term> like this.</Par>
      <Par><pre><code>
        highEarningEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000.
      </code></pre></Par>
      <Par>This statement can be read in English as:</Par>
      <Quote>The tuple (id, fn, ln, p, e, a, c, hd, cs) is a highEarningEmployee, when the tuple (id, fn, ln, p, e, a, c, hd, cs) is an employee <strong>and</strong> when the value of cs is at least 200000.</Quote>
      <Par>To see why it says this, let's dissect the rule.</Par>
      <List items={[
        <>
          <Par sx={{ mb: 0.5 }}>On the left is the <Term>head</Term> of the rule: <code>highEarningEmployee(id, fn, ln, p, e, a, c, hd, cs)</code>. We can see this as a claim someone can make: a potential new fact that may be true. <Em>The tuple (id, fn, ln, p, e, a, c, hd, cs) is considered a high-earning employee.</Em></Par>
          <Info>We may use any argument names we like – only the order matters – so for convenience we use short argument names.</Info>
        </>,
        <>In-between is the <Term>rule operator</Term> ":-". It can be read as "is true when". This is the main operator in Datalog to define rules.</>,
        <>On the right is the <Term>body</Term> of the rule. It is a list of <Term>literals</Term>: claims that may or may not be true, based on existing data. The literals are separated by commas, where each comma functions as an "and". The rule only evaluates to true when <Em>all</Em> literals hold true.
          <List sx={{ listStyleType: 'circle' }} items={[
            <>The first literal requires the fact <code>employee(id, fn, ln, p, e, a, c, hd, cs)</code> to be true. Or thinking in terms of tables: "The row (id, fn, ln, p, e, a, c, hd, cs) is in the employees table."</>,
            <>The second literal adds an extra condition for the variable cs: it must be at least 200000.</>,
          ]} />
        </>,
        <>At the end is a period. Datalog commands (facts, rules, queries) are always ended by a period. It shows the command is complete.</>,
      ]} />
      <Par>The rule contains <Term>variables</Term> like "id", "fn", "ln", etcetera. When Datalog receives a rule like this, it will try to find <Em>all</Em> possible combinations of values for <Em>all</Em> variables in the rule, such that <Em>all</Em> conditions hold. In our example, there are only three sets of variable values for which all conditions are met. In this way, we get the following three new facts.</Par>
      <DatalogFacts data={data2} predicate="highEarningEmployee" />
      <Par>Or displayed more clearly for us, as a table:</Par>
      <FigureSingleTable query={q2} title="High-earning employees" tableWidth={750} tableScale={0.6} />
      <Par>A typical <Term>Datalog program</Term> contains multiple rules. We could for instance find the names of these high-earning employees with a second rule.</Par>
      <Par><pre><code>
        highEarningEmployeeName(fn, ln) :- highEarningEmployee(id, fn, ln, p, e, a, c, hd, cs).
      </code></pre></Par>
      <Par>We can read this in English as:</Par>
      <Quote>The tuple (fn, ln) is a high-earning employee name, when there exists some combination of values (id, fn, ln, p, e, a, c, hd, cs) that is considered a high-earning employee.</Quote>
      <Par>It creates yet another predicate for us.</Par>
      <FigureSingleTable query={q3} title="High-earning employee names" tableWidth={200} tableScale={0.6} />

      <Info>In reality, when Datalog receives a rule, it won't immediately execute it. It only uses the rule when requested. (See step 3: the query.) So the best way to see a rule is actually as a <Em>view definition</Em>. The predicate "highEarningEmployee" functions like a view that we created! A full <Term>Datalog program</Term> is essentially a collection of view definitions, ended by a query.</Info>
    </Section>

    <Section title="Step 3: the query">
      <Par>Eventually we want to get some data out of a Datalog program. That is done through the third step: the <Term>query</Term>. A typical Datalog query is:</Par>
      <Par><pre><code>?- highEarningEmployeeName(firstName, lastName).</code></pre></Par>
      <Par>In English language, this command can be read as:</Par>
      <Quote>Find all variables firstName and lastName for which (firstName, lastName) is a high-earning employee name.</Quote>
      <Par>At this point Datalog will do all the work. (Note that it didn't do any work when we only defined rules.) It then generates the following output.</Par>
      <DatalogOutput data={{ values: data3.values, columns: ['firstName', 'lastName'] }} />
      <Info>The above is how Datalog usually returns data. On SQL Valley, we will display the output of Datalog programs as tables, rather than in the usual Datalog format, just so it's easier for us to understand it. Just keep in mind that Datalog doesn't actually work with tables.</Info>
      <Par>Let's dissect what is happening in the query. The command "?-" can be read as "Find all possible combinations of variables for which ...". Within the query, there are only two variables: <code>firstName</code> and <code>lastName</code>. Datalog will find <Em>all</Em> possible combinations of values for these variables for which all the given literals (conditions) hold true. It then outputs these combinations of variables.</Par>
      <Info>Note that in the output step the variable names do matter! It is how Datalog shows the output. Of course we can use any variable names that we want here.</Info>
      <Warning>Some Datalog engines don't use "?-" but instead use "?" for queries. When using Datalog, always check out the local syntax.</Warning>
      <Par>It is worthwhile to note that we could in theory also add more conditions to the query. In fact, we could have skipped the rules altogether and immediately set up the following query.</Par>
      <Par><pre><code>?- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000.</code></pre></Par>
      <Par>This would instantly get us all high-earning employees (with all arguments). However, we are now setting up queries that contain conditions, which is generally frowned upon in Datalog. It's cleaner to first define a rule for a predicate (in table-terms: define a view) and only then set up a simple query that requests the full predicate (in table-terms: query the view). So we'll try to stick to that convention.</Par>
      <Info>Datalog programs can have any number of queries, each retrieving different data. When we set up Datalog programs, we will usually do so to find specific data, which is why our programs usually end with a single query. This query then marks the end of our program.</Info>
    </Section>
  </Page>;
}

export function DatalogFacts({ data, predicate }: { data: QueryResult; predicate: string }) {
  return <Par><pre><code>
    {data.values.map((fact, index) => <Fragment key={index}>
      {predicate}({fact.map(argument => JSON.stringify(argument)).join(', ')}).
      {index < data.values.length - 1 ? <br /> : null}
    </Fragment>)}
  </code></pre></Par>
}

export function DatalogOutput({ data }: { data: QueryResult }) {
  return <Par><pre><code>
    {data.values.map((fact, index) => <Fragment key={index}>
      {fact.map((argument, argumentIndex) => `${data.columns[argumentIndex]} = ${JSON.stringify(argument)}`).join(', ')}
      {index < data.values.length - 1 ? <br /> : null}
    </Fragment>)}
  </code></pre></Par>
}
