import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";

type AuthUser = {
  username: string;
  displayName: string;
  email?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      const payload = idToken?.payload;

      const givenName = payload?.given_name as string | undefined;
      const familyName = payload?.family_name as string | undefined;
      const fullName = [givenName, familyName].filter(Boolean).join(" ").trim();

      const displayName =
        fullName ||
        (payload?.name as string | undefined) ||
        (payload?.email as string | undefined) ||
        currentUser.username;

      const email = payload?.email as string | undefined;

      setUser({
        username: currentUser.username,
        displayName,
        email,
      });

      setToken(idToken?.toString() ?? null);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async () => {
    await signInWithRedirect();
  }, []);

  const logout = useCallback(async () => {
    await signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};