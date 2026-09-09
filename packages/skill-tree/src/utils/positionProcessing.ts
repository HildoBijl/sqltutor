import type { SkillTree } from '@sqlvalley/skill-tree-definition';
import { type VectorInput, Vector, ensureVector } from '@sqlvalley/utils/geometry';

export interface ModulePositionMetaRaw {
  position: VectorInput;
}

export interface ModulePositionMeta {
  id: string;
  position: Vector;
  prerequisitesPathOrder: string[];
  followUpsPathOrder: string[];
}

export interface ModuleConnector {
  points: Vector[];
  from: string;
  to: string;
}

export interface ProcessModulePositionsOptions<Id extends string> {
  rawPositions: Record<string, ModulePositionMetaRaw>;
  skillTree: SkillTree<Id>;
  cardHeight: number;
  computeConnectorPath: (
    from: ModulePositionMeta,
    to: ModulePositionMeta,
  ) => Vector[];
  treeName?: string;
}

export interface ProcessedModulePositions {
  modulePositions: Record<string, ModulePositionMeta>;
  modulePositionList: ModulePositionMeta[];
  connectors: ModuleConnector[];
}

export function processModulePositions<Id extends string>({
  rawPositions,
  skillTree,
  cardHeight,
  computeConnectorPath,
  treeName = 'Skill Tree',
}: ProcessModulePositionsOptions<Id>): ProcessedModulePositions {
  const modulePositions: Record<string, ModulePositionMeta> = {};

  Object.entries(rawPositions).forEach(([id, positionDataRaw]) => {
    if (!skillTree[id as Id]) {
      throw new Error(
        `Invalid module ID "${id}" encountered when defining module positions for the ${treeName}.`,
      );
    }

    modulePositions[id] = {
      ...positionDataRaw,
      id,
      position: ensureVector(positionDataRaw.position, 2),
      prerequisitesPathOrder: [],
      followUpsPathOrder: [],
    };
  });

  Object.values(modulePositions).forEach((positionData) => {
    const module = skillTree[positionData.id as Id];
    const { position } = positionData;

    const prerequisiteRefPoint = position.add([0, -cardHeight / 2]);
    positionData.prerequisitesPathOrder = module.prerequisites
      .filter((id) => Boolean(rawPositions[id]))
      .map((id) => {
        const { position: prerequisitePosition } = modulePositions[id];
        const refPoint = prerequisitePosition.add([0, cardHeight / 2]);
        const relPoint = refPoint.subtract(prerequisiteRefPoint);
        return { id, angle: Math.atan2(relPoint.x, -relPoint.y) };
      })
      .sort((a, b) => a.angle - b.angle)
      .map((data) => data.id);

    const followUpRefPoint = position.add([0, cardHeight / 2]);
    positionData.followUpsPathOrder = module.followUps
      .filter((id) => Boolean(rawPositions[id]))
      .map((id) => {
        const { position: followUpPosition } = modulePositions[id];
        const refPoint = followUpPosition.add([0, -cardHeight / 2]);
        const relPoint = refPoint.subtract(followUpRefPoint);
        return { id, angle: Math.atan2(relPoint.x, relPoint.y) };
      })
      .sort((a, b) => a.angle - b.angle)
      .map((data) => data.id);
  });

  const connectors: ModuleConnector[] = [];
  Object.values(modulePositions).forEach((positionData) => {
    positionData.prerequisitesPathOrder.forEach((prerequisiteId) => {
      const prerequisitePositionData = modulePositions[prerequisiteId];
      connectors.push({
        points: computeConnectorPath(prerequisitePositionData, positionData),
        from: prerequisiteId,
        to: positionData.id,
      });
    });
  });

  return {
    modulePositions,
    modulePositionList: Object.values(modulePositions),
    connectors,
  };
}
