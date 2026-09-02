# AGENTS.md

## Project Context

DexaCV is a CV builder that works without an account. It is a Vite + React
single-page app; the Android app in `android/` is a Capacitor shell that loads
the deployed site, so it is the same code on both.

Treat it as user-owned application code, keep changes focused on the request,
and follow the conventions already in the file you are editing.

## The two seams

Nothing in `src/` talks to a backend except through these:

- `src/api/backend.js` — AI assistance, profile import, file upload, contact
  form, account deletion.
- `src/api/auth.js` — sessions, sign-in, sign-up, password recovery.

Both are thin: they call Supabase and normalise its `{ data, error }` into the
exceptions the pages expect. Adding a backend call means adding a function
there, not importing a client into a component. This is what made moving off
the previous platform a change to two files rather than thirty call sites.

## Key files

- `src/api/supabase.js` — the client, from `VITE_SUPABASE_*`.
- `src/lib/cvStorage.js` — where CVs actually live: `localStorage`, not a
  database. Nothing about a CV is sent anywhere unless the user exports it or
  asks the AI about it.
- `supabase/functions/` — the edge functions. Secrets live here and only here.
- `supabase/migrations/` — schema and storage policies.
- `capacitor.config.json` — `server.url` points the Android shell at the live
  site. Read `android/README.md` before touching it.

## Working notes

- `npm run dev` for the frontend. `supabase functions serve` for the functions;
  `supabase db push` applies migrations.
- Copy `.env.example` to `.env.local` and fill in the two `VITE_` values.
  `ENVIRONMENT.md` lists every variable and which side of the wire it lives on. The
  rest of that file documents function secrets, which are set with
  `supabase secrets set` and must never reach a `.env` the build can read —
  anything Vite inlines ends up in the bundle and inside the APK.
- Run `npm run build` and `npm run lint` before finishing. Lint currently
  reports 13 pre-existing unused-import errors; leave the count no higher than
  you found it.
- A build passing proves nothing about a symbol being in scope. Removing an
  import while a use of it remains compiles cleanly and throws on click — grep
  for the symbol before deleting its import.

## The rule that is not stylistic

Every AI prompt in `supabase/functions/` forbids inventing facts. An earlier
version of this app returned fabricated achievements — "+34% throughput",
"99.9% uptime" — which a user would then put on a real CV and take to a real
interview. Improve the user's own words; never add experience they did not
describe.
