import { Page, Section, Par, Em, Term, RA, RelationName } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { CompaniesSchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>Companies</Term> database. It is defined by the following schema.</Par>
			<CompaniesSchema />
			<Par>When an exercise says "Find ... " then it means "Write a relational algebra query that gives ... ".</Par>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <Par>Find the company data (name, city) of all companies based in Amsterdam.</Par>,
		solution: <>
			<Par>We need to take the <RelationName>company</RelationName> relation and filter it by <Em>city</Em>.</Par>
			<RA>σ<sub>city = "Amsterdam"</sub>(company)</RA>
			<Par>This will return all the tuples within the relation with the corresponding city.</Par>
		</>,
	},
	{
		problem: <Par>Find the employee data (name, street, city) of all employees living on Wall Street in New York.</Par>,
		solution: <>
			<Par>We need to take the <RelationName>employee</RelationName> relation and filter it by both street and city using an "and" operator.</Par>
			<RA>σ<sub>street = "Wall Street" ∧ city = "New York"</sub>(employee)</RA>
			<Par>This will return all the tuples within the relation with the corresponding street and city.</Par>
		</>,
	},
	{
		problem: <Par>Find the work data (name, company, salary) of all people <Em>not</Em> earning a modal salary between 40,000 and 100,000 (inclusive) per year.</Par>,
		solution: <>
			<Par>We need to take the <RelationName>works</RelationName> relation and filter it by <Em>salary</Em>. The easiest way to do so is through the "or" operator.</Par>
			<RA>σ<sub>salary &lt; 40000 ∨ salary &gt; 100000</sub>(works)</RA>
			<Par>Another option is to use the "not" operator and brackets.</Par>
			<RA>σ<sub>¬(salary ≥ 40000 ∧ salary ≤ 100000)</sub>(works)</RA>
			<Par>This gets all the work data of workers who fall outside of the described salary range.</Par>
		</>,
	},
]
