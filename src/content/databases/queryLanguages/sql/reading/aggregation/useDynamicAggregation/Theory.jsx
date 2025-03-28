import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>In case you want to apply different types of aggregations (only one column A, only on column B, on columns A and B, and so forth) then dynamic aggregations are useful. The standard is the CUBE command, but in case of hierarchical data the ROLLUP command can also be useful.</p>
	</>
}
