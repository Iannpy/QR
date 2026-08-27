import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  authed: boolean | null; // null = verificando
  user: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [user, setUser] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        setAuthed(true);
        setUser(data.user ?? null);
      } else {
        setAuthed(false);
        setUser(null);
      }
    } catch {
      setAuthed(false);
      setUser(null);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (username: string, password: string) => {
    const fd = new FormData();
    fd.append("username", username);
    fd.append("password", password);
    try {
      const res = await fetch("/api/login", { method: "POST", body: fd });
      if (res.ok) {
        await refresh();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await fetch("/logout");
    setAuthed(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authed, user, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
