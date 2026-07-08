from algorithms.graph import Graph

graph = Graph()

graph.add_edge("Delhi", "Agra", 220)
graph.add_edge("Delhi", "Jaipur", 280)
graph.add_edge("Agra", "Lucknow", 335)
graph.add_edge("Jaipur", "Udaipur", 395)

print(graph.display())