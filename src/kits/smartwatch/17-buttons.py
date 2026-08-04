# Lab 17: Reading Two Buttons
# Both buttons on this kit are wired the same way as the single button in
# the Blinking lab: PULL_UP inputs that read 1 when idle and 0 when
# pressed, because the other leg of each button goes to GND. This lab
# reads them independently and shows a running count for each.
#
# Text lines are centered rather than left-aligned at x=4. On a round
# screen a left margin is not a straight line -- how far in the text has
# to start depends on how far down the screen it is.

import config
from utime import sleep

display = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
FONT = config.SMALL_FONT
FONT_WIDTH = FONT.WIDTH
FONT_HEIGHT = FONT.HEIGHT
HALF_WIDTH = config.WIDTH // 2

TITLE_Y = 70
A_ROW_Y = 110
B_ROW_Y = 140


def centered(string, y):
    x = HALF_WIDTH - (len(string) * FONT_WIDTH) // 2
    # Erase the whole strip first, so a shorter number does not leave a
    # digit from the longer one behind it.
    display.fill_rect(0, y, config.WIDTH, FONT_HEIGHT, BLACK)
    display.text(FONT, string, x, y, WHITE, BLACK)


def pressed(button):
    if button.value() == 1:
        return False
    sleep(0.02)              # debounce: let the contacts settle
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep(0.01)


def show_counts(a_count, b_count):
    centered("A (GP14): " + str(a_count), A_ROW_Y)
    centered("B (GP15): " + str(b_count), B_ROW_Y)


display.fill(BLACK)
centered("Two Buttons", TITLE_Y)

a_count = 0
b_count = 0
show_counts(a_count, b_count)

while True:
    if pressed(button_a):
        a_count += 1
        show_counts(a_count, b_count)
        wait_for_release(button_a)

    if pressed(button_b):
        b_count += 1
        show_counts(a_count, b_count)
        wait_for_release(button_b)

    sleep(0.01)

# Things to try:
#
# 1. Take the fill_rect() out of centered() and count past 9. The 1 from
#    "10" sits on top of the old digit, because nothing erased it. On a
#    display with no frame buffer, text does not replace -- it overprints.
#
# 2. The driver's text() takes a background color, and it really does
#    paint that background behind each character. Try passing WHITE as
#    the background for one row to see it.
