# Lab 26: Trace and Watch -- Debugging by Measurement
#
# Bug 5 in lab 25 was invisible. Nothing looked wrong in a photograph of
# the screen; the program was just too slow to notice a finger. You cannot
# find a bug like that by staring at the code, and you certainly cannot
# find it by guessing. You have to MEASURE.
#
# This lab turns the face into its own instrument. A heads-up display
# reports four numbers that tell you what the program is really doing,
# and the same numbers go to the Thonny shell once a second so you have a
# record you can scroll back through.
#
#   loops   how many times the main loop has run since it started
#   fps     loops per second -- the real speed of your program
#   A / B   what each button pin reads RIGHT NOW (1 = up, 0 = pressed)
#
# Then flip SLOW_MODE to True and watch every one of those numbers fall
# apart. That is the whole lesson: a bug you can measure is a bug you can
# fix.
#
# One difference from the OLED version worth noticing. There, the fps you
# measured was almost entirely YOUR code's speed, because show() cost the
# same 8 milliseconds no matter what. Here, drawing IS sending, so the
# fps number below is dominated by how many pixels you chose to touch.
# The instrument measures a different thing on different hardware, which
# is a good thing to know about instruments.

import config
import face
from utime import ticks_ms, ticks_diff, sleep_ms

button_a, button_b = config.init_buttons()

# Set this True to reproduce lab 25's bug 5 on purpose, then watch what
# the heads-up display says about it.
SLOW_MODE = False
SLOW_DELAY_MS = 300

# Set this True to redraw the entire face every frame, the way the OLED
# labs did. It is the second way to break this program, and the one that
# is unique to a display with no frame buffer.
FULL_REDRAW = False

REPORT_EVERY_MS = 1000
BLINK_EVERY_MS = 3000
BLINK_HOLD_MS = 150

EYE_BOX = 34

loops = 0
frames = 0
fps = 0
presses = 0

blinking = False
was_blinking = None
last_blink = ticks_ms()
blink_started = 0
last_report = ticks_ms()


def draw_static_parts():
    """The mouth never changes, so it is drawn once here rather than on
    every frame. Everything this program does after this point touches
    only the eyes and the two instrument strips."""
    face.clear()
    face.mouth(face.SMILE, 46, 18)


def draw_eyes():
    for x in (face.LEFT_EYE_X, face.RIGHT_EYE_X):
        face.erase(x - EYE_BOX, face.EYE_Y - EYE_BOX, EYE_BOX * 2, EYE_BOX * 2)
    if blinking:
        face.closed_eyes()
    else:
        face.eyes(24, 24)


def draw_panel(a_value, b_value):
    """The instrument panel gets the top and bottom strips of the circle.
    The face keeps the middle, so the instruments never sit on top of
    what they measure."""
    face.erase_label(face.LABEL_Y)
    face.label("fps:" + str(fps) + " hit:" + str(presses))
    face.erase_label(face.BOTTOM_LABEL_Y)
    face.label("A:" + str(a_value) + " B:" + str(b_value),
               y=face.BOTTOM_LABEL_Y)


draw_static_parts()
print("watching... press either button, and try SLOW_MODE = True")

while True:
    loops += 1
    now = ticks_ms()

    a_value = button_a.value()
    b_value = button_b.value()

    # The face blinks on its own timer, exactly as in lab 15.
    if not blinking and ticks_diff(now, last_blink) >= BLINK_EVERY_MS:
        blinking = True
        blink_started = now
    elif blinking and ticks_diff(now, blink_started) >= BLINK_HOLD_MS:
        blinking = False
        last_blink = now

    if a_value == 0 or b_value == 0:
        presses += 1
        face.wait_for_release(button_a if a_value == 0 else button_b)

    if FULL_REDRAW:
        draw_static_parts()
        was_blinking = None

    # Only touch the eyes when they actually changed state. Checking is
    # nearly free; redrawing is not.
    if blinking != was_blinking:
        draw_eyes()
        was_blinking = blinking

    draw_panel(a_value, b_value)
    frames += 1

    # Once a second, work out the real frame rate and report it. Counting
    # frames between two clock readings is how every game, every robot,
    # and every video player measures its own speed.
    if ticks_diff(now, last_report) >= REPORT_EVERY_MS:
        fps = frames
        frames = 0
        last_report = now
        print("loops:", loops, " fps:", fps, " presses:", presses,
              " A:", a_value, " B:", b_value)

    if SLOW_MODE:
        # One innocent-looking line. Watch what it does to fps -- and to
        # how many presses the program manages to notice.
        sleep_ms(SLOW_DELAY_MS)

# Things to try:
#
# 1. Run it as-is and note the fps. Then set SLOW_MODE = True and note it
#    again. Write both numbers down -- that ratio IS the bug, expressed as
#    a number instead of a feeling.
#
# 2. Now leave SLOW_MODE off and set FULL_REDRAW = True instead. The
#    program still never sleeps, and the fps still collapses. Two very
#    different causes, one identical symptom -- which is why you measure
#    instead of guessing.
#
# 3. With SLOW_MODE on, tap button A as fast as you can ten times. Compare
#    the "hit" counter to ten. Every missing press was swallowed by a
#    sleep().
#
# 4. Lower SLOW_DELAY_MS until presses stop getting lost. The number you
#    land on is roughly how long a human finger stays on a button -- you
#    just measured a person with a microcontroller.
#
# 5. Comment out the draw_panel() call for ten seconds and watch fps jump.
#    Two text strips are not free either. Now you know how much of your
#    program's time is spent talking to the display, which is exactly the
#    question lab 29 answers.
