# Lab 27: Keyframes -- An Animation Is Just Data
#
# Lab 24 turned seven expressions into seven rows of a table. This lab
# does the same trick to MOTION.
#
# Every animation so far has been hand-written: a blink was some drawing,
# a sleep, some more drawing. Change the timing and you edit code. But an
# animation is really just a list of poses and how long each one holds --
# which is a table. Animators have called those poses KEYFRAMES for a
# hundred years, and the idea works exactly as well on a $4 microcontroller
# as it does in a cartoon studio.
#
# Write the player once, and every animation below becomes three lines of
# data that anyone on your team can tune without touching the player.
#
# One frame is (eye_height, eyebrow_lift, hold_ms):
#
#   eye_height     how tall the eyes are -- 36 is open, 3 is shut
#   eyebrow_lift   how far the brows rise above their resting spot
#   hold_ms        how long to sit on this pose before moving on
#
# Notice which of those three scaled when this lab came across from the
# smartwatch kit's 240x240 panel and which did not. The first two are
# PIXELS, so they were multiplied by 1.5. The third is TIME, and a
# millisecond is a millisecond on any screen -- every hold below is the
# number the animator originally chose.
#
# Button A plays the selected animation. Button B selects the next one.

import config
import face
from utime import ticks_ms, ticks_diff, sleep_ms

button_a, button_b = config.init_buttons()

EYE_WIDTH = 36                          # 24 on the smartwatch kit

# The box the eyes and brows share. Every frame erases this and rebuilds
# it; nothing else on the screen is ever touched once the mouth is down.
BOX_X = face.LEFT_EYE_X - 54            # 36 on the smartwatch kit
BOX_Y = face.EYEBROW_Y - 39             # 26 on the smartwatch kit
BOX_W = (face.RIGHT_EYE_X + 54) - BOX_X
BOX_H = (face.EYE_Y + 57) - BOX_Y       # 38 on the smartwatch kit

# face.py's default LABEL_Y (45) would put a caption's bottom edge at row
# 77 -- twenty-three rows INSIDE this animation's own erase box, which
# starts at BOX_Y (54). Every draw_frame() erase call would quietly bite
# the bottom two thirds off the name on screen, and the geometry never
# triggers an error, it just eats the tails of every letter. Moving the
# box down does not fix it either -- SURPRISE lifts the eyebrows by 27,
# reaching row 66, which is why BOX_Y sits where it does. The label has
# to move instead.
#
# AND IT HAS TO CHANGE FONT, which is the trap this whole port kept
# springing. Positions on this screen are the smartwatch kit's numbers
# times 1.5, but a bitmap font is not a position -- it is a fixed grid of
# glyphs, and it did not scale at all. face.label() draws 16x32 here, so
# it needs 32 clear rows above BOX_Y and this lab has 54; worse, the
# widest safe row that high in a round screen is only about 114 pixels,
# and "Blink x2" in 16x32 is 128. It would not fit even if the rows were
# there. The 8x16 font needs 16 rows and 64 pixels and fits with room to
# spare, so this caption uses face.centered_text(), not face.label().
LABEL_Y = 24                            # 16 on the smartwatch kit

#                eye  brow   ms
BLINK = (
    (36,  8,  60),
    (21,  8,  40),
    (3,   8,  70),
    (21,  8,  40),
    (36,  8,   0),
)

DOUBLE_BLINK = BLINK[:-1] + BLINK   # two blinks, built from the first one

SURPRISE = (
    (36,  8,  80),
    (51, 27, 500),
    (45, 21, 180),
    (36,  8,   0),
)

DOZE_OFF = (
    (36,  3, 350),
    (26,  0, 350),
    (15, -8, 400),
    (3, -11, 900),
    (36,  3,   0),
)

ANIMATIONS = (
    ("Blink", BLINK),
    ("Blink x2", DOUBLE_BLINK),
    ("Surprise", SURPRISE),
    ("Doze off", DOZE_OFF),
)

# --- the player -------------------------------------------------------
# These four variables are the player's entire memory. It does not know
# what a blink is, or what surprise looks like. It only knows how to walk
# a list of poses in time -- which is why it can play all four animations
# above, and every animation you invent later.

playing = None
frame_index = 0
frame_started = 0
current_name = ""


def draw_frame(frame):
    """Erase the eye box, draw this pose into it, and stop. The mouth and
    the label are already correct on the glass from start(), so redrawing
    them would be pure wasted wire time -- and on this display, wasted
    wire time is the only kind of slowness there is."""
    eye_height, brow_lift, hold_ms = frame
    face.erase(BOX_X, BOX_Y, BOX_W, BOX_H)
    face.eyes(EYE_WIDTH, eye_height)
    face.eyebrows(0, 0, brow_lift)


def start(name, animation):
    """Begin an animation. Lays down the whole picture, then pose zero."""
    global playing, frame_index, frame_started, current_name
    playing = animation
    current_name = name
    frame_index = 0
    frame_started = ticks_ms()

    face.clear()
    face.mouth(face.SMILE, 69, 30)
    face.centered_text(current_name, LABEL_Y)
    draw_frame(playing[0])


def update():
    """Advance the animation if the current pose has held long enough.
    This returns instantly when there is nothing to do, so the main loop
    stays free to watch the buttons -- the lesson from lab 15, applied to
    something more interesting than a single blink."""
    global playing, frame_index, frame_started

    if playing is None:
        return

    hold_ms = playing[frame_index][2]
    if ticks_diff(ticks_ms(), frame_started) < hold_ms:
        return

    frame_index += 1
    if frame_index >= len(playing):
        playing = None      # animation finished; last pose stays on screen
        return

    frame_started = ticks_ms()
    draw_frame(playing[frame_index])


# --- the main loop ----------------------------------------------------

selected = 0
start(*ANIMATIONS[selected])

while True:
    update()

    if face.pressed(button_a):
        face.wait_for_release(button_a)
        start(*ANIMATIONS[selected])

    if face.pressed(button_b):
        face.wait_for_release(button_b)
        selected = (selected + 1) % len(ANIMATIONS)
        start(*ANIMATIONS[selected])

    sleep_ms(5)

# Things to try:
#
# 1. Make the blink slower by changing only numbers -- turn the 70 in the
#    middle of BLINK into 400. A snappy reflex becomes a heavy, tired
#    droop, and you never touched the player.
#
# 2. Notice how DOUBLE_BLINK was built: it is BLINK with its last frame
#    trimmed, glued to another BLINK. Animations made of data can be
#    combined with ordinary list operations. Build a TRIPLE_BLINK the same
#    way, in one line.
#
# 3. Add a fourth number to every frame -- a mouth width -- so the mouth
#    animates too. You will change draw_frame() once and every animation
#    gains a moving mouth at the same time. You will also need a second
#    erase box, and working out where it goes is most of the work.
#
# 4. Play an animation BACKWARD by reversing the list. Does DOZE_OFF
#    reversed read as waking up? Some motions are reversible and some are
#    not, and that is a real animation-design question.
#
# 5. Put face.clear() at the top of draw_frame() instead of face.erase().
#    Same picture, and the animation turns into a flickering slideshow.
#    That single line is the difference between this kit's display and
#    the OLED kit's -- and it costs more here than it did on the
#    smartwatch kit, because clearing this screen means sending 259,200
#    bytes instead of 115,200.
#
# 6. Set face.DEBUG_ERASE = config.RED before start() and play SURPRISE.
#    The erase box turns into a visible red rectangle with the pose drawn
#    on top, so you can watch exactly how much glass each frame repaints
#    -- and see for yourself that the caption at LABEL_Y sits safely
#    outside it.
