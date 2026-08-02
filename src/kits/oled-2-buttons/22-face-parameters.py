# Lab 22: Face Parameters -- Live Tuning
# Every expression so far has used fixed numbers. This lab makes one
# number live: button A widens the smile, button B narrows it into a
# frown, and the face redraws instantly so you can watch a single
# parameter bend the whole face's mood in real time.

import config
from utime import sleep

oled = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
BOTTOM_HALF = 12
TOP_HALF = 3

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 24
EYE_RADIUS = 10
PUPIL_RADIUS = 3
MOUTH_Y = 46
MOUTH_WIDTH = 24

MOUTH_CURVE_MIN = -10
MOUTH_CURVE_MAX = 14
MOUTH_CURVE_STEP = 2


def draw_face(mouth_curve):
    oled.fill(BLACK)

    oled.ellipse(LEFT_EYE_X, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    oled.ellipse(LEFT_EYE_X, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)
    oled.ellipse(RIGHT_EYE_X, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    oled.ellipse(RIGHT_EYE_X, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)

    # a positive curve smiles (BOTTOM_HALF), a negative curve frowns (TOP_HALF)
    if mouth_curve >= 0:
        oled.ellipse(HALF_WIDTH, MOUTH_Y, MOUTH_WIDTH, mouth_curve + 2, WHITE, NO_FILL, BOTTOM_HALF)
    else:
        oled.ellipse(HALF_WIDTH, MOUTH_Y, MOUTH_WIDTH, -mouth_curve + 2, WHITE, NO_FILL, TOP_HALF)

    oled.text("curve: " + str(mouth_curve), 2, 2, WHITE)
    oled.show()


def pressed(button):
    if button.value() == 1:
        return False
    sleep(0.02)
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep(0.01)


mouth_curve = 2
draw_face(mouth_curve)

while True:
    if pressed(button_a):
        mouth_curve = min(MOUTH_CURVE_MAX, mouth_curve + MOUTH_CURVE_STEP)
        draw_face(mouth_curve)
        wait_for_release(button_a)

    if pressed(button_b):
        mouth_curve = max(MOUTH_CURVE_MIN, mouth_curve - MOUTH_CURVE_STEP)
        draw_face(mouth_curve)
        wait_for_release(button_b)

    sleep(0.01)
