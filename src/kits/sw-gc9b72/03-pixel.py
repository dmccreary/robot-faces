# Lab 03: Drawing Pixels
# display.pixel(x, y, color) sets exactly one dot. Every other drawing
# command is built out of pixels underneath.
#
# On this display a pixel is not on-or-off. color is a 16-bit RGB565
# number, and this kit uses two of them: WHITE (0xFFFF) and BLACK
# (0x0000). Drawing in black is still how you erase.
#
# A WARNING YOU WILL FEEL IMMEDIATELY: every pixel() call here is a
# separate conversation with the display -- set the window, send two
# bytes. On the OLED, pixel() just poked a byte in RAM and cost almost
# nothing. Run this lab and watch the dotted rulers appear one at a time.
# That visible crawl is the whole reason shapes.py works in horizontal
# runs, and it is what lab 31 measures.
#
# This screen makes the point harder than the smartwatch kit's did:
# 360x360 is 129,600 pixels where 240x240 was 57,600, so there are 2.25
# times as many chances to do it the slow way.

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
FILL = config.FILL
CENTER_X = config.CENTER_X
CENTER_Y = config.CENTER_Y

display.fill(BLACK)

# A dotted ruler across the middle: one pixel on, one pixel off.
#
# The SPACING did not scale with the screen. Everything else in this port
# got multiplied by 1.5, but "one on, one off" is a one-pixel pattern, and
# one pixel is one pixel on any panel -- so the step stays 2 and this
# ruler simply carries more dots than the smaller screen's did.
#
# The ENDS did change, and not by scaling either. The screen is round: at
# y=60 the safe circle reaches only 117 px either side of center, so the
# ruler runs 66..294 instead of out to the edge of the square.
for x in range(66, 296, 2):
    display.pixel(x, 60, WHITE)

# a dotted ruler down the left. x=45 is 135 px off center, which leaves
# just under 100 usable rows above and below the midline -- the further
# from the center line you go, the shorter every line gets on a round
# screen.
for y in range(84, 278, 2):
    display.pixel(45, y, WHITE)

# a diagonal drawn one pixel at a time
for i in range(0, 135):
    display.pixel(68 + i, 90 + i, WHITE)

# an eye with a catchlight punched out in black pixels. The eye is one
# shapes.ellipse() call -- fast, because it works in rows -- and the
# catchlight is twenty-five individual pixels, which is still fine
# because there are only twenty-five of them.
shapes.ellipse(display, 240, 210, 66, 54, WHITE, FILL)
for dy in range(5):
    for dx in range(5):
        display.pixel(213 + dx, 183 + dy, BLACK)

# Things to try:
#
# 1. Time the dotted ruler. Wrap the first loop in ticks_us() readings
#    and print the total. Then draw the same 115 dots with one hline()
#    and time that. The gap is the cost of talking to the display 115
#    times instead of once. (The smartwatch kit quotes a measured figure
#    for this; that number came off a GC9A01 and is not a measurement of
#    this panel. Run it and get your own.)
#
# 2. Draw the catchlight with a single fill_rect(213, 183, 5, 5, BLACK)
#    instead of twenty-five pixel() calls. Same picture, one trip down
#    the wire.
#
# 3. Push the horizontal ruler out to range(30, 330, 2) -- the numbers
#    you get by scaling the smartwatch kit's ruler straight across. The
#    dots at both ends disappear under the bezel, because scaling a
#    coordinate on a round screen moves it toward a rim that a square
#    screen does not have.
