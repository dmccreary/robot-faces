# Lab 14: Eyebrows with poly()
# Builds a curved eyebrow out of a four-point polygon instead of a single
# straight line -- a bend that reads as far more expressive than a flat
# diagonal.
#
# shapes.poly() fills the polygon itself with a scanline fill, since this
# driver has no poly() of its own. That means a filled eyebrow costs one
# hline per row it covers, which on a brow this size is about a dozen
# rows -- cheap. Read the fill in shapes.py if you have not yet.

import config
import shapes
from array import array

display = config.init_display()
ON = config.WHITE
OFF = config.BLACK
FILL = config.FILL
NO_FILL = config.NO_FILL

WIDTH = config.WIDTH
HALF_WIDTH = WIDTH // 2

EYE_Y = 108
EYE_WIDTH = 46
EYE_HEIGHT = 22
PUPIL_RADIUS = 10
LEFT_EYE_X = 72
RIGHT_EYE_X = 168
MOUTH_Y = 176
MOUTH_WIDTH = 56
STROKE = 4

# Each point is an offset from the eyebrow's anchor. Signed shorts, so
# negative offsets are allowed -- which is what lets the shape be written
# around a center instead of from a corner.
left_eyebrow = array('h', [-30, 0, -10, -12, 26, -2, 26, 6, -8, -4, -30, 8])
right_eyebrow = array('h', [30, 0, 10, -12, -26, -2, -26, 6, 8, -4, 30, 8])


def draw_eye(x):
    shapes.ellipse(display, x, EYE_Y, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, OFF, FILL)


def draw_face():
    display.fill(OFF)

    draw_eye(LEFT_EYE_X)
    shapes.poly(display, LEFT_EYE_X, EYE_Y - 44, left_eyebrow, ON, FILL)

    draw_eye(RIGHT_EYE_X)
    shapes.poly(display, RIGHT_EYE_X, EYE_Y - 44, right_eyebrow, ON, FILL)

    # mouth: bottom half of an ellipse (mask 12 = 4 + 8)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_WIDTH, 22, ON, NO_FILL, 12)


draw_face()

# Things to try:
#
# 1. Flip the sign on the second number of each array (the -12) and the
#    brows arch the other way. One number, opposite mood.
#
# 2. Draw the brows with NO_FILL instead of FILL. An outlined brow is a
#    thin wire frame -- on a screen this size it reads as a scratch, not
#    a brow, which is why every stroke in this kit gets thickened.
#
# 3. Give the two brows different shapes by editing one array. A face
#    with mismatched brows reads as skeptical, and it takes exactly one
#    changed number to get there.
