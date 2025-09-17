import type { ContentMeta } from '@/features/content';
import { contentIndex } from '@/features/content';

export type ContentType = ContentMeta['type'];
export type ContentEntryMeta = ContentMeta;

export async function loadContentIndex(): Promise<ContentEntryMeta[]> {
  return contentIndex;
}

export { contentIndex };
