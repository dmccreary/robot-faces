# Lab 20: Demo Reel
# A self-running showcase that needs no buttons -- good for a science
# fair table or open house. Cycles through all seven emotions, blinking
# briefly between each one so the transitions read as alive instead of a
# slideshow.

import config
from utime import sleep

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3
BOTTOM_HALF = 12
BOTTOM_LEFT = 4
BOTTOM_RIGHT = 8

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 24
PUPIL_RADIUS = 3
EYEBROW_HALF_WIDTH = 11
EYEBROW_Y = EYE_Y - 10
MOUTH_Y = 46

BLINK_RADIUS_Y = 6
STROKE = 3


def draw_eye(x, rx, ry):
    oled.ellipse(x, EYE_Y, rx, ry, WHITE, FILL)
    oled.ellipse(x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_eyes(rx, ry):
    draw_eye(LEFT_EYE_X, rx, ry)
    draw_eye(RIGHT_EYE_X, rx, ry)


def draw_eyebrow(x, side, tilt, lift):
    y = EYEBROW_Y - lift
    outer_x = x - (EYEBROW_HALF_WIDTH * side)
    inner_x = x + (EYEBROW_HALF_WIDTH * side)
    oled.line(outer_x, y - tilt, inner_x, y + tilt, WHITE)


def draw_eyebrows(tilt_left, tilt_right, lift=0):
    draw_eyebrow(LEFT_EYE_X, 1, tilt_left, lift)
    draw_eyebrow(RIGHT_EYE_X, -1, tilt_right, lift)


def draw_mouth_curve(radius_x, radius_y, mask):
    oled.ellipse(HALF_WIDTH, MOUTH_Y, radius_x, radius_y, WHITE, NO_FILL, mask)


def draw_mouth_flat(half_width):
    oled.hline(HALF_WIDTH - half_width, MOUTH_Y, half_width * 2, WHITE)


def draw_mouth_open(radius_x, radius_y):
    oled.ellipse(HALF_WIDTH, MOUTH_Y, radius_x, radius_y, WHITE, FILL)


def draw_mouth_smirk(half_width, side):
    oled.hline(HALF_WIDTH - half_width, MOUTH_Y, half_width * 2, WHITE)
    corner_x = HALF_WIDTH + (half_width * side)
    mask = BOTTOM_RIGHT if side > 0 else BOTTOM_LEFT
    oled.ellipse(corner_x, MOUTH_Y - 4, 6, 6, WHITE, NO_FILL, mask)


def draw_happy():
    draw_eyes(10, 10)
    draw_eyebrows(0, 0, lift=2)
    draw_mouth_curve(22, 12, BOTTOM_HALF)


def draw_sad():
    draw_eyes(9, 9)
    draw_eyebrows(-3, -3, lift=0)
    draw_mouth_curve(16, 8, TOP_HALF)


def draw_angry():
    draw_eyes(10, 5)
    draw_eyebrows(5, 5, lift=-2)
    draw_mouth_flat(10)


def draw_afraid():
    draw_eyes(13, 13)
    draw_eyebrows(-5, -5, lift=3)
    draw_mouth_open(6, 9)


def draw_surprised():
    draw_eyes(14, 14)
    draw_eyebrows(0, 0, lift=6)
    draw_mouth_open(8, 11)


def draw_disgusted():
    draw_eyes(9, 6)
    draw_eyebrows(4, -2, lift=-1)
    oled.ellipse(HALF_WIDTH - 6, MOUTH_Y, 12, 7, WHITE, NO_FILL, TOP_HALF)


def draw_contempt():
    draw_eyes(10, 10)
    draw_eyebrows(0, 0, lift=0)
    draw_mouth_smirk(14, 1)


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
    oled.fill(BLACK)
    draw()
    oled.text(name, 2, 2, WHITE)
    oled.show()


def blink_transition():
    oled.fill(BLACK)
    for x in (LEFT_EYE_X, RIGHT_EYE_X):
        oled.ellipse(x, EYE_Y, 11, BLINK_RADIUS_Y, WHITE, NO_FILL, TOP_HALF)
    oled.show()
    sleep(0.12)


while True:
    for name, draw in EMOTIONS:
        show_emotion(name, draw)
        sleep(2)
        blink_transition()
