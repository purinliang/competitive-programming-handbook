#!/usr/bin/env python3

import argparse
import pathlib
import re
import subprocess
import sys


CPP_BLOCK = re.compile(r"```cpp\n(.*?)\n```", re.DOTALL)
MAIN_FUNCTION = re.compile(r"\bint\s+main\s*\(")


def compile_program(source: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            "g++",
            "-std=c++17",
            "-O2",
            "-Wall",
            "-Wextra",
            "-x",
            "c++",
            "-fsyntax-only",
            "-",
        ],
        input=source,
        text=True,
        capture_output=True,
        check=False,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Compile complete C++ programs embedded in Markdown files."
    )
    parser.add_argument("files", nargs="+", type=pathlib.Path)
    args = parser.parse_args()

    checked = 0
    failed = 0

    for path in args.files:
        markdown = path.read_text()
        blocks = CPP_BLOCK.findall(markdown)
        programs = [block for block in blocks if MAIN_FUNCTION.search(block)]

        if not programs:
            print(f"skip: {path} has no complete program")
            continue

        for index, program in enumerate(programs, start=1):
            checked += 1
            result = compile_program(program)
            if result.returncode == 0:
                print(f"ok: {path} program {index}")
                continue

            failed += 1
            print(f"error: {path} program {index}")
            print(result.stderr.rstrip())

    print(f"compiled {checked} complete program(s), {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
