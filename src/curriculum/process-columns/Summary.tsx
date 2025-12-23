import { useThemeColor } from '@/theme';
import { Page, Section, Par, Info } from '@/components';
import { Drawing, Element } from '@/components';
import { ISQL } from '@/components';

import { FigureExampleQuery } from '../queryFigures';

export function Summary() {
  return <Page>
    <Section>
      <Par>In SQL there is a wide variety of functions that can be used to process the values in a column, for instance to create new columns.</Par>
      <FigureExampleQuery query={`SELECT
  position,
  salary,
  0.3*salary AS taxes
FROM emp_data;`} tableWidth={350} />
      <Par>The most commonly used processing functions for numbers and text are shown below. There are far more, so whenever you want to process some values, do a quick search on which functions might come in handy.</Par>
      <FigureProcessingCommands />
      <Info>Processing functions for <ISQL>DATE</ISQL> values are also available, but they strongly differ per DBMS. Look up the specifications for your own DBMS whenever you need them.</Info>
    </Section>
  </Page>;
}

function FigureProcessingCommands() {
  const themeColor = useThemeColor();

  // Define styles.
  const titleStyle = { fontWeight: 600, fontSize: '1.2em' };
  const headerStyle = { fontWeight: 550, fontSize: '1.05em' };
  const operationStyle = { color: themeColor, fontWeight: 500, fontSize: '0.9em' };

  // Define heights.
  const titleHeight = 50;
  const headerHeight = 33;
  const lineHeight = 30;
  const height = titleHeight + headerHeight + 10.5 * lineHeight;

  // Define widths.
  const w1 = 400;
  const delta = 25; // Margin between two halves.
  const w2 = 550;
  const w = w1 + delta + w2;

  const x11 = 4;
  const x12 = 180;
  const x13 = w1 - 60;
  const x1i = (x12 + x13) / 2 + 25;
  const xm1 = x12;

  const x21 = w1 + delta;
  const x22 = x21 + 240;
  const x23 = x21 + w2 - 80;
  const x2i = (x22 + x23) / 2 + 36;
  const xm2 = x22;

  return <Drawing width={w} height={height} maxWidth={w} disableSVGPointerEvents>
    {/* Numbers */}
    <Element position={[xm1, 0]} anchor={[0, -1]} behind>
      <span style={titleStyle}>Numbers</span>
    </Element>

    <Element position={[x11, titleHeight]} anchor={[-1, 0]} behind>
      <span style={headerStyle}>Operation</span>
    </Element>
    <Element position={[x12, titleHeight]} anchor={[0, 0]} behind>
      <span style={headerStyle}>Example</span>
    </Element>
    <Element position={[x13, titleHeight]} anchor={[0, 0]} behind>
      <span style={headerStyle}>Result</span>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 0]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Addition</span>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 0]} anchor={[0, 0]} behind>
      <ISQL>5 + 2</ISQL>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 0]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 0]} anchor={[0, 0]} behind>
      <ISQL>7</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 1]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Subtraction</span>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 1]} anchor={[0, 0]} behind>
      <ISQL>5 - 2</ISQL>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 1]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 1]} anchor={[0, 0]} behind>
      <ISQL>3</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 2]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Multiplication</span>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 2]} anchor={[0, 0]} behind>
      <ISQL>5 * 2</ISQL>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 2]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 2]} anchor={[0, 0]} behind>
      <ISQL>10</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 3]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Division</span>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 3]} anchor={[0, 0]} behind>
      <ISQL>5 / 2</ISQL>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 3]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 3]} anchor={[0, 0]} behind>
      <ISQL>2.5</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 4]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Modulo</span>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 4]} anchor={[0, 0]} behind>
      <ISQL>5 % 2</ISQL>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 4]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 4]} anchor={[0, 0]} behind>
      <ISQL>1</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 5]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Rounding</span>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 5]} anchor={[0, 0]} behind>
      <ISQL>ROUND(3.14159)</ISQL>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 5]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 5]} anchor={[0, 0]} behind>
      <ISQL>3</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 6]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Rounding</span>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 6]} anchor={[0, 0]} behind>
      <ISQL>ROUND(3.14159, 2)</ISQL>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 6]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 6]} anchor={[0, 0]} behind>
      <ISQL>3.14</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 7]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Maximum</span>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 7]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 7]} anchor={[0, 0]} behind>
      <ISQL>GREATEST(5, 2)</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 7]} anchor={[0, 0]} behind>
      <ISQL>5</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 8]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Minimum</span>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 8]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 8]} anchor={[0, 0]} behind>
      <ISQL>LEAST(5, 2)</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 8]} anchor={[0, 0]} behind>
      <ISQL>2</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 9]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Absolute</span>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 9]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 9]} anchor={[0, 0]} behind>
      <ISQL>ABS(-5)</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 9]} anchor={[0, 0]} behind>
      <ISQL>5</ISQL>
    </Element>

    <Element position={[x11, titleHeight + headerHeight + lineHeight * 10]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Power</span>
    </Element>
    <Element position={[x1i, titleHeight + headerHeight + lineHeight * 10]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x12, titleHeight + headerHeight + lineHeight * 10]} anchor={[0, 0]} behind>
      <ISQL>POWER(10, 3)</ISQL>
    </Element>
    <Element position={[x13, titleHeight + headerHeight + lineHeight * 10]} anchor={[0, 0]} behind>
      <ISQL>1000</ISQL>
    </Element>

    {/* Text */}
    <Element position={[xm2, 0]} anchor={[0, -1]} behind>
      <span style={titleStyle}>Text</span>
    </Element>

    <Element position={[x21, titleHeight]} anchor={[-1, 0]} behind>
      <span style={headerStyle}>Operation</span>
    </Element>
    <Element position={[x22, titleHeight]} anchor={[0, 0]} behind>
      <span style={headerStyle}>Example</span>
    </Element>
    <Element position={[x23, titleHeight]} anchor={[0, 0]} behind>
      <span style={headerStyle}>Result</span>
    </Element>

    <Element position={[x21, titleHeight + headerHeight + lineHeight * 0]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Concatenation</span>
    </Element>
    <Element position={[x22, titleHeight + headerHeight + lineHeight * 0]} anchor={[0, 0]} behind>
      <ISQL>'SQL' || 'Valley'</ISQL>
    </Element>
    <Element position={[x2i, titleHeight + headerHeight + lineHeight * 0]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x23, titleHeight + headerHeight + lineHeight * 0]} anchor={[0, 0]} behind>
      <ISQL>'SQLValley'</ISQL>
    </Element>

    <Element position={[x21, titleHeight + headerHeight + lineHeight * 1]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Trimming</span>
    </Element>
    <Element position={[x22, titleHeight + headerHeight + lineHeight * 1]} anchor={[0, 0]} behind>
      <ISQL>TRIM('   user input  ')</ISQL>
    </Element>
    <Element position={[x2i, titleHeight + headerHeight + lineHeight * 1]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x23, titleHeight + headerHeight + lineHeight * 1]} anchor={[0, 0]} behind>
      <ISQL>'user input'</ISQL>
    </Element>

    <Element position={[x21, titleHeight + headerHeight + lineHeight * 2]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Upper case</span>
    </Element>
    <Element position={[x22, titleHeight + headerHeight + lineHeight * 2]} anchor={[0, 0]} behind>
      <ISQL>UPPER('SQL Valley')</ISQL>
    </Element>
    <Element position={[x2i, titleHeight + headerHeight + lineHeight * 2]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x23, titleHeight + headerHeight + lineHeight * 2]} anchor={[0, 0]} behind>
      <ISQL>'SQL VALLEY'</ISQL>
    </Element>

    <Element position={[x21, titleHeight + headerHeight + lineHeight * 3]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Lower case</span>
    </Element>
    <Element position={[x22, titleHeight + headerHeight + lineHeight * 3]} anchor={[0, 0]} behind>
      <ISQL>LOWER('SQL Valley')</ISQL>
    </Element>
    <Element position={[x2i, titleHeight + headerHeight + lineHeight * 3]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x23, titleHeight + headerHeight + lineHeight * 3]} anchor={[0, 0]} behind>
      <ISQL>'sql valley'</ISQL>
    </Element>

    <Element position={[x21, titleHeight + headerHeight + lineHeight * 4]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Replace</span>
    </Element>
    <Element position={[x22, titleHeight + headerHeight + lineHeight * 4]} anchor={[0, 0]} behind>
      <ISQL>REPLACE('SQL', 'QL', 'equel')</ISQL>
    </Element>
    <Element position={[x2i, titleHeight + headerHeight + lineHeight * 4]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x23, titleHeight + headerHeight + lineHeight * 4]} anchor={[0, 0]} behind>
      <ISQL>'Sequel'</ISQL>
    </Element>

    <Element position={[x21, titleHeight + headerHeight + lineHeight * 5]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Search</span>
    </Element>
    <Element position={[x22, titleHeight + headerHeight + lineHeight * 5]} anchor={[0, 0]} behind>
      <ISQL>CHARINDEX('SQL Valley', 'Val')</ISQL>
    </Element>
    <Element position={[x2i, titleHeight + headerHeight + lineHeight * 5]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x23, titleHeight + headerHeight + lineHeight * 5]} anchor={[0, 0]} behind>
      <ISQL>5</ISQL>
    </Element>

    <Element position={[x21, titleHeight + headerHeight + lineHeight * 6]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Text part</span>
    </Element>
    <Element position={[x22, titleHeight + headerHeight + lineHeight * 6]} anchor={[0, 0]} behind>
      <ISQL>SUBSTRING('SQL Valley', 3, 5)</ISQL>
    </Element>
    <Element position={[x2i, titleHeight + headerHeight + lineHeight * 6]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x23, titleHeight + headerHeight + lineHeight * 6]} anchor={[0, 0]} behind>
      <ISQL>'L Val'</ISQL>
    </Element>

    {/* Fallback values */}
    <Element position={[xm2, lineHeight * 10]} anchor={[0, -1]} behind>
      <span style={titleStyle}><ISQL>NULL</ISQL> values</span>
    </Element>

    <Element position={[x21, titleHeight + lineHeight * 10]} anchor={[-1, 0]} behind>
      <span style={headerStyle}>Operation</span>
    </Element>
    <Element position={[x22, titleHeight + lineHeight * 10]} anchor={[0, 0]} behind>
      <span style={headerStyle}>Example</span>
    </Element>
    <Element position={[x23, titleHeight + lineHeight * 10]} anchor={[0, 0]} behind>
      <span style={headerStyle}>Result</span>
    </Element>

    <Element position={[x21, titleHeight + headerHeight + lineHeight * 10]} anchor={[-1, 0]} behind>
      <span style={operationStyle}>Fallback value</span>
    </Element>
    <Element position={[x22, titleHeight + headerHeight + lineHeight * 10]} anchor={[0, 0]} behind>
      <ISQL>COALESCE(null, null, 'Default')</ISQL>
    </Element>
    <Element position={[x2i, titleHeight + headerHeight + lineHeight * 10]} anchor={[0, 0]} behind>
      <ISQL>=</ISQL>
    </Element>
    <Element position={[x23, titleHeight + headerHeight + lineHeight * 10]} anchor={[0, 0]} behind>
      <ISQL>'Default'</ISQL>
    </Element>
  </Drawing>;
}
