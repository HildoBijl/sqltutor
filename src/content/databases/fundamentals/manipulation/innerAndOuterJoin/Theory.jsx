import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>When every object in a set has sub-elements, a join is smooth. But what if a join doesn't have sub-elements? In this case we can either exclude the object in the join (an inner join) or include it with Null values (an outer join). There are also variations, with left inner join, right outer join, and so forth.</p>
	</>
}
