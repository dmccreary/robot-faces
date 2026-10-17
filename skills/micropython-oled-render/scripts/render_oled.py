#!/usr/bin/env python3
"""Render a MicroPython framebuf/ssd1306 drawing script to PNG.

Runs an unmodified MicroPython script (the kind written against
`framebuf.FrameBuffer` / `ssd1306.SSD1306_SPI` / `ssd1306.SSD1306_I2C`) under
CPython by faking out `machine`, `utime`, `micropython`, `urandom`,
`framebuf`, and `ssd1306`, then saves whatever was on the simulated 128x64
display each time the script calls `.show()`.

Usage:
    render_oled.py SCRIPT.py [-o output.png] [--frames N] [--scale 5]
                    [--fg R,G,B] [--bg R,G,B] [--gif]

Examples:
    render_oled.py face.py -o face.png
    render_oled.py eye_scanner.py --frames 12 -o frames/scan.png --gif
"""

import argparse
import runpy
import signal
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from oled_sim import RenderSession, StopRender, install_stubs  # noqa: E402

from PIL import Image  # noqa: E402


def parse_rgb(s):
    parts = [int(p) for p in s.split(",")]
    if len(parts) != 3:
        raise argparse.ArgumentTypeError("color must be R,G,B e.g. 255,255,255")
    return tuple(parts)


def render_script(script_path, max_frames, presses=None):
    # A real board runs main.py from the root with modules in / and /lib, so
    # scripts that `import config` or `import face` expect their own folder.
    script_dir = Path(script_path).resolve().parent
    for extra in (script_dir / "lib", script_dir):
        sys.path.insert(0, str(extra))
    session = RenderSession(max_frames=max_frames, presses=presses)
    init_globals = install_stubs(session)
    init_globals["__name__"] = "__main__"
    try:
        runpy.run_path(str(script_path), init_globals=init_globals, run_name="__main__")
    except StopRender:
        pass
    return session.frames


def colorize(img_1bit, scale, fg, bg):
    """Scale a 0/1 "L" image up and map 0->bg, 1->fg, nearest-neighbor."""
    rgb = Image.new("RGB", img_1bit.size)
    palette_lookup = {0: bg, 1: fg}
    px = img_1bit.load()
    out = rgb.load()
    for yy in range(img_1bit.height):
        for xx in range(img_1bit.width):
            out[xx, yy] = palette_lookup.get(px[xx, yy], fg)
    w, h = rgb.size
    return rgb.resize((w * scale, h * scale), Image.NEAREST)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("script", help="Path to the MicroPython drawing script")
    ap.add_argument("-o", "--output", default="oled_output.png", help="Output PNG path (default: oled_output.png)")
    ap.add_argument("--frames", type=int, default=1, help="Number of show() calls to capture (default: 1)")
    ap.add_argument("--scale", type=int, default=5, help="Integer upscale factor; 5x turns 128x64 into 640x320 (default: 5)")
    ap.add_argument("--fg", type=parse_rgb, default=(255, 255, 255), help="Lit-pixel color as R,G,B (default: 255,255,255)")
    ap.add_argument("--bg", type=parse_rgb, default=(0, 0, 0), help="Unlit-pixel color as R,G,B (default: 0,0,0)")
    ap.add_argument("--press", action="append", default=[], metavar="PIN@FRAME",
                    help="Press button PIN after FRAME is shown: PIN@FRAME[+DELAY][/HOLD] in fake-clock ms, e.g. 14@1 or 15@2+0/200 (repeatable)")
    ap.add_argument("--pick", metavar="N,N,...", help="Save only these 1-based frames (captures up to the highest)")
    ap.add_argument("--timeout", type=int, default=30, help="Abort after this many seconds (default: 30)")
    ap.add_argument("--gif", action="store_true", help="Also save an animated GIF when --frames > 1")
    args = ap.parse_args()

    presses = {}
    for spec in args.press:
        # PIN@FRAME[+DELAY][/HOLD], delay and hold in fake-clock milliseconds
        pin_id, rest = spec.split("@")
        rest, _, hold = rest.partition("/")
        frame_no, _, delay = rest.partition("+")
        presses.setdefault(int(frame_no), []).append(
            (int(pin_id), int(delay) if delay else 150, int(hold) if hold else 100))
    pick = [int(n) for n in args.pick.split(",")] if args.pick else None
    wanted = max(pick) if pick else args.frames

    signal.signal(signal.SIGALRM, lambda *_: (_ for _ in ()).throw(TimeoutError("script ran past --timeout without enough show() calls")))
    signal.alarm(args.timeout)
    try:
        frames = render_script(args.script, wanted, presses)
    except TimeoutError as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(2)
    finally:
        signal.alarm(0)
    if pick:
        numbers = [n for n in pick if n <= len(frames)]
        frames = [frames[n - 1] for n in numbers]
    else:
        numbers = list(range(1, len(frames) + 1))
    if not frames:
        print("error: script never called .show() -- no frame captured", file=sys.stderr)
        sys.exit(1)

    out = Path(args.output)
    images = [colorize(f, args.scale, args.fg, args.bg) for f in frames]

    if len(images) == 1:
        images[0].save(out)
        print(f"wrote {out} ({images[0].width}x{images[0].height}, 1 frame)")
    else:
        stem, suffix = out.stem, out.suffix or ".png"
        for i, img in zip(numbers, images):
            frame_path = out.with_name(f"{stem}_frame{i:03d}{suffix}")
            img.save(frame_path)
        print(f"wrote {len(images)} frames to {out.parent or '.'}/{stem}_frame###{suffix}")
        if args.gif:
            gif_path = out.with_suffix(".gif")
            images[0].save(gif_path, save_all=True, append_images=images[1:], duration=80, loop=0)
            print(f"wrote {gif_path}")


if __name__ == "__main__":
    main()
