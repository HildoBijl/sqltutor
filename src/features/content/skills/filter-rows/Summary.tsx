import { Page, Section, Par, Warning, Info, Term, Em } from '@/components';
import { ISQL } from '@/shared/components/SQLEditor';

export function Summary() {
  return <Page>
    <Section>
      <Par>To <Term>filter rows</Term> using <Term>SQL</Term> we add the <ISQL>WHERE</ISQL> keyword to our query, followed by a condition like <ISQL>column_name = some_value</ISQL>. We can set up a comparison for equals <ISQL>=</ISQL>, unequals <ISQL>{`<>`}</ISQL>, larger than <ISQL>{`>`}</ISQL>, smaller than <ISQL>{`<`}</ISQL>, larger-or-equal <ISQL>{`>=`}</ISQL>, or smaller-or-equal <ISQL>{`<=`}</ISQL>. For larger/smaller than, text is compared lexicographically and dates/times are compared time-wise, with earlier being smaller.</Par>
      <Info>ToDo: add string comparison figure. Show single quotation marks.</Info>
      <Warning>When entering string values in SQL, always use <Em>single</Em> qoutation marks. Both "no quotation marks" and "double quotation marks" represent column/table names.</Warning>
      <Par>There are various special comparison methods. We can use text comparison with wild cards, where for instance the condition <ISQL>company_name LIKE '%the%'</ISQL> finds all companies having "the" in their name. (The <ISQL>%</ISQL> symbol counts as "any piece of text".) If we want to check for <ISQL>NULL</ISQL> values, we have to use the <ISQL>IS</ISQL> comparison, for instance through the condition <ISQL>column_name IS NULL</ISQL>.</Par>
    </Section>
  </Page>;
}
