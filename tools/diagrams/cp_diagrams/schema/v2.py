from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any

from ..models import (
    AnyDiagram,
    ArrayRow,
    Edge,
    GraphDiagram,
    MultiArrayDiagram,
    Node,
    PathHighlight,
    SourceArray,
    TreeDiagram,
)
from .common import (
    background as _background,
    boolean as _boolean,
    cell as _cell,
    color as _color,
    fields as _fields,
    identifier as _identifier,
    index_mode as _index_mode,
    label as _label,
    mapping as _mapping,
    node_shape as _node_shape,
    positive_node_id as _positive_node_id,
    string as _string,
    unique as _unique,
)
from .errors import DiagramError

def parse_v2(root: dict[str, Any]) -> AnyDiagram:
    kind = root.get("type")
    if kind == "array":
        return _parse_v2_array(root)
    if kind == "graph":
        return _parse_v2_graph(root)
    if kind == "tree":
        return _parse_v2_tree(root)
    raise DiagramError("type: cp-diagram/v2 只支持 array、graph 或 tree")


def _parse_v2_array(root: dict[str, Any]) -> MultiArrayDiagram:
    _fields(
        root,
        allowed={"schema", "type", "background", "index", "layout", "rows"},
        required={"schema", "type", "rows"},
        path="<root>",
    )
    background = _background(root.get("background", "transparent"))
    index = _index_mode(root.get("index", "1-based"))
    layout = root.get("layout", "stacked")
    if layout not in {"stacked", "projection"}:
        raise DiagramError("layout: array 只支持 stacked 或 projection")
    raw_rows = root["rows"]
    if not isinstance(raw_rows, list) or not raw_rows:
        raise DiagramError("rows: 必须是非空列表")

    rows = tuple(_array_row(item, i) for i, item in enumerate(raw_rows))
    _unique((row.id for row in rows), "rows: id 不能重复")
    cell_counts = {len(row.cells) for row in rows}
    if len(cell_counts) != 1:
        raise DiagramError("rows: 所有行必须具有相同数量的格子")
    if layout == "projection" and len(rows) != 2:
        raise DiagramError("rows: projection 布局必须恰好包含两行")
    return MultiArrayDiagram(
        background=background,
        index=index,
        layout=layout,
        rows=rows,
    )


def _array_row(item: Any, position: int) -> ArrayRow:
    path = f"rows[{position}]"
    row = _mapping(item, path)
    _fields(
        row,
        allowed={"id", "label", "cells"},
        required={"id", "cells"},
        path=path,
    )
    row_id = _identifier(row["id"], f"{path}.id")
    label = row.get("label", row_id)
    label = _string(label, f"{path}.label")
    raw_cells = row["cells"]
    if not isinstance(raw_cells, list) or not raw_cells:
        raise DiagramError(f"{path}.cells: 必须是非空列表")
    cells = tuple(_cell(value, i, f"{path}.cells") for i, value in enumerate(raw_cells))
    return ArrayRow(id=row_id, label=label, cells=cells)


def _parse_v2_graph(root: dict[str, Any]) -> GraphDiagram:
    _fields(
        root,
        allowed={
            "schema",
            "type",
            "background",
            "directed",
            "layout",
            "node-shape",
            "nodes",
            "edges",
            "annotations",
        },
        required={"schema", "type", "nodes", "edges"},
        path="<root>",
    )
    background = _background(root.get("background", "transparent"))
    directed = _boolean(root.get("directed", False), "directed")
    layout = root.get("layout", "balanced")
    if layout != "balanced":
        raise DiagramError("layout: graph 目前只支持 balanced")
    node_shape = _node_shape(root.get("node-shape", "circle"))
    nodes = _nodes(root["nodes"])
    if any(node.interval is not None for node in nodes):
        raise DiagramError("nodes: interval 只支持区间宽度的树")
    _validate_node_shape(nodes, node_shape)
    edges = _edges(root["edges"], allow_side=False, allow_directed=True)
    _validate_edges(nodes, edges, directed=directed)
    annotations = _path_annotations(
        root.get("annotations", []), nodes, edges, directed=directed
    )
    return GraphDiagram(
        background=background,
        directed=directed,
        layout=layout,
        node_shape=node_shape,
        nodes=nodes,
        edges=edges,
        annotations=annotations,
    )


def _parse_v2_tree(root: dict[str, Any]) -> TreeDiagram:
    _fields(
        root,
        allowed={
            "schema",
            "type",
            "background",
            "directed",
            "layout",
            "node-shape",
            "node-width",
            "root",
            "nodes",
            "edges",
            "annotations",
            "source-array",
        },
        required={"schema", "type", "layout", "nodes"},
        path="<root>",
    )
    layout = root["layout"]
    if layout not in {"rooted", "binary", "fenwick"}:
        raise DiagramError("layout: tree 只支持 rooted、binary 或 fenwick")
    background = _background(root.get("background", "transparent"))
    directed = _boolean(root.get("directed", False), "directed")
    default_shape = "circle" if layout == "rooted" else "rectangle"
    node_shape = _node_shape(root.get("node-shape", default_shape))
    node_width = root.get("node-width", "uniform")
    if node_width not in {"uniform", "interval"}:
        raise DiagramError("node-width: 只支持 uniform 或 interval")
    if node_width == "interval" and layout not in {"binary", "fenwick"}:
        raise DiagramError("node-width: interval 只支持 binary 或 fenwick 布局")
    if node_width == "interval" and node_shape != "rectangle":
        raise DiagramError("node-width: interval 必须使用 rectangle 节点")
    nodes = _nodes(root["nodes"])
    _validate_node_shape(nodes, node_shape)

    if layout == "fenwick":
        if "root" in root:
            raise DiagramError("root: fenwick 布局会自动确定根，不接受 root")
        if "edges" in root:
            raise DiagramError("edges: fenwick 布局会根据 lowbit 自动生成边")
        numeric_ids = [_positive_node_id(node.id) for node in nodes]
        if sorted(numeric_ids) != list(range(1, len(nodes) + 1)):
            raise DiagramError("nodes: fenwick 布局要求 id 恰好是连续整数 1..n")
        by_index = {int(node.id): node for node in nodes}
        ordered_nodes = tuple(by_index[index] for index in range(1, len(nodes) + 1))
        if any(node.label is not None or node.index is not None for node in ordered_nodes):
            raise DiagramError(
                "nodes: fenwick 布局自动显示数组下标，不接受 label 或 index"
            )
        if any(node.interval is not None for node in ordered_nodes):
            raise DiagramError("nodes: fenwick 布局会根据 lowbit 自动确定 interval")
        nodes = tuple(
            Node(
                id=node.id,
                label=None,
                index=node.id,
                value=node.value,
                fields=node.fields,
                interval=(
                    index - (index & -index) + 1,
                    index,
                )
                if node_width == "interval"
                else None,
            )
            for index, node in enumerate(ordered_nodes, start=1)
        )
        source_array = _source_array(root.get("source-array"), len(nodes))
        if node_width == "interval" and source_array is None:
            raise DiagramError("node-width: interval 必须同时提供 source-array")
        if source_array is not None:
            for index, node in enumerate(nodes, start=1):
                source_value = str(source_array.cells[index - 1].value)
                if index & 1 and node.value != source_value:
                    raise DiagramError(
                        f"source-array[{index - 1}]: "
                        f"必须等于叶节点 {index} 的 value"
                    )
        edges = tuple(
            Edge(source=str(index), target=str(index + (index & -index)), value=None)
            for index in range(1, len(nodes) + 1)
            if index + (index & -index) <= len(nodes)
        )
        annotations = _path_annotations(
            root.get("annotations", []), nodes, edges, directed=directed
        )
        return TreeDiagram(
            background=background,
            directed=directed,
            layout=layout,
            node_shape=node_shape,
            node_width=node_width,
            root=None,
            nodes=nodes,
            edges=edges,
            annotations=annotations,
            source_array=source_array,
        )

    if "root" not in root:
        raise DiagramError("root: rooted 和 binary 布局必须指定根节点")
    if "edges" not in root:
        raise DiagramError("edges: rooted 和 binary 布局必须指定边")
    root_id = _identifier(root["root"], "root")
    edges = _edges(
        root["edges"], allow_side=layout == "binary", allow_directed=False
    )
    _validate_tree(nodes, edges, root_id, layout)
    source_array: SourceArray | None = None
    if node_width == "interval":
        if any(node.interval is None for node in nodes):
            raise DiagramError(
                "nodes: node-width 为 interval 时每个节点都必须提供 interval"
            )
        root_node = next(node for node in nodes if node.id == root_id)
        assert root_node.interval is not None
        if root_node.interval[0] != 1:
            raise DiagramError("nodes: 根节点 interval 必须从 1 开始")
        source_array = _source_array(
            root.get("source-array"), root_node.interval[1]
        )
        if source_array is None:
            raise DiagramError("node-width: interval 必须同时提供 source-array")
        _validate_binary_intervals(nodes, edges, root_id, len(source_array.cells))
    else:
        if any(node.interval is not None for node in nodes):
            raise DiagramError("nodes: interval 需要同时设置 node-width: interval")
        if "source-array" in root:
            if layout == "rooted":
                raise DiagramError("source-array: 目前只支持 fenwick 布局")
            raise DiagramError(
                "source-array: binary 布局只在 node-width 为 interval 时支持"
            )
    annotations = _path_annotations(
        root.get("annotations", []), nodes, edges, directed=directed
    )
    return TreeDiagram(
        background=background,
        directed=directed,
        layout=layout,
        node_shape=node_shape,
        node_width=node_width,
        root=root_id,
        nodes=nodes,
        edges=edges,
        annotations=annotations,
        source_array=source_array,
    )


def _source_array(value: Any, node_count: int) -> SourceArray | None:
    if value is None:
        return None
    if not isinstance(value, list) or len(value) != node_count:
        raise DiagramError(
            f"source-array: 必须恰好包含 {node_count} 个格子"
        )
    cells = tuple(
        _cell(cell, index, "source-array") for index, cell in enumerate(value)
    )
    return SourceArray(cells=cells)


def _nodes(value: Any) -> tuple[Node, ...]:
    if not isinstance(value, list) or not value:
        raise DiagramError("nodes: 必须是非空列表")
    nodes = tuple(_node(item, i) for i, item in enumerate(value))
    _unique((node.id for node in nodes), "nodes: id 不能重复")
    return nodes


def _node(item: Any, position: int) -> Node:
    path = f"nodes[{position}]"
    node = _mapping(item, path)
    _fields(
        node,
        allowed={"id", "label", "index", "value", "fields", "interval"},
        required={"id"},
        path=path,
    )
    node_id = _identifier(node["id"], f"{path}.id")
    label = node.get("label")
    if label is not None:
        label = _label(label, f"{path}.label")
    index = node.get("index")
    if index is not None:
        index = _label(index, f"{path}.index")
    interval = _node_interval(node.get("interval"), f"{path}.interval")
    if interval is not None:
        if index is not None:
            raise DiagramError(f"{path}: interval 与 index 不能同时提供")
    value = node.get("value")
    if value is not None:
        value = _label(value, f"{path}.value")

    raw_fields = node.get("fields", {})
    if not isinstance(raw_fields, dict):
        raise DiagramError(f"{path}.fields: 必须是映射")
    fields: list[tuple[str, str]] = []
    for key, field_value in raw_fields.items():
        if not isinstance(key, str) or not key:
            raise DiagramError(f"{path}.fields: 字段名必须是非空字符串")
        fields.append((key, _label(field_value, f"{path}.fields.{key}")))
    return Node(
        id=node_id,
        label=label,
        index=index,
        value=value,
        fields=tuple(fields),
        interval=interval,
    )


def _node_interval(value: Any, path: str) -> tuple[int, int] | None:
    if value is None:
        return None
    if (
        not isinstance(value, list)
        or len(value) != 2
        or any(isinstance(item, bool) or not isinstance(item, int) for item in value)
    ):
        raise DiagramError(f"{path}: 必须是两个正整数 [l, r]")
    left, right = value
    if left <= 0 or right < left:
        raise DiagramError(f"{path}: 必须满足 1 <= l <= r")
    return left, right


def _edges(
    value: Any, *, allow_side: bool, allow_directed: bool
) -> tuple[Edge, ...]:
    if not isinstance(value, list):
        raise DiagramError("edges: 必须是列表")
    return tuple(
        _edge(
            item,
            i,
            allow_side=allow_side,
            allow_directed=allow_directed,
        )
        for i, item in enumerate(value)
    )


def _edge(
    item: Any, position: int, *, allow_side: bool, allow_directed: bool
) -> Edge:
    path = f"edges[{position}]"
    edge = _mapping(item, path)
    allowed = {"from", "to", "value"}
    if allow_side:
        allowed.add("side")
    if allow_directed:
        allowed.add("directed")
    _fields(edge, allowed=allowed, required={"from", "to"}, path=path)
    source = _identifier(edge["from"], f"{path}.from")
    target = _identifier(edge["to"], f"{path}.to")
    value = edge.get("value")
    if value is not None:
        value = _label(value, f"{path}.value")
    side = edge.get("side")
    if allow_side:
        if side not in {"left", "right"}:
            raise DiagramError(f"{path}.side: binary 布局必须明确写 left 或 right")
    edge_directed = edge.get("directed")
    if edge_directed is not None:
        edge_directed = _boolean(edge_directed, f"{path}.directed")
    return Edge(
        source=source,
        target=target,
        value=value,
        side=side,
        directed=edge_directed,
    )


def _validate_node_shape(nodes: tuple[Node, ...], node_shape: str) -> None:
    if node_shape != "rectangle" and any(node.fields for node in nodes):
        raise DiagramError("node-shape: 含 fields 的节点必须使用 rectangle")


def _validate_edges(
    nodes: tuple[Node, ...], edges: tuple[Edge, ...], *, directed: bool
) -> None:
    node_ids = {node.id for node in nodes}
    seen: set[tuple[str, str, str]] = set()
    for position, edge in enumerate(edges):
        if edge.source not in node_ids:
            raise DiagramError(f"edges[{position}].from: 未找到节点 {edge.source}")
        if edge.target not in node_ids:
            raise DiagramError(f"edges[{position}].to: 未找到节点 {edge.target}")
        edge_directed = directed if edge.directed is None else edge.directed
        if edge_directed:
            key = ("directed", edge.source, edge.target)
        else:
            left, right = sorted((edge.source, edge.target))
            key = ("undirected", left, right)
        if key in seen:
            raise DiagramError(f"edges[{position}]: 不允许重复边")
        seen.add(key)


def _path_annotations(
    value: Any,
    nodes: tuple[Node, ...],
    edges: tuple[Edge, ...],
    *,
    directed: bool,
) -> tuple[PathHighlight, ...]:
    if not isinstance(value, list):
        raise DiagramError("annotations: 必须是列表")
    node_ids = {node.id for node in nodes}
    result: list[PathHighlight] = []
    for position, item in enumerate(value):
        path = f"annotations[{position}]"
        annotation = _mapping(item, path)
        _fields(
            annotation,
            allowed={"type", "nodes", "closed", "color"},
            required={"type", "nodes"},
            path=path,
        )
        if annotation["type"] != "path":
            raise DiagramError(f"{path}.type: v2 目前只支持 path")
        raw_nodes = annotation["nodes"]
        if not isinstance(raw_nodes, list) or len(raw_nodes) < 2:
            raise DiagramError(f"{path}.nodes: 必须至少包含两个节点")
        route = tuple(
            _identifier(node_id, f"{path}.nodes[{index}]")
            for index, node_id in enumerate(raw_nodes)
        )
        for node_id in route:
            if node_id not in node_ids:
                raise DiagramError(f"{path}.nodes: 未找到节点 {node_id}")
        closed = _boolean(annotation.get("closed", False), f"{path}.closed")
        if closed and len(route) < 3:
            raise DiagramError(f"{path}.nodes: 回路必须至少包含三个节点")
        if closed and route[0] == route[-1]:
            raise DiagramError(f"{path}.nodes: closed 回路不重复书写起点")
        pairs = list(zip(route, route[1:]))
        if closed:
            pairs.append((route[-1], route[0]))
        for source, target in pairs:
            if not any(
                _edge_matches(edge, source, target, directed=directed)
                for edge in edges
            ):
                raise DiagramError(f"{path}: 路径中不存在边 {source} -> {target}")
        color = _color(annotation.get("color", "red"), f"{path}.color")
        result.append(PathHighlight(nodes=route, closed=closed, color=color))
    return tuple(result)


def _edge_matches(
    edge: Edge, source: str, target: str, *, directed: bool
) -> bool:
    edge_directed = directed if edge.directed is None else edge.directed
    if edge.source == source and edge.target == target:
        return True
    return (
        not edge_directed
        and edge.source == target
        and edge.target == source
    )


def _validate_tree(
    nodes: tuple[Node, ...], edges: tuple[Edge, ...], root: str, layout: str
) -> None:
    _validate_edges(nodes, edges, directed=True)
    node_ids = {node.id for node in nodes}
    if root not in node_ids:
        raise DiagramError(f"root: 未找到节点 {root}")
    if len(edges) != len(nodes) - 1:
        raise DiagramError("edges: 树必须恰好包含 n - 1 条边")

    indegree = Counter(edge.target for edge in edges)
    if indegree[root] != 0:
        raise DiagramError("root: 根节点不能有父节点")
    for node_id in node_ids - {root}:
        if indegree[node_id] != 1:
            raise DiagramError(f"nodes: 非根节点 {node_id} 必须恰好有一个父节点")

    children: defaultdict[str, list[str]] = defaultdict(list)
    for edge in edges:
        children[edge.source].append(edge.target)
    visited: set[str] = set()

    def visit(node_id: str) -> None:
        if node_id in visited:
            raise DiagramError("edges: 树中不能出现环")
        visited.add(node_id)
        for child in children[node_id]:
            visit(child)

    visit(root)
    if visited != node_ids:
        raise DiagramError("edges: 所有节点都必须从 root 可达")

    if layout == "rooted":
        if any(edge.side is not None for edge in edges):
            raise DiagramError("edges: rooted 布局不接受 side")
        return

    sides: defaultdict[str, set[str]] = defaultdict(set)
    for position, edge in enumerate(edges):
        assert edge.side is not None
        if edge.side in sides[edge.source]:
            raise DiagramError(
                f"edges[{position}].side: 同一父节点的 {edge.side} 子节点不能重复"
            )
        sides[edge.source].add(edge.side)


def _validate_binary_intervals(
    nodes: tuple[Node, ...],
    edges: tuple[Edge, ...],
    root: str,
    source_count: int,
) -> None:
    by_id = {node.id: node for node in nodes}
    root_interval = by_id[root].interval
    assert root_interval is not None
    if root_interval != (1, source_count):
        raise DiagramError(
            f"nodes: 根节点 interval 必须是 [1, {source_count}]"
        )

    children: defaultdict[str, dict[str, str]] = defaultdict(dict)
    for edge in edges:
        assert edge.side is not None
        children[edge.source][edge.side] = edge.target

    for node in nodes:
        assert node.interval is not None
        left, right = node.interval
        if right > source_count:
            raise DiagramError(
                f"nodes: 节点 {node.id} 的 interval 超出 [1, {source_count}]"
            )
        node_children = children[node.id]
        if not node_children:
            if left != right:
                raise DiagramError(
                    f"nodes: 非单点区间 {node.id} 必须继续划分"
                )
            continue
        if set(node_children) != {"left", "right"}:
            raise DiagramError(
                f"nodes: 非叶节点 {node.id} 必须同时有左右孩子"
            )
        left_interval = by_id[node_children["left"]].interval
        right_interval = by_id[node_children["right"]].interval
        assert left_interval is not None and right_interval is not None
        if (
            left_interval[0] != left
            or right_interval[1] != right
            or left_interval[1] + 1 != right_interval[0]
        ):
            raise DiagramError(
                f"nodes: {node.id} 的左右 interval 必须连续划分父区间"
            )
