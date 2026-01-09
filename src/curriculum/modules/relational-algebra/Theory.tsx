import { Page, Section, Par, List, Warning, Info, Term, Em, M } from '@/components';
import { ISQL } from '@/components';

import { FigureTerminology } from '../database-table/Theory'

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that a database is a collection of tables, and to get anything out of those tables, we need a query language. One of the most foundational query languages is <Term>Relational Algebra</Term>. Let's take a look at how it works.</Par>
    </Section>

    <Section title="The idea behind relational algebra">
      <Par>You probably know algebra. In algebra, we start off with various variables like <M>x</M> and <M>y</M>, which all represent numbers. We then subject these numbers to various operations, like multiplication, subtraction, division, and so forth. For instance, we may calculate <M>{`\\frac{3x-4y}{2}`}</M>. After every step, we wind up with yet another number. And the powerful thing is: if the values of <M>x</M> and <M>y</M> change, we can instantly redo all these steps.</Par>
      <Par><Term>Relational algebra</Term> is very similar to algebra, but rather than working with numbers, it works with tables, which we now call <Term>relations</Term>. We start with one or more relations, and then apply various operations to them. (Think of selecting specific columns or rows, or joining two tables into one.) Every operation takes one or more relations and uses them to build some new relation. By manipulating the relations in this way, we eventually wind up with some final relation containing exactly the data that we want.</Par>
      <Par>Relational algebra is a relatively small query language: it only has six fundamental operations, and a few more that are derived from them. This is not a weakness: it's its main strength! Most DBMSs use some advanced and complicated query language with lots of possibilities, but then internally they translate those queries into basic relational algebra operations, which are then applied to the data.</Par>
      <Info>Because most DBMSs internally use some form of relational algebra, you could say that relational algebra functions as the engine behind many DBMSs. So if you want to understand how a DBMS works under the hood, studying relational algebra is the way to go. If you only want to use databases in basic ways, you probably don't need relational algebra.</Info>
    </Section>

    <Section title="Relational algebra terminology">
      <Par>In relational algebra, the terminology used is slightly different than in most other database fields. We already saw that a table is now known as a <Term>relation</Term>, but it goes further. Columns are <Term>attributes</Term>, rows are <Term>tuples</Term> and table contents are a <Term>relation instance</Term>. Each attribute has a <Term>domain</Term>: the set of all possible values it is allowed to have.</Par>
      <FigureTerminology terminology={{
        table: 'Relation',
        contents: 'Relation instance',
        column: 'Attribute',
        columnNames: 'Attribute names',
        row: 'Tuple',
        cell: 'Value',
      }} />
    </Section>

    <Section title="Mathematical notation">
      <Par>Relational algebra has its foundations in mathematics. This means everything is formally defined. To work with relational algebra, it helps to know these definitions, as well as the corresponding notation.</Par>
      <List items={[
        <>
          <Par sx={{ mb: 1 }}>An <Term>attribute</Term> is denoted by its name. In relational algebra, we often use upper case letters like <M>A_1, A_2, A_3, \ldots</M> for attribute names, but in practice anything goes.</Par>
          <Info>Example: We can define the attribute <ISQL>d_id</ISQL>.</Info>
        </>,
        <>
          <Par sx={{ mb: 1 }}>A <Term>domain</Term> is a set of possible values an attribute may take values from. Common domains are "all possible numbers" or "all possible text strings".</Par>
          <Info>Example: The domain of <ISQL>d_id</ISQL> is the set of all possible four-digit numbers.</Info>
        </>,
      ]} />
      <Warning>Formally, an <Term>attribute</Term> is a <Em>combination</Em> of a name and a domain. When referring to an attribute, we write down its name. To refer to its domain, we use <M>{`{\\rm dom}(A)`}</M>.</Warning>
      <List items={[
        <>
          <Par sx={{ mb: 1 }}>A <Term>relation schema</Term> is a set of attributes. You could see this as the table's design. We may write <M>{`R = \\{A_1, A_2, A_3, \\ldots\\}`}</M>. Note that, because this is a set, there is no particular order to the attributes.</Par>
          <Info>Example: We define the relation schema <Em>DepartmentsSchema</Em> = {`{d_id, d_name, manager_id, budget, nr_employees}`}.</Info>
        </>,
        <>
          <Par sx={{ mb: 1 }}>A <Term>tuple</Term> is a combination of values. We could for instance write <M>t = (a_1, a_2, a_3)</M>. Tuples in relational algebra are named: to access a value from the tuple <M>t</M> we need the corresponding attribute's name. Common notations for tuple values are <M>t.A_1</M> or <M>t[A_1]</M>. Both these statements mean "Find the value of attribute <M>A_1</M> within the tuple <M>t</M>."</Par>
          <Info>Example: A possible tuple for our relation schema is <M>t = \,\,</M>(4000, Human Resources, 42223311, 981450, 8). We can now say that <M>{`t.\\textrm{nr\\_employees} = 8`}</M>.</Info>
        </>,
        <>
          <Par sx={{ mb: 1 }}>A <Term>relation instance</Term> <M>r</M> is a set of tuples <M>{`\\{t_1, t_2, \\ldots\\}`}</M>. We often write the relation instance as <M>r(R)</M> instead of just <M>r</M> to show "The instance <M>r</M> satisfies the schema <M>R</M>." This implicitly means that every tuple <M>t \in r(R)</M> satisfies <M>{`t.A_i \\in \\textrm{dom}(A_i)`}</M> for every attribute <M>A_i \in R</M>. In other words, all values of each tuple are in the domain of the respective attribute.</Par>
          <Info>Example: We may consider the relation instance <Em>departments(DepartmentsSchema)</Em> to be defined as:<br/><M>{`\\{(5000, \\textrm{Operations}, 41376655, 3308400, 12), (3000, \\textrm{Finance \\& Legal}, 41655533, 2563000, 8), \\ldots\\}`}</M></Info>
        </>,
      ]} />
      <Par>These definitions have a few important implications. Most importantly, keep in mind that relationship instances are <Em>sets</Em>, based on mathematical set theory.</Par>
      <List items={[
        <>They have <Em>no order or sorting</Em>. The order of tuples within a relation instance is always fully irrelevant.</>,
        <>They <Em>cannot have duplicates</Em>. If a tuple is "added" to a relation instance, but it already exists in there, then the duplicate is automatically ignored.</>,
      ]} />
      <Par>When you know all the above about relational algebra, you are ready to start applying it.</Par>
    </Section>
  </Page>;
}
