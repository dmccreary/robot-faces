# Eye Scanner

A pupil that drifts slowly back and forth is one of the cheapest, most convincing signals a robot
can send — it reads instantly as **thinking**. This lab builds that sweep by looping an `x` offset
and redrawing both pupils on every step, dozens of times a second.

It is also the lab where this kit's color display changes the rules for good. The strategy it
teaches — touch only the pixels that actually moved — is not a trick saved for later here. It is
how every animation in this book works from this point on.

!!! mascot-welcome "Watch me look around"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Moving eyes are the first thing that makes a screen feel like a face instead of a picture of one. Let's make some pixels move.

## Why This Lab Can't Wipe the Screen

On the OLED kit, every frame started with `oled.fill(BLACK)` and nobody worried about the cost —
the wipe happened in a RAM frame buffer, and the screen only ever saw the finished picture.

**This display has no frame buffer at all.** A full wipe means pushing all 129,600 pixels — 259,200
bytes of RGB565 color — down the SPI wire, one command at a time, and you watch it happen. Do that
on every frame and the animation flickers hard and crawls.

So this lab erases only the two eye boxes instead:

| Approach | Pixels repainted per frame | Result |
|---|---|---|
| Wipe the whole screen | 129,600 | Visible flicker, low frame rate |
| Erase two eye boxes | 23,184 | Smooth, no flicker, identical picture |

Under a fifth of the work for the same result — the same ratio the
[1.2" kit's eye scanner](../../smartwatch/eye-scanner/index.md) gets from its own two boxes, just
at a quarter the raw pixel count (10,304 out of 57,600 there, versus 23,184 out of 129,600 here).
Scale the screen up and the *ratio* doesn't move — only the absolute cost does. On this hardware
that saving is not an optimization you save for later — it is the price of admission, which is why
it arrives at lab 11 instead of waiting for lab 29.

## Sample Program Code

Notice the split: `draw_static_parts()` runs once, and `draw_eyes()` runs on every frame and
touches nothing but the two eye boxes.

```py
# Lab 11: Eye Scanner

import config
import shapes
from utime import sleep

display = config.init_display()
ON = config.WHITE
OFF = config.BLACK
FILL = config.FILL
NO_FILL = config.NO_FILL

HALF_WIDTH = config.WIDTH // 2

PUPIL_RANGE = 45
EYE_Y = 150
EYE_WIDTH = 66
EYE_HEIGHT = 39
PUPIL_RADIUS = 15
LEFT_EYE_X = 105
RIGHT_EYE_X = 255
MOUTH_Y = 252
MOUTH_WIDTH = 84
STROKE = 6

# The box each eye lives in. Erasing this much and no more is what keeps
# the animation smooth. The 3 px of slack is what the smartwatch kit's
# 2 px becomes at this scale -- scale the eye and forget the box, and the
# leftovers pile up at the edges as ghost trails.
EYE_BOX_X = EYE_WIDTH + 3
EYE_BOX_Y = EYE_HEIGHT + 3

# Erasing paints black on black, so the most important thing this program
# does is invisible. Change this to config.RED and run it again: the two
# boxes your program repaints every frame light up, with the eyes drawn on
# top of them, and everything the program leaves alone stays black.
#
# It costs nothing. A red pixel and a black pixel are both two bytes.
ERASE_COLOR = OFF


def draw_eye(x, offset):
    shapes.ellipse(display, x, EYE_Y, EYE_WIDTH, EYE_HEIGHT, ON, FILL)
    shapes.ellipse(display, x + offset, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS,
                   OFF, FILL)


def draw_mouth():
    # bottom half of an ellipse (mask 12 = 4 + 8)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_WIDTH, 36, ON, NO_FILL, 12)


def draw_static_parts():
    """Everything that does not move. Drawn once, then left alone."""
    display.fill(OFF)
    draw_mouth()


def draw_eyes(offset):
    """Only the part that changes: erase the two eye boxes and rebuild
    them. The mouth is already correct on the glass from before."""
    for x in (LEFT_EYE_X, RIGHT_EYE_X):
        display.fill_rect(x - EYE_BOX_X, EYE_Y - EYE_BOX_Y,
                          EYE_BOX_X * 2, EYE_BOX_Y * 2, ERASE_COLOR)
        draw_eye(x, offset)


draw_static_parts()

delay = 0.01
while True:
    for offset in range(-PUPIL_RANGE, PUPIL_RANGE):
        draw_eyes(offset)
        sleep(delay)
    for offset in range(PUPIL_RANGE, -PUPIL_RANGE, -1):
        draw_eyes(offset)
        sleep(delay)
```

Here is one frame of the animation, with both pupils sitting near the center of their sweep:

![Two wide oval white eyes with dark pupils near the center of their sweep, above a wide upward-curving smile](sample-output.png)

The mouth in that picture was drawn exactly once, before the loop started. Every frame after that
touched only the two rectangles around the eyes.

## Make the Invisible Visible

Here is the best trick in this kit. Erasing paints black onto black, so the single most important
thing your program does is completely invisible.

Change one line:

```py
ERASE_COLOR = config.RED
```

Now every box your program repaints lights up as a red rectangle with the eyes drawn on top of it,
and everything the program leaves alone stays black. You can *see* your optimization working.

!!! mascot-thinking "Color Is Free Here"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A red pixel and a black pixel are both two bytes of RGB565 here, same as ever. Making my program explain itself costs nothing — a bug you can see beats a bug you can only reason about.

## What This Costs on Real Hardware

Most labs in this kit have only run in a simulator that proves they draw inside the screen bounds
and nothing more. Lab 11 is the exception. A separate measurement session ran the exact code above
on a real Raspberry Pi Pico wired to a real GC9B72 panel and counted exactly what one frame costs:

| What lab 11 does each frame | Cost |
|---|---|
| Blank two 138 × 84 eye boxes | 23,184 pixels |
| Rebuild both white eye ellipses | 16,310 pixels |
| Draw both pupils back on top | 1,458 pixels |
| **Total** | **40,952 pixels in 222 drawing calls** |

One frame took **455 milliseconds** — about **two frames per second**. That is measured, on-glass
data, not an estimate, and it is slow enough to see with your own eyes: the sweep will visibly step
rather than glide.

Every one of those 222 drawing calls carries a fixed cost before a single pixel moves down the
wire, which turns out to be exactly the problem
[Making the Eye Scanner Fast](../eye-scanner-speedup/index.md) solves next — taking this same lab
from 455 ms down to 4.2 ms per frame.

## Things to Try

1. **Break it the OLED way.** Replace `draw_eyes()` with a version that calls `display.fill(OFF)`
   and redraws everything. Run it. The flicker and the frame rate together are the answer to "why
   does this kit care about partial redraw so early?"
2. **Shrink the erase box** to just the pupil's travel and see whether it still looks right. It
   will not, quite — and finding out why is the point.
3. **Change `EYE_WIDTH` to 75** without touching `EYE_BOX_X` and watch leftovers pile up at the
   edges. An erase box has to be sized for the largest thing that can appear in it.
4. **Do exercise 3 again with `ERASE_COLOR = config.RED`.** Now the leftover pixels are visibly
   *outside* a rectangle you can see the edges of. That is debugging made easy, for free.

## References

- [Drawing Rectangles](../rect/index.md) — where `fill_rect()` as an eraser was introduced
- [Only Redraw What Changed](../partial-redraw/index.md) — the same idea, measured in microseconds
- [Five Broken Faces](../broken-faces/index.md) — where a missing erase becomes a bug to diagnose
- [Eye Scanner](../../smartwatch/eye-scanner/index.md) — the same lab on the smaller 1.2" kit, at a quarter the pixels
- [Making the Eye Scanner Fast](../eye-scanner-speedup/index.md) — this exact lab, measured and sped up from 455 ms to 4.2 ms per frame
