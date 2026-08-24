# Lab 05: Drawing Rectangles
# This driver splits what framebuf combined. rect() always draws an
# outline and takes no fill flag; fill_rect() draws the solid block:
#
#     display.rect(x, y, w, h, color)              <- outline only
#     display.fill_rect(x, y, w, h, color)         <- solid
#
# There is still no "erase" command. Drawing in black is erasing, and on
# this display fill_rect(..., BLACK) is the fastest eraser you have --
# it is the one call that sends a long run of identical pixels.

import config

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK

display.fill(BLACK)

# A border. On a round screen a rectangular border gets its corners
# clipped, so this one is pulled well inside the safe radius.
#
# Watch how tight that is. A square's corner sits its half-width times
# 1.414 from the center, so this 232 px box has corners 164 px out and
# the safe circle is 168. Straight-scaling the smartwatch kit's border
# (40,40,160,160 becomes 60,60,240,240) would put those corners at 170,
# just past the ring -- so the width is 232 here, not 240. Corners cost
# more than sides do.
display.rect(64, 64, 232, 232, WHITE)

# a retro blocky face: square eye sockets with a filled pupil inside each
display.rect(90, 120, 72, 60, WHITE)
display.fill_rect(114, 138, 24, 24, WHITE)

display.rect(198, 120, 72, 60, WHITE)
display.fill_rect(222, 138, 24, 24, WHITE)

# a wide filled mouth bar with black teeth erased out of it
display.fill_rect(99, 225, 162, 36, WHITE)
for tooth_x in range(132, 261, 30):
    display.fill_rect(tooth_x, 225, 9, 36, BLACK)

# Things to try:
#
# 1. Widen the border to display.rect(15, 15, 330, 330, WHITE) and run it
#    again. The corners disappear and you are left with four arcs -- they
#    land 233 px from the center and the glass stops at 180.
#
# 2. Erase just the mouth: fill_rect(99, 225, 162, 36, BLACK). One call
#    takes it back, and nothing else on screen moves. That is the trick
#    lab 29 is built on. Note the eraser has to match the thing it
#    erases: 162x36, not the smartwatch kit's 108x24. An erase box that
#    is a size behind is the classic source of leftover smears on a
#    display with no frame buffer.
