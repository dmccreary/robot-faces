# Lab 06: Ellipse and Quadrant Fill Codes
# ellipse(x, y, horz_radius, vert_radius, color, fill_flag, quad_code)
# The optional quad_code restricts drawing to one or more quarters of the
# ellipse: 1=top-right, 2=top-left, 4=bottom-left, 8=bottom-right. Add the
# numbers together to combine quarters.

import config

oled = config.init_display()
WHITE = config.WHITE
NO_FILL = config.NO_FILL
FILL = config.FILL

oled.fill(config.BLACK)
oled.text("Ellipse+Quadrants", 4, 2, WHITE)

# a plain filled ellipse for reference
oled.ellipse(20, 22, 14, 10, WHITE, FILL)

# four quadrant fill codes, drawn as outlines so each arc stands out
QUADRANTS = (
    (3, "top half"),
    (12, "bottom half"),
    (6, "left half"),
    (9, "right half"),
)

x = 52
for code, label in QUADRANTS:
    oled.ellipse(x, 22, 8, 8, WHITE, NO_FILL, code)
    oled.text(str(code), x - 4, 34, WHITE)
    x += 22

oled.show()
