import { TldrItem } from './parseTldr';
import { config } from './config';
import OpenAI from 'openai';

function buildPrompt(items: TldrItem[]): string {
  const bullets = items
    .map((it) => `- ${it.title}${it.url ? ` (${it.url})` : ''}${it.summary ? `\n  ${it.summary}` : ''}`)
    .join('\n');
  return [
    'Du är en PR/marknadsföringsassistent för ett svenskt techbolag.',
    'Skriv ett kort, skarpt LinkedIn-inlägg på svenska baserat på följande nyheter.',
    'Mål: informera, visa expertis och starta konversation. Använd 1-2 emojis diskret.',
    'Inkludera 3-5 punktlistor med tydliga insikter. Avsluta med en fråga eller CTA.',
    'Lägg INTE in hashtags. 700 tecken max.',
    'Nyheter:',
    bullets,
  ].join('\n');
}

export async function summarizeForLinkedIn(items: TldrItem[]): Promise<string> {
  if (items.length === 0) {
    return 'Inga relevanta TLDR-nyheter hittades idag.';
  }

  const prompt = buildPrompt(items);

  if (config.openaiApiKey) {
    const client = new OpenAI({ apiKey: config.openaiApiKey });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Du skriver koncisa LinkedIn-inlägg på svenska.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 400,
    });
    const text = response.choices[0]?.message?.content?.trim();
    if (text) return text;
  }

  // Fallback: naive template
  const lines: string[] = [];
  lines.push('Dagens nedslag i tech 📌');
  for (const it of items.slice(0, 5)) {
    const title = it.title.length > 120 ? it.title.slice(0, 117) + '…' : it.title;
    lines.push(`- ${title}${it.url ? ` — ${it.url}` : ''}`);
  }
  lines.push('Vad fångade din uppmärksamhet idag?');
  return lines.join('\n');
}


