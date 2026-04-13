import { Page, Section, Par, Term, Em, DL, IDL } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { SQLValleySchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>SQL Valley</Term> database. It contains the following predicates.</Par>
			<SQLValleySchema tables={['departments', 'employees', 'contracts', 'allocations', 'products', 'accounts', 'transactions']} singular />
			<Par>When an exercise says "Find ... " or "Create an overview of ... " then it means "Set up a Datalog rule (or rules) for a new predicate that contains (and only contains) ... ".</Par>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <Par>Find the IDs of the products that have never been sold.</Par>,
		solution: <>
			<Par>The products that have been sold are the ones that are in the transaction predicate. These are</Par>
			<DL>soldProduct(id) :- transaction(_, _, _, id, _, _, _, _).</DL>
			<Par>The products that have not been sold are all registered products <Em>except</Em> the ones in this list.</Par>
			<DL>productNeverSold(id) :-<br/>        product(id, _, _, _, _, _),<br/>        not soldProduct(id).</DL>
			<Par>This could also be squashed into a single rule (not recommended) through</Par>
			<DL>productNeverSold(id) :-<br/>        product(id, _, _, _, _, _),<br/>        not transaction(_, _, _, id, _, _, _, _).</DL>
		</>,
	},
	{
		problem: <Par>Find the first and last name of all employees who have never been on sick leave.</Par>,
		solution: <>
			<Par>The employees who <Em>have</Em> been on sick leave are given by</Par>
			<DL>employeeWithSickLeave(id) :- contract(id, _, _, _, _, _, 'sick leave').</DL>
			<Par>The employees that never had sick leave are then found through</Par>
			<DL>employeeNeverSickLeave(fn, ln) :-<br/>        employee(id, fn, ln, _, _, _, _, _, _),<br/>        not employeeWithSickLeave(id).</DL>
			<Par>This could also be squashed into a single rule (not recommended) through</Par>
			<DL>employeeNeverSickLeave(fn, ln) :-<br/>        employee(id, fn, ln, _, _, _, _, _, _),<br/>        not contract(id, _, _, _, _, _, 'sick leave').</DL>
		</>,
	},
	{
		problem: <Par>Find the email addresses of all users that have never bought or sold any product.</Par>,
		solution: <>
			<Par>We can set up two supporting predicates for users that at some point <Em>did</Em> buy or sell a product.</Par>
			<DL>boughtSomething(b) :- transaction(_, _, b, _, _, _, _, _).<br />soldSomething(v) :- transaction(_, v, _, _, _, _, _, _).</DL>
			<Par>The corresponding email addresses are now found through</Par>
			<DL>inactiveUserEmails(e) :-<br/>        account(id, _, e, _, _, _, _, _, _, _),<br/>        not boughtSomething(id),<br/>        not soldSomething(id).</DL>
			<Par>Note that this gives all the users that both never bought something <Em>and</Em> never sold something, which is what we want.</Par>
			<Par>We can also squash everything into one big rule (not recommended) through</Par>
			<DL>inactiveUserEmails(e) :-<br/>        account(id, _, e, _, _, _, _, _, _, _),<br/>        not transaction(_, _, id, _, _, _, _, _),<br/>        not transaction(_, id, _, _, _, _, _, _, _).</DL>
			<Par>Note that this rule would be a lot harder to understand for an outsider, which is of course not ideal if we want to write clear code.</Par>
		</>,
	},
	{
		problem: <Par>Find the names of all products that have never been sold for less than 1000.</Par>,
		solution: <>
			<Par>The products that <Em>have</Em> been sold for less than 1000 are</Par>
			<DL>cheapProduct(id) :- transaction(_, _, _, id, _, p, _, _), p &lt; 1000.</DL>
			<Par>The products that <Em>have not</Em> been sold are the other ones. Their names are</Par>
			<DL>expensiveProduct(n) :- product(id, n, _, _, _, _), not cheapProduct(id).</DL>
			<Par>We could try to squash this into a single rule. One option would be to use</Par>
			<DL>expensiveProduct(n) :- product(id, n, _, _, _, _), not transaction(_, _, _, id, _, p, _, _), p &lt; 1000.</DL>
			<Par>But this rule would be unsafe! The variable <IDL>p</IDL> is unbound, making the literals in which it occurs ineffective. We'd just get all products!</Par>
			<Par>Interestingly enough, since Datalog doesn't allow for <IDL>not (... and ...)</IDL> our query <Em>cannot</Em> be set up in a single rule. We always need another predicate. But since that's exactly what Datalog is strong at, this is no problem whatsoever.</Par>

		</>,
	},
]
