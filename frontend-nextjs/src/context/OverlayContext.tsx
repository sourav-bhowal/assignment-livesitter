"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";
import { overlay } from "@/lib/utils";

// Interface for the overlay context
interface OverlayContextType {
  overlays: overlay[];
  isLoading: boolean;
  error: string;
  loadOverlays: (streamId: string) => Promise<void>;
  addOverlay: (streamId: string, overlay: Partial<overlay>) => Promise<void>;
  updateOverlay: (id: string, changes: Partial<overlay>) => Promise<void>;
  deleteOverlay: (id: string) => Promise<void>;
}

// Create the context with a default value of undefined
const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: ReactNode }) {
  // State to hold overlays, loading state, and error message
  const [overlays, setOverlays] = useState<overlay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to load overlays for a specific stream
  // It fetches overlays from the backend and updates the state
  const loadOverlays = useCallback(
    async (streamId: string) => {
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
    },
    [overlays.length]
  );

  // Functions to add, update, and delete overlays
  // These functions interact with the backend API to manage overlays
  const addOverlay = useCallback(
    async (streamId: string, newOverlay: Partial<overlay>) => {
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
    },
    [loadOverlays]
  );

  const updateOverlay = useCallback(
    async (id: string, changes: Partial<overlay>) => {
      try {
        setError("");
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${id}`,
          changes
        );
        setOverlays((prev) =>
          prev.map((overlay) =>
            overlay._id === id ? { ...overlay, ...changes } : overlay
          )
        );
      } catch (err) {
        console.error("Failed to update overlay", err);
        setError("Failed to update overlay");
        throw err;
      }
    },
    []
  );

  const deleteOverlay = useCallback(async (id: string) => {
    try {
      setError("");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${id}`
      );
      setOverlays((prev) => prev.filter((overlay) => overlay._id !== id));
    } catch (err) {
      console.error("Failed to delete overlay", err);
      setError("Failed to delete overlay");
      throw err;
    }
  }, []);

  // Provide the context value to children components
  // This includes the overlays, loading state, error message, and functions
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

// Custom hook to use the OverlayContext
export function useOverlay() {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
}
