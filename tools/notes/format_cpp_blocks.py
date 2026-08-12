#!/usr/bin/env python3
"""Format fenced C++ blocks in Markdown with the repository clang-format config."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import subprocess
import sys


OPEN_FENCE = re.compile(r"^\s*```(?:cpp|c\+\+)\s*$", re.IGNORECASE)
CLOSE_FENCE = re.compile(r"^\s*```\s*$")


def format_cpp(code: str, source: Path) -> str:
    result = subprocess.run(
        ["clang-format", f"--assume-filename={source.with_suffix('.cpp')}"],
        input=code,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "clang-format failed")
    return result.stdout


def format_markdown(path: Path) -> str:
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    output: list[str] = []
    block: list[str] = []
    in_cpp = False

    for line_number, line in enumerate(lines, start=1):
        stripped = line.rstrip("\r\n")
        if not in_cpp:
            output.append(line)
            if OPEN_FENCE.fullmatch(stripped):
                in_cpp = True
                block = []
            continue

        if CLOSE_FENCE.fullmatch(stripped):
            output.append(format_cpp("".join(block), path))
            output.append(line)
            in_cpp = False
            block = []
        else:
            block.append(line)

    if in_cpp:
        raise RuntimeError(f"unclosed C++ fence after line {line_number}")
    return "".join(output)


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args()

    changed: list[Path] = []
    errors: list[str] = []
    for path in args.paths:
        try:
            original = path.read_text(encoding="utf-8")
            formatted = format_markdown(path)
        except (OSError, RuntimeError) as exc:
            errors.append(f"{path}: {exc}")
            continue
        if formatted == original:
            continue
        changed.append(path)
        if args.write:
            path.write_text(formatted, encoding="utf-8")

    for error in errors:
        print(error, file=sys.stderr)
    if args.check and changed:
        for path in changed:
            print(f"needs C++ block formatting: {path}")
    elif args.write:
        print(f"formatted C++ blocks: {len(changed)} Markdown files")

    return 1 if errors or (args.check and changed) else 0


if __name__ == "__main__":
    raise SystemExit(main())
