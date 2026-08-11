from __future__ import annotations

from html import escape
from math import atan2, cos, pi, sin

from rough import Options, canvas

from .theme import (
    DASH_PATTERN,
    FONT_FAMILY,
    PALETTE,
    ROUGHNESS,
    STROKE_WIDTH,
)

class Sketch:
    def __init__(self, width: int, height: int) -> None:
        self.canvas = canvas(width, height)
        self.seed = 100
        self.text_items: list[dict[str, str | float]] = []

    def line(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        color: str,
        *,
        stroke_width: float = STROKE_WIDTH,
        z_index: int = 2,
    ) -> None:
        self.canvas.line(
            x1,
            y1,
            x2,
            y2,
            self._stroke(color, stroke_width),
            z_index=z_index,
        )

    def dashed_line(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        color: str,
        *,
        stroke_width: float = STROKE_WIDTH,
        z_index: int = 2,
    ) -> None:
        self.canvas.line(
            x1,
            y1,
            x2,
            y2,
            self._stroke(
                color,
                stroke_width,
                stroke_line_dash=DASH_PATTERN,
            ),
            z_index=z_index,
        )

    def rectangle(
        self,
        x: float,
        y: float,
        width: float,
        height: float,
        color: str,
        *,
        stroke_width: float = STROKE_WIDTH,
        z_index: int = 1,
    ) -> None:
        self.canvas.rectangle(
            x,
            y,
            width,
            height,
            self._stroke(color, stroke_width),
            z_index=z_index,
        )

    def dashed_rectangle(
        self,
        x: float,
        y: float,
        width: float,
        height: float,
        color: str,
        *,
        stroke_width: float = STROKE_WIDTH,
        z_index: int = 1,
    ) -> None:
        self.canvas.rectangle(
            x,
            y,
            width,
            height,
            self._stroke(
                color,
                stroke_width,
                stroke_line_dash=DASH_PATTERN,
            ),
            z_index=z_index,
        )

    def circle(
        self,
        x: float,
        y: float,
        diameter: float,
        color: str,
        *,
        stroke_width: float = STROKE_WIDTH,
        z_index: int = 1,
    ) -> None:
        self.canvas.circle(
            x,
            y,
            diameter,
            self._stroke(
                color,
                stroke_width,
                roughness=ROUGHNESS,
                max_randomness_offset=0.0,
            ),
            z_index=z_index,
        )

    def arc(
        self,
        x: float,
        y: float,
        width: float,
        height: float,
        start: float,
        stop: float,
        color: str,
        *,
        stroke_width: float = STROKE_WIDTH,
        z_index: int = 2,
    ) -> None:
        self.canvas.arc(
            x,
            y,
            width,
            height,
            start,
            stop,
            False,
            self._stroke(color, stroke_width),
            z_index=z_index,
        )

    def background(self, width: int, height: int, color: str) -> None:
        self.canvas.rectangle(
            0,
            0,
            width,
            height,
            Options(
                stroke="none",
                strokeWidth=0,
                fill=color,
                fillStyle="solid",
                roughness=0,
            ),
            z_index=-100,
        )

    def text(
        self,
        x: float,
        y: float,
        value: str,
        *,
        color: str = "default",
        size: float = 18,
        align: str = "center",
        valign: str = "middle",
        weight: str = "normal",
    ) -> None:
        self.text_items.append(
            {
                "x": x,
                "y": y,
                "value": value,
                "color": PALETTE[color],
                "size": size,
                "align": align,
                "valign": valign,
                "weight": weight,
            }
        )

    def as_svg(self, width: int, height: int) -> str:
        svg = self.canvas.as_svg(width, height, auto_fit=False)
        svg = svg.replace(
            f'<svg width="{width}" height="{height}"',
            f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}"',
            1,
        )
        text_lines = []
        anchors = {"left": "start", "center": "middle", "right": "end"}
        baselines = {"top": "hanging", "middle": "central", "baseline": "auto"}
        for item in self.text_items:
            text_lines.append(
                "  <text "
                f'x="{_number(item["x"])}" y="{_number(item["y"])}" '
                f'fill="{item["color"]}" font-size="{_number(item["size"])}" '
                f'font-family="{escape(FONT_FAMILY, quote=True)}" '
                f'font-weight="{item["weight"]}" '
                f'text-anchor="{anchors[str(item["align"])]}" '
                f'dominant-baseline="{baselines[str(item["valign"])]}" '
                'style="pointer-events: none; user-select: none;">'
                f'{escape(str(item["value"]))}</text>'
            )
        return svg.replace("</svg>", "\n".join(text_lines) + "\n</svg>")

    def arrow(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        color: str,
        *,
        stroke_width: float = STROKE_WIDTH,
        z_index: int = 2,
    ) -> None:
        self.line(
            x1,
            y1,
            x2,
            y2,
            color,
            stroke_width=stroke_width,
            z_index=z_index,
        )
        angle = atan2(y2 - y1, x2 - x1)
        head = 9
        for offset in (-pi / 6, pi / 6):
            wing = angle + pi + offset
            self.line(
                x2,
                y2,
                x2 + head * cos(wing),
                y2 + head * sin(wing),
                color,
                stroke_width=stroke_width,
                z_index=z_index,
            )

    def arrow_head(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        color: str,
        *,
        stroke_width: float = STROKE_WIDTH,
        z_index: int = 2,
    ) -> None:
        angle = atan2(y2 - y1, x2 - x1)
        head = 9
        for offset in (-pi / 6, pi / 6):
            wing = angle + pi + offset
            self.line(
                x2,
                y2,
                x2 + head * cos(wing),
                y2 + head * sin(wing),
                color,
                stroke_width=stroke_width,
                z_index=z_index,
            )

    def _stroke(
        self,
        color: str,
        stroke_width: float = STROKE_WIDTH,
        *,
        roughness: float = ROUGHNESS,
        max_randomness_offset: float = 0.0,
        stroke_line_dash: list[float] | None = None,
    ) -> Options:
        self.seed += 1
        return Options(
            stroke=PALETTE[color],
            strokeWidth=stroke_width,
            roughness=roughness,
            bowing=0,
            maxRandomnessOffset=max_randomness_offset,
            seed=self.seed,
            disableMultiStroke=True,
            preserveVertices=True,
            fixedDecimalPlaceDigits=2,
            strokeLineDash=stroke_line_dash,
        )

def _number(value: str | float) -> str:
    number = float(value)
    if number.is_integer():
        return str(int(number))
    return f"{number:.2f}".rstrip("0").rstrip(".")
