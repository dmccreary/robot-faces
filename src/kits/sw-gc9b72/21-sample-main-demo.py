# Lab 21: Sample main.py -- Self-Advancing Demo + Button Menu
#
# Rename this file to main.py and copy it to the root of the board's
# filesystem. MicroPython always runs main.py a few seconds after power
# comes on, so once this is main.py the watch face works standalone --
# no computer, no Thonny, just USB power or a battery.
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
#
# TWO RULES THIS FILE FOLLOWS, both from earlier labs, and both of which
# matter more here than anywhere else because this program runs forever:
#
#   A full display.fill(BLACK) happens only when the MODE changes -- a
#   few times a minute. On this 360x360 panel that is 129,600 pixels,
#   259,200 bytes down the SPI wire. A few times a minute that is cheap
#   enough to be invisible.
#
#   The animations that repeat inside a mode (blink, wink, the drifting
#   Zzz) redraw only their own box. Wipe the whole screen three times a
#   second on this display and the demo becomes a strobe light.
#
# Every position and size below is the smartwatch kit's number times 1.5
# (360 / 240). The FONTS are the exception -- see the note beside
# LABEL_FONT.

import config
import shapes
from utime import sleep, ticks_ms, ticks_diff

# Give Thonny a window to interrupt (Stop/Restart) before main.py's loop
# takes over the serial port -- without this, a fast-booting board can
# start running before you get a chance to break in.
sleep(1)

display = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

# TWO FONTS, because bitmap fonts do not scale. Every coordinate in this
# file grew by 1.5 crossing from the 240 px screen to this 360 px one,
# but the glyphs did not -- so 8x16 text that filled the smartwatch
# screen looks stranded on this one. The mode NAME is the headline of the
# whole demo, so it moves up to the 16x32 font: "Surprised" is the
# longest of the ten and is 9 * 16 = 144 px, comfortably inside the
# ~199 px the safe circle gives you at LABEL_Y. The drifting Zzz stays
# 8x16 -- it is decoration, not a title.
FONT = config.SMALL_FONT          # 8 x 16
LABEL_FONT = config.BIG_FONT      # 16 x 32

TOP_HALF = 3
BOTTOM_HALF = 12
BOTTOM_LEFT = 4
BOTTOM_RIGHT = 8

WIDTH = config.WIDTH
HALF_WIDTH = WIDTH // 2
EYE_SPACING = 72                  # 48 on the smartwatch kit
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 153                       # 102
PUPIL_RADIUS = 12                 # 8
EYEBROW_HALF_WIDTH = 36           # 24
EYEBROW_Y = EYE_Y - 60            # 40 below eye level, scaled
MOUTH_Y = 246                     # 164
# NOT the scaled 45. text() paints a black background as tall as the
# font, and the label font here is 16x32 -- so a label at row 45 covers
# rows 45-76, and Afraid's raised eyebrow reaches row 64. Drawing the
# label after the face would slice the top off that brow. 32 clears it.
# Matches face.LABEL_Y for the same reason.
LABEL_Y = 32
STROKE = 6                        # 4

# Geometry for the Blink/Wink/Sleepy modes: a neutral open-eye size plus a
# closed-eye arc (same TOP_HALF-masked ellipse trick as Labs 12, 13, 16).
NEUTRAL_EYE_RADIUS = 39           # 26
CLOSED_EYE_HEIGHT = 21            # 14
CLOSED_EYE_Y = EYE_Y + 11         # 7 * 1.5 = 10.5, rounded up
EYE_BOX = NEUTRAL_EYE_RADIUS + 9  # the +6 margin, scaled

ZZZ_X = 225                       # 150
ZZZ_Y = 261            # below the right eye, clear of the eyebrow -- see lab 16
ZZZ_STEP_X = 18                   # 12
ZZZ_STEP_Y = 30                   # 20
BOB_RANGE = 8                     # 5 * 1.5 = 7.5, rounded up
ZZZ_BOX_X = ZZZ_X - 6
ZZZ_BOX_Y = ZZZ_Y - ZZZ_STEP_Y * 2 - BOB_RANGE - 3
# The Z positions scaled; the letters did not. So the box is the scaled
# travel of the three Z's plus ONE GLYPH of the real 8x16 font plus a
# margin -- not the smartwatch kit's 16 and 20 multiplied by anything.
ZZZ_BOX_W = ZZZ_STEP_X * 2 + FONT.WIDTH + 12
ZZZ_BOX_H = ZZZ_STEP_Y * 2 + BOB_RANGE * 2 + FONT.HEIGHT + 6

AUTO_ADVANCE_MS = 5000      # how long a still face stays up on its own
REPEATING_HOLD_MS = 10000   # modes that replay themselves get longer
REPEAT_MS = 3000            # ...and replay this often while they are up
POST_INPUT_DELAY_MS = 30000


def centered(name, y=LABEL_Y):
    # LABEL_FONT.WIDTH is 16 here, not 8 -- read the real width off the
    # font module and this arithmetic cannot drift out of step with it.
    x = HALF_WIDTH - (len(name) * LABEL_FONT.WIDTH) // 2
    display.text(LABEL_FONT, name, x, y, WHITE, BLACK)


def draw_eye(x, rx, ry, offset=0):
    shapes.ellipse(display, x, EYE_Y, rx, ry, WHITE, FILL)
    shapes.ellipse(display, x + offset, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS,
                   BLACK, FILL)


def draw_eyes(rx, ry, offset=0):
    draw_eye(LEFT_EYE_X, rx, ry, offset)
    draw_eye(RIGHT_EYE_X, rx, ry, offset)


def draw_eyebrow(x, side, tilt, lift):
    y = EYEBROW_Y - lift
    outer_x = x - (EYEBROW_HALF_WIDTH * side)
    inner_x = x + (EYEBROW_HALF_WIDTH * side)
    for offset in range(STROKE):
        display.line(outer_x, y - tilt + offset,
                     inner_x, y + tilt + offset, WHITE)


def draw_eyebrows(tilt_left, tilt_right, lift=0):
    draw_eyebrow(LEFT_EYE_X, 1, tilt_left, lift)
    draw_eyebrow(RIGHT_EYE_X, -1, tilt_right, lift)


def draw_mouth_curve(radius_x, radius_y, mask):
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       radius_x, radius_y, WHITE, NO_FILL, mask)


def draw_mouth_flat(half_width):
    display.fill_rect(HALF_WIDTH - half_width, MOUTH_Y,
                      half_width * 2, STROKE, WHITE)


def draw_mouth_open(radius_x, radius_y):
    shapes.ellipse(display, HALF_WIDTH, MOUTH_Y, radius_x, radius_y,
                   WHITE, FILL)


def draw_mouth_smirk(half_width, side):
    draw_mouth_flat(half_width)
    corner_x = HALF_WIDTH + (half_width * side)
    mask = BOTTOM_RIGHT if side > 0 else BOTTOM_LEFT
    for offset in range(STROKE):
        shapes.ellipse(display, corner_x, MOUTH_Y - 15 - offset, 21, 21,
                       WHITE, NO_FILL, mask)


def draw_happy():
    draw_eyes(36, 36)
    draw_eyebrows(0, 0, lift=8)
    draw_mouth_curve(75, 36, BOTTOM_HALF)


def draw_sad():
    draw_eyes(33, 33)
    draw_eyebrows(-11, -11, lift=0)
    draw_mouth_curve(60, 30, TOP_HALF)


def draw_angry():
    draw_eyes(36, 18)
    draw_eyebrows(18, 18, lift=-8)
    draw_mouth_flat(39)


def draw_afraid():
    draw_eyes(47, 47)
    draw_eyebrows(-18, -18, lift=11)
    draw_mouth_open(23, 33)


def draw_surprised():
    draw_eyes(48, 48)
    draw_eyebrows(0, 0, lift=21)
    draw_mouth_open(30, 39)


def draw_disgusted():
    draw_eyes(33, 23)
    draw_eyebrows(15, -8, lift=-5)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH - 21, MOUTH_Y - offset, 45, 27,
                       WHITE, NO_FILL, TOP_HALF)


def draw_contempt():
    draw_eyes(36, 36)
    draw_eyebrows(0, 0, lift=0)
    draw_mouth_smirk(51, 1)


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
    for offset in range(STROKE):
        shapes.ellipse(display, x, CLOSED_EYE_Y + offset, NEUTRAL_EYE_RADIUS,
                       CLOSED_EYE_HEIGHT, WHITE, NO_FILL, TOP_HALF)


def erase_eye(x):
    display.fill_rect(x - EYE_BOX, EYE_Y - EYE_BOX,
                      EYE_BOX * 2, EYE_BOX * 2, BLACK)


def set_eye(x, closed):
    """Erase one eye's box and redraw it open or shut. This is the only
    thing the blink and wink animations ever touch."""
    erase_eye(x)
    if closed:
        draw_closed_eye(x)
    else:
        draw_eye(x, NEUTRAL_EYE_RADIUS, NEUTRAL_EYE_RADIUS)


def enter_blink(name):
    """Lay down the whole picture once, when the mode starts."""
    display.fill(BLACK)
    draw_mouth_curve(66, 27, BOTTOM_HALF)
    centered(name)
    set_eye(LEFT_EYE_X, False)
    set_eye(RIGHT_EYE_X, False)


def play_blink(name):
    set_eye(LEFT_EYE_X, True)      # both eyes snap shut
    set_eye(RIGHT_EYE_X, True)
    sleep(0.15)                    # a real blink is fast
    set_eye(LEFT_EYE_X, False)     # eyes open again
    set_eye(RIGHT_EYE_X, False)


def play_wink(name):
    set_eye(RIGHT_EYE_X, True)     # right eye closes
    sleep(0.35)                    # hold it long enough to read
    set_eye(RIGHT_EYE_X, False)    # both eyes open, resting


def enter_sleepy(name):
    display.fill(BLACK)
    draw_closed_eye(LEFT_EYE_X)
    draw_closed_eye(RIGHT_EYE_X)
    draw_eyebrows(-8, -8, lift=-8)
    for offset in range(STROKE):
        shapes.circle(display, HALF_WIDTH, MOUTH_Y, 15 - offset,
                      WHITE, NO_FILL)
    centered(name)


def draw_zzz(bob):
    display.fill_rect(ZZZ_BOX_X, ZZZ_BOX_Y, ZZZ_BOX_W, ZZZ_BOX_H, BLACK)
    display.text(FONT, 'Z', ZZZ_X, ZZZ_Y + bob, WHITE, BLACK)
    display.text(FONT, 'Z', ZZZ_X + ZZZ_STEP_X,
                 ZZZ_Y - ZZZ_STEP_Y + bob, WHITE, BLACK)
    display.text(FONT, 'z', ZZZ_X + ZZZ_STEP_X * 2,
                 ZZZ_Y - ZZZ_STEP_Y * 2 + bob, WHITE, BLACK)


def play_sleepy(name):
    for bob in range(-BOB_RANGE, BOB_RANGE + 1):
        draw_zzz(bob)
        sleep(0.08)
    for bob in range(BOB_RANGE, -BOB_RANGE - 1, -1):
        draw_zzz(bob)
        sleep(0.08)


# Name, the function that lays down the mode's static picture, the
# function that plays its animation, how long the mode stays on screen,
# and how often it replays itself while it is up (0 means play once, then
# hold the last frame).
ANIMATED_MODES = (
    ("Blink", enter_blink, play_blink, REPEATING_HOLD_MS, REPEAT_MS),
    ("Wink", enter_blink, play_wink, REPEATING_HOLD_MS, REPEAT_MS),
    ("Sleepy", enter_sleepy, play_sleepy, AUTO_ADVANCE_MS, REPEAT_MS),
)

MODE_COUNT = len(EMOTIONS) + len(ANIMATED_MODES)


def enter_mode(index):
    """Called once, when a mode becomes the current one. This is the only
    place a full display.fill(BLACK) happens."""
    if index < len(EMOTIONS):
        name, draw = EMOTIONS[index]
        display.fill(BLACK)
        draw()
        centered(name)
    else:
        name, enter, play, _, _ = ANIMATED_MODES[index - len(EMOTIONS)]
        enter(name)
        play(name)


def replay_mode(index):
    """Called every REPEAT_MS while an animated mode is up. Touches only
    the boxes that move, never the whole screen."""
    if index < len(EMOTIONS):
        return
    name, enter, play, _, _ = ANIMATED_MODES[index - len(EMOTIONS)]
    play(name)


def hold_ms(index):
    """How long this mode stays up before the demo reel moves on."""
    if index < len(EMOTIONS):
        return AUTO_ADVANCE_MS
    return ANIMATED_MODES[index - len(EMOTIONS)][3]


def repeat_ms(index):
    """How often this mode replays itself; 0 means play once and hold."""
    if index < len(EMOTIONS):
        return 0
    return ANIMATED_MODES[index - len(EMOTIONS)][4]


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

enter_mode(mode_index)

while True:
    now = ticks_ms()

    if pressed(button_a):
        mode_index = (mode_index + 1) % MODE_COUNT
        enter_mode(mode_index)
        wait_for_release(button_a)
        last_change = ticks_ms()      # cooldown starts when the button comes up
        last_repeat = last_change
        advance_delay = POST_INPUT_DELAY_MS

    elif pressed(button_b):
        mode_index = (mode_index - 1) % MODE_COUNT
        enter_mode(mode_index)
        wait_for_release(button_b)
        last_change = ticks_ms()
        last_repeat = last_change
        advance_delay = POST_INPUT_DELAY_MS

    elif ticks_diff(now, last_change) >= advance_delay:
        mode_index = (mode_index + 1) % MODE_COUNT
        enter_mode(mode_index)
        last_change = now
        last_repeat = now
        advance_delay = hold_ms(mode_index)

    # Blink, Wink and Sleepy land here every REPEAT_MS so they play again
    # instead of freezing on their last frame for the rest of the mode's
    # turn. Note that this calls replay_mode(), not enter_mode() -- the
    # background is already on the glass and redrawing it would flicker.
    elif repeat_ms(mode_index) and ticks_diff(now, last_repeat) >= repeat_ms(mode_index):
        replay_mode(mode_index)
        last_repeat = now

    sleep(0.005)
