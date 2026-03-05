import { Page, Section, Par, List, Quote, Info, Term, Em, DL, IDL } from '@/components';

import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>When a Datalog rule is evaluated, Datalog attempts to find <Em>all</Em> sets of values for <Em>all</Em> variables such that <Em>all</Em> literals hold true. This is a powerful idea, but there are a few risks attached: we may get an infinitely large output or an ineffective literal. We'll study what types of literals exist, and what can go wrong for each of them.</Par>
    </Section>

    <Section title="Positive and negative literals">
      <Par>Let's suppose that we want to find the IDs of employees that manage a department. We can find them by taking the <IDL>manager_id</IDL> argument from the <IDL>employee</IDL> predicate.</Par>
      <FigureExampleDLQuery query={<>managerId(mid) :- department(id, n, mid, b, ne).</>} actualQuery="SELECT manager_id FROM departments" tableWidth={150} />
      <Par>In this rule, the literal <IDL>department(id, n, mid, b, ne)</IDL> is called a <Term>positive literal</Term>: it specifies something that the respective variables <Em>should</Em> satisfy.</Par>
      <Par>A identical example of a positive literal occurs when we want to find a list of all employee IDs. We specify that the ID should be the first argument in some fact of the <IDL>employee</IDL> predicate.</Par>
      <FigureExampleDLQuery query={<>employeeId(id) :- employee(id, fn, ln, p, e, a, c, hd, cs).</>} actualQuery="SELECT e_id FROM employees" tableWidth={150} />
      <Par>Now let's say we want to find the IDs of all employees that are <Em>not</Em> a manager. In this case, we can use the Datalog <IDL>not</IDL> keyword. It can for instance be used through</Par>
      <FigureExampleDLQuery query={<>nonManagerId(id) :- employeeId(id), not managerId(id).</>} actualQuery="SELECT e_id FROM employees EXCEPT SELECT manager_id AS e_id FROM departments" tableWidth={150} />
      <Par>The above query works well. Intuitively, it can be read as</Par>
      <Quote>An "ID" value is the ID of a non-manager, if it is the ID of some employee, and it is not the ID of some manager.</Quote>
      <Par>Specifically, the literal <IDL>not managerId(id)</IDL> requires the prospective <IDL>id</IDL> value to <Em>not</Em> be in the predicate <IDL>managerId</IDL>. Because it specifies a condition that <Em>should not</Em> hold, we call this a <Term>negative literal</Term>. Negative literals are quite common in Datalog.</Par>
    </Section>

    <Section title="Unbound variables causing infinitely large outputs">
      <Par>Let's look more closely at the last rule we set up. Could we have also set up this Datalog rule with only a negative literal?</Par>
      <DL>nonManagerId(id) :- not managerId(id).</DL>
      <Par>This is a very important pitfall of the <IDL>not</IDL> keyword. The above rule fails: it gives an <Term>infinitely large output</Term>.</Par>
      <Par>To see why, keep in mind that Datalog finds <Em>all</Em> possible sets of values for all variables such that all literals hold true. Consider for instance the (possibly somewhat silly) example values <IDL>id = 12345</IDL>, <IDL>id = -42</IDL>, <IDL>id = 'Random string'</IDL> or <IDL>id = '1970-01-01'</IDL>. They all satisfy all literals! In fact, pretty much any possible value of <IDL>id</IDL>, no matter how ridiculous, satisfies the literal <IDL>not managerId(id)</IDL>. So the rule gives an infinitely large output!</Par>
      <Par>The problem here is that the variable <IDL>id</IDL> is an <Term>unbound variable</Term>: it is not constrained by any positive literal. When this is the case, we run the risk of infinitely large outputs. It should most certainly be avoided. Luckily the solution (the one we showed earlier) is relatively simple: we bound the <IDL>id</IDL> variable through a positive literal <IDL>employeeId(id)</IDL>. In other words, we also specify something that <IDL>id</IDL> <Em>should</Em> be.</Par>
    </Section>

    <Section title="Unbound variables causing ineffective literals">
      <Par>A similar yet slightly different problem occurs when we try to merge all steps into one large rule.</Par>
      <FigureExampleDLQuery query={<>nonManagerId(eid) :- employee(eid, fn, ln, p, e, a, c, hd, cs), not department(did, dn, eid, b, ne).</>} actualQuery="SELECT e_id FROM employees" tableWidth={150} below />
      <Par>This query doesn't do what we expect it to do: it simply returns all employee IDs! Why is that? Don't we specify that the given <IDL>eid</IDL> value should <Em>not</Em> be in the <IDL>departments</IDL> predicate? It seems that our negative literal is <Term>ineffective</Term>: it doesn't do anything!</Par>
      <Par>The problem is once more that there are unbound variables. Let's consider for instance the ID <IDL>41651199</IDL>. Sure, there is a fact <IDL>department(1000, 'Information Technology', 41651199, 7400200, 30)</IDL> that informs us that this ID belongs to a department manager. However, keep in mind that Datalog finds all possible sets of values of <Em>all</Em> variables, and the variables <IDL>did</IDL>, <IDL>dn</IDL>, <IDL>b</IDL>, <IDL>ne</IDL> are unbound! So if we (somewhat randomly) take <IDL>did = 12345</IDL>, <IDL>dn = 'Fake department'</IDL>, <IDL>b = -42</IDL> and <IDL>ne = 'Too many'</IDL> then it indeed holds that the tuple <IDL>(12345, 'Fake department', 41651199, -42, 'Too many')</IDL> is <Em>not</Em> in the <IDL>department</IDL> predicate. As a result, the negative literal holds true, and <IDL>eid = 41651199</IDL> will be part of the output! After all, we have found a set of variables including <IDL>eid = 41651199</IDL> such that all literals hold true.</Par>
      <Par>Whenever there are unbound variables in a negative literal, then this literal becomes ineffective. We can <Em>always</Em> find some silly values for which it holds true. The solution is once more: make sure that all variables are bound.</Par>
    </Section>

    <Section title="Arithmetic literals">
      <Par>Let's consider another example. Suppose that we are looking into large departments: those with more than 10 employees.</Par>
      <FigureExampleDLQuery query={<>largeDepartment(id, n, mid, b, ne) :- department(id, n, mid, b, ne), ne &gt; 10.</>} actualQuery="SELECT * FROM departments WHERE nr_employees > 10" tableWidth={500} below />
      <Par>Now suppose that we are only interested in the number of employees for these large departments. We could get them through</Par>
      <FigureExampleDLQuery query={<>largeDepartmentSize(ne) :- department(id, n, mid, b, ne), ne &gt; 10.</>} actualQuery="SELECT nr_employees FROM departments WHERE nr_employees > 10" tableWidth={100} />
      <Par>Could we also get rid of the predicate <IDL>department</IDL> and just use the comparison to set up the rule?</Par>
      <DL>largeDepartmentSize(ne) :- ne &gt; 10.</DL>
      <Par>The answer is a very resounding no. In this example, it's quite clear why: we have lost any connection to the <IDL>department</IDL> predicate. But in general, we also have a problem: <IDL>ne</IDL> can take <Em>any</Em> value that is larger than <IDL>10</IDL>.</Par>
      <Par>The above comparison literal <IDL>ne &gt; 10</IDL> is called an <Term>arithmetic literal</Term>: it specificies some condition on variables based on arithmetics. Arithmetic literals <Em>are</Em> considered positive literals (they specify something that <Em>should</Em> be the case) but they are often <Em>not</Em> sufficient to bound variables, as the above example shows. As a result, we run into the same problem as with negative literals.</Par>
    </Section>

    <Section title="Rule safety">
      <Par>Based on the above problems, we can come up with the idea of <Term>rule safety</Term>. We call a Datalog rule <Term>safe</Term> if <Em>every</Em> variable in the rule appears in at least one positive non-arithmetic literal in the rule body. In practice, with "positive non-arithmetic literal" we mean "some existing predicate".</Par>
      <Par>If a rule is not safe, then there are one or more variables that are potentially unbound. In the above examples, we have seen two problems that may occur.</Par>
      <List items={[
        <>If <Em>any</Em> unbound variable appears in the rule head (the output), then this will likely result in an infinitely large output.</>,
        <>If the unbound variables <Em>only</Em> appear in the body of the rule, then we won't get an infinitely large output. However, the literals in which these unbound variables appear are likely to be ineffective.</>,
      ]} />
      <Par>In general, all rules in a Datalog program have to be safe for the program to work properly.</Par>
      <Info>Later on we will encounter a few tiny exceptions to the "all rules must be safe" idea. We'll get some arithmetic literals that <Em>do</Em> sufficiently bound variables. We will elaborate on those cases whenever we encounter them.</Info>
    </Section>
  </Page>;
}
