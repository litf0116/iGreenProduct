import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import api from "../lib/api";
import { User as UserType } from "../lib/types";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  currentUser: UserType | null;
  checkAuth: () => Promise<boolean>;
  login: (username: string, password: string, country: string) => Promise<void>;
  logout: () => void;
  signUp: (name: string, username: string, email: string, password: string, role: string, country: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const authChecked = useRef(false);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        localStorage.removeItem("auth_token");
        setIsAuthenticated(false);
        return false;
      }
    }
    setIsAuthenticated(false);
    return false;
  }, []);

  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;
    
    checkAuth().finally(() => {
      setLoading(false);
    });
  }, [checkAuth]);

  const login = useCallback(async (username: string, password: string, country: string) => {
    await api.login(username, password, country);
    const user = await api.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  const signUp = useCallback(async (
    name: string,
    username: string,
    email: string,
    password: string,
    role: string,
    country: string
  ) => {
    await api.register({ name, username, email, password, role: role.toUpperCase(), country });
    const user = await api.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, currentUser, checkAuth, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
