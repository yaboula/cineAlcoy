"use client";

// ─────────────────────────────────────────────────────────────────────────────
// AuthProvider — Supabase Auth session context
//
// Provides: user, session, loading state, signIn, signUp, signOut
// Wraps the main layout. Listens to onAuthStateChange for real-time updates.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: "AuthProvider not mounted" }),
  signUp: async () => ({ error: "AuthProvider not mounted" }),
  signOut: async () => {},
});

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // ── Sign In ────────────────────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const supabase = createClient();
      if (!supabase) return { error: "Supabase no configurado" };

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: translateAuthError(error.message) };
      return { error: null };
    },
    []
  );

  // ── Sign Up ────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<{ error: string | null }> => {
      const supabase = createClient();
      if (!supabase) return { error: "Supabase no configurado" };

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || "Usuario" },
        },
      });

      if (error) return { error: translateAuthError(error.message) };
      return { error: null };
    },
    []
  );

  // ── Sign Out ───────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

// ── Error translations (Supabase → Spanish) ────────────────────────────────
function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Email o contraseña incorrectos";
  if (msg.includes("User already registered"))
    return "Ya existe una cuenta con este email";
  if (msg.includes("Password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres";
  if (msg.includes("Unable to validate email"))
    return "Introduce un email válido";
  if (msg.includes("Email rate limit exceeded"))
    return "Demasiados intentos. Espera un momento.";
  if (msg.includes("Signup is disabled"))
    return "El registro está deshabilitado";
  return msg;
}
