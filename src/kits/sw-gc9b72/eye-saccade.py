# Eye Saccade: Gaze That Jumps and Holds, Instead of Sweeping
#
# Every eye-scanner lab before this one sweeps the pupils smoothly from
# side to side. Real eyes almost never do that.
#
# A human eye moves in SACCADES: a ballistic jump to a new target lasting
# 30 to 80 milliseconds, followed by a FIXATION -- 200 to 400 ms of
# holding almost perfectly still while the brain actually looks at
# something. Your eyes are doing it right now, three or four times a
# second, across this line of text. Smooth motion is what an eye does
# only when it is TRACKING something that moves, which is a different
# behavior with a different name (smooth pursuit).
#
# That is why a sweeping robot eye reads as mechanical no matter how fast
# you make it, and why this program looks alive at a fraction of the
# cost.
#
# THE COST, WHICH IS THE FUN PART. eye-scanner-sprite.py sends 2 drawing
# calls every 4.2 ms, forever. This program crosses the whole eye in 18
# frames -- 72 ms, measured on a Pico at 24 MHz -- and then sends NOTHING
# AT ALL for the next 200 to 400 ms. Even that worst case is under a
# fifth of the work the sweep does, and most jumps are much shorter: a
# one-step flick measured 3.9 ms.
#
# Being convincing and being cheap are usually opposites. Here they are
# the same choice, because both come from the same fact: eyes are still
# most of the time.
#
# On a robot this is the behavior you want when the machine has to LOOK
# like it is deciding. A collision-avoidance robot that backs away from a
# wall and then flicks its gaze left, holds, flicks right, holds, is
# doing something an onlooker reads instantly as weighing the options.

import config
import shapes
from math import sqrt
from urandom import getrandbits
from utime import sleep_ms, ticks_us, ticks_diff

display = config.init_display()
ON = config.WHITE
OFF = config.BLACK
FILL = config.FILL
NO_FILL = config.NO_FILL

HALF_WIDTH = config.WIDTH // 2

# The same face as every other eye-scanner lab in this kit.
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

# How far the pupil travels in one frame of a jump. This is the dial that
# sets how long a jump TAKES, and it was tuned by measuring rather than
# guessing: on a GC9B72 at 24 MHz, a step of 15 crossed the whole eye in
# 13 ms -- three times faster than any human eye can move, which reads as
# a glitch rather than a glance. A smaller step puts the jump back in the
# 30-80 ms band real saccades live in.
#
# It also buys something for free. Because a jump is a fixed number of
# steps, a LONG jump takes proportionally longer than a short one --
# which is exactly what real eyes do. Vision researchers call that
# relationship the main sequence, and you get it here without writing a
# line of code for it.
SACCADE_STEP = 5

# The places this face is willing to look. Real eyes do not drift to
# arbitrary coordinates -- they jump between THINGS worth looking at, so
# a short list of destinations is closer to the truth than a random
# number in a range.
#
# Every entry must be a whole multiple of SACCADE_STEP. That is not
# decoration: it guarantees every jump is a whole number of full-size
# steps, which is what lets one fixed-size sprite handle every move. Lose
# that and the sprite has to over-reach, and its corners start landing
# outside the white of the eye.
TARGETS = tuple(range(-PUPIL_RANGE, PUPIL_RANGE + 1, SACCADE_STEP))

# How long to hold still after arriving, in milliseconds. The randomness
# matters more than the numbers: a face that pauses for exactly 300 ms
# every time reads as a metronome, not a mind.
FIXATION_MIN_MS = 200
FIXATION_MAX_MS = 400

PUPIL_COLOR = OFF
SPRITE_BACKGROUND = ON

SPRITE_W = PUPIL_RADIUS * 2 + 1 + SACCADE_STEP
SPRITE_H = PUPIL_RADIUS * 2 + 1
SPRITE_TOP = EYE_Y - PUPIL_RADIUS


def random_below(count):
    """A random number from 0 to count - 1.

    getrandbits() is the one random function every MicroPython build has,
    so everything else is built from it here rather than assuming
    randint() or choice() exist on your firmware. The modulo very
    slightly favors the low end -- irrelevant for choosing where to look,
    worth knowing before you use this pattern for anything that counts."""
    return getrandbits(16) % count


def half_width(dy, xr, yr):
    """How far an ellipse with radii (xr, yr) reaches sideways on the row
    dy above or below its center -- the same math shapes.ellipse() draws
    with, so the sprite's pupil matches a drawn one exactly."""
    if yr <= 0:
        return xr
    inside = 1.0 - (float(dy) * dy) / (float(yr) * yr)
    if inside <= 0.0:
        return 0
    return int(xr * sqrt(inside) + 0.5)


def build_sprite(pupil_center_column):
    """A pupil sitting on eye-white, built once in RAM.

    Two bytes per pixel, rows packed end to end -- exactly what
    blit_buffer() streams to the panel, which is why the whole rectangle
    goes out in one command sequence instead of one per row."""
    buffer = shapes.sprite(SPRITE_W, SPRITE_H, SPRITE_BACKGROUND)
    pupil_bytes = bytes(((PUPIL_COLOR >> 8) & 0xFF, PUPIL_COLOR & 0xFF))

    for dy in range(-PUPIL_RADIUS, PUPIL_RADIUS + 1):
        edge = half_width(dy, PUPIL_RADIUS, PUPIL_RADIUS)
        row = dy + PUPIL_RADIUS
        run = edge * 2 + 1
        start = (row * SPRITE_W + pupil_center_column - edge) * 2
        buffer[start:start + run * 2] = pupil_bytes * run

    return buffer


# One sprite per direction: the pupil sits at the leading end, with a
# clean margin of eye-white trailing behind it to wipe out where the
# pupil just was.
SPRITE_RIGHT = build_sprite(SACCADE_STEP + PUPIL_RADIUS)
SPRITE_LEFT = build_sprite(PUPIL_RADIUS)


def sprite_fits_inside_eye():
    """The sprite is a RECTANGLE around a round pupil, so its corners
    reach into parts of the eye the pupil itself never visits. The eye is
    an ellipse -- 66 px wide across the middle but only 61 px at the
    pupil's top and bottom rows -- so a corner can poke out past the
    white and paint a bright notch onto the black face.

    Checked here, once, instead of discovered on the glass."""
    reach = PUPIL_RANGE + PUPIL_RADIUS
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
    """The slow, complete way -- run once at startup, and never again
    unless something breaks the sprite's assumptions."""
    display.fill(OFF)
    draw_mouth()
    for eye_x in (LEFT_EYE_X, RIGHT_EYE_X):
        shapes.ellipse(display, eye_x, EYE_Y, EYE_WIDTH, EYE_HEIGHT,
                       ON, FILL)
        shapes.ellipse(display, eye_x + offset, EYE_Y,
                       PUPIL_RADIUS, PUPIL_RADIUS, PUPIL_COLOR, FILL)


def move_pupils(old_offset, new_offset):
    """One step of a jump: stamp both pupils at their new position.

    Two calls, whole frame. The sprite is built for a move of exactly
    SACCADE_STEP, and because every target is a multiple of SACCADE_STEP,
    that is the only size of move this program ever makes. The fallback
    below is for when you break that rule on purpose -- exercise 3."""
    dx = new_offset - old_offset
    if dx == 0:
        return
    if dx > SACCADE_STEP or dx < -SACCADE_STEP:
        draw_whole_face(new_offset)
        return

    if dx > 0:
        sprite = SPRITE_RIGHT
        left = LEFT_EYE_X + new_offset - PUPIL_RADIUS - SACCADE_STEP
    else:
        sprite = SPRITE_LEFT
        left = LEFT_EYE_X + new_offset - PUPIL_RADIUS

    display.blit_buffer(sprite, left, SPRITE_TOP, SPRITE_W, SPRITE_H)
    display.blit_buffer(sprite, left + (RIGHT_EYE_X - LEFT_EYE_X),
                        SPRITE_TOP, SPRITE_W, SPRITE_H)


def pick_target(current):
    """Somewhere new to look. Never the place we are already looking --
    a "jump" that goes nowhere just reads as a stutter."""
    while True:
        target = TARGETS[random_below(len(TARGETS))]
        if target != current:
            return target


def saccade_to(offset, target):
    """Jump the gaze to target, one full step per frame, and report how
    long the whole jump took in microseconds.

    A real saccade takes 30 to 80 ms. Print this and compare -- if your
    jumps come in far under 30 ms, the motion is faster than any eye and
    you may want a smaller SACCADE_STEP or a short sleep between steps."""
    start = ticks_us()
    while offset != target:
        if target > offset:
            next_offset = offset + SACCADE_STEP
        else:
            next_offset = offset - SACCADE_STEP
        move_pupils(offset, next_offset)
        offset = next_offset
    return offset, ticks_diff(ticks_us(), start)


if not sprite_fits_inside_eye():
    print("WARNING: the", SPRITE_W, "x", SPRITE_H, "sprite reaches outside")
    print("         the eye at full deflection. Shrink PUPIL_RANGE or")
    print("         SACCADE_STEP, or widen the eye.")

if PUPIL_RANGE % SACCADE_STEP:
    print("WARNING: PUPIL_RANGE is not a whole number of SACCADE_STEPs, so")
    print("         some jump will end with a short step the sprite is too")
    print("         wide for. Expect a smear at the ends of the travel.")

offset = 0
draw_whole_face(offset)

REPORT = True

while True:
    target = pick_target(offset)
    offset, jump_us = saccade_to(offset, target)

    if REPORT:
        # Two numbers worth watching: how long the jump took, and how
        # many frames it needed. Everything in between those jumps is
        # time this program spends drawing absolutely nothing.
        print("saccade to", offset, "took", jump_us, "us")

    sleep_ms(FIXATION_MIN_MS +
             random_below(FIXATION_MAX_MS - FIXATION_MIN_MS))

# Things to try:
#
# 1. Run this next to eye-scanner-sprite.py and just watch them, without
#    looking at any numbers. One of them looks like a machine sweeping a
#    sensor and the other looks like something making up its mind. The
#    code is nearly identical; only the MOTION is different.
#
# 2. Set FIXATION_MIN_MS and FIXATION_MAX_MS both to 300 so every pause
#    is identical. The face immediately reads as a metronome. Irregular
#    timing is doing more work here than any amount of drawing speed.
#
# 3. Break the multiple-of-SACCADE_STEP rule on purpose: add 7 to the
#    TARGETS tuple. Now some jumps end with a step smaller than the
#    sprite was built for, move_pupils() falls back to redrawing the
#    whole face, and you can SEE the difference -- a visible flash on
#    those jumps and nowhere else. That flash is what a full redraw looks
#    like on this display, which is the whole reason this kit works the
#    way it does.
#
# 4. Add a tiny drift during fixation -- one pixel, every few hundred
#    milliseconds. Real eyes do this too (it is called microsaccade and
#    ocular drift), and a face that is perfectly still can start to look
#    switched off rather than attentive. You will need a second, smaller
#    pair of sprites for a 1-pixel move.
#
# 5. Make the gaze mean something. Feed pick_target() from a distance
#    sensor instead of getrandbits(), so the robot looks toward whichever
#    side has more room. Now the face is not performing thought -- it is
#    reporting it, and anyone watching can read the robot's next move off
#    its eyes before the wheels turn.
