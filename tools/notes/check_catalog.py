#!/usr/bin/env python3
"""Check the notes registry, route/index coverage, article metadata, and SVG sources."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[2]
NOTES = ROOT / "notes"
CATALOG = NOTES / "catalog.md"
LEARNING_PATH = NOTES / "learning-path.md"

ALLOWED_STATUSES = {"计划", "待审阅", "已审阅", "草稿", "定稿"}
MODULE_PREFIXES = {
    "cpp": "01",
    "algorithm-basics": "02",
    "data-structures": "03",
    "graph-theory": "04",
    "math": "05",
    "computational-geometry": "06",
    "dynamic-programming": "07",
    "strings": "08",
}
ARTICLE_ID_PATTERN = r"\d{4}(?:e\d+)?"
CATALOG_ROW = re.compile(
    rf"^\|\s*({ARTICLE_ID_PATTERN})(\*)?\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$"
)
PATH_ROW = re.compile(
    r"^\|\s*(\d{4})\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$"
)
EXTENSION_INDEX_ROW = re.compile(
    rf"^\|\s*({ARTICLE_ID_PATTERN})(\*)?\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$"
)
MARKDOWN_LINK = re.compile(r"\[[^]]*\]\(([^)]+)\)")
FILE_LINK = re.compile(r"^\[([^]]+)\]\(([^)]+)\)$")
CODE_PATH = re.compile(r"^`([^`]+)`$")
LEGACY_DRAFTS = re.compile(r"<!--\s*legacy-drafts:\s*([^>]*)-->")
ARTICLE_FILENAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
FORBIDDEN_LATEX_MACROS = {"operatorname"}
DATETIME_PATTERN = r"\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2}"


@dataclass(frozen=True)
class Entry:
    article_id: str
    title: str
    kind: str
    status: str
    path: str
    linked: bool


@dataclass(frozen=True)
class RouteEntry:
    article_id: str
    title: str
    module: str
    path: str
    linked: bool
    stage: str
    section: str


@dataclass(frozen=True)
class ExtensionIndexEntry:
    article_id: str
    title: str
    path: str
    linked: bool
    section: str


class Checker:
    def __init__(self) -> None:
        self.errors: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def check(self) -> tuple[int, int, int]:
        catalog_text = CATALOG.read_text(encoding="utf-8")
        path_text = LEARNING_PATH.read_text(encoding="utf-8")
        entries = self.parse_catalog(catalog_text)
        route, extension_index = self.parse_learning_path(path_text)
        legacy = self.parse_legacy_drafts(catalog_text)

        self.check_module_headings(catalog_text)
        self.check_catalog(entries, legacy)
        self.check_learning_path(entries, route)
        self.check_extension_index(entries, extension_index)
        self.check_article_files(entries, legacy)
        self.check_svg_sources()

        core = sum(entry.kind == "核心教程" for entry in entries.values())
        extensions = sum(entry.kind == "扩展专题" for entry in entries.values())
        return len(entries), core, extensions

    def parse_catalog(self, text: str) -> dict[str, Entry]:
        entries: dict[str, Entry] = {}
        paths: dict[str, str] = {}
        for line_number, line in enumerate(text.splitlines(), start=1):
            match = CATALOG_ROW.match(line)
            if not match:
                continue
            article_id, extension_marker, title, status, raw_file = match.groups()
            article_id = article_id.strip()
            title = title.strip()
            status = status.strip()
            raw_file = raw_file.strip()
            kind = (
                "扩展专题"
                if extension_marker or re.fullmatch(r"\d{4}e\d+", article_id)
                else "核心教程"
            )
            path, linked = self.parse_file_cell(
                raw_file, f"catalog.md:{line_number}"
            )
            if article_id in entries:
                self.error(f"catalog.md:{line_number}: duplicate ID {article_id}")
                continue
            if path in paths:
                self.error(
                    f"catalog.md:{line_number}: path {path!r} is also used by {paths[path]}"
                )
            paths[path] = article_id
            entries[article_id] = Entry(
                article_id,
                title,
                kind,
                status,
                path,
                linked,
            )
        if not entries:
            self.error("catalog.md: no catalog entries found")
        return entries

    def parse_learning_path(
        self, text: str
    ) -> tuple[list[RouteEntry], list[ExtensionIndexEntry]]:
        route: list[RouteEntry] = []
        extension_index: list[ExtensionIndexEntry] = []
        stage = "(no stage)"
        section = "(no section)"
        in_extension_index = False
        for line_number, line in enumerate(text.splitlines(), start=1):
            if line == "## 扩展阅读索引":
                in_extension_index = True
                section = "扩展阅读索引"
                continue
            if line.startswith("## "):
                stage = line[3:].strip()
                section = "(no section)"
                continue
            if line.startswith("### "):
                section = line[4:].strip()
                continue
            if in_extension_index:
                extension_match = EXTENSION_INDEX_ROW.match(line)
                if not extension_match:
                    continue
                article_id, _marker, title, raw_file = (
                    part.strip() if part else part
                    for part in extension_match.groups()
                )
                link = FILE_LINK.fullmatch(raw_file)
                if link and link.group(1) != link.group(2).split("#", 1)[0]:
                    self.error(
                        f"learning-path.md:{line_number}: link label must show the relative path"
                    )
                path, linked = self.parse_file_cell(
                    raw_file, f"learning-path.md:{line_number}"
                )
                extension_index.append(
                    ExtensionIndexEntry(article_id, title, path, linked, section)
                )
                continue
            match = PATH_ROW.match(line)
            if not match:
                continue
            article_id, title, module, raw_file = (
                part.strip() for part in match.groups()
            )
            link = FILE_LINK.fullmatch(raw_file)
            if link and link.group(1) != link.group(2).split("#", 1)[0]:
                self.error(
                    f"learning-path.md:{line_number}: link label must show the relative path"
                )
            path, linked = self.parse_file_cell(
                raw_file, f"learning-path.md:{line_number}"
            )
            route.append(RouteEntry(article_id, title, module, path, linked, stage, section))
        if not route:
            self.error("learning-path.md: no learning-path entries found")
        if not extension_index:
            self.error("learning-path.md: no extension-index entries found")
        return route, extension_index

    def parse_file_cell(self, raw: str, location: str) -> tuple[str, bool]:
        link = FILE_LINK.fullmatch(raw)
        if link:
            return link.group(2).split("#", 1)[0], True
        code = CODE_PATH.fullmatch(raw)
        if code:
            return code.group(1), False
        self.error(f"{location}: file cell must be one Markdown link or one code path")
        return raw, False

    def parse_legacy_drafts(self, text: str) -> set[str]:
        match = LEGACY_DRAFTS.search(text)
        if not match:
            self.error("catalog.md: missing legacy-drafts marker")
            return set()
        legacy = {item.strip() for item in match.group(1).split(",") if item.strip()}
        invalid = sorted(item for item in legacy if not re.fullmatch(r"\d{4}", item))
        if invalid:
            self.error(f"catalog.md: invalid legacy draft IDs: {', '.join(invalid)}")
        return legacy

    def check_catalog(self, entries: dict[str, Entry], legacy: set[str]) -> None:
        positions = {article_id: index for index, article_id in enumerate(entries)}
        for entry in entries.values():
            location = f"catalog.md ({entry.article_id})"
            if entry.status not in ALLOWED_STATUSES:
                self.error(f"{location}: invalid status {entry.status!r}")
            if not ARTICLE_FILENAME.fullmatch(Path(entry.path).name):
                self.error(f"{location}: invalid article filename {entry.path!r}")
            module = Path(entry.path).parts[0] if Path(entry.path).parts else ""
            expected_prefix = MODULE_PREFIXES.get(module)
            if expected_prefix is None:
                self.error(f"{location}: unknown module directory {module!r}")
            elif not entry.article_id.startswith(expected_prefix):
                self.error(
                    f"{location}: module {module!r} must use ID prefix {expected_prefix}"
                )
            elif "e" in entry.article_id:
                base_id = entry.article_id[:4]
                if base_id not in positions:
                    self.error(f"{location}: companion base {base_id} is absent")
                elif positions[base_id] >= positions[entry.article_id]:
                    self.error(
                        f"{location}: companion base {base_id} must appear earlier"
                    )
            if entry.status == "计划" and entry.linked:
                self.error(f"{location}: planned article must use a code path")
            if entry.status != "计划" and not entry.linked:
                self.error(f"{location}: article with a body must use a Markdown link")
        unknown_legacy = sorted(legacy - entries.keys())
        if unknown_legacy:
            self.error(
                "catalog.md: legacy marker contains unknown IDs: "
                + ", ".join(unknown_legacy)
            )
        for article_id in sorted(legacy & entries.keys()):
            if entries[article_id].status != "草稿":
                self.error(
                    f"catalog.md ({article_id}): only draft articles may be marked legacy"
                )

    def check_module_headings(self, text: str) -> None:
        headings = re.findall(r"^## (\d{2})\s+", text, re.MULTILINE)
        expected = list(MODULE_PREFIXES.values())
        if headings != expected:
            self.error(
                "catalog.md: module headings must be ordered "
                + " -> ".join(expected)
                + f"; got {' -> '.join(headings)}"
            )

    def check_learning_path(
        self, entries: dict[str, Entry], route: list[RouteEntry]
    ) -> None:
        seen: set[str] = set()
        route_ids: list[str] = []
        for item in route:
            location = f"learning-path.md ({item.article_id}, {item.stage})"
            if item.article_id in seen:
                self.error(f"{location}: duplicate learning-path ID")
                continue
            seen.add(item.article_id)
            entry = entries.get(item.article_id)
            if not entry:
                self.error(f"{location}: ID is absent from catalog.md")
                continue
            is_extension_unit = item.section.startswith("扩展单元：")
            if is_extension_unit and entry.kind != "扩展专题":
                self.error(f"{location}: core articles must not enter an extension unit")
            if not is_extension_unit and entry.kind != "核心教程":
                self.error(f"{location}: extension articles must not enter a core learning unit")
            if not is_extension_unit:
                route_ids.append(item.article_id)
            logical_path = item.path.removeprefix("learning-path/")
            if logical_path != entry.path:
                self.error(
                    f"{location}: article key differs from catalog ({logical_path!r} != {entry.path!r})"
                )

        core_ids = {key for key, entry in entries.items() if entry.kind == "核心教程"}
        core_route_ids = set(route_ids)
        missing = sorted(core_ids - core_route_ids)
        extra = sorted(core_route_ids - core_ids)
        if missing:
            self.error("learning-path.md: missing core IDs: " + ", ".join(missing))
        if extra:
            self.error("learning-path.md: non-core IDs present: " + ", ".join(extra))

        stages = list(dict.fromkeys(item.stage for item in route if not item.section.startswith("扩展单元：")))
        expected_stages = [
            "01 C++ 基础",
            "02 算法基础",
            "03 初中基础",
            "04 初中进阶",
            "05 高中基础",
            "06 高中进阶",
        ]
        if stages != expected_stages:
            self.error(
                "learning-path.md: stages must be exactly "
                + " -> ".join(expected_stages)
            )

    def check_extension_index(
        self,
        entries: dict[str, Entry],
        extension_index: list[ExtensionIndexEntry],
    ) -> None:
        actual_ids: list[str] = []
        seen: set[str] = set()
        for item in extension_index:
            location = f"learning-path.md ({item.article_id}, {item.section})"
            if item.article_id in seen:
                self.error(f"{location}: duplicate extension-index ID")
                continue
            seen.add(item.article_id)
            actual_ids.append(item.article_id)
            entry = entries.get(item.article_id)
            if not entry:
                self.error(f"{location}: ID is absent from catalog.md")
                continue
            if entry.kind != "扩展专题":
                self.error(f"{location}: core article must stay in stages 1–6")
            if item.title != entry.title:
                self.error(
                    f"{location}: title differs from catalog ({item.title!r} != {entry.title!r})"
                )
            if item.path != entry.path:
                self.error(
                    f"{location}: path differs from catalog ({item.path!r} != {entry.path!r})"
                )
            if item.linked != entry.linked:
                self.error(f"{location}: file link/code style differs from catalog status")

        module_order = {
            module: index for index, module in enumerate(MODULE_PREFIXES)
        }
        expected_ids = sorted(
            (
                article_id
                for article_id, entry in entries.items()
                if entry.kind == "扩展专题"
            ),
            key=lambda article_id: (
                module_order[Path(entries[article_id].path).parts[0]],
                article_id,
            ),
        )
        if actual_ids != expected_ids:
            missing = sorted(set(expected_ids) - set(actual_ids))
            extra = sorted(set(actual_ids) - set(expected_ids))
            if missing:
                self.error(
                    "learning-path.md: extension index missing IDs: "
                    + ", ".join(missing)
                )
            if extra:
                self.error(
                    "learning-path.md: extension index has non-extension IDs: "
                    + ", ".join(extra)
                )
            if not missing and not extra:
                self.error(
                    "learning-path.md: extension index must follow module and ID order"
                )

    def check_article_files(
        self, entries: dict[str, Entry], legacy: set[str]
    ) -> None:
        expected = {
            entry.path: entry
            for entry in entries.values()
            if entry.status != "计划"
        }
        actual: set[str] = set()
        for module in MODULE_PREFIXES:
            module_root = NOTES / module
            if not module_root.exists():
                continue
            for path in module_root.rglob("*.md"):
                relative = path.relative_to(NOTES).as_posix()
                actual.add(relative)

        for relative, entry in expected.items():
            path = NOTES / relative
            if not path.is_file():
                self.error(f"catalog.md ({entry.article_id}): missing file notes/{relative}")
        unregistered = sorted(actual - set(expected))
        if unregistered:
            self.error(
                "notes: article files absent from live catalog entries: "
                + ", ".join(unregistered)
            )

        for relative, entry in expected.items():
            path = NOTES / relative
            if not path.is_file():
                continue
            text = path.read_text(encoding="utf-8")
            self.check_local_links(path, text)
            self.check_latex_compatibility(path, text)
            if entry.article_id not in legacy:
                self.check_article_metadata(path, text, entry)

    def check_article_metadata(self, path: Path, text: str, entry: Entry) -> None:
        display = path.relative_to(ROOT).as_posix()
        title = re.search(r"^# (.+?)\s*$", text, re.MULTILINE)
        legacy_status = re.search(r"^> 状态：(草稿|定稿)\s*$", text, re.MULTILINE)
        revision = re.search(
            rf"^> 最近修订：({DATETIME_PATTERN})（(未审阅|已审阅)）\s*$",
            text,
            re.MULTILINE,
        )
        status = legacy_status.group(1) if legacy_status else None
        if revision:
            status = "待审阅" if revision.group(2) == "未审阅" else "已审阅"
        if not title:
            self.error(f"{display}: article title is missing")
        if not status:
            self.error(f"{display}: incomplete article information block")
            return
        if status != entry.status:
            self.error(f"{display}: article status differs from catalog")

    def check_local_links(self, path: Path, text: str) -> None:
        display = path.relative_to(ROOT).as_posix()
        in_fenced_code = False
        for line in text.splitlines():
            if line.lstrip().startswith("```"):
                in_fenced_code = not in_fenced_code
                continue
            if in_fenced_code:
                continue
            for target in MARKDOWN_LINK.findall(line):
                target = target.strip().split(maxsplit=1)[0]
                if target.startswith(("http://", "https://", "mailto:", "#")):
                    continue
                relative = target.split("#", 1)[0]
                if not relative:
                    continue
                destination = (path.parent / relative).resolve()
                try:
                    destination.relative_to(ROOT.resolve())
                except ValueError:
                    self.error(f"{display}: link leaves repository: {target}")
                    continue
                if not destination.exists():
                    self.error(f"{display}: missing linked resource {target}")
                if destination.suffix.lower() == ".png":
                    self.error(
                        f"{display}: tutorial images must use SVG, not PNG: {target}"
                    )

    def check_latex_compatibility(self, path: Path, text: str) -> None:
        display = path.relative_to(ROOT).as_posix()
        for line_number, line in enumerate(text.splitlines(), start=1):
            for macro in FORBIDDEN_LATEX_MACROS:
                if f"\\{macro}" in line:
                    self.error(
                        f"{display}:{line_number}: LaTeX macro \\{macro} "
                        "is not supported by GitHub"
                    )

    def check_svg_sources(self) -> None:
        assets = NOTES / "assets"
        if not assets.exists():
            return
        yaml_by_stem: dict[str, list[Path]] = {}
        source_roots = [ROOT / "tools/diagrams/sources", ROOT / "tools/diagrams/examples"]
        for source_root in source_roots:
            if not source_root.exists():
                continue
            for source in source_root.rglob("*.yaml"):
                yaml_by_stem.setdefault(source.stem, []).append(source)

        for asset in assets.rglob("*"):
            if not asset.is_file():
                continue
            display = asset.relative_to(ROOT).as_posix()
            if asset.suffix.lower() != ".svg":
                self.error(f"{display}: notes assets must be SVG")
                continue
            sources = yaml_by_stem.get(asset.stem, [])
            if not sources:
                self.error(f"{display}: no YAML source with the same basename")


def main() -> int:
    checker = Checker()
    try:
        total, core, extensions = checker.check()
    except (OSError, UnicodeError) as error:
        print(f"notes-check: {error}", file=sys.stderr)
        return 1

    if checker.errors:
        for error in checker.errors:
            print(f"error: {error}", file=sys.stderr)
        print(f"notes-check failed with {len(checker.errors)} error(s)", file=sys.stderr)
        return 1

    print(
        f"notes catalog valid: {total} entries, {core} core, "
        f"{extensions} extensions"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
