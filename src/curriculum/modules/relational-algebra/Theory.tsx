import { Page, Section, Par, List, Warning, Info, Term, Em } from '@/components';
import { ISQL } from '@/components';

import { FigureTerminology } from '../database-table/Theory'

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that a database is a collection of tables, and to get anything out of those tables, we need a query language. One of the most foundational query languages is <Term>Relational Algebra</Term>. Let's take a look at how it works.</Par>
    </Section>

    <Section title="The idea behind relational algebra">
      <Par>You probably know algebra. In algebra, we start off with various variables like {`x`} and {`y`}, which all represent numbers. We then subject these numbers to various operations, like multiplication, subtraction, division, and so forth. For instance, we may calculate {`(3x-4y)/2`}. After every step, we wind up with yet another number. And the powerful thing is: if the values of {`x`} and {`y`} change, we can instantly redo all these steps.</Par>
      <Par><Term>Relational algebra</Term> is very similar to algebra, but rather than working with numbers, it works with tables, which we now call <Term>relations</Term>. We start with one or more relations, and then apply various operations to them. (Think of selecting specific columns or rows, or applying more advanced operations.) Every operation takes one or more relations and uses them to build some new relation. By manipulating the relations in this way, we eventually wind up with some final relation containing exactly the data that we want.</Par>
      <Par>Relational algebra is a relatively small query language: it only has about a dozen or so operators, and most are very basic. This is not a weakness: it's its main strength! Most DBMSs use some advanced and complicated query language with lots of possibilities, but then internally they translate those queries into basic relational algebra operations, which are then applied to the data.</Par>
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
          <Par sx={{ mb: 1 }}>An <Term>attribute</Term> is denoted by its name. In relational algebra, we often use upper case letters like {`A1, A2, A3, ...`} for attribute names, but in practice anything goes.</Par>
          <Info>Example: We can define the attribute <ISQL>d_id</ISQL>.</Info>
        </>,
        <>
          <Par sx={{ mb: 1 }}>A <Term>domain</Term> is a set of possible values an attribute may take values from. Common domains are "all possible numbers" or "all possible text strings".</Par>
          <Info>Example: The domain of <ISQL>d_id</ISQL> is the set of all possible four-digit numbers.</Info>
        </>,
      ]} />
      <Warning>Formally, an <Term>attribute</Term> is a <Em>combination</Em> of a name and a domain. When referring to an attribute, we write down its name. To refer to its domain, we use {`dom(A)`}.</Warning>
      <List items={[
        <>
          <Par sx={{ mb: 1 }}>A <Term>relation schema</Term> is a set of attributes. You could see this as the table's design. We may write {`R = {A1, A2, A3, ...}`}. Note that, because this is a set, there is no particular order to the attributes.</Par>
          <Info>Example: We define the relation schema <Em>DepartmentsSchema</Em> = {`{d_id, d_name, manager_id, budget, nr_employees}`}.</Info>
        </>,
        <>
          <Par sx={{ mb: 1 }}>A <Term>tuple</Term> is a combination of values. We could write {`t = (a1, a2, a3)`}. Tuples in relational algebra are named: to access a value from the tuple {`t`} we need the corresponding attribute's name. Common notations for tuple values are {`t.A1`} or {`t[A1]`}.</Par>
          <Info>Example: A possible tuple for our relation schema is {`t = (4000, Human Resources, 42223311, 981450, 8)`}. We can now say that {`t.nr_employees = 8`}.</Info>
        </>,
        <>
          <Par sx={{ mb: 1 }}>A <Term>relation instance</Term> {`r`} is a set of tuples {`{t1, t2, ...}`}. We often write the relation instance as {`r(R)`} instead of just {`r`} to show "the instance {`r`} satisfies the schema {`R`}." This implicitly means that every tuple {`t in r(R)`} satisfies {`t[Ai] in dom(Ai)`} for every attribute {`Ai`}.</Par>
          <Info>Example: We may consider the relation instance <Em>departments(DepartmentsSchema) = {`{(5000, Operations, 41376655, 3308400, 12), (3000, Finance & Legal, 41655533, 2563000, 8), ...}`}</Em>.</Info>
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
