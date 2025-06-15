"use client";

import { useState } from "react";
import axios from "axios";
import { VideoPlayer } from "@/components/VideoPlayer";
import OverlayControls from "@/components/OverlayControls";
import VideoOverlayRenderer from "@/components/VideoOverlayRenderer"; // Import VideoOverlayRenderer
import { Play, Loader2, Video, Wifi } from "lucide-react";

export default function MyStreamPage() {
  const [rtspUrl, setRtspUrl] = useState<string>("");
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [streamId, setStreamId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const startStream = async () => {
    if (!rtspUrl) {
      alert("Please enter a valid RTSP URL");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/start-stream`,
        {
          rtsp_url: rtspUrl,
        }
      );

      const hlsUrl =
        `${process.env.NEXT_PUBLIC_BACKEND_HLS_URL}` + res.data.hls_url;
      setHlsUrl(hlsUrl);
      const parts = res.data.hls_url.split("/");
      setStreamId(parts[2]);
    } catch (error) {
      console.error("Failed to start stream:", error);
      alert("Failed to start stream. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/stop-stream/${streamId}`);
      setHlsUrl(null);
      setStreamId("");
      setRtspUrl("");
    } catch (error) {
      console.error("Failed to stop stream:", error);
      alert("Failed to stop stream. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
        }}
      ></div>

      <div className="relative z-10 p-4">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              Live Stream Studio
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Transform your RTSP streams into high-quality HLS broadcasts with
              our advanced streaming platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stream Configuration */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Wifi className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Stream Config
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      RTSP Stream URL
                    </label>
                    <input
                      value={rtspUrl}
                      onChange={(e) => setRtspUrl(e.target.value)}
                      placeholder="rtsp://example.com:554/stream"
                      className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>

                  <button
                    onClick={startStream}
                    disabled={loading || !rtspUrl}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start Stream
                      </>
                    )}
                  </button>
                  {
                    hlsUrl && (
                      <button
                        onClick={stopStream}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                      >
                        <Video className="w-4 h-4" />
                        Stop Stream
                      </button>
                    )
                  }
                </div>
              </div>

              {/* Overlay Controls */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <OverlayControls />
              </div>
            </div>

            {/* Right Column - Video Player */}
            <div className="lg:col-span-2">
              {/* Loading State */}
              {loading && (
                <div className="bg-blue-500/10 backdrop-blur-lg rounded-2xl border border-blue-500/20 p-6 mb-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-400 font-medium">
                        Connecting to stream...
                      </p>
                      <p className="text-blue-300/70 text-sm">
                        This may take a few moments
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Player with Overlays */}
              {hlsUrl ? (
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl">
                  <div className="flex md:items-center max-sm:flex-col gap-3 mb-4">
                    <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium max-sm:text-sm">Live Stream</span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      Stream ID: {streamId}
                    </span>
                  </div>

                  {/* Video Container with Overlays */}
                  <div className="relative w-full mx-auto">
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                      {/* Video Player */}
                      <VideoPlayer
                        hlsUrl={hlsUrl}
                        controls
                        className="absolute"
                      />

                      {/* Overlay Container - positioned absolutely over the video */}
                      <div className="absolute inset-0 pointer-events-none">
                        <VideoOverlayRenderer />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-slate-800/30 rounded-xl">
                    <p className="text-slate-300 text-sm">
                      <span className="font-medium">Stream URL:</span> {hlsUrl}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/20 backdrop-blur-lg rounded-2xl border border-slate-600/20 p-12 text-center">
                  <Video className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">
                    No Stream Active
                  </h3>
                  <p className="text-slate-400">
                    Enter an RTSP URL and start streaming to see your video here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
