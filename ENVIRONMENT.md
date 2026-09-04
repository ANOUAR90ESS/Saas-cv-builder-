# Environment variables

Every value the project reads, where it comes from, and where it is allowed to
go. Extracted from the code rather than remembered: `import.meta.env` in `src/`,
`Deno.env.get` in `supabase/functions/`, and `keystoreProperties` in
`android/app/build.gradle`.

## The one rule

There are two kinds of value here and mixing them up is the mistake that
matters.

**Public** values are compiled into the JavaScript bundle. That bundle is
served to every visitor and packed into the Android APK, where anyone can
unzip it and read the strings. A value is public the moment Vite sees it —
that is what the `VITE_` prefix means, and Vite refuses to expose anything
without it.

**Secret** values live only on the server. A browser never receives them.

> **Sections 2 and 3 are out of date.** They describe Supabase edge functions.
> The code no longer calls Supabase: `src/lib/firebase.ts` and
> `src/api/auth.js` use Firebase, and the AI routes are served by `server.ts`.
> Only `supabase/migrations/` survives, and nothing runs it. Sections 1, 1b and
> 4 were checked against the code and are current.

> Putting `ANTHROPIC_API_KEY` in `.env.local` does not make the AI work — the
> frontend never calls Claude. It publishes your key.

---

## 1. Frontend — `.env.local`

Copy `.env.example` to `.env.local`. In production these go in Vercel under
**Settings → Environment Variables**, with the same names.

All of them come from one page: Firebase Console → **Project settings** →
General → *Your apps* → the web app → **SDK setup and configuration** →
*Config*.

| Name | Config key | Example |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | `your-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | `123456789012` |
| `VITE_FIREBASE_APP_ID` | `appId` | `1:1234:web:abcd` |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | — | blank unless you made a *named* Firestore database |

Every one is **public**, and that is by design. Firebase publishes these in its
own quickstarts. They identify the project; what a caller may actually read or
write is decided by Firebase Auth and by `firestore.rules`, never by knowing
these strings. There is no Firebase value that is safe in the browser only if
kept quiet — the privileged credential is the Admin SDK's, which lives on the
server and is not in this table.

> **Replaces `firebase-applet-config.json`.** `src/lib/firebase.ts` used to
> import that file directly. It is gitignored, so a fresh clone had nothing to
> import and `npm run build` failed before it produced anything. If the file is
> still on your machine, `vite.config.js` reads it to fill in whatever these
> variables do not set, and warns. Once `.env.local` is in place you can delete
> it.

---

## 1b. Server — the host's environment

Read by `server.ts` through `process.env`. None is compiled into the bundle.

| Name | What it is for | Without it |
|---|---|---|
| `FIREBASE_PROJECT_ID` | firebase-admin verifies the ID tokens `requireAuth` checks | the server refuses to start |
| `GEMINI_API_KEY` | the `/api/functions/ai-assist` and `import-profile` routes | those routes answer `503`; the rest of the app works |
| `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME` | Postgres behind `/api/cvs` and `/api/user/sync` | those two routes fail; CVs still live in `localStorage` |

`FIREBASE_PROJECT_ID` is the same project as `VITE_FIREBASE_PROJECT_ID` and is
not a secret; it is listed separately only because the server reads it from a
different place. `GEMINI_API_KEY` **is** a secret and must never be given a
`VITE_` name.

### Guards on the AI routes

`/api/functions/ai-assist` and `/api/functions/import-profile` have no sign-in
in front of them, deliberately: the app is usable without an account. They do
spend money on every call, so `src/middleware/aiGuard.ts` bounds that. Every
variable is optional.

| Name | Default | What it does |
|---|---|---|
| `ALLOWED_ORIGINS` | unset | Comma-separated origins that may call `/api/functions` from a browser. Requests from the origin the app is served on are **always** allowed, so this is only for other origins. Unset refuses none, and the server warns at startup. |
| `AI_RATE_LIMIT` | `30` | Calls per address per window. |
| `AI_RATE_WINDOW_MINUTES` | `10` | Length of that window. |
| `AI_MAX_BODY_KB` | `64` | Largest accepted body; cost scales with input length. |
| `TRUST_PROXY` | unset | Set behind a proxy that adds `X-Forwarded-For`. Without it `req.ip` is the proxy, every visitor shares one bucket, and one busy user rate-limits the rest. |

Be honest about what this buys. The origin check is real protection against
another site putting these endpoints behind its own UI, because the browser
sets `Origin` and a page cannot forge it — and no protection at all against a
script, which sets whatever headers it likes. The rate limit is the volume
defence, and it counts in the server's memory: behind more than one instance
the effective limit is per instance, and a restart clears the counters. It
bounds accidental and casual abuse, not a determined attacker with many
addresses. `supabase/migrations/20260902120000_rate_limits.sql` holds a
Postgres-backed version of the same idea, written for the old edge functions
and not wired to anything.

---

## 2. Edge function secrets — `supabase secrets set`

These are **secret**. They are set once against the project and never appear in
any file the build reads:

```bash
supabase secrets set \
  ANTHROPIC_API_KEY=sk-ant-... \
  ALLOWED_ORIGINS=https://dexacv.com \
  RESEND_API_KEY=re_... \
  CONTACT_EMAIL=you@example.com
```

| Name | Where to get it | Example | Needed by |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys | `sk-ant-api03-...` | `ai-assist`, `import-profile` |
| `ALLOWED_ORIGINS` | you decide — see below | `https://dexacv.com` | every function |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys | `re_...` | `contact` |
| `CONTACT_EMAIL` | you decide | `you@example.com` | `contact` |
| `CONTACT_FROM` | optional, see below | `DexaCV <noreply@dexacv.com>` | `contact` |

`ANTHROPIC_API_KEY` is read by the SDK, not by any line of code — `new
Anthropic()` picks it up from the environment. It will not appear if you grep
for it, and the functions fail with an authentication error when it is missing.

**`ALLOWED_ORIGINS`** is a comma-separated list, no spaces needed. It is not
housekeeping: the AI functions spend money on every call and have no sign-in in
front of them, deliberately, because the app is usable without an account. This
list plus the per-address rate limit is the whole thing standing between your
Claude bill and anyone who finds the URL. Any `http://localhost:PORT` is
accepted automatically so `npm run dev` works without listing ports.

Defaults to `https://dexacv.com`. Set it explicitly once you have a real
deployment URL — including the temporary Vercel one, while you are testing
there:

```
ALLOWED_ORIGINS=https://dexacv.com,https://dexacv-xyz.vercel.app
```

**`CONTACT_FROM`** must be an address on a domain verified with Resend.
Defaults to `DexaCV <noreply@dexacv.com>`, which only works once `dexacv.com`
is verified there. The person who wrote to you goes in `reply-to`, not `from`,
because a `from` the sending domain has not authorised gets the mail rejected
or filed as spam.

Check what is set with `supabase secrets list` — it shows names and digests,
never the values.

---

## 3. Provided by Supabase — do not set these

The functions read three more names. Supabase injects them into every function
automatically; setting them by hand does nothing useful and setting them wrong
breaks the functions quietly.

| Name | What it is | Used by |
|---|---|---|
| `SUPABASE_URL` | the project URL again, function-side | rate limiting, `delete-account` |
| `SUPABASE_ANON_KEY` | the public key again, function-side | `delete-account`, to read the caller's identity under RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | full access, bypasses RLS | rate limiting, `delete-account` |

The service role key is why `delete-account` and the rate limiter must be
server-side at all: deleting a user is an admin operation, and the rate-limit
table denies every client through RLS on purpose.

---

## 4. Android signing — `android/key.properties`

Only needed to build a release bundle for Google Play. The file is gitignored;
so is any `*.jks` or `*.keystore`. **A keystore in the repository lets anyone
who clones it publish an update to your listing.**

```properties
storeFile=../dexacv-upload.jks
storePassword=...
keyAlias=...
keyPassword=...
```

| Name | What it is |
|---|---|
| `storeFile` | path to the keystore, resolved from `android/`; an absolute path also works |
| `storePassword` | the keystore's password |
| `keyAlias` | which key inside it — `keytool -list -v -keystore FILE` lists them |
| `keyPassword` | that key's password |

This must be the same upload key every previous release was signed with. Play
binds a listing to its key permanently.

> If this file is missing or its path is wrong, the build **succeeds and
> produces an unsigned bundle** — the signing config is behind an existence
> check. Play then rejects it with a message that does not mention the cause.
> Confirm before uploading:
>
> ```bash
> keytool -printcert -jarfile app/build/outputs/bundle/release/app-release.aab
> ```
>
> No certificate printed means no signature.

Unrelated to this file, and easy to confuse with it: the fingerprints in
`public/.well-known/assetlinks.json` are the **app signing** certificate's, not
the upload key's. Play re-signs every upload with its own key, so what an
installed app presents is never your upload certificate. See
`android/README.md`.

---

## Checklist

Local development:

- [ ] `.env.local` has every `VITE_FIREBASE_` value from section 1
- [ ] `FIREBASE_PROJECT_ID` and `GEMINI_API_KEY` are in the shell that runs `npm run dev`

Before a production deploy:

- [ ] every `VITE_FIREBASE_` value set in Vercel
- [ ] the section 1b server variables set on the host
- [ ] `ALLOWED_ORIGINS` includes the deployment's real origin
- [ ] `CONTACT_FROM` is on a domain verified with Resend
- [ ] nothing secret appears in `git grep -i "sk-ant-\|re_\|service_role"`

Before an Android release:

- [ ] `android/key.properties` points at the real upload keystore
- [ ] `keytool -printcert -jarfile` prints a certificate
- [ ] `versionCode` in `android/app/build.gradle` is above every build on every
      Play track
