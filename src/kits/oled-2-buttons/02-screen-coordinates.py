# Lab 02: Screen Coordinates
# Maps out the display's coordinate system: (0,0) is the upper-left corner,
# x grows to the right, and y grows downward -- the opposite of a math
# class graph.

import config

oled = config.init_display()
WHITE = config.WHITE
WIDTH = config.WIDTH
HEIGHT = config.HEIGHT

oled.fill(config.BLACK)

# axis lines starting at the origin
oled.hline(0, 0, WIDTH, WHITE)
oled.vline(0, 0, HEIGHT, WHITE)

# a dot and a label at each corner
oled.pixel(0, 0, WHITE)
oled.text("0,0", 2, 2, WHITE)

oled.pixel(WIDTH - 1, 0, WHITE)
oled.text("127,0", WIDTH - 42, 2, WHITE)

oled.pixel(0, HEIGHT - 1, WHITE)
oled.text("0,63", 2, HEIGHT - 10, WHITE)

oled.pixel(WIDTH - 1, HEIGHT - 1, WHITE)
oled.text("127,63", WIDTH - 48, HEIGHT - 10, WHITE)

# a dot and label at the exact center of the display
CENTER_X = WIDTH // 2
CENTER_Y = HEIGHT // 2
oled.pixel(CENTER_X, CENTER_Y, WHITE)
oled.text("64,32", CENTER_X - 20, CENTER_Y + 4, WHITE)

oled.show()
