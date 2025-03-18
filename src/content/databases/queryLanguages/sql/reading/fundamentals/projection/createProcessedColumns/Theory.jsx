import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>In SQL it is possible to create new columns using arithmetic. For instance, you can use "SELECT firstGrade*0.4 + secondGrade*0.6 as finalGrade FROM results". It is important to distinguish DECIMAL and FLOAT data types here. Possibly some CAST functions might have to be used. Other useful options include ROUND, CEIL, FLOOR and ABS.</p>
	</>
}
