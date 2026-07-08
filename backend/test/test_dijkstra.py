import sys
import os

# Allow imports from backend/app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.algorithms.graph import Graph
from app.algorithms.dijkstra import Dijkstra

# Build test graph
graph = Graph()
graph.add_edge("Delhi", "Agra", 220)
graph.add_edge("Delhi", "Jaipur", 280)
graph.add_edge("Agra", "Lucknow", 335)
graph.add_edge("Jaipur", "Udaipur", 395)

# Run Dijkstra from Delhi
algo = Dijkstra()
distances, previous = algo.shortest_path(graph.display(), "Delhi")

print("Shortest distances from Delhi:")
for city, dist in distances.items():
    print(f"  {city}: {dist} km")

print("\nPrevious nodes (path trace):")
for city, prev in previous.items():
    print(f"  {city} <- {prev}")

assert distances["Agra"] == 220
assert distances["Jaipur"] == 280
assert distances["Lucknow"] == 555
assert distances["Udaipur"] == 675
print("\nAll Dijkstra tests passed.")
