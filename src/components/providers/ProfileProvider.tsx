"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ProfileProvider — shared context for the authenticated user's profile
//
// Depends on AuthProvider being mounted above it in the tree.
// When the auth user is available, fetches (or creates fallback for)
// the matching profile row from Supabase.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getProfileByUserId } from "@/lib/supabase/profile";
import type { Profile } from "@/lib/supabase/types";

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  /** Force a re-fetch of the profile (e.g. after editing name) */
  refetch: () => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loading: true,
  refetch: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    // Wait for auth to settle
    if (authLoading) return;

    // Not logged in → no profile
    if (!user) {
      queueMicrotask(() => {
        setProfile(null);
        setLoading(false);
      });
      return;
    }

    // Fetch profile for authenticated user
    let cancelled = false;
    getProfileByUserId(user.id)
      .then((p) => { if (!cancelled) setProfile(p); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, authLoading, seq]);

  const refetch = () => setSeq((s) => s + 1);

  return (
    <ProfileContext.Provider value={{ profile, loading, refetch }}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Access the shared profile. Must be used inside <ProfileProvider>.
 */
export function useProfileContext(): ProfileContextValue {
  return useContext(ProfileContext);
}
