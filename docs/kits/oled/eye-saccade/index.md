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

Swap the smooth sweep for jump-and-hold, and the same two pupils suddenly look like they are
choosing where to point.

## Motion, Not Drawing

The drawing code here is `draw_face()` from the eye scanner lesson, unchanged. What changes is
**when** it gets called.

The program keeps a short list of places worth looking, picks one at random, jumps there a few
pixels at a time, and then holds still:

```py
TARGETS = tuple(range(-PUPIL_RANGE, PUPIL_RANGE + 1, SACCADE_STEP))

FIXATION_MIN_MS = 200
FIXATION_MAX_MS = 400
```

`TARGETS` is the list of gaze positions, spaced `SACCADE_STEP` apart. Real eyes do not drift to
arbitrary coordinates — they jump between *things*, so a short list of destinations is closer to
the truth than a random number out of a range.

The jump itself is a loop that steps toward the target and redraws each time:

```py
def saccade_to(offset, target):
    start = ticks_us()
    while offset != target:
        if target > offset:
            offset = offset + SACCADE_STEP
        else:
            offset = offset - SACCADE_STEP
        draw_face(offset)
    return offset, ticks_diff(ticks_us(), start)
```

`ticks_us()` reads a microsecond clock and `ticks_diff()` subtracts two readings safely, so the
program can tell you how long each jump took. Compare that number against the 30–80 ms a real
saccade takes — it is how you know whether your robot's eyes move at a speed people recognize.

!!! mascot-thinking "Irregular beats fast"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Make every pause exactly 300 ms and the face turns into a metronome. The randomness in the fixation length is doing more work here than any drawing trick.

## The Cheapest Interesting Change in the Kit

On this display every frame costs the same no matter what changed on it, because `oled.show()`
ships the whole 1,024-byte buffer either way. A pixel you did not touch costs exactly as much as
one you did.

That makes the arithmetic here very simple. **A face that is holding still just stops calling
`show()`.**

| Behavior | Frames to cross the face | Then what? |
|---|---|---|
| Eye scanner sweep | 36 | turn around and sweep back, forever |
| Eye saccade | at most 12 | draw nothing at all for 200–400 ms |

Fewer frames, less work, and it looks more alive. Being convincing and being cheap are usually
opposites — here they are the same choice, because both come from one fact: **eyes are still most
of the time.**

## Sample Output

A saccade caught mid-fixation, gaze held to the left:

![OLED face with both pupils shifted left inside wide white eyes, above a curved smile](sample-output.png)

Both pupils always point the same direction. That is what makes a face read as looking *at*
something, instead of in two directions at once.

## Things to Try

1. **Run this and the eye scanner back to back and just watch**, without looking at any numbers.
   One looks like a machine sweeping a sensor; the other looks like something making up its mind.
   The drawing code is identical.
2. **Set both fixation constants to 300** so every pause is the same length, and watch the face
   turn into a metronome. Then put the randomness back.
3. **Set `SACCADE_STEP` to 1.** The jump becomes a slow glide and the face stops looking alive —
   while costing three times as many frames. Slower, smoother and more expensive, all from one
   number.
4. **Count your frames.** Add a counter and print frames per second for both programs, then decide
   which one you would put on a robot that also has to drive, steer, and read a sensor.
5. **Make the gaze mean something.** Feed the target choice from a distance sensor instead of a
   random number, so the robot looks toward whichever side has more room. Now the face is not
   performing thought — it is reporting it, and anyone watching can read the robot's next move off
   its eyes before the wheels turn.

!!! mascot-celebration "That is a face with a mind behind it"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just made a robot look like it is thinking by changing *when* you draw, not *what* you draw. Great expression!

## References

- [Eye Scanner](../eye-scanner/index.md) — the smooth sweep this lesson replaces
- [Sleeping Faces](../sleeping-faces/index.md) — another animation built on timing rather than new shapes
- [Blinking](../blinking/index.md) — the other motion that makes a face read as alive
- [How Fast Is a Face?](../draw-speed-timing/index.md) — where measuring draw time is introduced
