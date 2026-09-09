export { SkillTreeCanvas, type SkillTreeCanvasProps } from './components/SkillTreeCanvas';
export { useTreeBounds } from './hooks/useTreeBounds';
export { computeConnectorPath } from './utils/graphics/pathCalculations';
export { treeColors } from './utils/graphics/treeColors';
export { defineSkillTree, type SkillTreeDefinitionOptions } from './utils/defineSkillTree';
export {
  columnSpacing,
  gridToPixels,
  rowSpacing,
  type GridPosition,
} from './utils/gridLayout';
export {
  processModulePositions,
  type ModuleConnector,
  type ModulePositionMeta,
  type ModulePositionMetaRaw,
  type ProcessModulePositionsOptions,
  type ProcessedModulePositions,
} from './utils/positionProcessing';
export {
  cardHeight,
  cardWidth,
  initialPathSpacing,
  maxPathSpace,
  maxVerticalOffset,
  minVerticalOffset,
  treeMargin,
} from './utils/settings';
