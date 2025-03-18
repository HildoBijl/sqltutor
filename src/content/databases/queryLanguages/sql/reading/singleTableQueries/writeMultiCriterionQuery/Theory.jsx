import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>In practice you often need to write queries that involve complex projections, filters with multiple conditions, and potentially sorting. In this skill we practice exactly that, combining these separate parts and making sure we don't mix them up along the way. Optionally, you can use the DISTINCT addition to obtain unique rows. (This only involves single-table queries and not multi-table queries. Exercises usually contain (on top of multi-condition filtering) either arithmetic-based columns or sorting/limiting, and not both, since in practice you rarely need all tools at the same time.)</p>
	</>
}
