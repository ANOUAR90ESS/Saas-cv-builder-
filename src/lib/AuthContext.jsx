import React, { createContext, useContext, useEffect, useState } from 'react';

// @/api/auth is NOT imported at the top. It pulls in the Firebase Auth SDK,
// which was 570 KB of the entry chunk -- the single largest thing the app
// downloaded before it could paint anything. This app works without an
// account by design, so the first screen has no business waiting on an auth
// library. It is imported on mount instead, in parallel with the first route.
const authModule = () => import('@/api/auth');

// Whether the last visit ended signed in. A signed-out visitor -- who the app
// is built for -- renders immediately. A returning signed-in user still gets
// the brief gate, so they never see a signed-out header flash to their
// account. Only a hint: it decides how to wait, never who anyone is.
const SESSION_HINT = 'dexacv_had_session';

function expectsSession() {
  try {
    return localStorage.getItem(SESSION_HINT) === '1';
  } catch {
    return false;
  }
}

function rememberSession(hasUser) {
  try {
    localStorage.setItem(SESSION_HINT, hasUser ? '1' : '0');
  } catch {
    // Private mode, or storage disabled. The hint is optional.
  }
}

// Session state for the whole app.
//
// This is much smaller than the version it replaces, and the difference is not
// simplification for its own sake. The previous one spoke a platform's dialect:
// it fetched an app's public settings before it could tell whether a visitor
// was allowed in at all, and distinguished "not signed in" from "signed in but
// not registered for this app" — a state that only exists when a platform sits
// between an app and its users. There is no platform now. A visitor either has
// a session or does not.
//
// The exported shape is unchanged, so nothing downstream had to move:
// `isLoadingPublicSettings` and `authChecked` are still here, now as the plain
// facts they name rather than the outcome of a handshake.
//
// Navigation goes through window.location rather than useNavigate, because
// App.jsx mounts this provider outside the Router — a router hook here throws
// on the first render.

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(expectsSession);
  const [authError, setAuthError] = useState(null);

  const applyUser = (nextUser) => {
    setUser(nextUser);
    rememberSession(!!nextUser);
    setIsLoadingAuth(false);
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    try {
      const { currentUser } = await authModule();
      applyUser(await currentUser());
      setAuthError(null);
    } catch (error) {
      // Reaching here means the network or the auth service failed — "nobody
      // is signed in" comes back from currentUser() as null, not as a throw.
      console.error('Auth check failed:', error);
      setAuthError({ type: 'unknown', message: error.message });
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;

    checkUserAuth();

    // Keeps this tab in step with a sign-in finishing, a token refreshing, or
    // a sign-out in another tab.
    authModule()
      .then(({ onAuthChange }) => {
        if (cancelled) return;
        unsubscribe = onAuthChange(applyUser);
      })
      .catch((error) => console.error('Auth listener not registered:', error));

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    const { signOut } = await authModule();
    await signOut();
    setUser(null);
    rememberSession(false);
    if (shouldRedirect) window.location.href = '/';
  };

  const navigateToLogin = () => {
    // Returns here afterwards, rather than dropping the user on the home page
    // having lost whatever they were in the middle of.
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingAuth,
        // Nothing needs fetching before the app can render now; kept so the
        // components that read it need no change.
        isLoadingPublicSettings: false,
        authChecked: !isLoadingAuth,
        authError,
        checkUserAuth,
        logout,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
