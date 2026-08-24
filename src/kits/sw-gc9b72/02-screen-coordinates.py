# Lab 02: Screen Coordinates on a Round Display
# The coordinate system works exactly as it did on the OLED: (0,0) is the
# upper-left corner, x grows to the right, and y grows downward -- the
# opposite of a math class graph.
#
# What is new is that the upper-left corner IS NOT THERE. The GC9B72
# addresses a 360x360 square of pixels, but the glass is a circle cut out
# of that square. Pixel (0,0) is a real, addressable, paid-for pixel that
# you will never see.
#
# This lab draws proof: the four corner dots and their labels are placed
# exactly where the OLED kit put them, and then a ring shows you which of
# them survive.
#
# Note the corner numbers: the last pixel is 359, not 239. A wider screen
# does not change the rule, it only changes the number you count up to.

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
WIDTH = config.WIDTH
HEIGHT = config.HEIGHT
FONT = config.SMALL_FONT

display.fill(BLACK)

# axis lines through the CENTER, not along the edges -- on a round screen
# the edges of the square are the part you cannot see
display.hline(12, HEIGHT // 2, WIDTH - 24, WHITE)
display.vline(WIDTH // 2, 12, HEIGHT - 24, WHITE)

# The four corners of the addressable square. Watch how many appear.
#
# The dots scale with the screen (6 px became 9), but the LABELS do not:
# the font is a fixed 8x16 bitmap on every panel this kit will ever meet.
# So each label's x is computed from its real width -- len * 8 -- and not
# by scaling the smartwatch kit's number. Get this backwards and your text
# marches off the edge.
MARGIN = 12
display.fill_rect(0, 0, 9, 9, WHITE)
display.text(FONT, "0,0", MARGIN, MARGIN, WHITE, BLACK)

display.fill_rect(WIDTH - 9, 0, 9, 9, WHITE)
display.text(FONT, "359,0", WIDTH - MARGIN - 5 * FONT.WIDTH, MARGIN,
             WHITE, BLACK)

display.fill_rect(0, HEIGHT - 9, 9, 9, WHITE)
display.text(FONT, "0,359", MARGIN, HEIGHT - MARGIN - FONT.HEIGHT,
             WHITE, BLACK)

display.fill_rect(WIDTH - 9, HEIGHT - 9, 9, 9, WHITE)
display.text(FONT, "359,359", WIDTH - MARGIN - 7 * FONT.WIDTH,
             HEIGHT - MARGIN - FONT.HEIGHT, WHITE, BLACK)

# the exact center of the display, which on this screen is also the
# center of the circle
CENTER_X = config.CENTER_X
CENTER_Y = config.CENTER_Y
display.fill_rect(CENTER_X - 4, CENTER_Y - 4, 8, 8, WHITE)
display.text(FONT, "180,180", CENTER_X - (7 * FONT.WIDTH) // 2,
             CENTER_Y + 12, WHITE, BLACK)

# The safe area: everything inside this ring is visible, everything
# outside it is either under the bezel or gone entirely.
shapes.ring(display, CENTER_X, CENTER_Y, config.SAFE_RADIUS, WHITE, 3)
display.text(FONT, "safe area", CENTER_X - (9 * FONT.WIDTH) // 2,
             CENTER_Y - 60, WHITE, BLACK)

# Things to try:
#
# 1. Count the corner labels you can actually read. Then work out which
#    ones the circle should have kept: a corner of the square is 180*1.414
#    = 254 pixels from the center, and the glass stops at 180. The corner
#    is not merely clipped, it is 74 pixels past the rim -- further out,
#    in absolute pixels, than it was on the smartwatch kit's 240x240
#    panel, where the corner sat 170 out and the glass stopped at 120.
#
# 2. Move one corner label toward the center, fifteen pixels at a time,
#    until it appears. The distance you land on is the real edge of your
#    usable area -- and it is what config.SAFE_RADIUS is set to. That
#    value is currently an estimate scaled from the smaller panel, so
#    what you measure here is worth writing down.
#
# 3. On the OLED, x and y were independent: any x from 0 to 127 worked
#    with any y from 0 to 63. Here they are not. Whether an x is usable
#    depends on the y you pair it with. config.inside_circle(x, y) does
#    that arithmetic for you.
