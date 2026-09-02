# The Android app

A Capacitor shell around the web app. There is no separate mobile codebase:
the templates, the exports, the translations and the AI all come from `src/`,
so a fix lands in both places at once.

## `server.url` is load-bearing — do not remove it

`capacitor.config.json` sets:

```json
"server": { "url": "https://dexacv.com" }
```

Capacitor's documentation presents `server.url` as a development setting for
live reload, so it reads like a leftover. It is not. Removing it breaks the AI
features in the shipped app, and nothing else — which makes the cause hard to
find later.

Without it the WebView serves the bundled `dist/` from the origin
`https://localhost`. The Base44 client is created with `serverUrl: ''`
(`src/api/base44Client.js`), so every API call is a *relative* URL. On the web
that resolves against `https://dexacv.com` and reaches the backend. Inside the
shell it resolves against `https://localhost` — the app's own asset server —
so `base44.functions.invoke("aiAssist", …)` never leaves the phone. The rest of
the app keeps working, because the rest of the app needs no network.

Pointing the shell at the live site makes the WebView's origin the real one.
Relative URLs resolve correctly, the session cookie is sent, and there is no
cross-origin request to configure. Whatever works in Chrome works here.

The cost is that the app loads the site over the network at each launch: it
needs a connection, and it starts slower than bundled assets would. The
bundled `dist/` is not used while this is set.

## Sign-in that returns to the app

Signing in through an external provider leaves the app for the system browser
and comes back as a `https://dexacv.com/...` redirect. `AndroidManifest.xml`
declares an App Link intent filter for that host and `src/main.jsx` navigates
to whatever URL the OS delivers, which is what lets the token in that redirect
reach the page.

Android only routes the link to the app once the site vouches for it, through
the fingerprint in `public/.well-known/assetlinks.json`. That file is served
by the website, not shipped inside the APK, so changing it means republishing
the *site* — uploading a new build to Play does nothing for it.

The fingerprint has to be the one the installed app actually presents. With
Play App Signing enabled, that is the **app signing** certificate (Play
Console → Setup → App integrity), not the upload certificate: Play strips your
signature and re-signs every build with its own key, so the upload key's
fingerprint can never match what reaches a device. A build side-loaded over
adb presents whichever key signed it locally, which is why App Links will not
verify against a `gradlew assembleDebug` install unless that key's fingerprint
is listed too — the field is an array and accepts both.

`assetlinks.json` lists three fingerprints, because three different keys can
end up signing this package and Android checks the one in front of it:

- `17:41:8F…` — the app signing certificate. Play re-signs every upload with
  it, so this is what a device installing from any Play track presents. This
  is the one that matters in production.
- `03:EC:14…` — the legacy certificate Play kept from before the signing key
  was upgraded. Installs predating the upgrade still present it.
- `E1:DD:AC…` — the key that signs builds made here, which is what a
  `gradlew assembleDebug` install over adb presents. Without it App Links
  never verify while testing locally. Drop it if local App Link testing stops
  mattering; leaving it lets anyone holding that keystore claim dexacv.com
  links from a package named com.dexacv.

Until a matching fingerprint is live, `autoVerify` fails, `https://dexacv.com`
links keep opening in the browser, and the sign-in return stays broken.
Nothing else changes, so shipping ahead of it is safe.

Check it with:

```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://dexacv.com&relation=delegate_permission/common.handle_all_urls
```

## Releasing

```bash
npm run build
npx cap sync android
```

Then build the bundle from `android/` and upload it to the `com.dexacv`
listing, signed with the same upload key as every previous release. Raise
`versionCode` in `android/app/build.gradle` above every build already on any
track — internal testing and closed alpha included.

Because the shell loads the live site, most changes reach users when the site
is published. A new upload is only needed for what lives in the shell itself:
the icon, the splash screen, permissions, plugins, or this config.
