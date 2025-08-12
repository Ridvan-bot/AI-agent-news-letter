import { config } from './config';
import { getGmail, listTldrMessages, getMessage, markMessageAsRead, sendEmail } from './gmail';
import { extractHtmlFromMessage, parseTldrHtml } from './parseTldr';
import { filterItemsByTechStack } from './filter';
import { summarizeForLinkedIn } from './summarize';
import { fetchUnreadTldrViaImap, markImapMessageAsSeen } from './imap';
import { sendSummaryEmail } from './mailer';

async function run() {
  if (config.useImap) {
    const mails = await fetchUnreadTldrViaImap(5);
    if (mails.length === 0) {
      console.log('Inga TLDR-mail hittades via IMAP.');
      return;
    }
    for (const mail of mails) {
      const html = mail.html || '';
      if (!html) continue;
      const allItems = parseTldrHtml(html);
      const filtered = filterItemsByTechStack(allItems, config.techStack).slice(0, config.maxItems);
      const summary = await summarizeForLinkedIn(filtered);
      await sendSummaryEmail('TLDR → LinkedIn-sammanfattning', summary);
      await markImapMessageAsSeen(mail.id);
      console.log('Skickade sammanfattning och markerade som läst (IMAP):', mail.id);
    }
  } else {
    const gmail = await getGmail();
    const messages = await listTldrMessages(gmail, config.gmailQuery, 5);
    if (messages.length === 0) {
      console.log('Inga TLDR-mail hittades.');
      return;
    }
    for (const m of messages) {
      if (!m.id) continue;
      const message = await getMessage(gmail, m.id);
      const html = extractHtmlFromMessage(message);
      if (!html) {
        console.log('Ingen HTML hittades i meddelandet', m.id);
        continue;
      }
      const allItems = parseTldrHtml(html);
      const filtered = filterItemsByTechStack(allItems, config.techStack).slice(0, config.maxItems);
      const summary = await summarizeForLinkedIn(filtered);
      const subject = 'TLDR → LinkedIn-sammanfattning';
      await sendEmail(gmail, config.toEmail, subject, summary);
      await markMessageAsRead(gmail, m.id);
      console.log('Skickade sammanfattning och markerade som läst:', m.id);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


