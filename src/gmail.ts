import { authenticate } from '@google-cloud/local-auth';
import { google, gmail_v1 } from 'googleapis';
import { join } from 'path';
import { existsSync } from 'fs';
import { config } from './config';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
];

export async function getGmail(): Promise<gmail_v1.Gmail> {
  const credentialsPath = config.credentialsPath || join(process.cwd(), 'credentials', 'oauth.json');
  if (!existsSync(credentialsPath)) {
    throw new Error('Missing OAuth credentials at credentials/oauth.json');
  }

  const auth = await authenticate({
    keyfilePath: credentialsPath,
    scopes: SCOPES,
  });
  return google.gmail({ version: 'v1', auth: auth as any });
}

export async function listTldrMessages(gmail: gmail_v1.Gmail, query: string, maxResults = 10) {
  const res = await gmail.users.messages.list({ userId: 'me', q: query, maxResults });
  return res.data.messages || [];
}

export async function getMessage(gmail: gmail_v1.Gmail, id: string) {
  const res = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
  return res.data;
}

export async function markMessageAsRead(gmail: gmail_v1.Gmail, id: string) {
  await gmail.users.messages.modify({
    userId: 'me',
    id,
    requestBody: { removeLabelIds: ['UNREAD'] },
  });
}

export async function sendEmail(gmail: gmail_v1.Gmail, to: string, subject: string, body: string) {
  const raw = buildEmailRaw(to, subject, body);
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
}

function buildEmailRaw(to: string, subject: string, body: string) {
  const headers = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
  ];
  const email = headers.join('\r\n') + '\r\n\r\n' + body;
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}


