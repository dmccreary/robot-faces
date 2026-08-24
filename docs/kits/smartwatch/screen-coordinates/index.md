# Lab 2: Screen Coordinates on a Round Display

The coordinate system itself hasn't changed from the OLED kit: (0, 0) is the upper-left corner, x grows right, y grows down. What changes is what happens at the edges. The GC9A01 addresses a 240x240 **square** of pixels, but the glass in front of it is the circle inscribed in that square — so a pixel at, say, (5, 5) is a real, legal, drawable pixel that a person looking at the watch will never see.

## Sample Program Code

This lab draws the same corner-and-center markers a rectangular display lesson would, so you can see exactly how many of them survive:

```py
# Lab 02: Screen Coordinates on a Round Display
# The coordinate system works exactly as it did on the OLED: (0,0) is the
# upper-left corner, x grows to the right, and y grows downward -- the
# opposite of a math class graph.
#
# What is new is that the upper-left corner IS NOT THERE. The GC9A01
# addresses a 240x240 square of pixels, but the glass is a circle cut out
# of that square. Pixel (0,0) is a real, addressable, paid-for pixel that
# you will never see.
#
# This lab draws proof: the four corner dots and their labels are placed
# exactly where the OLED kit put them, and then a ring shows you which of
# them survive.

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
display.hline(8, HEIGHT // 2, WIDTH - 16, WHITE)
display.vline(WIDTH // 2, 8, HEIGHT - 16, WHITE)

# the four corners of the addressable square. Watch how many appear.
display.fill_rect(0, 0, 6, 6, WHITE)
display.text(FONT, "0,0", 8, 8, WHITE, BLACK)

display.fill_rect(WIDTH - 6, 0, 6, 6, WHITE)
display.text(FONT, "239,0", WIDTH - 48, 8, WHITE, BLACK)

display.fill_rect(0, HEIGHT - 6, 6, 6, WHITE)
display.text(FONT, "0,239", 8, HEIGHT - 20, WHITE, BLACK)

display.fill_rect(WIDTH - 6, HEIGHT - 6, 6, 6, WHITE)
display.text(FONT, "239,239", WIDTH - 60, HEIGHT - 20, WHITE, BLACK)

# the exact center of the display, which on this screen is also the
# center of the circle
CENTER_X = config.CENTER_X
CENTER_Y = config.CENTER_Y
display.fill_rect(CENTER_X - 2, CENTER_Y - 2, 5, 5, WHITE)
display.text(FONT, "120,120", CENTER_X - 28, CENTER_Y + 8, WHITE, BLACK)

# The safe area: everything inside this ring is visible, everything
# outside it is either under the bezel or gone entirely.
shapes.ring(display, CENTER_X, CENTER_Y, config.SAFE_RADIUS, WHITE, 2)
display.text(FONT, "safe area", CENTER_X - 36, CENTER_Y - 40, WHITE, BLACK)

# Things to try:
#
# 1. Count the corner labels you can actually read. Then work out which
#    ones the circle should have kept: a corner of the square is 120*1.414
#    = 170 pixels from the center, and the glass stops at 120.
#
# 2. Move one corner label toward the center, ten pixels at a time, until
#    it appears. The distance you land on is the real edge of your usable
#    area -- and it is what config.SAFE_RADIUS is set to.
#
# 3. On the OLED, x and y were independent: any x from 0 to 127 worked
#    with any y from 0 to 63. Here they are not. Whether an x is usable
#    depends on the y you pair it with. config.inside_circle(x, y) does
#    that arithmetic for you.
```

Here's what actually reaches the glass:

![Simulated output of 02-screen-coordinates.py](sample-output.png)

## Count What Survived

Four corner squares went in. Look at the image: how many corner labels can you actually read? A corner of the 240x240 square sits roughly 170 pixels from the center — well outside the `SAFE_RADIUS` of 112 that `config.py` defines as the practical edge of the visible glass. Every one of them is gone, and nothing in the driver ever complained about drawing them.

That silence is the lesson. On a rectangular display, a coordinate either fits on screen or it doesn't, and "off screen" behaves the same in every direction. Here, whether an x is usable depends on the y it's paired with — the two are no longer independent. `config.inside_circle(x, y)` does that arithmetic so you don't have to reason about it by hand every time you place something near the rim.
