import { type ReactNode } from 'react';
import { List as MuiList, ListItem, type ListProps as MuiListProps, Stack } from '@mui/material';

export type ListProps = {
  items: ReactNode[];
  useNumbers?: boolean;
  sx?: MuiListProps['sx'];
  itemSx?: MuiListProps['sx'];
  contentSpacing?: number;
};

export function List({ items, useNumbers = false, sx, itemSx, contentSpacing }: ListProps) {
  if (!items || !Array.isArray(items))
    throw new Error(`Invalid list items: expected an array "items" property, but received something of type ${typeof items}.`);

  return <MuiList
    component={useNumbers ? 'ol' : 'ul'}
    sx={{
      textAlign: 'justify',
      listStyleType: useNumbers ? 'decimal' : 'disc',
      paddingY: 0,
      paddingLeft: 3,
      ...sx,
    }}
  >
    {items.map((item, index) => (
      <ListItem
        key={index}
        sx={{
          display: 'list-item',
          paddingY: 0.3,
          paddingLeft: 0,
          ...itemSx,
        }}
      >
        {contentSpacing === undefined ? item : <Stack spacing={contentSpacing}>{item}</Stack>}
      </ListItem>
    ))}
  </MuiList>;
}
