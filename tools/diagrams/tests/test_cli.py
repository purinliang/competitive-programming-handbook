from __future__ import annotations

import io
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

from cp_diagrams.cli import main
from cp_diagrams.render import render_svg
from cp_diagrams.schema import load_diagram


ROOT = Path(__file__).resolve().parents[1]
EXAMPLE = ROOT / "examples" / "prefix-sum-range.yaml"


class CliCompatibilityTest(unittest.TestCase):
    def test_validate_keeps_the_existing_success_contract(self) -> None:
        stdout = io.StringIO()
        with redirect_stdout(stdout):
            status = main(["validate", str(EXAMPLE)])
        self.assertEqual(status, 0)
        self.assertEqual(stdout.getvalue(), f"valid: {EXAMPLE}\n")

    def test_render_writes_the_same_svg_and_refuses_implicit_overwrite(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "diagram.svg"
            stdout = io.StringIO()
            with redirect_stdout(stdout):
                status = main(["render", str(EXAMPLE), "--output", str(output)])
            self.assertEqual(status, 0)
            self.assertEqual(output.read_text(), render_svg(load_diagram(EXAMPLE)))
            self.assertEqual(stdout.getvalue(), f"rendered: {output}\n")

            stderr = io.StringIO()
            with redirect_stderr(stderr):
                status = main(["render", str(EXAMPLE), "--output", str(output)])
            self.assertEqual(status, 2)
            self.assertIn("使用 --force 覆盖", stderr.getvalue())

    def test_render_still_rejects_non_svg_output(self) -> None:
        stderr = io.StringIO()
        with tempfile.TemporaryDirectory() as directory, redirect_stderr(stderr):
            status = main(
                ["render", str(EXAMPLE), "--output", str(Path(directory) / "x.png")]
            )
        self.assertEqual(status, 2)
        self.assertIn("目前只输出 .svg", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
