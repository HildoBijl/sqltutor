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
  // Fundamental database concepts (shared with SQL and RA tree)
  'database': { col: 3, row: 1 },
  'database-table': { col: 2.5, row: 2 },
  'query-language': { col: 3.5, row: 2 },
  'projection-and-filtering': { col: 2, row: 3 },
  'database-keys': { col: 3, row: 3 },

  'database-view': { col: 2, row: 4 },
  'foreign-key': { col: 3, row: 4 },
  'datalog': { col: 2, row: 5 },
  'join-and-decomposition': { col: 3, row: 5 },
  'recursive-query': { col: 4, row: 5 },

  // Datalog concepts
  'dl-define-projection-rule': { col: 1, row: 6 },
  'dl-define-filtering-rule': { col: 2, row: 6 },
  'dl-define-derived-predicate': { col: 1, row: 7 },
  'dl-define-join-rule': { col: 2, row: 7 },

  // Datalog with negation
  'dl-literal-types-and-rule-safety': { col: 3, row: 6 },
  'dl-define-negation-rule': { col: 2.5, row: 8 },
  'dl-check-rule-safety': { col: 3, row: 7 },
  'dl-write-multi-predicate-program': { col: 2, row: 9 },

  // Recursive Datalog
  'dl-predicate-dependency-graph': { col: 4.5, row: 6 },
  'dl-draw-predicate-dependency-graph': { col: 4, row: 7 },
  'dl-semi-positive-and-stratified-datalog': { col: 5, row: 7 },
  'dl-check-program-stratification': { col: 4.5, row: 8 },
  'dl-define-recursive-predicate': { col: 3.5, row: 8 },
  'dl-write-recursive-program': { col: 3, row: 10 },
};

const processedModulePositions = defineSkillTree({
  name: 'Datalog Skill Tree',
  skillTree,
  nodes,
});

export const datalogModulePositions: Record<string, ModulePositionMeta> =
  processedModulePositions.modulePositions;
export const datalogModulePositionList: ModulePositionMeta[] =
  processedModulePositions.modulePositionList;
export const datalogConnectors = processedModulePositions.connectors;

export type { ModulePositionMeta, ModulePositionMetaRaw };
