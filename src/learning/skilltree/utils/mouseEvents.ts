import { useState } from "react";
import { Module } from "@/curriculum";
import { getPrerequisites } from "./goalPath";

export function useHoverState(
  moduleItems: Record<string, Module>,
  setHoveredId: (id: string | null) => void,
) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const [prerequisites, setPrerequisites] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handleHoverStart = (id: string) => {
    setLocalHoveredId(id);
    setHoveredId(id);
    const chain = getPrerequisites(id, moduleItems);
    setPrerequisites(chain);

    const item = moduleItems[id];
    setTooltip(item.description || "No description available");
  };

  const handleHoverEnd = () => {
    setLocalHoveredId(null);
    setHoveredId(null);
    setPrerequisites(new Set());
    setTooltip(null);
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
    handleHoverStart,
    handleHoverEnd,
    isConnectorInHoveredPath,
  };
}