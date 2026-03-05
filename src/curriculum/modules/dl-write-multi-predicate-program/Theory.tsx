import { Page, Section, Par, List, Em, Term, IDL } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>By now we have seen how we can set up derived predicates from existing predicates, how we can combine different existing predicates, and how we can safely implement the <IDL>not</IDL> keyword. Let's bring this all together to set up some more complex Datalog programs.</Par>
    </Section>

    <Section title="Assemble the program step by step">
      <Par>Let's study an example data request and see how we can set up a Datalog program for it. Suppose we have predicates for products that can be sold (including categories), for transactions of those products (including vendors and buyers) and for accounts. How would we for example find all the users who have never bought a product from the 'Fine Art' category?</Par>
      <Par>Datalog is all about defining small and simple predicates, so let's start by doing so. We could set up a list of all Fine Art products.</Par>
      <FigureExampleDLQuery query={<>fineArtProduct(id) :- product(id, _, 'Fine Art', _, _, _).</>} actualQuery="SELECT p_id AS id FROM products WHERE category='Fine Art'" tableWidth={100} />
      <Par>We could then use this to find all people who bought one of those products.</Par>
      <FigureExampleDLQuery query={<>boughtFineArt(u) :- transaction(_, _, u, id, _, _, _, _), fineArtProduct(id).</>} actualQuery="SELECT buyer AS u FROM transactions WHERE prod_id IN (SELECT p_id FROM products WHERE category='Fine Art')" tableWidth={150} />
      <Par>Finally, we should find all the accounts that are not in this list. After all, those are the people who have never bought a Fine Art product.</Par>
      <FigureExampleDLQuery query={<>neverBoughtFineArt(u) :- account(u, _, _, _, _, _, _, _, _, _), not boughtFineArt(u).</>} actualQuery="SELECT username AS u FROM accounts EXCEPT SELECT buyer AS u FROM transactions WHERE prod_id IN (SELECT p_id FROM products WHERE category='Fine Art')" tableWidth={150} />
      <Par>The final step in a program is to actually query the predicate. The examples above already show tables, but in an actual Datalog program this won't be the case. We only get data once we run a query.</Par>
      <FigureExampleDLQuery query={<>?- neverBoughtFineArt(username).</>} actualQuery="SELECT username AS username FROM accounts EXCEPT SELECT buyer AS username FROM transactions WHERE prod_id IN (SELECT p_id FROM products WHERE category='Fine Art')" tableWidth={150} />
      <Par>And with that we've completed our Datalog program.</Par>
    </Section>

    <Section title="Use tips and tricks">
      <Par>As data requests get more complicated, it becomes harder and harder to write Datalog programs. There are a few tips and tricks that are very helpful to apply.</Par>
      <List useNumbers items={[
        <>First <Term>manually execute</Term> the data request for a few entries. Doing so helps you understand the structure of the data and tells you which predicates you will need to combine in which way.</>,
        <>
        <Par>If applicable, <Term>rephrase the request</Term> using words Datalog is good with. Datalog is strong in existence checks "There is some user that ..." and with negation "There is not ...".</Par>
        <List items={[
          <>A <Term>non-existence request</Term> like "Find all users that never ..." can be rephrased through a <Term>single negative</Term> as "Find all users for which there does not exist ...".</>,
          <>A <Term>universal condition request</Term> like "Find all users that bought every product" can be rephrased through a <Term>double negative</Term> as "Find all users for which there does not exist a product they haven't bought." Such requests always require two uses of the <IDL>not</IDL> keyword.</>,
        ]} />
        </>,
        <>Set up predicates that are <Term>based on keys</Term>. A key represents an entire predicate fact (a table row) but then without unnecessary extra data. Setting up predicates in this way keeps subsequent queries short. It also makes it safer to potentially apply the <IDL>not</IDL> keyword to this predicate.</>,
        <>Write <Term>many intuitive predicates</Term>. The more predicates you use, the better. (Assuming they actually contribute something, of course.) Do try to keep your predicates intuitive. It should be clear, from the predicate name alone, exactly what it means. If this is not the case, reconsider whether your predicate is simple and intuitive enough.</>,
        <>On a not-exists statement, <Term>first do the opposite</Term>. For instance, if we want to find the people for which there does <Em>not</Em> exist a Fine Art product they have bought, we first find the people for which there <Em>does</Em> exist such a product. Then we flip the outcome and find all people <Em>except</Em> these people.</>,
        <>Always <Term>check your results</Term>. Ideally, you'd have a Datalog engine with corresponding data, to run your query on. If not, at least run the final program in your head. Make sure that a sample <Term>positive case</Term> (an entry that <Em>should</Em> be part of the output) will appear in the output, and that a sample <Term>negative case</Term> (an entry that should <Em>not</Em> appear in the output) will not be there.</>,
        <>Don't forget the <Term>query</Term> at the end! Make sure to give the output arguments some sensible names at this point too.</>,
      ]} />
      <Par>Through some practice with these tips and tricks, their use will become more and more automatic.</Par>
    </Section>
  </Page>;
}
