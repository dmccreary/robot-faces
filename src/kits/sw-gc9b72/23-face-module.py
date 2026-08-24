# Lab 23: The Face Module -- Decomposition and Abstraction
#
# Open lab 19 and lab 22 side by side. Both of them define draw_eye(),
# draw_eyebrow(), and a mouth function, and both definitions are nearly
# identical. Every lab that draws a face has been carrying its own copy.
#
# This lab does not add a single new drawing trick. It moves those copies
# into face.py, one file that every lab from here on imports. That move
# has a name in computer science: DECOMPOSITION, breaking a problem into
# parts small enough to name, and ABSTRACTION, hiding how a part works
# behind that name.
#
# Count the lines. Lab 19 spends about 70 lines defining face parts before
# it draws anything. Below, three complete expressions take nine lines,
# because face.eyes() already knows what an eye is.
#
# Abstraction is also what made porting this kit cheap. face.py is the
# smartwatch kit's face.py with every position and size multiplied by 1.5
# (360 / 240), and because the labs from here on ask for "eyes" instead of
# for ellipses at particular pixels, moving to a bigger screen was one
# file's worth of edits instead of a dozen labs' worth.
#
# Notice what is NOT in the show() function below: a call to show().
# There isn't one on this display. face.clear() paints black, the drawing
# calls go straight to the glass, and that is the whole cycle.

import face
from utime import sleep

# The names below come from face.py. Nothing is redefined here -- if you
# ever want to change how an eyebrow is drawn, there is now exactly one
# place to change it, and every lab gets the fix.


def happy():
    face.eyes(36, 36)
    face.eyebrows(0, 0, lift=8)
    face.mouth(face.SMILE, 75, 36)


def sad():
    face.eyes(33, 33)
    face.eyebrows(-10, -10, lift=0)
    face.mouth(face.FROWN, 60, 30)


def surprised():
    face.eyes(48, 48)
    face.eyebrows(0, 0, lift=21)
    face.mouth(face.OPEN, 30, 39)


# A list of (name, function) pairs, the same shape lab 18 used for modes.
EXPRESSIONS = (
    ("Happy", happy),
    ("Sad", sad),
    ("Surprised", surprised),
)


def show(name, draw):
    """The one place that knows the clear-draw-label sequence. Every
    expression above trusts this function to handle it."""
    face.clear()
    draw()
    face.label(name)


while True:
    for name, draw in EXPRESSIONS:
        show(name, draw)
        sleep(1.5)

# Things to try:
#
# 1. Add a fourth expression. You should not need to write a single
#    shapes.ellipse() call -- only face.eyes(), face.eyebrows(), and
#    face.mouth() with different numbers.
#
# 2. Open face.py and change EYE_SPACING from 72 to 90. Run this lab
#    again. One edit moved the eyes on every expression at once. That is
#    what abstraction buys you. (Go too far and the eyes start hitting the
#    bezel, which is the round screen reminding you it has opinions.)
#
# 3. Break it on purpose: change face.EYE_Y to 330 and run again. Because
#    every expression shares one definition, every expression breaks the
#    same way -- which also makes the bug easy to find. Change it back.
#
# 4. Compare this lab's file size to lab 19's. Same three expressions,
#    a fifth of the code, and every one of the numbers you can still see
#    is a number about FEELING rather than about pixels.
#
# 5. The label is the one part of this lab the extra pixels did not make
#    bigger. Fonts are fixed bitmaps -- 8x16 and 16x32 glyphs baked into
#    lib/ -- so a wider screen makes text proportionally SMALLER, not
#    larger. face.label() answers that by drawing in the 16x32 font.
#    Call face.text("Happy", 100, 200) somewhere and compare: the same
#    word, half the size, on a screen with 2.25 times the pixels.
