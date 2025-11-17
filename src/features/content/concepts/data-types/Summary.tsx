import { Page, Section, Par, Warning, Info, Term, Em } from '@/components';
import { SQLDisplay } from '@/shared/components/SQLEditor';

export function Summary() {
  return <Page>
    <Section>
      <Par>In a database table, every column has a specific <Term>data type</Term>, like <Term>number</Term>, <Term>text</Term>, or <Term>date/time</Term> values. Columns may only contain values from their specified type. Additionally, columns may be given extra restrictions on what values they may hold: the set of allowed values is called the <Term>domain</Term>.</Par>
      <Warning>ToDo: add image. Base it on the table from the Theory page, and add notes on number, text, Date, etcetera. Add positive integers or similar.</Warning>
      <Par>Table cells cannot be empty, but (if allowed by the domain) they <Em>can</Em> be given the value <SQLDisplay inline>NULL</SQLDisplay>. This is a special database value that usually means the real value is unknown or not applicable.</Par>
      <Info>When setting up a database table in practice, you need to precisely specify the data type of each column and how much range/precision you need. This is done through various specific types, like <SQLDisplay inline>TINYINT</SQLDisplay>, <SQLDisplay inline>SMALLINT</SQLDisplay>, <SQLDisplay inline>INTEGER</SQLDisplay> or <SQLDisplay inline>BIGINT</SQLDisplay> for whole numbers. A bigger range/precision gives more possibilities, but also requires more storage space. The exact types differ per DBMS, so always look up the specifications for the DBMS you are using.</Info>
    </Section>
  </Page>;
}
