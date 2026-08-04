# Lab 22: Face Parameters -- Live Tuning
# Every expression so far has used fixed numbers. This lab makes one
# number live: button A widens the smile, button B narrows it into a
# frown, and the face redraws instantly so you can watch a single
# parameter bend the whole face's mood in real time.
#
# "Instantly" is doing real work here. The eyes never change, so they are
# drawn once and never touched again -- only the mouth's box and the
# readout strip get erased and rebuilt on a press. Redraw the whole
# screen and the response stops feeling instant.

import config
import shapes
from utime import sleep

display = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT
BOTTOM_HALF = 12
TOP_HALF = 3

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 48
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 102
EYE_RADIUS = 24
PUPIL_RADIUS = 8
MOUTH_Y = 164
MOUTH_WIDTH = 54
STROKE = 4
LABEL_Y = 30

MOUTH_CURVE_MIN = -24
MOUTH_CURVE_MAX = 32
MOUTH_CURVE_STEP = 4

# The box the mouth can never escape: widest radius, deepest curve in
# either direction, plus a margin. Work this out from the numbers above
# rather than guessing, or you will be chasing leftovers all afternoon.
MOUTH_BOX_X = HALF_WIDTH - MOUTH_WIDTH - 4
MOUTH_BOX_Y = MOUTH_Y - MOUTH_CURVE_MAX - STROKE - 4
MOUTH_BOX_W = (MOUTH_WIDTH + 4) * 2
MOUTH_BOX_H = (MOUTH_CURVE_MAX + STROKE + 4) * 2


def draw_eyes():
    for x in (LEFT_EYE_X, RIGHT_EYE_X):
        shapes.ellipse(display, x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
        shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS,
                       BLACK, FILL)


def draw_mouth(mouth_curve):
    display.fill_rect(MOUTH_BOX_X, MOUTH_BOX_Y,
                      MOUTH_BOX_W, MOUTH_BOX_H, BLACK)

    # a positive curve smiles (BOTTOM_HALF), a negative curve frowns (TOP_HALF)
    if mouth_curve >= 0:
        mask = BOTTOM_HALF
        radius_y = mouth_curve + 4
    else:
        mask = TOP_HALF
        radius_y = -mouth_curve + 4

    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_WIDTH, radius_y, WHITE, NO_FILL, mask)


def draw_readout(mouth_curve):
    text = "curve: " + str(mouth_curve)
    display.fill_rect(0, LABEL_Y, config.WIDTH, FONT.HEIGHT, BLACK)
    x = HALF_WIDTH - (len(text) * FONT.WIDTH) // 2
    display.text(FONT, text, x, LABEL_Y, WHITE, BLACK)


def update(mouth_curve):
    draw_mouth(mouth_curve)
    draw_readout(mouth_curve)


def pressed(button):
    if button.value() == 1:
        return False
    sleep(0.02)
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep(0.01)


display.fill(BLACK)
draw_eyes()

mouth_curve = 8
update(mouth_curve)

while True:
    if pressed(button_a):
        mouth_curve = min(MOUTH_CURVE_MAX, mouth_curve + MOUTH_CURVE_STEP)
        update(mouth_curve)
        wait_for_release(button_a)

    if pressed(button_b):
        mouth_curve = max(MOUTH_CURVE_MIN, mouth_curve - MOUTH_CURVE_STEP)
        update(mouth_curve)
        wait_for_release(button_b)

    sleep(0.01)

# Things to try:
#
# 1. Find the exact curve value where the face stops reading as happy and
#    starts reading as neutral. Then find where neutral becomes sad. Those
#    two numbers are a real finding about how people read faces, and you
#    measured them.
#
# 2. Shrink MOUTH_BOX_H by twenty and run to the extremes. The old mouth's
#    ends survive the erase and pile up. The box has to be big enough for
#    the LARGEST thing that can appear in it, not the current one.
