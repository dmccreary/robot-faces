# Lab 20: Demo Reel
# A self-running showcase that needs no buttons -- good for a science
# fair table or open house. Cycles through all seven emotions, blinking
# briefly between each one so the transitions read as alive instead of a
# slideshow.
#
# On this display the demo reel is also the first program where a full
# screen wipe per transition is genuinely the right call: it happens once
# every two seconds, not sixty times a second, and it guarantees no
# leftovers from the previous face.

import config
import shapes
from utime import sleep

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT

TOP_HALF = 3
BOTTOM_HALF = 12
BOTTOM_LEFT = 4
BOTTOM_RIGHT = 8

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 48
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 102
PUPIL_RADIUS = 8
EYEBROW_HALF_WIDTH = 24
EYEBROW_Y = EYE_Y - 40
MOUTH_Y = 164
LABEL_Y = 30

BLINK_RADIUS_Y = 14
STROKE = 4


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
        shapes.ellipse(display, corner_x, MOUTH_Y - 10 - offset, 14, 14,
                       WHITE, NO_FILL, mask)


def draw_happy():
    draw_eyes(24, 24)
    draw_eyebrows(0, 0, lift=5)
    draw_mouth_curve(50, 24, BOTTOM_HALF)


def draw_sad():
    draw_eyes(22, 22)
    draw_eyebrows(-7, -7, lift=0)
    draw_mouth_curve(40, 20, TOP_HALF)


def draw_angry():
    draw_eyes(24, 12)
    draw_eyebrows(12, 12, lift=-5)
    draw_mouth_flat(26)


def draw_afraid():
    draw_eyes(31, 31)
    draw_eyebrows(-12, -12, lift=7)
    draw_mouth_open(15, 22)


def draw_surprised():
    draw_eyes(32, 32)
    draw_eyebrows(0, 0, lift=14)
    draw_mouth_open(20, 26)


def draw_disgusted():
    draw_eyes(22, 15)
    draw_eyebrows(10, -5, lift=-3)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH - 14, MOUTH_Y - offset, 30, 18,
                       WHITE, NO_FILL, TOP_HALF)


def draw_contempt():
    draw_eyes(24, 24)
    draw_eyebrows(0, 0, lift=0)
    draw_mouth_smirk(34, 1)


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
            shapes.ellipse(display, x, EYE_Y + offset, 26, BLINK_RADIUS_Y,
                           WHITE, NO_FILL, TOP_HALF)
    sleep(0.12)


while True:
    for name, draw in EMOTIONS:
        show_emotion(name, draw)
        sleep(2)
        blink_transition()
