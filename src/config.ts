import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

dotenv.config();

export type TechStack = {
  keywords: string[];
};

function loadTechStack(): TechStack {
  // Prefer env TECH_STACK as comma-separated list
  const envStack = process.env.TECH_STACK;
  if (envStack && envStack.trim().length > 0) {
    return { keywords: envStack.split(',').map(k => k.trim()).filter(Boolean) };
  }

  const dataPath = join(process.cwd(), 'data', 'tech-stack.json');
  if (existsSync(dataPath)) {
    try {
      const raw = readFileSync(dataPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.keywords)) {
        return { keywords: parsed.keywords.map((k: string) => String(k).trim()).filter(Boolean) };
      }
    } catch {
      // ignore and fall back to default
    }
  }
  return { keywords: ['typescript', 'node', 'react', 'aws'] };
}

const senderFilter = process.env.SENDER_FILTER || '@tldrnewsletter.com';

export const config = {
  gmailQuery: process.env.GMAIL_QUERY || `from:(${senderFilter}) is:unread`,
  toEmail: process.env.TO_EMAIL || 'me', // 'me' means the authenticated user in Gmail API
  maxItems: Number(process.env.MAX_ITEMS || 10),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  techStack: loadTechStack(),
  credentialsPath: process.env.GOOGLE_OAUTH_JSON || join(process.cwd(), 'credentials', 'oauth.json'),
  useImap: (process.env.USE_IMAP || 'false').toLowerCase() === 'true',
  imap: {
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: Number(process.env.IMAP_PORT || 993),
    secure: (process.env.IMAP_SECURE || 'true').toLowerCase() === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_APP_PASSWORD || '',
  },
  senderFilter,
};


