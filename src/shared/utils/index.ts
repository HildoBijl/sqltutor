/**
 * Essential utility functions for the application
 */

// Array utilities
export const firstOf = <T>(arr: T[]): T | undefined => arr[0];
export const lastOf = <T>(arr: T[]): T | undefined => arr[arr.length - 1];
export const selectRandomly = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Number utilities
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const generateRandomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// String utilities
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Object utilities
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
};

// Exercise generation utilities  
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Type utilities
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;