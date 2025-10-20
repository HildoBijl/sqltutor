import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { CheckCircle, PlayArrow, MenuBook, Build } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { contentIndex as learningContentIndex, type ContentMeta } from '@/features/content';
type ComponentMeta = ContentMeta;

export default function LearningOverviewPage() {
  const components = useAppStore(state => state.components);

  const contentItems = useMemo(() => learningContentIndex, []);
  const concepts = useMemo(() => contentItems.filter(item => item.type === 'concept'), [contentItems]);
  const skills = useMemo(() => contentItems.filter(item => item.type === 'skill'), [contentItems]);

  const isCompleted = (id: string) => {
    const state = components[id];
    if (!state) return false;
    if (state.type === 'concept') return state.understood === true;
    if (state.type === 'skill') return (state.numSolved ?? 0) >= 3;
    return false;
  };

  const getProgress = (id: string) => {
    const state = components[id];
    if (!state || state.type !== 'skill') {
      return null;
    }

    const solved = state.numSolved ?? 0;
    return solved > 0 ? `${solved}/3` : null;
  };

  // Compute hierarchical levels for a simple skill tree layout
  const levels = useMemo(() => {
    const byId = new Map<string, ComponentMeta>();
    for (const item of contentItems) byId.set(item.id, item);

    const memo = new Map<string, number>();
    const visiting = new Set<string>();

    const levelOf = (id: string): number => {
      if (memo.has(id)) return memo.get(id)!;
      if (visiting.has(id)) {
        // Cycle protection: place cyclic nodes at level 0
        memo.set(id, 0);
        return 0;
      }
      visiting.add(id);
      const item = byId.get(id);
      const prereqs = item?.prerequisites || [];
      let lvl = 0;
      if (prereqs.length > 0) {
        lvl = 1 + Math.max(
          0,
          ...prereqs
            .filter(p => byId.has(p))
            .map(p => levelOf(p))
        );
      }
      visiting.delete(id);
      memo.set(id, lvl);
      return lvl;
    };

    const grouped = new Map<number, ComponentMeta[]>();
    for (const item of contentItems) {
      const lvl = levelOf(item.id);
      if (!grouped.has(lvl)) grouped.set(lvl, []);
      grouped.get(lvl)!.push(item);
    }

    const maxLevel = Math.max(0, ...Array.from(grouped.keys()));

    // Barycentric ordering to reduce connector crossings
    const columns: { level: number; items: ComponentMeta[] }[] = [];
    const pos = new Map<string, number>(); // index within its level

    // Level 0 initial sort
    const level0 = (grouped.get(0) || []).slice().sort((a, b) => {
      if (a.type !== b.type) return a.type === 'concept' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    level0.forEach((n, i) => pos.set(n.id, i));
    columns.push({ level: 0, items: level0 });

    for (let i = 1; i <= maxLevel; i++) {
      const arr = (grouped.get(i) || []).slice();
      arr.sort((a, b) => {
        const parentsA = (a.prerequisites || []).filter(p => byId.has(p));
        const parentsB = (b.prerequisites || []).filter(p => byId.has(p));
        const avg = (parents: string[]) => {
          const xs = parents
            .map(p => pos.get(p))
            .filter((v): v is number => typeof v === 'number');
          if (!xs.length) return Number.POSITIVE_INFINITY;
          return xs.reduce((s, v) => s + v, 0) / xs.length;
        };
        const aAvg = avg(parentsA);
        const bAvg = avg(parentsB);
        if (aAvg !== bAvg) return aAvg - bAvg;
        if (a.type !== b.type) return a.type === 'concept' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      arr.forEach((n, idx) => pos.set(n.id, idx));
      columns.push({ level: i, items: arr });
    }

    return columns;
  }, [contentItems]);

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
    const Icon = type === 'concept' ? MenuBook : Build;

    return (
      <Box
        key={item.id}
        ref={setNodeRef(item.id)}
        sx={{
          width: 240,
          flex: '0 0 240px',
          mb: 2,
          position: 'relative',
          zIndex: 1,
          // Keep wrapper static so hover area doesn't change
        }}
      >
        <Link
          to={`/${type}/${item.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Card
            variant={completed ? 'outlined' : undefined}
            sx={{
              width: '100%',
              height: 120,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'box-shadow 90ms cubic-bezier(.2,.7,.2,1), border-color 90ms cubic-bezier(.2,.7,.2,1), background-color 90ms cubic-bezier(.2,.7,.2,1)',
              backgroundColor: 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 4,
                borderColor: 'primary.light',
                backgroundColor: 'action.hover',
              },
            }}
            onMouseEnter={() => {
              if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current!);
              setHoveredId(item.id);
            }}
            onMouseLeave={() => {
              if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current!);
              hoverTimerRef.current = window.setTimeout(() => setHoveredId(null), 60);
            }}
          >
          <CardContent sx={{ pb: 1, flexGrow: 1, minHeight: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Icon fontSize="small" color={type === 'concept' ? 'action' : 'primary'} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="subtitle1"
                    component="h3"
                    sx={{ fontWeight: 600, color: completed ? 'text.secondary' : 'text.primary' }}
                    noWrap
                  >
                    {item.name}
                  </Typography>
                  {completed ? (
                    <Tooltip disableInteractive title={type === 'concept' ? 'Understood' : 'Mastered'}>
                      <CheckCircle color="success" fontSize="small" />
                    </Tooltip>
                  ) : (
                    <Tooltip disableInteractive title="Not completed">
                      <PlayArrow color="action" fontSize="small" />
                    </Tooltip>
                  )}
                </Box>
                {item.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </Typography>
                )}
                {progress && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', fontWeight: 600, mt: 0.5 }}>
                    Progress: {progress}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
          </Card>
        </Link>
      </Box>
    );
  };

  // Compute SVG paths connecting prerequisites to dependents
  const [paths, setPaths] = useState<{ d: string; from: string; to: string }[]>([]);

  const recompute = () => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const newPaths: { d: string; from: string; to: string }[] = [];
    const byId = new Set(contentItems.map(i => i.id));

    for (const item of contentItems) {
      for (const pre of item.prerequisites || []) {
        if (!byId.has(pre)) continue;
        const fromEl = nodeRefs.current.get(pre);
        const toEl = nodeRefs.current.get(item.id);
        if (!fromEl || !toEl) continue;
        const a = fromEl.getBoundingClientRect();
        const b = toEl.getBoundingClientRect();
        const x1 = a.left - cRect.left + a.width / 2 + (container.scrollLeft || 0);
        const rawY1 = a.bottom - cRect.top + (container.scrollTop || 0);
        const x2 = b.left - cRect.left + b.width / 2 + (container.scrollLeft || 0);
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
    window.addEventListener('resize', onResize);
    // Observe container size changes
    const ro = typeof ResizeObserver !== 'undefined' && containerRef.current
      ? new ResizeObserver(() => recompute())
      : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && containerRef.current) ro.unobserve(containerRef.current);
    };
  }, [contentItems, levels, components]);

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
    return paths.filter(p => ancestors.has(p.to));
  }, [paths, showAll, hoveredId, prereqMap]);

  const completedConcepts = concepts.filter(c => isCompleted(c.id)).length;
  const completedSkills = skills.filter(s => isCompleted(s.id)).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          SQL Skill Tree
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Progress from foundational concepts to advanced skills
        </Typography>
      </Box>

      {/* Progress Summary */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {completedConcepts}/{concepts.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Concepts Completed
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {completedSkills}/{skills.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Skills Mastered
          </Typography>
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />}
          label="Show all connectors"
        />
      </Box>

      {/* Skill Tree (Top-Down) */}
      <Box ref={containerRef} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Connectors overlay */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            {visiblePaths.map((p, i) => (
              <path key={i} d={p.d} stroke="#9aa0a6" strokeWidth={2} fill="none" strokeLinecap="round" />
            ))}
          </svg>
        </Box>
        {levels.map(col => (
          <Box
            key={col.level}
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-evenly', minHeight: 140, position: 'relative', zIndex: 1 }}
          >
            {col.items.map(item => (
              <NodeCard key={item.id} item={item} />
            ))}
          </Box>
        ))}
      </Box>
    </Container>
  );
}
