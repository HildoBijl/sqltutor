import { modules } from '@/curriculum';
import { applyMapping } from '@/utils/javascript';
import { type VectorInput, Vector, ensureVector } from '@/utils/geometry';
import { cardWidth, cardHeight } from '../utils/settings';
import { computeConnectorPath } from '../utils/pathCalculations';

export interface ModulePositionMetaRaw {
    position: VectorInput;
}

const margin = 20;

const dy = cardHeight * 1.5;
const y1 = margin + cardHeight / 2;
const y2 = y1 + dy;
const y3 = y2 + dy;
const y4 = y3 + dy;
const y5 = y4 + dy;
const y6 = y5 + dy;
const y7 = y6 + dy;
const y8 = y7 + dy;
const y9 = y8 + dy;
const y10 = y9 + dy;
export const treeHeight = y10 + cardHeight / 2 + margin;

const dx = cardWidth * 1.5;
const x1 = margin + cardWidth / 2;
const x2 = x1 + dx;
const x3 = x2 + dx;
const x4 = x3 + dx;
const x5 = x4 + dx;
const x6 = x5 + dx;
// const x7 = x6 + dx;
export const treeWidth = x6 + cardWidth / 2 + margin;

// Placeholder positions for RA skill tree
const modulePositionsRaw: Record<string, ModulePositionMetaRaw> = {
    // Fundamental database concepts (shared with SQL and RA tree)
	'database': { position: { x: x3, y: y1 } },
	'database-table': { position: { x: (x2+x3)/2, y: y2 } },
	'query-language': { position: { x: (x3+x4)/2, y: y2 } },
    'projection-and-filtering': { position: { x: x2, y: y3 } },
	'database-keys': { position: { x: x3, y: y3 } },

    'database-view': { position: { x: x2, y: y4 } },
    'foreign-key': { position: { x: x3, y: y4 } },
    'datalog': { position: { x: x2, y: y5 } },
    'join-and-decomposition': { position: { x: x3, y: y5 } },
    'recursive-query': { position: { x: x4, y: y5 } },

    // Datalog concepts
    'dl-define-projection-rule': { position: { x: x1, y: y6 } },
    'dl-define-filtering-rule': { position: { x: x2, y: y6 } },
    'dl-define-derived-predicate': { position: { x: x1, y: y7 } },
    'dl-define-join-rule': { position: { x: x2, y: y7 } },
    
    // Datalog with negation
    'dl-literal-types-and-rule-safety': { position: { x: x3, y: y6 } },
    'dl-define-negation-rule': { position: { x: (x2+x3)/2, y: y8 } },
    'dl-check-rule-safety': { position: { x: x3, y: y7 } },
    'dl-write-multi-predicate-program': { position: { x: x2, y: y9 } },
    
    // Recursive Datalog
    'dl-predicate-dependency-graph': { position: { x: (x4+x5)/2, y: y6 } },
    'dl-draw-predicate-dependency-graph': { position: { x: x4, y: y7 } },
    'dl-semi-positive-and-stratified-datalog': { position: { x: x5, y: y7 } },
    'dl-check-program-stratification': { position: { x: (x4+x5)/2, y: y8 } },
    'dl-define-recursive-predicate': { position: { x: (x3+x4)/2, y: y8 } },
    'dl-write-recursive-program': { position: { x: x3, y: y10} },





    
}

export interface ModulePositionMeta extends Omit<ModulePositionMetaRaw, 'position'> {
    id: string;
    position: Vector;
    prerequisitesPathOrder: string[];
    followUpsPathOrder: string[];
}

// Prepare the moduleWithPosition mapping object with empty lists.
export const datalogModulePositions: Record<string, ModulePositionMeta> = applyMapping(modulePositionsRaw, (positionDataRaw: ModulePositionMetaRaw, id: string) => {
    // Verify that all skills for which positions are defined exist.
    if (!modules[id])
        throw new Error(`Invalid module ID "${id}" encountered when defining module positions for the RA Skill Tree.`);

    // Set up the empty shell for the skill.
    return {
        ...positionDataRaw,
        id,
        position: ensureVector(positionDataRaw.position, 2),
        prerequisitesPathOrder: [],
        followUpsPathOrder: [],
    };
})

// Calculate the order in which prerequisites and follow-ups should be displayed.
Object.values(datalogModulePositions).forEach(positionData => {
    const { position } = positionData;

    // Determine an order for the prerequisites.
    const prerequisiteRefPoint = position.add([0, -cardHeight / 2]);
    positionData.prerequisitesPathOrder = modules[positionData.id].prerequisites
        .filter(id => !!modulePositionsRaw[id]) // The prerequisite is in the tree.
        .map(id => {
            const { position } = datalogModulePositions[id]
            const refPoint = position.add([0, cardHeight / 2]);
            const relPoint = refPoint.subtract(prerequisiteRefPoint);
            const angle = Math.atan2(relPoint.x, -relPoint.y); // Up is 0, left is -pi/2, right is pi/2, down is +/-pi.
            return { id, angle }
        })
        .sort((a, b) => a.angle - b.angle)
        .map(data => data.id);

    // Determine an order for the follow-ups.
    const followUpRefPoint = position.add([0, cardHeight / 2]);
    positionData.followUpsPathOrder = modules[positionData.id].followUps
        .filter(id => !!modulePositionsRaw[id]) // The follow-up is in the tree.
        .map(id => {
            const { position } = datalogModulePositions[id]
            const refPoint = position.add([0, -cardHeight / 2]);
            const relPoint = refPoint.subtract(followUpRefPoint);
            const angle = Math.atan2(relPoint.x, relPoint.y); // Down is 0, left is -pi/2, right is pi/2, up is +/-pi.
            return { id, angle }
        })
        .sort((a, b) => a.angle - b.angle)
        .map(data => data.id);
});

// Also export the modules with position data as list.
export const datalogModulePositionList: ModulePositionMeta[] = Object.values(datalogModulePositions)

// Determine the connectors based on the item positions.
export const datalogConnectors: { points: Vector[]; from: string; to: string }[] = [];
Object.values(datalogModulePositions).forEach(positionData => {
    positionData.prerequisitesPathOrder.map(prerequisiteId => {
        const prerequisitePositionData = datalogModulePositions[prerequisiteId];
        const points = computeConnectorPath(prerequisitePositionData, positionData);
        datalogConnectors.push({ points, from: prerequisiteId, to: positionData.id });
    });
});
