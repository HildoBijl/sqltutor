import { Page, Section, Par, RA, Term, Em, RelationName, PrimaryKey } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { CompaniesSchema, ShoppingSchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>Companies</Term> database. It is defined by the following schema.</Par>
			<CompaniesSchema />
			<Par>When an exercise says "Find ... " then it means "Write a relational algebra query that gives ... ".</Par>
			<ManualExerciseSet exercises={companiesExercises} />
			<Par>The following exercises use the <Term>Shopping</Term> database. It is defined by the following schema.</Par>
			<ShoppingSchema />
			<ManualExerciseSet exercises={shoppingExercises} startingNumber={companiesExercises.length + 1} />
		</Section>
	</Page>;
}

const companiesExercises = [
	{
		problem: <>
			<Par>Consider the case where people can work for multiple companies: the primary key for the <RelationName>works</RelationName> relation is not <PrimaryKey>person_name</PrimaryKey> but (<PrimaryKey>person_name</PrimaryKey>, <PrimaryKey>company_name</PrimaryKey>).</Par>
			<Par>Find the names of all employees who work for exactly one company.</Par>
		</>,
		solution: <>
			<Par>The idea here is to find the peole who work for at least one company, and subtract the people who work for at least two companies. The people who work for at least one company are all the people in the <RelationName>works</RelationName> relation.</Par>
			<RA>at_least_one_job ← ∏<sub>person_name</sub>(works)</RA>
			<Par>To find the people who work for at least two companies, we use a join and check if there are two different companies for the same person.</Par>
			<RA>at_least_two_jobs ← ∏<sub>person_name</sub>(σ<sub>works.person_name = w2.person_name ∧ works.company_name ≠ w2.company_name</sub>(works⨯ρ<sub>w2</sub>(works)))</RA>
			<Par>The final result is the subtraction of these two</Par>
			<RA>at_least_one_job – at_least_two_jobs</RA>
		</>,
	},
	{
		problem: <>
			<Par>Consider the case where people can work for multiple companies: the primary key for the <RelationName>works</RelationName> relation is not <PrimaryKey>person_name</PrimaryKey> but (<PrimaryKey>person_name</PrimaryKey>, <PrimaryKey>company_name</PrimaryKey>).</Par>
			<Par>Find the names of all employees who work for at most two (different) companies.</Par>
		</>,
		solution: <>
			<Par>The idea here is to find the people who work for at least three different companies, and then find all people except these people. So we have</Par>
			<RA>all_people ← ∏<sub>person_name</sub>(employee)</RA>
			<RA>at_least_three_jobs ← ∏<sub>person_name</sub>(σ<sub>works.person_name = w2.person_name ∧ works.person_name = w3.person_name ∧ works.company_name ≠ w2.company_name ∧ works.company_name ≠ w3.company_name ∧ w2.company_name ≠ w3.company_name</sub>(works⨯ρ<sub>w2</sub>(works) ⨯ρ<sub>w3</sub>(works)))</RA>
			<Par>Note that, to find the people with at least three jobs, we have to make sure that the three names are all the same, but the three companies are all different. For the first two comparisons suffice, while we need three comparisons for the latter.</Par>
			<Par>Once we have these relations, the result follows directly as</Par>
			<RA>all_people – at_least_three_jobs</RA>
		</>,
	},
	{
		problem: <Par>Find the names of all companies where every employee has the same salary.</Par>,
		solution: <>
			<Par>Note that relational algebra is not good with the "every" keyword, but is really strong with the "exists" keyword. So we rephrase the exercise as: find the names of the companies for which there does not exist two employees with different salaries.</Par>
			<Par>To find this, we first find the opposite: all companies where there <Em>are</Em> two employees with different salaries.</Par>
			<RA>different_salaries ← ∏<sub>works.company_name</sub>(σ<sub>works.company_name = w2.company_name ∧ works.salary ≠ w2.salary</sub>(works⨯ρ<sub>w2</sub>(works)))</RA>
			<Par>We then set up a list of all companies.</Par>
			<RA>all_companies ← ∏<sub>company_name</sub>(company)</RA>
			<Par>Note that we use the <RelationName>company</RelationName> relation here and not the <RelationName>works</RelationName> relation, to ensure companies without any employees are also included.</Par>
			<Par>For the final result, we subtract the companies with different salaries from the list of all companies.</Par>
			<RA>all_companies – different_salaries</RA>
		</>,
	},
]

const shoppingExercises = [
	{
		problem: <Par>Find the customers (ID and name) who never bought more of a product than the quantity for that product indicated on their shopping list for that date. You may assume the product was on their shopping list for each date they bought the product.</Par>,
		solution: <>
			<Par>When we see the word "never" we first do the opposite, and then flip the result. So our first goal is to find the people who at some point <Em>did</Em> buy more of a product than the quantity indicated on their shopping list for that date. This is given by</Par>
			<RA>bought_more ← ∏<sub>purchase.cID</sub>(σ<sub>purchase.cID=shoppinglist.cID ∧ purchase.pID=shoppinglist.pID ∧ purchase.date=shoppinglist.date ∧ purchase.quantity&gt;shoppinglist.quantity</sub>(purchase⨯shoppinglist))</RA>
			<Par>If we take all people and remove the above list, we find all the people who never bought more than indicated on their list. This is</Par>
			<RA>never_bought_more ← ∏<sub>cID</sub>(customer) – bought_more</RA>
			<Par>This is only the list of IDs though. To extract the name as well, we join in the other <RelationName>customer</RelationName> attributes and select what we need. The final result is</Par>
			<RA>∏<sub>cID,cName</sub>(never_bought_more ⋈ customer)</RA>
		</>,
	},
	{
		problem: <Par>Find the customers (ID and name) who never went to two (or more) different stores on the same day to buy the exact same product.</Par>,
		solution: <>
			<Par>As in the previous exercise, when we see "never" we first find the opposite and flip the result. So we first find the people who did go to two different stores on the same day to buy the same product. To find this, we compare the <RelationName>purchase</RelationName> relation with itself. We want to find two purchases from the same person on the same date for the same product, but with different store. This is</Par>
			<RA>two_purchases ← ∏<sub>purchase.cID</sub>(σ<sub>purchase.cID = p2.cID ∧ purchase.date = p2.date ∧ purchase.pID = p2.pID ∧ purchase.sID ≠ p2.sID</sub>(purchase⨯ρ<sub>p2</sub>(purchase)))</RA>
			<Par>Next, we find all people <Em>except</Em> these people. This gives</Par>
			<RA>never_two_purchases ← ∏<sub>cID</sub>(customer) – two_purchases</RA>
			<Par>This is only the list of IDs though. To extract the name as well, we join in the other customer attributes and select what we need. The final result is</Par>
			<RA>∏<sub>cID,cName</sub>(never_two_purchases ⋈ customer)</RA>
		</>,
	},
]
