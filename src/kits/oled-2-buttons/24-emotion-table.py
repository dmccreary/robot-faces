# Lab 24: The Emotion Table -- Pattern Recognition
#
# Look hard at lab 19. It has seven functions -- draw_happy, draw_sad,
# draw_angry, and four more -- and every single one has the same three
# lines in the same order: set the eyes, set the eyebrows, set the mouth.
# Only the NUMBERS change.
#
# Spotting that is PATTERN RECOGNITION, and it pays off immediately. If
# seven functions differ only in their numbers, then the numbers are the
# real content and the function is just packaging. So put the numbers in a
# table, write the packaging once, and let one function draw all seven.
#
# Lab 19 needs about 40 lines to define seven emotions. The table below
# does it in eight, and an eighth emotion costs one more line -- no new
# code at all.

import config
import face

button_a, button_b = config.init_buttons()

# One row per emotion. Read the columns straight across:
#
#   name  eye_rx  eye_ry  brow_L  brow_R  lift  mouth style  size_x  size_y
#
# eye_rx / eye_ry are the eye's width and height. A tall eye reads as
# alert, a squashed one as angry or bored. brow_L / brow_R tilt the inner
# ends down when positive; lift raises the whole brow.
EMOTIONS = (
    ("Happy",     10, 10,  0,  0,  2, face.SMILE, 22, 12),
    ("Sad",        9,  9, -3, -3,  0, face.FROWN, 16,  8),
    ("Angry",     10,  5,  5,  5, -2, face.FLAT,  10,  0),
    ("Afraid",    13, 13, -5, -5,  3, face.OPEN,   6,  9),
    ("Surprised", 14, 14,  0,  0,  6, face.OPEN,   8, 11),
    ("Disgusted",  9,  6,  4, -2, -1, face.SNEER, 12,  7),
    ("Contempt",  10, 10,  0,  0,  0, face.SMIRK, 14,  0),
    # ("Bored",   10,  4,  0,  0, -3, face.FLAT,  12,  0),
)


def draw_emotion(row):
    """Draw ANY row from the table above. This is the only drawing code in
    the lab -- the seven expressions are data, not seven functions."""
    name, eye_rx, eye_ry, brow_l, brow_r, lift, style, size_x, size_y = row

    face.clear()
    face.eyes(eye_rx, eye_ry)
    face.eyebrows(brow_l, brow_r, lift)
    face.mouth(style, size_x, size_y)
    face.label(name)
    face.show()

    # The shell gets the row too, so you can see the data that produced
    # the picture. This is the habit lab 26 turns into a real tool.
    print("drawing", name, row[1:])


index = 0
draw_emotion(EMOTIONS[index])

while True:
    if face.pressed(button_a):
        index = (index + 1) % len(EMOTIONS)
        draw_emotion(EMOTIONS[index])
        face.wait_for_release(button_a)

    if face.pressed(button_b):
        index = (index - 1) % len(EMOTIONS)
        draw_emotion(EMOTIONS[index])
        face.wait_for_release(button_b)

# Things to try:
#
# 1. Uncomment the "Bored" row. You just added an emotion to the menu
#    without writing one line of drawing code. Now invent your own row.
#
# 2. Make "Sad" sadder by editing only its numbers -- try eye_ry 7 and
#    brow tilt -5. You are tuning a face the way a designer would, by
#    changing values instead of rewriting code.
#
# 3. Give one emotion a lopsided brow: set brow_L to 5 and brow_R to -3
#    on Contempt and see how much a single mismatched eyebrow changes the
#    meaning.
#
# 4. Sort the table so the emotions run from most positive to most
#    negative. Because they are data, sorting the menu is just reordering
#    lines -- something that would be a real edit in lab 19.
