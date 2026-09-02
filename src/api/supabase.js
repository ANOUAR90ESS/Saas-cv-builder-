// The Supabase client, created once for the whole app.
//
// Both values here are meant to be public: the anon key identifies the project
// and carries no privileges beyond what row-level security grants a signed-out
// visitor. The keys that matter — the service role, the Claude key — exist only
// inside edge functions and never reach a browser or an APK.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  url && anonKey && typeof url === "string" && url.trim().length > 0 && typeof anonKey === "string" && anonKey.trim().length > 0
);

if (!isSupabaseConfigured) {
  console.info(
    "Supabase credentials not configured in environment (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Running in offline/local mode.",
  );
}

const LOCAL_SESSION_KEY = "dexacv.local_session.v1";
const authSubscribers = new Set();

function getStoredLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredLocalUser(user) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch {
    // ignore
  }
  authSubscribers.forEach((cb) => {
    try {
      cb(user ? "SIGNED_IN" : "SIGNED_OUT", user ? { user } : null);
    } catch {
      // ignore
    }
  });
}

// Fallback client to support local/offline mode smoothly when Supabase credentials are not provided
const fallbackClient = {
  auth: {
    async getUser() {
      return { data: { user: getStoredLocalUser() }, error: null };
    },
    async getSession() {
      const user = getStoredLocalUser();
      return { data: { session: user ? { user } : null }, error: null };
    },
    onAuthStateChange(callback) {
      authSubscribers.add(callback);
      const user = getStoredLocalUser();
      try {
        callback(user ? "INITIAL_SESSION" : "NO_SESSION", user ? { user } : null);
      } catch {
        // ignore
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authSubscribers.delete(callback);
            },
          },
        },
      };
    },
    async signOut() {
      setStoredLocalUser(null);
      return { error: null };
    },
    async signInWithPassword({ email }) {
      const user = {
        id: "local-" + (email || "user").replace(/[^a-zA-Z0-9]/g, ""),
        email: email || "user@example.com",
        user_metadata: { full_name: (email || "user").split("@")[0] },
        full_name: (email || "user").split("@")[0],
      };
      setStoredLocalUser(user);
      return { data: { user, session: { user } }, error: null };
    },
    async signInWithOAuth({ provider, options }) {
      const user = {
        id: "google-local-user",
        email: "demo.user@example.com",
        user_metadata: { full_name: "Demo Google User" },
        full_name: "Demo Google User",
      };
      setStoredLocalUser(user);
      return { data: { provider: provider || "google", url: options?.redirectTo || "/" }, error: null };
    },
    async signUp({ email }) {
      const user = {
        id: "local-" + (email || "user").replace(/[^a-zA-Z0-9]/g, ""),
        email: email || "user@example.com",
        user_metadata: { full_name: (email || "user").split("@")[0] },
        full_name: (email || "user").split("@")[0],
      };
      setStoredLocalUser(user);
      return { data: { user, session: { user } }, error: null };
    },
    async verifyOtp({ email }) {
      const existing = getStoredLocalUser();
      const user = existing || {
        id: "local-user",
        email: email || "user@example.com",
        user_metadata: { full_name: "User" },
        full_name: "User",
      };
      setStoredLocalUser(user);
      return { data: { user, session: { user } }, error: null };
    },
    async resend() {
      return { data: { message: "Code sent" }, error: null };
    },
    async resetPasswordForEmail() {
      return { data: {}, error: null };
    },
    async updateUser({ data }) {
      const current = getStoredLocalUser() || { id: "local-user", email: "user@example.com" };
      const updated = {
        ...current,
        user_metadata: { ...current.user_metadata, ...(data || {}) },
        full_name: data?.full_name || current.full_name,
      };
      setStoredLocalUser(updated);
      return { data: { user: updated }, error: null };
    },
  },
  storage: {
    from() {
      return {
        async upload() {
          return { error: new Error("Supabase storage is not configured.") };
        },
        getPublicUrl() {
          return { data: { publicUrl: "" } };
        },
      };
    },
  },
  functions: {
    async invoke() {
      return { data: null, error: new Error("Supabase functions not configured.") };
    },
  },
};

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        // The session lives in localStorage so it survives a reload, and in the
        // Android shell it survives the app being closed, because the WebView is
        // served from the site's own origin.
        persistSession: true,
        autoRefreshToken: true,
        // The OAuth redirect comes back as a URL the app is handed rather than one
        // it navigated to itself, so the session is picked up from it explicitly.
        detectSessionInUrl: true,
      },
    })
  : fallbackClient;
