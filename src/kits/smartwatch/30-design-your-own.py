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
#                     reads sleepy or angry. Keep eye_rx under about 34
#                     or the eyes start disappearing under the bezel.
#   brow_L / brow_R   inner ends angle DOWN when positive; two different
#                     values give you a skeptical, lopsided brow
#   lift              raises both brows; big lift reads as surprise
#   mouth style       face.SMILE, FROWN, FLAT, OPEN, SMIRK, or SNEER
#   size_x / size_y   how wide and how deeply curved the mouth is
#   color             config.color565(r, g, b), or config.WHITE
#
# ABOUT THAT LAST COLUMN. Pick the color LAST, after the shape already
# works. Step 3 below will test whether it helped, and you cannot answer
# that question if the color was there from the start -- you will have
# been tuning both at once and will not know which one is doing the work.
#
# One row is filled in as a worked example. Replace it if you like, but
# study it first: "Proud" is a small confident smile with the brows lifted
# and the eyes relaxed -- pleased, but not surprised.
#
#            name    eye_rx eye_ry brow_L brow_R lift  mouth        x   y  color
MY_EMOTIONS = [
    ("Proud",        24,    19,    0,     0,     7,  face.SMILE,  38, 14,
     config.color565(255, 200, 90)),

    # TODO: your first emotion. Start by copying the row above and
    # changing ONE column at a time, looking after each change.
    # ("Confused",   24,    27,   -10,    7,     5,  face.SMIRK,  28,  0,
    #  config.color565(180, 200, 255)),

    # TODO: your second emotion. Make it one that could be confused with
    # your first, then push them apart until a tester can tell them apart.
    # ("Shy",        19,    17,    0,     0,     0,  face.SMILE,  24, 10,
    #  config.color565(255, 170, 200)),
]

# ---------------------------------------------------------------------
# STEP 3: Run the readability test -- as a controlled experiment.
#
# Every face gets shown to your tester in three stages, and button A
# moves to the next one:
#
#   1. SHAPE ONLY   the face in plain white, no label. Ask what the robot
#                   is feeling. Write down their exact word.
#   2. WITH COLOR   the same face, same shapes, in your chosen color, no
#                   label. Ask again. Write down that word too.
#   3. REVEAL       the name you intended.
#
# Only ONE thing changed between stage 1 and stage 2, which is what makes
# this an experiment instead of a demo. Three outcomes are possible, and
# all three teach you something:
#
#   The word got CLOSER to what you intended. Color reinforced a shape
#   that was already nearly right. This is the win, and it is real.
#
#   The word did not change. Your shapes were carrying the meaning on
#   their own. Keep the color if you like it -- but know it is decoration
#   here, not communication.
#
#   The word got WORSE, or they hesitated. Usually the color is too dark
#   to read across the room, or it is fighting the expression -- a warm
#   cheerful yellow on a frown confuses people. Fix the shape first.
#
# Test at least three people. If two of them say something you did not
# intend at stage 1, the expression needs work, and their wrong word is
# your best clue about which feature is misleading them. Do not reach for
# color to paper over it.
#
# A round screen helps you here, and it is worth knowing why. With no
# corners and no rectangular frame, there is nothing in the picture
# except the face -- so whatever your tester reads, they read from the
# expression alone.

SHAPE_ONLY = 0
WITH_COLOR = 1
REVEAL = 2

STAGE_NAMES = ("shape only, no color", "same shape, with color", "revealed")


def draw_emotion(row, stage):
    (name, eye_rx, eye_ry, brow_l, brow_r, lift,
     style, size_x, size_y, color) = row

    # Stage 1 deliberately throws the color away. Same geometry, same
    # every other number -- one variable changed at a time.
    ink = config.WHITE if stage == SHAPE_ONLY else color

    face.clear()
    face.set_color(ink)
    face.eyes(eye_rx, eye_ry)
    face.eyebrows(brow_l, brow_r, lift)
    face.mouth(style, size_x, size_y)

    if stage == REVEAL:
        face.label(name, color=config.WHITE)
        print("intended:", name, row[1:])
    else:
        print(STAGE_NAMES[stage], "-- what do they say it is?")


if len(MY_EMOTIONS) == 0:
    raise ValueError("Add at least one row to MY_EMOTIONS before running")

index = 0
stage = SHAPE_ONLY
draw_emotion(MY_EMOTIONS[index], stage)

while True:
    if face.pressed(button_a):
        face.wait_for_release(button_a)
        stage += 1
        if stage > REVEAL:
            index = (index + 1) % len(MY_EMOTIONS)
            stage = SHAPE_ONLY
        draw_emotion(MY_EMOTIONS[index], stage)

    if face.pressed(button_b):
        face.wait_for_release(button_b)
        index = (index - 1) % len(MY_EMOTIONS)
        stage = SHAPE_ONLY
        draw_emotion(MY_EMOTIONS[index], stage)

    sleep_ms(10)

# ---------------------------------------------------------------------
# STEP 4: Check your work against this list before calling it finished.
#
# | Check                                              | Done? |
# |----------------------------------------------------|-------|
# | I wrote the design brief in words before coding    |       |
# | Each emotion is ONE row of data, not a function    |       |
# | I used only face.py parts, no raw shapes calls     |       |
# | Every part of the face is inside the circle        |       |
# | Three testers named the emotion at STAGE 1, with   |       |
# | no color at all                                    |       |
# | I can say which single feature carries the meaning |       |
# | It still reads correctly from across the room      |       |
# | My color has enough green in it to stay bright     |       |
# | The emotion still reads for a color-blind tester   |       |
#
# Those last two are not decoration rules, they are engineering ones.
#
# Your eye takes most of its sense of brightness from green light and
# almost none from blue, so a face in pure blue is a dark face however
# vivid the number looks in the code. Lab 32 shows you the arithmetic.
#
# And roughly one boy in twelve has a red-green color deficiency. If red
# means angry and green means happy on your robot, it says nothing at all
# to somebody in most classrooms. That is not a rare edge case you can
# postpone -- it is a design constraint, and the fix is free: make the
# SHAPE carry the meaning and let the color agree with it. If your face
# passed stage 1, you already did this.
#
# Where to take it next, using the labs you already have:
#
# - Lab 27: give your emotion an entrance animation. A feeling that
#   arrives over 300 ms reads far more alive than one that snaps on --
#   and lab 29 taught you how to make that animation smooth on a display
#   with no frame buffer.
# - Lab 28: add it as a state, so the robot can arrive at your emotion
#   on its own instead of waiting for a button.
# - Lab 21: rename your finished program main.py and the robot wears your
#   expression the moment it gets power, with no computer attached.
#
# That last one is worth stopping to appreciate. You started this kit by
# blinking a backlight. You are finishing it with a robot that has a face
# of your own design on a real smartwatch screen, a personality with a
# memory, and opinions about being poked -- and every part of it is
# something you can explain, measure, and fix. That is the superpower. Go
# build something with it.
