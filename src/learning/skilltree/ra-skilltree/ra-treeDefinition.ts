import { contentItems } from "@/curriculum";
import { applyMapping } from '@/utils/javascript';
import { type VectorInput, Vector, ensureVector } from "@/utils/geometry";
import { cardWidth, cardHeight } from "../utils/settings";
import { computeConnectorPath } from "../utils/pathCalculations";

export interface ContentPositionMetaRaw {
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
const y5_5 = (y3 + y6) / 2;
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

// Placeholder positions for RA skill tree
const contentPositionsRaw: Record<string, ContentPositionMetaRaw> = {
	// Fundamental database concepts (shared with SQL tree)
	'database': { position: { x: (x2+x3)/2, y: y1 } },
	'query-language': { position: { x: x2, y: y2 } },
	'database-table': { position: { x: x3, y: y2 } },
	'database-keys': { position: { x: x4, y: y3 } },

	// Database table manipulation concepts.
	'projection-and-filtering': { position: { x: x3, y: y3 } },
	'foreign-key': { position: { x: x4, y: y4 } },
	'join-and-decomposition': { position: { x: x4, y: y5 } },

	// RA fundamentals.
	'relational-algebra': { position: { x: x2, y: y3 } },

	// RA-specific skills 
	'ra-choose-columns': { position: { x: x2, y: y5_5 } },
	'ra-filter-rows': { position: { x: x3, y: y5_5 } },
	'ra-set-up-single-relation-query': { position: { x: x2, y: y6 } },
	'ra-join-relations': { position: { x: x3, y: y6 } },
	'ra-set-up-multi-condition-query': { position: { x: x2, y: y7 } },
	'ra-set-up-multi-relation-query': { position: { x: x3, y: y7 } },
	'ra-set-up-universal-condition-query': { position: { x: (x2+x3)/2, y: y9 } },
	'ra-set-up-multi-step-query': { position: { x: (x2+x3)/2, y: y8 } },
}

export interface ContentPositionMeta extends Omit<ContentPositionMetaRaw, 'position'> {
	id: string;
	position: Vector;
	prerequisitesPathOrder: string[];
	followUpsPathOrder: string[];
}

// Prepare the contentWithPosition mapping object with empty lists.
export const raContentPositions: Record<string, ContentPositionMeta> = applyMapping(contentPositionsRaw, (positionDataRaw: ContentPositionMetaRaw, id: string) => {
	// Verify that all skills for which positions are defined exist.
	if (!contentItems[id])
		throw new Error(`Invalid content item ID "${id}" encountered when defining content positions for the RA Skill Tree.`);

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
Object.values(raContentPositions).forEach(positionData => {
	const { position } = positionData;

	// Determine an order for the prerequisites.
	const prerequisiteRefPoint = position.add([0, -cardHeight / 2]);
	positionData.prerequisitesPathOrder = contentItems[positionData.id].prerequisites
		.filter(id => !!contentPositionsRaw[id]) // The prerequisite is in the tree.
		.map(id => {
			const { position } = raContentPositions[id]
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
			const { position } = raContentPositions[id]
			const refPoint = position.add([0, -cardHeight / 2]);
			const relPoint = refPoint.subtract(followUpRefPoint);
			const angle = Math.atan2(relPoint.x, relPoint.y); // Down is 0, left is -pi/2, right is pi/2, up is +/-pi.
			return { id, angle }
		})
		.sort((a, b) => a.angle - b.angle)
		.map(data => data.id);
});

// Also export the contents with position data as list.
export const raContentPositionList: ContentPositionMeta[] = Object.values(raContentPositions)

// Determine the connectors based on the item positions.
export const raConnectors: { points: Vector[]; from: string; to: string }[] = [];
Object.values(raContentPositions).forEach(positionData => {
	positionData.prerequisitesPathOrder.map(prerequisiteId => {
		const prerequisitePositionData = raContentPositions[prerequisiteId];
		const points = computeConnectorPath(prerequisitePositionData, positionData);
		raConnectors.push({ points, from: prerequisiteId, to: positionData.id });
	});
});
