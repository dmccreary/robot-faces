# Lab 04: Drawing Lines
# hline() and vline() take a start point plus a length; line() takes two
# full end points. Reach for hline/vline when you can -- they skip the
# angle math and run faster.

import config

oled = config.init_display()
WHITE = config.WHITE

oled.fill(config.BLACK)

# left half: a box built from two hlines and two vlines, with an X of
# general lines inside
oled.hline(4, 6, 50, WHITE)
oled.hline(4, 54, 50, WHITE)
oled.vline(4, 6, 49, WHITE)
oled.vline(53, 6, 49, WHITE)
oled.line(4, 6, 53, 54, WHITE)
oled.line(4, 54, 53, 6, WHITE)

# right half: an angry face made only of lines
# eyebrows angled down toward the nose -- the eyebrow rule
oled.line(68, 12, 86, 22, WHITE)
oled.line(124, 12, 106, 22, WHITE)
# eyes as short vertical lines
oled.vline(77, 28, 10, WHITE)
oled.vline(115, 28, 10, WHITE)
# a flat, unimpressed mouth
oled.hline(78, 48, 36, WHITE)

oled.show()
