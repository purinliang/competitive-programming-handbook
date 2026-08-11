from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass

from ..common.canvas import Sketch
from ..common.theme import (
    ANNOTATION_CLEARANCE,
    ANNOTATION_LABEL_FONT_SIZE,
    ANNOTATION_STEP,
    ANNOTATION_STROKE_WIDTH,
    ARRAY_LABEL_FONT_SIZE,
    CELL_HEIGHT,
    CELL_HORIZONTAL_PADDING,
    INDEX_FONT_SIZE,
    INDEX_GAP,
    INDEX_HEIGHT,
    INLINE_LABEL_PADDING,
    LABEL_GAP,
    MIN_CELL_WIDTH,
    MIN_RANGE_ARROW_LENGTH,
    MULTI_ROW_GAP,
    PADDING,
    PALETTE,
    PROJECTION_CELL_GAP_RATIO,
    PROJECTION_VERTICAL_GAP,
    STROKE_WIDTH,
    VALUE_FONT_SIZE,
)
from ..common.typography import text_width as _text_width
from ..models import Arrow, CellHighlight, Diagram, MultiArrayDiagram, Range


@dataclass(frozen=True)
class ArrowLayout:
    arrow: Arrow
    slot: int
    slot_count: int
    length: int

def render_v1_array(diagram: Diagram) -> str:
    ranges = [
        annotation
        for annotation in diagram.annotations
        if isinstance(annotation, Range)
    ]
    top_arrows = _layout_arrows(
        [
            annotation
            for annotation in diagram.annotations
            if isinstance(annotation, Arrow) and annotation.side == "top"
        ]
    )
    bottom_arrows = _layout_arrows(
        [
            annotation
            for annotation in diagram.annotations
            if isinstance(annotation, Arrow) and annotation.side == "bottom"
        ]
    )
    top_arrow_levels = max((layout.length for layout in top_arrows), default=0)
    bottom_arrow_levels = max((layout.length for layout in bottom_arrows), default=0)
    top_levels = len(ranges) + top_arrow_levels
    bottom_levels = bottom_arrow_levels

    highlights = [
        annotation
        for annotation in diagram.annotations
        if isinstance(annotation, CellHighlight)
    ]

    cell_width = _cell_width(diagram)
    label_width = _label_width(diagram.label)
    index_height = INDEX_HEIGHT if diagram.index != "none" else 0
    width = round(PADDING * 2 + label_width + cell_width * len(diagram.cells))
    height = round(
        PADDING * 2
        + ANNOTATION_STEP * top_levels
        + (ANNOTATION_CLEARANCE if top_levels else 0)
        + CELL_HEIGHT
        + index_height
        + ANNOTATION_STEP * bottom_levels
        + (ANNOTATION_CLEARANCE if bottom_levels else 0)
    )

    array_x = PADDING + label_width
    array_y = (
        PADDING
        + ANNOTATION_STEP * top_levels
        + (ANNOTATION_CLEARANCE if top_levels else 0)
    )
    sketch = Sketch(width, height)
    if diagram.background == "white":
        sketch.background(width, height, PALETTE["background"])

    for position, cell in enumerate(diagram.cells):
        x = array_x + position * cell_width
        sketch.rectangle(x, array_y, cell_width, CELL_HEIGHT, "default")
        sketch.text(
            x + cell_width / 2,
            array_y + CELL_HEIGHT / 2,
            str(cell.value),
            color="default",
            size=VALUE_FONT_SIZE,
        )

    if diagram.label is not None:
        sketch.text(
            array_x - 18,
            array_y + CELL_HEIGHT / 2,
            diagram.label,
            size=ARRAY_LABEL_FONT_SIZE,
            align="right",
        )

    if diagram.index != "none":
        base = 0 if diagram.index == "0-based" else 1
        for position in range(len(diagram.cells)):
            sketch.text(
                array_x + (position + 0.5) * cell_width,
                array_y + CELL_HEIGHT + INDEX_GAP + INDEX_FONT_SIZE / 2,
                str(base + position),
                color="default",
                size=INDEX_FONT_SIZE,
            )

    for level, annotation in enumerate(ranges, start=1):
        track_y = array_y - level * ANNOTATION_STEP
        _draw_range(sketch, annotation, array_x, array_y, cell_width, track_y)

    for layout in top_arrows:
        track_y = array_y - (len(ranges) + layout.length) * ANNOTATION_STEP
        _draw_vertical_arrow(
            sketch, layout, array_x, array_y, cell_width, track_y
        )

    bottom_origin = array_y + CELL_HEIGHT + index_height
    for layout in bottom_arrows:
        track_y = bottom_origin + layout.length * ANNOTATION_STEP
        _draw_vertical_arrow(
            sketch, layout, array_x, array_y, cell_width, track_y
        )

    for annotation in highlights:
        sketch.rectangle(
            array_x + annotation.position * cell_width,
            array_y,
            cell_width,
            CELL_HEIGHT,
            annotation.color,
            stroke_width=ANNOTATION_STROKE_WIDTH,
            z_index=100,
        )

    return sketch.as_svg(width, height)


def render_multi_array(diagram: MultiArrayDiagram) -> str:
    if diagram.layout == "projection":
        return _render_projected_arrays(diagram)

    cell_width = _multi_array_cell_width(diagram)
    label_width = max(_label_width(row.label) for row in diagram.rows)
    column_count = len(diagram.rows[0].cells)
    index_height = INDEX_HEIGHT if diagram.index != "none" else 0
    width = round(PADDING * 2 + label_width + cell_width * column_count)
    rows_height = CELL_HEIGHT * len(diagram.rows)
    gaps_height = MULTI_ROW_GAP * (len(diagram.rows) - 1)
    height = round(PADDING * 2 + rows_height + gaps_height + index_height)
    array_x = PADDING + label_width

    sketch = Sketch(width, height)
    if diagram.background == "white":
        sketch.background(width, height, PALETTE["background"])

    for row_index, row in enumerate(diagram.rows):
        row_y = PADDING + row_index * (CELL_HEIGHT + MULTI_ROW_GAP)
        for position, cell in enumerate(row.cells):
            x = array_x + position * cell_width
            sketch.rectangle(x, row_y, cell_width, CELL_HEIGHT, "default")
            sketch.text(
                x + cell_width / 2,
                row_y + CELL_HEIGHT / 2,
                str(cell.value),
                size=VALUE_FONT_SIZE,
            )
        if row.label:
            sketch.text(
                array_x - 18,
                row_y + CELL_HEIGHT / 2,
                row.label,
                size=ARRAY_LABEL_FONT_SIZE,
                align="right",
            )

    if diagram.index != "none":
        base = 0 if diagram.index == "0-based" else 1
        bottom = PADDING + rows_height + gaps_height
        for position in range(column_count):
            sketch.text(
                array_x + (position + 0.5) * cell_width,
                bottom + INDEX_GAP + INDEX_FONT_SIZE / 2,
                str(base + position),
                size=INDEX_FONT_SIZE,
            )
    return sketch.as_svg(width, height)


def _render_projected_arrays(diagram: MultiArrayDiagram) -> str:
    cell_width = _multi_array_cell_width(diagram)
    cell_gap = cell_width * PROJECTION_CELL_GAP_RATIO
    column_count = len(diagram.rows[0].cells)
    index_height = INDEX_HEIGHT if diagram.index != "none" else 0
    width = round(
        PADDING * 2
        + cell_width * column_count
        + cell_gap * (column_count - 1)
    )
    height = round(
        PADDING * 2
        + CELL_HEIGHT * 2
        + PROJECTION_VERTICAL_GAP
        + index_height
    )
    array_x = PADDING
    upper_y = PADDING
    lower_y = upper_y + CELL_HEIGHT + PROJECTION_VERTICAL_GAP

    sketch = Sketch(width, height)
    if diagram.background == "white":
        sketch.background(width, height, PALETTE["background"])

    upper, lower = diagram.rows
    for position, cell in enumerate(upper.cells):
        x = array_x + position * (cell_width + cell_gap)
        sketch.rectangle(x, upper_y, cell_width, CELL_HEIGHT, "default")
        sketch.text(
            x + cell_width / 2,
            upper_y + CELL_HEIGHT / 2,
            str(cell.value),
            size=VALUE_FONT_SIZE,
        )
        sketch.dashed_line(
            x + cell_width / 2,
            upper_y + CELL_HEIGHT,
            x + cell_width / 2,
            lower_y,
            "default",
            z_index=-5,
        )

    for position, cell in enumerate(lower.cells):
        x = array_x + position * (cell_width + cell_gap)
        sketch.dashed_rectangle(
            x,
            lower_y,
            cell_width,
            CELL_HEIGHT,
            "default",
            z_index=5,
        )
        sketch.text(
            x + cell_width / 2,
            lower_y + CELL_HEIGHT / 2,
            str(cell.value),
            size=VALUE_FONT_SIZE,
        )

    if diagram.index != "none":
        base = 0 if diagram.index == "0-based" else 1
        for position in range(column_count):
            sketch.text(
                array_x + position * (cell_width + cell_gap) + cell_width / 2,
                lower_y + CELL_HEIGHT + INDEX_GAP + INDEX_FONT_SIZE / 2,
                str(base + position),
                size=INDEX_FONT_SIZE,
            )
    return sketch.as_svg(width, height)


def _draw_vertical_arrow(
    sketch: Sketch,
    layout: ArrowLayout,
    array_x: float,
    array_y: float,
    cell_width: float,
    track_y: float,
) -> None:
    arrow = layout.arrow
    fraction = (layout.slot + 1) / (layout.slot_count + 1)
    x = array_x + (arrow.position + fraction) * cell_width
    target_y = array_y if arrow.side == "top" else array_y + CELL_HEIGHT
    sketch.arrow(
        x,
        track_y,
        x,
        target_y,
        arrow.color,
        stroke_width=ANNOTATION_STROKE_WIDTH,
    )
    if arrow.label is not None:
        offset = ANNOTATION_LABEL_FONT_SIZE * 0.9
        label_y = track_y - offset if arrow.side == "top" else track_y + offset
        sketch.text(
            x,
            label_y,
            arrow.label,
            color=arrow.color,
            size=ANNOTATION_LABEL_FONT_SIZE,
            weight="600",
        )


def _draw_range(
    sketch: Sketch,
    marker: Range,
    array_x: float,
    array_y: float,
    cell_width: float,
    track_y: float,
) -> None:
    left = array_x + marker.start * cell_width
    right = array_x + (marker.end + 1) * cell_width
    middle = (left + right) / 2

    sketch.line(
        left,
        array_y,
        left,
        track_y,
        marker.color,
        stroke_width=ANNOTATION_STROKE_WIDTH,
    )
    sketch.line(
        right,
        array_y,
        right,
        track_y,
        marker.color,
        stroke_width=ANNOTATION_STROKE_WIDTH,
    )
    range_width = right - left
    if _range_label_is_inline(marker, range_width):
        label_width = _text_width(marker.label or "", ANNOTATION_LABEL_FONT_SIZE)
        half_gap = label_width / 2 + INLINE_LABEL_PADDING
        sketch.arrow(
            middle - half_gap,
            track_y,
            left,
            track_y,
            marker.color,
            stroke_width=ANNOTATION_STROKE_WIDTH,
        )
        sketch.arrow(
            middle + half_gap,
            track_y,
            right,
            track_y,
            marker.color,
            stroke_width=ANNOTATION_STROKE_WIDTH,
        )
        sketch.text(
            middle,
            track_y,
            marker.label or "",
            color=marker.color,
            size=ANNOTATION_LABEL_FONT_SIZE,
            weight="600",
        )
    else:
        sketch.arrow(
            middle,
            track_y,
            left,
            track_y,
            marker.color,
            stroke_width=ANNOTATION_STROKE_WIDTH,
        )
        sketch.arrow(
            middle,
            track_y,
            right,
            track_y,
            marker.color,
            stroke_width=ANNOTATION_STROKE_WIDTH,
        )
        if marker.label is not None:
            sketch.text(
                middle,
                track_y - ANNOTATION_LABEL_FONT_SIZE * 0.9,
                marker.label,
                color=marker.color,
                size=ANNOTATION_LABEL_FONT_SIZE,
                weight="600",
            )


def _layout_arrows(arrows: list[Arrow]) -> list[ArrowLayout]:
    counts = Counter(arrow.position for arrow in arrows)
    seen: defaultdict[int, int] = defaultdict(int)
    layouts = []
    for arrow in arrows:
        slot = seen[arrow.position]
        seen[arrow.position] += 1
        length = arrow.length if arrow.length is not None else slot + 1
        layouts.append(
            ArrowLayout(
                arrow=arrow,
                slot=slot,
                slot_count=counts[arrow.position],
                length=length,
            )
        )
    return layouts


def _range_label_is_inline(marker: Range, range_width: float) -> bool:
    if marker.label is None:
        return False
    label_width = _text_width(marker.label, ANNOTATION_LABEL_FONT_SIZE)
    required = label_width + 2 * (INLINE_LABEL_PADDING + MIN_RANGE_ARROW_LENGTH)
    return required <= range_width


def _cell_width(diagram: Diagram) -> float:
    content_width = max(
        _text_width(str(cell.value), VALUE_FONT_SIZE) for cell in diagram.cells
    )
    return max(MIN_CELL_WIDTH, content_width + CELL_HORIZONTAL_PADDING * 2)


def _label_width(label: str | None) -> float:
    if label is None:
        return 0
    return _text_width(label, ARRAY_LABEL_FONT_SIZE) + LABEL_GAP


def _multi_array_cell_width(diagram: MultiArrayDiagram) -> float:
    content_width = max(
        _text_width(str(cell.value), VALUE_FONT_SIZE)
        for row in diagram.rows
        for cell in row.cells
    )
    return max(MIN_CELL_WIDTH, content_width + CELL_HORIZONTAL_PADDING * 2)
