# Lab 14: Eyebrows with poly()
# Builds a curved eyebrow out of a four-point polygon instead of a single
# straight line -- a bend that reads as far more expressive than a flat
# diagonal.
#
# shapes.poly() fills the polygon itself with a scanline fill, since this
# driver has no poly() of its own. That means a filled eyebrow costs one
# hline per row it covers, which on a brow this size is about thirty rows
# -- cheap. Read the fill in shapes.py if you have not yet.
#
# Every number below is the smartwatch kit's value times 1.5, because this
# panel is 360 px across instead of 240. That includes the numbers inside
# the polygon arrays: they are pixel OFFSETS, so a brow left at the
# smartwatch kit's figures would come out two-thirds the size of the eye
# it has to sit over.

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

EYE_Y = 162          # 108 on the smartwatch kit
EYE_WIDTH = 69       # 46
EYE_HEIGHT = 33      # 22
PUPIL_RADIUS = 15    # 10
LEFT_EYE_X = 108     # 72
RIGHT_EYE_X = 252    # 168
MOUTH_Y = 264        # 176
MOUTH_WIDTH = 84     # 56
STROKE = 6           # 4

# Each point is an offset from the eyebrow's anchor. Signed shorts, so
# negative offsets are allowed -- which is what lets the shape be written
# around a center instead of from a corner.
left_eyebrow = array('h', [-45, 0, -15, -18, 39, -3, 39, 9, -12, -6, -45, 12])
right_eyebrow = array('h', [45, 0, 15, -18, -39, -3, -39, 9, 12, -6, 45, 12])


def draw_eye(x):
    shapes.ellipse(display, x, EYE_Y, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, OFF, FILL)


def draw_face():
    display.fill(OFF)

    draw_eye(LEFT_EYE_X)
    shapes.poly(display, LEFT_EYE_X, EYE_Y - 66, left_eyebrow, ON, FILL)

    draw_eye(RIGHT_EYE_X)
    shapes.poly(display, RIGHT_EYE_X, EYE_Y - 66, right_eyebrow, ON, FILL)

    # mouth: bottom half of an ellipse (mask 12 = 4 + 8)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_WIDTH, 33, ON, NO_FILL, 12)


draw_face()

# Things to try:
#
# 1. Flip the sign on the second number of each array (the -18) and the
#    brows arch the other way. One number, opposite mood.
#
# 2. Draw the brows with NO_FILL instead of FILL. An outlined brow is a
#    thin wire frame -- on a screen this size it reads as a scratch, not
#    a brow, which is why every stroke in this kit gets thickened. The
#    bigger the panel, the worse a one-pixel outline looks: the same
#    single row of pixels now has to carry a face half again as wide.
#
# 3. Give the two brows different shapes by editing one array. A face
#    with mismatched brows reads as skeptical, and it takes exactly one
#    changed number to get there.
