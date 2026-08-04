# Lab 18: Mode Switching
# Button A moves forward through a list of modes; button B moves back.
# The % (modulo) operator wraps the index around automatically, so the
# mode list loops from the last entry back to the first with no extra
# if-checks.

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
FONT = config.SMALL_FONT

HALF_WIDTH = config.WIDTH // 2
HALF_HEIGHT = config.HEIGHT // 2


def draw_rectangle():
    display.rect(60, 80, 120, 90, WHITE)


def draw_circle():
    shapes.circle(display, HALF_WIDTH, HALF_HEIGHT, 60, WHITE, NO_FILL)


def draw_triangle():
    points = array('h', [0, -60, 58, 46, -58, 46])
    shapes.poly(display, HALF_WIDTH, HALF_HEIGHT, points, WHITE, NO_FILL)


def draw_lines():
    display.line(50, 70, 190, 180, WHITE)
    display.line(50, 180, 190, 70, WHITE)


def draw_ring():
    # The mode a round screen was made for.
    shapes.ring(display, HALF_WIDTH, HALF_HEIGHT, config.SAFE_RADIUS, WHITE, 3)


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
    display.text(FONT, name, x, 28, WHITE, BLACK)
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
