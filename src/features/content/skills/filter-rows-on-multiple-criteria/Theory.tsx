import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { Page, Par, List, Section, Info, Term, Em } from '@/components';
import { type DrawingData, Drawing, Element, Curve, useTextNodeBounds, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';
import { ISQL, SQLDisplay } from '@/shared/components/SQLEditor';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to set up a filter in SQL with one condition. In practice, there are usually multiple conditions that interact with each other in various ways. Let's take a look at how we can combine multiple conditions in SQL.</Par>
    </Section>

    <Section title={<>Combine conditions using <ISQL>AND</ISQL></>}>
      <Par>Suppose that we have a list of employee data and want to find all active PR directors. We now have two conditions: we want the employee contract to be active <Em>and</Em> we want the position to be "director of pr". To combine these two conditions in SQL, we can use the <ISQL>AND</ISQL> keyword.</Par>
      <FigureCombinedCondition c1="status" v1="active" c2="position" v2="director of pr" combiner="AND" />
    </Section>

    <Section title={<>Understand how conditions are evaluated</>}>
      <Par>The above query with <ISQL>AND</ISQL> makes sense from a language point of view, but if we want to become skillful with SQL, we need to understand what SQL does behind the scenes.</Par>
      <Par>When SQL is filtering rows through <ISQL>WHERE</ISQL>, it walks through all rows. For each row, it evaluates the given condition.
        <List items={[
          <>It <Em>first</Em> evaluates the <Term>comparisons</Term> (here the <ISQL>=</ISQL> symbols) and resolves them to <ISQL>TRUE</ISQL>, <ISQL>FALSE</ISQL> or <ISQL>NULL</ISQL> (representing "unknown").</>,
          <>It <Em>then</Em> resolves any <Term>combining</Term> keywords like <ISQL>AND</ISQL>. This turns the full condition into <ISQL>TRUE</ISQL>/<ISQL>FALSE</ISQL>/<ISQL>NULL</ISQL>.</>,
          <>In the <Em>end</Em>, the <Term>filter</Term> keeps all rows with <ISQL>TRUE</ISQL> and throws out all other rows.</>,
        ]} useNumbers={true} />
      </Par>
      <FigureAndExplanation />
      <Info>The keyword <ISQL>AND</ISQL> always needs a <ISQL>TRUE</ISQL>/<ISQL>FALSE</ISQL>/<ISQL>NULL</ISQL> value before and after it. It <Em>only</Em> resolves to <ISQL>TRUE</ISQL> if <Em>both</Em> values are <ISQL>TRUE</ISQL>.</Info>
    </Section>

    <Section title={<>Combine conditions using <ISQL>OR</ISQL></>}>
      <Par>Very similar to the <ISQL>AND</ISQL> keyword is the <ISQL>OR</ISQL> keyword. This keyword also expects one value before it and one value after. The <ISQL>OR</ISQL> keyword resolves to <ISQL>TRUE</ISQL> when <Em>at least one</Em> of the two given values is <ISQL>TRUE</ISQL>. It is only <ISQL>FALSE</ISQL> when <Em>both</Em> values are <ISQL>FALSE</ISQL>.</Par>
      <FigureCombinedCondition c1="status" v1="sick leave" c2="position" v2="transportation supervisor" combiner="OR" />
      <Par>It is possible (and common) to combine the <ISQL>AND</ISQL> and <ISQL>OR</ISQL> keywords. When you do so, <Em>always</Em> use brackets to separate them. After all, it is very unclear what <ISQL>TRUE OR TRUE AND FALSE</ISQL> resolves to, while both <ISQL>(TRUE OR TRUE) AND FALSE</ISQL> and <ISQL>TRUE OR (TRUE AND FALSE)</ISQL> have a clear result.</Par>
      <Info><ISQL>OR</ISQL> and <ISQL>AND</ISQL> have interesting behavior when it comes to <ISQL>NULL</ISQL>. Keep in mind that <ISQL>NULL</ISQL> means "unknown". For this reason, both <ISQL>TRUE AND NULL</ISQL> as well as <ISQL>FALSE OR NULL</ISQL> resolve to <ISQL>NULL</ISQL>: their outcomes are unknown. However, <ISQL>FALSE AND NULL</ISQL> will certainly be <ISQL>FALSE</ISQL>, and <ISQL>TRUE OR NULL</ISQL> will always be <ISQL>TRUE</ISQL>, because no matter what value this unknown <ISQL>NULL</ISQL> may have, the outcome is already clear.</Info>
    </Section>

    <Section title={<>Negate conditions using <ISQL>NOT</ISQL></>}>
      <Par>Suppose that we want to find all employees that are <Em>not</Em> active transportation supervisors. To do so, we can use the <ISQL>NOT</ISQL> keyword.</Par>
      <FigureCombinedCondition c1="status" v1="active" c2="position" v2="transportation supervisor" combiner="AND" addNot={true} />
      <Par>The <ISQL>NOT</ISQL> keyword expects a <ISQL>TRUE</ISQL>/<ISQL>FALSE</ISQL>/<ISQL>NULL</ISQL> value after it. It then inverts this value: <ISQL>NOT TRUE</ISQL> resolves to <ISQL>FALSE</ISQL> and <ISQL>NOT FALSE</ISQL> resolves as <ISQL>TRUE</ISQL>. (<ISQL>NOT NULL</ISQL> reduces to <ISQL>NULL</ISQL>, since the opposite of an unknown result is still unknown.)</Par>
    </Section>

    <Section title="Use logic theory to rewrite conditions">
      <Par>Conditions can often be <Term>rewritten</Term>: we adjust them such that they still do the <Em>same</Em> thing. As a simple example, <ISQL>NOT status = 'active'</ISQL> can also be written as <ISQL>{`status <> 'active'`}</ISQL>.</Par>
      <Par>A powerful trick in rewriting conditions is to expand brackes with <ISQL>NOT</ISQL>.
        <List items={[
          <><ISQL>NOT (c1 AND c2)</ISQL> may be written as <ISQL>NOT c1 OR NOT c2</ISQL>.</>,
          <><ISQL>NOT (c1 OR c2)</ISQL> may be written as <ISQL>NOT c1 AND NOT c2</ISQL>.</>,
        ]} />
        In other words: pulling a <ISQL>NOT</ISQL> inside brackets will turn <ISQL>AND</ISQL> into <ISQL>OR</ISQL> and vice versa. This could help us recreate the previous table. We can rewrite the condition <ISQL>NOT (status = 'active' AND position = 'transportation supervisor')</ISQL>.</Par>
      <FigureRewrittenQuery query={`
SELECT *
FROM emp_data
WHERE NOT status = 'active' OR NOT position = 'transportation supervisor';`} />
      <Info>The <ISQL>NOT</ISQL> keyword is evaluated <Em>after</Em> the comparison, but <Em>before</Em> the <ISQL>OR</ISQL> keyword. The above condition is equivalent to <ISQL>{`(NOT (status = 'active')) OR (NOT (position = 'transportation supervisor'))`}</ISQL>. The brackets here can be added for clarity, but SQL programmers should know the evaluation orders, so usually they are omitted.</Info>
    </Section>

    <Section title="Use common SQL short-cuts to simplify conditions">
      <Par>There are various short-cuts in SQL that allow you to write conditions more succinctly. Let's study a few.</Par>
      <Par>Suppose that we want to find all employees having a performance score between <ISQL>70</ISQL> and <ISQL>80</ISQL> (inclusive). The normal method is to use the condition <ISQL>{`perf_score >= 70 AND perf_score <= 80`}</ISQL>. The short-cut says we can use the <ISQL>BETWEEN</ISQL> keyword.</Par>
      <FigureRewrittenQuery query={`
SELECT *
FROM emp_data
WHERE perf_score BETWEEN 70 AND 80;`} />
      <Par>Now suppose we want to find all employees that are either on sick leave or on paid leave. The normal method is to use the condition <ISQL>status = 'sick leave' OR status = 'paid leave'</ISQL>. The short-cut is to create a list <ISQL>('sick leave', 'paid leave')</ISQL> of statuses we look for, and see if the status is <ISQL>IN</ISQL> this list.</Par>
      <FigureRewrittenQuery query={`
SELECT *
FROM emp_data
WHERE status IN ('sick leave', 'paid leave');`} />
      <Par>Given how broad SQL is, there are dozens more short-cuts like this. If you ever see a keyword you don't recognize, simply look up its specifications to see how it works. In this way, you learn more and more commands as you go.</Par>
    </Section>

    <Section title={<>Merge tables using <ISQL>UNION</ISQL>, <ISQL>INTERSECT</ISQL> and <ISQL>EXCEPT</ISQL></>}>
      <Par>A completely different way to combine different conditions is through <Term>merging tables</Term>. If we have two tables with <Em>identical columns</Em>, we can merge them together. One way to do so is through the <ISQL>UNION</ISQL> operator. This operator merges two tables, and it keeps a row if it is in <Em>either</Em> (or both) of the given tables. So it kind of functions like an <ISQL>OR</ISQL>.</Par>
      <FigureMergingTables query1={`SELECT *
FROM emp_data
WHERE status = 'sick leave'`} query2={`SELECT *
FROM emp_data
WHERE position = 'transportation supervisor'`} operator="UNION" />
      <Par>A similar command is the <ISQL>INTERSECT</ISQL> operator. This one also merges two tables, but it only keeps a row if it is in <Em>both</Em> tables. So it more or less acts like an <ISQL>AND</ISQL>.</Par>
      <FigureMergingTables query1={`SELECT *
FROM emp_data
WHERE status = 'active'`} query2={`SELECT *
FROM emp_data
WHERE position = 'transportation supervisor'`} operator="INTERSECT" />
      <Par>The final merging operator is the <ISQL>EXCEPT</ISQL>. This one functions as a subtraction: it takes the first table, and it then removes all the rows from it that are in the second table.</Par>
      <FigureMergingTables query1={`SELECT *
FROM emp_data
WHERE status = 'active'`} query2={`SELECT *
FROM emp_data
WHERE position = 'transportation supervisor'`} operator="EXCEPT" />
      <Par>Since the <ISQL>UNION</ISQL>, <ISQL>INTERSECT</ISQL> and <ISQL>EXCEPT</ISQL> keywords do very similar things as <ISQL>AND</ISQL>, <ISQL>OR</ISQL> and <ISQL>NOT</ISQL>, their usage is not so common, but there are a few edge cases where they can be really useful.</Par>
      <Info>Contrary to set theory in mathematics, SQL allows duplicate rows. The <ISQL>UNION</ISQL>, <ISQL>INTERSECT</ISQL> and <ISQL>EXCEPT</ISQL> have fixed rules of how to deal with duplicate rows. If table A has five identical rows, and table B has three identical rows, then their <ISQL>UNION</ISQL> has five rows (maximum), their <ISQL>INTERSECT</ISQL> has three rows (minimum) and their <ISQL>EXCEPT</ISQL> has two rows (A minus B).</Info>
    </Section>
  </Page>;
}

function FigureCombinedCondition({ c1 = '', v1 = '', c2 = '', v2 = '', combiner = 'AND', addNot = false }) {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const query = `
SELECT *
FROM emp_data
WHERE ${addNot ? 'NOT (' : ''}${c1} = '${v1}'
  ${combiner} ${c2} = '${v2}'${addNot ? ')' : ''};`
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the editor bounds.
  const [eRef, eBounds, editor] = useRefWithBounds(drawingData);
  const c1QueryBounds = useTextNodeBounds(editor, v1, drawingData);
  const c2QueryBounds = useTextNodeBounds(editor, v2, drawingData);

  // Find the table column name bounds.
  const [tRef, tBounds, table] = useRefWithBounds(drawingData);
  const c1NameBounds = useTextNodeBounds(table, c1, drawingData);
  const c2NameBounds = useTextNodeBounds(table, c2, drawingData);

  const h1 = eBounds?.height || 100;
  const delta = 30;
  const h2 = tBounds?.height || 200;
  const height = h1 + delta + h2;

  return <Drawing ref={drawingRef} width={800} height={height} maxWidth={800} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    {eBounds ? <Element position={[0, eBounds.height + delta]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 800 / 0.8 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element> : null}

    {eBounds && c1QueryBounds && c1NameBounds && c2QueryBounds && c2NameBounds ? <>
      <Curve points={[c1QueryBounds.middleRight.add([4, 0]), [c1NameBounds.middle.x, c1QueryBounds.middle.y], c1NameBounds.middleTop.add([0, -4])]} color={themeColor} curveDistance={60} endArrow />
      <Curve points={[[c2NameBounds.middle.x, eBounds.bottom - 6], c2NameBounds.middleTop]} color={themeColor} endArrow />
    </> : null}
  </Drawing>;
}

function FigureAndExplanation() {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useConceptDatabase();
  const status = 'active';
  const position = 'director of pr';
  const data = useQueryResult(db?.database, `
SELECT position, status
FROM emp_data
WHERE status = '${status}'
  AND position = '${position}'
LIMIT 1;`);

  // Find the editor bounds.
  const [aRef, aBounds] = useRefWithBounds(drawingData);
  const [c1Ref, c1Bounds] = useRefWithBounds(drawingData);
  const [c2Ref, c2Bounds] = useRefWithBounds(drawingData);
  const [r1Ref, r1Bounds] = useRefWithBounds(drawingData);
  const [r2Ref, r2Bounds] = useRefWithBounds(drawingData);
  const [rRef, rBounds] = useRefWithBounds(drawingData);

  // Position data.
  const lineHeight = 50;
  const andX = 382;
  const exampleY = 60;

  return <Drawing ref={drawingRef} width={800} height={3.5 * lineHeight} maxWidth={800} disableSVGPointerEvents>
    {/* Example row */}
    <Element position={[790, exampleY]} anchor={[1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>Example row</span></Element>
    <Element position={[600, exampleY + 25]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 200 / 0.8 }}>
        <DataTable data={data} showPagination={false} compact />
      </Box>
    </Element>

    {/* Steps */}
    <Element position={[0, lineHeight * 0]} anchor={[-1, -1]}>
      <span style={{ fontWeight: 600, fontSize: '1em' }}>To evaluate a condition:</span>
    </Element>
    <Element position={[0, lineHeight * 1]} anchor={[-1, -1]}>
      <span style={{ fontWeight: 600, fontSize: '1em' }}>1. Evaluate comparisons</span>
    </Element>
    <Element position={[0, lineHeight * 2]} anchor={[-1, -1]}>
      <span style={{ fontWeight: 600, fontSize: '1em' }}>2. Combine results</span>
    </Element>
    <Element position={[0, lineHeight * 3]} anchor={[-1, -1]}>
      <span style={{ fontWeight: 600, fontSize: '1em' }}>3. Apply in filter</span>
    </Element>

    {/* Starting condition */}
    <Element ref={aRef} position={[andX, lineHeight * 0.1]} anchor={[0, -1]} behind>
      <ISQL>AND</ISQL>
    </Element>
    {aBounds ? <Element ref={c1Ref} position={aBounds.middleLeft.add([-7, 0])} anchor={[1, 0]} behind>
      <ISQL>{`status = '${status}'`}</ISQL>
    </Element> : null}
    {aBounds ? <Element ref={c2Ref} position={aBounds.middleRight.add([7, 0])} anchor={[-1, 0]} behind>
      <ISQL>{`position = '${position}'`}</ISQL>
    </Element> : null}

    {/* Step 1 */}
    {c1Bounds && c2Bounds ? <>
      <Element position={[andX, lineHeight * 1.1]} anchor={[0, -1]} behind>
        <ISQL>AND</ISQL>
      </Element>
      <Element ref={r1Ref} position={[c1Bounds.middle.x, lineHeight * 1.1]} anchor={[0, -1]} behind>
        <ISQL>TRUE</ISQL>
      </Element>
      <Element ref={r2Ref} position={[c2Bounds.middle.x, lineHeight * 1.1]} anchor={[0, -1]} behind>
        <ISQL>FALSE</ISQL>
      </Element>
    </> : null}

    {/* Step 2 */}
    <Element ref={rRef} position={[andX, lineHeight * 2.1]} anchor={[0, -1]} behind>
      <ISQL>FALSE</ISQL>
    </Element>

    {/* Step 3 */}
    <Element position={[andX, lineHeight * 3.1]} anchor={[0, -1]} behind>
      <span style={{ fontWeight: 600, fontSize: '1rem', color: themeColor }}>Row removed</span>
    </Element>

    {/* Lines */}
    {aBounds && c1Bounds && c2Bounds && r1Bounds && r2Bounds && rBounds ? <>
      <Curve points={[c1Bounds.bottomLeft.add([-4, -4]), c1Bounds.bottomLeft.add([-4, 4]), c1Bounds.bottomRight.add([4, 4]), c1Bounds.bottomRight.add([4, -4])]} curveDistance={8} color={themeColor} size={2} />
      <Curve points={[c1Bounds.middleBottom.add([0, 4]), r1Bounds.middleTop.add([0, -2])]} color={themeColor} endArrow />

      <Curve points={[c2Bounds.bottomLeft.add([-4, -4]), c2Bounds.bottomLeft.add([-4, 4]), c2Bounds.bottomRight.add([4, 4]), c2Bounds.bottomRight.add([4, -4])]} curveDistance={8} color={themeColor} size={2} />
      <Curve points={[c2Bounds.middleBottom.add([0, 4]), r2Bounds.middleTop.add([0, -2])]} color={themeColor} endArrow />

      <Curve points={[r1Bounds.bottomLeft.add([-4, -4]), r1Bounds.bottomLeft.add([-4, 4]), r2Bounds.bottomRight.add([4, 4]), r2Bounds.bottomRight.add([4, -4])]} curveDistance={8} color={themeColor} size={2} />
      <Curve points={[[andX, r1Bounds.bottom + 4], [andX, rBounds.top - 2]]} color={themeColor} size={2} endArrow />

      <Curve points={[rBounds.middleBottom.add([0, 2]), [andX, 3.2 * lineHeight]]} color={themeColor} size={2} endArrow />
    </> : null}
  </Drawing>;
}

function FigureRewrittenQuery({ query = '' }) {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the editor bounds.
  const [eRef, eBounds] = useRefWithBounds(drawingData);

  // Find the table column name bounds.
  const [tRef, tBounds] = useRefWithBounds(drawingData);

  const h1 = eBounds?.height || 100;
  const delta = 10;
  const h2 = tBounds?.height || 200;
  const height = h1 + delta + h2;

  return <Drawing ref={drawingRef} width={800} height={height} maxWidth={800} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    {eBounds ? <Element position={[0, eBounds.height + delta]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: 800 / 0.8 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element> : null}

    {eBounds && tBounds ? <Curve points={[eBounds.middleRight.add([2, 0]), [tBounds.middle.x + eBounds.width / 2, eBounds.middle.y], [tBounds.middle.x + eBounds.width / 2, tBounds.top - 4]]} color={themeColor} curveDistance={40} endArrow /> : null}
  </Drawing>;
}

export function FigureMergingTables({ query1 = '', query2 = '', operator = 'UNION' }) {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useConceptDatabase();
  const data1 = useQueryResult(db?.database, query1);
  const data2 = useQueryResult(db?.database, query2);
  const data = useQueryResult(db?.database, `${query1}
${operator}
${query2}`);

  // Find the editor bounds.
  const [e1Ref, e1Bounds] = useRefWithBounds(drawingData);
  const [e2Ref, e2Bounds] = useRefWithBounds(drawingData);
  const [eRef, eBounds] = useRefWithBounds(drawingData);

  // Find the table column name bounds.
  const [t1Ref, t1Bounds] = useRefWithBounds(drawingData);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingData);
  const [tRef, tBounds] = useRefWithBounds(drawingData);

  const h1 = Math.max(e1Bounds?.height || 200, t1Bounds?.height || 200);
  const delta1 = 15;
  const h2 = Math.max(e2Bounds?.height || 200, t2Bounds?.height || 200);
  const delta2 = 55;
  const h3 = Math.max(eBounds?.height || 200, tBounds?.height || 200);
  const height = h1 + delta1 + h2 + delta2 + h3;

  const w1 = Math.max(e1Bounds?.width || 200, e2Bounds?.width || 200, eBounds?.width || 200);
  const delta3 = 50;
  const w2 = 600;
  const width = w1 + delta3 + w2;

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width} disableSVGPointerEvents>
    <Element ref={e1Ref} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query1}</SQLDisplay>
    </Element>

    <Element ref={e2Ref} position={[0, h1 + delta1]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query2}</SQLDisplay>
    </Element>

    <Element ref={eRef} position={[0, h1 + delta1 + h2 + delta2]} anchor={[-1, -1]} behind>
      <SQLDisplay>{`${query1}
${operator}
${query2}`}</SQLDisplay>
    </Element>

    <Element position={[width, 0]} anchor={[1, -1]} scale={0.8} behind>
      <Box sx={{ width: w2 / 0.8 }}>
        <DataTable ref={t1Ref} data={data1} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[width, h1 + delta1]} anchor={[1, -1]} scale={0.8} behind>
      <Box sx={{ width: w2 / 0.8 }}>
        <DataTable ref={t2Ref} data={data2} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[width, h1 + delta1 + h2 + delta2]} anchor={[1, -1]} scale={0.8} behind>
      <Box sx={{ width: w2 / 0.8 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {/* Horizontal arrows */}
    {e1Bounds && t1Bounds ? <Curve points={[e1Bounds.middleRight.add([2, 0]), [t1Bounds.left - 2, e1Bounds.middle.y]]} color={themeColor} endArrow /> : null}
    {e2Bounds && t2Bounds ? <Curve points={[e2Bounds.middleRight.add([2, 0]), [t2Bounds.left - 2, e2Bounds.middle.y]]} color={themeColor} endArrow /> : null}
    {eBounds && tBounds ? <Curve points={[eBounds.middleRight.add([2, 0]), [tBounds.left - 2, eBounds.middle.y]]} color={themeColor} endArrow /> : null}

    {/* Operator arrow */}
    {t2Bounds && tBounds ? <>
      <Curve points={[t2Bounds.middleBottom.add([0, 2]), tBounds.middleTop.add([0, -2])]} color={themeColor} endArrow />
      <Element position={[tBounds.middle.x + 8, (t2Bounds.bottom + tBounds.top) / 2 - 4]} anchor={[-1, 0]}><ISQL>{operator}</ISQL></Element>
    </> : null}
  </Drawing>;
}
