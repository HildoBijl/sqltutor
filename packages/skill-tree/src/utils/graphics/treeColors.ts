// Semantic color palette for the skill tree.
// Node borders, connectors, icons, and planning-mode UI all draw from
// these so a status color is only ever defined once.
export const treeColors = {
  // Module status.
  completed: '#4CAF50',
  completedFaded: 'rgba(76, 175, 80, 0.4)',
  ready: '#FFD700',
  locked: '#E84421',

  // Planning-mode goal.
  goal: 'purple',
  goalHover: '#6a0dad',
  goalContrastText: '#ffffff',

  // Neutral chrome.
  neutral: '#9aa0a6',
  faded: '#e0e0e0',
  icon: '#616161',
} as const;
