# Lab 13: Blinking
# Waits for a press on button A (GP14, PULL_UP) and closes both eyes at
# once -- two eyes closing together reads as a blink, not a wink.
#
# Wiring for the two buttons: one leg of each button to the GPIO pin, the
# other leg to GND. PULL_UP holds the pin at 1 until a press pulls it to
# 0. GP14 and GP15 are the first free pins above the display's GP2-GP7
# block -- see the pin table in config.py.
#
# An unconnected pull-up pin reads 1 forever, which is exactly what "not
# pressed" looks like. So with no buttons wired this lab does not crash,
# it just shows a smiling face that never blinks.

import config
import shapes
from utime import sleep

display = config.init_display()
button_a, _ = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3      # 1 (top right) + 2 (top left)
BOTTOM_HALF = 12  # 4 (bottom left) + 8 (bottom right)

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 72
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 150
EYE_RADIUS = 42
PUPIL_RADIUS = 15

BLINK_RADIUS_Y = 21
BLINK_Y = EYE_Y + 11
STROKE = 6

MOUTH_Y = 252
MOUTH_RADIUS_X = 72
MOUTH_RADIUS_Y = 36

EYE_BOX = EYE_RADIUS + 6


def draw_open_eye(x):
    shapes.ellipse(display, x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_closed_eye(x):
    for offset in range(STROKE):
        shapes.ellipse(display, x, BLINK_Y + offset, EYE_RADIUS,
                       BLINK_RADIUS_Y, WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_RADIUS_X, MOUTH_RADIUS_Y,
                       WHITE, NO_FILL, BOTTOM_HALF)


def set_eyes(blinking):
    """Erase both eye boxes and redraw them in the requested state. The
    mouth is never touched -- it does not change, so it does not cost
    anything."""
    for x in (LEFT_EYE_X, RIGHT_EYE_X):
        display.fill_rect(x - EYE_BOX, EYE_Y - EYE_BOX,
                          EYE_BOX * 2, EYE_BOX * 2, BLACK)
        if blinking:
            draw_closed_eye(x)
        else:
            draw_open_eye(x)


def button_pressed():
    if button_a.value() == 1:
        return False
    sleep(0.02)              # debounce: let the contacts settle
    return button_a.value() == 0


def wait_for_release():
    while button_a.value() == 0:
        sleep(0.01)


def blink_once():
    set_eyes(True)     # both eyes snap shut
    sleep(0.15)        # a real blink is fast
    set_eyes(False)    # eyes open again


display.fill(BLACK)
draw_smile()
set_eyes(False)

while True:
    if button_pressed():
        blink_once()
        wait_for_release()
    sleep(0.01)
