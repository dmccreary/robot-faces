#!/usr/bin/env python3
"""Render the sample-output images for the OLED two-button kit's lessons.

The kit's labs are real MicroPython programs. This runs each one under the
micropython-oled-render simulator (skills/micropython-oled-render) and saves
what the 128x64 screen would show into the lesson's docs folder, so the
textbook can show the robot faces instead of describing them.

    python3 src/utils/render_oled_labs.py              # render every shot
    python3 src/utils/render_oled_labs.py --list       # show the plan only
    python3 src/utils/render_oled_labs.py --only keyframes broken-faces
    python3 src/utils/render_oled_labs.py --force      # also overwrite existing images

An image that already exists is left alone unless --force is given, so
hand-made photos and earlier renders are never clobbered by accident.

HOW A SHOT IS DESCRIBED

Each SHOTS row names a lab, the 1-based show() frames worth keeping, and
the button presses that steer the lab to those frames. A press is
"PIN@FRAME" -- press that pin right after FRAME is drawn -- with optional
"+DELAY" and "/HOLD" in fake-clock milliseconds (default +150/100). Use
"+0" when a lab is animating on a timer and the press must beat it.
Button A is pin 14 and button B is pin 15, as in config.py.

One frame becomes a plain 640x320 image like the older sample-output.png
files. Several frames become one captioned montage, which is how a lesson
shows seven emotions or five poses of a blink in a single picture.

WHAT THESE IMAGES ARE NOT

They come from a simulator, not a camera. Shapes are drawn with Pillow, so
a curve can differ from the real display by a pixel here and there, and
text uses an 8x8 font with the same cell as MicroPython's but slightly
different letterforms. Nothing about timing is simulated, which is why no
shot photographs a benchmark number or a frames-per-second reading.
"""

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
KIT = ROOT / "src" / "kits" / "oled-2-buttons"
DOCS = ROOT / "docs" / "kits" / "oled"
CHAPTERS = ROOT / "docs" / "chapters"
RENDERER = ROOT / "skills" / "micropython-oled-render" / "scripts" / "render_oled.py"

A = 14
B = 15

# page: the docs/kits/oled/<page>/ folder the image lands in
# chapter: instead of page, a docs/chapters/<chapter>/ folder (a textbook chapter that
#          shows what the matching kit lab draws)
# out: file name inside that folder
# lab: the numbered lab to run
# frames: which show() calls to keep (1-based)
# presses: ("14@1", ...) button presses that steer the lab
# captions: one per frame; makes a montage even for a single frame
# cols: montage columns (default 3)
# scale: pixel scale for montage tiles (default 2, or 3 for one or two columns)
# boxes: (x, y, w, h, label) regions to outline on a single frame
SHOTS = [
    dict(page="hello-world", out="sample-output.png", lab="01-hello", frames=[1]),
    dict(page="screen-coordinates", out="sample-output.png", lab="02-screen-coordinates", frames=[1]),
    dict(page="face-module", out="three-expressions.png", lab="23-face-module", frames=[1, 2, 3]),
    dict(page="emotion-table", out="seven-emotions.png", lab="24-emotion-table",
         frames=[1, 2, 3, 4, 5, 6, 7], presses=[f"{A}@{n}" for n in range(1, 7)]),
    dict(page="broken-faces", out="symptoms.png", lab="25-broken-faces",
         frames=[1, 42, 44, 46], presses=[f"{A}@1", f"{A}@42", f"{A}@44", f"{A}@46"],
         captions=["Bug 1: nothing appears", "Bug 2: the dot smears into a stripe",
                   "Bug 3: the eyes are missing", "Bug 4: the smile is upside down"],
         cols=2, scale=3),
    dict(page="trace-and-watch", out="panel.png", lab="26-trace-and-watch",
         frames=[1, 2], presses=[f"{A}@1+0"],
         captions=["Idle: both buttons read 1", "Button A held down: A reads 0, hit count goes up"],
         cols=2, scale=3),
    dict(page="keyframes", out="blink.png", lab="27-keyframes", frames=[1, 2, 3, 4, 5],
         captions=["Pose 1", "Pose 2", "Pose 3", "Pose 4", "Pose 5"]),
    dict(page="keyframes", out="surprise.png", lab="27-keyframes", frames=[3, 4, 5, 6],
         presses=[f"{B}@1+0", f"{B}@2+0"],
         captions=["Pose 1", "Pose 2", "Pose 3", "Pose 4"]),
    dict(page="keyframes", out="doze-off.png", lab="27-keyframes", frames=[7, 8, 9, 10, 11],
         presses=[f"{B}@1+0", f"{B}@2+0", f"{B}@6+0"],
         captions=["Pose 1", "Pose 2", "Pose 3", "Pose 4", "Pose 5"]),
    dict(page="state-machine", out="states.png", lab="28-state-machine",
         frames=[1, 2, 3, 5, 6],
         presses=[f"{A}@1", f"{A}@2", f"{B}@3", f"{B}@4", f"{A}@5"],
         captions=["Idle", "Curious (A)", "Happy (A again)", "Annoyed (from Idle, B)", "Asleep (A)"]),
    dict(page="partial-redraw", out="changed-regions.png", lab="29-partial-redraw", frames=[9],
         boxes=[(40, 44, 48, 18, (255, 170, 0)), (0, 0, 128, 10, (0, 200, 255))]),
    dict(page="design-your-own", out="readability-test.png", lab="30-design-your-own",
         frames=[1, 2], presses=[f"{A}@1"],
         captions=["What the tester sees: no label", "After pressing A: the name you intended"],
         cols=2, scale=3),

    # Textbook chapters that show what a kit lab draws (the chapter's own code is
    # rendered by render_chapter_figures.py; these chapters have no runnable listing).
    dict(chapter="10-emotion-theory-core-expressions", out="kit-seven-expressions.png", lab="19-emotion-modes",
         frames=[1, 2, 3, 4, 5, 6, 7], presses=[f"{A}@{n}" for n in range(1, 7)]),
    dict(chapter="11-expression-design-readability-hri", out="afraid-vs-surprised.png", lab="19-emotion-modes",
         frames=[4, 5], presses=[f"{A}@{n}" for n in range(1, 5)],
         captions=["Afraid", "Surprised"], cols=2, scale=3),
    dict(chapter="13-interactive-controls-inputs", out="two-button-counter.png", lab="17-buttons",
         frames=[1, 2, 4], presses=[f"{A}@1", f"{A}@2", f"{B}@3"],
         captions=["At power-up: both counts are 0", "After pressing button A once",
                   "After A twice and B once"]),
    dict(chapter="14-expression-menu-live-controls", out="kit-expression-menu.png", lab="19-emotion-modes",
         frames=[1, 2, 3, 5], presses=[f"{A}@{n}" for n in range(1, 5)],
         captions=["Power-up: Happy", "Press A: Sad", "Press A: Angry", "Press A twice more: Surprised"],
         cols=2, scale=3),
]


def run_lab(lab, frames, presses, scale):
    """Run one lab in the simulator and return {frame number: PIL image}."""
    script = KIT / f"{lab}.py"
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "frame.png"
        cmd = [sys.executable, str(RENDERER), str(script), "-o", str(out),
               "--pick", ",".join(str(n) for n in frames), "--scale", str(scale)]
        for press in presses:
            cmd += ["--press", press]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"{lab}: {result.stderr.strip() or result.stdout.strip()}")
        images = {}
        if len(frames) == 1:
            images[frames[0]] = Image.open(out).convert("RGB")
        else:
            for n in frames:
                images[n] = Image.open(Path(tmp) / f"frame_frame{n:03d}.png").convert("RGB")
        missing = [n for n in frames if n not in images]
        if missing:
            raise RuntimeError(f"{lab}: never reached frame(s) {missing}")
        return images


def montage(images, captions, cols, gap=14, margin=14, border=2):
    """Tile screen images into a captioned grid on a light background."""
    tile_w, tile_h = images[0].size
    font = ImageFont.load_default(size=15)
    cap_h = 26 if captions else 0
    rows = (len(images) + cols - 1) // cols
    cols = min(cols, len(images))
    width = margin * 2 + cols * (tile_w + border * 2) + (cols - 1) * gap
    height = margin * 2 + rows * (tile_h + border * 2 + cap_h) + (rows - 1) * gap
    sheet = Image.new("RGB", (width, height), (244, 244, 244))
    draw = ImageDraw.Draw(sheet)
    for i, img in enumerate(images):
        col, row = i % cols, i // cols
        x = margin + col * (tile_w + border * 2 + gap)
        y = margin + row * (tile_h + border * 2 + cap_h + gap)
        draw.rectangle([x, y, x + tile_w + border * 2 - 1, y + tile_h + border * 2 - 1], fill=(120, 120, 120))
        sheet.paste(img, (x + border, y + border))
        if captions:
            draw.text((x + 2, y + tile_h + border * 2 + 6), captions[i], fill=(40, 40, 40), font=font)
    return sheet


def outline(img, boxes, scale=5, width=3):
    draw = ImageDraw.Draw(img)
    for x, y, w, h, color in boxes:
        draw.rectangle([x * scale, y * scale, (x + w) * scale - 1, (y + h) * scale - 1], outline=color, width=width)
    return img


def render_shot(shot):
    frames = shot["frames"]
    captions = shot.get("captions")
    if len(frames) == 1 and not captions:
        images = run_lab(shot["lab"], frames, shot.get("presses", []), 5)
        img = images[frames[0]]
        if shot.get("boxes"):
            img = outline(img, shot["boxes"])
        return img
    cols = shot.get("cols", 3)
    scale = shot.get("scale", 3 if cols <= 2 else 2)
    images = run_lab(shot["lab"], frames, shot.get("presses", []), scale)
    return montage([images[n] for n in frames], captions, cols)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", nargs="+", metavar="PAGE", help="render only these lesson folders")
    ap.add_argument("--force", action="store_true", help="overwrite images that already exist")
    ap.add_argument("--list", action="store_true", help="print the plan and exit")
    args = ap.parse_args()

    failures = 0
    for shot in SHOTS:
        if args.only and shot.get("page", shot.get("chapter")) not in args.only:
            continue
        base, folder = (CHAPTERS, shot["chapter"]) if "chapter" in shot else (DOCS, shot["page"])
        target = base / folder / shot["out"]
        label = f"{folder}/{shot['out']}  <-  {shot['lab']}"
        if args.list:
            print(label)
            continue
        if target.exists() and not args.force:
            print(f"skip   {label}  (exists; use --force)")
            continue
        try:
            img = render_shot(shot)
        except RuntimeError as exc:
            failures += 1
            print(f"FAILED {label}\n       {exc}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        img.save(target, optimize=True)
        print(f"wrote  {label}  ({img.width}x{img.height})")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
