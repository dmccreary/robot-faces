# Lab 34: Color and Resolution Demo
# A self-running showcase that cycles through color and resolution tests.
# It needs no buttons, so it runs on a bare display before you have wired
# any. Good for a first bring-up: if something about the wiring or the
# driver's init sequence is wrong, one of these six scenes will show it.
#
# This lab has no counterpart in the smartwatch kit -- it was written for
# the GC9B72 bring-up, which is why it sits after the ported labs rather
# than among them.
#
#   1. Solid fills       -- does every basic color reach the glass at all?
#   2. Color bars         -- all colors side by side, a classic test pattern
#   3. RGB565 gradients   -- 360 px of width shows off 565's bit depth
#   4. Checkerboard grid  -- fine detail and pixel alignment
#   5. Rainbow disc       -- hue by angle, saturation by radius: the one
#                            scene whose shape and the screen's shape match
#   6. Alignment target   -- a crosshair and border, to catch mirroring or
#                            a drawing window that doesn't reach every edge
#
# Runs forever. Ctrl-C (or unplug the board) to stop.

import config
from math import atan2, sqrt, pi
from utime import sleep_ms

display = config.init_display()
FONT = config.SMALL_FONT

W = config.WIDTH
H = config.HEIGHT
CX = W // 2
CY = H // 2

BLACK = config.BLACK
WHITE = config.WHITE

DWELL_MS = 2000


def label(text):
    """A one-line caption at the top of the screen, and the same text
    printed to the shell -- useful if the display isn't showing anything
    yet and you're debugging from the REPL instead."""
    print(text)
    x = CX - (len(text) * FONT.WIDTH) // 2
    display.fill_rect(0, 4, W, FONT.HEIGHT, BLACK)
    display.text(FONT, text, x, 4, WHITE, BLACK)


# ---------------------------------------------------------------------
# 1. Solid fills -- the simplest possible test. If this doesn't work,
# nothing else in this file will either.

SOLID_COLORS = (
    ("black", config.BLACK),
    ("white", config.WHITE),
    ("red", config.RED),
    ("green", config.GREEN),
    ("blue", config.BLUE),
    ("yellow", config.YELLOW),
    ("cyan", config.CYAN),
    ("magenta", config.MAGENTA),
)


def scene_solid_fills():
    for name, color in SOLID_COLORS:
        print("fill:", name)
        display.fill(color)
        sleep_ms(400)


# ---------------------------------------------------------------------
# 2. Color bars -- a classic broadcast test pattern, eight vertical
# stripes covering the full width and height.

BAR_COLORS = (
    config.WHITE, config.YELLOW, config.CYAN, config.GREEN,
    config.MAGENTA, config.RED, config.BLUE, config.BLACK,
)


def scene_color_bars():
    display.fill(BLACK)
    bar_w = W // len(BAR_COLORS)
    x = 0
    for i, color in enumerate(BAR_COLORS):
        w = bar_w if i < len(BAR_COLORS) - 1 else W - x
        display.fill_rect(x, 0, w, H, color)
        x += w
    label("color bars")
    sleep_ms(DWELL_MS)


# ---------------------------------------------------------------------
# 3. RGB565 gradients -- three horizontal ramps, one per color channel.
# Red and blue only have 5 bits (32 levels) to sweep across 360 pixels;
# green has 6 bits (64 levels). Look closely and the green band should
# look smoother -- it has twice as many steps to work with.

def _gradient_row(width, channel_bits, make_color):
    """One row of `width` pixels, sweeping a channel from 0 to its max
    value, returned as `bytes` ready for blit_buffer()."""
    max_value = (1 << channel_bits) - 1
    row = bytearray(width * 2)
    pos = 0
    for x in range(width):
        level = x * max_value // (width - 1)
        color = make_color(level)
        row[pos] = color >> 8
        row[pos + 1] = color & 0xFF
        pos += 2
    return bytes(row)


def scene_gradients():
    band_h = H // 3
    bands = (
        (0, 5, lambda level: level << 11),         # red:   bits 15-11
        (band_h, 6, lambda level: level << 5),     # green: bits 10-5
        (band_h * 2, 5, lambda level: level),      # blue:  bits 4-0
    )
    for top, bits, make_color in bands:
        row = _gradient_row(W, bits, make_color)
        height = band_h if top < band_h * 2 else H - band_h * 2
        for r in range(height):
            display.blit_buffer(row, 0, top + r, W, 1)

    label("RGB565 gradients")
    sleep_ms(DWELL_MS)


# ---------------------------------------------------------------------
# 4. Checkerboard -- fine detail and pixel alignment. If a square comes
# out non-square, or the pattern is offset, something about the driver's
# window or rotation setup needs a look.

CELL = 20  # 360 / 20 = 18 cells across, evenly


def scene_checkerboard():
    display.fill(BLACK)
    for row, y in enumerate(range(0, H, CELL)):
        for col, x in enumerate(range(0, W, CELL)):
            if (row + col) % 2 == 0:
                display.fill_rect(x, y, CELL, CELL, WHITE)
    label("checkerboard")
    sleep_ms(DWELL_MS)


# ---------------------------------------------------------------------
# 5. Rainbow disc -- every hue at every saturation, in one circle. Hue is
# the ANGLE around the center, saturation is the DISTANCE from it. Drawn
# one row at a time and sent with blit_buffer(), same technique as the
# kit's own color-wheel lab 33, adapted here to a full disc instead
# of a ring since there's no text panel to protect in the middle.
#
# This is the slowest scene in the file -- the RP2040 has no hardware
# floating point, so atan2() and sqrt() are the bottleneck, not the SPI
# wire. Computing one color per 2x2 block instead of per pixel (BLOCK
# below) cuts that math to a quarter without a visible loss of detail.

OUTER_R = min(CX, CY) - 5   # stay inside the visible glass
OUTER_R2 = OUTER_R * OUTER_R
BLOCK = 2
DEGREES_PER_RADIAN = 180.0 / pi


def scene_rainbow_disc():
    print("rainbow disc (this one takes a few seconds)...")
    display.fill(BLACK)

    _sqrt = sqrt
    _atan2 = atan2
    _int = int
    _blit = display.blit_buffer

    for dy in range(-OUTER_R, OUTER_R + 1, BLOCK):
        last = dy + BLOCK - 1
        near = dy if abs(dy) < abs(last) else last
        near2 = near * near
        if near2 > OUTER_R2:
            continue

        outer_span = _int(_sqrt(OUTER_R2 - near2))
        start_dx, end_dx = -outer_span, outer_span
        width = end_dx - start_dx + 1
        if width <= 0:
            continue

        line = bytearray(width * 2)
        offset = 0
        dx = start_dx
        color = 0
        countdown = 0

        while dx <= end_dx:
            if countdown == 0:
                countdown = BLOCK
                radius2 = dx * dx + near2
                hue = _atan2(near, dx) * DEGREES_PER_RADIAN
                if hue < 0:
                    hue += 360.0

                sat = _sqrt(radius2) / OUTER_R
                if sat > 1.0:
                    sat = 1.0

                sixth = hue * (1.0 / 60.0)
                whole = _int(sixth)
                ramp = sixth - whole
                sector = whole % 6

                low = 255.0 * (1.0 - sat)
                falling = 255.0 * (1.0 - ramp * sat)
                rising = 255.0 * (1.0 - (1.0 - ramp) * sat)

                if sector == 0:
                    r, g, b = 255.0, rising, low
                elif sector == 1:
                    r, g, b = falling, 255.0, low
                elif sector == 2:
                    r, g, b = low, 255.0, rising
                elif sector == 3:
                    r, g, b = low, falling, 255.0
                elif sector == 4:
                    r, g, b = rising, low, 255.0
                else:
                    r, g, b = 255.0, low, falling

                color = ((_int(r) & 0xF8) << 8
                         | (_int(g) & 0xFC) << 3
                         | _int(b) >> 3)

            line[offset] = color >> 8
            line[offset + 1] = color & 0xFF
            offset += 2
            dx += 1
            countdown -= 1

        height = BLOCK
        if CY + dy + height > H:
            height = H - (CY + dy)
        for strip_row in range(height):
            _blit(line, CX + start_dx, CY + dy + strip_row, width, 1)

    sleep_ms(1500)


# ---------------------------------------------------------------------
# 6. Alignment target -- a border two pixels in from every edge, a
# crosshair through the exact center, and tick marks at north, south,
# east and west. If the picture is offset, mirrored, or the drawing
# window doesn't reach every edge, this is where it shows up.

def scene_alignment_target():
    display.fill(BLACK)
    display.rect(2, 2, W - 4, H - 4, WHITE)
    display.hline(0, CY, W, config.RED)
    display.vline(CX, 0, H, config.RED)

    tick = 10
    display.fill_rect(CX - 1, 2, 2, tick, config.YELLOW)             # N
    display.fill_rect(CX - 1, H - 2 - tick, 2, tick, config.YELLOW)  # S
    display.fill_rect(2, CY - 1, tick, 2, config.YELLOW)             # W
    display.fill_rect(W - 2 - tick, CY - 1, tick, 2, config.YELLOW)  # E

    caption = "alignment target"
    x = CX - (len(caption) * FONT.WIDTH) // 2
    display.text(FONT, caption, x, CY - 40, WHITE, BLACK)

    size = "{} x {}".format(W, H)
    x = CX - (len(size) * FONT.WIDTH) // 2
    display.text(FONT, size, x, CY - 20, WHITE, BLACK)

    print("alignment target")
    sleep_ms(DWELL_MS)


# ---------------------------------------------------------------------

SCENES = (
    scene_solid_fills,
    scene_color_bars,
    scene_gradients,
    scene_checkerboard,
    scene_rainbow_disc,
    scene_alignment_target,
)

while True:
    for scene in SCENES:
        scene()
