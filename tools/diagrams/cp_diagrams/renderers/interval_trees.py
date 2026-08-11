from __future__ import annotations

from collections import defaultdict
from math import atan2, cos, hypot, log2, sin

from ..common.canvas import Sketch
from ..common.geometry import NodeSize, Point
from ..common.theme import (
    ANNOTATION_STROKE_WIDTH,
    CELL_HEIGHT,
    EDGE_LABEL_FONT_SIZE,
    INDEX_FONT_SIZE,
    INDEX_GAP,
    INDEX_HEIGHT,
    MIN_RECTANGLE_HEIGHT,
    NODE_AUX_FONT_SIZE,
    NODE_FIELD_FONT_SIZE,
    NODE_LINE_GAP,
    NODE_PRIMARY_FONT_SIZE,
    NODE_VERTICAL_PADDING,
    PADDING,
    PALETTE,
    PROJECTION_CELL_GAP_RATIO,
    PROJECTION_VERTICAL_GAP,
    TREE_VERTICAL_GAP,
    VALUE_FONT_SIZE,
)
from ..layouts.tree import source_array_cell_width as _source_array_cell_width
from ..models import Edge, Node, TreeDiagram
from .primitives import (
    _draw_node_outline,
    _edge_label_position,
    _path_edge,
    _shape_boundary,
)

def render_interval_tree(diagram: TreeDiagram) -> str:
    assert diagram.source_array is not None
    cell_size = max(CELL_HEIGHT, _source_array_cell_width(diagram))
    cell_gap = cell_size * PROJECTION_CELL_GAP_RATIO
    node_height = max(
        MIN_RECTANGLE_HEIGHT,
        max(
            sum(font_size for _, font_size in _interval_node_lines(node))
            + NODE_LINE_GAP * (len(_interval_node_lines(node)) - 1)
            + NODE_VERTICAL_PADDING * 2
            for node in diagram.nodes
        ),
    )
    sizes = {
        node.id: NodeSize(
            _interval_span_width(node, cell_size, cell_gap),
            node_height,
        )
        for node in diagram.nodes
    }
    depths = _interval_tree_depths(diagram)
    level_step = node_height + TREE_VERTICAL_GAP
    positions = {
        node.id: Point(
            _interval_center_x(node, cell_size, cell_gap),
            PADDING + node_height / 2 + depths[node.id] * level_step,
        )
        for node in diagram.nodes
    }
    maximum_bottom = max(
        positions[node.id].y + sizes[node.id].height / 2
        for node in diagram.nodes
    )
    source_y = maximum_bottom + PROJECTION_VERTICAL_GAP
    source_count = len(diagram.source_array.cells)
    width = round(
        PADDING * 2
        + source_count * cell_size
        + (source_count - 1) * cell_gap
    )
    height = round(source_y + cell_size + INDEX_HEIGHT + PADDING)

    sketch = Sketch(width, height)
    if diagram.background == "white":
        sketch.background(width, height, PALETTE["background"])

    _draw_interval_projections(
        sketch,
        diagram,
        positions,
        sizes,
        source_y,
        cell_size,
        cell_gap,
    )
    _draw_interval_source_array(
        sketch,
        diagram,
        source_y,
        cell_size,
        cell_gap,
    )
    _draw_interval_edges(sketch, diagram, positions, sizes, cell_size)
    _draw_interval_nodes(
        sketch,
        diagram.nodes,
        positions,
        sizes,
    )
    _draw_interval_path_annotations(
        sketch,
        diagram,
        positions,
        sizes,
        cell_size,
    )
    return sketch.as_svg(width, height)


def _interval_tree_depths(diagram: TreeDiagram) -> dict[str, int]:
    if diagram.layout == "fenwick":
        maximum_level = max(
            int(log2(index & -index))
            for index in range(1, len(diagram.nodes) + 1)
        )
        return {
            str(index): maximum_level - int(log2(index & -index))
            for index in range(1, len(diagram.nodes) + 1)
        }

    assert diagram.root is not None
    children: defaultdict[str, list[str]] = defaultdict(list)
    for edge in diagram.edges:
        children[edge.source].append(edge.target)
    depths: dict[str, int] = {}

    def visit(node_id: str, depth: int) -> None:
        depths[node_id] = depth
        for child in children[node_id]:
            visit(child, depth + 1)

    visit(diagram.root, 0)
    return depths


def _draw_interval_source_array(
    sketch: Sketch,
    diagram: TreeDiagram,
    source_y: float,
    cell_size: float,
    cell_gap: float,
) -> None:
    assert diagram.source_array is not None
    for position, cell in enumerate(diagram.source_array.cells):
        x = PADDING + position * (cell_size + cell_gap)
        sketch.dashed_rectangle(
            x,
            source_y,
            cell_size,
            cell_size,
            "default",
            z_index=5,
        )
        sketch.text(
            x + cell_size / 2,
            source_y + cell_size / 2,
            str(cell.value),
            size=VALUE_FONT_SIZE,
        )
        sketch.text(
            x + cell_size / 2,
            source_y + cell_size + INDEX_GAP + INDEX_FONT_SIZE / 2,
            str(position + 1),
            size=INDEX_FONT_SIZE,
        )


def _draw_interval_projections(
    sketch: Sketch,
    diagram: TreeDiagram,
    positions: dict[str, Point],
    sizes: dict[str, NodeSize],
    source_y: float,
    cell_size: float,
    cell_gap: float,
) -> None:
    for node in diagram.nodes:
        assert node.interval is not None
        if diagram.layout == "binary" and _interval_length(node) != 1:
            continue
        center = positions[node.id]
        size = sizes[node.id]
        start_y = center.y + size.height / 2 + INDEX_GAP
        target_position = node.interval[1]
        target_x = (
            PADDING
            + (target_position - 1) * (cell_size + cell_gap)
            + cell_size / 2
        )
        start_x = target_x if diagram.layout == "fenwick" else center.x
        sketch.dashed_line(
            start_x,
            start_y,
            target_x,
            source_y,
            "default",
            z_index=-5,
        )


def _draw_interval_edges(
    sketch: Sketch,
    diagram: TreeDiagram,
    positions: dict[str, Point],
    sizes: dict[str, NodeSize],
    cell_size: float,
) -> None:
    for edge in diagram.edges:
        source, target = _interval_edge_endpoints(
            diagram,
            edge,
            positions,
            sizes,
            cell_size,
        )
        if diagram.directed:
            sketch.arrow(
                source.x,
                source.y,
                target.x,
                target.y,
                "default",
                z_index=0,
            )
        else:
            sketch.line(
                source.x,
                source.y,
                target.x,
                target.y,
                "default",
                z_index=0,
            )
        if edge.value is not None:
            label = _edge_label_position(source, target)
            sketch.text(label.x, label.y, edge.value, size=EDGE_LABEL_FONT_SIZE)


def _interval_edge_endpoints(
    diagram: TreeDiagram,
    edge: Edge,
    positions: dict[str, Point],
    sizes: dict[str, NodeSize],
    cell_size: float,
) -> tuple[Point, Point]:
    source_center = positions[edge.source]
    target_center = positions[edge.target]
    source_size = sizes[edge.source]
    target_size = sizes[edge.target]
    if diagram.layout == "binary":
        return (
            _shape_boundary(
                source_center,
                target_center,
                source_size,
                "rectangle",
            ),
            _shape_boundary(
                target_center,
                source_center,
                target_size,
                "rectangle",
            ),
        )
    if diagram.layout == "fenwick":
        source_anchor = _fenwick_interval_anchor(
            source_center,
            source_size,
            cell_size,
        )
        target_anchor = _fenwick_interval_anchor(
            target_center,
            target_size,
            cell_size,
        )
        return (
            _rectangle_boundary_from_anchor(
                source_center,
                source_anchor,
                target_anchor,
                source_size,
            ),
            _rectangle_boundary_from_anchor(
                target_center,
                target_anchor,
                source_anchor,
                target_size,
            ),
        )
    return (
        _shape_boundary(source_center, target_center, source_size, "rectangle"),
        _shape_boundary(target_center, source_center, target_size, "rectangle"),
    )


def _fenwick_interval_anchor(
    center: Point,
    size: NodeSize,
    cell_size: float,
) -> Point:
    return Point(center.x + size.width / 2 - cell_size / 2, center.y)


def _rectangle_boundary_from_anchor(
    rectangle_center: Point,
    anchor: Point,
    toward: Point,
    size: NodeSize,
) -> Point:
    dx = toward.x - anchor.x
    dy = toward.y - anchor.y
    candidates: list[float] = []
    if dx > 0:
        candidates.append((rectangle_center.x + size.width / 2 - anchor.x) / dx)
    elif dx < 0:
        candidates.append((rectangle_center.x - size.width / 2 - anchor.x) / dx)
    if dy > 0:
        candidates.append((rectangle_center.y + size.height / 2 - anchor.y) / dy)
    elif dy < 0:
        candidates.append((rectangle_center.y - size.height / 2 - anchor.y) / dy)
    distance = min(value for value in candidates if value >= 0)
    return Point(anchor.x + dx * distance, anchor.y + dy * distance)


def _draw_interval_nodes(
    sketch: Sketch,
    nodes: tuple[Node, ...],
    positions: dict[str, Point],
    sizes: dict[str, NodeSize],
) -> None:
    for node in nodes:
        center = positions[node.id]
        size = sizes[node.id]
        _draw_node_outline(
            sketch,
            center,
            size,
            "rectangle",
            "default",
            z_index=10,
        )
        lines = _interval_node_lines(node)
        total_height = sum(font_size for _, font_size in lines) + NODE_LINE_GAP * (
            len(lines) - 1
        )
        cursor = center.y - total_height / 2
        for value, font_size in lines:
            sketch.text(center.x, cursor + font_size / 2, value, size=font_size)
            cursor += font_size + NODE_LINE_GAP


def _interval_node_lines(
    node: Node,
) -> list[tuple[str, float]]:
    lines: list[tuple[str, float]] = []
    if node.label is not None:
        lines.append((node.label, NODE_AUX_FONT_SIZE))
    if node.value is not None:
        lines.append((node.value, NODE_PRIMARY_FONT_SIZE))
    lines.extend(
        (f"{key} = {value}", NODE_FIELD_FONT_SIZE)
        for key, value in node.fields
    )
    return lines or [(node.id, NODE_PRIMARY_FONT_SIZE)]


def _draw_interval_path_annotations(
    sketch: Sketch,
    diagram: TreeDiagram,
    positions: dict[str, Point],
    sizes: dict[str, NodeSize],
    cell_size: float,
) -> None:
    for annotation in diagram.annotations:
        pairs = list(zip(annotation.nodes, annotation.nodes[1:]))
        if annotation.closed:
            pairs.append((annotation.nodes[-1], annotation.nodes[0]))
        for source_id, target_id in pairs:
            edge = _path_edge(
                diagram.edges,
                source_id,
                target_id,
                diagram.directed,
            )
            source, target = _interval_edge_endpoints(
                diagram,
                edge,
                positions,
                sizes,
                cell_size,
            )
            if diagram.directed:
                sketch.arrow(
                    source.x,
                    source.y,
                    target.x,
                    target.y,
                    annotation.color,
                    stroke_width=ANNOTATION_STROKE_WIDTH,
                    z_index=100,
                )
            else:
                sketch.line(
                    source.x,
                    source.y,
                    target.x,
                    target.y,
                    annotation.color,
                    stroke_width=ANNOTATION_STROKE_WIDTH,
                    z_index=100,
                )
        for node_id in dict.fromkeys(annotation.nodes):
            _draw_node_outline(
                sketch,
                positions[node_id],
                sizes[node_id],
                "rectangle",
                annotation.color,
                stroke_width=ANNOTATION_STROKE_WIDTH,
                z_index=110,
            )


def _interval_length(node: Node) -> int:
    assert node.interval is not None
    return node.interval[1] - node.interval[0] + 1


def _interval_span_width(
    node: Node,
    cell_size: float,
    cell_gap: float,
) -> float:
    assert node.interval is not None
    return (
        _interval_length(node) * cell_size
        + (_interval_length(node) - 1) * cell_gap
    )


def _interval_center_x(
    node: Node,
    cell_size: float,
    cell_gap: float,
) -> float:
    assert node.interval is not None
    left = PADDING + (node.interval[0] - 1) * (cell_size + cell_gap)
    return left + _interval_span_width(node, cell_size, cell_gap) / 2
