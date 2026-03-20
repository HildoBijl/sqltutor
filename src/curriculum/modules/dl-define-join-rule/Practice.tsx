import { Page, Section, Par, Term, DL, IDL } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { SQLValleySchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>SQL Valley</Term> database. It contains the following predicates.</Par>
			<SQLValleySchema tables={['departments', 'employees', 'contracts', 'allocations', 'products']} singular />
			<Par>When an exercise says "Find ... " or "Create an overview of ... " then it means "Set up a Datalog rule (or rules) for a new predicate that contains (and only contains) ... ".</Par>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <Par>Find, for every employee (first and last name), which positions they have held throughout their career.</Par>,
		solution: <>
			<Par>The employee's first and last name come from the <IDL>employee</IDL> predicate, while the <IDL>contract</IDL> predicate lists the positions they held. We hence have to join those predicates through the employee ID.</Par>
			<DL>{`
employeePosition(fn, ln, pos) :-
        employee(id, fn, ln, _, _, _, _, _, _),
        contract(id, pos, _, _, _, _, _).`}</DL>
		</>,
	},
	{
		problem: <Par>Find, for every department (its name) with less than 20 employees, in which city the manager is living in.</Par>,
		solution: <>
			<Par>We join the <IDL>department</IDL> predicate with the <IDL>employee</IDL> predicate by setting the manager ID equal to the employee ID. If we also add the respective condition, we wind up with the following rule.</Par>
			<DL>{`
smallDepartmentManagerCity(n, c) :-
        department(_, n, mid, _, ne),
        employee(mid, _, _, _, _, _, c, _, _),
        ne < 20.`}</DL>
			<Par>The order of the literals in the rule formally does not matter, although it is customary to first join (write all predicates) and then filter (add in the conditions).</Par>
		</>,
	},
	{
		problem: <Par>Find, for every employee (first and last name), the name of the department they are allocated to.</Par>,
		solution: <>
			<Par>We need a three-way join for this: we join <IDL>employee</IDL> to <IDL>allocation</IDL> and then again to <IDL>department</IDL>. It is customary to combine both joins into one rule.</Par>
			<DL>{`
employeeDepartment(fn, ln, dn) :-
        employee(eid, fn, ln, _, _, _, _, _, _),
        allocation(eid, did),
        department(did, dn, _, _ , _).`}</DL>
			<Par>It is important to consciously choose variable names to make sure that equal variable names indeed ought to have equal values.</Par>
		</>,
	},
]
