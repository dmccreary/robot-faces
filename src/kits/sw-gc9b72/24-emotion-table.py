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
# Lab 19 needs about 50 lines to define seven emotions. The table below
# does it in eight, and an eighth emotion costs one more line -- no new
# code at all.

import config
import face

button_a, button_b = config.init_buttons()

# --- one more column --------------------------------------------------
#
# The table below gained a COLOR column, and that is the whole point of
# this paragraph. Adding it required no new drawing code, no new
# function, and no change to draw_emotion() beyond unpacking one more
# name. That is what "the numbers are the real content" buys you: a
# brand-new axis of expression costs one column.
#
# The colors are built with config.color565(red, green, blue), which
# takes three ordinary 0-255 values. Lab 32 takes that function apart and
# shows you what it does to them.
#
# Note that the color column did NOT change when this kit's labs were
# scaled up from the smartwatch kit's 240x240 panel to this 360x360 one.
# A coordinate is a fact about how many pixels you have; a color is not.
# Every geometry number below is 1.5 times the smartwatch kit's, and
# every color is identical.
WHITE = config.WHITE
SOFT_BLUE = config.color565(120, 170, 255)
SOFT_RED = config.color565(255, 110, 110)
VIOLET = config.color565(200, 160, 255)
LIME = config.color565(150, 230, 120)

# One row per emotion. Read the columns straight across:
#
#   name  eye_rx  eye_ry  brow_L  brow_R  lift  mouth style  size_x  size_y  color
#
# eye_rx / eye_ry are the eye's width and height. A tall eye reads as
# alert, a squashed one as angry or bored. brow_L / brow_R tilt the inner
# ends down when positive; lift raises the whole brow.
#
# The geometry numbers are roughly three and a half times the OLED kit's,
# on a screen 2.8 times as wide -- so they are not a straight
# multiplication of the width. The OLED was half as tall as it was wide,
# so its faces were squashed. Here they are not, and the vertical room a
# round screen gives back shows up in every eye_ry and size_y.
#
# Note that Contempt is deliberately left WHITE. "No color" is a design
# choice too, and a table that lets you say so is a better table.
EMOTIONS = (
    ("Happy",     36, 36,   0,   0,   8, face.SMILE, 75, 36, config.YELLOW),
    ("Sad",       33, 33, -10, -10,   0, face.FROWN, 60, 30, SOFT_BLUE),
    ("Angry",     36, 18,  18,  18,  -7, face.FLAT,  39,  0, SOFT_RED),
    ("Afraid",    47, 47, -18, -18,  11, face.OPEN,  23, 33, VIOLET),
    ("Surprised", 48, 48,   0,   0,  21, face.OPEN,  30, 39, config.CYAN),
    ("Disgusted", 33, 23,  15,  -7,  -4, face.SNEER, 45, 27, LIME),
    ("Contempt",  36, 36,   0,   0,   0, face.SMIRK, 51,  0, WHITE),
    # ("Bored",   36, 15,   0,   0, -10, face.FLAT,  42,  0, config.GREEN),
)


def draw_emotion(row):
    """Draw ANY row from the table above. This is the only drawing code in
    the lab -- the seven expressions are data, not seven functions."""
    (name, eye_rx, eye_ry, brow_l, brow_r, lift,
     style, size_x, size_y, color) = row

    face.clear()
    face.set_color(color)
    face.eyes(eye_rx, eye_ry)
    face.eyebrows(brow_l, brow_r, lift)
    face.mouth(style, size_x, size_y)
    face.label(name, color=WHITE)   # the caption stays white, always

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
# 2. Make "Sad" sadder by editing only its numbers -- try eye_ry 26 and
#    brow tilt -18. You are tuning a face the way a designer would, by
#    changing values instead of rewriting code.
#
# 3. Give one emotion a lopsided brow: set brow_L to 18 and brow_R to -10
#    on Contempt and see how much a single mismatched eyebrow changes the
#    meaning.
#
# 4. Sort the table so the emotions run from most positive to most
#    negative. Because they are data, sorting the menu is just reordering
#    lines -- something that would be a real edit in lab 19.
#
# 5. Push one emotion's eye_rx up until the eyes touch the bezel. Write
#    down the number. That is the widest eye this screen can hold at
#    face.EYE_SPACING, and it is a fact about the hardware, not the code.
#    You can predict it before you measure it: an eye centered
#    face.EYE_SPACING (72) px off the axis and face.EYE_Y (153) px down
#    sits 77 px from the center of the glass, so it runs out of room at
#    about face.SAFE_RADIUS - 77 = 91. Run it and see how close that
#    guess lands -- SAFE_RADIUS is itself an estimate on this kit.
#
# 6. Set every color in the table to WHITE and step through the menu
#    again. Can you still tell the seven emotions apart? You should be
#    able to -- the shapes were doing that work before the colors
#    existed. Color is allowed to REINFORCE an expression. It must never
#    be the only thing carrying it.
#
#    Two reasons that rule is not fussiness:
#
#    Roughly one boy in twelve has a red-green color deficiency, so an
#    angry-red-versus-happy-green scheme fails for someone in most
#    classrooms. And color survives a photograph, a video call, and a
#    bright window far worse than a shape does.
#
# 7. Try config.BLUE (pure 0x001F) on one emotion, then SOFT_BLUE, and
#    look at them from across the room. Pure blue is startlingly dim.
#    Your eye gets most of its brightness from green light and almost
#    none from blue, so a "blue" face is a dark face. That is why the
#    colors above are pale mixes rather than pure channels -- every one
#    of them has plenty of green in it.
#
# 8. Add a color column to lab 28's POSES table the same way, so the
#    robot's mood changes hue as its state machine moves. One column,
#    again, and no new drawing code -- which is the same lesson arriving
#    for the third time.
