# Lab 10: Happy Face
# The first complete expression, built from three small functions --
# draw_eyes(), draw_eyebrows(), and a curved mouth. Later labs reuse this
# exact same pattern with different numbers to draw every other emotion.

import config

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
BOTTOM_HALF = 12

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 24
PUPIL_RADIUS = 3

EYEBROW_HALF_WIDTH = 11
EYEBROW_Y = EYE_Y - 10

MOUTH_Y = 46


def draw_eye(x, rx, ry):
    oled.ellipse(x, EYE_Y, rx, ry, WHITE, FILL)
    oled.ellipse(x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_eyes(rx, ry):
    draw_eye(LEFT_EYE_X, rx, ry)
    draw_eye(RIGHT_EYE_X, rx, ry)


def draw_eyebrow(x, side, lift):
    # side: 1 for the left eyebrow (nose to the right), -1 for the right
    y = EYEBROW_Y - lift
    oled.line(x - EYEBROW_HALF_WIDTH * side, y, x + EYEBROW_HALF_WIDTH * side, y, WHITE)


def draw_eyebrows(lift):
    draw_eyebrow(LEFT_EYE_X, 1, lift)
    draw_eyebrow(RIGHT_EYE_X, -1, lift)


def draw_mouth_curve(radius_x, radius_y, mask):
    oled.ellipse(HALF_WIDTH, MOUTH_Y, radius_x, radius_y, WHITE, NO_FILL, mask)


def draw_happy_face():
    oled.fill(BLACK)
    draw_eyes(10, 10)
    draw_eyebrows(lift=2)
    draw_mouth_curve(22, 12, BOTTOM_HALF)
    oled.show()


draw_happy_face()
