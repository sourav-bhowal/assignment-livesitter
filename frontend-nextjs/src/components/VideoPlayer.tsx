import { useRef, useEffect } from "react";
import Hls from "hls.js";

// VideoPlayer component Props
interface VideoPlayerProps {
  hlsUrl: string;
  className?: string;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
}

// VideoPlayer component to render HLS video streams
export const VideoPlayer = ({
  hlsUrl,
  className,
  controls,
  autoplay,
  muted,
}: VideoPlayerProps) => {
  // Reference to the video element
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Effect to initialize HLS.js and attach it to the video element
  useEffect(() => {
    if (!videoRef.current) return;

    // Check if HLS is supported and create an instance
    // If not supported, fallback to native HLS support in browsers like Safari
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls(); // Create a new HLS instance
      hls.loadSource(hlsUrl); // Load the HLS source URL
      hls.attachMedia(videoRef.current); // Attach the media element to HLS instance
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = hlsUrl;
    }

    // Cleanup function to destroy HLS instance when component unmounts
    return () => {
      hls?.destroy();
    };
  }, [hlsUrl]);

  // Render the video element
  return (
    <video
      ref={videoRef}
      autoPlay={autoplay}
      controls={controls}
      muted={muted}
      controlsList="nodownload nofullscreen"
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
      className={className}
    />
  );
};
