import { Page, Section, Par, List, Warning, Info, Term, Em } from '@/components';
import { ISQL } from '@/shared/components/SQLEditor';

export function Summary() {
  return <Page>
    <Section>
      <Par>If we want to filter rows based on multiple conditions, we can combine them using <ISQL>AND</ISQL>, <ISQL>OR</ISQL> and <ISQL>NOT</ISQL>.</Par>
      <Warning>ToDo: add complicated example image with various conditions.</Warning>
      <Info>When evaluating the conditions, SQL always first resolves the comparisons, turning them into <ISQL>TRUE</ISQL>/<ISQL>FALSE</ISQL>. Then it applies any potential <ISQL>NOT</ISQL> operators, and at the end it resolves <ISQL>AND</ISQL>/<ISQL>OR</ISQL>. Brackets can be used to indicate a different operation order.</Info>
      <Par>A very different (and less common) way of applying multiple conditions is by <Term>merging</Term> two tables with identical columns.</Par>
      <List items={[
        <>The <ISQL>UNION</ISQL> command gathers all rows present in <Em>at least one</Em> of the two tables (like an <ISQL>OR</ISQL>).</>,
        <>The <ISQL>INTERSECT</ISQL> command gathers all rows present in <Em>both</Em> tables (like an <ISQL>AND</ISQL>).</>,
        <>The <ISQL>EXCEPT</ISQL> command gathers all rows present in the first table but <Em>not</Em> in the second table (like a subtraction).</>,
      ]} />
      <Warning>ToDo: add example of UNION.</Warning>
    </Section>
  </Page>;
}
