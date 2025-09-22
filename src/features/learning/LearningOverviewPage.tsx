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
import { CheckCircle, PlayArrow, MenuBook, Build } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store";
import {
  contentIndex as learningContentIndex,
  type ContentMeta,
} from "@/features/content";

// Extended type with manual positioning
type ComponentMeta = ContentMeta & {
  position: { x: number; y: number }; // Pixel coordinates for absolute positioning
};

export default function LearningOverviewPage() {
  const components = useAppStore((state) => state.components);

  // Manual layout data based on your PDF
  const manualLayout = useMemo(() => {
    const layoutData: ComponentMeta[] = [
      // Top level
      {
        id: "database",
        name: "What is a Database?",
        type: "concept",
        description:
          "Understanding databases, tables, and database management systems",
        prerequisites: [],
        position: { x: 520, y: 20 },
      },

      // Second level
      {
        id: "query-language",
        name: "Query Languages",
        type: "concept",
        description:
          "How databases interpret commands and why SQL became the standard",
        prerequisites: ["database"],
        position: { x: 250, y: 120 },
      },
      {
        id: "database-table",
        name: "Database Tables",
        type: "concept",
        description:
          "Learn about rows, columns, and how data is structured in tables",
        prerequisites: ["database"],
        position: { x: 520, y: 120 },
      },

      // Third level
      {
        id: "sql",
        name: "SQL Fundamentals",
        type: "concept",
        description:
          "Core SQL clauses for reading and modifying relational data",
        prerequisites: ["query-language"],
        position: { x: 250, y: 220 },
      },
      {
        id: "data-types",
        name: "Data Types",
        type: "concept",
        description:
          "Different types of data that can be stored in database columns",
        prerequisites: ["database-table"],
        position: { x: 520, y: 220 },
      },
      {
        id: "projection-and-filtering",
        name: "Projection and Filtering",
        type: "concept",
        description: "Limit tables to the columns and rows needed for analysis",
        prerequisites: ["database-table"],
        position: { x: 750, y: 220 },
      },
      {
        id: "database-keys",
        name: "Database Keys",
        type: "concept",
        description: "Primary keys, foreign keys, and unique identifiers",
        prerequisites: ["database-table"],
        position: { x: 950, y: 220 },
      },

      // Fourth level
      {
        id: "filter-rows",
        name: "Filter Rows",
        type: "skill",
        description: "Use WHERE clauses to filter data based on conditions",
        prerequisites: ["sql", "projection-and-filtering", "data-types"],
        position: { x: 250, y: 320 },
      },
      {
        id: "choose-columns",
        name: "Choose Columns",
        type: "skill",
        description: "Select and rename the columns returned by a query",
        prerequisites: ["sql", "projection-and-filtering"],
        position: { x: 520, y: 320 },
      },
      {
        id: "join-and-decomposition",
        name: "Join and Decomposition",
        type: "concept",
        description:
          "Split tables safely and join them back together without losing data",
        prerequisites: ["database-keys", "projection-and-filtering"],
        position: { x: 750, y: 320 },
      },

      // Fifth level
      {
        id: "write-single-criterion-query",
        name: "Write Single-Criterion Query",
        type: "skill",
        description:
          "Build SELECT statements that filter on a single condition",
        prerequisites: ["choose-columns", "filter-rows"],
        position: { x: 375, y: 420 },
      },
      {
        id: "inner-and-outer-join",
        name: "Inner and Outer Join",
        type: "concept",
        description:
          "Choose the right join type when matching rows across tables",
        prerequisites: ["join-and-decomposition", "data-types"],
        position: { x: 750, y: 420 },
      },
      {
        id: "aggregation",
        name: "Aggregation",
        type: "concept",
        description: "Group records and compute summary statistics with SQL",
        prerequisites: ["data-types", "projection-and-filtering"],
        position: { x: 950, y: 420 },
      },

      // Sixth level
      {
        id: "sort-rows",
        name: "Sort Rows",
        type: "skill",
        description:
          "Order results with ORDER BY and paginate using LIMIT/OFFSET",
        prerequisites: ["sql", "data-types"],
        position: { x: 50, y: 520 },
      },
      {
        id: "filter-rows-on-multiple-criteria",
        name: "Filter Rows on Multiple Criteria",
        type: "skill",
        description:
          "Combine AND/OR logic, pattern matching, and NULL checks in filters",
        prerequisites: ["filter-rows"],
        position: { x: 250, y: 520 },
      },
      {
        id: "create-processed-columns",
        name: "Create Processed Columns",
        type: "skill",
        description: "Compute derived columns directly within the SELECT list",
        prerequisites: ["data-types", "choose-columns"],
        position: { x: 520, y: 520 },
      },
      {
        id: "aggregate-columns",
        name: "Aggregate Columns",
        type: "skill",
        description: "Group data and compute counts, sums, and averages",
        prerequisites: ["aggregation", "choose-columns"],
        position: { x: 950, y: 520 },
      },
      {
        id: "pivot-table",
        name: "Pivot Tables",
        type: "concept",
        description: "Reshape aggregated data so categories become columns",
        prerequisites: ["database-table"],
        position: { x: 1200, y: 520 },
      },

      // Seventh level
      {
        id: "write-multi-criterion-query",
        name: "Write Multi-Criterion Query",
        type: "skill",
        description:
          "Combine multiple predicates with AND, OR, and grouping parentheses",
        prerequisites: [
          "create-processed-columns",
          "filter-rows-on-multiple-criteria",
          "sort-rows",
        ],
        position: { x: 250, y: 620 },
      },
      {
        id: "join-tables",
        name: "Join Tables",
        type: "skill",
        description: "Join related tables together by matching keys",
        prerequisites: [
          "inner-and-outer-join",
          "choose-columns",
          "filter-rows-on-multiple-criteria",
        ],
        position: { x: 520, y: 620 },
      },
      {
        id: "use-filtered-aggregation",
        name: "Use Filtered Aggregation",
        type: "skill",
        description:
          "Filter aggregate results with HAVING and targeted WHERE clauses",
        prerequisites: [
          "aggregate-columns",
          "filter-rows-on-multiple-criteria",
          "create-processed-columns",
        ],
        position: { x: 750, y: 620 },
      },
      {
        id: "use-dynamic-aggregation",
        name: "Use Dynamic Aggregation",
        type: "skill",
        description: "Adapt aggregations to changing grouping dimensions",
        prerequisites: ["aggregate-columns"],
        position: { x: 950, y: 620 },
      },
      {
        id: "create-pivot-table",
        name: "Create Pivot Table",
        type: "skill",
        description: "Shape aggregated data into pivoted columns for reporting",
        prerequisites: [
          "pivot-table",
          "write-single-criterion-query",
          "aggregate-columns",
        ],
        position: { x: 1200, y: 620 },
      },

      // Eighth level
      {
        id: "write-multi-table-query",
        name: "Write Multi-Table Query",
        type: "skill",
        description:
          "Chain several joins to answer questions that span multiple tables",
        prerequisites: ["join-tables", "write-single-criterion-query"],
        position: { x: 520, y: 720 },
      },

      // Ninth level
      {
        id: "write-multi-layered-query",
        name: "Write Multi-Layered Query",
        type: "skill",
        description:
          "Use subqueries or CTEs to break complex logic into stages",
        prerequisites: [
          "use-filtered-aggregation",
          "write-multi-criterion-query",
          "write-multi-table-query",
        ],
        position: { x: 520, y: 820 },
      },
    ];

    return layoutData;
  }, []);

  const contentItems = useMemo(() => manualLayout, [manualLayout]);
  const concepts = useMemo(
    () => contentItems.filter((item) => item.type === "concept"),
    [contentItems]
  );
  const skills = useMemo(
    () => contentItems.filter((item) => item.type === "skill"),
    [contentItems]
  );

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

  const NodeCard = ({ item }: { item: ComponentMeta }) => {
    const completed = isCompleted(item.id);
    const progress = getProgress(item.id);
    const type = item.type;
    const Icon = type === "concept" ? MenuBook : Build;

    return (
      <Box
        ref={setNodeRef(item.id)}
        sx={{
          width: 160, // Bigger cards
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
                height: type === "concept" ? 60 : 80, // Different heights for concepts vs skills
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: type === "concept" ? 1 : 6, // Rectangular for concepts, rounded for skills
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
                      fontSize: "0.75rem",
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
        const midY = (y1 + y2) / 2;
        // Manhattan-style connector: down, across between rows, then up
        const d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
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
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          SQL-Tutor Skill Tree
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Progress from foundational concepts to advanced skills
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
          height: "900px", // Fixed height for the tree
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
