# face.py -- the shared face-drawing module for the OLED Two-Button kit.
#
# Labs 10 through 22 each rebuilt the same eyes, eyebrows, and mouths from
# scratch. Lab 23 pulls those parts out of the labs and into this one file.
# config.py holds the hardware facts (which pin, which pixel size); face.py
# holds the face facts (how wide an eye is, where an eyebrow sits).
#
# Nothing in here is new. Every function is a copy of code you already
# wrote in an earlier lab -- that is the point. Moving it here means you
# only have to get it right once.

import config
from utime import sleep_ms

# The display is created once, here, and shared by every lab that imports
# this module. Use it as face.oled when you need a raw drawing command.
oled = config.init_display()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

# Quadrant fill codes from the ellipse lab.
TOP_RIGHT = 1
TOP_LEFT = 2
BOTTOM_LEFT = 4
BOTTOM_RIGHT = 8
TOP_HALF = TOP_RIGHT + TOP_LEFT           # 3  -- an arc that frowns
BOTTOM_HALF = BOTTOM_LEFT + BOTTOM_RIGHT  # 12 -- an arc that smiles

WIDTH = config.WIDTH
HEIGHT = config.HEIGHT
HALF_WIDTH = WIDTH // 2

EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 24
PUPIL_RADIUS = 3

EYEBROW_HALF_WIDTH = 11
EYEBROW_Y = EYE_Y - 10

MOUTH_Y = 46

# An arc drawn once is a faint one-pixel trace. Drawing it three times,
# each a pixel lower, thickens it into a line you can read across a room.
STROKE = 3

# An eye squeezed this flat is not a thin eye any more -- it is a shut
# one, so eye() draws the closed-eye arc instead. See eye() below.
CLOSED_THRESHOLD = 2

# Mouth styles. Lab 24 uses these names in its emotion table, so a row of
# data can pick a mouth shape without calling a different function.
SMILE = "smile"
FROWN = "frown"
FLAT = "flat"
OPEN = "open"
SMIRK = "smirk"
SNEER = "sneer"


def clear():
    """Erase the whole screen. Call this before drawing a new face."""
    oled.fill(BLACK)


def show():
    """Push the drawing to the glass. Nothing appears until you call it."""
    oled.show()


def label(text, x=2, y=2):
    """Print a short name in a corner so you know which face is showing."""
    oled.text(text, x, y, WHITE)


def eye(x, radius_x, radius_y, pupil_dx=0, pupil_dy=0):
    """One eye: a filled white ellipse with a black pupil punched out.

    Squeeze radius_y down to CLOSED_THRESHOLD or less and the eye switches
    to the closed-eye arc instead, because a one-pixel-tall ellipse with a
    pupil punched through it would leave nothing on screen at all. That
    one rule lets an animation close an eye just by shrinking it."""
    if radius_y <= CLOSED_THRESHOLD:
        closed_eye(x, radius_x + 2, 5)
        return
    oled.ellipse(x, EYE_Y, radius_x, radius_y, WHITE, FILL)
    oled.ellipse(x + pupil_dx, EYE_Y + pupil_dy,
                 PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def eyes(radius_x, radius_y, pupil_dx=0, pupil_dy=0):
    """Both eyes at once -- the shape that carries most of the emotion."""
    eye(LEFT_EYE_X, radius_x, radius_y, pupil_dx, pupil_dy)
    eye(RIGHT_EYE_X, radius_x, radius_y, pupil_dx, pupil_dy)


def closed_eye(x, radius_x=12, radius_y=6):
    """A closed eye: the top half of an ellipse, thickened by STROKE."""
    for offset in range(STROKE):
        oled.ellipse(x, EYE_Y + 3 + offset, radius_x, radius_y,
                     WHITE, NO_FILL, TOP_HALF)


def closed_eyes(radius_x=12, radius_y=6):
    """Both eyes shut -- a blink if it is brief, sleep if it holds."""
    closed_eye(LEFT_EYE_X, radius_x, radius_y)
    closed_eye(RIGHT_EYE_X, radius_x, radius_y)


def eyebrow(x, side, tilt, lift=0):
    """One eyebrow. side is 1 for the left eye and -1 for the right, so a
    positive tilt always angles the inner ends down into an angry V."""
    y = EYEBROW_Y - lift
    outer_x = x - (EYEBROW_HALF_WIDTH * side)
    inner_x = x + (EYEBROW_HALF_WIDTH * side)
    oled.line(outer_x, y - tilt, inner_x, y + tilt, WHITE)


def eyebrows(tilt_left, tilt_right, lift=0):
    """Both eyebrows. Give them different tilts for a skeptical look."""
    eyebrow(LEFT_EYE_X, 1, tilt_left, lift)
    eyebrow(RIGHT_EYE_X, -1, tilt_right, lift)


def mouth_curve(radius_x, radius_y, mask):
    oled.ellipse(HALF_WIDTH, MOUTH_Y, radius_x, radius_y, WHITE, NO_FILL, mask)


def mouth_flat(half_width):
    oled.hline(HALF_WIDTH - half_width, MOUTH_Y, half_width * 2, WHITE)


def mouth_open(radius_x, radius_y):
    oled.ellipse(HALF_WIDTH, MOUTH_Y, radius_x, radius_y, WHITE, FILL)


def mouth_smirk(half_width, side=1):
    """A flat mouth with one corner curled up."""
    mouth_flat(half_width)
    corner_x = HALF_WIDTH + (half_width * side)
    mask = BOTTOM_RIGHT if side > 0 else BOTTOM_LEFT
    oled.ellipse(corner_x, MOUTH_Y - 4, 6, 6, WHITE, NO_FILL, mask)


def mouth_sneer(radius_x, radius_y):
    """An off-center raised lip -- the mouth that reads as disgust."""
    oled.ellipse(HALF_WIDTH - 6, MOUTH_Y, radius_x, radius_y,
                 WHITE, NO_FILL, TOP_HALF)


def mouth(style, size_x, size_y=0):
    """Draw whichever mouth `style` names. One function call handles every
    mouth in the kit, which is what lets an emotion live in a table row
    instead of in its own hand-written function."""
    if style == SMILE:
        mouth_curve(size_x, size_y, BOTTOM_HALF)
    elif style == FROWN:
        mouth_curve(size_x, size_y, TOP_HALF)
    elif style == FLAT:
        mouth_flat(size_x)
    elif style == OPEN:
        mouth_open(size_x, size_y)
    elif style == SMIRK:
        mouth_smirk(size_x, 1)
    elif style == SNEER:
        mouth_sneer(size_x, size_y)
    else:
        raise ValueError("unknown mouth style: " + str(style))


def pressed(button):
    """True only if the button is still down 20 ms later, which filters
    out the electrical bounce a real switch makes when it closes."""
    if button.value() == 1:
        return False
    sleep_ms(20)
    return button.value() == 0


def wait_for_release(button):
    """Hold here until the finger comes off, so one press means one step."""
    while button.value() == 0:
        sleep_ms(10)
