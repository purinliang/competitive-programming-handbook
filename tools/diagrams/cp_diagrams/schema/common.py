from __future__ import annotations

from typing import Any, Iterable

from ..models import Cell
from .errors import DiagramError


COLORS = {"default", "red", "blue", "green"}
INDEX_MODES = {"0-based", "1-based", "none"}
BACKGROUNDS = {"transparent", "white"}
NODE_SHAPES = {"circle", "square", "rectangle"}


def cell(item: Any, position: int, prefix: str = "cells") -> Cell:
    path = f"{prefix}[{position}]"
    if is_scalar(item):
        return Cell(value=item)
    raise DiagramError(f"{path}: 只支持字符串或数字")


def reference(value: Any, index_mode: str, cell_count: int, path: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise DiagramError(f"{path}: 必须是整数")

    base = 0 if index_mode == "0-based" else 1
    position = value - base
    if not 0 <= position < cell_count:
        upper = base + cell_count - 1
        raise DiagramError(f"{path}: {value} 超出 [{base}, {upper}]")
    return position


def mapping(value: Any, path: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise DiagramError(f"{path}: 必须是映射")
    return value


def fields(
    value: dict[str, Any], *, allowed: set[str], required: set[str], path: str
) -> None:
    unknown = set(value) - allowed
    if unknown:
        names = ", ".join(sorted(unknown))
        raise DiagramError(f"{path}: 未知字段 {names}")
    missing = required - set(value)
    if missing:
        names = ", ".join(sorted(missing))
        raise DiagramError(f"{path}: 缺少字段 {names}")


def string(value: Any, path: str) -> str:
    if not isinstance(value, str):
        raise DiagramError(f"{path}: 必须是字符串")
    return value


def identifier(value: Any, path: str) -> str:
    if not isinstance(value, (str, int)) or isinstance(value, bool):
        raise DiagramError(f"{path}: 必须是字符串或整数")
    result = str(value)
    if not result:
        raise DiagramError(f"{path}: 不能为空")
    return result


def positive_node_id(value: str) -> int:
    try:
        number = int(value)
    except ValueError as error:
        raise DiagramError("nodes: fenwick 布局的 id 必须是正整数") from error
    if str(number) != value or number <= 0:
        raise DiagramError("nodes: fenwick 布局的 id 必须是正整数")
    return number


def label(value: Any, path: str) -> str:
    if not is_scalar(value):
        raise DiagramError(f"{path}: 必须是字符串或数字")
    return str(value)


def color(value: Any, path: str) -> str:
    if value not in COLORS:
        raise DiagramError(f"{path}: 只支持 default、red、blue 或 green")
    return value


def background(value: Any) -> str:
    if value not in BACKGROUNDS:
        raise DiagramError("background: 只支持 transparent 或 white")
    return value


def index_mode(value: Any) -> str:
    if value not in INDEX_MODES:
        raise DiagramError("index: 只支持 0-based、1-based 或 none")
    return value


def node_shape(value: Any) -> str:
    if value not in NODE_SHAPES:
        raise DiagramError("node-shape: 只支持 circle、square 或 rectangle")
    return value


def boolean(value: Any, path: str) -> bool:
    if not isinstance(value, bool):
        raise DiagramError(f"{path}: 必须是布尔值")
    return value


def unique(values: Iterable[str], message: str) -> None:
    seen: set[str] = set()
    for value in values:
        if value in seen:
            raise DiagramError(message)
        seen.add(value)


def is_scalar(value: Any) -> bool:
    return isinstance(value, (str, int, float)) and not isinstance(value, bool)
