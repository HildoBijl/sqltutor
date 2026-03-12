import { Page, Section, Par, List, Em, DL, IDL } from '@/components';
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
			<Par>Indicate whether the following Datalog program is positive, semi-positive and/or stratified. Briefly indicate why.</Par>
			<DL>{`
C(x) :- A(x), not D(x).
D(x) :- not A(x), B(x).
`}</DL>
		</>,
		solution: <>
			<List items={[
				<>The program is not positive: there are negations.</>,
				<>The program is not semi-positive: there is a negation <IDL>not D</IDL> in the program, while <IDL>D</IDL> also has a rule defined for it.</>,
				<>The program is stratified: there are no cycles, so there are definitely no cycles with negation.</>,
			]} />
		</>,
	},
	{
		problem: <>
			<Par>Indicate whether the following Datalog program is positive, semi-positive and/or stratified. Briefly indicate why.</Par>
			<DL>{`
B(x) :- A(x), C(x).
C(x) :- A(x), D(x).
D(x) :- A(x), not B(x).
`}</DL>
		</>,
		solution: <>
			<List items={[
				<>The program is not positive: there are negations.</>,
				<>The program is not semi-positive: there is a negation <IDL>not B</IDL> in the program, while <IDL>B</IDL> also has a rule defined for it.</>,
				<>The program is not stratified: there is a cycle <IDL>(B,C,D)</IDL> where the dependency of <IDL>D</IDL> on <IDL>B</IDL> is negative.</>,
			]} />
		</>,
	},
	{
		problem: <>
			<Par>Indicate whether the following Datalog program is positive, semi-positive and/or stratified. Briefly indicate why.</Par>
			<DL>{`
C(x) :- not A(x), E(x).
D(x) :- A(x), not B(x), C(x).
E(x) :- D(x).
`}</DL>
		</>,
		solution: <>
			<List items={[
				<>The program is not positive: there are negations.</>,
				<>The program is semi-positive: the only negations that appear are for <IDL>A</IDL> and <IDL>B</IDL>, and both are EDBs.</>,
				<>The program is stratified: there is a cycle <IDL>(C,D,E)</IDL> but all dependencies in this cycle are positive. (And the program was already semi-positive, so then it's always stratified.)</>,
			]} />
		</>,
	},
	{
		problem: <>
			<Par>Indicate whether the following Datalog program is positive, semi-positive and/or stratified. Briefly indicate why.</Par>
			<DL>{`
C(x) :- A(x), D(x).
D(x) :- not B(x), C(x).
E(x) :- not A(x), D(x).
F(x) :- B(x), not C(x).
G(x) :- A(x), B(x), not D(x), not F(x).
`}</DL>
		</>,
		solution: <>
			<List items={[
				<>The program is not positive: there are negations.</>,
				<>The program is not semi-positive: the negations <IDL>not C</IDL>, <IDL>not D</IDL> and <IDL>not F</IDL> all violate the requirements.</>,
				<>The program is stratified: there are two cycles <IDL>(C,D)</IDL> and <IDL>(E,F)</IDL> but within these cycles all dependencies are positive. Only <Em>between</Em> these cycles are there various negative dependencies, but those do not violate the requirements for the program to be stratified. We can first safely evaluate <IDL>(C,D)</IDL>, then evaluate <IDL>(E,F)</IDL> and finally evaluate <IDL>G</IDL>.</>,
			]} />
		</>,
	},
]
