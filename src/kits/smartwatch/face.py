# face.py -- the shared face-drawing module for the Smartwatch kit.
#
# Labs 10 through 22 each rebuilt the same eyes, eyebrows, and mouths from
# scratch. Lab 23 pulls those parts out of the labs and into this one file.
# config.py holds the hardware facts (which pin, which pixel size),
# shapes.py holds the drawing commands this driver is missing, and face.py
# holds the face facts (how wide an eye is, where an eyebrow sits).
#
# Nothing in here is new. Every function is a copy of code you already
# wrote in an earlier lab -- that is the point. Moving it here means you
# only have to get it right once.
#
# TWO THINGS CHANGED FROM THE OLED VERSION, and they are worth knowing
# before you read the code:
#
#   THERE IS NO show(). The SSD1306 kept a copy of the screen in RAM and
#   show() shipped it to the glass. This driver has no such buffer -- a
#   drawing call IS the trip down the wire. So the old clear-draw-show
#   dance is now just clear-draw, and forgetting show() is a bug that no
#   longer exists here. What replaces it is worse and more interesting:
#   clearing the whole screen is now the most expensive thing you can do,
#   which is why erase() exists and why lab 29 matters more on this kit.
#
#   THE SCREEN IS ROUND. Everything below is laid out to sit inside the
#   visible circle, which is why the numbers are not simply the OLED
#   numbers multiplied by two.

import config
import shapes
from utime import sleep_ms

# The display is created once, here, and shared by every lab that imports
# this module. Use it as face.display when you need a raw drawing command.
display = config.init_display()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

# Quadrant fill codes from the ellipse lab.
TOP_RIGHT = shapes.TOP_RIGHT
TOP_LEFT = shapes.TOP_LEFT
BOTTOM_LEFT = shapes.BOTTOM_LEFT
BOTTOM_RIGHT = shapes.BOTTOM_RIGHT
TOP_HALF = shapes.TOP_HALF        # 3  -- an arc that frowns
BOTTOM_HALF = shapes.BOTTOM_HALF  # 12 -- an arc that smiles

WIDTH = config.WIDTH
HEIGHT = config.HEIGHT
HALF_WIDTH = WIDTH // 2           # 120, and also the center of the circle
HALF_HEIGHT = HEIGHT // 2
SAFE_RADIUS = config.SAFE_RADIUS

FONT = config.SMALL_FONT
FONT_WIDTH = FONT.WIDTH
FONT_HEIGHT = FONT.HEIGHT

EYE_SPACING = 48
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING     # 72
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING    # 168
EYE_Y = 102
PUPIL_RADIUS = 8

EYEBROW_HALF_WIDTH = 24
EYEBROW_Y = EYE_Y - 40                    # 62

MOUTH_Y = 164

# Where a one-line caption fits without the bezel clipping it. A round
# screen has no usable corners, so labels go centered at the top and
# bottom instead of tucked into (2, 2) the way they were on the OLED.
LABEL_Y = 30
BOTTOM_LABEL_Y = 200

# An arc drawn once is a faint one-pixel trace. On a screen this size one
# pixel is invisible from across a room, so every arc is drawn STROKE
# times, each a pixel lower, to thicken it into a line you can read.
STROKE = 4

# An eye squeezed this flat is not a thin eye any more -- it is a shut
# one, so eye() draws the closed-eye arc instead. See eye() below.
CLOSED_THRESHOLD = 5

# Mouth styles. Lab 24 uses these names in its emotion table, so a row of
# data can pick a mouth shape without calling a different function.
SMILE = "smile"
FROWN = "frown"
FLAT = "flat"
OPEN = "open"
SMIRK = "smirk"
SNEER = "sneer"

# ---------------------------------------------------------------------
# COLOR
#
# Every part of the face draws in COLOR unless you tell it otherwise, and
# COLOR starts as WHITE. That default is not laziness -- white on black
# is the highest contrast this screen can produce, and lab 30 asks you to
# make an expression readable from across a room. Any color you choose is
# dimmer than white. Choose one anyway, but choose it knowing that.
#
# Three ways to use it, from broadest to narrowest:
#
#     face.set_color(config.YELLOW)      # every part, until changed
#     face.eyes(24, 24, color=RED)       # one part, this once
#     face.COLOR                         # read what is currently set
#
# Lab 24 puts a color in every row of the emotion table, which is the
# same trick as putting the mouth style there: one more column, no new
# drawing code.
COLOR = WHITE

# The pupil is not drawn -- it is a hole punched back to the background,
# which is why it stays BLACK even when the eye is purple.
PUPIL_COLOR = BLACK

# ---------------------------------------------------------------------
# DEBUG_ERASE
#
# Leave this None and erase() paints black, which is invisible against a
# black screen -- so the single most important thing this kit does, and
# the whole subject of lab 29, happens where you cannot see it.
#
# Set it to a color and every erase() box shows up as a colored
# rectangle, with the redrawn part sitting on top of it. Now you can
# WATCH which pixels your program decided to repaint:
#
#     face.DEBUG_ERASE = config.RED
#
# It costs nothing -- a colored pixel is the same two bytes as a black
# one -- and it turns "the mouth box is too small" from a mysterious
# smear into content visibly spilling over a boundary you can see.
DEBUG_ERASE = None


def set_color(color):
    """Set the color every face part uses from now on."""
    global COLOR
    COLOR = color


def _ink(color):
    """Resolve an optional per-call color against the current default."""
    return COLOR if color is None else color


def clear():
    """Erase the whole screen.

    This paints all 57,600 pixels black -- 115,200 bytes down the SPI
    wire -- so it is by far the most expensive call in this file. Use it
    when you are changing the whole picture. When only the mouth is
    moving, use erase() on the mouth instead. Lab 29 measures the
    difference."""
    display.fill(BLACK)


def erase(x, y, w, h):
    """Blank one rectangle. This is how you take something back on a
    display that has no undo and no frame buffer: draw black over it.

    Set DEBUG_ERASE to a color and this paints that color instead, which
    is the only way to see the boxes your program is actually repainting.
    See the note next to DEBUG_ERASE above."""
    display.fill_rect(x, y, w, h,
                      BLACK if DEBUG_ERASE is None else DEBUG_ERASE)


def text(string, x, y, color=None):
    """Write text at an exact position, in the kit's small font.

    Unlike the OLED's oled.text(), this driver's text() wants a font
    module as its first argument -- there is no built-in font. face.py
    picks config.SMALL_FONT so the labs do not have to."""
    display.text(FONT, string, x, y, _ink(color), BLACK)


def centered_text(string, y, color=None):
    """Write text centered on the screen's vertical axis. On a round
    display this is almost always what you want, because the further a
    line strays from the center line the sooner the bezel eats it."""
    x = HALF_WIDTH - (len(string) * FONT_WIDTH) // 2
    if x < 0:
        x = 0
    display.text(FONT, string, x, y, _ink(color), BLACK)


def label(text_string, x=None, y=LABEL_Y, color=None):
    """Print a short name so you know which face is showing. Centered at
    the top of the circle by default; pass x to place it yourself."""
    if x is None:
        centered_text(text_string, y, color)
    else:
        display.text(FONT, text_string, x, y, _ink(color), BLACK)


def erase_label(y=LABEL_Y):
    """Blank the strip a label sits in, without touching the face."""
    erase(0, y, WIDTH, FONT_HEIGHT)


def big_label(string, y=LABEL_Y, color=None):
    """The same idea in the 16x32 font -- readable across a classroom,
    but only fifteen characters fit across the widest part of the glass."""
    x = HALF_WIDTH - (len(string) * config.BIG_FONT.WIDTH) // 2
    if x < 0:
        x = 0
    display.text(config.BIG_FONT, string, x, y, _ink(color), BLACK)


def eye(x, radius_x, radius_y, pupil_dx=0, pupil_dy=0, color=None):
    """One eye: a filled ellipse with a pupil punched out of it.

    The pupil is drawn in PUPIL_COLOR, which is the background -- it is a
    hole, not a shape, so it stays black however you color the eye.

    Squeeze radius_y down to CLOSED_THRESHOLD or less and the eye switches
    to the closed-eye arc instead, because a flat ellipse with a pupil
    punched through it would leave nothing on screen at all. That one rule
    lets an animation close an eye just by shrinking it."""
    if radius_y <= CLOSED_THRESHOLD:
        closed_eye(x, radius_x + 4, 11, color)
        return
    shapes.ellipse(display, x, EYE_Y, radius_x, radius_y, _ink(color), FILL)
    shapes.ellipse(display, x + pupil_dx, EYE_Y + pupil_dy,
                   PUPIL_RADIUS, PUPIL_RADIUS, PUPIL_COLOR, FILL)


def eyes(radius_x, radius_y, pupil_dx=0, pupil_dy=0, color=None):
    """Both eyes at once -- the shape that carries most of the emotion."""
    eye(LEFT_EYE_X, radius_x, radius_y, pupil_dx, pupil_dy, color)
    eye(RIGHT_EYE_X, radius_x, radius_y, pupil_dx, pupil_dy, color)


def closed_eye(x, radius_x=26, radius_y=13, color=None):
    """A closed eye: the top half of an ellipse, thickened by STROKE."""
    ink = _ink(color)
    for offset in range(STROKE):
        shapes.ellipse(display, x, EYE_Y + 6 + offset, radius_x, radius_y,
                       ink, NO_FILL, TOP_HALF)


def closed_eyes(radius_x=26, radius_y=13, color=None):
    """Both eyes shut -- a blink if it is brief, sleep if it holds."""
    closed_eye(LEFT_EYE_X, radius_x, radius_y, color)
    closed_eye(RIGHT_EYE_X, radius_x, radius_y, color)


def eyebrow(x, side, tilt, lift=0, color=None):
    """One eyebrow. side is 1 for the left eye and -1 for the right, so a
    positive tilt always angles the inner ends down into an angry V.

    Drawn STROKE times so it reads as a brow and not a scratch."""
    ink = _ink(color)
    y = EYEBROW_Y - lift
    outer_x = x - (EYEBROW_HALF_WIDTH * side)
    inner_x = x + (EYEBROW_HALF_WIDTH * side)
    for offset in range(STROKE):
        display.line(outer_x, y - tilt + offset,
                     inner_x, y + tilt + offset, ink)


def eyebrows(tilt_left, tilt_right, lift=0, color=None):
    """Both eyebrows. Give them different tilts for a skeptical look."""
    eyebrow(LEFT_EYE_X, 1, tilt_left, lift, color)
    eyebrow(RIGHT_EYE_X, -1, tilt_right, lift, color)


def mouth_curve(radius_x, radius_y, mask, color=None):
    ink = _ink(color)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       radius_x, radius_y, ink, NO_FILL, mask)


def mouth_flat(half_width, color=None):
    display.fill_rect(HALF_WIDTH - half_width, MOUTH_Y,
                      half_width * 2, STROKE, _ink(color))


def mouth_open(radius_x, radius_y, color=None):
    shapes.ellipse(display, HALF_WIDTH, MOUTH_Y, radius_x, radius_y,
                   _ink(color), FILL)


def mouth_smirk(half_width, side=1, color=None):
    """A flat mouth with one corner curled up."""
    ink = _ink(color)
    mouth_flat(half_width, ink)
    corner_x = HALF_WIDTH + (half_width * side)
    mask = BOTTOM_RIGHT if side > 0 else BOTTOM_LEFT
    for offset in range(STROKE):
        shapes.ellipse(display, corner_x, MOUTH_Y - 10 - offset, 14, 14,
                       ink, NO_FILL, mask)


def mouth_sneer(radius_x, radius_y, color=None):
    """An off-center raised lip -- the mouth that reads as disgust."""
    ink = _ink(color)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH - 14, MOUTH_Y - offset,
                       radius_x, radius_y, ink, NO_FILL, TOP_HALF)


def mouth(style, size_x, size_y=0, color=None):
    """Draw whichever mouth `style` names. One function call handles every
    mouth in the kit, which is what lets an emotion live in a table row
    instead of in its own hand-written function."""
    if style == SMILE:
        mouth_curve(size_x, size_y, BOTTOM_HALF, color)
    elif style == FROWN:
        mouth_curve(size_x, size_y, TOP_HALF, color)
    elif style == FLAT:
        mouth_flat(size_x, color)
    elif style == OPEN:
        mouth_open(size_x, size_y, color)
    elif style == SMIRK:
        mouth_smirk(size_x, 1, color)
    elif style == SNEER:
        mouth_sneer(size_x, size_y, color)
    else:
        raise ValueError("unknown mouth style: " + str(style))


def bezel(color=None, thickness=2):
    """A thin ring just inside the rim. Nothing needs it, but on a round
    screen it makes the face look deliberate instead of cropped -- and it
    shows you exactly where the usable area ends."""
    shapes.ring(display, HALF_WIDTH, HALF_HEIGHT, SAFE_RADIUS + 4,
                _ink(color), thickness)


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
