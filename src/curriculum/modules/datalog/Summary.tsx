import { Page, Section, Par, Term, Em } from '@/components';

import { useQueryResult } from '@/components/sql/sqljs';
import { useTheorySampleDatabase } from '@/learning/databases';

import { DatalogFacts, DatalogOutput } from './Theory';

export function Summary() {
  const db = useTheorySampleDatabase();
  const q1 = 'SELECT * FROM employees';
  const q3 = 'SELECT first_name, last_name FROM employees WHERE current_salary >= 200000';
  const data1 = useQueryResult(db?.database, q1);
  const data3 = useQueryResult(db?.database, q3);

  if (!data1 || !data3)
    return null

  return <Page>
    <Section>
      <Par><Term>Datalog</Term> is a promising up-and-coming query language based in logic theory. In Datalog, tables are called <Term>predicates</Term>: they are lists of <Term>facts</Term> (rows) with a fixed number of (order-based) <Term>arguments</Term> (columns).</Par>
      <DatalogFacts data={data1} predicate="employee" />
      <Par>A typical Datalog program consists of a number of <Term>rules</Term> that define new predicates. You can see these rules as view definitions.</Par>
      <Par><pre><code>
        highEarningEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt;= 200000.<br />
        highEarningEmployeeName(fn, ln) :- highEarningEmployee(id, fn, ln, p, e, a, c, hd, cs).
      </code></pre></Par>
      <Par>In these rules, the left part (the <Term>head</Term>) describes a new predicate (like a view), while the right part (the <Term>body</Term>) contains a list of comma-separated <Term>literals</Term> (conditions) that must hold true. Datalog will try to find <Em>all</Em> possible combinations values for <Em>all</Em> given <Term>variables</Term> such that <Em>all</Em> literals hold true.</Par>
      <Par>A Datalog program is ended with a <Term>query</Term> (or potentially multiple) that requests data. At this point Datalog starts to do the work to find the requested data.</Par>
      <Par><pre><code>?- highEarningEmployeeName(firstName, lastName).</code></pre></Par>
      <Par>The output is usually given in list form, showing all combinations of variables for which the query literal(s) hold true. You could of course visualize this for yourself as a table once more.</Par>
      <DatalogOutput data={{ values: data3.values, columns: ['firstName', 'lastName'] }} />
    </Section>
  </Page>;
}
