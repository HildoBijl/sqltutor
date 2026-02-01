/**
 * Module definitions for the curriculum.
 * This file contains all skill tree modules (concepts and skills).
 */

import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { keysToObject } from '@/utils';

export type ContentType = 'concept' | 'skill';

export interface ContentMetaRaw {
  id: string;
  name: string;
  type: ContentType;
  description: string;
  prerequisites: string[];
}

// The contentIndexRaw contains all definitions of content items, before being processed into more derived objects.
const contentIndexRaw: ContentMetaRaw[] = [
  // Fundamental database concepts.
  {
    id: 'database',
    name: 'Databases',
    type: 'concept',
    description: 'What are databases? Why do we need them? And how are they set up?',
    prerequisites: [],
  },
  {
    id: 'database-table',
    name: 'Database Tables',
    type: 'concept',
    description: 'How are database tables built up? And what do we call their parts?',
    prerequisites: ['database'],
  },
  {
    id: 'query-language',
    name: 'Query Languages',
    type: 'concept',
    description: 'How can we "talk" with a database? How do we program their instructions?',
    prerequisites: ['database'],
  },
  {
    id: 'data-types',
    name: 'Data Types',
    type: 'concept',
    description: 'What possible values can database fields have?',
    prerequisites: ['database-table'],
  },
  {
    id: 'database-keys',
    name: 'Database Keys',
    type: 'concept',
    description: 'How can we uniquely identify a table row?',
    prerequisites: ['database-table'],
  },

  // Database table manipulation.
  {
    id: 'projection-and-filtering',
    name: 'Projection and Filtering',
    type: 'concept',
    description: 'How can we manipulate tables, for instance by selecting specific columns/rows?',
    prerequisites: ['database-table'],
  },
  {
    id: 'foreign-key',
    name: 'Foreign Keys',
    type: 'concept',
    description: 'How do references from one table to another table work?',
    prerequisites: ['database-keys'],
  },
  {
    id: 'join-and-decomposition',
    name: 'Join and Decomposition',
    type: 'concept',
    description: 'How can we split a large table up into multiple smaller tables, and then put them back together?',
    prerequisites: ['projection-and-filtering', 'foreign-key'],
  },
  {
    id: 'aggregation',
    name: 'Aggregation',
    type: 'concept',
    description: 'How can we merge multiple rows together into joint (aggregated) statistics?',
    prerequisites: ['data-types', 'projection-and-filtering'],
  },

  // SQL fundamentals.
  {
    id: 'sql',
    name: 'SQL',
    type: 'concept',
    description: 'What is the SQL query language, and what should I know about it?',
    prerequisites: ['query-language'],
  },
  {
    id: 'choose-columns',
    name: 'Choose Columns',
    type: 'skill',
    description: 'How do we use SQL to select and possibly rename columns from a table?',
    prerequisites: ['sql', 'projection-and-filtering'],
  },
  {
    id: 'filter-rows',
    name: 'Filter Rows',
    type: 'skill',
    description: 'How do we use SQL to filter table records based on a single condition?',
    prerequisites: ['sql', 'data-types', 'projection-and-filtering'],
  },
  {
    id: 'write-single-criterion-query',
    name: 'Write Single-Criterion Query',
    type: 'skill',
    description: 'How do we write simple SQL queries using basic column selection and row filtering?',
    prerequisites: ['choose-columns', 'filter-rows'],
  },

  // Single-table SQL querying.
  {
    id: 'filter-rows-on-multiple-criteria',
    name: 'Filter Rows on Multiple Criteria',
    type: 'skill',
    description: 'How do we set up filters with multiple conditions, combined in various ways?',
    prerequisites: ['filter-rows'],
  },
  {
    id: 'process-columns',
    name: 'Process Columns',
    type: 'skill',
    description: 'How do we create new derived columns from existing columns?',
    prerequisites: ['data-types', 'choose-columns'],
  },
  {
    id: 'sort-rows',
    name: 'Sort Rows',
    type: 'skill',
    description: 'How can we use SQL to sort the records in a table, and optionally only retrieve the first few?',
    prerequisites: ['sql', 'data-types'],
  },
  {
    id: 'write-multi-criterion-query',
    name: 'Write Multi-Criterion Query',
    type: 'skill',
    description: 'How do we set up advanced queries extracting data from a single table in various ways?',
    prerequisites: ['sort-rows', 'process-columns', 'filter-rows-on-multiple-criteria'],
  },

  // Aggregation in SQL.
  {
    id: 'aggregate-columns',
    name: 'Aggregate Columns',
    type: 'skill',
    description: 'How do we use SQL to apply aggregation, merging multiple rows into joint statistics?',
    prerequisites: ['aggregation', 'choose-columns'],
  },
  {
    id: 'use-filtered-aggregation',
    name: 'Use Filtered Aggregation',
    type: 'skill',
    description: 'How do we select which rows to aggregate, and/or subsequently filter aggregated results?',
    prerequisites: ['aggregate-columns', 'filter-rows-on-multiple-criteria', 'process-columns'],
  },
  {
    id: 'use-dynamic-aggregation',
    name: 'Use Dynamic Aggregation',
    type: 'skill',
    description: 'How do we apply multiple different aggregation groupings at the same time?',
    prerequisites: ['aggregate-columns'],
  },

  // Multi-table SQL querying.
  {
    id: 'write-look-up-query',
    name: 'Write Look-up Query',
    type: 'skill',
    description: 'How do we select data from one table based on a condition in another table?',
    prerequisites: ['foreign-key', 'write-single-criterion-query'],
  },
  {
    id: 'join-tables',
    name: 'Join Tables',
    type: 'skill',
    description: 'How can we use SQL to join tables together through a foreign key?',
    prerequisites: ['join-and-decomposition', 'choose-columns', 'filter-rows-on-multiple-criteria'],
  },
  {
    id: 'write-multi-table-query',
    name: 'Write Multi-Table Query',
    type: 'skill',
    description: 'How can we set up queries combining data from multiple tables in convoluted ways?',
    prerequisites: ['write-look-up-query', 'join-tables'],
  },
  {
    id: 'write-multi-layered-query',
    name: 'Write Multi-Layered Query',
    type: 'skill',
    description: 'How do we set up complex multi-table queries and structure their set-up through intermediate queries?',
    prerequisites: ['write-multi-criterion-query', 'write-multi-table-query', 'use-filtered-aggregation'],
  },

  // Pivot tables in SQL.
  {
    id: 'pivot-table',
    name: 'Pivot Tables',
    type: 'concept',
    description: 'How can we smoothly display aggregated data through so-called pivot tables?',
    prerequisites: ['database-table'],
  },
  {
    id: 'create-pivot-table',
    name: 'Create Pivot Table',
    type: 'skill',
    description: 'How do we use SQL to shape aggregated data into a pivot table?',
    prerequisites: ['pivot-table', 'write-single-criterion-query', 'aggregate-columns'],
  },

  // Relational Algebra fundamentals.
  {
    id: 'relational-algebra',
    name: 'Relational Algebra',
    type: 'concept',
    description: 'What is the relational algebra query language, and what should I know about it?',
    prerequisites: ['query-language'],
  },
  {
    id: 'ra-choose-columns',
    name: 'Choose Columns',
    type: 'skill',
    description: 'How do we use relational algebra to select attributes from a relation?',
    prerequisites: ['relational-algebra', 'projection-and-filtering'],
  },
  {
    id: 'ra-filter-rows',
    name: 'Filter Rows',
    type: 'skill',
    description: 'How do we use relational algebra to filter the tuples in a relation based on some condition?',
    prerequisites: ['relational-algebra', 'projection-and-filtering'],
  },
  {
    id: 'ra-set-up-single-relation-query',
    name: 'Set Up Single-Relation Query',
    type: 'skill',
    description: 'How do we write basic relational algebra queries for a single relation?',
    prerequisites: ['ra-choose-columns', 'ra-filter-rows'],
  },

  // Relational algebra multi-relation queries.
  {
    id: 'ra-set-up-multi-condition-query',
    name: 'Set Up Multi-Condition Query',
    type: 'skill',
    description: 'How do we combine multiple conditions, possibly on different relations, in one query?',
    prerequisites: ['ra-set-up-single-relation-query', 'foreign-key'],
  },
  {
    id: 'ra-join-relations',
    name: 'Join Relations',
    type: 'skill',
    description: 'How do use relational algebra to join two relations together?',
    prerequisites: ['join-and-decomposition', 'ra-filter-rows'],
  },
  {
    id: 'ra-set-up-multi-relation-query',
    name: 'Set Up Multi-Relation Query',
    type: 'skill',
    description: 'How do we write relational algebra queries on a combination of different relations?',
    prerequisites: ['ra-set-up-single-relation-query', 'ra-join-relations'],
  },

  // Advanced relational algebra queries.
  {
    id: 'ra-set-up-multi-step-query',
    name: 'Set Up Multi-Step Query',
    type: 'skill',
    description: 'How do we set up complex relational algebra queries involving multiple steps?',
    prerequisites: ['ra-set-up-multi-condition-query', 'ra-set-up-multi-relation-query'],
  },
  {
    id: 'ra-set-up-universal-condition-query',
    name: 'Set Up Universal Condition Query',
    type: 'skill',
    description: 'How do we set up relational algebra queries involving "for every" quantifiers and similar?',
    prerequisites: ['ra-set-up-multi-relation-query', 'ra-set-up-multi-condition-query', 'ra-set-up-multi-step-query'],
  },
];

// The contentItemsRaw contains all unprocessed content items, as an object.
export const contentItemsRaw: Record<string, ContentMetaRaw> = keysToObject(contentIndexRaw.map(item => item.id), (_: string, index: number) => contentIndexRaw[index]);


// Set up a new type for processed content items.
export interface ContentMeta extends ContentMetaRaw {
  followUps: string[];
}

// Prepare the contentIndex and contentItems for processed content items.
export const contentIndex: ContentMeta[] = [];
export const contentItems: Record<string, ContentMeta> = {};
contentIndexRaw.forEach(item => {
  const processedItem: ContentMeta = {
    ...item,
    followUps: [],
  };
  contentIndex.push(processedItem);
  contentItems[item.id] = processedItem;
});

// Fill up the contentIndex and contentItems.
contentIndexRaw.forEach(itemRaw => {
  const item: ContentMeta = contentItems[itemRaw.id];
  (itemRaw.prerequisites || []).forEach(prerequisiteId => {
    const prerequisite: ContentMeta = contentItems[prerequisiteId];
    if (!prerequisite)
      throw new Error(`Unknown prerequisite "${prerequisiteId}" encountered at content item "${item.id}".`);
    prerequisite.followUps.push(item.id);
  });
});


export type ContentComponentMap = Record<string, LazyExoticComponent<ComponentType<any>>>;

const ALLOWED_CONTENT_SECTIONS = new Set(['Theory', 'Summary', 'Story', 'Video', 'Practice']);

type ComponentModule = {
  default?: ComponentType<any>;
} & Record<string, ComponentType<any> | undefined>;

const contentComponentModules = import.meta.glob('./modules/*/*.tsx') as Record<
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

export const contentComponents: Record<string, ContentComponentMap> = Object.entries(
  contentComponentModules,
).reduce<Record<string, ContentComponentMap>>((acc, [path, loader]) => {
  const match = path.match(/\.\/modules\/([^/]+)\/([^/]+)\.tsx$/);
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

const skillExerciseModules = import.meta.glob('./modules/*/exercise.ts');

type SkillExerciseLoader = () => Promise<unknown>;

export const skillExerciseLoaders = Object.fromEntries(
  Object.entries(skillExerciseModules).reduce<[string, SkillExerciseLoader][]>((entries, [path, loader]) => {
    const match = path.match(/\.\/modules\/([^/]+)\/exercise\.ts$/);
    if (match) {
      entries.push([match[1], loader as SkillExerciseLoader]);
    }
    return entries;
  }, []),
) as Record<string, SkillExerciseLoader>;
