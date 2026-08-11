from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Point:
    x: float
    y: float


@dataclass(frozen=True)
class NodeSize:
    width: float
    height: float


@dataclass(frozen=True)
class LoopPlacement:
    first_port: float
    second_port: float
    direction: float
