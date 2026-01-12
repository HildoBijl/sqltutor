import { List, RelationName, PrimaryKey, ForeignKey } from '@/components';

export function CompaniesSchema() {
	return <List items={[
		<><RelationName>employee</RelationName> (<PrimaryKey>person_name</PrimaryKey>, street, city)</>,
		<><RelationName>works</RelationName> (<PrimaryKey><ForeignKey>person_name</ForeignKey></PrimaryKey>, <ForeignKey>company_name</ForeignKey>, salary)</>,
		<><RelationName>company</RelationName> (<PrimaryKey>company_name</PrimaryKey>, city)</>,
		<><RelationName>manages</RelationName> (<PrimaryKey><ForeignKey>person_name</ForeignKey></PrimaryKey>, <ForeignKey>manager_name</ForeignKey>)</>,
	]} />
}
