import os
import sys
import unittest
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import Coordinate, OptimizeRequest, RouteRequest, health, optimize, route


class ApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_health(self):
        self.assertEqual(health()["status"], "ok")

    async def test_route_forwards_coordinates_and_profile(self):
        request = RouteRequest(
            coordinates=[Coordinate(lng=77.59, lat=12.97), Coordinate(lng=72.87, lat=19.07)],
            profile="cycling",
        )
        expected = {"distance": 1000, "duration": 120, "geometry": {"type": "LineString", "coordinates": []}}
        with patch("app.main.get_route", new=AsyncMock(return_value=expected)) as mocked:
            result = await route(request)
        mocked.assert_awaited_once_with([(77.59, 12.97), (72.87, 19.07)], "cycling")
        self.assertEqual(result, expected)

    async def test_optimize_returns_order(self):
        request = OptimizeRequest(
            coordinates=[Coordinate(lng=0, lat=0), Coordinate(lng=1, lat=1), Coordinate(lng=2, lat=2)]
        )
        with patch("app.main.optimize_route_order", new=AsyncMock(return_value=[0, 2, 1])) as mocked:
            result = await optimize(request)
        mocked.assert_awaited_once()
        self.assertEqual(result, {"order": [0, 2, 1], "profile": "driving"})

    def test_coordinate_validation(self):
        with self.assertRaises(ValueError):
            Coordinate(lng=181, lat=0)


if __name__ == "__main__":
    unittest.main()
