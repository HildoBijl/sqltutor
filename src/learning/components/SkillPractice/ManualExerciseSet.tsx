import { type ReactNode, useState } from 'react';
import { Paper, Box, Button, Collapse, Divider, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import { ExerciseSection } from './ExerciseSection';

interface Exercise {
	problem: ReactNode,
	solution: ReactNode,
}

interface ManualExerciseSetProps {
	exercises: Exercise[];
	startingNumber?: number;
}

export function ManualExerciseSet({ exercises, startingNumber = 1 }: ManualExerciseSetProps) {
	return <>{exercises.map((exercise, index) => <ManualExercise key={index} exercise={exercise} number={index + startingNumber} />)}</>
}

interface ManualExerciseProps {
	exercise: Exercise;
	number: number;
}

function ManualExercise({ exercise, number }: ManualExerciseProps) {
	const [expanded, setExpanded] = useState(false);

	return <Box>
		{/* Problem */}
		<Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
			<Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
				Exercise {number}
			</Typography>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{exercise.problem}
			</Box>
		</Paper>

		{/* Solution */}
		<ExerciseSection
			title="Solution"
			showDivider={false}
			sx={{ my: 1.5 }}
			contentSx={{ p: 0 }}
			actions={
				<Button
					size="small"
					color="primary"
					variant="text"
					onClick={() => setExpanded((prev) => !prev)}
					endIcon={expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
					sx={{ textTransform: 'none', fontWeight: 500, px: 1 }}
				>
					{expanded ? 'Hide' : 'Show'}
				</Button>
			}
		>
			<Collapse in={expanded} unmountOnExit>
				<Divider sx={{ mb: 2 }} />
				<Box sx={{ px: 2.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
					{exercise.solution}
				</Box>
			</Collapse>
		</ExerciseSection>
	</Box>
}
