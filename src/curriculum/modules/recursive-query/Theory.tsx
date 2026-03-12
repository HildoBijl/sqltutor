import { Page, Section, Par, List, Info, Warning, Quote, Term, Em, M } from '@/components';

import { useQueryResult } from '@/components/sql/sqljs';
import { useTheorySampleDatabase } from '@/learning/databases';
import { FigureSingleTable } from '@/curriculum/utils/queryFigures';

export function Theory() {
  const db = useTheorySampleDatabase();
  const q1 = 'SELECT * FROM transactions';
  const q2 = 'SELECT DISTINCT vendor, buyer FROM transactions';
  const q3 = 'SELECT DISTINCT t1.vendor, t2.buyer FROM transactions t1, transactions t2 WHERE t1.buyer = t2.vendor';
  const q4 = `WITH RECURSIVE vendor_chain AS (
    SELECT vendor, buyer
    FROM transactions
    UNION
    SELECT c.vendor, t.buyer
    FROM transactions t
    JOIN vendor_chain c ON c.buyer = t.vendor
)
SELECT * FROM vendor_chain;`;
  const q5 = `${q3} EXCEPT ${q2}`;
  const q6 = 'SELECT DISTINCT t1.vendor, t3.buyer FROM transactions t1, transactions t2, transactions t3 WHERE t1.buyer = t2.vendor AND t2.buyer = t3.vendor';
  const q7 = `${q6} EXCEPT ${q3}`;
  const q8 = 'SELECT DISTINCT t1.vendor, t4.buyer FROM transactions t1, transactions t2, transactions t3, transactions t4 WHERE t1.buyer = t2.vendor AND t2.buyer = t3.vendor AND t3.buyer = t4.vendor';
  const q9 = `${q8} EXCEPT ${q6}`;
  const data1 = useQueryResult(db?.database, q1);
  const data2 = useQueryResult(db?.database, q2);
  const data3 = useQueryResult(db?.database, q3);
  const data4 = useQueryResult(db?.database, q4);
  const data5 = useQueryResult(db?.database, q5);
  const data6 = useQueryResult(db?.database, q6);
  const data7 = useQueryResult(db?.database, q7);
  const data8 = useQueryResult(db?.database, q8);
  const data9 = useQueryResult(db?.database, q9);

  if (!data1 || !data2 || !data3 || !data4 || !data5 || !data6 || !data7 || !data8 || !data9)
    return null

  return <Page>
    <Section>
      <Par>We know that we can ask databases for data through queries. Some queries select columns, others select rows and yet others link tables to each other through foreign keys. However, none of them iterate through these foreign key links. Recursion is an extension to query languages that allows for exactly that. Let's take a look at how it works.</Par>
    </Section>

    <Section title="The problem: current methods don't allow indefinite looping through chains">
      <Par>Suppose that we have a table of transactions of products.</Par>
      <FigureSingleTable query={q1} title="List of transactions" tableWidth={800} tableScale={0.8} />
      <Par>In this table we can find out who received money from whom: the vendor receives money from the buyer.</Par>
      <FigureSingleTable query={q2} title="Directly received money" tableWidth={260} tableScale={0.8} />
      <Par>But now let's try to follow the money. If a person A sells something to a person B, and a person B sells something to a person C, then person A will have indirectly received money from person C. We call such a series of foreign key links a <Term>chain</Term>. And in this chain, some of person C's (possibly digital) banknotes will likely have ended up in person A's hands!</Par>
      <Par>We can find all the two-step chains: we can ask the database for all combinations of people (A, C) such that there is a person B for whom it holds that A sold to B <Em>and</Em> B sold to C.</Par>
      <FigureSingleTable query={q3} title="Received money in two steps" tableWidth={260} tableScale={0.8} />
      <Par>Pretty much all query languages allow this. And we can also increase the complexity of our query to find all three-step chains. And then we can merge all the tables we obtained to get an overview of all one-step, two-step and three-step chains combined in one table. It's all pretty useful.</Par>
      <Par>The problem is: all these queries only work for a <Em>fixed</Em> length of chain. If the chains of people selling things to each other grow larger, the queries we need to write will grow larger too. And we always run the risk, if the chains grow too large, that whatever query we wrote won't suffice. We need queries that are guaranteed to work for <Em>any</Em> chain length!</Par>
    </Section>

    <Section title="The solution: a query that refers to itself">
      <Par>The solution is to set up a <Term>recursive query</Term>: a query that refers to itself. Through it, we can loop through chains.</Par>
      <Par>A recursive query generally has two parts.</Par>
      <List items={[
        <>
          <Par><Term>Initialization</Term>: Define the first link(s) of the chain. This is called the <Term>base case</Term> or the <Term>anchor</Term>.</Par>
          <Quote>We say that a person A <strong>received money</strong> from person B, if person A <strong>sold</strong> something to person B.</Quote>
        </>,
        <>
          <Par><Term>Recursion</Term>: Define how to find more links of the chain, <Em>given</Em> earlier links.</Par>
          <Quote>We also say that a person A <strong>received money</strong> from person B, if there is some person X where person A <strong>received money</strong> from person X and person X <strong>sold</strong> something to person B.</Quote>
        </>,
      ]} />
      <Info>The query above refers to itself! To be precise: to define whether or not someone "received money" from someone else, we actually used the words "received money from". This makes the definition self-referencing: recursive.</Info>
      <Par>By defining the query in this way, the query language will find everyone belonging to the chain.</Par>
      <FigureSingleTable query={q4} title="Received money in any number of steps" tableWidth={260} tableScale={0.8} />
      <Warning>Not all query languages allow for recursion! If a query language does not allow for recursion, there is <Em>no</Em> way to query chains of arbitrary length. This makes query languages that support recursion inherently more powerful than query languages that don't.</Warning>
    </Section>

    <Section title="Evaluating recursive queries: the fixed-point algorithm">
      <Par>Let's take a look at what happens behind the scenes when a DBMS receives a recursive query. How does it evaluate it to find the result?</Par>
      <Par>The method that is generally used is the <Term>fixed-point algorithm</Term>. This algorithm keeps two sets in its memory.</Par>
      <List items={[
        <>The <Term>result set</Term> <M>R</M> containing <Em>all</Em> rows we have found so far.</>,
        <>The <Term>delta set</Term> <M>\Delta</M> containing <Em>only</Em> new rows we just found. These are then added to the result set <M>R</M>.</>,
      ]} />
      <Par>The fixed-point algorithm works through the following steps.</Par>
      <List items={[
        <>
          <Par><Term>Initialization</Term>: start with the base case(s).</Par>
          <List items={[
            <><M>\Delta \leftarrow A</M>: fill up the delta set with the anchor.</>,
            <><M>R \leftarrow \Delta</M>: add these cases to the result set too.</>,
          ]} />
        </>,
        <>
          <Par><Term>Iteration</Term>: keep searching for new cases.</Par>
          <List items={[
            <><M>\Delta \leftarrow f(\Delta)</M>: use the recently found cases <M>\Delta</M>, together with the recursion definition <M>f</M>, to try and find new cases.</>,
            <><M>\Delta \leftarrow \Delta - R</M>: from the new cases that were found, remove those that we found before. Only keep what's new.</>,
            <><M>R \leftarrow R \cup \Delta</M>: add these new cases (if any) to the result set to remember them.</>,
          ]} />
          <Par>Repeat this until <M>\Delta</M> ends up being empty. If <M>\Delta</M> ever <Em>is</Em> empty, and we have not found any new cases during one iteration, then we won't find any more cases in future iterations either. The result set <M>R</M> won't grow anymore and has reached a fixed point. We're done searching.</Par>
        </>,
      ]} />
      <Par>The above might still sound a bit vague, so let's clarify it by applying it to our example.</Par>
      <Par>We start with the initalization. Our anchor is the set of all people who directly sold to another person: the transactions table.</Par>
      <FigureSingleTable query={q2} title={<>The delta set <M>\Delta</M> at initialization</>} tableWidth={260} tableScale={0.8} />
      <Par>These rows are all added to <M>R</M>. Given these new rows, we now try to find <Em>additional</Em> rows according to our recursion definition. That is, we try to find people A, B and C, where (A, B) appears in the above delta set <M>\Delta</M>, and (B, C) appears in the original transactions table. This gives quite a lot of combinations of people, but only a few of them are actually new.</Par>
      <FigureSingleTable query={q5} title={<>The delta set <M>\Delta</M> after the first iteration</>} tableWidth={260} tableScale={0.8} />
      <Par>Next, we repeat this, but once again <Em>only</Em> for these new rows. So we once more try to find people A, B and C, where (A, B) appears in the above delta set <M>\Delta</M>, and (B, C) appears in the transactions table. This gives two more new pairs of people.</Par>
      <FigureSingleTable query={q7} title={<>The delta set <M>\Delta</M> after the second iteration</>} tableWidth={260} tableScale={0.8} />
      <Par>We repeat the process, using the above new rows to try and find more rows. There's one more row to be added.</Par>
      <FigureSingleTable query={q9} title={<>The delta set <M>\Delta</M> after the third iteration</>} tableWidth={260} tableScale={0.8} />
      <Par>Finally, we do the whole iteration one more time. This time we don't find any new rows to add: the delta set <M>\Delta</M> remains empty. That means the fixed-point algorithm is done!</Par>
      <Par>The result is the full set of all rows that we have found.</Par>
      <FigureSingleTable query={q4} title={<>The final result set <M>R</M></>} tableWidth={260} tableScale={0.8} />
      <Par>This shows how the DBMS, when given a recursive query, will keep searching for new cases until there's none left to be found.</Par>
    </Section>
  </Page>;
}
