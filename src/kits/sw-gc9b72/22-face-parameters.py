# Lab 22: Face Parameters -- Live Tuning
# Every expression so far has used fixed numbers. This lab makes one
# number live: button A widens the smile, button B narrows it into a
# frown, and the face redraws instantly so you can watch a single
# parameter bend the whole face's mood in real time.
#
# "Instantly" is doing real work here. The eyes never change, so they are
# drawn once and never touched again -- only the mouth's box and the
# readout strip get erased and rebuilt on a press. Redraw the whole
# screen and the response stops feeling instant: a full fill on this
# 360x360 panel is 129,600 pixels, 259,200 bytes down the SPI wire.
#
# Every position and size below is the smartwatch kit's number times 1.5
# (360 / 240). The FONT is the exception -- see the note beside it.

import config
import shapes
from utime import sleep

display = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

# The readout IS this lab -- the number you are tuning is the thing you
# are supposed to be reading while you hold a button down -- so it draws
# in the 16x32 font, the same one face.py's label() uses. Bitmap fonts do
# not scale with the screen, so 8x16 text that filled the smartwatch's
# 240 px screen is stranded on this 360 px one.
#
# Note what does NOT change below: draw_readout() asks the font module
# for FONT.WIDTH and FONT.HEIGHT instead of writing 8 and 16 (or, worse,
# 12 and 24). Switching the font here is the whole edit; the centering
# and the erase box follow along on their own.
FONT = config.BIG_FONT            # 16 x 32
BOTTOM_HALF = 12
TOP_HALF = 3

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 72                  # 48 on the smartwatch kit
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 153                       # 102
EYE_RADIUS = 36                   # 24
PUPIL_RADIUS = 12                 # 8
MOUTH_Y = 246                     # 164
MOUTH_WIDTH = 81                  # 54
STROKE = 6                        # 4
LABEL_Y = 45                      # 30

MOUTH_CURVE_MIN = -36             # -24
MOUTH_CURVE_MAX = 48              # 32
MOUTH_CURVE_STEP = 6              # 4

# The box the mouth can never escape: widest radius, deepest curve in
# either direction, plus a margin. Work this out from the numbers above
# rather than guessing, or you will be chasing leftovers all afternoon.
MOUTH_BOX_X = HALF_WIDTH - MOUTH_WIDTH - 6
MOUTH_BOX_Y = MOUTH_Y - MOUTH_CURVE_MAX - STROKE - 6
MOUTH_BOX_W = (MOUTH_WIDTH + 6) * 2
MOUTH_BOX_H = (MOUTH_CURVE_MAX + STROKE + 6) * 2


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
        radius_y = mouth_curve + 6
    else:
        mask = TOP_HALF
        radius_y = -mouth_curve + 6

    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_WIDTH, radius_y, WHITE, NO_FILL, mask)


def draw_readout(mouth_curve):
    text = "curve: " + str(mouth_curve)
    # Erase FIRST, and erase the FULL WIDTH. There is no frame buffer on
    # this display, so whatever is already on the glass stays there until
    # something paints over it. Two traps live in this one line:
    #
    #   The strip is FONT.HEIGHT tall -- 32 rows, because that is what
    #   this font actually is. Clear 16 and every letter keeps its bottom
    #   half. Clear a "scaled" 24 and it keeps its bottom quarter.
    #
    #   The strip is the whole screen wide, which is what saves you when
    #   the value goes from "-36" to "0": the shorter string is centered,
    #   so it cannot cover the old string's ends by itself.
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

mouth_curve = 12                  # 8 on the smartwatch kit
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
# 2. Shrink MOUTH_BOX_H by thirty and run to the extremes. The old mouth's
#    ends survive the erase and pile up. The box has to be big enough for
#    the LARGEST thing that can appear in it, not the current one.
#
# 3. Change FONT.HEIGHT in draw_readout() to a hardcoded 16 and hold a
#    button down. The bottom half of every digit stays behind and the
#    readout turns into a smear. That is the bug this kit's port had to
#    fix everywhere: the coordinates scaled by 1.5, the glyphs did not.
