import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>You can set up a basic query to extract data from tables by combining a projection and a filter. For instance, you can use "SELECT firstName, lastName FROM people WHERE age &lt; 18". (This skill only considers single-criterion conditions and not multi-criterion conditions.)</p>
	</>
}
