# Lab 25: Five Broken Faces -- Debugging
#
# Every face below is broken on purpose, each by one bug that real people
# make on this exact hardware all the time. Your job is to fix all five.
#
# Debugging is a skill, and it has a method. Guessing and editing random
# lines is not it. Do this instead, for each face:
#
#   1. READ the docstring. It says what the face is SUPPOSED to look like.
#   2. PREDICT what you think will happen before you press the button.
#   3. OBSERVE what actually happens, and describe the difference out loud
#      in one sentence: "it should smile but it frowns."
#   4. LOCATE the smallest piece of code that could cause that difference.
#   5. FIX one thing, then run it again. One change at a time -- if you
#      change three lines and it works, you have not learned which one
#      mattered.
#
# The symptom table at the bottom of this file is your lookup key. Try to
# solve each face before you read it.
#
# check-labs: allow-offscreen  -- bug 3 draws off the top on purpose, so
# src/utils/check-labs.py must not report it as a mistake.
#
# Button A goes to the next face, button B goes back. The bug number is
# also printed to the Thonny shell, which matters for bug 1 -- when the
# screen shows nothing at all, the shell is the only thing telling you the
# program is alive and doing what you asked.

import config
import face
from utime import sleep, sleep_ms

button_a, button_b = config.init_buttons()

oled = face.oled
WHITE = face.WHITE
BLACK = face.BLACK
FILL = face.FILL
NO_FILL = face.NO_FILL


def bug_1():
    """SHOULD SHOW: a plain happy face -- two eyes, two flat brows, and a
    wide smile. ACTUALLY SHOWS: predict it before you press A."""
    face.clear()
    face.eyes(10, 10)
    face.eyebrows(0, 0, lift=2)
    face.mouth(face.SMILE, 22, 12)
    face.label("Bug 1")


def bug_2():
    """SHOULD SHOW: one bright scanner dot sliding smoothly from the left
    edge of the screen to the right, leaving clean black behind it."""
    for x in range(6, 124, 3):
        oled.ellipse(x, 32, 5, 5, WHITE, FILL)
        face.label("Bug 2")
        face.show()
        sleep_ms(25)


BAD_EYE_Y = -4


def bug_3():
    """SHOULD SHOW: a wide-awake surprised face, eyes big and round and
    sitting in the upper half of the screen above an open mouth."""
    face.clear()
    oled.ellipse(face.LEFT_EYE_X, BAD_EYE_Y, 14, 14, WHITE, FILL)
    oled.ellipse(face.RIGHT_EYE_X, BAD_EYE_Y, 14, 14, WHITE, FILL)
    face.mouth(face.OPEN, 8, 11)
    face.label("Bug 3")
    face.show()


def bug_4():
    """SHOULD SHOW: a cheerful face whose mouth curves UP into a smile,
    matching the word printed in the corner."""
    face.clear()
    face.eyes(10, 10)
    face.eyebrows(0, 0, lift=2)
    oled.ellipse(face.HALF_WIDTH, face.MOUTH_Y, 22, 12,
                 WHITE, NO_FILL, face.TOP_HALF)
    face.label("Bug4 HAPPY")
    face.show()


def bug_5():
    """SHOULD SHOW: a face that blinks slowly AND still answers the
    buttons. Press A while this one is blinking -- the face should switch
    away right then, the way every other face in this kit does."""
    face.clear()
    face.eyes(10, 10)
    face.label("Bug 5")
    face.show()
    sleep(1.5)

    face.clear()
    face.closed_eyes()
    face.label("Bug 5")
    face.show()
    sleep(1.5)


# Each row is (symptom, function, keeps_running). The last column marks
# the faces that redraw on every pass of the main loop instead of once.
BUGS = (
    ("nothing appears", bug_1, False),
    ("the dot smears into a stripe", bug_2, False),
    ("the eyes are missing", bug_3, False),
    ("the smile is upside down", bug_4, False),
    ("the button stops working", bug_5, True),
)


def run_bug(index):
    symptom, draw, keeps_running = BUGS[index]
    print("--- Bug", index + 1, "of", len(BUGS), "--", symptom)
    # Wipe the glass first so whatever is on screen came from THIS bug and
    # not from the one before it. Good debugging starts from a known state.
    face.clear()
    face.show()
    draw()


index = 0
run_bug(index)

while True:
    if face.pressed(button_a):
        index = (index + 1) % len(BUGS)
        face.wait_for_release(button_a)
        run_bug(index)

    if face.pressed(button_b):
        index = (index - 1) % len(BUGS)
        face.wait_for_release(button_b)
        run_bug(index)

    if BUGS[index][2]:
        BUGS[index][1]()

    sleep_ms(10)


# ---------------------------------------------------------------------
# SYMPTOM TABLE -- read this only after you have tried
#
# | What you see                     | What causes it                    |
# |----------------------------------|-----------------------------------|
# | A blank screen, but the shell    | Something was drawn into the      |
# | keeps printing                   | frame buffer and never pushed to  |
# |                                  | the glass. The buffer lives in    |
# |                                  | RAM; the screen only catches up   |
# |                                  | when you say so.                  |
# |----------------------------------|-----------------------------------|
# | Old pixels stay behind and pile  | The frame buffer was never wiped  |
# | up into a smear                  | between frames. Drawing ADDS to   |
# |                                  | what is already there; it does    |
# |                                  | not replace it.                   |
# |----------------------------------|-----------------------------------|
# | A shape is cut off at the top    | A y value went off the screen. y  |
# | or the bottom                    | grows DOWNWARD here, so "higher   |
# |                                  | up" means a SMALLER y -- but      |
# |                                  | never a negative one, and never   |
# |                                  | past 63.                          |
# |----------------------------------|-----------------------------------|
# | A curve bends the wrong way      | The quadrant mask is inverted.    |
# |                                  | TOP_HALF (3) frowns, BOTTOM_HALF  |
# |                                  | (12) smiles. Two characters apart |
# |                                  | in the code, opposite feelings on |
# |                                  | the robot's face.                 |
# |----------------------------------|-----------------------------------|
# | Button presses get ignored some  | Something in the loop is blocking.|
# | of the time                      | While sleep() runs, nothing else  |
# |                                  | does -- including the button      |
# |                                  | check. Pace it with ticks_ms()    |
# |                                  | from lab 15 and the loop keeps    |
# |                                  | spinning.                         |
#
# Things to try, once all five are fixed:
#
# 1. Break one on purpose in a NEW way and hand the file to a partner.
#    Writing a bug that produces a specific symptom proves you understand
#    the cause, not just the cure.
#
# 2. Write down the symptom you saw for each bug in your own words BEFORE
#    checking the table. Naming a symptom precisely is most of the work of
#    finding its cause.
#
# 3. Bug 5 is the only one you cannot see in a screenshot -- it is a bug
#    about TIME. Those are the hardest kind, which is why lab 26 builds a
#    tool for watching them.
