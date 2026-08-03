# Blinking

A blink is the smallest piece of reflex your robot's face can show, and it is also the first
lesson where the face reacts to *you*. Every earlier lesson drew a shape or ran an animation
on a timer; this one waits — patiently, forever, in a loop — for a human finger to press a
button, and only then closes both eyes and opens them again.

!!! mascot-welcome "Let's make the face react"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    A blink on command is the first time this face listens before it speaks. Every pixel tells a story!

## Blink, Not Wink

Here is the same face with both eyes open, ready to blink:

![The face with both eyes open, before the button is pressed](eyes-open.png)

The [Winking with a Smile](../wink/index.md) lesson closed a single eye to make the face look
playful and deliberate. A blink is almost the opposite:

1. **Both eyes close together.** One eye closing reads as a wink; two eyes closing at the same
   instant reads as a blink — an automatic reflex, not a wink or a signal.
2. **It is fast and involuntary-looking.** A wink can hold for a beat to land the joke. A blink
   should snap shut and pop back open so quickly that a person barely notices it happening,
   which is exactly what makes it feel natural instead of scripted.

!!! mascot-thinking "Same Arc, Different Meaning"
    ![Pixel thinking](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    The closed eye in this lesson is the exact same `TOP_HALF` arc trick from the wink lesson. What changes is *how many eyes* use it and *how long* they stay that way — proof that a small set of drawing tricks can carry a lot of different meaning.

## Drawing Closed Eyes

An open eye is a filled white ellipse with a black pupil ellipse on top. A closed eye reuses
the quadrant-mask trick from the wink lesson: the top half of an `ellipse()`, drawn with the
mask `TOP_HALF` (a value of 3) instead of a full circle.

```py
TOP_HALF = 3  # 1 (top right) + 2 (top left)


def draw_closed_eye(x):
    for offset in range(STROKE):
        oled.ellipse(x, BLINK_Y + offset, EYE_RADIUS, BLINK_RADIUS_Y,
                     WHITE, NO_FILL, TOP_HALF)
```

The `for offset in range(STROKE)` loop draws the same arc three times, each one shifted down a
pixel, so the curve reads as a solid line instead of a faint single-pixel trace. This lesson
calls both eyes with this same function — that is the entire difference between a blink and a
wink in code.

## Reading a Push Button

Every lesson so far has run on its own schedule, driven only by `sleep()`. A button changes
that: the program has to keep checking a pin's state and respond the instant a person presses
it.

A push button wired to a **pull-up** input reads `1` when nothing is touching it and drops to
`0` the moment it is pressed, because pressing the button connects the pin straight to ground.
`Pin.PULL_UP` tells the microcontroller to hold that pin at `1` on its own, so you do not need
an extra resistor on the breadboard.

```py
BUTTON_PIN = 7
button = Pin(BUTTON_PIN, Pin.IN, Pin.PULL_UP)
```

!!! mascot-warning "Pressed Means 0, Not 1"
    ![Pixel warning](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    This trips up almost everyone the first time. With `Pin.PULL_UP`, `button.value()` reads `1` when the button is left alone and `0` when it is pressed — backwards from what most people guess.

Real buttons also **bounce**: the metal contacts inside can touch and separate several times
in the first few milliseconds of a press, which a fast microcontroller can misread as several
presses. The fix is a short pause, called a **debounce**, that lets the signal settle before
you trust it:

```py
def button_pressed():
    if button.value() == 1:
        return False
    sleep(0.02)              # debounce: let the contacts settle
    return button.value() == 0
```

`button_pressed()` only returns `True` if the pin still reads `0` after that short pause —
real presses hold steady through 20 milliseconds of bounce, so this check quietly ignores the
noise.

One more detail matters: without extra code, holding the button down would trigger dozens of
blinks per second. `wait_for_release()` pauses the program until the pin goes back to `1`,
so one press produces exactly one blink no matter how long a finger stays on the button.

```py
def wait_for_release():
    while button.value() == 0:
        sleep(0.01)
```

## Sample Program Code

This program builds the face out of the same small functions as the wink lesson, then adds a
button check to the main loop. `draw_face(True)` closes both eyes; `draw_face(False)` opens
them again.

```py
# Blinking triggered by a button press, on a 128x64 monochrome OLED

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

BUTTON_PIN = 7
button = Pin(BUTTON_PIN, Pin.IN, Pin.PULL_UP)

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

BLINK_RADIUS_Y = 6
BLINK_Y = EYE_Y + 3
STROKE = 3

MOUTH_Y = 46
MOUTH_RADIUS_X = 20
MOUTH_RADIUS_Y = 10


def draw_open_eye(x):
    oled.ellipse(x, EYE_Y, EYE_RADIUS, EYE_RADIUS, WHITE, FILL)
    oled.ellipse(x, EYE_Y, PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def draw_closed_eye(x):
    for offset in range(STROKE):
        oled.ellipse(x, BLINK_Y + offset, EYE_RADIUS, BLINK_RADIUS_Y,
                     WHITE, NO_FILL, TOP_HALF)


def draw_smile():
    for offset in range(STROKE):
        oled.ellipse(HALF_WIDTH, MOUTH_Y - offset, MOUTH_RADIUS_X,
                     MOUTH_RADIUS_Y, WHITE, NO_FILL, BOTTOM_HALF)


def draw_face(blinking):
    oled.fill(BLACK)
    if blinking:
        draw_closed_eye(LEFT_EYE_X)
        draw_closed_eye(RIGHT_EYE_X)
    else:
        draw_open_eye(LEFT_EYE_X)
        draw_open_eye(RIGHT_EYE_X)
    draw_smile()
    oled.show()


def button_pressed():
    if button.value() == 1:
        return False
    sleep(0.02)              # debounce: let the contacts settle
    return button.value() == 0


def wait_for_release():
    while button.value() == 0:
        sleep(0.01)


def blink_once():
    draw_face(True)    # both eyes snap shut
    sleep(0.15)         # a real blink is fast
    draw_face(False)   # eyes open again


draw_face(False)

while True:
    if button_pressed():
        blink_once()
        wait_for_release()
    sleep(0.01)
```

Here's what the display shows the instant a press is detected:

![Sample output of the blinking face](sample-output.png)

!!! mascot-tip "Keep the Main Loop Fast"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    The final `sleep(0.01)` is deliberately tiny. A button check needs to run often enough that a press never slips through between two checks — a slow main loop is the most common reason a button "sometimes doesn't work."

## Things to Try

1. **Make the blink slower.** Change the `sleep(0.15)` in `blink_once()` to `0.6` and watch a
   snappy blink turn into something closer to a sleepy droop.
2. **Add a second button** on a different pin that triggers a wink from the
   [Winking with a Smile](../wink/index.md) lesson instead of a blink, so one robot can do
   both expressions on demand.
3. **Count the presses.** Add a counter variable that increases by one every time
   `blink_once()` runs, and print it so you can see how many times the face has blinked.
4. **Blink on its own too.** Combine this button with a timer so the face blinks automatically
   every few seconds *and* still blinks early whenever the button is pressed — the way real
   eyes work.
5. **Chain it into an emotion.** Trigger the "surprised" face from
   [Emotion Types](../emotion-types/index.md) on the same button, so a press startles the robot
   instead of making it blink.

!!! mascot-celebration "The face just heard you"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    A pull-up pin, a debounce check, and a wait-for-release loop — that's all it takes to turn a button press into a face that reacts. Great expression!

## References

- [MicroPython Machine Module Documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html) — the full `Pin` API, including `Pin.IN` and `Pin.PULL_UP`
- [MicroPython Framebuf Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) — the full `ellipse()` signature, including the quadrant mask parameter
- [Winking with a Smile](../wink/index.md) — where the closed-eye arc and its quadrant mask were first introduced
- [Basic Face Layouts](../basic-face-layouts/index.md) — the eye, mouth, and face proportions this lesson builds on
