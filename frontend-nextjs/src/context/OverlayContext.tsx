"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import axios from "axios";
import { overlay } from "@/lib/utils";

interface OverlayContextType {
  overlays: overlay[];
  isLoading: boolean;
  error: string;
  loadOverlays: (streamId: string) => Promise<void>;
  addOverlay: (streamId: string, overlay: Partial<overlay>) => Promise<void>;
  updateOverlay: (id: string, changes: Partial<overlay>) => Promise<void>;
  deleteOverlay: (id: string) => Promise<void>;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlays, setOverlays] = useState<overlay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOverlays = useCallback(async (streamId: string) => {
    try {
      setError("");
      if (overlays.length === 0) {
        setIsLoading(true);
      }
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${streamId}`
      );
      setOverlays(res.data);
    } catch (err) {
      console.error("Failed to load overlays", err);
      setError("Failed to load overlays");
    } finally {
      setIsLoading(false);
    }
  }, [overlays.length]);

  const addOverlay = useCallback(async (streamId: string, newOverlay: Partial<overlay>) => {
    try {
      setError("");
      const overlayWithStreamId = { ...newOverlay, stream_id: streamId };
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays`,
        overlayWithStreamId
      );
      await loadOverlays(streamId);
    } catch (err) {
      console.error("Failed to add overlay", err);
      setError("Failed to add overlay");
      throw err;
    }
  }, [loadOverlays]);

  const updateOverlay = useCallback(async (id: string, changes: Partial<overlay>) => {
    try {
      setError("");
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${id}`,
        changes
      );
      setOverlays(prev => prev.map(overlay => 
        overlay._id === id ? { ...overlay, ...changes } : overlay
      ));
    } catch (err) {
      console.error("Failed to update overlay", err);
      setError("Failed to update overlay");
      throw err;
    }
  }, []);

  const deleteOverlay = useCallback(async (id: string) => {
    try {
      setError("");
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${id}`);
      setOverlays(prev => prev.filter(overlay => overlay._id !== id));
    } catch (err) {
      console.error("Failed to delete overlay", err);
      setError("Failed to delete overlay");
      throw err;
    }
  }, []);

  return (
    <OverlayContext.Provider
      value={{
        overlays,
        isLoading,
        error,
        loadOverlays,
        addOverlay,
        updateOverlay,
        deleteOverlay,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
}