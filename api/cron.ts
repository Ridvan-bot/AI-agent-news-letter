import { runAgent } from '../src/index';

export default async function handler(req: any, res: any) {
  try {
    await runAgent();
    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Cron error', err);
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}


