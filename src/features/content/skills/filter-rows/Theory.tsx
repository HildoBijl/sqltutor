import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Par, Section, Warning, Info, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useTextNodeBounds, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';
import { ISQL, SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA');
  const time = now.toLocaleTimeString('en-GB', { hour12: false });
  const e_id = '41376655';

  return <Page>
    <Section>
      <Par>When dealing with data in databases, it is very common to look for certain rows in a table: <Term>filtering</Term>. In <Term>SQL</Term> we can do so by adding the query with the keyword <ISQL>WHERE</ISQL> to the query, followed by the condition we want to filter on. This condition can be set up in a myriad of ways, so let's browse through the possibilities.</Par>
    </Section>

    <Section title="Set up equality-based conditions">
      <Par>The most common filter is on equality: we want some row property to have a certain value. We usually set up this condition using an <Term>equals sign</Term>, in the format <ISQL>column_name = some_value</ISQL>. We can for instance find all the positions held by the employee with employee ID <ISQL>{e_id}</ISQL>.</Par>
      <FigureFiltering query={`SELECT *
FROM emp_data
WHERE e_id = ${e_id};`} columnName="e_id" />
      <Par>Let's study what the DBMS does internally when it receives a query like this. First it pulls the table from memory. (Or at least, the necessary parts of it.) Then, for every row, it evaluates the condition. To do so, it replaces the column name <ISQL>num_employees</ISQL> by the respective value <Em>of that row</Em>. Then it checks if the left and right side of the equals sign have the same value. If so, the condition evaluates as <ISQL>TRUE</ISQL> for that row and the DBMS keeps it around. If not, the condition evaluates as <ISQL>FALSE</ISQL> for that row and the DBMS removes it from the output. After doing this for all rows, the remaining output is sent back.</Par>
      <Info>Note that this mechanism also allows us to compare two different columns with each other. We can set up a condition <ISQL>column1 = column2</ISQL>, which gets us all the rows where these two columns have equal value. We could for example use the condition <ISQL>start_date = end_date</ISQL> to find the people who got fired on their starting date.</Info>
      <Par>We can set up a similar comparison with text. We could for instance find all contracts that are currently active. This comparison is case sensitive.</Par>
      <FigureFiltering query={`SELECT *
FROM emp_data
WHERE status = 'active';`} columnName="status" />
      <Warning>When entering text in SQL, always use <Em>single</Em> quotation marks. This is how SQL recognizes that it is a piece of text, and not a column name or similar. (Both "no quotation marks" and "double quotation marks" indicate column/table names in SQL.)</Warning>
      <Par>We could also do the opposite, and find all contracts that are <Em>not</Em> active. In this case, we use the <Term>unequals sign</Term>, which in SQL is <ISQL>{`<>`}</ISQL>.</Par>
      <FigureFiltering query={`SELECT *
FROM emp_data
WHERE status <> 'active';`} columnName="status" />
    </Section>

    <Section title="Set up larger/smaller than conditions">
      <Par>Instead of requiring equality, we can set up larger/small than conditions. As is customary in mathematics, we use <ISQL>{`>`}</ISQL> for <Term>larger than</Term> and <ISQL>{`<`}</ISQL> for <Term>smaller than</Term>. We could for instance find all employees who obtained performance score of <Em>more</Em> than <ISQL>90</ISQL>.</Par>
      <FigureFiltering query={`SELECT *
FROM emp_data
WHERE perf_score > 90;`} columnName="perf_score" />
      <Info>You use <ISQL>{`>=`}</ISQL> for <Term>larger than or equal to</Term> and you use <ISQL>{`<=`}</ISQL> for <Term>smaller than or equal to</Term>. The = symbol that indicates "or equal" should always come <Em>after</Em> the comparison symbol, and never before.</Info>
      <Par>This works similarly for text. SQL compares text lexicographically: whichever entry comes first in the dictionary is considered smaller. So one way to find all employee positions starting with a letter in the range <ISQL>s-z</ISQL> is the following.</Par>
      <FigureFiltering query={`SELECT *
FROM emp_data
WHERE position >= 's';`} columnName="position" />
      <Par>For dates/times, the comparison is done using earlier/later than. Earlier dates are considered smaller and later dates are considered larger.</Par>
      <FigureFiltering query={`SELECT *
FROM emp_data
WHERE start_date >= '2025-01-01';`} columnName="start_date" />
      <Info>Most DBMSs store a date/time value as an object with various functionalities: it is "aware" that it is a date or time. On SQL Valley we use the light-weight SQLite DBMS. This DBMS stores dates/times simply as piece of text, like "{date}" or "{time}". Luckily, if we compare this text lexicographically, we get exactly the same result as when we would compare it time-wise. So usually this SQLite quirk is not a problem.</Info>
    </Section>

    <Section title="Compare text">
      <Par>The <ISQL>LIKE</ISQL> comparison is a useful extra method for comparing text. Using <ISQL>LIKE</ISQL> is like using <ISQL>=</ISQL>, but it allows us to use the <ISQL>%</ISQL> symbol as a filler to represent "any text", or (less used) the <ISQL>_</ISQL> symbol to represent "any single character". We could for instance find all employees who are on some kind of leave.</Par>
      <FigureFiltering query={`SELECT *
FROM emp_data
WHERE status LIKE '%leave';`} columnName="status" />
      <Info>For most DBMSs the <ISQL>LIKE</ISQL> comparison is case insensitive. For some DBMSs it is case sensitive, but there is a case insensitive <ISQL>ILIKE</ISQL> equivalent. To invert the result, you can use <ISQL>NOT LIKE</ISQL>.</Info>
    </Section>

    <Section title={<>Compare with <ISQL>NULL</ISQL></>}>
      <Par>You may remember that table cells can have the special value <ISQL>NULL</ISQL>, which means "unknown" or "not applicable". If you want to find all rows where some column has <ISQL>NULL</ISQL>, you <Em>cannot</Em> use the condition <ISQL>column_name = NULL</ISQL>. Instead, you have to use the special <ISQL>IS</ISQL> comparison, for instance through <ISQL>column_name IS NULL</ISQL> or similarly <ISQL>column_name IS NOT NULL</ISQL>.</Par>
      <FigureFiltering query={`SELECT *
FROM emp_data
WHERE perf_score IS NULL;`} columnName="perf_score" />
      <Info>Because <ISQL>NULL</ISQL> means "unknown", any comparison involving <ISQL>NULL</ISQL>, like for instance <ISQL>{`NULL < 10`}</ISQL>, always resolves to <ISQL>NULL</ISQL> as well, and never to <ISQL>TRUE</ISQL> or <ISQL>FALSE</ISQL>. After all, it is also unknown whether "some unknown value" is smaller than <ISQL>10</ISQL>. Even the comparison <ISQL>NULL = NULL</ISQL> resolves to <ISQL>NULL</ISQL>, since two unknown values are not necessarily equal. Only <ISQL>NULL IS NULL</ISQL> resolves to <ISQL>TRUE</ISQL>.</Info>
    </Section>
  </Page>;
}

export function FigureFiltering({ query = '', columnName = '' }) {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the table column name bounds.
  const [eRef, eBounds] = useRefWithBounds(drawingData);
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const columnNameBounds = useTextNodeBounds(table, columnName, drawingData);

  // Set up dimensions.
  const width = 800;
  const h1 = eBounds?.height || 100;
  const delta = 15;
  const h2 = tBounds?.height || 200;
  const height = h1 + delta + h2;

  // Check where to position the query and where to put the arrow.
  const arrowX = columnNameBounds?.middle.x || width;
  let queryPosition, arrowPosition;
  if (arrowX > 0.75 * width) {
    queryPosition = 0; // Center
    arrowPosition = 1; // Right
  } else if (arrowX < 0.25 * width) {
    queryPosition = 0; // Center
    arrowPosition = -1; // Left
  } else if (arrowX >= 0.5 * width) {
    queryPosition = -1; // Left
    arrowPosition = 1; // Right
  } else {
    queryPosition = 1; // Right
    arrowPosition = -1; // Left
  }

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width} disableSVGPointerEvents>
    <Element ref={eRef} position={[(queryPosition + 1) * width / 2, 0]} anchor={[queryPosition, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    {eBounds ? <>
      <Element position={[0, h1 + delta]} anchor={[-1, -1]} scale={0.8} behind>
        <Box sx={{ width: width / 0.8 }}>
          <DataTable ref={tRef} data={data} showPagination={false} compact />
        </Box>
      </Element>
    </> : null}

    {eBounds && columnNameBounds ? <>
      <Curve points={[arrowPosition === 1 ? eBounds.rightMiddle.add([4, 0]) : eBounds.leftMiddle.add([-4, 0]), [columnNameBounds.middle.x, eBounds.middle.y], [columnNameBounds.middle.x, h1 + delta - 4]]} color={themeColor} curveDistance={60} endArrow />
    </> : null}
  </Drawing>;
}
