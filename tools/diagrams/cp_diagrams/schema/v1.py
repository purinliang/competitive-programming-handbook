from __future__ import annotations

from collections import Counter
from typing import Any

from ..models import Annotation, Arrow, CellHighlight, Diagram, Range
from .common import (
    background as _background,
    cell as _cell,
    color as _color,
    fields as _fields,
    label as _label,
    mapping as _mapping,
    index_mode as _index_mode,
    reference as _reference,
    string as _string,
)
from .errors import DiagramError

def parse_v1(root: dict[str, Any]) -> Diagram:
    _fields(
        root,
        allowed={
            "schema",
            "type",
            "background",
            "label",
            "index",
            "cells",
            "annotations",
        },
        required={"schema", "type", "cells"},
        path="<root>",
    )
    if root["type"] != "array":
        raise DiagramError("type: cp-diagram/v1 目前只支持 array")

    background = _background(root.get("background", "transparent"))
    label = root.get("label")
    if label is not None:
        label = _string(label, "label")
    index = _index_mode(root.get("index", "1-based"))

    raw_cells = root["cells"]
    if not isinstance(raw_cells, list) or not raw_cells:
        raise DiagramError("cells: 必须是非空列表")
    cells = tuple(_cell(item, i) for i, item in enumerate(raw_cells))

    raw_annotations = root.get("annotations", [])
    if not isinstance(raw_annotations, list):
        raise DiagramError("annotations: 必须是列表")
    annotations = tuple(
        _annotation(item, i, index, len(cells))
        for i, item in enumerate(raw_annotations)
    )
    arrow_groups = Counter(
        (annotation.side, annotation.position)
        for annotation in annotations
        if isinstance(annotation, Arrow)
    )
    if any(count > 3 for count in arrow_groups.values()):
        raise DiagramError("annotations: 同一侧指向同一格子的 arrow 最多允许 3 个")

    return Diagram(
        background=background,
        label=label,
        index=index,
        cells=cells,
        annotations=annotations,
    )


def _annotation(
    item: Any, position: int, index_mode: str, cell_count: int
) -> Annotation:
    path = f"annotations[{position}]"
    annotation = _mapping(item, path)
    kind = annotation.get("type")

    if kind == "cell":
        _fields(
            annotation,
            allowed={"type", "at", "color"},
            required={"type", "at", "color"},
            path=path,
        )
        at = _reference(annotation["at"], index_mode, cell_count, f"{path}.at")
        color = _color(annotation["color"], f"{path}.color")
        return CellHighlight(position=at, color=color)

    if kind == "arrow":
        _fields(
            annotation,
            allowed={"type", "at", "side", "length", "label", "color"},
            required={"type", "at"},
            path=path,
        )
        at = _reference(annotation["at"], index_mode, cell_count, f"{path}.at")
        side = annotation.get("side", "top")
        if side not in {"top", "bottom"}:
            raise DiagramError(f"{path}.side: 只支持 top 或 bottom")
        length = annotation.get("length")
        if length is not None:
            if not isinstance(length, int) or isinstance(length, bool) or length <= 0:
                raise DiagramError(f"{path}.length: 必须是正整数")
        label = annotation.get("label")
        if label is not None:
            label = _label(label, f"{path}.label")
        color = _color(annotation.get("color", "default"), f"{path}.color")
        return Arrow(
            position=at,
            side=side,
            length=length,
            label=label,
            color=color,
        )

    if kind == "range":
        _fields(
            annotation,
            allowed={"type", "from", "to", "label", "color"},
            required={"type", "from", "to"},
            path=path,
        )
        start = _reference(annotation["from"], index_mode, cell_count, f"{path}.from")
        end = _reference(annotation["to"], index_mode, cell_count, f"{path}.to")
        if start > end:
            raise DiagramError(f"{path}: from 不能大于 to")
        label = annotation.get("label")
        if label is not None:
            label = _label(label, f"{path}.label")
        color = _color(annotation.get("color", "default"), f"{path}.color")
        return Range(start=start, end=end, label=label, color=color)

    raise DiagramError(f"{path}.type: 只支持 cell、arrow 或 range")
