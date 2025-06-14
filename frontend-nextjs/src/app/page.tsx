"use client";
import { useState } from "react";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer";
import OverlayControls from "../components/OverlayControls";

function Home() {
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
    const res = await axios.post("http://localhost:5000/start-stream", {
      rtsp_url: rtspUrl,
    });

    const hlsUrl = "http://localhost:5000" + res.data.hls_url;
    setHlsUrl(hlsUrl); // ✅ Set hlsUrl here
    const parts = res.data.hls_url.split("/");
    setStreamId(parts[2]);
    setLoading(false);
  };

  // const stopStream = async () => {
  //   if (streamId) {
  //     await axios.post("http://localhost:5000/stop-stream", { id: streamId });
  //     setHlsUrl(null);
  //     setStreamId("");
  //   }
  // };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-black">
      <h2 className="text-2xl font-bold mb-6 text-center">
        RTSP to HLS Streaming
      </h2>
      <input
        value={rtspUrl}
        onChange={(e) => setRtspUrl(e.target.value)}
        placeholder="Enter RTSP URL"
        className="mb-4 p-2 border border-gray-300 rounded-lg w-full max-w-md"
      />
      <div className="flex space-x-4 mb-4">
        <button
          onClick={startStream}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Start Stream
        </button>
        {/* <button
          onClick={stopStream}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          disabled={!streamId}
        >
          Stop Stream
        </button> */}
      </div>

      <input
        type="text"
        value={hlsUrl || ""}
        onChange={(e) => {
          setHlsUrl(e.target.value);
        }}
        placeholder="HLS URL will appear here after starting the stream"
        className="mb-4 p-2 border border-gray-300 rounded-lg w-full max-w-md"
      />

      {loading && <div className="text-blue-500">Starting stream...</div>}
      {hlsUrl && (
        <>
          <div className="relative w-[640px] h-[360px]">
            <VideoPlayer hlsUrl={hlsUrl} />
            <OverlayControls streamId={streamId} />
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
