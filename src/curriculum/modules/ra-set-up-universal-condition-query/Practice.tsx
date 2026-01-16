import { Page, Section, Par, RA, Term, Em, RelationName, PrimaryKey } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { CompaniesSchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>Companies</Term> database. It is defined by the following schema.</Par>
			<CompaniesSchema />
			<Par>When an exercise says "Find ... " then it means "Write a relational algebra query that gives ... ".</Par>
			<ManualExerciseSet exercises={companiesExercises} />
			{/* <Par>The following exercises use the <Term>Shopping</Term> database. It is defined by the following schema.</Par>
			<ShoppingSchema />
			<ManualExerciseSet exercises={shoppingExercises} startingNumber={companiesExercises.length + 1} /> */}
		</Section>
	</Page>;
}

const companiesExercises = [
	{
		problem: <>
			<Par>Consider the case where people can work for multiple companies: the primary key for the <RelationName>works</RelationName> relation is not <PrimaryKey>person_name</PrimaryKey> but (<PrimaryKey>person_name</PrimaryKey>, <PrimaryKey>company_name</PrimaryKey>).</Par>
			<Par>Find the names of people who work for every company. You may assume there is at least one company.</Par>
		</>,
		solution: <>
			<Par>The idea here is to set up a list of companies, and to then check for each person if they work for each of the companies. The list of companies (the requirement list) is</Par>
			<RA>all_companies ← ∏<sub>company_name</sub>(company)</RA>
			<Par>Note that this list is applicable to all workers. In other words, the requirement list is a fixed list. This means we can solve this problem using division. We find the joint overview of people and companies where they work, and divide by the list of companies. According to the definition of the division, this gives us all the people who work at all companies.</Par>
			<RA>∏<sub>person_name,company_name</sub>(works) ÷ all_companies</RA>
			<Par>Alternatively, we could also do this without division. (We then indirectly apply the division formula.) To do so, we have to reformulate the request through a double-negative: find the names of people for which is does <Em>not</Em> hold that they <Em>don't</Em> work at a certain company.</Par>
			<Par>We start with the entity list (all working people) and the requirement list (all companies).</Par>
			<RA>
				all_people ← ∏<sub>person_name</sub>(company)<br/>
				all_companies ← ∏<sub>company_name</sub>(company)<br/>
			</RA>
			<Par>Next, we check which combinations do exist. What are the jobs people have?</Par>
			<RA>jobs ← ∏<sub>person_name,company_name</sub>(works)</RA>
			<Par>We want to find the opposite: the jobs that do not exist. At what company does each person <Em>not</Em> work? To get this, we flip the entity-requirement table.</Par>
			<RA>missing_jobs ← all_people ⨯ all_companies - jobs</RA>
			<Par>Anyone who appears in this list has some company they're not working at. So this list of people is</Par>
			<RA>people_with_missing_job ← ∏<sub>person_name</sub>(missing_jobs)</RA>
			<Par>We want to find the opposite: we want to find the people for who there does <Em>not</Em> exist a company they don't work for. This results in the final query</Par>
			<RA>all_people - people_with_missing_jobs</RA>
			<Par>Note that, according to the division formula, this is exactly the same as the result we found earlier.</Par>
		</>,
	},
	{
		problem: <>
			<Par>Find the name of the manager who manages every employee of the First Bank Corporation. You may assume there is at least one employee of this bank. (Side question: can this be only one person or can there be more such managers?)</Par>
		</>,
		solution: <>
			<Par>The idea here is to set up a list of First Bank Corporation employees, and to then check for each person if they manage all of these employees. The list of First Bank Corporation employees (the requirement list) is</Par>
			<RA>all_bankers ← ∏<sub>person_name</sub>(σ<sub>company_name = "First Bank Corporation"</sub>(works))</RA>
			<Par>We now want to check, for each person, if they manage all the people in this list. Note that the list we compare against is the <Em>same</Em> for all people. This means division is possible. The solution would hence be</Par>
			<RA>manages ÷ all_bankers</RA>
			<Par>Note that, because <RelationName>manages</RelationName> has "person_name" as a key, every person can have at most one manager. As a result, it cannot be that there are multiple people managing all the employees of the First Bank Corporation. For that to happen, the key of the relation has to change.</Par>
			<Par>Alternatively, we could also do this exercise without division. Then we rephrase the request as: Find the name of the manager for which there does not exist a person at the First Bank Corporation which they do not manage. To obtain this, we first set up our entity list: the list of all managers.</Par>
			<RA>all_managers ← ∏<sub>manager_name</sub>(manages)</RA>
			<Par>We also want to know which banker-manager combinations exist. Those are given by the <RelationName>manages</RelationName> relation. To find all the banker-manager combinations that do not exist, we use</Par>
			<RA>not_manages ← all_bankers ⨯ all_managers – manages</RA>
			<Par>If we take all the managers who appear in this list, we find all the managers for which there is a bank employee they do not manage.</Par>
			<RA>managers_not_managing_everyone ← ∏<sub>manager_name</sub>(not_manages)</RA>
			<Par>The final result would be all the managers that are not in this list. They are the ones who manage all bank employees. This is</Par>
			<RA>all_managers - managers_not_managing_everyone</RA>
			<Par>This solves the exercises without division.</Par>
		</>,
	},
	{
		problem: <>
			<Par>Consider the case where companies may be located in multiple cities: the primary key for the <RelationName>company</RelationName> relation is not <PrimaryKey>company_name</PrimaryKey> but (<PrimaryKey>company_name</PrimaryKey>, <PrimaryKey>city</PrimaryKey>).</Par>
			<Par>Find the companies that have employees living in all cities in which they are located.</Par>
		</>,
		solution: <>
			<Par>To solve this exercise, we need to walk through the companies. For each company, we must create a list of cities they are in, and then see if there's an employee living in each of these cities. Note that this list of cities is <Em>different</Em> per company: it depends on the company's employees. Since our requirement list is different, we cannot use division.</Par>
			<Par>We rephrase our query without "every" using a double negative: "Find the companies for which there does not exist a city the company is located in but has no employee living there." To find this, we first find the opposite: we find the companies for which there <Em>exists</Em> a city the company is located on, but there does <Em>not</Em> exist an employee living in that city.</Par>
			<Par>We first set up a list of companies (the entities) and cities (the requirements).</Par>
			<RA>
				all_companies ← ∏<sub>company_name</sub>(companies)<br/>
				all_cities ← ∏<sub>city</sub>(companies)
			</RA>
			<Par>The list of companies and their locations is given by the (already existing) relation</Par>
			<RA>company</RA>
			<Par>We could also find a list of companies including cities where their employees work at. For that, we join <RelationName>works</RelationName> with <RelationName>employee</RelationName> and extract "company_name" and "city".</Par>
			<RA>company_employee_cities ← ∏<sub>company_name,city</sub>(works ⋈ employee)</RA>
			<Par>Now we have to apply the conditions to combine these latter two relations in some way. If we subtract the second relation from the first, we find the list of all (company_name, city) combinations where the company <Em>does</Em> appear in the city, but <Em>none</Em> of its employees live in that city.</Par>
			<RA>company_city_without_employees ← company – company_employee_cities</RA>
			<Par>We can extract the "company_name" attribute from this, to find a list of all companies who are located in a city without any of its employees.</Par>
			<RA>companies_with_city_without_employees ← ∏<sub>company_name</sub>(company_city_without_employees)</RA>
			<Par>The opposite of this is then the list of companies who have an employee in all cities they are located in.</Par>
			<RA>all_companies - companies_with_city_without_employees</RA>
			<Par>This solves the exercise.</Par>
		</>,
	},
]

// const shoppingExercises = [
// 	{
// 		problem: <Par>Find the customers (ID and name) who never bought anything that was on their shopping list for the same date.</Par>,
// 		solution: <>
// 			<Par>The tricky part here is figuring out for which entities we want to run checks. This is the combination (cID, pID, date). For each combination </Par>
// 			<RA></RA>
// 			<Par></Par>
// 		</>,
// 	},
// 	{
// 		problem: <Par></Par>,
// 		solution: <>
// 			<Par></Par>
// 			<RA></RA>
// 			<Par></Par>
// 		</>,
// 	},
// 	{
// 		problem: <Par></Par>,
// 		solution: <>
// 			<Par></Par>
// 			<RA></RA>
// 			<Par></Par>
// 		</>,
// 	},
// 	{
// 		problem: <Par></Par>,
// 		solution: <>
// 			<Par></Par>
// 			<RA></RA>
// 			<Par></Par>
// 		</>,
// 	},
// 	{
// 		problem: <Par></Par>,
// 		solution: <>
// 			<Par></Par>
// 			<RA></RA>
// 			<Par></Par>
// 		</>,
// 	},
// 	{
// 		problem: <Par></Par>,
// 		solution: <>
// 			<Par></Par>
// 			<RA></RA>
// 			<Par></Par>
// 		</>,
// 	},
// ]
