# Lab 06: Ellipse and Quadrant Fill Codes
# shapes.ellipse(display, x, y, horz_radius, vert_radius, color, fill_flag,
#                quad_code)
#
# The optional quad_code restricts drawing to one or more quarters of the
# ellipse: 1=top-right, 2=top-left, 4=bottom-left, 8=bottom-right. Add the
# numbers together to combine quarters. Those are the same numbers the
# OLED used, and they still mean the same thing.
#
# WHAT CHANGED: the call now starts with shapes.ellipse(display, ... )
# instead of oled.ellipse( ... ). The GC9A01 driver has no ellipse at all.
# framebuf's version was compiled into the MicroPython firmware; this one
# is written in MicroPython, in shapes.py, and you can open it and read
# the whole thing. Do that at some point -- it is fifty lines, and one of
# them is the ellipse equation you already know.

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT

display.fill(BLACK)
display.text(FONT, "Ellipse+Quadrants", 52, 20, WHITE, BLACK)

# a plain filled ellipse for reference
shapes.ellipse(display, 120, 70, 36, 22, WHITE, FILL)

# four quadrant fill codes, drawn as outlines so each arc stands out
QUADRANTS = (
    (3, "top half"),
    (12, "bottom half"),
    (6, "left half"),
    (9, "right half"),
)

x = 54
for code, name in QUADRANTS:
    shapes.ellipse(display, x, 140, 20, 20, WHITE, NO_FILL, code)
    display.text(FONT, str(code), x - 8, 170, WHITE, BLACK)
    x += 44

display.text(FONT, "3=frown 12=smile", 56, 200, WHITE, BLACK)

# Things to try:
#
# 1. Codes 3 and 12 are the two that matter for a face: 3 is the frown,
#    12 is the smile. Two characters apart in the code, opposite feelings
#    on the robot's face. Lab 25 plants that exact bug on purpose.
#
# 2. Open shapes.py and find the loop in ellipse(). It walks one row at a
#    time and draws a horizontal run. Change the fill branch to use
#    display.pixel() in a loop instead and run this lab again -- the same
#    picture, drawn visibly slower.
