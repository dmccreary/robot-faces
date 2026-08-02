# Lab 15: Don't Block the Loop
# Every earlier lab paced itself with sleep(), which freezes the whole
# program while it waits. This lab swaps sleep() for ticks_ms() so the
# face can blink on its own timer while the main loop stays free to do
# other things -- like check a button, which the next lab adds.

import config
from utime import ticks_ms, ticks_diff

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3
BOTTOM_HALF = 12

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 22
EYE_RADIUS = 12
PUPIL_RADIUS = 4
BLINK_RADIUS_Y = 6
BLINK_Y = EYE_Y + 3
STROKE = 3
MOUTH_Y = 46
MOUTH_RADIUS_X = 20
MOUTH_RADIUS_Y = 10

BLINK_EVERY_MS = 4000  # how often the face blinks on its own
BLINK_HOLD_MS = 150    # how long the eyes stay shut


def draw_open_eye(x):
    oled.ellipse(x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    oled.ellipse(x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_closed_eye(x):
    for offset in range(STROKE):
        oled.ellipse(x, BLINK_Y + offset, EYE_RADIUS, BLINK_RADIUS_Y,
                     WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        oled.ellipse(HALF_WIDTH, MOUTH_Y - offset, MOUTH_RADIUS_X,
                     MOUTH_RADIUS_Y, WHITE, NO_FILL, BOTTOM_HALF)


def draw_face(blinking):
    oled.fill(BLACK)
    if blinking:
        draw_closed_eye(LEFT_EYE_X)
        draw_closed_eye(RIGHT_EYE_X)
    else:
        draw_open_eye(LEFT_EYE_X)
        draw_open_eye(RIGHT_EYE_X)
    draw_smile()
    oled.show()


draw_face(False)
blinking = False
last_blink = ticks_ms()
blink_started = 0

while True:
    now = ticks_ms()

    if not blinking and ticks_diff(now, last_blink) >= BLINK_EVERY_MS:
        blinking = True
        blink_started = now
        draw_face(True)

    if blinking and ticks_diff(now, blink_started) >= BLINK_HOLD_MS:
        blinking = False
        last_blink = now
        draw_face(False)

    # this loop never calls sleep(), so this spot is free for a button
    # check, a second animation, or anything else that needs to run often
