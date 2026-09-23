"""Make the site's three-view CS2 lineup capture without altering gameplay pixels."""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


SIZE = 1080
AMBER = "#ffc44d"
DARK = "#292b2e"


def focus(value):
    try:
        x, y = (float(part) for part in value.split(","))
        if not (0 <= x <= 1 and 0 <= y <= 1):
            raise ValueError
        return x, y
    except (ValueError, TypeError):
        raise argparse.ArgumentTypeError("focus must be x,y with each value between 0 and 1")


def crop(path, size, center):
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
    width, height = image.size
    target_width, target_height = size
    scale = max(target_width / width, target_height / height)
    image = image.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)
    left = round(min(max(center[0] * image.width - target_width / 2, 0), image.width - target_width))
    top = round(min(max(center[1] * image.height - target_height / 2, 0), image.height - target_height))
    return image.crop((left, top, left + target_width, top + target_height))


def font(size):
    for path in ("C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def pill(draw, label, y, center_x, max_width, size):
    label = label.upper().strip()
    if not label:
        raise ValueError("labels cannot be empty")
    while size > 18:
        face = font(size)
        box = draw.textbbox((0, 0), label, font=face)
        if box[2] - box[0] + 36 <= max_width:
            break
        size -= 2
    width = box[2] - box[0] + 36
    height = box[3] - box[1] + 18
    left = round(center_x - width / 2)
    draw.rounded_rectangle((left, y, left + width, y + height), radius=18, fill=AMBER)
    draw.text((left + 18 - box[0], y + 9 - box[1]), label, font=face, fill=DARK)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("position", "aim", "result", "from-label", "to-label", "throw-label", "output"):
        parser.add_argument("--" + name, required=True)
    for name in ("position", "aim", "result"):
        parser.add_argument("--" + name + "-focus", type=focus, default=(0.5, 0.5))
    parser.add_argument("--credit", default="")
    args = parser.parse_args()

    canvas = Image.new("RGB", (SIZE, SIZE), AMBER)
    canvas.paste(crop(args.position, (SIZE, 528), args.position_focus), (0, 0))
    canvas.paste(crop(args.aim, (535, 540), args.aim_focus), (0, 540))
    canvas.paste(crop(args.result, (535, 540), args.result_focus), (545, 540))
    draw = ImageDraw.Draw(canvas)
    pill(draw, args.from_label, 8, 540, 980, 52)
    pill(draw, args.throw_label, 550, 267, 510, 30)
    pill(draw, args.to_label, 995, 267, 510, 42)
    pill(draw, "RESULT", 995, 812, 510, 42)
    if args.credit:
        draw.text((540, 535), args.credit.upper(), font=font(32), fill=DARK, anchor="mm")
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=88, optimize=True)


if __name__ == "__main__":
    main()
