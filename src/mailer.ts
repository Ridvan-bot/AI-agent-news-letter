import nodemailer from 'nodemailer';
import { config } from './config';

export async function sendSummaryEmail(subject: string, body: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: config.imap.user,
      pass: config.imap.pass,
    },
  });

  await transporter.sendMail({
    from: config.imap.user,
    to: config.imap.user,
    subject,
    text: body,
  });
}


