from __future__ import annotations

from dataclasses import dataclass

from .common import Cell, Edge, Node, PathHighlight


@dataclass(frozen=True)
class SourceArray:
    cells: tuple[Cell, ...]


@dataclass(frozen=True)
class TreeDiagram:
    background: str
    directed: bool
    layout: str
    node_shape: str
    node_width: str
    root: str | None
    nodes: tuple[Node, ...]
    edges: tuple[Edge, ...]
    annotations: tuple[PathHighlight, ...]
    source_array: SourceArray | None
