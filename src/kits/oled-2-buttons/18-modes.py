# Lab 18: Mode Switching
# Button A moves forward through a list of modes; button B moves back.
# The % (modulo) operator wraps the index around automatically, so the
# mode list loops from the last entry back to the first with no extra
# if-checks.

import config
from utime import sleep

oled = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

HALF_WIDTH = config.WIDTH // 2
HALF_HEIGHT = config.HEIGHT // 2


def draw_rectangle():
    oled.rect(34, 14, 60, 36, WHITE, NO_FILL)


def draw_circle():
    oled.ellipse(HALF_WIDTH, HALF_HEIGHT, 20, 20, WHITE, NO_FILL)


def draw_triangle():
    from array import array
    points = array('h', [0, -20, 20, 20, -20, 20])
    oled.poly(HALF_WIDTH, HALF_HEIGHT, points, WHITE, NO_FILL)


def draw_lines():
    oled.line(20, 14, 108, 50, WHITE)
    oled.line(20, 50, 108, 14, WHITE)


MODES = (
    ("Rectangle", draw_rectangle),
    ("Circle", draw_circle),
    ("Triangle", draw_triangle),
    ("Lines", draw_lines),
)


def show_mode(index):
    name, draw = MODES[index]
    oled.fill(BLACK)
    oled.text(name, 2, 2, WHITE)
    draw()
    oled.show()


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
