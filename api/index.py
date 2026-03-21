from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import deque

app = FastAPI()

# CORS — required because React dev server (3000) != FastAPI (8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


def is_dag(nodes: list, edges: list) -> bool:
    """Kahn's algorithm — BFS topological sort.
    Returns True if the graph is a DAG (no cycles).
    O(V+E) time, O(V+E) space.
    Uses collections.deque for O(1) popleft (vs list.pop(0) which is O(n))."""
    node_ids = {n["id"] for n in nodes}
    in_degree = {nid: 0 for nid in node_ids}
    adj = {nid: [] for nid in node_ids}

    for edge in edges:
        src, tgt = edge["source"], edge["target"]
        if src in node_ids and tgt in node_ids:
            adj[src].append(tgt)
            in_degree[tgt] += 1

    queue = deque(nid for nid, deg in in_degree.items() if deg == 0)
    processed = 0

    while queue:
        node = queue.popleft()
        processed += 1
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return processed == len(node_ids)


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": is_dag(pipeline.nodes, pipeline.edges),
    }
