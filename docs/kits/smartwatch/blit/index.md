# Blitting Buffers

`blit_buffer()` stamps a whole block of pixels onto the display in one shot. Draw a sprite once
into a buffer in RAM, then copy it wherever — and however many times — you need it.

```py
display.blit_buffer(buffer, x, y, width, height)
```

This is also where the color display's **memory budget** shows up for the first time, and the
arithmetic explains something about this entire kit.

## Two Bytes Per Pixel Changes Everything

On the OLED, a sprite was one **bit** per pixel. Here it is two **bytes** — sixteen times bigger.

| Sprite | OLED (1 bit/px) | This display (RGB565, 2 bytes/px) |
|---|---|---|
| A 64 × 48 eye | 384 bytes | **6,144 bytes** |
| A full screen | 1,024 bytes | **115,200 bytes** |
| RP2040 RAM, total | 264 KB | 264 KB |

Look at that last column. A full-screen buffer would be 115,200 bytes out of the 264 KB an RP2040
has — most of what MicroPython leaves free. **That is the real reason this driver has no frame
buffer, and the reason there is no `show()` anywhere in this kit.**

!!! mascot-thinking "Every Constraint in This Kit Comes From That Number"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    No frame buffer means no `show()`, which means every drawing call lands on the glass immediately, which means erasing has to be careful and animations only redraw what moved. One arithmetic fact, and the whole kit is shaped by it.

## blit_buffer() Is Opaque

`framebuf`'s `blit()` took a `key` color to skip, so you could stamp a sprite over a background and
let the background show through. This driver has no such option — `blit_buffer()` sends a solid
rectangle of pixels, background and all.

So `shapes.blit_keyed()` does it the hard way: it walks each row, finds the runs of non-key pixels,
and sends only those. Read it and you will know exactly what `framebuf` was doing for you.

| | `display.blit_buffer()` | `shapes.blit_keyed()` |
|---|---|---|
| What it sends | One command, then the whole block | One command per run, per row |
| Background pixels | Painted over whatever was there | Skipped |
| Speed | Fast | Noticeably slower |
| Use it when | The sprite sits on a known background | The sprite must sit on top of something |

## Sample Program Code

The program builds one eye in an off-screen buffer, then stamps it four times — twice on plain
black, and twice over a striped background so you can see exactly what each kind of blit covers up.

```py
# Lab 09: Blitting Buffers

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
FILL = config.FILL
FONT = config.SMALL_FONT
TRANSPARENT = BLACK

EYE_WIDTH = 64
EYE_HEIGHT = 48


class Sprite:
    """A tiny stand-in for the display that draws into a buffer instead.

    shapes.ellipse() only ever calls hline(), so that is all this needs."""

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
shapes.ellipse(eye, 32, 24, 30, 22, WHITE, FILL)
shapes.ellipse(eye, 32, 24, 12, 12, BLACK, FILL)

display.fill(BLACK)
display.text(FONT, "blit_buffer", 76, 14, WHITE, BLACK)

# top: stamp the same eye buffer twice to get a matching pair.
display.blit_buffer(eye.buffer, 42, 40, EYE_WIDTH, EYE_HEIGHT)
display.blit_buffer(eye.buffer, 134, 40, EYE_WIDTH, EYE_HEIGHT)

# bottom: a striped background so you can see what each blit covers up
for y in range(110, 210, 6):
    display.hline(30, y, 180, WHITE)

# left, plain blit_buffer: the eye's black background paints over the
# stripes, because the sprite is a solid rectangle of pixels
display.blit_buffer(eye.buffer, 34, 128, EYE_WIDTH, EYE_HEIGHT)

# right, blit_keyed: black pixels are skipped, so the stripes show through
shapes.blit_keyed(display, eye.buffer, 142, 128,
                  EYE_WIDTH, EYE_HEIGHT, TRANSPARENT)
```

Here's what that program draws on the display:

![Two identical eyes stamped side by side on black at the top, and below them a band of horizontal stripes where the left eye sits in a solid black rectangle that blocks the stripes while the right eye lets the stripes run through the space around it](sample-output.png)

Compare the two bottom eyes carefully. The left one carries a black rectangle with it and punches a
hole in the stripes. The right one lets the stripes run right up to the edge of the eye, because
every black pixel in the sprite was skipped.

## The Sprite Class Is Worth Stealing

Look at what `Sprite` actually is: an object with `hline()` and `pixel()` methods that writes into
a bytearray instead of a display. `shapes.ellipse()` cannot tell the difference and does not need
to — it just calls `hline()` on whatever it was handed.

That is a trick worth remembering well beyond this lab. Any drawing function that only talks to an
interface can be pointed at something other than a screen.

!!! mascot-warning "Transparency Is Not a Property of a Color"
    ![Pixel warns you](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Black is not special here. `blit_keyed()` skips whatever color you point it at, so if you build your sprite on a red background and pass red as the key, red becomes the transparent one. The key is a choice you make, not a fact about the pixel.

## Things to Try

1. **Do the memory arithmetic yourself.** Work out the byte cost of the eye sprite (64 × 48 × 2),
   then a full-screen buffer, and compare both to an RP2040's 264 KB.
2. **Time the two bottom blits.** The plain one sends one command and 6,144 bytes. The keyed one
   sends a command per run, per row. Measure the gap — that is the price of asking about every pixel.
3. **Change the sprite's background to `config.RED`** and pass that as the key. Same behavior,
   different color skipped.
4. **Blit the eye eight times** in a ring around the center. One buffer, eight stamps, and no
   ellipse math after the first one.

## References

- [Drawing Ellipses](../ellipse/index.md) — the function that draws into the sprite buffer
- [Color and Bits](../color-bits/index.md) — what those two bytes per pixel actually contain
- [Only Redraw What Changed](../partial-redraw/index.md) — the other answer to "how do I avoid sending the whole screen?"
