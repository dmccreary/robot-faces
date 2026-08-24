# Lab 08: Drawing Polygons
# shapes.poly(display, x, y, point_array, color, fill_flag) draws any
# shape you can list points for. point_array is an array('h', [x0,y0,
# x1,y1, ...]) of signed shorts, so the offsets can be negative and the
# range is plenty for a 360x360 display.
#
# The OLED kit used array('B') -- unsigned bytes, max 255. That still fit
# the smartwatch kit's 240 px screen. It does NOT fit this one: an
# absolute x here can be 359, which an unsigned byte cannot hold. And half
# the offsets below are negative, which an unsigned byte cannot hold
# either. 'h' is a signed 16-bit short, good from -32,768 to 32,767, so
# the storage type stops being something you have to think about at all.
#
# HOW THE FILL WORKS: shapes.poly() has to fill polygons itself, since
# this driver cannot. It uses a scanline fill -- for each row, find where
# the edges cross it, sort the crossings, fill between them in pairs.
# Open lib/shapes.py and read it; it is the same algorithm every 2-D
# graphics library on earth uses, and it fits on one screen.
#
# COMING FROM THE SMARTWATCH KIT: every offset in every point array below,
# and every position they are placed at, is that kit's number multiplied
# by 1.5 and rounded. The caption is the exception -- the font is a fixed
# 8x16 bitmap, so "poly()" is still 48 px wide and gets re-centered on 180
# rather than scaled.

import config
import shapes
from array import array

display = config.init_display()
ON = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT

CENTER_X = config.CENTER_X          # 180

display.fill(BLACK)

CAPTION = "poly()"
display.text(FONT, CAPTION, CENTER_X - (len(CAPTION) * FONT.WIDTH) // 2, 24,
             ON, BLACK)

# Every shape below is written as offsets from a center point, then
# placed by moving that center. Same array, four positions.
TRIANGLE = array('h', [0, -33, 30, 24, -30, 24])
PENTAGON = array('h', [0, -33, 32, -11, 20, 27, -20, 27, -32, -11])
HEXAGON = array('h', [-17, -29, 17, -29, 33, 0, 17, 29, -17, 29, -33, 0])
STAR = array('h', [0, -36, 9, -12, 35, -12, 14, 5, 21, 30,
                   0, 15, -21, 30, -14, 5, -35, -12, -9, -12])

# row one: filled on the left, outlined on the right
shapes.poly(display, 117, 93, TRIANGLE, ON, FILL)
shapes.poly(display, 243, 93, TRIANGLE, ON, NO_FILL)

# row two
shapes.poly(display, 90, 183, PENTAGON, ON, FILL)
shapes.poly(display, CENTER_X, 183, HEXAGON, ON, FILL)
shapes.poly(display, 270, 183, PENTAGON, ON, NO_FILL)

# row three
shapes.poly(display, 117, 279, STAR, ON, FILL)
shapes.poly(display, 243, 279, STAR, ON, NO_FILL)

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
#    this display, which one is cheaper depends entirely on the shape --
#    and scaling changed the balance, because a star 1.5x wider covers
#    1.5x as many rows but still has the same ten edges.
#
# 4. Each star in row three reaches furthest from the screen's center at
#    its outer lower point -- about 154 px out, against a SAFE_RADIUS of
#    168. Work out how much bigger you could scale STAR before that point
#    slides under the bezel, then check your answer on the glass. It is
#    less headroom than it looks: growing a shape that is already off to
#    one side pushes its far corner outward faster than it grows the
#    shape, which is exactly the trap this whole port had to watch for.
