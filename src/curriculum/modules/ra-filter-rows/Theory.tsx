import { Page, Par, List, Section, Info, Warning, Term, Em, M, BM, RA, IRA, ISQL } from '@/components';
import { FigureExampleRAQuery } from '../../utils';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that <Term>filtering</Term> comes down to finding the right rows in a relation, subject to some condition. Let's take a look at how we can do that using relational algebra.</Par>
    </Section>

    <Section title="Use the filtering operator">
      <Par>Suppose that we have a list of departments of a company, and we want to find the departments with more than 10 employees. This is done through filtering: we find all rows for which the number of employees is larger than ten. In relational algebra we can do so through</Par>
      <FigureExampleRAQuery query={<>σ<sub>nr_employees &gt; 10</sub>(departments)</>} actualQuery="SELECT * FROM departments WHERE nr_employees > 10" tableWidth={500} />
      <Par>Note that the <Term>filtering operator</Term> <M>\sigma</M> (the Greek letter sigma) expects some relation within its brackets. As subscript, it expects a <Term>predicate</Term>/<Term>condition</Term> which it can check on each tuple within the relation. As output, the operator returns the given relation, but only with the tuples matching the given condition.</Par>
    </Section>

    <Section title="Set up a single condition">
      <Par>In relational algebra, predicates/conditions are set up using propositional logic. In this logic, conditions are always some kind of comparison. They come in the form</Par>
      <RA>[value] [comparator] [value]</RA>
      <Par>Here, the value may be predefined (like a given number or piece of text) or they may come from the given tuple.</Par>
      <Par>For <Term>text</Term>, comparing is usually done using either <M>=</M> (equals) or <M>\neq</M> (unequals). You could for instance find all departments whose name does not equal "Operations" using</Par>
      <FigureExampleRAQuery query={<>σ<sub>d_name ≠ "Operations"</sub>(departments)</>} actualQuery="SELECT * FROM departments WHERE d_name <> 'Operations'" tableWidth={500} />
      <Warning>When you are predefining a piece of text in a condition, always use quotation marks to show that you are using text, rather than using an attribute name.</Warning>
      <Par>For <Term>numbers</Term> there are more comparators that are commonly applied. Next to <M>=</M> and <M>\neq</M> there are also <M>&gt;</M> (greater than), <M>&lt;</M> (lower than), <M>\geq</M> (greater or equal) and <M>\leq</M> (lower or equal). So to find all departments having ten or less employees, we can use</Par>
      <FigureExampleRAQuery query={<>σ<sub>nr_employees ≤ 10</sub>(departments)</>} actualQuery="SELECT * FROM departments WHERE nr_employees <= 10" tableWidth={500} />
      <Info>Later on we are going to use multiple relations within the same query. In that case, we use the dot-notation to indicate which relation an attribute is from, like in <IRA>σ<sub>employees.nr_employees ≤ 10</sub>(departments)</IRA>. This notation is crucial when there are multiple attributes from different relations with the same name. In our current case we only have one relation, so then using <IRA>σ<sub>nr_employees ≤ 10</sub>(departments)</IRA> suffices.
      </Info>
    </Section>

    <Section title="Combine multiple conditions">
      <Par>In practice you often need to combine multiple conditions. This can be done using the <Term>connectives</Term> <M>\wedge</M> (and), <M>\vee</M> (or) and <M>\neg</M> (not).</Par>
      <Par>For example, if we want to find all departments with ID lower than 4000 <Term>and</Term> less than 20 employees, we can use</Par>
      <FigureExampleRAQuery query={<>σ<sub>d_id &lt; 4000 ∧ nr_employees &lt; 20</sub>(departments)</>} actualQuery="SELECT * FROM departments WHERE d_id < 4000 AND nr_employees < 20" tableWidth={500} />
      <Par>Similarly, if we want to find all departments managed by either the manager with ID <ISQL>41378877</ISQL> <Term>or</Term> managed by the manager with ID <ISQL>42223311</ISQL>, then we can use</Par>
      <FigureExampleRAQuery query={<>σ<sub>manager_id = 41378877 ∨ manager_id = 42223311</sub>(departments)</>} actualQuery="SELECT * FROM departments WHERE manager_id = 41378877 OR manager_id = 42223311" tableWidth={500} />
      <Warning>Whereas a person might say, "Get me the departments whose manager ID is 41378877 or 42223311" this is not allowed in relational algebra. You cannot use the predicate <IRA>manager_id = 41378877 ∨ 42223311</IRA>. The connectives can only combine <Em>conditions</Em>, and a condition should always be a comparison.</Warning>
      <Par>The final connective is the <Term>not</Term> connective <M>\neg</M>. It negates whatever condition comes after it, turning true into false and vice versa. We could for instance also find all departments having more than ten employees using</Par>
      <FigureExampleRAQuery query={<>σ<sub>¬(employees.nr_employees ≤ 10)</sub>(departments)</>} actualQuery="SELECT * FROM departments WHERE NOT (nr_employees <= 10)" tableWidth={500} />
      <Warning>When using <M>\neg</M> or when combining different connectives, <Em>always</Em> use brackets to indicate which connective should be evaluated first. Otherwise things may get very unclear. For instance, consider the condition <IRA>1 = 1 ∨ 2 = 2 ∧ 3 = 4</IRA>. If we evaluate this as <IRA>1 = 1 ∨ (2 = 2 ∧ 3 = 4)</IRA> then it becomes true, but if we evaluate this as <IRA>(1 = 1 ∨ 2 = 2) ∧ 3 = 4</IRA> then it becomes false.</Warning>
      <Par>By cleverly combining the three connectives with the right conditions, we can set up pretty much any composite condition that we want.</Par>
    </Section>

    <Section title="The definition of the filtering operator">
      <Par>Because relational algebra is a mathematical query language, it has all its operators very precisely defined. The filtering operator is defined as</Par>
      <BM>{`\\sigma_p(r) := \\{t \\, | \\, t \\in r \\, \\textrm{and} \\, p(t) \\}.`}</BM>
      <Par>Let's walk through the definition piece by piece to understand what it means.</Par>
      <List items={[
        <>On the left we have the filter we are defining. It shows that, when we use filtering, we must provide some predicate/condition <M>p</M> and some relation <M>r</M>.</>,
        <>The "<M>:=</M>" part stands for "is defined as". The colon shows it is a definition.</>,
        <>On the right, we have the actual definition of the filter. In words, you can read it as "The set of all tuples <M>t</M>, where <M>t</M> comes from the given relation <M>r</M>, and where the predicate <M>p(t)</M>, when evaluated for the tuple <M>t</M>, results in something that holds true."</>,
        <>The notation <M>p(t)</M> is a shorthand for the predicate evaluated given the tuple <M>t</M>. It is something that evaluates as true or false.</>,
      ]} />
      <Par>So altogether the above definition says: "The filtering of the relation <M>r</M> subject to the predicate/condition <M>p</M> is defined as the set of all tuples <M>t</M> from <M>r</M> for which the predicate <M>p</M> evaluates as true."</Par>
    </Section>
  </Page>;
}
