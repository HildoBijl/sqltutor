import { Page, Par, Section, Warning, Info, Term, Em } from '@/components';
import { ISQL } from '@/shared/components/SQLEditor';

export function Theory() {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA');
  const time = now.toLocaleTimeString('en-GB', { hour12: false });

  return <Page>
    <Section>
      <Par>When dealing with data in databases, it is very common to look for certain rows in a table: <Term>filtering</Term>. In <Term>SQL</Term> we can do so by appending the query with the keyword <ISQL>WHERE</ISQL>, followed by the condition we want to filter on. This condition can be set up in a myriad of ways, so let's browse through the possibilities.</Par>
    </Section>

    <Section title="Set up equality-based conditions">
      <Par>The most common filter is on equality: we want some row property to have a certain value. We usually set up this condition using an <Term>equals sign</Term>, in the format <ISQL>column_name = some_value</ISQL>. We can for instance find all companies with exactly 200.000 employees.</Par>
      <Warning>ToDo: add integer comparison figure.</Warning>
      <Par>Let's study what the DBMS does internally when it receives a query like this. First it pulls the table from memory. (Or at least, the necessary parts of it.) Then, for every row, it evaluates the condition. To do so, it replaces the column name <ISQL>num_employees</ISQL> by the respective value <Em>of that row</Em>. Then it checks if the left and right side of the equals sign have the same value. If so, the condition evaluates as <ISQL>TRUE</ISQL> and the DBMS keeps it around. If not, the condition evaluates as <ISQL>FALSE</ISQL> and the DBMS removes it from the output. After doing this for all rows, the remaining output is sent back.</Par>
      <Info>Note that this mechanism also allows us to compare two different columns with each other. We can set up a condition <ISQL>column1 = column2</ISQL>, which gets us all the rows where these two columns have equal value.</Info>
      <Par>We can set up a similar comparison with text. We could for instance find all companies in the 'Entertainment' industry. This comparison is case sensitive.</Par>
      <Warning>ToDo: add string comparison figure.</Warning>
      <Warning>When entering text in SQL, always use <Em>single</Em> quotation marks. This is how SQL recognizes it is a piece of text, and not a column name or similar. (Both "no quotation marks" and "double quotation marks" indicate column/table names in SQL.)</Warning>
      <Par>We could also do the opposite, and find all companies <Em>not</Em> in the Entertainment industry. In this case, we use the <Term>unequals sign</Term>, which in SQL is <ISQL>{`<>`}</ISQL>.</Par>
      <Warning>ToDo: add string unequals figure.</Warning>
    </Section>

    <Section title="Set up larger/smaller than conditions">
      <Par>Instead of requiring equality, we can set up larger/small than conditions. As is customary in mathematics, we use <ISQL>{`>`}</ISQL> for <Term>larger than</Term> and <ISQL>{`<`}</ISQL> for <Term>smaller than</Term>. We could for instance find all companies having <Em>more</Em> than 200.000 employees.</Par>
      <Warning>ToDo: add integer comparison figure.</Warning>
      <Info>You use <ISQL>{`>=`}</ISQL> for <Term>larger than or equal to</Term> and you use <ISQL>{`<=`}</ISQL> for <Term>smaller than or equal to</Term>. The = symbol that indicates "or equal" should always come at the end, and never at the start.</Info>
      <Par>This works similarly for text. SQL compares text lexicographically: whichever entry comes first in the dictionary is considered smaller. So one way to find all companies starting with an A is the following.</Par>
      <Warning>ToDo: add text comparison figure.</Warning>
      <Par>For dates/times, the comparison is done using earlier/later than. Earlier dates are considered smaller and later dates are considered larger.</Par>
      <Warning>ToDo: add date comparison figure.</Warning>
      <Info>Most DBMSs store a date/time value as an object with various functionalities: it is "aware" that it is a date or time. On SQL Valley we use the light-weight SQLite DBMS. This DBMS stores dates/times simply as piece of text, like "{date}" or "{time}". Luckily, if we compare this text lexicographically, we get exactly the same result as when we would compare it time-wise. So usually this SQLite quirk is not a problem.</Info>
    </Section>

    <Section title="Compare text">
      <Par>The <ISQL>LIKE</ISQL> comparison is a useful extra method for comparing text. Using <ISQL>LIKE</ISQL> is like using <ISQL>=</ISQL>, but it allows us to use the <ISQL>%</ISQL> symbol as a filler to represent "any text". We could for instance find all companies having "the" anywhere in their name.</Par>
      <Warning>ToDo: add like comparison figure.</Warning>
      <Info>For most DBMSs the <ISQL>LIKE</ISQL> comparison is case insensitive. For some DBMSs it is case sensitive, but there is a case insensitive <ISQL>ILIKE</ISQL> equivalent. To invert the result, you can use <ISQL>NOT LIKE</ISQL>.</Info>
    </Section>

    <Section title={<>Compare with <ISQL>NULL</ISQL></>}>
      <Par>You may remember that table cells can have the special value <ISQL>NULL</ISQL>, which means "unknown" or "not applicable". If you want to find all rows where some column has <ISQL>NULL</ISQL>, you <Em>cannot</Em> use the condition <ISQL>column_name = NULL</ISQL>. Instead, you have to use the special <ISQL>IS</ISQL> comparison, for instance through <ISQL>column_name IS NULL</ISQL> or similarly <ISQL>column_name IS NOT NULL</ISQL>.</Par>
      <Warning>ToDo: add IS NULL figure.</Warning>
      <Info>Because <ISQL>NULL</ISQL> means "unknown", any comparison involving <ISQL>NULL</ISQL> like for instance <ISQL>{`NULL < 10`}</ISQL> always resolves to <ISQL>NULL</ISQL>, and never to <ISQL>TRUE</ISQL> or <ISQL>FALSE</ISQL>. After all, it is also unknown whether "some unknown value" is smaller than <ISQL>10</ISQL>. Even the comparison <ISQL>NULL = NULL</ISQL> resolves to <ISQL>NULL</ISQL>, since two unknown values are not necessarily equal. Only <ISQL>NULL IS NULL</ISQL> resolves to <ISQL>TRUE</ISQL>.</Info>
    </Section>
  </Page>;
}
