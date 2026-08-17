import httpx
from typing import List, Tuple

OSRM_BASE_URL = "http://router.project-osrm.org"

async def get_route(coordinates: List[Tuple[float, float]], profile: str = "driving"):
    """
    Fetch the route from OSRM.
    coordinates: List of (longitude, latitude)
    profile: "driving", "walking", or "cycling"
    """
    coords_str = ";".join([f"{lng},{lat}" for lng, lat in coordinates])
    url = f"{OSRM_BASE_URL}/route/v1/{profile}/{coords_str}?overview=full&geometries=geojson"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") == "Ok":
            return {
                "distance": data["routes"][0]["distance"],
                "duration": data["routes"][0]["duration"],
                "geometry": data["routes"][0]["geometry"]
            }
        else:
            raise Exception(f"OSRM Error: {data.get('message')}")
            
async def get_distance_matrix(coordinates: List[Tuple[float, float]], profile: str = "driving"):
    """
    Fetch a full distance matrix (NxN) from OSRM.
    coordinates: List of (longitude, latitude)
    """
    coords_str = ";".join([f"{lng},{lat}" for lng, lat in coordinates])
    url = f"{OSRM_BASE_URL}/table/v1/{profile}/{coords_str}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
        if data.get("code") == "Ok":
            return data["durations"] # 2D array of durations
        raise Exception(f"OSRM Error: {data.get('message')}")
