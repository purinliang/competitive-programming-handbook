from __future__ import annotations

import unittest

from cp_diagrams.renderers.arrays import _layout_arrows
from cp_diagrams.schema import (
    Arrow,
    DiagramError,
    GraphDiagram,
    MultiArrayDiagram,
    TreeDiagram,
    parse_diagram,
)

class SchemaTest(unittest.TestCase):
    def test_parses_array_annotations(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v1",
                "type": "array",
                "background": "white",
                "label": "a",
                "index": "1-based",
                "cells": [3, 1, 4],
                "annotations": [
                    {"type": "cell", "at": 2, "color": "blue"},
                    {"type": "arrow", "at": 2, "side": "top", "label": "l"},
                    {"type": "range", "from": 1, "to": 3, "label": "sum"},
                ],
            }
        )
        self.assertEqual(diagram.label, "a")
        self.assertEqual(diagram.background, "white")
        self.assertEqual(len(diagram.annotations), 3)

    def test_same_cell_arrows_split_cell_and_gain_length(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v1",
                "type": "array",
                "cells": [1],
                "annotations": [
                    {"type": "arrow", "at": 1},
                    {"type": "arrow", "at": 1},
                    {"type": "arrow", "at": 1, "length": 5},
                ],
            }
        )
        arrows = [
            annotation
            for annotation in diagram.annotations
            if isinstance(annotation, Arrow)
        ]
        self.assertEqual([arrow.length for arrow in arrows], [None, None, 5])
        layouts = _layout_arrows(arrows)
        self.assertEqual([layout.slot for layout in layouts], [0, 1, 2])
        self.assertEqual([layout.slot_count for layout in layouts], [3, 3, 3])
        self.assertEqual([layout.length for layout in layouts], [1, 2, 5])

    def test_rejects_four_arrows_on_same_side_of_cell(self) -> None:
        with self.assertRaisesRegex(DiagramError, "最多允许 3 个"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v1",
                    "type": "array",
                    "cells": [1],
                    "annotations": [
                        {"type": "arrow", "at": 1},
                        {"type": "arrow", "at": 1},
                        {"type": "arrow", "at": 1},
                        {"type": "arrow", "at": 1},
                    ],
                }
            )

    def test_numeric_annotation_label_becomes_text(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v1",
                "type": "array",
                "cells": [1, 2],
                "annotations": [
                    {"type": "range", "from": 1, "to": 2, "label": 11}
                ],
            }
        )
        self.assertEqual(diagram.annotations[0].label, "11")

    def test_rejects_custom_color(self) -> None:
        with self.assertRaisesRegex(DiagramError, "只支持 default"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v1",
                    "type": "array",
                    "cells": [1],
                    "annotations": [
                        {"type": "cell", "at": 1, "color": "#123456"}
                    ],
                }
            )

    def test_rejects_color_inside_cell_data(self) -> None:
        with self.assertRaisesRegex(DiagramError, "只支持字符串或数字"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v1",
                    "type": "array",
                    "cells": [{"value": 1, "color": "red"}],
                }
            )

    def test_rejects_unknown_field(self) -> None:
        with self.assertRaisesRegex(DiagramError, "未知字段"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v1",
                    "type": "array",
                    "cells": [1],
                    "stroke_width": 4,
                }
            )

    def test_rejects_custom_background(self) -> None:
        with self.assertRaisesRegex(DiagramError, "transparent 或 white"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v1",
                    "type": "array",
                    "background": "#ffffff",
                    "cells": [1],
                }
            )

    def test_none_index_uses_one_based_references(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v1",
                "type": "array",
                "index": "none",
                "cells": ["A", "B"],
                "annotations": [{"type": "arrow", "at": 1}],
            }
        )
        self.assertEqual(diagram.annotations[0].position, 0)
        self.assertEqual(diagram.background, "transparent")


class SchemaV2Test(unittest.TestCase):
    def test_parses_aligned_array_rows(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "array",
                "rows": [
                    {"id": "a", "cells": [3, 1, 4]},
                    {"id": "prefix", "cells": [3, 4, 8]},
                ],
            }
        )
        self.assertIsInstance(diagram, MultiArrayDiagram)
        assert isinstance(diagram, MultiArrayDiagram)
        self.assertEqual([row.label for row in diagram.rows], ["a", "prefix"])

    def test_rejects_unaligned_array_rows(self) -> None:
        with self.assertRaisesRegex(DiagramError, "相同数量"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "array",
                    "rows": [
                        {"id": "a", "cells": [1, 2]},
                        {"id": "prefix", "cells": [1]},
                    ],
                }
            )

    def test_projection_array_requires_exactly_two_rows(self) -> None:
        with self.assertRaisesRegex(DiagramError, "恰好包含两行"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "array",
                    "layout": "projection",
                    "rows": [{"id": "prefix", "cells": [1, 3]}],
                }
            )

    def test_parses_graph_node_and_edge_values(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "graph",
                "directed": True,
                "nodes": [{"id": 1, "value": 7}, {"id": 2, "value": 9}],
                "edges": [{"from": 1, "to": 2, "value": 4}],
            }
        )
        self.assertIsInstance(diagram, GraphDiagram)
        assert isinstance(diagram, GraphDiagram)
        self.assertEqual(diagram.nodes[0].id, "1")
        self.assertEqual(diagram.nodes[0].value, "7")
        self.assertEqual(diagram.edges[0].value, "4")
        self.assertTrue(diagram.directed)

    def test_circle_rejects_multi_field_nodes(self) -> None:
        with self.assertRaisesRegex(DiagramError, "rectangle"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "graph",
                    "nodes": [{"id": 1, "fields": {"sum": 3}}],
                    "edges": [],
                }
            )

    def test_binary_tree_requires_explicit_sides(self) -> None:
        with self.assertRaisesRegex(DiagramError, "left 或 right"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "tree",
                    "layout": "binary",
                    "root": "r",
                    "nodes": [{"id": "r"}, {"id": "x"}],
                    "edges": [{"from": "r", "to": "x"}],
                }
            )

    def test_fenwick_tree_derives_lowbit_edges(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "tree",
                "layout": "fenwick",
                "nodes": [{"id": index} for index in range(1, 9)],
            }
        )
        self.assertIsInstance(diagram, TreeDiagram)
        assert isinstance(diagram, TreeDiagram)
        pairs = {(edge.source, edge.target) for edge in diagram.edges}
        self.assertEqual(
            pairs,
            {
                ("1", "2"),
                ("2", "4"),
                ("3", "4"),
                ("4", "8"),
                ("5", "6"),
                ("6", "8"),
                ("7", "8"),
            },
        )
        self.assertEqual(
            [node.index for node in diagram.nodes],
            [str(i) for i in range(1, 9)],
        )
        self.assertTrue(all(node.label is None for node in diagram.nodes))

    def test_fenwick_accepts_aligned_source_array(self) -> None:
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
        assert diagram.source_array is not None
        self.assertEqual(
            [cell.value for cell in diagram.source_array.cells],
            [3, 1, 4, 1],
        )

    def test_interval_fenwick_derives_lowbit_intervals(self) -> None:
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
        self.assertEqual(
            [node.interval for node in diagram.nodes],
            [(1, 1), (1, 2), (3, 3), (1, 4)],
        )

    def test_interval_binary_requires_contiguous_partition(self) -> None:
        with self.assertRaisesRegex(DiagramError, "连续划分"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "tree",
                    "layout": "binary",
                    "node-width": "interval",
                    "root": "r",
                    "source-array": [1, 2],
                    "nodes": [
                        {"id": "r", "interval": [1, 2], "value": 3},
                        {"id": "l", "interval": [1, 1], "value": 1},
                        {"id": "q", "interval": [1, 1], "value": 1},
                    ],
                    "edges": [
                        {"from": "r", "to": "l", "side": "left"},
                        {"from": "r", "to": "q", "side": "right"},
                    ],
                }
            )

    def test_fenwick_rejects_source_array_with_wrong_leaf_value(self) -> None:
        with self.assertRaisesRegex(DiagramError, "叶节点 3"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "tree",
                    "layout": "fenwick",
                    "source-array": [3, 1, 8, 1],
                    "nodes": [
                        {"id": 1, "value": 3},
                        {"id": 2, "value": 4},
                        {"id": 3, "value": 4},
                        {"id": 4, "value": 9},
                    ],
                }
            )

    def test_fenwick_rejects_source_array_with_wrong_length(self) -> None:
        with self.assertRaisesRegex(DiagramError, "恰好包含 2 个格子"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "tree",
                    "layout": "fenwick",
                    "source-array": [3],
                    "nodes": [{"id": 1, "value": 3}, {"id": 2, "value": 4}],
                }
            )

    def test_non_fenwick_tree_rejects_source_array(self) -> None:
        with self.assertRaisesRegex(DiagramError, "只支持 fenwick"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "tree",
                    "layout": "rooted",
                    "root": 1,
                    "source-array": [3],
                    "nodes": [{"id": 1}],
                    "edges": [],
                }
            )

    def test_graph_accepts_self_loop_and_path_annotation(self) -> None:
        diagram = parse_diagram(
            {
                "schema": "cp-diagram/v2",
                "type": "graph",
                "nodes": [{"id": 1}, {"id": 2}, {"id": 3}],
                "edges": [
                    {"from": 1, "to": 1},
                    {"from": 1, "to": 2},
                    {"from": 2, "to": 3},
                    {"from": 3, "to": 1},
                ],
                "annotations": [
                    {"type": "path", "nodes": [1, 2, 3], "closed": True}
                ],
            }
        )
        assert isinstance(diagram, GraphDiagram)
        self.assertEqual(diagram.edges[0].source, diagram.edges[0].target)
        self.assertTrue(diagram.annotations[0].closed)
        self.assertEqual(diagram.annotations[0].color, "red")

    def test_rejects_annotation_that_is_not_a_graph_path(self) -> None:
        with self.assertRaisesRegex(DiagramError, "不存在边"):
            parse_diagram(
                {
                    "schema": "cp-diagram/v2",
                    "type": "graph",
                    "nodes": [{"id": 1}, {"id": 2}, {"id": 3}],
                    "edges": [{"from": 1, "to": 2}],
                    "annotations": [{"type": "path", "nodes": [1, 3]}],
                }
            )
