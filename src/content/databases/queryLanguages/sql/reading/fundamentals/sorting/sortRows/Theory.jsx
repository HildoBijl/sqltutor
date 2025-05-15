import { TheoryWarning } from 'components'

import { Figure } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>You can sort rows in a table by adding an "ORDER BY" clause at the end. You can order by one column, multiple columns, ascending or descending. In case of Null values you can add NULLS LAST as add-on. It is also possible to limit the rows in various ways.</p>
		<p style={{ fontWeight: 'bold', color: 'red' }}>The parts below are test elements for the new Theory pages.</p>
		<Figure maxWidth={600}><p>Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst. Dit is een test tekst.</p></Figure>
	</>
}
