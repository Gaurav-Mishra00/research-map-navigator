import heapq


class Dijkstra:
    def shortest_path(self, graph, start):

        distances = {}
        previous = {}
        visited = set()

        for node in graph:
            distances[node] = float("inf")

        distances[start] = 0

        # Priority Queue
        priority_queue = [(0, start)]

        while priority_queue:

            current_distance, current_node = heapq.heappop(priority_queue)

            if current_node in visited:
                continue

            visited.add(current_node)

            print(f"Currently Visiting : {current_node}")

            # 👇 ADD EVERYTHING BELOW THIS LINE
            for neighbour, distance in graph[current_node].items():

                new_distance = current_distance + distance

                if new_distance < distances[neighbour]:

                    distances[neighbour] = new_distance

                    previous[neighbour] = current_node

                    heapq.heappush(
                        priority_queue,
                        (new_distance, neighbour)
                    )

        return distances, previous