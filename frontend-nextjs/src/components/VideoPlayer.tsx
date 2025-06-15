import { useRef, useEffect } from "react";
import Hls from "hls.js";


// VideoPlayer component
interface VideoPlayerProps {
  hlsUrl: string;
  className?: string;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
}

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

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = hlsUrl;
    }

    // Cleanup function to destroy HLS instance when component unmounts
    return () => {
      hls?.destroy();
    };
  }, [hlsUrl]);

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
