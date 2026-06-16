"""Dev-only icon generator for Casino Edge Companion.

Writes the PWA PNG icons using only the Python standard library (no Pillow).
Re-run from the project root to regenerate:

    python tools/make-icons.py

Produces icons/icon-192.png, icons/icon-512.png, icons/apple-touch-icon-180.png.
The design is a poker chip: full-bleed dark background (safe as a maskable icon),
a green chip body with a gold rim, six gold edge spots, and a gold center pip.
Not used at runtime; the app ships the generated PNGs.
"""

import math
import os
import struct
import zlib

BG = (13, 11, 30)        # deep navy, full bleed
GOLD = (212, 175, 55)
GREEN = (31, 122, 77)
GREEN_DK = (20, 86, 54)


def _chunk(tag, data):
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def write_png(path, size):
    cx = cy = (size - 1) / 2.0
    r_rim = 0.46 * size
    r_body = 0.40 * size
    r_inner_ring = 0.20 * size
    r_inner_body = 0.165 * size
    r_pip = 0.05 * size
    r_spot = 0.055 * size
    spot_r = 0.43 * size
    spots = [
        (cx + spot_r * math.cos(a), cy + spot_r * math.sin(a))
        for a in [math.radians(d) for d in range(0, 360, 60)]
    ]

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter type 0
        for x in range(size):
            dx, dy = x - cx, y - cy
            d2 = dx * dx + dy * dy
            r, g, b = BG
            if d2 <= r_rim * r_rim:
                r, g, b = GOLD
            if d2 <= r_body * r_body:
                r, g, b = GREEN
            # gold edge spots straddle the rim
            for sx, sy in spots:
                if (x - sx) ** 2 + (y - sy) ** 2 <= r_spot * r_spot:
                    r, g, b = GOLD
            if d2 <= r_inner_ring * r_inner_ring:
                r, g, b = GOLD
            if d2 <= r_inner_body * r_inner_body:
                r, g, b = GREEN_DK
            if d2 <= r_pip * r_pip:
                r, g, b = GOLD
            raw += bytes((r, g, b, 255))

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    png = sig + _chunk(b"IHDR", ihdr) + _chunk(b"IDAT", idat) + _chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print("wrote", path, size, "x", size)


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(here, "icons")
    os.makedirs(out, exist_ok=True)
    write_png(os.path.join(out, "icon-192.png"), 192)
    write_png(os.path.join(out, "icon-512.png"), 512)
    write_png(os.path.join(out, "apple-touch-icon-180.png"), 180)


if __name__ == "__main__":
    main()
