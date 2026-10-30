"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getSpecifications } from "@/lib/specificationApi";
import { formatApiError } from "@/lib/utils";
import { DEFAULT_PROFILE, type SpecificationResponse } from "@/lib/types";

const STORAGE_KEY = "commitlens-selected-profile";

export interface SpecificationContextType {
  specifications: SpecificationResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectedProfile: string;
  setSelectedProfile: (profile: string) => void;
}

const SpecificationContext = createContext<SpecificationContextType | undefined>(undefined);

export function SpecificationProvider({ children }: { children: ReactNode }) {
  const [specifications, setSpecifications] = useState<SpecificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfileState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved.trim()) return saved.trim();
      } catch {
        // Ignore
      }
    }
    return DEFAULT_PROFILE;
  });

  // Client-side hydration sync for localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        setSelectedProfileState(saved.trim());
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSpecifications();
      if (!res.success || !res.data) {
        setError(formatApiError(res, "Failed to load specifications."));
      } else {
        setSpecifications(res.data);
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const setSelectedProfile = useCallback((profileName: string) => {
    const next = profileName?.trim() || DEFAULT_PROFILE;
    setSelectedProfileState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Validate selectedProfile against loaded specifications:
  // If a custom profile was selected, specifications finished loading without error,
  // and the profile is no longer in the list (e.g. deleted), revert to DEFAULT_PROFILE.
  useEffect(() => {
    if (selectedProfile === DEFAULT_PROFILE || loading || error) return;
    const exists = specifications.some((spec) => spec.profileName === selectedProfile);
    if (!exists) {
      setSelectedProfile(DEFAULT_PROFILE);
    }
  }, [specifications, loading, error, selectedProfile, setSelectedProfile]);

  return (
    <SpecificationContext.Provider
      value={{
        specifications,
        loading,
        error,
        refetch,
        selectedProfile,
        setSelectedProfile,
      }}
    >
      {children}
    </SpecificationContext.Provider>
  );
}

export function useSpecifications(): SpecificationContextType {
  const context = useContext(SpecificationContext);
  if (!context) {
    throw new Error("useSpecifications must be used within a SpecificationProvider");
  }
  return context;
}
