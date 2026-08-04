# Lab 07: Drawing Circles
# A circle is just an ellipse with equal horizontal and vertical radii,
# so shapes.circle() is a two-line wrapper around shapes.ellipse().
#
# This lab draws all four combinations of background and fill so you can
# compare them at once -- and it is laid out in a diamond rather than a
# 2x2 grid, because the four corners of a 2x2 grid on a round screen are
# exactly the four places you cannot see.

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

CENTER_X = config.CENTER_X
CENTER_Y = config.CENTER_Y
RADIUS = 26
OFFSET = 58

display.fill(BLACK)

# top: white circle outline on black
shapes.circle(display, CENTER_X, CENTER_Y - OFFSET, RADIUS, WHITE, NO_FILL)

# bottom: white filled circle on black
shapes.circle(display, CENTER_X, CENTER_Y + OFFSET, RADIUS, WHITE, FILL)

# left: black circle outline on a white patch
shapes.circle(display, CENTER_X - OFFSET, CENTER_Y, RADIUS + 8, WHITE, FILL)
shapes.circle(display, CENTER_X - OFFSET, CENTER_Y, RADIUS, BLACK, NO_FILL)

# right: black filled circle on a white patch
shapes.circle(display, CENTER_X + OFFSET, CENTER_Y, RADIUS + 8, WHITE, FILL)
shapes.circle(display, CENTER_X + OFFSET, CENTER_Y, RADIUS, BLACK, FILL)

# The one shape a round display was made for: a ring that follows the rim.
shapes.ring(display, CENTER_X, CENTER_Y, config.SAFE_RADIUS, WHITE, 2)

# Things to try:
#
# 1. Push OFFSET from 58 up to 80 and run it again. The circles start
#    crossing the rim, and each one loses its outer edge first.
#
# 2. Work out the largest RADIUS a circle at OFFSET=58 can have before it
#    touches the safe ring. (Add the two numbers and compare with
#    config.SAFE_RADIUS.) Check your answer on the glass.
