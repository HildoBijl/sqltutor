import { Page, Section, Par, List, Warning, Info, Term, Em } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA');
  const time = now.toLocaleTimeString('en-GB', { hour12: false });

  return <Page>
    <Section>
      <Par>In database tables, the fields can take a large variety of values, but there are limitations. Let's study them.</Par>
    </Section>

    <Section title="Each column has a data type">
      <Par>In a database table, every column has a specific <Term>data type</Term>. Consider for instance the following table.</Par>
      <Warning>ToDo: add example table.</Warning>
      <Par>Note that some columns contain <Term>numbers</Term>, others contain <Term>text</Term>, and others have <Term>date/time</Term> values. A column with a certain type <Em>cannot</Em> contain values of another type!</Par>
      <Par>Optionally, columns may be given further restrictions. For instance, the <SQLDisplay inline>age</SQLDisplay> column may be set up to only allow positive values, and the <SQLDisplay inline>country</SQLDisplay> column may be set up to only take values from a list of existing countries. The set of all possible values that can be put in a column is called the <Term>domain</Term> of that column.</Par>
    </Section>

    <Section title={<>The <SQLDisplay inline>NULL</SQLDisplay> value</>}>
      <Par>The cells in a database table generally <Em>cannot</Em> be empty. However, they <Em>can</Em> be given the value <SQLDisplay inline>NULL</SQLDisplay>. This is a special value recognized by DBMSs. Having <SQLDisplay inline>NULL</SQLDisplay> in a cell usually means "This value is not known", although it may also mean "This value is not applicable here."</Par>
      <Warning>You can only put <SQLDisplay inline>NULL</SQLDisplay> in a cell, if the corresponding column allows this. This depends on the domain that is specified for that column.</Warning>
    </Section>

    <Section title="Specific data types">
      <Par>If we create a new database table, we need to specify the types of each of the columns. When doing so, we need to be a bit more specific than just mentioning "number" or "text". For example for numbers: are they whole numbers or floating point numbers? How large? With how much precision should we store them? The DBMS needs to know this, so it can reserve the right amount of storage space. This is specified through various specific types, each with their own name.</Par>
      <Info>The available types and their names slightly differ per Database Management System. The types described below are common data types supported by most DBMSs. Variations may occur, and the below list is by no means complete. Always check out the specifications for your own DBMS.</Info>
      <List items={[
        <><strong>Numbers</strong>
          <List items={[
            <>The <SQLDisplay inline>INTEGER</SQLDisplay> type stores whole numbers like <SQLDisplay inline>842</SQLDisplay>. It can store any whole number between -2,147,483,648 and 2,147,483,647. Alternatively, use <SQLDisplay inline>TINYINT</SQLDisplay> (0 to 255) or <SQLDisplay inline>SMALLINT</SQLDisplay> (-32,768 to 32,767) to save space, or use <SQLDisplay inline>BIGINT</SQLDisplay> to store larger numbers.</>,
            <>The <SQLDisplay inline>FLOAT</SQLDisplay> type stores floating-point numbers like <SQLDisplay inline>3,141.593</SQLDisplay>. Most DBMSs allow for fine-tuning the precision with which the numbers are stored.</>,
          ]} /></>,
        <><strong>Text</strong>
          <List items={[
            <>The <SQLDisplay inline>VARCHAR(n)</SQLDisplay> type stores a small piece of text like <SQLDisplay inline>'The Netherlands'</SQLDisplay>. The number <SQLDisplay inline>n</SQLDisplay> indicates the <Em>maximum</Em> number of characters that can be stored. Many DBMSs require <SQLDisplay inline>n &lt; 256</SQLDisplay>.</>,
            <>The <SQLDisplay inline>TEXT</SQLDisplay> type stores large pieces of text, up to 2,147,483,647 characters.</>,
          ]} /></>,
        <><strong>Date/time</strong>
          <List items={[
            <>The <SQLDisplay inline>DATE</SQLDisplay> type stores a date, like <SQLDisplay inline>{date}</SQLDisplay>.</>,
            <>The <SQLDisplay inline>TIME</SQLDisplay> type stores a specific time, like <SQLDisplay inline>{time}</SQLDisplay>. Millisecond or microsecond precision can be added.</>,
            <>The <SQLDisplay inline>DATETIME</SQLDisplay> type stores both a date and time, like <SQLDisplay inline>{`${date} ${time}`}</SQLDisplay>, and hence registers an exact moment in time.</>,
          ]} /></>,
        <><strong>Other</strong>
          <List items={[
            <>The <SQLDisplay inline>BOOLEAN</SQLDisplay> type stores either <SQLDisplay inline>TRUE</SQLDisplay> or <SQLDisplay inline>FALSE</SQLDisplay>.</>,
            <>Depending on which DBMS you are using, you may use the <SQLDisplay inline>JSON</SQLDisplay> type, the <SQLDisplay inline>XML</SQLDisplay> type, the <SQLDisplay inline>INTEGER[]</SQLDisplay> or <SQLDisplay inline>TEXT[]</SQLDisplay> types for lists, and many other options.</>,
          ]} /></>,
      ]} />
      <Par>It's not necessary to remember all these types. The main lesson is that every data type has limitations on how much it can store, which should be taken into account.</Par>
    </Section>
  </Page >;
}
