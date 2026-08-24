# Lab 07: Drawing Circles
# A circle is just an ellipse with equal horizontal and vertical radii,
# so shapes.circle() is a two-line wrapper around shapes.ellipse().
#
# This lab draws all four combinations of background and fill so you can
# compare them at once -- and it is laid out in a diamond rather than a
# 2x2 grid, because the four corners of a 2x2 grid on a round screen are
# exactly the four places you cannot see.
#
# COMING FROM THE SMARTWATCH KIT: RADIUS and OFFSET are that kit's 26 and
# 58 multiplied by 1.5, and the white patch is 12 px wider than its circle
# instead of 8. The ring at the bottom of the file needed no change at all,
# because it was never written as a number -- it asks config for
# SAFE_RADIUS, so it moved from 112 out to 168 by itself. That is the
# argument for naming a constant instead of typing a literal, and this
# port is what makes the argument.

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

CENTER_X = config.CENTER_X
CENTER_Y = config.CENTER_Y
RADIUS = 39                 # 26 on the smartwatch kit
OFFSET = 87                 # 58 on the smartwatch kit
PATCH = 12                  # 8 on the smartwatch kit -- how much wider the
                            # white background patch is than the circle on it

display.fill(BLACK)

# top: white circle outline on black
shapes.circle(display, CENTER_X, CENTER_Y - OFFSET, RADIUS, WHITE, NO_FILL)

# bottom: white filled circle on black
shapes.circle(display, CENTER_X, CENTER_Y + OFFSET, RADIUS, WHITE, FILL)

# left: black circle outline on a white patch
shapes.circle(display, CENTER_X - OFFSET, CENTER_Y, RADIUS + PATCH,
              WHITE, FILL)
shapes.circle(display, CENTER_X - OFFSET, CENTER_Y, RADIUS, BLACK, NO_FILL)

# right: black filled circle on a white patch
shapes.circle(display, CENTER_X + OFFSET, CENTER_Y, RADIUS + PATCH,
              WHITE, FILL)
shapes.circle(display, CENTER_X + OFFSET, CENTER_Y, RADIUS, BLACK, FILL)

# The one shape a round display was made for: a ring that follows the rim.
# Three pixels thick rather than the smartwatch kit's two -- one pixel is
# the same physical hairline it always was, but it now has to read across
# a 50% wider circle.
shapes.ring(display, CENTER_X, CENTER_Y, config.SAFE_RADIUS, WHITE, 3)

# Things to try:
#
# 1. Push OFFSET from 87 up to 120 and run it again. The circles start
#    crossing the safe ring, and each one loses its outer edge first. The
#    two with white patches cross it before the other two do, because a
#    patch reaches PATCH pixels further out than the circle drawn on it.
#    Keep pushing and they leave the glass entirely.
#
# 2. Work out the largest RADIUS a circle at OFFSET=87 can have before it
#    touches the safe ring. (Add the two numbers and compare with
#    config.SAFE_RADIUS.) Check your answer on the glass. Then do it again
#    for the two circles that sit on a patch, which need RADIUS + PATCH to
#    fit instead of RADIUS.
#
# 3. config.SAFE_RADIUS is an estimate, not a measurement -- it was scaled
#    from the smartwatch kit's panel and has not been checked against this
#    bezel. The ring this lab draws is the measuring tool: look at it on
#    real hardware and nudge SAFE_RADIUS in config.py in or out until the
#    ring just clears the rim. Every other lab in the kit inherits your
#    answer.
