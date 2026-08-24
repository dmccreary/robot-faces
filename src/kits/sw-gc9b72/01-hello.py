# Lab 01: Hello World
# Confirms the GC9B72 display is wired correctly and MicroPython can draw
# on it.
#
# There is no built-in font on this driver -- text() takes a font MODULE
# as its first argument. config.py imports two of them for you.
#
#     display.text(config.SMALL_FONT, "Hello!", x, y, WHITE, BLACK)
#                  ^^^^^^^^^^^^^^^^^^ not optional
#
# There is also no show(). Every drawing call streams straight over SPI,
# so both lines below are already on the glass before this comment ends.

import config

display = config.init_display()

display.fill(config.BLACK)

# The small font: 8 pixels wide, 16 tall. "Hello World!" is 12 characters
# * 8 px = 96 px wide, so x=132 centers it on the 360 px screen.
display.text(config.SMALL_FONT, "Hello World!", 132, 155,
             config.WHITE, config.BLACK)

# The big font: 16 x 32, readable from across the room. "GC9B72" is
# 6 characters * 16 px = 96 px wide, so it centers at the same x.
display.text(config.BIG_FONT, "GC9B72", 132, 185,
             config.GREEN, config.BLACK)
