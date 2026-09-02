# DexaCV

A CV builder that works without an account. React + Vite on the web; the
Android app in `android/` is a [Capacitor](https://capacitorjs.com) shell that
loads the deployed site, so both run the same code.

CVs are stored in the browser, not on a server. Nothing about a CV leaves the
device unless the user exports it, uploads a photo, or asks the AI about it.

## What it needs

| | |
|---|---|
| [Supabase](https://supabase.com) | edge functions, file storage, and — for the account pages nothing links to yet — auth |
| [Anthropic](https://console.anthropic.com) | the Claude API key the AI functions call with |
| [Resend](https://resend.com) | the contact form |

## Running it

```bash
npm install
cp .env.example .env.local     # fill in the two VITE_ values
npm run dev
```

Every variable the project reads — what it is, where to get it, and
which ones must never reach the browser — is in
[`ENVIRONMENT.md`](ENVIRONMENT.md).

`.env.local` holds only the Supabase project URL and its anon key. Both are
public by design: the anon key identifies the project and grants nothing beyond
what row-level security allows a signed-out visitor.

**Every other secret belongs to the edge functions and must never appear in a
`.env` the build can read.** Vite inlines those into the JavaScript bundle,
which ships to every browser and is packed into the Android APK, where anyone
can read it back out.

## The backend

```bash
supabase link --project-ref YOUR-PROJECT-REF
supabase db push                    # rate limit table, uploads bucket, policies
supabase functions deploy           # ai-assist, import-profile, contact, delete-account

supabase secrets set \
  ANTHROPIC_API_KEY=sk-ant-... \
  ALLOWED_ORIGINS=https://dexacv.com \
  RESEND_API_KEY=re_... \
  CONTACT_EMAIL=you@example.com
```

`ALLOWED_ORIGINS` is not optional. The AI functions spend money on every call
and have no sign-in in front of them — deliberately, since the app is usable
without an account — so what stops them being a free Claude proxy is the
per-address rate limit and a CORS list that admits only this site.

## Shape of the code

```
src/api/backend.js   the only module that calls a backend for data
src/api/auth.js      the only module that touches sessions
src/api/supabase.js  the client both are built on
src/lib/cvStorage.js where CVs actually live — localStorage
supabase/functions/  edge functions; secrets exist here and nowhere else
supabase/migrations/ schema, storage bucket, RLS policies
```

Components never import a backend client. Adding a call means adding a function
to one of the two seams above. That is what let this project move off its
previous platform by changing two files instead of thirty call sites.

## Android

See [`android/README.md`](android/README.md). Two things surprise people:
`server.url` in `capacitor.config.json` is load-bearing rather than a
development leftover, and because the shell loads the live site, a web change
reaches users when the *site* is published — a new upload to Play is only
needed for the shell itself.

## Checks

```bash
npm run build
npm run lint     # 13 pre-existing unused-import errors; keep it no higher
```

A passing build does not prove a symbol is in scope: removing an import while a
use of it remains compiles cleanly and throws when clicked.
