# Lab 07: Drawing Circles
# A circle is just ellipse() with equal horizontal and vertical radii.
# This lab draws all four combinations of background/circle color and
# fill so you can compare them at once.

import config

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
WIDTH = config.WIDTH
HEIGHT = config.HEIGHT

RADIUS = 12
QUARTER_WIDTH = WIDTH // 4
HALF_WIDTH = WIDTH // 2
QUARTER_HEIGHT = HEIGHT // 4
HALF_HEIGHT = HEIGHT // 2

oled.fill(BLACK)

# top-left: black circle outline on a white background
oled.fill_rect(0, 0, HALF_WIDTH, HALF_HEIGHT, WHITE)
oled.ellipse(QUARTER_WIDTH, QUARTER_HEIGHT, RADIUS, RADIUS, BLACK, NO_FILL)

# top-right: white circle outline on a black background
oled.ellipse(HALF_WIDTH + QUARTER_WIDTH, QUARTER_HEIGHT, RADIUS, RADIUS, WHITE, NO_FILL)

# bottom-left: black filled circle on a white background
oled.fill_rect(0, HALF_HEIGHT, HALF_WIDTH, HALF_HEIGHT, WHITE)
oled.ellipse(QUARTER_WIDTH, HALF_HEIGHT + QUARTER_HEIGHT, RADIUS, RADIUS, BLACK, FILL)

# bottom-right: white filled circle on a black background
oled.ellipse(HALF_WIDTH + QUARTER_WIDTH, HALF_HEIGHT + QUARTER_HEIGHT, RADIUS, RADIUS, WHITE, FILL)

oled.show()
