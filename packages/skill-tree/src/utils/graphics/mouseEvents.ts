import { useState } from 'react';
import type { Module } from '@sqlvalley/skill-tree-definition';
import { getPrerequisites } from '@sqlvalley/skill-tree-definition';

export function useHoverState(
  skillTree: Record<string, Module>,
  onNavigate: (id: string) => void,
) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const [prerequisites, setPrerequisites] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleHoverStart = (id: string) => {
    setLocalHoveredId(id);
    const chain = getPrerequisites(skillTree, id);
    setPrerequisites(chain);

    const item = skillTree[id];
    setTooltip(item.description || 'No description available');
  };

  const handleHoverEnd = () => {
    setLocalHoveredId(null);
    setPrerequisites(new Set());
    setTooltip(null);
  };

  const handlePointerDown = (id: string, e: React.PointerEvent, skipToNavigate = false) => {
    if (e.pointerType === 'mouse' || skipToNavigate) {
      onNavigate(id);
      return;
    }
    if (selectedId === id) {
      onNavigate(id);
      setSelectedId(null);
      handleHoverEnd();
    } else {
      setSelectedId(id);
      handleHoverStart(id);
    }
  }

  const handlePointerOutside = () => {
    setSelectedId(null);
    handleHoverEnd();
  };

  const isConnectorInHoveredPath = (connector: {
    from: string;
    to: string;
  }): boolean => {
    if (!localHoveredId) return false;

    const toIsHovered = connector.to === localHoveredId;
    const fromIsInChain = prerequisites.has(connector.from);
    const toIsInChain = prerequisites.has(connector.to) || toIsHovered;

    return toIsInChain && fromIsInChain;
  };

  return {
    localHoveredId,
    prerequisites,
    tooltip,
    selectedId,
    handleHoverStart,
    handleHoverEnd,
    isConnectorInHoveredPath,
    handlePointerDown,
    handlePointerOutside,
  };
}
