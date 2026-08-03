# Lab 29: Only Redraw What Changed -- Decomposition, Then Measurement
#
# Every animation in this kit so far has wiped the entire screen and drawn
# the entire face again, sixty times a second, to move ONE curve. The eyes
# did not change. The eyebrows did not change. We redrew them anyway,
# because it was easier than thinking about it.
#
# Thinking about it is the lab. Ask the decomposition question -- WHICH
# PIXELS ACTUALLY CHANGE? -- and you can erase a small rectangle instead
# of the whole screen. That is how every video codec, every game engine,
# and every windowing system on earth stays fast.
#
# Then ask the second question, the one that separates a guess from
# engineering: DID IT HELP, AND BY HOW MUCH? Button A toggles between
# full and partial redraw while the screen reports two timings in
# microseconds:
#
#   draw   time spent putting pixels into the frame buffer in RAM
#   show   time spent shipping that buffer down the SPI wire to the glass
#
# Watch both numbers as you toggle. One of them changes a lot. The other
# barely moves, and the reason why is the most useful thing in this lab.

import config
import face
from utime import ticks_us, ticks_diff, sleep_ms

button_a, button_b = config.init_buttons()

oled = face.oled

MOUTH_MIN = 3
MOUTH_MAX = 14

# The bounding box of the mouth: the only part of the face this animation
# touches. Everything outside it is identical from frame to frame, so
# there is no reason to erase it. Work these numbers out from the mouth's
# center and radii, then add a couple of pixels of margin for safety.
MOUTH_BOX_X = face.HALF_WIDTH - 24
MOUTH_BOX_Y = face.MOUTH_Y - 2
MOUTH_BOX_W = 48
MOUTH_BOX_H = 18

# The heads-up display changes every frame too, so it is a second box.
HUD_BOX_H = 10

SAMPLES = 20

partial = False
mouth_ry = MOUTH_MIN
step = 1

draw_total = 0
show_total = 0
samples = 0
draw_us = 0
show_us = 0


def draw_everything():
    """The way every earlier lab did it: wipe the screen, rebuild the
    whole face from nothing."""
    face.clear()
    face.eyes(10, 10)
    face.eyebrows(0, 0, lift=2)
    face.mouth(face.SMILE, 22, mouth_ry)
    draw_hud()


def draw_changed_only():
    """The same picture, built by erasing and redrawing two small boxes.
    The eyes and eyebrows are simply left alone -- they are already
    correct in the buffer from the last frame."""
    oled.fill_rect(MOUTH_BOX_X, MOUTH_BOX_Y, MOUTH_BOX_W, MOUTH_BOX_H,
                   face.BLACK)
    face.mouth(face.SMILE, 22, mouth_ry)
    oled.fill_rect(0, 0, face.WIDTH, HUD_BOX_H, face.BLACK)
    draw_hud()


def draw_hud():
    # Kept to one short line on purpose. The HUD's erase box has to stay
    # clear of the eyebrows at y=12, so it only gets the top ten rows.
    mode = "P" if partial else "F"
    face.label(mode + " d" + str(draw_us) + " s" + str(show_us))


def draw_static_parts():
    """Partial redraw only works if the pixels it is NOT touching are
    already right. Call this once when switching modes to lay down a
    correct starting frame."""
    face.clear()
    face.eyes(10, 10)
    face.eyebrows(0, 0, lift=2)
    face.mouth(face.SMILE, 22, mouth_ry)
    draw_hud()
    face.show()


draw_static_parts()

while True:
    if face.pressed(button_a):
        face.wait_for_release(button_a)
        partial = not partial
        draw_total = 0
        show_total = 0
        samples = 0
        print("mode:", "partial" if partial else "full")
        draw_static_parts()

    # Animate the mouth from a thin line to a wide grin and back.
    mouth_ry += step
    if mouth_ry >= MOUTH_MAX or mouth_ry <= MOUTH_MIN:
        step = -step

    started = ticks_us()
    if partial:
        draw_changed_only()
    else:
        draw_everything()
    draw_total += ticks_diff(ticks_us(), started)

    started = ticks_us()
    face.show()
    show_total += ticks_diff(ticks_us(), started)

    # Average over several frames. A single reading of anything this fast
    # is mostly noise; an average is a measurement.
    samples += 1
    if samples >= SAMPLES:
        draw_us = draw_total // samples
        show_us = show_total // samples
        print("draw:", draw_us, "us   show:", show_us, "us   partial:", partial)
        draw_total = 0
        show_total = 0
        samples = 0

    sleep_ms(20)

# What you should find, and why it matters:
#
# The "draw" number drops sharply in partial mode, because you really did
# stop drawing most of the face. The "show" number does not budge, because
# this display driver ships all 1024 bytes of the frame buffer down the
# wire every single time, whether one pixel changed or all of them did.
#
# So the honest answer is: the optimization worked exactly as designed,
# and the overall speedup is still small -- because the part you sped up
# was not the part costing the most time. That is not a failure. That is
# the single most important lesson in performance work, and people who
# skip the measuring step never learn it. They just assume they got faster.
#
# Things to try:
#
# 1. Before toggling, PREDICT how much faster partial mode will be. Then
#    look. Getting this wrong is normal and is the whole point.
#
# 2. Make the mouth box too small -- change MOUTH_BOX_W to 20 -- and watch
#    the grin's corners smear off the edges of the box you forgot to
#    erase. Partial redraw fails loudly when you get the geometry wrong,
#    which is exactly lab 25's ghosting bug wearing a disguise.
#
# 3. Speed up the wire instead of the drawing. In config.py, change the
#    SPI line to SPI(0, baudrate=8_000_000, sck=clock, mosi=data) and run
#    again. Now watch the "show" number. Attacking the expensive part
#    beats optimizing the cheap one.
#
# 4. Add the eye pupils to the animation so they sweep as well. You now
#    need a third box. At what point does tracking boxes get harder than
#    just redrawing the screen? There is no single right answer, and
#    knowing that is the skill.
