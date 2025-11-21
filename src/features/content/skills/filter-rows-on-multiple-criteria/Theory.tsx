import { Page, Par, Section, Warning, Info, Term, Em } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to set up a filter in SQL with one condition. In practice, there are usually multiple conditions that interact with each other in various ways. Let's take a look at how we can combine multiple conditions in SQL.</Par>
    </Section>

    <Section title={<>Combine conditions using <SQLDisplay inline>AND</SQLDisplay></>}>
      <Par>Suppose that we want to find all Consulting companies from the Netherlands. We now have two conditions: we want the company to be from the Netherlands <Em>and</Em> we want it to be in Consulting. To combine these two conditions in SQL, we can use the <SQLDisplay inline>AND</SQLDisplay> keyword.</Par>
      <Warning>ToDo: add figure with example.<SQLDisplay>{`SELECT *
FROM companies
WHERE country = 'Netherlands' AND industry = 'Consulting'`}</SQLDisplay></Warning>
      <Par>The given query makes sense from a language point of view, but let's take a look at what SQL does behind the scenes. SQL sees one large condition, being <SQLDisplay inline>country='Netherlands' AND industry='Consulting'</SQLDisplay>. For every row, it will evaluate whether this full condition resolves to <SQLDisplay inline>TRUE</SQLDisplay> or <SQLDisplay inline>FALSE</SQLDisplay>. When evaluating conditions, SQL first looks at comparisons (the <SQLDisplay inline>=</SQLDisplay> symbols here) and resolves them. Only then does it look at keywords like <SQLDisplay inline>AND</SQLDisplay> to resolve those. The keyword <SQLDisplay inline>AND</SQLDisplay> always needs a <SQLDisplay inline>TRUE</SQLDisplay>/<SQLDisplay inline>FALSE</SQLDisplay> value on either side, and it <Em>only</Em> resolves to <SQLDisplay inline>TRUE</SQLDisplay> if <Em>both</Em> sides are <SQLDisplay inline>TRUE</SQLDisplay>. Otherwise it resolves as <SQLDisplay inline>FALSE</SQLDisplay>.</Par>
      <Info>Let's study a tiny example to clarify the above procedure. Suppose the current row we are considering is a company from the Netherlands that is in the Entertainment industry. In this case SQL resolves <SQLDisplay inline>country='Netherlands'</SQLDisplay> to <SQLDisplay inline>TRUE</SQLDisplay> and <SQLDisplay inline>industry='Consulting'</SQLDisplay> to <SQLDisplay inline>FALSE</SQLDisplay>. The full condition hence simplifies to <SQLDisplay inline>TRUE AND FALSE</SQLDisplay>. Then SQL resolves the <SQLDisplay inline>AND</SQLDisplay> keyword. Since it does <Em>not</Em> have <SQLDisplay inline>TRUE</SQLDisplay> twice, it resolves to <SQLDisplay inline>FALSE</SQLDisplay>. With the full condition eventually resolving to <SQLDisplay inline>FALSE</SQLDisplay>, SQL will filter this row out and not return it as output.</Info>
      <Warning>ToDo: turn the above info box into a drawing. Works better.</Warning>
    </Section>


    <Section title={<>Combine conditions using <SQLDisplay inline>OR</SQLDisplay></>}>
      <Par>Very similar to the <SQLDisplay inline>AND</SQLDisplay> keyword is the <SQLDisplay inline>OR</SQLDisplay> keyword. This keyword resolves to <SQLDisplay inline>TRUE</SQLDisplay> when <Em>at least one</Em> of the two given values is <SQLDisplay inline>TRUE</SQLDisplay>, and it is <SQLDisplay inline>FALSE</SQLDisplay> only when <Em>both</Em> values are <SQLDisplay inline>FALSE</SQLDisplay>.</Par>
      <Warning>ToDo: example image with OR<SQLDisplay>{`SELECT *
FROM companies
WHERE country = 'Netherlands' OR country = 'United States'`}</SQLDisplay></Warning>
      <Warning>It is possible (and common) to combine the <SQLDisplay inline>AND</SQLDisplay> and <SQLDisplay inline>OR</SQLDisplay> keywords. When you do so, <Em>always</Em> use brackets to separate them. After all, it is very unclear what <SQLDisplay inline>TRUE OR TRUE AND FALSE</SQLDisplay> resolves to, while both <SQLDisplay inline>(TRUE OR TRUE) AND FALSE</SQLDisplay> and <SQLDisplay inline>TRUE OR (TRUE AND FALSE)</SQLDisplay> have a clear result.</Warning>
      <Info><SQLDisplay inline>OR</SQLDisplay> and <SQLDisplay inline>AND</SQLDisplay> have interesting behavior when it comes to <SQLDisplay inline>NULL</SQLDisplay>. Keep in mind that <SQLDisplay inline>NULL</SQLDisplay> means "unknown". For this reason, both <SQLDisplay inline>TRUE AND NULL</SQLDisplay> as well as <SQLDisplay inline>FALSE OR NULL</SQLDisplay> resolve to <SQLDisplay inline>NULL</SQLDisplay>: their outcomes are unknown. However, <SQLDisplay inline>FALSE AND NULL</SQLDisplay> will certainly be <SQLDisplay inline>FALSE</SQLDisplay>, and <SQLDisplay inline>TRUE OR NULL</SQLDisplay> will always be <SQLDisplay inline>TRUE</SQLDisplay>. No matter what value this unknown <SQLDisplay inline>NULL</SQLDisplay> may have here, the outcome is already clear.</Info>
    </Section>

    <Section title={<>Negate conditions using <SQLDisplay inline>NOT</SQLDisplay></>}>
      <Par>Suppose that we want to find all companies that are <Em>not</Em> Consulting companies from the Netherlands. To do so, we can use the <SQLDisplay inline>NOT</SQLDisplay> keyword.</Par>
      <Warning>ToDo: create example image. <SQLDisplay>{`SELECT *
FROM companies
WHERE NOT (country = 'Netherlands' AND industry = 'Consulting')`}</SQLDisplay></Warning>
      <Par>The <SQLDisplay inline>NOT</SQLDisplay> keyword expects a <SQLDisplay inline>TRUE</SQLDisplay>/<SQLDisplay inline>FALSE</SQLDisplay> value after it. It then flips this value around: <SQLDisplay inline>NOT TRUE</SQLDisplay> resolves to <SQLDisplay inline>FALSE</SQLDisplay> and vice versa. Also, <SQLDisplay inline>NOT NULL</SQLDisplay> resolves to <SQLDisplay inline>NULL</SQLDisplay>.</Par>
      <Info>A common trick from logic theory is the expansion of brackets with <SQLDisplay inline>NOT</SQLDisplay> in front of it. If we have any two conditions <SQLDisplay inline>c1</SQLDisplay> and <SQLDisplay inline>c2</SQLDisplay>, then we can also rewrite <SQLDisplay inline>NOT (c1 AND c2)</SQLDisplay> as <SQLDisplay inline>NOT c1 OR NOT c2</SQLDisplay>. Similarly, we can rewrite <SQLDisplay inline>NOT (c1 OR c2)</SQLDisplay> as <SQLDisplay inline>NOT c1 AND NOT c2</SQLDisplay>. In other words: pulling a <SQLDisplay inline>NOT</SQLDisplay> inside brackets will turn <SQLDisplay inline>AND</SQLDisplay> into <SQLDisplay inline>OR</SQLDisplay> and vice versa.</Info>
      <Par>Using logic theory, we could rewrite the above query to a different version that does the exact same thing. A (somewhat inconsistent) example is</Par>
      <Par><SQLDisplay>{`SELECT *
FROM companies
WHERE NOT country = 'Netherlands' OR industry <> 'Consulting'`}</SQLDisplay></Par>
      <Info>The <SQLDisplay inline>NOT</SQLDisplay> keyword is evaluated <Em>after</Em> the comparison, but <Em>before</Em> the <SQLDisplay inline>OR</SQLDisplay> keyword. The above condition is equivalent to <SQLDisplay inline>{`(NOT (country = 'Netherlands')) OR (industry <> 'Consulting')`}</SQLDisplay>. The brackets can be added for clarity, but SQL programmers should know the evaluation orders, so usually they are omitted.</Info>
    </Section>

    <Section title={<>Merge tables using <SQLDisplay inline>UNION</SQLDisplay>, <SQLDisplay inline>INTERSECT</SQLDisplay> and <SQLDisplay inline>EXCEPT</SQLDisplay></>}>
      <Par>If we have two tables with identical columns, we can <Term>merge</Term> them together. There are various ways to do so. The first is through the <SQLDisplay inline>UNION</SQLDisplay> operator. This operator merges two tables, and it keeps a row if it is in <Em>either</Em> (or both) of the given tables. So it kind of functions like an <SQLDisplay inline>OR</SQLDisplay>.</Par>
      <Warning>ToDo: create image.</Warning>
      <Par>A similar command is the <SQLDisplay inline>INTERSECT</SQLDisplay> operator. This one also merges two tables, but it only keeps a row if it is in <Em>both</Em> tables. So it more or less acts like an <SQLDisplay inline>AND</SQLDisplay>.</Par>
      <Warning>ToDo: create image.</Warning>
      <Par>The final merging operator is the <SQLDisplay inline>EXCEPT</SQLDisplay>. This one functions as a subtraction: it takes the first table, and it then removes all the rows from it that are in the second table.</Par>
      <Warning>ToDo: create image.</Warning>
      <Par>Since the <SQLDisplay inline>UNION</SQLDisplay>, <SQLDisplay inline>INTERSECT</SQLDisplay> and <SQLDisplay inline>EXCEPT</SQLDisplay> keywords do very similar things as <SQLDisplay inline>AND</SQLDisplay>, <SQLDisplay inline>OR</SQLDisplay> and <SQLDisplay inline>NOT</SQLDisplay>, their usage is not so common, but there are a few edge cases where they can be really useful.</Par>
      <Info>Contrary to set theory in mathematics, SQL allows duplicate rows. The <SQLDisplay inline>UNION</SQLDisplay>, <SQLDisplay inline>INTERSECT</SQLDisplay> and <SQLDisplay inline>EXCEPT</SQLDisplay> have fixed rules of how to deal with duplicate rows. If table A has five identical rows, and table B has three identical rows, then their <SQLDisplay inline>UNION</SQLDisplay> has five rows (maximum), their <SQLDisplay inline>INTERSECT</SQLDisplay> has three rows (minimum) and their <SQLDisplay inline>EXCEPT</SQLDisplay> has two rows (A minus B).</Info>
    </Section>

    <Section title="Use common SQL short-cuts">
      <Par>There are various short-cuts in SQL that allow you to write basic queries more succinctly. For instance, if we want to find all companies having between 200.000 and 300.000 employees (inclusive), we could use the condition <SQLDisplay inline>{`num_employees >= 200000 AND num_employees <= 300000`}</SQLDisplay>, or we could do the exact same thing using <SQLDisplay inline>BETWEEN</SQLDisplay>.</Par>
      <Warning>ToDo: set up image with BETWEEN.</Warning>
      <Par>Or if we want to get all companies from the Netherlands and its adjacent countries (Belgium and Germany), we could use the condition <SQLDisplay inline>{`country = 'Netherlands' OR country = 'Belgium' OR country = 'Germany'`}</SQLDisplay> but this is rather long. We could also create a list of countries and check if the respective country is in this list. This is done through the <SQLDisplay inline>IN</SQLDisplay> keyword.</Par>
      <Warning>ToDo: set up image with IN (list).</Warning>
      <Par>Given how broad SQL is, there are dozens more short-cuts like this. If you ever see a command you don't recognize, simply look it up to see how it works.</Par>
    </Section>
  </Page>;
}
