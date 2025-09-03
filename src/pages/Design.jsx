import { Link  } from 'react-router-dom'    
import { Subpage } from 'components'

import { Rectangle } from '../components/figures/Drawing/components/svgComponents/Rectangle'
import {Text} from '../components/figures/Drawing/components/svgComponents/Text'
import {Drawing} from '../components/figures/Drawing/Drawing'

export function Design() {
    const rect1 = { start: { x: 50, y: 50 }, end: { x: 250, y: 150 } }

    const textPosition = { x: 150, y: 100 }; 

    return <Subpage>
        <h1>Skill Tree Design</h1>
        <Drawing width={400} height={300}>
        <Rectangle
            dimensions={rect1}
            cornerRadius={12}
            style={{ fill: '#e0e0e0', stroke: '#888', strokeWidth: 2 }}
        />
        <Text
            position={textPosition}
            anchor="middle"
            style={{ fontSize: 28, fill: '#333' }}
        >
            Test
        </Text>
        </Drawing>
    </Subpage>  
}