import { Page, Par, Section, Warning, Info, Term, Em } from '@/components';
import { ISQL, SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to set up a filter in SQL with one condition. In practice, there are usually multiple conditions that interact with each other in various ways. Let's take a look at how we can combine multiple conditions in SQL.</Par>
    </Section>

    <Section title={<>Combine conditions using <ISQL>AND</ISQL></>}>
      <Par>Suppose that we want to find all Consulting companies from the Netherlands. We now have two conditions: we want the company to be from the Netherlands <Em>and</Em> we want it to be in Consulting. To combine these two conditions in SQL, we can use the <ISQL>AND</ISQL> keyword.</Par>
      <Warning>ToDo: add figure with example.<SQLDisplay>{`SELECT *
FROM companies
WHERE country = 'Netherlands' AND industry = 'Consulting'`}</SQLDisplay></Warning>
      <Par>The given query makes sense from a language point of view, but let's take a look at what SQL does behind the scenes. SQL sees one large condition, being <ISQL>country='Netherlands' AND industry='Consulting'</ISQL>. For every row, it will evaluate whether this full condition resolves to <ISQL>TRUE</ISQL> or <ISQL>FALSE</ISQL>. When evaluating conditions, SQL first looks at comparisons (the <ISQL>=</ISQL> symbols here) and resolves them. Only then does it look at keywords like <ISQL>AND</ISQL> to resolve those. The keyword <ISQL>AND</ISQL> always needs a <ISQL>TRUE</ISQL>/<ISQL>FALSE</ISQL> value on either side, and it <Em>only</Em> resolves to <ISQL>TRUE</ISQL> if <Em>both</Em> sides are <ISQL>TRUE</ISQL>. Otherwise it resolves as <ISQL>FALSE</ISQL>.</Par>
      <Info>Let's study a tiny example to clarify the above procedure. Suppose the current row we are considering is a company from the Netherlands that is in the Entertainment industry. In this case SQL resolves <ISQL>country='Netherlands'</ISQL> to <ISQL>TRUE</ISQL> and <ISQL>industry='Consulting'</ISQL> to <ISQL>FALSE</ISQL>. The full condition hence simplifies to <ISQL>TRUE AND FALSE</ISQL>. Then SQL resolves the <ISQL>AND</ISQL> keyword. Since it does <Em>not</Em> have <ISQL>TRUE</ISQL> twice, it resolves to <ISQL>FALSE</ISQL>. With the full condition eventually resolving to <ISQL>FALSE</ISQL>, SQL will filter this row out and not return it as output.</Info>
      <Warning>ToDo: turn the above info box into a drawing. Works better.</Warning>
    </Section>

    <Section title={<>Combine conditions using <ISQL>OR</ISQL></>}>
      <Par>Very similar to the <ISQL>AND</ISQL> keyword is the <ISQL>OR</ISQL> keyword. This keyword resolves to <ISQL>TRUE</ISQL> when <Em>at least one</Em> of the two given values is <ISQL>TRUE</ISQL>, and it is <ISQL>FALSE</ISQL> only when <Em>both</Em> values are <ISQL>FALSE</ISQL>.</Par>
      <Warning>ToDo: example image with OR<SQLDisplay>{`SELECT *
FROM companies
WHERE country = 'Netherlands' OR country = 'United States'`}</SQLDisplay></Warning>
      <Warning>It is possible (and common) to combine the <ISQL>AND</ISQL> and <ISQL>OR</ISQL> keywords. When you do so, <Em>always</Em> use brackets to separate them. After all, it is very unclear what <ISQL>TRUE OR TRUE AND FALSE</ISQL> resolves to, while both <ISQL>(TRUE OR TRUE) AND FALSE</ISQL> and <ISQL>TRUE OR (TRUE AND FALSE)</ISQL> have a clear result.</Warning>
      <Info><ISQL>OR</ISQL> and <ISQL>AND</ISQL> have interesting behavior when it comes to <ISQL>NULL</ISQL>. Keep in mind that <ISQL>NULL</ISQL> means "unknown". For this reason, both <ISQL>TRUE AND NULL</ISQL> as well as <ISQL>FALSE OR NULL</ISQL> resolve to <ISQL>NULL</ISQL>: their outcomes are unknown. However, <ISQL>FALSE AND NULL</ISQL> will certainly be <ISQL>FALSE</ISQL>, and <ISQL>TRUE OR NULL</ISQL> will always be <ISQL>TRUE</ISQL>. No matter what value this unknown <ISQL>NULL</ISQL> may have here, the outcome is already clear.</Info>
    </Section>

    <Section title={<>Negate conditions using <ISQL>NOT</ISQL></>}>
      <Par>Suppose that we want to find all companies that are <Em>not</Em> Consulting companies from the Netherlands. To do so, we can use the <ISQL>NOT</ISQL> keyword.</Par>
      <Warning>ToDo: create example image. <SQLDisplay>{`SELECT *
FROM companies
WHERE NOT (country = 'Netherlands' AND industry = 'Consulting')`}</SQLDisplay></Warning>
      <Par>The <ISQL>NOT</ISQL> keyword expects a <ISQL>TRUE</ISQL>/<ISQL>FALSE</ISQL> value after it. It then flips this value around: <ISQL>NOT TRUE</ISQL> resolves to <ISQL>FALSE</ISQL> and vice versa. Also, <ISQL>NOT NULL</ISQL> resolves to <ISQL>NULL</ISQL>.</Par>
      <Info>A common trick from logic theory is the expansion of brackets with <ISQL>NOT</ISQL> in front of it. If we have any two conditions <ISQL>c1</ISQL> and <ISQL>c2</ISQL>, then we can also rewrite <ISQL>NOT (c1 AND c2)</ISQL> as <ISQL>NOT c1 OR NOT c2</ISQL>. Similarly, we can rewrite <ISQL>NOT (c1 OR c2)</ISQL> as <ISQL>NOT c1 AND NOT c2</ISQL>. In other words: pulling a <ISQL>NOT</ISQL> inside brackets will turn <ISQL>AND</ISQL> into <ISQL>OR</ISQL> and vice versa.</Info>
      <Par>Using logic theory, we could rewrite the above query to a different version that does the exact same thing. A (somewhat inconsistent) example is</Par>
      <Par><SQLDisplay>{`SELECT *
FROM companies
WHERE NOT country = 'Netherlands' OR industry <> 'Consulting'`}</SQLDisplay></Par>
      <Info>The <ISQL>NOT</ISQL> keyword is evaluated <Em>after</Em> the comparison, but <Em>before</Em> the <ISQL>OR</ISQL> keyword. The above condition is equivalent to <ISQL>{`(NOT (country = 'Netherlands')) OR (industry <> 'Consulting')`}</ISQL>. The brackets can be added for clarity, but SQL programmers should know the evaluation orders, so usually they are omitted.</Info>
    </Section>

    <Section title={<>Merge tables using <ISQL>UNION</ISQL>, <ISQL>INTERSECT</ISQL> and <ISQL>EXCEPT</ISQL></>}>
      <Par>If we have two tables with identical columns, we can <Term>merge</Term> them together. There are various ways to do so. The first is through the <ISQL>UNION</ISQL> operator. This operator merges two tables, and it keeps a row if it is in <Em>either</Em> (or both) of the given tables. So it kind of functions like an <ISQL>OR</ISQL>.</Par>
      <Warning>ToDo: create image.</Warning>
      <Par>A similar command is the <ISQL>INTERSECT</ISQL> operator. This one also merges two tables, but it only keeps a row if it is in <Em>both</Em> tables. So it more or less acts like an <ISQL>AND</ISQL>.</Par>
      <Warning>ToDo: create image.</Warning>
      <Par>The final merging operator is the <ISQL>EXCEPT</ISQL>. This one functions as a subtraction: it takes the first table, and it then removes all the rows from it that are in the second table.</Par>
      <Warning>ToDo: create image.</Warning>
      <Par>Since the <ISQL>UNION</ISQL>, <ISQL>INTERSECT</ISQL> and <ISQL>EXCEPT</ISQL> keywords do very similar things as <ISQL>AND</ISQL>, <ISQL>OR</ISQL> and <ISQL>NOT</ISQL>, their usage is not so common, but there are a few edge cases where they can be really useful.</Par>
      <Info>Contrary to set theory in mathematics, SQL allows duplicate rows. The <ISQL>UNION</ISQL>, <ISQL>INTERSECT</ISQL> and <ISQL>EXCEPT</ISQL> have fixed rules of how to deal with duplicate rows. If table A has five identical rows, and table B has three identical rows, then their <ISQL>UNION</ISQL> has five rows (maximum), their <ISQL>INTERSECT</ISQL> has three rows (minimum) and their <ISQL>EXCEPT</ISQL> has two rows (A minus B).</Info>
    </Section>

    <Section title="Use common SQL short-cuts">
      <Par>There are various short-cuts in SQL that allow you to write basic queries more succinctly. For instance, if we want to find all companies having between 200.000 and 300.000 employees (inclusive), we could use the condition <ISQL>{`num_employees >= 200000 AND num_employees <= 300000`}</ISQL>, or we could do the exact same thing using <ISQL>BETWEEN</ISQL>.</Par>
      <Warning>ToDo: set up image with BETWEEN.</Warning>
      <Par>Or if we want to get all companies from the Netherlands and its adjacent countries (Belgium and Germany), we could use the condition <ISQL>{`country = 'Netherlands' OR country = 'Belgium' OR country = 'Germany'`}</ISQL> but this is rather long. We could also create a list of countries and check if the respective country is in this list. This is done through the <ISQL>IN</ISQL> keyword.</Par>
      <Warning>ToDo: set up image with IN (list).</Warning>
      <Par>Given how broad SQL is, there are dozens more short-cuts like this. If you ever see a command you don't recognize, simply look it up to see how it works.</Par>
    </Section>
  </Page>;
}
