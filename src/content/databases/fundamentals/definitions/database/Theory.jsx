import { Head, Par, List, Info, Warning, Term, Link } from 'components'

export function Theory() {
	return <>
		<Par>Suppose that we have a list of all the tech companies in the world, including a large number of properties of each. How would we store this data? Could we just put it in something like an Excel file?</Par>
		<Par>ToDo: add table</Par>

		<Head>Why databases? A list of requirements</Head>
		<Par>For many small-scale use cases, storing data in a single file would work. When scaling up, there are various reasons why this fails.</Par>
		<List items={[
			<>When the number of records gets into the millions, it becomes too big for one file. Computers cannot keep it all in their working memory. We need a solution that can <strong>deal with large amounts of data</strong>.</>,
			<>Finding any desired records will be a challenge. We need a solution that we can <strong>easily ask questions extracting data</strong>, like "How many data science companies are there in the Netherlands right now?"</>,
			<>Perhaps we want to build a website where users can add new tech companies. This website (basically a computer script) should be able to adjust the data, also when multiple users use it at the same time. We hence need a solution in which <strong>applications can adjust data concurrently</strong>.</>,
		]} />
		<Par>To meet all these requirements, databases and corresponding software tools have been created.</Par>

		<Head>Database: a collection of tables</Head>
		<Par>A <Term>database</Term> stores data. Most databases do so purely in table form. The easiest way to picture a database is therefore as a collection of tables, each filled with potentially large amounts of entries. A small database consists of a few small tables, but bigger databases can have dozens of enormous tables that are all linked to each other in some way.</Par>
		<Par>ToDo: add second table, that is somehow linked to the first.</Par>
		<Info>There are a few databases that deviate from this set-up and don't use tables, but instead store objects (like <Link to="https://www.mongodb.com/">MongoDB</Link>), graphs (like <Link to="https://neo4j.com/">Neo4j</Link>) or key-value pairs (like <Link to="https://redis.io/">Redis</Link>). Since this only involves a small subset of all databases, we focus on table-based databases for now.</Info>

		<Head>The Database Management System</Head>
		<Par>The "database" is the collection of all the data that's stored somewhere. To get this data stored in the desired way, we use a specialized program called the <Term>Database Management System</Term> (DBMS). Examples of DBMSs that use tables are <Link to="https://www.postgresql.org/">PostgreSQL</Link>, <Link to="https://www.mysql.com/">MySQL</Link>, <Link to="https://www.oracle.com/database/">Oracle</Link>, <Link to="https://sqlite.org/">SQLite</Link> and dozens more. The DBMS handles all functionalities around the database, allowing users to read and write data.</Par>
		<Par>ToDo: add image to show the flow of the database requests.</Par>
		<Par>Every DBMS has its own specific way of how exactly it stores its data. As a result, a DBMS and a database are inextricably linked. You cannot just take a database and couple it to a different DBMS. It is possible (and common) that a single DBMS has multiple different databases on the same machine.</Par>
		<Warning>Because a database and its DBMS are so linked, people often use the word "database" when they actually mean DBMS. "Hey, which database are you using at SQL Valley? Oh, we're using SQLite!"</Warning>
	</>
}
