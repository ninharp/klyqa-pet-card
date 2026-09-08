#!/usr/bin/env python3
"""Prepare product images for the klyqa-pet-card bundle.

Reads source renders from ~/workspace/klyq-produktbilder/, crops them to
content, adds a small padding margin, downsizes them, and writes:

  - src/assets/welly-<color>.png       (one per WELLY_COLORS entry)
  - src/assets/airpurifier.png         (front render, no sleeve)
  - src/assets/airpurifier-sleeve-<name>.png  (one per AIRPURIFIER_SLEEVES entry)

Note: src/assets/airpurifier-top.png (control-panel top view) is NOT regenerated
here — its source render no longer exists in klyq-produktbilder, so the
previously generated file is kept and just re-encoded into index.ts.
  - src/assets/foody.svg               (hand-drawn flat placeholder, no source image exists yet)
  - src/assets/index.ts                (exports each image as an embedded data URI / raw SVG
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

MAX_DIMENSION = 320  # keeps each embedded image well-compressed
PADDING_FRACTION = 0.04  # 4% of the larger cropped dimension, on every side

# Welly renders already ship with an alpha-transparent background, one file per color.
# Filenames use the source's German "lavendel"; the TS-facing color name is "lavender".
WELLY_COLORS: dict[str, Path] = {
    "white": SOURCE_ROOT / "welly" / "Welly-Device-white.png",
    "black": SOURCE_ROOT / "welly" / "Welly-Device-black.png",
    "blue": SOURCE_ROOT / "welly" / "Welly-Device-blue.png",
    "green": SOURCE_ROOT / "welly" / "Welly-Device-green.png",
    "lavender": SOURCE_ROOT / "welly" / "Welly-Device-lavendel.png",
    "pink": SOURCE_ROOT / "welly" / "Welly-Device-pink.png",
    "yellow": SOURCE_ROOT / "welly" / "Welly-Device-yellow.png",
}
DEFAULT_WELLY_COLOR = "white"

AIRPURIFIER_SOURCE = SOURCE_ROOT / "klyna" / "Air-Klyna-HighRes-shadows-02.png"
# No source render exists for the top view anymore (removed from klyq-produktbilder
# when the color/sleeve renders were added) — the previously generated derivative
# in ASSETS_DIR is kept as-is and just re-encoded into index.ts below.
AIRPURIFIER_TOP_DEST = ASSETS_DIR / "airpurifier-top.png"

# Sleeve mockups are only rendered in the straight-on pose (AirKlyna-Product3.png's
# framing baked in), so selecting a sleeve always shows that pose, not the 3/4 hero.
AIRPURIFIER_SLEEVES: dict[str, Path] = {
    "mountains": SOURCE_ROOT / "klyna" / "AirKlyna-Sleeves-Mockup-01.png",
    "pets": SOURCE_ROOT / "klyna" / "AirKlyna-Sleeves-Mockup-02.png",
    "leaves": SOURCE_ROOT / "klyna" / "AirKlyna-Sleeves-Mockup-03.png",
}


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
    # Quantizing to an adaptive palette shrinks the product renders while keeping
    # the alpha channel. Dithering hides the banding a small palette would
    # otherwise leave in glossy/gradient areas (e.g. the Air Klyna's top).
    quantized = image.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG)
    quantized = quantized.convert("RGBA")
    # Re-apply original alpha, since palette quantization can shift the alpha channel.
    quantized.putalpha(image.getchannel("A"))
    quantized.save(path, format="PNG", optimize=True)


def to_data_uri(path: Path) -> str:
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{data}"


def process_photo(source: Path, dest: Path) -> None:
    image = Image.open(source).convert("RGBA")
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


def write_assets_index(
    welly: dict[str, Path],
    airpurifier: Path,
    airpurifier_top: Path,
    sleeves: dict[str, Path],
    foody_svg: Path,
) -> None:
    dest = ASSETS_DIR / "index.ts"
    welly_entries = ",\n".join(f'  {color}: "{to_data_uri(path)}"' for color, path in welly.items())
    sleeve_entries = ",\n".join(f'  {name}: "{to_data_uri(path)}"' for name, path in sleeves.items())
    dest.write_text(
        "// Generated by scripts/prepare-images.py — do not edit by hand.\n"
        "// Images are embedded as data URIs (PNG) or raw markup (SVG) so the\n"
        "// final Vite bundle stays a single file.\n\n"
        "export const WELLY_IMAGES: Record<string, string> = {\n"
        f"{welly_entries},\n"
        "};\n\n"
        f'export const AIRPURIFIER_IMAGE = "{to_data_uri(airpurifier)}";\n\n'
        f'export const AIRPURIFIER_TOP_IMAGE = "{to_data_uri(airpurifier_top)}";\n\n'
        "export const AIRPURIFIER_SLEEVE_IMAGES: Record<string, string> = {\n"
        f"{sleeve_entries},\n"
        "};\n\n"
        f"export const FOODY_SVG = `{foody_svg.read_text(encoding='utf-8').strip()}`;\n",
        encoding="utf-8",
    )
    print(f"{dest.name}: {dest.stat().st_size} bytes")


def main() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    welly_dest = {color: ASSETS_DIR / f"welly-{color}.png" for color in WELLY_COLORS}
    airpurifier_dest = ASSETS_DIR / "airpurifier.png"
    sleeve_dest = {name: ASSETS_DIR / f"airpurifier-sleeve-{name}.png" for name in AIRPURIFIER_SLEEVES}

    for color, source in WELLY_COLORS.items():
        process_photo(source, welly_dest[color])
    process_photo(AIRPURIFIER_SOURCE, airpurifier_dest)
    for name, source in AIRPURIFIER_SLEEVES.items():
        process_photo(source, sleeve_dest[name])
    foody_svg = write_foody_svg()

    write_assets_index(welly_dest, airpurifier_dest, AIRPURIFIER_TOP_DEST, sleeve_dest, foody_svg)


if __name__ == "__main__":
    main()
