from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .render import render_file
from .schema import DiagramError, load_diagram


def main(argv: list[str] | None = None) -> int:
    parser = _parser()
    args = parser.parse_args(argv)
    try:
        diagram = load_diagram(args.input)
        if args.command == "validate":
            print(f"valid: {args.input}")
            return 0

        output = Path(args.output)
        if output.suffix.lower() != ".svg":
            raise DiagramError("output: cp-diagram 目前只输出 .svg")
        if output.exists() and not args.force:
            raise DiagramError(f"{output} 已存在；使用 --force 覆盖")
        render_file(diagram, output)
        print(f"rendered: {output}")
        return 0
    except DiagramError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="cp-diagrams")
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate = subparsers.add_parser("validate", help="校验 YAML，不生成图片")
    validate.add_argument("input")

    render = subparsers.add_parser("render", help="把 YAML 渲染成 SVG")
    render.add_argument("input")
    render.add_argument("--output", "-o", required=True)
    render.add_argument("--force", action="store_true")
    return parser
