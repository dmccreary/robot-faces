# Lab 11: Eye Scanner
# Sweeps both pupils back and forth by looping an x offset from -18 to 18
# and redrawing the whole face on every step.

import config
from utime import sleep

oled = config.init_display()
ON = config.WHITE
OFF = config.BLACK
FILL = config.FILL
NO_FILL = config.NO_FILL

HALF_WIDTH = config.WIDTH // 2

PUPIL_RANGE = 18
EYE_DIST_FROM_TOP = 21
EYE_WIDTH = 27
EYE_HEIGHT = 10
LEFT_EYE_X = 32
RIGHT_EYE_X = 94
MOUTH_VPOS = 45
MOUTH_WIDTH = 40


def draw_face(offset):
    oled.fill(config.BLACK)

    # left eye
    oled.ellipse(LEFT_EYE_X, EYE_DIST_FROM_TOP, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    oled.ellipse(LEFT_EYE_X + offset, EYE_DIST_FROM_TOP, 5, 5, OFF, FILL)

    # right eye
    oled.ellipse(RIGHT_EYE_X, EYE_DIST_FROM_TOP, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    oled.ellipse(RIGHT_EYE_X + offset, EYE_DIST_FROM_TOP, 5, 5, OFF, FILL)

    # mouth: bottom half of an ellipse (mask 12 = 4 + 8)
    oled.ellipse(HALF_WIDTH, MOUTH_VPOS, MOUTH_WIDTH, 10, ON, NO_FILL, 12)

    oled.show()


delay = 0.02
while True:
    for offset in range(-PUPIL_RANGE, PUPIL_RANGE):
        draw_face(offset)
        sleep(delay)
    for offset in range(PUPIL_RANGE, -PUPIL_RANGE, -1):
        draw_face(offset)
        sleep(delay)
