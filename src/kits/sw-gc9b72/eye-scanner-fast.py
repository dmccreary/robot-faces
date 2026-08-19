# Eye Scanner, Fast: Move the Pupils by Repainting Only Their Edges
#
# The same sweeping eyes as 11-eye-scanner.py, drawn a different way.
#
# Lab 11 asked "which BOX changed?" and erased two rectangles instead of
# the whole screen. That was already a big win over wiping the glass. But
# look at what it still does on every single frame: it blanks 138 x 84
# pixels per eye, rebuilds the entire white eye ellipse underneath, and
# stamps the pupil back on top -- 40,952 pixels of SPI traffic to move a
# pupil ONE pixel sideways.
#
# Ask the decomposition question one level deeper -- which PIXELS changed?
# -- and the answer is startling. When a disk slides one pixel to the
# right, only two thin crescents differ from the frame before:
#
#     the leading edge    pixels the pupil just covered  -> paint BLACK
#     the trailing edge   pixels the pupil just left     -> paint WHITE
#
# Everything between those two crescents was black last frame and is
# still black this frame. Everything outside them was white and is still
# white. Sending any of it again is sending bytes to change a pixel into
# the color it already is.
#
# THE ARITHMETIC, which you can check against the numbers above:
#
#     lab 11, per frame     40,952 pixels, 222 window setups
#     this lab, per frame      124 pixels,  76 window setups
#
# 330 times fewer pixels. Do not expect 330 times the frame rate: pixels
# are not the only cost. Every separate drawing call also pays for a
# command sequence -- the "window setup" column -- and that column only
# improves by about 3x. What used to be a program dominated by pixels
# becomes a program dominated by call overhead, and the closing exercises
# are about what you would do next if that were still too slow.
#
# NOTHING HERE HAS BEEN TIMED ON A GC9B72. The pixel and setup counts are
# arithmetic and they are exact. Milliseconds are not arithmetic -- they
# are a measurement, and nobody has taken it on this panel yet. Run both
# labs back to back, watch them, and read the microsecond number this one
# prints. That comparison is yours to make.

import config
import shapes
from math import sqrt
from utime import sleep, ticks_us, ticks_diff

display = config.init_display()
ON = config.WHITE
OFF = config.BLACK
FILL = config.FILL
NO_FILL = config.NO_FILL

HALF_WIDTH = config.WIDTH // 2

# Identical to 11-eye-scanner.py, on purpose. Same face, same sweep --
# only the way the frames are drawn is different.
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

# How far the pupil moves per frame. In lab 11 a bigger step cost the
# same as a small one, because the whole eye was redrawn either way. Here
# it costs a little more -- each repainted run is STEP pixels wide
# instead of 1 -- but the number of drawing CALLS does not change at all,
# and calls are the expensive part. A step of 3 sweeps three times as
# fast for 76 calls, same as a step of 1.
STEP = 1
DELAY = 0.01

# The two colors this program paints with. PUPIL_COLOR is the pupil;
# TRAIL_COLOR is what the pupil leaves behind it, which has to be the
# white of the eye for the trail to be invisible.
#
# Set TRAIL_COLOR = config.RED and run it. Every pixel this program
# touches lights up, so you can see the crescent this whole lab is about,
# and the red trail smears out behind the pupil and gets painted over on
# the way back. It costs nothing -- a red pixel and a white pixel are
# both two bytes.
PUPIL_COLOR = OFF
TRAIL_COLOR = ON


def half_width(dy, xr, yr):
    """How far an ellipse with radii (xr, yr) reaches sideways on the row
    dy above or below its center -- the ellipse equation solved for x.

    This is the same formula shapes.ellipse() uses to draw one row at a
    time, and it HAS to be. This lab draws the first pupil with
    shapes.ellipse() and then edits its edges by hand forever after. If
    the two disagreed by even one pixel on one row, that disagreement
    would sit on the glass for the rest of the program as a white notch
    in the pupil, or a black speck outside it."""
    if yr <= 0:
        return xr
    inside = 1.0 - (float(dy) * dy) / (float(yr) * yr)
    if inside <= 0.0:
        return 0
    return int(xr * sqrt(inside) + 0.5)


def build_pupil_spans():
    """Describe the pupil's edge once, so no frame has to work it out.

    Every frame needs to know, for each row of the pupil, how far that
    row reaches sideways. That is a square root per row -- 31 of them per
    eye, 62 per frame, forever, all computing the same 31 answers. So
    compute them once here instead.

    Then notice something about those answers:

        0 5 7 9 10 11 12 13 13 14 14 14 15 15 15 15 15 15 15 14 ...

    Near the top and bottom of a circle the edge moves fast, but through
    the middle it barely moves at all -- SEVEN rows in a row reach
    exactly 15 pixels. Rows that share an edge share a rectangle, so
    those seven rows can be repainted with ONE fill_rect() instead of
    seven hline() calls. Grouping equal rows this way turns 31 runs per
    side into 19, which is why the header says 76 window setups and not
    124.

    Returns a list of (top_row, height, half_width) groups."""
    spans = []
    for dy in range(-PUPIL_RADIUS, PUPIL_RADIUS + 1):
        row = EYE_Y + dy
        edge = half_width(dy, PUPIL_RADIUS, PUPIL_RADIUS)
        if spans and spans[-1][2] == edge:
            top, height, same_edge = spans[-1]
            spans[-1] = (top, height + 1, same_edge)
        else:
            spans.append((row, 1, edge))
    return spans


PUPIL_SPANS = build_pupil_spans()


def pupil_stays_inside_eye():
    """The trail is painted WHITE because the pupil moves across white.
    Check that assumption once, here, instead of discovering it as a
    white smear on a black screen.

    At full deflection the pupil's outermost pixel on each row sits
    PUPIL_RANGE + pupil_edge from the eye's center, and it has to still
    be within the eye's own edge on that same row. With the numbers at
    the top of this file the tightest row clears by 6 pixels."""
    for dy in range(-PUPIL_RADIUS, PUPIL_RADIUS + 1):
        reach = PUPIL_RANGE + half_width(dy, PUPIL_RADIUS, PUPIL_RADIUS)
        if reach > half_width(dy, EYE_WIDTH, EYE_HEIGHT):
            return False
    return True


def move_pupil(eye_x, old_offset, new_offset):
    """Slide one pupil from old_offset to new_offset by repainting two
    thin edges -- and nothing else.

    For a row whose pupil edge reaches `edge` pixels sideways, and a move
    of dx pixels to the right:

        the pupil now covers    old_right + 1  ..  old_right + dx
        the pupil has left      old_left       ..  old_left  + dx - 1

    Both runs are exactly dx pixels wide, whatever the row. That is the
    whole trick: a disk that slides sideways changes the same small
    number of pixels per row no matter how fat the disk is.

    THE PUPIL RUN IS PAINTED FIRST AND THE TRAIL SECOND, and that order
    matters more than it looks. If dx is ever bigger than the pupil is
    wide on some row -- which happens on the top and bottom rows, where
    the pupil is one pixel wide -- the two runs stop being neighbors and
    start overlapping the gap between the old position and the new one.
    Painting the pupil first and the trail over the top of it leaves
    exactly the right pixels black, because the trail run always stops
    one pixel short of where the new pupil begins. Work through a row
    with edge = 0 and dx = 3 on paper and you will see it come out right.
    Reverse the two lines and you will see it come out wrong."""
    dx = new_offset - old_offset
    if dx == 0:
        return

    old_x = eye_x + old_offset
    new_x = eye_x + new_offset

    if dx > 0:
        for row, height, edge in PUPIL_SPANS:
            display.fill_rect(old_x + edge + 1, row, dx, height, PUPIL_COLOR)
            display.fill_rect(old_x - edge, row, dx, height, TRAIL_COLOR)
    else:
        run = -dx
        for row, height, edge in PUPIL_SPANS:
            display.fill_rect(new_x - edge, row, run, height, PUPIL_COLOR)
            display.fill_rect(old_x + edge - run + 1, row, run, height,
                              TRAIL_COLOR)


def move_pupils(old_offset, new_offset):
    """Both eyes look the same direction, so both get the same edit."""
    move_pupil(LEFT_EYE_X, old_offset, new_offset)
    move_pupil(RIGHT_EYE_X, old_offset, new_offset)


def draw_mouth():
    # bottom half of an ellipse (mask 12 = 4 + 8)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_WIDTH, 36, ON, NO_FILL, 12)


def draw_whole_face(offset):
    """The expensive way, done exactly once.

    Every pixel of both eyes and the mouth gets sent here, the same way
    lab 11 sends them 100 times a second. After this returns, the screen
    is correct, and the only thing that will ever be wrong about it again
    is the pupils' two edges."""
    display.fill(OFF)
    draw_mouth()
    for eye_x in (LEFT_EYE_X, RIGHT_EYE_X):
        shapes.ellipse(display, eye_x, EYE_Y, EYE_WIDTH, EYE_HEIGHT,
                       ON, FILL)
        shapes.ellipse(display, eye_x + offset, EYE_Y,
                       PUPIL_RADIUS, PUPIL_RADIUS, PUPIL_COLOR, FILL)


if not pupil_stays_inside_eye():
    print("WARNING: at an offset of", PUPIL_RANGE, "the pupil reaches")
    print("         past the edge of the eye. The trail will be painted")
    print("         white outside the eye and smear the face.")

offset = 0
draw_whole_face(offset)

# The pupil sweeps by stepping toward one limit until it arrives, then
# turning around. Clamping to the limit before flipping means the pupil
# lands exactly on +/- PUPIL_RANGE no matter what STEP is set to -- and
# landing exactly matters here, because this lab never redraws the pupil
# from scratch to cover up a rounding mistake.
step = STEP
frames = 0
total_us = 0
REPORT_EVERY = 90

while True:
    target = offset + step
    if target >= PUPIL_RANGE:
        target = PUPIL_RANGE
        step = -step
    elif target <= -PUPIL_RANGE:
        target = -PUPIL_RANGE
        step = -step

    start = ticks_us()
    move_pupils(offset, target)
    total_us += ticks_diff(ticks_us(), start)
    offset = target

    frames += 1
    if frames == REPORT_EVERY:
        # Drawing time only -- the sleep below is not in it. If this
        # number is much smaller than DELAY, the animation's speed is now
        # set by the sleep and not by the display, which is the whole
        # point of the lab.
        print("pupil move:", total_us // frames, "us per frame")
        frames = 0
        total_us = 0

    sleep(DELAY)

# Things to try:
#
# 1. Run 11-eye-scanner.py, then run this one, and watch the difference
#    with your eyes before you read any numbers. Then set TRAIL_COLOR to
#    config.RED here and ERASE_COLOR to config.RED there, and run them
#    again. The red is every pixel each program repaints: two whole
#    rectangles there, two hairlines here.
#
# 2. Set STEP to 3. The sweep gets three times faster and the printed
#    microseconds barely move, because the call count did not change --
#    only the width of each repainted run. Now set STEP to 40 and watch
#    what happens on the rows where the pupil is one pixel wide. It still
#    works, and the reason is the paint order explained in move_pupil().
#
# 3. Swap the two fill_rect() lines in move_pupil() so the trail is
#    painted before the pupil. At STEP = 1 the picture is still perfect.
#    At STEP = 2 the pupil's top and bottom rows start dropping pixels,
#    and by STEP = 40 it is a smear. One pixel of step is the only
#    setting that hides this bug, and it is the setting the lab ships
#    with -- which is exactly why the argument for that order is written
#    out above instead of trusted to luck.
#
# 4. Delete build_pupil_spans() and repaint one row at a time with
#    display.hline() instead. The picture is identical and the setup
#    count goes from 76 to 124. Time both. Whether you can measure the
#    difference tells you how much a window setup really costs on this
#    panel -- which is a number worth knowing before you optimize
#    anything else in this kit.
#
# 5. The remaining cost is 76 command sequences to send 124 pixels, which
#    is a strange-looking bill: almost all overhead, almost no cargo.
#    Lab 9 showed the other way out. display.blit_buffer() sends a whole
#    rectangle in ONE window setup, so build a 32 x 31 sprite of the
#    pupil sitting on white -- wide enough to cover where the pupil was
#    AND where it is going -- and blit that over both positions at once.
#    One setup per eye, 992 pixels per eye: sixteen times the pixels for
#    a thirty-eighth of the calls. Which bill is cheaper on this panel is
#    a measurement, not an opinion, and you now have both programs to
#    measure.
#
# 6. Everything here assumes the pupil moves and NOTHING ELSE does. Add a
#    blink and watch the assumption break: closing the eye paints over
#    the pupil, and this program has no idea, so it goes on editing edges
#    that are not there. Lab 28's state machine is one answer -- when the
#    face changes state, draw the whole face once and start editing edges
#    again from there.
