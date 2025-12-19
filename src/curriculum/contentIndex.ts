import type { ContentMeta } from '@/curriculum';
import { contentIndex } from '@/curriculum';

export type ContentType = ContentMeta['type'];
export type ContentEntryMeta = ContentMeta;

export async function loadContentIndex(): Promise<ContentEntryMeta[]> {
  return contentIndex;
}

export { contentIndex };
