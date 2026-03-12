import { Page, Section, Par, List, Warning, Em, Term, DL, IDL } from '@/components';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how to write safe Datalog programs with the <IDL>not</IDL> keyword. We can set up recursive predicates. We can check if our program is stratified and hence is guaranteed to have a unique model. Let's bring all these skills together to tackle some very complex data requests.</Par>
    </Section>

    <Section title="Step 1: Simplify the situation">
      <Par>Let's come up with a tricky data request for the SQL Valley database. Let's suppose that the CIO of the company is suspect: he may have been helping people to launder money. We want to examine all the transactions that he validated, but not for products in the "Musical Instruments" category. (Musicians would <Em>never</Em> do money laundering after all.) Specifically, we want to know if there is a product that was sold multiple times through these suspect transactions and later on, after at least five transactions, ended up at a person who sold it earlier on. We want to know the username of this person, together with the name of the product. How could we do so?</Par>
      <Par>The first step in tackling a complicated data request like this is to define predicates that <Term>simplify the situation</Term>.</Par>
      <List items={[
        <>Apply respective filters where possible.</>,
        <>Remove arguments that we don't need.</>,
      ]} />
      <Par>This should give us various small easy-to-use key-based predicates.</Par>
      <Par>In the example case, we want to find which employees have been CIO (there may be multiple) and which products are musical instruments. We extract their IDs.</Par>
      <DL>{`
cioId(id) :- contract(id, 'CIO', _, _, _, _, _).
musicalInstrumentId(id) :- product(id, _, 'Musical Instruments', _, _, _).
`}</DL>
      <Par>Using these predicates, we can find all suspicious transactions. We only take those arguments that we'll need later on.</Par>
      <DL>{`
suspiciousTransaction(v, b, pid, d) :-
        transaction(v, b, pid, d, _, eid, _),
        cioId(eid),
        not musicalInstrument(pid).
`}</DL>
      <Par>This gives us an overview of the vendor and buyer of a given product on a given date, and only for the transactions that are suspicious. It's a really useful starting point!</Par>
    </Section>

    <Section title="Step 2: Set up the recursive predicate(s)">
      <Par>With our new set of clean-and-simple predicates, we can <Term>apply recursion</Term>. First we could set up a recursive predicate without a counter. This predicate tracks which vendor transferred ownership of which product to which buyer, either directly or indirectly.</Par>
      <DL>{`
transferredProduct(v, b, p) :- suspiciousTransaction(v, b, p, _).
transferredProduct(v, b, p) :-
        transferredProduct(v, x, p),
        suspiciousTransaction(x, b, p, _).
`}</DL>
      <Par>This works well, except that in our case we <Em>do</Em> need a counter. After all, we want to know if the product got back to the original owner after <Em>at least five</Em> steps. That requires counting! So we add a counter. We change the above rules to</Par>
      <DL>{`
transferredProduct(v, b, p, 1) :- suspiciousTransaction(v, b, p, _).
transferredProduct(v, b, p, n) :-
        transferredProduct(v, x, p, m),
        suspiciousTransaction(x, b, p, _),
        n = m + 1.
`}</DL>
      <Par>This fails: our program gets stuck in an infinite loop. After all, if A sold a product to B, and B sold it back to A, then A sold the product to A in two steps, but also in four, six, eight, etcetera. The counter keeps on increasing!</Par>
      <Warning>When using a counter, always make sure there are no cycles in your data. If there are: find a way to get rid of these cycles, or to prevent in some other way that the counter keeps increasing indefinitely.</Warning>
      <Par>You might think, "We can't get rid of the cycles. We want to find them!" However, we do have a date argument. If we require every sale in a chain to be <Em>later</Em> than the previous one, then we can never get a cycle. After all, you can't have a cycle of transactions in which <Em>every</Em> transaction is later than the last one.</Par>
      <Par>To implement this idea into our recursion, we add the date of the last sale to the recursive predicate.</Par>
      <DL>{`
transferredProduct(v, b, p, 1, d) :- suspiciousTransaction(v, b, p, d).
transferredProduct(v, b, p, n, d2) :-
        transferredProduct(v, x, p, m, d1),
        suspiciousTransaction(x, b, p, d2),
        n = m + 1,
        d1 < d2.
`}</DL>
      <Par>This successfully sets up the recursive predicate. It now finds all chains of people who sold a product to one another through suspicious transactions, where each transaction occurred <Em>after</Em> the previous transaction.</Par>
    </Section>

    <Section title="Step 3: Add more predicates to obtain the final result">
      <Par>The next step is to use the recursive predicate to <Term>answer the actual question</Term>. In our case, we want to know which products ended up at the person who originally sold them, after at least five steps. This is given by the following rule.</Par>
      <DL>{`suspiciousProduct(p, u) :- transferredProduct(u, u, p, n, _), n >= 5.`}</DL>
      <Par>Note that we require the vendor and buyer to be the same user, and the number of steps to be at least five. (The date is not relevant anymore.) With this, we are done!</Par>
      <Warning>It's a common mistake to forget which output was actually requested.</Warning>
      <Par>Actually we're not done. We had to find the <Em>username</Em> of the user (we have that) and the <Em>name</Em> of the product (we don't have that one). We only have the product ID, so we still have to join in the product name. That's easy enough, but we shouldn't forget it.</Par>
      <DL>{`suspiciousProductName(n, u) :- suspiciousProduct(p, u), product(p, n, _, _, _).`}</DL>
      <Par>Finally, we have to make sure this predicate is generated and given as output. We set up the final query with sensible argument names.</Par>
      <DL>{`?- suspiciousProductName(product_name, user_name).`}</DL>
      <Par>And with that we are done! Well, almost...</Par>
    </Section>

    <Section title="Step 4: Run final checks on safety and stratification">
      <Par>After the program has been written, the work is not over. It's very easy to slip up and make a mistake, so always <Term>check your program</Term>.</Par>
      <List items={[
        <>Check for <Term>safety</Term>: are all the rules safe? Are there no unbound variables?</>,
        <>Check for <Term>stratification</Term>: make a quick sketch of the dependency diagram. Are all the cycles that appear in your program free of negative dependencies?</>,
      ]} />
      <Par>If your program meets all the checks, your program is most likely correct. Or at least it won't get stuck in some infinite loop.</Par>
      <Par>For our example, gathering everything we have written, we can assemble the full Datalog program.</Par>
      <DL>{`
cioId(id) :- contract(id, 'CIO', _, _, _, _, _).
musicalInstrumentId(id) :- product(id, _, 'Musical Instruments', _, _, _).
suspiciousTransaction(v, b, pid, d) :-
        transaction(v, b, pid, d, _, eid, _),
        cioId(eid),
        not musicalInstrument(pid).
transferredProduct(v, b, p, 1, d) :- suspiciousTransaction(v, b, p, d).
transferredProduct(v, b, p, n, d2) :-
        transferredProduct(v, x, p, m, d1),
        suspiciousTransaction(x, b, p, d2),
        n = m + 1,
        d1 < d2.
suspiciousProduct(p, u) :- transferredProduct(u, u, p, n, _), n >= 5.
suspiciousProductName(n, u) :- suspiciousProduct(p, u), product(p, n, _, _, _).
?- suspiciousProductName(product_name, user_name).
`}</DL>
      <Par>To check for safety, we walk through all the rules and check if there are any potential causes that a rule may not be safe.</Par>
      <List items={[
        <>Rule 3 has <IDL>not musicalInstrument(pid)</IDL> which looks risky, but <IDL>pid</IDL> is already defined through <IDL>transaction</IDL>.</>,
        <>Rule 5 contains <IDL>{`d1 < d2`}</IDL> which is arithmetic, but both <IDL>d1</IDL> and <IDL>d2</IDL> are bound by positive non-arithmetic literals.</>,
        <>Rule 6 we have <IDL>{`n >= 5`}</IDL> which may be unsafe, but <IDL>n</IDL> comes directly from <IDL>transferredProduct</IDL>.</>,
      ]} />
      <Par>Only the literal <IDL>n = m + 1</IDL> from rule 5 causes an unsafe rule: <IDL>n</IDL> does not follow from a non-arithmetic literal. However, this is a recursion counter, and since we have guaranteed that there are no cycles in the recursion, this is considered acceptabel.</Par>
      <Par>To check for stratification, we can draw a quick dependency diagram. In this case that's a bit overkill though. The only cycle that appears is the one where <IDL>transferredProduct</IDL> refers to itself. This is done through a <Em>positive</Em> dependency, so there is certainly no cycle with a negative dependency in it. Everything is in order: the program is stratified.</Par>
      <Par>And with that we now <Em>are</Em> done. (Yes, really.) We have seen all the steps involved in writing recursive Datalog programs and are ready to put them into practice.</Par>
    </Section>
  </Page>;
}
