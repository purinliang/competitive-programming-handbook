from __future__ import annotations

from collections import Counter, defaultdict
from math import atan2, cos, hypot, pi, sin
from random import Random
from statistics import median

from ..common.geometry import LoopPlacement, NodeSize, Point
from ..common.theme import (
    ANGULAR_FORCE_STRENGTH,
    GRAPH_EDGE_LENGTH,
    GRAPH_LAYOUT_SEED,
    INDEX_CLEARANCE_ANGLE,
    INDEX_CLEARANCE_FORCE_STRENGTH,
)
from ..models import Edge, Node

def balanced_graph_layout(
    nodes: tuple[Node, ...], edges: tuple[Edge, ...], size: NodeSize
) -> dict[str, Point]:
    ids = sorted((node.id for node in nodes), key=_node_sort_key)
    if len(ids) == 1:
        return {ids[0]: Point(0, 0)}

    ideal = max(GRAPH_EDGE_LENGTH, size.width * 1.55, size.height * 1.55)
    radius = ideal * max(3, len(ids)) / (2 * pi)
    random = Random(GRAPH_LAYOUT_SEED)
    external_index_nodes = {
        node.id for node in nodes if node.index is not None or node.value is not None
    }
    positions: dict[str, list[float]] = {}
    for index, node_id in enumerate(ids):
        angle = -pi / 2 + 2 * pi * index / len(ids)
        angle += random.uniform(-0.11, 0.11)
        local_radius = radius * random.uniform(0.88, 1.12)
        positions[node_id] = [
            local_radius * cos(angle),
            local_radius * sin(angle),
        ]

    adjacency: defaultdict[str, list[str]] = defaultdict(list)
    self_loops: Counter[str] = Counter()
    for edge in edges:
        if edge.source == edge.target:
            self_loops[edge.source] += 1
            continue
        adjacency[edge.source].append(edge.target)
        adjacency[edge.target].append(edge.source)
    for neighbours in adjacency.values():
        neighbours.sort(key=_node_sort_key)

    iterations = 420
    for iteration in range(iterations):
        displacement = {node_id: [0.0, 0.0] for node_id in ids}
        for left_index, left in enumerate(ids):
            for right in ids[left_index + 1 :]:
                dx = positions[left][0] - positions[right][0]
                dy = positions[left][1] - positions[right][1]
                distance = max(hypot(dx, dy), 0.01)
                force = ideal * ideal / distance
                fx = dx / distance * force
                fy = dy / distance * force
                displacement[left][0] += fx
                displacement[left][1] += fy
                displacement[right][0] -= fx
                displacement[right][1] -= fy

        for edge in edges:
            if edge.source == edge.target:
                continue
            dx = positions[edge.source][0] - positions[edge.target][0]
            dy = positions[edge.source][1] - positions[edge.target][1]
            distance = max(hypot(dx, dy), 0.01)
            force = distance * distance / ideal
            fx = dx / distance * force
            fy = dy / distance * force
            displacement[edge.source][0] -= fx
            displacement[edge.source][1] -= fy
            displacement[edge.target][0] += fx
            displacement[edge.target][1] += fy

        _add_angular_forces(
            ids,
            adjacency,
            self_loops,
            positions,
            displacement,
            ideal,
        )
        _add_index_clearance_forces(
            external_index_nodes,
            adjacency,
            positions,
            displacement,
            ideal,
        )
        for node_id in ids:
            displacement[node_id][0] -= positions[node_id][0] * 0.055
            displacement[node_id][1] -= positions[node_id][1] * 0.055

        progress = iteration / (iterations - 1)
        temperature = ideal * 0.24 * (1 - progress) ** 1.4 + 0.03
        for node_id in ids:
            dx, dy = displacement[node_id]
            length = max(hypot(dx, dy), 0.01)
            step = min(length, temperature)
            positions[node_id][0] += dx / length * step
            positions[node_id][1] += dy / length * step

    result = {
        node_id: Point(coordinates[0], coordinates[1])
        for node_id, coordinates in positions.items()
    }
    result = _equalize_self_loop_angles(result, edges)
    result = _rotate_graph_for_index_clearance(
        result,
        edges,
        external_index_nodes,
    )
    return _normalize_graph_scale(result, edges, size, ideal)


def _equalize_self_loop_angles(
    positions: dict[str, Point], edges: tuple[Edge, ...]
) -> dict[str, Point]:
    """Exactly equalize loop ports when removing the loop node splits its branches."""
    adjacency: defaultdict[str, set[str]] = defaultdict(set)
    loop_nodes: set[str] = set()
    for edge in edges:
        if edge.source == edge.target:
            loop_nodes.add(edge.source)
            continue
        adjacency[edge.source].add(edge.target)
        adjacency[edge.target].add(edge.source)

    result = dict(positions)
    for center_id in sorted(loop_nodes, key=_node_sort_key):
        neighbours = sorted(adjacency[center_id], key=_node_sort_key)
        if not neighbours:
            continue

        branches: dict[str, set[str]] = {}
        for neighbour in neighbours:
            branch: set[str] = set()
            stack = [neighbour]
            while stack:
                node_id = stack.pop()
                if node_id == center_id or node_id in branch:
                    continue
                branch.add(node_id)
                stack.extend(adjacency[node_id] - branch - {center_id})
            branches[neighbour] = branch

        # Connected branches cannot be rotated independently without distorting edges.
        if any(
            branches[left] & branches[right]
            for index, left in enumerate(neighbours)
            for right in neighbours[index + 1 :]
        ):
            continue

        center = result[center_id]
        ordered = sorted(
            neighbours,
            key=lambda node_id: _normalize_angle(
                atan2(result[node_id].y - center.y, result[node_id].x - center.x)
            ),
        )
        angles = [
            _normalize_angle(
                atan2(result[node_id].y - center.y, result[node_id].x - center.x)
            )
            for node_id in ordered
        ]
        gap_index, _, _ = _preferred_angular_gap(angles)
        ordered = ordered[gap_index + 1 :] + ordered[: gap_index + 1]

        unwrapped: list[float] = []
        for node_id in ordered:
            angle = _normalize_angle(
                atan2(result[node_id].y - center.y, result[node_id].x - center.x)
            )
            if unwrapped:
                angle = _angle_after(angle, unwrapped[-1])
            unwrapped.append(angle)

        step = 2 * pi / (len(ordered) + 2)
        base = sum(
            angle - index * step for index, angle in enumerate(unwrapped)
        ) / len(unwrapped)
        for index, node_id in enumerate(ordered):
            rotation = base + index * step - unwrapped[index]
            cosine = cos(rotation)
            sine = sin(rotation)
            for branch_id in branches[node_id]:
                dx = result[branch_id].x - center.x
                dy = result[branch_id].y - center.y
                result[branch_id] = Point(
                    center.x + dx * cosine - dy * sine,
                    center.y + dx * sine + dy * cosine,
                )
    return result


def _rotate_graph_for_index_clearance(
    positions: dict[str, Point],
    edges: tuple[Edge, ...],
    external_index_nodes: set[str],
) -> dict[str, Point]:
    if not external_index_nodes:
        return positions

    loops = _self_loop_placements(edges, positions)
    best_rotation = 0.0
    best_rank: tuple[bool, float, float, float] | None = None
    for step in range(720):
        rotation = step * 2 * pi / 720
        clearances: list[float] = []
        for edge in edges:
            if edge.source == edge.target:
                continue
            for source, target in (
                (edge.source, edge.target),
                (edge.target, edge.source),
            ):
                if source not in external_index_nodes:
                    continue
                angle = atan2(
                    positions[target].y - positions[source].y,
                    positions[target].x - positions[source].x,
                )
                clearances.append(_angle_distance(angle + rotation, pi / 2))

        loop_distances = [
            _angle_distance(placement.direction + rotation, -pi / 2)
            for node_id, placement in loops.items()
            if node_id in external_index_nodes
        ]
        rank = (
            not loop_distances or max(loop_distances) <= pi / 3,
            min(clearances, default=pi),
            -sum(loop_distances),
            -min(rotation, 2 * pi - rotation),
        )
        if best_rank is None or rank > best_rank:
            best_rank = rank
            best_rotation = rotation

    cosine = cos(best_rotation)
    sine = sin(best_rotation)
    return {
        node_id: Point(
            point.x * cosine - point.y * sine,
            point.x * sine + point.y * cosine,
        )
        for node_id, point in positions.items()
    }


def _add_angular_forces(
    ids: list[str],
    adjacency: dict[str, list[str]],
    self_loops: Counter[str],
    positions: dict[str, list[float]],
    displacement: dict[str, list[float]],
    ideal: float,
) -> None:
    for center in ids:
        neighbours = adjacency[center]
        if len(neighbours) + 2 * self_loops[center] < 2:
            continue
        real = sorted(
            (
                _normalize_angle(
                    atan2(
                        positions[node_id][1] - positions[center][1],
                        positions[node_id][0] - positions[center][0],
                    )
                ),
                node_id,
            )
            for node_id in neighbours
        )
        around: list[tuple[float, str | None]] = list(real)
        if self_loops[center]:
            placement = _loop_port_angles([angle for angle, _ in real])
            around.extend(
                [
                    (placement.first_port, None),
                    (placement.second_port, None),
                ]
            )
        around.sort()
        desired = 2 * pi / len(around)
        for index, (first_angle, first) in enumerate(around):
            second_angle, second = around[(index + 1) % len(around)]
            gap = (second_angle - first_angle) % (2 * pi)
            magnitude = (
                ideal * ANGULAR_FORCE_STRENGTH * (desired - gap) / desired
            )
            first_tangent = (-sin(first_angle), cos(first_angle))
            second_tangent = (-sin(second_angle), cos(second_angle))
            if first is not None:
                displacement[first][0] -= first_tangent[0] * magnitude
                displacement[first][1] -= first_tangent[1] * magnitude
            if second is not None:
                displacement[second][0] += second_tangent[0] * magnitude
                displacement[second][1] += second_tangent[1] * magnitude


def _add_index_clearance_forces(
    external_index_nodes: set[str],
    adjacency: dict[str, list[str]],
    positions: dict[str, list[float]],
    displacement: dict[str, list[float]],
    ideal: float,
) -> None:
    for center in sorted(external_index_nodes, key=_node_sort_key):
        for neighbour in adjacency[center]:
            dx = positions[neighbour][0] - positions[center][0]
            dy = positions[neighbour][1] - positions[center][1]
            angle = atan2(dy, dx)
            difference = (angle - pi / 2 + pi) % (2 * pi) - pi
            if abs(difference) >= INDEX_CLEARANCE_ANGLE:
                continue
            direction = 1 if difference > 0 else -1
            if difference == 0:
                direction = (
                    1
                    if _node_sort_key(neighbour) > _node_sort_key(center)
                    else -1
                )
            tangent = (-sin(angle), cos(angle))
            magnitude = (
                ideal
                * INDEX_CLEARANCE_FORCE_STRENGTH
                * (INDEX_CLEARANCE_ANGLE - abs(difference))
                / INDEX_CLEARANCE_ANGLE
            )
            displacement[neighbour][0] += tangent[0] * magnitude * direction
            displacement[neighbour][1] += tangent[1] * magnitude * direction
            displacement[center][0] -= tangent[0] * magnitude * direction * 0.25
            displacement[center][1] -= tangent[1] * magnitude * direction * 0.25


def _normalize_graph_scale(
    positions: dict[str, Point],
    edges: tuple[Edge, ...],
    size: NodeSize,
    ideal: float,
) -> dict[str, Point]:
    scale = 1.0
    edge_lengths = [
        hypot(
            positions[edge.source].x - positions[edge.target].x,
            positions[edge.source].y - positions[edge.target].y,
        )
        for edge in edges
        if edge.source != edge.target
    ]
    if edge_lengths and median(edge_lengths) > 0:
        scale = ideal / median(edge_lengths)

    ids = list(positions)
    minimum_distance = max(size.width, size.height) + 26
    closest = min(
        (
            hypot(
                positions[left].x - positions[right].x,
                positions[left].y - positions[right].y,
            )
            for index, left in enumerate(ids)
            for right in ids[index + 1 :]
        ),
        default=minimum_distance,
    )
    if closest * scale < minimum_distance:
        scale = minimum_distance / max(closest, 0.01)
    return {
        node_id: Point(point.x * scale, point.y * scale)
        for node_id, point in positions.items()
    }


def _self_loop_placements(
    edges: tuple[Edge, ...], positions: dict[str, Point]
) -> dict[str, LoopPlacement]:
    incident: defaultdict[str, list[float]] = defaultdict(list)
    loop_nodes: set[str] = set()
    for edge in edges:
        if edge.source == edge.target:
            loop_nodes.add(edge.source)
            continue
        source = positions[edge.source]
        target = positions[edge.target]
        incident[edge.source].append(
            _normalize_angle(atan2(target.y - source.y, target.x - source.x))
        )
        incident[edge.target].append(
            _normalize_angle(atan2(source.y - target.y, source.x - target.x))
        )
    return {
        node_id: _loop_port_angles(incident[node_id])
        for node_id in sorted(loop_nodes, key=_node_sort_key)
    }


def _loop_port_angles(incident: list[float]) -> LoopPlacement:
    if not incident:
        return LoopPlacement(
            first_port=_normalize_angle(-3 * pi / 4),
            second_port=_normalize_angle(-pi / 4),
            direction=_normalize_angle(-pi / 2),
        )

    angles = sorted(_normalize_angle(angle) for angle in incident)
    _, start, gap = _preferred_angular_gap(angles)
    return LoopPlacement(
        first_port=_normalize_angle(start + gap / 3),
        second_port=_normalize_angle(start + gap * 2 / 3),
        direction=_normalize_angle(start + gap / 2),
    )


def _preferred_angular_gap(angles: list[float]) -> tuple[int, float, float]:
    gaps: list[tuple[float, float]] = []
    for index, start in enumerate(angles):
        stop = angles[(index + 1) % len(angles)]
        if index == len(angles) - 1:
            stop += 2 * pi
        gaps.append((start, stop - start))
    maximum = max(gap for _, gap in gaps)
    candidates = [item for item in gaps if maximum - item[1] <= 0.15]
    start, gap = min(
        candidates,
        key=lambda item: (
            sin(item[0] + item[1] / 2),
            cos(item[0] + item[1] / 2),
        ),
    )
    return next(
        index
        for index, (candidate_start, candidate_gap) in enumerate(gaps)
        if candidate_start == start and candidate_gap == gap
    ), start, gap


def _normalize_angle(angle: float) -> float:
    return angle % (2 * pi)


def _angle_distance(first: float, second: float) -> float:
    return abs((first - second + pi) % (2 * pi) - pi)


def _angle_after(angle: float, start: float) -> float:
    result = _normalize_angle(angle)
    while result <= start:
        result += 2 * pi
    return result


def _angle_is_between(angle: float, start: float, stop: float) -> bool:
    candidate = _angle_after(angle, start)
    return candidate < stop


def _node_sort_key(node_id: str) -> tuple[int, int | str]:
    try:
        return (0, int(node_id))
    except ValueError:
        return (1, node_id)
