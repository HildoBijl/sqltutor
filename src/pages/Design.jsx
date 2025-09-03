import { Link  } from 'react-router-dom'    
import { Subpage } from 'components'

import { Rectangle } from '../components/figures/Drawing/components/svgComponents/Rectangle'
import {Text} from '../components/figures/Drawing/components/svgComponents/Text'
import {Drawing} from '../components/figures/Drawing/Drawing'
import { ArrowHead } from '../components/figures/Drawing/components/svgComponents/ArrowHead'
import { Line } from '../components/figures/Drawing/components/svgComponents/Line'

export function Design() {
    // Coordinates for rectangles 
    const rect1 = { start: { x: 50, y: 50 }, end: { x: 250, y: 150 } }
    const rect2 = { start: { x: 300, y: 50 }, end: { x: 500, y: 150 } }


    // Coordinates for text
    const textPosition = { x: 150, y: 100 }; 
    const textPosition2 = { x: 400, y: 100 };


    // Coordinates for arrow
    const arrowStart = { x: 250, y: 100 };
    const arrowEnd = { x: 300, y: 100 };

    // Arrow calculations
    const dx = arrowEnd.x - arrowStart.x;
    const dy = arrowEnd.y - arrowStart.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    return <Subpage>
        <h1>Skill Tree Design</h1>
        <Drawing width={400} height={300}>
        <Rectangle
            dimensions={rect1}
            cornerRadius={12}
            style={{ fill: '#e0e0e0', stroke: '#888', strokeWidth: 2 }}
        />
        <Rectangle
            dimensions={rect2}
            cornerRadius={12}
            style={{ fill: '#c0c0c0', stroke: '#888', strokeWidth: 2 }}
        />
        <Text
            position={textPosition}
            anchor="middle"
            style={{ fontSize: 28, fill: '#333' }}
        >
            Test
        </Text>
        <Text
            position={textPosition2}
            anchor="middle"
            style={{ fontSize: 20, fill: '#333' }}
        >
            Alexandra is cool
        </Text>


        <Line
    points={[arrowStart, arrowEnd]}
    size={3}
    color="#ffffffff"
    style={{ stroke: '#ffffffff' }}
/>

<ArrowHead
    position={arrowEnd}
    angle={angle} // just pass angle, do NOT multiply by Math.PI/180
    size={3}
    color="#ffffffff"
/>
        </Drawing>
    </Subpage>  
}