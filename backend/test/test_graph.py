import sys
import os

# Allow imports from backend/app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.algorithms.graph import Graph

graph = Graph()
graph.add_edge("Delhi", "Agra", 220)
graph.add_edge("Delhi", "Jaipur", 280)
graph.add_edge("Agra", "Lucknow", 335)
graph.add_edge("Jaipur", "Udaipur", 395)

result = graph.display()
print("Graph adjacency list:")
for city, neighbours in result.items():
    print(f"  {city}: {neighbours}")

assert "Delhi" in result
assert "Agra" in result["Delhi"]
assert result["Delhi"]["Agra"] == 220
print("\nAll graph tests passed.")