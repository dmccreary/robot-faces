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
# already occupied: on this 360x360 circle the eyebrow reaches out to
# x=288 at the same height, and the first Z lands on top of it. There is
# no free corner to retreat to, so the Zzz go somewhere the face is not.
#
# Only the Zzz move, so only the Zzz box is erased between frames.
#
# ONE THING DID NOT GROW. Every position below is the smartwatch kit's
# number times 1.5, but the FONT is a fixed 8x16 bitmap and cannot be
# scaled. So the Z's drift further on this panel while staying exactly
# the same size, and the erase box has to be built out of both kinds of
# number: scaled steps and margins, plus the font's real 8 and 16.

import config
import shapes
from utime import sleep

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT
FONT_WIDTH = FONT.WIDTH      # 8 -- a bitmap glyph, not a scaled number
FONT_HEIGHT = FONT.HEIGHT    # 16 -- likewise

TOP_HALF = 3  # 1 (top right) + 2 (top left)

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 72                          # 48 on the smartwatch kit
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 159             # 106 on the smartwatch kit
EYE_RADIUS = 42         # 28
SLEEP_RADIUS_Y = 21     # 14
SLEEP_Y = EYE_Y + 11    # EYE_Y + 7
STROKE = 6              # 4

EYEBROW_HALF_WIDTH = 36     # 24 on the smartwatch kit
EYEBROW_Y = EYE_Y - 51      # EYE_Y - 34
EYEBROW_DROOP = 9  # outer corners sag, the way real brows relax before sleep

MOUTH_Y = 258       # 172 on the smartwatch kit
MOUTH_RADIUS = 15   # 10

ZZZ_X = 225         # 150 on the smartwatch kit
ZZZ_Y = 261         # 174
ZZZ_STEP_X = 18     # 12
ZZZ_STEP_Y = 30     # 20
BOB_RANGE = 8       # 5 (7.5, rounded up)

# The rectangle the three Z's live in, with room for the bob at both
# ends. Get this box wrong and the old Z's stay on screen forever.
#
# Note what the width and height are made of. The steps, the bob, and the
# margins all scaled by 1.5 with everything else -- but FONT_WIDTH and
# FONT_HEIGHT are the glyph's real 8 and 16 and are written in as
# themselves. Multiplying those by 1.5 too would size the box for letters
# that do not exist.
ZZZ_BOX_X = ZZZ_X - 6
ZZZ_BOX_Y = ZZZ_Y - ZZZ_STEP_Y * 2 - BOB_RANGE - 3
ZZZ_BOX_W = ZZZ_STEP_X * 2 + FONT_WIDTH + 12
ZZZ_BOX_H = ZZZ_STEP_Y * 2 + BOB_RANGE * 2 + FONT_HEIGHT + 6


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
# 2. Push the Zzz further out with a bigger ZZZ_STEP_X and watch the
#    third one vanish under the bezel. The visible glass is a circle of
#    radius 168 around (180, 180), so a Z is only safe while
#    config.inside_circle() says its far corner is. Check the corner, not
#    the anchor -- the anchor is the letter's top-left, and it is the
#    top-RIGHT that leaves the circle first as the group climbs.
#
# 3. Swap FONT for config.BIG_FONT. The box above is written in terms of
#    FONT_WIDTH and FONT_HEIGHT, so it resizes itself -- which is the
#    whole reason to write it that way instead of with the numbers 8 and
#    16 spelled out. Bigger Z's read better from a distance, but 16x32
#    glyphs need more room inside the circle than you expect, so run
#    rule 2's check on the top Z before you trust it.
