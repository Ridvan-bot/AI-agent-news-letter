import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { config } from './config';

export type RawMail = {
  id: string;
  html?: string | undefined;
  text?: string | undefined;
  headers: Record<string, string>;
};

export async function fetchUnreadTldrViaImap(limit = 5): Promise<RawMail[]> {
  const client = new ImapFlow({
    host: config.imap.host,
    port: config.imap.port,
    secure: config.imap.secure,
    auth: {
      user: config.imap.user,
      pass: config.imap.pass,
    },
  });

  await client.connect();
  await client.mailboxOpen('INBOX', { readOnly: false });

  // IMAP server-side search is limited; we'll fetch unseen and filter from-header client-side
  const query = { seen: false } as const;

  const lock = await client.getMailboxLock('INBOX');
  try {
    const messages: RawMail[] = [];
    for await (const msg of client.fetch({ ...query }, { source: true, envelope: true, headers: true })) {
      if (!msg.source) continue;
      const parsed = await simpleParser(msg.source);
      const fromHeader = parsed.from?.text || '';
      if (config.senderFilter && !fromHeader.toLowerCase().includes(config.senderFilter.toLowerCase())) {
        continue;
      }
      const id = String(msg.uid);
      const headers: Record<string, string> = {};
      for (const [k, v] of parsed.headers) headers[String(k)] = String(v);
      messages.push({ id, html: parsed.html || undefined, text: parsed.text || undefined, headers });
      if (messages.length >= limit) break;
    }
    return messages;
  } finally {
    lock.release();
    await client.logout();
  }
}

export async function markImapMessageAsSeen(uid: string): Promise<void> {
  const client = new ImapFlow({
    host: config.imap.host,
    port: config.imap.port,
    secure: config.imap.secure,
    auth: {
      user: config.imap.user,
      pass: config.imap.pass,
    },
  });
  await client.connect();
  await client.mailboxOpen('INBOX', { readOnly: false });
  try {
    await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
  } finally {
    await client.logout();
  }
}


