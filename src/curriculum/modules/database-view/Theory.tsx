import { Page, Section, Par, Warning, Info, Quote, Term, Em } from '@/components';

import { FigureSingleTable } from '@/curriculum/utils/queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know how we can adjust a database table through operations like projection and filtering. Through them we can find certain data. But what happens if we are often interested in the same set of data?</Par>
    </Section>

    <Section title="The problem: repeated requests for the same data">
      <Par>Suppose that we have a list of departments (including manager) and a list of employee data. Using this, we can generate an overview of the phone numbers of all department managers. This is a useful list to have for any company: it shows how to contact whoever is in charge.</Par>
      <Par>To generate this list, we could give an instruction to the DBMS. The DBMS would then build the list for us. We could then print it out multiple times and hang it up all over the company.</Par>
      <Quote>Make a list of department names including, for every department, who manages it: the manager's name and phone number.</Quote>
      <FigureSingleTable query={`SELECT d_name, first_name AS manager_name, phone FROM departments JOIN employees ON manager_id=e_id;`} title="Department manager contact data" tableWidth={400} tableScale={0.8} />
      <Par>The problem appears when changes occur. Maybe a department changes manager, or a manager changes phone number. We'd have to update this list in all places where we hung it up!</Par>
      <Par>The solution to this problem is quite simple: don't store this list. (And don't print it out and hang it up.) Whenever someone needs the contact information for all managers, just ask the DBMS again. It'll freshly assemble the data for us, including the latest updates. This ensures that the data is always up-to-date.</Par>
      <Par>But this creates a new problem. Every time we'd want to get the list of manager contact data, we'd have to give the above (somewhat long) instructions to the database. Doing this over and over again could become tiring. Isn't there an easier way?</Par>
    </Section>

    <Section title={`Define a view: provide a "recipe"`}>
      <Par>The solution is to define the "manager contact data" table for the DBMS. We basically tell the DBMS once:</Par>
      <Quote>The "manager contact data" table is: A list of department names including, for every department, who manages it: the manager's name and phone number.</Quote>
      <Par>We have now defined a so-called <Term>view</Term>. A view is basically an instruction for the DBMS to set up a derived table. It's a 'recipe' for a table, if you will, based on other already known tables.</Par>
      <Par>Whenever a DBMS receives this <Term>view definition</Term>, it doesn't generate this new table just yet. Maybe no one is interested in the manager contact data just yet! It only remembers the instructions for later use.</Par>
      <Warning>Keep in mind: a view is never stored! Well ... almost never. If you request the same data <Em>very</Em> often, it <Em>may</Em> be wise to actually store the view as well. You then get a so-called <Term>materialized view</Term>. This is a concept of its own, with its own challenges, so we don't go into this idea here.</Warning>
    </Section>

    <Section title="Use a view: ask for it">
      <Par>Once we have defined a view, we can use it. In its most simple form, we could directly request the table from the DBMS. "Please give me the manager contact data table." The DBMS would assemble it for us based on the provided view definition.</Par>
      <Par>We could also use the view like we would use any other table. For instance, we can apply further table operations to it like projection and/or filtering.</Par>
      <Quote>Find the names of all department managers with a 650 area code.</Quote>
      <FigureSingleTable query={`SELECT first_name AS manager_name FROM departments JOIN employees ON manager_id=e_id WHERE phone LIKE '650%';`} tableWidth={100} tableScale={0.8} />
      <Par>The DBMS once more assembles the table for us, and then applies the requested operations.</Par>
      <Info>Okay, in practice, the above isn't fully correct: the DBMS doesn't assemble the full manager contact data table. It always tries to make some optimizations. For example, in the above case, the department names aren't relevant, so those are never looked up. But again, query optimization is a whole concept of its own.</Info>
    </Section>

    <Section title="Use cases for views">
      <Par>Views are useful tools to easily access derived data. As we have seen above, if we have set up some useful derived table, we can turn it into a view, and then easily access it later on.</Par>
      <Par>Another powerful use case is <Term>access control</Term>. In our example, we want to give all company employees access to the phone numbers of all department managers. These phone numbers are stored in the "employees" table. But we <Em>don't</Em> want to give all employees access to this table. That would be a huge violation of privacy!</Par>
      <Par>Once more, the solution is to create a view: the manager contact data view. We can then specifically give all employees access to this view, while only HR employees get access to the full employee table. Privacy breach averted! So with views we can properly control who can access which data, regardless of how the data is actually stored.</Par>
      <Info>A small note on terminology: we distinguish <Term>base tables</Term> (the tables that are stored) and <Term>views</Term> (tables that are not stored, but can be derived using fixed instructions). We call the original database (all base tables) the <Term>Extensional Database</Term> (EDB) and the extra tables added through views the <Term>Intensional Database</Term> (IDB). Those latter terms are however only used when you dive further into logic theory, for instance when using query languages like Datalog. So there's a good chance you'll never see them again.</Info>
    </Section>
  </Page>;
}
