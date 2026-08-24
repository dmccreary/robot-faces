# Lab 32: Color and Bits -- What a Number Has to Give Up
#
# On the OLED kit a pixel was one bit. On or off. There was nothing to
# ask about it, and no lab could have been written on the subject.
#
# Here a pixel is a 16-bit number, and there is a great deal to ask. This
# is the one lab in the kit that the mono display could not have taught,
# and what it teaches is REPRESENTATION -- how a real thing gets squeezed
# into a fixed number of bits, and what falls out along the way. That
# question is not about displays. It is the same question behind MP3s,
# JPEGs, floating point, and every file format you will ever open.
#
# Note what does NOT change on the way from the smartwatch kit's 240 px
# panel to this 360 px one: all of it. The encoding is a property of the
# number, not of the glass. Five bits is five bits on any screen.
#
# Here is the whole encoding, from lib/gc9b72.py:
#
#     def color565(red, green, blue):
#         return (red & 0xF8) << 8 | (green & 0xFC) << 3 | blue >> 3
#
# Three 0-255 numbers go in. One 16-bit number comes out:
#
#     bit  15 14 13 12 11 | 10 9 8 7 6 5 | 4 3 2 1 0
#          R  R  R  R  R  | G  G G G G G | B B B B B
#             5 bits      |    6 bits    |   5 bits
#
# 5 + 6 + 5 = 16. Count what that costs: you handed over 8 bits per
# channel and got back 5, 6, and 5. Sixteen million colors went in;
# 65,536 came out.
#
# Two questions worth answering before you press a button:
#
#   WHY DOES GREEN GET THE EXTRA BIT? Your eye is not an equal-opportunity
#   detector. Most of your sense of brightness comes from green light,
#   some from red, and very little from blue. Spending the one spare bit
#   on green puts it where you are most likely to notice.
#
#   WHY NOT JUST STORE ALL 24 BITS? Do the arithmetic:
#       360 x 360 x 2 bytes = 259,200   (what this display uses)
#       360 x 360 x 3 bytes = 388,800   (what 24-bit color would need)
#   An RP2040 has 264 KB of RAM total -- 270,336 bytes -- and MicroPython
#   is already using most of it. Even the 16-bit figure is 253 KB, which
#   would not leave room for the program that drew it, and the 24-bit one
#   is more memory than the chip has at all. That is the same arithmetic
#   that explains why this driver has no frame buffer and why there is no
#   show() in this kit. On the smartwatch kit's 240 px panel the numbers
#   were 115,200 and 172,800 -- the same argument, with more slack in it.
#
# Button A steps through the views. Button B prints the numbers behind
# whichever one you are looking at to the Thonny shell.

import config
from utime import sleep_ms

display = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
FONT = config.SMALL_FONT
HALF = config.WIDTH // 2

# The ramps live in a band across the middle of the circle, where the
# glass is widest. Each is 280 pixels of screen showing 256 input levels.
#
# A straight 1.5x of the smartwatch kit's 20/200 would be 30/300, and the
# band itself would fit -- but the caption above each ramp sits further
# from the center than the ramp does, and at that height x=30 is already
# under the bezel. Pulling both in to 40/280 keeps the caption on the
# glass. On a round screen the widest thing in a column decides where the
# column can start.
RAMP_X = 40
RAMP_W = 280
RAMP_H = 51


def centered(string, y, color=WHITE):
    x = HALF - (len(string) * FONT.WIDTH) // 2
    display.text(FONT, string, x, y, color, BLACK)


def ramp(y, channel):
    """Draw a smooth 0-255 sweep of one channel and let the encoding
    break it into bands.

    Nothing here is quantizing on purpose. We ask for all 256 levels,
    one per column-ish, and color565() throws away the low bits on the
    way past. The stripes you see ARE the bits that did not fit."""
    for i in range(RAMP_W):
        level = (i * 255) // (RAMP_W - 1)
        if channel == 'r':
            color = config.color565(level, 0, 0)
        elif channel == 'g':
            color = config.color565(0, level, 0)
        elif channel == 'b':
            color = config.color565(0, 0, level)
        else:
            color = config.color565(level, level, level)
        display.vline(RAMP_X + i, y, RAMP_H, color)


def view_layout():
    """Where the sixteen bits go."""
    display.fill(BLACK)
    centered("RGB565", 60)
    centered("16 bits per pixel", 93)

    # A bar showing the three fields at their true relative widths:
    # 5, 6 and 5 of 16 bits across 240 pixels = 75, 90, 75. The bar got
    # wider with the screen; the bits it is dividing did not change.
    bar_x = 60
    display.fill_rect(bar_x, 144, 75, 39, config.color565(255, 60, 60))
    display.fill_rect(bar_x + 75, 144, 90, 39, config.color565(60, 255, 60))
    display.fill_rect(bar_x + 165, 144, 75, 39, config.color565(90, 90, 255))

    centered("R:5  G:6  B:5", 198)
    centered("green gets the", 237)
    centered("spare bit", 264)


def view_ramps():
    """Red and green side by side -- the whole 5-vs-6 bit lesson."""
    display.fill(BLACK)
    centered("count the bands", 45)

    display.text(FONT, "R: 32 steps", RAMP_X, 100, WHITE, BLACK)
    ramp(120, 'r')

    display.text(FONT, "G: 64 steps", RAMP_X, 185, WHITE, BLACK)
    ramp(205, 'g')

    centered("green is smoother", 280)


def view_blue():
    """Blue, alone, so its dimness is impossible to miss."""
    display.fill(BLACK)
    centered("blue: 32 steps", 60)
    ramp(105, 'b')
    centered("...and dim", 180)
    centered("your eye takes", 219)
    centered("little brightness", 246)
    centered("from blue light", 273)


def view_gray():
    """All three channels together. The bands nearly vanish, because a
    step in one channel is hidden by the other two moving with it."""
    display.fill(BLACK)
    centered("all three at once", 60)
    ramp(105, 'w')
    centered("bands almost gone", 180)
    centered("errors in R, G and B", 219)
    centered("do not line up", 246)


def view_memory():
    """The arithmetic that explains the whole kit."""
    display.fill(BLACK)
    centered("360 x 360 pixels", 66)
    centered("x2 bytes = 259200", 102)
    centered("that is 253 KB", 132)
    centered("RP2040 RAM: 264 KB", 162, config.YELLOW)
    centered("...minus what", 192)
    centered("MicroPython uses", 219)
    centered("no frame buffer", 258, config.CYAN)
    centered("and no show()", 285, config.CYAN)


VIEWS = (
    ("bit layout", view_layout),
    ("red vs green", view_ramps),
    ("blue", view_blue),
    ("all channels", view_gray),
    ("memory", view_memory),
)


def report(index):
    """Print the numbers behind the current view."""
    name = VIEWS[index][0]
    print("--- view:", name)

    if index == 0 or index == 4:
        for r, g, b in ((255, 0, 0), (0, 255, 0), (0, 0, 255),
                        (255, 255, 255), (255, 200, 90)):
            packed = config.color565(r, g, b)
            print("  color565(%3d,%3d,%3d) = 0x%04X = %s"
                  % (r, g, b, packed, bin(packed)))
    else:
        # How many DISTINCT values a channel can actually take, counted
        # rather than asserted. Ask for all 256 and see what survives.
        for channel, shift, mask in (("red", 11, 0x1f),
                                     ("green", 5, 0x3f),
                                     ("blue", 0, 0x1f)):
            seen = set()
            for level in range(256):
                if channel == "red":
                    packed = config.color565(level, 0, 0)
                elif channel == "green":
                    packed = config.color565(0, level, 0)
                else:
                    packed = config.color565(0, 0, level)
                seen.add((packed >> shift) & mask)
            print("  %-5s 256 levels in -> %d distinct out"
                  % (channel, len(seen)))


def pressed(button):
    if button.value() == 1:
        return False
    sleep_ms(20)              # debounce: let the contacts settle
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep_ms(10)


index = 0
VIEWS[index][1]()
report(index)

while True:
    if pressed(button_a):
        wait_for_release(button_a)
        index = (index + 1) % len(VIEWS)
        VIEWS[index][1]()

    if pressed(button_b):
        wait_for_release(button_b)
        report(index)

    sleep_ms(10)


# ---------------------------------------------------------------------
# Things to try:
#
# 1. Count the bands in the red ramp before you count the green ones.
#    Getting 32 and 64 by eye, off a screen, is a genuinely satisfying
#    way to read a number out of hardware. This screen makes it easier
#    than the smartwatch kit did: the same 32 bands are spread over 280
#    pixels instead of 200, so each one is wider.
#
# 2. Press B on the ramp view. It asks for all 256 levels of each channel
#    and counts how many survive the encoding. The answer is not asserted
#    anywhere in that code -- it is measured, the same habit labs 26, 29
#    and 31 have been building.
#
# 3. Work out on paper what color565(255, 0, 0) should be, then press B
#    and check. Hint: 255 & 0xF8 = 248, and 248 << 8 = 0xF800.
#
# 4. What does color565(7, 3, 7) give you? Predict first. All three
#    values are small enough to be thrown away entirely, so the answer is
#    pure black -- which is worth seeing, because it means there are 8 x 4
#    x 8 = 256 different "colors" your code can name that this display
#    cannot tell apart from black.
#
# 5. Change the masks in the ramp: use `level & 0xf0` before passing it
#    in, and the bands get twice as wide. You have just built a worse
#    encoding on purpose, which is a fast way to understand a real one.
#
# 6. Look up RGB332, which packs a pixel into ONE byte -- 3 bits red, 3
#    green, 2 blue, for 256 colors total. Sketch what the red ramp would
#    look like. Then look up 24-bit color and ask why your phone can
#    afford it and this board cannot. The answer is in view 5.
#
# 7. Back in lab 24, every emotion's color is a config.color565() call.
#    Go and read those three numbers for each emotion, and predict which
#    one will look dimmest. Then look. You now know why every color in
#    that table has green in it.
