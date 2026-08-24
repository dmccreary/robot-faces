# Lab 29: Only Redraw What Changed -- Decomposition, Then Measurement
#
# Every animation in this kit so far has been careful about this, and now
# you find out why. Wiping the whole screen and rebuilding the whole face
# to move ONE curve means sending 259,200 bytes to erase, plus every
# pixel of every eye, eyebrow, and mouth, over and over -- to change a
# few hundred pixels that actually differ.
#
# Ask the decomposition question -- WHICH PIXELS ACTUALLY CHANGE? -- and
# you can erase a small rectangle instead of the whole screen. That is
# how every video codec, every game engine, and every windowing system on
# earth stays fast.
#
# Then ask the second question, the one that separates a guess from
# engineering: DID IT HELP, AND BY HOW MUCH? Button A toggles between
# full and partial redraw while the screen reports two timings in
# microseconds:
#
#   e     time spent erasing -- a full screen, or one small box
#   d     time spent drawing the face parts back
#
# THE RESULT IS DIFFERENT FROM THE OLED KIT'S, AND THAT IS THE POINT.
# There, the frame buffer had to be shipped in full every time no matter
# what, so the saving was real but small and the honest conclusion was
# "you optimized the cheap part." Here there is no frame buffer. Every
# pixel you skip is a pixel you never send. Predict what that does to the
# numbers before you press the button.
#
# NO EXPECTED MICROSECOND FIGURES APPEAR ANYWHERE IN THIS FILE, on
# purpose. Nobody has measured this program on a GC9B72 yet. The
# smartwatch kit's numbers came off a different chip, running a different
# driver at 60 MHz, pushing 2.25x fewer pixels -- quoting them here would
# be wrong in three directions at once. Run it, write down what YOUR
# board says, and then compare your two numbers TO EACH OTHER. That
# comparison is the measurement, and it is valid on any panel.

import config
import face
from utime import ticks_us, ticks_diff, sleep_ms

button_a, button_b = config.init_buttons()

display = face.display

# Everything above happens where you cannot see it, because erasing paints
# black onto black. Set this and every erase() box becomes a colored
# rectangle with the redrawn part sitting on top of it:
#
#     face.DEBUG_ERASE = config.RED
#
# Do it. In full mode the whole circle turns red every frame, because
# that is genuinely what a full wipe repaints. In partial mode a single
# small rectangle sits around the mouth and nothing else moves. The
# microsecond numbers below say the same thing, but the red rectangle is
# the one students remember -- and it costs nothing, because a red pixel
# and a black pixel are both two bytes.
#
# Button B toggles it while the program runs.
face.DEBUG_ERASE = None

MOUTH_MIN = 9                          # 6 on the smartwatch kit
MOUTH_MAX = 45                         # 30 on the smartwatch kit

# The bounding box of the mouth: the only part of the face this animation
# touches. Everything outside it is identical from frame to frame, so
# there is no reason to erase it. Work these numbers out from the mouth's
# center and radii, then add a few pixels of margin for safety.
MOUTH_RADIUS_X = 75                    # 50 on the smartwatch kit
MOUTH_MARGIN = 6                       # 4 on the smartwatch kit
MOUTH_BOX_X = face.HALF_WIDTH - MOUTH_RADIUS_X - MOUTH_MARGIN
MOUTH_BOX_Y = face.MOUTH_Y - MOUTH_MAX - face.STROKE - MOUTH_MARGIN
MOUTH_BOX_W = (MOUTH_RADIUS_X + MOUTH_MARGIN) * 2
MOUTH_BOX_H = (MOUTH_MAX + face.STROKE + MOUTH_MARGIN) * 2

# That works out to a 162 x 114 rectangle at (99, 189) -- 18,468 pixels
# out of the screen's 129,600. Hold on to those two numbers; the closing
# comment does the division.
#
# It is worth checking that a box this size still fits the ROUND screen,
# because scaling a rectangle up pushes its corners outward faster than
# its edges. The far corners here land 146 px from center, comfortably
# inside config.SAFE_RADIUS of 168, so the whole erase box is glass you
# can actually see. config.inside_circle(x, y) will tell you the same
# thing if you move the mouth and want to re-check.

SAMPLES = 10

partial = False
mouth_ry = MOUTH_MIN
step = 3                               # 2 on the smartwatch kit

erase_total = 0
draw_total = 0
samples = 0
erase_us = 0
draw_us = 0


def erase_everything():
    """The way the OLED labs did it: wipe the entire screen.

    This goes through face.erase() rather than face.clear() so that
    DEBUG_ERASE colors it. Same pixels either way -- but when the whole
    circle flashes red on every frame, nobody has to be talked into
    believing a full wipe is expensive."""
    face.erase(0, 0, face.WIDTH, face.HEIGHT)


def erase_changed_only():
    """Blank only the box the mouth lives in."""
    face.erase(MOUTH_BOX_X, MOUTH_BOX_Y, MOUTH_BOX_W, MOUTH_BOX_H)


def draw_everything():
    """Rebuild the whole face from nothing."""
    face.eyes(36, 36)
    face.eyebrows(0, 0, lift=8)
    face.mouth(face.SMILE, MOUTH_RADIUS_X, mouth_ry)
    draw_hud()


def draw_changed_only():
    """The same picture, built by redrawing only the mouth. The eyes and
    eyebrows are simply left alone -- they are already correct on the
    glass from the last frame."""
    face.mouth(face.SMILE, MOUTH_RADIUS_X, mouth_ry)
    draw_hud()


def draw_hud():
    # The readout uses face.centered_text(), the 8x16 font, NOT face.label().
    # On this kit label() draws in the 16x32 font, and a line like
    # "F e259200 d118400" would be 272 px wide -- wider than the safe
    # circle is at this height, so both ends would vanish under the bezel.
    # Instrument panels stay in the small font; names get the big one.
    mode = "P" if partial else "F"
    face.erase_label(face.LABEL_Y)
    face.centered_text(mode + " e" + str(erase_us) + " d" + str(draw_us),
                       face.LABEL_Y)


def draw_static_parts():
    """Partial redraw only works if the pixels it is NOT touching are
    already right. Call this once when switching modes to lay down a
    correct starting frame."""
    face.clear()
    face.eyes(36, 36)
    face.eyebrows(0, 0, lift=8)
    face.mouth(face.SMILE, MOUTH_RADIUS_X, mouth_ry)
    draw_hud()


draw_static_parts()

while True:
    if face.pressed(button_a):
        face.wait_for_release(button_a)
        partial = not partial
        erase_total = 0
        draw_total = 0
        samples = 0
        print("mode:", "partial" if partial else "full")
        draw_static_parts()

    if face.pressed(button_b):
        face.wait_for_release(button_b)
        # Paint the erase boxes, or stop painting them. Watch the "e"
        # number while you do: it does not change. Making the work
        # visible did not make it cost more.
        face.DEBUG_ERASE = config.RED if face.DEBUG_ERASE is None else None
        print("debug erase:", "on" if face.DEBUG_ERASE else "off")
        draw_static_parts()

    # Animate the mouth from a thin line to a wide grin and back.
    mouth_ry += step
    if mouth_ry >= MOUTH_MAX or mouth_ry <= MOUTH_MIN:
        step = -step

    started = ticks_us()
    if partial:
        erase_changed_only()
    else:
        erase_everything()
    erase_total += ticks_diff(ticks_us(), started)

    started = ticks_us()
    if partial:
        draw_changed_only()
    else:
        draw_everything()
    draw_total += ticks_diff(ticks_us(), started)

    # Average over several frames. A single reading of anything this fast
    # is mostly noise; an average is a measurement.
    samples += 1
    if samples >= SAMPLES:
        erase_us = erase_total // samples
        draw_us = draw_total // samples
        print("erase:", erase_us, "us   draw:", draw_us,
              "us   partial:", partial)
        erase_total = 0
        draw_total = 0
        samples = 0

    sleep_ms(20)

# What you should find, and why it matters:
#
# Both numbers drop, and the erase number drops enormously. Do the
# arithmetic on paper before you look at the screen -- it is four lines,
# and being right about it in advance is the whole point of the lab:
#
#   full wipe    360 x 360  = 129,600 pixels  = 259,200 bytes
#   mouth box    162 x 114  =  18,468 pixels  =  36,936 bytes
#   ------------------------------------------------------------
#   ratio        129,600 / 18,468  =  7.0
#
# SEVEN TIMES fewer pixels erased, every single frame, for a picture that
# is identical on the glass.
#
# That seven is worth a second look, because it is the same seven the
# smartwatch kit gets. Over there the sum is 57,600 / 8,208, and that is
# also 7.0. Nothing was tuned to make those agree. Going from a 240 px
# screen to a 360 px one made everything 1.5x wider AND 1.5x taller, so
# the screen area and the box area BOTH grew by 2.25x, and a ratio whose
# top and bottom grow by the same factor does not move at all.
#
# So: a COUNT of pixels is a fact about one panel and has to be redone
# for every other panel. A RATIO of two areas on the same panel survives
# the move. That is why every number in the table above had to be
# recomputed for this display, and why the "seven" did not.
#
# On the OLED kit the equivalent saving was real but nearly pointless,
# because the driver shipped the entire frame buffer down the wire either
# way. Same optimization, same code shape, wildly different payoff. What
# changed was not the idea. It was the hardware underneath it. That is
# why the measuring step is not optional: an optimization is not fast or
# slow on its own, it is fast or slow ON SOMETHING, and the only way to
# know which you have is to look.
#
# Things to try:
#
# 1. Before toggling, PREDICT the ratio -- you just worked it out above,
#    so predict whether the microseconds follow it. Then look. Then go
#    read the OLED kit's version of this lab and predict what IT will
#    say. Being right about one and wrong about the other is the lesson
#    landing.
#
# 2. Make the mouth box too small -- change MOUTH_BOX_H to 30 -- and watch
#    the grin's corners smear off the edges of the box you forgot to
#    erase. Partial redraw fails loudly when you get the geometry wrong,
#    which is exactly lab 25's ghosting bug wearing a disguise.
#
# 2b. Do exercise 2 again with button B held on, so the erase box is red.
#    The smear is no longer a mystery: the leftover pixels are sitting
#    plainly OUTSIDE a rectangle you can see the edges of. Debugging is
#    much easier when the thing you got wrong is the thing on screen.
#
# 2c. With the red box on, compare the "e" number to what it was with
#    the box black. It is the same. Color is free here -- a red pixel and
#    a black pixel are both two bytes of RGB565 -- so making your program
#    explain itself cost you nothing at all. That is rarer than it
#    sounds, and worth taking when you can get it.
#
# 3. Speed up the wire instead of the drawing. This kit's config.py sets
#    a deliberately cautious BAUDRATE = 10_000_000; the Arduino driver
#    this one descends from reports about 20 MHz working on short leads.
#    Raise it, run again, and see whether every number here improves in
#    proportion -- because on this display every number here IS wire
#    time. If speckled pixels or torn frames show up, drop back down.
#
# 4. Add the eye pupils to the animation so they sweep as well. You now
#    need a third box. At what point does tracking boxes get harder than
#    just redrawing the screen? There is no single right answer, and
#    knowing that is the skill.
