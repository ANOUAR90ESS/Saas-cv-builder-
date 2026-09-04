import path from "node:path"
import { fileURLToPath } from "node:url"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The `@/` alias is declared here and mirrored by the `paths` entry in
// jsconfig.json that the editor reads — keep the two in step, or imports
// resolve for one and not the other.
const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src")

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
  },
  resolve: {
    alias: { "@": src },
  },
})
