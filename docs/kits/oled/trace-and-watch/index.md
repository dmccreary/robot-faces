# Trace and Watch

The fifth broken face in the previous lesson was invisible. Nothing looked wrong in a photograph
of the screen. The program was simply too slow to notice a finger, and no amount of staring at
the code would have told you that.

You cannot find a bug like that by guessing. You have to measure it.

!!! mascot-welcome "Let's put gauges on my face"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    This time the face reports on itself while it runs. Four numbers in the corners, and suddenly a bug you couldn't see becomes a number you can watch change.

## Instruments, Not Guesses

Professional debugging tools do one job: they make invisible things visible. A profiler shows
where time goes. A logger shows what happened and when. You do not have either of those on a
microcontroller, so you build the small version yourself — and the small version is often
enough.

This lesson turns the face into its own instrument. Four numbers appear on the glass, and the
same numbers go to the Thonny shell once a second so you have a record you can scroll back
through.

| Number | What it tells you |
|---|---|
| `fps` | Loops per second — the real speed of your program |
| `hit` | How many button presses the program actually noticed |
| `A:` / `B:` | What each button pin reads right now (1 = up, 0 = pressed) |
| `loops` | Total passes through the main loop, printed to the shell |

## Counting Frames

Frame rate is not measured with a stopwatch. You count how many frames happened, check the
clock, and divide — which on a microcontroller is even simpler, because if you check exactly
once per second, the count *is* the frame rate.

```py
REPORT_EVERY_MS = 1000

frames = 0
fps = 0
last_report = ticks_ms()

# ...inside the main loop, after drawing...
frames += 1

if ticks_diff(now, last_report) >= REPORT_EVERY_MS:
    fps = frames
    frames = 0
    last_report = now
    print("loops:", loops, " fps:", fps, " presses:", presses)
```

`ticks_diff()` is the safe way to subtract two `ticks_ms()` readings. The millisecond counter
wraps back around to zero after a while, and `ticks_diff()` handles that wrap correctly where
plain subtraction would suddenly report a wildly negative number.

This exact technique is how every game engine, every video player, and every robot control loop
measures its own speed. You are not learning a toy version.

!!! mascot-thinking "A Number Beats a Feeling"
    ![Pixel thinking](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    "It feels laggy" is not something you can fix. "It dropped from 45 fps to 3 fps when I added that line" tells you what to fix and proves when you're done.

## Where to Put the Panel

The instrument panel has to share a 128 by 64 screen with the face it is measuring, so the
layout needs a little thought. The face occupies the middle rows; the numbers get the top row
and the bottom row.

```py
    # The panel gets the top row and the bottom row. The face keeps the
    # middle, so the instruments never sit on top of what they measure.
    face.label("fps:" + str(fps) + " hit:" + str(presses), 2, 2)
    face.label("A:" + str(a_value) + " B:" + str(b_value), 2, 56)
```

The font is 8 pixels tall and 8 pixels wide per character, so a line starting at `y = 56` fills
rows 56 through 63 — the last row on the display. Text starting at `x = 2` fits fifteen
characters before it runs off the right edge.

## The Experiment

At the top of the program is a switch that reproduces the previous lesson's timing bug on
purpose:

```py
SLOW_MODE = False
SLOW_DELAY_MS = 300
```

Run the program as it is and note the `fps`. Then set `SLOW_MODE = True` and note it again.
Write both numbers down. That ratio *is* the bug, expressed as a measurement instead of a
feeling.

Now tap button A as fast as you can, ten times, and look at the `hit` counter. Every press that
did not register was swallowed by a `sleep()` — the program was simply not looking at the pin
when your finger arrived.

```py
    if SLOW_MODE:
        # One innocent-looking line. Watch what it does to fps -- and to
        # how many presses the program manages to notice.
        sleep_ms(SLOW_DELAY_MS)
```

!!! mascot-warning "Every sleep() Is a Blind Spot"
    ![Pixel warning](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    While `sleep()` runs, your program is not checking buttons, not updating animations, and not reading sensors. A 300 ms sleep means the robot is blind for nearly a third of every second.

## Reading the Results

Once the numbers are on screen, they start answering questions you had not thought to ask. Here
is what students usually discover, roughly in this order:

1. **The loop is far faster than it needs to be** without the sleep, often hundreds of passes a
   second — which is why buttons feel instant.
2. **Drawing is the expensive part.** Comment out the `draw()` call and `fps` jumps, because
   pushing pixels to the display takes far longer than any of the arithmetic around it.
3. **There is a threshold** below which presses stop getting lost. Lower `SLOW_DELAY_MS` step by
   step and you will find it somewhere near how long a finger rests on a button.

That third discovery is worth pausing on. You just measured a property of a human being using a
four-dollar microcontroller, and you did it by making one number visible.

## Things to Try

1. **Record both frame rates**, slow and fast, in your notebook. Getting used to writing
   measurements down is most of what separates engineering from tinkering.
2. **Find the threshold.** Lower `SLOW_DELAY_MS` until presses stop getting lost. The number you
   land on is roughly how long a human finger stays on a button.
3. **Measure the display.** Comment out the `draw()` call for ten seconds and watch `fps` jump.
   Now you know how much of your program's time goes into talking to the screen.
4. **Add your own gauge.** Report how long the last `draw()` took in milliseconds, wrapping it in
   `ticks_ms()` readings the same way `fps` is measured here.
5. **Instrument an older program.** Drop the panel into the emotion menu and find out how fast
   it really runs.

!!! mascot-celebration "You built a debugger"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Twelve lines of counting turned an invisible timing bug into a number you can watch. That trick works on every program you'll ever write, on hardware far bigger than me.

## References

- [Five Broken Faces](../broken-faces/index.md) — the invisible timing bug this lesson makes visible
- [Blinking](../blinking/index.md) — where the button-response loop was introduced
- [MicroPython utime Documentation](https://docs.micropython.org/en/latest/library/time.html) — `ticks_ms()`, `ticks_diff()`, and why wrap-around matters
- [Only Redraw What Changed](../partial-redraw/index.md) — using these same measurements to decide whether an optimization was worth it
