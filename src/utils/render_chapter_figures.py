#!/usr/bin/env python3
"""Render the figures for the textbook chapters in docs/chapters/.

Unlike render_oled_labs.py, which runs the kit's numbered labs, this runs the
code printed IN THE CHAPTERS. A figure names the chapter code blocks it
draws by a unique phrase from each block, and this script pulls them out of
the chapter's index.md, wraps them in the display setup the chapter assumes,
and renders the result with the micropython-oled-render simulator. If an
author edits a snippet, the next run redraws the figure to match, and a
phrase that no longer matches exactly one block is a hard error, not a stale
picture.

    python3 src/utils/render_chapter_figures.py             # render missing figures
    python3 src/utils/render_chapter_figures.py --list
    python3 src/utils/render_chapter_figures.py --only 07-ellipse-polygon-drawing
    python3 src/utils/render_chapter_figures.py --force     # redraw everything

Images land beside the chapter's index.md. An existing image is left alone
unless --force is given.

WHAT THESE IMAGES ARE NOT

They come from a simulator, so they are evidence of what the code DRAWS, not
of what a student will see on a panel. See render_oled_labs.py for the
simulator's limits (Pillow curves, 8x8 font approximation, no timing).
"""

import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from render_oled_labs import montage  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
CHAPTERS = ROOT / "docs" / "chapters"
RENDERER = ROOT / "skills" / "micropython-oled-render" / "scripts" / "render_oled.py"

# The chapters assume an initialized display. Chapter 5 calls it `display`,
# every later chapter calls it `fb`; both names point at the same object.
PREAMBLE = """\
import framebuf
from array import array
import math
from machine import Pin, SPI
import ssd1306

spi = SPI(0, sck=Pin(2), mosi=Pin(3))
fb = ssd1306.SSD1306_SPI(128, 64, spi, dc=Pin(5), res=Pin(4), cs=Pin(6))
display = fb
BLACK = 0
WHITE = 1
"""

OFF = (0, 0, 0)
ORANGE = (255, 170, 0)
CYAN = (0, 200, 255)
GREEN = (60, 220, 120)

# The pieces of Chapter 9's face that later chapters reuse. draw_face() is cut
# before its example call at the bottom so a figure can call it with its own state.
CH9_FACE = ("09-facial-anatomy-layout-design",
            ["def mirror_x", "def build_eyebrow_points", "def default_face_state", "def draw_mouth",
             ("def draw_face(fb, state", "state = default_face_state()")])

# chapter: folder name under docs/chapters
# out: image file name written beside the chapter's index.md
# blocks: unique phrases, one per chapter code block to run, in order
# code: extra lines appended after the chapter blocks (calls the chapter leaves out)
# states: for montages, one entry per frame as (caption, extra code[, frame]) -- the
#         chapter blocks run once per state with that code appended, and `frame` picks
#         which show() call to keep when the code shows more than once
# expect: phrases the chapter must still contain -- guards inline code copied from it
# overlay: "boxes" -> outline (x, y, w, h, color) regions; "rings" -> circle (x, y, color)
# zoom: (x, y, w, h, cell) crop a region and enlarge each pixel to a `cell`-pixel square with a grid
# axes: True -> annotate the screen's x and y axes and its corner coordinates
FIGURES = [
    # ---- Chapter 5: display coordinate systems -------------------------------
    dict(chapter="05-display-coordinate-systems", out="screen-corners.png",
         code="for x, y in ((0, 0), (127, 0), (0, 63), (127, 63)):\n    fb.pixel(x, y, WHITE)\nfb.show()",
         axes=True, rings=[(0, 0, ORANGE), (127, 0, ORANGE), (0, 63, ORANGE), (127, 63, ORANGE)]),
    dict(chapter="05-display-coordinate-systems", out="bounding-box.png",
         code="fb.ellipse(30, 25, 10, 10, WHITE, True)\nfb.show()",
         boxes=[(20, 15, 21, 21, ORANGE)]),
    dict(chapter="05-display-coordinate-systems", out="pixel-staircase.png",
         code="TOP_HALF = 3\nfb.ellipse(40, 30, 12, 8, WHITE, False, TOP_HALF)\nfb.show()",
         zoom=(26, 20, 29, 12, 18)),
    dict(chapter="05-display-coordinate-systems", out="center-pixel.png",
         blocks=["display.pixel(64, 32, 1)"], zoom=(56, 28, 17, 9, 36), label_pixels=[(64, 32)]),

    # ---- Chapter 6: basic drawing primitives ---------------------------------
    dict(chapter="06-basic-drawing-primitives", out="pixel-method.png",
         code="fb.pixel(64, 32, WHITE)\nfb.show()", rings=[(64, 32, ORANGE)]),
    dict(chapter="06-basic-drawing-primitives", out="hline-vline.png",
         blocks=["fb.hline(30, 50, 60, WHITE)"], code="fb.show()"),
    dict(chapter="06-basic-drawing-primitives", out="diagonal-line.png",
         blocks=["fb.line(0, 0, 100, 40, WHITE)"], code="fb.show()"),
    dict(chapter="06-basic-drawing-primitives", out="rectangles.png",
         blocks=["fb.rect(10, 10, 20, 12, WHITE)"], code="fb.show()"),
    dict(chapter="06-basic-drawing-primitives", out="clipping.png",
         blocks=["fb.rect(100, 20, 50, 10, WHITE)"]),
    dict(chapter="06-basic-drawing-primitives", out="text-label.png",
         blocks=['fb.text("BATT 82%", 0, 0, WHITE)'], code="fb.show()"),
    dict(chapter="06-basic-drawing-primitives", out="draw-order.png",
         states=[("Eye first, then the face plate: the eye is hidden",
                  "fb.fill(BLACK)\nfb.rect(50, 25, 8, 8, BLACK, True)\nfb.rect(20, 10, 90, 45, WHITE, True)\nfb.show()"),
                 ("Face plate first, then the eye: the eye shows",
                  "fb.fill(BLACK)\nfb.rect(20, 10, 90, 45, WHITE, True)\nfb.rect(50, 25, 8, 8, BLACK, True)\nfb.show()")],
         cols=2, scale=3),
    dict(chapter="06-basic-drawing-primitives", out="eyebrow-and-mouth.png",
         blocks=["fb.rect(20, 15, 24, 6, WHITE, True)"]),

    # ---- Chapter 7: ellipses and polygons ------------------------------------
    dict(chapter="07-ellipse-polygon-drawing", out="one-ellipse.png",
         blocks=["fb.ellipse(64, 32, 20, 12, WHITE)"]),
    dict(chapter="07-ellipse-polygon-drawing", out="independent-radii.png",
         blocks=["fb.ellipse(20, 40, 15, 6, WHITE)"]),
    dict(chapter="07-ellipse-polygon-drawing", out="filled-vs-outline.png",
         blocks=["fb.ellipse(40, 30, 8, 8, WHITE)"], code="fb.show()"),
    dict(chapter="07-ellipse-polygon-drawing", out="smile-and-sleepy-eye.png",
         blocks=["fb.ellipse(64, 45, 20, 10, WHITE, True, BOTTOM_HALF)"]),
    dict(chapter="07-ellipse-polygon-drawing", out="first-triangle.png",
         blocks=["triangle_points = array"]),
    dict(chapter="07-ellipse-polygon-drawing", out="pentagon.png",
         blocks=["pentagon_points = array"], code="fb.show()"),
    dict(chapter="07-ellipse-polygon-drawing", out="angry-eyebrows.png",
         blocks=["left_eyebrow = array"]),
    dict(chapter="07-ellipse-polygon-drawing", out="rounded-rectangle.png",
         blocks=["fb.rect(24, 20, 32, 15, WHITE, True)"], code="fb.show()"),
    dict(chapter="07-ellipse-polygon-drawing", out="arc-from-lines.png",
         blocks=["points = []"], code="fb.show()"),
    dict(chapter="07-ellipse-polygon-drawing", out="eye-eyelid-eyebrow.png",
         blocks=["# 3. sleepy eyelid"]),

    # ---- Chapter 9: facial anatomy and layout ---------------------------------
    dict(chapter="09-facial-anatomy-layout-design", out="face-outline.png",
         blocks=["def draw_face_outline"], code="draw_face_outline(fb, 128, 64, WHITE)\nfb.show()"),
    dict(chapter="09-facial-anatomy-layout-design", out="eye-symmetry.png",
         blocks=["def mirror_x"],
         code=("for y in range(8, 64, 4):\n    fb.pixel(center_x, y, WHITE)\n"
               "fb.ellipse(left_eye_x, 30, 8, 8, WHITE, True)\nfb.ellipse(right_eye_x, 30, 8, 8, WHITE, True)\nfb.show()"),
         ),
    dict(chapter="09-facial-anatomy-layout-design", out="pupil-gaze.png",
         blocks=["def draw_eyes", "def draw_pupils"],
         states=[("gaze_offset_x = -4", "draw_eyes(fb, 64, 30, 8, 40, WHITE)\ndraw_pupils(fb, 64, 30, 40, 3, -4, BLACK)\nfb.show()"),
                 ("gaze_offset_x = 0", "draw_eyes(fb, 64, 30, 8, 40, WHITE)\ndraw_pupils(fb, 64, 30, 40, 3, 0, BLACK)\nfb.show()"),
                 ("gaze_offset_x = 4", "draw_eyes(fb, 64, 30, 8, 40, WHITE)\ndraw_pupils(fb, 64, 30, 40, 3, 4, BLACK)\nfb.show()")],
         cols=3, scale=2),
    dict(chapter="09-facial-anatomy-layout-design", out="eyelid.png",
         blocks=["def draw_eyes", "def draw_eyelid"],
         states=[("Eyes open", "draw_eyes(fb, 64, 30, 8, 40, WHITE)\nfb.show()"),
                 ("After draw_eyelid() on both eyes",
                  "draw_eyes(fb, 64, 30, 8, 40, WHITE)\ndraw_eyelid(fb, 44, 30, 8, BLACK)\ndraw_eyelid(fb, 84, 30, 8, BLACK)\nfb.show()")],
         cols=2, scale=3),
    dict(chapter="09-facial-anatomy-layout-design", out="eyebrow-angles.png",
         blocks=["def build_eyebrow_points"],
         states=[(f"angle_degrees = {a}", f"draw_eyebrow(fb, 20, 20, 24, 8, {a}, WHITE)\ndraw_eyebrow(fb, 84, 20, 24, 8, {-a}, WHITE)\nfb.show()")
                 for a in (-30, 0, 30)],
         cols=3, scale=2),
    dict(chapter="09-facial-anatomy-layout-design", out="smile-and-frown.png",
         blocks=["def draw_mouth"],
         states=[(f"mouth_curvature = {c}", f"draw_mouth(fb, 64, 32, 40, {c}, WHITE)\nfb.show()") for c in (8, 0, -8)],
         cols=3, scale=2),
    dict(chapter="09-facial-anatomy-layout-design", out="default-face.png",
         uses=[("09-facial-anatomy-layout-design", ["def mirror_x", "def build_eyebrow_points", "def default_face_state",
                                                    "def draw_mouth"])],
         blocks=["def draw_face(fb, state"]),

    # ---- Chapter 10: the core expression set ---------------------------------
    dict(chapter="10-emotion-theory-core-expressions", out="neutral-happy-sad.png",
         uses=[CH9_FACE],
         blocks=["happy_face_state = {", "sad_face_state = {"],
         states=[("Neutral: Chapter 9's defaults", "draw_face(fb, default_face_state())"),
                 ("Happy", "draw_face(fb, {**default_face_state(), **happy_face_state})"),
                 ("Sad", "draw_face(fb, {**default_face_state(), **sad_face_state})")],
         cols=3, scale=2),

    # ---- Chapter 11: readability and design ----------------------------------
    dict(chapter="11-expression-design-readability-hri", out="subtle-vs-intense.png",
         uses=[CH9_FACE],
         blocks=["happy_subtle_state = {"],
         states=[("Neutral", "draw_face(fb, default_face_state())"),
                 ("happy_subtle_state", "draw_face(fb, {**default_face_state(), **happy_subtle_state})"),
                 ("happy_intense_state", "draw_face(fb, {**default_face_state(), **happy_intense_state})")],
         cols=3, scale=2),

    # ---- Chapter 12: animating expressions -----------------------------------
    dict(chapter="12-animating-expressions", out="blink-frames.png",
         uses=[CH9_FACE, ("09-facial-anatomy-layout-design", ["def draw_eyelid"])],
         code="state = default_face_state()\nleft_eye_x = 64 - state['eye_spacing'] // 2\nright_eye_x = 64 + state['eye_spacing'] // 2",
         states=[("eyes_closed = False", "fb.fill(BLACK)\ndraw_face(fb, state)"),
                 ("eyes_closed = True, 150 ms later",
                  "fb.fill(BLACK)\ndraw_face(fb, state)\ndraw_eyelid(fb, left_eye_x, state['eye_y'], state['eye_size'], BLACK)\n"
                  "draw_eyelid(fb, right_eye_x, state['eye_y'], state['eye_size'], BLACK)\nfb.show()", 2)],
         cols=2, scale=3),
    dict(chapter="12-animating-expressions", out="gaze-sweep.png",
         uses=[CH9_FACE],
         code="state = default_face_state()",
         states=[(f"gaze_offset_x = {g}", f"state['gaze_offset_x'] = {g}\nfb.fill(BLACK)\ndraw_face(fb, state)") for g in (-6, 0, 6)],
         cols=3, scale=2),
    dict(chapter="12-animating-expressions", out="interpolation-steps.png",
         uses=[CH9_FACE],
         blocks=["keyframe_neutral = {", "def interpolate_state"],
         states=[(f"t = {t}", "mid = interpolate_state(keyframe_neutral, keyframe_happy, %s)\n"
                              "face = default_face_state()\nface.update({k: round(v) for k, v in mid.items()})\n"
                              "draw_face(fb, face)" % t) for t in (0.0, 0.25, 0.5, 0.75, 1.0)],
         cols=3, scale=2),

    # ---- Chapter 8: framebuf version history ----------------------------------
    dict(chapter="08-framebuf-version-history", out="workaround-vs-ellipse.png",
         blocks=["def draw_circle_workaround"],
         expect=["fb.ellipse(cx, cy, radius, radius, color, True)"],
         states=[("The 2021 workaround: 24 short straight lines", "draw_circle_workaround(fb, 64, 32, 24, WHITE)\nfb.show()"),
                 ("One call: fb.ellipse(), filled",
                  "cx, cy, radius, color = 64, 32, 24, WHITE\nfb.ellipse(cx, cy, radius, radius, color, True)\nfb.show()")],
         cols=2, scale=3),
]


def chapter_blocks(chapter):
    """Return the python code blocks of a chapter's index.md, in order."""
    text = (CHAPTERS / chapter / "index.md").read_text()
    blocks = re.findall(r"^```(?:python|py)\n(.*?)^```", text, flags=re.S | re.M)
    return blocks


def pick_blocks(chapter, needles, source=None):
    """Return the chapter blocks named by `needles`. An entry may be a
    (needle, cut_marker) pair: the block is truncated where cut_marker starts,
    which drops a trailing example call so the definitions can be reused."""
    blocks = chapter_blocks(source or chapter)
    chosen = []
    for entry in needles:
        needle, cut = entry if isinstance(entry, tuple) else (entry, None)
        hits = [b for b in blocks if needle in b]
        if len(hits) != 1:
            raise RuntimeError(f"{source or chapter}: phrase {needle!r} matches {len(hits)} code blocks, need exactly 1")
        block = hits[0]
        if cut:
            if cut not in block:
                raise RuntimeError(f"{source or chapter}: cut marker {cut!r} not in the block for {needle!r}")
            block = block[:block.index(cut)]
        chosen.append(block)
    return chosen


def build_script(fig, extra=""):
    parts = [PREAMBLE]
    for source, needles in fig.get("uses", []):    # blocks borrowed from earlier chapters
        parts += pick_blocks(fig["chapter"], needles, source)
    if fig.get("blocks"):
        parts += pick_blocks(fig["chapter"], fig["blocks"])
    if fig.get("code"):
        parts.append(fig["code"])
    if extra:
        parts.append(extra)
    script = "\n".join(parts)
    if "show()" not in script:
        script += "\nfb.show()\n"
    return script + "\n"


def run_script(script, scale, frame=1):
    """Render one of a script's show() frames (default the first) as a PIL image."""
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "figure.py"
        out = Path(tmp) / "figure.png"
        src.write_text(script)
        result = subprocess.run([sys.executable, str(RENDERER), str(src), "-o", str(out), "--scale", str(scale),
                                 "--pick", str(frame)],
                                capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or result.stdout.strip())
        return Image.open(out).convert("RGB")


def font(size):
    return ImageFont.load_default(size=size)


def add_overlays(img, fig, scale, origin=(0, 0)):
    """Outline boxes and ring pixels; `origin` is where the screen sits in img."""
    draw = ImageDraw.Draw(img)
    ox, oy = origin
    for x, y, w, h, color in fig.get("boxes", []):
        draw.rectangle([ox + x * scale, oy + y * scale, ox + (x + w) * scale - 1, oy + (y + h) * scale - 1],
                       outline=color, width=3)
    for x, y, color in fig.get("rings", []):
        cx, cy, r = ox + x * scale + scale // 2, oy + y * scale + scale // 2, scale * 3
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=3)
    return img


AXES_PAD = (70, 44, 90, 40)   # left, top, right, bottom room around the screen
AXES_ORIGIN = AXES_PAD[:2]


def annotate_axes(img, scale):
    """Add x/y arrows and corner coordinates around a screen image."""
    pad_l, pad_t, pad_r, pad_b = AXES_PAD
    sheet = Image.new("RGB", (img.width + pad_l + pad_r, img.height + pad_t + pad_b), (244, 244, 244))
    sheet.paste(img, (pad_l, pad_t))
    d = ImageDraw.Draw(sheet)
    f, small = font(16), font(14)
    ink = (40, 40, 40)
    d.rectangle([pad_l - 1, pad_t - 1, pad_l + img.width, pad_t + img.height], outline=(120, 120, 120), width=2)
    # x axis arrow along the top
    y = pad_t - 22
    d.line([pad_l + 30, y, pad_l + img.width - 30, y], fill=ink, width=2)
    d.polygon([(pad_l + img.width - 30, y - 6), (pad_l + img.width - 30, y + 6), (pad_l + img.width - 18, y)], fill=ink)
    d.text((pad_l + img.width // 2, y - 15), "x increases", fill=ink, font=f, anchor="mm")
    # y axis arrow down the left
    x = pad_l - 24
    d.line([x, pad_t + 20, x, pad_t + img.height - 20], fill=ink, width=2)
    d.polygon([(x - 6, pad_t + img.height - 20), (x + 6, pad_t + img.height - 20), (x, pad_t + img.height - 8)], fill=ink)
    tmp = Image.new("RGBA", (130, 24), (0, 0, 0, 0))
    ImageDraw.Draw(tmp).text((0, 0), "y increases", fill=ink + (255,), font=f)
    tmp = tmp.rotate(90, expand=True)
    sheet.paste(tmp, (6, pad_t + img.height // 2 - 60), tmp)
    # corner labels
    d.text((pad_l, pad_t + img.height + 6), "(0, 63)", fill=ink, font=small)
    d.text((pad_l + img.width, pad_t + img.height + 6), "(127, 63)", fill=ink, font=small, anchor="ra")
    d.text((pad_l - 6, pad_t - 40), "(0, 0)", fill=ink, font=small, anchor="ra")
    d.text((pad_l + img.width + 6, pad_t - 40), "(127, 0)", fill=ink, font=small)
    return sheet


def zoom_view(frame, region, cell, label_pixels=()):
    """Crop `region` of a 1x frame and draw each pixel as a gridded cell."""
    x0, y0, w, h = region
    small = frame.crop((x0, y0, x0 + w, y0 + h))
    big = small.resize((w * cell, h * cell), Image.NEAREST)
    d = ImageDraw.Draw(big)
    grid = (70, 70, 70)
    for i in range(w + 1):
        d.line([(i * cell, 0), (i * cell, h * cell)], fill=grid)
    for j in range(h + 1):
        d.line([(0, j * cell), (w * cell, j * cell)], fill=grid)
    margin = 34
    sheet = Image.new("RGB", (big.width + margin, big.height + margin), (244, 244, 244))
    sheet.paste(big, (margin, margin))
    s = ImageDraw.Draw(sheet)
    f = font(13)
    step = 4 if w > 20 else 2
    for i in range(0, w, step):
        s.text((margin + i * cell + cell // 2, margin - 6), str(x0 + i), fill=(40, 40, 40), font=f, anchor="ms")
    for j in range(0, h, step):
        s.text((margin - 6, margin + j * cell + cell // 2), str(y0 + j), fill=(40, 40, 40), font=f, anchor="rm")
    for px, py in label_pixels:
        cx, cy = margin + (px - x0) * cell, margin + (py - y0) * cell
        s.rectangle([cx - 1, cy - 1, cx + cell, cy + cell], outline=ORANGE, width=3)
        s.text((cx + cell + 10, cy + cell // 2), f"({px}, {py})", fill=ORANGE, font=font(16), anchor="lm")
    return sheet


def render_figure(fig):
    text = (CHAPTERS / fig["chapter"] / "index.md").read_text()
    for phrase in fig.get("expect", []):   # inline snippets copied from the chapter must still be there
        if phrase not in text:
            raise RuntimeError(f"{fig['chapter']}: expected snippet {phrase!r} is no longer in the chapter")
    if fig.get("states"):
        cols = fig.get("cols", 3)
        scale = fig.get("scale", 3)
        # each state is (caption, extra code) or (caption, extra code, show() frame to keep)
        images = [run_script(build_script(fig, st[1]), scale, st[2] if len(st) > 2 else 1) for st in fig["states"]]
        return montage(images, [st[0] for st in fig["states"]], cols)
    if fig.get("zoom"):
        x, y, w, h, cell = fig["zoom"]
        frame = run_script(build_script(fig), 1)
        return zoom_view(frame, (x, y, w, h), cell, fig.get("label_pixels", ()))
    scale = fig.get("scale", 5)
    img = run_script(build_script(fig), scale)
    if fig.get("axes"):
        img = annotate_axes(img, scale)
        return add_overlays(img, fig, scale, origin=AXES_ORIGIN)
    return add_overlays(img, fig, scale)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", nargs="+", metavar="CHAPTER", help="render only these chapter folders")
    ap.add_argument("--force", action="store_true", help="overwrite images that already exist")
    ap.add_argument("--list", action="store_true", help="print the plan and exit")
    args = ap.parse_args()

    failures = 0
    for fig in FIGURES:
        if args.only and fig["chapter"] not in args.only:
            continue
        target = CHAPTERS / fig["chapter"] / fig["out"]
        label = f"{fig['chapter']}/{fig['out']}"
        if args.list:
            print(label)
            continue
        if target.exists() and not args.force:
            print(f"skip   {label}  (exists; use --force)")
            continue
        try:
            img = render_figure(fig)
        except RuntimeError as exc:
            failures += 1
            print(f"FAILED {label}\n       {exc}")
            continue
        img.save(target, optimize=True)
        print(f"wrote  {label}  ({img.width}x{img.height})")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
