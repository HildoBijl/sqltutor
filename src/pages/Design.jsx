import { Link , useNavigate } from 'react-router-dom'    
import { Subpage } from 'components'
import { Rectangle, Drawing, Element, Line, ArrowHead, Curve} from 'components'
import { Vector } from 'util'



// Component to represent a skill as a rectangle with a title. The skill can be clicked to navigate to its theory page.
function Skill({position, title, to}) {
        // The position of the rectangle is a vector
        const skillPos = new Vector(position)
        // Use navigate hook to enable redirect on double click to theory page
        const navigate = useNavigate();

        // Define the rectangle dimensions
        const width = 150; 
        const height = 50;
        const rectStart = skillPos.subtract(new Vector(width/2, height/2))
        const rectEnd = skillPos.add(new Vector(width/2, height/2))

        // Navigate to the skill theory page on double click
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

// Function to draw an arrow between two skills
    function SkillArrow({from, to, style = {}}) {
    const fromVector = new Vector(from);
    const toVector = new Vector(to);
    
    const midY = fromVector.y + (toVector.y - fromVector.y) * 0.6; 
    const cornerPoint = new Vector(fromVector.x, midY);
    const cornerPoint2 = new Vector(toVector.x, midY);
    
    
    const points = [fromVector, cornerPoint, cornerPoint2, toVector];
    
    return (
        <Line 
            points={points}
            endArrow={true}
            style={{
                stroke: '#666',
                strokeWidth: 2,
                fill: 'none',
                ...style
            }}
        />
    );
}


export function Design() {
    
    return <Subpage>
        <Drawing width={400} height={400}>
            <Skill position={{x: 200, y: 100}} title="Database" to="/c/database" />
            <Skill position={{x: 200, y:230}} title="Database Table" to="/c/databaseTable" />
            <Skill position={{x: -100, y: 230}} title="Query language" to="/c/queryLanguage" />


            <SkillArrow 
                from={{x: 200, y: 125}}  
                to={{x: 200, y: 205}}    
                curvature={0.1} 
            />
            <SkillArrow 
                from={{x: 200, y: 125}}  
                to={{x: -100, y: 205}}    
                curvature={0.2} 
            />
        </Drawing>
            
    </Subpage>  
}

export default Design