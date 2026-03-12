import { Page, Section, Par, Quote, List, Info, Warning, Em, Term, DL, IDL } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
	return <Page>
		<Section>
			<Par>We know that a recursive query always consists of two parts: initialization and recursion. Let's see how we can implement this idea in Datalog.</Par>
		</Section>

		<Section title="Step 1: define a rule for the base case">
			<Par>Suppose that, from a list of transactions, we want to see who received money from whom, either directly or indirectly. We can set up a predicate to show this, but this predicate requires recursion. We call it a <Term>recursive predicate</Term>.</Par>
			<Par>The first step in implementing recursion is always to define the <Term>base case rule</Term>. We can set up a predicate containing all pairs of people who <Em>definitely</Em> exchanged money, due to the simple fact that one sold a product to another.</Par>
			<FigureExampleDLQuery query={<>receivedMoneyFrom(v, b) :- transaction(_, v, b, _, _, _, _, _).</>} actualQuery="SELECT DISTINCT vendor, buyer FROM transactions" tableWidth={260} />
			<Par>You can read this rule in normal language as follows.</Par>
			<Quote>We say that v received money from b, if there is some transaction where v functioned as vendor (second argument) and b functioned as buyer (third argument).</Quote>
		</Section>

		<Section title="Step 2: define a rule for the recursion">
			<Par>The second step in implementing recursion is to <Em>extend</Em> the predicate with a second rule: the <Term>recursion rule</Term>. In natural language, we would define it through:</Par>
			<Quote>We also say that v received money from b, if there is some other person x for which v received money from x and x sold something to b.</Quote>
			<Par>This second rule for the <IDL>receivedMoneyFrom</IDL> predicate refers to <Em>itself</Em>. We can set it up in Datalog, adding it to the previous rule.</Par>
			<FigureExampleDLQuery query={<>receivedMoneyFrom(v, b) :- transaction(_, v, b, _, _, _, _, _).<br />receivedMoneyFrom(v, b) :- receivedMoneyFrom(v, x), transaction(_, x, b, _, _, _, _, _).</>} actualQuery={`WITH RECURSIVE vendor_chain AS (
    SELECT vendor, buyer
    FROM transactions
    UNION
    SELECT c.vendor, t.buyer
    FROM transactions t
    JOIN vendor_chain c ON c.buyer = t.vendor
)
SELECT * FROM vendor_chain;`} tableWidth={260} />
			<Par>And that's all there is to it! By seeing that a predicate's rule refers to itself – there is a so-called <Term>cycle</Term> – Datalog will know it has to apply the fixed-point algorithm. It will continue to search until it has found all relevant cases.</Par>
			<Warning>Don't forget the base case! If you never defined a base case, then initially <IDL>receivedMoneyFrom</IDL> will be empty, and the iteration never starts up. You'll end up with an empty predicate!</Warning>
			<Info>
				<Par sx={{ mb: 0.5 }}>There are four ways in which people often try to set up the recursion rule, and only two of them are proper. It's important to use the correct one.</Par>
				<List items={[
					<>
						<Par>Use the <Em>original predicate twice</Em>. This fails, because there is no recursion: you only get the chains of two links, and not the chains of <Em>any</Em> number of links.</Par>
						<DL>receivedMoneyFrom(v, b) :- transaction(_, v, x, _, _, _, _, _), transaction(_, x, b, _, _, _, _, _).</DL>
					</>,
					<>
						<Par>Use the <Em>new predicate first</Em>, as in the example. This works well.</Par>
						<DL>receivedMoneyFrom(v, b) :- receivedMoneyFrom(v, x), transaction(_, x, b, _, _, _, _, _).</DL>
					</>,
					<>
						<Par>Use the <Em>original predicate first</Em>. This works just as well. There's no direct preference for this set-up or the previous one.</Par>
						<DL>receivedMoneyFrom(v, b) :- transaction(_, v, x, _, _, _, _, _), receivedMoneyFrom(x, b).</DL>
					</>,
					<>
						<Par>Use the <Em>new predicate twice</Em>. This technically does work, but it's <Em>not</Em> recommended. Note that, because the new recursive <IDL>receivedMoneyFrom</IDL> predicate is likely to be far larger than the original <IDL>transaction</IDL> predicate, the rule now has to check a lot more cases. This may lead to a significantly slower query evaluation.</Par>
						<DL>receivedMoneyFrom(v, b) :- receivedMoneyFrom(v, x), receivedMoneyFrom(x, b).</DL>
					</>,
				]} />
			</Info>
		</Section>

		<Section title="Use a recursion counter">
			<Par>So far we have tracked who received money from who, in any number of steps. But now let's say we're interested in this <Em>number</Em> of steps. Let's find a way to track this number.</Par>
			<Par>To do so, we add a counter to the recursive predicate through <IDL>receivedMoneyInSteps(v, b, n)</IDL>. This counter <IDL>n</IDL> tracks the number of steps we have taken to get from one user to another. We have to implement this counter in our rules accordingly.</Par>
			<Par>Adding the counter to the base case is relatively straightforward. If a vendor directly received money from a buyer, the number of steps is 1.</Par>
			<DL>receivedMoneyInSteps(v, b, 1) :- transaction(_, v, b, _, _, _, _, _).</DL>
			<Par>To add the counter to the recursion rule, we have to show how it follows from an already existing counter.</Par>
			<DL>receivedMoneyInSteps(v, b, n) :- receivedMoneyInSteps(v, x, m), transaction(_, x, b, _, _, _, _, _), n = m + 1.</DL>
			<Par>In words, this can be phrased as</Par>
			<Quote>We say that v received money from b in (m+1) steps, if there is some other person x for which v received money from x in m steps, and x sold something to b.</Quote>
			<Par>The above approach usually works really well. There's just one very important pitfall: we have to assume that there are no cycles!</Par>
			<Par>Now let's assume there <Em>is</Em> a cycle. Suppose that a person A sold something to a person B, who then in turn sold something else to person A. This gives a cycle (of length 2). In this case, our rule as we set it up will create an infinitely large predicate <IDL>receivedMoneyInSteps(v, b, m)</IDL>!</Par>
			<Par>To see why, consider in how many steps we can reach person B from person A. We can do so in one step (A sold to B) so <IDL>receivedMoneyInSteps(a, b, 1)</IDL> holds true. But we can also reach person B in three steps (A sold to B, who sold to A, who sold to B) so <IDL>receivedMoneyInSteps(a, b, 3)</IDL> is also present. And identically, we have <IDL>receivedMoneyInSteps(a, b, 5)</IDL>, <IDL>receivedMoneyInSteps(a, b, 7)</IDL>, and so forth. The result is an infinite amount of ways to reach person B from person A. And that's just due to <Em>one</Em> cycle. Imagine if there's more!</Par>
			<Warning>
				<Par sx={{ mb: 0.5 }}>You may have already learned about Datalog rule safety. The literal <IDL>n = m + 1</IDL> causes the rule to be unsafe: <IDL>n</IDL> does not originate from any existing predicate. That explains the infinitely large outcomes.</Par>
				<Par>Even though we usually say that all rules should be safe, recursion counters form an exception to this. They can be very useful after all. However, if you ever use recursion counters, do ensure that there are no cycles! Or you will still run into infinity issues.</Par>
			</Warning>
			<Info>Some more strict Datalog engines don't allow literals like <IDL>n = m + 1</IDL>. Instead, they use a <Term>successor predicate</Term> <IDL>succ(m, n)</IDL> which defines <IDL>n</IDL> to be one larger than (i.e., the successor of) <IDL>m</IDL>. So instead of <IDL>n = m + 1</IDL> we'd then have to use <IDL>succ(m, n)</IDL>.</Info>
			<Par>Tackling the problem of cycles is really tricky. There's a few approaches that can do so, and that will give the <Em>least</Em> amount of steps for which B can be reached from A. However, these approaches require techniques we haven't discussed so far: think of tracking which links we already visited, or using recursive aggregation within Datalog. Because it's a bit too advanced, we won't discuss those methods further for now. Whenever we add a counter, we'll simply have to ensure that there <Em>are</Em> no cycles.</Par>
		</Section>
	</Page>;
}
