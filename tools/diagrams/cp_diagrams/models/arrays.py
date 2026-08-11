from __future__ import annotations

from dataclasses import dataclass

from .common import Cell


@dataclass(frozen=True)
class CellHighlight:
    position: int
    color: str


@dataclass(frozen=True)
class Arrow:
    position: int
    side: str
    length: int | None
    label: str | None
    color: str


@dataclass(frozen=True)
class Range:
    start: int
    end: int
    label: str | None
    color: str


Annotation = CellHighlight | Arrow | Range


@dataclass(frozen=True)
class Diagram:
    """The cp-diagram/v1 single-array model."""

    background: str
    label: str | None
    index: str
    cells: tuple[Cell, ...]
    annotations: tuple[Annotation, ...]


@dataclass(frozen=True)
class ArrayRow:
    id: str
    label: str
    cells: tuple[Cell, ...]


@dataclass(frozen=True)
class MultiArrayDiagram:
    background: str
    index: str
    layout: str
    rows: tuple[ArrayRow, ...]
