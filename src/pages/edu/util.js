import { useParams } from 'react-router-dom'
import { AutoStories as Book, Lightbulb, Edit as Pencil, TableChart as Table, Bolt } from '@mui/icons-material'

// tabs indicates which tabs can be shown and which corresponding Module component should be rendered for it.
export const tabs = [
	{
		url: 'story',
		component: 'Story',
		title: 'Story',
		icon: Book,
	},
	{
		url: 'theory',
		component: 'Theory',
		title: 'Theory',
		icon: Lightbulb,
	},
	{
		url: 'exercises',
		component: 'Exercises',
		title: 'Exercises',
		icon: Pencil,
	},
	{
		url: 'dataExplorer',
		component: 'DataExplorer',
		title: 'Data explorer',
		icon: Table,
	},
	{
		url: 'reference',
		component: 'Reference',
		title: 'SQL Reference',
		icon: Bolt,
	},
]

// useUrlTab gets the tab from the URL if it is given. It enforces it to be lower case.
export function useUrlTab() {
	const { tab } = useParams()
	return tab?.toLowerCase()
}
