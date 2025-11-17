// Application constants
export const APP_NAME = 'SQL Valley';
export const APP_VERSION = '1.0.0';

// Theme colors
export const THEME_COLORS = {
  primary: '#c8102e',
  secondary: '#262626',
  success: '#98bc37',
  error: '#e73636',
} as const;

// Database schemas for skills
export const SKILL_SCHEMAS = {
  default: 'companies',
  'filter-rows': 'companies',
  'choose-columns': 'companies',
  'sort-rows': 'companies',
  'process-columns': 'positions',
  'filter-rows-multiple': 'companiesAndPositions',
  'join-tables': 'companiesAndPositions',
  'aggregate-columns': 'positions',
} as const;

// Required exercises to complete a skill
export const EXERCISES_TO_COMPLETE = 3;
