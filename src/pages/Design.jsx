import { Link , useNavigate } from 'react-router-dom'    
import { Subpage } from 'components'
import { Rectangle, Drawing, Element, Line, ArrowHead, Curve} from 'components'
import { Vector } from 'util'



// Component to represent a skill as a rectangle with a title. The skill can be clicked to navigate to its theory page.
function Skill({position, title, to, concept = false}) {
        // The position of the rectangle is a vector
        const skillPos = new Vector(position)
        // Use navigate hook to enable redirect on double click to theory page
        const navigate = useNavigate();

        // Define the rectangle dimensions
        const width = concept ? 150 : 180; 
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
                  cornerRadius={concept ? 0 : 10}
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
                          cursor : to ? 'pointer' : 'default',
                          wordWrap: 'break-word',
                          whiteSpace: 'normal',
                          width: `${width - 10}px`,
                          lineHeight: '1.2'
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
        <Curve 
            points={points}
            endArrow={true}
            spread={20}
            color="#666"
            style={{
                strokeWidth: 2,
                fill: 'none',
                ...style
            }}
        />
    );
}


export function Design() {
    
    // Render the skill diagram for the Design page
    return <Subpage>
        <Drawing width={400} height={400}>
            {/* Level one */}
            <Skill position={{x: 0, y: 100}} title="Database" to="/c/database" concept={true} />
            
            {/* Level two */}
            <Skill position={{x: 0, y:230}} title="Database Table" to="/c/databaseTable" concept={true} />
            <Skill position={{x: -300, y: 230}} title="Query language" to="/c/queryLanguage" concept={true} />

            {/* Level three */}
            <Skill position={{x: -300, y: 340}} title="SQL" to="/c/sql" concept={true} />
            <Skill position={{x: -100, y:340}} title="Data Types" to="/c/dataTypes" concept={true} />
            <Skill position={{x: 100, y: 340}} title="Projection and Filtering" to="/c/projectionAndFiltering" concept={true} />
            <Skill position={{x: 300, y: 340}} title="Database Keys" to="/c/databaseKeys" concept={true} />

            {/* Arrows connecting skills */}
            <SkillArrow 
                from={{x: 0, y: 125}}  
                to={{x: 0, y: 205}}    
            />
            <SkillArrow 
                from={{x: 0, y: 125}}  
                to={{x: -300, y: 205}}    
            />
            <SkillArrow
                from ={{x: -300, y: 255}}
                to ={{x: -300, y: 315}}
            />
            <SkillArrow 
                from={{x: 0, y: 255}}  
                to={{x: -100, y: 315}}    
            />
            <SkillArrow 
                from={{x: 0, y: 255}}  
                to={{x: 100, y: 315}}    
            />
            <SkillArrow 
                from={{x: 0, y: 255}}  
                to={{x: 300, y: 315}}    
            />
        </Drawing>
    </Subpage>  
}

export default Design