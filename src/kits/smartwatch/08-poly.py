# Lab 08: Drawing Polygons
# shapes.poly(display, x, y, point_array, color, fill_flag) draws any
# shape you can list points for. point_array is an array('h', [x0,y0,
# x1,y1, ...]) of signed shorts, so the offsets can be negative and the
# range is plenty for a 240x240 display.
#
# The OLED kit used array('B') -- unsigned bytes, max 255 -- which still
# fits this screen. 'h' is the safer habit once shapes start being placed
# relative to a center point, because half of those offsets are negative.
#
# HOW THE FILL WORKS: shapes.poly() has to fill polygons itself, since
# this driver cannot. It uses a scanline fill -- for each row, find where
# the edges cross it, sort the crossings, fill between them in pairs.
# Open shapes.py and read it; it is the same algorithm every 2-D graphics
# library on earth uses, and it fits on one screen.

import config
import shapes
from array import array

display = config.init_display()
ON = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT

CENTER_X = config.CENTER_X

display.fill(BLACK)
display.text(FONT, "poly()", 96, 16, ON, BLACK)

# Every shape below is written as offsets from a center point, then
# placed by moving that center. Same array, four positions.
TRIANGLE = array('h', [0, -22, 20, 16, -20, 16])
PENTAGON = array('h', [0, -22, 21, -7, 13, 18, -13, 18, -21, -7])
HEXAGON = array('h', [-11, -19, 11, -19, 22, 0, 11, 19, -11, 19, -22, 0])
STAR = array('h', [0, -24, 6, -8, 23, -8, 9, 3, 14, 20,
                   0, 10, -14, 20, -9, 3, -23, -8, -6, -8])

# row one: filled on the left, outlined on the right
shapes.poly(display, 78, 62, TRIANGLE, ON, FILL)
shapes.poly(display, 162, 62, TRIANGLE, ON, NO_FILL)

# row two
shapes.poly(display, 60, 122, PENTAGON, ON, FILL)
shapes.poly(display, 120, 122, HEXAGON, ON, FILL)
shapes.poly(display, 180, 122, PENTAGON, ON, NO_FILL)

# row three
shapes.poly(display, 78, 186, STAR, ON, FILL)
shapes.poly(display, 162, 186, STAR, ON, NO_FILL)

# Things to try:
#
# 1. A polygon is the one shape here that can point in a direction, which
#    makes it the right tool for a curved, angled eyebrow. Lab 14 uses it
#    for exactly that.
#
# 2. Add a point to STAR and see what happens. Scanline fill does not
#    care how many points you give it, or whether the shape is convex --
#    but it does assume the outline does not cross itself. Make it cross
#    itself on purpose and look at the result.
#
# 3. Time the filled star against the outlined one. The fill sends one
#    hline per row it covers; the outline sends one line() per edge. On
#    this display, which one is cheaper depends entirely on the shape.
