# Lab 15: Don't Block the Loop
# Every earlier lab paced itself with sleep(), which freezes the whole
# program while it waits. This lab swaps sleep() for ticks_ms() so the
# face can blink on its own timer while the main loop stays free to do
# other things -- like check a button, which the next lab adds.
#
# There is a second kind of blocking on this display that the OLED kit
# never had to think about: a slow DRAW blocks just as hard as a sleep().
# display.fill(BLACK) takes real milliseconds because it is pushing
# 115,200 bytes, and nothing else in your program runs while it does. So
# the non-blocking pattern below is paired with the small-redraw pattern
# from lab 11. Both are needed; neither is enough alone.

import config
import shapes
from utime import ticks_ms, ticks_diff

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3
BOTTOM_HALF = 12

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 48
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 100
EYE_RADIUS = 28
PUPIL_RADIUS = 10
BLINK_RADIUS_Y = 14
BLINK_Y = EYE_Y + 7
STROKE = 4
MOUTH_Y = 168
MOUTH_RADIUS_X = 48
MOUTH_RADIUS_Y = 24

EYE_BOX = EYE_RADIUS + 4

BLINK_EVERY_MS = 4000  # how often the face blinks on its own
BLINK_HOLD_MS = 150    # how long the eyes stay shut


def draw_open_eye(x):
    shapes.ellipse(display, x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_closed_eye(x):
    for offset in range(STROKE):
        shapes.ellipse(display, x, BLINK_Y + offset, EYE_RADIUS,
                       BLINK_RADIUS_Y, WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_RADIUS_X, MOUTH_RADIUS_Y,
                       WHITE, NO_FILL, BOTTOM_HALF)


def set_eyes(blinking):
    for x in (LEFT_EYE_X, RIGHT_EYE_X):
        display.fill_rect(x - EYE_BOX, EYE_Y - EYE_BOX,
                          EYE_BOX * 2, EYE_BOX * 2, BLACK)
        if blinking:
            draw_closed_eye(x)
        else:
            draw_open_eye(x)


display.fill(BLACK)
draw_smile()
set_eyes(False)

blinking = False
last_blink = ticks_ms()
blink_started = 0

while True:
    now = ticks_ms()

    if not blinking and ticks_diff(now, last_blink) >= BLINK_EVERY_MS:
        blinking = True
        blink_started = now
        set_eyes(True)

    if blinking and ticks_diff(now, blink_started) >= BLINK_HOLD_MS:
        blinking = False
        last_blink = now
        set_eyes(False)

    # this loop never calls sleep(), so this spot is free for a button
    # check, a second animation, or anything else that needs to run often

# Things to try:
#
# 1. Replace set_eyes() with a version that does display.fill(BLACK) and
#    redraws the smile too. The loop still never sleeps -- but it is now
#    blocked for tens of milliseconds on every blink, which is the same
#    problem wearing a different hat. Time it and see.
