# Eye Saccade: Gaze That Jumps and Holds, Instead of Sweeping
#
# Lab 11 sweeps the pupils smoothly from side to side. Real eyes almost
# never do that.
#
# A human eye moves in SACCADES: a ballistic jump to a new target lasting
# 30 to 80 milliseconds, followed by a FIXATION -- 200 to 400 ms of
# holding almost perfectly still while the brain actually looks at
# something. Your eyes are doing it right now, three or four times a
# second, across this line of text. Smooth motion is what an eye does
# only when TRACKING something that moves, which is a different behavior
# with a different name (smooth pursuit).
#
# That is why a sweeping robot eye reads as mechanical no matter how fast
# you make it. Nothing about the drawing changes here -- draw_face() is
# lab 11's, untouched. The only difference is WHEN it gets called, and
# that difference is what makes the face look like it is thinking.
#
# THIS IS THE CHEAPEST INTERESTING CHANGE IN THE KIT. On this display
# every frame costs the same no matter what changed, because oled.show()
# ships the whole 1,024-byte buffer either way. So a face that holds
# still simply stops calling show() -- and a program that draws at most
# 12 frames and then rests for a third of a second does a fraction of the work of
# one that sweeps continuously, while looking far more alive.
#
# On a robot this is the behavior you want when the machine has to LOOK
# like it is deciding. A collision-avoidance robot that backs away from a
# wall and then flicks its gaze left, holds, flicks right, holds, is
# doing something an onlooker reads instantly as weighing the options.

import config
from urandom import getrandbits
from utime import sleep_ms, ticks_us, ticks_diff

oled = config.init_display()
ON = config.WHITE
OFF = config.BLACK
FILL = config.FILL
NO_FILL = config.NO_FILL

HALF_WIDTH = config.WIDTH // 2

# The same face as lab 11, so you can run them back to back.
PUPIL_RANGE = 18
EYE_DIST_FROM_TOP = 21
EYE_WIDTH = 27
EYE_HEIGHT = 10
PUPIL_RADIUS = 5
LEFT_EYE_X = 32
RIGHT_EYE_X = 94
MOUTH_VPOS = 45
MOUTH_WIDTH = 40

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
SACCADE_STEP = 3

# The places this face is willing to look. Real eyes do not drift to
# arbitrary coordinates -- they jump between THINGS worth looking at, so
# a short list of destinations is closer to the truth than a random
# number in a range.
TARGETS = tuple(range(-PUPIL_RANGE, PUPIL_RANGE + 1, SACCADE_STEP))

# How long to hold still after arriving, in milliseconds. The randomness
# matters more than the numbers: a face that pauses for exactly 300 ms
# every time reads as a metronome, not a mind.
FIXATION_MIN_MS = 200
FIXATION_MAX_MS = 400


def random_below(count):
    """A random number from 0 to count - 1.

    getrandbits() is the one random function every MicroPython build has,
    so everything else is built from it here rather than assuming
    randint() or choice() exist on your firmware. The modulo very
    slightly favors the low end -- irrelevant for choosing where to look,
    worth knowing before you use this pattern for anything that counts."""
    return getrandbits(16) % count


def draw_face(offset):
    """Lab 11's drawing code, unchanged. Both eyes always look the same
    direction, which is what makes a face read as looking AT something
    rather than in two directions at once."""
    oled.fill(config.BLACK)

    # left eye
    oled.ellipse(LEFT_EYE_X, EYE_DIST_FROM_TOP, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    oled.ellipse(LEFT_EYE_X + offset, EYE_DIST_FROM_TOP,
                 PUPIL_RADIUS, PUPIL_RADIUS, OFF, FILL)

    # right eye
    oled.ellipse(RIGHT_EYE_X, EYE_DIST_FROM_TOP, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    oled.ellipse(RIGHT_EYE_X + offset, EYE_DIST_FROM_TOP,
                 PUPIL_RADIUS, PUPIL_RADIUS, OFF, FILL)

    # mouth: bottom half of an ellipse (mask 12 = 4 + 8)
    oled.ellipse(HALF_WIDTH, MOUTH_VPOS, MOUTH_WIDTH, 10, ON, NO_FILL, 12)

    oled.show()


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

    A real saccade takes 30 to 80 ms. Print this and compare -- that is
    the number that tells you whether your robot's eyes move at a speed
    a human will recognize."""
    start = ticks_us()
    while offset != target:
        if target > offset:
            offset = offset + SACCADE_STEP
        else:
            offset = offset - SACCADE_STEP
        draw_face(offset)
    return offset, ticks_diff(ticks_us(), start)


if PUPIL_RANGE % SACCADE_STEP:
    print("WARNING: PUPIL_RANGE is not a whole number of SACCADE_STEPs,")
    print("         so the pupil will overshoot the end of its travel.")

offset = 0
draw_face(offset)

REPORT = True

while True:
    target = pick_target(offset)
    offset, jump_us = saccade_to(offset, target)

    if REPORT:
        # Watch this number against the 30-80 ms a real saccade takes.
        # Everything between these jumps is time the program spends
        # drawing absolutely nothing.
        print("saccade to", offset, "took", jump_us, "us")

    sleep_ms(FIXATION_MIN_MS +
             random_below(FIXATION_MAX_MS - FIXATION_MIN_MS))

# Things to try:
#
# 1. Run this next to 11-eye-scanner.py and just watch them, without
#    looking at any numbers. One looks like a machine sweeping a sensor
#    and the other looks like something making up its mind. The drawing
#    code is identical; only the MOTION is different.
#
# 2. Set FIXATION_MIN_MS and FIXATION_MAX_MS both to 300 so every pause
#    is the same length. The face immediately reads as a metronome.
#    Irregular timing is doing more work here than any drawing trick.
#
# 3. Set SACCADE_STEP to 1. The jump becomes a slow glide and the face
#    stops looking alive -- while costing three times as many frames.
#    Slower, smoother AND more expensive, all from one number.
#
# 4. Count the frames. A sweep across this face is 36 of them; a jump is
#    at most 12, and then the program sleeps. Add a counter and print
#    frames-per-second for both programs, then decide which one you would
#    put on a robot that also has to drive, steer and read a sensor.
#
# 5. Make the gaze mean something. Feed pick_target() from a distance
#    sensor instead of getrandbits(), so the robot looks toward whichever
#    side has more room. Now the face is not performing thought -- it is
#    reporting it, and anyone watching can read the robot's next move off
#    its eyes before the wheels turn.
