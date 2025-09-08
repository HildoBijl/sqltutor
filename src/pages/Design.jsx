import { Link , useNavigate } from 'react-router-dom'    
import { Subpage } from 'components'
import { Rectangle, Drawing, Element, Line} from 'components'
import { Vector } from 'util'

function Skill({position, title, to}) {
        const skillPos = new Vector(position)
        const navigate = useNavigate();

        const width = 150; 
        const height = 50;
        const rectStart = skillPos.subtract(new Vector(width/2, height/2))
        const rectEnd = skillPos.add(new Vector(width/2, height/2))

        const handleDoubleClick = () => {
            if (to) {
                navigate(to);               
            }
        } 
        return (    
            <>
              <Rectangle
                  dimensions={{start: rectStart, end: rectEnd}}
                  cornerRadius={10}
                  style={{fill: '#f0f0f0', stroke: '#ccc', strokeWidth: 2}}
              />
              <Element position={skillPos}>
                  <span 
                      onDoubleClick={handleDoubleClick}
                      style={{
                          color: '#333',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          display: 'block',
                          fontSize: '18px',
                          cursor : to ? 'pointer' : 'default'
                      }}>{title}</span>
              </Element>
          </>
        )
        
        
        
        
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