# Lab 20: Demo Reel
# A self-running showcase that needs no buttons -- good for a science
# fair table or open house. Cycles through all seven emotions, blinking
# briefly between each one so the transitions read as alive instead of a
# slideshow.
#
# On this display the demo reel is also the first program where a full
# screen wipe per transition is genuinely the right call: it happens once
# every two seconds, not sixty times a second, and it guarantees no
# leftovers from the previous face. (A wipe here is 129,600 pixels and
# 259,200 bytes down the SPI wire -- 2.25 times what the same wipe cost
# on the smartwatch kit's 240x240 panel. Still cheap once every two
# seconds. Not cheap sixty times a second.)
#
# This is a port of the smartwatch kit's 20-demo.py: every coordinate,
# radius, and stroke is that lab's number times 1.5 (360 / 240), with the
# original in a trailing comment. The FONT is the exception -- bitmap
# glyphs cannot scale, so the emotion name moves up to the 16x32 font.

import config
import shapes
from utime import sleep

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

# 16x32. The centering in show_emotion() multiplies by FONT.WIDTH, never
# by a literal 8 or 16, so the label stays centered whichever font this
# names. "Surprised", the longest of the seven, is 9 * 16 = 144 px wide
# against roughly 199 px of visible circle at LABEL_Y.
FONT = config.BIG_FONT             # config.SMALL_FONT on the smartwatch kit

TOP_HALF = 3
BOTTOM_HALF = 12
BOTTOM_LEFT = 4
BOTTOM_RIGHT = 8

HALF_WIDTH = config.WIDTH // 2            # 180
EYE_SPACING = 72                          # 48 on the smartwatch kit
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING     # 108
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING    # 252
EYE_Y = 153                               # 102 on the smartwatch kit
PUPIL_RADIUS = 12                         # 8 on the smartwatch kit
EYEBROW_HALF_WIDTH = 36                   # 24 on the smartwatch kit
EYEBROW_Y = EYE_Y - 60                    # 93 -- 40 below eye level, scaled
MOUTH_Y = 246                             # 164 on the smartwatch kit
# NOT the scaled 45. text() paints a black background as tall as the
# font, and the label font here is 16x32 -- so a label at row 45 covers
# rows 45-76, and Afraid's raised eyebrow reaches row 64. Drawing the
# label after the face would slice the top off that brow. 32 clears it.
# Matches face.LABEL_Y for the same reason.
LABEL_Y = 32

BLINK_RADIUS_Y = 21                       # 14 on the smartwatch kit
STROKE = 6                                # 4 on the smartwatch kit


def draw_eye(x, rx, ry):
    shapes.ellipse(display, x, EYE_Y, rx, ry, WHITE, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_eyes(rx, ry):
    draw_eye(LEFT_EYE_X, rx, ry)
    draw_eye(RIGHT_EYE_X, rx, ry)


def draw_eyebrow(x, side, tilt, lift):
    y = EYEBROW_Y - lift
    outer_x = x - (EYEBROW_HALF_WIDTH * side)
    inner_x = x + (EYEBROW_HALF_WIDTH * side)
    for offset in range(STROKE):
        display.line(outer_x, y - tilt + offset,
                     inner_x, y + tilt + offset, WHITE)


def draw_eyebrows(tilt_left, tilt_right, lift=0):
    draw_eyebrow(LEFT_EYE_X, 1, tilt_left, lift)
    draw_eyebrow(RIGHT_EYE_X, -1, tilt_right, lift)


def draw_mouth_curve(radius_x, radius_y, mask):
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       radius_x, radius_y, WHITE, NO_FILL, mask)


def draw_mouth_flat(half_width):
    display.fill_rect(HALF_WIDTH - half_width, MOUTH_Y,
                      half_width * 2, STROKE, WHITE)


def draw_mouth_open(radius_x, radius_y):
    shapes.ellipse(display, HALF_WIDTH, MOUTH_Y, radius_x, radius_y,
                   WHITE, FILL)


def draw_mouth_smirk(half_width, side):
    draw_mouth_flat(half_width)
    corner_x = HALF_WIDTH + (half_width * side)
    mask = BOTTOM_RIGHT if side > 0 else BOTTOM_LEFT
    for offset in range(STROKE):
        # 10 -> 15, 14 -> 21 on the smartwatch kit
        shapes.ellipse(display, corner_x, MOUTH_Y - 15 - offset, 21, 21,
                       WHITE, NO_FILL, mask)


# The same seven expressions as Lab 19, so the reel and the menu show
# identical faces. Each number is the smartwatch kit's value times 1.5,
# rounded to the nearest pixel.

def draw_happy():
    draw_eyes(36, 36)                       # 24, 24
    draw_eyebrows(0, 0, lift=8)             # lift=5
    draw_mouth_curve(75, 36, BOTTOM_HALF)   # 50, 24


def draw_sad():
    draw_eyes(33, 33)                       # 22, 22
    draw_eyebrows(-11, -11, lift=0)         # -7, -7
    draw_mouth_curve(60, 30, TOP_HALF)      # 40, 20


def draw_angry():
    draw_eyes(36, 18)                       # 24, 12
    draw_eyebrows(18, 18, lift=-8)          # 12, 12, lift=-5
    draw_mouth_flat(39)                     # 26


def draw_afraid():
    draw_eyes(47, 47)                       # 31, 31
    draw_eyebrows(-18, -18, lift=11)        # -12, -12, lift=7
    draw_mouth_open(23, 33)                 # 15, 22


def draw_surprised():
    draw_eyes(48, 48)                       # 32, 32
    draw_eyebrows(0, 0, lift=21)            # lift=14
    draw_mouth_open(30, 39)                 # 20, 26


def draw_disgusted():
    draw_eyes(33, 23)                       # 22, 15
    draw_eyebrows(15, -8, lift=-5)          # 10, -5, lift=-3
    for offset in range(STROKE):
        # An off-center raised lip: 14 -> 21, 30 -> 45, 18 -> 27
        shapes.ellipse(display, HALF_WIDTH - 21, MOUTH_Y - offset, 45, 27,
                       WHITE, NO_FILL, TOP_HALF)


def draw_contempt():
    draw_eyes(36, 36)                       # 24, 24
    draw_eyebrows(0, 0, lift=0)
    draw_mouth_smirk(51, 1)                 # 34


EMOTIONS = (
    ("Happy", draw_happy),
    ("Sad", draw_sad),
    ("Angry", draw_angry),
    ("Afraid", draw_afraid),
    ("Surprised", draw_surprised),
    ("Disgusted", draw_disgusted),
    ("Contempt", draw_contempt),
)


def show_emotion(name, draw):
    display.fill(BLACK)
    draw()
    x = HALF_WIDTH - (len(name) * FONT.WIDTH) // 2
    display.text(FONT, name, x, LABEL_Y, WHITE, BLACK)


def blink_transition():
    display.fill(BLACK)
    for x in (LEFT_EYE_X, RIGHT_EYE_X):
        for offset in range(STROKE):
            # 26 -> 39 on the smartwatch kit
            shapes.ellipse(display, x, EYE_Y + offset, 39, BLINK_RADIUS_Y,
                           WHITE, NO_FILL, TOP_HALF)
    sleep(0.12)


while True:
    for name, draw in EMOTIONS:
        show_emotion(name, draw)
        sleep(2)
        blink_transition()
