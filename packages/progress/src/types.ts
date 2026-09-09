/** The little a module's stored state needs to expose for progress tracking. */
export interface ModuleProgressState {
  understood?: boolean;
  numSolved?: number;
}

export interface RawModuleCompletion<Id extends string = string> {
  completed: Set<Id>;
  skillProgress: Partial<Record<Id, number>>;
  requiredCount: number;
}

export type ModuleCompletion<Id extends string = string> = RawModuleCompletion<Id>;
