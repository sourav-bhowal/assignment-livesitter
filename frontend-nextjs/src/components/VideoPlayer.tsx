import { useRef, useEffect } from "react";
import Hls from "hls.js";

// VideoPlayer props interface
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

    // create an instance of Hls
    let hls: Hls | null = null;

    // If HLS is supported, load the source and attach to the video element
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
    }
    // If the browser supports native HLS playback (like Safari), set the source directly
    else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
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
