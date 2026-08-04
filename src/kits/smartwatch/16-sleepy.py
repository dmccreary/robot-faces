# Lab 16: Sleeping Face
# Closed eyes, drooping eyebrows, a quiet mouth, and three drifting Z
# characters. The bob value shifts the whole Zzz group up and down so it
# looks like it is floating away instead of glued in place.
#
# On the OLED the Zzz sat in the top-right CORNER. This screen has no
# corners, so they drift up and to the right from BESIDE THE MOUTH,
# rising into the empty quarter below the right eye.
#
# That placement is the round screen making a decision for you. The
# obvious spot -- up beside the right eye, where the OLED put them -- is
# already occupied: on a 240x240 circle the eyebrow reaches out to x=192
# at the same height, and the first Z lands on top of it. There is no
# free corner to retreat to, so the Zzz go somewhere the face is not.
#
# Only the Zzz move, so only the Zzz box is erased between frames.

import config
import shapes
from utime import sleep

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT

TOP_HALF = 3  # 1 (top right) + 2 (top left)

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 48
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 106
EYE_RADIUS = 28
SLEEP_RADIUS_Y = 14
SLEEP_Y = EYE_Y + 7
STROKE = 4

EYEBROW_HALF_WIDTH = 24
EYEBROW_Y = EYE_Y - 34
EYEBROW_DROOP = 6  # outer corners sag, the way real brows relax before sleep

MOUTH_Y = 172
MOUTH_RADIUS = 10

ZZZ_X = 150
ZZZ_Y = 174
ZZZ_STEP_X = 12
ZZZ_STEP_Y = 20
BOB_RANGE = 5

# The rectangle the three Z's live in, with room for the bob at both
# ends. Get this box wrong and the old Z's stay on screen forever.
ZZZ_BOX_X = ZZZ_X - 4
ZZZ_BOX_Y = ZZZ_Y - ZZZ_STEP_Y * 2 - BOB_RANGE - 2
ZZZ_BOX_W = ZZZ_STEP_X * 2 + 16
ZZZ_BOX_H = ZZZ_STEP_Y * 2 + BOB_RANGE * 2 + 20


def draw_closed_eye(x):
    for offset in range(STROKE):
        shapes.ellipse(display, x, SLEEP_Y + offset, EYE_RADIUS,
                       SLEEP_RADIUS_Y, WHITE, NO_FILL, TOP_HALF)


def draw_eyebrows():
    for offset in range(STROKE):
        display.line(LEFT_EYE_X + EYEBROW_HALF_WIDTH, EYEBROW_Y + offset,
                     LEFT_EYE_X - EYEBROW_HALF_WIDTH,
                     EYEBROW_Y + EYEBROW_DROOP + offset, WHITE)
        display.line(RIGHT_EYE_X - EYEBROW_HALF_WIDTH, EYEBROW_Y + offset,
                     RIGHT_EYE_X + EYEBROW_HALF_WIDTH,
                     EYEBROW_Y + EYEBROW_DROOP + offset, WHITE)


def draw_mouth():
    for offset in range(STROKE):
        shapes.circle(display, HALF_WIDTH, MOUTH_Y, MOUTH_RADIUS - offset,
                      WHITE, NO_FILL)


def draw_zzz(bob):
    display.fill_rect(ZZZ_BOX_X, ZZZ_BOX_Y, ZZZ_BOX_W, ZZZ_BOX_H, BLACK)
    display.text(FONT, 'Z', ZZZ_X, ZZZ_Y + bob, WHITE, BLACK)
    display.text(FONT, 'Z', ZZZ_X + ZZZ_STEP_X,
                 ZZZ_Y - ZZZ_STEP_Y + bob, WHITE, BLACK)
    display.text(FONT, 'z', ZZZ_X + ZZZ_STEP_X * 2,
                 ZZZ_Y - ZZZ_STEP_Y * 2 + bob, WHITE, BLACK)


def draw_sleeping_face():
    """The parts that never move, drawn once."""
    display.fill(BLACK)
    draw_closed_eye(LEFT_EYE_X)
    draw_closed_eye(RIGHT_EYE_X)
    draw_eyebrows()
    draw_mouth()


draw_sleeping_face()

while True:
    for bob in range(-BOB_RANGE, BOB_RANGE):
        draw_zzz(bob)
        sleep(0.15)
    for bob in range(BOB_RANGE, -BOB_RANGE, -1):
        draw_zzz(bob)
        sleep(0.15)

# Things to try:
#
# 1. Comment out the fill_rect() in draw_zzz(). The Z's smear into a
#    solid block within a few seconds -- the exact bug lab 25 plants on
#    purpose, and the one you will meet most often on this display.
#
# 2. Swap FONT for config.BIG_FONT and adjust the box. Bigger Z's read
#    better from a distance, but they need more room inside the circle
#    than you expect.
