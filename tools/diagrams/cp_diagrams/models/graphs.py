from __future__ import annotations

from dataclasses import dataclass

from .common import Edge, Node, PathHighlight


@dataclass(frozen=True)
class GraphDiagram:
    background: str
    directed: bool
    layout: str
    node_shape: str
    nodes: tuple[Node, ...]
    edges: tuple[Edge, ...]
    annotations: tuple[PathHighlight, ...]
