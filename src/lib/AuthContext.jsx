import React, { createContext, useContext, useEffect, useState } from 'react';
import { currentUser, onAuthChange, signOut } from '@/api/auth';

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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    try {
      setUser(await currentUser());
      setAuthError(null);
    } catch (error) {
      // Reaching here means the network or the auth service failed — "nobody
      // is signed in" comes back from currentUser() as null, not as a throw.
      console.error('Auth check failed:', error);
      setAuthError({ type: 'unknown', message: error.message });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkUserAuth();
    // Keeps this tab in step with a sign-in finishing, a token refreshing, or
    // a sign-out in another tab.
    return onAuthChange((nextUser) => {
      setUser(nextUser);
      setIsLoadingAuth(false);
    });
  }, []);

  const logout = async (shouldRedirect = true) => {
    await signOut();
    setUser(null);
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
