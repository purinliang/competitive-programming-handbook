from __future__ import annotations

from ..common.geometry import NodeSize, Point
from ..common.theme import PADDING


def fit_positions(
    raw: dict[str, Point],
    size: NodeSize,
    *,
    left_margin: float = PADDING,
    right_margin: float = PADDING,
    top_margin: float = PADDING,
    bottom_margin: float = PADDING,
) -> tuple[dict[str, Point], int, int]:
    minimum_x = min(point.x for point in raw.values())
    maximum_x = max(point.x for point in raw.values())
    minimum_y = min(point.y for point in raw.values())
    maximum_y = max(point.y for point in raw.values())
    offset_x = left_margin + size.width / 2 - minimum_x
    offset_y = top_margin + size.height / 2 - minimum_y
    positions = {
        node_id: Point(point.x + offset_x, point.y + offset_y)
        for node_id, point in raw.items()
    }
    width = round(maximum_x - minimum_x + size.width + left_margin + right_margin)
    height = round(maximum_y - minimum_y + size.height + top_margin + bottom_margin)
    return positions, width, height
