import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>You can manipulate database tables in certain ways. A common operation is to only pick certain rows or columns, or both. Only picking certain columns is called a projection. Only picking certain skills is called a filter. The outcome is again a database table.</p>
	</>
}
