from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
from app.algorithms.optimizer import optimize_route_order
from app.services.osrm_client import get_route

app = FastAPI(
    title="ResearchMap Navigator API",
    description="Backend API for route optimization and navigation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    coordinates: List[Tuple[float, float]] # list of [lng, lat]
    profile: str = "driving" # driving, walking, cycling

@app.get("/")
def home():
    return {"message": "Welcome to ResearchMap Navigator API 🚀"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/optimize-route")
async def optimize_route(request: RouteRequest):
    if len(request.coordinates) < 2:
        raise HTTPException(status_code=400, detail="At least 2 coordinates are required.")
    
    try:
        # 1. Optimize the order of coordinates
        optimized_indices = await optimize_route_order(request.coordinates, request.profile)
        optimized_coords = [request.coordinates[i] for i in optimized_indices]
        
        # 2. Get the full route geometry for the optimized coordinates
        route_data = await get_route(optimized_coords, request.profile)
        
        return {
            "optimized_indices": optimized_indices,
            "optimized_coordinates": optimized_coords,
            "distance": route_data["distance"],
            "duration": route_data["duration"],
            "geometry": route_data["geometry"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))