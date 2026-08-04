# Lab 10: Happy Face
# The first complete expression, built from three small functions --
# draw_eyes(), draw_eyebrows(), and a curved mouth. Later labs reuse this
# exact same pattern with different numbers to draw every other emotion.
#
# The numbers are bigger than the OLED kit's, and not by a simple factor.
# The OLED was 128 wide and 64 tall -- twice as wide as it was tall, so
# the face had to be squashed. This screen is square (and round), so the
# face finally gets to be face-shaped.

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
BOTTOM_HALF = 12

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 48
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 102
PUPIL_RADIUS = 8

EYEBROW_HALF_WIDTH = 24
EYEBROW_Y = EYE_Y - 40

MOUTH_Y = 164

# One pixel is invisible on a screen this size, so lines and arcs get
# drawn several times, a pixel apart, to thicken them.
STROKE = 4


def draw_eye(x, rx, ry):
    shapes.ellipse(display, x, EYE_Y, rx, ry, WHITE, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_eyes(rx, ry):
    draw_eye(LEFT_EYE_X, rx, ry)
    draw_eye(RIGHT_EYE_X, rx, ry)


def draw_eyebrow(x, side, lift):
    # side: 1 for the left eyebrow (nose to the right), -1 for the right
    y = EYEBROW_Y - lift
    for offset in range(STROKE):
        display.line(x - EYEBROW_HALF_WIDTH * side, y + offset,
                     x + EYEBROW_HALF_WIDTH * side, y + offset, WHITE)


def draw_eyebrows(lift):
    draw_eyebrow(LEFT_EYE_X, 1, lift)
    draw_eyebrow(RIGHT_EYE_X, -1, lift)


def draw_mouth_curve(radius_x, radius_y, mask):
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       radius_x, radius_y, WHITE, NO_FILL, mask)


def draw_happy_face():
    display.fill(BLACK)
    draw_eyes(24, 24)
    draw_eyebrows(lift=5)
    draw_mouth_curve(50, 24, BOTTOM_HALF)


draw_happy_face()

# Things to try:
#
# 1. Count how long the face takes to appear. Most of that is
#    display.fill(BLACK) -- 115,200 bytes of black. Comment it out and
#    run twice in a row to see how much faster the rest is on its own.
#
# 2. Move EYE_Y from 102 to 60. The eyes climb toward the rim and start
#    losing their outer edges to the bezel, because the screen gets
#    narrower the further you get from the middle.
