import { Page, Section, Par, List, Warning, Info, Term, Em, Link } from '@/components';
import { ISQL, SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA');
  const time = now.toLocaleTimeString('en-GB', { hour12: false });
  const lastWeek = new Date();
  lastWeek.setDate(now.getDate() - 7);
  const dateLastWeek = lastWeek.toLocaleDateString('en-CA');
  const timeLastWeek = lastWeek.toLocaleTimeString('en-GB', { hour12: false });

  return <Page>
    <Section>
      <Par>We know how to <Term>rename</Term> columns using the (optional) <ISQL>AS</ISQL> command, but we can take this one step further. We can <Term>process columns</Term>: manipulate and/or combine various columns to create new ones. We'll first study the general application of this idea, and then dive into the numerous ways of <Em>how</Em> to process column values.</Par>
    </Section>

    <Section title="Set up and apply processed columns">
      <Par>Suppose that we have a list of goods with corresponding prices before tax. We could calculate their prices after tax by multiplying them by a factor, for instance <ISQL>1.2</ISQL>. (Or whatever the tax rate is.) In SQL it is possible to directly create a new column <ISQL>price_with_tax</ISQL> whose value is <ISQL>1.2 * price</ISQL>. This is done through the following query.</Par>
      <Warning>ToDo: set up figure showing this. <SQLDisplay>{`SELECT name, price, 1.2*price AS price_with_tax
FROM inventory`}</SQLDisplay></Warning>
      <Par>If you already know how to apply <Link to="/skill/filter-rows" target="_self">filtering</Link>: you can use these calculated quantities in the filter too. Just add <ISQL>{`WHERE 1.2*price < 1000`}</ISQL> or similar to your query. And identically, if you already know how to apply <Link to="/skill/sort-rows">sorting</Link>: you can sort based on these calculated quantities as well. Just add <ISQL>{`ORDER BY 1.2*price DESC`}</ISQL> or similar.</Par>
      <Info>You usually <Em>cannot</Em> use names of newly created column like <ISQL>price_with_tax</ISQL> in your filter, because the <ISQL>WHERE</ISQL> command is executed <Em>before</Em> the <ISQL>SELECT</ISQL> command. You <Em>can</Em> use these new columns in your sorting though, because the <ISQL>ORDER BY</ISQL> command is executed <Em>after</Em> the <ISQL>SELECT</ISQL> command.</Info>
    </Section>

    <Section title="Process numerical values">
      <Par>When processing numeric columns, we mainly use arithmetic. The most common operations are the following.</Par>
      <List items={[
        <><Term>Addition</Term>: <ISQL>5 + 2</ISQL> becomes <ISQL>7</ISQL>.</>,
        <><Term>Subtraction</Term>: <ISQL>5 - 2</ISQL> becomes <ISQL>3</ISQL>.</>,
        <><Term>Multiplication</Term>: <ISQL>5 * 2</ISQL> becomes <ISQL>10</ISQL>.</>,
        <><Term>Division</Term>: <ISQL>5 / 2</ISQL> becomes <ISQL>2.5</ISQL>.</>,
        <><Term>Modulo</Term>/<Term>Integer remainder</Term>: <ISQL>5 % 2</ISQL> becomes <ISQL>1</ISQL>.</>,
      ]} />
      <Par>Next to general arithmetic, there is a wide variety of functions that can be used.</Par>
      <List items={[
        <><Term>Rounding</Term>: <ISQL>ROUND(x)</ISQL> rounds <ISQL>x</ISQL> to the nearest integer. <ISQL>ROUND(x, 2)</ISQL> rounds <ISQL>x</ISQL> to two decimals. <ISQL>FLOOR(x)</ISQL> rounds <ISQL>x</ISQL> <Em>down</Em> to the nearest integer lower than <ISQL>x</ISQL>. <ISQL>CEIL(x)</ISQL> rounds <ISQL>x</ISQL> <Em>up</Em> to the nearest integer higher than <ISQL>x</ISQL>.</>,
        <><Term>Maximum</Term>/<Term>Minimum</Term>: <ISQL>GREATEST(x1, x2, ...)</ISQL> gives the highest value of the numbers <ISQL>x1</ISQL>, <ISQL>x2</ISQL>, and so forth. <ISQL>LEAST(x1, x2, ...)</ISQL> gives the lowest value of the numbers <ISQL>x1</ISQL>, <ISQL>x2</ISQL>, etcetera.</>,
        <><Term>Mathematical functions</Term>: <ISQL>POWER(x, y)</ISQL> calculates <ISQL>x^y</ISQL>. <ISQL>SQRT(x)</ISQL> calculates the square root of <ISQL>x</ISQL>. <ISQL>EXP(x)</ISQL> calculates <ISQL>e^x</ISQL>. <ISQL>ABS(x)</ISQL> gives the absolute value of <ISQL>x</ISQL>. And there is a wide variety of other functions, like, <ISQL>LOG(x)</ISQL>, <ISQL>SIN(x)</ISQL>, <ISQL>ATAN(x)</ISQL>, and so forth.</>
      ]} />
      <Warning>Every DBMS has its own variations of these functions. For instance, <ISQL>LOG(x)</ISQL> is a base-10 logarithm in MySQL and a natural logarithm in PostgreSQL. Always check out the specifications for your DBMS.</Warning>
      <Par></Par>
    </Section>

    <Section title="Process text values">
      <Par>The most common thing to do with text is concatenate multiple pieces of text. This is done through <ISQL>||</ISQL>.</Par>
      <Warning>ToDo: add example of concatenating names. <SQLDisplay>{`SELECT
  first_name,
  last_name,
  first_name || ' ' || last_name AS full_name
FROM customers;`}</SQLDisplay>
      </Warning>
      <Info>The notation with <ISQL>||</ISQL> works in all large DBMSs. Some DBMSs also allow <ISQL>CONCAT(first_name, ' ', last_name)</ISQL> while others allow <ISQL>first_name + ' ' + last_name</ISQL>. As usual, things vary per DBMS.</Info>
      <Par>There is a large variety of further text processing functions.</Par>
      <List items={[
        <><Term>Text length</Term>: <ISQL>LENGTH('Hello world')</ISQL> becomes <ISQL>11</ISQL>.</>,
        <><Term>Trimming</Term>: <ISQL>TRIM(' user input ')</ISQL> becomes <ISQL>'user input'</ISQL>, removing spaces at the start/end.</>,
        <><Term>Upper/lower case</Term>: <ISQL>UPPER('Hello')</ISQL> becomes <ISQL>'HELLO'</ISQL> and <ISQL>LOWER('Hello')</ISQL> becomes <ISQL>'hello'</ISQL>. This is useful when checking if two columns <ISQL>A</ISQL> and <ISQL>B</ISQL> are (case-insensitive) equal to one another: just check if <ISQL>LOWER(A) = LOWER(B)</ISQL>.</>,
        <><Term>Text replace</Term>: <ISQL>REPLACE('Hello world', 'world', 'SQL Valley')</ISQL> becomes <ISQL>'Hello SQL Valley'</ISQL>.</>,
        <><Term>Text search</Term>: <ISQL>CHARINDEX('wor', 'Hello world')</ISQL> becomes <ISQL>7</ISQL>. Note that this is case sensitive: <ISQL>CHARINDEX('wor', 'Hello World')</ISQL> becomes <ISQL>0</ISQL> which indicates "not found".</>,
        <><Term>Part of text</Term>: <ISQL>SUBSTRING('Hello world', 3, 7)</ISQL> becomes <ISQL>'llo wor'</ISQL>. The first number is the <Em>start</Em> and the second number is the <Em>length</Em>. SQL is 1-indexed: start at <ISQL>1</ISQL> to start at the beginning.</>,
      ]} />
    </Section>

    <Section title="Process date/time values">
      <Par>Working with dates and times is always tricky in SQL, since the various DBMSs have implemented things rather differently. The only thing they agree on is how to get the <Term>current time</Term>. This is done using the keywords <ISQL>CURRENT_DATE</ISQL> for <ISQL>{date}</ISQL>, <ISQL>CURRENT_TIME</ISQL> for <ISQL>{time}</ISQL>, or <ISQL>CURRENT_TIMESTAMP</ISQL> for <ISQL>{`${date} ${time}`}</ISQL>, although many DBMSs also use the short-hand <ISQL>NOW()</ISQL>.</Par>
      <Par>Often we want to do <Term>arithmetics with time</Term>. For instance, we want to take a date and subtract a week. In SQLite (which is used here on SQL Valley) this is done through the <ISQL>DATE</ISQL> function, the <ISQL>TIME</ISQL> function, or the <ISQL>DATETIME</ISQL> function, depending on which data type you're using. You pass this function the given date/time, and then add one or more modifiers like <ISQL>'-7days'</ISQL>. So <ISQL>{`DATE(${date}, '-7days')`}</ISQL> becomes <ISQL>{dateLastWeek}</ISQL>. Other DBMSs have different time manipulation functions.</Par>
      <Par>If we have a date/time value, we can <Term>display</Term>/<Term>format</Term> this in various ways. In SQLite this is done using the <ISQL>STRFTIME(format, datetime)</ISQL> function. For instance <ISQL>STRFTIME('%Y-%m-%d %H:%M:%S', DATETIME(CURRENT_TIMESTAMP, '-7days'))</ISQL> gives <ISQL>{`${dateLastWeek} ${timeLastWeek}`}</ISQL>. The special characters like <ISQL>%H</ISQL> denote things like "Two-digit hour".</Par>
      <Par>A final thing that is often done with dates is <Term>extract parameters</Term> from it, like the month or the year. Pretty much <Em>all</Em> DBMSs use the <ISQL>EXTRACT</ISQL> function for this, except for SQLite. To get for instance the month in SQLite, you can use the by now familiar <ISQL>STRFTIME</ISQL> function. For instance <ISQL>STRFTIME('%m', CURRENT_DATE)</ISQL> gives the text <ISQL>{`'${now.getMonth() + 1}'`}</ISQL>. Note that this is stored as <Em>text</Em>. If you want to calculate with this, you first have to tell SQLite that it is indeed a number, which is done through a so-called <Term>type cast</Term>. <ISQL>CAST(STRFTIME('%m', CURRENT_DATE) AS INT)</ISQL> gives the number <ISQL>{`${now.getMonth() + 1}`}</ISQL>, which we can then do calculations with.</Par>
      <Warning>You probably notice: working with dates/times is tricky. Always check the specifications of your DBMS, and test your queries well!</Warning>
      <Par></Par>
    </Section>

    <Section title="Conditionally process values">
      <Par>It is possible to adjust column values based on various conditions. We could for instance distinguish companies as small, medium or large, using the <ISQL>CASE</ISQL> keyword.</Par>
      <Warning>ToDo: set up example query. <SQLDisplay>{`SELECT
  company_name,
  num_employees,
  CASE
    WHEN num_employees > 200000 THEN 'large'
    WHEN num_employees > 40000 THEN 'medium'
    ELSE 'small'
  END AS company_size
FROM companies`}</SQLDisplay></Warning>
      <Info>When using <ISQL>CASE</ISQL>, add as many <ISQL>WHEN ... THEN ...</ISQL> conditions as needed. SQL looks for the <Em>first</Em> condition that matches. If no condition matches, then the <ISQL>ELSE</ISQL> outcome is used. (Or when <ISQL>ELSE</ISQL> is omitted, then <ISQL>NULL</ISQL> is returned.)</Info>
      <Par>When dealing with a column containing <ISQL>NULL</ISQL> values, it could be useful to set up a fallback value. This is done through the <ISQL>COALESCE(v1, v2, ...)</ISQL> function. This function gives the <Em>first</Em> value that is not <ISQL>NULL</ISQL>. An example (albeit somewhat non-sensible) is the following.</Par>
      <Warning>ToDo: set up example query. <SQLDisplay>{`SELECT
  company_name,
  founded_year,
  num_employees,
  COALESCE(num_employees, 10*founded_year, 1000) AS employees
FROM companies`}</SQLDisplay></Warning>
    </Section>
  </Page>;
}
