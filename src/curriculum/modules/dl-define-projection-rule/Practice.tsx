import { Page, Section, Par, Term, DL, IDL } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

import { SQLValleySchema } from '../../utils';

export function Practice() {
	return <Page>
		<Section>
			<Par>The following exercises use the <Term>SQL Valley</Term> database. It is defined by the following schema.</Par>
			<SQLValleySchema tables={['departments', 'employees', 'products']} singular />
			<Par>When an exercise says "Find ... " or "Create an overview of ... " then it means "Set up a rule (or rules) for a predicate that contains (and only contains) ... ".</Par>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <Par>Create an overview of employee contact info: the first and last name, phone number and email address of all employees.</Par>,
		solution: <>
			<Par>We take the <IDL>employee</IDL> predicate and extract the contact info arguments. This can be done through</Par>
			<DL>employeeContactInfo(fn, ln, p, e) :- employee(id, fn, ln, p, e, a, c, hd, cs).</DL>
			<Par>Cleaner would be to use anonymous variables. We then get</Par>
			<DL>employeeContactInfo(fn, ln, p, e) :- employee(_, fn, ln, p, e, _, _, _, _).</DL>
		</>,
	},
	{
		problem: <Par>Create an overview of the budget for each department (by name).</Par>,
		solution: <>
			<Par>We take the <IDL>department</IDL> predicate and extract the name and budget arguments. This gives</Par>
			<DL>departmentBudget(n, b) :- department(_, n, _, b, _).</DL>
		</>,
	},
	{
		problem: <Par>Create an overview of the category which each product (by name) corresponds to.</Par>,
		solution: <>
			<Par>We take the <IDL>product</IDL> predicate and extract the name and category of each product. This gives</Par>
			<DL>productCategory(n, c) :- product(_, n, c, _, _, _).</DL>
		</>,
	},
]
