from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import List, Tuple
from app.algorithms.optimizer import optimize_route_order
from app.services.osrm_client import get_route
import hashlib
import json
from datetime import datetime, timedelta

app = FastAPI(
    title="ResearchMap Navigator API",
    description="Backend API for route optimization and navigation",
    version="1.0.0"
)

# Add GZIP compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple route cache with TTL
route_cache = {}
CACHE_TTL_SECONDS = 300  # 5 minutes

class RouteRequest(BaseModel):
    coordinates: List[Tuple[float, float]] # list of [lng, lat]
    profile: str = "driving" # driving, walking, cycling

def get_cache_key(coordinates: List[Tuple[float, float]], profile: str) -> str:
    """Generate a cache key from coordinates and profile"""
    data = json.dumps(coordinates) + profile
    return hashlib.md5(data.encode()).hexdigest()

def get_cached_route(key: str):
    """Get cached route if still valid"""
    if key in route_cache:
        cached_time, cached_data = route_cache[key]
        if datetime.now() - cached_time < timedelta(seconds=CACHE_TTL_SECONDS):
            print(f"Cache hit for route: {key}")
            return cached_data
        else:
            del route_cache[key]
    return None

def set_cached_route(key: str, data):
    """Cache a route result"""
    route_cache[key] = (datetime.now(), data)

@app.get("/")
def home():
    return {"message": "Welcome to ResearchMap Navigator API 🚀", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/optimize-route")
async def optimize_route(request: RouteRequest):
    if len(request.coordinates) < 2:
        raise HTTPException(status_code=400, detail="At least 2 coordinates are required.")
    
    try:
        # Check cache first
        cache_key = get_cache_key(request.coordinates, request.profile)
        cached_result = get_cached_route(cache_key)
        
        if cached_result:
            return cached_result
        
        # 1. Optimize the order of coordinates
        optimized_indices = await optimize_route_order(request.coordinates, request.profile)
        optimized_coords = [request.coordinates[i] for i in optimized_indices]
        
        # 2. Get the full route geometry for the optimized coordinates
        route_data = await get_route(optimized_coords, request.profile)
        
        result = {
            "optimized_indices": optimized_indices,
            "optimized_coordinates": optimized_coords,
            "distance": route_data["distance"],
            "duration": route_data["duration"],
            "geometry": route_data["geometry"],
            "cached": False
        }
        
        # Cache the result
        set_cached_route(cache_key, result)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))