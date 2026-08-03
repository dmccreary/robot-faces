# Lab 30: Design Your Own Emotion -- The Capstone
#
# This is the last lab, and it is the only one that does not tell you what
# to draw. You are going to invent expressions nobody in this kit has
# drawn before, and then find out whether a stranger can read them.
#
# That last part is the real test. A robot face is not art you look at --
# it is a message you send. If the person standing next to your robot
# cannot tell proud from confused, the expression does not work yet, no
# matter how good it looks to you. Communicating a feeling that lands
# correctly in someone else's head is the whole superpower.
#
# Use all four habits this kit has been building:
#
#   DECOMPOSITION      break the feeling into eyes, eyebrows, and mouth,
#                      and decide what each part does before you code
#   PATTERN RECOGNITION add a row to the table -- do not write a new
#                      function, because you already know it would look
#                      like all the others
#   ABSTRACTION        build only from face.py's parts, so your emotion
#                      inherits every fix and change the module ever gets
#   DEBUGGING          when it does not read right, change ONE number,
#                      look, and change one more
#
# ---------------------------------------------------------------------
# STEP 1: Fill in the design brief, in words, before you touch a number.
#
#   My emotion is: ................ (proud? confused? shy? suspicious?)
#   The eyes are:  ................ (wide? narrow? looking away?)
#   The eyebrows:  ................ (raised? one up? angled down?)
#   The mouth is:  ................ (smile? flat? open? off to one side?)
#   The closest emotion it might be confused with is: ................
#   and I will keep them apart by: ................
#
# Writing that down first is not busywork. It is the decomposition step,
# and skipping it is why most first attempts read as "generic robot".
#
# ---------------------------------------------------------------------
# STEP 2: Turn each line of the brief into a number in the table below.

import config
import face
from utime import sleep_ms

button_a, button_b = config.init_buttons()

# The column format from lab 24. As a reminder:
#
#   eye_rx / eye_ry   eye width and height -- tall reads alert, flat
#                     reads sleepy or angry
#   brow_L / brow_R   inner ends angle DOWN when positive; two different
#                     values give you a skeptical, lopsided brow
#   lift              raises both brows; big lift reads as surprise
#   mouth style       face.SMILE, FROWN, FLAT, OPEN, SMIRK, or SNEER
#   size_x / size_y   how wide and how deeply curved the mouth is
#
# One row is filled in as a worked example. Replace it if you like, but
# study it first: "Proud" is a small confident smile with the brows lifted
# and the eyes relaxed -- pleased, but not surprised.
#
#            name    eye_rx eye_ry brow_L brow_R lift  mouth        x   y
MY_EMOTIONS = [
    ("Proud",        10,    8,     0,     0,     3,  face.SMILE,  16,  7),

    # TODO: your first emotion. Start by copying the row above and
    # changing ONE column at a time, looking after each change.
    # ("Confused",   10,   11,    -4,     3,     2,  face.SMIRK,  12,  0),

    # TODO: your second emotion. Make it one that could be confused with
    # your first, then push them apart until a tester can tell them apart.
    # ("Shy",        8,     7,     0,     0,     0,  face.SMILE,  10,  4),
]

# ---------------------------------------------------------------------
# STEP 3: Run the readability test.
#
# The face appears with NO label. Ask someone who has not seen your code
# what the robot is feeling, and write down their exact word. THEN press
# button A to reveal the name you intended. Button B goes back.
#
# Test at least three people. If two of them say something you did not
# intend, the expression needs work -- and their wrong word is your best
# clue about which feature is misleading them.


def draw_emotion(row, reveal):
    name, eye_rx, eye_ry, brow_l, brow_r, lift, style, size_x, size_y = row

    face.clear()
    face.eyes(eye_rx, eye_ry)
    face.eyebrows(brow_l, brow_r, lift)
    face.mouth(style, size_x, size_y)
    if reveal:
        face.label(name)
    face.show()

    if reveal:
        print("intended:", name, row[1:])
    else:
        print("showing an unlabeled face -- what do they say it is?")


if len(MY_EMOTIONS) == 0:
    raise ValueError("Add at least one row to MY_EMOTIONS before running")

index = 0
revealed = False
draw_emotion(MY_EMOTIONS[index], revealed)

while True:
    if face.pressed(button_a):
        face.wait_for_release(button_a)
        if revealed:
            index = (index + 1) % len(MY_EMOTIONS)
            revealed = False
        else:
            revealed = True
        draw_emotion(MY_EMOTIONS[index], revealed)

    if face.pressed(button_b):
        face.wait_for_release(button_b)
        index = (index - 1) % len(MY_EMOTIONS)
        revealed = False
        draw_emotion(MY_EMOTIONS[index], revealed)

    sleep_ms(10)

# ---------------------------------------------------------------------
# STEP 4: Check your work against this list before calling it finished.
#
# | Check                                              | Done? |
# |----------------------------------------------------|-------|
# | I wrote the design brief in words before coding    |       |
# | Each emotion is ONE row of data, not a function    |       |
# | I used only face.py parts, no raw oled calls       |       |
# | Three testers named the emotion without a label    |       |
# | I can say which single feature carries the meaning |       |
# | It still reads correctly from across the room      |       |
#
# Where to take it next, using the labs you already have:
#
# - Lab 27: give your emotion an entrance animation. A feeling that
#   arrives over 300 ms reads far more alive than one that snaps on.
# - Lab 28: add it as a state, so the robot can arrive at your emotion
#   on its own instead of waiting for a button.
# - Lab 21: rename your finished program main.py and the robot wears your
#   expression the moment it gets power, with no computer attached.
#
# That last one is worth stopping to appreciate. You started this kit by
# blinking one LED. You are finishing it with a robot that has a face of
# your own design, a personality with a memory, and opinions about being
# poked -- and every part of it is something you can explain, measure, and
# fix. That is the superpower. Go build something with it.
