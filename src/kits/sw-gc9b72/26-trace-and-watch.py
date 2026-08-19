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
#
# WHICH IS EXACTLY WHY THIS LAB QUOTES NO FPS FIGURE ANYWHERE. This panel
# is 360x360 -- 129,600 pixels, 2.25 times the smartwatch kit's 57,600 --
# driven by a different chip through a different driver. A frame rate
# measured over there is not a fact about this board, and nobody has run
# this program on this panel and written the answer down yet. The
# instrument is real. The reading is yours to take.

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

# Milliseconds are milliseconds on any screen. Only the PIXEL numbers in
# this file changed crossing from the smartwatch kit's 240x240 panel;
# every duration below is the same as it was there.
REPORT_EVERY_MS = 1000
BLINK_EVERY_MS = 3000
BLINK_HOLD_MS = 150

EYE_BOX = 51                    # 34 on the smartwatch kit

# THE INSTRUMENT PANEL STAYS IN THE SMALL FONT, and that is a decision,
# not an oversight.
#
# face.label() draws in the 16x32 font on this kit. "fps:120 hit:34" is
# fourteen characters, which is 224 pixels in 16x32 -- and at LABEL_Y the
# safe circle is only about 200 pixels wide, so the readout would slide
# under the bezel the moment fps reached three digits. face.text() and
# face.centered_text() are still 8x16, where the same string is 112
# pixels and has room to grow. Dense readouts get the small font; short
# headlines get the big one.
#
# The erase strip is the other half of the same trap. It is FONT_HEIGHT
# tall -- 16, the height the glyphs actually are. Every position in this
# file was multiplied by 1.5 porting it to this screen, but a bitmap font
# is not a position: multiplying 16 by 1.5 would blank eight rows of face
# that no letter ever touched.
PANEL_HEIGHT = face.FONT_HEIGHT       # 16, not 24

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
    face.mouth(face.SMILE, 69, 27)


def draw_eyes():
    for x in (face.LEFT_EYE_X, face.RIGHT_EYE_X):
        face.erase(x - EYE_BOX, face.EYE_Y - EYE_BOX, EYE_BOX * 2, EYE_BOX * 2)
    if blinking:
        face.closed_eyes()
    else:
        face.eyes(36, 36)


def draw_panel(a_value, b_value):
    """The instrument panel gets the top and bottom strips of the circle.
    The face keeps the middle, so the instruments never sit on top of
    what they measure.

    Each strip is erased before it is rewritten. Skip that and "fps:120"
    overwritten by "fps:98" leaves the stale 0 hanging off the end, and
    you spend an afternoon debugging a frame rate that was never wrong."""
    face.erase(0, face.LABEL_Y, face.WIDTH, PANEL_HEIGHT)
    face.centered_text("fps:" + str(fps) + " hit:" + str(presses),
                       face.LABEL_Y)
    face.erase(0, face.BOTTOM_LABEL_Y, face.WIDTH, PANEL_HEIGHT)
    face.centered_text("A:" + str(a_value) + " B:" + str(b_value),
                       face.BOTTOM_LABEL_Y)


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
#    a number instead of a feeling. Nobody can hand you those two numbers;
#    they belong to your board, your wiring, and your SPI baudrate.
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
#
# 6. Raise config.BAUDRATE and run test 1 again. On this kit that one
#    constant may move fps more than anything you write, because on a
#    display with no frame buffer the SPI wire is the program's real
#    speed limit. Find the highest speed that still draws cleanly, then
#    write down the fps at each speed you tried. That table is the first
#    honest performance measurement anyone has made of this panel.
