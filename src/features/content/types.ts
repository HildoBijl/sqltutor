import { z } from 'zod';

// Content validation schemas
export const ComponentMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['concept', 'skill']),
  description: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
});

export const ConceptContentSchema = z.object({
  theory: z.string().optional(),
  summary: z.string().optional(),
  examples: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })).optional(),
  visualizations: z.array(z.any()).optional(),
  nextConcepts: z.array(z.string()).optional(),
});

export const ExerciseSchema = z.object({
  id: z.string(),
  version: z.number(),

  // Exercise configuration
  config: z.object({
    database: z.string().optional(),
  }),

  // Generation function (stored as string, evaluated at runtime)
  generator: z.string(),

  // Validation function (stored as string, evaluated at runtime)
  validator: z.string(),

  // Solution template
  solutionTemplate: z.string().optional(),
});

export const SkillContentSchema = z.object({
  theory: z.string().optional(),
  exercises: z.array(ExerciseSchema),
  reference: z.object({
    syntax: z.string().optional(),
    examples: z.array(z.object({
      title: z.string(),
      sql: z.string(),
      description: z.string().optional(),
    })).optional(),
    commonMistakes: z.array(z.object({
      mistake: z.string(),
      correction: z.string(),
    })).optional(),
  }).optional(),
});

// Type exports
export type ComponentMeta = z.infer<typeof ComponentMetaSchema>;
export type ConceptContent = z.infer<typeof ConceptContentSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type SkillContent = z.infer<typeof SkillContentSchema>;

export interface Component {
  meta: ComponentMeta;
  content: ConceptContent | SkillContent;
}

// Skill tree structure
export interface SkillTreeNode {
  id: string;
  component: Component;
  children: SkillTreeNode[];
  prerequisites: string[];
  position?: { x: number; y: number }; // For visualization
}

// Learning path
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  components: string[]; // Ordered list of component IDs
}

// -----------------------------------------------------------------------------
// Exercise runtime helpers (new architecture)
// -----------------------------------------------------------------------------

export interface Utils {
  selectRandomly: <T>(items: readonly T[]) => T;
  randomInt: (min: number, max: number) => number;
}

export interface QueryResult {
  columns: string[];
  values: unknown[][];
}

export interface ExecutionResult<T = QueryResult[]> {
  success: boolean;
  output?: T;
  error?: Error;
}

export interface ValidationResult {
  ok: boolean;
  message?: string;
  code?: string;
  warnings?: string[];
}

export interface VerificationResult {
  correct: boolean;
  message?: string;
  solution?: string;
  details?: Record<string, unknown>;
}
