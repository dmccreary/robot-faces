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
BOX_X = 70
BOX_Y = 30
BOX_W = 100
BOX_H = 70
display.hline(BOX_X, BOX_Y, BOX_W, WHITE)
display.hline(BOX_X, BOX_Y + BOX_H, BOX_W, WHITE)
display.vline(BOX_X, BOX_Y, BOX_H, WHITE)
display.vline(BOX_X + BOX_W - 1, BOX_Y, BOX_H, WHITE)
display.line(BOX_X, BOX_Y, BOX_X + BOX_W - 1, BOX_Y + BOX_H, WHITE)
display.line(BOX_X, BOX_Y + BOX_H, BOX_X + BOX_W - 1, BOX_Y, WHITE)

# bottom: an angry face made only of lines
# eyebrows angled down toward the nose -- the eyebrow rule
display.line(50, 120, 96, 145, WHITE)
display.line(190, 120, 144, 145, WHITE)
# eyes as short vertical lines
display.vline(72, 155, 26, WHITE)
display.vline(168, 155, 26, WHITE)
# a flat, unimpressed mouth
display.hline(78, 200, 84, WHITE)

# Things to try:
#
# 1. Every line above stays inside the circle. Move the mouth down to
#    y=228 and run it again -- the ends vanish under the bezel before the
#    middle does, which is the round screen's signature failure.
#
# 2. Draw the same box out at the very edge of the square (x from 0 to
#    239). You will get four arcs instead of a box, because only the
#    middles of the sides fall inside the glass.
