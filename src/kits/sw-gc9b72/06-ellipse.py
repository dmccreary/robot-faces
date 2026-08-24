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
# instead of oled.ellipse( ... ). The GC9B72 driver has no ellipse at all.
# framebuf's version was compiled into the MicroPython firmware; this one
# is written in MicroPython, in lib/shapes.py, and you can open it and read
# the whole thing. Do that at some point -- it is fifty lines, and one of
# them is the ellipse equation you already know.
#
# COMING FROM THE SMARTWATCH KIT: every radius, spacing, and position below
# is that kit's number multiplied by 1.5, because this panel is 360 px
# across instead of 240. The TEXT is the one thing that did not scale --
# the font is a fixed 8x16 bitmap baked into lib/, so both captions here
# are exactly as wide in pixels as they were on the smaller screen, and
# their x positions have to be re-centered from scratch instead of
# multiplied. Scaling a centering offset is the classic way to end up with
# text that is off-center by half a screen.

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT
CENTER_X = config.CENTER_X          # 180

display.fill(BLACK)

# "Ellipse+Quadrants" is 17 characters, and 17 * 8 = 136 px in this font.
# Centering it is 180 - 136 // 2, which is where the smartwatch kit's 52
# came from too (120 - 136 // 2) -- same formula, different center.
#
# It stays in the SMALL font on purpose. Those same 17 characters in the
# 16x32 font would be 272 px wide, and this row sits 150 px above center,
# where the safe circle is only about 151 px across. 136 fits there with
# roughly 7 px to spare on each side; 272 would not fit anywhere on a
# 360 px round screen. Dense, wide strings stay 8x16.
TITLE = "Ellipse+Quadrants"
display.text(FONT, TITLE, CENTER_X - (len(TITLE) * FONT.WIDTH) // 2, 30,
             WHITE, BLACK)

# a plain filled ellipse for reference
shapes.ellipse(display, CENTER_X, 105, 54, 33, WHITE, FILL)

# four quadrant fill codes, drawn as outlines so each arc stands out
QUADRANTS = (
    (3, "top half"),
    (12, "bottom half"),
    (6, "left half"),
    (9, "right half"),
)

x = 81
for code, name in QUADRANTS:
    shapes.ellipse(display, x, 210, 30, 30, WHITE, NO_FILL, code)
    # The caption under each arc is one or two characters, so it gets
    # offset by half of its own width. The smartwatch kit used a fixed -8,
    # which only ever centered the two-character codes.
    caption = str(code)
    display.text(FONT, caption,
                 x - (len(caption) * FONT.WIDTH) // 2, 255, WHITE, BLACK)
    x += 66

FOOTER = "3=frown 12=smile"
display.text(FONT, FOOTER, CENTER_X - (len(FOOTER) * FONT.WIDTH) // 2, 300,
             WHITE, BLACK)

# Things to try:
#
# 1. Codes 3 and 12 are the two that matter for a face: 3 is the frown,
#    12 is the smile. Two characters apart in the code, opposite feelings
#    on the robot's face. Lab 25 plants that exact bug on purpose.
#
# 2. Open lib/shapes.py and find the loop in ellipse(). It walks one row at
#    a time and draws a horizontal run. Change the fill branch to use
#    display.pixel() in a loop instead and run this lab again -- the same
#    picture, drawn visibly slower. This screen has 2.25 times as many
#    pixels as the smartwatch kit's, so there is 2.25 times as much of
#    that slowness to watch.
#
# 3. Print the four arc positions: 81, 147, 213, 279. They are the
#    smartwatch kit's 54, 98, 142, 186 scaled by 1.5. Confirm every one of
#    them, plus its 30 px radius, is inside config.SAFE_RADIUS of the
#    center -- config.inside_circle() will tell you. Scaling a coordinate
#    always moves it AWAY from the center, which is how a layout that fit
#    on a smaller round screen can fall under the bezel on a bigger one.
