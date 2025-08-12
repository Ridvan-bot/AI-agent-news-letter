import type { TldrItem } from './parseTldr';
import type { TechStack } from './config';

export function filterItemsByTechStack(items: TldrItem[], stack: TechStack): TldrItem[] {
  const keywords = new Set(stack.keywords.map((k) => k.toLowerCase()));
  if (keywords.size === 0) return items;

  return items.filter((item) => {
    const text = `${item.title} ${item.summary || ''}`.toLowerCase();
    for (const kw of keywords) {
      if (text.includes(kw)) return true;
    }
    return false;
  });
}


