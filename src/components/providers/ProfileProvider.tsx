"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ProfileProvider — shared context for the device profile
//
// Replaces individual `useProfile()` calls in every hook/component.
// Wrap the app once (in the main layout) and all children share the same
// profile instance without triggering redundant Supabase calls.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getOrCreateProfile } from "@/lib/supabase/profile";
import type { Profile } from "@/lib/supabase/types";

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loading: true,
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrCreateProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Access the shared profile. Must be used inside <ProfileProvider>.
 * Drop-in replacement for the old `useProfile()` hook.
 */
export function useProfileContext(): ProfileContextValue {
  return useContext(ProfileContext);
}
