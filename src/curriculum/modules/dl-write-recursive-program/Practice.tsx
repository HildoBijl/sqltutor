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
		problem: <Par>People who only work at "Human Resources" and/or "Public Relations" do not have the rights to validate transactions: only working at some other department grants that right. Yet it seems that some of them have still done so. Find all transactions that have been validated by a non-authorized person. Then check if there have been products that have been sold at least ten times, one after another, through these suspicious transactions. Make a list of all these products: their name and category.</Par>,
		solution: <>
			<Par>This data request is quite similar to the one from the Theory page. We first define which departments are not authorized to validate transactions. Then we find all the employees who don't work at any other department. (We do assume here that everyone works for at least one department.) We find the matching transactions. With these transactions, we apply recursion in the same way as in the example on the Theory page. Finally, we extract the suspicious products and join in the name and category.</Par>
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
		problem: <Par>Expand the program of the previous exercise: we are now looking for chains of ten suspicious transactions involving eleven <Em>different</Em> people.</Par>,
		solution: <>
			<Par>There are many ways to implement this idea into the recursion rule, and most of them are incorrect. We could try to require that the buyer has not appeared as vendor anywhere in the chain.</Par>
			<DL>{`
suspiciousChain(v, b, p, n, d2) :-
        suspiciousChain(v, x, p, m, d1),
        suspiciousTransaction(x, b, p, d2),
        n = m + 1,
        d1 < d2,
        not suspiciousChain(b, _, p, _, _).
`}</DL>
			<Par>However, this results in a non-stratified program, which is not what we want.</Par>
			<Par>Another option would be to require the buyer to have never sold the product in a suspicious transaction.</Par>
			<DL>{`
suspiciousChain(v, b, p, n, d2) :-
        suspiciousChain(v, x, p, m, d1),
        suspiciousTransaction(x, b, p, d2),
        n = m + 1,
        d1 < d2,
        not suspiciousTransaction(b, _, p, _).
`}</DL>
			<Par>This also doesn't do what we want. After all, if there's a cycle of (let's say) 20 different people, then it now won't appear in the predicate, while it <Em>should</Em> appear in the output.</Par>
			<Par>The key is to first change the <IDL>suspiciousChain</IDL> predicate to also include the <Em>first</Em> date of the chain.</Par>
			<DL>{`
suspiciousChain(v, b, p, 1, d, d) :- suspiciousTransaction(v, b, p, d).
suspiciousChain(v, b, p, n, d0, d2) :-
        suspiciousChain(v, x, p, m, d0, d1),
        suspiciousTransaction(x, b, p, d2),
        n = m + 1,
        d1 < d2.
`}</DL>
			<Par>We then don't change this existing predicate further, but instead we set up a <Em>new</Em> one that builds on top of it. This keeps the program inherently stratified. We check which of the suspicious chains have <Em>equal</Em> people in them. Then we find all <Em>other</Em> chains.</Par>
			<DL>{`
suspiciousChainWithEqualPeople(v, b, p, n, d0, d3) :-
        suspiciousChain(v, b, p, n, d0, d3),
        suspiciousChain(x, x, p, _, d1, d2),
        d0 <= d1,
        d2 <= d3.
suspiciousChainOfAllDifferentPeople(v, b, p, n, d0, d3) :-
        suspiciousChain(v, b, p, n, d0, d3),
        not suspiciousChainWithEqualPeople(v, b, p, n, d0, d3).
`}</DL>
			<Par>The rest of the program stays the same. Plugging in the above rules, we find the following full program.</Par>
			<DL>{`
departmentWithoutAccessName('Human Resources').
departmentWithoutAccessName('Public Relations').
departmentWithoutAccess(id) :- department(id, name, _, _, _), departmentWithoutAccessName(name).
authorizedEmployee(eid) :- allocation(eid, did), not departmentWithoutAccess(did).
suspiciousTransaction(v, b, p, d) :- transaction(_, v, b, p, d, _, e, _), not authorizedEmployee(e).
suspiciousChain(v, b, p, 1, d, d) :- suspiciousTransaction(v, b, p, d).
suspiciousChain(v, b, p, n, d0, d2) :-
        suspiciousChain(v, x, p, m, d0, d1),
        suspiciousTransaction(x, b, p, d2),
        n = m + 1,
        d1 < d2.
suspiciousChainWithEqualPeople(v, b, p, n) :-
        suspiciousChain(v, b, p, n, d0, d3),
        suspiciousChain(x, x, p, _, d1, d2),
        d0 <= d1,
        d2 <= d3.
suspiciousChainOfAllDifferentPeople(v, b, p, n, d0, d1) :-
        suspiciousChain(v, b, p, n, d0, d1),
        not suspiciousChainWithEqualPeople(v, b, p, n, d0, d1).
suspiciousProduct(p) :- suspiciousChainOfAllDifferentPeople(_, _, p, n, _, _), n >= 10.
suspiciousProductData(n, c) :- suspiciousProduct(p), product(p, n, c, _, _, _).
?- suspiciousProductData(name, category).
`}</DL>
		</>,
	},
]
