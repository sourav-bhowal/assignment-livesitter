import { useRef, useEffect } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  hlsUrl: string;
}

const VideoPlayer = ({ hlsUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

    return () => {
      hls?.destroy();
    };
  }, [hlsUrl]);

  return (
    <video
      ref={videoRef}
      autoPlay
      controls
      controlsList="nodownload nofullscreen"
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
};

export default VideoPlayer;
