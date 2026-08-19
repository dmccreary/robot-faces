# Lab 19: Expression Menu
# The mode-switching pattern from Lab 18, applied to all seven Ekman
# emotions instead of demo shapes. Button A steps forward through the
# list, button B steps back, and the emotion's name is drawn at the top
# of the circle so you always know which expression is on screen.
#
# This is a port of the smartwatch kit's 19-emotion-modes.py. Every
# coordinate, radius, and stroke below is that lab's number times 1.5
# (360 / 240), with the original in a trailing comment. The numbers match
# face.py's, so a face drawn here and a face drawn with face.py land in
# the same places -- this lab spells the geometry out inline on purpose,
# the way the smartwatch version does, so you can see all of it at once.
#
# The FONT is the exception. Bitmap glyphs cannot scale, so the emotion
# name moves up to the 16x32 font here; keeping 8x16 would have made the
# label a smaller fraction of the screen than it was at 240x240.

import config
import shapes
from utime import sleep

display = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

# 16x32. "Surprised" is the longest of the seven names at 9 characters,
# which is 9 * 16 = 144 px -- comfortably inside the roughly 199 px the
# visible circle gives you at LABEL_Y. The centering below multiplies by
# FONT.WIDTH, never by a literal, so it stays honest about that 16.
FONT = config.BIG_FONT             # config.SMALL_FONT on the smartwatch kit

TOP_RIGHT = 1
TOP_LEFT = 2
BOTTOM_LEFT = 4
BOTTOM_RIGHT = 8
TOP_HALF = 3      # frown
BOTTOM_HALF = 12  # smile

HALF_WIDTH = config.WIDTH // 2            # 180
EYE_SPACING = 72                          # 48 on the smartwatch kit
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING     # 108
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING    # 252
EYE_Y = 153                               # 102 on the smartwatch kit
PUPIL_RADIUS = 12                         # 8 on the smartwatch kit

EYEBROW_HALF_WIDTH = 36                   # 24 on the smartwatch kit
EYEBROW_Y = EYE_Y - 60                    # 93 -- 40 below eye level, scaled

MOUTH_Y = 246                             # 164 on the smartwatch kit
STROKE = 6                                # 4 on the smartwatch kit
# NOT the scaled 45. text() paints a black background as tall as the
# font, and the label font here is 16x32 -- so a label at row 45 covers
# rows 45-76, and Afraid's raised eyebrow reaches row 64. Drawing the
# label after the face would slice the top off that brow. 32 clears it.
# Matches face.LABEL_Y for the same reason.
LABEL_Y = 32


def draw_eye(x, rx, ry):
    shapes.ellipse(display, x, EYE_Y, rx, ry, WHITE, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_eyes(rx, ry):
    draw_eye(LEFT_EYE_X, rx, ry)
    draw_eye(RIGHT_EYE_X, rx, ry)


def draw_eyebrow(x, side, tilt, lift):
    y = EYEBROW_Y - lift
    outer_x = x - (EYEBROW_HALF_WIDTH * side)
    inner_x = x + (EYEBROW_HALF_WIDTH * side)
    for offset in range(STROKE):
        display.line(outer_x, y - tilt + offset,
                     inner_x, y + tilt + offset, WHITE)


def draw_eyebrows(tilt_left, tilt_right, lift=0):
    draw_eyebrow(LEFT_EYE_X, 1, tilt_left, lift)
    draw_eyebrow(RIGHT_EYE_X, -1, tilt_right, lift)


def draw_mouth_curve(radius_x, radius_y, mask):
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       radius_x, radius_y, WHITE, NO_FILL, mask)


def draw_mouth_flat(half_width):
    display.fill_rect(HALF_WIDTH - half_width, MOUTH_Y,
                      half_width * 2, STROKE, WHITE)


def draw_mouth_open(radius_x, radius_y):
    shapes.ellipse(display, HALF_WIDTH, MOUTH_Y, radius_x, radius_y,
                   WHITE, FILL)


def draw_mouth_smirk(half_width, side):
    draw_mouth_flat(half_width)
    corner_x = HALF_WIDTH + (half_width * side)
    mask = BOTTOM_RIGHT if side > 0 else BOTTOM_LEFT
    for offset in range(STROKE):
        # 10 -> 15, 14 -> 21 on the smartwatch kit
        shapes.ellipse(display, corner_x, MOUTH_Y - 15 - offset, 21, 21,
                       WHITE, NO_FILL, mask)


# The seven expression tables. Each number is the smartwatch kit's value
# times 1.5, rounded to the nearest pixel -- which is why a few of them
# (lift=8 from 5, tilt=11 from 7) are not round numbers.

def draw_happy():
    draw_eyes(36, 36)                       # 24, 24
    draw_eyebrows(0, 0, lift=8)             # lift=5
    draw_mouth_curve(75, 36, BOTTOM_HALF)   # 50, 24


def draw_sad():
    draw_eyes(33, 33)                       # 22, 22
    draw_eyebrows(-11, -11, lift=0)         # -7, -7
    draw_mouth_curve(60, 30, TOP_HALF)      # 40, 20


def draw_angry():
    draw_eyes(36, 18)                       # 24, 12
    draw_eyebrows(18, 18, lift=-8)          # 12, 12, lift=-5
    draw_mouth_flat(39)                     # 26


def draw_afraid():
    draw_eyes(47, 47)                       # 31, 31
    draw_eyebrows(-18, -18, lift=11)        # -12, -12, lift=7
    draw_mouth_open(23, 33)                 # 15, 22


def draw_surprised():
    draw_eyes(48, 48)                       # 32, 32
    draw_eyebrows(0, 0, lift=21)            # lift=14
    draw_mouth_open(30, 39)                 # 20, 26


def draw_disgusted():
    draw_eyes(33, 23)                       # 22, 15
    draw_eyebrows(15, -8, lift=-5)          # 10, -5, lift=-3
    for offset in range(STROKE):
        # An off-center raised lip: 14 -> 21, 30 -> 45, 18 -> 27
        shapes.ellipse(display, HALF_WIDTH - 21, MOUTH_Y - offset, 45, 27,
                       WHITE, NO_FILL, TOP_HALF)


def draw_contempt():
    draw_eyes(36, 36)                       # 24, 24
    draw_eyebrows(0, 0, lift=0)
    draw_mouth_smirk(51, 1)                 # 34


EMOTIONS = (
    ("Happy", draw_happy),
    ("Sad", draw_sad),
    ("Angry", draw_angry),
    ("Afraid", draw_afraid),
    ("Surprised", draw_surprised),
    ("Disgusted", draw_disgusted),
    ("Contempt", draw_contempt),
)


def show_emotion(index):
    name, draw = EMOTIONS[index]
    display.fill(BLACK)
    draw()
    x = HALF_WIDTH - (len(name) * FONT.WIDTH) // 2
    display.text(FONT, name, x, LABEL_Y, WHITE, BLACK)


def pressed(button):
    if button.value() == 1:
        return False
    sleep(0.02)
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep(0.01)


emotion_index = 0
show_emotion(emotion_index)

while True:
    if pressed(button_a):
        emotion_index = (emotion_index + 1) % len(EMOTIONS)
        show_emotion(emotion_index)
        wait_for_release(button_a)

    if pressed(button_b):
        emotion_index = (emotion_index - 1) % len(EMOTIONS)
        show_emotion(emotion_index)
        wait_for_release(button_b)

    sleep(0.01)

# Things to try:
#
# 1. show_emotion() wipes the whole screen before every face. Try
#    replacing the display.fill(BLACK) with erase boxes over just the
#    eyes, eyebrows, mouth, and label. The label box is the one that
#    catches people out: it has to clear 32 rows, because that is how
#    tall a 16x32 glyph is. Clear only 16 and the bottom half of every
#    letter from the previous emotion stays on the glass.
#
# 2. Every one of these numbers is a guess someone made and then looked
#    at. Sit with one emotion and nudge a single value -- the eyebrow
#    tilt on Angry, say -- until it reads better to you. Emotions are not
#    measurements, and yours may not match the ones typed here.
