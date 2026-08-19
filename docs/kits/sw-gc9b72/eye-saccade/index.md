# Eye Saccade

[Making the Eye Scanner Fast](../eye-scanner-speedup/index.md) took one sweeping animation from
455 milliseconds a frame down to 4.2. This lesson is the sequel, and it makes a point that is
easy to miss after a hard-won optimization: **the sweep was never the right motion in the first
place.**

Real eyes almost never glide. Yours are jumping across this line of text right now, three or four
times a second, in quick flicks with brief stops in between — and that pattern is what your brain
reads as *something is looking*.

!!! mascot-welcome "Watch how I really look around"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Every pixel tells a story, and this one is about timing rather than drawing. The drawing code barely changes — the behavior changes completely.

## What Real Eyes Actually Do

Eye movement has two modes, and they have names worth knowing:

| Movement | What it is | How long it lasts |
|---|---|---|
| **Saccade** | A fast, ballistic jump to a new target | 30–80 ms |
| **Fixation** | Holding almost perfectly still while you actually look | 200–400 ms |
| **Smooth pursuit** | Gliding steadily — what the eye scanner does | only while tracking something moving |

That last row is the punchline. Smooth motion is a **tracking** behavior. An eye only glides when
it is following something that moves, so a robot whose eyes glide constantly looks like a machine
sweeping a sensor, no matter how fast you make it.

## The Motion

The program keeps a short list of places worth looking, picks one, jumps there in full-size steps,
and then holds still:

```py
SACCADE_STEP = 5
TARGETS = tuple(range(-PUPIL_RANGE, PUPIL_RANGE + 1, SACCADE_STEP))

FIXATION_MIN_MS = 200
FIXATION_MAX_MS = 400
```

`TARGETS` is the list of gaze positions, spaced `SACCADE_STEP` apart. Real eyes do not drift to
arbitrary coordinates — they jump between *things*, so a short list of destinations is closer to
the truth than a random number out of a range.

There is a second, sharper reason those targets are evenly spaced, and it comes straight out of
the speedup lesson. The sprite that stamps each pupil is built for a move of exactly
`SACCADE_STEP`. Because every target is a whole multiple of that step, **every jump is a whole
number of full-size steps**, and one fixed-size sprite handles every move the program will ever
make. Break that rule and the sprite has to over-reach, and its corners start landing outside the
white of the eye.

```py
def saccade_to(offset, target):
    start = ticks_us()
    while offset != target:
        if target > offset:
            next_offset = offset + SACCADE_STEP
        else:
            next_offset = offset - SACCADE_STEP
        move_pupils(offset, next_offset)
        offset = next_offset
    return offset, ticks_diff(ticks_us(), start)
```

`ticks_us()` reads a microsecond clock and `ticks_diff()` subtracts two readings safely, so each
jump reports its own duration. Compare it against the 30–80 ms a real saccade takes — that is how
you know whether your robot's eyes move at a speed people recognize.

!!! mascot-thinking "Irregular beats fast"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Make every pause exactly 300 ms and the face turns into a metronome. The randomness in the fixation length is doing more work here than any drawing trick.

## The Cheapest Version Is Also the Most Convincing

The speedup lesson got the sweep down to 2 drawing calls every 4.2 ms — forever, without pause.
This program crosses the whole eye in 18 frames and then sends **nothing at all** for the next
200–400 ms. Measured on a Pico at 24 MHz:

| Jump | Frames | Measured |
|---|---|---|
| One step | 1 | 3.9 ms |
| Half the eye | 7 | 27 ms |
| The whole eye | 18 | 72 ms |

Even the longest jump is followed by a rest three to six times as long, so the worst case is under
a fifth of the work the sweep does — and it is the version that looks alive.

Those durations land where they should. A real saccade takes 30–80 ms, and because a jump here is
a fixed number of equal steps, a **long jump takes proportionally longer than a short one** —
exactly what real eyes do. Vision researchers call that relationship the *main sequence*, and this
program reproduces it without a line of code written for it.

Being convincing and being cheap are usually opposites. Here they are the same choice, because
both come from the same fact: **eyes are still most of the time.** All that effort spent making
the sweep fast bought headroom; switching to saccades spends almost none of it.

On a robot this is the behavior you want when the machine has to *look* like it is deciding. A
collision-avoidance robot that backs away from a wall, then flicks its gaze left, holds, flicks
right, holds, is doing something an onlooker reads instantly as weighing the options.

## Sample Output

A saccade caught mid-fixation, gaze held to the left:

![Round color screen showing two white eyes with pupils shifted left, above a curved white smile](sample-output.png)

Both pupils always point the same direction. That is what makes a face read as looking *at*
something, instead of in two directions at once.

## Things to Try

1. **Run this and `eye-scanner-sprite.py` back to back and just watch**, without looking at any
   numbers. One looks like a machine sweeping a sensor; the other looks like something making up
   its mind. The code is nearly identical — only the motion differs.
2. **Set both fixation constants to 300** so every pause is the same length, and watch the face
   turn into a metronome. Then put the randomness back.
3. **Break the spacing rule on purpose.** Add `7` to the `TARGETS` tuple. Some jumps now end with
   a step smaller than the sprite was built for, the program falls back to redrawing the whole
   face, and you get a visible flash on exactly those jumps and nowhere else. That flash is what a
   full redraw looks like on this display — the whole reason this kit works the way it does.
4. **Add a drift during fixation** — one pixel, every few hundred milliseconds. Real eyes do this
   too (microsaccades and ocular drift), and a perfectly still face can start to look switched off
   rather than attentive. You will need a second, smaller pair of sprites for a one-pixel move.
5. **Make the gaze mean something.** Feed the target choice from a distance sensor instead of a
   random number, so the robot looks toward whichever side has more room. Now the face is not
   performing thought — it is reporting it, and anyone watching can read the robot's next move off
   its eyes before the wheels turn.

!!! mascot-celebration "That is a face with a mind behind it"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You made a robot look like it is thinking by changing *when* you draw, not *what* you draw — and it costs less than the version that did not. Great expression!

## References

- [Making the Eye Scanner Fast](../eye-scanner-speedup/index.md) — the optimization this lesson builds on
- [Eye Saccade (smartwatch kit)](../../smartwatch/eye-saccade/index.md) — the same behavior on the 240×240 panel
- [Eye Saccade (OLED kit)](../../oled/eye-saccade/index.md) — the same behavior where every frame costs the same
- [A Face With a Memory](../../smartwatch/state-machine/index.md) — the natural home for gaze that reacts to events
