import { Page, Section, Par, Quote, List, Warning, Info, Term, Em } from '@/components';
import { ISQL } from '@/components';

import { FigureExampleQuery } from '../queryFigures';

export function Theory() {
  return <Page>
    <Section>
      <Par>We know of multiple ways to combine data from multiple tables: we can look up records based on keys, or just join the tables altogether. These techniques form the basis behind all queries. But when the requests for data get complicated, it gets harder and harder to use these tools to set up the right queries. There is no query-writing strategy that works all the time, but there <Em>are</Em> various tricks that we can use. We'll study a few of them.</Par>
    </Section>

    <Section title="Trick 1. Improve your intuition of the data set: perform the query manually">
      <Par>Suppose that we have a list of products that can be sold, a list of customer accounts, and a list of transactions (who purchased which product). Let's consider a request.</Par>
      <Quote>Find the IDs of the accounts that bought a "Fine Art" product.</Quote>
      <Par>To set up a query for this request (or any request for that matter), it helps to first perform the query manually. Browse through the tables and see what you would do yourself if you'd have to find the respective data without any computer.</Par>
      <Info>Why not go to the Data Explorer and briefly try this out for yourself?</Info>
      <Par>There are several thoughts that we could get when we try this. <List items={[
        <>To start, we go the accounts table, and for every account we go through all transactions where that account is the buyer, and for each transaction we look up the product, and see if it has the right category. Soon we find that this will be a very slow process.</>,
        <>But then we realize that there are only a few "Fine Art" products. So it might be better to first make a list of products that fall in the "Fine Art" category? That makes it easier to check if a product is "Fine Art".</>,
        <>Then we realize there might be accounts that have bought multiple "Fine Art" products. If we find one, we don't have to browse further. That also simplifies matters.</>,
        <>And then we realize that we only need the ID of the buyer, and no other info. So we don't need the accounts table at all!</>,
      ]} /> Through these steps, we can simplify our manual process of finding the required data. Once we have a good process in our head of how we would get the data, we can start turning this into a query.</Par>
    </Section>

    <Section title="Trick 2. Get rid of ambiguous language: rephrase the request">
      <Par>SQL would not understand the above example request. For starters, it does not know the concept of "buying", and the request also doesn't specify that "Fine Art" refers to <ISQL>category</ISQL>. It helps to bring our English-language request a bit closer to something SQL might understand, making the step we have to take turning it into a query a bit smaller. Specifically, we can do two things.</Par>
      <List items={[
        <>Change all <Em>verbs</Em> to words that SQL is familiar with. SQL is strong with things like "exists", "is in a list", or similar.</>,
        <>Change all <Em>nouns</Em> to things that exist in our database: either table rows, or specific attributes within a row. When rows are linked through foreign keys, we can use the word "corresponding".</>,
      ]} />
      <Par>If we use these ideas to rewrite the query, we can get the following.</Par>
      {/* <Par>To solve this, it helps to rephrase the English-language text using words that SQL knows: words like "exists". An equivalent query would be:</Par> */}
      <Quote>Find the IDs of all accounts for which there exists a corresponding transaction (as buyer), where the corresponding product has category equal to "Fine Art".</Quote>
      <Par>This is a query that can directly be turned into SQL. For "corresponding" we use a join, which gives the following result.</Par>
      <FigureExampleQuery query={`
SELECT acct_id
FROM accounts AS a
JOIN transactions AS t
ON a.acct_id = t.buyer_id
JOIN products AS p
ON t.prod_id = p.p_id
WHERE p.category = 'Fine Art';`} tableWidth={240} tableScale={0.7} />
      <Par>This gives us a first idea of a query to work with.</Par>
    </Section>

    <Section title="Trick 3. Optimize the result: try different tools">
      <Par>Once we have a query that works, we're far from done! Usually the first draft of a query is messy. It may be inefficient from a computational point of view, and hard for humans to understand on top of that. We can simplify it! This can be done using the intuitive ideas we found at step 1, and/or by trying different tools within SQL. When doing so, it also helps to rewrite the English-language request, to check if it still means the same thing.</Par>
      <Par>Let's try this out on our example. We have already realized we don't really need the <ISQL>accounts</ISQL> table. We could cut that out. That gives the following request/query.</Par>
      <Quote>Find the IDs of the transaction buyers for which the corresponding product has category equal to "Fine Art".</Quote>
      <FigureExampleQuery query={`
SELECT buyer_id
FROM transactions AS t
JOIN products AS p
ON t.prod_id = p.p_id
WHERE p.category = 'Fine Art';`} tableWidth={240} tableScale={0.7} />
      <Par>We have also realized that we could first create a list of all "Fine Art" products. We then check if the product is in this list. Using this idea, we can again rewrite our request/query.</Par>
      <Quote>Find the IDs of the transaction buyers for which the corresponding product is in the list of products with category equal to "Fine Art".</Quote>
      <FigureExampleQuery query={`
SELECT buyer_id
FROM transactions
WHERE prod_id IN (
  SELECT p_id
  FROM products
  WHERE category = 'Fine Art'
);`} tableWidth={240} tableScale={0.7} />
      <Par>The latter query seems easier to understand than the one before. Computationally it is also better. In the previous query (with <ISQL>JOIN</ISQL>), we have to look up the product's category for <Em>all</Em> transactions. This uses the <ISQL>products</ISQL> table many times. In this last query (with <ISQL>IN</ISQL>), we only access the <ISQL>products</ISQL> table once. It makes the query much faster.</Par>
      <Info>Databases internally use optimizers. If the DBMS gets the earlier example with joins, there's a very good chance it will already recognize it can be done more efficiently, and not set up the entire join. So perhaps both queries will result in a similar run-time. Nevertheless, it's good practice not to rely too much on the DBMS optimizers, and keep your own query as efficient as possible.</Info>
    </Section>

    <Section title={`Trick 4. Work in steps: set up sub-queries from inside to outside`}>
      <Par>In the last query we have applied two steps. First we created a list of Fine Art products, and then we found the corresponding buyers of them. If we already know in advance (after trick 1) that we would do this, we could have built up our query step by step.</Par>
      <Par>First we find a list of all Fine Art products. We can test it, to see if it works as intended.</Par>
      <Quote>Find the IDs of all products whose category equals "Fine Art".</Quote>
      <FigureExampleQuery query={`
SELECT p_id
FROM products
WHERE category = 'Fine Art';`} tableWidth={120} tableScale={0.7} />
      <Info>Testing parts of your query is very important. It's easy to make a mistake in SQL, so by testing early, you find your mistakes early, when it's still easy to identify them.</Info>
      <Par>Once we have this list, we can build the next step of our query <Em>around</Em> it.</Par>
      <Quote>Find the IDs of the transaction buyers for which the corresponding product is in the list of products with category equal to "Fine Art".</Quote>
      <FigureExampleQuery query={`
SELECT buyer_id
FROM transactions
WHERE prod_id IN (
  SELECT p_id
  FROM products
  WHERE category = 'Fine Art'
);`} tableWidth={240} tableScale={0.7} />
      <Par>In many applications, we may need to go further. Perhaps we don't just want the ID of the buyer, but also the username? Through this layered approach, it is very easy to add this. We just add another look-up.</Par>
      <Quote>Find the IDs and usernames of the accounts for which the account ID is in the list of buyers for transactions where the corresponding product is in the list of products with category equal to "Fine Art".</Quote>
      <FigureExampleQuery query={`
SELECT acct_id, username
FROM accounts
WHERE acct_id IN (
  SELECT buyer_id
  FROM transactions
  WHERE prod_id IN (
    SELECT p_id
    FROM products
    WHERE category = 'Fine Art'
  )
);`} tableWidth={300} tableScale={0.7} />
      <Warning>Setting up a query from inside to outside, testing every step of the way, is very common. It does only work for non-correlated queries, and not for correlated queries. This is yet another reason to use non-correlated queries whenever possible.</Warning>
    </Section>

    <Section title={`Trick 5. Deal with the word "All": rephrase it using a double negative`}>
      <Par>Let's consider a more complicated request.</Par>
      <Quote>Find the IDs of the accounts who have bought a product in <strong>all</strong> categories.</Quote>
      <Par>The word "all" here is easy for humans to understand, but it completely changes the process. To see how, we could apply trick 1 and run the query manually. <List items={[
        <>We'd first have to find a list of all product categories.</>,
        <>For each account, we'd have to find all transactions, and look up the corresponding product categories.</>,
        <>We'd have to then tick off the categories in our list, to see if an account has <Em>all</Em> of them.</>,
        <>Once we've gone through all transactions for a given account, we should check if we've ticked off all categories.</>,
      ]} /> It's a lot of work! Isn't there an easier trick?</Par>
      <Par>The solution is to use trick 2: we rephrase the request, and we do so using a negative. Keep in mind that SQL does not know the word "all" but it does know the word "exists". The word "all" means "there does not exist anything of the opposite". So we could rephrase our request using such a double negative.</Par>
      <Quote>Find the IDs of the accounts for which there does not exist a product category which the respective account has not bought a product in.</Quote>
      <Par>Note that this request means the same as the one above, but then uses the words "exists" and "not" rather than "all". It's what we need to set up a query in SQL.</Par>
      <FigureExampleQuery query={`
SELECT acct_id
FROM accounts AS a
WHERE NOT EXISTS (
  SELECT 1
  FROM products AS p1
  WHERE NOT EXISTS (
    SELECT 1
    FROM transactions AS t
    JOIN products AS p2
    ON t.prod_id = p2.p_id
    WHERE a.acct_id = t.buyer_id
      AND p1.category = p2.category
  )
);`} tableWidth={300} tableScale={0.7} />
      <Par>This query is hard to understand, because it is a correlated query: it uses the outer attribute <ISQL>a.acct_id</ISQL> somewhere deep within its inner query. To understand it, it helps to see correlated queries as iterations. <List items={[
        <>In the outer layer, we iterate over all accounts. Every time, we consider some account ID <ISQL>a.acct_id</ISQL>.</>,
        <>In the middle layer, we iterate over all products. (But since we only use <ISQL>p1.category</ISQL>, we actually iterate over all product categories.) Every iteration, we consider some product category <ISQL>p1.category</ISQL>.</>,
        <>In the inner layer, we check whether there is a transaction for the given account in the given product category.</>,
      ]} /> Eventually, we find the accounts for which there is no category in which no products have been bought by the respective account.</Par>
    </Section>

    <Section title={`Trick 6. Check your result using an example`}>
      <Par>The final step, whenever writing queries, always is to check your results. The best way to do so is using examples. Here we should check at least one <Term>positive</Term> example (that does appear in our output) and one <Term>negative</Term> example (that is omitted from the output).</Par>
      <Par>Consider once more the first example.</Par>
      <Quote>Find the IDs and usernames of the accounts that bought a "Fine Art" product.</Quote>
      <FigureExampleQuery query={`
SELECT acct_id, username
FROM accounts
WHERE acct_id IN (
  SELECT buyer_id
  FROM transactions
  WHERE prod_id IN (
    SELECT p_id
    FROM products
    WHERE category = 'Fine Art'
  )
);`} tableWidth={300} tableScale={0.7} />
      <Par>To check if this is the correct output, we should take one random sample from this output (okay, there only is one here), dive into the tables, and see if this person really meets the criteria. When we do, we see that user <ISQL>mkinseyap</ISQL> indeed bought a "Fine Art" product, being the "Frida Kahlo Self-Portrait Sketch".</Par>
      <Info>When running these checks, the Data Explorer is your friend! But you can also quickly write some basic queries for support.</Info>
      <Par>To check a negative example, we take one (random) account that is <Em>not</Em> in our output. For instance, we consider the user <ISQL>fisherman15</ISQL> and look up the products that this user has bought.</Par>
      <FigureExampleQuery query={`
SELECT a.username, t.t_id, t.date_time, p.p_id, p.name, p.category
FROM accounts AS a
JOIN transactions AS t
ON a.acct_id = t.buyer_id
JOIN products AS p
ON t.prod_id = p.p_id
WHERE a.username = 'fisherman15';`} tableWidth={600} tableScale={0.7} below />
      <Par>Indeed, this person has not bought any "Fine Art" products, which corresponds with the output of our query.</Par>
      <Warning>A check with such a small sample of course does not guarantee that our query is correct. To be fully certain, we'd have to check <Em>all</Em> accounts. But a quick check like this does filter out any obvious errors. It's always worthwhile to do so.</Warning>
    </Section>
  </Page>;
}
