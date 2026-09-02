import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { Capacitor } from '@capacitor/core'
import App from '@/App.jsx'
import { dismissBootScreen } from '@/lib/bootScreen'
import '@/index.css'

// Safety net for the boot screen. App.jsx normally clears it the moment the
// first route renders; this guarantees it never outlives a render that failed
// or stalled, which would otherwise leave a purple panel over a working app.
setTimeout(dismissBootScreen, 8000)

// One-time migration: clear any stale forced "dark" theme stored by the old
// defaultTheme="dark" setup, so the app follows the device preference (system).
try {
  if (!localStorage.getItem('dexacv_theme_migrated')) {
    if (localStorage.getItem('theme') === 'dark') localStorage.removeItem('theme')
    localStorage.setItem('dexacv_theme_migrated', '1')
  }
} catch (e) { /* ignore */ }

// Sign-in through an external provider finishes in the system browser and comes
// back as a https://dexacv.com link. Android hands that link to the app (see the
// App Link intent filter in AndroidManifest.xml), but the WebView just resumes
// on whatever page it was showing, dropping the token the redirect carried —
// the app reopens and the user is still signed out. Navigating to the delivered
// URL lets the normal web flow finish.
//
// The plugin is imported lazily so the web build never loads it.
if (Capacitor.isNativePlatform()) {
  import('@capacitor/app')
    .then(({ App: CapacitorApp }) =>
      CapacitorApp.addListener('appUrlOpen', ({ url }) => {
        if (url) window.location.href = url
      })
    )
    .catch((e) => console.error('appUrlOpen listener not registered', e))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <App />
  </ThemeProvider>
)