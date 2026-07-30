from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "brand" / "card-en.png"
OUT_DIR = ROOT / "public" / "brand"
ICONS = ROOT / "public" / "icons"


def make_logo(crop: Image.Image, white: bool, size: int = 512) -> Image.Image:
    rgba = crop.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            if r > 240 and g > 240 and b > 240:
                pixels[x, y] = (0, 0, 0, 0)
            elif white:
                lum = int(0.299 * r + 0.587 * g + 0.114 * b)
                alpha = min(255, max(0, 255 - lum + 30))
                if alpha < 25:
                    alpha = 0
                pixels[x, y] = (255, 255, 255, alpha)
            else:
                pixels[x, y] = (r, g, b, 255)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = min(size / w, size / h) * 0.94
    nw, nh = int(w * scale), int(h * scale)
    resized = rgba.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def app_icon(logo: Image.Image, size: int) -> Image.Image:
    bg = Image.new("RGBA", (size, size), (92, 10, 26, 255))
    pad = int(size * 0.12)
    scaled = logo.resize((size - 2 * pad, size - 2 * pad), Image.Resampling.LANCZOS)
    bg.paste(scaled, (pad, pad), scaled)
    return bg.convert("RGB")


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    # Crest bounds from content scan + padding
    crop = img.crop((341, 60, 684, 387))
    logo = make_logo(crop, white=False)
    logo_light = make_logo(crop, white=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ICONS.mkdir(parents=True, exist_ok=True)
    logo.save(OUT_DIR / "logo.png", optimize=True)
    logo_light.save(OUT_DIR / "logo-light.png", optimize=True)
    logo.save(OUT_DIR / "logo.webp", "WEBP", quality=90, method=6)
    logo_light.save(OUT_DIR / "logo-light.webp", "WEBP", quality=90, method=6)
    app_icon(logo_light, 192).save(ICONS / "icon-192.png", optimize=True)
    app_icon(logo_light, 512).save(ICONS / "icon-512.png", optimize=True)
    logo.save(ROOT / "public" / "favicon.png", optimize=True)
    # OG image
    og = Image.new("RGB", (1200, 630), (255, 255, 255))
    mark = logo.resize((420, 420), Image.Resampling.LANCZOS)
    og.paste(mark, ((1200 - 420) // 2, (630 - 420) // 2), mark)
    og.save(OUT_DIR / "og.png", optimize=True)
    print("OK", (OUT_DIR / "logo.png").stat().st_size)


if __name__ == "__main__":
    main()
