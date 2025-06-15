import os, uuid, subprocess
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["stream_app"]
overlays = db["overlays"]

# Global variable to track FFmpeg process and continuous stream
ffmpeg_processes = {}
continuous_ffmpeg_process = None
continuous_stream_id = "continuous"
continuous_output_dir = f"static/hls/{continuous_stream_id}"
continuous_output_path = f"{continuous_output_dir}/index.m3u8"

# Home route
@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Welcome to the Stream App API"}), 200

# Function to start continuous RTSP stream on boot
def start_continuous_stream_on_boot():
    global continuous_ffmpeg_process

    rtsp_url = os.getenv("CONTINUOUS_RTSP_URL")
    if not rtsp_url:
        print("ERROR: CONTINUOUS_RTSP_URL not set in environment")
        return

    os.makedirs(continuous_output_dir, exist_ok=True)

    if continuous_ffmpeg_process and continuous_ffmpeg_process.poll() is None:
        print("Continuous stream already running")
        return

    ffmpeg_cmd = [
        "ffmpeg", "-i", rtsp_url, "-c:v", "libx264", "-f", "hls",
        "-hls_time", "2", "-hls_list_size", "5", "-hls_flags", "delete_segments",
        continuous_output_path
    ]

    continuous_ffmpeg_process = subprocess.Popen(ffmpeg_cmd)
    print("Started continuous RTSP -> HLS stream")

    # wait for stream to become ready
    timeout = 10
    interval = 0.5
    waited = 0
    while not os.path.exists(continuous_output_path) and waited < timeout:
        time.sleep(interval)
        waited += interval

    if os.path.exists(continuous_output_path):
        print(f"HLS stream ready at /hls/{continuous_stream_id}/index.m3u8")
    else:
        print("ERROR: HLS stream not ready in time")

# Route to start a new RTSP stream
@app.route('/api/start-stream', methods=['POST'])
def start_stream():
    rtsp_url = request.json.get("rtsp_url")

    if not rtsp_url:
        return jsonify({"error": "RTSP URL is required"}), 400

    stream_id = str(uuid.uuid4())
    output_dir = f"static/hls/{stream_id}"
    os.makedirs(output_dir, exist_ok=True)
    output_path = f"{output_dir}/index.m3u8"

    # FFmpeg command
    ffmpeg_cmd = [
        "ffmpeg", "-i", rtsp_url, "-c:v", "libx264", "-f", "hls",
        "-hls_time", "2", "-hls_list_size", "5", "-hls_flags", "delete_segments",
        output_path
    ]

    try:
        process = subprocess.Popen(ffmpeg_cmd)
        ffmpeg_processes[stream_id] = process

        # Wait for index.m3u8 to appear (max 30 seconds)
        timeout = 30
        interval = 0.5
        waited = 0
        while not os.path.exists(output_path) and waited < timeout:
            time.sleep(interval)
            waited += interval

        if not os.path.exists(output_path):
            # Cleanup if it fails
            process.terminate()
            del ffmpeg_processes[stream_id]
            return jsonify({"error": "HLS file not created in time"}), 500

        return jsonify({"hls_url": f"/hls/{stream_id}/index.m3u8", "stream_id": stream_id}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to start stream: {str(e)}"}), 500

# Route to stop a specific RTSP stream
@app.route('/api/stop-stream/<stream_id>', methods=['POST', 'OPTIONS'])
def stop_stream(stream_id):
    if request.method == 'OPTIONS':
        return '', 200  # CORS preflight

    process = ffmpeg_processes.get(stream_id)

    if process:
        process.terminate()
        process.wait()
        del ffmpeg_processes[stream_id]

        # Clean up the HLS files
        output_dir = f"static/hls/{stream_id}"
        if os.path.exists(output_dir):
            for file in os.listdir(output_dir):
                os.remove(os.path.join(output_dir, file))
            os.rmdir(output_dir)

        # delete the overlays for this stream
        overlays.delete_many({"stream_id": stream_id})

        return jsonify({"message": "Stream stopped successfully"}), 200

    return jsonify({"error": "No active stream found with that ID"}), 400

# Route to serve HLS files
@app.route('/hls/<stream_id>/<path:filename>')
def hls_files(stream_id, filename):
    return send_from_directory(f'static/hls/{stream_id}', filename)

# Create an overlay
@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    data = request.json
    print(f"Received data: {data}")
    
    # Validate required fields
    if not data.get('type') or not data.get('content') or not data.get('stream_id'):
        return jsonify({"error": "Type and content are required"}), 400
    
    # Insert into database
    result = overlays.insert_one(data)
    return jsonify({
        "_id": str(result.inserted_id),
        "message": "Overlay created successfully"
    }), 201

# Route to get all overlays
@app.route('/api/overlays/<stream_id>', methods=['GET'])
def get_overlays(stream_id):
    # Fetch overlays for the given stream ID
    overlay_list = list(overlays.find({"stream_id": stream_id}))
    
    # Convert ObjectId to string for JSON serialization
    for overlay in overlay_list:
        overlay["_id"] = str(overlay["_id"])
    
    return jsonify(overlay_list), 200
    
# Routes to manage overlays by ID
@app.route('/api/overlays/<id>', methods=['PUT'])
def update_overlay(id):
    data = request.json
    result = overlays.update_one({"_id": ObjectId(id)}, {"$set": data})
    if result.modified_count == 0:
        return jsonify({"error": "Overlay not found"}), 404
    
    return jsonify({"message": "Overlay updated successfully"}), 200

# Route to delete overlays by ID
@app.route('/api/overlays/<id>', methods=['DELETE'])
def delete_overlay(id):
    result = overlays.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Overlay not found"}), 404
    
    return jsonify({"message": "Overlay deleted successfully"}), 200

# API Documentation
@app.route('/api/docs')
def api_docs():
    return jsonify({
        "endpoints": {
            "POST /api/stream/start": "Start RTSP stream conversion",
            "POST /api/stream/stop/<stream_id>": "Stop current stream",
            "GET /stream/stream.m3u8": "HLS master playlist",
            "POST /api/overlays": "Create new overlay",
            "GET /api/overlays/<stream_id>": "Get all overlays",
            "PUT /api/overlays/<id>": "Update overlay",
            "DELETE /api/overlays/<id>": "Delete overlay"
        },
        "parameters": {
            "rtsp_url": "RTSP stream URL to convert",
            "continuous_rtsp_url": "Service URL for continuous RTSP stream",
            "start_stream": {"url": "RTSP stream URL"},
            "create_overlay": {
                "type": "text|image",
                "content": "Text content or image URL",
                "position": {"x": "number", "y": "number"},
                "size": {"width": "number", "height": "number"}
            }
        }
    })

# Main entry point to start the app and continuous stream
if __name__ == '__main__':
    # start_continuous_stream_on_boot()
    app.run(
        debug=os.getenv('DEBUG', 'False') == 'True',
        host=os.getenv('HOST'), 
        port=int(os.getenv('PORT', 5000))
    )
