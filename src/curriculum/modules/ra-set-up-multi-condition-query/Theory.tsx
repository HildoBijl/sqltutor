import { Page, Par, Section, Warning, Info, Term, Em, M, BM, RelationName, Link } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that relations are often linked through foreign keys. Running a filter on one relation is easy enough, but how do we filter based on conditions from multiple relations? One option here is to use <Term>set operators</Term> on the respective keys. Let's study this idea using an example.</Par>
    </Section>

    <Section title="The issue of combining multiple results">
      <Par>Suppose that we have a list of departments (including their manager) and a list of employee records. We want to find all the department managers (their IDs) who earn less than 200,000 per year. How would we do this?</Par>
      <Par>The key thing to realize is that there are two requirements: we are looking for the people who (1) manage a department, and (2) who earn less than 200,000 per year. And these requirements are in <Em>different relations</Em>! We could find all the manager IDs by extracting the manager IDs from <RelationName>departments</RelationName>.</Par>
      <FigureExampleRAQuery query={<>∏<sub>manager_id</sub>(departments)</>} actualQuery="SELECT manager_id FROM departments" tableWidth={150} />
      <Par>Similarly, we can find all employees earning less than 200,000 from the <RelationName>employees</RelationName> relation.</Par>
      <FigureExampleRAQuery query={<>∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))</>} actualQuery="SELECT e_id FROM employees WHERE current_salary < 200000" tableWidth={150} />
      <Par>The result of our query would now be all the people who appear in <Em>both</Em> these lists. How can we combine these lists?</Par>
    </Section>

    <Section title="Use the rename operator for attributes">
      <Par>There are various techniques to combine lists. However, before we discuss them, we should note that, and in the above relations, the attributes have <Em>different names</Em>! Since relational algebra is a name-based language, this is an issue. If we want to do anything, we have to fix that first.</Par>
      <Par>To adjust attribute names, we use the <Term>rename operator</Term> <M>\rho</M> (the Greek letter rho). We could for instance use it to rename a single attribute using the <M>\rightarrow</M> notation.</Par>
      <FigureExampleRAQuery query={<>ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments))</>} actualQuery="SELECT manager_id AS e_id FROM departments" tableWidth={150} />
      <Par>Note that the rename operator receives a relation, and the subscript describes how to adjust the attribute names. We can also add multiple attribute renames at the same time if we separate them by commas.</Par>
      <Info>The rename operator can be used in a variety of ways. There are also notations in which we can rename the relation itself, or rename <Em>all</Em> attributes at the same time. More about that will be discussed when setting up <Link to="/skill/ra-set-up-multi-relation-query">multi-relation queries</Link>.</Info>
    </Section>

    <Section title="Use the intersection">
      <Par>Now let's go back to our original problem. We want to find all the department managers (their IDs) who earn less than 200,000 per year. This consists of the people who appear in <Em>both</Em> the given lists. For that, we use the <Term>intersection operator</Term> "<M>\cap</M>".</Par>
      <FigureExampleRAQuery query={<>ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments)) ∩ ∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))</>} actualQuery="SELECT manager_id AS e_id FROM departments INTERSECT SELECT e_id FROM employees WHERE current_salary < 200000" tableWidth={150} />
      <Par>You can only take the intersection of two relations which have <Em>exactly</Em> the same attributes. When you do, the result will only consist of those tuples that appear in <Em>both</Em> relation instances.</Par>
      <Par>The intersection operator is formally defined, for two relations <M>r</M> and <M>s</M> having a common schema <M>R</M>, as</Par>
      <BM>{`r \\cap s = \\{ t \\, | \\, t \\in r \\, \\textrm{and} \\, t \\in s \\}.`}</BM>
      <Warning>Whenever we use the intersection (or any of the following set operators), we in practice only do so on relations of <Em>keys</Em>, or combinations of <Em>keys</Em>. So before we use set operators, we first use projection to ensure we only have keys as attributes. This is not a hard rule, but it's a useful guideline that makes our querying life a lot easier.</Warning>
    </Section>

    <Section title="Use the union">
      <Par>Let's consider a slightly adjusted problem. Now we want to find all the people who <Em>either</Em> manage a department, <Em>or</Em> earn less than 200,000 per year.</Par>
      <Par>In this case the solution is to find all people who appear in <Em>either</Em> of the two lists we have obtained. For this, we use the <Term>union operator</Term> "<M>\cup</M>".</Par>
      <FigureExampleRAQuery query={<>ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments)) ∪ ∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))</>} actualQuery="SELECT manager_id AS e_id FROM departments UNION SELECT e_id FROM employees WHERE current_salary < 200000" tableWidth={150} />
      <Par>The union operator takes two relations and gives a relation that consists of all tuples that appear in <Em>either</Em> (or both) of the given relations. The union operator is formally defined, for two relations <M>r</M> and <M>s</M> having a common schema <M>R</M>, as</Par>
      <BM>{`r \\cup s = \\{ t \\, | \\, t \\in r \\, \\textrm{or} \\, t \\in s \\}.`}</BM>
      <Info>Initially you may mix up the union and intersection symbols. It may help to remember that the union symbol (the cup) looks like a "u" which is also in "union". Similarly, the intersection symbol (the cap) looks like an "n" which is also in "intersection". (Although "union" also has an "n", but it's only in the second syllable, so let's ignore that part.)</Info>
    </Section>

    <Section title="Use the set difference">
      <Par>To introduce the final set operator, we adjust the problem again. Now we want to find all the people who manage a department but do <Em>not</Em> earn less than 200,000 per year.</Par>
      <Par>The solution here is to take the first list, and <Em>remove</Em> all the people from it that appear on the second list. For this, we use the <Term>difference operator</Term> "<M>-</M>" (the minus sign).</Par>
      <FigureExampleRAQuery query={<>ρ<sub>manager_id→e_id</sub>(∏<sub>manager_id</sub>(departments)) - ∏<sub>e_id</sub>(σ<sub>salary &lt; 200000</sub>(employees))</>} actualQuery="SELECT manager_id AS e_id FROM departments EXCEPT SELECT e_id FROM employees WHERE current_salary < 200000" tableWidth={150} />
      <Par>The difference operator takes two relations and gives a relation that consists of all tuples that appear in the first but not in the second relation. The difference operator is formally defined, for two relations <M>r</M> and <M>s</M> having a common schema <M>R</M>, as</Par>
      <BM>{`r - s = \\{ t \\, | \\, t \\in r \\, \\textrm{and} \\, t \\notin s \\}.`}</BM>
      <Info>If you take the difference <M>r - s</M>, and if <M>s</M> has tuples that are <Em>not</Em> in <M>r</M>, then these tuples are ignored. They have no effect on the set difference.</Info>
    </Section>
  </Page>;
}
