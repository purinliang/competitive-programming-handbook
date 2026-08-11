from __future__ import annotations

import unittest
from pathlib import Path

import cp_diagrams
from cp_diagrams.render import render_file, render_svg
from cp_diagrams.schema import DiagramError, load_diagram, parse_diagram


ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / "examples"
GOLDEN = Path(__file__).resolve().parent / "golden"


class GoldenSvgTest(unittest.TestCase):
    def test_every_example_matches_the_committed_svg(self) -> None:
        examples = sorted(EXAMPLES.glob("*.yaml"))
        snapshots = sorted(GOLDEN.glob("*.svg"))
        self.assertEqual(
            [path.stem for path in snapshots],
            [path.stem for path in examples],
        )

        for example in examples:
            with self.subTest(example=example.name):
                actual = render_svg(load_diagram(example))
                expected = (GOLDEN / f"{example.stem}.svg").read_text()
                self.assertEqual(f"{actual}\n", expected)


class PublicApiCompatibilityTest(unittest.TestCase):
    def test_package_and_facade_exports_remain_available(self) -> None:
        self.assertIs(cp_diagrams.load_diagram, load_diagram)
        self.assertTrue(callable(parse_diagram))
        self.assertTrue(callable(render_svg))
        self.assertTrue(callable(render_file))
        self.assertTrue(issubclass(DiagramError, ValueError))


if __name__ == "__main__":
    unittest.main()
