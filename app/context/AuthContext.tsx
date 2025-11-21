"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  userId: string;
  email: string;
  role?: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(initialToken);
  const [loading, setLoading] = useState<boolean>(!!initialToken);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("profile error");
        }

        const data = await res.json();
        if (!ignore) {
          setUser(data);
        }
      } catch (err) {
        if (!ignore) {
          setUser(null);
          setToken(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setLoading(false);
      throw new Error("Login failed");
    }

    const data = await res.json();

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", data.accessToken);
    }
    setToken(data.accessToken);

    router.push("/");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoading(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth ต้องอยู่ใน AuthProvider");
  }
  return ctx;
}
