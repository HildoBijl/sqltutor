export interface TopicDialogueLine {
  speaker: string;
  text: string;
}

export interface TopicNarrative {
  setup: readonly TopicDialogueLine[];
  completion: readonly TopicDialogueLine[];
}

const sharedCompletion: readonly TopicDialogueLine[] = [
  {
    speaker: 'Mira',
    text: 'Nice work. Those three checks give us enough confidence to move this part of the investigation forward.',
  },
  {
    speaker: 'Rook',
    text: 'The pattern is clearer now, and the next topic should let us test it from another angle.',
  },
];

export const topicNarratives: Readonly<Record<string, TopicNarrative>> = {
  'choose-columns': {
    setup: [
      {
        speaker: 'Mira',
        text: 'We have a stack of records, but most of the columns are noise for this question.',
      },
      {
        speaker: 'Rook',
        text: 'Start by pulling only the fields that matter. Clean evidence beats a crowded table every time.',
      },
    ],
    completion: sharedCompletion,
  },
  'filter-rows': {
    setup: [
      {
        speaker: 'Mira',
        text: 'Some rows look out of place. We need to separate the routine records from the suspicious ones.',
      },
      {
        speaker: 'Rook',
        text: 'Use WHERE carefully here. A small condition can change the whole shape of the answer.',
      },
    ],
    completion: sharedCompletion,
  },
  'sort-rows': {
    setup: [
      {
        speaker: 'Mira',
        text: 'The values are all there, but we need the most important records to rise to the top.',
      },
      {
        speaker: 'Rook',
        text: 'Ordering the rows should expose which cases deserve attention first.',
      },
    ],
    completion: sharedCompletion,
  },
  'aggregate-columns': {
    setup: [
      {
        speaker: 'Mira',
        text: 'Individual rows only tell part of the story. We need totals, extremes, and summary numbers.',
      },
      {
        speaker: 'Rook',
        text: 'Aggregation should turn the raw records into something we can compare.',
      },
    ],
    completion: sharedCompletion,
  },
  'process-columns': {
    setup: [
      {
        speaker: 'Mira',
        text: 'The answer is not stored directly. We need to calculate it from fields that are already in the tables.',
      },
      {
        speaker: 'Rook',
        text: 'Derived columns are perfect for spotting ratios, flags, and values that only appear after a little arithmetic.',
      },
    ],
    completion: sharedCompletion,
  },
  'filter-rows-on-multiple-criteria': {
    setup: [
      {
        speaker: 'Mira',
        text: 'A single condition is too blunt for this part of the case.',
      },
      {
        speaker: 'Rook',
        text: 'Combine the constraints so we can isolate rows that match the full situation, not just one symptom.',
      },
    ],
    completion: sharedCompletion,
  },
  'join-tables': {
    setup: [
      {
        speaker: 'Mira',
        text: 'The facts are split across tables. No single sheet has the full picture.',
      },
      {
        speaker: 'Rook',
        text: 'Joining related records should let us connect people, roles, and events without guessing.',
      },
    ],
    completion: sharedCompletion,
  },
  'use-filtered-aggregation': {
    setup: [
      {
        speaker: 'Mira',
        text: 'The summaries are only useful if we count the right slice of data.',
      },
      {
        speaker: 'Rook',
        text: 'Filter first, aggregate second. Otherwise the signal gets buried in the whole dataset.',
      },
    ],
    completion: sharedCompletion,
  },
  'write-single-criterion-query': {
    setup: [
      {
        speaker: 'Mira',
        text: 'We are past reading examples now. I need you to write the query from the condition itself.',
      },
      {
        speaker: 'Rook',
        text: 'One clear criterion, one direct query. Keep the logic tight.',
      },
    ],
    completion: sharedCompletion,
  },
  'write-multi-criterion-query': {
    setup: [
      {
        speaker: 'Mira',
        text: 'The next checks need more than one rule at the same time.',
      },
      {
        speaker: 'Rook',
        text: 'Translate the story into ANDs, ORs, and parentheses only where they actually change the result.',
      },
    ],
    completion: sharedCompletion,
  },
  'write-look-up-query': {
    setup: [
      {
        speaker: 'Mira',
        text: 'We know what we are looking for, but the useful value is hidden behind another record.',
      },
      {
        speaker: 'Rook',
        text: 'Use a lookup pattern to follow the reference and bring back the matching rows.',
      },
    ],
    completion: sharedCompletion,
  },
  'write-multi-table-query': {
    setup: [
      {
        speaker: 'Mira',
        text: 'The market records cross accounts, products, and transactions. The suspicious cases live between them.',
      },
      {
        speaker: 'Rook',
        text: 'This is where multi-table SQL starts earning its keep.',
      },
    ],
    completion: sharedCompletion,
  },
  'write-multi-layered-query': {
    setup: [
      {
        speaker: 'Mira',
        text: 'The next questions have layers. We need one query to answer something another part of the query depends on.',
      },
      {
        speaker: 'Rook',
        text: 'Build the logic step by step, then fold it into one result.',
      },
    ],
    completion: sharedCompletion,
  },
};

export function getTopicNarrative(moduleId: string | undefined): TopicNarrative | null {
  if (!moduleId) return null;
  return topicNarratives[moduleId] ?? null;
}

export function hasTopicNarrative(moduleId: string | undefined): boolean {
  return getTopicNarrative(moduleId) !== null;
}
