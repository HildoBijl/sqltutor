import { Page, Section, Par, RA, IRA, Term, Em, RelationName, PrimaryKey } from '@/components';
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
				all_people ← ∏<sub>person_name</sub>(company)<br />
				all_companies ← ∏<sub>company_name</sub>(company)<br />
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
				all_companies ← ∏<sub>company_name</sub>(companies)<br />
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

const shoppingExercises = [
	{
		problem: <Par>Find the customers (ID and name) who never bought anything that was on their shopping list for the same date.</Par>,
		solution: <>
			<Par>The first trick is to deal with the word "never". When we see it, we do the opposite: we initially want to find the people who <Em>did</Em> buy something that was on their shopping list for that date.</Par>
			<Par>The second action is to set up a checklist table. Our entity list consists of all customers. For those customers, we want to check all combinations (pID, date): was there a product on some day that they had on their shopping list and subsequently bought? To do this, we can set up the following <Em>two</Em> checklist tables.</Par>
			<RA>
				products_bought ← ∏<sub>cID,pID,date</sub>(purchase)<br />
				products_on_list ← ∏<sub>cID,pID,date</sub>(shoppinglist)
			</RA>
			<Par>It helps to visualize these two relations as checklist tables, with the customers representing rows, and the combinations (pID, date) representing columns. The checklist table contains a checkmark if the customer had the specific product on the specific date on their purchase list and/or shoppinglist.</Par>
			<Par>We now want to know which products were bought <Em>and</Em> were on the shopping list. To implement these conditions, we take an intersection. We get</Par>
			<RA>products_bought_from_list ← products_bought ∩ products_on_list</RA>
			<Par>We are looking for the people for which there <Em>exists</Em> some moment where they bought a product from their list. There is no "not" here, so we don't flip the checklist table: we directly squash it. This gives us all the people who <Em>at some point</Em> bought something from their shopping list.</Par>
			<RA>bought_from_list ← ∏<sub>cID</sub>(products_bought_from_list)</RA>
			<Par>Finally, we flip the result to get all <Em>other</Em> people. They are the ones who <Em>never</Em> bought something from their shopping list.</Par>
			<RA>never_bought_from_list ← ∏<sub>cID</sub>(customer) - bought_from_list</RA>
			<Par>And as last remaining step, we need to add in the customer name. For this, we apply a join and projection.</Par>
			<RA>∏<sub>cID,cName</sub>(never_bought_from_list ⋈ customer)</RA>
		</>,
	},
	{
		problem: <Par>Find the customers (ID and name) who only bought products that were on their shopping list from the respective date.</Par>,
		solution: <>
			<Par>This is different from the previous question: we now want to find the customers who never bought anything that was <Em>not</Em> on their shopping list for the same date.</Par>
			<Par>As before, we set up our checklist tables.</Par>
			<RA>
				products_bought ← ∏<sub>cID,pID,date</sub>(purchase)<br />
				products_on_list ← ∏<sub>cID,pID,date</sub>(shoppinglist)
			</RA>
			<Par>We want to find the purchases made that were <Em>not</Em> from the list. This results in</Par>
			<RA>products_bought_not_from_list ← products_bought - products_on_list</RA>
			<Par>The people who at some point bought something <Em>not</Em> from their list are</Par>
			<RA>bought_not_from_list ← ∏<sub>cID</sub>(products_bought_not_from_list)</RA>
			<Par>The people who always stuck to their shopping list are the opposite group.</Par>
			<RA>always_bought_from_list ← ∏<sub>cID</sub>(customer) − bought_not_from_list</RA>
			<Par>These are the customers we want. Finally, we add in the remaining required data through a join.</Par>
			<RA>∏<sub>cID,cName</sub>(always_bought_from_list ⋈ customer)</RA>
		</>,
	},
	{
		problem: <Par>Find the customers (ID and name) who bought more of a product on some date than the quantity for that product indicated on their shopping list for that date. You are <Em>not</Em> allowed to assume the product was on their shopping list for that date.</Par>,
		solution: <>
			<Par>This problem actually consists of two parts. We want to find the people who bought <Em>more</Em> than what was on their list, and we want to find the people who bought something <Em>not</Em> on their list.</Par>
			<Par>The second part (people who bought something not on their list) has been done in the previous exercise. We can copy the script there.</Par>
			<RA>
				products_bought ← ∏<sub>cID,pID,date</sub>(purchase)<br />
				products_on_list ← ∏<sub>cID,pID,date</sub>(shoppinglist)<br />
				products_bought_not_from_list ← products_bought - products_on_list<br />
				bought_not_from_list ← ∏<sub>cID</sub>(products_bought_not_from_list)
			</RA>
			<Par>To find the people who <Em>did</Em> have an item on their shoppinglist, but still bought <Em>more</Em>, we need to compare shopping list quantities with purchase quantities. This can only be done through a join. We don't want to use a natural join, because both relations have a "quantity" attribute, which should certainly <Em>not</Em> be equal. So we join through a Cartesian product, find all matching combinations of (cID, pID, date) and compare the quantities.</Par>
			<RA>
				products_bought_more_than_on_list ← ∏<sub>cID,pID,date</sub>(σ<sub>purchase.cID=shoppinglist.cID ∧ purchase.pID=shoppinglist.pID ∧ purchase.date=shoppinglist.date ∧ purchase.quantity&gt;shoppinglist.quantity</sub>(purchase⨯shoppinglist))<br />
				bought_more_than_on_list ← ∏<sub>cID</sub>(products_bought_more_than_on_list)
			</RA>
			<Par>We could have also immediately used a projection to cID in the above step, but this intermediate relation <IRA>products_bought_more_than_on_list</IRA> may prove to be useful in later exercises.</Par>
			<Par>With our two substeps done, we need to combine the result. We are looking for the people who either bought something not on their shopping list, or who bought more than what was on their list (or both). So we take the union of the two outcomes.</Par>
			<RA>bought_unplanned_products ← bought_not_from_list ∪ bought_more_than_on_list</RA>
			<Par>As final step we join in the customer name.</Par>
			<RA>∏<sub>cID,cName</sub>(bought_unplanned_products ⋈ customer)</RA>
		</>,
	},
	{
		problem: <Par>Find the customers (ID and name) who never bought more of a product on some date than the quantity for that product indicated on their shopping list for that date. You are <Em>not</Em> allowed to assume the product was on their shopping list for the purchase date.</Par>,
		solution: <>
			<Par>This question searches for all the people <Em>except</Em> the people from the previous question. So we take the script from the previous question, and in the end flip the resulting set of customers.</Par>
			<RA>
				products_bought ← ∏<sub>cID,pID,date</sub>(purchase)<br />
				products_on_list ← ∏<sub>cID,pID,date</sub>(shoppinglist)<br />
				products_bought_not_from_list ← products_bought - products_on_list<br />
				bought_not_from_list ← ∏<sub>cID</sub>(products_bought_not_from_list)<br />
				<br />
				products_bought_more_than_on_list ← ∏<sub>cID,pID,date</sub>(σ<sub>purchase.cID=shoppinglist.cID ∧ purchase.pID=shoppinglist.pID ∧ purchase.date=shoppinglist.date ∧ purchase.quantity&gt;shoppinglist.quantity</sub>(purchase⨯shoppinglist))<br />
				bought_more_than_on_list ← ∏<sub>cID</sub>(products_bought_more_than_on_list)<br />
				<br />
				bought_unplanned_products ← bought_not_from_list ∪ bought_more_than_on_list<br />
				never_bought_unplanned_products ← ∏<sub>cID</sub>(customers) - bought_unplanned_products<br />
				∏<sub>cID,cName</sub>(never_bought_unplanned_products ⋈ customer)
			</RA>
		</>,
	},
	{
		problem: <Par>It is May 15, 1891. Gerard Philips (having cID 123456) wants to go shopping in his home city of Eindhoven and creates a shopping list for that date. Find all the stores (ID and name) in Eindhoven that have sufficient stock of everything on the shopping list (on that date).</Par>,
		solution: <>
			<Par>If we would manually run this query, we would iterate over all stores, and then check for each item on Gerard's list whether it is in stock in sufficient quantity. So the entity list is all stores, and the checklist consists of all products on Gerard's shopping list for the given date.</Par>
			<RA>
				all_stores ← ∏<sub>sID</sub>(store)<br />
				list ← ∏<sub>pID,quantity</sub>(σ<sub>cID="123456" ∧ date="1891-05-15"</sub>(shoppinglist))
			</RA>
			<Par>To set up the checklist table, we want to find the products for each store that are in sufficient stock.</Par>
			<RA>sufficient_stock_for_product ← ∏<sub>sID,pID</sub>(σ<sub>inventory.date = date="1891-05-15" ∧ inventory.pID = list.pID ∧ inventory.quantity ≥ list.quantity</sub>(inventory ⨯ list))</RA>
			<Par>Next, we are looking for all stores that have <Em>all</Em> products in sufficient stock. In other words, we are looking for the rows in our checklist table that have all columns checked off. This is actually a problem that can be solved with division!</Par>
			<RA>store_with_sufficient_stock ← sufficient_stock_for_product ÷ ∏<sub>pID</sub>(list)</RA>
			<Par>These are the stores we are looking for. As final step we join in the store name.</Par>
			<RA>∏<sub>sID,sName</sub>(store_with_sufficient_stock ⋈ stores)</RA>
		</>,
	},
	{
		problem: <Par>Find all combinations of customers (ID and name), dates of their shopping lists, and stores (ID and name) in the customer's city that have/had everything on the shopping list available in sufficient quantity on that date.</Par>,
		solution: <>
			<Par>Note that this problem is the same as the previous problem, but then for general customers and dates. For every shopping customer (cID, date) and for every store (sID) we want to check if the given store on the given date held all the products the given customer wanted. So our entities are the combinations (cID, date, sID) and the checks are the respective products (pID) from the relevant list. We first set up the entity lists.</Par>
			<RA>
				all_customers ← ∏<sub>cID,date</sub>(shoppinglist)<br/>
				all_stores ← ∏<sub>sID</sub>(store)<br/>
				all_entities ← all_customers ⨯ all_stores
			</RA>
			<Par>We want to find the combinations of (cID, date, sID, pID) that <Em>can</Em> be bought, because there is a stock of sufficient quantity.</Par>
			<RA>products_sufficiently_available ← ∏<sub>shoppinglist.cID,shoppinglist.date,inventory.sID,shoppinglist.pID</sub>(σ<sub>shoppinglist.date = inventory.date ∧ shoppinglist.pID = inventory.pID ∧ inventory.quantity ≥ shoppinglist.quantity</sub>(shoppinglist ⨯ inventory))</RA>
			<Par>Next, we want to find the combinations of (cID, date, pID) that <Em>should</Em> be bought. That is, they are on the customer's shopping list. This is just the shopping list.</Par>
			<RA>products_on_list ← ∏<sub>cID,date,pID</sub>(shoppinglist)</RA>
			<Par>Contrary to the previous exercise, now the shopping list is different for every entity, since every customer may have a different shopping list on every different day, so we cannot use division. We'll have to manually implement the request conditions.</Par>
			<Par>Next, we want to find the (cID,date,sID) combinations where <Em>all</Em> desired products are available. In other words, it does <Em>not</Em> hold that a product is <Em>not</Em> sufficiently available. A first idea to do so is to take <IRA>products_on_list</IRA> and remove <IRA>products_sufficiently_available</IRA> to find the unavailable products. This does not work, because <IRA>products_on_list</IRA> does not have an attribute sID. However, we want to run this check for <Em>every</Em> store. With this idea, we get the list products that <Em>are</Em> on the list but are <Em>not</Em> available in sufficient quantity, as</Par>
			<RA>products_on_list_but_unavailable ← products_on_list ⨯ all_stores - products_sufficiently_available</RA>
			<Par>We now squash out the pID: the stores (for each customer and date) that have some product insufficiently available are</Par>
			<RA>store_with_product_unavailable ← ∏<sub>cID,date,sID</sub>(products_on_list_but_unavailable)</RA>
			<Par>We want to find the stores (for each customer and date) where there are <Em>no</Em> products insufficiently available, so this is the opposite.</Par>
			<RA>store_with_full_list_available ← all_entities − store_with_product_unavailable</RA>
			<Par>Now we have all combinations of (cID, date, sID) where the store had <Em>all</Em> the products the customer wants on that day available in sufficient quantity.</Par>
			<Par>As final step, we need to filter the stores to those that are in the customer's city. We also have to add in the customer name and the store name. There is a short-cut that does both these things at the same time: the natural join. There is one caveat: the "street" is in both the customer and in the store relation. It would mess up our natural join, so it needs to be removed first. Once we do, the natural join works, and it automatically requires the city to be equal. The final result is</Par>
			<RA>∏<sub>cID,cName,date,sID,sName</sub>(store_with_full_list_available ⋈ ∏<sub>cID,cName,city</sub>(customer) ⋈ ∏<sub>sID,sName,city</sub>(store))</RA>
			<Par>Note that, from a computational point of view, it would have been more efficient to add the requirement that only stores from a customer's own city are suitable already at "products_sufficiently_available". If we made products from a store outside a customer's city unavailable here, it would have saved us to run the checklist for stores which were unsuitable in the first place. It would have also complicated the script though, so for reasons of clarity, this requirement is only implemented at the end.</Par>
		</>,
	},
]
