import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { type DrawingData, Drawing, Element, Curve, useRefWithBounds, DataTable, SQLDisplay } from '@/components';
import { useTheorySampleDatabase } from '@/hooks/useDatabase';
import { useQueryResult } from '@/hooks/useQuery';

export function FigureSingleTable({ query = '', title = '', tableWidth = 800, tableScale = 0.8 }) {
  // Get the data.
  const db = useTheorySampleDatabase();
  const data = useQueryResult(db?.database, query);

  // Check out the table bounds.
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();
  const [tRef, tBounds] = useRefWithBounds(drawingData);
  const ty = (title ? 20 : 0);
  const height = ty + (tBounds?.height || 200);

  // Render the drawing.
  return <Drawing ref={drawingRef} width={tableWidth} height={height} maxWidth={tableWidth}>
    {title ? <Element position={[10, -5]} anchor={[-1, -1]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>{title}</span></Element> : null}

    <Element position={[0, ty]} anchor={[-1, -1]} scale={tableScale}>
      <Box sx={{ width: tableWidth / tableScale }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>
  </Drawing>;
}

export function FigureExampleQuery({ query = '', actualQuery = '', below = false, tableWidth = 300, tableScale = 0.8, delta = 20, arrowLength = 60, arrowRadius = 60 }) {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useTheorySampleDatabase();
  const data = useQueryResult(db?.database, actualQuery || query);

  // Find the bounds of the respective elements.
  const [eRef, eBounds] = useRefWithBounds(drawingData);
  const [tRef, tBounds] = useRefWithBounds(drawingData);
  const we = eBounds?.width || 100;
  const wt = tBounds?.width || 100;
  const he = eBounds?.height || 100;
  const ht = tBounds?.height || 100;

  // Determine the table position.
  const arrowBetween = below ? we + arrowRadius * 1.5 > wt : he + arrowRadius * 1.5 > ht;
  const tx = below ? 0 : (we + (arrowBetween ? arrowLength : delta));
  const ty = below ? (he + (arrowBetween ? arrowLength : delta)) : 0;

  // Determine the arrow coordinates.
  const arrowPoints = eBounds && tBounds && (arrowBetween ? (
    below ? [[Math.min(eBounds.middle.x, tBounds.middle.x), eBounds.bottom + 4], [Math.min(eBounds.middle.x, tBounds.middle.x), ty - 4]]
      : [[eBounds.right + 4, Math.min(eBounds.middle.y, tBounds.middle.y)], [tx - 4, Math.min(eBounds.middle.y, tBounds.middle.y)]]
  ) : (
    below ? [eBounds.rightMiddle.add([4, 0]), [eBounds.right + arrowRadius, eBounds.middle.y], [eBounds.right + arrowRadius, ty - 4]]
      : [eBounds.bottomMiddle.add([0, 4]), [eBounds.middle.x, eBounds.bottom + arrowRadius], [tx - 4, eBounds.bottom + arrowRadius]]
  ))

  // Determine the drawing size.
  const width = below ? Math.max(we, wt) : (we + (arrowBetween ? arrowLength : delta) + wt);
  const height = below ? he + (arrowBetween ? arrowLength : delta) + ht : Math.max(he, ht);

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width} disableSVGPointerEvents>
    <Element ref={eRef} position={[0, 0]} anchor={[-1, -1]} behind>
      <SQLDisplay>{query}</SQLDisplay>
    </Element>

    <Element position={[tx, ty]} anchor={[-1, -1]} scale={tableScale} behind>
      <Box sx={{ width: tableWidth / tableScale }}>
        <DataTable ref={tRef} data={data} showPagination={false} compact />
      </Box>
    </Element>

    {arrowPoints ? <>
      <Curve points={arrowPoints} color={themeColor} curveDistance={arrowRadius} endArrow />
    </> : null}
  </Drawing>;
}
