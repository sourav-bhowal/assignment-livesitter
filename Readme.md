# Stream Processing API (Backend)

A Flask-based API for converting RTSP streams to HLS format with overlay management capabilities.

## Table of Contents

- [API Endpoints](#api-endpoints)
  - [Stream Management](#stream-management)
  - [Overlay Management](#overlay-management)
- [Continuous Stream](#continuous-stream)
- [Response Codes](#response-codes)
- [Environment Variables](#environment-variables)

## API Endpoints

### Stream Management

#### Start a new stream

- **Endpoint**: POST `/api/start-stream`
- **Description**: Starts a new stream with the provided RTSP URL and optional overlay.
- **Request Body**:
  ```json
  {
    "rtsp_url": "string"
  }
  ```
- **Response**:
  ```json
  {
    "hls_url": "/hls/3a7b8c9d/index.m3u8",
    "stream_id": "3a7b8c9d-4e5f-6g7h-8i9j-0k1l2m3n4o5p"
  }
  ```

#### Stop a stream

- **Endpoint**: POST `/api/stop-stream/<stream_id>`
- **Description**: Stops the stream with the specified ID.
- **Path Parameter**: `stream_id` - The ID of the stream to stop.
- **Response**:
  ```json
  {
    "message": "Stream stopped successfully"
  }
  ```

### Overlay Management

#### Add an overlay

- **Endpoint**: POST `/api/overlays`
- **Description**: Adds a new overlay to the specified stream.
- **Request Body**:
  ```json
  {
    "type": "text | image",
    "content": "Live Stream",
    "stream_id": "3a7b8c9d",
    "position": { "x": 10, "y": 10 },
    "size": { "width": 200, "height": 50 }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Overlay created successfully",
    "overlay_id": "overlay-12345"
  }
  ```

#### Update an overlay

- **Endpoint**: PUT `/api/overlays/<overlay_id>`
- **Description**: Updates the specified overlay.
- **Path Parameter**: `overlay_id` - The ID of the overlay to update.
- **Request Body**:
  ```json
  {
    "content": "Updated Overlay",
    "position": { "x": 20, "y": 20 },
    "size": { "width": 250, "height": 60 }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Overlay updated successfully"
  }
  ```

#### Delete an overlay

- **Endpoint**: DELETE `/api/overlays/<overlay_id>`
- **Description**: Deletes the specified overlay.
- **Path Parameter**: `overlay_id` - The ID of the overlay to delete.
- **Response**:
  ```json
  {
    "message": "Overlay deleted successfully"
  }
  ```

### Get all overlays for a stream

- **Endpoint**: GET `/api/overlays/<stream_id>`
- **Description**: Retrieves all overlays for the specified stream.
- **Path Parameter**: `stream_id` - The ID of the stream to retrieve overlays for.
- **Response**:
  ```json
  {
    "overlays": [
      {
        "_id": "overlay-12345",
        "stream_id": "3a7b8c9d",
        "type": "text",
        "content": "Live Stream",
        "position": { "x": 10, "y": 10 },
        "size": { "width": 200, "height": 50 }
      }
    ]
  }
  ```

## Continuous Stream

To continuously stream from an RTSP source, you can use the `/hls/continuous/index.m3u8` endpoint with a valid RTSP URL. The API will handle the conversion to HLS format and provide a URL for accessing the stream.

## Response Codes

- `200 OK`: Request was successful.
- `201 Created`: Resource was created successfully.
- `400 Bad Request`: Invalid request data.
- `404 Not Found`: Resource not found.
- `500 Internal Server Error`: An error occurred on the server.

## Environment Variables

- `CONTINUOUS_RTSP_URL`: RTSP URL for continuous streaming.
- `MONGODB_URI`: MongoDB connection string.
- `HOST`: Server host (default: localhost)
- `PORT`: Server port (default: 5000)
- `DEBUG`: Enable debug mode (default: False)

## Running the API

# Prerequisites

- Python 3.8 or higher
- MongoDB instance running or MongoDB Atlas account
- FFmpeg installed and accessible in the system PATH
- UV package manager installed (optional, for running the server)

## Installation Prerequisites

- Python: https://www.python.org/downloads
- MongoDB: https://www.mongodb.com/try/download/community
- FFmpeg: https://ffmpeg.org/download.html
- UV: 
```bash
curl -Ls https://astro.build/install | bash
```

## Installation

### 1. Clone the repository and navigate to the backend directory

```bash
git clone https://github.com/sourav-bhowal/assignment-livesitter.git

cd assignment-livesitter/backend
```

### 2. Create a virtual environment and activate it

```bash
# Create virtual environment using uv
uv venv -p 3.11.9

# Activate the environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set environment variables

You can set environment variables in a `.env` file or directly in your terminal. Example `.env` file:

```
CONTINUOUS_RTSP_URL=rtsp://your_rtsp_url
MONGODB_URI=mongodb://localhost:27017/your_database
HOST=localhost
PORT=5000
DEBUG=True
```

### 5. Run the API

```bash
# Using uv to run the server
python app.py
```

### 6. Access the API

Open your web browser and navigate to `http://localhost:5000/api/docs` to access the API documentation and test the endpoints.

# Frontend (Next.js)

The frontend can interact with the API using standard HTTP requests. You can use libraries like Axios or Fetch API in JavaScript to make requests to the endpoints defined above.

## Running the Frontend

# Prerequisites

- Node.js and npm installed

## Installation

### 1. Clone the repository and navigate to the frontend directory

```bash
git clone https://github.com/sourav-bhowal/assignment-livesitter.git

cd assignment-livesitter/frontend-nextjs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

You can set environment variables in a `.env.local` file in the root of your Next.js project. Example `.env.local` file:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_HLS_URL=http://localhost:5000
```

### 4. Run the frontend

```bash
npm run dev
```

### 5. Access the frontend

Open your web browser and navigate to `http://localhost:3000` to access the frontend application.
