from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Cell:
    value: str | int | float


@dataclass(frozen=True)
class Node:
    id: str
    label: str | None
    index: str | None
    value: str | None
    fields: tuple[tuple[str, str], ...]
    interval: tuple[int, int] | None


@dataclass(frozen=True)
class Edge:
    source: str
    target: str
    value: str | None
    side: str | None = None
    directed: bool | None = None


@dataclass(frozen=True)
class PathHighlight:
    nodes: tuple[str, ...]
    closed: bool
    color: str
