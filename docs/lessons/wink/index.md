# Winking with a Smile

A wink is the smallest expression in this whole book, and it might be the most powerful one. Change a single eye from a filled circle into a short curved line, leave the smile alone, and the face stops looking friendly and starts looking like it is *in on something with you*. That is a lot of meaning for about six lines of code.

!!! mascot-welcome "Let's draw a wink"
    ![Pixel waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    A wink says "I'm joking" or "this is our secret" without a single word. Every pixel tells a story!

## What Makes a Wink Read as a Wink

Two rules do almost all the work here:

1. **Only one eye changes.** If both eyes close at the same time, your robot is blinking, not winking. The open eye is what makes the closed one look deliberate.
2. **The smile has to stay.** A closed eye on a neutral face reads as sleepy or broken. Paired with a smile, the same closed eye reads as playful.

Here is the same face with both eyes open, so you can see exactly how little changes:

![The same face with both eyes open](both-eyes-open.png)

## Drawing a Closed Eye with a Quadrant Mask

An open eye in these lessons is a filled white ellipse with a black pupil ellipse drawn on top of it. A closed eye is not a shape at all — it is an **arc**, a curved line that traces part of a shape's edge instead of the whole thing.

The `ellipse()` function has an optional seventh parameter called a **quadrant mask**. It is a number whose bits decide which of the four quarters of the ellipse actually get drawn. Add the values together to combine quarters:

| Value | Quadrant drawn |
|--|--|
| 1 | Top right |
| 2 | Top left |
| 4 | Bottom left |
| 8 | Bottom right |

So `1 + 2 = 3` gives you just the top half — an arc that curves upward like `⌒`. That upward curve is exactly the shape a human eye makes when it squeezes shut in a happy wink. And `4 + 8 = 12` gives you just the bottom half, which is the smile you already know from the earlier face lessons.

```py
TOP_HALF = 3      # 1 (top right) + 2 (top left)
BOTTOM_HALF = 12  # 4 (bottom left) + 8 (bottom right)
```

!!! mascot-thinking "One function, two expressions"
    ![Pixel thinking](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    The winking eye and the smiling mouth are the same `ellipse()` call with different masks — 3 curves up, 12 curves down. Flip that one number and happy becomes sad.

## Making Thin Curves Visible

A single-pixel arc almost disappears on a 128x64 display, especially from across a room. The fix is to draw the same arc a few times, each one shifted down by one pixel, which stacks into a thicker stroke:

```py
STROKE = 3

def draw_winking_eye(x):
    for offset in range(STROKE):
        oled.ellipse(x, WINK_Y + offset, EYE_RADIUS, WINK_RADIUS_Y,
                     WHITE, NO_FILL, TOP_HALF)
```

Because `STROKE` is a named constant, you can make every curve on the face thicker or thinner by changing one number.

## Sample Program Code

This program builds the whole face out of three small functions, then calls `draw_face(True)` to draw the winking version. Passing `False` instead gives you the both-eyes-open face shown above.

```py
# Winking with a smile on a 128x64 monochrome OLED

from machine import Pin
from utime import sleep
import ssd1306

WIDTH = 128
HEIGHT = 64

clock = Pin(2)  # SCL
data = Pin(3)   # SDA
RES = machine.Pin(4)
DC = machine.Pin(5)
CS = machine.Pin(6)

spi = machine.SPI(0, sck=clock, mosi=data)
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, DC, RES, CS)

WHITE = 1
BLACK = 0
NO_FILL = 0
FILL = 1

TOP_HALF = 3      # 1 (top right) + 2 (top left)
BOTTOM_HALF = 12  # 4 (bottom left) + 8 (bottom right)

HALF_WIDTH = int(WIDTH / 2)

EYE_SPACING = 26
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 22
EYE_RADIUS = 12
PUPIL_RADIUS = 4

WINK_RADIUS_Y = 6
WINK_Y = EYE_Y + 3
STROKE = 3

MOUTH_Y = 46
MOUTH_RADIUS_X = 20
MOUTH_RADIUS_Y = 10


def draw_open_eye(x):
    oled.ellipse(x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    oled.ellipse(x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_winking_eye(x):
    for offset in range(STROKE):
        oled.ellipse(x, WINK_Y + offset, EYE_RADIUS, WINK_RADIUS_Y,
                     WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        oled.ellipse(HALF_WIDTH, MOUTH_Y - offset, MOUTH_RADIUS_X,
                     MOUTH_RADIUS_Y, WHITE, NO_FILL, BOTTOM_HALF)


def draw_face(winking):
    oled.fill(BLACK)
    draw_open_eye(LEFT_EYE_X)
    if winking:
        draw_winking_eye(RIGHT_EYE_X)
    else:
        draw_open_eye(RIGHT_EYE_X)
    draw_smile()
    oled.show()


draw_face(True)
```

Here's what that program draws on the display:

![Sample output of the winking face](sample-output.png)

## Animating the Wink

A wink that never opens back up is just a face with one eye missing. The motion is what people actually read, and the timing matters more than the drawing. A real wink closes fast, holds for a moment, then opens fast.

The `draw_face()` function already takes a `winking` flag, so animating it is just a matter of alternating that flag with different sleep times:

```py
def wink_once():
    draw_face(True)   # eye snaps shut
    sleep(0.35)       # hold the wink just long enough to be seen
    draw_face(False)  # eye opens again
    sleep(2.5)        # normal face until the next wink


while True:
    wink_once()
```

!!! mascot-tip "Hold it long enough to land"
    ![Pixel giving a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Under about 0.2 seconds a wink looks like a glitch, and over about 0.6 seconds it looks like your robot fell asleep. Start at 0.35 and adjust from there.

The long pause between winks is doing real work too. A robot that winks constantly stops meaning anything by it, while one that winks every few seconds feels like it is reacting to something.

!!! mascot-warning "Clear the screen every frame"
    ![Pixel warning](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    `draw_face()` starts with `oled.fill(BLACK)` for a reason. Skip it and the open eye draws right on top of the wink arc, leaving a smudge that looks like neither.

## Things to Try

1. **Wink the other eye.** Swap which eye gets `draw_winking_eye()` and watch how differently the face feels.
2. **Change the mask from 3 to 12** on the winking eye. The arc now curves down, and your playful wink turns into something much more suspicious.
3. **Adjust `WINK_RADIUS_Y`** from 6 up to 10. A taller arc reads as a squint; a flatter one reads as a fully shut eye.
4. **Add a wink to the smile.** Raise one end of the mouth by drawing the bottom-right quadrant (mask 8) one pixel higher than the bottom-left quadrant (mask 4), for a lopsided smirk.
5. **Trigger the wink from a button** using what you learned in the [Interactions](../interactions/index.md) lesson, so your robot winks when someone presses it.

!!! mascot-celebration "You just built a personality"
    ![Pixel celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    One arc, one flag, and one well-timed pause — that's all it took to make a machine look like it's sharing a joke with you. Great expression!

## References

- [MicroPython Framebuf Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) — the full `ellipse()` signature, including the quadrant mask parameter
- [Ellipse Lesson](../ellipse/index.md) — where the six core `ellipse()` parameters are introduced
- [Basic Face Layouts](../basic-face-layouts/index.md) — the eye, mouth, and face proportions this lesson builds on
