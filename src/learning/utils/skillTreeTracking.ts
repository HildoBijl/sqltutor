import { modulePositions } from '@/learning/skilltree/definitions/sql-treeDefinition';
import { raModulePositions } from '@/learning/skilltree/definitions/ra-treeDefinition';
import { datalogModulePositions } from '@/learning/skilltree/definitions/datalog-treeDefinitions';
import { useSkillTreeSettingsStore } from '@/store';

export type SkillTreeId = 'sql' | 'ra' | 'datalog';

export interface SkillTreeDefinition {
  id: SkillTreeId;
  label: string;
  path: string;
  moduleIds: ReadonlySet<string>;
}

const DEFAULT_SKILL_TREE_HISTORY: SkillTreeId[] = ['sql'];

const skillTreeDefinitions: SkillTreeDefinition[] = [
  {
    id: 'sql',
    label: 'Learn SQL',
    path: '/learn',
    moduleIds: new Set(Object.keys(modulePositions)),
  },
  {
    id: 'ra',
    label: 'Learn RA',
    path: '/learn-ra',
    moduleIds: new Set(Object.keys(raModulePositions)),
  },
  {
    id: 'datalog',
    label: 'Learn Datalog',
    path: '/learn-datalog',
    moduleIds: new Set(Object.keys(datalogModulePositions)),
  },
];

const skillTreeById = new Map<SkillTreeId, SkillTreeDefinition>(
  skillTreeDefinitions.map((definition) => [definition.id, definition]),
);

const isSkillTreeId = (value: unknown): value is SkillTreeId =>
  value === 'sql' || value === 'ra' || value === 'datalog';

export const normalizeSkillTreeHistory = (raw: unknown): SkillTreeId[] => {
  const result: SkillTreeId[] = [];
  const seen = new Set<SkillTreeId>();

  if (Array.isArray(raw)) {
    for (const value of raw) {
      if (isSkillTreeId(value) && !seen.has(value)) {
        seen.add(value);
        result.push(value);
      }
    }
  }

  if (!seen.has('sql')) {
    result.unshift('sql');
  }

  return result.length > 0 ? result : [...DEFAULT_SKILL_TREE_HISTORY];
};

export const getSkillTreeDefinitions = () => skillTreeDefinitions;

export const getSkillTreeHistory = (): SkillTreeId[] => {
  const history = useSkillTreeSettingsStore.getState().lastVisitedSkillTrees;
  return normalizeSkillTreeHistory(history);
};

export const markSkillTreeVisited = (treeId: SkillTreeId): SkillTreeId[] => {
  useSkillTreeSettingsStore.getState().markSkillTreeVisited(treeId);
  return getSkillTreeHistory();
};

export const getBackToLearningPathFromHistory = (
  history: SkillTreeId[],
  moduleId?: string,
): string => {
  const normalized = normalizeSkillTreeHistory(history);
  const fallbackId = normalized[0] ?? DEFAULT_SKILL_TREE_HISTORY[0];

  if (moduleId) {
    for (let index = 0; index < normalized.length; index += 1) {
      const tree = skillTreeById.get(normalized[index]);
      if (tree?.moduleIds.has(moduleId)) {
        return tree.path;
      }
    }
  }

  return skillTreeById.get(fallbackId)?.path ?? '/learn';
};

export const getBackToLearningPath = (moduleId?: string) =>
  getBackToLearningPathFromHistory(getSkillTreeHistory(), moduleId);
