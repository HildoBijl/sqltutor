import { modulePositions } from '@/learning/skilltree/utils/treeDefinition';
import { raModulePositions } from '@/learning/skilltree/ra-skilltree/ra-treeDefinition';

export type SkillTreeId = 'sql' | 'ra' | 'datalog';

export interface SkillTreeDefinition {
  id: SkillTreeId;
  label: string;
  path: string;
  moduleIds: ReadonlySet<string>;
}

export const SKILL_TREE_CHANGE_EVENT = 'skill-tree-change';

const SKILL_TREE_HISTORY_KEY = 'sqltutor-skilltree-history';
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
    moduleIds: new Set<string>(),
  },
];

const skillTreeById = new Map<SkillTreeId, SkillTreeDefinition>(
  skillTreeDefinitions.map((definition) => [definition.id, definition]),
);

const isSkillTreeId = (value: unknown): value is SkillTreeId =>
  value === 'sql' || value === 'ra' || value === 'datalog';

const normalizeHistory = (raw: unknown): SkillTreeId[] => {
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
  if (typeof window === 'undefined') {
    return [...DEFAULT_SKILL_TREE_HISTORY];
  }

  try {
    const stored = window.localStorage.getItem(SKILL_TREE_HISTORY_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return normalizeHistory(parsed);
  } catch (error) {
    console.warn('Failed to read skill tree history from storage.', error);
    return [...DEFAULT_SKILL_TREE_HISTORY];
  }
};

export const markSkillTreeVisited = (treeId: SkillTreeId): SkillTreeId[] => {
  const history = getSkillTreeHistory();
  const next = history.filter((id) => id !== treeId);
  next.push(treeId);
  const normalized = normalizeHistory(next);

  if (typeof window === 'undefined') {
    return normalized;
  }

  try {
    window.localStorage.setItem(SKILL_TREE_HISTORY_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(SKILL_TREE_CHANGE_EVENT));
  } catch (error) {
    console.warn('Failed to update skill tree history in storage.', error);
  }

  return normalized;
};

export const getBackToLearningPathFromHistory = (
  history: SkillTreeId[],
  moduleId?: string,
): string => {
  const normalized = normalizeHistory(history);
  const fallbackId = normalized[normalized.length - 1] ?? DEFAULT_SKILL_TREE_HISTORY[0];

  if (moduleId) {
    for (let index = normalized.length - 1; index >= 0; index -= 1) {
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
