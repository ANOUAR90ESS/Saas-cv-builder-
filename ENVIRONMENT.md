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

**Secret** values live only inside edge functions, which run on Supabase's
servers. A browser never receives them.

> Putting `ANTHROPIC_API_KEY` in `.env.local` does not make the AI work — the
> frontend never calls Claude. It publishes your key.

---

## 1. Frontend — `.env.local`

Copy `.env.example` to `.env.local`. In production these go in Vercel under
**Settings → Environment Variables**, with the same names.

| Name | Where to get it | Example |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | same page → **Project API keys** → `anon` `public` | `eyJhbGciOi...` (a long JWT) |

Both are **public**, and that is by design. The anon key identifies the project
and carries no privileges beyond what row-level security grants a signed-out
visitor. Supabase publishes it in its own examples.

The `service_role` key sits on that same page and is **not** one of these. It
bypasses row-level security entirely. It never goes in a `VITE_` variable, and
you never need to set it by hand — see section 3.

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

- [ ] `.env.local` has both `VITE_` values
- [ ] `supabase secrets set` run with the four secrets
- [ ] `supabase db push` and `supabase functions deploy` run

Before a production deploy:

- [ ] both `VITE_` values set in Vercel
- [ ] `ALLOWED_ORIGINS` includes the deployment's real origin
- [ ] `CONTACT_FROM` is on a domain verified with Resend
- [ ] nothing secret appears in `git grep -i "sk-ant-\|re_\|service_role"`

Before an Android release:

- [ ] `android/key.properties` points at the real upload keystore
- [ ] `keytool -printcert -jarfile` prints a certificate
- [ ] `versionCode` in `android/app/build.gradle` is above every build on every
      Play track
