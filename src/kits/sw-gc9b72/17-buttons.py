# Lab 17: Reading Two Buttons
# Both buttons on this kit are wired the same way as the single button in
# the Blinking lab: PULL_UP inputs that read 1 when idle and 0 when
# pressed, because the other leg of each button goes to GND. This lab
# reads them independently and shows a running count for each.
#
# Text lines are centered rather than left-aligned at x=4. On a round
# screen a left margin is not a straight line -- how far in the text has
# to start depends on how far down the screen it is.
#
# THE ERASE BOX IS THE LESSON. There is no frame buffer here, so text
# does not replace what was under it -- it overprints. Every count has to
# blank its own strip before it draws, and that strip has to be exactly
# as tall as the letters.
#
# That last word matters more on this panel than it did on the 240x240
# one, because every ROW POSITION in this file is the smartwatch kit's
# value times 1.5 and the FONTS ARE NOT. They are fixed bitmaps: 8x16 and
# 16x32, the same glyphs on both panels. So the erase height below comes
# from font.HEIGHT -- a real 16 or a real 32 -- and never from a scaled
# number. Scale 16 by 1.5 and you get 24, which erases eight rows of
# whatever sits underneath; use 16 where the big font is drawing and you
# leave the bottom half of every letter behind. Positions scale. Glyphs
# do not.

import config
from utime import sleep

display = config.init_display()
button_a, button_b = config.init_buttons()

WHITE = config.WHITE
BLACK = config.BLACK
FONT = config.SMALL_FONT       # 8 x 16 -- the dense readout font
TITLE_FONT = config.BIG_FONT   # 16 x 32 -- readable from across the room
HALF_WIDTH = config.WIDTH // 2

TITLE_Y = 105    # 70 on the smartwatch kit
A_ROW_Y = 165    # 110
B_ROW_Y = 210    # 140


def centered(font, string, y):
    """Draw one centered line, erasing the strip it lands in first.

    The font comes in as an argument for one reason: both the centering
    and the erase depend on it. font.WIDTH sets where the line starts,
    and font.HEIGHT sets how many rows to blank. Ask the font and you
    cannot get either one wrong."""
    x = HALF_WIDTH - (len(string) * font.WIDTH) // 2

    # Erase the whole strip first, so a shorter number does not leave a
    # digit from the longer one behind it. font.HEIGHT is the glyph's
    # real height -- 16 here, 32 for the title -- not a scaled number.
    #
    # The strip runs the full 360 px even though the ends of it are under
    # the bezel. Erasing more than you need is always safe; erasing less
    # never is. Trimming it to the circle's width at this row would save
    # a few hundred bytes of SPI and is a fine exercise, but get the
    # arithmetic slightly wrong and you are back to ghosted digits.
    display.fill_rect(0, y, config.WIDTH, font.HEIGHT, BLACK)
    display.text(font, string, x, y, WHITE, BLACK)


def pressed(button):
    if button.value() == 1:
        return False
    sleep(0.02)              # debounce: let the contacts settle
    return button.value() == 0


def wait_for_release(button):
    while button.value() == 0:
        sleep(0.01)


def show_counts(a_count, b_count):
    centered(FONT, "A (GP14): " + str(a_count), A_ROW_Y)
    centered(FONT, "B (GP15): " + str(b_count), B_ROW_Y)


display.fill(BLACK)
centered(TITLE_FONT, "Two Buttons", TITLE_Y)

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
# 2. Change font.HEIGHT in the fill_rect() to the literal 16 and run the
#    title through it. The title is drawn in the 16x32 font, so blanking
#    16 rows clears the top half of each letter and leaves the bottom
#    half sitting there. That is the same bug as rule 1, only halfway:
#    an erase box that is the wrong SIZE fails as surely as no box.
#
# 3. The driver's text() takes a background color, and it really does
#    paint that background behind each character. Try passing WHITE as
#    the background for one row to see it -- and notice it paints only
#    the glyph cells, which is why it is not a substitute for the
#    fill_rect(): it cannot erase a digit the new string is too short to
#    cover.
