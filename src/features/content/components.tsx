import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { type DrawingData, Drawing, Element, Curve, useRefWithBounds } from '@/components/figures';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { useQueryResult } from '@/shared/hooks/useQuery';
import { DataTable } from '@/shared/components/DataTable';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function FigureExampleQuery({ query = '', tableWidth = 300 }) {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useConceptDatabase();
  const data = useQueryResult(db?.database, query);

  // Find the table column name bounds.
  const [eRef, eBounds] = useRefWithBounds(drawingData);
  const [tRef, tBounds] = useRefWithBounds(drawingData);

  // Set up dimensions.
  const w1 = eBounds?.width || 100;
  const w2 = tBounds?.width || 100;
  const delta = 30;
  const width = w1 + w2 + delta;
  const height = Math.max(eBounds?.height || 100, tBounds?.height || 200);
  const radius = Math.min(((tBounds?.height || 120) - (eBounds?.height || 0)) / 2, 60);

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    <Element position={[w1 + delta, 0]} anchor={[-1, -1]} scale={0.8} behind>
      <Box sx={{ width: tableWidth / 0.8 }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {eBounds && tBounds ? <>
      <Curve points={[eBounds.bottomMiddle.add([0, 5]), [eBounds.middle.x, tBounds.middle.y + eBounds.height / 2], tBounds.leftMiddle.add([-4, eBounds.height / 2])]} color={themeColor} curveDistance={radius} endArrow />
    </> : null}
  </Drawing>;
}
