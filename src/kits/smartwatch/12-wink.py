# Lab 12: Winking with a Smile
# A closed eye is an arc -- the top half of an ellipse, drawn with
# quadrant mask TOP_HALF (3) instead of a full circle. Only one eye
# closes; the other stays open, which is what makes it read as a wink
# instead of a blink.
#
# Only the right eye changes between the two frames, so only the right
# eye's box gets erased and rebuilt. The left eye and the smile are drawn
# once and then left alone for as long as the program runs.

import config
import shapes
from utime import sleep

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3      # 1 (top right) + 2 (top left)
BOTTOM_HALF = 12  # 4 (bottom left) + 8 (bottom right)

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 48
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 100
EYE_RADIUS = 28
PUPIL_RADIUS = 10

WINK_RADIUS_Y = 14
WINK_Y = EYE_Y + 7
STROKE = 4

MOUTH_Y = 168
MOUTH_RADIUS_X = 48
MOUTH_RADIUS_Y = 24

# Big enough to cover an open eye, which is the largest thing that ever
# appears in this box.
EYE_BOX = EYE_RADIUS + 4


def draw_open_eye(x):
    shapes.ellipse(display, x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_winking_eye(x):
    for offset in range(STROKE):
        shapes.ellipse(display, x, WINK_Y + offset, EYE_RADIUS,
                       WINK_RADIUS_Y, WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_RADIUS_X, MOUTH_RADIUS_Y,
                       WHITE, NO_FILL, BOTTOM_HALF)


def erase_eye(x):
    display.fill_rect(x - EYE_BOX, EYE_Y - EYE_BOX,
                      EYE_BOX * 2, EYE_BOX * 2, BLACK)


def draw_resting_face():
    """Everything, once. After this only the right eye is ever touched."""
    display.fill(BLACK)
    draw_open_eye(LEFT_EYE_X)
    draw_open_eye(RIGHT_EYE_X)
    draw_smile()


def set_right_eye(winking):
    erase_eye(RIGHT_EYE_X)
    if winking:
        draw_winking_eye(RIGHT_EYE_X)
    else:
        draw_open_eye(RIGHT_EYE_X)


draw_resting_face()

while True:
    set_right_eye(True)    # eye snaps shut
    sleep(0.35)            # hold the wink just long enough to be seen
    set_right_eye(False)   # eye opens again
    sleep(2.5)             # normal face until the next wink

# Things to try:
#
# 1. The wink is now two small rectangles of work instead of two whole
#    screens. Add a print() of ticks_ms() around set_right_eye() and see
#    how little time a frame actually takes when you only redraw the part
#    that moved.
#
# 2. Close the LEFT eye instead. On a face, left and right are not
#    interchangeable -- most people read a left-eye wink as slightly
#    different in tone. Try it on a few people.
