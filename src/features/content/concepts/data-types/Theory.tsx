import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Section, Par, List, Warning, Info, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useTextNodeBounds, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';
import { ISQL } from '@/shared/components/SQLEditor';

export function Theory() {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA');
  const time = now.toLocaleTimeString('en-GB', { hour12: false });

  return <Page>
    <Section>
      <Par>In database tables, the fields can take a large variety of values, but there are limitations. Let's study them.</Par>
    </Section>

    <Section title="Each column has a data type">
      <Par>In a database table, every column has a specific <Term>data type</Term>. Let's consider for instance an "employee data" table tracking the various positions of employees as they move through a company.</Par>
      <FigureDataTypeDemo />
      <Par>Note that some columns contain <Term>numbers</Term>, others contain <Term>text</Term>, and others have <Term>date/time</Term> values. A column with a certain type <Em>cannot</Em> contain values of another type!</Par>
      <Par>Optionally, columns may be given further restrictions. For instance, the <ISQL>perf_score</ISQL> column may be set up to only allow numbers between <ISQL>0</ISQL> and <ISQL>100</ISQL>, and the <ISQL>status</ISQL> column may be set up to only take values from a list of possible employee statuses. The set of all possible values that can be put in a column is formally called the <Term>domain</Term> of that column.</Par>
    </Section>

    <Section title={<>The <ISQL>NULL</ISQL> value</>}>
      <Par>The cells in a database table generally <Em>cannot</Em> be empty. However, they <Em>can</Em> be given the value <ISQL>NULL</ISQL>. This is a special value recognized by DBMSs. Having <ISQL>NULL</ISQL> in a cell usually means "This value is not known", although it may also mean "This value is not applicable here." Like for instance when a contract has a <ISQL>start_date</ISQL> but is on-going, and hence does not have an <ISQL>end_date</ISQL> yet.</Par>
      <Warning>You can only put <ISQL>NULL</ISQL> in a cell, if the corresponding column allows this. This depends on the domain that is specified for that column when creating the table.</Warning>
    </Section>

    <Section title="Specific data types">
      <Par>If we create a new database table, we need to specify the types (and domains) of each of the columns. When doing so, we need to be a bit more specific than just mentioning "number" or "text". For example for numbers: are they whole numbers or floating point numbers? How large? With how much precision should we store them? The DBMS needs to know this, so it can reserve the right amount of storage space. This is specified through various specific types, each with their own name.</Par>
      <Info>The available types and their names slightly differ per Database Management System. The types described below are common data types supported by most DBMSs. Variations may occur, and the below list is by no means complete. Always check out the specifications for your own DBMS.</Info>
      <List items={[
        <><strong>Numbers</strong>
          <List items={[
            <>The <ISQL>INTEGER</ISQL> type stores whole numbers like <ISQL>842</ISQL>. It can store any whole number between -2,147,483,648 and 2,147,483,647. Alternatively, use <ISQL>TINYINT</ISQL> (0 to 255) or <ISQL>SMALLINT</ISQL> (-32,768 to 32,767) to save space, or use <ISQL>BIGINT</ISQL> to store larger numbers.</>,
            <>The <ISQL>FLOAT</ISQL> type stores floating-point numbers like <ISQL>3,141.592,65</ISQL>. Most DBMSs allow for fine-tuning the precision with which the numbers are stored.</>,
          ]} /></>,
        <><strong>Text</strong>
          <List items={[
            <>The <ISQL>VARCHAR(n)</ISQL> type stores a small piece of text like <ISQL>'The Netherlands'</ISQL>. The number <ISQL>n</ISQL> indicates the <Em>maximum</Em> number of characters that can be stored. Many DBMSs require <ISQL>n &lt; 256</ISQL>.</>,
            <>The <ISQL>TEXT</ISQL> type stores large pieces of text, up to 2,147,483,647 characters.</>,
          ]} /></>,
        <><strong>Date/time</strong>
          <List items={[
            <>The <ISQL>DATE</ISQL> type stores a date, like <ISQL>{date}</ISQL>.</>,
            <>The <ISQL>TIME</ISQL> type stores a specific time, like <ISQL>{time}</ISQL>. Millisecond or microsecond precision can be added.</>,
            <>The <ISQL>DATETIME</ISQL> type stores both a date and time, like <ISQL>{`${date} ${time}`}</ISQL>, and hence registers an exact moment in time.</>,
          ]} /></>,
        <><strong>Other</strong>
          <List items={[
            <>The <ISQL>BOOLEAN</ISQL> type stores either <ISQL>TRUE</ISQL> or <ISQL>FALSE</ISQL>.</>,
            <>Depending on which DBMS you are using, you may use the the <ISQL>INTEGER[]</ISQL> or <ISQL>TEXT[]</ISQL> types for lists, the <ISQL>JSON</ISQL> type for Javascript objects, the <ISQL>XML</ISQL> type for XML data, and various other options.</>,
          ]} /></>,
      ]} />
      <Par>It's not necessary to remember all these types. The main lesson is that every data type has limitations on exactly what it can store and with what precision. These limitations should be taken into account.</Par>
    </Section>
  </Page >;
}

export function FigureDataTypeDemo() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, `SELECT * FROM emp_data;`);

  // Find the bounds of the table.
  const [tableRef, tableBounds, table] = useRefWithBounds(drawingData);
  const [labelTextRef, labelTextBounds] = useRefWithBounds(drawingData);
  const [labelNumberRef, labelNumberBounds] = useRefWithBounds(drawingData);
  const [labelDateRef, labelDateBounds] = useRefWithBounds(drawingData);

  const c1Bounds = useTextNodeBounds(table, data && data.values[0][1] || '', drawingData);
  const c2Bounds = useTextNodeBounds(table, data && data.columns[2] || '', drawingData);
  const c3Bounds = useTextNodeBounds(table, data && data.values[0][3] || '', drawingData);
  const c4Bounds = useTextNodeBounds(table, data && data.values[0][4] || '', drawingData);
  const c5Bounds = useTextNodeBounds(table, data && data.columns[5] || '', drawingData);
  const c6Bounds = useTextNodeBounds(table, data && data.values[0][6] || '', drawingData);

  const r = 20;
  const height = tableBounds?.height || 200;
  const delta = 20; // How much do we jump in from the left of the column?

  return <Drawing ref={drawingRef} width={800} height={25 + height + 48} maxWidth={800} disableSVGPointerEvents>
    <Element position={[10, 0]} anchor={[-1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>The emp_data table</span></Element>
    <Element position={[0, 25]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 800 / 0.8 }}>
        <DataTable ref={tableRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {/* Labels. */}
    {tableBounds && c1Bounds && c2Bounds && c3Bounds ? <>
      <Element ref={labelTextRef} position={[c1Bounds.left - 10, tableBounds.bottom + 40]} anchor={[1, 0]}><span style={{ fontWeight: 600, color: themeColor, fontSize: '0.8rem' }}>Text</span></Element>
      <Element ref={labelNumberRef} position={[c2Bounds.left - 10, tableBounds.bottom + 30]} anchor={[1, 0]}><span style={{ fontWeight: 600, color: themeColor, fontSize: '0.8rem' }}>Number</span></Element>
      <Element ref={labelDateRef} position={[c3Bounds.left - 10, tableBounds.bottom + 20]} anchor={[1, 0]}><span style={{ fontWeight: 600, color: themeColor, fontSize: '0.8rem' }}>Date</span></Element>
    </> : null}

    {tableBounds && labelTextBounds && labelNumberBounds && labelDateBounds && c1Bounds && c2Bounds && c3Bounds && c4Bounds && c5Bounds && c6Bounds ? <>
      {/* Text arrows. */}
      <Curve points={[[labelTextBounds.right + 2, labelTextBounds.middle.y + 2], [c1Bounds.left + delta + 10, labelTextBounds?.middle.y + 2], [c1Bounds.left + delta + 10, tableBounds.bottom]]} color={themeColor} curveDistance={r} endArrow />
      <Curve points={[[labelTextBounds.right + 2, labelTextBounds.middle.y + 2], [c6Bounds.left + delta - 8, labelTextBounds?.middle.y + 2], [c6Bounds.left + delta - 8, tableBounds.bottom]]} color={themeColor} curveDistance={r} endArrow />

      {/* Number label/arrow. */}
      <Curve points={[[labelNumberBounds.right + 2, labelNumberBounds.middle.y + 2], [c2Bounds.left + delta, labelNumberBounds?.middle.y + 2], [c2Bounds.left + delta, tableBounds.bottom]]} color={themeColor} curveDistance={r} endArrow />
      <Curve points={[[labelNumberBounds.right + 2, labelNumberBounds.middle.y + 2], [c5Bounds.left + delta - 14, labelNumberBounds?.middle.y + 2], [c5Bounds.left + delta - 14, tableBounds.bottom]]} color={themeColor} curveDistance={r} endArrow />

      {/* Date label/arrow. */}
      <Curve points={[[labelDateBounds.right + 2, labelDateBounds.middle.y + 2], [c3Bounds.left + delta, labelDateBounds?.middle.y + 2], [c3Bounds.left + delta, tableBounds.bottom]]} color={themeColor} curveDistance={r} endArrow />
      <Curve points={[[labelDateBounds.right + 2, labelDateBounds.middle.y + 2], [c4Bounds.left + delta, labelDateBounds?.middle.y + 2], [c4Bounds.left + delta, tableBounds.bottom]]} color={themeColor} curveDistance={r} endArrow />
    </> : null}
  </Drawing>;
}
