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

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
FILL = config.FILL
CENTER_X = config.CENTER_X
CENTER_Y = config.CENTER_Y

display.fill(BLACK)

# a dotted ruler across the middle: one pixel on, one pixel off
for x in range(20, 220, 2):
    display.pixel(x, 40, WHITE)

# a dotted ruler down the middle
for y in range(50, 200, 2):
    display.pixel(30, y, WHITE)

# a diagonal drawn one pixel at a time
for i in range(0, 90):
    display.pixel(45 + i, 60 + i, WHITE)

# an eye with a catchlight punched out in black pixels. The eye is one
# shapes.ellipse() call -- fast, because it works in rows -- and the
# catchlight is nine individual pixels, which is fine because there are
# only nine of them.
shapes.ellipse(display, 160, 140, 44, 36, WHITE, FILL)
for dy in range(3):
    for dx in range(3):
        display.pixel(142 + dx, 122 + dy, BLACK)

# Things to try:
#
# 1. Time the dotted ruler. Wrap the first loop in ticks_us() readings
#    and print the total. Then draw the same 100 dots with one hline()
#    and time that. The gap is the cost of talking to the display 100
#    times instead of once.
#
# 2. Draw the catchlight with a single fill_rect(142, 122, 3, 3, BLACK)
#    instead of nine pixel() calls. Same picture, one trip down the wire.
