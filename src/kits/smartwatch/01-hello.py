# Lab 01: Hello World
# Confirms the display is wired correctly and MicroPython can run code on it.
#
# One line here does not look like the OLED kit's version, and it is the
# line that trips up everyone porting code to this driver:
#
#     display.text(FONT, "Hello!", x, y, WHITE, BLACK)
#            ^^^^^^
# There is no built-in font. framebuf gave the SSD1306 a fixed 8x8 font
# for free; this driver has none, so text() takes a font MODULE as its
# first argument. config.py imports two of them for you.

import config

display = config.init_display()

display.fill(config.BLACK)

# The small font: 8 pixels wide, 16 tall, so 30 characters fit across the
# widest part of the screen.
display.text(config.SMALL_FONT, "Hello World!", 72, 80,
             config.WHITE, config.BLACK)

# The big font: 16 x 32, readable from across the room, 15 characters max.
display.text(config.BIG_FONT, "ROBOT", 80, 120,
             config.WHITE, config.BLACK)

# Nothing else to do. There is no show() on this display -- both lines
# were already on the glass before this comment was reached.
