# Lab 05: Drawing Rectangles
# rect() draws an outline (or a solid block if fill_flag=1); fill_rect()
# is the shorthand for the solid block. There is no "erase" command --
# drawing in black is erasing, since black is just an unlit pixel.

import config

oled = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
WIDTH = config.WIDTH
HEIGHT = config.HEIGHT

oled.fill(BLACK)

# a border one pixel in from every edge
oled.rect(0, 0, WIDTH, HEIGHT, WHITE, NO_FILL)

# a retro blocky face: square eye sockets with a filled pupil inside each
oled.rect(20, 12, 28, 22, WHITE, NO_FILL)
oled.fill_rect(30, 20, 8, 8, WHITE)

oled.rect(80, 12, 28, 22, WHITE, NO_FILL)
oled.fill_rect(90, 20, 8, 8, WHITE)

# a wide filled mouth bar with black teeth erased out of it
oled.fill_rect(24, 44, 80, 12, WHITE)
oled.fill_rect(40, 44, 4, 12, BLACK)
oled.fill_rect(56, 44, 4, 12, BLACK)
oled.fill_rect(72, 44, 4, 12, BLACK)
oled.fill_rect(88, 44, 4, 12, BLACK)

oled.show()
