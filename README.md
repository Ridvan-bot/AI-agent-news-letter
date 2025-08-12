# AI-agent för TLDR → LinkedIn-sammanfattning (TypeScript / Node.js)

En Node.js/TypeScript-agent som:

- Läser din Gmail och hämtar endast TLDR-nyhetsbrev (konfigurerbart Gmail-sökfilter)
  - Alternativ 1 (default): Gmail API med OAuth
  - Alternativ 2: IMAP + app-lösenord (utan OAuth) – sätt `USE_IMAP=true`
- Extraherar nyhetslänkar och beskrivingar ur mailet
- Filtrerar nyheterna mot din tech stack (redigerbar i `data/tech-stack.json` eller via env)
- Summerar och skriver en LinkedIn-optimerad svensk post (använder OpenAI om API-nyckel finns, annars fallback)
- Skickar sammanställningen till din egen inbox och markerar TLDR-mailet som läst

## Snabbstart

1) Installera beroenden

```bash
npm install
```

2) Skapa Google OAuth-uppgifter för Gmail API

- Gå till Google Cloud Console → Aktivera Gmail API för ditt projekt
- Skapa OAuth 2.0 Client ID (Desktop app)
- Ladda ner JSON-filen och spara som `credentials/oauth.json`

3) Kör autentisering (öppnar webbläsare för att godkänna):

```bash
npm run auth
```

4) Konfigurera din tech stack

- Redigera `data/tech-stack.json` med nyckelord/tekniker du vill filtrera på
- Alternativt sätt env-variabeln `TECH_STACK` (kommaseparerad lista)

5) (Valfritt) OpenAI för bättre summering

- Lägg till `OPENAI_API_KEY` i `.env` om du vill ha högkvalitativ LinkedIn-sammanfattning

6) Kör agenten

```bash
npm run dev
```

Sammanfattningen skickas till din inbox. Ändra mottagare via `TO_EMAIL` i `.env` vid behov.

## Miljövariabler

Skapa en `.env` i projektroten:

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
EMAIL_USER=dinadress@gmail.com
EMAIL_APP_PASSWORD=din-applosen
SENDER_FILTER=@tldrnewsletter.com
```

## Scripts

- `npm run auth` – initierar OAuth och sparar token i `credentials/token.json`
- `npm run dev` – kör agenten i TypeScript via `ts-node`
- `npm run build` – kompilerar till `dist/`
- `npm run prod` – kör kompilerad kod

## Struktur

```
src/
  auth.ts         # Gmail OAuth-klient
  gmail.ts        # Gmail-hjälpfunktioner (hämta, markera läst, skicka)
  parseTldr.ts    # Parsar TLDR-html till item-lista
  filter.ts       # Filtrerar items mot tech stack
  summarize.ts    # LinkedIn-sammanfattning (OpenAI/fallback)
  config.ts       # Laddar env och tech stack
  index.ts        # Orkestrering
credentials/
  oauth.json      # Din OAuth Client JSON (läggs av dig)
  token.json      # Skapas automatiskt efter `npm run auth`
data/
  tech-stack.json # Din tech stack (kan ersättas av env TECH_STACK)
```

## Noteringar

- Standardfiltret för Gmail är `from:(tldr) is:unread`. Justera via `GMAIL_QUERY` om dina TLDR-nyhetsbrev kommer från andra adresser.
- Agenten markerar relevanta TLDR-mail som lästa efter att sammanfattningen skickats.
- Inget i koden postar direkt till LinkedIn; istället får du ett färdigt inlägg via e‑post.

An AI agent that reads gmail email, summurizes it and mark the email as read.
