from typing import List, Tuple
from ..services.osrm_client import get_distance_matrix

async def optimize_route_order(coordinates: List[Tuple[float, float]], profile: str = "driving") -> List[int]:
    """
    Given a list of coordinates (start is index 0), return the optimized indices order.
    Uses Nearest Neighbor heuristic for the Traveling Salesperson Problem.
    """
    if len(coordinates) <= 2:
        return list(range(len(coordinates)))
        
    matrix = await get_distance_matrix(coordinates, profile)
    n = len(coordinates)
    unvisited = set(range(1, n))
    current = 0
    optimized_order = [0]
    
    while unvisited:
        # Find nearest unvisited neighbor based on duration from the matrix
        next_node = min(unvisited, key=lambda node: matrix[current][node] if matrix[current][node] is not None else float('inf'))
        optimized_order.append(next_node)
        unvisited.remove(next_node)
        current = next_node
        
    return optimized_order
