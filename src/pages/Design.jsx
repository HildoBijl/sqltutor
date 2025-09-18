import { useNavigate } from 'react-router-dom'
import { Subpage } from 'components'
import { Rectangle, Drawing, Element } from 'components'
import { Vector } from 'util'
import { contents } from '../edu/skillTree.js'

// Helper function to flatten the nested contents structure
function flattenContents(contentsObj) {
    const flattened = {};

    function traverse(obj, path = []) {
        Object.entries(obj).forEach(([key, value]) => {
            if (value && typeof value === 'object' && value.type && value.name) {
                // This is a skill/concept object
                flattened[key] = value;
            } else if (value && typeof value === 'object') {
                // This is a nested category, continue traversing
                traverse(value, [...path, key]);
            }
        });
    }

    traverse(contentsObj);
    return flattened;
}

// Layout calculation using explicit level and position fields
function calculateTreeLayout(componentsMap, canvasWidth, canvasHeight) {
    const positions = {};
    const levelHeight = 140;
    const topPadding = 80;

    // Group components by their explicit level field
    const levelNodes = new Map();
    Object.entries(componentsMap).forEach(([id, component]) => {
        // Use explicit level field, default to 1 if not provided
        const level = component.level || 1;
        if (!levelNodes.has(level)) levelNodes.set(level, []);
        levelNodes.get(level).push({ id, ...component });
    });

    // Position nodes level by level with proper spacing
    Array.from(levelNodes.keys()).sort((a, b) => a - b).forEach(level => {
        const nodesAtLevel = levelNodes.get(level);

        // Sort nodes by their position field (left to right)
        nodesAtLevel.sort((a, b) => (a.position || 0) - (b.position || 0));

        // Calculate Y position (level 1 starts from top)
        const levelY = topPadding + ((level - 1) * levelHeight);3

        // Calculate actual width needed for each skill
        const getSkillWidth = (component) => component.type === 'concept' ? 150 : 180;
        const skillWidths = nodesAtLevel.map(node => getSkillWidth(node));

        // Calculate spacing based on number of skills - smaller levels more centered, larger levels spread out
        const totalSkillWidth = skillWidths.reduce((sum, width) => sum + width, 0);
        const sidePadding = 20; // Reduced from 100 to minimize margin space
        const availableWidth = canvasWidth - (2 * sidePadding);

        if (nodesAtLevel.length === 1) {
            // Center single items
            positions[nodesAtLevel[0].id] = {
                x: canvasWidth / 2,
                y: levelY
            };
        } else if (nodesAtLevel.length <= 2) {
            // Small levels (2 skills) - keep them more centered with tighter spacing
            const centerGap = 120; // Fixed gap for small levels
            const totalWidth = totalSkillWidth + centerGap;
            const startX = (canvasWidth - totalWidth) / 2 + skillWidths[0] / 2;

            let currentX = startX;
            nodesAtLevel.forEach((node, index) => {
                positions[node.id] = {
                    x: currentX,
                    y: levelY
                };

                // Move to next position
                if (index < nodesAtLevel.length - 1) {
                    currentX += skillWidths[index] / 2 + centerGap + skillWidths[index + 1] / 2;
                }
            });
        } else {
            // Larger levels (3+ skills) - spread them out more using available width
            const minGap = 50;
            const totalGapWidth = (nodesAtLevel.length - 1) * minGap;
            const totalRequiredWidth = totalSkillWidth + totalGapWidth;

            if (totalRequiredWidth <= availableWidth) {
                // Spread items across available width with extra spacing
                const extraSpace = availableWidth - totalRequiredWidth;
                const spaceBetween = minGap + (extraSpace / (nodesAtLevel.length - 1));

                let currentX = sidePadding + skillWidths[0] / 2;

                nodesAtLevel.forEach((node, index) => {
                    positions[node.id] = {
                        x: currentX,
                        y: levelY
                    };

                    // Move to next position
                    if (index < nodesAtLevel.length - 1) {
                        currentX += skillWidths[index] / 2 + spaceBetween + skillWidths[index + 1] / 2;
                    }
                });
            } else {
                // Items need compression but maintain minimum gaps
                const compressionFactor = availableWidth / totalRequiredWidth;
                const compressedGap = Math.max(20, minGap * compressionFactor);

                let currentX = sidePadding + skillWidths[0] / 2;

                nodesAtLevel.forEach((node, index) => {
                    positions[node.id] = {
                        x: currentX,
                        y: levelY
                    };

                    if (index < nodesAtLevel.length - 1) {
                        currentX += skillWidths[index] / 2 + compressedGap + skillWidths[index + 1] / 2;
                    }
                });
            }
        }
    });

    return positions;
}


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


export function Design() {
    // Flatten the nested contents structure
    const components = flattenContents(contents);

    // Use the improved layout
    const positions = calculateTreeLayout(components, 1200, 800);

    const skillElements = Object.entries(components).map(([id, component]) => {
        const position = positions[id];
        if (!position) return null;

        const isConceptType = component.type === 'concept';

        return (
            <Skill
                key={id}
                position={position}
                title={component.name}
                to={`/c/${id}`}
                concept={isConceptType}
            />
        );
    }).filter(Boolean);

    // Generate arrows with improved positioning (disabled for now)
    const arrowElements = [];
    // Object.entries(components).forEach(([id, component]) => {
    //     if (component.prerequisites && component.prerequisites.length > 0) {
    //         component.prerequisites.forEach((prerequisite, index) => {
    //             const fromPos = positions[prerequisite.id];
    //             const toPos = positions[id];

    //             if (fromPos && toPos) {
    //                 arrowElements.push(
    //                     <SkillArrow
    //                         key={`${prerequisite.id}-${id}-${index}`}
    //                         from={fromPos}
    //                         to={toPos}
    //                     />
    //                 );
    //             }
    //         });
    //     }
    // });

    return (
        <Subpage>
            <div style={{
                width: '100%',
                minHeight: '100vh',
                overflow: 'auto',
                padding: '20px',
                boxSizing: 'border-box',
                scrollBehavior: 'smooth',
                // Hide scrollbar for webkit browsers
                WebkitScrollbar: 'none',
                msOverflowStyle: 'none',  // Hide scrollbar for IE and Edge
                scrollbarWidth: 'none',   // Hide scrollbar for Firefox
                // Add custom scrollbar styles for webkit
                '&::-webkit-scrollbar': {
                    display: 'none'
                }
            }}>
                <Drawing width={1200} height={800}>
                    {skillElements}
                    {arrowElements}
                </Drawing>
            </div>
        </Subpage>
    );
}

export default Design