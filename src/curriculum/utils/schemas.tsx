import { List, Term, RelationName, PrimaryKey, ForeignKey } from '@/components';

export function CompaniesSchema() {
	return <List items={[
		<><RelationName>employee</RelationName> (<PrimaryKey>person_name</PrimaryKey>, street, city)</>,
		<><RelationName>works</RelationName> (<PrimaryKey><ForeignKey>person_name</ForeignKey></PrimaryKey>, <ForeignKey>company_name</ForeignKey>, salary)</>,
		<><RelationName>company</RelationName> (<PrimaryKey>company_name</PrimaryKey>, city)</>,
		<><RelationName>manages</RelationName> (<PrimaryKey><ForeignKey>person_name</ForeignKey></PrimaryKey>, <ForeignKey>manager_name</ForeignKey>)</>,
	]} />
}

export function ShoppingSchema() {
	return <List items={[
		<><RelationName>customer</RelationName> (<PrimaryKey>cID</PrimaryKey>, cName, street, city) - Customers with a unique ID.</>,
		<><RelationName>store</RelationName> (<PrimaryKey>sID</PrimaryKey>, sName, street, city) - Stores with a unique ID. Stores with different ID but the same name are called a <Term>store chain</Term>.</>,
		<><RelationName>product</RelationName> (<PrimaryKey>pID</PrimaryKey>, pName, suffix) - The products that exist. The suffix can indicate content/size (like "0.5l" for milk or "half" for bread).</>,
		<><RelationName>shoppinglist</RelationName> (<PrimaryKey><ForeignKey>cID</ForeignKey></PrimaryKey>, <PrimaryKey><ForeignKey>pID</ForeignKey></PrimaryKey>, <PrimaryKey>date</PrimaryKey>, quantity) - The products a customer wants to buy on a certain date.</>,
		<><RelationName>purchase</RelationName> (<PrimaryKey>tID</PrimaryKey>, <ForeignKey>cID</ForeignKey>, <ForeignKey>sID</ForeignKey>, <PrimaryKey><ForeignKey>pID</ForeignKey></PrimaryKey>, date, quantity, price) - The actual purchases made by a customer at a store. We assume a customer only visits a store at most once per day. Each visit (combination of (cID, sID, date)) gets assigned a unique transaction ID <PrimaryKey>tID</PrimaryKey>. The price is the unit price per product.</>,
		<><RelationName>inventory</RelationName> (<PrimaryKey><ForeignKey>sID</ForeignKey></PrimaryKey>, <PrimaryKey><ForeignKey>pID</ForeignKey></PrimaryKey>, <PrimaryKey>date</PrimaryKey>, quantity, unit_price) - The inventory/stock of each store at the start of each day. Note that product unit prices are not fixed, but may vary per store and per day.</>,
	]} />
}
