from __future__ import annotations


def text_width(value: str, font_size: float) -> float:
    wide = sum(1 for character in value if ord(character) > 127)
    narrow = len(value) - wide
    return wide * font_size + narrow * font_size * 0.56
