import { Page, Section, Par, Quote, List, Info, Warning, Em, Term, DL, IDL } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that, when using the <IDL>not</IDL> keyword in Datalog, unexpected issues may arise. We should pay extra attention to ensuring that our rules are safe. So let's study how we <Em>can</Em> set up a valid rule with Datalog containing the <IDL>not</IDL> keyword: a so-called <Term>negation rule</Term>.</Par>
    </Section>

    <Section title="Common mistakes when setting up negation">
      <Par>Let's bring up a familiar example: suppose that we want to find the IDs of all employees that are not the manager of a department. How would we do so?</Par>
      <Par>We have seen several incorrect ways of doing this. We can't just use a negation.</Par>
      <DL>nonManagerId(id) :- not department(did, dn, id, b, ne).</DL>
      <Par>Here <IDL>id</IDL> is unbound since it's not part of any positive literal. It would result in an infinitely large output. We should hence <Em>always</Em> include a positive literal. An attempt to fix it is through</Par>
      <DL>nonManagerId(id) :- employee(id, fn, ln, p, e, a, c, hd, cs), not department(did, dn, id, b, ne).</DL>
      <Par>This is once more an unsafe query, since the variables <IDL>did</IDL>, <IDL>dn</IDL>, <IDL>b</IDL> and <IDL>ne</IDL> are unbound. It causes the negative literal to be ineffective.</Par>
      <Par>The main challenge in using negation therefore is to get rid of the unbound variables. We'll study two ways of doing so.</Par>
    </Section>

    <Section title="Method 1: remove unbound variables through an intermediate predicate">
      <Par>The cleanest way of getting rid of unbound variables is to set up an intermediate predicate where we apply projection to remove the unbound variables. In the example, we could define</Par>
      <DL>managerId(id) :- department(_, _, id, _, _).</DL>
      Once we have this, we can find the IDs of all non-manager employees through
      <FigureExampleDLQuery query={<>nonManagerId(id) :- employee(id, _, _, _, _, _, _, _, _), not managerId(id).</>} actualQuery="SELECT e_id FROM employees EXCEPT SELECT manager_id AS e_id FROM departments" tableWidth={150} />
      <Par>If we really want to be clean, we could instead also defined another supporting predicate, and then apply that one as well.</Par>
      <FigureExampleDLQuery query={<>employeeId(id) :- employee(id, _, _, _, _, _, _, _, _).<br />nonManagerId(id) :- employeeId(id), not managerId(id).</>} actualQuery="SELECT e_id FROM employees EXCEPT SELECT manager_id AS e_id FROM departments" tableWidth={150} />
      <Par>Both methods are fine and come down to the exact same idea.</Par>
      <Par>Setting up negation through an intermediate predicate like this is a very useful way of keeping scripts clean and easy to follow. They also allow for <Term>reusability</Term>: if we need the predicate <IDL>managerId</IDL> anywhere else in our program, we can again use it. The downside is that it does define a lot of predicates. That's not really a big problem, but if you really want to let your script have as few lines as possible, you can also try the second method of getting rid of unbound variables.</Par>
    </Section>

    <Section title="Method 2: remove unbound variables through anonymous variables">
      <Par>Rather than setting up a new predicate, we could also squash everything into one rule. To do so, we turn all unbound variables into anonymous variables.</Par>
      <FigureExampleDLQuery query={<>nonManagerId(id) :- employee(id, _, _, _, _, _, _, _, _), not department(_, _, id, _, _).</>} actualQuery="SELECT e_id FROM employees EXCEPT SELECT manager_id AS e_id FROM departments" tableWidth={150} />
      <Par>This works well, but the underscore in the negative literal can be a bit confusing. The above query effectively says,</Par>
      <Quote>An ID belongs to a non-manager, if there is an employee with that ID (with any other employee arguments), and there is not any department for which the manager has that ID (with any other department arguments).</Quote>
      <Warning>
        <Par sx={{ mb: 1 }}>Note that for negative literals the use of anonymous variables fundamentally changes the meaning of the literal.</Par>
        <List items={[
          <><IDL>not department(did, dn, id, b, ne)</IDL> means "I can find <Em>some</Em> value for <IDL>did</IDL>, <IDL>dn</IDL>, <IDL>b</IDL> and <IDL>ne</IDL> for which the entry is <Em>not</Em> in the <IDL>department</IDL> predicate."</>,
          <><IDL>not department(_, _, id, _, _)</IDL> comes down to "I can't find <Em>any</Em> value for <IDL>did</IDL>, <IDL>dn</IDL>, <IDL>b</IDL> and <IDL>ne</IDL> for which the entry <Em>is</Em> in the <IDL>department</IDL> predicate."</>,
        ]} />
      </Warning>
      <Par>This second method works just as well as the first, and on top of that it results in fewer predicates and rules. Nevertheless, the first method is generally recommended. After all, it keeps rules shorter and programs easier to understand, which significantly reduces the risk for errors.</Par>
      <Info>No matter the method that you use: after setting up a negation rule, <Em>always</Em> run a quick check to verify that your rule is safe!</Info>
    </Section>
  </Page>;
}
