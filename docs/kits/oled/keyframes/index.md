# Keyframes

The emotion table turned seven expressions into seven rows of data. This lesson does the same
trick to something that feels much harder to write down: **motion**.

Every animation you have built so far was hand-written. A blink was some drawing, then a sleep,
then some more drawing. Change the timing and you edit code. But an animation is really just a
list of poses and how long each one holds — and a list of things is a table.

!!! mascot-welcome "Poses on a timeline"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Animators have called these poses *keyframes* for a hundred years. The idea works exactly as well on a four-dollar microcontroller as it does in a cartoon studio.

## What a Keyframe Is

A **keyframe** is a single important pose in a motion, along with how long to sit on it. In hand
drawn animation, the lead artist draws only the keyframes — the poses that define the movement —
and the in-between drawings follow from those.

On this display you skip the in-betweens entirely and just snap from pose to pose, which at
blink speed looks completely convincing.

Each frame here is three numbers:

| Value | What it means |
|---|---|
| `eye_height` | How tall the eyes are — 10 is wide open, 1 is shut |
| `eyebrow_lift` | How far the brows rise above their resting position |
| `hold_ms` | How long to sit on this pose before moving to the next |

And a whole blink is five of them:

```py
#         eye  brow   ms
BLINK = (
    (10,   2,  60),
    (6,    2,  40),
    (1,    2,  70),
    (6,    2,  40),
    (10,   2,   0),
)
```

Read it top to bottom and you can *see* the blink: open, half shut, closed for 70 milliseconds,
half open, open again. The closed pose holds longest because that is what makes a blink read as
a blink instead of a flicker.

## More Animations, Same Format

Once the format exists, new animations cost nothing but numbers:

```py
SURPRISE = (
    (10,  2,  80),
    (15,  8, 500),
    (13,  6, 180),
    (10,  2,   0),
)

DOZE_OFF = (
    (10,  1, 350),
    (7,   0, 350),
    (4,  -2, 400),
    (1,  -3, 900),
    (10,  1,   0),
)
```

`SURPRISE` snaps the eyes wide and the brows up, holds half a second, then settles. `DOZE_OFF`
closes the eyes in four slow stages with the brows sinking the whole way. Neither one required a
single new line of drawing code.

And because animations are now ordinary Python tuples, you can build new ones out of old ones:

```py
DOUBLE_BLINK = BLINK[:-1] + BLINK   # two blinks, built from the first one
```

That line trims the last frame off a blink and glues a second blink onto the end. Data you can
slice and join is data you can compose — something that is simply not possible when your
animation is buried inside a function.

!!! mascot-thinking "The Player Doesn't Know What a Blink Is"
    ![Pixel thinking](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    That's the whole point. A player that knows nothing about blinking can play a blink, a doze, and every animation you invent next year — because all it knows how to do is walk a list in time.

## The Player

The player has four variables of memory and two functions. `start()` begins an animation;
`update()` advances it if the current pose has held long enough.

```py
playing = None
frame_index = 0
frame_started = 0
current_name = ""


def start(name, animation):
    """Begin an animation. Draws pose zero and starts the clock."""
    global playing, frame_index, frame_started, current_name
    playing = animation
    current_name = name
    frame_index = 0
    frame_started = ticks_ms()
    draw_frame(playing[0])


def update():
    """Advance the animation if the current pose has held long enough."""
    global playing, frame_index, frame_started

    if playing is None:
        return

    hold_ms = playing[frame_index][2]
    if ticks_diff(ticks_ms(), frame_started) < hold_ms:
        return

    frame_index += 1
    if frame_index >= len(playing):
        playing = None      # finished; last pose stays on screen
        return

    frame_started = ticks_ms()
    draw_frame(playing[frame_index])
```

The critical detail is that `update()` returns **instantly** when there is nothing to do. It
never sleeps and never waits. That is the non-blocking timer idea from an earlier lesson, applied
to something far more interesting than a single blink — and it is what keeps the buttons alive
while an animation runs.

```py
while True:
    update()

    if face.pressed(button_a):
        face.wait_for_release(button_a)
        start(*ANIMATIONS[selected])

    if face.pressed(button_b):
        face.wait_for_release(button_b)
        selected = (selected + 1) % len(ANIMATIONS)
        start(*ANIMATIONS[selected])

    sleep_ms(5)
```

Press A halfway through `DOZE_OFF` and it restarts immediately. Try doing that with an animation
built from `sleep()` calls — you cannot, because the program is not listening.

!!! mascot-tip "Closing an Eye by Shrinking It"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    An eye squeezed down to one pixel tall isn't a thin eye — it's a shut one. `face.eye()` notices when the height drops to 2 or less and draws the closed-eye arc instead, so an animation can close an eye just by shrinking it.

## Why This Matters Beyond Robot Faces

Separating a player from the thing it plays is one of the most reusable structures in software.
You have met it before without noticing:

| Player | What it plays |
|---|---|
| A music app | A playlist |
| A game engine's animation system | A set of keyframed poses |
| A CNC machine or 3D printer | A list of moves and speeds |
| This lesson's `update()` | A tuple of eye heights and hold times |

In every case the player is written once and is boring on purpose, and all the creativity lives
in the data. That is a good sign you have decomposed a problem well.

## Things to Try

1. **Make the blink heavy.** Change the 70 in the middle of `BLINK` to 400. A snappy reflex
   becomes a tired droop, and you never touched the player.
2. **Build a triple blink** in one line, using the same slicing trick as `DOUBLE_BLINK`.
3. **Add a fourth number** to every frame — a mouth width — so the mouth animates too. You will
   change `draw_frame()` once and every animation gains a moving mouth at the same time.
4. **Play one backward** by reversing the list. Does `DOZE_OFF` reversed read as waking up? Some
   motions reverse convincingly and some do not, and noticing which is a real design question.
5. **Interrupt an animation on purpose.** Press A halfway through a doze and watch it restart
   cleanly — proof the player never blocks.

!!! mascot-celebration "Motion is data now"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You can now describe a new movement in three lines of numbers, hand it to a teammate who has never read your player, and have it just work.

## References

- [The Emotion Table](../emotion-table/index.md) — the same data-instead-of-code move, applied to still expressions
- [Blinking](../blinking/index.md) — the hand-written blink this lesson generalizes
- [Sleeping Faces](../sleeping-faces/index.md) — the drooping, closing motion `DOZE_OFF` reproduces as data
- [MicroPython utime Documentation](https://docs.micropython.org/en/latest/library/time.html) — `ticks_ms()` and `ticks_diff()`, the player's entire sense of time
