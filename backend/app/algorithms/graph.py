class Graph:
    """
    Graph data structure using an adjacency list.
    """

    def __init__(self):
        self.graph = {}

    def add_node(self, node):
        """
        Add a city/node to the graph.
        """
        if node not in self.graph:
            self.graph[node] = {}

    def add_edge(self, source, destination, distance):
        """
        Add a bidirectional road between two cities.
        """

        self.add_node(source)
        self.add_node(destination)

        self.graph[source][destination] = distance
        self.graph[destination][source] = distance

    def display(self):
        return self.graph