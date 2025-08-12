import { gmail_v1 } from 'googleapis';
import { Buffer } from 'buffer';
import { load } from 'cheerio';

export type TldrItem = {
  title: string;
  url?: string;
  summary?: string | undefined;
  source?: string | undefined;
};

function decodeBase64Url(data: string): string {
  const buff = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  return buff.toString('utf8');
}

export function extractHtmlFromMessage(message: gmail_v1.Schema$Message): string | null {
  const parts = message.payload?.parts;
  if (parts) {
    // Try to find text/html part in multipart
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
      if (part.parts) {
        for (const sub of part.parts) {
          if (sub.mimeType === 'text/html' && sub.body?.data) {
            return decodeBase64Url(sub.body.data);
          }
        }
      }
    }
  }
  // Fallback: full body
  const bodyData = message.payload?.body?.data;
  if (bodyData) return decodeBase64Url(bodyData);
  return null;
}

export function parseTldrHtml(html: string): TldrItem[] {
  if (!html || html.trim().length === 0) return [];
  const $ = load(html);
  const items: TldrItem[] = [];

  // TLDR layout varies; we heuristically pick link + nearby text
  $('a').each((_, el) => {
    const url = $(el).attr('href') || undefined;
    const title = $(el).text().trim();
    if (!title || !url) return;

    // Heuristic: nearest paragraph or small text for summary
    const parent = $(el).closest('td, div, p, li');
    const contextText = parent.text().replace(/\s+/g, ' ').trim();
    const summary = contextText.length > title.length ? contextText : undefined;

    // Basic filtering: ignore TLDR nav/footer links
    const lower = title.toLowerCase();
    const blacklist = ['tldr', 'sponsor', 'unsubscribe', 'twitter', 'linkedin'];
    if (blacklist.some((b) => lower.includes(b))) return;

    items.push({ title, url, summary });
  });

  // Deduplicate by URL
  const unique: Record<string, TldrItem> = {};
  for (const it of items) {
    if (!it.url) continue;
    if (!unique[it.url]) unique[it.url] = it;
  }
  return Object.values(unique);
}


