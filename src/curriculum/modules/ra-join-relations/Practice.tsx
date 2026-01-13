import { Page, Section, Par, RA, RelationName } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { CompaniesSchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the "Companies" database. It is defined by the following schema.</Par>
			<CompaniesSchema />
			<Par>When an exercise says "Find ... " then it means "Write a relational algebra query that gives ... ".</Par>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <Par>Join the <RelationName>employee</RelationName> and <RelationName>works</RelationName> relations to show for all employees living in Amsterdam what street they live in and what company they work for. (Excess attributes in the relation are OK: no projection is needed.)</Par>,
		solution: <>
			<Par>The first step for this exercise is to join the relations. Then we need to restrict the output to the people whose city equals Amsterdam. To join the relations, there are two methods. We could take the Cartesian product and filter based on equal foreign key.</Par>
			<RA>σ<sub>employee.person_name = works.person_name</sub>(employee⨯works)</RA>
			<Par>Alternatively, because the foreign key has the same name "person_name" in both relations, we could also use the natural join as short-cut.</Par>
			<RA>employee ⋈ works</RA>
			<Par>Both these commands do the same thing: they join the two relations. Once we have the join, we need to add a filter on the city. The following three commands are all valid options to do so.</Par>
			<RA>σ<sub>city = "Amsterdam"</sub>(σ<sub>employee.person_name = works.person_name</sub>(employee⨯works))</RA>
			<RA>σ<sub>employee.person_name = works.person_name ∧ city = "Amsterdam"</sub>(employee⨯works)</RA>
			<RA>σ<sub>city = "Amsterdam"</sub>(employee ⋈ works)</RA>
			<Par>Note that, for the city, we could also use "employee.city" rather than just "city", but since there are no duplicate names, this is optional.</Par>
		</>,
	},
	{
		problem: <Par>Join the <RelationName>works</RelationName> and <RelationName>company</RelationName> relations to show, for all workers earning less than 20,000 per year, in which city the company they work for is located. (Excess attributes in the relation are OK: no projection is needed.)</Par>,
		solution: <>
			<Par>The first step is to join the relations, and the second step is to filter based on the salary requirement. Joining <RelationName>works</RelationName> and <RelationName>company</RelationName> can be done through either of the following two commands.</Par>
			<RA>σ<sub>works.company_name = company.company_name</sub>(works⨯company)</RA>
			<RA>works ⋈ company</RA>
			<Par>Then the salary requirement should still be added. This can for instance be done through</Par>
			<RA>σ<sub>salary &lt; 20000</sub>(works ⋈ company)</RA>
			<Par>Note that there cannot be confusion about attribute names, since there is only one attribute called "salary".</Par>
		</>,
	},
	{
		problem: <Par>Join the <RelationName>works</RelationName> and <RelationName>manages</RelationName> relations to show for all workers what company their manager works for. (Excess attributes in the relation are OK: no projection is needed.)</Par>,
		solution: <>
			<Par>The tricky part here is that we need to join the <RelationName>manages</RelationName> relation with the <RelationName>works</RelationName> relation, but we have to do so based on the foreign key "manager_name". The default way of doing this, through a Cartesian product, is</Par>
			<RA>σ<sub>manages.manager_name = works.person_name</sub>(manages⨯works)</RA>
			<Par>It is not possible to use the natural join directly. If we still want to use the natural join, we'd first have to rename attributes. One option is to rename the "person_name" within <RelationName>works</RelationName> to "manager_name" to get</Par>
			<RA>manages ⋈ ρ<sub>person_name→manager_name</sub>(works)</RA>
			<Par>This sets up a valid join as well. Both solutions are valid for this exercise.</Par>
		</>,
	},
	{
		problem: <Par>Join the <RelationName>works</RelationName> and <RelationName>manages</RelationName> relations to show for all workers at the First Bank Corporation how much they earn and who they are managed by. (Excess attributes in the relation are OK: no projection is needed.)</Par>,
		solution: <>
			<Par>The first step is to join the two relations, and the second step is to filter on the company name. The join can be done through either of the following two commands.</Par>
			<RA>σ<sub>works.person_name = manages.person_name</sub>(works⨯manages)</RA>
			<RA>works ⋈ manages</RA>
			<Par>The filtering can then for instance be done through</Par>
			<RA>σ<sub>company_name = "First Bank Corporation"</sub>(works ⋈ manages)</RA>
			<Par>Note that there cannot be confusion about attribute names, since there is only one attribute called "company_name".</Par>
		</>,
	},
]
