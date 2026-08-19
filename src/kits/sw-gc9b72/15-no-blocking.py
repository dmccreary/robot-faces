# Lab 15: Don't Block the Loop
# Every earlier lab paced itself with sleep(), which freezes the whole
# program while it waits. This lab swaps sleep() for ticks_ms() so the
# face can blink on its own timer while the main loop stays free to do
# other things -- like check a button, which the next lab adds.
#
# There is a second kind of blocking on this display that the OLED kit
# never had to think about: a slow DRAW blocks just as hard as a sleep().
# display.fill(BLACK) takes real milliseconds because it is pushing
# 259,200 bytes -- 129,600 pixels at two bytes each, and 2.25x what the
# smartwatch kit's 240x240 panel has to send -- and nothing else in your
# program runs while it does. So the non-blocking pattern below is paired
# with the small-redraw pattern from lab 11. Both are needed; neither is
# enough alone.
#
# How many milliseconds a full fill actually costs on THIS panel is not
# known: the timings quoted in the smartwatch kit were measured on its
# GC9A01 through a different driver, and they do not carry over. The byte
# count above is arithmetic and is true. The clock time is not measured
# here -- run it and find out, which is what "Things to try" below asks.

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
EYE_SPACING = 72                          # 48 on the smartwatch kit
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 150            # 100 on the smartwatch kit
EYE_RADIUS = 42        # 28
PUPIL_RADIUS = 15      # 10
BLINK_RADIUS_Y = 21    # 14
BLINK_Y = EYE_Y + 11   # EYE_Y + 7
STROKE = 6             # 4
MOUTH_Y = 252          # 168
MOUTH_RADIUS_X = 72    # 48
MOUTH_RADIUS_Y = 36    # 24

EYE_BOX = EYE_RADIUS + 6

# MILLISECONDS ARE NOT PIXELS. Every distance in this file grew by 1.5
# crossing to the bigger panel; these two did not change at all, because
# a blink that looked right at four seconds still looks right at four
# seconds. Scale the geometry, leave the clock alone.
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
#    blocked on every blink, which is the same problem wearing a
#    different hat. Time it and see: wrap both versions in ticks_us()
#    and print the difference. Nobody has measured that on this panel, so
#    whatever you get is a new number, not a repeat of one from the book.
#
# 2. Work out what the two eye boxes cost against a full fill. Each box
#    is 96 x 96 px, so two of them are 18,432 pixels -- against 129,600
#    for the whole screen. That ratio is the entire reason for the
#    small-redraw pattern, and it is arithmetic, not a measurement.
