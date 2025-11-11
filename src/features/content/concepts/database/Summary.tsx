import { useRef } from 'react';
import { Box } from '@mui/material';

import { Page, Section, Par, Term, Link } from '@/components';
import { type DrawingData, Drawing, Element, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';

import { FigureDatabaseUsage } from './Theory';

export function Summary() {
  return <Page>
    <Section>
      <Par>In its essence, a <Term>database</Term> is a collection of tables, each filled with data. There may be millions of records that are constantly being updated by multiple applications at the same time.</Par>
      <FigureTwoTables />
      <Par>A database is always accompanied by tools (software) used to efficiently enter, update and read the data. This set of tools is known as the <Term>Database Management System</Term> (DBMS). Popular examples are <Link to="https://www.postgresql.org/">PostgreSQL</Link>, <Link to="https://www.mysql.com/">MySQL</Link>, <Link to="https://www.oracle.com/database/">Oracle</Link> and <Link to="https://sqlite.org/">SQLite</Link>.</Par>
      <FigureDatabaseUsage />
    </Section>
  </Page>
}

function FigureTwoTables() {
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, 'SELECT * FROM companies LIMIT 6');
  const drawingRef = useRef<DrawingData>(null);
  const [t1Ref, t1Bounds] = useRefWithBounds(drawingRef);
  const [t2Ref, t2Bounds] = useRefWithBounds(drawingRef);
  const t1Height = t1Bounds?.height || 300;
  const t2Height = t2Bounds?.height || 300;

  return <Drawing ref={drawingRef} width={1100} height={t1Height / 2 + t2Height} maxWidth={800}>
    <Element position={[0, 0]} anchor={[-1, -1]}>
      <Box sx={{ width: 800 }}>
        <DataTable ref={t1Ref} data={data} showPagination={false} compact />
      </Box>
    </Element>

    <Element position={[300, t1Height / 2]} anchor={[-1, -1]}>
      <Box sx={{ width: 800 }}>
        <DataTable ref={t2Ref} data={data} showPagination={false} compact />
      </Box>
    </Element>
  </Drawing>;
}
