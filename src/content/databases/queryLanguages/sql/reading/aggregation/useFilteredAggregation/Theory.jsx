import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>You can also apply filters when using aggregation. Key here is to ask yourself: should the filter be applied before or after the aggregation? In the first case use WHERE and in the second case use HAVING. On top of this, you may also apply arithmetic within aggregation. Crucial is to keep in mind Null-values. Some aggregation functions don't deal well with them, so these edge-cases should be caught.</p>
	</>
}
