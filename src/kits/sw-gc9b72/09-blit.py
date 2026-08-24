# Lab 09: Blitting Buffers
# display.blit_buffer(buffer, x, y, width, height) stamps a block of
# pixels onto the display in one shot. Draw a sprite once into a buffer,
# then copy it wherever (and however many times) you need it.
#
# This is where the color display's memory budget shows up for the first
# time, and this panel makes the point harder than the smartwatch kit's
# did. On the OLED, a sprite was one BIT per pixel. Here it is two BYTES
# per pixel -- sixteen times bigger -- and there are 2.25 times as many
# pixels to cover, because 360x360 is 129,600 pixels against 240x240's
# 57,600.
#
# Run the arithmetic yourself, because it is the whole lesson:
#
#   this eye sprite      96 * 72 * 2   =  13,824 bytes
#   a full-screen buffer 360 * 360 * 2 = 259,200 bytes
#   an RP2040 has        264 KB        = 270,336 bytes, TOTAL
#
# A frame buffer for this screen would be 96% of every byte of RAM on the
# chip, before MicroPython's own interpreter, heap, and your program take
# their share. It is not tight. It is impossible. That is the real reason
# this driver has no frame buffer, and the reason there is no show().
#
# (The smartwatch kit's 240x240 buffer would have been 115,200 bytes --
# also unaffordable, but only about 43% of RAM. Scaling the screen by 1.5
# scaled the buffer by 2.25.)
#
# The other difference: blit_buffer() is OPAQUE. framebuf's blit() took a
# `key` color to skip, so you could stamp a sprite over a background.
# This driver has no such option, so shapes.blit_keyed() does it the hard
# way -- finding the runs of non-key pixels and sending those. Read it
# and you will know exactly what framebuf was doing for you.

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
FILL = config.FILL
FONT = config.SMALL_FONT
TRANSPARENT = BLACK

# --- build one eye in an off-screen buffer ---------------------------
#
# shapes.sprite() hands back a bytearray of RGB565 pixels. To draw into
# it we need something that behaves like a display, so Sprite below wraps
# the buffer and offers the three calls shapes.ellipse() actually uses.
#
# 96 x 72 is the smartwatch kit's 64 x 48 scaled by 1.5. The buffer it
# needs went up by 2.25x, from 6,144 bytes to 13,824 -- an area cost, not
# a width cost, which is the arithmetic that bites you every time you make
# a sprite "just a little bigger."

EYE_WIDTH = 96              # 64 on the smartwatch kit
EYE_HEIGHT = 72             # 48 on the smartwatch kit


class Sprite:
    """A tiny stand-in for the display that draws into a buffer instead.

    shapes.ellipse() only ever calls hline(), so that is all this needs.
    Passing this to a drawing function instead of the real display is a
    trick worth remembering -- the drawing code cannot tell the
    difference, and does not need to."""

    def __init__(self, width, height, background=BLACK):
        self.width = width
        self.height = height
        self.buffer = shapes.sprite(width, height, background)

    def hline(self, x, y, length, color):
        if y < 0 or y >= self.height:
            return
        for column in range(max(0, x), min(self.width, x + length)):
            shapes.sprite_pixel(self.buffer, self.width, column, y, color)

    def pixel(self, x, y, color):
        if 0 <= x < self.width and 0 <= y < self.height:
            shapes.sprite_pixel(self.buffer, self.width, x, y, color)


eye = Sprite(EYE_WIDTH, EYE_HEIGHT)
shapes.ellipse(eye, 48, 36, 45, 33, WHITE, FILL)
shapes.ellipse(eye, 48, 36, 18, 18, BLACK, FILL)

display.fill(BLACK)

# "blit_buffer" is 11 characters of a fixed 8x16 font, so it is 88 px wide
# here exactly as it was on the smaller screen. Only the centering moved.
CAPTION = "blit_buffer"
display.text(FONT, CAPTION,
             config.CENTER_X - (len(CAPTION) * FONT.WIDTH) // 2, 21,
             WHITE, BLACK)

# top: stamp the same eye buffer twice to get a matching pair. One buffer,
# two trips down the wire, and no ellipse math either time.
#
# A sprite is a RECTANGLE and this screen is a CIRCLE, so the outer top
# corners of these two blits land right on the edge of the safe circle,
# about 168 px from center. Nothing is lost -- those corner pixels are the
# sprite's black background -- but you are still paying SPI bytes to send
# black to a place no one can see it. That is the tax on every rectangular
# blit near the rim of a round display.
display.blit_buffer(eye.buffer, 63, 60, EYE_WIDTH, EYE_HEIGHT)
display.blit_buffer(eye.buffer, 201, 60, EYE_WIDTH, EYE_HEIGHT)

# bottom: a striped background so you can see what each blit covers up.
#
# The smartwatch kit's band ran from y=110 to y=210. Scaled by 1.5 that is
# y=165 to y=315 -- but this band is 270 px wide, and a 270 px row down at
# y=312 sticks out about 9 px past the physical edge of the glass. So the
# band stops before y=280 instead: 279 is the last row on which a 270 px
# span still fits inside config.SAFE_RADIUS. Scaling a rectangle on a
# round screen does not just make it bigger, it walks its corners off the
# display.
for y in range(165, 280, 9):
    display.hline(45, y, 270, WHITE)

# left, plain blit_buffer: the eye's black background paints over the
# stripes, because the sprite is a solid rectangle of pixels
display.blit_buffer(eye.buffer, 51, 192, EYE_WIDTH, EYE_HEIGHT)

# right, blit_keyed: black pixels are skipped, so the stripes show
# through. Watch how much slower it is -- that is the price of asking
# about every pixel instead of shipping the whole block. It asks about
# 6,912 pixels here (96 * 72) where the smartwatch kit asked about 3,072.
shapes.blit_keyed(display, eye.buffer, 213, 192,
                  EYE_WIDTH, EYE_HEIGHT, TRANSPARENT)

# Things to try:
#
# 1. Work out the byte cost of the eye sprite: 96 * 72 * 2 = 13,824. Then
#    work out what a full-screen buffer would cost -- 360 * 360 * 2 --
#    and compare that to the 264 KB of RAM on an RP2040, most of which
#    MicroPython is already using. Then do the same sums for the
#    smartwatch kit's 64 x 48 sprite and 240 x 240 screen, and notice that
#    a 1.5x change in width is a 2.25x change in bytes.
#
# 2. Time the two bottom blits. The plain one sends one command and 13,824
#    bytes. The keyed one sends a command per run, per row -- 72 rows now
#    instead of the smartwatch kit's 48, with the same two-runs-per-row
#    shape, so it pays half again as many command overheads. How much
#    slower it actually is on THIS panel is not something this kit has
#    measured; run it and find out.
#
# 3. Make the sprite's background RED instead of BLACK and pass that as
#    the key. Transparency is not a property of a color -- it is whichever
#    color you point at.
