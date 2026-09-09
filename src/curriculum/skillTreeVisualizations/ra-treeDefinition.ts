import { skillTree } from '@/curriculum/skillTree';
import {
  defineSkillTree,
  type GridPosition,
  type ModulePositionMeta,
  type ModulePositionMetaRaw,
} from '@sqlvalley/skill-tree';

// Where each module sits on the grid. Cells are 1-indexed, and fractional
// values place a module between two cells. See the README in this folder.
const nodes: Record<string, GridPosition> = {
  // Fundamental database concepts (shared with SQL tree)
  'database': { col: 3, row: 1 },
  'query-language': { col: 2, row: 2 },
  'database-table': { col: 3, row: 2 },
  'database-keys': { col: 4, row: 3 },

  // Database table manipulation concepts.
  'projection-and-filtering': { col: 3, row: 3 },
  'foreign-key': { col: 5, row: 4 },
  'join-and-decomposition': { col: 4, row: 4.5 },

  // RA fundamentals.
  'relational-algebra': { col: 2, row: 3 },

  // RA-specific skills
  'ra-choose-columns': { col: 2, row: 4.5 },
  'ra-filter-rows': { col: 3, row: 4.5 },
  'ra-set-up-single-relation-query': { col: 2, row: 6 },
  'ra-join-relations': { col: 3, row: 6 },
  'ra-set-up-multi-condition-query': { col: 2, row: 7 },
  'ra-set-up-multi-relation-query': { col: 3, row: 7 },
  'ra-set-up-universal-condition-query': { col: 2.5, row: 9 },
  'ra-set-up-multi-step-query': { col: 2.5, row: 8 },
};

const processedModulePositions = defineSkillTree({
  name: 'RA Skill Tree',
  skillTree,
  nodes,
});

export const raModulePositions: Record<string, ModulePositionMeta> =
  processedModulePositions.modulePositions;
export const raModulePositionList: ModulePositionMeta[] =
  processedModulePositions.modulePositionList;
export const raConnectors = processedModulePositions.connectors;

export type { ModulePositionMeta, ModulePositionMetaRaw };
