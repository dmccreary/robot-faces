# Eye Saccade

Here is a change that costs almost nothing and transforms how alive your robot looks: stop
sweeping the eyes, and make them **jump**.

The [Eye Scanner](../eye-scanner/index.md) lesson glides the pupils smoothly from side to side.
Real eyes almost never do that. Yours are jumping across this line of text right now, three or
four times a second, in quick flicks with brief stops in between — and that pattern is what your
brain reads as *something is looking*.

!!! mascot-welcome "Watch how I really look around"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Every pixel tells a story, and this one is about timing rather than drawing. Not a single line of my drawing code changes in this lesson.

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

## Motion, Not Drawing

`draw_eyes()` here is the eye scanner's, unchanged — it still erases the two eye boxes and
rebuilds them. What changes is **when** it gets called.

The program keeps a short list of places worth looking, picks one at random, jumps there a few
pixels at a time, and then holds still:

```py
SACCADE_STEP = 5
TARGETS = tuple(range(-PUPIL_RANGE, PUPIL_RANGE + 1, SACCADE_STEP))

FIXATION_MIN_MS = 200
FIXATION_MAX_MS = 400
```

`TARGETS` is the list of gaze positions, spaced `SACCADE_STEP` apart. Real eyes do not drift to
arbitrary coordinates — they jump between *things*, so a short list of destinations is closer to
the truth than a random number out of a range.

The jump steps toward the target and redraws each time, timing itself as it goes:

```py
def saccade_to(offset, target):
    start = ticks_us()
    while offset != target:
        if target > offset:
            offset = offset + SACCADE_STEP
        else:
            offset = offset - SACCADE_STEP
        draw_eyes(offset)
    return offset, ticks_diff(ticks_us(), start)
```

`ticks_us()` reads a microsecond clock and `ticks_diff()` subtracts two readings safely. Compare
the printed number against the 30–80 ms a real saccade takes — that is how you know whether your
robot's eyes move at a speed people recognize.

!!! mascot-thinking "Irregular beats fast"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Make every pause exactly 300 ms and the face turns into a metronome. The randomness in the fixation length is doing more work here than any drawing trick.

## Rare Work Is Allowed to Be Expensive

Erasing two 92 × 56 boxes and rebuilding both eyes is a lot of pixels. On this display there is no
frame buffer, so every one of them travels down a wire — which is exactly why the eye scanner
lesson worked so hard to shrink that box.

This lesson makes that whole worry mostly disappear, without changing the drawing at all:

| Behavior | Frames to cross the face | Then what? |
|---|---|---|
| Eye scanner sweep | 60 | turn around and sweep back, forever |
| Eye saccade | at most 12 | draw nothing at all for 200–400 ms |

A dozen expensive redraws followed by a rest beat sixty of them followed by sixty more. **Work that
happens rarely is allowed to be expensive** — a rule worth remembering every time you are tempted
to optimize something that hardly ever runs.

And notice what you get for it: the cheaper version is also the one that looks alive. Being
convincing and being cheap are usually opposites. Here they are the same choice, because both come
from one fact: eyes are still most of the time.

## Sample Output

A saccade caught mid-fixation, with the gaze held steady:

![Round color screen showing two white eyes with dark pupils and a curved white smile](sample-output.png)

Both pupils always point the same direction. That is what makes a face read as looking *at*
something, instead of in two directions at once.

## Things to Try

1. **Run this and the eye scanner back to back and just watch**, without looking at any numbers.
   One looks like a machine sweeping a sensor; the other looks like something making up its mind.
2. **Set both fixation constants to 300** so every pause is the same length, and watch the face
   turn into a metronome. Then put the randomness back.
3. **Set `ERASE_COLOR = config.RED`.** Now you can see exactly how much repainting one saccade
   costs — and, more usefully, how much of the time the screen is completely still. That stillness
   is the saving.
4. **Set `SACCADE_STEP` to 1.** The jump becomes a slow glide, the printed microseconds jump by
   about five times, and the face stops looking alive. Slower, smoother and more expensive all at
   once — a rare chance to make something worse in three ways with one number.
5. **Make the gaze mean something.** Feed the target choice from a distance sensor instead of a
   random number, so the robot looks toward whichever side has more room. Now the face is not
   performing thought — it is reporting it, and anyone watching can read the robot's next move off
   its eyes before the wheels turn.

!!! mascot-celebration "That is a face with a mind behind it"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just made a robot look like it is thinking by changing *when* you draw, not *what* you draw. Great expression!

## References

- [Eye Scanner](../eye-scanner/index.md) — the smooth sweep this lesson replaces
- [Only Redraw What Changed](../partial-redraw/index.md) — measuring what a redraw actually costs
- [How Fast Is a Face?](../draw-speed-timing/index.md) — where timing your own drawing is introduced
- [A Face With a Memory](../state-machine/index.md) — the natural home for gaze that reacts to events
