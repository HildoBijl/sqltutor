import { Link  } from 'react-router-dom'    
import { Subpage } from 'components'
import { Rectangle, Drawing, Element, Line} from 'components'
import { Vector } from 'util'

function Skill({position, title, to}) {
        const skillPos = new Vector(position)

        const width = 150; 
        const height = 50;
        const rectStart = skillPos.subtract(new Vector(width/2, height/2))
        const rectEnd = skillPos.add(new Vector(width/2, height/2))

        const skillContent = (
            <>
              <Rectangle
                  dimensions={{start: rectStart, end: rectEnd}}
                  cornerRadius={10}
                  style={{fill: '#f0f0f0', stroke: '#ccc', strokeWidth: 2}}
              />
              <Element position={skillPos}>
                  <span style={{
                      color: '#333',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      display: 'block',
                      fontSize: '18px'
                  }}>{title}</span>
              </Element>
          </>
        )
        
        return to ? <Link to={to}>{skillContent}</Link>: skillContent
        
        
    }


export function Design() {
    
    return <Subpage>
        <Drawing width={400} height={400}>
            <Skill position={{x: 200, y: 100}} title="Database" to="/c/database" />
            <Skill position={{x: 200, y:230}} title="Database Table" to="/c/databaseTable" />
        </Drawing>
            
    </Subpage>  
}

export default Design