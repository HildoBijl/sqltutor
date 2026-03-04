import { Page, Section, Par, Warning, List, Term, Em } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Summary() {
  return <Page>
    <Section>
      <Par>A typical Datalog program consists of many small rules defining predicates, ending with a query.</Par>
      <FigureExampleDLQuery query={<>fineArtProduct(id) :- product(id, _, 'Fine Art', _, _, _).<br />boughtFineArt(u) :- transaction(_, _, u, id, _, _, _, _), fineArtProduct(id).<br />neverBoughtFineArt(u) :- account(u, _, _, _, _, _, _, _, _, _), not boughtFineArt(u).<br />?- neverBoughtFineArt(username).</>} actualQuery="SELECT username AS username FROM accounts EXCEPT SELECT buyer_username AS username FROM transactions WHERE prod_id IN (SELECT p_id FROM products WHERE category='Fine Art')" tableWidth={150} />
      <Par>Getting good at setting up these programs mainly requires practice. There are a few helpful tips and tricks.</Par>
      <List useNumbers items={[
        <>First <Term>manually execute</Term> the data request for a few entries to gain intuition about the data.</>,
        <>
          <Par sx={{ mb: 0.5 }}>If applicable, <Term>rephrase the request</Term> using "exists" and "not exists". These are words Datalog is strong with.</Par>
          <Warning>A <Term>universal condition request</Term> like "Find users that bought <Em>all</Em> products" requires a double negative to rephrase.</Warning>
        </>,
        <>Set up predicates that are <Term>based on keys</Term>. This makes referencing them easier.</>,
        <>Write <Term>many intuitive predicates</Term>. Every step should be as small as possible.</>,
        <>On a not-exists statement, <Term>first do the opposite</Term>. Then flip the result to find the opposite.</>,
        <>Always <Term>check your results</Term>, both for a <Term>positive sample case</Term> and for a <Term>negative sample case</Term>.</>,
        <>Don't forget the <Term>query</Term> at the end.</>,
      ]} />
    </Section>
  </Page>;
}
