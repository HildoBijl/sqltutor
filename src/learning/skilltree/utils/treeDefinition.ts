import { moduleItems } from "@/curriculum";
import { applyMapping } from '@/utils/javascript';
import { type VectorInput, Vector, ensureVector } from "@/utils/geometry";
import { cardWidth, cardHeight } from "./settings";
import { computeConnectorPath } from "./pathCalculations";

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
export const treeHeight = y8 + cardHeight / 2 + margin;

const dx = cardWidth * 1.5;
const x1 = margin + cardWidth / 2;
const x2 = x1 + dx;
const x3 = x2 + dx;
const x4 = x3 + dx;
const x5 = x4 + dx;
const x6 = x5 + dx;
// const x7 = x6 + dx;
export const treeWidth = x6 + cardWidth / 2 + margin;

const modulePositionsRaw: Record<string, ModulePositionMetaRaw> = {
	// Fundamental database concepts.
	'database': { position: { x: (x2+x3)/2, y: y1 } },
	'query-language': { position: { x: x2, y: y2 } },
	'database-table': { position: { x: x3, y: y2 } },
	'data-types': { position: { x: x3, y: y3 } },
	'database-keys': { position: { x: x5, y: y3 } },

	// Database table manipulation.
	'projection-and-filtering': { position: { x: x4, y: y3 } },
	'foreign-key': { position: { x: x5, y: y4 } },
	'join-and-decomposition': { position: { x: x5, y: y5 } },
	'aggregation': { position: { x: x6, y: y4 } },

	// SQL fundamentals.
	'sql': { position: { x: x2, y: y3 } },
	'choose-columns': { position: { x: (x2 + x3) / 2, y: y4 } },
	'filter-rows': { position: { x: (x3 + x4) / 2, y: y4 } },
	'write-single-criterion-query': { position: { x: x3, y: y5 } },

	// Single-table SQL querying.
	'sort-rows': { position: { x: x1, y: y5 } },
	'process-columns': { position: { x: x2, y: y5 } },
	'filter-rows-on-multiple-criteria': { position: { x: x4, y: y5 } },
	'write-multi-criterion-query': { position: { x: x2, y: y6 } },

	// Aggregation in SQL.
	'aggregate-columns': { position: { x: x6, y: y5 } },
	'use-filtered-aggregation': { position: { x: x5, y: y6 } },
	// 'use-dynamic-aggregation': { position: { x: x6, y: y6 } },

	// Multi-table SQL querying.
	'write-look-up-query': { position: { x: x3, y: y6 } },
	'join-tables': { position: { x: x4, y: y6 } },
	'write-multi-table-query': { position: { x: (x3 + x4) / 2, y: y7 } },
	'write-multi-layered-query': { position: { x: (x3 + x4) / 2, y: y8 } },

	// Pivot tables in SQL.
	// 'pivot-table': { position: { x: x7, y: y5 } },
	// 'create-pivot-table': { position: { x: x7, y: y6 } },
}

export interface ModulePositionMeta extends Omit<ModulePositionMetaRaw, 'position'> {
	id: string;
	position: Vector;
	prerequisitesPathOrder: string[];
	followUpsPathOrder: string[];
}

// Prepare the moduleWithPosition mapping object with empty lists.
export const modulePositions: Record<string, ModulePositionMeta> = applyMapping(modulePositionsRaw, (positionDataRaw: ModulePositionMetaRaw, id: string) => {
	// Verify that all skills for which positions are defined exist.
	if (!moduleItems[id])
		throw new Error(`Invalid module ID "${id}" encountered when defining module positions for the Skill Tree.`);

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
Object.values(modulePositions).forEach(positionData => {
	const { position } = positionData;

	// Determine an order for the prerequisites.
	const prerequisiteRefPoint = position.add([0, -cardHeight / 2]);
	positionData.prerequisitesPathOrder = moduleItems[positionData.id].prerequisites
		.filter(id => !!modulePositionsRaw[id]) // The prerequisite is in the tree.
		.map(id => {
			const { position } = modulePositions[id]
			const refPoint = position.add([0, cardHeight / 2]);
			const relPoint = refPoint.subtract(prerequisiteRefPoint);
			const angle = Math.atan2(relPoint.x, -relPoint.y); // Up is 0, left is -pi/2, right is pi/2, down is +/-pi.
			return { id, angle }
		})
		.sort((a, b) => a.angle - b.angle)
		.map(data => data.id);

	// Determine an order for the follow-ups.
	const followUpRefPoint = position.add([0, cardHeight / 2]);
	positionData.followUpsPathOrder = moduleItems[positionData.id].followUps
		.filter(id => !!modulePositionsRaw[id]) // The follow-up is in the tree.
		.map(id => {
			const { position } = modulePositions[id]
			const refPoint = position.add([0, -cardHeight / 2]);
			const relPoint = refPoint.subtract(followUpRefPoint);
			const angle = Math.atan2(relPoint.x, relPoint.y); // Down is 0, left is -pi/2, right is pi/2, up is +/-pi.
			return { id, angle }
		})
		.sort((a, b) => a.angle - b.angle)
		.map(data => data.id);
});

// Also export the modules with position data as list.
export const modulePositionList: ModulePositionMeta[] = Object.values(modulePositions)

// Determine the connectors based on the item positions.
export const connectors: { points: Vector[]; from: string; to: string }[] = [];
Object.values(modulePositions).forEach(positionData => {
	positionData.prerequisitesPathOrder.map(prerequisiteId => {
		const prerequisitePositionData = modulePositions[prerequisiteId];
		const points = computeConnectorPath(prerequisitePositionData, positionData);
		connectors.push({ points, from: prerequisiteId, to: positionData.id });
	});
});
