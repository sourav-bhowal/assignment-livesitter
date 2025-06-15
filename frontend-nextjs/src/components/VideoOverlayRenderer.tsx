"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { OverlayItem } from "./OverlayItem";
import { overlay } from "@/lib/utils";

export const VideoOverlayRenderer = ({ streamId }: { streamId: string }) => {
  // State to manage overlays and loading state
  const [overlays, setOverlays] = useState<overlay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load overlays from backend
  const loadOverlays = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${streamId}`
      );
      setOverlays(res.data);
    } catch (err) {
      console.error("Failed to load overlays", err);
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  // Update overlay
  const updateOverlay = async (id: string, changes: Partial<overlay>) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${id}`,
        changes
      );
      await loadOverlays();
    } catch (err) {
      console.error("Failed to update overlay", err);
    }
  };

  // Delete overlay
  const deleteOverlay = async (id: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${id}`
      );
      await loadOverlays();
    } catch (err) {
      console.error("Failed to delete overlay", err);
    }
  };

  // Load overlays on mount and set up polling for real-time updates
  useEffect(() => {
    loadOverlays();

    // Optional: Poll for updates every 5 seconds
    const interval = setInterval(loadOverlays, 5000);
    return () => clearInterval(interval);
  }, [loadOverlays]);

  // If still loading, return null to avoid rendering before data is ready
  if (isLoading) {
    return null;
  }

  return (
    <div className="pointer-events-auto">
      {overlays.map((overlay) => (
        <OverlayItem
          key={overlay._id}
          overlay={overlay}
          onUpdate={updateOverlay}
          onDelete={deleteOverlay}
        />
      ))}
    </div>
  );
};
