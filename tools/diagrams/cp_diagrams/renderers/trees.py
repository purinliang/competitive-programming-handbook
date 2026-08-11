from __future__ import annotations

from ..common.canvas import Sketch
from ..common.geometry import NodeSize, Point
from ..common.theme import (
    FENWICK_SOURCE_GAP,
    INDEX_FONT_SIZE,
    INDEX_GAP,
    NODE_INDEX_HEIGHT,
    PADDING,
    PALETTE,
    VALUE_FONT_SIZE,
)
from ..layouts.common import fit_positions as _fit_positions
from ..layouts.graph import _self_loop_placements
from ..layouts.tree import (
    binary_tree_layout as _binary_tree_layout,
    fenwick_projection_guide_start as _fenwick_projection_guide_start,
    fenwick_tree_layout as _fenwick_tree_layout,
    rooted_tree_layout as _rooted_tree_layout,
    source_array_cell_width as _source_array_cell_width,
)
from ..models import TreeDiagram
from .primitives import (
    _draw_edges,
    _draw_nodes,
    _draw_path_annotations,
    _node_size,
    _node_uses_external_index,
)


def render_tree(diagram: TreeDiagram) -> str:
    size = _node_size(diagram.nodes, diagram.node_shape)
    if diagram.source_array is not None:
        size = NodeSize(
            max(size.width, _source_array_cell_width(diagram)),
            size.height,
        )
    if diagram.layout == "rooted":
        raw_positions = _rooted_tree_layout(diagram, size)
    elif diagram.layout == "binary":
        raw_positions = _binary_tree_layout(diagram, size)
    else:
        raw_positions = _fenwick_tree_layout(diagram, size)
    has_external_index = any(
        _node_uses_external_index(node, diagram.node_shape) for node in diagram.nodes
    )
    bottom_margin = PADDING + (NODE_INDEX_HEIGHT if has_external_index else 0)
    if diagram.source_array is not None:
        bottom_margin = (
            PADDING
            + INDEX_GAP * 2
            + INDEX_FONT_SIZE
            + FENWICK_SOURCE_GAP
            + size.height
        )
    positions, width, height = _fit_positions(
        raw_positions,
        size,
        bottom_margin=bottom_margin,
    )
    loop_placements = _self_loop_placements(diagram.edges, positions)
    sketch = Sketch(width, height)
    if diagram.background == "white":
        sketch.background(width, height, PALETTE["background"])
    if diagram.source_array is not None:
        _draw_fenwick_source_array(sketch, diagram, positions, size)
    _draw_edges(
        sketch,
        diagram.edges,
        positions,
        size,
        diagram.node_shape,
        directed=diagram.directed,
        loop_placements=loop_placements,
    )
    _draw_nodes(sketch, diagram.nodes, positions, size, diagram.node_shape)
    _draw_path_annotations(
        sketch,
        diagram.annotations,
        diagram.edges,
        positions,
        size,
        diagram.node_shape,
        directed=diagram.directed,
        loop_placements=loop_placements,
    )
    return sketch.as_svg(width, height)


def _draw_fenwick_source_array(
    sketch: Sketch,
    diagram: TreeDiagram,
    positions: dict[str, Point],
    size: NodeSize,
) -> None:
    assert diagram.source_array is not None
    leaf_center = positions["1"]
    projection_top = (
        _fenwick_projection_guide_start(leaf_center, size)
        + FENWICK_SOURCE_GAP
    )
    baseline = projection_top + size.height / 2
    for index, cell in enumerate(diagram.source_array.cells, start=1):
        center = positions[str(index)]
        guide_start = _fenwick_projection_guide_start(center, size)
        if guide_start < projection_top:
            sketch.dashed_line(
                center.x,
                guide_start,
                center.x,
                projection_top,
                "default",
                z_index=-5,
            )
        sketch.dashed_rectangle(
            center.x - size.width / 2,
            projection_top,
            size.width,
            size.height,
            "default",
            z_index=5,
        )
        sketch.text(
            center.x,
            baseline,
            str(cell.value),
            size=VALUE_FONT_SIZE,
        )
