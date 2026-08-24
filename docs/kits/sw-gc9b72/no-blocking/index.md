# Don't Block the Loop

Every animation so far has paced itself with `sleep()`, which is simple and completely freezes the
program while it waits. This lab swaps `sleep()` for `ticks_ms()` so the face can blink on its own
schedule while the main loop stays free to do other things — like watch a button.

It is the single most important structural idea in embedded programming, and this kit has a second
version of it that the OLED kit never needed.

## The Pattern

Instead of *waiting* for time to pass, you *check whether* it has passed and keep going either way.

```py
while True:
    now = ticks_ms()

    if not blinking and ticks_diff(now, last_blink) >= BLINK_EVERY_MS:
        blinking = True
        blink_started = now
        set_eyes(True)

    if blinking and ticks_diff(now, blink_started) >= BLINK_HOLD_MS:
        blinking = False
        last_blink = now
        set_eyes(False)

    # this loop never calls sleep(), so this spot is free for a button
    # check, a second animation, or anything else that needs to run often
```

Use `ticks_diff(now, then)` rather than plain subtraction. MicroPython's millisecond counter wraps
around when it runs out of room, and `ticks_diff()` handles that correctly while `now - then` gives
you a large negative number at the worst possible moment.

| Approach | While waiting, the program can… | Cost |
|---|---|---|
| `sleep(4)` | nothing at all | Missed buttons, frozen animations |
| `ticks_ms()` check | do anything else in the loop | A few lines of bookkeeping |

!!! mascot-thinking "A Slow Draw Blocks Exactly As Hard As a Sleep"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here is the part the OLED kit never had to think about. `display.fill(BLACK)` pushes 259,200 bytes — 129,600 pixels at two bytes each — and nothing else in my program runs while it does. Non-blocking timing and small redraws are two halves of one idea; neither is enough on its own.

## Sample Program Code

The face blinks by itself every four seconds. Nothing in the loop ever sleeps.

```py
import config
import shapes
from utime import ticks_ms, ticks_diff

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

TOP_HALF = 3
BOTTOM_HALF = 12

HALF_WIDTH = config.WIDTH // 2
EYE_SPACING = 72                          # 48 on the smartwatch kit
LEFT_EYE_X = HALF_WIDTH - EYE_SPACING
RIGHT_EYE_X = HALF_WIDTH + EYE_SPACING
EYE_Y = 150            # 100 on the smartwatch kit
EYE_RADIUS = 42        # 28
PUPIL_RADIUS = 15      # 10
BLINK_RADIUS_Y = 21    # 14
BLINK_Y = EYE_Y + 11   # EYE_Y + 7
STROKE = 6             # 4
MOUTH_Y = 252          # 168
MOUTH_RADIUS_X = 72    # 48
MOUTH_RADIUS_Y = 36    # 24

EYE_BOX = EYE_RADIUS + 6

# MILLISECONDS ARE NOT PIXELS. Every distance in this file grew by 1.5
# crossing to the bigger panel; these two did not change at all, because
# a blink that looked right at four seconds still looks right at four
# seconds. Scale the geometry, leave the clock alone.
BLINK_EVERY_MS = 4000  # how often the face blinks on its own
BLINK_HOLD_MS = 150    # how long the eyes stay shut


def draw_open_eye(x):
    shapes.ellipse(display, x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    shapes.ellipse(display, x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_closed_eye(x):
    for offset in range(STROKE):
        shapes.ellipse(display, x, BLINK_Y + offset, EYE_RADIUS,
                       BLINK_RADIUS_Y, WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH, MOUTH_Y - offset,
                       MOUTH_RADIUS_X, MOUTH_RADIUS_Y,
                       WHITE, NO_FILL, BOTTOM_HALF)


def set_eyes(blinking):
    for x in (LEFT_EYE_X, RIGHT_EYE_X):
        display.fill_rect(x - EYE_BOX, EYE_Y - EYE_BOX,
                          EYE_BOX * 2, EYE_BOX * 2, BLACK)
        if blinking:
            draw_closed_eye(x)
        else:
            draw_open_eye(x)


display.fill(BLACK)
draw_smile()
set_eyes(False)

blinking = False
last_blink = ticks_ms()
blink_started = 0

while True:
    now = ticks_ms()

    if not blinking and ticks_diff(now, last_blink) >= BLINK_EVERY_MS:
        blinking = True
        blink_started = now
        set_eyes(True)

    if blinking and ticks_diff(now, blink_started) >= BLINK_HOLD_MS:
        blinking = False
        last_blink = now
        set_eyes(False)

    # this loop never calls sleep(), so this spot is free for a button
    # check, a second animation, or anything else that needs to run often
```

Here's the face between blinks:

![A face with two round white eyes, each with a dark circular pupil punched out of its center, above a thin curved smile](sample-output.png)

## Two Ways to Block, One Symptom

This is the idea worth carrying out of the lab. A program can be too slow for two completely
different reasons, and they look identical from the outside:

| Cause | What it looks like | Where you meet it |
|---|---|---|
| A `sleep()` in the loop | Buttons get ignored, animation stutters | This lab, and lab 25's bug 5 |
| A draw call that sends too many pixels | Buttons get ignored, animation stutters | Every full-screen wipe on this display |

Identical symptoms, unrelated causes. That is exactly why the [Trace and Watch](../trace-and-watch/index.md)
lab builds an instrument instead of asking you to guess.

## Things to Try

1. **Break it the interesting way.** Replace `set_eyes()` with a version that does
   `display.fill(BLACK)` and redraws the smile too. The loop still never sleeps — but it is now
   blocked on every blink, the same problem wearing a different hat. Wrap both versions in
   `ticks_us()` and print the difference: nobody has measured that on this panel, so whatever
   number you get is new, not a repeat of one from this book.
2. **Work out what the two eye boxes cost against a full fill.** Each box is 96×96 px, so two of
   them are 18,432 pixels — against 129,600 for the whole screen. That ratio is the entire reason
   for the small-redraw pattern, and it is arithmetic, not a measurement.
3. **Add a second timer** that nudges the mouth wider every 1.5 seconds. Two independent animations
   in one loop, with no threads and no interrupts, is the payoff for this whole pattern.
4. **Add a button check** in the free spot at the bottom of the loop. It will respond instantly,
   which the [blinking lab](../blink/index.md) could not manage.

## References

- [Blinking](../blink/index.md) — the blocking version of the same animation
- [Trace and Watch](../trace-and-watch/index.md) — an on-screen instrument for measuring what this lab describes
- [Only Redraw What Changed](../partial-redraw/index.md) — the other half of staying responsive on this display
- [Don't Block the Loop (1.2" smartwatch kit)](../../smartwatch/no-blocking/index.md) — the same pattern on the smaller panel, where a full-screen wipe costs 115,200 bytes instead of 259,200
