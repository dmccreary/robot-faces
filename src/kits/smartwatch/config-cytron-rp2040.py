# Hardware configuration for the Smartwatch (GC9A01) kit.
# Every numbered lab in this folder imports this file instead of repeating
# pin numbers, so the whole kit only needs to be described in one place.
#
# The display is a 240x240 round IPS LCD driven by a GC9A01 controller over
# SPI. Three things about it are different from the OLED kit, and every
# other difference in this folder follows from these:
#
#   1. IT IS ROUND. The driver still addresses a 240x240 square of pixels,
#      but the bezel hides the corners. Anything outside the circle is
#      drawn, paid for, and never seen. See SAFE_RADIUS below.
#   2. IT IS COLOR. A pixel is a 16-bit RGB565 number, not a 0 or a 1.
#      WHITE is 0xFFFF and BLACK is 0x0000, which is why this kit's faces
#      still look like the OLED kit's faces.
#   3. THERE IS NO FRAME BUFFER. The SSD1306 driver kept the whole screen
#      in RAM and shipped it to the glass when you called show(). This
#      driver has no RAM to spare for 115,200 bytes, so every drawing call
#      goes straight down the wire. There is no show() in this kit. What
#      you draw appears immediately -- and costs immediately.

from machine import Pin, SPI
import gc9a01
from gc9a01 import color565

WIDTH = 240
HEIGHT = 240

# --------------------------------------------------------------------
# WHICH BOARD?
#
# Set BOARD to match what is on your desk. Everything below this line
# follows from it, and nothing else in the kit needs to change.
#
#   "pico"      Raspberry Pi Pico wired to a bare GC9A01 module.
#               This is the kit's default and the wiring that has been
#               CONFIRMED WORKING on real hardware.
#
#   "waveshare" Waveshare RP2040-LCD-1.28 -- an RP2040 with the round
#               display soldered on. Pin numbers taken from the board's
#               documentation; not yet run here.
#
BOARD = "pico"

if BOARD == "pico":
    # Pico + bare GC9A01 module, on SPI0.
    #
    # These are deliberately the same five pins the OLED kit uses, in the
    # same order down the breadboard rail, so a student who has already
    # built the OLED kit can swap the display and keep their wiring
    # habits. Only the last three change meaning: the OLED's RES/DC/CS on
    # 4/5/6 become the GC9A01's DC/CS/RST.
    #
    #   Module pin   Pico pin
    #   ----------   --------
    #   SCL / CLK    GP2
    #   SDA / MOSI   GP3
    #   DC           GP4
    #   CS           GP5
    #   RST          GP6
    #   VCC          3V3
    #   GND          GND
    #   BL           3V3 (tied on, see BL_PIN below)
    SPI_ID = 0
    SCK_PIN = 2
    MOSI_PIN = 3
    DC_PIN = 4
    CS_PIN = 5
    RES_PIN = 6

    # Most bare GC9A01 modules have their backlight permanently on -- the
    # BL pad is tied to 3V3 on the board, or you wired it there yourself.
    # Nothing in software can dim it, so BL_PIN is None and
    # set_backlight() below quietly does nothing.
    #
    # Want software control? Move the module's BL wire off 3V3 and onto a
    # free GPIO, then set BL_PIN to that pin number.
    BL_PIN = None

    # GP25 is the onboard LED on a Raspberry Pi Pico. Lab 00 blinks it.
    LED_PIN = 25

else:
    # Waveshare RP2040-LCD-1.28. The display is soldered to the board, so
    # these are fixed. Note GP10/GP11 are SPI1, not SPI0.
    SPI_ID = 1
    SCK_PIN = 10           # LCD_CLK
    MOSI_PIN = 11          # LCD_DIN
    DC_PIN = 8             # LCD_DC
    CS_PIN = 9             # LCD_CS
    RES_PIN = 12           # LCD_RST

    # On this board GP25 is the BACKLIGHT, not an LED. Any Pico code that
    # toggles GP25 "to blink the onboard LED" will strobe your screen.
    BL_PIN = 25

    # ...and there is no user LED at all.
    LED_PIN = None

# 60 MHz is confirmed working on the "pico" wiring above, including over
# ordinary M-F Dupont jumpers. If you see speckled pixels or torn frames
# -- usually from long, loose, or bundled wires -- step down to
# 20_000_000 and work back up.
BAUDRATE = 60_000_000

# Two momentary push buttons on free GPIO. Each button's other leg goes to
# GND, and PULL_UP holds the pin at 1 until a press pulls it to 0. These
# are the same pin numbers the OLED kit uses, and both are free on either
# board above.
BUTTON_A_PIN = 20
BUTTON_B_PIN = 21

# RGB565: five bits of red, six of green, five of blue, packed into 16
# bits. The kit draws white on black, but the others are here so you can
# experiment -- and so you can see that BLACK really is just "no light".
#
# color565(red, green, blue) builds any other color from three 0-255
# values, and it is re-exported above so labs can use config.color565().
BLACK = 0x0000
WHITE = 0xFFFF
RED = 0xF800
GREEN = 0x07E0
BLUE = 0x001F
YELLOW = 0xFFE0
CYAN = 0x07FF
MAGENTA = 0xF81F

NO_FILL = 0
FILL = 1

# The geometry of a round screen. The driver addresses a 240x240 square,
# but only the circle inscribed in it is visible.
CENTER_X = WIDTH // 2      # 120
CENTER_Y = HEIGHT // 2     # 120
RADIUS = WIDTH // 2        # 120 -- the physical edge of the glass

# Keep drawing inside this radius. The last few pixels at the rim sit
# under the bezel or curve away from you, so a pixel at radius 119 is
# technically lit and practically invisible.
SAFE_RADIUS = 112

# Fonts live in lib/ alongside the driver. Unlike framebuf, this driver
# has no built-in font -- text() takes a font MODULE as its first
# argument, so you have to pick one and import it.
import vga1_8x16 as SMALL_FONT      # 8 x 16 -- 30 characters across
import vga1_bold_16x32 as BIG_FONT  # 16 x 32 -- 15 characters across

_backlight = None


def init_display():
    """Start the SPI bus and the GC9A01. Returns the display object.

    The backlight pin is only handed to the driver when the board has one
    under software control. Passing it matters on those boards: the
    driver turns it on at the end of initialization, and a GC9A01 with
    its backlight low draws everything correctly and shows you a black
    circle."""
    global _backlight

    spi = SPI(SPI_ID, baudrate=BAUDRATE,
              sck=Pin(SCK_PIN), mosi=Pin(MOSI_PIN))

    if BL_PIN is None:
        _backlight = None
    else:
        _backlight = Pin(BL_PIN, Pin.OUT)

    return gc9a01.GC9A01(
        spi,
        dc=Pin(DC_PIN, Pin.OUT),
        cs=Pin(CS_PIN, Pin.OUT),
        reset=Pin(RES_PIN, Pin.OUT),
        backlight=_backlight,
        rotation=0)


def set_backlight(on):
    """Turn the backlight on or off, where the board allows it.

    Returns True if it actually did something. On a module whose BL pad is
    tied to 3V3 there is no pin to toggle, so this is a no-op -- which is
    worth knowing before you spend an afternoon wondering why your
    brightness control does nothing."""
    if _backlight is None:
        return False
    _backlight.value(1 if on else 0)
    return True


def init_buttons():
    button_a = Pin(BUTTON_A_PIN, Pin.IN, Pin.PULL_UP)
    button_b = Pin(BUTTON_B_PIN, Pin.IN, Pin.PULL_UP)
    return button_a, button_b


def inside_circle(x, y, margin=0):
    """True if (x, y) is somewhere you will actually be able to see it.

    Use this when you are placing something near the rim and are not sure
    whether the bezel will eat it."""
    dx = x - CENTER_X
    dy = y - CENTER_Y
    limit = SAFE_RADIUS - margin
    return dx * dx + dy * dy <= limit * limit
