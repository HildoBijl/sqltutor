import { Curve, Drawing } from '@sqlvalley/ui';
import type { Module } from '@sqlvalley/skill-tree-definition';
import { isReadyToLearn } from '@sqlvalley/skill-tree-definition';
import type { Vector } from '@sqlvalley/utils/geometry';
import { useTheme } from '@mui/material/';
import { NodeCard } from './SkillTreeComponents/NodeCard';
import { Tooltip } from './SkillTreeComponents/Tooltip';
import type { ModulePositionMeta } from '../utils/positionProcessing';
import { resolveConnectorStyle } from '../utils/graphics/connectorStyle';
import { useHoverState } from '../utils/graphics/mouseEvents';
import { useGoalProgress } from '../utils/logic/useGoalProgress';

/*
 * SkillTree component that renders the tree structure with nodes and connectors.
 * This is a pure rendering component without zoom/pan controls.
 * Uses the Drawing library for coordinate-based positioning.
 *
 * @param skillTree - Skill tree modules keyed by module ID.
 * @param modulePositions - Array of module position data entries to display.
 * @param treeBounds - The bounding box of the tree layout.
 * @param visiblePaths - Array of connector objects with points arrays and from/to node IDs.
 * @param isCompleted - Function to check if a module is completed.
 */
interface SkillTreeProps {
  skillTree: Record<string, Module>;
  modulePositions: Record<string, ModulePositionMeta>;
  treeBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  visiblePaths: { points: Vector[]; from: string; to: string }[];
  isCompleted: (id: string) => boolean;
  planningMode: boolean;
  goalNodeId?: string | null;
  setGoalNodeId?: (id: string | null) => void;
  onGoalProgressChange?: (
    completedCount: number,
    totalCount: number,
    nextStepName: string | null,
    nextStepId: string | null,
  ) => void;
  nextStepId?: string | null;
  staticMode?: boolean;
}

export function SkillTree({
  skillTree,
  modulePositions,
  treeBounds,
  visiblePaths,
  isCompleted,
  planningMode,
  goalNodeId,
  setGoalNodeId,
  onGoalProgressChange,
  nextStepId,
  staticMode,
}: SkillTreeProps) {
  const theme = useTheme();


  const onNavigate = (id: string) => {
    const item = skillTree[id];
    window.location.href = item.type === 'skill' ? `/skill/${id}` : `/concept/${id}`;
  }
  
  const {
    localHoveredId,
    prerequisites,
    tooltip,
    selectedId,
    handleHoverStart,
    handleHoverEnd,
    isConnectorInHoveredPath,
    handlePointerDown,
    handlePointerOutside,
  } = useHoverState(skillTree, onNavigate);

  const goalPath = useGoalProgress(
    goalNodeId,
    skillTree,
    isCompleted,
    onGoalProgressChange,
  );

  return (
    <div
      onPointerDown={handlePointerOutside}
      style={{
        position: 'relative',
        width: `${treeBounds.width}px`,
        height: `${treeBounds.height}px`,
        marginLeft: '35px',
        marginTop: '35px',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Drawing
        width={treeBounds.width}
        height={treeBounds.height}
        useSvg={true}
        useCanvas={false}
        autoScale={false}
      >
        {visiblePaths.map((connector, i) => {
          const { strokeColor, strokeWidth, opacity } = resolveConnectorStyle(
            connector,
            planningMode,
            goalNodeId,
            goalPath,
            localHoveredId,
            isCompleted,
            skillTree,
            isConnectorInHoveredPath,
            staticMode,
          );

          return (
            <Curve
              key={i}
              points={connector.points}
              color={strokeColor}
              size={strokeWidth}
              curveDistance={20}
              style={{ opacity }}
            />
          );
        })}

        {Object.values(modulePositions).map((positionData) => {
          const item = skillTree[positionData.id];
          if (!item) return null;

          const readyToLearn = isReadyToLearn(skillTree, item.id, isCompleted);

          return (
            <g
              key={item.id}
              onMouseEnter={() => handleHoverStart(item.id)}
              onMouseLeave={handleHoverEnd}
              onPointerDown={(e) => {
                e.stopPropagation();
                const isGoal = planningMode && goalNodeId === item.id;
                handlePointerDown(item.id, e, isGoal);
              }}
            >
              <NodeCard
                item={item}
                positionData={modulePositions[item.id]}
                completed={isCompleted(item.id)}
                isHovered={localHoveredId === item.id}
                readyToLearn={readyToLearn}
                isPrerequisite={prerequisites.has(item.id)}
                isSomethingHovered={localHoveredId !== null}
                isSelected={selectedId === item.id}
                planningMode={planningMode}
                hasGoal={planningMode && !!goalNodeId}
                isGoalNode={planningMode && goalNodeId === item.id}
                isOnGoalPath={planningMode && goalPath.has(item.id)}
                onSetGoal={() => {
                  if (planningMode && setGoalNodeId) {
                    setGoalNodeId(goalNodeId === item.id ? null : item.id);
                  }
                }}
                nextStepId={nextStepId}
                staticMode={staticMode}
              />
            </g>
          );
        })}

        <Tooltip>{tooltip}</Tooltip>
      </Drawing>
    </div>
  );
}
