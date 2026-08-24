# face.py -- the shared face-drawing module for the sw-gc9b72 kit.
#
# This is a port of the smartwatch kit's face.py (../smartwatch/face.py),
# not a rewrite. Nothing about eyes, eyebrows, or mouths is specific to
# which round display chip is underneath -- shapes.py's ellipse() and
# poly() only ever talk to display.hline()/vline()/line(), and face.py
# only ever talks to shapes.py and display.text()/fill_rect(). So the
# only thing that actually changed crossing from the GC9A01's 240x240
# panel to this GC9B72's 360x360 one is SCALE: every position and size
# below is the smartwatch kit's number multiplied by 1.5 (360 / 240),
# with a comment showing the original next to it.
#
# Two facts inherited unchanged from the smartwatch kit, worth knowing
# before you read the code:
#
#   THERE IS NO show(). This driver has no frame buffer -- a drawing
#   call IS the trip down the wire. clear-draw-show is just clear-draw,
#   and erase() exists because clearing the whole screen is the most
#   expensive thing you can do on a display like this one.
#
#   THE SCREEN IS ROUND. Everything below is laid out to sit inside the
#   visible circle, which is why label positions hug the top and bottom
#   instead of a corner the way they would on a square display.

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

WIDTH = config.WIDTH               # 360
HEIGHT = config.HEIGHT             # 360
HALF_WIDTH = WIDTH // 2            # 180, and also the center of the circle
HALF_HEIGHT = HEIGHT // 2          # 180
SAFE_RADIUS = config.SAFE_RADIUS   # see config.py -- an estimate, not yet measured

# TWO FONTS, and which one you get depends on what you are writing.
#
# The bitmap fonts cannot scale -- they are fixed 8x16 and 16x32 glyphs
# baked into lib/. So going from a 240 px screen to a 360 px one does not
# make text bigger, it makes text proportionally SMALLER: the 8x16 font
# covered 3.3% of the smartwatch kit's width and covers 2.2% of this one.
#
# The fix is to promote the face's LABEL to the 16x32 font, where a name
# like "Surprised" is 144 px wide and reads from across a room. Dense
# multi-line readouts stay in 8x16, because 19 characters of 16x32 is
# 304 px and this screen has no row that wide inside the safe circle.
#
#   label(), big_label()          -> LABEL_FONT, 16x32
#   text(), centered_text()       -> FONT, 8x16
FONT = config.SMALL_FONT
FONT_WIDTH = FONT.WIDTH               # 8
FONT_HEIGHT = FONT.HEIGHT             # 16

LABEL_FONT = config.BIG_FONT
LABEL_FONT_WIDTH = LABEL_FONT.WIDTH   # 16
LABEL_FONT_HEIGHT = LABEL_FONT.HEIGHT # 32

EYE_SPACING = 72                          # 48 on the smartwatch kit
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING     # 108
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING    # 252
EYE_Y = 153                               # 102 on the smartwatch kit
PUPIL_RADIUS = 12                         # 8 on the smartwatch kit

EYEBROW_HALF_WIDTH = 36                   # 24 on the smartwatch kit
EYEBROW_Y = EYE_Y - 60                    # 93 -- 40 below eye level, scaled

MOUTH_Y = 246                             # 164 on the smartwatch kit

# Where a one-line caption fits without the bezel clipping it. A round
# screen has no usable corners, so labels go centered at the top and
# bottom instead of tucked into (2, 2) the way they were on the OLED.
# LABEL_Y is NOT the smartwatch kit's 30 scaled to 45, and the reason is
# a trap worth understanding before you move it.
#
# text() paints a BACKGROUND behind every glyph, so a label is not just
# letters -- it is a solid black band as tall as the font. In the 8x16
# font that band was 16 rows. Here it is 32, because label() uses the
# 16x32 font (see LABEL_FONT above). The band doubled while every
# position around it only grew 1.5x.
#
# So a label at the scaled row 45 would cover rows 45-76 -- and the
# highest eyebrow in the kit, Afraid's (lift 11, tilt 18), reaches row
# 64. Drawing the label after the face, which is what nearly every lab
# does, would slice the top off that eyebrow.
#
# 32 puts the band at rows 32-63, clearing row 64 by one. The cost is
# width: the safe circle is only 159 px across at row 32, against 144 px
# for "Surprised". Every Ekman name still fits, but there is not much
# room left, which is the other half of why labels are capped at 12
# characters.
LABEL_Y = 32
BOTTOM_LABEL_Y = 300                      # 200 on the smartwatch kit

# An arc drawn once is a faint one-pixel trace. On a screen this size one
# pixel is invisible from across a room, so every arc is drawn STROKE
# times, each a pixel lower, to thicken it into a line you can read.
STROKE = 6                                # 4 on the smartwatch kit

# An eye squeezed this flat is not a thin eye any more -- it is a shut
# one, so eye() draws the closed-eye arc instead. See eye() below.
CLOSED_THRESHOLD = 8                      # 5 on the smartwatch kit

# Mouth styles. Lab 24 (once ported) uses these names in its emotion
# table, so a row of data can pick a mouth shape without calling a
# different function.
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
# is the highest contrast this screen can produce. Any color you choose
# is dimmer than white. Choose one anyway, but choose it knowing that.
#
# Three ways to use it, from broadest to narrowest:
#
#     face.set_color(config.YELLOW)      # every part, until changed
#     face.eyes(24, 24, color=RED)       # one part, this once
#     face.COLOR                         # read what is currently set
COLOR = WHITE

# The pupil is not drawn -- it is a hole punched back to the background,
# which is why it stays BLACK even when the eye is purple.
PUPIL_COLOR = BLACK

# ---------------------------------------------------------------------
# DEBUG_ERASE
#
# Leave this None and erase() paints black, which is invisible against a
# black screen -- so the single most important thing this kit does
# happens where you cannot see it.
#
# Set it to a color and every erase() box shows up as a colored
# rectangle, with the redrawn part sitting on top of it. Now you can
# WATCH which pixels your program decided to repaint:
#
#     face.DEBUG_ERASE = config.RED
#
# It costs nothing -- a colored pixel is the same two bytes as a black
# one -- and it turns a too-small erase box from a mysterious smear into
# content visibly spilling over a boundary you can see.
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

    This paints all 129,600 pixels black -- 259,200 bytes down the SPI
    wire -- so it is by far the most expensive call in this file. Use it
    when you are changing the whole picture. When only the mouth is
    moving, use erase() on the mouth instead."""
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

    This driver's text() wants a font module as its first argument --
    there is no built-in font. face.py picks config.SMALL_FONT so the
    labs do not have to."""
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
    the top of the circle by default; pass x to place it yourself.

    This draws in the 16x32 LABEL_FONT, not the 8x16 one -- see the note
    beside LABEL_FONT above. Keep labels short: at LABEL_Y the safe
    circle is about 199 px across, so 12 characters is the ceiling.
    Every Ekman emotion name fits ("Surprised" is the longest, at
    144 px)."""
    if x is None:
        centered_label(text_string, y, color)
    else:
        display.text(LABEL_FONT, text_string, x, y, _ink(color), BLACK)


def centered_label(string, y, color=None):
    """A 16x32 line centered on the screen's vertical axis."""
    x = HALF_WIDTH - (len(string) * LABEL_FONT_WIDTH) // 2
    if x < 0:
        x = 0
    display.text(LABEL_FONT, string, x, y, _ink(color), BLACK)


def erase_label(y=LABEL_Y):
    """Blank the strip a label sits in, without touching the face.

    Note this clears LABEL_FONT_HEIGHT (32) rows, not FONT_HEIGHT (16).
    Erasing only 16 would leave the bottom half of every letter behind --
    the classic no-frame-buffer ghost."""
    erase(0, y, WIDTH, LABEL_FONT_HEIGHT)


def big_label(string, y=LABEL_Y, color=None):
    """Kept as an explicit name for the 16x32 font. Since label() now
    uses that font too, this is the same drawing -- it stays so labs
    ported from the smartwatch kit, where the two differed, still run."""
    centered_label(string, y, color)


def eye(x, radius_x, radius_y, pupil_dx=0, pupil_dy=0, color=None):
    """One eye: a filled ellipse with a pupil punched out of it.

    The pupil is drawn in PUPIL_COLOR, which is the background -- it is a
    hole, not a shape, so it stays black however you color the eye.

    Squeeze radius_y down to CLOSED_THRESHOLD or less and the eye switches
    to the closed-eye arc instead, because a flat ellipse with a pupil
    punched through it would leave nothing on screen at all. That one rule
    lets an animation close an eye just by shrinking it."""
    if radius_y <= CLOSED_THRESHOLD:
        closed_eye(x, radius_x + 6, 17, color)
        return
    shapes.ellipse(display, x, EYE_Y, radius_x, radius_y, _ink(color), FILL)
    shapes.ellipse(display, x + pupil_dx, EYE_Y + pupil_dy,
                   PUPIL_RADIUS, PUPIL_RADIUS, PUPIL_COLOR, FILL)


def eyes(radius_x, radius_y, pupil_dx=0, pupil_dy=0, color=None):
    """Both eyes at once -- the shape that carries most of the emotion."""
    eye(LEFT_EYE_X, radius_x, radius_y, pupil_dx, pupil_dy, color)
    eye(RIGHT_EYE_X, radius_x, radius_y, pupil_dx, pupil_dy, color)


def closed_eye(x, radius_x=39, radius_y=20, color=None):
    """A closed eye: the top half of an ellipse, thickened by STROKE."""
    ink = _ink(color)
    for offset in range(STROKE):
        shapes.ellipse(display, x, EYE_Y + 9 + offset, radius_x, radius_y,
                       ink, NO_FILL, TOP_HALF)


def closed_eyes(radius_x=39, radius_y=20, color=None):
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
        shapes.ellipse(display, corner_x, MOUTH_Y - 15 - offset, 21, 21,
                       ink, NO_FILL, mask)


def mouth_sneer(radius_x, radius_y, color=None):
    """An off-center raised lip -- the mouth that reads as disgust."""
    ink = _ink(color)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH - 21, MOUTH_Y - offset,
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


def bezel(color=None, thickness=3):
    """A thin ring just inside the rim. Nothing needs it, but on a round
    screen it makes the face look deliberate instead of cropped -- and it
    shows you exactly where the usable area ends. thickness defaults a
    little heavier than the smartwatch kit's since there are more pixels
    to fill the same visual weight."""
    shapes.ring(display, HALF_WIDTH, HALF_HEIGHT, SAFE_RADIUS + 6,
                _ink(color), thickness)


def pressed(button):
    """True only if the button is still down 20 ms later, which filters
    out the electrical bounce a real switch makes when it closes.

    Button A is GP14 and button B is GP15 -- see config.py. If a lab
    that reads buttons seems frozen, remember an UNCONNECTED pull-up pin
    reads 1 forever, which is indistinguishable from "not pressed"."""
    if button.value() == 1:
        return False
    sleep_ms(20)
    return button.value() == 0


def wait_for_release(button):
    """Hold here until the finger comes off, so one press means one step."""
    while button.value() == 0:
        sleep_ms(10)
