import { Page, Section, Par, List, Warning, Info, Term, Em, RelationName, PrimaryKey, ISQL } from '@/components';

import { FigureSingleTable } from '@/curriculum/utils/queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know that, in a database table, the columns have names but the rows do not. How can we then point to a specific row? The key (pun intended) lies in <Term>keys</Term>.</Par>
    </Section>

    <Section title="Superkey: a set of attributes uniquely identifying a row">
      <Par>Let's consider the table of all employees of a company.</Par>
      <FigureSingleTable query={`SELECT * FROM employees;`} title="List of employees" tableWidth={800} tableScale={0.65} />
      <Par>If you want to point me to a specific row, you could try the following.</Par>
      <List items={[
        <>"Take the fourth row." This may fail, since the ordering is arbitrary. Maybe someone orders the rows differently, and I end up at a different row.</>,
        <>"Take the row where the city is Palo Alto." This also fails, since there are multiple people living there.</>,
        <>"Take the row of Paris Casteel." Now we're getting somewhere! After all, the combination of <ISQL>first_name</ISQL> and <ISQL>last_name</ISQL> seems to be unique.</>
      ]} />
      <Par>Let's assume our table does not have duplicate rows. A <Term>superkey</Term> is a set of attributes (for instance <ISQL>{`{first_name, last_name}`}</ISQL>) whose values are unique for all rows. These attributes can be used to uniquely identify the row.</Par>
      <Info>Just to be clear: we don't mean that <Em>every</Em> value of a superkey is unique. Not everyone has to have a different first name! We mean that the <Em>combined</Em> values are unique. We have <ISQL>{`{first_name, last_name}`}</ISQL> as a superkey if if everyone has a different combination of first and last name.</Info>
      <Par>But what if the table may have duplicate rows? In this case, there is <Em>no</Em> way of distinguishing between identical rows. But we <Em>can</Em> distinguish between non-identical rows. In this case, a <Term>superkey</Term> is a set of attributes such that, whenever two rows have the same value for <Em>these</Em> attributes, then they always have the same value for <Em>all other</Em> attributes (and are hence duplicate rows). Note that this definition extends our earlier definition, to also work for tables with duplicate rows.</Par>
    </Section>

    <Section title="Candidate key: a minimal superkey">
      <Par>If I tell you to find the row of "Paris Casteel from Palo Alto" then you can uniquely do so. The set <ISQL>{`{first_name, last_name, city}`}</ISQL> is a superkey. However, we don't need the city. The smaller set <ISQL>{`{first_name, last_name}`}</ISQL> is also a superkey! So the first set had superfluous attributes. This idea leads to the following definition.</Par>
      <Par>A <Term>candidate key</Term> is a set of attributes that is a superkey, but if we remove any single attribute, the set is not a superkey anymore, irrespective of which attribute we remove. So in a way, a candidate key is a <Em>minimal</Em> superkey. Note that <ISQL>{`{first_name, last_name, city}`}</ISQL> is not a candidate key (only a superkey) but <ISQL>{`{first_name, last_name}`}</ISQL> is a candidate key.</Par>
      <Warning>Note that a candidate key is not necessarily minimal in the <Em>number</Em> of attributes. Whereas the set containing only the employee ID <ISQL>{`{e_id}`}</ISQL> is a candidate key with one attribute, the set <ISQL>{`{first_name, last_name}`}</ISQL> is a candidate key with two attributes. They're both valid candidate keys! The fact that one candidate key has more attributes than the other is irrelevant. The candidate key definition only requires us to not be able to <Em>remove</Em> any attributes without losing superkey status.</Warning>
      <Info>When finding candidate keys, it is helpful to not only look at your data now, but also what <Em>future</Em> data you may obtain. In the small example above all the names are unique, but maybe in the future this will not be the case anymore! Duplicate names do occur in practice, just like people sharing the same address or even the same phone number. When determining the candidate keys for a table, we usually consider potential future data too.</Info>
    </Section>

    <Section title="Primary key: a chosen candidate key">
      <Par>Once we have determined various candidate keys for a table, we choose one as the so-called <Term>primary key</Term>. This primary key is effectively an "agreement": whenever we refer to a specific row within a table, we agree to refer to it through <Em>those</Em> attributes.</Par>
      <Par>The choice of primary key is not a mathematical one, but one of convenience. What do we consider to be a good way of referring to a specific row? One might argue that <ISQL>email</ISQL> is a good way, as it's recognizable. However, it is very important that the primary key never changes. (Otherwise, whenever it changes, we have to change it <Em>everywhere</Em>.) Since an email address might potentially change, and even a name could be altered, using the Employee ID <ISQL>e_id</ISQL> seems to be the best choice for primary key here.</Par>
      <Info>Note that the definitions of superkey and candidate key are mathematical: it is always clear which sets of attributes are superkeys and candidate keys. However, the primary key is a human choice: there could always be arguments to use one over the other.</Info>
      <Par>The primary key is indicated in the schema through an underline.</Par>
      <List items={[<><RelationName>employees</RelationName> (<PrimaryKey>e_id</PrimaryKey>, first_name, last_name, phone, email, address, city, hire_date, current_salary)</>]} />
      <Par>In the case where the primary key consists of multiple attributes (like for instance <ISQL>{`{first_name, last_name}`}</ISQL>) then <Em>all</Em> the respective attributes are underlined.</Par>
      <List items={[<><RelationName>employees</RelationName> (e_id, <PrimaryKey>first_name</PrimaryKey>, <PrimaryKey>last_name</PrimaryKey>, phone, email, address, city, hire_date, current_salary)</>]} />
      <Warning>By defining a primary key, we <Em>require</Em> these attributes (their combination) to be unique. If we define <ISQL>{`{first_name, last_name}`}</ISQL> as primary key, no two people with the same name may be entered into the table. The database won't allow it!</Warning>
    </Section>
  </Page>;
}
