# Lab 21: Sample main.py -- Self-Advancing Demo + Button Menu
#
# Rename this file to main.py and copy it to the root of the Pico's
# filesystem. MicroPython always runs main.py a few seconds after power
# comes on, so once this is main.py the robot face works standalone --
# no computer, no Thonny, just USB power.
#
# Default behavior: a demo reel that cycles through all ten modes (the
# seven emotions from Lab 19 plus Blink, Wink, and Sleepy) automatically,
# advancing to the next mode after 5 seconds with no button press. Blink
# and Wink are the exception -- a single blink is over in a fraction of a
# second, so those two stay up for 10 seconds and replay themselves every
# 3 seconds, which is what makes them read as a living face instead of a
# still picture. Press button A or B to jump forward or back through the
# modes yourself; any press pushes the next auto-advance out to 30
# seconds, so you have time to look before the demo reel takes over
# again. Uses the non-blocking ticks_ms() pattern from Lab 15 so the
# timers and the button checks all run in the same loop.

import config
from utime import sleep, ticks_ms, ticks_diff

# Give Thonny a window to interrupt (Stop/Restart) before main.py's loop
# takes over the serial port -- without this, a fast-booting Pico can start
# running before you get a chance to break in.
sleep(1)

oled = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3
BOTTOM_HALF = 12
BOTTOM_LEFT = 4
BOTTOM_RIGHT = 8

WIDTH = config.WIDTH
HALF_WIDTH = WIDTH // 2
EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 24
PUPIL_RADIUS = 3
EYEBROW_HALF_WIDTH = 11
EYEBROW_Y = EYE_Y - 10
MOUTH_Y = 46

# Geometry for the Blink/Wink/Sleepy modes: a neutral open-eye size plus a
# closed-eye arc (same TOP_HALF-masked ellipse trick as Labs 12, 13, 16).
NEUTRAL_EYE_RADIUS = 11
CLOSED_EYE_HEIGHT = 6
CLOSED_EYE_Y = EYE_Y + 3
EYE_STROKE = 3

ZZZ_X = 106
ZZZ_Y = 26
ZZZ_STEP_X = 8
ZZZ_STEP_Y = 10
BOB_RANGE = 3

AUTO_ADVANCE_MS = 5000      # how long a still face stays up on its own
REPEATING_HOLD_MS = 10000   # modes that replay themselves get longer
REPEAT_MS = 3000            # ...and replay this often while they are up
POST_INPUT_DELAY_MS = 30000


def draw_eye(x, rx, ry, offset=0):
    oled.ellipse(x, EYE_Y, rx, ry, WHITE, FILL)
    oled.ellipse(x + offset, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_eyes(rx, ry, offset=0):
    draw_eye(LEFT_EYE_X, rx, ry, offset)
    draw_eye(RIGHT_EYE_X, rx, ry, offset)


def draw_eyebrow(x, side, tilt, lift):
    y = EYEBROW_Y - lift
    outer_x = x - (EYEBROW_HALF_WIDTH * side)
    inner_x = x + (EYEBROW_HALF_WIDTH * side)
    oled.line(outer_x, y - tilt, inner_x, y + tilt, WHITE)


def draw_eyebrows(tilt_left, tilt_right, lift=0):
    draw_eyebrow(LEFT_EYE_X, 1, tilt_left, lift)
    draw_eyebrow(RIGHT_EYE_X, -1, tilt_right, lift)


def draw_mouth_curve(radius_x, radius_y, mask):
    oled.ellipse(HALF_WIDTH, MOUTH_Y, radius_x, radius_y, WHITE, NO_FILL, mask)


def draw_mouth_flat(half_width):
    oled.hline(HALF_WIDTH - half_width, MOUTH_Y, half_width * 2, WHITE)


def draw_mouth_open(radius_x, radius_y):
    oled.ellipse(HALF_WIDTH, MOUTH_Y, radius_x, radius_y, WHITE, FILL)


def draw_mouth_smirk(half_width, side):
    oled.hline(HALF_WIDTH - half_width, MOUTH_Y, half_width * 2, WHITE)
    corner_x = HALF_WIDTH + (half_width * side)
    mask = BOTTOM_RIGHT if side > 0 else BOTTOM_LEFT
    oled.ellipse(corner_x, MOUTH_Y - 4, 6, 6, WHITE, NO_FILL, mask)


def draw_happy():
    draw_eyes(10, 10)
    draw_eyebrows(0, 0, lift=2)
    draw_mouth_curve(22, 12, BOTTOM_HALF)


def draw_sad():
    draw_eyes(9, 9)
    draw_eyebrows(-3, -3, lift=0)
    draw_mouth_curve(16, 8, TOP_HALF)


def draw_angry():
    draw_eyes(10, 5)
    draw_eyebrows(5, 5, lift=-2)
    draw_mouth_flat(10)


def draw_afraid():
    draw_eyes(13, 13)
    draw_eyebrows(-5, -5, lift=3)
    draw_mouth_open(6, 9)


def draw_surprised():
    draw_eyes(14, 14)
    draw_eyebrows(0, 0, lift=6)
    draw_mouth_open(8, 11)


def draw_disgusted():
    draw_eyes(9, 6)
    draw_eyebrows(4, -2, lift=-1)
    oled.ellipse(HALF_WIDTH - 6, MOUTH_Y, 12, 7, WHITE, NO_FILL, TOP_HALF)


def draw_contempt():
    draw_eyes(10, 10)
    draw_eyebrows(0, 0, lift=0)
    draw_mouth_smirk(14, 1)


EMOTIONS = (
    ("Happy", draw_happy),
    ("Sad", draw_sad),
    ("Angry", draw_angry),
    ("Afraid", draw_afraid),
    ("Surprised", draw_surprised),
    ("Disgusted", draw_disgusted),
    ("Contempt", draw_contempt),
)


def draw_closed_eye(x):
    for offset in range(EYE_STROKE):
        oled.ellipse(x, CLOSED_EYE_Y + offset, NEUTRAL_EYE_RADIUS,
                     CLOSED_EYE_HEIGHT, WHITE, NO_FILL, TOP_HALF)


def draw_blink(closed):
    if closed:
        draw_closed_eye(LEFT_EYE_X)
        draw_closed_eye(RIGHT_EYE_X)
    else:
        draw_eyes(NEUTRAL_EYE_RADIUS, NEUTRAL_EYE_RADIUS)
    draw_mouth_curve(18, 8, BOTTOM_HALF)


def draw_wink(right_closed):
    if right_closed:
        draw_eye(LEFT_EYE_X, NEUTRAL_EYE_RADIUS, NEUTRAL_EYE_RADIUS)
        draw_closed_eye(RIGHT_EYE_X)
    else:
        draw_eyes(NEUTRAL_EYE_RADIUS, NEUTRAL_EYE_RADIUS)
    draw_mouth_curve(18, 8, BOTTOM_HALF)


def draw_sleepy(bob):
    draw_closed_eye(LEFT_EYE_X)
    draw_closed_eye(RIGHT_EYE_X)
    draw_eyebrows(-2, -2, lift=-2)
    oled.ellipse(HALF_WIDTH, MOUTH_Y, 4, 4, WHITE, NO_FILL)
    oled.text('Z', ZZZ_X, ZZZ_Y + bob, WHITE)
    oled.text('Z', ZZZ_X + ZZZ_STEP_X, ZZZ_Y - ZZZ_STEP_Y + bob, WHITE)
    oled.text('z', ZZZ_X + ZZZ_STEP_X * 2, ZZZ_Y - ZZZ_STEP_Y * 2 + bob, WHITE)


def show_face(name, draw):
    oled.fill(BLACK)
    draw()
    oled.text(name, 2, 2, WHITE)
    oled.show()


def play_blink(name):
    show_face(name, lambda: draw_blink(True))    # eyes snap shut
    sleep(0.15)                                    # a real blink is fast
    show_face(name, lambda: draw_blink(False))   # eyes open again


def play_wink(name):
    show_face(name, lambda: draw_wink(True))      # right eye closes
    sleep(0.35)                                    # hold it long enough to read
    show_face(name, lambda: draw_wink(False))     # both eyes open, resting


def play_sleepy(name):
    for bob in range(-BOB_RANGE, BOB_RANGE + 1):
        show_face(name, lambda bob=bob: draw_sleepy(bob))
        sleep(0.1)
    for bob in range(BOB_RANGE, -BOB_RANGE - 1, -1):
        show_face(name, lambda bob=bob: draw_sleepy(bob))
        sleep(0.1)


# Name, play function, how long the mode stays on screen, and how often it
# replays itself while it is up (0 means play once, then hold the last frame).
ANIMATED_MODES = (
    ("Blink", play_blink, REPEATING_HOLD_MS, REPEAT_MS),
    ("Wink", play_wink, REPEATING_HOLD_MS, REPEAT_MS),
    ("Sleepy", play_sleepy, AUTO_ADVANCE_MS, 0),
)

MODE_COUNT = len(EMOTIONS) + len(ANIMATED_MODES)


def show_mode(index):
    if index < len(EMOTIONS):
        name, draw = EMOTIONS[index]
        show_face(name, draw)
    else:
        name, play, _, _ = ANIMATED_MODES[index - len(EMOTIONS)]
        play(name)


def hold_ms(index):
    """How long this mode stays up before the demo reel moves on."""
    if index < len(EMOTIONS):
        return AUTO_ADVANCE_MS
    return ANIMATED_MODES[index - len(EMOTIONS)][2]


def repeat_ms(index):
    """How often this mode replays itself; 0 means play once and hold."""
    if index < len(EMOTIONS):
        return 0
    return ANIMATED_MODES[index - len(EMOTIONS)][3]


def pressed(button):
    if button.value() == 1:
        return False
    sleep(0.02)
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep(0.01)


mode_index = 0
last_change = ticks_ms()
last_repeat = last_change
advance_delay = hold_ms(mode_index)

show_mode(mode_index)

while True:
    now = ticks_ms()

    if pressed(button_a):
        mode_index = (mode_index + 1) % MODE_COUNT
        show_mode(mode_index)
        wait_for_release(button_a)
        last_change = ticks_ms()      # cooldown starts when the button comes up
        last_repeat = last_change
        advance_delay = POST_INPUT_DELAY_MS

    elif pressed(button_b):
        mode_index = (mode_index - 1) % MODE_COUNT
        show_mode(mode_index)
        wait_for_release(button_b)
        last_change = ticks_ms()
        last_repeat = last_change
        advance_delay = POST_INPUT_DELAY_MS

    elif ticks_diff(now, last_change) >= advance_delay:
        mode_index = (mode_index + 1) % MODE_COUNT
        show_mode(mode_index)
        last_change = now
        last_repeat = now
        advance_delay = hold_ms(mode_index)

    # Blink and Wink land here every REPEAT_MS so they play again instead of
    # freezing on their last frame for the rest of the mode's turn.
    elif repeat_ms(mode_index) and ticks_diff(now, last_repeat) >= repeat_ms(mode_index):
        show_mode(mode_index)
        last_repeat = now

    sleep(0.005)
