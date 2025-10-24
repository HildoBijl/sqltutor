import { contentItems } from "@/features/content";
// @ts-ignore - util is a JavaScript module without type definitions
import { applyMapping } from '@/util';
// @ts-ignore - Vector is a JavaScript module without type definitions
import { Vector } from "@/util/geometry/Vector";
import { cardHeight } from "./settings";
import { computeConnectorPath } from "./pathCalculations";

export interface ContentPositionMetaRaw {
	position: { x: number; y: number };
}

const contentPositionsRaw: Record<string, ContentPositionMetaRaw> = {
	'database': { position: { x: 624, y: 24 } },
	'database-table': { position: { x: 624, y: 144 } },
	'data-types': { position: { x: 624, y: 264 } },
	'database-keys': { position: { x: 1176, y: 264 } },
	'projection-and-filtering': { position: { x: 900, y: 264 } },
	'join-and-decomposition': { position: { x: 900, y: 384 } },
	'inner-and-outer-join': { position: { x: 900, y: 504 } },
	'aggregation': { position: { x: 1176, y: 504 } },
	'pivot-table': { position: { x: 1440, y: 624 } },
	'query-language': { position: { x: 300, y: 144 } },
	'sql': { position: { x: 300, y: 264 } },
	'filter-rows': { position: { x: 300, y: 384 } },
	'filter-rows-on-multiple-criteria': { position: { x: 300, y: 624 } },
	'choose-columns': { position: { x: 624, y: 384 } },
	'create-processed-columns': { position: { x: 624, y: 624 } },
	'sort-rows': { position: { x: 60, y: 624 } },
	'write-single-criterion-query': { position: { x: 450, y: 504 } },
	'write-multi-criterion-query': { position: { x: 300, y: 744 } },
	'join-tables': { position: { x: 624, y: 744 } },
	'write-multi-table-query': { position: { x: 624, y: 864 } },
	'write-multi-layered-query': { position: { x: 624, y: 984 } },
	'aggregate-columns': { position: { x: 1176, y: 624 } },
	'use-filtered-aggregation': { position: { x: 900, y: 744 } },
	'use-dynamic-aggregation': { position: { x: 1176, y: 744 } },
	'create-pivot-table': { position: { x: 1440, y: 744 } },
}

export interface ContentPositionMeta extends Omit<ContentPositionMetaRaw, 'position'> {
	id: string;
	position: Vector;
	prerequisitesPathOrder: string[];
	followUpsPathOrder: string[];
}

// Prepare the contentWithPosition mapping object with empty lists.
export const contentPositions: Record<string, ContentPositionMeta> = applyMapping(contentPositionsRaw, (positionDataRaw: ContentPositionMetaRaw, id: string) => {
	// Verify that all skills for which positions are defined exist.
	if (!contentItems[id])
		throw new Error(`Invalid content item ID "${id}" encountered when defining content positions for the Skill Tree.`);

	// Set up the empty shell for the skill.
	return {
		...positionDataRaw,
		id,
		position: new Vector(positionDataRaw.position),
		prerequisitesPathOrder: [],
		followUpsPathOrder: [],
	};
})

// Calculate the order in which prerequisites and follow-ups should be displayed.
Object.values(contentPositions).forEach(positionData => {
	const { position } = positionData;

	// Determine an order for the prerequisites.
	const prerequisiteRefPoint = position.add([0, -cardHeight / 2]);
	positionData.prerequisitesPathOrder = contentItems[positionData.id].prerequisites
		.filter(id => !!contentPositionsRaw[id]) // The prerequisite is in the tree.
		.map(id => {
			const { position } = contentPositions[id]
			const refPoint = position.add([0, cardHeight / 2]);
			const relPoint = refPoint.subtract(prerequisiteRefPoint);
			const angle = Math.atan2(relPoint.x, -relPoint.y); // Up is 0, left is -pi/2, right is pi/2, down is +/-pi.
			return { id, angle }
		})
		.sort((a, b) => a.angle - b.angle)
		.map(data => data.id);

	// Determine an order for the follow-ups.
	const followUpRefPoint = position.add([0, cardHeight / 2]);
	positionData.followUpsPathOrder = contentItems[positionData.id].followUps
		.filter(id => !!contentPositionsRaw[id]) // The follow-up is in the tree.
		.map(id => {
			const { position } = contentPositions[id]
			const refPoint = position.add([0, -cardHeight / 2]);
			const relPoint = refPoint.subtract(followUpRefPoint);
			const angle = Math.atan2(relPoint.x, relPoint.y); // Down is 0, left is -pi/2, right is pi/2, up is +/-pi.
			return { id, angle }
		})
		.sort((a, b) => a.angle - b.angle)
		.map(data => data.id);
});

// Also export the contents with position data as list.
export const contentPositionList: ContentPositionMeta[] = Object.values(contentPositions)

// Determine the connectors based on the item positions.
export const connectors: { points: typeof Vector[]; from: string; to: string }[] = [];
Object.values(contentPositions).forEach(positionData => {
	positionData.prerequisitesPathOrder.map(prerequisiteId => {
		const prerequisitePositionData = contentPositions[prerequisiteId];
		const points = computeConnectorPath(prerequisitePositionData, positionData);
		connectors.push({ points, from: prerequisiteId, to: positionData.id });
	});
});
