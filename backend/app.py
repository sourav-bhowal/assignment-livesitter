import os, uuid, subprocess
from flask import Flask, request, jsonify, send_from_directory, send_file, abort
from flask_cors import CORS
from flask_cors import cross_origin
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()  # this must be called before using os.getenv


# Create Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

MONGO_URI = os.getenv("MONGO_URI") or "mongodb://localhost:27017/stream_app"
client = MongoClient(MONGO_URI)
db = client["stream_app"]
overlays = db["overlays"]

# Global variable to track FFmpeg process
ffmpeg_process = None

# Home route
@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Welcome to the Stream App API"}), 200

# Route to start an RTSP stream and convert it to HLS
# @app.route('/start-stream', methods=['POST'])
# def start_stream():
#     rtsp_url = request.json.get("rtsp_url")
#     stream_id = str(uuid.uuid4())
#     output_dir = f"static/hls/{stream_id}"
#     os.makedirs(output_dir, exist_ok=True)
#     ffmpeg_cmd = [
#         "ffmpeg", "-i", rtsp_url, "-c:v", "libx264", "-f", "hls",
#         "-hls_time", "2", "-hls_list_size", "5", "-hls_flags", "delete_segments",
#         f"{output_dir}/index.m3u8"
#     ]
#     subprocess.Popen(ffmpeg_cmd)
#     return jsonify({"hls_url": f"/hls/{stream_id}/index.m3u8"})
import time

@app.route('/start-stream', methods=['POST'])
def start_stream():
    global ffmpeg_process
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

    # Start FFmpeg
    ffmpeg_process = subprocess.Popen(ffmpeg_cmd)

    # Wait for the index.m3u8 file to be created (max 10 seconds)
    timeout = 10
    interval = 0.5
    waited = 0
    while not os.path.exists(output_path) and waited < timeout:
        time.sleep(interval)
        waited += interval

    if not os.path.exists(output_path):
        return jsonify({"error": "HLS file not created in time"}), 500

    return jsonify({"hls_url": f"/hls/{stream_id}/index.m3u8"}), 200


# Route to stop the stream using stream ID
@app.route('/stop-stream/<id>', methods=['POST'])
def stop_stream(id):
    print("ff")
    global ffmpeg_process
    if ffmpeg_process:
        ffmpeg_process.terminate()
        ffmpeg_process = None
        # Optionally, remove the HLS files
        output_dir = f"static/hls/{id}"
        if os.path.exists(output_dir):
            for file in os.listdir(output_dir):
                os.remove(os.path.join(output_dir, file))
            os.rmdir(output_dir)
        return jsonify({"message": "Stream stopped successfully"}), 200
    else:
        return jsonify({"error": "No active stream to stop"}), 400

@app.route('/hls/<stream_id>/<path:filename>')
def hls_files(stream_id, filename):
    return send_from_directory(f'static/hls/{stream_id}', filename)

# # Route to create overlays
# @app.route('/overlays', methods=['POST'])
# def create_overlay():
#     data = request.json
#     if not data.get("streamId") or not data.get("type") or not data.get("content"):
#         return jsonify({"error": "streamId, type, and content are required"}), 400
#     result = overlays.insert_one(data)
#     return jsonify({
#         "id": str(result.inserted_id), 
#         "message": "Overlay created successfully"
#     }), 201

# Create an overlay
@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    data = request.json
    print(f"Received data: {data}")
    
    # Validate required fields
    if not data.get('type') or not data.get('content'):
        return jsonify({"error": "Type and content are required"}), 400
    
    # Insert into database
    result = overlays.insert_one(data)
    return jsonify({
        "_id": str(result.inserted_id),
        "message": "Overlay created successfully"
    }), 201

# Route to get overlays by streamId
# @app.route('/overlays', methods=['GET'])
# def get_overlays():
#     stream_id = request.args.get("streamId")
#     query = {"streamId": stream_id} if stream_id else {}
#     overlay_list = list(overlays.find(query))
#     for overlay in overlay_list:
#         overlay["_id"] = str(overlay["_id"])
#     return jsonify(overlay_list)
@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    overlay_list = [
        {**overlay, '_id': str(overlay['_id'])}
        for overlay in overlays.find({})
    ]
    return jsonify(overlay_list)



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
            "POST /api/stream/stop": "Stop current stream",
            "GET /stream/stream.m3u8": "HLS master playlist",
            "POST /api/overlays": "Create new overlay",
            "GET /api/overlays": "Get all overlays",
            "PUT /api/overlays/<id>": "Update overlay",
            "DELETE /api/overlays/<id>": "Delete overlay"
        },
        "parameters": {
            "start_stream": {"url": "RTSP stream URL"},
            "create_overlay": {
                "type": "text|image",
                "content": "Text content or image URL",
                "position": {"x": "number", "y": "number"},
                "size": {"width": "number", "height": "number"}
            }
        }
    })

if __name__ == '__main__':
    app.run(
        debug=os.getenv('DEBUG', 'False') == 'True',
        host=os.getenv('HOST'), 
        port=int(os.getenv('PORT', 5000))
    )
