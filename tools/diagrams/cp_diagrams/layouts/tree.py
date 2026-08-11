from __future__ import annotations

from collections import defaultdict
from math import log2

from ..common.geometry import NodeSize, Point
from ..common.theme import (
    CELL_HORIZONTAL_PADDING,
    INDEX_FONT_SIZE,
    INDEX_GAP,
    MIN_CELL_WIDTH,
    TREE_HORIZONTAL_GAP,
    TREE_VERTICAL_GAP,
    VALUE_FONT_SIZE,
)
from ..common.typography import text_width as _text_width
from ..models import TreeDiagram

def rooted_tree_layout(diagram: TreeDiagram, size: NodeSize) -> dict[str, Point]:
    assert diagram.root is not None
    children: defaultdict[str, list[str]] = defaultdict(list)
    for edge in diagram.edges:
        children[edge.source].append(edge.target)

    widths: dict[str, float] = {}

    def measure(node_id: str) -> float:
        if not children[node_id]:
            widths[node_id] = 1.0
        else:
            widths[node_id] = max(
                1.0, sum(measure(child) for child in children[node_id])
            )
        return widths[node_id]

    measure(diagram.root)
    unit = size.width + TREE_HORIZONTAL_GAP
    level = size.height + TREE_VERTICAL_GAP
    positions: dict[str, Point] = {}

    def place(node_id: str, left: float, depth: int) -> None:
        positions[node_id] = Point((left + widths[node_id] / 2) * unit, depth * level)
        child_left = left
        for child in children[node_id]:
            place(child, child_left, depth + 1)
            child_left += widths[child]

    place(diagram.root, 0, 0)
    return positions


def binary_tree_layout(diagram: TreeDiagram, size: NodeSize) -> dict[str, Point]:
    assert diagram.root is not None
    children: defaultdict[str, dict[str, str]] = defaultdict(dict)
    for edge in diagram.edges:
        assert edge.side is not None
        children[edge.source][edge.side] = edge.target

    max_depth = 0

    def depth(node_id: str, current: int) -> None:
        nonlocal max_depth
        max_depth = max(max_depth, current)
        for child in children[node_id].values():
            depth(child, current + 1)

    depth(diagram.root, 0)
    unit = size.width + TREE_HORIZONTAL_GAP
    level = size.height + TREE_VERTICAL_GAP
    positions: dict[str, Point] = {}

    def place(node_id: str, x: float, current: int) -> None:
        positions[node_id] = Point(x, current * level)
        offset = 2 ** (max_depth - current - 2) * unit
        if "left" in children[node_id]:
            place(children[node_id]["left"], x - offset, current + 1)
        if "right" in children[node_id]:
            place(children[node_id]["right"], x + offset, current + 1)

    place(diagram.root, 0, 0)
    return positions


def fenwick_tree_layout(diagram: TreeDiagram, size: NodeSize) -> dict[str, Point]:
    count = len(diagram.nodes)
    max_level = max(int(log2(index & -index)) for index in range(1, count + 1))
    horizontal = (
        size.width if diagram.source_array is not None else size.width + TREE_HORIZONTAL_GAP
    )
    vertical = size.height + TREE_VERTICAL_GAP
    return {
        str(index): Point(
            (index - 1) * horizontal,
            (max_level - int(log2(index & -index))) * vertical,
        )
        for index in range(1, count + 1)
    }


def source_array_cell_width(diagram: TreeDiagram) -> float:
    assert diagram.source_array is not None
    content_width = max(
        _text_width(str(cell.value), VALUE_FONT_SIZE)
        for cell in diagram.source_array.cells
    )
    return max(MIN_CELL_WIDTH, content_width + CELL_HORIZONTAL_PADDING * 2)


def fenwick_projection_guide_start(center: Point, size: NodeSize) -> float:
    node_bottom = center.y + size.height / 2
    return node_bottom + INDEX_GAP + INDEX_FONT_SIZE + INDEX_GAP
