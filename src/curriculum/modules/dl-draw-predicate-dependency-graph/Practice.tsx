import { Page, Section, Par, List, DL, IDL } from '@/components';
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
			<Par>Draw a dependency graph for the following Datalog program.</Par>
			<DL>{`
C(x) :- A(x), B(x).
D(x) :- B(x).
E(x) :- A(x), D(x).
F(x) :- C(x), E(x).
`}</DL>
		</>,
		solution: <>
			<Par>This program has no cycles.</Par>
			<List items={[
				<>Layer 0 has <IDL>A</IDL> and <IDL>B</IDL>.</>,
				<>Layer 1 has <IDL>C</IDL> and <IDL>D</IDL>.</>,
				<>Layer 2 has <IDL>E</IDL>.</>,
				<>Layer 3 has <IDL>F</IDL>.</>,
			]} />
		</>,
	},
	{
		problem: <>
			<Par>Draw a dependency graph for the following Datalog program.</Par>
			<DL>{`
C(x) :- A(x).
C(x) :- C(x), A(x).
D(x) :- B(x), F(x).
E(x) :- D(x), A(x).
F(x) :- E(x), C(x).
G(x) :- C(x), E(x).
`}</DL>
		</>,
		solution: <>
			<Par>This program has two cycles.</Par>
			<List items={[
				<><IDL>C</IDL> refers to itself, so the final graph should have an arrow from <IDL>C</IDL> to itself.</>,
				<><IDL>(D,E,F)</IDL> is a strongly connected component, so it should be merged into a single node.</>,
			]} />
			<Par>This results in the following layers.</Par>
			<List items={[
				<>Layer 0 has <IDL>A</IDL> and <IDL>B</IDL>.</>,
				<>Layer 1 has <IDL>C</IDL>.</>,
				<>Layer 2 has <IDL>(D,E,F)</IDL>.</>,
				<>Layer 3 has <IDL>G</IDL>.</>,
			]} />
		</>,
	},
	{
		problem: <>
			<Par>Draw a dependency graph for the following Datalog program.</Par>
			<DL>{`
C(x) :- A(x), D(x).
D(x) :- B(x), C(x).
E(x) :- D(x), F(x).
F(x) :- C(x), E(x).
G(x) :- C(x), F(x).
`}</DL>
		</>,
		solution: <>
			<Par>This program has two cycles that should be collapsed into single nodes.</Par>
			<List items={[
				<><IDL>(C,D)</IDL> is a strongly connected component.</>,
				<><IDL>(E,F)</IDL> is a strongly connected component.</>,
			]} />
			<Par>This results in the following layers.</Par>
			<List items={[
				<>Layer 0 has <IDL>A</IDL> and <IDL>B</IDL>.</>,
				<>Layer 1 has <IDL>(C,D)</IDL>.</>,
				<>Layer 2 has <IDL>(E,F)</IDL>.</>,
				<>Layer 3 has <IDL>G</IDL>.</>,
			]} />
		</>,
	},
	{
		problem: <>
			<Par>Draw a dependency graph for the following Datalog program.</Par>
			<DL>{`
C(x) :- A(x), D(x).
D(x) :- E(x).
E(x) :- C(x), F(x).
F(x) :- B(x), G(x).
G(x) :- E(x).
H(x) :- D(x), G(x).
`}</DL>
		</>,
		solution: <>
			<Par>It may initially look like there are two cycles <IDL>(C,D,E)</IDL> and <IDL>(E,F,G)</IDL>. However, since <IDL>E</IDL> is a part of both cycles, the whole set <IDL>(C,D,E,F,G)</IDL> is a strongly connected component. It should be collapsed into a single node. That results in the following layers.</Par>
			<List items={[
				<>Layer 0 has <IDL>A</IDL> and <IDL>B</IDL>.</>,
				<>Layer 1 has <IDL>(C,D,E,F,G)</IDL>.</>,
				<>Layer 2 has <IDL>H</IDL>.</>,
			]} />
		</>,
	},
]
