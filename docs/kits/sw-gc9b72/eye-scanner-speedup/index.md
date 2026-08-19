# Making the Eye Scanner Fast

A pupil sweeping back and forth is one of the most useful signals a robot can send. Put it on a
collision-avoidance robot: the robot drives up to a wall, backs away, and scans its eyes left and
right before turning. Anyone watching reads that instantly as *the robot is deciding*.

That trick only works if the eyes move at a believable speed. The version of the eye scanner in
lab 11 is far too slow, and this page is the story of making it **more than 100 times faster** —
not by guessing, but by putting a stopwatch inside the program and letting it point at the slow
part.

!!! mascot-welcome "Let's find out where the time goes"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Every pixel tells a story, and so does every microsecond. The best part of this one is that we guessed wrong twice — and the measurements told us both times.

## The Program We Started With

Lab 11 already does one smart thing: instead of wiping the whole screen, it erases just the two
boxes the eyes live in. On this display that matters enormously, because there is **no frame
buffer** — no copy of the picture in memory. Every pixel you draw travels down a wire to the panel
one at a time, and you watch it arrive.

But look at what it still does on every single frame:

| What lab 11 does each frame | Cost |
|---|---|
| Blank two 138 x 84 eye boxes | 23,184 pixels |
| Rebuild both white eye ellipses | 16,310 pixels |
| Draw both pupils back on top | 1,458 pixels |
| **Total** | **40,952 pixels in 222 drawing calls** |

All of that to move a pupil a few pixels sideways. It flickers visibly, and the sweep crawls.
Timed on a real board, one frame takes **455 milliseconds** — about two frames per second. Hold
on to that number, because everything below is measured against it.

## Step 1: Put a Stopwatch in the Loop

Here is the move that makes everything else on this page possible. Before changing a single line
of drawing code, **make the program report how long it takes.**

MicroPython gives you `ticks_us()`, which returns a running clock in microseconds — millionths of
a second. You subtract two readings with `ticks_diff()`, which handles the moment the counter
rolls over back to zero. Wrap only the part you want to measure, add up several frames, and print
the average:

```py
from utime import ticks_us, ticks_diff

start = ticks_us()
move_pupils(offset, target)                 # the only thing being timed
total_us += ticks_diff(ticks_us(), start)

frames += 1
if frames == 90:
    print("pupil move:", total_us // frames, "us per frame")
    frames = 0
    total_us = 0
```

Averaging over 90 frames matters. A single frame bounces around, but 90 of them give a number
steady enough to compare against the next version you write.

!!! mascot-tip "Measure first, optimize second"
    ![Pixel gives a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Four lines of timing code taught us more than an hour of reading the program. Without them, we would have "fixed" the wrong thing twice and never known.

## Step 2: Repaint Only the Pupils' Edges

The first idea is the obvious one. Since only the pupils move, why repaint the eyes at all?

When a solid circle slides sideways by `dx` pixels, only two thin crescents actually change. The
**leading edge** is the strip the pupil just covered, and it needs to become black. The **trailing
edge** is the strip the pupil just left behind, and it needs to go back to eye-white. Everything
between them was black before and is still black.

On each row of the pupil, both of those strips are exactly `dx` pixels wide:

```py
if dx > 0:
    for row, height, edge in PUPIL_SPANS:
        display.fill_rect(old_x + edge + 1, row, dx, height, PUPIL_COLOR)
        display.fill_rect(old_x - edge, row, dx, height, TRAIL_COLOR)
```

That is [`eye-scanner-fast.py`](https://github.com/dmccreary/robot-faces/blob/master/src/kits/sw-gc9b72/eye-scanner-fast.py),
and on paper it looks like a triumph. It sends **330 times fewer pixels** than lab 11.

Then we ran it with the stopwatch in place:

```
pupil move: 118117 us per frame
```

**118 milliseconds.** After cutting the pixels by 330 times. Something in our picture of this
program was badly wrong.

## Step 3: Divide, and Watch the Theory Collapse

When a measurement makes no sense, divide it by something. We knew this version made exactly 76
drawing calls per frame, so:

```
118 ms ÷ 76 calls = 1.55 ms per call
```

One and a half **milliseconds** to draw a run seven pixels long. Now count the other side of the
ledger: 860 pixels is 1,720 bytes, which is about 1.4 ms of actual wire time. So **98% of the
frame was spent on something other than pixels.**

That something is the fixed price of a drawing call. Before a single pixel of yours moves, the
driver has to send a CASET command naming the columns, a RASET command naming the rows, a RAMWR
command saying "here comes pixel data," and toggle the chip-select line four times. You pay that
whether you then send 7 pixels or 7,000.

!!! mascot-thinking "You were optimizing the cheap half"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Pixels are not the bill on this display — calls are. Once we knew that, the fix went from "send fewer pixels" to almost exactly the opposite.

This also explained something odd we could see. At larger step sizes, faint trails appeared at the
top and bottom of each pupil. Nothing was wrong with the final picture — we checked every pixel
against a full redraw and they matched exactly. A 118 ms frame simply lasts about seven screen
refreshes, so the panel kept showing the pupil **half-moved**, over and over. We were watching the
redraw happen.

## Step 4: Send More Pixels, in Fewer Calls

If calls are expensive and bytes are cheap, then the right move is to stop being clever about
pixels and get greedy about calls.

A pupil that moves `STEP` pixels only ever disturbs one rectangle: `2r+1+STEP` wide and `2r+1`
tall, covering both where the pupil *was* and where it is *going*. Every pixel inside that
rectangle is either pupil-black or eye-white — and we know which one before the program even
starts.

So build that rectangle once in memory, as a **sprite**: a small block of pixels stored in RAM,
two bytes per pixel, ready to be shipped in one piece. Then stamp it with a single call:

```py
display.blit_buffer(sprite, left, SPRITE_TOP, SPRITE_W, SPRITE_H)
```

`blit_buffer()` sends a whole rectangle in one command sequence. Two eyes, two calls, whole frame
done. That is
[`eye-scanner-sprite.py`](https://github.com/dmccreary/robot-faces/blob/master/src/kits/sw-gc9b72/eye-scanner-sprite.py):

| Version | Pixels per frame | Calls per frame | Measured |
|---|---|---|---|
| Lab 11 | 40,952 | 222 | 455 ms |
| Edge repaint (`STEP = 7`) | 860 | 76 | 118 ms |
| Sprite stamp (`STEP = 7`) | 2,356 | 2 | 8.1 ms |
| **Sprite stamp (`STEP = 1`)** | **1,984** | **2** | **7.2 ms** |

Read that table twice. The winning version sends almost **three times more pixels** than the one
it beats, and it is **14 times faster**, because it makes 38 times fewer calls.

Notice the last row too. In the edge version a bigger `STEP` was free, so we pushed it to 7 to
hide a slow frame. In the sprite version a bigger step means a *wider sprite*, so `STEP = 1` is
both smoother **and** cheaper. It crosses the eye in 90 gentle frames instead of 13 jumpy ones.

There is a bonus. All 76 of the old calls were spread across the frame, so the panel caught the
pupil mid-move. One `blit_buffer()` is a single uninterrupted stream, so there is no half-drawn
state left to catch — and the trails disappeared.

## Step 5: The Baud Rate That Was Never There

Now that the program was finally sending a meaningful number of bytes, the SPI clock speed started
to matter. **Baud rate** is how fast bits travel down the wire, set by `config.BAUDRATE`.

We tried raising it from 10 MHz to 20 and then 30, and nothing changed. Reading the number back
off the running board explained why — twice over:

```
config.BAUDRATE : 10000000
SPI reports     : SPI(0, baudrate=8000000, ...)
```

The first line showed the edit had never reached the board. The second showed something sneakier:
even when it does reach the board, **10 MHz is not 10 MHz.** The Pico builds its SPI clock by
dividing a 48 MHz source and rounding *down*, so only a few speeds actually exist:

| You ask for | You get |
|---|---|
| 8 – 11 MHz | 8 MHz |
| 12 – 23 MHz | 12 MHz |
| 24 MHz and above | 24 MHz (the ceiling) |

There is nothing at all between 12 and 24. Ask for 20 MHz and you quietly get 12.

!!! mascot-warning "Ask the hardware, don't trust the constant"
    ![Pixel warns about a mistake](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Print the SPI object and it tells you the truth about its own clock — `print(SPI(0, baudrate=24_000_000, sck=Pin(2), mosi=Pin(3)))`. A setting you never confirmed is a guess wearing a number.

With the clock actually set to 24 MHz, the sprite version measured **4.2 ms per frame**. Timing
lab 11 at the same three speeds shows something even more useful:

| Actual SPI clock | Lab 11 | Sprite version |
|---|---|---|
| 8 MHz | 455 ms | 7.2 ms |
| 12 MHz | 420 ms | 6.1 ms |
| 24 MHz | 387 ms | **4.2 ms** |

Tripling the clock speeds lab 11 up by only 15%, but nearly halves the sprite version. That is the
whole lesson in one table. Lab 11 is limited by its 222 calls, and a call costs the same at any
clock speed. The sprite version makes only 2 calls, so what is left really is bytes on a wire —
and bytes are what a faster clock moves.

## What the Stopwatch Taught Us

Four numbers, measured on a real board with
[`spi-cost.py`](https://github.com/dmccreary/robot-faces/blob/master/src/kits/sw-gc9b72/spi-cost.py),
now explain every drawing decision in this kit:

- **A drawing call costs about 1 millisecond**, no matter how fast the SPI clock runs. It is
  commands and chip-select toggles, not pixels.
- **The wire delivers about 84% of the baud rate you set**, so the clock is a real lever — but only
  once your call count is low enough for bytes to be the bigger half of the bill.
- The cost of any drawing operation is just `fixed + (bytes × cost_per_byte)`.
- Guessing which half dominates is how you spend a day making something 330 times better at the
  thing that was never the problem.

## Sample Output

Here is the part that surprises people most. All three versions draw **exactly** the same face —
we compared every pixel against a full redraw and found zero differences.

![Two white eyes with dark pupils and a curved smile on a round black screen](../eye-scanner/sample-output.png)

The picture never changed. Only the number of calls it took to produce it changed — and that took
the frame from two per second to **239 per second**.

## Things to Try

1. **Run lab 11 at 24 MHz and predict the result first.** Write down what you expect, then
   measure. It gets only 15% faster, and being surprised by that is the fastest way to really
   believe that calls, not pixels, were the bill.
2. **Change `STEP` in the sprite version and watch the sprite size change with it.** Every extra
   pixel of step is 62 more bytes on the wire per frame. `STEP = 1` is the cheapest and the
   smoothest — the exact opposite of how `STEP` behaved in the edge version.
3. **Set `SPRITE_BACKGROUND = config.RED`.** The rectangle being stamped every frame lights up, and
   you can see how much of it is white being repainted as white. That is the honest cost of this
   approach, and it still wins.
4. **Run `spi-cost.py` at 8, 12 and 24 MHz** and put the three throughput lines side by side. Now
   you know your own board's numbers instead of borrowing someone else's.
5. **Make it look like real thinking.** Eyes do not sweep smoothly unless they are tracking
   something moving. Real gaze *jumps* in 30–80 ms and then holds still for 200–400 ms. Try
   picking a random target, getting there in two steps, then sleeping a third of a second. It
   draws *fewer* frames than the sweep, so it costs less — and for a robot deciding which way to
   turn, it reads far more like deliberation.

!!! mascot-celebration "From flicker to 217 frames per second"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just watched a program go from 455 ms a frame to 4.2 ms because someone printed a number instead of trusting a hunch. That habit is worth more than any single optimization in this book.

## References

- [Eye Scanner](../../smartwatch/eye-scanner/index.md) — the original lab this page speeds up
- [Only Redraw What Changed](../../smartwatch/partial-redraw/index.md) — where erasing one box instead of the screen is measured
- [How Fast Is a Face?](../../smartwatch/draw-speed-timing/index.md) — the lab that first times drawing calls
- [Blitting Sprites](../../smartwatch/blit/index.md) — where `blit_buffer()` and RGB565 sprite memory are introduced
