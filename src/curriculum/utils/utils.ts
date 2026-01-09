export function template(str: string, params: Record<string, unknown>): string {
  return Object.entries(params).reduce((result, [key, value]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\{${escapedKey}\\}`, 'g');
    return result.replace(pattern, String(value));
  }, str);
}
