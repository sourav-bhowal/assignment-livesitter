"use client";
import { useEffect } from "react";
import OverlayItem from "./OverlayItem";
import { useOverlay } from "@/context/OverlayContext";

const VideoOverlayRenderer = ({ streamId }: { streamId: string }) => {
  const { overlays, isLoading, loadOverlays, updateOverlay } = useOverlay();

  // Load overlays on mount
  useEffect(() => {
    loadOverlays(streamId);
  }, [loadOverlays, streamId]);

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
        />
      ))}
    </div>
  );
};

export default VideoOverlayRenderer;
