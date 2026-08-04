#!/usr/bin/env python3
"""Render a simulated screen image for every numbered lab in a kit.

check-labs.py proves a lab RUNS. This proves what it DRAWS -- it rasterizes
every drawing call onto a real pixel buffer and saves a PNG, instead of
discarding the call the way check-labs.py's DisplayStub does.

    python3 src/utils/render_kit_screens.py src/kits/smartwatch docs/kits/smartwatch

For every lab NN-name.py this writes <outdir>/<name>/sample-output.png,
where <name> is the filename with its NN- prefix and .py stripped. A lab
that never constructs a display (lab 00 in the smartwatch kit, which only
blinks a pin) is skipped, and reported as skipped rather than given a
blank image.

HOW IT WORKS

This reuses check-labs.py wholesale for everything that is not drawing:
the fake `machine` and `utime` modules, the Budget/Timeout safety nets
that stop a lab's `while True:` loop, and the rule that a lib/ file
defining a class is a hardware driver while one that does not is data
(so font modules load for real, with their real glyph bytes).

The one thing it replaces is the display itself. check-labs.py's
DisplayStub throws every draw call away. RasterDisplay below keeps them,
in a real WIDTH x HEIGHT buffer of RGB565 ints, and adds a real
color565() -- check-labs.py's stubbed one always returns 0, which is
fine for a smoke test and useless for a screenshot.

WHY THE FIRST FEW TICKS ONLY

Button-driven labs (menus, emotion tables) read a fake Pin that pretends
to be pressed for a few reads out of every press_period reads, so a lab
left running for many ticks will click through several menu states
before this script ever looks at the screen -- not what you want for a
single representative image. So each lab first gets a SMALL step budget,
short enough that no simulated button press has happened yet, which
captures whichever state the lab draws before it ever checks a button.
If that image comes back completely blank AND the lab did construct a
display, it is retried once with a large budget instead, on the theory
that a real blank screen this early is rarer than a lab that just needed
more ticks to draw anything at all.

Not a simulator. This models GC9A01 drawing calls faithfully enough for
a documentation screenshot, not for hardware timing or color accuracy
under real ambient light. Always compare against a real board too.
"""

import argparse
import importlib.util
import json
import os
import signal
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_KIT = os.path.join(SCRIPT_DIR, "..", "kits", "smartwatch")
DEFAULT_OUT = os.path.join(SCRIPT_DIR, "..", "..", "docs", "kits", "smartwatch")

LAB_PATTERN_PREFIX_LEN = 3   # "NN-"

try:
    from PIL import Image
except ImportError:
    print("This tool needs Pillow: pip install pillow", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------- check-labs

_spec = importlib.util.spec_from_file_location(
    "check_labs", os.path.join(SCRIPT_DIR, "check-labs.py"))
cl = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(cl)

BEZEL = (30, 30, 34)          # matches the color used in this session's renders
BLANK = 0x0000                # RGB565 black -- what an untouched pixel holds

SMALL_STEP_LIMIT = 30         # well under Bench.press_period (37): no fake
                              # button press can have fired yet
LARGE_STEP_LIMIT = 8000       # check-labs.py's own default, used as a retry
TIMEOUT_S = 3.0

_last_display = None          # set by RasterDisplay.__init__ on construction

# check-labs.py's fake Pin.value() counts button reads on its OWN counter
# (BENCH.pin_reads), completely separate from the tick/step counter that
# SMALL_STEP_LIMIT bounds. A loop that reads a button every pass but
# never calls sleep() -- lab 24's menu loop does exactly this -- can
# blow past the simulated "press" threshold (every pin_reads % 37 < 3
# reads back as pressed) long before SMALL_STEP_LIMIT ever fires,
# clicking through several menu entries before this script ever looks at
# the screen. Confirmed by an actual bad render: lab 24's default image
# came back showing "Angry" instead of index 0's "Happy".
#
# The fix is to make a button read cost a step too, so the one budget
# governs both. This patches check-labs.py's Pin class for every lab run
# in THIS process; check-labs.py's own separate invocations are a
# different process and are untouched by it.
_original_pin_value = cl.Pin.value


def _pin_value_ticking(self, new=None):
    if new is None:
        cl.BENCH.tick_us(1)
    return _original_pin_value(self, new)


cl.Pin.value = _pin_value_ticking


def real_color565(red, green=0, blue=0):
    """The real RGB565 packing -- copied from lib/gc9a01.py's color565(),
    because check-labs.py's stubbed version always returns 0. A smoke
    test does not care what a color IS, only that it type-checks; a
    screenshot cares about nothing else."""
    try:
        red, green, blue = red
    except TypeError:
        pass
    return (red & 0xF8) << 8 | (green & 0xFC) << 3 | blue >> 3


def unpack565(color):
    r = ((color >> 11) & 0x1F) << 3
    g = ((color >> 5) & 0x3F) << 2
    b = (color & 0x1F) << 3
    return r, g, b


class RasterDisplay:
    """A GC9A01 that keeps what you draw instead of a wire to send it down.

    Constructor signature matches the real driver
    (spi, dc=, cs=, reset=, backlight=, rotation=), because config.py's
    init_display() calls it with exactly those arguments and nothing
    stands between them and here."""

    WIDTH = 240
    HEIGHT = 240

    def __init__(self, spi=None, dc=None, cs=None, reset=None,
                backlight=None, rotation=0):
        global _last_display
        self.width = self.WIDTH
        self.height = self.HEIGHT
        self.buffer = bytearray(self.WIDTH * self.HEIGHT * 2)  # big-endian 565
        _last_display = self

    # --- the buffer ----------------------------------------------------

    def _set(self, x, y, color):
        if 0 <= x < self.width and 0 <= y < self.height:
            off = (y * self.width + x) * 2
            self.buffer[off] = (color >> 8) & 0xFF
            self.buffer[off + 1] = color & 0xFF

    def _get(self, x, y):
        off = (y * self.width + x) * 2
        return (self.buffer[off] << 8) | self.buffer[off + 1]

    def touched(self):
        """True if anything but black has ever been written."""
        return any(self.buffer[i] or self.buffer[i + 1]
                  for i in range(0, len(self.buffer), 2))

    # --- drawing, matching lib/gc9a01.py's public surface --------------

    def fill(self, color):
        self.fill_rect(0, 0, self.width, self.height, color)

    def pixel(self, x, y, color):
        self._set(x, y, color)

    def hline(self, x, y, length, color):
        for i in range(length):
            self._set(x + i, y, color)

    def vline(self, x, y, length, color):
        for i in range(length):
            self._set(x, y + i, color)

    def fill_rect(self, x, y, width, height, color):
        for row in range(height):
            for col in range(width):
                self._set(x + col, y + row, color)

    def rect(self, x, y, w, h, color):
        self.hline(x, y, w, color)
        self.hline(x, y + h - 1, w, color)
        self.vline(x, y, h, color)
        self.vline(x + w - 1, y, h, color)

    def line(self, x0, y0, x1, y1, color):
        """Bresenham. Every eyebrow, every polygon outline in shapes.py,
        goes through this."""
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy
        while True:
            self._set(x0, y0, color)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                x0 += sx
            if e2 < dx:
                err += dx
                y0 += sy

    def blit_buffer(self, buffer, x, y, width, height):
        for row in range(height):
            for col in range(width):
                off = (row * width + col) * 2
                color = (buffer[off] << 8) | buffer[off + 1]
                self._set(x + col, y + row, color)

    def text(self, font, string, x0, y0, color=0xFFFF, background=0x0000):
        """One glyph renderer for both fonts this kit ships. WIDTH=8 fonts
        pack one byte per row; WIDTH=16 fonts pack two. Either way, bit 7
        of each row-byte is the leftmost pixel, matching the real
        driver's _BIT7..._BIT0 walk -- this is just that walk generalized
        to any byte-per-row count instead of hard-coding 8 or 16."""
        bytes_per_row = font.WIDTH // 8
        glyph_size = font.HEIGHT * bytes_per_row
        x = x0
        for ch in string:
            code = ord(ch)
            if font.FIRST <= code < font.LAST:
                idx = (code - font.FIRST) * glyph_size
                for row in range(font.HEIGHT):
                    for bcol in range(bytes_per_row):
                        byte = font.FONT[idx + row * bytes_per_row + bcol]
                        for bit in range(8):
                            px = bcol * 8 + bit
                            if px >= font.WIDTH:
                                continue
                            on = byte & (0x80 >> bit)
                            self._set(x + px, y0 + row,
                                     color if on else background)
            x += font.WIDTH


def _build_gc9a01_module():
    """The one lib/ file this harness does not treat generically. Every
    other class-defining driver falls back to check-labs.py's
    DisplayStub; this kit's driver gets a real color565() and a display
    that actually keeps its pixels."""
    import types
    mod = types.ModuleType("gc9a01")
    mod.GC9A01 = RasterDisplay
    mod.color565 = real_color565
    return mod


def install_render_stubs(kit_dir):
    """check-labs.py's install_stubs(), with one substitution: gc9a01.py
    gets a rendering module instead of the generic class-name stub."""
    machine = cl._build_machine()
    utime = cl._build_utime()

    stub_modules = {
        "machine": machine,
        "umachine": machine,
        "utime": utime,
        "time": utime,
        "framebuf": cl._build_framebuf(),
        "micropython": cl._build_micropython(),
    }

    import random as _random
    stub_modules["urandom"] = _random

    lib_dir = os.path.join(kit_dir, "lib")
    if os.path.isdir(lib_dir):
        for entry in sorted(os.listdir(lib_dir)):
            if not (entry.endswith(".py") and not entry.startswith("_")):
                continue
            name = entry[:-3]
            path = os.path.join(lib_dir, entry)
            if name == "gc9a01":
                stub_modules[name] = _build_gc9a01_module()
            elif cl._defines_a_class(path):
                stub_modules[name] = cl._build_driver_module(name)
            else:
                stub_modules[name] = cl._load_real_module(name, path)

    sys.modules.update(stub_modules)
    return set(stub_modules)


def _alarm(signum, frame):
    raise cl.Timeout()


def run_and_capture(path, kit_dir, kit_modules, step_limit):
    """Run one lab under a fresh fake board. Returns the RasterDisplay
    that got constructed, or None if the lab never built one."""
    global _last_display
    _last_display = None

    for mod in list(sys.modules):
        if mod not in kit_modules and cl._is_kit_module(mod, kit_dir):
            del sys.modules[mod]

    cl.BENCH = cl.Bench()
    cl.BENCH.step_limit = step_limit
    # check-labs.py's fake Pin counts reads from 1 and calls the first TWO
    # of every 37 "pressed" (pin_reads % 37 < 3) -- by design, so a smoke
    # test exercises a lab's pressed-button path at least once. That is
    # the right default for a smoke test and the wrong one for a
    # screenshot: it means the very FIRST button read of every fresh run
    # registers as a press, so every menu lab's "default" image came back
    # one step advanced -- the emotion table opened on "Sad", not
    # "Happy". Starting the counter past that window gives every lab's
    # screenshot its true index-0 state instead.
    cl.BENCH.pin_reads = 3
    # cl.Bench() defaults its own .width/.height to check-labs.py's 128x64
    # fallback -- that is check-labs.py's business, not this script's, so
    # RasterDisplay.WIDTH/HEIGHT (set once in main(), from the kit's real
    # config.py) must NOT be overwritten from it here. An earlier version
    # of this line did exactly that, and every image came out 128x64 with
    # every real coordinate clipped off the bottom and right -- caught by
    # sanity-checking the actual file dimensions before trusting the
    # "rendered" count, which is the whole reason that check exists.

    source = open(path).read()
    namespace = {"__name__": "__main__", "__file__": path}

    signal.signal(signal.SIGALRM, _alarm)
    signal.setitimer(signal.ITIMER_REAL, TIMEOUT_S)
    try:
        exec(compile(source, os.path.basename(path), "exec"), namespace)
    except (cl.Budget, cl.Timeout):
        pass
    except Exception:
        import traceback
        print("    EXCEPTION while rendering:")
        for line in traceback.format_exc().rstrip().splitlines():
            print("      " + line)
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)

    return _last_display


def save_png(display, out_path, center_x, center_y, radius):
    img = Image.new("RGB", (display.width, display.height), BEZEL)
    px = img.load()
    for y in range(display.height):
        for x in range(display.width):
            if radius is not None:
                if (x - center_x) ** 2 + (y - center_y) ** 2 > radius * radius:
                    continue
            px[x, y] = unpack565(display._get(x, y))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path)


def main():
    parser = argparse.ArgumentParser(
        description="Render a simulated screen PNG for every lab in a kit.")
    parser.add_argument("kit", nargs="?", default=DEFAULT_KIT)
    parser.add_argument("outdir", nargs="?", default=DEFAULT_OUT)
    parser.add_argument("--only", metavar="TEXT",
                        help="only render labs whose filename contains TEXT")
    args = parser.parse_args()

    kit_dir = os.path.abspath(args.kit)
    out_dir = os.path.abspath(args.outdir)

    labs = sorted(f for f in os.listdir(kit_dir) if cl.LAB_PATTERN.match(f))
    if args.only:
        labs = [f for f in labs if args.only in f]
    if not labs:
        print("No numbered labs found in", kit_dir, file=sys.stderr)
        return 2

    kit_modules = install_render_stubs(kit_dir)
    sys.path.insert(0, kit_dir)

    # Read the real geometry from the kit's own config, so the mask
    # matches whatever screen this kit actually has -- a rectangular
    # kit with no RADIUS attribute just gets an unmasked rectangle.
    if "config" in sys.modules:
        del sys.modules["config"]
    import config as real_config
    center_x = getattr(real_config, "CENTER_X", real_config.WIDTH // 2)
    center_y = getattr(real_config, "CENTER_Y", real_config.HEIGHT // 2)
    radius = getattr(real_config, "RADIUS", None)
    RasterDisplay.WIDTH = real_config.WIDTH
    RasterDisplay.HEIGHT = real_config.HEIGHT
    del sys.modules["config"]

    manifest = {}
    rendered = skipped = retried = 0

    print("Rendering %d lab(s) from %s" % (len(labs), kit_dir))
    print()

    for name in labs:
        slug = name[LAB_PATTERN_PREFIX_LEN:-3]
        path = os.path.join(kit_dir, name)

        display = run_and_capture(path, kit_dir, kit_modules, SMALL_STEP_LIMIT)

        note = ""
        if display is not None and not display.touched():
            retried += 1
            display = run_and_capture(path, kit_dir, kit_modules,
                                      LARGE_STEP_LIMIT)
            # Re-check. The first attempt failing to draw anything does
            # not mean the second one did -- and reporting "ok" on a
            # blank image because a retry was ATTEMPTED, without
            # confirming it actually helped, is exactly the kind of bug
            # this script exists to avoid handing to the docs.
            if display is not None and display.touched():
                note = " (blank at first look, retried with a longer run)"
            else:
                note = " (STILL BLANK after retry -- check this one by hand)"

        if display is None:
            skipped += 1
            manifest[slug] = {"has_image": False}
            print("  skip     %-26s no display constructed" % name)
            continue

        out_path = os.path.join(out_dir, slug, "sample-output.png")
        save_png(display, out_path, center_x, center_y, radius)
        rendered += 1
        manifest[slug] = {"has_image": True, "blank": not display.touched()}
        status = "ok" if display.touched() else "BLANK"
        print("  %-8s %-26s -> %s%s" % (status, name, out_path, note))

    manifest_path = os.path.join(out_dir, "_render-manifest.json")
    os.makedirs(out_dir, exist_ok=True)
    with open(manifest_path, "w") as handle:
        json.dump(manifest, handle, indent=2, sort_keys=True)

    print()
    print("%d rendered, %d skipped, %d retried" % (rendered, skipped, retried))
    print("manifest:", manifest_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
