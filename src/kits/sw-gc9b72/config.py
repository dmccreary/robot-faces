# Hardware configuration for the sw-gc9b72 kit: a Raspberry Pi Pico wired to
# a 2.1" 360x360 round GC9B72 SPI display.
#
# Every numbered lab in this folder imports this file instead of repeating
# pin numbers, so the whole kit only needs to be described in one place.
#
# The display's silkscreen reads "Driver IC: GC9B72, Resolution: 360x360" --
# the 640x640 figure on some AliExpress listings for this panel is wrong.

from machine import Pin, SPI
import gc9b72
from gc9b72 import color565

WIDTH = 360
HEIGHT = 360

# Pico + bare GC9B72 module, on SPI0.
#
# The 10-pad breakout reads (left to right): GND VCC SDA SCL RST DC CS BL
# SDO TE. Only 8 of those are wired -- SDO (read-back) and TE (frame
# tearing sync) are not used by this driver and left unconnected.
#
#   Module pin   Pico pin   Wire color
#   ----------   --------   ----------
#   SCL / CLK    GP2        orange
#   SDA / MOSI   GP3        yellow
#   RST          GP4        green
#   DC           GP5        blue
#   CS           GP6        purple
#   BL           GP7        gray
#   VCC          3V3        red
#   GND          GND        black
SPI_ID = 0
SCK_PIN = 2
MOSI_PIN = 3
RST_PIN = 4
DC_PIN = 5
CS_PIN = 6
BL_PIN = 7

# GP25 is the onboard LED on a Raspberry Pi Pico. Lab 00 blinks it.
LED_PIN = 25

# Two momentary push buttons on free GPIO. Each button's other leg goes to
# GND, and PULL_UP holds the pin at 1 until a press pulls it to 0.
#
# GP14 and GP15 are the first free pins above the display's GP2-GP7 block,
# and they are the same pair the smartwatch kit lists for a Pico on a
# breadboard. Labs 13 and up read them.
#
# An UNCONNECTED pull-up pin reads 1 forever, which is exactly what "not
# pressed" looks like -- so a button lab with no buttons wired does not
# crash, it just sits on its first screen and never advances. If a lab
# seems frozen, check the wiring before you check the code.
BUTTON_A_PIN = 14
BUTTON_B_PIN = 15

# Conservative first-bring-up speed -- but READ THE NEXT PARAGRAPH before
# you try to raise it, because "nudge it up and see" does not work here.
#
# THE NUMBER YOU ASK FOR IS ALMOST NEVER THE NUMBER YOU GET. The RP2040
# derives its SPI clock by dividing the peripheral clock, and MicroPython
# rounds DOWN to the nearest rate it can actually produce. Measured on a
# Pico running MicroPython 1.28, the peripheral clock is 48 MHz, so the
# only rungs on the ladder near the top are 48/6, 48/4 and 48/2:
#
#     you ask for      you get
#     10_000_000        8_000_000
#     16_000_000       12_000_000
#     20_000_000       12_000_000
#     23_000_000       12_000_000
#     24_000_000       24_000_000   <- the ceiling on this chip
#     48_000_000       24_000_000
#
# Between 12 and 24 MHz there is NOTHING. Asking for 20 quietly hands you
# 12 and you never find out, which is exactly the sort of bug that makes
# an optimization look like it did nothing. To read back what you really
# got, print the SPI object -- its repr() carries the true baud rate:
#
#     from machine import Pin, SPI
#     print(SPI(0, baudrate=24_000_000, sck=Pin(2), mosi=Pin(3)))
#
# WHAT IT BUYS. Measured with eye-scanner-sprite.py, which sends 4,712
# bytes per frame in 2 calls, on a Pico with 20 cm ribbon cables:
#
#      8 MHz    8.1 ms per frame     6.7 Mbit/s delivered
#     12 MHz    6.9 ms per frame    10.1 Mbit/s delivered
#     24 MHz    4.6 ms per frame    20.2 Mbit/s delivered
#
# The delivered rate is about 84% of the wire rate at every rung, so the
# clock is real -- this is not a knob that only looks like it does
# something. See spi-cost.py, which measures all of this on your board.
#
# 24 MHz is what this kit now ships at, confirmed working on 20 cm ribbon
# cables with no speckling or tearing. If your own wiring is longer or
# messier and you see speckled pixels or torn frames, step down to
# 12_000_000 -- and remember there is no rung between 12 and 24, so
# anything you type in between just gives you 12.
BAUDRATE = 24_000_000

# RGB565: five bits of red, six of green, five of blue, packed into 16
# bits. color565(red, green, blue) builds any color from three ordinary
# 0-255 values, and it is re-exported above so labs can use config.color565().
BLACK = 0x0000
WHITE = 0xFFFF
RED = 0xF800
GREEN = 0x07E0
BLUE = 0x001F
YELLOW = 0xFFE0
CYAN = 0x07FF
MAGENTA = 0xF81F

# Fill flags for shapes.ellipse() / shapes.poly() -- outline vs. solid.
NO_FILL = 0
FILL = 1

# The geometry of a round screen. The driver addresses a 360x360 square,
# but only the circle inscribed in it is visible -- draw in the corners
# and you're spending SPI bytes on pixels under the bezel that no one
# will ever see.
CENTER_X = WIDTH // 2       # 180
CENTER_Y = HEIGHT // 2      # 180
RADIUS = WIDTH // 2         # 180 -- the physical edge of the glass

# A starting estimate, not a measurement: scaled from the smartwatch
# kit's GC9A01 panel (SAFE_RADIUS = RADIUS - 8 out of a 120 px radius),
# not yet confirmed against this panel's actual bezel. Look at
# shapes.ring(display, CENTER_X, CENTER_Y, SAFE_RADIUS, ...) on real
# hardware and nudge this in or out until the ring just clears the rim.
SAFE_RADIUS = 168


def inside_circle(x, y, margin=0):
    """True if (x, y) is somewhere you will actually be able to see it.

    Use this when placing something near the rim and you're not sure
    whether the bezel will eat it."""
    dx = x - CENTER_X
    dy = y - CENTER_Y
    limit = SAFE_RADIUS - margin
    return dx * dx + dy * dy <= limit * limit


# Fonts live in lib/ alongside the driver. Like the GC9A01 driver, this one
# has no built-in font -- text() takes a font MODULE as its first argument.
import vga1_8x16 as SMALL_FONT       # 8 x 16 -- 45 characters across
import vga1_bold_16x32 as BIG_FONT   # 16 x 32 -- 22 characters across

_backlight = None


def init_display():
    """Start the SPI bus and the GC9B72. Returns the display object."""
    global _backlight

    spi = SPI(SPI_ID, baudrate=BAUDRATE,
              sck=Pin(SCK_PIN), mosi=Pin(MOSI_PIN))

    _backlight = Pin(BL_PIN, Pin.OUT)

    return gc9b72.GC9B72(
        spi,
        dc=Pin(DC_PIN, Pin.OUT),
        cs=Pin(CS_PIN, Pin.OUT),
        reset=Pin(RST_PIN, Pin.OUT),
        backlight=_backlight,
        rotation=0)


def set_backlight(on):
    """Turn the backlight on or off. Returns True -- this board always has
    a software-controlled BL pin, unlike some bare GC9A01 modules."""
    _backlight.value(1 if on else 0)
    return True


def init_buttons():
    """Set up both push buttons. Returns (button_a, button_b).

    PULL_UP means each pin idles at 1 and reads 0 while pressed, so the
    labs test for `button.value() == 0`."""
    button_a = Pin(BUTTON_A_PIN, Pin.IN, Pin.PULL_UP)
    button_b = Pin(BUTTON_B_PIN, Pin.IN, Pin.PULL_UP)
    return button_a, button_b
