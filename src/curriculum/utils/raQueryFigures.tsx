import { Box } from '@mui/material';

import { useRefWithValue } from '@/utils/dom';
import { useThemeColor } from '@/theme';
import { type DrawingData, Drawing, Element, Curve, useRefWithBounds, DataTable, RA } from '@/components';
import { useTheorySampleDatabase } from '@/learning/databases';
import { useQueryResult } from '@/components/sql/sqljs';

export function FigureExampleRAQuery({ query = <></>, actualQuery = '', below = false, tableWidth = 300, tableScale = 0.8, delta = 20, arrowLength = 50, arrowRadius = 60, Component = RA }) {
  const themeColor = useThemeColor();
  const [drawingRef, drawingData] = useRefWithValue<DrawingData>();

  // Set up query data.
  const db = useTheorySampleDatabase();
  const data = useQueryResult(db?.database, actualQuery);

  // Find the bounds of the respective elements.
  const [eRef, eBounds] = useRefWithBounds(drawingData);
  const [tRef, tBounds] = useRefWithBounds(drawingData);
  const we = eBounds?.width || 100;
  const wt = tBounds?.width || 100;
  const he = eBounds?.height || 100;
  const ht = tBounds?.height || 100;
  let arrowPos, tx = 0, ty = 0, arrowPoints;

  // Determine the arrow position: 'between', 'topRight' or 'bottomLeft'.
  if (below) {
    if (we + arrowRadius * 1.5 < wt)
      arrowPos = 'topRight';
    else if (wt + arrowRadius * 1.5 < we)
      arrowPos = 'bottomLeft';
    else
      arrowPos = 'between';
  } else {
    if (he + arrowRadius * 1.5 < ht)
      arrowPos = 'bottomLeft';
    else
      arrowPos = 'between';
  }

  // Determine the drawing size.
  const width = below ? Math.max(we, wt) : (we + (arrowPos === 'between' ? arrowLength : delta) + wt);
  const height = below ? he + (arrowPos === 'between' ? arrowLength : delta) + ht : Math.max(he, ht);

  if (eBounds && tBounds) {
    // Determine the table position.
    if (below) {
      if (arrowPos === 'between') {
        tx = Math.max(0, (we - wt) / 2);
        ty = he + arrowLength;
        const middleX = Math.min(eBounds.middle.x, tBounds.middle.x);
        arrowPoints = [[middleX, eBounds.bottom + 4], [middleX, ty - 4]];
      } else if (arrowPos === 'topRight') {
        tx = 0;
        ty = he + delta;
        const rightX = eBounds.right + arrowRadius;
        const middleY = eBounds.middle.y;
        arrowPoints = [[eBounds.right + 4, middleY], [rightX, middleY], [rightX, ty - 4]]
      } else if (arrowPos === 'bottomLeft') {
        tx = we - wt;
        ty = he + delta;
        const leftX = tBounds.left - arrowRadius;
        const middleY = tBounds.middle.y;
        arrowPoints = [[leftX, eBounds.bottom + 4], [leftX, middleY], [tBounds.left - 4, middleY]];
      }
    } else {
      tx = we + (arrowPos === 'between' ? arrowLength : delta);
      ty = 0;
      if (arrowPos === 'between') {
        const middleY = Math.min(eBounds.middle.y, tBounds.middle.y);
        arrowPoints = [[eBounds.right + 4, middleY], [tx - 4, middleY]];
      } else {
        const middleX = eBounds.middle.x;
        const bottomY = eBounds.bottom + arrowRadius;
        arrowPoints = [[middleX, eBounds.bottom + 4], [middleX, bottomY], [tx - 4, bottomY]]
      }
    }
  }

  return <Drawing ref={drawingRef} width={width} height={height} maxWidth={width} disableSVGPointerEvents>
    <Element ref={eRef} position={[below && arrowPos === 'between' ? Math.max(0, (wt - we) / 2) : 0, 0]} anchor={[-1, -1]} behind>
      <Component>{query}</Component>
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
