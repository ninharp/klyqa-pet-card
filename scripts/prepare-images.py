#!/usr/bin/env python3
"""Prepare product images for the klyqa-pet-card bundle.

Reads source renders from ~/workspace/klyq-produktbilder/, crops them to
content, adds a small padding margin, downsizes them, and writes:

  - src/assets/welly-<color>.webp       (one per WELLY_COLORS entry)
  - src/assets/airpurifier.webp         (front render, no sleeve)
  - src/assets/airpurifier-sleeve-<name>.webp  (one per AIRPURIFIER_SLEEVES entry)
  - src/assets/foody.webp               (front render)
  - src/assets/index.ts                 (exports each image as an embedded data URI
                                          string, so the final Vite bundle stays a single file)

Images are saved as lossy WEBP rather than a quantized/dithered PNG palette: a
256-color palette produces visible speckling and dull colors on these
photographic renders (gradients, glossy surfaces), whereas WEBP keeps full
24-bit color with no dithering artifacts at a *smaller* file size.

Note: src/assets/airpurifier-top.webp (control-panel top view) is NOT
regenerated from a fresh source here — its source render no longer exists in
klyq-produktbilder, so the previously generated (dithered PNG) derivative is
just re-encoded to WEBP as-is. Its dithering artifacts predate this and can't
be fixed without the original render.

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

MAX_DIMENSION = 480  # WEBP keeps this cheap; sharper than the old 320px PNG budget
WEBP_QUALITY = 90
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
# The old derivative (see module docstring) — re-encoded, not reprocessed.
AIRPURIFIER_TOP_LEGACY_SOURCE = ASSETS_DIR / "airpurifier-top.png"
AIRPURIFIER_TOP_DEST = ASSETS_DIR / "airpurifier-top.webp"

# Sleeve mockups are only rendered in the straight-on pose (AirKlyna-Product3.png's
# framing baked in), so selecting a sleeve always shows that pose, not the 3/4 hero.
AIRPURIFIER_SLEEVES: dict[str, Path] = {
    "mountains": SOURCE_ROOT / "klyna" / "AirKlyna-Sleeves-Mockup-01.png",
    "pets": SOURCE_ROOT / "klyna" / "AirKlyna-Sleeves-Mockup-02.png",
    "leaves": SOURCE_ROOT / "klyna" / "AirKlyna-Sleeves-Mockup-03.png",
}

FOODY_SOURCE = SOURCE_ROOT / "foody" / "Foody-image-placeholder.png"


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


def save_webp(image: Image.Image, path: Path) -> None:
    image.save(path, format="WEBP", quality=WEBP_QUALITY, method=6)


def to_data_uri(path: Path) -> str:
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/webp;base64,{data}"


def process_photo(source: Path, dest: Path) -> None:
    image = Image.open(source).convert("RGBA")
    image = crop_to_content(image, PADDING_FRACTION)
    image = downscale(image, MAX_DIMENSION)
    save_webp(image, dest)
    print(f"{dest.name}: {image.size[0]}x{image.size[1]}, {dest.stat().st_size} bytes")


def reencode_legacy_top(source: Path, dest: Path) -> None:
    image = Image.open(source).convert("RGBA")
    save_webp(image, dest)
    print(f"{dest.name}: {image.size[0]}x{image.size[1]}, {dest.stat().st_size} bytes (re-encoded, not reprocessed)")


def write_assets_index(
    welly: dict[str, Path],
    airpurifier: Path,
    airpurifier_top: Path,
    sleeves: dict[str, Path],
    foody: Path,
) -> None:
    dest = ASSETS_DIR / "index.ts"
    welly_entries = ",\n".join(f'  {color}: "{to_data_uri(path)}"' for color, path in welly.items())
    sleeve_entries = ",\n".join(f'  {name}: "{to_data_uri(path)}"' for name, path in sleeves.items())
    dest.write_text(
        "// Generated by scripts/prepare-images.py — do not edit by hand.\n"
        "// Images are embedded as data URIs so the final Vite bundle stays a single file.\n\n"
        "export const WELLY_IMAGES: Record<string, string> = {\n"
        f"{welly_entries},\n"
        "};\n\n"
        f'export const AIRPURIFIER_IMAGE = "{to_data_uri(airpurifier)}";\n\n'
        f'export const AIRPURIFIER_TOP_IMAGE = "{to_data_uri(airpurifier_top)}";\n\n'
        "export const AIRPURIFIER_SLEEVE_IMAGES: Record<string, string> = {\n"
        f"{sleeve_entries},\n"
        "};\n\n"
        f'export const FOODY_IMAGE = "{to_data_uri(foody)}";\n',
        encoding="utf-8",
    )
    print(f"{dest.name}: {dest.stat().st_size} bytes")


def main() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    welly_dest = {color: ASSETS_DIR / f"welly-{color}.webp" for color in WELLY_COLORS}
    airpurifier_dest = ASSETS_DIR / "airpurifier.webp"
    sleeve_dest = {name: ASSETS_DIR / f"airpurifier-sleeve-{name}.webp" for name in AIRPURIFIER_SLEEVES}
    foody_dest = ASSETS_DIR / "foody.webp"

    for color, source in WELLY_COLORS.items():
        process_photo(source, welly_dest[color])
    process_photo(AIRPURIFIER_SOURCE, airpurifier_dest)
    reencode_legacy_top(AIRPURIFIER_TOP_LEGACY_SOURCE, AIRPURIFIER_TOP_DEST)
    for name, source in AIRPURIFIER_SLEEVES.items():
        process_photo(source, sleeve_dest[name])
    process_photo(FOODY_SOURCE, foody_dest)

    write_assets_index(welly_dest, airpurifier_dest, AIRPURIFIER_TOP_DEST, sleeve_dest, foody_dest)


if __name__ == "__main__":
    main()
