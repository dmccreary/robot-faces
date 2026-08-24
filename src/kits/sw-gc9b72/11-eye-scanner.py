# Lab 11: Eye Scanner
# Sweeps both pupils back and forth by looping an x offset and redrawing
# on every step.
#
# THIS IS THE LAB WHERE THE COLOR DISPLAY CHANGES THE RULES. On the OLED,
# every frame started with oled.fill(BLACK) and nobody noticed, because
# the wipe happened in RAM and the screen only ever saw the finished
# picture. Here there is no RAM copy: a full wipe is 259,200 bytes down
# the wire, and you WATCH it happen. Do that on every frame and the
# animation flickers hard and crawls.
#
# So this lab erases only the two eye boxes instead. Two boxes of
# 138 x 84 is 23,184 pixels rather than the screen's 129,600 -- under a
# fifth of the work, same picture, no flicker. That is not an
# optimization you save for later on this hardware -- it is the price of
# admission.
#
# This panel is 360 x 360 where the smartwatch kit's was 240 x 240, so
# every frame here moves 2.25 times as many pixels as the same lab did
# there. Whether that is still fast enough to look smooth at this delay
# has not been measured on this hardware -- run it and see.

import config
import shapes
from utime import sleep

display = config.init_display()
ON = config.WHITE
OFF = config.BLACK
FILL = config.FILL
NO_FILL = config.NO_FILL

HALF_WIDTH = config.WIDTH // 2

PUPIL_RANGE = 45
EYE_Y = 150
EYE_WIDTH = 66
EYE_HEIGHT = 39
PUPIL_RADIUS = 15
LEFT_EYE_X = 105
RIGHT_EYE_X = 255
MOUTH_Y = 252
MOUTH_WIDTH = 84
STROKE = 6

# The box each eye lives in. Erasing this much and no more is what keeps
# the animation smooth. The 3 px of slack is what the smartwatch kit's
# 2 px becomes at this scale -- scale the eye and forget the box, and the
# leftovers pile up at the edges as ghost trails.
EYE_BOX_X = EYE_WIDTH + 3
EYE_BOX_Y = EYE_HEIGHT + 3

# Erasing paints black on black, so the most important thing this program
# does is invisible. Change this to config.RED and run it again: the two
# boxes your program repaints every frame light up, with the eyes drawn on
# top of them, and everything the program leaves alone stays black.
#
# It costs nothing. A red pixel and a black pixel are both two bytes.
ERASE_COLOR = OFF


def draw_eye(x, offset):
    shapes.ellipse(display, x, EYE_Y, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    shapes.ellipse(display, x + offset, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS,
                   OFF, FILL)


def draw_mouth():
    # bottom half of an ellipse (mask 12 = 4 + 8)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_WIDTH, 36, ON, NO_FILL, 12)


def draw_static_parts():
    """Everything that does not move. Drawn once, then left alone."""
    display.fill(OFF)
    draw_mouth()


def draw_eyes(offset):
    """Only the part that changes: erase the two eye boxes and rebuild
    them. The mouth is already correct on the glass from before."""
    for x in (LEFT_EYE_X, RIGHT_EYE_X):
        display.fill_rect(x - EYE_BOX_X, EYE_Y - EYE_BOX_Y,
                          EYE_BOX_X * 2, EYE_BOX_Y * 2, ERASE_COLOR)
        draw_eye(x, offset)


draw_static_parts()

delay = 0.01
while True:
    for offset in range(-PUPIL_RANGE, PUPIL_RANGE):
        draw_eyes(offset)
        sleep(delay)
    for offset in range(PUPIL_RANGE, -PUPIL_RANGE, -1):
        draw_eyes(offset)
        sleep(delay)

# Things to try:
#
# 1. Replace draw_eyes() with a version that calls display.fill(OFF) and
#    redraws everything, the way the OLED lab did. Run it. The flicker
#    and the frame rate are both the answer to "why does this kit care
#    about partial redraw so early?"
#
# 2. The eyes only need their pupils erased, not the whole eye. Shrink
#    the erase box to just the pupil's travel and see whether it still
#    looks right. (It will not, quite -- and finding out why is the point.)
#
# 3. Erasing a box means you have to KNOW the box. Change EYE_WIDTH to 75
#    without touching EYE_BOX_X and watch the leftovers pile up at the
#    edges. Lab 29 names this failure and measures it.
#
# 4. Set ERASE_COLOR = config.RED and do exercise 3 again. Now the box you
#    are erasing is a red rectangle you can see, and the leftover pixels
#    are visibly OUTSIDE it. A bug you can see beats a bug you can only
#    reason about, and this one costs nothing to make visible.
