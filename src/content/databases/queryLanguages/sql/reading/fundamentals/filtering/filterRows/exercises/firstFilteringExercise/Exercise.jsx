import { TextField } from '@mui/material'

export function Exercise({ state, getInput, setInput }) {
	return <>
		<p>Find the all companies from <strong>{state}</strong>.</p>
		<TextField
			id="number"
			label="Enter your number here"
			variant="outlined"
			value={getInput() || ''}
			onChange={(event) => setInput(event.target.value)}
			sx={{ minWidth: '100%' }}
		/>
	</>
}
