import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { SchemaKey } from '@/mockData';
// @ts-ignore - util is a JavaScript module without type definitions
import { keysToObject } from '@/utils';

export type ContentType = 'concept' | 'skill';

export interface ContentMetaRaw {
  id: string;
  name: string;
  type: ContentType;
  description: string;
  prerequisites: string[];
  database?: SchemaKey;
}

// The raContentIndexRaw contains all definitions of RA content items, before being processed into more derived objects.
// All concepts from the SQL curriculum are included with "ra-" prefix.
const raContentIndexRaw: ContentMetaRaw[] = [
  // Fundamental database concepts (same as SQL, but with ra- prefix).
  {
    id: 'ra-database',
    name: 'Databases',
    type: 'concept',
    description: '',
    prerequisites: [],
  },
  {
    id: 'ra-database-table',
    name: 'Database Tables',
    type: 'concept',
    description: '',
    prerequisites: ['ra-database'],
  },
  {
    id: 'ra-query-language',
    name: 'Query Languages',
    type: 'concept',
    description: '',
    prerequisites: ['ra-database'],
  },
  {
    id: 'ra-database-keys',
    name: 'Database Keys',
    type: 'concept',
    description: 'How can we uniquely identify a table row?',
    prerequisites: ['ra-database-table'],
  },

  // Database table manipulation concepts.
  {
    id: 'ra-projection-and-filtering',
    name: 'Projection and Filtering',
    type: 'concept',
    description: 'How can we manipulate tables, for instance by selecting specific columns/rows?',
    prerequisites: ['ra-database-table'],
  },
  {
    id: 'ra-foreign-key',
    name: 'Foreign Keys',
    type: 'concept',
    description: 'How do references from one table to another table work?',
    prerequisites: ['ra-database-keys'],
  },
  {
    id: 'ra-join-and-decomposition',
    name: 'Join and Decomposition',
    type: 'concept',
    description: 'How can we split a large table up into multiple smaller tables, and then put them back together?',
    prerequisites: ['ra-projection-and-filtering', 'ra-foreign-key'],
  },

  // RA fundamentals (replacing SQL fundamentals).
  {
    id: 'ra-relational-algebra',
    name: 'Relational Algebra',
    type: 'concept',
    description: '',
    prerequisites: ['ra-query-language'],
  },

  // RA-specific skills.
  {
    id: 'ra-choose-columns',
    name: 'Choose Columns',
    type: 'skill',
    description: '',
    prerequisites: ['ra-relational-algebra', 'ra-projection-and-filtering'],
  },
  {
    id: 'ra-filter-rows',
    name: 'Filter Rows',
    type: 'skill',
    description: '',
    prerequisites: ['ra-relational-algebra', 'ra-projection-and-filtering'],
  },
  {
    id: 'ra-set-up-single-relation-query',
    name: 'Set Up Single Relation Query',
    type: 'skill',
    description: '',
    prerequisites: ['ra-choose-columns', 'ra-filter-rows'],
  },
  {
    id: 'ra-join-relations',
    name: 'Join Relations',
    type: 'skill',
    description: '',
    prerequisites: ['ra-join-and-decomposition', 'ra-filter-rows'],
  },
  {
    id: 'ra-set-up-multi-condition-query',
    name: 'Set Up Multi-Condition Query',
    type: 'skill',
    description: '',
    prerequisites: ['ra-set-up-single-relation-query'],
  },
  {
    id: 'ra-set-up-multi-relation-query',
    name: 'Set Up Multi-Relation Query',
    type: 'skill',
    description: '',
    prerequisites: ['ra-set-up-single-relation-query', 'ra-join-relations'],
  },
  {
    id: 'ra-set-up-universal-condition-queries',
    name: 'Set Up Universal Condition Queries',
    type: 'skill',
    description: '',
    prerequisites: ['ra-set-up-multi-relation-query', 'ra-set-up-multi-condition-query'],
  },
  {
    id: 'ra-set-up-multi-step-queries',
    name: 'Set Up Multi-Step Queries',
    type: 'skill',
    description: '',
    prerequisites: ['ra-set-up-multi-relation-query', 'ra-set-up-multi-condition-query', 'ra-set-up-universal-condition-queries'],
  },


];

// The raContentItemsRaw contains all unprocessed RA content items, as an object.
export const raContentItemsRaw: Record<string, ContentMetaRaw> = keysToObject(raContentIndexRaw.map(item => item.id), (_: string, index: number) => raContentIndexRaw[index]);


// Set up a new type for processed content items.
export interface ContentMeta extends ContentMetaRaw {
  followUps: string[];
}

// Prepare the raContentIndex and raContentItems for processed content items.
export const raContentIndex: ContentMeta[] = [];
export const raContentItems: Record<string, ContentMeta> = {};
raContentIndexRaw.forEach(item => {
  const processedItem: ContentMeta = {
    ...item,
    followUps: [],
  };
  raContentIndex.push(processedItem);
  raContentItems[item.id] = processedItem;
});

// Fill up the raContentIndex and raContentItems.
raContentIndexRaw.forEach(itemRaw => {
  const item: ContentMeta = raContentItems[itemRaw.id];
  (itemRaw.prerequisites || []).forEach(prerequisiteId => {
    const prerequisite: ContentMeta = raContentItems[prerequisiteId];
    if (!prerequisite)
      throw new Error(`Unknown prerequisite "${prerequisiteId}" encountered at RA content item "${item.id}".`);
    prerequisite.followUps.push(item.id);
  });
});


export type ContentComponentMap = Record<string, LazyExoticComponent<ComponentType<any>>>;

const ALLOWED_CONTENT_SECTIONS = new Set(['Theory', 'Summary', 'Story', 'Video']);

type ComponentModule = {
  default?: ComponentType<any>;
} & Record<string, ComponentType<any> | undefined>;

const contentComponentModules = import.meta.glob('../ra/*/*.tsx') as Record<
  string,
  () => Promise<Record<string, unknown>>
>;

function createLazyComponent(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
  modulePath: string,
): LazyExoticComponent<ComponentType<any>> {
  return lazy(async () => {
    const module = (await loader()) as ComponentModule;
    const component = module[exportName] ?? module.default;
    if (!component) {
      throw new Error(`Component "${exportName}" not found in module "${modulePath}".`);
    }
    return { default: component };
  });
}

export const raContentComponents: Record<string, ContentComponentMap> = Object.entries(
  contentComponentModules,
).reduce<Record<string, ContentComponentMap>>((acc, [path, loader]) => {
  const match = path.match(/\.\.\/ra\/([^/]+)\/([^/]+)\.tsx$/);
  if (!match) {
    return acc;
  }

  const [, contentId, section] = match;
  if (!ALLOWED_CONTENT_SECTIONS.has(section)) {
    return acc;
  }

  const entry = acc[contentId] ?? (acc[contentId] = {} as ContentComponentMap);
  entry[section] = createLazyComponent(loader, section, path);

  return acc;
}, {});

const skillExerciseModules = import.meta.glob('../ra/*/exercise.ts');

type SkillExerciseLoader = () => Promise<unknown>;

export const raSkillExerciseLoaders = Object.fromEntries(
  Object.entries(skillExerciseModules).reduce<[string, SkillExerciseLoader][]>((entries, [path, loader]) => {
    const match = path.match(/\.\.\/ra\/([^/]+)\/exercise\.ts$/);
    if (match) {
      entries.push([match[1], loader as SkillExerciseLoader]);
    }
    return entries;
  }, []),
) as Record<string, SkillExerciseLoader>;
