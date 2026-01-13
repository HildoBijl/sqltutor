import { Page, Section, Par, Em, RA, RelationName, Link } from '@/components';
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
		problem: <Par>Find the names of the "big bosses": employees that have a job but that do not have a manager.</Par>,
		solution: <>
			<Par>We want to find the employees that have a job. These are</Par>
			<RA>∏<sub>person_name</sub>(works)</RA>
			<Par>We also want to find the employees that have a manager. These are</Par>
			<RA>∏<sub>person_name</sub>(manages)</RA>
			<Par>To find the people that have a job but do not have a manager, we subtract the second from the first. This results in</Par>
			<RA>∏<sub>person_name</sub>(works) – ∏<sub>person_name</sub>(manages)</RA>
			<Par>Note that, if somehow there is a person that <Em>has</Em> a manager, but does <Em>not</Em> have a job, then the above query still works. The subtraction removes all elements from the left set that are in the right set. If there are elements in the right set that are not in the left set, they are ignored.</Par>
		</>,
	},
	{
		problem: <Par>Find the names of all employees that do not work for the First Bank Corporation.</Par>,
		solution: <>
			<Par>A first idea to solve this query would be to just check the people who work at a company other than the First Bank Corporation.</Par>
			<RA>∏<sub>person_name</sub>(σ<sub>company_name ≠ "First Bank Corporation"</sub>(works))</RA>
			<Par>This is wrong, because people who are eligible to work (and are hence in the <RelationName>employee</RelationName> relation) but do <Em>not</Em> have a job (and are hence not in the <RelationName>works</RelationName> relation) will now be included. But here we do want to include the unemployed people! The key is to find all employees and remove those who do work at the First Bank Corporation.</Par>
			<RA>∏<sub>person_name</sub>(employee) – ∏<sub>person_name</sub>(σ<sub>company_name = "First Bank Corporation"</sub>(works))</RA>
		</>,
	},
	{
		problem: <Par>Find the names of all companies located in Amsterdam where some people (at least one) earn more than 200,000 annually. (Do so without using a join, as that would be inefficient here.)</Par>,
		solution: <>
			<Par>The companies located in Amsterdam are given by</Par>
			<RA>∏<sub>company_name</sub>(σ<sub>city = "Amsterdam"</sub>(company))</RA>
			<Par>The companies where someone earns more than 200,000 annually are</Par>
			<RA>∏<sub>company_name</sub>(σ<sub>salary &gt; 200000</sub>(works))</RA>
			<Par>The companies where both conditions hold follow from the intersection.</Par>
			<RA>∏<sub>company_name</sub>(σ<sub>city = "Amsterdam"</sub>(company)) ∩ ∏<sub>company_name</sub>(σ<sub>salary &gt; 200000</sub>(works))</RA>
			<Par>This solves the given exercise. Alternatively, we could have also done this through a <Link to="/skills/ra-join-relations">join</Link>, but that would have been more complicated and less efficient. We'd then have</Par>
			<RA>∏<sub>company_name</sub>(σ<sub>city = "Amsterdam" ∧ salary &gt; 200000</sub>(works ⋈ company))</RA>
		</>,
	},
	{
		problem: <Par>Find the names of all people who either are a manager of someone, or work for the "Management Consulting Firm".</Par>,
		solution: <>
			<Par>The people who are a manager of one or more people are given by the <RelationName>manages</RelationName> relation</Par>
			<RA>∏<sub>manager_name</sub>(manages)</RA>
			<Par>The people who work for the Management Consulting Firm are given by</Par>
			<RA>∏<sub>person_name</sub>(σ<sub>company_name = "Management Consulting Firm"</sub>(works))</RA>
			<Par>We want to take the union of these two results, but the attribute names are different. Adding a rename operator on the first result gives</Par>
			<RA>ρ<sub>manager_name→person_name</sub>(∏<sub>manager_name</sub>(manages))</RA>
			<Par>Now taking the union gives us the final result</Par>
			<RA>ρ<sub>manager_name→person_name</sub>(∏<sub>manager_name</sub>(manages)) ∪ ∏<sub>person_name</sub>(σ<sub>company_name = "Management Consulting Firm"</sub>(works))</RA>
		</>,
	},
]
