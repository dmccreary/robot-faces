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
# Notice what is NOT in the show() function below: a call to show().
# There isn't one on this display. face.clear() paints black, the drawing
# calls go straight to the glass, and that is the whole cycle.

import face
from utime import sleep

# The names below come from face.py. Nothing is redefined here -- if you
# ever want to change how an eyebrow is drawn, there is now exactly one
# place to change it, and every lab gets the fix.


def happy():
    face.eyes(24, 24)
    face.eyebrows(0, 0, lift=5)
    face.mouth(face.SMILE, 50, 24)


def sad():
    face.eyes(22, 22)
    face.eyebrows(-7, -7, lift=0)
    face.mouth(face.FROWN, 40, 20)


def surprised():
    face.eyes(32, 32)
    face.eyebrows(0, 0, lift=14)
    face.mouth(face.OPEN, 20, 26)


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
# 2. Open face.py and change EYE_SPACING from 48 to 60. Run this lab
#    again. One edit moved the eyes on every expression at once. That is
#    what abstraction buys you. (Go too far and the eyes start hitting the
#    bezel, which is the round screen reminding you it has opinions.)
#
# 3. Break it on purpose: change face.EYE_Y to 220 and run again. Because
#    every expression shares one definition, every expression breaks the
#    same way -- which also makes the bug easy to find. Change it back.
#
# 4. Compare this lab's file size to lab 19's. Same three expressions,
#    a fifth of the code, and every one of the numbers you can still see
#    is a number about FEELING rather than about pixels.
