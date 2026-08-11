from __future__ import annotations

import unittest
import xml.etree.ElementTree as ET
from math import atan2, pi

from cp_diagrams.common.geometry import NodeSize, Point
from cp_diagrams.common.theme import INDEX_FONT_SIZE, INDEX_GAP
from cp_diagrams.layouts.graph import (
    _loop_port_angles,
    _rotate_graph_for_index_clearance,
    _self_loop_placements,
    balanced_graph_layout,
)
from cp_diagrams.layouts.tree import (
    binary_tree_layout,
    fenwick_projection_guide_start,
    fenwick_tree_layout,
)
from cp_diagrams.render import render_svg
from cp_diagrams.renderers.arrays import _range_label_is_inline
from cp_diagrams.renderers.interval_trees import (
    _fenwick_interval_anchor,
    _interval_edge_endpoints,
)
from cp_diagrams.renderers.primitives import (
    _edge_label_position,
    _node_size,
    _shape_boundary,
)
from cp_diagrams.schema import (
    GraphDiagram,
    MultiArrayDiagram,
    Range,
    TreeDiagram,
    parse_diagram,
)

_balanced_graph_layout = balanced_graph_layout
_binary_tree_layout = binary_tree_layout
_fenwick_projection_guide_start = fenwick_projection_guide_start
_fenwick_tree_layout = fenwick_tree_layout

class RenderTest(unittest.TestCase):
    def test_range_label_switches_between_inline_and_above(self) -> None:
        short = Range(start=0, end=3, label="11", color="red")
        long = Range(start=0, end=3, label="1 + 4 + 1 + 5 = 11", color="red")
        self.assertTrue(_range_label_is_inline(short, 200))
        self.assertFalse(_range_label_is_inline(long, 200))

    def test_renders_stable_svg_text(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v1",
                "type": "array",
                "label": "a",
                "cells": [3, 1, 4],
            }
        )
        first = render_svg(diagram)
        second = render_svg(diagram)
        self.assertEqual(first, second)
        self.assertIn("<svg", first)
        self.assertIn(">a</text>", first)
        self.assertIn(">3</text>", first)
        self.assertIn('text-anchor="middle"', first)
        self.assertIn('dominant-baseline="central"', first)
        root = ET.fromstring(first)
        self.assertIn("viewBox", root.attrib)
        self.assertIn('stroke="#000000"', first)
        self.assertNotIn('fill="#ffffff"', first)

    def test_white_background_does_not_fill_cells(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v1",
                "type": "array",
                "background": "white",
                "cells": [1, 2],
            }
        )
        svg = render_svg(diagram)
        self.assertEqual(svg.count('fill="#ffffff"'), 1)

    def test_cell_highlight_is_thicker_and_drawn_after_base_cells(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v1",
                "type": "array",
                "cells": [1, 2],
                "annotations": [
                    {"type": "cell", "at": 1, "color": "red"},
                    {"type": "arrow", "at": 1, "color": "blue"},
                ],
            }
        )
        svg = render_svg(diagram)
        base = svg.index('stroke="#000000"')
        arrow = svg.index('stroke="#2f67b2"')
        highlight = svg.index('stroke="#c43d3d"')
        self.assertGreater(highlight, base)
        self.assertGreater(highlight, arrow)
        self.assertIn('stroke-width="2.5"', svg[highlight:])

    def test_annotation_lines_and_labels_are_emphasized(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v1",
                "type": "array",
                "cells": [1, 2, 3],
                "annotations": [
                    {
                        "type": "range",
                        "from": 1,
                        "to": 3,
                        "label": "sum",
                        "color": "red",
                    }
                ],
            }
        )
        svg = render_svg(diagram)
        self.assertIn('stroke="#c43d3d" stroke-width="2.5"', svg)
        self.assertIn('font-weight="600"', svg)

    def test_long_value_expands_all_cells(self) -> None:
        short = parse_diagram(
            {"schema": "cp-diagram/v1", "type": "array", "cells": [1, 2]}
        )
        long = parse_diagram(
            {"schema": "cp-diagram/v1", "type": "array", "cells": [100000, 2]}
        )
        short_width = int(ET.fromstring(render_svg(short)).attrib["width"])
        long_width = int(ET.fromstring(render_svg(long)).attrib["width"])
        self.assertGreater(long_width, short_width)


class RenderV2Test(unittest.TestCase):
    def test_multi_array_columns_and_row_gaps_align(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "array",
                "index": "none",
                "rows": [
                    {"id": "a", "cells": ["a1", "a2"]},
                    {"id": "b", "cells": ["b1", "b2"]},
                    {"id": "c", "cells": ["c1", "c2"]},
                ],
            }
        )
        root = ET.fromstring(render_svg(diagram))
        texts = {
            element.text: (float(element.attrib["x"]), float(element.attrib["y"]))
            for element in root.iter()
            if element.tag.endswith("text")
        }
        self.assertEqual(texts["a1"][0], texts["b1"][0])
        self.assertEqual(texts["b1"][0], texts["c1"][0])
        self.assertEqual(texts["a2"][0], texts["b2"][0])
        self.assertAlmostEqual(
            texts["b1"][1] - texts["a1"][1],
            texts["c1"][1] - texts["b1"][1],
        )

    def test_projection_array_omits_labels_and_repeats_indices_only_once(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "array",
                "layout": "projection",
                "rows": [
                    {"id": "prefix", "cells": [3, 4, 8]},
                    {"id": "a", "cells": [3, 1, 4]},
                ],
            }
        )
        svg = render_svg(diagram)
        self.assertNotIn(">prefix</text>", svg)
        self.assertNotIn(">a</text>", svg)
        self.assertEqual(svg.count('font-size="12"'), 3)
        self.assertEqual(svg.count('stroke-dasharray="7.0 5.0"'), 6)
        root = ET.fromstring(svg)
        upper_values = [
            element
            for element in root.iter()
            if element.tag.endswith("text")
            and element.attrib.get("font-size") == "20"
            and float(element.attrib["y"]) < 80
        ]
        self.assertAlmostEqual(
            float(upper_values[1].attrib["x"])
            - float(upper_values[0].attrib["x"]),
            62.5,
        )

    def test_graph_layout_is_stable_and_avoids_node_collisions(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "graph",
                "nodes": [{"id": index} for index in range(1, 6)],
                "edges": [
                    {"from": 1, "to": 2},
                    {"from": 2, "to": 3},
                    {"from": 3, "to": 4},
                    {"from": 4, "to": 5},
                    {"from": 5, "to": 1},
                ],
            }
        )
        assert isinstance(diagram, GraphDiagram)
        size = _node_size(diagram.nodes, diagram.node_shape)
        first = _balanced_graph_layout(diagram.nodes, diagram.edges, size)
        second = _balanced_graph_layout(diagram.nodes, diagram.edges, size)
        self.assertEqual(first, second)
        closest = min(
            ((left.x - right.x) ** 2 + (left.y - right.y) ** 2) ** 0.5
            for index, left in enumerate(first.values())
            for right in list(first.values())[index + 1 :]
        )
        self.assertGreaterEqual(closest, max(size.width, size.height) + 25.9)
        self.assertEqual(render_svg(diagram), render_svg(diagram))

    def test_slanted_edge_label_uses_upper_normal(self) -> None:
        forward = _edge_label_position(Point(0, 0), Point(100, 100))
        backward = _edge_label_position(Point(100, 100), Point(0, 0))
        self.assertLess(forward.y, 50)
        self.assertLess(backward.y, 50)

    def test_edge_value_uses_the_same_primary_size_as_node_value(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "graph",
                "nodes": [{"id": 1, "value": "A"}, {"id": 2, "value": "B"}],
                "edges": [{"from": 1, "to": 2, "value": "weight"}],
            }
        )
        svg = render_svg(diagram)
        self.assertRegex(svg, r'font-size="20"[^>]*>A</text>')
        self.assertRegex(svg, r'font-size="20"[^>]*>weight</text>')
        self.assertRegex(svg, r'font-size="12"[^>]*>1</text>')

    def test_vertical_edge_label_uses_deterministic_side(self) -> None:
        label = _edge_label_position(Point(20, 0), Point(20, 100))
        self.assertGreater(label.x, 20)
        self.assertEqual(label.y, 50)

    def test_circle_edge_boundary_stays_on_the_center_line(self) -> None:
        boundary = _shape_boundary(
            Point(0, 0),
            Point(0, 100),
            NodeSize(50, 50),
            "circle",
        )
        self.assertEqual(boundary, Point(0, 25))

    def test_graph_rotation_moves_external_indices_away_from_vertical_edges(self) -> None:
        positions = {"1": Point(0, 0), "2": Point(0, 100)}
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "graph",
                "nodes": [{"id": 1, "value": "A"}, {"id": 2, "value": "B"}],
                "edges": [{"from": 1, "to": 2}],
            }
        )
        assert isinstance(diagram, GraphDiagram)
        rotated = _rotate_graph_for_index_clearance(
            positions,
            diagram.edges,
            {"1", "2"},
        )
        self.assertAlmostEqual(rotated["1"].y, rotated["2"].y)

    def test_binary_children_are_symmetric(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "binary",
                "root": "r",
                "nodes": [{"id": "r"}, {"id": "l"}, {"id": "q"}],
                "edges": [
                    {"from": "r", "to": "l", "side": "left"},
                    {"from": "r", "to": "q", "side": "right"},
                ],
            }
        )
        assert isinstance(diagram, TreeDiagram)
        size = _node_size(diagram.nodes, diagram.node_shape)
        positions = _binary_tree_layout(diagram, size)
        self.assertAlmostEqual(
            positions["r"].x - positions["l"].x,
            positions["q"].x - positions["r"].x,
        )
        self.assertEqual(positions["l"].y, positions["q"].y)

    def test_fenwick_levels_follow_lowbit(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "fenwick",
                "nodes": [{"id": index} for index in range(1, 9)],
            }
        )
        assert isinstance(diagram, TreeDiagram)
        size = _node_size(diagram.nodes, diagram.node_shape)
        positions = _fenwick_tree_layout(diagram, size)
        self.assertGreater(positions["1"].y, positions["2"].y)
        self.assertGreater(positions["2"].y, positions["4"].y)
        self.assertGreater(positions["4"].y, positions["8"].y)
        self.assertEqual(positions["1"].y, positions["3"].y)
        self.assertLess(positions["1"].x, positions["8"].x)

    def test_fenwick_renders_plain_external_array_indices(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "fenwick",
                "nodes": [{"id": 1, "value": 3}, {"id": 2, "value": 4}],
            }
        )
        svg = render_svg(diagram)
        self.assertRegex(svg, r'font-size="20"[^>]*>3</text>')
        self.assertRegex(svg, r'font-size="12"[^>]*>1</text>')
        self.assertNotIn("tree[", svg)

    def test_fenwick_source_array_uses_dashed_aligned_projections(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "fenwick",
                "source-array": [3, 1, 4, 1],
                "nodes": [
                    {"id": 1, "value": 3},
                    {"id": 2, "value": 4},
                    {"id": 3, "value": 4},
                    {"id": 4, "value": 9},
                ],
            }
        )
        assert isinstance(diagram, TreeDiagram)
        size = _node_size(diagram.nodes, diagram.node_shape)
        positions = _fenwick_tree_layout(diagram, size)
        self.assertEqual(positions["2"].x - positions["1"].x, size.width)
        svg = render_svg(diagram)
        self.assertEqual(svg.count('stroke-dasharray="7.0 5.0"'), 8)

    def test_interval_fenwick_only_indexes_the_projected_source_array(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "fenwick",
                "node-width": "interval",
                "source-array": [3, 1, 4, 1],
                "nodes": [
                    {"id": 1, "value": 3},
                    {"id": 2, "value": 4},
                    {"id": 3, "value": 4},
                    {"id": 4, "value": 9},
                ],
            }
        )
        svg = render_svg(diagram)
        self.assertEqual(svg.count('font-size="12"'), 4)
        self.assertEqual(svg.count('stroke-dasharray="7.0 5.0"'), 8)

    def test_interval_fenwick_anchor_is_the_last_cell_center(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "fenwick",
                "node-width": "interval",
                "source-array": [3, 1, 4, 1],
                "nodes": [
                    {"id": 1, "value": 3},
                    {"id": 2, "value": 4},
                    {"id": 3, "value": 4},
                    {"id": 4, "value": 9},
                ],
            }
        )
        assert isinstance(diagram, TreeDiagram)
        anchor = _fenwick_interval_anchor(
            Point(100, 50),
            NodeSize(237.5, 44),
            50,
        )
        self.assertEqual(anchor, Point(193.75, 50))

    def test_interval_segment_tree_only_renders_source_indices(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "binary",
                "node-width": "interval",
                "root": "r",
                "source-array": [3, 1],
                "nodes": [
                    {"id": "r", "interval": [1, 2], "value": 4},
                    {"id": "l", "interval": [1, 1], "value": 3},
                    {"id": "q", "interval": [2, 2], "value": 1},
                ],
                "edges": [
                    {"from": "r", "to": "l", "side": "left"},
                    {"from": "r", "to": "q", "side": "right"},
                ],
            }
        )
        svg = render_svg(diagram)
        self.assertNotIn(">[1, 2]</text>", svg)
        self.assertNotIn(">[1, 1]</text>", svg)
        self.assertEqual(svg.count('font-size="12"'), 2)
        self.assertEqual(svg.count('stroke-dasharray="7.0 5.0"'), 4)
        assert isinstance(diagram, TreeDiagram)
        positions = {
            "r": Point(100, 50),
            "l": Point(50, 150),
            "q": Point(150, 150),
        }
        sizes = {
            "r": NodeSize(100, 55),
            "l": NodeSize(50, 55),
            "q": NodeSize(50, 55),
        }
        source, _ = _interval_edge_endpoints(
            diagram,
            diagram.edges[0],
            positions,
            sizes,
            50,
        )
        self.assertAlmostEqual(source.y, 77.5)
        self.assertAlmostEqual(
            (source.x - positions["r"].x)
            / (positions["l"].x - positions["r"].x),
            (source.y - positions["r"].y)
            / (positions["l"].y - positions["r"].y),
        )

    def test_fenwick_projection_starts_below_the_node_index(self) -> None:
        size = NodeSize(50, 44)
        center = Point(100, 80)
        guide_start = _fenwick_projection_guide_start(center, size)
        index_center = (
            center.y + size.height / 2 + INDEX_GAP + INDEX_FONT_SIZE / 2
        )
        self.assertGreater(guide_start, index_center + INDEX_FONT_SIZE / 2)

    def test_binary_square_renders_interval_as_external_index(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "binary",
                "node-shape": "square",
                "root": "internal-id",
                "nodes": [
                    {"id": "internal-id", "index": "[1, 1]", "value": 3}
                ],
                "edges": [],
            }
        )
        assert isinstance(diagram, TreeDiagram)
        size = _node_size(diagram.nodes, diagram.node_shape)
        self.assertEqual(size.width, size.height)
        svg = render_svg(diagram)
        self.assertRegex(svg, r'font-size="20"[^>]*>3</text>')
        self.assertRegex(svg, r'font-size="12"[^>]*>\[1, 1\]</text>')
        self.assertNotIn(">internal-id</text>", svg)

    def test_rectangle_node_renders_named_fields(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "binary",
                "node-shape": "rectangle",
                "root": "r",
                "nodes": [
                    {"id": "r", "label": "[1, 1]", "fields": {"sum": 3}}
                ],
                "edges": [],
            }
        )
        svg = render_svg(diagram)
        self.assertIn(">[1, 1]</text>", svg)
        self.assertIn(">sum = 3</text>", svg)

    def test_circle_and_square_share_array_typography_and_size(self) -> None:
        source = {
            "schema": "cp-diagram/v2",
            "type": "graph",
            "nodes": [{"id": 1, "value": "A"}],
            "edges": [],
        }
        circle = parse_diagram(source)
        square = parse_diagram({**source, "node-shape": "square"})
        assert isinstance(circle, GraphDiagram)
        assert isinstance(square, GraphDiagram)
        circle_size = _node_size(circle.nodes, circle.node_shape)
        square_size = _node_size(square.nodes, square.node_shape)
        self.assertEqual(circle_size.width, circle_size.height)
        self.assertEqual(square_size.width, square_size.height)
        self.assertEqual(circle_size, square_size)
        svg = render_svg(circle)
        self.assertIn('font-family="Comic Neue, AR PL KaitiM GB', svg)
        self.assertRegex(svg, r'font-size="20"[^>]*>A</text>')
        self.assertRegex(svg, r'font-size="12"[^>]*>1</text>')

    def test_self_loop_and_path_annotation_render_above_base_geometry(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "graph",
                "nodes": [
                    {"id": 1, "value": "A"},
                    {"id": 2, "value": "B"},
                    {"id": 3, "value": "C"},
                ],
                "edges": [
                    {"from": 1, "to": 1, "value": 9},
                    {"from": 1, "to": 2},
                    {"from": 2, "to": 3},
                ],
                "annotations": [
                    {"type": "path", "nodes": [1, 2, 3], "color": "red"}
                ],
            }
        )
        svg = render_svg(diagram)
        self.assertGreaterEqual(svg.count('stroke="#000000"'), 6)
        self.assertIn('stroke="#c43d3d" stroke-width="2.5"', svg)
        self.assertIn(">A</text>", svg)
        self.assertIn(">1</text>", svg)
        self.assertLess(svg.index('stroke="#000000"'), svg.index('stroke="#c43d3d"'))

    def test_self_loop_contributes_two_ports_in_the_free_upper_sector(self) -> None:
        placement = _loop_port_angles([0, pi])
        self.assertGreater(placement.first_port, pi)
        self.assertGreater(placement.second_port, placement.first_port)
        self.assertAlmostEqual(placement.direction, 3 * pi / 2)
        self.assertAlmostEqual(
            placement.first_port - pi,
            placement.second_port - placement.first_port,
        )

    def test_articulation_self_loop_ports_are_exactly_equal_angle(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "graph",
                "nodes": [{"id": index} for index in range(1, 5)],
                "edges": [
                    {"from": 1, "to": 1},
                    {"from": 1, "to": 2},
                    {"from": 1, "to": 3},
                    {"from": 1, "to": 4},
                ],
            }
        )
        assert isinstance(diagram, GraphDiagram)
        size = _node_size(diagram.nodes, diagram.node_shape)
        positions = _balanced_graph_layout(diagram.nodes, diagram.edges, size)
        center = positions["1"]
        angles = [
            atan2(positions[node_id].y - center.y, positions[node_id].x - center.x)
            % (2 * pi)
            for node_id in ("2", "3", "4")
        ]
        loop = _self_loop_placements(diagram.edges, positions)["1"]
        angles.extend([loop.first_port, loop.second_port])
        angles.sort()
        gaps = [
            (angles[(index + 1) % len(angles)] - angle) % (2 * pi)
            for index, angle in enumerate(angles)
        ]
        for gap in gaps:
            self.assertAlmostEqual(gap, 2 * pi / 5)
