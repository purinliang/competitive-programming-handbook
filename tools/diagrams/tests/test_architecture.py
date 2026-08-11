from __future__ import annotations

import ast
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "cp_diagrams"


def _python_files(directory: str | None = None) -> list[Path]:
    root = PACKAGE if directory is None else PACKAGE / directory
    return sorted(root.rglob("*.py"))


def _module_name(path: Path) -> str:
    relative = path.relative_to(ROOT).with_suffix("")
    parts = list(relative.parts)
    if parts[-1] == "__init__":
        parts.pop()
    return ".".join(parts)


def _package_name(path: Path) -> str:
    module = _module_name(path)
    if path.name == "__init__.py":
        return module
    return module.rpartition(".")[0]


def _imports(path: Path) -> set[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    result: set[str] = set()
    package = _package_name(path).split(".")
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            result.update(alias.name for alias in node.names)
            continue
        if not isinstance(node, ast.ImportFrom):
            continue
        if node.level == 0:
            if node.module is not None:
                result.add(node.module)
            continue
        keep = len(package) - (node.level - 1)
        base = package[:keep]
        if node.module is not None:
            base.extend(node.module.split("."))
        result.add(".".join(base))
    return result


def _matches(module: str, prefix: str) -> bool:
    return module == prefix or module.startswith(f"{prefix}.")


class DependencyBoundaryTest(unittest.TestCase):
    def assert_layer_avoids(
        self, directory: str, forbidden: tuple[str, ...]
    ) -> None:
        for path in _python_files(directory):
            for module in _imports(path):
                with self.subTest(path=path.relative_to(ROOT), module=module):
                    self.assertFalse(
                        any(_matches(module, prefix) for prefix in forbidden),
                        f"{path.relative_to(ROOT)} 不应依赖 {module}",
                    )

    def test_models_are_independent_semantic_objects(self) -> None:
        self.assert_layer_avoids(
            "models",
            (
                "yaml",
                "rough",
                "cp_diagrams.common",
                "cp_diagrams.schema",
                "cp_diagrams.layouts",
                "cp_diagrams.renderers",
                "cp_diagrams.render",
            ),
        )

    def test_schema_only_builds_models(self) -> None:
        self.assert_layer_avoids(
            "schema",
            (
                "rough",
                "cp_diagrams.common.canvas",
                "cp_diagrams.layouts",
                "cp_diagrams.renderers",
                "cp_diagrams.render",
            ),
        )

    def test_layouts_remain_pure_geometry(self) -> None:
        self.assert_layer_avoids(
            "layouts",
            (
                "yaml",
                "rough",
                "cp_diagrams.common.canvas",
                "cp_diagrams.schema",
                "cp_diagrams.renderers",
                "cp_diagrams.render",
            ),
        )

    def test_only_canvas_depends_on_rough(self) -> None:
        allowed = Path("common/canvas.py")
        for path in _python_files():
            if any(_matches(module, "rough") for module in _imports(path)):
                self.assertEqual(path.relative_to(PACKAGE), allowed)

    def test_family_renderers_only_share_primitives(self) -> None:
        for path in _python_files("renderers"):
            if path.name in {"__init__.py", "primitives.py"}:
                continue
            own_module = f"cp_diagrams.renderers.{path.stem}"
            for module in _imports(path):
                if not _matches(module, "cp_diagrams.renderers"):
                    continue
                with self.subTest(path=path.name, module=module):
                    self.assertTrue(
                        _matches(module, own_module)
                        or _matches(module, "cp_diagrams.renderers.primitives"),
                        f"{path.name} 不应调用其他视觉族 {module}",
                    )

    def test_render_facade_contains_no_layout_or_canvas_dependency(self) -> None:
        imports = _imports(PACKAGE / "render.py")
        forbidden = (
            "rough",
            "yaml",
            "cp_diagrams.common",
            "cp_diagrams.layouts",
            "cp_diagrams.schema",
        )
        for module in imports:
            with self.subTest(module=module):
                self.assertFalse(
                    any(_matches(module, prefix) for prefix in forbidden),
                    f"render.py 门面不应依赖 {module}",
                )


if __name__ == "__main__":
    unittest.main()
