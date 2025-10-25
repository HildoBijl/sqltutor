import { Card, Tab, Tabs, Box } from '@mui/material';
import type { SyntheticEvent, ReactNode } from 'react';
import type { TabConfig } from '../types';

interface ContentTabsProps {
  value: string;
  tabs: TabConfig[];
  onChange: (event: SyntheticEvent, value: string) => void;
  children: ReactNode;
}

export function ContentTabs({ value, tabs, onChange, children }: ContentTabsProps) {
  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={value} onChange={onChange}>
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              label={tab.label}
              icon={tab.icon}
              iconPosition={tab.icon ? 'start' : undefined}
              disabled={tab.disabled}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Card>
  );
}
