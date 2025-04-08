import { TextField } from '@mui/material'

export function Exercise({ state, getInput, setInput }) {
	return <>
		<p>This is a test exercise. Please type the number <strong>{state.number}</strong> into the input field below.</p>
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
