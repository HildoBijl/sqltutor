import { Page, Section, Par, Term, RA, RelationName } from '@/components';
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
		problem: <Par>Find the names of all the companies based in Seattle.</Par>,
		solution: <>
			<Par>We take the <RelationName>company</RelationName> relation, first apply filtering on the city, and then apply projection to retrieve only the respective company names.</Par>
			<RA>∏<sub>company_name</sub>(σ<sub>city = "Seattle"</sub>(company))</RA>
		</>,
	},
	{
		problem: <Par>Find the names of all employees who work for the First Bank Corporation and earn more than 100,000 per year.</Par>,
		solution: <>
			<Par>We take the <RelationName>works</RelationName> relation, first apply filtering on the company name and salary, and then apply projection to retrieve only the respective names.</Par>
			<RA>∏<sub>person_name</sub>(σ<sub>company_name = "First Bank Corporation" ∧ salary &gt; 100000</sub>(works))</RA>
		</>,
	},
	{
		problem: <Par>Find the names of all the employees living in one of the Netherlands’ three largest cities (Amsterdam, Rotterdam, The Hague).</Par>,
		solution: <>
			<Par>We take the <RelationName>employee</RelationName> relation, first apply filtering on the city using an "or" operator, and then apply projection to retrieve only the respective names.</Par>
			<RA>∏<sub>person_name</sub>(σ<sub>city = "Amsterdam" ∨ city = "Rotterdam" ∨ city = "The Hague"</sub>(employee))</RA>
		</>,
	},
]
