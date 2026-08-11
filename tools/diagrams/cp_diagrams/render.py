from __future__ import annotations

from pathlib import Path

from .models import AnyDiagram, Diagram, GraphDiagram, MultiArrayDiagram, TreeDiagram
from .renderers.arrays import render_multi_array, render_v1_array
from .renderers.graphs import render_graph
from .renderers.interval_trees import render_interval_tree
from .renderers.trees import render_tree


def render_svg(diagram: AnyDiagram) -> str:
    if isinstance(diagram, Diagram):
        return render_v1_array(diagram)
    if isinstance(diagram, MultiArrayDiagram):
        return render_multi_array(diagram)
    if isinstance(diagram, GraphDiagram):
        return render_graph(diagram)
    if isinstance(diagram, TreeDiagram):
        if diagram.node_width == "interval":
            return render_interval_tree(diagram)
        return render_tree(diagram)
    raise TypeError(f"unsupported diagram: {type(diagram)!r}")


def render_file(diagram: AnyDiagram, output: str | Path) -> None:
    target = Path(output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render_svg(diagram), encoding="utf-8")


__all__ = ["render_file", "render_svg"]
