# Lab 03: Drawing Pixels
# oled.pixel(x, y, color) turns exactly one dot on or off. Every other
# drawing command is built out of pixels underneath.

import config

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
FILL = config.FILL
WIDTH = config.WIDTH
HEIGHT = config.HEIGHT

oled.fill(BLACK)

# a dotted ruler across the top: one pixel on, one pixel off
for x in range(0, WIDTH, 2):
    oled.pixel(x, 4, WHITE)

# a dotted ruler down the left edge
for y in range(10, HEIGHT, 2):
    oled.pixel(2, y, WHITE)

# a diagonal drawn one pixel at a time
for i in range(0, 44):
    oled.pixel(8 + i, 14 + i, WHITE)

# an eye with a two-by-two catchlight punched out in black pixels
oled.ellipse(95, 34, 22, 18, WHITE, FILL)
oled.pixel(86, 25, BLACK)
oled.pixel(87, 25, BLACK)
oled.pixel(86, 26, BLACK)
oled.pixel(87, 26, BLACK)

oled.show()
