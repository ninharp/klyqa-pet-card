#!/usr/bin/env python3
"""Prepare product images for the klyqa-pet-card bundle.

Reads source renders from ~/workspace/klyq-produktbilder/, crops them to
content, adds a small padding margin, downsizes them, and writes:

  - src/assets/welly.png          (from klyq-produktbilder/welly/*.png)
  - src/assets/airpurifier.png    (from klyq-produktbilder/klyna/AirKlyna-Render-3_4.png)
  - src/assets/airpurifier-top.png (from klyq-produktbilder/klyna/AirKlyna-Render-Top.png)
  - src/assets/foody.svg          (hand-drawn flat placeholder, no source image exists yet)
  - src/assets/index.ts           (exports each image as an embedded data URI / raw SVG
                                    string, so the final Vite bundle stays a single file)

Run with the ha-klyqa-pet venv (has Pillow):
  /Users/michael/workspace/ha-klyqa-pet/.venv/bin/python scripts/prepare-images.py

Re-run any time the source renders change; this script is idempotent.
"""

from __future__ import annotations

import base64
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = Path.home() / "workspace" / "klyq-produktbilder"
ASSETS_DIR = REPO_ROOT / "src" / "assets"

MAX_DIMENSION = 220  # keeps the final bundle well under the 300 KB budget
PADDING_FRACTION = 0.04  # 4% of the larger cropped dimension, on every side

WELLY_SOURCE = SOURCE_ROOT / "welly" / "SCR-20260905-ukus.png"
AIRPURIFIER_SOURCE = SOURCE_ROOT / "klyna" / "AirKlyna-Render-3_4.png"
AIRPURIFIER_TOP_SOURCE = SOURCE_ROOT / "klyna" / "AirKlyna-Render-Top.png"

# Whiteness -> alpha thresholds for the Welly screenshot (white studio background).
# Pixels at or above WHITE_FULL are fully transparent; pixels at or below WHITE_KEEP
# stay fully opaque; everything between fades linearly, which keeps the soft drop
# shadow underneath the product instead of hard-cutting it away.
WHITE_KEEP = 225
WHITE_FULL = 253


def whiten_to_alpha(image: Image.Image) -> Image.Image:
    """Convert a white-background photo to a transparent PNG, preserving soft shadows."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            brightness = min(r, g, b)
            if brightness >= WHITE_FULL:
                alpha = 0
            elif brightness <= WHITE_KEEP:
                alpha = a
            else:
                fade = (WHITE_FULL - brightness) / (WHITE_FULL - WHITE_KEEP)
                alpha = int(a * fade)
            pixels[x, y] = (r, g, b, alpha)
    return rgba


def crop_to_content(image: Image.Image, padding_fraction: float) -> Image.Image:
    """Crop to the alpha bounding box, then add symmetric padding."""
    bbox = image.getbbox()
    if bbox is None:
        return image
    cropped = image.crop(bbox)
    width, height = cropped.size
    pad = int(round(max(width, height) * padding_fraction))
    padded = Image.new("RGBA", (width + 2 * pad, height + 2 * pad), (0, 0, 0, 0))
    padded.paste(cropped, (pad, pad), cropped)
    return padded


def downscale(image: Image.Image, max_dimension: int) -> Image.Image:
    width, height = image.size
    scale = min(1.0, max_dimension / max(width, height))
    if scale >= 1.0:
        return image
    new_size = (max(1, round(width * scale)), max(1, round(height * scale)))
    return image.resize(new_size, Image.LANCZOS)


def save_optimized_png(image: Image.Image, path: Path) -> None:
    # Quantizing to an adaptive palette drastically shrinks flat-colour product
    # renders while keeping the alpha channel (mode "PA"/"RGBA" via palette + alpha).
    quantized = image.quantize(colors=48, method=Image.FASTOCTREE)
    quantized = quantized.convert("RGBA")
    # Re-apply original alpha, since palette quantization can shift the alpha channel.
    quantized.putalpha(image.getchannel("A"))
    quantized.save(path, format="PNG", optimize=True)


def to_data_uri(path: Path) -> str:
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{data}"


def process_photo(source: Path, dest: Path) -> None:
    image = Image.open(source)
    image = whiten_to_alpha(image) if source == WELLY_SOURCE else image.convert("RGBA")
    image = crop_to_content(image, PADDING_FRACTION)
    image = downscale(image, MAX_DIMENSION)
    save_optimized_png(image, dest)
    print(f"{dest.name}: {image.size[0]}x{image.size[1]}, {dest.stat().st_size} bytes")


FOODY_SVG = """<svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bodyShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f7f7f5"/>
      <stop offset="100%" stop-color="#e7e7e3"/>
    </linearGradient>
  </defs>
  <ellipse cx="240" cy="420" rx="150" ry="18" fill="#000000" opacity="0.08"/>
  <rect x="90" y="60" width="300" height="300" rx="36" fill="url(#bodyShade)" stroke="#d8d8d4" stroke-width="2"/>
  <rect x="90" y="60" width="300" height="70" rx="36" fill="#f2c230"/>
  <rect x="90" y="118" width="300" height="12" fill="#f2c230"/>
  <circle cx="240" cy="95" r="14" fill="#3a3a3a"/>
  <rect x="150" y="170" width="180" height="130" rx="14" fill="#3a3a3a"/>
  <rect x="162" y="182" width="156" height="70" rx="8" fill="#f2f2f0" opacity="0.15"/>
  <ellipse cx="240" cy="380" rx="120" ry="46" fill="#3a3a3a"/>
  <ellipse cx="240" cy="374" rx="98" ry="34" fill="#f2f2f0"/>
  <ellipse cx="240" cy="374" rx="98" ry="34" fill="#f2c230" opacity="0.18"/>
</svg>
"""


def write_foody_svg() -> Path:
    dest = ASSETS_DIR / "foody.svg"
    dest.write_text(FOODY_SVG, encoding="utf-8")
    print(f"{dest.name}: vector placeholder, {dest.stat().st_size} bytes")
    return dest


def write_assets_index(welly: Path, airpurifier: Path, airpurifier_top: Path, foody_svg: Path) -> None:
    dest = ASSETS_DIR / "index.ts"
    dest.write_text(
        "// Generated by scripts/prepare-images.py — do not edit by hand.\n"
        "// Images are embedded as data URIs (PNG) or raw markup (SVG) so the\n"
        "// final Vite bundle stays a single file.\n\n"
        f'export const WELLY_IMAGE = "{to_data_uri(welly)}";\n\n'
        f'export const AIRPURIFIER_IMAGE = "{to_data_uri(airpurifier)}";\n\n'
        f'export const AIRPURIFIER_TOP_IMAGE = "{to_data_uri(airpurifier_top)}";\n\n'
        f"export const FOODY_SVG = `{foody_svg.read_text(encoding='utf-8').strip()}`;\n",
        encoding="utf-8",
    )
    print(f"{dest.name}: {dest.stat().st_size} bytes")


def main() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    welly_dest = ASSETS_DIR / "welly.png"
    airpurifier_dest = ASSETS_DIR / "airpurifier.png"
    airpurifier_top_dest = ASSETS_DIR / "airpurifier-top.png"

    process_photo(WELLY_SOURCE, welly_dest)
    process_photo(AIRPURIFIER_SOURCE, airpurifier_dest)
    process_photo(AIRPURIFIER_TOP_SOURCE, airpurifier_top_dest)
    foody_svg = write_foody_svg()

    write_assets_index(welly_dest, airpurifier_dest, airpurifier_top_dest, foody_svg)


if __name__ == "__main__":
    main()
