import { Par, Head, SQL } from 'components'

export function Theory() {
	return <>
		<Par>SQL is the world's most often used query language. What is so special about this query language?</Par>

		<Head>A basic query</Head>
		<Par>One advantage of SQL is that its queries read a bit like regular text, making the queries somewhat easy to understand. The most basic SQL query is</Par>
		<SQL>{`
SELECT *
FROM TechCompanies;
		`}</SQL>
		<Par>Here the asterisk * means "all columns". So this query reads as "Select everything from the table TechCompanies." It retrieves the entire table. It's a query that is very often used in practice.</Par>
		<Par>We can append a large amount of extra options and specifications to a query. This allows us to select and process the data in any desired way. Since SQL is a very mature query language, developed through various decades, there are usually dozens of ways to do whatever it is that we want to do.</Par>

		<Head>Properties of queries</Head>
		<Par>SQL is a very forgiving query language: if you write a query differently, it often still works. We could have also written the above query as</Par>
		<SQL>select * from TechCompanies</SQL>
		<Par>In SQL extra whitespace (spaces, tabs, linebreaks) has no effect. As a result, this is often used to clean up the query, improving the overview and readability. Fundamental SQL commands like "select" and "from" are not case sensitive. They are usually written in upper case to make them easier to recognize, and we will also adhere to this standard. Table names usually are case sensitive, although this varies per DBMS.</Par>
		<Par>Also note that queries are usually closed off by a semi-colon. The semi-colon means "end of query". In case of multiple queries, it is an important separator. If you only write one query, it's often omitted.</Par>

		<Head>History of SQL</Head>
		<Par>Though not crucial to understand SQL, it is interesting to look a bit into its history.</Par>
		<Par>The development of SQL started in 1970 at IBM. Initially it was called SQUARE, but an improved version was named SEQUEL, standing for Structured English Query Language. This name was already trade-marked, so it was shortened to SQL. Many say SQL standards for "Structured Query Language" but officially this is not the case. SQL is just a name, where the letters do not stand for anything specific. Its pronunciation is also subject to debate, where some pronounce the letters separately as "Es Qu El", while others simply say "Sequel".</Par>
		<Par>In 1986 the American National Standards Institute (ANSI) and the International Organization for Standardization (ISO) defined a standard for the "Database Language SQL". This standard has since been used by database developers to make sure that their DBMS adheres to the standards. Although sadly minor variations still often appear: every DBMS has its own interpretations of the standards.</Par>
		<Par>Throughout the subsequent decades, the standard has been updated every few years. The goal of these updates is to adapt to technological developments, as well as incorporate new features requested by users. As a result, SQL has become a very rich query language with numerous possibilities. At the same time, it is also criticized as a rather chaotic query language, allowing for far too many ways to do the exact same thing.</Par>
	</>
}
