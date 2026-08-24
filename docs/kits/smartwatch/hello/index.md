# Hello World

A "Hello World!" program is the first thing you write on any new project. The goal is not to build
anything impressive — it is to prove that your tools, your wiring, and your board all agree with
each other before you start counting on them.

This one does that, and it also introduces the single biggest surprise in this kit for anyone
coming from the [OLED kit](../../oled/hello-world/index.md).

## The Shared Configuration File

Every lab in this kit imports one shared file, `config.py`, which holds the hardware facts — which
pin the clock is on, how big the screen is, where the center of the circle sits. Keeping those
numbers in one place means the labs stay short and you only ever fix a wiring change once.

```py
import config

display = config.init_display()
```

`init_display()` starts the SPI bus, resets the GC9A01 controller, and hands you back a display
object. From that point on, everything you draw goes through it.

## Text Needs a Font Module

Here is the line that trips up everyone porting code from the OLED kit:

```py
display.text(config.SMALL_FONT, "Hello World!", 72, 80, config.WHITE, config.BLACK)
#            ^^^^^^^^^^^^^^^^^ not optional
```

The SSD1306 driver was built on MicroPython's `framebuf` module, which ships a fixed 8 by 8 font
compiled into the firmware. **This driver has no built-in font at all.** So `text()` takes a font
**module** as its first argument, and `config.py` imports two of them for you:

| Constant | Module | Size | Characters across the widest part |
|---|---|---|---|
| `config.SMALL_FONT` | `vga1_8x16.py` | 8 × 16 | 30 |
| `config.BIG_FONT` | `vga1_bold_16x32.py` | 16 × 32 | 15 |

Both font modules live in `lib/` on the board, and they are **not optional** — `config.py` will
not even import without them.

!!! mascot-thinking "There Is No show() on This Display"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    On the OLED, drawing poked bits into a RAM buffer and `show()` shipped the whole thing to the glass. This driver has no buffer — every call goes straight down the wire. So there is no `show()` to forget, and no `show()` to call. Your text is already on the screen before the next line of code runs.

## Sample Program Code

Two lines of text, one in each font, so you can compare them side by side on real glass.

```py
# Lab 01: Hello World
# Confirms the display is wired correctly and MicroPython can run code on it.

import config

display = config.init_display()

display.fill(config.BLACK)

# The small font: 8 pixels wide, 16 tall, so 30 characters fit across the
# widest part of the screen.
display.text(config.SMALL_FONT, "Hello World!", 72, 80,
             config.WHITE, config.BLACK)

# The big font: 16 x 32, readable from across the room, 15 characters max.
display.text(config.BIG_FONT, "ROBOT", 80, 120,
             config.WHITE, config.BLACK)

# Nothing else to do. There is no show() on this display -- both lines
# were already on the glass before this comment was reached.
```

Here's what that program draws on the display:

![Hello World in the small font above the word ROBOT in the large bold font, centered on the round screen](sample-output.png)

## Why Both Numbers in text() Matter More Here

The last two arguments are the foreground and background colors, and this driver really does paint
that background behind every character. That turns out to be useful: it is the cheapest way to
overwrite a short string with another one of the same length.

It is also a trap in the other direction. Because there is no frame buffer, **text overprints — it
does not replace.** Draw "9" where "10" used to be and the "1" stays on the glass forever. The
[Reading Two Buttons](../buttons/index.md) lab makes you hit that one on purpose.

!!! mascot-warning "If Nothing Appears, Don't Start Rewiring Yet"
    ![Pixel warns you](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Run the [Connection Test](../connection-test/index.md) first. It imports nothing from this kit, so it still works when the driver or the fonts are missing — which tells you instantly whether the trouble is the board or the display.

## Things to Try

1. **Move the text off the edge.** Change the small font's x from 72 to 0 and run it again. The
   first few characters vanish under the bezel, because on a round screen the left margin is not a
   straight line.
2. **Count characters.** Write a 15-character string in `BIG_FONT` at y=120, then try 16. The
   sixteenth character has nowhere to go.
3. **Swap the colors.** Pass `config.BLACK` as the foreground and `config.WHITE` as the background
   for one line, and watch the driver paint a solid white box with black letters cut out of it.

## References

- [Screen Coordinates](../screen-coordinates/index.md) — where on this round screen text is actually safe to put
- [Reading Two Buttons](../buttons/index.md) — where overprinted text becomes a bug you have to fix
- [OLED Hello World](../../oled/hello-world/index.md) — the same lab on the monochrome kit, for comparison
