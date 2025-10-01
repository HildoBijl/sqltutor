import { useState, useMemo, useRef, useLayoutEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { CheckCircle, MenuBook, Build } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store";
import {
  contentIndex as learningContentIndex,
  type ContentMeta,
} from "@/features/content";

export default function LearningOverviewPage() {
  const components = useAppStore((state) => state.components);

  // Import the skills from index
  const contentItems = useMemo(() => learningContentIndex, []);

  const concepts = useMemo(
    () => contentItems.filter((item) => item.type === "concept"),
    [contentItems]
  );
  const skills = useMemo(
    () => contentItems.filter((item) => item.type === "skill"),
    [contentItems]
  );

  // Check if a skill is completed based on exercises done or concept understood
  const isCompleted = (id: string) => {
    const component = components[id];
    if (!component) return false;

    // For concepts, check if understood
    if (concepts.find((c) => c.id === id)) {
      return component.understood === true;
    }

    // For skills, check if completed (3+ exercises)
    return (component.numSolved || 0) >= 3;
  };

  const getProgress = (id: string) => {
    const component = components[id];
    if (!component) return null;

    // For skills, return exercise progress
    if (skills.find((s) => s.id === id) && component.numSolved) {
      return `${component.numSolved}/3`;
    }

    return null;
  };

  // Refs to nodes and container for measuring connectors
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
    nodeRefs.current.set(id, el);
  };

  const [showAll, setShowAll] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  const NodeCard = ({ item }: { item: ContentMeta }) => {
    const completed = isCompleted(item.id);
    const progress = getProgress(item.id);
    const type = item.type;
    //Shows different icons for concept vs skill
    const Icon = type === "concept" ? MenuBook : Build;

    return (
      <Box
        ref={setNodeRef(item.id)}
        sx={{
          width: 200,
          position: "absolute",
          left: item.position.x,
          top: item.position.y,
          zIndex: 1,
        }}
      >
        <Link
          to={`/${type}/${item.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Tooltip
            title={item.description}
            placement="top"
            arrow
            enterDelay={500}
            leaveDelay={200}
          >
            <Card
              variant={completed ? "outlined" : undefined}
              sx={{
                width: "100%",
                height: 80,
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                // Rectangle for concepts, rounded for skills
                borderRadius: type === "concept" ? 1 : 3,
                transition:
                  "box-shadow 90ms cubic-bezier(.2,.7,.2,1), border-color 90ms cubic-bezier(.2,.7,.2,1), background-color 90ms cubic-bezier(.2,.7,.2,1)",
                backgroundColor: "background.paper",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 4,
                  borderColor: "primary.light",
                  backgroundColor: "action.hover",
                },
              }}
              //Handle hover state for cards
              onMouseEnter={() => {
                if (hoverTimerRef.current)
                  window.clearTimeout(hoverTimerRef.current!);
                setHoveredId(item.id);
              }}
              onMouseLeave={() => {
                if (hoverTimerRef.current)
                  window.clearTimeout(hoverTimerRef.current!);
                hoverTimerRef.current = window.setTimeout(
                  () => setHoveredId(null),
                  60
                );
              }}
            >
              <CardContent
                sx={{
                  p: 1,
                  flexGrow: 1,
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <Icon
                      fontSize="small"
                      color={type === "concept" ? "action" : "primary"}
                    />
                    {/* If completed, show checkmark with tooltip */}
                    {completed && (
                      <Tooltip
                        disableInteractive
                        title={type === "concept" ? "Understood" : "Mastered"}
                      >
                        <CheckCircle color="success" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    component="h3"
                    sx={{
                      fontWeight: 500,
                      color: completed ? "text.secondary" : "text.primary",
                      fontSize: "0.95rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </Typography>
                  {progress && (
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: "0.65rem",
                      }}
                    >
                      {progress}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Tooltip>
        </Link>
      </Box>
    );
  };

  // Compute SVG paths connecting prerequisites to dependents
  // Store path data with from: and to: node ids for filtering
  const [paths, setPaths] = useState<{ d: string; from: string; to: string }[]>(
    []
  );

  const recompute = () => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const newPaths: { d: string; from: string; to: string }[] = [];
    const byId = new Set(contentItems.map((i) => i.id));

    for (const item of contentItems) {
      for (const pre of item.prerequisites || []) {
        if (!byId.has(pre)) continue;
        const fromEl = nodeRefs.current.get(pre);
        const toEl = nodeRefs.current.get(item.id);
        if (!fromEl || !toEl) continue;
        const a = fromEl.getBoundingClientRect();
        const b = toEl.getBoundingClientRect();
        const x1 =
          a.left - cRect.left + a.width / 2 + (container.scrollLeft || 0);
        const rawY1 = a.bottom - cRect.top + (container.scrollTop || 0);
        const x2 =
          b.left - cRect.left + b.width / 2 + (container.scrollLeft || 0);
        const rawY2 = b.top - cRect.top + (container.scrollTop || 0);
        // Leave a small gap so lines don't touch/overlap nodes
        const distance = rawY2 - rawY1;
        let gap = 4; // px (tighter spacing)
        if (distance > 0 && distance < gap * 2 + 8) {
          gap = Math.max(2, Math.floor(distance / 4));
        }
        const y1 = rawY1 + gap;
        const y2 = rawY2 - gap;

        // Make the lines a bit curved, instead of straight right angles
        const midY = (y1 + y2) / 2;
        const radius = 10; // Curve radius in pixels

        // Use quadratic curves at corners - this is Claude generated
        // after Googling a bit, since I did not do the math myself :)
        const d = `
  M ${x1} ${y1}
  L ${x1} ${midY - radius}
  Q ${x1} ${midY} ${x1 + Math.sign(x2 - x1) * radius} ${midY}
  L ${x2 - Math.sign(x2 - x1) * radius} ${midY}
  Q ${x2} ${midY} ${x2} ${midY + radius}
  L ${x2} ${y2}
`
//Cleaan up whitespace 
          .replace(/\s+/g, " ")
          .trim();

        newPaths.push({ d, from: pre, to: item.id });
      }
    }
    setPaths(newPaths);
  };

  useLayoutEffect(() => {
    recompute();
    // Recompute on resize
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    // Observe container size changes
    const ro =
      typeof ResizeObserver !== "undefined" && containerRef.current
        ? new ResizeObserver(() => recompute())
        : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      if (ro && containerRef.current) ro.unobserve(containerRef.current);
    };
  }, [contentItems, components]);

  // Build quick lookup of prerequisites for ancestor tracing
  const prereqMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const item of contentItems) m.set(item.id, item.prerequisites || []);
    return m;
  }, [contentItems]);

  const visiblePaths = useMemo(() => {
    if (showAll) return paths;
    if (!hoveredId) return [];
    // Compute full ancestor closure (including hovered)
    const ancestors = new Set<string>();
    const stack: string[] = [hoveredId];
    while (stack.length) {
      const id = stack.pop()!;
      if (ancestors.has(id)) continue;
      ancestors.add(id);
      const pres = prereqMap.get(id) || [];
      for (const p of pres) stack.push(p);
    }
    // Only show edges that point to a node in the ancestor closure
    return paths.filter((p) => ancestors.has(p.to));
  }, [paths, showAll, hoveredId, prereqMap]);

  const completedConcepts = concepts.filter((c) => isCompleted(c.id)).length;
  const completedSkills = skills.filter((s) => isCompleted(s.id)).length;

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1400px" }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Do we want a title here?
        </Typography>
      </Box>

      {/* Progress Summary */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "center", gap: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" color="primary">
            {completedConcepts}/{concepts.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Concepts Completed
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" color="primary">
            {completedSkills}/{skills.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Skills Mastered
          </Typography>
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
          }
          label="Show all connectors"
        />
      </Box>

      {/* Manual Skill Tree Layout */}

      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "100%",
          height: "1200px", // Fixed height for the tree
        }}
      >
        {/* Connectors overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <svg width="100%" height="100%" style={{ overflow: "visible" }}>
            {visiblePaths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                stroke="#9aa0a6"
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
        </Box>

        {/* Absolutely positioned nodes */}
        {contentItems.map((item) => (
          <NodeCard key={item.id} item={item} />
        ))}
      </Box>

      {/* Legend - Fixed in lower right */}
      <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 2,
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Legend
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 20,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MenuBook fontSize="small" color="action" />
            </Box>
            <Typography variant="body2">Concept</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 20,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Build fontSize="small" color="primary" />
            </Box>
            <Typography variant="body2">Skill</Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
