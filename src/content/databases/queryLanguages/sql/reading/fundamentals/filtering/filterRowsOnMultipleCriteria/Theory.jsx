import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>If there are multiple conditions, they can be patched together using AND and OR, applying brackets where needed. Sometimes the BETWEEN operator or the NOT keyword is also useful. It is also important to deal with Null values, when they appear. (This skill does not include using subqueries through IN, EXISTS, etcetera.)</p>
	</>
}
