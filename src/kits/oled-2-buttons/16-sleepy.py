# Lab 16: Sleeping Face
# Closed eyes, drooping eyebrows, a quiet mouth, and three drifting Z
# characters. The bob value shifts the whole Zzz group up and down so it
# looks like it is floating away instead of glued to the corner.

import config
from utime import sleep

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3  # 1 (top right) + 2 (top left)

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 22
EYE_RADIUS = 12
SLEEP_RADIUS_Y = 6
SLEEP_Y = EYE_Y + 3
STROKE = 3

EYEBROW_HALF_WIDTH = 11
EYEBROW_Y = EYE_Y - 5
EYEBROW_DROOP = 2  # outer corners sag, the way real eyebrows relax before sleep

MOUTH_Y = 46
MOUTH_RADIUS = 4

ZZZ_X = 106
ZZZ_Y = 26
ZZZ_STEP_X = 8
ZZZ_STEP_Y = 10
BOB_RANGE = 3


def draw_closed_eye(x):
    for offset in range(STROKE):
        oled.ellipse(x, SLEEP_Y + offset, EYE_RADIUS, SLEEP_RADIUS_Y,
                     WHITE, NO_FILL, TOP_HALF)


def draw_eyebrows():
    oled.line(LEFT_EYE_X + EYEBROW_HALF_WIDTH, EYEBROW_Y,
              LEFT_EYE_X - EYEBROW_HALF_WIDTH, EYEBROW_Y + EYEBROW_DROOP, WHITE)
    oled.line(RIGHT_EYE_X - EYEBROW_HALF_WIDTH, EYEBROW_Y,
              RIGHT_EYE_X + EYEBROW_HALF_WIDTH, EYEBROW_Y + EYEBROW_DROOP, WHITE)


def draw_mouth():
    oled.ellipse(HALF_WIDTH, MOUTH_Y, MOUTH_RADIUS, MOUTH_RADIUS, WHITE, NO_FILL)


def draw_zzz(bob):
    oled.text('Z', ZZZ_X, ZZZ_Y + bob, WHITE)
    oled.text('Z', ZZZ_X + ZZZ_STEP_X, ZZZ_Y - ZZZ_STEP_Y + bob, WHITE)
    oled.text('z', ZZZ_X + ZZZ_STEP_X * 2, ZZZ_Y - ZZZ_STEP_Y * 2 + bob, WHITE)


def draw_face(bob):
    oled.fill(BLACK)
    draw_closed_eye(LEFT_EYE_X)
    draw_closed_eye(RIGHT_EYE_X)
    draw_eyebrows()
    draw_mouth()
    draw_zzz(bob)
    oled.show()


while True:
    for bob in range(-BOB_RANGE, BOB_RANGE):
        draw_face(bob)
        sleep(0.15)
    for bob in range(BOB_RANGE, -BOB_RANGE, -1):
        draw_face(bob)
        sleep(0.15)
