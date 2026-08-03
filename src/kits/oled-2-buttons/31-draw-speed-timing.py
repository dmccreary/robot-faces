# Lab 31: How Fast Is a Face? -- Benchmarking Built-Ins
#
# oled.ellipse() draws an eye in a single line. That line is so short and
# so ordinary-looking that it is easy to assume it is doing something
# simple. It is not. Somebody wrote a careful piece of code to make that
# ellipse appear, and then compiled it into the MicroPython firmware.
#
# This lab finds out what that work is worth, in microseconds, by drawing
# the SAME face two ways and timing both:
#
#   HAND   an ellipse you can read, written in MicroPython, that walks
#          every pixel in the shape's bounding box and uses the ellipse
#          equation to ask "is this pixel inside?"
#   BUILT  the built-in oled.ellipse(), compiled into the firmware
#
# Press button B to flip between the two faces. They are near-identical:
# an eyelash of difference here and there, because two correct ways of
# rounding a curve onto a grid of whole pixels can disagree by one. What
# is NOT small is the difference in how long they take.
#
# Button A runs the benchmark again. Button B switches between the report
# and the two faces, so you can confirm you are comparing like with like.

import config
import face
from utime import ticks_us, ticks_diff, sleep_ms

button_a, button_b = config.init_buttons()

oled = face.oled
WHITE = face.WHITE
BLACK = face.BLACK
FILL = face.FILL
NO_FILL = face.NO_FILL

REPEATS = 5   # how many faces to time, so one slow run cannot fool us


# --- the hand-coded ellipse -------------------------------------------
#
# The ellipse equation says a point is inside when
#
#     (dx * dx) / (rx * rx)  +  (dy * dy) / (ry * ry)  <=  1
#
# Division is slow and inexact, so multiply both sides out first. The
# same test becomes whole-number arithmetic with no division at all:
#
#     dx*dx * ry*ry  +  dy*dy * rx*rx  <=  rx*rx * ry*ry
#
# That trick is worth remembering on its own. Everything below is just
# that one test, run on every pixel in the shape's bounding box.

def hand_ellipse(cx, cy, rx, ry, colour, fill, bottom_half=False):
    rx2 = rx * rx
    ry2 = ry * ry
    limit = rx2 * ry2

    # For an outline we keep the pixels that are inside the shape but NOT
    # inside a shape one pixel smaller. What is left over is the edge.
    inner_rx2 = (rx - 1) * (rx - 1)
    inner_ry2 = (ry - 1) * (ry - 1)
    inner_limit = inner_rx2 * inner_ry2
    has_inner = inner_rx2 > 0 and inner_ry2 > 0

    for dy in range(-ry, ry + 1):
        if bottom_half and dy < 0:
            continue
        dy2_rx2 = dy * dy * rx2
        for dx in range(-rx, rx + 1):
            if dx * dx * ry2 + dy2_rx2 > limit:
                continue                      # outside the ellipse
            if not fill and has_inner:
                if dx * dx * inner_ry2 + dy * dy * inner_rx2 <= inner_limit:
                    continue                  # inside the edge, so skip it
            oled.pixel(cx + dx, cy + dy, colour)


# --- the same face, drawn two ways ------------------------------------
#
# Two filled eyes, two pupils, one curved mouth. Every shape is an
# ellipse, so nothing but the ellipse code differs between these.

EYE_R = 10
PUPIL_R = 3
MOUTH_RX = 22
MOUTH_RY = 12


def draw_face_by_hand():
    oled.fill(BLACK)
    hand_ellipse(face.LEFT_EYE_X, face.EYE_Y, EYE_R, EYE_R, WHITE, True)
    hand_ellipse(face.RIGHT_EYE_X, face.EYE_Y, EYE_R, EYE_R, WHITE, True)
    hand_ellipse(face.LEFT_EYE_X, face.EYE_Y, PUPIL_R, PUPIL_R, BLACK, True)
    hand_ellipse(face.RIGHT_EYE_X, face.EYE_Y, PUPIL_R, PUPIL_R, BLACK, True)
    hand_ellipse(face.HALF_WIDTH, face.MOUTH_Y, MOUTH_RX, MOUTH_RY,
                 WHITE, False, bottom_half=True)


def draw_face_built_in():
    oled.fill(BLACK)
    oled.ellipse(face.LEFT_EYE_X, face.EYE_Y, EYE_R, EYE_R, WHITE, FILL)
    oled.ellipse(face.RIGHT_EYE_X, face.EYE_Y, EYE_R, EYE_R, WHITE, FILL)
    oled.ellipse(face.LEFT_EYE_X, face.EYE_Y, PUPIL_R, PUPIL_R, BLACK, FILL)
    oled.ellipse(face.RIGHT_EYE_X, face.EYE_Y, PUPIL_R, PUPIL_R, BLACK, FILL)
    oled.ellipse(face.HALF_WIDTH, face.MOUTH_Y, MOUTH_RX, MOUTH_RY,
                 WHITE, NO_FILL, face.BOTTOM_HALF)


# --- the benchmark ----------------------------------------------------

def time_drawing(draw, repeats):
    """Return the average microseconds one call to draw() takes.

    Two rules make a benchmark trustworthy, and both are here:

      1. Run it once first and throw that result away. The first call has
         to allocate things the later ones reuse, so it is never typical.
      2. Time several runs and average them. One reading of anything this
         fast is mostly noise; an average is a measurement.
    """
    draw()                                    # warm-up, not counted

    started = ticks_us()
    for _ in range(repeats):
        draw()
    return ticks_diff(ticks_us(), started) // repeats


def time_show():
    """Time the push to the glass on its own. It is the same for both
    faces, so leaving it inside the comparison would hide the difference
    we are actually looking for."""
    oled.show()                               # warm-up
    started = ticks_us()
    for _ in range(REPEATS):
        oled.show()
    return ticks_diff(ticks_us(), started) // REPEATS


hand_us = 0
built_us = 0
show_us = 0


def run_benchmark():
    global hand_us, built_us, show_us

    print("timing", REPEATS, "faces each way...")
    hand_us = time_drawing(draw_face_by_hand, REPEATS)
    built_us = time_drawing(draw_face_built_in, REPEATS)
    show_us = time_show()

    ratio = hand_us // built_us if built_us > 0 else 0
    print("hand-coded :", hand_us, "us")
    print("built-in   :", built_us, "us")
    print("built-in is", ratio, "times faster")
    print("show()     :", show_us, "us")


def draw_report():
    ratio = hand_us // built_us if built_us > 0 else 0
    oled.fill(BLACK)
    face.label("DRAW TIME (us)", 2, 0)
    face.label("hand :" + str(hand_us), 2, 12)
    face.label("built:" + str(built_us), 2, 22)
    face.label("built is " + str(ratio) + "x", 2, 32)
    face.label("show :" + str(show_us), 2, 42)
    face.label("A=run B=look", 2, 55)
    oled.show()


# --- the main loop ----------------------------------------------------

REPORT = 0
LOOK_HAND = 1
LOOK_BUILT = 2

run_benchmark()
view = REPORT
draw_report()

while True:
    if face.pressed(button_a):
        face.wait_for_release(button_a)
        run_benchmark()
        view = REPORT
        draw_report()

    if face.pressed(button_b):
        face.wait_for_release(button_b)
        view = (view + 1) % 3
        if view == REPORT:
            draw_report()
        elif view == LOOK_HAND:
            draw_face_by_hand()
            face.label("hand-coded", 2, 0)
            oled.show()
        else:
            draw_face_built_in()
            face.label("built-in", 2, 0)
            oled.show()

    sleep_ms(10)


# ---------------------------------------------------------------------
# WHY IS THE BUILT-IN SO MUCH FASTER?
#
# Two separate reasons, and it is worth keeping them apart in your head,
# because they are fixed in completely different ways.
#
# 1. IT IS COMPILED, NOT INTERPRETED.
#    Your MicroPython runs one bytecode instruction at a time, and the
#    interpreter has to work out what each one means before doing it.
#    oled.ellipse() was translated into machine code once, back when the
#    firmware was built, and the processor runs it directly. That alone
#    is usually worth somewhere between 10x and 100x.
#
# 2. IT USES A BETTER ALGORITHM.
#    hand_ellipse() tests every pixel in the bounding box -- for a 10 by
#    10 eye that is a 21 by 21 square, so 441 tests to draw about 314
#    pixels. Roughly a third of the work is spent proving that pixels are
#    NOT part of the eye. The built-in walks only the curve itself, using
#    the midpoint ellipse algorithm, and never looks at the empty corners
#    at all.
#
# The honest lesson is not "never write your own drawing code". It is
# that a library function is somebody else's careful work, already done,
# and rewriting one by hand almost always costs you speed you did not
# know you had. Reach for the built-in first. Write your own when the
# built-in cannot do what you need -- and then measure it.
#
# Things to try:
#
# 1. Predict the ratio before you run it. Write your guess down. Almost
#    nobody guesses high enough.
#
# 2. Compare the drawing time to the show() time from the report. Which
#    one dominates for the hand-coded face? Which for the built-in? The
#    answer flips, and that flip is exactly why lab 29's optimization
#    mattered so little.
#
# 3. Make the eyes bigger -- change EYE_R from 10 to 20 -- and run again.
#    The hand-coded time grows with the AREA of the bounding box, so
#    doubling the radius roughly quadruples it. The built-in grows far
#    more slowly. Growth rate matters more than any single measurement.
#
# 4. Attack reason 2 on its own. Write a version that walks only the
#    curve, using the midpoint ellipse algorithm, and time it against
#    both. Whatever gap is left after that is reason 1 -- you will have
#    separated "my algorithm was slower" from "my language was slower",
#    which is a genuinely hard thing to measure and you just did it.
#
# 5. Time the other built-ins the same way. How long does one hline()
#    take compared to drawing the same row with pixel() in a loop? You
#    now own a method that answers questions like that in two minutes.
