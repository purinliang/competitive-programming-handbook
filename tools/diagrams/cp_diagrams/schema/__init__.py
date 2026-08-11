from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from ..models import (
    Annotation,
    AnyDiagram,
    ArrayRow,
    Arrow,
    Cell,
    CellHighlight,
    Diagram,
    Edge,
    GraphDiagram,
    MultiArrayDiagram,
    Node,
    PathHighlight,
    Range,
    SourceArray,
    TreeDiagram,
)
from .common import mapping
from .errors import DiagramError
from .v1 import parse_v1
from .v2 import parse_v2


def load_diagram(path: str | Path) -> AnyDiagram:
    source = Path(path)
    try:
        document = yaml.safe_load(source.read_text(encoding="utf-8"))
    except OSError as error:
        raise DiagramError(f"无法读取 {source}: {error}") from error
    except yaml.YAMLError as error:
        raise DiagramError(f"YAML 解析失败: {error}") from error
    return parse_diagram(document)


def parse_diagram(document: Any) -> AnyDiagram:
    root = mapping(document, "<root>")
    schema = root.get("schema")
    if schema == "cp-diagram/v1":
        return parse_v1(root)
    if schema == "cp-diagram/v2":
        return parse_v2(root)
    raise DiagramError("schema: 必须是 cp-diagram/v1 或 cp-diagram/v2")


__all__ = [
    "Annotation",
    "AnyDiagram",
    "ArrayRow",
    "Arrow",
    "Cell",
    "CellHighlight",
    "Diagram",
    "DiagramError",
    "Edge",
    "GraphDiagram",
    "MultiArrayDiagram",
    "Node",
    "PathHighlight",
    "Range",
    "SourceArray",
    "TreeDiagram",
    "load_diagram",
    "parse_diagram",
]
