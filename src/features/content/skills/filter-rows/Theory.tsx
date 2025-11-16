import { Page, Par, Section, Warning, Info, Term, Em } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA');
  const time = now.toLocaleTimeString('en-GB', { hour12: false });

  return <Page>
    <Par>When dealing with data in databases, it is very common to look for certain rows in a table: <Term>filtering</Term>. In <Term>SQL</Term> we can do so by appending the query with the keyword <SQLDisplay inline>WHERE</SQLDisplay>, followed by the condition we want to filter on. This condition can be set up in a myriad of ways, so let's browse through the possibilities.</Par>

    <Section title="Set up equality-based conditions">
      <Par>The most common filter is on equality: we want some row property to have a certain value. We usually set up this condition using an <Term>equals sign</Term>, in the format <SQLDisplay inline>column_name = some_value</SQLDisplay>. We can for instance find all companies with exactly 200.000 employees.</Par>
      <Warning>ToDo: add integer comparison figure.</Warning>
      <Par>Let's study what the DBMS does internally when it receives a query like this. First it pulls the table from memory. (Or at least, the necessary parts of it.) Then, for every row, it evaluates the condition. To do so, it replaces the column name <SQLDisplay inline>num_employees</SQLDisplay> by the respective value <Em>of that row</Em>. Then it checks if the left and right side of the equals sign have the same value. If so, the condition evaluates as <SQLDisplay inline>TRUE</SQLDisplay> and the DBMS keeps it around. If not, the condition evaluates as <SQLDisplay inline>FALSE</SQLDisplay> and the DBMS removes it from the output. After doing this for all rows, the remaining output is sent back.</Par>
      <Info>Note that this mechanism also allows us to compare two different columns with each other. We can set up a condition <SQLDisplay inline>column1 = column2</SQLDisplay>, which gets us all the rows where these two columns have equal value.</Info>
      <Par>We can set up a similar comparison with text. We could for instance find all companies in the 'Entertainment' industry. This comparison is case sensitive.</Par>
      <Warning>ToDo: add string comparison figure.</Warning>
      <Warning>When entering text in SQL, always use <Em>single</Em> quotation marks. This is how SQL recognizes it is a piece of text, and not a column name or similar. (Both "no quotation marks" and "double quotation marks" indicate column/table names in SQL.)</Warning>
      <Par>We could also do the opposite, and find all companies <Em>not</Em> in the Entertainment industry. In this case, we use the <Term>unequals sign</Term>, which in SQL is <SQLDisplay inline>{`<>`}</SQLDisplay>.</Par>
      <Warning>ToDo: add string unequals figure.</Warning>
    </Section>

    <Section title="Set up larger/smaller than conditions">
      <Par>Instead of requiring equality, we can set up larger/small than conditions. As is customary in mathematics, we use <SQLDisplay inline>{`>`}</SQLDisplay> for <Term>larger than</Term> and <SQLDisplay inline>{`<`}</SQLDisplay> for <Term>smaller than</Term>. We could for instance find all companies having <Em>more</Em> than 200.000 employees.</Par>
      <Warning>ToDo: add integer comparison figure.</Warning>
      <Par>This works similarly for text. SQL compares text lexicographically: whichever entry comes first in the dictionary is considered smaller. So one way to find all companies starting with an A is the following.</Par>
      <Warning>ToDo: add text comparison figure.</Warning>
      <Par>For dates/times, the comparison is done using earlier/later than. Earlier dates are considered smaller and later dates are considered larger.</Par>
      <Warning>ToDo: add date comparison figure.</Warning>
      <Info>Most DBMSs store a date/time value as an object with various functionalities: it is "aware" that it is a date or time. On SQL Valley we use the light-weight SQLite DBMS. This DBMS stores dates/times simply as piece of text, like "{date}" or "{time}". Luckily, if we compare this text lexicographically, we get exactly the same result as when we would compare it time-wise. So usually this SQLite quirk is not a problem.</Info>
    </Section>

    <Section title="Set up special comparisons">
      <Par>There are dozens of extra comparison options. One possibility is to add wild cards to text comparisons. This is done through the <SQLDisplay inline>LIKE</SQLDisplay> comparison. Using <SQLDisplay inline>LIKE</SQLDisplay> is like using <SQLDisplay inline>=</SQLDisplay>, but it allows us to use the <SQLDisplay inline>%</SQLDisplay> symbol as a filler to represent "any text". We could for instance find all companies having "the" anywhere in their name.</Par>
      <Warning>ToDo: add like comparison figure.</Warning>
      <Info>For most DBMSs the <SQLDisplay inline>LIKE</SQLDisplay> comparison is case insensitive. For some DBMSs it is case sensitive, but there is a case insensitive <SQLDisplay inline>ILIKE</SQLDisplay> equivalent. To invert the result, you can use <SQLDisplay inline>NOT LIKE</SQLDisplay>.</Info>
      <Par>You may remember that table cells can have the special value <SQLDisplay inline>NULL</SQLDisplay> which means "unknown" or "not applicable". You can filter for <SQLDisplay inline>NULL</SQLDisplay> values using the comparison <SQLDisplay inline>column_name IS NULL</SQLDisplay> or similarly <SQLDisplay inline>column_name IS NOT NULL</SQLDisplay>.</Par>
      <Warning>ToDo: add IS NULL figure.</Warning>
      <Warning>The <SQLDisplay inline>NULL</SQLDisplay> value is special in that it represents "some unknown value". That is why the equals comparison <SQLDisplay inline>=</SQLDisplay> <Em>never</Em> works for <SQLDisplay inline>NULL</SQLDisplay>. That is, <SQLDisplay inline>NULL = NULL</SQLDisplay> always evaluates as <SQLDisplay inline>FALSE</SQLDisplay>. The reason is that "some unknown value" is generally not equal to any other unrelated "unknown value". If you want to check for <SQLDisplay inline>NULL</SQLDisplay> values, always use <SQLDisplay inline>IS</SQLDisplay> instead of <SQLDisplay inline>=</SQLDisplay>.</Warning>
    </Section>
  </Page>;
}
