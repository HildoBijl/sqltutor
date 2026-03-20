import { Page, Section, Par, Info, Warning, Em, Term, IDL } from '@/components';
import { FigureExampleDLQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know the definition of rule safety in Datalog: a Datalog rule is safe if <Em>every</Em> variable in the rule appears in at least one positive non-arithmetic literal in the rule body. Let's study how we can check if a rule actually is safe.</Par>
    </Section>

    <Section title="Step 1: list all variables">
      <Par>Suppose that we have some complex Datalog rule. For instance, we want to find all departments where the manager earns more than 5% of the department's budget and is not allocated to the department they manage.</Par>
      <FigureExampleDLQuery query={<>departmentWithLargeBudget(dn, b, fn, ln, cs) :- <br/>        department(did, dn, mid, b, ne),<br/>        employee(mid, fn, ln, p, e, a, c, hd, cs),<br/>        salary &gt; b/20,<br/>        not allocation(mid, did).</>} actualQuery="SELECT d.d_name, d.budget, e.first_name, e.last_name, e.current_salary FROM departments d JOIN employees e ON d.manager_id=e.e_id WHERE (d.d_id, e.e_id) NOT IN allocations" tableWidth={500} />
      <Par>To check if this rule is safe, the first step is to make a list of all variables in this rule. Doing so gets us the variables <IDL>did</IDL>, <IDL>dn</IDL>, <IDL>mid</IDL>, <IDL>b</IDL>, <IDL>ne</IDL>, <IDL>fn</IDL>, <IDL>ln</IDL>, <IDL>p</IDL>, <IDL>e</IDL>, <IDL>a</IDL>, <IDL>c</IDL>, <IDL>hd</IDL>, <IDL>cs</IDL> and <IDL>salary</IDL>.</Par>
      <Warning>If you encounter <Term>anonymous variables</Term>, denoted through the underscore <IDL>_</IDL>, then you don't have to take those along in your list. This is yet another reason to use anonymous variables where possible: they make it easy to check for rule safety.</Warning>
    </Section>

    <Section title="Step 2: check that all variables are bound">
      <Par>Once we have a list of variables, we want to check if they're <Em>all</Em> in a positive non-arithmetic literal. In practice, this means they should all directly come from some predicate. Arithmetic literals like <IDL>salary &gt; b/20</IDL> and negative literals like <IDL>not allocation(mid, did)</IDL> are not important here and should be ignored.</Par>
      <Par>For our example, we should check whether all variables appear as an argument at either <IDL>department</IDL> or <IDL>employee</IDL>. When we do, we can tick all of them off except for the last one. Apparently <IDL>salary</IDL> is left unbound!</Par>
      <Info>When encountering an unbound variable, it's useful to check what kind of result this unbound variable will have. If it's in the output, we'll get infinitely many outputs. If it's not, we'll have an ineffective literal. In the example case, <IDL>salary</IDL> is <Em>not</Em> in the head of the rule, which means that we have an ineffective literal. The condition <IDL>salary &gt; b/20</IDL> will not have any effect. This also explains the output table we obtained above.</Info>
      <Par>When we look closely at the Datalog rule, we can see what happened. By accident, we called the current salary <IDL>cs</IDL> within the predicate, but <IDL>salary</IDL> within the value comparison. It's a simple programmer's mistake, using different names for the same variable, and checking for safety helped us find it. By fixing this, we indeed wind up with a safe rule.</Par>
      <FigureExampleDLQuery query={<>departmentWithLargeBudget(dn, b, fn, ln, cs) :- <br/>        department(did, dn, mid, b, ne),<br/>        employee(mid, fn, ln, p, e, a, c, hd, cs),<br/>        cs &gt; b/20,<br/>        not allocation(mid, did).</>} actualQuery="SELECT d.d_name, d.budget, e.first_name, e.last_name, e.current_salary FROM departments d JOIN employees e ON d.manager_id=e.e_id WHERE e.current_salary > d.budget/20 AND (d.d_id, e.e_id) NOT IN allocations" tableWidth={500} />
    </Section>
  </Page>;
}
