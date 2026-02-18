/**
 * Store version and migrations.
 * Bump STORE_VERSION when the persisted schema changes and add a migration.
 * MIGRATIONS[i] migrates from version i to version i+1.
 */

export const STORE_VERSION = 1;

export interface PersistedState {
  version?: number;
  components?: Record<string, unknown>;
  currentTheme?: string;
  hideStories?: boolean;
  practiceDatasetSize?: string;
}

/** Migrations: index i transforms state from version i to version i+1 */
const MIGRATIONS: Array<(state: PersistedState) => PersistedState> = [
  // v0 -> v1: no-op (add version field)
  (state) => state,
  // v1 -> v2: (add when needed) (state) => ({ ...state, ... }),
];

export function migrateState(state: PersistedState): PersistedState {
  const currentVersion = state.version ?? 0;
  if (currentVersion >= STORE_VERSION) {
    return { ...state, version: STORE_VERSION };
  }

  let result = { ...state };
  const migrationsToRun = MIGRATIONS.slice(currentVersion, STORE_VERSION);
  for (const run of migrationsToRun) {
    result = run(result);
  }
  return { ...result, version: STORE_VERSION };
}
