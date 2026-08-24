# Drawing Ellipses

Here's the trick behind every curved eyebrow, every smiling mouth, and every eye in this book:
`ellipse()` can draw just one quarter of a shape at a time. Master that and you can build an
entire emotional range out of a single function.

```py
shapes.ellipse(display, x, y, horz_radius, vert_radius, color, fill_flag, quad_code)
```

## What Changed From the OLED Kit

The call now starts with `shapes.ellipse(display, ...)` instead of `oled.ellipse(...)`, and the
reason is worth knowing: **the GC9A01 driver has no ellipse at all.**

`framebuf`'s version was compiled into the MicroPython firmware, in C, for free. This driver is not
built on `framebuf`, so `shapes.py` rebuilds the missing commands in about 200 lines of readable
MicroPython. You can open the file and read the whole thing — one of the lines in it is the ellipse
equation you already know from math class.

| | OLED kit | This kit |
|---|---|---|
| Where the code lives | Compiled into the firmware | `lib/shapes.py`, in MicroPython |
| How you call it | `oled.ellipse(...)` | `shapes.ellipse(display, ...)` |
| Can you read it? | No | Yes — and you should |
| How it fills | Pixel runs inside C | One `hline()` per row |

## The Quadrant Fill Codes

The optional `quad_code` restricts drawing to one or more quarters of the ellipse. Add the numbers
together to combine quarters. These are the same numbers the OLED used, and they still mean the
same thing:

| Code | Quarter | Add them for |
|---|---|---|
| 1 | Top-right | 3 = top half — **a frown** |
| 2 | Top-left | 12 = bottom half — **a smile** |
| 4 | Bottom-left | 6 = left half |
| 8 | Bottom-right | 9 = right half |

!!! mascot-thinking "Two Characters Apart, Opposite Feelings"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Mask 3 is the frown. Mask 12 is the smile. That is the entire difference between a robot that looks pleased to see you and one that looks disappointed in you — and the [Five Broken Faces](../broken-faces/index.md) lab plants that exact bug on purpose.

## Sample Program Code

One plain filled ellipse for reference, then all four half-codes drawn as outlines so each arc
stands on its own.

```py
# Lab 06: Ellipse and Quadrant Fill Codes

import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL
FONT = config.SMALL_FONT

display.fill(BLACK)
display.text(FONT, "Ellipse+Quadrants", 52, 20, WHITE, BLACK)

# a plain filled ellipse for reference
shapes.ellipse(display, 120, 70, 36, 22, WHITE, FILL)

# four quadrant fill codes, drawn as outlines so each arc stands out
QUADRANTS = (
    (3, "top half"),
    (12, "bottom half"),
    (6, "left half"),
    (9, "right half"),
)

x = 54
for code, name in QUADRANTS:
    shapes.ellipse(display, x, 140, 20, 20, WHITE, NO_FILL, code)
    display.text(FONT, str(code), x - 8, 170, WHITE, BLACK)
    x += 44

display.text(FONT, "3=frown 12=smile", 56, 200, WHITE, BLACK)
```

Here's what that program draws on the display:

![A solid white ellipse near the top, and below it a row of four arcs labeled 3, 12, 6 and 9 — a downward-curving frown arc, an upward-curving smile arc, and two side arcs — with the caption 3=frown 12=smile](sample-output.png)

Read that row left to right. Code 3 curves like a frown, code 12 curves like a smile, and codes 6
and 9 are the left and right halves you will use for a smirk.

!!! mascot-tip "Thicken Every Curve"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    A one-pixel arc on a 240-pixel screen reads as a scratch, not a mouth. Every face in this kit draws its curves four times, one pixel apart — look for `for offset in range(STROKE)` in the face labs.

## Things to Try

1. **Turn the frown into a smile.** Change the first quadrant code from 3 to 12 and watch the arc
   flip. Two characters, opposite mood.
2. **Read the source.** Open `lib/shapes.py` and find the loop inside `ellipse()`. It walks one row
   at a time and draws a horizontal run. That single design decision is worth about 10x, and the
   [How Fast Is a Face?](../draw-speed-timing/index.md) lab measures it.
3. **Make it slow on purpose.** Change the fill branch in `shapes.py` to use `display.pixel()` in a
   loop and run this lab again. Same picture, visibly slower — you just found where the speed lives.
4. **Combine three quarters.** What does code 7 draw? Predict before you run it.

## References

- [Drawing Circles](../circle/index.md) — the special case where both radii are equal
- [The Emotion Table](../emotion-table/index.md) — where the quadrant code becomes one column of a data table
- [Five Broken Faces](../broken-faces/index.md) — the inverted-mask bug, planted on purpose
