import { Page, Section, Par, List, Warning, Info, Term, Em } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Summary() {
  return <Page>
    <Section>
      <Par>If we want to filter rows based on multiple conditions, we can combine them using <SQLDisplay inline>AND</SQLDisplay>, <SQLDisplay inline>OR</SQLDisplay> and <SQLDisplay inline>NOT</SQLDisplay>.</Par>
      <Warning>ToDo: add complicated example image with various conditions.</Warning>
      <Info>When evaluating the conditions, SQL always first resolves the comparisons, turning them into <SQLDisplay inline>TRUE</SQLDisplay>/<SQLDisplay inline>FALSE</SQLDisplay>. Then it applies any potential <SQLDisplay inline>NOT</SQLDisplay> operators, and at the end it resolves <SQLDisplay inline>AND</SQLDisplay>/<SQLDisplay inline>OR</SQLDisplay>. Brackets can be used to indicate a different operation order.</Info>
      <Par>A very different (and less common) way of applying multiple conditions is by <Term>merging</Term> two tables with identical columns.</Par>
      <List items={[
        <>The <SQLDisplay inline>UNION</SQLDisplay> command gathers all rows present in <Em>at least one</Em> of the two tables (like an <SQLDisplay inline>OR</SQLDisplay>).</>,
        <>The <SQLDisplay inline>INTERSECT</SQLDisplay> command gathers all rows present in <Em>both</Em> tables (like an <SQLDisplay inline>AND</SQLDisplay>).</>,
        <>The <SQLDisplay inline>EXCEPT</SQLDisplay> command gathers all rows present in the first table but <Em>not</Em> in the second table (like a subtraction).</>,
      ]} />
      <Warning>ToDo: add example of UNION.</Warning>
    </Section>
  </Page>;
}
