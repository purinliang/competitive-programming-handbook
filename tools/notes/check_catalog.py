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
    "other": "09",
}
ARTICLE_ID_PATTERN = r"\d{6}(?:e\d+)?"
CATALOG_ROW = re.compile(
    rf"^\|\s*(\*)?({ARTICLE_ID_PATTERN})\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$"
)
PATH_ROW = re.compile(
    rf"^\|\s*(\*)?({ARTICLE_ID_PATTERN})\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$"
)
EXTENSION_INDEX_ROW = re.compile(
    rf"^\|\s*(\*)?({ARTICLE_ID_PATTERN})\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$"
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
    extension_marker: bool
    title: str
    module: str
    path: str
    linked: bool
    stage: str
    stage_number: str
    section: str
    unit_number: str
    unit_extension: bool
    article_position: int


@dataclass(frozen=True)
class ExtensionIndexEntry:
    article_id: str
    extension_marker: bool
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
        self.check_catalog(entries, legacy, route)
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
            extension_marker, article_id, title, status, raw_file = match.groups()
            article_id = article_id.strip()
            title = title.strip()
            status = status.strip()
            raw_file = raw_file.strip()
            if re.fullmatch(r"\d{4}e\d+", article_id) and not extension_marker:
                self.error(
                    f"catalog.md:{line_number}: attached extensions must also use *"
                )
            kind = "扩展专题" if extension_marker else "核心教程"
            path, linked = self.parse_file_cell(
                raw_file, f"catalog.md:{line_number}"
            )
            if article_id in entries:
                previous = entries[article_id]
                repeated = Entry(
                    article_id,
                    title,
                    kind,
                    status,
                    path,
                    linked,
                )
                if repeated != previous:
                    self.error(
                        f"catalog.md:{line_number}: repeated ID {article_id} "
                        "must keep identical metadata"
                    )
                continue
            if path in paths and paths[path] != article_id:
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
        stage_number = ""
        section = "(no section)"
        unit_number = ""
        unit_extension = False
        article_position = 0
        expected_unit_number = 0
        in_extension_index = False
        for line_number, line in enumerate(text.splitlines(), start=1):
            if line == "## 扩展阅读索引":
                in_extension_index = True
                section = "扩展阅读索引"
                continue
            if line.startswith("## "):
                stage = line[3:].strip()
                stage_match = re.match(r"^(\d{2})\s+", stage)
                stage_number = stage_match.group(1) if stage_match else ""
                section = "(no section)"
                unit_number = ""
                unit_extension = False
                article_position = 0
                expected_unit_number = 0
                continue
            if line.startswith("### "):
                raw_section = line[4:].strip()
                unit_match = re.fullmatch(r"单元 (\d{2})：(.+)", raw_section)
                if not in_extension_index and not unit_match:
                    self.error(
                        f"learning-path.md:{line_number}: unit heading must use "
                        "'单元 01：名称'"
                    )
                    section = raw_section
                    continue
                if unit_match:
                    unit_number, raw_title = unit_match.groups()
                    expected_unit_number += 1
                    if unit_number != f"{expected_unit_number:02d}":
                        self.error(
                            f"learning-path.md:{line_number}: expected unit "
                            f"{expected_unit_number:02d}, got {unit_number}"
                        )
                    unit_extension = raw_title.startswith("*")
                    section = raw_title.removeprefix("*").strip()
                    article_position = 0
                else:
                    section = raw_section
                continue
            if in_extension_index:
                extension_match = EXTENSION_INDEX_ROW.match(line)
                if not extension_match:
                    continue
                marker, article_id, title, raw_file = (
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
                    ExtensionIndexEntry(
                        article_id,
                        bool(marker),
                        title,
                        path,
                        linked,
                        section,
                    )
                )
                continue
            match = PATH_ROW.match(line)
            if not match:
                continue
            article_position += 1
            marker, article_id, title, module, raw_file = (
                part.strip() if part else part for part in match.groups()
            )
            link = FILE_LINK.fullmatch(raw_file)
            if link and link.group(1) != link.group(2).split("#", 1)[0]:
                self.error(
                    f"learning-path.md:{line_number}: link label must show the relative path"
                )
            path, linked = self.parse_file_cell(
                raw_file, f"learning-path.md:{line_number}"
            )
            route.append(
                RouteEntry(
                    article_id,
                    bool(marker),
                    title,
                    module,
                    path,
                    linked,
                    stage,
                    stage_number,
                    section,
                    unit_number,
                    unit_extension,
                    article_position,
                )
            )
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
        invalid = sorted(item for item in legacy if not re.fullmatch(r"\d{6}", item))
        if invalid:
            self.error(f"catalog.md: invalid legacy draft IDs: {', '.join(invalid)}")
        return legacy

    def check_catalog(
        self,
        entries: dict[str, Entry],
        legacy: set[str],
        route: list[RouteEntry],
    ) -> None:
        positions = {article_id: index for index, article_id in enumerate(entries)}
        route_ids = {item.article_id for item in route}
        for entry in entries.values():
            location = f"catalog.md ({entry.article_id})"
            if entry.status not in ALLOWED_STATUSES:
                self.error(f"{location}: invalid status {entry.status!r}")
            if not ARTICLE_FILENAME.fullmatch(Path(entry.path).name):
                self.error(f"{location}: invalid article filename {entry.path!r}")
            elif re.match(r"\d{4,6}-", Path(entry.path).name):
                self.error(
                    f"{location}: semantic article filename must not carry an ID"
                )
            module = Path(entry.path).parts[0] if Path(entry.path).parts else ""
            expected_prefix = MODULE_PREFIXES.get(module)
            if expected_prefix is None:
                self.error(f"{location}: unknown module directory {module!r}")
            if "e" in entry.article_id:
                base_id = entry.article_id.split("e", 1)[0]
                if base_id not in positions:
                    self.error(f"{location}: companion base {base_id} is absent")
                elif positions[base_id] >= positions[entry.article_id]:
                    self.error(
                        f"{location}: companion base {base_id} must appear earlier"
                    )
            elif entry.kind == "核心教程" and entry.article_id.startswith("99"):
                self.error(f"{location}: core article must not use the 99 extension range")
            elif (
                entry.kind == "扩展专题"
                and entry.article_id not in route_ids
                and expected_prefix is not None
                and not entry.article_id.startswith(f"99{expected_prefix}")
            ):
                self.error(
                    f"{location}: catalog-only extension in module {module!r} "
                    f"must use prefix 99{expected_prefix}"
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
        seen_entrances: set[tuple[str, str, str]] = set()
        repeated_metadata: dict[str, tuple[bool, str, str, str, bool]] = {}
        primary_positions: dict[str, str] = {}
        unit_entries: dict[tuple[str, str], list[RouteEntry]] = {}
        route_ids: list[str] = []
        for item in route:
            location = f"learning-path.md ({item.article_id}, {item.stage})"
            entrance = (item.stage, item.section, item.article_id)
            if entrance in seen_entrances:
                self.error(f"{location}: duplicate entrance in the same unit")
                continue
            seen_entrances.add(entrance)
            metadata = (
                item.extension_marker,
                item.title,
                item.module,
                item.path,
                item.linked,
            )
            previous_metadata = repeated_metadata.setdefault(item.article_id, metadata)
            if previous_metadata != metadata:
                self.error(
                    f"{location}: repeated entrances must keep identical metadata"
                )
            entry = entries.get(item.article_id)
            if not entry:
                self.error(f"{location}: ID is absent from catalog.md")
                continue
            if item.extension_marker != (entry.kind == "扩展专题"):
                self.error(f"{location}: extension marker differs from catalog")
            if re.fullmatch(r"\d{6}e\d+", item.article_id):
                self.error(f"{location}: attached extensions must not enter stage directories")
            expected_id = (
                f"{item.stage_number}{item.unit_number}{item.article_position:02d}"
            )
            primary = primary_positions.setdefault(item.article_id, expected_id)
            if primary == expected_id and item.article_id != expected_id:
                self.error(
                    f"{location}: primary route position requires ID {expected_id}"
                )
            if item.article_id.startswith("99"):
                self.error(f"{location}: route article must not use the 99 extension range")
            if entry.kind == "核心教程":
                route_ids.append(item.article_id)
            unit_entries.setdefault((item.stage, item.unit_number), []).append(item)
            logical_path = item.path.removeprefix("learning-path/")
            if logical_path != entry.path:
                self.error(
                    f"{location}: article key differs from catalog ({logical_path!r} != {entry.path!r})"
                )

        for (stage, unit_number), items in unit_entries.items():
            all_extensions = all(item.extension_marker for item in items)
            marked_extension = items[0].unit_extension
            if all_extensions != marked_extension:
                name = items[0].section
                if all_extensions:
                    self.error(
                        f"learning-path.md ({stage}, unit {unit_number} {name}): "
                        "an all-extension unit must prefix its title with *"
                    )
                else:
                    self.error(
                        f"learning-path.md ({stage}, unit {unit_number} {name}): "
                        "a starred unit may contain only extensions"
                    )

        core_ids = {key for key, entry in entries.items() if entry.kind == "核心教程"}
        core_route_ids = set(route_ids)
        missing = sorted(core_ids - core_route_ids)
        extra = sorted(core_route_ids - core_ids)
        if missing:
            self.error("learning-path.md: missing core IDs: " + ", ".join(missing))
        if extra:
            self.error("learning-path.md: non-core IDs present: " + ", ".join(extra))

        stages = list(dict.fromkeys(item.stage for item in route))
        expected_stages = [
            "01 C++ 基础",
            "02 C++ 进阶",
            "03 算法入门",
            "04 初中基础",
            "05 初中进阶",
            "06 高中基础",
            "07 高中进阶",
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
                self.error(f"{location}: core article must stay in stages 1–7")
            if not item.extension_marker:
                self.error(f"{location}: extension index entries must use *")
            if re.fullmatch(r"\d{6}e\d+", item.article_id):
                self.error(f"{location}: attached extensions must not enter the public index")
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
                and not re.fullmatch(r"\d{6}e\d+", article_id)
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
