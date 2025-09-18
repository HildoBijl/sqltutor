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
        const rectStart = skillPos.subtract([width/2, height/2])
        const rectEnd = skillPos.add([width/2, height/2])

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
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            <div style={{
                width: '90vw',
                height: '90vh',
                maxWidth: '800px',
                maxHeight: '800px',
                minWidth: '400px',
                minHeight: '400px'
            }}>
                <Drawing width={800} height={600}>
            {/* Level one */}
            <Skill position={{x: 400, y: 100}} title="Database" to="/c/database" concept={true} />

            {/* Level two */}
            <Skill position={{x: 400, y:230}} title="Database Table" to="/c/databaseTable" concept={true} />
            <Skill position={{x: 100, y: 230}} title="Query language" to="/c/queryLanguage" concept={true} />

            {/* Level three */}
            <Skill position={{x: 100, y: 340}} title="SQL" to="/c/sql" concept={true} />
            <Skill position={{x: 300, y:340}} title="Data Types" to="/c/dataTypes" concept={true} />
            <Skill position={{x: 500, y: 340}} title="Projection and Filtering" to="/c/projectionAndFiltering" concept={true} />
            <Skill position={{x: 700, y: 340}} title="Database Keys" to="/c/databaseKeys" concept={true} />

            {/* Level four */}
            <Skill position={{x: 100, y: 450}} title="Filter Rows" to  ="/c/filterRows" />
            <Skill position={{x: 400, y: 450}} title="Choose Columns" to="/c/chooseColumns" />
            <Skill position={{x: 700, y:450}} title="Join and Decomposition" to ="/c/joinAndDecomposition" concept={true}/>

            {/* Arrows connecting skills */}
            {/* Database to Database Table */}
            <SkillArrow
                from={{x: 400, y: 125}}
                to={{x: 400, y: 205}}
            />
            {/* Database to Query language */}
            <SkillArrow
                from={{x: 400, y: 125}}
                to={{x: 100, y: 205}}
            />
            {/* Query language to SQL */}
            <SkillArrow
                from ={{x: 100, y: 255}}
                to ={{x: 100, y: 315}}
            />
            {/* Database Table to Data Types */}
            <SkillArrow
                from={{x: 400, y: 255}}
                to={{x: 300, y: 315}}
            />
            {/* Database Table to Projection and Filtering */}
            <SkillArrow
                from={{x: 400, y: 255}}
                to={{x: 500, y: 315}}
            />
            {/* Database Table to Database Keys */}
            <SkillArrow
                from={{x: 400, y: 255}}
                to={{x: 700, y: 315}}
            />
            {/* SQL to Filter Rows */}
            <SkillArrow
                from={{x: 100, y: 365}}
                to={{x: 100, y: 425}}
            />
            {/* SQL to Choose Columns */}
            <SkillArrow
                from={{x: 100, y: 365}}
                to={{x: 400, y: 425}}
            />
            {/* Data Types to Filter Rows */}
            <SkillArrow
                from={{x: 300, y: 365}}
                to={{x: 100, y: 425}}
            />
            {/* Data Types to Join and Decomposition */}
            <SkillArrow
                from={{x: 300, y: 365}}
                to={{x: 700, y: 425}}
            />
            {/* Projection and Filtering to Filter Rows */}
            <SkillArrow
                from={{x: 500, y: 365}}
                to={{x: 100, y: 425}}
            />
            {/* Projection and Filtering to Choose Columns */}
            <SkillArrow
                from={{x: 500, y: 365}}
                to={{x: 400, y: 425}}
            />
            {/* Projection and Filtering to Join and Decomposition */}
            <SkillArrow
                from={{x: 500, y: 365}}
                to={{x: 700, y: 425}}
            />
            {/* Database Keys to Join and Decomposition */}
            <SkillArrow
                from={{x: 700, y: 365}}
                to={{x: 700, y: 425}}
            />
                </Drawing>
            </div>
        </div>
    </Subpage>
}

export default Design