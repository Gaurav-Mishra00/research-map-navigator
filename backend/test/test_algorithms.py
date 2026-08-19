import asyncio
import os
import sys
import unittest
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.algorithms.dijkstra import Dijkstra
from app.algorithms.graph import Graph
from app.algorithms.optimizer import optimize_route_order


class GraphAndDijkstraTests(unittest.TestCase):
    def setUp(self):
        self.graph = Graph()
        self.graph.add_edge("Delhi", "Agra", 220)
        self.graph.add_edge("Delhi", "Jaipur", 280)
        self.graph.add_edge("Agra", "Lucknow", 335)
        self.graph.add_edge("Jaipur", "Udaipur", 395)

    def test_graph_is_bidirectional(self):
        adjacency = self.graph.display()
        self.assertEqual(adjacency["Delhi"]["Agra"], 220)
        self.assertEqual(adjacency["Agra"]["Delhi"], 220)

    def test_dijkstra_shortest_distances(self):
        distances, previous = Dijkstra().shortest_path(self.graph.display(), "Delhi")
        self.assertEqual(distances["Lucknow"], 555)
        self.assertEqual(distances["Udaipur"], 675)
        self.assertEqual(previous["Lucknow"], "Agra")


class OptimizerTests(unittest.IsolatedAsyncioTestCase):
    async def test_optimizer_keeps_start_and_chooses_nearest_next(self):
        matrix = [
            [0, 10, 4],
            [10, 0, 2],
            [4, 2, 0],
        ]
        with patch("app.algorithms.optimizer.get_distance_matrix", new=AsyncMock(return_value=matrix)):
            result = await optimize_route_order([(0, 0), (1, 1), (2, 2)])
        self.assertEqual(result, [0, 2, 1])

    async def test_optimizer_handles_two_coordinates_without_provider(self):
        with patch("app.algorithms.optimizer.get_distance_matrix", new=AsyncMock()) as mocked:
            result = await optimize_route_order([(0, 0), (1, 1)])
        mocked.assert_not_awaited()
        self.assertEqual(result, [0, 1])


if __name__ == "__main__":
    unittest.main()
