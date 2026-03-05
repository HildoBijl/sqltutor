import { Page, Section, Par, Em, DL, IDL } from '@/components';
import { ManualExerciseSet } from '@/learning/components/SkillPractice';

export function Practice() {
	return <Page>
		<Section>
			<ManualExerciseSet exercises={exercises} />
		</Section>
	</Page>;
}

const exercises = [
	{
		problem: <>
			<Par>Is the following Datalog rule safe? If not, indicate due to which variable(s) and what type of problem will appear.</Par>
			<DL>userThatNeverSold(vendor) :- not transaction(tid, vendor, buyer, pid, date, price, validatedBy, status).</DL>
		</>,
		solution: <>
			<Par>There are no positive literals in this rule, so <Em>all</Em> variables are unbound. We have one variable <IDL>vendor</IDL> that appears in the output, so the output becomes infinitely large.</Par>
			<Par>To fix this (not required for this exercise) we should first of all add a positive literal to bound <IDL>vendor</IDL>. See the next exercise for this idea.</Par>
		</>,
	},
	{
		problem: <>
			<Par>Is the following Datalog rule safe? If not, indicate due to which variable(s) and what type of problem will appear.</Par>
			<DL>userThatNeverSold(vendor) :-<br />        account(vendor, p, e, v, fn, ln, a, c, ca, lla),<br />        not transaction(tid, vendor, buyer, pid, date, price, validatedBy, status).</DL>
		</>,
		solution: <>
			<Par>This rule is not safe. Although <IDL>vendor</IDL> is now bound, other variables like <IDL>tid</IDL> are not. The negative literal in this rule is ineffective.</Par>
			<Par>To fix this (not required for this exercise) we can either turn the unbound variables into anonymous variables, or first apply projection to set up a new predicate <IDL>userThatSold(vendor)</IDL> with only the vendor's username as argument. Both options are used often in practice.</Par>
		</>,
	},
	{
		problem: <>
			<Par>Is the following Datalog rule safe? If not, indicate due to which variable(s) and what type of problem will appear.</Par>
			<DL>buyerOfExpensiveProduct(buyer) :-<br/>        transactions(tid, vendor, buyer, pid, date, price, validatedBy, status),<br/>        price &gt; limit.</DL>
		</>,
		solution: <>
			<Par>This is an unsafe rule: the variable <IDL>limit</IDL> is undefined. It does not appear in the head of the body, so it only makes the comparison literal ineffective. The result is that all transactions are considered "expensive".</Par>
			<Par>To solve this (not required for this exercise) we could either hard-code in the limit like in <IDL>price &gt; 1000</IDL>, or we can define a new predicate <IDL>expensiveProductLimit</IDL> through the fact <IDL>expensiveProductLimit(1000)</IDL> and subsequently use <IDL>price &gt; limit, expensiveProductLimit(limit)</IDL>. The first is easier, but the second option is cleaner.</Par>
		</>,
	},
	{
		problem: <>
			<Par>Is the following Datalog rule safe? If not, indicate due to which variable(s) and what type of problem will appear.</Par>
			<DL>managerContactInfo(dn, fn, ln, p, e) :-<br/>        department(did, dn, mid, b, ne),<br/>        employee(eid, fn, ln, p, e, a, c, hd, cs),<br/>        pid = eid.</DL>
		</>,
		solution: <>
			<Par>If we look closely, we see that there's a variable <IDL>pid</IDL> in the last literal that is not used elsewhere. An equality comparison is not a predicate, so this is already considered unsafe. It will result in the comparison being ineffective, meaning the join isn't properly filtered. The resulting output will have a Cartesian product showing every employee being the manager of every department.</Par>
			<Par>To fix this issue (not required for this exercise) we should simply turn <IDL>pid</IDL> into <IDL>mid</IDL> to fix the typo. (Or better yet, use argument matching to get rid of the equality comparison altogether.)</Par>
		</>,
	},
]
