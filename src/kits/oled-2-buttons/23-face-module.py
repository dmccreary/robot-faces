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
# Count the lines. Lab 19 spends about 55 lines defining face parts before
# it draws anything. Below, three complete expressions take nine lines,
# because face.eyes() already knows what an eye is.

import face
from utime import sleep

# The names below come from face.py. Nothing is redefined here -- if you
# ever want to change how an eyebrow is drawn, there is now exactly one
# place to change it, and every lab gets the fix.


def happy():
    face.eyes(10, 10)
    face.eyebrows(0, 0, lift=2)
    face.mouth(face.SMILE, 22, 12)


def sad():
    face.eyes(9, 9)
    face.eyebrows(-3, -3, lift=0)
    face.mouth(face.FROWN, 16, 8)


def surprised():
    face.eyes(14, 14)
    face.eyebrows(0, 0, lift=6)
    face.mouth(face.OPEN, 8, 11)


# A list of (name, function) pairs, the same shape lab 18 used for modes.
EXPRESSIONS = (
    ("Happy", happy),
    ("Sad", sad),
    ("Surprised", surprised),
)


def show(name, draw):
    """The one place that knows the clear-draw-label-show sequence. Every
    expression above trusts this function to handle it."""
    face.clear()
    draw()
    face.label(name)
    face.show()


while True:
    for name, draw in EXPRESSIONS:
        show(name, draw)
        sleep(1.5)

# Things to try:
#
# 1. Add a fourth expression. You should not need to write a single
#    oled.ellipse() call -- only face.eyes(), face.eyebrows(), and
#    face.mouth() with different numbers.
#
# 2. Open face.py and change EYE_SPACING from 26 to 34. Run this lab
#    again. One edit moved the eyes on every expression at once. That is
#    what abstraction buys you.
#
# 3. Break it on purpose: change face.EYE_Y to 60 and run again. Because
#    every expression shares one definition, every expression breaks the
#    same way -- which also makes the bug easy to find. Change it back.
