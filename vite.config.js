import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// The `@/` alias is declared here and mirrored by the `paths` entry in
// jsconfig.json that the editor reads — keep the two in step, or imports
// resolve for one and not the other.
const root = path.dirname(fileURLToPath(import.meta.url))
const src = path.resolve(root, "src")

// Firebase's web config used to be a JSON file imported directly by
// src/lib/firebase.ts. That file is gitignored, so a fresh clone and any
// build server had nothing to import and the build failed outright. The
// config now comes from VITE_FIREBASE_* variables instead.
//
// Machines that still have the old file keep working: its values fill in for
// any variable the environment does not already set. Delete the file once
// .env.local is in place; nothing else reads it.
const LEGACY_CONFIG = path.join(root, "firebase-applet-config.json")
const LEGACY_KEYS = {
  VITE_FIREBASE_API_KEY: "apiKey",
  VITE_FIREBASE_AUTH_DOMAIN: "authDomain",
  VITE_FIREBASE_PROJECT_ID: "projectId",
  VITE_FIREBASE_STORAGE_BUCKET: "storageBucket",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "messagingSenderId",
  VITE_FIREBASE_APP_ID: "appId",
  VITE_FIREBASE_FIRESTORE_DATABASE_ID: "firestoreDatabaseId",
}

function legacyFallback(env) {
  if (!fs.existsSync(LEGACY_CONFIG)) return {}
  let json
  try {
    json = JSON.parse(fs.readFileSync(LEGACY_CONFIG, "utf8"))
  } catch (err) {
    console.warn(`[firebase] ignoring unreadable ${path.basename(LEGACY_CONFIG)}: ${err.message}`)
    return {}
  }
  const define = {}
  for (const [envKey, jsonKey] of Object.entries(LEGACY_KEYS)) {
    // An explicit environment variable always wins over the old file.
    if (env[envKey]) continue
    if (json[jsonKey] == null) continue
    define[`import.meta.env.${envKey}`] = JSON.stringify(String(json[jsonKey]))
  }
  if (Object.keys(define).length) {
    console.warn(
      `[firebase] using ${path.basename(LEGACY_CONFIG)} for ${Object.keys(define).length} ` +
        `value(s). Move them to .env.local — see .env.example.`
    )
  }
  return define
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: legacyFallback(loadEnv(mode, root, "")),
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
  },
  resolve: {
    alias: { "@": src },
  },
}))
