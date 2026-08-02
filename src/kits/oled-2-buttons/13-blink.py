# Lab 13: Blinking
# Waits for a press on button A (pin 14, PULL_UP) and closes both eyes at
# once -- two eyes closing together reads as a blink, not a wink.

import config
from utime import sleep

oled = config.init_display()
button_a, _ = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3      # 1 (top right) + 2 (top left)
BOTTOM_HALF = 12  # 4 (bottom left) + 8 (bottom right)

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 22
EYE_RADIUS = 12
PUPIL_RADIUS = 4

BLINK_RADIUS_Y = 6
BLINK_Y = EYE_Y + 3
STROKE = 3

MOUTH_Y = 46
MOUTH_RADIUS_X = 20
MOUTH_RADIUS_Y = 10


def draw_open_eye(x):
    oled.ellipse(x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    oled.ellipse(x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_closed_eye(x):
    for offset in range(STROKE):
        oled.ellipse(x, BLINK_Y + offset, EYE_RADIUS, BLINK_RADIUS_Y,
                     WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        oled.ellipse(HALF_WIDTH, MOUTH_Y - offset, MOUTH_RADIUS_X,
                     MOUTH_RADIUS_Y, WHITE, NO_FILL, BOTTOM_HALF)


def draw_face(blinking):
    oled.fill(BLACK)
    if blinking:
        draw_closed_eye(LEFT_EYE_X)
        draw_closed_eye(RIGHT_EYE_X)
    else:
        draw_open_eye(LEFT_EYE_X)
        draw_open_eye(RIGHT_EYE_X)
    draw_smile()
    oled.show()


def button_pressed():
    if button_a.value() == 1:
        return False
    sleep(0.02)              # debounce: let the contacts settle
    return button_a.value() == 0


def wait_for_release():
    while button_a.value() == 0:
        sleep(0.01)


def blink_once():
    draw_face(True)    # both eyes snap shut
    sleep(0.15)          # a real blink is fast
    draw_face(False)   # eyes open again


draw_face(False)

while True:
    if button_pressed():
        blink_once()
        wait_for_release()
    sleep(0.01)
