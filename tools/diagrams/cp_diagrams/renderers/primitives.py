from __future__ import annotations

from math import atan2, cos, hypot, pi, sin

from ..common.canvas import Sketch
from ..common.geometry import LoopPlacement, NodeSize, Point
from ..common.theme import (
    ANNOTATION_LABEL_FONT_SIZE,
    ANNOTATION_STROKE_WIDTH,
    EDGE_LABEL_FONT_SIZE,
    EDGE_LABEL_GAP,
    INDEX_FONT_SIZE,
    INDEX_GAP,
    MIN_NODE_DIAMETER,
    MIN_RECTANGLE_HEIGHT,
    MIN_RECTANGLE_WIDTH,
    MIN_SQUARE_SIZE,
    NODE_AUX_FONT_SIZE,
    NODE_FIELD_FONT_SIZE,
    NODE_HORIZONTAL_PADDING,
    NODE_INDEX_HEIGHT,
    NODE_LINE_GAP,
    NODE_PRIMARY_FONT_SIZE,
    NODE_VERTICAL_PADDING,
    STROKE_WIDTH,
)
from ..common.typography import text_width as _text_width
from ..layouts.graph import _angle_after, _angle_is_between, _normalize_angle
from ..models import Edge, Node, PathHighlight

def _draw_edges(
    sketch: Sketch,
    edges: tuple[Edge, ...],
    positions: dict[str, Point],
    size: NodeSize,
    shape: str,
    *,
    directed: bool,
    loop_placements: dict[str, LoopPlacement],
) -> None:
    for edge in edges:
        edge_directed = directed if edge.directed is None else edge.directed
        source_center = positions[edge.source]
        target_center = positions[edge.target]
        geometry = _draw_edge_geometry(
            sketch,
            source_center,
            target_center,
            size,
            shape,
            directed=edge_directed,
            color="default",
            stroke_width=STROKE_WIDTH,
            z_index=0,
            loop_placement=loop_placements.get(edge.source),
            source_side=edge.side,
        )
        if edge.value is not None:
            if edge.source == edge.target:
                label = _self_loop_label_position(
                    source_center,
                    size,
                    shape,
                    loop_placements[edge.source],
                )
            else:
                assert geometry is not None
                label = _edge_label_position(*geometry)
            sketch.text(
                label.x,
                label.y,
                edge.value,
                size=EDGE_LABEL_FONT_SIZE,
            )


def _draw_edge_geometry(
    sketch: Sketch,
    source_center: Point,
    target_center: Point,
    size: NodeSize,
    shape: str,
    *,
    directed: bool,
    color: str,
    stroke_width: float,
    z_index: int,
    loop_placement: LoopPlacement | None = None,
    source_side: str | None = None,
) -> tuple[Point, Point] | None:
    if source_center == target_center:
        assert loop_placement is not None
        _draw_self_loop(
            sketch,
            source_center,
            size,
            shape,
            directed=directed,
            color=color,
            stroke_width=stroke_width,
            z_index=z_index,
            placement=loop_placement,
        )
        return None
    if source_side is None or shape == "circle":
        source = _shape_boundary(source_center, target_center, size, shape)
        target = _shape_boundary(target_center, source_center, size, shape)
    else:
        source = Point(
            source_center.x
            + (-size.width / 2 if source_side == "left" else size.width / 2),
            source_center.y + size.height / 2,
        )
        target = Point(target_center.x, target_center.y - size.height / 2)
    if directed:
        sketch.arrow(
            source.x,
            source.y,
            target.x,
            target.y,
            color,
            stroke_width=stroke_width,
            z_index=z_index,
        )
    else:
        sketch.line(
            source.x,
            source.y,
            target.x,
            target.y,
            color,
            stroke_width=stroke_width,
            z_index=z_index,
        )
    return source, target


def _draw_self_loop(
    sketch: Sketch,
    center: Point,
    size: NodeSize,
    shape: str,
    *,
    directed: bool,
    color: str,
    stroke_width: float,
    z_index: int,
    placement: LoopPlacement,
) -> None:
    radius = max(size.width, size.height) / 2
    distance_to_center = radius * 1.8
    loop_center = Point(
        center.x + distance_to_center * cos(placement.direction),
        center.y + distance_to_center * sin(placement.direction),
    )
    first = _shape_port(center, size, shape, placement.first_port)
    second = _shape_port(center, size, shape, placement.second_port)
    loop_radius = hypot(first.x - loop_center.x, first.y - loop_center.y)
    first_angle = atan2(first.y - loop_center.y, first.x - loop_center.x)
    second_angle = atan2(second.y - loop_center.y, second.x - loop_center.x)
    inward_angle = placement.direction + pi
    start_angle = _normalize_angle(first_angle)
    stop_angle = _angle_after(second_angle, start_angle)
    if _angle_is_between(inward_angle, start_angle, stop_angle):
        start_angle = _normalize_angle(second_angle)
        stop_angle = _angle_after(first_angle, start_angle)
    sketch.arc(
        loop_center.x,
        loop_center.y,
        loop_radius * 2,
        loop_radius * 2,
        start_angle,
        stop_angle,
        color,
        stroke_width=stroke_width,
        z_index=z_index,
    )
    if directed:
        end = Point(
            loop_center.x + loop_radius * cos(stop_angle),
            loop_center.y + loop_radius * sin(stop_angle),
        )
        before = Point(
            loop_center.x + loop_radius * cos(stop_angle - 0.12),
            loop_center.y + loop_radius * sin(stop_angle - 0.12),
        )
        sketch.arrow_head(
            before.x,
            before.y,
            end.x,
            end.y,
            color,
            stroke_width=stroke_width,
            z_index=z_index,
        )


def _self_loop_label_position(
    center: Point, size: NodeSize, shape: str, placement: LoopPlacement
) -> Point:
    radius = max(size.width, size.height) / 2
    distance_to_center = radius * 1.8
    loop_center = Point(
        center.x + distance_to_center * cos(placement.direction),
        center.y + distance_to_center * sin(placement.direction),
    )
    first = _shape_port(center, size, shape, placement.first_port)
    loop_radius = hypot(first.x - loop_center.x, first.y - loop_center.y)
    return Point(
        loop_center.x
        + (loop_radius + EDGE_LABEL_GAP * 0.55) * cos(placement.direction),
        loop_center.y
        + (loop_radius + EDGE_LABEL_GAP * 0.55) * sin(placement.direction),
    )


def _shape_port(center: Point, size: NodeSize, shape: str, angle: float) -> Point:
    dx = cos(angle)
    dy = sin(angle)
    if shape == "circle":
        distance = size.width / 2
    else:
        distance = 1 / max(
            abs(dx) / (size.width / 2),
            abs(dy) / (size.height / 2),
        )
    return Point(center.x + dx * distance, center.y + dy * distance)


def _draw_path_annotations(
    sketch: Sketch,
    annotations: tuple[PathHighlight, ...],
    edges: tuple[Edge, ...],
    positions: dict[str, Point],
    size: NodeSize,
    shape: str,
    *,
    directed: bool,
    loop_placements: dict[str, LoopPlacement],
) -> None:
    for annotation in annotations:
        pairs = list(zip(annotation.nodes, annotation.nodes[1:]))
        if annotation.closed:
            pairs.append((annotation.nodes[-1], annotation.nodes[0]))
        for source, target in pairs:
            edge = _path_edge(edges, source, target, directed)
            edge_directed = directed if edge.directed is None else edge.directed
            _draw_edge_geometry(
                sketch,
                positions[edge.source],
                positions[edge.target],
                size,
                shape,
                directed=edge_directed,
                color=annotation.color,
                stroke_width=ANNOTATION_STROKE_WIDTH,
                z_index=100,
                loop_placement=loop_placements.get(edge.source),
                source_side=edge.side,
            )
        for node_id in dict.fromkeys(annotation.nodes):
            _draw_node_outline(
                sketch,
                positions[node_id],
                size,
                shape,
                annotation.color,
                stroke_width=ANNOTATION_STROKE_WIDTH,
                z_index=110,
            )


def _path_edge(
    edges: tuple[Edge, ...], source: str, target: str, directed: bool
) -> Edge:
    for edge in edges:
        edge_directed = directed if edge.directed is None else edge.directed
        if edge.source == source and edge.target == target:
            return edge
        if not edge_directed and edge.source == target and edge.target == source:
            return edge
    raise AssertionError("validated path edge is missing")


def _draw_nodes(
    sketch: Sketch,
    nodes: tuple[Node, ...],
    positions: dict[str, Point],
    size: NodeSize,
    shape: str,
) -> None:
    for node in nodes:
        center = positions[node.id]
        _draw_node_outline(sketch, center, size, shape, "default", z_index=10)
        lines = _node_lines(node, shape)
        total_height = sum(line[1] for line in lines) + NODE_LINE_GAP * (len(lines) - 1)
        cursor = center.y - total_height / 2
        for value, font_size in lines:
            sketch.text(center.x, cursor + font_size / 2, value, size=font_size)
            cursor += font_size + NODE_LINE_GAP
        if _node_uses_external_index(node, shape):
            sketch.text(
                center.x,
                center.y + size.height / 2 + INDEX_GAP + INDEX_FONT_SIZE / 2,
                _node_external_index_text(node),
                size=INDEX_FONT_SIZE,
            )


def _draw_node_outline(
    sketch: Sketch,
    center: Point,
    size: NodeSize,
    shape: str,
    color: str,
    *,
    stroke_width: float = STROKE_WIDTH,
    z_index: int,
) -> None:
    if shape == "circle":
        sketch.circle(
            center.x,
            center.y,
            size.width,
            color,
            stroke_width=stroke_width,
            z_index=z_index,
        )
        return
    sketch.rectangle(
        center.x - size.width / 2,
        center.y - size.height / 2,
        size.width,
        size.height,
        color,
        stroke_width=stroke_width,
        z_index=z_index,
    )


def _shape_boundary(
    center: Point, toward: Point, size: NodeSize, shape: str
) -> Point:
    dx = toward.x - center.x
    dy = toward.y - center.y
    distance = max(hypot(dx, dy), 0.01)
    if shape == "circle":
        radius = size.width / 2
        return Point(center.x + dx / distance * radius, center.y + dy / distance * radius)
    scale = 1 / max(abs(dx) / (size.width / 2), abs(dy) / (size.height / 2))
    return Point(center.x + dx * scale, center.y + dy * scale)


def _edge_label_position(source: Point, target: Point) -> Point:
    dx = target.x - source.x
    dy = target.y - source.y
    distance = max(hypot(dx, dy), 0.01)
    normal_x = -dy / distance
    normal_y = dx / distance
    if normal_y > 0:
        normal_x = -normal_x
        normal_y = -normal_y
    if abs(normal_y) < 0.08:
        normal_x = 1
        normal_y = 0
    return Point(
        (source.x + target.x) / 2 + normal_x * EDGE_LABEL_GAP,
        (source.y + target.y) / 2 + normal_y * EDGE_LABEL_GAP,
    )


def _node_size(nodes: tuple[Node, ...], shape: str) -> NodeSize:
    all_lines = [_node_lines(node, shape) for node in nodes]
    content_width = max(
        _text_width(value, font_size)
        for lines in all_lines
        for value, font_size in lines
    )
    content_height = max(
        sum(font_size for _, font_size in lines) + NODE_LINE_GAP * (len(lines) - 1)
        for lines in all_lines
    )
    width = content_width + NODE_HORIZONTAL_PADDING * 2
    height = content_height + NODE_VERTICAL_PADDING * 2
    if shape == "rectangle":
        external_width = max(
            (
                _text_width(_node_external_index_text(node), INDEX_FONT_SIZE)
                + NODE_HORIZONTAL_PADDING * 2
                for node in nodes
                if node.index is not None
            ),
            default=0,
        )
        width = max(width, external_width)
    if shape == "circle":
        diameter = max(MIN_NODE_DIAMETER, width, height)
        return NodeSize(diameter, diameter)
    if shape == "square":
        side = max(MIN_SQUARE_SIZE, width, height)
        return NodeSize(side, side)
    return NodeSize(
        max(MIN_RECTANGLE_WIDTH, width),
        max(MIN_RECTANGLE_HEIGHT, height),
    )


def _node_lines(node: Node, shape: str) -> list[tuple[str, float]]:
    primary = _node_primary_text(node)
    if node.index is not None:
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
    if shape in {"circle", "square"} and node.value is not None:
        assert node.value is not None
        return [(node.value, NODE_PRIMARY_FONT_SIZE)]
    if node.value is None and not node.fields:
        return [(primary, NODE_PRIMARY_FONT_SIZE)]
    lines: list[tuple[str, float]] = [(primary, NODE_AUX_FONT_SIZE)]
    if node.value is not None:
        lines.append((node.value, NODE_PRIMARY_FONT_SIZE))
    lines.extend(
        (f"{key} = {value}", NODE_FIELD_FONT_SIZE) for key, value in node.fields
    )
    return lines


def _node_primary_text(node: Node) -> str:
    return node.label if node.label is not None else node.id


def _node_external_index_text(node: Node) -> str:
    return node.index if node.index is not None else _node_primary_text(node)


def _node_uses_external_index(node: Node, shape: str) -> bool:
    return node.index is not None or (
        shape in {"circle", "square"} and node.value is not None
    )
