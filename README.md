# Research-map Navigator & Route Optimization System

A full-stack route optimization platform using graph algorithms, FastAPI, React, and OpenStreetMap.

## Features

- **Interactive Map**: Click to drop stops anywhere on the world map
- **Multi-stop Route Optimization**: Nearest Neighbor heuristic (TSP) to find the most efficient stop order
- **Real-world Routing**: Road-snapped paths via the public OSRM routing engine
- **Travel Modes**: Driving, Walking, and Cycling support
- **Route Stats**: Real-time distance and duration estimates

## Architecture

```
research-map-navigator/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── algorithms/
│   │   │   ├── graph.py         # Graph data structure (adjacency list)
│   │   │   ├── dijkstra.py      # Dijkstra's shortest path algorithm
│   │   │   └── optimizer.py     # Multi-stop TSP nearest-neighbor optimizer
│   │   ├── services/
│   │   │   └── osrm_client.py   # OSRM API client for real-world routing
│   │   └── main.py              # FastAPI app with CORS & /api/optimize-route
│   └── test/
│       ├── test_graph.py        # Graph unit tests
│       └── test_dijkstra.py     # Dijkstra unit tests
└── frontend/                # Vite + React frontend
    └── src/
        ├── App.jsx              # Main UI: map + sidebar
        ├── index.css            # Glassmorphism design system
        └── api/
            └── client.js        # Axios API client to talk to backend
```

## Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Run Tests
```bash
cd backend
python test/test_graph.py
python test/test_dijkstra.py
```

## API Reference

### `POST /api/optimize-route`

**Request:**
```json
{
  "coordinates": [[77.2090, 28.6139], [78.0081, 27.1767]],
  "profile": "driving"
}
```

**Response:**
```json
{
  "optimized_indices": [0, 1],
  "optimized_coordinates": [...],
  "distance": 220000,
  "duration": 9600,
  "geometry": { "type": "LineString", "coordinates": [...] }
}
```

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React, Vite, react-leaflet        |
| Map tiles | CartoDB Voyager (OpenStreetMap)   |
| Routing   | OSRM (Open Source Routing Machine)|
| Backend   | Python, FastAPI, Pydantic         |
| Algorithms| Custom Graph + Dijkstra + TSP     |
