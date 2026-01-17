#!/usr/bin/env python3
"""
图标放大脚本 - 使用 macOS 内置工具 (sips)

功能:
- 将 626x588 图标放大到 1024x1024
- 自动生成 7 个常用尺寸
- 支持启动图生成
- 无需安装额外依赖 (使用 macOS 内置 sips)
"""

import os
import subprocess
from pathlib import Path


class IconGenerator:
    """图标生成器"""

    def upscale_with_sips(self, input_path: str, output_path: str, target_size: tuple):
        """使用 macOS sips 进行图片缩放"""
        width, height = target_size

        cmd = [
            "sips",
            "-z",
            str(height),
            str(width),
            str(input_path),
            "--out",
            str(output_path),
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            raise RuntimeError(f"sips failed: {result.stderr}")

        print(f"  ✅ 已保存: {os.path.basename(output_path)}")

    def upscale_with_pil(self, input_path: str, output_path: str, target_size: tuple):
        """使用 PIL 进行图片缩放 (更高质量)"""
        from PIL import Image, ImageOps

        img = Image.open(str(input_path))
        img = ImageOps.contain(img, target_size, method=Image.LANCZOS)

        background = Image.new("RGB", target_size, (255, 255, 255))

        img = img.convert("RGB")
        bg_w, bg_h = background.size
        img_w, img_h = img.size
        offset = ((bg_w - img_w) // 2, (bg_h - img_h) // 2)
        background.paste(img, offset)

        background.save(str(output_path), "PNG")
        print(f"  ✅ 已保存: {os.path.basename(output_path)}")

    def upscale(self, input_path: str, output_path: str, target_size: tuple):
        """缩放图片 (优先使用 PIL，否则使用 sips)"""
        try:
            from PIL import Image, ImageOps

            self.upscale_with_pil(input_path, output_path, target_size)
        except ImportError:
            self.upscale_with_sips(input_path, output_path, target_size)

    def generate_app_icons(self, source_path: str, output_dir: str):
        """生成所有 App 图标尺寸"""
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        sizes = {
            "app-icon-1024.png": (1024, 1024),
            "app-icon-192.png": (192, 192),
            "app-icon-180.png": (180, 180),
            "app-icon-144.png": (144, 144),
            "app-icon-96.png": (96, 96),
            "app-icon-72.png": (72, 72),
            "app-icon-48.png": (48, 48),
        }

        print(f"\n🎨 生成 App 图标...")
        print(f"   源文件: {source_path}")
        print(f"   输出目录: {output_dir}\n")

        for filename, size in sizes.items():
            output_path = os.path.join(output_dir, filename)
            self.upscale(source_path, output_path, size)

        print(f"\n✅ 图标生成完成! 共 {len(sizes)} 个文件")

    def generate_splash_with_pil(
        self, source_path: str, output_dir: str, color: tuple = (13, 148, 136)
    ):
        """使用 PIL 生成启动图"""
        from PIL import Image, ImageDraw, ImageOps

        Path(output_dir).mkdir(parents=True, exist_ok=True)

        splash_sizes = {
            "splash-iphone.png": (1242, 2208),
            "splash-android.png": (1080, 1920),
        }

        print(f"\n🖼️ 生成启动图...")

        for filename, size in splash_sizes.items():
            print(f"  📐 {filename} ({size[0]}x{size[1]})")

            img = Image.new("RGB", size, color)

            icon = Image.open(str(source_path))
            icon = icon.resize(
                (int(size[0] * 0.25), int(size[0] * 0.25)), Image.LANCZOS
            )

            icon_x = (size[0] - icon.width) // 2
            icon_y = (size[1] - icon.height) // 2
            img.paste(icon, (icon_x, icon_y))

            output_path = os.path.join(output_dir, filename)
            img.save(output_path, "PNG")
            print(f"  ✅ 已保存: {filename}")

        print(f"\n✅ 启动图生成完成!")

    def generate_splash_with_sips(
        self, source_path: str, output_dir: str, color: tuple = (13, 148, 136)
    ):
        """使用 sips 和简单命令生成启动图 (简化版)"""
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        splash_sizes = {
            "splash-iphone.png": (1242, 2208),
            "splash-android.png": (1080, 1920),
        }

        print(f"\n🖼️ 生成启动图 (简化模式)...")

        for filename, size in splash_sizes.items():
            print(f"  📐 {filename} ({size[0]}x{size[1]})")

            width, height = size

            # 缩放图标
            icon_resized = Path(output_dir) / "temp_icon.png"
            self.upscale_with_sips(
                source_path, str(icon_resized), (int(width * 0.25), int(width * 0.25))
            )

            # 使用 ImageMagick 或 sips 创建背景 + 组合 (简化: 只创建纯色背景)
            cmd = [
                "convert",
                "-size",
                f"{width}x{height}",
                f"xc:rgb({color[0]},{color[1]},{color[2]})",
                "-gravity",
                "center",
                str(icon_resized),
                "-composite",
                os.path.join(output_dir, filename),
            ]

            # 尝试 ImageMagick
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                # ImageMagick 不可用，使用纯色背景
                cmd = [
                    "convert",
                    "-size",
                    f"{width}x{height}",
                    f"xc:rgb({color[0]},{color[1]},{color[2]})",
                    os.path.join(output_dir, filename),
                ]
                subprocess.run(cmd, capture_output=True)
                print(f"  ✅ 已保存 (纯色背景): {filename}")

            # 清理临时文件
            if icon_resized.exists():
                icon_resized.unlink()

        print(f"\n✅ 启动图生成完成!")

    def generate_splash(
        self, source_path: str, output_dir: str, color: tuple = (13, 148, 136)
    ):
        """生成启动图 (优先使用 PIL)"""
        try:
            from PIL import Image, ImageDraw, ImageOps

            self.generate_splash_with_pil(source_path, output_dir, color)
        except ImportError:
            # 尝试 ImageMagick
            result = subprocess.run(
                ["which", "convert"], capture_output=True, text=True
            )
            if result.returncode == 0:
                self.generate_splash_with_sips(source_path, output_dir, color)
            else:
                # 创建简单的纯色 PNG (使用 base64)
                self._create_simple_splash(source_path, output_dir, color)

    def _create_simple_splash(
        self, source_path: str, output_dir: str, color: tuple = (13, 148, 136)
    ):
        """创建简单启动图 (仅纯色背景)"""
        import base64

        Path(output_dir).mkdir(parents=True, exist_ok=True)

        splash_sizes = {
            "splash-iphone.png": (1242, 2208),
            "splash-android.png": (1080, 1920),
        }

        # 最小 PNG (1x1 像素，指定颜色)
        # 使用 Python 标准库创建
        import struct
        import zlib

        def create_png(width: int, height: int, rgb: tuple) -> bytes:
            """创建纯色 PNG"""

            def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
                chunk = chunk_type + data
                return (
                    struct.pack(">I", len(data))
                    + chunk
                    + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)
                )

            # PNG 签名
            signature = b"\x89PNG\r\n\x1a\n"

            # IHDR
            ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
            ihdr = png_chunk(b"IHDR", ihdr_data)

            # IDAT
            raw_data = b""
            for y in range(height):
                raw_data += b"\x00"  # 过滤器类型
                for x in range(width):
                    raw_data += bytes(rgb)

            compressed = zlib.compress(raw_data, 9)
            idat = png_chunk(b"IDAT", compressed)

            # IEND
            iend = png_chunk(b"IEND", b"")

            return signature + ihdr + idat + iend

        print(f"\n🖼️ 生成启动图 (纯色背景)...")

        for filename, size in splash_sizes.items():
            print(f"  📐 {filename} ({size[0]}x{size[1]})")

            png_data = create_png(size[0], size[1], color)
            output_path = os.path.join(output_dir, filename)

            with open(output_path, "wb") as f:
                f.write(png_data)

            print(f"  ✅ 已保存: {filename}")

        print(f"\n✅ 启动图生成完成!")


def main():
    """主函数"""
    PROJECT_ROOT = Path("/Users/mac/workspace/iGreenProduct")

    SOURCE_ICON = (
        PROJECT_ROOT
        / "igreen-front/src/assets/e2d3be716f2b03621853146ef3c8dd02abba30cb.png"
    )
    OUTPUT_ICONS = PROJECT_ROOT / "igreen-uniapp/src/static/icons"
    OUTPUT_SPLASH = PROJECT_ROOT / "igreen-uniapp/src/static/splash"

    if not SOURCE_ICON.exists():
        print(f"❌ 源文件不存在: {SOURCE_ICON}")
        return 1

    print("=" * 50)
    print("  iGreen+ 图标生成脚本")
    print("=" * 50)

    generator = IconGenerator()

    try:
        from PIL import Image, ImageOps

        print("\n✅ PIL 已安装，将使用高质量模式\n")
    except ImportError:
        print("\n⚠️  PIL 未安装，将使用基础模式")
        print("   如需更高质量，可安装: pip3 install pillow\n")

    generator.generate_app_icons(str(SOURCE_ICON), str(OUTPUT_ICONS))
    generator.generate_splash(str(SOURCE_ICON), str(OUTPUT_SPLASH))

    print("\n" + "=" * 50)
    print("  🎉 所有图标生成完成!")
    print("=" * 50)
    print(f"\n输出目录:")
    print(f"  📁 {OUTPUT_ICONS}")
    print(f"  📁 {OUTPUT_SPLASH}")

    return 0


if __name__ == "__main__":
    exit(main())
