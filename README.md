## AI Agent for TLDR → LinkedIn Summary (TypeScript / Node.js)

A Node.js/TypeScript agent that:

- Reads your Gmail and fetches only TLDR newsletters (configurable Gmail search filter)
  - Option 1 (default): Gmail API with OAuth
  - Option 2: IMAP + app password (no OAuth) – set `USE_IMAP=true`
- Extracts news links and descriptions from the email
- Filters news against your tech stack (editable in `data/tech-stack.json` or via env)
- Summarizes into a LinkedIn‑optimized Swedish post (uses OpenAI if API key is present, otherwise fallback)
- Sends the summary to your own inbox and marks the TLDR email as read

### Quick Start

1) Install dependencies

```bash
npm install
```

2) Gmail API with OAuth (optional if you use IMAP)

- In Google Cloud Console → enable Gmail API for your project
- Create OAuth 2.0 Client ID (Desktop app)
- Download the JSON file and save as `credentials/oauth.json`

3) Authenticate (opens a browser for consent)

```bash
npm run auth
```

4) Configure your tech stack

- Edit `data/tech-stack.json` with the keywords/technologies to filter on
- Alternatively set env `TECH_STACK` (comma‑separated list)

5) (Optional) OpenAI for higher‑quality summaries

- Add `OPENAI_API_KEY` to `.env` if you want a better LinkedIn summary

6) Run the agent

```bash
npm run dev
```

The summary is sent to your inbox. Change the recipient via `TO_EMAIL` in `.env` if needed.

### Environment Variables

Create a `.env` in the project root:

```
OPENAI_API_KEY=sk-...
GMAIL_QUERY=from:(tldr) is:unread
TO_EMAIL=me
TECH_STACK=typescript,node,react,aws
MAX_ITEMS=10
GOOGLE_OAUTH_JSON=./credentials/oauth.json
USE_IMAP=false
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true
EMAIL_USER=youraddress@gmail.com
EMAIL_APP_PASSWORD=your-app-password
SENDER_FILTER=@tldrnewsletter.com
```

Notes:
- Set `USE_IMAP=true` to use IMAP + app password instead of OAuth. Make sure IMAP is enabled in Gmail and 2FA + app password is configured.
- `SENDER_FILTER` is used for both Gmail API and IMAP to match the TLDR sender domain.

### Scripts

- `npm run auth` – initiates OAuth and stores token under `credentials/token.json`
- `npm run dev` – runs the agent in TypeScript via `ts-node`
- `npm run build` – compiles to `dist/`
- `npm run prod` – runs compiled code

### Deploy to Vercel (daily 07:00)

- This repo includes a `vercel.json` with a cron job hitting `/api/cron` daily.
- Edit the schedule as needed. Current schedule is `0 6 * * *` (UTC), which is 07:00 CET in winter and 08:00 CEST in summer. Adjust to your timezone if needed.
- Ensure your `.env` (or Vercel Project Environment Variables) contains the required keys.
- Deploy to Vercel, then verify the cron in the Project → Settings → Cron Jobs.

### Project Structure

```
src/
  auth.ts         # Gmail OAuth client
  gmail.ts        # Gmail helpers (fetch, mark read, send)
  parseTldr.ts    # Parse TLDR HTML into items
  filter.ts       # Filter items against tech stack
  summarize.ts    # LinkedIn summary (OpenAI/fallback)
  config.ts       # Loads env and tech stack
  index.ts        # Orchestration
credentials/
  oauth.json      # Your OAuth Client JSON (you provide this)
  token.json      # Created automatically after `npm run auth`
data/
  tech-stack.json # Your tech stack (can be replaced by env TECH_STACK)
```

### Notes

- Default Gmail filter is `from:(tldr) is:unread`. Adjust via `GMAIL_QUERY` or use `SENDER_FILTER` to target your TLDR sender domain.
- The agent marks relevant TLDR emails as read after sending the summary.
- This project does not post directly to LinkedIn; instead you receive a ready‑to‑use post by email.
