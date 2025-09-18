import { Link , useNavigate } from 'react-router-dom'
import { Subpage } from 'components'
import { Rectangle, Drawing, Element, Line, ArrowHead, Curve} from 'components'
import { Vector } from 'util'
import { components } from '../edu/skillTree.js'

// Helper function to calculate levels based on prerequisites
function calculateLevels(componentsMap) {
    const levels = new Map();
    const visited = new Set();

    function getLevel(componentId) {
        if (levels.has(componentId)) return levels.get(componentId);
        if (visited.has(componentId)) return 0; // Make sure to avoid cycles

        visited.add(componentId);
        const component = componentsMap[componentId];
        if (!component) return 0;

        let maxPrereqLevel = -1;
        if (component.prerequisites && component.prerequisites.length > 0) {
            for (const prereq of component.prerequisites) {
                const prereqLevel = getLevel(prereq.id);
                maxPrereqLevel = Math.max(maxPrereqLevel, prereqLevel);
            }
        }

        const level = maxPrereqLevel + 1;
        levels.set(componentId, level);
        visited.delete(componentId);
        return level;
    }

    // Calculate levels for all components
    Object.keys(componentsMap).forEach(id => getLevel(id));
    return levels;
}

// Improved layout calculation with better spacing and positioning
function calculateLayout(componentsMap, canvasWidth, canvasHeight) {
    const levels = calculateLevels(componentsMap);
    const maxLevel = Math.max(...Array.from(levels.values()));

    // Group components by level
    const levelGroups = new Map();
    Object.entries(componentsMap).forEach(([id, component]) => {
        const level = levels.get(id);
        if (!levelGroups.has(level)) levelGroups.set(level, []);
        levelGroups.get(level).push({ id, ...component });
    });

    const positions = {};

    // Improved spacing calculations
    const topPadding = 80;
    const bottomPadding = 80;
    const availableHeight = canvasHeight - topPadding - bottomPadding;
    const levelSpacing = maxLevel > 0 ? availableHeight / maxLevel : availableHeight;

    // Ensure minimum spacing between levels
    const minLevelSpacing = 120;
    const actualLevelSpacing = Math.max(minLevelSpacing, levelSpacing);

    levelGroups.forEach((componentsInLevel, level) => {
        const levelY = topPadding + (level * actualLevelSpacing);

        // Improved horizontal spacing
        const sidePadding = 100;
        const availableWidth = canvasWidth - (2 * sidePadding);

        // Calculate positions to avoid overlap
        const itemWidth = 200; // estimated max width of items
        const minSpacing = itemWidth + 40; // minimum gap between items

        if (componentsInLevel.length === 1) {
            // Center single items
            positions[componentsInLevel[0].id] = {
                x: canvasWidth / 2,
                y: levelY
            };
        } else {
            // For multiple items, ensure proper spacing
            const totalRequiredWidth = componentsInLevel.length * minSpacing;

            if (totalRequiredWidth <= availableWidth) {
                // Items fit with good spacing
                const actualSpacing = availableWidth / (componentsInLevel.length + 1);
                componentsInLevel.forEach((component, index) => {
                    positions[component.id] = {
                        x: sidePadding + actualSpacing * (index + 1),
                        y: levelY
                    };
                });
            } else {
                // Items need to be compressed but avoid overlap
                const actualSpacing = availableWidth / componentsInLevel.length;
                componentsInLevel.forEach((component, index) => {
                    positions[component.id] = {
                        x: sidePadding + actualSpacing * (index + 0.5),
                        y: levelY
                    };
                });
            }
        }
    });

    return positions;
}

// Fixed layout calculation that prevents overlaps
function calculateTreeLayout(componentsMap, canvasWidth, canvasHeight) {
    const levels = calculateLevels(componentsMap);

    const positions = {};
    const levelHeight = 140;
    const topPadding = 80;

    // Process level by level
    const levelNodes = new Map();
    Object.entries(componentsMap).forEach(([id, component]) => {
        const level = levels.get(id);
        if (!levelNodes.has(level)) levelNodes.set(level, []);
        levelNodes.get(level).push({ id, ...component });
    });

    // Position nodes level by level with proper spacing
    Array.from(levelNodes.keys()).sort((a, b) => a - b).forEach(level => {
        const nodesAtLevel = levelNodes.get(level);
        const levelY = topPadding + (level * levelHeight);

        // Calculate actual width needed for each skill
        const getSkillWidth = (component) => component.type === 'concept' ? 150 : 180;
        const skillWidths = nodesAtLevel.map(node => getSkillWidth(node));

        // Calculate spacing to prevent overlaps
        const minGap = 50; // minimum gap between skills
        const totalSkillWidth = skillWidths.reduce((sum, width) => sum + width, 0);
        const totalGapWidth = (nodesAtLevel.length - 1) * minGap;
        const totalRequiredWidth = totalSkillWidth + totalGapWidth;

        const sidePadding = 100;
        const availableWidth = canvasWidth - (2 * sidePadding);

        if (nodesAtLevel.length === 1) {
            // Center single items
            positions[nodesAtLevel[0].id] = {
                x: canvasWidth / 2,
                y: levelY
            };
        } else if (totalRequiredWidth <= availableWidth) {
            // Items fit with good spacing - distribute evenly
            const extraSpace = availableWidth - totalRequiredWidth;
            const spaceBetween = minGap + (extraSpace / (nodesAtLevel.length - 1));

            let currentX = sidePadding + skillWidths[0] / 2; // start at center of first skill

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
            const compressedGap = Math.max(20, minGap * compressionFactor); // never less than 20px

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

// Arrow positioning 
function SkillArrow({from, to, style = {}}) {
    if (!from || !to) return null;

    const fromVector = new Vector(from);
    const toVector = new Vector(to);

    // Calculate connection points on the edges of rectangles
    const skillHeight = 50;
    const fromY = fromVector.y + (skillHeight / 2) + 5; // bottom edge + small gap
    const toY = toVector.y - (skillHeight / 2) - 5; // top edge - small gap

    // Create smoother curves
    const controlPoint1Y = fromY + (toY - fromY) * 0.3;
    const controlPoint2Y = fromY + (toY - fromY) * 0.7;

    const points = [
        new Vector(fromVector.x, fromY),
        new Vector(fromVector.x, controlPoint1Y),
        new Vector(toVector.x, controlPoint2Y),
        new Vector(toVector.x, toY)
    ];

    return (
        <Curve
            points={points}
            endArrow={true}
            spread={15}
            color="#888"
            style={{
                strokeWidth: 1.5,
                fill: 'none',
                opacity: 0.8,
                ...style
            }}
        />
    );
}


export function Design() {
    // Use the improved layout - choose one:
    const positions = calculateTreeLayout(components, 1200, 800); // or calculateLayout

    const skillElements = Object.entries(components).map(([id, component]) => {
        const position = positions[id];
        if (!position) return null;

        const isConceptType = component.type === 'concept';

        return (
            <Skill
                key={id}
                position={position}
                title={component.name}
                to={`/${component.type}/${id}`}
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