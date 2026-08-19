# Lab 04: Drawing Lines
# hline() and vline() take a start point plus a length; line() takes two
# full end points. Reach for hline/vline when you can -- they skip the
# angle math, and on this display they also send one run of pixels
# instead of walking the line a dot at a time.

import config

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK

display.fill(BLACK)

# top: a box built from two hlines and two vlines, with an X of general
# lines inside. It is centered, because a box in the corner of a round
# screen is a box you cannot see.
BOX_X = 105
BOX_Y = 45
BOX_W = 150
BOX_H = 105
display.hline(BOX_X, BOX_Y, BOX_W, WHITE)
display.hline(BOX_X, BOX_Y + BOX_H, BOX_W, WHITE)
display.vline(BOX_X, BOX_Y, BOX_H, WHITE)
display.vline(BOX_X + BOX_W - 1, BOX_Y, BOX_H, WHITE)
display.line(BOX_X, BOX_Y, BOX_X + BOX_W - 1, BOX_Y + BOX_H, WHITE)
display.line(BOX_X, BOX_Y + BOX_H, BOX_X + BOX_W - 1, BOX_Y, WHITE)

# bottom: an angry face made only of lines
# eyebrows angled down toward the nose -- the eyebrow rule
display.line(75, 180, 144, 218, WHITE)
display.line(285, 180, 216, 218, WHITE)
# eyes as short vertical lines
display.vline(108, 233, 39, WHITE)
display.vline(252, 233, 39, WHITE)
# a flat, unimpressed mouth
display.hline(117, 300, 126, WHITE)

# Things to try:
#
# 1. Every line above stays inside the circle. Move the mouth down to
#    y=342 and run it again -- the ends vanish under the bezel before the
#    middle does, which is the round screen's signature failure. At y=342
#    the glass is only about 78 px wide either side of center, and this
#    mouth reaches 63 px out from center in each direction, so you get to
#    watch it lose its corners first.
#
# 2. Draw the same box out at the very edge of the square (x from 0 to
#    359). You will get four arcs instead of a box, because only the
#    middles of the sides fall inside the glass.
#
# 3. Compare this file to ../smartwatch/04-lines.py. Every number here is
#    that file's number times 1.5, and the picture is identical -- a line
#    drawing scales cleanly because a line has no fixed-size parts. Lab
#    02's text labels do not, which is the difference worth remembering.
