# Lab 17: Reading Two Buttons
# Both buttons on this kit are wired the same way as the single button in
# the Blinking lab: PULL_UP inputs that read 1 when idle and 0 when
# pressed, because the other leg of each button goes to GND. This lab
# reads them independently and shows a running count for each.

import config
from utime import sleep

oled = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK


def pressed(button):
    if button.value() == 1:
        return False
    sleep(0.02)              # debounce: let the contacts settle
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep(0.01)


def show_counts(a_count, b_count):
    oled.fill(BLACK)
    oled.text("Two Buttons", 16, 8, WHITE)
    oled.text("A (pin 14): " + str(a_count), 4, 28, WHITE)
    oled.text("B (pin 15): " + str(b_count), 4, 40, WHITE)
    oled.show()


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
