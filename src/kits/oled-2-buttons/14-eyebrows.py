# Lab 14: Eyebrows with poly()
# Builds a curved eyebrow out of a four-point polygon instead of a single
# straight line -- a bend that reads as far more expressive than a flat
# diagonal.

import config
from array import array

oled = config.init_display()
ON = config.WHITE
OFF = config.BLACK
FILL = config.FILL

WIDTH = config.WIDTH
HALF_WIDTH = WIDTH // 2
QUARTER_WIDTH = HALF_WIDTH // 2

EYE_DIST_FROM_TOP = 25
EYE_WIDTH = 27
EYE_WIDTH_HALF = EYE_WIDTH // 2
EYE_HEIGHT = 7
MOUTH_VPOS = 40
MOUTH_WIDTH = 40
PUPIL_WIDTH = 5

left_eyebrow = array('h', [-EYE_WIDTH_HALF, -1, 15, -5, EYE_WIDTH_HALF + 10, 1, 15, -2])
right_eyebrow = array('h', [-EYE_WIDTH_HALF - 10, 1, -15, -5, EYE_WIDTH_HALF, 0, -15, -2])


def draw_eye(x):
    oled.ellipse(x, EYE_DIST_FROM_TOP, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    oled.ellipse(x, EYE_DIST_FROM_TOP, PUPIL_WIDTH, PUPIL_WIDTH, OFF, FILL)


def draw_face():
    oled.fill(0)

    draw_eye(QUARTER_WIDTH)
    oled.poly(QUARTER_WIDTH, EYE_DIST_FROM_TOP - 10, left_eyebrow, ON, FILL)

    draw_eye(QUARTER_WIDTH * 3)
    oled.poly(QUARTER_WIDTH * 3, EYE_DIST_FROM_TOP - 10, right_eyebrow, ON, FILL)

    # mouth: bottom half of an ellipse (mask 12 = 4 + 8)
    oled.ellipse(HALF_WIDTH, MOUTH_VPOS, MOUTH_WIDTH, 10, ON, config.NO_FILL, 12)
    oled.show()


draw_face()
