import { Page, Section, Par, Term, Em, DL, IDL } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { SQLValleySchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>SQL Valley</Term> database. It contains the following predicates.</Par>
			<SQLValleySchema tables={['departments', 'employees', 'contracts', 'allocations', 'accounts', 'products', 'transactions']} singular />
			<Par>When an exercise says "Find ... " or "Create an overview of ... " then it means "Set up a Datalog rule (or rules) for a new predicate that contains (and only contains) ... ".</Par>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <Par>We want to trace product sales. We say that a person A (indirectly) sold a product to a person Z, if there is some chain of people A, B, ..., Y, Z where each person sold <Em>that product</Em> to the next person in the chain. Set up a predicate <IDL>soldProductTo(a, z, p)</IDL> where person A sold some product P (its ID) to some person Z, either directly or indirectly.</Par>,
		solution: <>
			<Par>This exercise is the same as the example from the Theory page, except we need to add an extra parameter for the product. It can be solved through</Par>
			<DL>{`
soldProductTo(v, b, p) :- transaction(_, v, b, p, _, _, _, _).
soldProductTo(v, b, p) :- soldProductTo(v, x, p), transaction(_, x, b, p, _, _, _, _).
`}</DL>
			<Par>Note that, in each <IDL>transaction</IDL> literal, we specify that this exact product must have been sold. This allows us to track the same product as it bounces between owners.</Par>
		</>,
	},
	{
		problem: <Par>Set up a predicate <IDL>soldProductInSteps</IDL>, tracking in how many steps a product has gone from one person to another, by adding a recursion counter to the previous exercise. You may assume there are no cycles: a product was never rebought by a person who at some point sold it.</Par>,
		solution: <>
			<Par>We can add a recursion counter in the usual way.</Par>
			<DL>{`
soldProductInSteps(v, b, p, 1) :- transaction(_, v, b, p, _, _, _, _).
soldProductInSteps(v, b, p, n) :- soldProductInSteps(v, x, p, m), transaction(_, x, b, p, _, _, _, _), n = m + 1.
`}</DL>
		</>,
	},
	{
		problem: <Par>A scary virus has broken out. Set up a predicate <IDL>potentiallyInfectedBy(a, z)</IDL> that shows whether or not person A potentially got infected by person Z. A person got potentially infected by a person if they bought something from that person. (And subsequently received their order via our dedicated courier.) A person can also potentially get infected by another person, if there's some chain of people A, B, ..., Y, Z where each person bought something from the next person in the list. Also note that a person can in theory infect themselves (if they picked it up in a different way than through a product sale) so the output should also contain every person coupled with themselves. </Par>,
		solution: <>
			<Par>This problem is nearly the same as that of the example on the Theory page, but then with the vendor and buyer flipped around. So you would think you could solve it through</Par>
			<DL>{`
potentiallyInfectedBy(b, v) :- transaction(_, v, b, _, _, _, _, _).
potentiallyInfectedBy(b, v) :- potentiallyInfectedBy(b, x), transaction(_, v, x, _, _, _ ,_ ,_).
`}</DL>
			<Par>However, this does not include people coupled with themselves. One solution to this issue is to add a rule specifically for that.</Par>
			<DL>potentiallyInfectedBy(x, x) :- accounts(x, _, _, _, _, _, _, _, _, _).</DL>
			<Par>This would work, but now we have three rules. It can be shorter. In fact, this final rule also serves as base case! If we use it, we can get rid of our previous base case. So the following rules alone would also suffice as solution.</Par>
			<DL>{`
potentiallyInfectedBy(x, x) :- account(x, _, _, _, _, _, _, _, _, _).
potentiallyInfectedBy(b, v) :- potentiallyInfectedBy(b, x), transaction(_, v, x, _, _, _ ,_ ,_).
`}</DL>
			<Par>Note that this base case is still sufficient to get the recursion up and running.</Par>
		</>,
	},
	{
		problem: <Par>We say that two employees A and B "know each other" if they work in the same department. Two employees A and Z are "connected" if there's some list of people A, B, ..., Y, Z where each person in the list "knows" the next one. Set up a predicate <IDL>areConnected(a, z)</IDL> that shows which employees are connected to each other. (You would hope everyone in the company is connected to each other, but maybe that's not the case.)</Par>,
		solution: <>
			<Par>To solve this, we first have to set up the predicate <IDL>knowsEachOther</IDL>. This is true when the two people are allocated to the same department.</Par>
			<DL>{`
knowsEachOther(a, b) :- allocation(a, d), allocation(b, d).
`}</DL>
			<Par>We use this to recursively define <IDL>areConnected</IDL>. Setting up the base case rule and the recursion rule, we obtain</Par>
			<DL>{`
areConnected(a, b) :- knowsEachOther(a, b).
areConnected(a, b) :- areConnected(a, x), knowsEachOther(x, b).
`}</DL>
		</>,
	},
	{
		problem: <>
		<Par>Let's expand the <IDL>receivedMoneyFrom</IDL> predicate from the Theory page. Earlier, we said that a person A received money from a person Z, if there is a chain of people A, B, ..., Y, Z such that A sold something to B, B sold something to C, etcetera. We now add the requirement that each transaction must be <Em>after</Em> the previous one. So the moment A sold something to B must be <Em>later</Em> than the moment B sold something to C, etcetera.</Par>
		<Par>Set up a recursive predicate <IDL>receivedMoneyFrom(a, z, lastTransactionAt)</IDL> where A received money from Z, subject to this new date-requirement, and where the last transaction (of A receiving money from B) was at the given <IDL>lastTransactionAt</IDL> date.</Par>
		</>,
		solution: <>
			<Par>We start with the base rule. As date we apply the transaction date.</Par>
			<DL>{`
receivedMoneyFrom(v, b, d) :- transaction(_, v, b, _, d, _, _, _).
`}</DL>
			<Par>We now add the recursion rule. Note that the date of the final transaction step should be later than the date of the step before it.</Par>
			<DL>{`
receivedMoneyFrom(v, b, d2) :- receivedMoneyFrom(x, b, d1), transaction(_, v, x, _, d2, _, _, _), d2 > d1.
`}</DL>
			<Par>This updates the date through the recursion.</Par>
		</>,
	},
	{
		problem: <Par>Consider the previous Exercise. Add a recursion counter to it, to count the number of steps. Also determine whether or not this recursion counter works in case of cycles.</Par>,
		solution: <>
			<Par>We add a recursion counter in the usual way to both rules.</Par>
			<DL>{`
receivedMoneyFrom(v, b, d, 1) :- transaction(_, v, b, _, d, _, _, _).
receivedMoneyFrom(v, b, d2, n) :- receivedMoneyFrom(x, b, d1, m), transaction(_, v, x, _, d2, _, _, _), d2 > d1, n = m + 1.
`}</DL>
			<Par>Interestingly enough, because every chain is a series of transactions of <Em>increasing</Em> date, there <Em>can</Em> never be cycles. It is simply impossible to have a cycle of transactions where each transaction in the cycle is later than the next one. So we have found a practical way of getting around the issue that cycles cause Datalog queries to have infinitely large outputs.</Par>
		</>,
	},
]
