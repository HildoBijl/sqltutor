import { Box, Paper, Stack, Typography } from '@mui/material';
import { DEFAULT_EXERCISES_TO_COMPLETE } from '@sqlvalley/progress';

import { getTopicNarrative, type TopicDialogueLine } from '@/curriculum/utils/topicNarratives';
import { useModuleState } from '@/learning/hooks/useModuleState';
import type { SkillModuleState } from '@/store';

interface TopicStoryProps {
  moduleId: string;
}

export function TopicStory({ moduleId }: TopicStoryProps) {
  const narrative = getTopicNarrative(moduleId);
  const moduleState = useModuleState<SkillModuleState>(moduleId, 'skill');

  if (!narrative) {
    return null;
  }

  const solvedCount = Math.max(moduleState.solvedExerciseIds?.length ?? 0, moduleState.numSolved ?? 0);
  const showCompletion = solvedCount >= DEFAULT_EXERCISES_TO_COMPLETE;
  const lines = showCompletion
    ? [...narrative.setup, ...narrative.completion]
    : narrative.setup;

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Stack spacing={1.5}>
        {lines.map((line, index) => (
          <StoryLine key={`${line.speaker}-${index}`} line={line} />
        ))}
      </Stack>
    </Box>
  );
}

function StoryLine({ line }: { line: TopicDialogueLine }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="body2" color="primary" sx={{ fontWeight: 700, mb: 0.5 }}>
        {line.speaker}
      </Typography>
      <Typography variant="body1" color="text.primary">
        {line.text}
      </Typography>
    </Paper>
  );
}

