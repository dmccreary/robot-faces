#!/usr/bin/env python3
"""Check a ROUND kit's labs for drawing that lands outside the visible circle.

    python3 src/utils/check-circle.py src/kits/sw-gc9b72
    python3 src/utils/check-circle.py src/kits/smartwatch --only 16

This is the companion to check-labs.py, and it exists because of a gap
that file documents about itself:

    "it only checks the 240x240 square, so a face drawn entirely in the
     corners passes"

On a round display the driver addresses a SQUARE of pixels but the glass
is the circle inscribed in it. A pixel at (10, 10) on a 360x360 panel is
perfectly legal, costs real SPI bytes to send, and is permanently
invisible under the bezel. check-labs.py cannot see that; this can.

The gap gets wider the moment you scale a kit up. Multiplying every
coordinate by 1.5 moves each one FURTHER FROM CENTER, so a shape that
sat comfortably inside a 240x240 circle can slide under the bezel at
360x360 while still passing every square-bounds check. That is exactly
the failure this tool is looking for.

HOW IT WORKS

Rather than duplicate check-labs.py's fake microcontroller, this imports
it and wraps the one method every drawing call already funnels through,
Bench.check(). The wrapper does what it always did, then additionally
measures the point's distance from the screen's center.

WHAT THE RESULT MEANS

The circle's geometry comes from the kit's own config.py -- CENTER_X,
CENTER_Y, and SAFE_RADIUS. Two honest caveats follow from that:

  * SAFE_RADIUS is a judgement about where a particular bezel starts
    eating pixels. In the sw-gc9b72 kit it is currently an ESTIMATE
    scaled from another panel, not a measurement. A report from this
    tool is only ever as good as that number.
  * Only the points check-labs.py already samples are tested -- a
    shape's origin and extremes, not every pixel it fills. An ellipse
    whose center is safe can still bulge past the rim.

So treat a finding as "look at this", not "this is broken", and treat
silence as "nothing obvious", not "provably fine". Test on hardware.
"""

import argparse
import importlib.util
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def load_check_labs():
    """Import check-labs.py, whose hyphen makes it un-importable normally."""
    path = os.path.join(HERE, "check-labs.py")
    spec = importlib.util.spec_from_file_location("check_labs", path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules["check_labs"] = mod
    spec.loader.exec_module(mod)
    return mod


def read_circle(kit_dir):
    """Pull CENTER_X, CENTER_Y and SAFE_RADIUS out of a kit's config.py.

    Read as text rather than imported, the same way check-labs.py reads
    the screen size, so this runs before any stub is in place and has no
    chance of starting a display."""
    path = os.path.join(kit_dir, "config.py")
    if not os.path.isfile(path):
        return None
    found = {}
    wanted = ("CENTER_X", "CENTER_Y", "SAFE_RADIUS", "WIDTH", "HEIGHT")
    with open(path) as handle:
        for line in handle:
            line = line.split("#")[0].strip()
            if "=" not in line:
                continue
            name, _, value = line.partition("=")
            name = name.strip()
            value = value.strip()
            if name in wanted:
                # Accept a literal int, or the "WIDTH // 2" idiom.
                try:
                    found[name] = int(value)
                except ValueError:
                    if "//" in value:
                        base, _, divisor = value.partition("//")
                        base, divisor = base.strip(), divisor.strip()
                        if base in found and divisor.isdigit():
                            found[name] = found[base] // int(divisor)
    if "SAFE_RADIUS" not in found:
        return None
    cx = found.get("CENTER_X", found.get("WIDTH", 0) // 2)
    cy = found.get("CENTER_Y", found.get("HEIGHT", 0) // 2)
    return cx, cy, found["SAFE_RADIUS"]


def main():
    parser = argparse.ArgumentParser(
        description="Find drawing outside a round kit's visible circle.")
    parser.add_argument("kit", help="kit directory")
    parser.add_argument("--only", metavar="TEXT",
                        help="only run labs whose filename contains TEXT")
    parser.add_argument("--steps", type=int, default=8000)
    parser.add_argument("--timeout", type=float, default=15.0)
    args = parser.parse_args()

    kit_dir = os.path.abspath(args.kit)
    if not os.path.isdir(kit_dir):
        print("No such kit directory:", kit_dir, file=sys.stderr)
        return 2

    circle = read_circle(kit_dir)
    if circle is None:
        print("No SAFE_RADIUS in %s/config.py -- is this a round kit?"
              % kit_dir, file=sys.stderr)
        return 2
    cx, cy, safe = circle

    cl = load_check_labs()

    width, height = cl._read_kit_screen_size(kit_dir)
    if width and height:
        cl.FALLBACK_WIDTH = width
        cl.FALLBACK_HEIGHT = height

    # Wrap the one method every drawing call already goes through.
    # `outside` is keyed by lab so a lab's own findings stay together,
    # and each distinct message is counted rather than repeated -- an
    # animation loop would otherwise report the same point thousands of
    # times.
    outside = {}
    current = {"lab": "?", "color": None}
    original_check = cl.Bench.check

    def checking(self, what, x, y):
        original_check(self, what, x, y)
        try:
            reach = math.hypot(x - cx, y - cy)
        except TypeError:
            return
        if reach <= safe:
            return
        # Black outside the circle is not a bug. Clearing a full-width
        # strip is the normal way to erase on a display with no frame
        # buffer, and its ends necessarily overhang the glass -- erasing
        # more than you need is safe, erasing less leaves ghosts. Those
        # would otherwise be nearly all the noise this tool produces, so
        # they are separated out rather than mixed in with real findings.
        colour = current["color"]
        visible = not (colour == 0 or colour is None and False)
        bucket = outside.setdefault(current["lab"], {"lit": {}, "black": {}})
        key = "%s at (%s,%s) -- %d px from center" % (
            what, x, y, round(reach))
        side = bucket["lit"] if visible else bucket["black"]
        side[key] = side.get(key, 0) + 1

    cl.Bench.check = checking

    # Remember the color each drawing call was given, so `checking()`
    # above can tell a visible shape from a black erase. Every one of
    # these takes its color in a known position; anything not listed
    # (text, blit) is treated as visible, which is the safe default.
    COLOR_ARG = {
        "pixel": 2, "hline": 3, "vline": 3, "line": 4,
        "rect": 4, "fill_rect": 4, "ellipse": 4, "poly": 3,
    }

    def remember_color(name, index):
        original = getattr(cl.DisplayStub, name)

        def wrapper(self, *args, **kwargs):
            if len(args) > index:
                current["color"] = args[index]
            else:
                current["color"] = kwargs.get("colour", kwargs.get("color"))
            try:
                return original(self, *args, **kwargs)
            finally:
                current["color"] = None

        setattr(cl.DisplayStub, name, wrapper)

    for _name, _index in COLOR_ARG.items():
        if hasattr(cl.DisplayStub, _name):
            remember_color(_name, _index)

    labs = sorted(f for f in os.listdir(kit_dir) if cl.LAB_PATTERN.match(f))
    if args.only:
        labs = [f for f in labs if args.only in f]
    if not labs:
        print("No numbered labs (NN-name.py) found in", kit_dir,
              file=sys.stderr)
        return 2

    kit_modules = cl.install_stubs(kit_dir)
    sys.path.insert(0, kit_dir)

    print("Circle check: center (%d,%d), safe radius %d, %d lab(s) in %s"
          % (cx, cy, safe, len(labs), kit_dir))
    print()

    for name in labs:
        current["lab"] = name
        status, detail = cl.run_lab(os.path.join(kit_dir, name), kit_dir,
                                    kit_modules, args.steps, args.timeout,
                                    False)
        found = outside.get(name) or {"lit": {}, "black": {}}
        lit, black = found["lit"], found["black"]
        blacknote = ""
        if black:
            blacknote = "  (+%d black erase point(s), harmless)" % len(black)

        if status == "failed":
            print("  crashed  %-26s (run check-labs.py to see why)" % name)
        elif lit:
            total = sum(lit.values())
            print("  OUTSIDE  %-26s %d visible call(s), %d distinct%s"
                  % (name, total, len(lit), blacknote))
            for key, count in sorted(lit.items(), key=lambda kv: -kv[1])[:4]:
                times = "" if count == 1 else "  x%d" % count
                print("               %s%s" % (key, times))
            if len(lit) > 4:
                print("               ... and %d more distinct point(s)"
                      % (len(lit) - 4))
        else:
            print("  inside   %-26s%s" % (name, blacknote))

    flagged = [n for n in labs if (outside.get(n) or {}).get("lit")]
    print()
    print("%d lab(s) with no visible drawing outside the safe circle, "
          "%d with some" % (len(labs) - len(flagged), len(flagged)))
    print()
    print("Black outside the circle is not counted as a finding: erasing a")
    print("full-width strip is normal on a display with no frame buffer, and")
    print("erasing MORE than you need is safe while erasing less leaves ghosts.")
    print()
    print("Reminder: SAFE_RADIUS is a judgment about where the bezel starts,")
    print("and only the points check-labs.py samples are tested -- a shape")
    print("whose center is safe can still bulge past the rim. Findings are")
    print("'look at this', not 'this is broken'. Confirm on hardware.")

    # Deliberately always 0: a lab may sit outside the safe radius on
    # purpose, and this tool is not sure enough to fail anyone's build.
    return 0


if __name__ == "__main__":
    sys.exit(main())
