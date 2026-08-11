from __future__ import annotations

from ..common.canvas import Sketch
from ..common.theme import NODE_INDEX_HEIGHT, PADDING, PALETTE, SELF_LOOP_MARGIN
from ..layouts.common import fit_positions as _fit_positions
from ..layouts.graph import (
    _self_loop_placements,
    balanced_graph_layout as _balanced_graph_layout,
)
from ..models import GraphDiagram
from .primitives import (
    _draw_edges,
    _draw_nodes,
    _draw_path_annotations,
    _node_size,
    _node_uses_external_index,
)

def render_graph(diagram: GraphDiagram) -> str:
    size = _node_size(diagram.nodes, diagram.node_shape)
    raw_positions = _balanced_graph_layout(diagram.nodes, diagram.edges, size)
    has_external_index = any(
        _node_uses_external_index(node, diagram.node_shape) for node in diagram.nodes
    )
    has_self_loop = any(edge.source == edge.target for edge in diagram.edges)
    positions, width, height = _fit_positions(
        raw_positions,
        size,
        left_margin=SELF_LOOP_MARGIN if has_self_loop else PADDING,
        top_margin=SELF_LOOP_MARGIN if has_self_loop else PADDING,
        right_margin=SELF_LOOP_MARGIN if has_self_loop else PADDING,
        bottom_margin=max(
            SELF_LOOP_MARGIN if has_self_loop else PADDING,
            PADDING + (NODE_INDEX_HEIGHT if has_external_index else 0),
        ),
    )
    loop_placements = _self_loop_placements(diagram.edges, positions)
    sketch = Sketch(width, height)
    if diagram.background == "white":
        sketch.background(width, height, PALETTE["background"])
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
