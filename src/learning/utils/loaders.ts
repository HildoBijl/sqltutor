import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export type ModuleComponentMap = Record<string, LazyExoticComponent<ComponentType<any>>>;

const ALLOWED_MODULE_SECTIONS = new Set(['Theory', 'Summary', 'Story', 'Video', 'Practice']);

type ComponentModule = {
  default?: ComponentType<any>;
} & Record<string, ComponentType<any> | undefined>;

const moduleComponentModules = import.meta.glob('./modules/*/*.tsx') as Record<
  string,
  () => Promise<Record<string, unknown>>
>;

function createLazyComponent(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
  modulePath: string,
): LazyExoticComponent<ComponentType<any>> {
  return lazy(async () => {
    const module = (await loader()) as ComponentModule;
    const component = module[exportName] ?? module.default;
    if (!component) {
      throw new Error(`Component "${exportName}" not found in module "${modulePath}".`);
    }
    return { default: component };
  });
}

export const moduleComponents: Record<string, ModuleComponentMap> = Object.entries(
  moduleComponentModules,
).reduce<Record<string, ModuleComponentMap>>((acc, [path, loader]) => {
  const match = path.match(/\.\/modules\/([^/]+)\/([^/]+)\.tsx$/);
  if (!match) {
    return acc;
  }

  const [, moduleId, section] = match;
  if (!ALLOWED_MODULE_SECTIONS.has(section)) {
    return acc;
  }

  const entry = acc[moduleId] ?? (acc[moduleId] = {} as ModuleComponentMap);
  entry[section] = createLazyComponent(loader, section, path);

  return acc;
}, {});

const skillExerciseModules = import.meta.glob('./modules/*/exercise.ts');

type SkillExerciseLoader = () => Promise<unknown>;

export const skillExerciseLoaders = Object.fromEntries(
  Object.entries(skillExerciseModules).reduce<[string, SkillExerciseLoader][]>((entries, [path, loader]) => {
    const match = path.match(/\.\/modules\/([^/]+)\/exercise\.ts$/);
    if (match) {
      entries.push([match[1], loader as SkillExerciseLoader]);
    }
    return entries;
  }, []),
) as Record<string, SkillExerciseLoader>;
