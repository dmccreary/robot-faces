# Lab 25: Five Broken Faces -- Debugging
#
# Every face below is broken on purpose, each by one bug that real people
# make on this exact hardware all the time. Your job is to fix all five.
#
# Three of the five are different bugs from the OLED kit's version, and
# that is the lesson hiding inside the lesson: change the hardware and
# you change the bugs. There is no forgotten show() here, because there
# is no show(). What replaces it are two failures that display could
# never have: work that gets erased the instant after you draw it, and a
# face drawn perfectly onto glass you cannot see.
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
# check-labs: allow-offscreen  -- bug 3 puts the eyes out where the corner
# of a rectangular display would be. On a 240x240 round screen that is two
# mistakes at once: part of each eye falls off the raster entirely, and the
# part that does not is hidden under the bezel. src/utils/check-labs.py
# must not report either as an accident.
#
# Button A goes to the next face, button B goes back. The bug number is
# also printed to the Thonny shell, which matters for bug 1 -- when the
# screen shows nothing at all, the shell is the only thing telling you the
# program is alive and doing what you asked.

import config
import face
import shapes
from utime import sleep, sleep_ms

button_a, button_b = config.init_buttons()

display = face.display
WHITE = face.WHITE
BLACK = face.BLACK
FILL = face.FILL
NO_FILL = face.NO_FILL


def bug_1():
    """SHOULD SHOW: a plain happy face -- two eyes, two brows, and a wide
    smile. ACTUALLY SHOWS: predict it before you press A.

    Every drawing call below is correct, and every one of them runs. Look
    at the shell to confirm that. Then look at the ORDER."""
    face.eyes(24, 24)
    face.eyebrows(0, 0, lift=5)
    face.mouth(face.SMILE, 50, 24)
    face.label("Bug 1")
    face.clear()


def bug_2():
    """SHOULD SHOW: one bright scanner dot sliding smoothly from the left
    side of the circle to the right, leaving clean black behind it."""
    for x in range(40, 200, 6):
        shapes.circle(display, x, 120, 10, WHITE, FILL)
        face.label("Bug 2")
        sleep_ms(25)


# Where you would put the eyes if you were laying out a RECTANGULAR
# 240x240 display: a comfortable margin in from the top two corners.
BAD_EYE_X = 30
BAD_EYE_Y = 30


def bug_3():
    """SHOULD SHOW: a wide-awake surprised face, eyes big and round and
    sitting side by side above an open mouth.

    Every coordinate below is one the display accepts without complaint.
    That is exactly what makes this one mean -- there is no error, no
    warning, and no exception. There is just nothing there."""
    face.clear()
    shapes.ellipse(display, BAD_EYE_X, BAD_EYE_Y, 32, 32, WHITE, FILL)
    shapes.ellipse(display, config.WIDTH - BAD_EYE_X, BAD_EYE_Y, 32, 32,
                   WHITE, FILL)
    face.mouth(face.OPEN, 20, 26)
    face.label("Bug 3")


def bug_4():
    """SHOULD SHOW: a cheerful face whose mouth curves UP into a smile,
    matching the word printed at the top."""
    face.clear()
    face.eyes(24, 24)
    face.eyebrows(0, 0, lift=5)
    for offset in range(face.STROKE):
        shapes.ellipse(display, face.HALF_WIDTH, face.MOUTH_Y - offset,
                       50, 24, WHITE, NO_FILL, face.TOP_HALF)
    face.label("Bug4 HAPPY")


def bug_5():
    """SHOULD SHOW: a face that blinks slowly AND still answers the
    buttons. Press A while this one is blinking -- the face should switch
    away right then, the way every other face in this kit does."""
    face.clear()
    face.eyes(24, 24)
    face.label("Bug 5")
    sleep(1.5)

    face.clear()
    face.closed_eyes()
    face.label("Bug 5")
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
    # Undo anything the previous bug did to the hardware, then wipe the
    # glass, so whatever you see came from THIS bug and not the one
    # before it. Good debugging starts from a known state.
    #
    # set_backlight() is a no-op on a module whose BL pad is tied to 3V3,
    # which is most of them. It is here because a board that CAN dim its
    # backlight can also be left dark by an experiment, and this is the
    # one line that would rescue you.
    config.set_backlight(True)
    face.clear()
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
# | A black screen, but the shell    | TWO different causes produce this |
# | keeps printing                   | exact symptom, and telling them   |
# |                                  | apart is the skill.               |
# |                                  |                                   |
# |                                  | (a) SOMETHING ERASED YOUR WORK    |
# |                                  | AFTER YOU DREW IT. On a buffered  |
# |                                  | display the order of a clear was  |
# |                                  | hidden until show(); here every   |
# |                                  | call lands immediately, so a wipe |
# |                                  | in the wrong place wipes finished |
# |                                  | pixels off the glass. That is     |
# |                                  | bug 1, and it is in this file.    |
# |                                  |                                   |
# |                                  | (b) THE BACKLIGHT IS OFF. A       |
# |                                  | GC9A01 is a transmissive LCD: it  |
# |                                  | does not make light, it filters a |
# |                                  | lamp sitting behind it. With BL   |
# |                                  | low the pixels are set correctly  |
# |                                  | and there is nothing to see them  |
# |                                  | by. This is the number one "my    |
# |                                  | display is dead" report, and it   |
# |                                  | is not a display problem. It      |
# |                                  | cannot happen on a module whose   |
# |                                  | BL pad is tied to 3V3 -- which is |
# |                                  | most of them, including this      |
# |                                  | kit's default wiring -- so if     |
# |                                  | config.BL_PIN is None, cross it   |
# |                                  | off and look for (a).             |
# |----------------------------------|-----------------------------------|
# | Old pixels stay behind and pile  | Nothing erased the previous       |
# | up into a smear                  | frame. There is no frame buffer   |
# |                                  | here -- the glass keeps whatever  |
# |                                  | you last sent it, forever, until  |
# |                                  | you paint over it.                |
# |----------------------------------|-----------------------------------|
# | A shape is simply not there,     | It was drawn OUTSIDE THE CIRCLE.  |
# | and no error was raised          | The controller addresses a        |
# |                                  | 240x240 square, but the glass is  |
# |                                  | the circle inscribed in it. A     |
# |                                  | corner pixel is real, addressable |
# |                                  | and invisible. Nothing will warn  |
# |                                  | you. config.inside_circle(x, y)   |
# |                                  | is the check you have to run      |
# |                                  | yourself.                         |
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
# |                                  | check. On this display a slow     |
# |                                  | DRAW blocks the same way, so      |
# |                                  | face.clear() in a tight loop      |
# |                                  | causes it too. Pace it with       |
# |                                  | ticks_ms() from lab 15 and redraw |
# |                                  | only what changed, from lab 29.   |
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
# 3. Bug 3 is the round screen's signature bug, and it has a nasty
#    property: the same code on a rectangular 240x320 display would look
#    perfect. Move BAD_EYE_X and BAD_EYE_Y ten pixels at a time toward
#    the center and note exactly where each eye appears.
#
# 4. Bug 5 is the only one you cannot see in a screenshot -- it is a bug
#    about TIME. Those are the hardest kind, which is why lab 26 builds a
#    tool for watching them.
