import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>Sometimes a table has duplicate data. In this case it might be better to split the table into two and use a link between them: an entry in one table containing the key of the other table. This link is called a foreign key, and this splitting is called decomposition. The opposite of decomposition is joining: you can join the tables back together. When you do, we should get the original data back (losslessness). If we can't, and there's data loss, we messed up somewhere.</p>
	</>
}
