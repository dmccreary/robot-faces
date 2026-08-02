# Lab 12: Winking with a Smile
# A closed eye is an arc -- the top half of an ellipse, drawn with
# quadrant mask TOP_HALF (3) instead of a full circle. Only one eye
# closes; the other stays open, which is what makes it read as a wink
# instead of a blink.

import config
from utime import sleep

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3      # 1 (top right) + 2 (top left)
BOTTOM_HALF = 12  # 4 (bottom left) + 8 (bottom right)

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 22
EYE_RADIUS = 12
PUPIL_RADIUS = 4

WINK_RADIUS_Y = 6
WINK_Y = EYE_Y + 3
STROKE = 3

MOUTH_Y = 46
MOUTH_RADIUS_X = 20
MOUTH_RADIUS_Y = 10


def draw_open_eye(x):
    oled.ellipse(x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    oled.ellipse(x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_winking_eye(x):
    for offset in range(STROKE):
        oled.ellipse(x, WINK_Y + offset, EYE_RADIUS, WINK_RADIUS_Y,
                     WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        oled.ellipse(HALF_WIDTH, MOUTH_Y - offset, MOUTH_RADIUS_X,
                     MOUTH_RADIUS_Y, WHITE, NO_FILL, BOTTOM_HALF)


def draw_face(winking):
    oled.fill(BLACK)
    draw_open_eye(LEFT_EYE_X)
    if winking:
        draw_winking_eye(RIGHT_EYE_X)
    else:
        draw_open_eye(RIGHT_EYE_X)
    draw_smile()
    oled.show()


def wink_once():
    draw_face(True)   # eye snaps shut
    sleep(0.35)        # hold the wink just long enough to be seen
    draw_face(False)  # eye opens again
    sleep(2.5)          # normal face until the next wink


while True:
    wink_once()
