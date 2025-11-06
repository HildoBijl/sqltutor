import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { SchemaKey } from '@/features/database/schemas';
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

// The contentIndexRaw contains all definitions of content items, before being processed into more derived objects.
const contentIndexRaw: ContentMetaRaw[] = [
  {
    id: 'database',
    name: 'What is a Database?',
    type: 'concept',
    description: 'Understanding databases, tables, and database management systems',
    prerequisites: [],
  },
  {
    id: 'database-table',
    name: 'Database Tables',
    type: 'concept',
    description: 'Learn about rows, columns, and how data is structured in tables',
    prerequisites: ['database'],
  },
  {
    id: 'data-types',
    name: 'Data Types',
    type: 'concept',
    description: 'Different types of data that can be stored in database columns',
    prerequisites: ['database-table'],
  },
  {
    id: 'database-keys',
    name: 'Database Keys',
    type: 'concept',
    description: 'Primary keys, foreign keys, and unique identifiers',
    prerequisites: ['database-table'],
  },
  {
    id: 'projection-and-filtering',
    name: 'Projection and Filtering',
    type: 'concept',
    description: 'Limit tables to the columns and rows needed for analysis',
    prerequisites: ['database-table'],
  },
  {
    id: 'join-and-decomposition',
    name: 'Join and Decomposition',
    type: 'concept',
    description: 'Split tables safely and join them back together without losing data',
    prerequisites: ['database-keys', 'projection-and-filtering'],
  },
  {
    id: 'inner-and-outer-join',
    name: 'Inner and Outer Join',
    type: 'concept',
    description: 'Choose the right join type when matching rows across tables',
    prerequisites: ['join-and-decomposition', 'data-types'],
  },
  {
    id: 'aggregation',
    name: 'Aggregation',
    type: 'concept',
    description: 'Group records and compute summary statistics with SQL',
    prerequisites: ['data-types', 'projection-and-filtering'],
  },
  {
    id: 'pivot-table',
    name: 'Pivot Tables',
    type: 'concept',
    description: 'Reshape aggregated data so categories become columns',
    prerequisites: ['database-table'],
  },
  {
    id: 'query-language',
    name: 'Query Languages',
    type: 'concept',
    description: 'How databases interpret commands and why SQL became the standard',
    prerequisites: ['database'],
  },
  {
    id: 'sql',
    name: 'SQL Fundamentals',
    type: 'concept',
    description: 'Core SQL clauses for reading and modifying relational data',
    prerequisites: ['query-language'],
  },
  {
    id: 'filter-rows',
    name: 'Filter Rows',
    type: 'skill',
    description: 'Use WHERE clauses to filter data based on conditions',
    prerequisites: ['sql', 'projection-and-filtering', 'data-types'],
  },
  {
    id: 'filter-rows-on-multiple-criteria',
    name: 'Filter Rows on Multiple Criteria',
    type: 'skill',
    description: 'Combine AND/OR logic, pattern matching, and NULL checks in filters',
    prerequisites: ['filter-rows'],
  },
  {
    id: 'choose-columns',
    name: 'Choose Columns',
    type: 'skill',
    description: 'Select and rename the columns returned by a query',
    prerequisites: ['sql', 'projection-and-filtering'],
  },
  {
    id: 'create-processed-columns',
    name: 'Create Processed Columns',
    type: 'skill',
    description: 'Compute derived columns directly within the SELECT list',
    prerequisites: ['data-types', 'choose-columns'],
  },
  {
    id: 'sort-rows',
    name: 'Sort Rows',
    type: 'skill',
    description: 'Order results with ORDER BY and paginate using LIMIT/OFFSET',
    prerequisites: ['sql', 'data-types'],
  },
  {
    id: 'write-single-criterion-query',
    name: 'Write Single-Criterion Query',
    type: 'skill',
    description: 'Build SELECT statements that filter on a single condition',
    prerequisites: ['choose-columns', 'filter-rows'],
  },
  {
    id: 'write-multi-criterion-query',
    name: 'Write Multi-Criterion Query',
    type: 'skill',
    description: 'Combine multiple predicates with AND, OR, and grouping parentheses',
    prerequisites: ['create-processed-columns', 'filter-rows-on-multiple-criteria', 'sort-rows'],
  },
  {
    id: 'join-tables',
    name: 'Join Tables',
    type: 'skill',
    description: 'Join related tables together by matching keys',
    prerequisites: ['inner-and-outer-join', 'choose-columns', 'filter-rows-on-multiple-criteria'],
    database: 'companiesAndPositions',
  },
  {
    id: 'write-multi-table-query',
    name: 'Write Multi-Table Query',
    type: 'skill',
    description: 'Chain several joins to answer questions that span multiple tables',
    prerequisites: ['join-tables', 'write-single-criterion-query'],
    database: 'employees',
  },
  {
    id: 'write-multi-layered-query',
    name: 'Write Multi-Layered Query',
    type: 'skill',
    description: 'Use subqueries or CTEs to break complex logic into stages',
    prerequisites: ['use-filtered-aggregation', 'write-multi-criterion-query', 'write-multi-table-query'],
    database: 'employees',
  },
  {
    id: 'aggregate-columns',
    name: 'Aggregate Columns',
    type: 'skill',
    description: 'Group data and compute counts, sums, and averages',
    prerequisites: ['aggregation', 'choose-columns'],
  },
  {
    id: 'use-filtered-aggregation',
    name: 'Use Filtered Aggregation',
    type: 'skill',
    description: 'Filter aggregate results with HAVING and targeted WHERE clauses',
    prerequisites: ['aggregate-columns', 'filter-rows-on-multiple-criteria', 'create-processed-columns'],
  },
  {
    id: 'use-dynamic-aggregation',
    name: 'Use Dynamic Aggregation',
    type: 'skill',
    description: 'Adapt aggregations to changing grouping dimensions',
    prerequisites: ['aggregate-columns'],
  },
  {
    id: 'create-pivot-table',
    name: 'Create Pivot Table',
    type: 'skill',
    description: 'Shape aggregated data into pivoted columns for reporting',
    prerequisites: ['pivot-table', 'write-single-criterion-query', 'aggregate-columns'],
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

export const contentComponents: Record<string, ContentComponentMap> = {
  database: {
    Theory: lazy(() => import('./concepts/database/Theory')),
    Summary: lazy(() => import('./concepts/database/Summary')),
    Story: lazy(() => import('./concepts/database/Story')),
    Video: lazy(() => import('./concepts/database/Video')),
  },
  'database-table': {
    Theory: lazy(() => import('./concepts/database-table/Theory')),
    Summary: lazy(() => import('./concepts/database-table/Summary')),
    Story: lazy(() => import('./concepts/database-table/Story')),
  },
  'data-types': {
    Theory: lazy(() => import('./concepts/data-types/Theory')),
    Summary: lazy(() => import('./concepts/data-types/Summary')),
    Story: lazy(() => import('./concepts/data-types/Story')),
  },
  'database-keys': {
    Theory: lazy(() => import('./concepts/database-keys/Theory')),
    Summary: lazy(() => import('./concepts/database-keys/Summary')),
    Story: lazy(() => import('./concepts/database-keys/Story')),
  },
  'projection-and-filtering': {
    Theory: lazy(() => import('./concepts/projection-and-filtering/Theory')),
    Summary: lazy(() => import('./concepts/projection-and-filtering/Summary')),
    Story: lazy(() => import('./concepts/projection-and-filtering/Story')),
  },
  'join-and-decomposition': {
    Theory: lazy(() => import('./concepts/join-and-decomposition/Theory')),
    Summary: lazy(() => import('./concepts/join-and-decomposition/Summary')),
    Story: lazy(() => import('./concepts/join-and-decomposition/Story')),
  },
  'inner-and-outer-join': {
    Theory: lazy(() => import('./concepts/inner-and-outer-join/Theory')),
    Summary: lazy(() => import('./concepts/inner-and-outer-join/Summary')),
    Story: lazy(() => import('./concepts/inner-and-outer-join/Story')),
  },
  aggregation: {
    Theory: lazy(() => import('./concepts/aggregation/Theory')),
    Summary: lazy(() => import('./concepts/aggregation/Summary')),
    Story: lazy(() => import('./concepts/aggregation/Story')),
  },
  'pivot-table': {
    Theory: lazy(() => import('./concepts/pivot-table/Theory')),
    Summary: lazy(() => import('./concepts/pivot-table/Summary')),
    Story: lazy(() => import('./concepts/pivot-table/Story')),
  },
  'query-language': {
    Theory: lazy(() => import('./concepts/query-language/Theory')),
    Summary: lazy(() => import('./concepts/query-language/Summary')),
    Story: lazy(() => import('./concepts/query-language/Story')),
  },
  sql: {
    Theory: lazy(() => import('./concepts/sql/Theory')),
    Summary: lazy(() => import('./concepts/sql/Summary')),
    Story: lazy(() => import('./concepts/sql/Story')),
  },
  'filter-rows': {
    Theory: lazy(() => import('./skills/filter-rows/Theory')),
    Story: lazy(() => import('./skills/filter-rows/Story')),
  },
  'filter-rows-on-multiple-criteria': {
    Theory: lazy(() => import('./skills/filter-rows-on-multiple-criteria/Theory')),
    Story: lazy(() => import('./skills/filter-rows-on-multiple-criteria/Story')),
  },
  'choose-columns': {
    Theory: lazy(() => import('./skills/choose-columns/Theory')),
    Story: lazy(() => import('./skills/choose-columns/Story')),
  },
  'create-processed-columns': {
    Theory: lazy(() => import('./skills/create-processed-columns/Theory')),
    Story: lazy(() => import('./skills/create-processed-columns/Story')),
  },
  'sort-rows': {
    Theory: lazy(() => import('./skills/sort-rows/Theory')),
    Story: lazy(() => import('./skills/sort-rows/Story')),
  },
  'write-single-criterion-query': {
    Theory: lazy(() => import('./skills/write-single-criterion-query/Theory')),
    Story: lazy(() => import('./skills/write-single-criterion-query/Story')),
  },
  'write-multi-criterion-query': {
    Theory: lazy(() => import('./skills/write-multi-criterion-query/Theory')),
    Story: lazy(() => import('./skills/write-multi-criterion-query/Story')),
  },
  'join-tables': {
    Theory: lazy(() => import('./skills/join-tables/Theory')),
    Story: lazy(() => import('./skills/join-tables/Story')),
  },
  'write-multi-table-query': {
    Theory: lazy(() => import('./skills/write-multi-table-query/Theory')),
    Story: lazy(() => import('./skills/write-multi-table-query/Story')),
  },
  'write-multi-layered-query': {
    Theory: lazy(() => import('./skills/write-multi-layered-query/Theory')),
    Story: lazy(() => import('./skills/write-multi-layered-query/Story')),
  },
  'aggregate-columns': {
    Theory: lazy(() => import('./skills/aggregate-columns/Theory')),
    Story: lazy(() => import('./skills/aggregate-columns/Story')),
  },
  'use-filtered-aggregation': {
    Theory: lazy(() => import('./skills/use-filtered-aggregation/Theory')),
    Story: lazy(() => import('./skills/use-filtered-aggregation/Story')),
  },
  'use-dynamic-aggregation': {
    Theory: lazy(() => import('./skills/use-dynamic-aggregation/Theory')),
    Story: lazy(() => import('./skills/use-dynamic-aggregation/Story')),
  },
  'create-pivot-table': {
    Theory: lazy(() => import('./skills/create-pivot-table/Theory')),
    Story: lazy(() => import('./skills/create-pivot-table/Story')),
  },
};

const skillExerciseModules = import.meta.glob('./skills/*/exercise.ts');

type SkillExerciseLoader = () => Promise<unknown>;

export const skillExerciseLoaders = Object.fromEntries(
  Object.entries(skillExerciseModules).reduce<[string, SkillExerciseLoader][]>((entries, [path, loader]) => {
    const match = path.match(/\.\/skills\/([^/]+)\/exercise\.ts$/);
    if (match) {
      entries.push([match[1], loader as SkillExerciseLoader]);
    }
    return entries;
  }, []),
) as Record<string, SkillExerciseLoader>;
