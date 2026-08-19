from typing import List, Literal, Tuple

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .algorithms.optimizer import optimize_route_order
from .services.osrm_client import get_route


app = FastAPI(
    title="ResearchMap Navigator API",
    version="2.0.0",
    description="Routing and geospatial analysis services for ResearchMap Navigator.",
)

TravelProfile = Literal["driving", "walking", "cycling"]


class Coordinate(BaseModel):
    lng: float = Field(..., ge=-180, le=180)
    lat: float = Field(..., ge=-90, le=90)

    def as_tuple(self) -> Tuple[float, float]:
        return self.lng, self.lat


class RouteRequest(BaseModel):
    coordinates: List[Coordinate] = Field(..., min_length=2)
    profile: TravelProfile = "driving"


class OptimizeRequest(BaseModel):
    coordinates: List[Coordinate] = Field(..., min_length=2)
    profile: TravelProfile = "driving"


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "researchmap-routing"}


@app.post("/route")
async def route(request: RouteRequest) -> dict:
    try:
        return await get_route([coordinate.as_tuple() for coordinate in request.coordinates], request.profile)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Routing provider unavailable: {exc}") from exc


@app.post("/optimize-route")
async def optimize(request: OptimizeRequest) -> dict:
    try:
        order = await optimize_route_order(
            [coordinate.as_tuple() for coordinate in request.coordinates], request.profile
        )
        return {"order": order, "profile": request.profile}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Route optimization unavailable: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
