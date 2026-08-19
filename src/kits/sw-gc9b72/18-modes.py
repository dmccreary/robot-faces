# Lab 18: Mode Switching
# Button A moves forward through a list of modes; button B moves back.
# The % (modulo) operator wraps the index around automatically, so the
# mode list loops from the last entry back to the first with no extra
# if-checks.
#
# This is a port of the smartwatch kit's 18-modes.py. Every coordinate
# below is that lab's number times 1.5 (360 / 240), with the original in
# a trailing comment so you can see what moved.
#
# The one thing that did NOT scale is the font. Bitmap glyphs are fixed
# sizes baked into lib/, so a bigger screen makes 8x16 text look SMALLER,
# not bigger. That is why the mode name is drawn in the 16x32 font here
# and the 8x16 one on the smartwatch kit -- see the FONT note below.

import config
import shapes
from array import array
from utime import sleep

display = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

# A mode name is a title, and a title on a 360 px screen wants the big
# glyphs. The centering math in show_mode() reads FONT.WIDTH rather than
# a hardcoded 8, so it comes out right whichever font this line names --
# which is exactly why you never scale a font width by hand.
FONT = config.BIG_FONT              # config.SMALL_FONT on the smartwatch kit

HALF_WIDTH = config.WIDTH // 2      # 180
HALF_HEIGHT = config.HEIGHT // 2    # 180

LABEL_Y = 42                        # 28 on the smartwatch kit


def draw_rectangle():
    display.rect(90, 120, 180, 135, WHITE)      # 60, 80, 120, 90


def draw_circle():
    shapes.circle(display, HALF_WIDTH, HALF_HEIGHT, 90, WHITE, NO_FILL)  # 60


def draw_triangle():
    points = array('h', [0, -90, 87, 69, -87, 69])   # 0,-60, 58,46, -58,46
    shapes.poly(display, HALF_WIDTH, HALF_HEIGHT, points, WHITE, NO_FILL)


def draw_lines():
    display.line(75, 105, 285, 270, WHITE)      # 50, 70, 190, 180
    display.line(75, 270, 285, 105, WHITE)      # 50, 180, 190, 70


def draw_ring():
    # The mode a round screen was made for. Thickness 5 here, 3 there --
    # a stroke has to grow with the screen or it thins out visually.
    shapes.ring(display, HALF_WIDTH, HALF_HEIGHT, config.SAFE_RADIUS, WHITE, 5)


MODES = (
    ("Rectangle", draw_rectangle),
    ("Circle", draw_circle),
    ("Triangle", draw_triangle),
    ("Lines", draw_lines),
    ("Ring", draw_ring),
)


def show_mode(index):
    name, draw = MODES[index]
    display.fill(BLACK)
    x = HALF_WIDTH - (len(name) * FONT.WIDTH) // 2
    display.text(FONT, name, x, LABEL_Y, WHITE, BLACK)
    draw()


def pressed(button):
    if button.value() == 1:
        return False
    sleep(0.02)
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep(0.01)


mode_index = 0
show_mode(mode_index)

while True:
    if pressed(button_a):
        mode_index = (mode_index + 1) % len(MODES)
        show_mode(mode_index)
        wait_for_release(button_a)

    if pressed(button_b):
        mode_index = (mode_index - 1) % len(MODES)
        show_mode(mode_index)
        wait_for_release(button_b)

    sleep(0.01)

# Things to try:
#
# 1. Every mode here starts with a full display.fill(BLACK), and you can
#    see it happen when you press a button. That is acceptable for a menu
#    -- it happens once per press, not sixty times a second. Knowing when
#    a full wipe is fine is as useful as knowing when it is not.
#
# 2. Which of these five shapes looks right on a round screen and which
#    looks like a mistake? The rectangle and the triangle both have
#    corners pointing at a bezel that has none.
#
# 3. "Rectangle" is the longest name here: 9 characters of the 16x32 font
#    is 144 px. At LABEL_Y the visible circle is only about 191 px across,
#    so a sixth mode called "Checkerboard" (12 chars, 192 px) would have
#    its first and last letters clipped by the bezel. Add one and watch.
