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
		problem: <>
			<Par>Most employees are allocated to multiple departments. We say that two employees are "well acquainted" if they have at least two departments in common. We say that two people A and Z are in the "same network" if there is a list of employees A, B, ..., Y, Z such that every person in the list is well acquainted with the next person in the list.</Par>
			<Par>Find all pairs of people that are in the same network, but do not have a department in common. Give their first name and last name.</Par>
		</>,
		solution: <>
			<Par>The plan is to first find which people are well acquainted. We then use this to recursively find which people are in the same network. We filter out the people that have a department in common. Finally we find the names of these employees.</Par>
			<DL>{`
oneDepartmentInCommon(a, b) :- allocation(a, d), allocation(b, d), a != b.
twoDepartmentsInCommon(a, b) :- allocation(a, d1), allocation(a, d2), allocation(b, d1), allocation(b, d2), a != b, d1 != d2.
wellAcquainted(a, b) :- twoDepartmentsInCommon(a, b).
sameNetwork(a, b) :- wellAcquainted(a, b).
sameNetwork(a, b) :- sameNetwork(a, x), wellAcquainted(x, b).
requestedPeople(a, b) :- sameNetwork(a, b), not oneDepartmentInCommon(a, b).
requestedPeopleNames(afn, aln, bfn, bln) :- requestedPeople(a, b), employee(a, afn, aln, _, _, _, _, _, _), employee(b, bfn, bln, _, _, _, _, _, _).
?- requestedPeopleNames(firstNameA, lastNameA, firstNameB, lastNameB).
`}</DL>
		</>,
	},
	{
		problem: <>
			<Par>Use the same definitions of the previous exercise. Find all departments where none of the employees are well acquainted, but some of them nevertheless are in the same network. For each department, give the department name, and the IDs of the two employees that are in the same network.</Par>
		</>,
		solution: <>
			<Par>The starting point is the same as in the previous exercise: we find which employees are well acquainted, and which employees are in the same network. Then we find departments that meet the requirements, and include the employee data too. Finally we join in the department name.</Par>
			<DL>{`
wellAcquainted(a, b) :- allocation(a, d1), allocation(a, d2), allocation(b, d1), allocation(b, d2), a != b, d1 != d2.
sameNetwork(a, b) :- wellAcquainted(a, b).
sameNetwork(a, b) :- sameNetwork(a, x), wellAcquainted(x, b), a != b.
departmentWithWellAcquaintedEmployees(d) :- allocation(a, d), allocation(b, d), wellAcquainted(a, b).
departmentWithNoWellAcquaintedEmployees(d) :- department(d, _, _, _, _), not departmentWithWellAcquaintedEmployees(d).
requestedDepartmentAndPeople(d, a, b) :- departmentWithNoWellAcquaintedEmployees(d), allocation(a, d), allocation(b, d), sameNetwork(a, b).
requestedDepartmentAndPeopleWithName(n, a, b) :- requestedDepartmentAndPeople(d, a, b), department(d, n, _, _, _).
?- requestedDepartmentAndPeopleWithName(departmentName, employeeA, employeeB).
`}</DL>
			<Par>It's important to make sure that the requested people don't have an entry of a person with themselves. In the above example, we made sure that <IDL>sameNetwork</IDL> didn't have a person with themselves. This requirement can also be implemented later on, if desired.</Par>
		</>,
	},
	{
		problem: <Par>People who only work at "Human Resources" and/or "Public Relations" are not authorized to validate transactions: only those working at some other department are authorized. (People working at both HR and another department <Em>are</Em> authorized.) Find all transactions that have been validated by a non-authorized person. Then check, for those transactions, if there have been products that have been sold at least ten times, one after another, through these suspicious transactions, where each buyer subsequently functioned as vendor. Make a list of all these products: their name and category. (You may assume that a product's transaction dates are all different: no product is ever sold and then instantly resold.)</Par>,
		solution: <>
			<Par>This data request is quite similar to the one from the Theory page. We first define which departments are not authorized to validate transactions. Then we find all the employees who work at a department that is not in this list. We find the matching transactions. With these suspicious transactions, we apply recursion in the same way as in the example on the Theory page. Finally, we extract the suspicious products and join in the name and category.</Par>
			<DL>{`
departmentWithoutAccessName('Human Resources').
departmentWithoutAccessName('Public Relations').
departmentWithoutAccess(id) :- department(id, name, _, _, _), departmentWithoutAccessName(name).
authorizedEmployee(eid) :- allocation(eid, did), not departmentWithoutAccess(did).
suspiciousTransaction(v, b, p, d) :- transaction(_, v, b, p, d, _, e, _), not authorizedEmployee(e).
suspiciousChain(v, b, p, 1, d) :- suspiciousTransaction(v, b, p, d).
suspiciousChain(v, b, p, n, d2) :-
        suspiciousChain(v, x, p, m, d1),
        suspiciousTransaction(x, b, p, d2),
        n = m + 1,
        d1 < d2.
suspiciousProduct(p) :- suspiciousChain(_, _, p, n, _), n >= 10.
suspiciousProductData(n, c) :- suspiciousProduct(p), product(p, n, c, _, _, _).
?- suspiciousProductData(name, category).
`}</DL>
		</>,
	},
	{
		problem: <Par>Expand the program of the previous exercise: create (for the suspicious transactions) an overview of all the chains, including the product's ID, the chain's first vendor (username), the chain's last buyer (username), and the number of transactions within the chain. Make sure this overview only contains endpoints: we for example don't want to include a user as "last buyer" if this person subsequently sold the product on again.</Par>,
		solution: <>
			<Par>We now have to track, within the recursion, the data about the users involved within the transactions. The best idea to tackle this is to simply track the first and last transaction of a chain. After all, using those transaction IDs, we can always join in any other data that we need later on.</Par>
			<Par>First, we copy the code from the previous exercise to get the suspicious transactions. We only keep the transaction IDs, to simplify our further process.</Par>
			<DL>{`
departmentWithoutAccessName('Human Resources').
departmentWithoutAccessName('Public Relations').
departmentWithoutAccess(id) :- department(id, name, _, _, _), departmentWithoutAccessName(name).
authorizedEmployee(eid) :- allocation(eid, did), not departmentWithoutAccess(did).
suspiciousTransaction(id) :- transaction(id, _, _, _, _, _, e, _), not authorizedEmployee(e).
`}</DL>
			<Par>We now set up chains of these transactions. For each chain, we track the first transaction, the last transaction, and the number of steps. In the recursion rule, we then try to add a new transaction to a chain.</Par>
			<DL>{`
suspiciousChain(p, t, t, 1) :- suspiciousTransaction(t), transaction(t, _, _, p, _, _, _, _).
suspiciousChain(p, ft, nt, n) :-
        suspiciousChain(ft, lt, m),
        suspiciousTransaction(nt),
        transaction(lt, _, u, p, ld, _, _, _),
        transaction(nt, u, _, p, nd, _, _, _),
        ld < nd,
        n = m + 1.
`}</DL>
			<Par>Note that we require the new transaction to also be suspicious, to be for the same product, and to have a later date, and to have a user who first acts as buyer and then as vendor.</Par>
			<Par>The next challenge is to find the endpoints of each chain. We filter the chains, keeping those with no further link in either direction. You may think this would work:</Par>
			<DL>{`
fullSuspiciousChain(p, ft, lt, n) :-
        suspiciousChain(p, ft, lt, n),
        not suspiciousChain(p, _, ft, _),
        not suspiciousChain(p, lt, _, _).
`}</DL>
			<Par>However, the chains we are comparing can have the same transaction as start and end, so that fails. We could try to require the transactions to be different?</Par>
			<DL>{`
fullSuspiciousChain(p, ft, lt, n) :-
        suspiciousChain(p, ft, lt, n),
        not suspiciousChain(p, x, ft, _),
        x != ft,
        not suspiciousChain(p, lt, y, _),
        lt != y.
`}</DL>
			<Par>This also fails, because the rule is unsafe: both <IDL>x</IDL> and <IDL>y</IDL> are unbound, making our negative literals ineffective. Instead, the solution is to find all chains with multiple transactions first.</Par>
			<DL>{`
suspiciousMultiStepChain(p, ft, lt, n) :- suspiciousChain(p, ft, lt, n), n >= 2.
fullSuspiciousChain(p, ft, lt, n) :-
        suspiciousChain(p, ft, lt, n),
        not suspiciousMultiStepChain(p, _, ft, _),
        not suspiciousMultiStepChain(p, lt, _, _).
`}</DL>
			<Par>Now it works as intended!</Par>
			<Par>Now that we obtained all the full chains, we will join in the data from the first vendor and the last buyer. We then output this.</Par>
			<DL>{`
fullSuspiciousChainWithUsers(p, v, b, n) :-
        fullSuspiciousChain(p, ft, lt, n),
        transaction(ft, v, _, _, _, _, _, _),
        transaction(lt, _, b, _, _, _, _, _).
?- fullSuspiciousChainWithUsers(product, firstVendor, lastBuyer, numSteps).
`}</DL>
			<Par>And with that we are done!</Par>
		</>,
	},
	{
		problem: <Par>Expand the program of the previous exercise: we are now looking for the full chains in which the product at the end ended back up at the first person who sold it, while <Em>every</Em> person in the chain was a different person. Output the prodict ID, the user's username and the number of steps in the (circular) chain.</Par>,
		solution: <>
			<Par>There are two requirements: we want all buyers (or equivalently all vendors) in the chain to be different, but the first vendor must equal the last buyer. The first requirement is the hardest. It has an "every" statement, so we first do the opposite: we find all full chains where there are two transactions with the same buyer. For this, we keep the definitions from before, and we make nice use of the original <IDL>suspiciousChain</IDL> predicate that we set up. We use it to find two transactions within the chain that have the same vendor.</Par>
			<DL>{`
fullSuspiciousChainWithDoubleVendor(p, ft, lt, n) :-
        fullSuspiciousChain(p, ft, lt, n),
        suspiciousChain(p, ft, tx, _),
        suspiciousChain(p, tx, ty, _),
        suspiciousChain(p, ty, lt, _),
        tx != ty,
        transaction(tx, v, _, _, _, _, _, _),
        transaction(ty, v, _, _, _, _, _, _).
`}</DL>
			<Par>Now we have filtered out the chains that <Em>do</Em> have a double vendor. We want all other chains, and then only the chains with equal first buyer and last vendor. This is done through the following query.</Par>
			<DL>{`
fullCircularSuspiciousChain(p, ft, lt, n) :-
        fullSuspiciousChain(p, ft, lt, n),
        not fullSuspiciousChainWithDoubleVendor(p, ft, lt, n),
        transaction(ft, u, _, _, _, _, _, _),
        transaction(lt, _, u, _, _, _, _, _).
        `}</DL>
			<Par>With that, we have filtered out all the unwanted chains, leaving us with the correct ones. As final step, we join in the requested data again, identically to how we did that last time, except that now we only have one user to display. (We could've done that in the previous step already, but keeping it separate is clearer.)</Par>
			<DL>{`
fullCircularSuspiciousChainWithUser(p, u, n) :-
        fullCircularSuspiciousChain(p, ft, lt, n),
        transaction(ft, u, _, _, _, _, _, _).
?- fullCircularSuspiciousChainWithUser(product, user, numSteps).
`}</DL>
			<Par>With that, we have found all full cycles of suspicious transactions.</Par>
		</>,
	},
]
