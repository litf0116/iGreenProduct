#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

SOURCE_ICON = "/Users/mac/workspace/iGreenProduct/iGreenApp/public/favicon.png"

SIZES = {
    "ldpi": 36,
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

BASE_DIR = "/Users/mac/workspace/iGreenProduct/iGreenApp/android/app/src/main/res"


def create_rounded_icon(img, size, corner_radius_factor=0.2):
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    corner_radius = int(size * corner_radius_factor)
    draw.rounded_rectangle((0, 0, size, size), radius=corner_radius, fill=255)
    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)
    return output


def create_circle_icon(img, size):
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)
    return output


def extract_foreground(img, size):
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    return img


def create_background(size, color=(0, 200, 100, 255)):
    return Image.new("RGBA", (size, size), color)


def main():
    print("Loading source icon...")
    source = Image.open(SOURCE_ICON)
    if source.mode != "RGBA":
        source = source.convert("RGBA")

    print(f"Source size: {source.size}")

    for density, size in SIZES.items():
        mipmap_dir = os.path.join(BASE_DIR, f"mipmap-{density}")
        os.makedirs(mipmap_dir, exist_ok=True)

        print(f"\nGenerating icons for {density} ({size}x{size})...")

        normal_icon = create_rounded_icon(source, size, corner_radius_factor=0.15)
        normal_path = os.path.join(mipmap_dir, "ic_launcher.png")
        normal_icon.save(normal_path, "PNG")
        print(f"  ✓ {normal_path}")

        round_icon = create_circle_icon(source, size)
        round_path = os.path.join(mipmap_dir, "ic_launcher_round.png")
        round_icon.save(round_path, "PNG")
        print(f"  ✓ {round_path}")

        foreground = extract_foreground(source, size)
        foreground_path = os.path.join(mipmap_dir, "ic_launcher_foreground.png")
        foreground.save(foreground_path, "PNG")
        print(f"  ✓ {foreground_path}")

        background = create_background(size, color=(0, 200, 100, 255))
        background_path = os.path.join(mipmap_dir, "ic_launcher_background.png")
        background.save(background_path, "PNG")
        print(f"  ✓ {background_path}")

    print("\n✅ All icons generated successfully!")
    print(f"\nGenerated for densities: {', '.join(SIZES.keys())}")


if __name__ == "__main__":
    main()
