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
		problem: <Par>Find the names of all employees in this database who live in the same city as the company for which they work.</Par>,
		solution: <>
			<Par>First we study the relations that we need. For an employee's city, we need the <RelationName>employee</RelationName> relation. This is then linked through the <RelationName>works</RelationName> relation to their company, which is again linked through the <RelationName>company</RelationName> relation to the company's city. So we need a triple join.</Par>
			<Par>We can set up the triple join through the Cartesian product.</Par>
			<RA>σ<sub>employee.person_name = works.person_name ∧ company.company_name = works.company_name</sub>(employee⨯works⨯company)</RA>
			<Par>If we then add in the filtering requirement (equal city) and use projection to extract the names, we wind up with the solution</Par>
			<RA>∏<sub>employee.person_name</sub>(σ<sub>employee.person_name = works.person_name ∧ company.company_name = works.company_name ∧ employee.city = company.city</sub>(employee⨯works⨯company))</RA>
			<Par>An alternative is to use the natural join. There is one issue here: when we use the natural join, then we implicitly require all <Em>equally named attributes</Em> to be the same. So the "person_name" should be the same, the "company_name", and finally the attribute "city" also appears within multiple relations. So that would mess up our join! To do a valid join, we should rename the city. This gives a valid join, being</Par>
			<RA>employee ⋈ works ⋈ ρ<sub>city→company_city</sub>(company)</RA>
			<Par>For this join, we can then set up a filter, and apply projection. This gives us</Par>
			<RA>∏<sub>person_name</sub>(σ<sub>city = company_city</sub>(employee ⋈ works ⋈ ρ<sub>city→company_city</sub>(company)))</RA>
			<Par>This is a valid solution. But ... there's another option! In this very specific example, we actually want the city to be the same. And the natural join (if we didn't rename) would require that. So for this specific example, the natural join "accidentally" does exactly what we want! A short-cut for a solution, that only works for this example, is therefore</Par>
			<RA>∏<sub>person_name</sub>(employee ⋈ works ⋈ company)</RA>
			<Par>This natural join implicitly requires the city to be equal too, so no further filtering is needed.</Par>
		</>,
	},
	{
		problem: <Par>Find the names of all employees who live in the same city and on the same street as do their managers.</Par>,
		solution: <>
			<Par>We first study the relations we need. For every employee (so the <RelationName>employee</RelationName> relation), we need to find the name of the manager (through <RelationName>manages</RelationName>) and then for that manager we need to check out the address (once more the <RelationName>employee</RelationName> relation). So effectively, we need to join <RelationName>employee</RelationName> with <RelationName>manages</RelationName> and then once more with <RelationName>employee</RelationName>.</Par>
			<Par>One way to do this is through the Cartesian product. We take the product of the three relations, and require the foreign keys to be equal. To prevent naming problems, we rename one of the <RelationName>employee</RelationName> relations to <RelationName>boss</RelationName> (any name will do). This gives the corresponding join.</Par>
			<RA>σ<sub>employee.person_name = manages.person_name ∧ manages.manager_name = boss.person_name</sub>(employee⨯manages⨯ρ<sub>boss</sub>(employee))</RA>
			<Par>This has adequately joined the two tables. To let the query meet the requirements, we should add a filter on "street" and "city", and subsequently select the "person_name" attribute. This results in the final query</Par>
			<RA>∏<sub>employee.person_name</sub>(σ<sub>employee.person_name = manages.person_name ∧ manages.manager_name = boss.person_name  ∧ employee.street = boss.street ∧ employee.city = boss.city</sub>(employee⨯manages⨯ρ<sub>boss</sub>(employee)))</RA>
			<Par>We could have also tried to use a natural join. However, when we do, we have to be careful not to have duplicate attribute names that we don't want present. If we directly use a natural join, then it requires all equally named attributes to be equal. If we look at the query above, we see that this is <Em>almost</Em> what we want. We only need to rename one attribute. So given that, the following query would also work to complete this exercise.</Par>
			<RA>∏<sub>person_name</sub>(employee ⋈ manages ⋈ ρ<sub>person_name→manager_name</sub>(employee))</RA>
			<Par>Note that we now implicitly require all the filtering requirements from the earlier query to hold.</Par>
		</>,
	},
	{
		problem: <Par>Find the names of the employees that do not work for the same company as their managers. (Perhaps they are employed through an employment agency.)</Par>,
		solution: <>
			<Par>The relations we need are the <RelationName>works</RelationName> relation for a person's company, then the <RelationName>manages</RelationName> relation to find their manager, and then once more the <RelationName>works</RelationName> relation for the manager's company. Because we join a table with itself, we need to rename one of the works relations to prevent naming problems. The join can then be done through</Par>
			<RA>σ<sub>works.person_name = manages.person_name ∧ manages.manager_name = boss.person_name</sub>(works⨯manages⨯ρ<sub>boss</sub>(works))</RA>
			<Par>The next step is to add the filtering and the projection. Requiring the company to be unequal, and selecting the name of the employee, we get</Par>
			<RA>∏<sub>works.person_name</sub>(σ<sub>works.person_name = manages.person_name ∧ manages.manager_name = boss.person_name ∧ works.company_name ≠ boss.company_name</sub>(works⨯manages⨯ρ<sub>boss</sub>(works)))</RA>
			<Par>This is a valid solution. We could have also tried to use a natural join. The hard part is that both <RelationName>works</RelationName> relations have parameters "company_name" and "salary". If we would leave them as is, the natural join will require them to be equal, which is not what we want here. So we either remove them with a projection, or rename them to a different name. The latter idea results in the join</Par>
			<RA>works ⋈ manages ⋈ ρ<sub>person_name→manager_name, company_name→manager_company_name, salary→manager_salary</sub>(works)</RA>
			<Par>Note that this creates a join of the three tables, where we have named each attribute appropriately. Adding in the required filtering and projection results in another possible solution.</Par>
			<RA>∏<sub>person_name</sub>(σ<sub>company_name ≠ manager_company_name</sub>(works ⋈ manages ⋈ ρ<sub>person_name→manager_name, company_name→manager_company_name, salary→manager_salary</sub>(works)))</RA>
		</>,
	},
	{
		problem: <>
			<Par>Consider the case where people can work for multiple companies: the primary key for the <RelationName>works</RelationName> relation is not <PrimaryKey>person_name</PrimaryKey> but (<PrimaryKey>person_name</PrimaryKey>, <PrimaryKey>company_name</PrimaryKey>).</Par>
			<Par>Find the names of all employees who work for at least two (different) companies.</Par>
		</>,
		solution: <>
			<Par>The key to solving this exercise is to compare two possible jobs that someone might have. In other words, we need to join the <RelationName>works</RelationName> relation with itself! This can be done through the following join.</Par>
			<RA>σ<sub>works.person_name = w2.person_name</sub>(works⨯ρ<sub>w2</sub>(works))</RA>
			<Par>Note that the Cartesian product takes all rows from one relation, and combines each row with every other possible row from the second relation. So this gives us all combinations of two jobs from the same person. But this also includes the combination of a job with itself! To be sure that someone really has two <Em>different</Em> jobs, we need the company name to be different. This idea (combined with a projection) gives the final result.</Par>
			<RA>∏<sub>person_name</sub>(σ<sub>works.person_name = w2.person_name ∧ works.company_name ≠ w2.company_name</sub>(works⨯ρ<sub>w2</sub>(works)))</RA>
			<Par>We could have also done this through a natural join. The join itself would have been done through</Par>
			<RA>works ⋈ ρ<sub>company_name→other_company_name, salary→other_salary</sub>(works)</RA>
			<Par>Note that we also have to rename the salary, or the two jobs implicitly also require an equal salary. (Or alternatively we can remove it with a projection.) The above join does also give the combinations of jobs combined with itself, so to ensure someone has two <Em>different</Em> jobs, we add a filter. The final result is</Par>
			<RA>∏<sub>person_name</sub>(σ<sub>company_name ≠ other_company_name</sub>(works ⋈ ρ<sub>company_name→other_company_name, salary→other_salary</sub>(works)))</RA>
		</>,
	},
]

const shoppingExercises = [
	{
		problem: <Par>List the customers (their IDs) who had a product in one of their shopping lists that was available in sufficient quantity in a store on the date of the shopping list. (Available in "sufficient" quantity means the inventory quantity of the product was at least as high as the quantity the customer wanted to buy.)</Par>,
		solution: <>
			<Par>The idea is to compare the <RelationName>shoppinglist</RelationName> relation and the <RelationName>inventory</RelationName> relation. We are looking for an entry for the same product on the same date, where the shopping list had a higher or equal quantity than the inventory quantity. This results in the following query.</Par>
			<RA>∏<sub>shoppinglist.cID</sub>(σ<sub>shoppinglist.pID=inventory.pID ∧ shoppinglist.date=inventory.date ∧ shoppinglist.quantity≤inventory.quantity</sub>(shoppinglist⨯inventory))</RA>
		</>,
	},
	{
		problem: <Par>List the customers (their IDs) who bought more of a product on some date than the quantity for that product indicated on their shopping list for that date. You may assume the product was on their shopping list for that date.</Par>,
		solution: <>
			<Par>The idea is to compare the <RelationName>purchase</RelationName> relation and the <RelationName>shoppinglist</RelationName> relation. We are looking for an entry for the same customer and the same product on the same date, where the purchased quantity is larger than the shopping list quantity. This results in the following query.</Par>
			<RA>∏<sub>shoppinglist.cID</sub>(σ<sub>purchase.cID=shoppinglist.cID ∧ purchase.pID=shoppinglist.pID ∧ purchase.date=shoppinglist.date ∧ purchase.quantity&gt;shoppinglist.quantity</sub>(purchase⨯shoppinglist))</RA>
		</>,
	},
]
