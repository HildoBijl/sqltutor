import { Page, Section, Par, Term, Em, DL, IDL } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { SQLValleySchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>SQL Valley</Term> database. It contains the following predicates.</Par>
			<SQLValleySchema tables={['departments', 'employees', 'contracts', 'allocations', 'products', 'accounts', 'transactions']} singular />
			<Par>When an exercise says "Find ... " or "Create an overview of ... " then it means "Set up a Datalog program (including query) that outputs (and only outputs) ... ".</Par>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <Par>Find the first and last name of all employees that validated the transaction of a 'Fine Art' product.</Par>,
		solution: <>
			<Par>We first find all Fine Art products. Then we find the people validating their transactions. Finally we add in the first and last name and query this result.</Par>
			<DL>{`
fineArtProduct(pid) :- product(pid, _, 'Fine Art', _, _, _).
validatedFineArtSale(eid) :- transaction(_, _, _, pid, _, _, eid, _), fineArtProduct(pid).
validatedFineArtSaleName(fn, ln) :- employee(eid, fn, ln, _, _, _, _, _, _), validatedFineArtSale(eid).
?- validatedFineArtSaleName(firstName, lastName).
`}</DL>
		</>,
	},
	{
		problem: <Par>Find the email address of all employees that <Em>never</Em> validated a fine art sale, but <Em>have</Em> been on sick leave at some point.</Par>,
		solution: <>
			<Par>We have two somewhat random separate conditions. To deal with this, we define separate predicates for the employees that have validated a fine art sale and for those that have been on sick leave. Then we combine these lists.</Par>
			<DL>{`
fineArtProduct(pid) :- product(pid, _, 'Fine Art', _, _, _).
validatedFineArtSale(eid) :- transaction(_, _, _, pid, _, _, eid, _), fineArtProduct(pid).
beenOnSickLeave(eid) :- contract(eid, _, _, _, _, _, 'sick leave').
requestedEmailAddress(e) :-
        employee(eid, _, _, _, e, _, _, _, _),
        not validatedFineArtSale(eid),
        beenOnSickLeave(eid).
?- requestedEmailAddress(email).
`}</DL>
			<Par>Note that we could have also merged the conditions together in a separate predicate <IDL>meetsAllConditions(eid)</IDL> first, before combining it with the <IDL>employee</IDL> predicate. Some would find it clearer, while others would not. It's a personal preference.</Par>
		</>,
	},
	{
		problem: <Par>Find the users (their usernames) who bought a product from <Em>every</Em> category of products that exists in the <IDL>product</IDL> predicate.</Par>,
		solution: <>
			<Par>This is a universal condition query, so we should rephrase the request using a double negative. We want to find the users for which there does not exist a category they have not bought a product in.</Par>
			<Par>On top of this, it would really help if we'd have an overview of which user bought from which category. Starting with that, and then comparing it with the available categories, we get the following script.</Par>
			<DL>{`
boughtFromCategory(u, c) :- transaction(_, _, u, pid, _, _, _, _), product(pid, _, c, _, _, _).
productCategory(c) :- product(_, _, c, _, _, ).
username(u) :- account(u, _, _, _, _, _, _, _ ,_ ,_).
didNotBuyFromCategory(u, c) :- username(u), category(c), not boughtFromCategory(u, c).
didNotBuyFromSomeCategory(u) :- didNotBuyFromCategory(u, _).
boughtFromAllCategories(u) :- username(u), not didNotBuyFromSomeCategory(u).
?- boughtFromAllCategories(u).
`}</DL>
			<Par>Note that we could have shortened the script a bit by removing <IDL>didNotBuyFromCategory</IDL>. We could have merged those two lines into one. However, splitting it up for now helps you to see what is happening.</Par>
		</>,
	},
	{
		problem: <Par>Find the IDs of the employees who have validated a transaction for <Em>all</Em> users (either as vendor or buyer).</Par>,
		solution: <>
			<Par>This is once more a universal condition query. We rephrase it using a double negative. We want to find the employees for which there does not exist a user which they have not validated a transaction for.</Par>
			<Par>To find this, it would help to have a list of all users, a list of all employees, and a list of which employee validated a transaction for which user. From that, we get the following program.</Par>
			<DL>{`
username(u) :- account(u, _, _, _, _, _, _, _ ,_ ,_).
employeeId(eid) :- employee(eid, _, _, _, _, _, _, _, _).
validatedUser(eid, u) :- transaction(_, u, _, _, _, _, eid, _).
validatedUser(eid, u) :- transaction(_, _, u, _, _, _, eid, _).
didNotValidateSomeUser(eid) :- employeeId(eid), username(u), not validatedUser(eid, u).
validatedAllUsers(eid) :- employeeId(eid), not didNotValidateSomeUser(eid).
?- validatedAllUsers(eid).
`}</DL>
			<Par>If further data is required from this employee, we could of course also join that in at the end.</Par>
		</>,
	},
	{
		problem: <Par>Find the IDs of the employees who <Em>only</Em> validated transactions from users (vendors and buyers) from their <Em>own</Em> city. (That is, the employee and the respective user must live in the same city.)</Par>,
		solution: <>
			<Par>We'll have to rephrase this request: we want to find the employees for which there does <Em>not</Em> exist a user they validated a transaction for who lives in a <Em>different</Em> city. To do this, we first do the opposite: we find the employees who <Em>did</Em> validate a transaction for a user outside their own city. Then we flip the result. This gives the following program.</Par>
			<DL>{`
validatedUser(eid, u) :- transaction(_, u, _, _, _, _, eid, _).
validatedUser(eid, u) :- transaction(_, _, u, _, _, _, eid, _).
validatedUserFromDifferentCity(eid) :-
        validatedUser(eid, u), 
        employee(eid, _, _, _, _, _, ec, _, _),
        account(u, _, _, _, _, _, _, uc, _, _),
        ec != uc.
onlyValidatedFromOwnCity(eid) :-
        employee(eid, _, _, _, _, _, _, _, _),
        not validatedUserFromDifferentCity(eid).
?- onlyValidatedFromOwnCity(eid).
`}</DL>
			<Par>If further data is required from this employee, we could of course also join that in at the end.</Par>
		</>,
	},
	{
		problem: <Par>Find the IDs of the employees who have validated a transaction from <Em>all</Em> users from their <Em>own</Em> city.</Par>,
		solution: <>
			<Par>This is a universal condition request, except now the set of users we have to check varies per employee. To solve this request, we rephrase it using a double negative. We want to find all employees for which there is no user in their own city they have not validated a transaction of.</Par>
			<Par>To set up the program, it helps to create two overviews: which employee verified a transaction from which user? And which employee lives in the same city as which user? Once we have these predicates, we can combine them to get the desired result.</Par>
			<DL>{`
validatedUser(eid, u) :- transaction(_, u, _, _, _, _, eid, _).
validatedUser(eid, u) :- transaction(_, _, u, _, _, _, eid, _).
livesInSameCity(eid, u) :- employee(eid, _, _, _, _, _, c, _, _), account(u, _, _, _, _, _, _, c, _, _).
didNotValidateUserFromOwnCity(eid) :- livesInSameCity(eid, u), not validatedUser(eid, u).
validatedAllUsersFromOwnCity(eid) :- employee(eid, _, _, _, _, _, _, _, _), not didNotValidateUserFromOwnCity(eid).
?- validatedAllUsersFromOwnCity(eid).
`}</DL>
		</>,
	},
]
