import os
import subprocess
import logging
import urllib.parse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('StreamProcessor')

def convert_rtsp_to_hls(rtsp_url):
    try:
        # Create output directory
        output_dir = os.path.join(os.getcwd(), "stream")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "stream.m3u8")
        
        # Clean old stream files
        for f in os.listdir(output_dir):
            if f.startswith("stream"):
                os.remove(os.path.join(output_dir, f))
        
        # Handle special characters in RTSP URL
        parsed = urllib.parse.urlparse(rtsp_url)
        safe_url = f"{parsed.scheme}://"
        if parsed.username:
            safe_url += parsed.username
            if parsed.password:
                safe_url += f":{urllib.parse.quote(parsed.password)}"
            safe_url += "@"
        safe_url += parsed.hostname or ""
        if parsed.port:
            safe_url += f":{parsed.port}"
        safe_url += parsed.path or ""
        if parsed.query:
            safe_url += f"?{parsed.query}"

        
        # FFmpeg command configuration
        command = [
            "ffmpeg",
            "-loglevel", "error",
            "-rtsp_transport", "tcp",
            "-i", safe_url,
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "128k",
            "-f", "hls",
            "-hls_time", "2",
            "-hls_list_size", "3",
            "-hls_flags", "delete_segments",
            "-hls_allow_cache", "0",
            "-preset", "ultrafast",
            "-tune", "zerolatency",
            output_path
        ]
        
        logger.info(f"Starting FFmpeg with command: {' '.join(command)}")
        
        # Start FFmpeg process
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        # Log FFmpeg output in real-time
        def log_output(process):
            for line in process.stdout:
                logger.info(f"FFmpeg: {line.strip()}")
        
        # Start logging thread
        import threading
        thread = threading.Thread(target=log_output, args=(process,))
        thread.daemon = True
        thread.start()
        
        return process
        
    except Exception as e:
        logger.error(f"Stream conversion failed: {str(e)}")
        raise