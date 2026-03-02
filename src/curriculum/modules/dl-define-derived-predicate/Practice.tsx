import { Page, Section, Info, Par, Term, Em, DL, IDL } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { SQLValleySchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>SQL Valley</Term> database. It contains the following predicates.</Par>
			<SQLValleySchema tables={['departments', 'employees', 'contracts', 'products']} singular />
			<Par>When an exercise says "Find ... " or "Create an overview of ... " then it means "Set up a Datalog rule (or rules) for a new predicate that contains (and only contains) ... ".</Par>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <Par>Find all positions where someone with a salary of less than 150000 had a performance score of above 90.</Par>,
		solution: <>
			<Par>We take the <IDL>contracts</IDL> predicate and check the conditions. As output, we only take the position name.</Par>
			<DL>highPotentialPosition(pos) :- contract(_, pos, sal, _, _, per, _), sal &lt; 150000, per &gt; 90.</DL>
			<Par>You can read this as "A position is a high potential position, if there is a contract for that position, and the corresponding salary is less than 150000, and the corresponding performance score is more than 90."</Par>
		</>,
	},
	{
		problem: <Par>Find the names of all large departments: either the number of employees is more than 12, or the budget is more than 2000000.</Par>,
		solution: <>
			<Par>We take the <IDL>department</IDL> predicate and apply the conditions. Since it is an or-condition, we set up two rules.</Par>
			<DL>largeDepartment(n) :- department(_, n, _, _, e), e &gt; 12.<br/>largeDepartment(n) :- department(_, n, _, b, _), b &gt; 2000000.</DL>
			<Par>You can read this as "A department is a large department if the number of employees is larger than 12. A department is also a large department if the budget is larger than two million."</Par>
		</>,
	},
	{
		problem: <Par>Find the names and owners of all products in the category "Musical Instruments" that used to be listed, but are not listed anymore: they have either been sold or withdrawn.</Par>,
		solution: <>
			<Par>In this request we mix an and-condition with an or-condition. We set this up in multiple steps. First we find all musical instruments.</Par>
			<DL>musicalInstrument(id, n, o, v, s) :- product(id, n, 'Musical Instruments', o, v, s).</DL>
			<Par>From this list, we find all the products that have been sold or withdrawn.</Par>
			<DL>removedMusicalInstrument(n, o) :- musicalInstrument(_, n, o, _, 'sold').<br/>removedMusicalInstrument(n, o) :- musicalInstrument(_, n, o, _, 'withdrawn').</DL>
			<Par>Note that we could have also cut some arguments from <IDL>musicalInstrument</IDL>, which would have made the script even shorter.</Par>
		</>,
	},
]
