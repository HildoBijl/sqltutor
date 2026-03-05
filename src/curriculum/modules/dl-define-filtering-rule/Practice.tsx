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
		problem: <Par>Find all contracts that started in the year 2024.</Par>,
		solution: <>
			<Par>We take the <IDL>contracts</IDL> predicate and make sure the start date is in the right time frame.</Par>
			<DL>contractFrom2024(id, pos, sal, start, end, per, stat) :- contract(id, pos, sal, start, end, per, stat), start &gt;= '2024-01-01', start &lt;= '2024-12-31'.</DL>
			<Par>Note that the argument names don't matter, as long as they match within the rule. Given that many arguments start with the letter s, it's hard shortening them in a clear way.</Par>
		</>,
	},
	{
		problem: <Par>Find all "Fine Art" products that have been sold. Drop arguments where applicable.</Par>,
		solution: <>
			<Par>We take the <IDL>product</IDL> predicate and apply the conditions that the category equals "Fine Art" and the status equals "sold". This could result in</Par>
			<DL>soldFineArtProduct(id, n, 'Fine Art', o, v, 'sold') :- product(id, n, 'Fine Art', o, v, 'sold').</DL>
			<Par>However, we are specifically instructed to drop arguments where applicable. This turns it into</Par>
			<DL>soldFineArtProduct(id, n, o, v) :- product(id, n, 'Fine Art', o, v, 'sold').</DL>
		</>,
	},
	{
		problem: <Par>Find all employees that currently do not have a modal salary between 120000 and 220000.</Par>,
		solution: <>
			<Par>The conditions imply that the salary should be below 120000 <Em>or</Em> above 220000. Starting at the <IDL>employee</IDL> predicate, we get the rules</Par>
			<DL>nonModalEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &lt; 120000.<br/>nonModalEmployee(id, fn, ln, p, e, a, c, hd, cs) :- employee(id, fn, ln, p, e, a, c, hd, cs), cs &gt; 220000.</DL>
			<Info>Datalog also has a <IDL>not</IDL> keyword, so in theory we could also first find all modal employees, and then find all other employees. However, the <IDL>not</IDL> keyword has a few caveats that we ought to be aware of when using it. So for now let's not go there and stick with the or-condition.</Info>
		</>,
	},
]
