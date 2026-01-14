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
		problem: <Par>Find the names of all people working for a company.</Par>,
		solution: <>
			<Par>Whereas the <RelationName>employee</RelationName> relation contains all people who are eligible to work, the <RelationName>works</RelationName> relation contains all people actually working somewhere. So we need this relation, and apply projection to find the person name.</Par>
			<RA>∏<sub>person_name</sub>(works)</RA>
			<Par>This relational algebra query solves the problem.</Par>
		</>,
	},
	{
		problem: <Par>Find all the addresses (street and city) where employees live.</Par>,
		solution: <>
			<Par>We need the <RelationName>employee</RelationName> relation and extract only the street and the city.</Par>
			<RA>∏<sub>street,city</sub>(employee)</RA>
			<Par>Note that if there are duplicates (multiple employees living at the same address) then relational algebra automatically removes duplicates, so we could end up with a relation having fewer rows, which is exactly as we want it.</Par>
		</>,
	},
	{
		problem: <Par>Find the names of all managers: people who manages someone.</Par>,
		solution: <>
			<Par>The managers are listed in the <RelationName>manages</RelationName> relation. By taking all the manager names, we find all the names of the people who manage someone.</Par>
			<RA>∏<sub>manager_name</sub>(manages)</RA>
			<Par>Note that relational algebra automatically filters out duplicates. If there is a person who manages multiple employees, their name only appears once in the output.</Par>
		</>,
	},
]
