# Eye Scanner, Sprite: One Stamp Per Eye Per Frame
#
# The third version of the same sweeping eyes, and the one that finally
# asks the right question about this display.
#
# Per frame, all three at STEP = 7 -- the setting all three were timed at,
# so the comparison is like for like. (This lab ships at STEP = 1, which
# makes it cheaper still; see the STEP comment below.)
#
# 11-eye-scanner.py    erase two boxes, rebuild both eyes   40,952 px, 222 calls
# eye-scanner-fast.py  repaint only the pupils' edges           860 px,  76 calls
# this lab             stamp one sprite over each pupil       2,356 px,   2 calls
#
# Read that middle row again. The edge version sends 48 times fewer
# pixels than lab 11 -- and on a real board, with 20 cm cables and
# config.BAUDRATE at 10 MHz (8 MHz once the chip rounded it down, which
# is a story config.py tells), it measured about 118 ms per frame anyway. Divide: 118 ms across 76
# drawing calls is roughly 1.5 MILLISECONDS PER CALL, to deliver runs
# that are seven pixels long. The pixels were never the bill. Every
# fill_rect() pays for a CASET command, a RASET command, a RAMWR command,
# and four chip-select toggles before a single pixel of yours moves, and
# that fixed cost swamps everything else.
#
# (That is one board, one cable length, one baud rate. Measure your own
# with the microseconds this lab prints -- but the SHAPE of the answer,
# overhead beats payload, is what matters and it will hold.)
#
# So stop counting pixels and start counting calls. A pupil that moves
# STEP pixels only ever disturbs a rectangle 2*PUPIL_RADIUS+1+STEP wide
# and 2*PUPIL_RADIUS+1 tall. Every pixel in that rectangle is either
# pupil-black or eye-white, and WE KNOW WHICH before the program ever
# runs. So build that rectangle once, in RAM, and stamp it with a single
# blit_buffer() call: one command sequence, one continuous stream of
# bytes, both edges of the pupil handled at once because they are both
# just part of the picture.
#
# That is 2.7 times more pixels than the edge version sends, to make 38
# times fewer calls. MEASURED ON THE BOARD ABOVE, that trade turned a
# 118 ms frame into an 8.1 ms one -- 14 times faster while sending nearly
# three times the pixels. Raising config.BAUDRATE from 8 to 24 MHz then
# took it to 4.6 ms; see config.py for why the number you ask for is not
# the number you get. Whether it lands there on YOURS is a measurement,
# and this lab prints the number you need.
#
# The other thing to watch for is the artifact, not the clock. The edge
# version repaints a pupil in 76 separate transactions strung out over a
# frame, so the panel scans out a half-moved pupil many times on the way.
# This one delivers the whole pupil in one uninterrupted write, so there
# is no half-moved state to catch.

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

# The same face as the other two labs, so the three can be compared.
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

# STEP behaves BACKWARDS here compared to the edge version, and it is the
# setting to understand before you touch anything else.
#
# In eye-scanner-fast.py a bigger step was free, so you pushed it up to
# hide a slow frame. Here a bigger step makes the SPRITE wider, and sprite
# bytes are what this lab spends -- so a smaller step is smoother AND
# cheaper at the same time. STEP = 1 sends 1,984 bytes per frame where
# STEP = 7 sends 2,356, and it crosses the eye in 90 smooth frames
# instead of 13 jumpy ones.
#
# That is why this ships at 1. A step of 7 was a workaround for a frame
# that took 118 ms, and the frame does not take 118 ms anymore.
STEP = 1
DELAY = 0

PUPIL_COLOR = OFF

# The sprite's background is the white of the eye, because that is what
# surrounds a pupil. Set this to config.RED and the rectangle being
# stamped every frame becomes visible: you see its exact size, where it
# sits, and how much of it is doing nothing but repainting white as
# white. That last part is the price of this whole approach, and it is
# worth seeing once.
SPRITE_BACKGROUND = ON

# Wide enough to cover where the pupil was AND where it is going, tall
# enough for the pupil itself. At STEP = 1 that is 32 x 31 = 992 pixels,
# or 1,984 bytes -- the smallest this rectangle can possibly be.
SPRITE_W = PUPIL_RADIUS * 2 + 1 + STEP
SPRITE_H = PUPIL_RADIUS * 2 + 1


def half_width(dy, xr, yr):
    """How far an ellipse with radii (xr, yr) reaches sideways on the row
    dy above or below its center -- the ellipse equation solved for x,
    the same one shapes.ellipse() draws with."""
    if yr <= 0:
        return xr
    inside = 1.0 - (float(dy) * dy) / (float(yr) * yr)
    if inside <= 0.0:
        return 0
    return int(xr * sqrt(inside) + 0.5)


def build_sprite(pupil_center_column):
    """Draw a pupil into a RAM buffer once, so the frame loop never has
    to draw one again.

    The buffer is RGB565, two bytes per pixel, most significant byte
    first -- exactly what blit_buffer() streams to the panel. Rows run
    left to right, top to bottom, with no gaps, which is why one call can
    deliver the whole rectangle.

    Each row of the pupil is a horizontal run, so it goes in as one slice
    assignment rather than a loop over pixels. Building this costs 31
    slice writes instead of 1,178 individual ones, which matters because
    it happens on a microcontroller at startup while a student waits."""
    buffer = shapes.sprite(SPRITE_W, SPRITE_H, SPRITE_BACKGROUND)
    pupil_bytes = bytes(((PUPIL_COLOR >> 8) & 0xFF, PUPIL_COLOR & 0xFF))

    for dy in range(-PUPIL_RADIUS, PUPIL_RADIUS + 1):
        edge = half_width(dy, PUPIL_RADIUS, PUPIL_RADIUS)
        row = dy + PUPIL_RADIUS
        run = edge * 2 + 1
        start = (row * SPRITE_W + pupil_center_column - edge) * 2
        buffer[start:start + run * 2] = pupil_bytes * run

    return buffer


# Two sprites, because which end of the rectangle the pupil sits at
# depends on which way it is going. Moving right, the pupil is at the
# right end and the clean white margin trails behind it on the left;
# moving left, the mirror image. About 4 KB of RAM for the pair at
# STEP = 1, on a board with 264 KB.
SPRITE_RIGHT = build_sprite(STEP + PUPIL_RADIUS)
SPRITE_LEFT = build_sprite(PUPIL_RADIUS)

SPRITE_TOP = EYE_Y - PUPIL_RADIUS


def sprite_fits_inside_eye():
    """A circle that fits inside the eye does not mean a RECTANGLE around
    that circle fits inside the eye, and this lab stamps rectangles.

    The eye is an ellipse: it is 66 px wide across the middle but only 61
    px wide at the pupil's top and bottom rows. The sprite is full width
    on every row it covers, so its CORNERS reach into a part of the eye
    the pupil itself never visits. Let a corner poke outside the white
    and it paints eye-white onto the black face -- a bright notch beside
    the eye that no amount of staring at the pupil will explain.

    With the numbers in this file the corners clear by one pixel. One.
    Widen the sweep or fatten the pupil and this is the check that tells
    you before the glass does.

    The sprite normally reaches no further than the pupil's own travel,
    PUPIL_RANGE + PUPIL_RADIUS, because it only ever covers where the
    pupil was and where it is going. The second term catches the silly
    case: a STEP so large the sweep crosses in one jump, which drags the
    sprite's trailing margin out past the far side of the eye."""
    reach = max(PUPIL_RANGE + PUPIL_RADIUS,
                PUPIL_RADIUS + STEP - PUPIL_RANGE)
    for dy in range(-PUPIL_RADIUS, PUPIL_RADIUS + 1):
        if reach > half_width(dy, EYE_WIDTH, EYE_HEIGHT):
            return False
    return True


def draw_mouth():
    # bottom half of an ellipse (mask 12 = 4 + 8)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_WIDTH, 36, ON, NO_FILL, 12)


def draw_whole_face(offset):
    """The expensive way, on purpose, exactly once -- plus one more time
    if the invariant below is ever broken."""
    display.fill(OFF)
    draw_mouth()
    for eye_x in (LEFT_EYE_X, RIGHT_EYE_X):
        shapes.ellipse(display, eye_x, EYE_Y, EYE_WIDTH, EYE_HEIGHT,
                       ON, FILL)
        shapes.ellipse(display, eye_x + offset, EYE_Y,
                       PUPIL_RADIUS, PUPIL_RADIUS, PUPIL_COLOR, FILL)


def move_pupils(old_offset, new_offset):
    """Stamp both pupils at their new position. Two calls, whole frame.

    The sprite is built for a move of STEP, but a move of anything from 1
    to STEP works with the same buffer, because the pupil is drawn at the
    LEADING end. The white margin behind it is STEP pixels long, so it
    covers a shorter move with white to spare -- and white on white is
    invisible. That is what lets the sweep clamp to an exact endpoint
    without needing a differently-shaped sprite for the short last step.

    THE INVARIANT IS abs(dx) <= STEP. Break it -- by driving the pupil
    from a table of poses, say, instead of a sweep -- and the sprite is
    too narrow to erase where the pupil used to be, leaving a whole
    second pupil stranded on the eye. So the invariant is checked rather
    than assumed, and the fallback is simply to draw the face the slow
    way, which is always correct."""
    dx = new_offset - old_offset
    if dx == 0:
        return
    if dx > STEP or dx < -STEP:
        draw_whole_face(new_offset)
        return

    if dx > 0:
        sprite = SPRITE_RIGHT
        left = LEFT_EYE_X + new_offset - PUPIL_RADIUS - STEP
    else:
        sprite = SPRITE_LEFT
        left = LEFT_EYE_X + new_offset - PUPIL_RADIUS

    display.blit_buffer(sprite, left, SPRITE_TOP, SPRITE_W, SPRITE_H)
    display.blit_buffer(sprite, left + (RIGHT_EYE_X - LEFT_EYE_X),
                        SPRITE_TOP, SPRITE_W, SPRITE_H)


if not sprite_fits_inside_eye():
    print("WARNING: the", SPRITE_W, "x", SPRITE_H, "sprite's corners reach")
    print("         outside the eye at full deflection. Shrink PUPIL_RANGE")
    print("         or STEP, or widen the eye.")

offset = 0
draw_whole_face(offset)

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
        # Compare this number to the one eye-scanner-fast.py prints with
        # the same STEP. That comparison is the whole lab.
        print("pupil move:", total_us // frames, "us per frame")
        frames = 0
        total_us = 0

    sleep(DELAY)

# Things to try:
#
# 1. Run this and eye-scanner-fast.py back to back at the same STEP and
#    write both printed numbers down. Then work out what one blit_buffer()
#    call costs: this lab makes exactly 2 drawing calls per frame, so the
#    printed number divided by 2 is the cost of a call plus its 1,984
#    bytes. Do the same division on the other lab -- its number divided
#    by 76 -- and you have measured the fixed cost of a drawing call on
#    your own hardware. Every optimization decision in this kit comes
#    down to that one number.
#
# 2. NOW raising the SPI speed is worth doing. In the edge version
#    BAUDRATE barely mattered, because almost nothing was on the wire.
#    Here the wire carries 4,712 bytes a frame, so config.BAUDRATE going
#    from 10 MHz to 20 MHz should cut the transfer time roughly in half.
#    Shorter cables are what make that safe -- speckled pixels or torn
#    frames mean you have gone past what your wiring will carry, and the
#    fix is a shorter ribbon, not a slower program.
#
# 3. Set SPRITE_BACKGROUND to config.RED. The stamped rectangle appears,
#    and so does the honest cost of this approach: most of that red is
#    white being repainted white. This lab sends nearly three times the
#    pixels of the edge version and should win anyway -- because on this
#    display, calls are expensive and bytes are cheap.
#
# 4. Raise STEP to 15 and watch the sprite grow to 46 px wide. The frame
#    gets more expensive and the sweep gets faster; somewhere there is a
#    step size where the sprite is so wide you may as well redraw the
#    whole eye. Find it, and you have found the boundary of when this
#    technique is the right one.
#
# 5. Real eyes do not sweep. They JUMP -- a saccade of 30 to 80 ms -- and
#    then hold still for 200 to 400 ms before jumping somewhere else. A
#    smooth sweep like this one is what an eye does only when it is
#    tracking a moving object. Try replacing the sweep with: pick a
#    random target, get there in two or three steps, then sleep a third
#    of a second. It draws FEWER frames than this lab does, so it costs
#    less -- and it looks far more alive. Speed was never really the
#    problem; the motion was.
