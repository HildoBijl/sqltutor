import { Page, Section, Par, Warning, Info, Term, Em } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Summary() {
  return <Page>
    <Section>
      <Par>To <Term>filter rows</Term> using <Term>SQL</Term> we add the <SQLDisplay inline>WHERE</SQLDisplay> keyword to our query, followed by a condition like <SQLDisplay inline>column_name = some_value</SQLDisplay>. We can use an equals <SQLDisplay inline>=</SQLDisplay>, unequals <SQLDisplay inline>{`<>`}</SQLDisplay>, larger than <SQLDisplay inline>{`>`}</SQLDisplay> or smaller than <SQLDisplay inline>{`<`}</SQLDisplay> comparison. For larger/smaller than, text is compared lexicographically and dates/times are compared time-wise, with earlier being smaller.</Par>
      <Info>ToDo: add string comparison figure. Show single quotation marks.</Info>
      <Warning>When entering string values in SQL, always use <Em>single</Em> qoutation marks. Both "no quotation marks" and "double quotation marks" represent column/table names.</Warning>
      <Par>There are various special comparison methods. We can use text comparison with wild cards, where for instance the condition <SQLDisplay inline>company_name LIKE '%the%'</SQLDisplay> finds all companies having "the" in their name. (The <SQLDisplay inline>%</SQLDisplay> symbol counts as "any piece of text".) If we want to check for <SQLDisplay inline>NULL</SQLDisplay> values, we have to use the <SQLDisplay inline>IS</SQLDisplay> comparison, for instance through the condition <SQLDisplay inline>column_name IS NULL</SQLDisplay>.</Par>
    </Section>
  </Page>
}
