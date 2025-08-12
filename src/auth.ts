import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from './config';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
];

async function main() {
  const credentialsDir = join(process.cwd(), 'credentials');
  const tokenPath = join(credentialsDir, 'token.json');
  const credentialsPath = config.credentialsPath || join(credentialsDir, 'oauth.json');

  if (!existsSync(credentialsPath)) {
    console.error('Missing OAuth credentials. Set GOOGLE_OAUTH_JSON in .env or place credentials/oauth.json');
    console.error('Download your OAuth client JSON and save as credentials/oauth.json');
    process.exit(1);
  }

  mkdirSync(credentialsDir, { recursive: true });

  const auth = await authenticate({
    keyfilePath: credentialsPath,
    scopes: SCOPES,
  });

  const gmail = google.gmail({ version: 'v1', auth: auth as any });
  // Trigger a simple call; 'local-auth' persists the token automatically under the hood
  await gmail.users.getProfile({ userId: 'me' });
  // Inform the user where token is stored; we also create an empty marker file for clarity
  try {
    writeFileSync(tokenPath, JSON.stringify({ info: 'Token managed by @google-cloud/local-auth' }, null, 2));
  } catch {}
  console.log('Authentication successful. You can now run the agent.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


