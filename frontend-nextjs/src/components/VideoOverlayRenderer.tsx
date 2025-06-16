"use client";
import { useEffect } from "react";
import OverlayItem from "./OverlayItem";
import { useOverlay } from "@/context/OverlayContext";

const VideoOverlayRenderer = ({ streamId }: { streamId: string }) => {
  // Use the OverlayContext to access overlays and related functions
  const { overlays, isLoading, loadOverlays, updateOverlay } = useOverlay();

  // Load overlays on mount
  useEffect(() => {
    loadOverlays(streamId);
  }, [loadOverlays, streamId]);

  // If loading, return null
  if (isLoading) {
    return null;
  }

  // Render Component
  return (
    <div className="pointer-events-auto">
      {overlays.map((overlay) => (
        <OverlayItem
          key={overlay._id}
          overlay={overlay}
          onUpdate={updateOverlay}
        />
      ))}
    </div>
  );
};

export default VideoOverlayRenderer;
