# Lab 13: Blinking
# Waits for a press on button A (GP14, PULL_UP) and closes both eyes at
# once -- two eyes closing together reads as a blink, not a wink.
#
# Wiring for the two buttons: one leg of each button to the GPIO pin, the
# other leg to GND. PULL_UP holds the pin at 1 until a press pulls it to
# 0. On the Waveshare RP2040-LCD-1.28 the board has no buttons of its
# own, so these go on the free GPIO pins along the edge.

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
EYE_SPACING = 48
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 100
EYE_RADIUS = 28
PUPIL_RADIUS = 10

BLINK_RADIUS_Y = 14
BLINK_Y = EYE_Y + 7
STROKE = 4

MOUTH_Y = 168
MOUTH_RADIUS_X = 48
MOUTH_RADIUS_Y = 24

EYE_BOX = EYE_RADIUS + 4


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
