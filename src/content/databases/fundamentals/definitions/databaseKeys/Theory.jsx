import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>In a database table, we need to find a way to uniquely identify rows. These are the so-called keys. There are super keys, candidate keys and primary keys. Super keys uniquely identify the row (assuming there are no duplicates), candidate keys do so as well but are minimal, and the primary key is the candidate key that we choose to use in practice.</p>
	</>
}
