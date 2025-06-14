import os
import eventlet

# Initialize eventlet for async processing
eventlet.monkey_patch()

from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from flask_cors import CORS
from bson import ObjectId
from dotenv import load_dotenv
from stream_processor import convert_rtsp_to_hls

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# MongoDB configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI")

# Check if MONGO_URI is set
if not app.config["MONGO_URI"]:
    raise ValueError("MONGO_URI environment variable is not set")

# Initialize PyMongo
mongo = MongoClient(app.config["MONGO_URI"])

# Global variable to track FFmpeg process
ffmpeg_process = None

# Home route
@app.route('/')
def index():
    return "RTSP Stream Processor API"

# Create an overlay
@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    data = request.json
    
    # Validate required fields
    if not data.get('type') or not data.get('content'):
        return jsonify({"error": "Type and content are required"}), 400
    
    # Insert into database
    result = mongo.db.overlays.insert_one(data)
    return jsonify({
        "_id": str(result.inserted_id),
        "message": "Overlay created successfully"
    }), 201

# Get all overlays
@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    overlays = list(mongo.db.overlays.find({}, {'_id': 0}))
    return jsonify(overlays)

# Update an overlay by ID
@app.route('/api/overlays/<id>', methods=['PUT'])
def update_overlay(id):
    data = request.json
    result = mongo.db.overlays.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Overlay not found"}), 404
    
    return jsonify({"message": "Overlay updated successfully"})

# Delete an overlay by ID
@app.route('/api/overlays/<id>', methods=['DELETE'])
def delete_overlay(id):
    result = mongo.db.overlays.delete_one({"_id": ObjectId(id)})
    
    if result.deleted_count == 0:
        return jsonify({"error": "Overlay not found"}), 404
    
    return jsonify({"message": "Overlay deleted successfully"})

# Stream Management Endpoints
@app.route('/api/stream/start', methods=['POST'])
def start_stream():
    global ffmpeg_process
    
    # Stop existing stream if running
    if ffmpeg_process and ffmpeg_process.poll() is None:
        ffmpeg_process.terminate()
    
    # Get RTSP URL from request
    rtsp_url = request.json.get("url")
    if not rtsp_url:
        return jsonify({"error": "RTSP URL is required"}), 400
    
    # Start new stream conversion
    try:
        ffmpeg_process = convert_rtsp_to_hls(rtsp_url)
        return jsonify({
            "message": "Stream started successfully",
            "hls_url": "http://localhost:5000/stream/stream.m3u8"
        })
    except Exception as e:
        return jsonify({"error": f"Stream failed to start: {str(e)}"}), 500

# Stop the current stream
@app.route('/api/stream/stop', methods=['POST'])
def stop_stream():
    global ffmpeg_process
    
    if ffmpeg_process and ffmpeg_process.poll() is None:
        ffmpeg_process.terminate()
        ffmpeg_process = None
        return jsonify({"message": "Stream stopped successfully"})
    
    return jsonify({"message": "No active stream to stop"})

# Serve HLS stream files
@app.route('/stream/<path:filename>')
def stream_files(filename):
    response = send_from_directory('/stream', filename)
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

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
    # Create static directory if not exists
    os.makedirs('/stream', exist_ok=True)
    
    # Start Flask server
    app.run(
        host=os.getenv('HOST'),
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('DEBUG', 'False') == 'True'
    )