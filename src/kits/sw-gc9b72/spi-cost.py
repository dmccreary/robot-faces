# What Does a Drawing Call Actually Cost?
#
# Run this, change config.BAUDRATE, run it again. It answers the question
# that decides every optimization in this kit: when you send pixels to
# this panel, are you paying for the CALL or for the BYTES?
#
# Those two bills behave completely differently:
#
#   Paying for calls   Send more pixels in fewer calls. This is what
#                      turned eye-scanner-fast.py's 118 ms frame into
#                      eye-scanner-sprite.py's 8 ms one -- 2.7 times the
#                      pixels, 38 times fewer calls, 14 times faster.
#
#   Paying for bytes   Send fewer pixels, and raise the SPI clock. Small
#                      sprites, tighter bounding boxes, fewer colors on
#                      the wire.
#
# Guessing wrong means optimizing the half that was never the problem.
#
# WHAT THIS MEASURES
#
# The cost of a drawing call is a straight line: a fixed setup charge,
# plus so much per byte.
#
#     time = fixed + (bytes x cost_per_byte)
#
# Two points on that line give you both numbers. A 2-byte blit is
# essentially pure setup, so it measures `fixed` directly. The slope
# between the two largest blits measures `cost_per_byte`, and 8 divided
# by that is the throughput the wire is really delivering -- which you
# can compare against the baud rate you asked for.
#
# HOW TO READ THE ANSWER
#
# Run it at 8, 12 and 24 MHz -- the three rates this chip can actually
# produce (see config.py; asking for 10 or 20 gets you something else).
#
#   If the effective Mbit/s roughly tracks the baud rate, the wire is the
#   limit and a faster clock buys real time.
#
#   If it does NOT move -- if two different baud rates deliver the same
#   Mbit/s -- then the transfer is limited by how fast MicroPython can
#   push bytes into the SPI peripheral, not by the clock on the wire. No
#   baud rate will fix that, and the only lever left is fewer bytes.
#
# WHAT IT SAID ON ONE BOARD
#
# A Pico with 20 cm ribbon cables, MicroPython 1.28, measured with this
# program. Your board is the one that matters, but this is the shape to
# expect:
#
#     actual SPI   fixed per call   per byte   delivered
#       8 MHz         ~1,150 us     1.185 us    6.7 Mbit/s
#      12 MHz         ~1,150 us     0.791 us   10.1 Mbit/s
#      24 MHz         ~1,150 us     0.396 us   20.2 Mbit/s
#
# Two things to notice. The delivered rate is about 84% of the wire rate
# at every step, so the clock is a real lever. And the fixed cost per
# call does not move AT ALL -- roughly a millisecond, whatever the baud
# rate, because it is chip-select and command bytes and MicroPython, not
# transfer. A millisecond per call is the single most important number
# in this kit: it is why 76 small calls cost 118 ms and 2 big ones cost 8.
#
# BEFORE YOU BELIEVE ANY OF IT: check that the board is running the
# config.py you think it is. Editing config.py on your laptop changes
# nothing until it is uploaded, and a lab that imports the OLD config
# will happily report the OLD speed forever. The first two lines this
# program prints are there to catch exactly that -- the first is what
# your config.py says, the second is what the RP2040's SPI hardware
# actually settled on, which is usually NOT the number you asked for.
# The RP2040 divides a 48 MHz peripheral clock and rounds down, so the
# rungs near the top are 8, 12 and 24 MHz and nothing in between -- ask
# for 20 and you get 12. config.py has the measured ladder.

import config
import shapes
from machine import Pin, SPI
from utime import ticks_us, ticks_diff

# Built the same way config.init_display() builds it, purely so its
# repr() can be printed. Re-configuring the peripheral with identical
# settings is harmless -- the display keeps working afterward.
probe = SPI(config.SPI_ID, baudrate=config.BAUDRATE,
            sck=Pin(config.SCK_PIN), mosi=Pin(config.MOSI_PIN))

display = config.init_display()

REPEATS = 20

# Increasing blit sizes, in (width, height). The 32 x 31 row is the
# actual sprite eye-scanner-sprite.py stamps, so its line in the table is
# that lab's per-call cost, measured rather than predicted.
BLITS = ((1, 1), (32, 16), (32, 31), (64, 32), (64, 64), (128, 64))

MAX_W = 128
MAX_H = 64

# One allocation, reused for every size. Slicing a bytearray COPIES it --
# a 16 KB copy per call would be timing the copy, not the transfer -- so
# the slices below are taken from a memoryview, which does not copy.
buffer = shapes.sprite(MAX_W, MAX_H, config.BLUE)
view = memoryview(buffer)


def time_blit(width, height):
    """Average microseconds for one blit_buffer() of this size."""
    size = width * height * 2
    x = (config.WIDTH - width) // 2
    y = (config.HEIGHT - height) // 2
    chunk = view[:size]

    start = ticks_us()
    for _ in range(REPEATS):
        display.blit_buffer(chunk, x, y, width, height)
    return ticks_diff(ticks_us(), start) // REPEATS


def time_fill_rect():
    """Average microseconds for one fill_rect() of a single pixel --
    the same call eye-scanner-fast.py makes 76 times a frame."""
    x = config.CENTER_X
    y = config.CENTER_Y
    start = ticks_us()
    for _ in range(REPEATS):
        display.fill_rect(x, y, 1, 1, config.WHITE)
    return ticks_diff(ticks_us(), start) // REPEATS


display.fill(config.BLACK)

print()
print("config.BAUDRATE :", config.BAUDRATE)
print("SPI reports     :", probe)
print()
print("   bytes   us/call")

results = []
for width, height in BLITS:
    size = width * height * 2
    us = time_blit(width, height)
    results.append((size, us))
    print("%8d  %8d" % (size, us))

fill_us = time_fill_rect()
print()
print("one fill_rect(1, 1) :", fill_us, "us")

# The line through the two largest blits. Using the largest two keeps the
# fixed cost from dominating the slope.
small_bytes, small_us = results[-2]
big_bytes, big_us = results[-1]
per_byte = (big_us - small_us) / float(big_bytes - small_bytes)
fixed = results[0][1]

print("fixed cost per call :", fixed, "us")
print("cost per byte       : %.3f us" % per_byte)
if per_byte > 0:
    print("effective throughput: %.1f Mbit/s" % (8.0 / per_byte))
    print("baud rate requested : %.1f Mbit/s" % (config.BAUDRATE / 1e6))

print()
print("A 1984-byte sprite should therefore cost about %d us." %
      (fixed + int(1984 * per_byte)))
print("eye-scanner-sprite.py sends two of those per frame.")

# Things to try:
#
# 1. Set config.BAUDRATE to 10_000_000, then 20_000_000, then
#    24_000_000, uploading config.py each time, and put the three
#    "effective throughput" lines side by side. Two lessons for the price
#    of one: the clock is a real lever, AND the first two runs did not
#    use the rate you asked for. Compare the two lines this program
#    prints at the top to catch it.
#
# 2. Compare "fixed cost per call" against the cost per byte. Multiply
#    the fixed cost by 76 -- eye-scanner-fast.py's call count -- and see
#    how much of that lab's frame was overhead before you ever sent a
#    pixel.
#
# 3. If the throughput does NOT track the baud rate, the interesting
#    question becomes where the bytes are actually going. Try REPEATS at
#    1 and at 200: if the per-call number changes, you are seeing
#    MicroPython's garbage collector, not the display.
