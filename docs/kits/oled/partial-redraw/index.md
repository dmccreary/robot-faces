# Only Redraw What Changed

Every animation in this kit so far has wiped the entire screen and rebuilt the entire face,
dozens of times a second, in order to move one curve. The eyes did not change. The eyebrows did
not change. You redrew them anyway, because it was easier than thinking about it.

Thinking about it is this lesson — and so is finding out whether the thinking paid off.

!!! mascot-welcome "Which pixels actually changed?"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    That one question is the whole optimization. The second question — did it actually help? — is the one most people forget to ask, and it's the more important of the two.

## The Decomposition Question

Ask *which pixels actually change between one frame and the next*, and a face full of moving
parts turns out to be mostly still. In this program only the mouth animates, so only the mouth
needs erasing.

Instead of `face.clear()`, which blacks out all 8192 pixels, you black out one rectangle:

```py
# The bounding box of the mouth: the only part of the face this animation
# touches. Everything outside it is identical from frame to frame.
MOUTH_BOX_X = face.HALF_WIDTH - 24
MOUTH_BOX_Y = face.MOUTH_Y - 2
MOUTH_BOX_W = 48
MOUTH_BOX_H = 18


def draw_changed_only():
    oled.fill_rect(MOUTH_BOX_X, MOUTH_BOX_Y, MOUTH_BOX_W, MOUTH_BOX_H,
                   face.BLACK)
    face.mouth(face.SMILE, 22, mouth_ry)
    oled.fill_rect(0, 0, face.WIDTH, HUD_BOX_H, face.BLACK)
    draw_hud()
```

The eyes and eyebrows are simply left alone. They are already correct in the frame buffer from
the previous frame, and the buffer keeps whatever you last put in it.

This is exactly how video codecs, game engines, and every windowing system on your computer stay
fast. None of them redraws the whole screen to move a cursor.

!!! mascot-warning "Get the Box Wrong and It Ghosts"
    ![Pixel warning](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Set `MOUTH_BOX_W` to 20 and watch the grin's corners smear off the edges of the box you forgot to erase. That's the ghosting bug from the broken-faces lesson wearing a disguise — partial redraw fails loudly when the geometry is wrong.

Partial redraw only works if the pixels you are *not* touching are already right. That means
laying down one complete, correct frame before the optimization takes over:

```py
def draw_static_parts():
    """Call this once when switching modes to lay down a correct
    starting frame."""
    face.clear()
    face.eyes(10, 10)
    face.eyebrows(0, 0, lift=2)
    face.mouth(face.SMILE, 22, mouth_ry)
    draw_hud()
    face.show()
```

## Now Measure It

Button A toggles between full and partial redraw while the screen reports two timings in
microseconds. Splitting the measurement into two numbers is the important design choice here.

| Number | What it measures |
|---|---|
| `d` (draw) | Time spent putting pixels into the frame buffer in RAM |
| `s` (show) | Time spent shipping that buffer down the SPI wire to the glass |

```py
started = ticks_us()
if partial:
    draw_changed_only()
else:
    draw_everything()
draw_total += ticks_diff(ticks_us(), started)

started = ticks_us()
face.show()
show_total += ticks_diff(ticks_us(), started)
```

`ticks_us()` counts microseconds instead of milliseconds, because drawing a face is fast enough
that milliseconds are too coarse to see the difference.

One more detail matters. The program averages over twenty frames before reporting:

```py
samples += 1
if samples >= SAMPLES:
    draw_us = draw_total // samples
    show_us = show_total // samples
```

A single reading of anything this fast is mostly noise. An average is a measurement. Toggle
between modes and watch both numbers.

## What You Should Find

Predict the result before you press the button, then look. Most people guess wrong, and being
wrong here is the point of the lesson.

The `d` number drops sharply in partial mode, because you really did stop drawing most of the
face. The `s` number barely moves at all.

Here is why. This display driver ships all 1024 bytes of the frame buffer down the wire on every
single `show()`, whether one pixel changed or all of them did. The SSD1306 has no idea you were
clever about the mouth. Your optimization made the cheap half of the work cheaper, and left the
expensive half exactly as it was.

!!! mascot-thinking "Optimize the Expensive Part"
    ![Pixel thinking](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    The optimization worked exactly as designed, and the overall speedup is still small — because the part you sped up wasn't the part costing the most time. That's not a failure. That's the most important lesson in performance work.

People who skip the measuring step never learn this. They make a change that sounds faster, feel
good about it, and assume they got faster. The measurement is what turns an opinion into a fact.

## Attacking the Expensive Part Instead

If `show()` is where the time goes, then that is where a real speedup lives. The display talks
over SPI at a speed you choose, and the default is conservative. In `config.py`:

```py
spi = SPI(0, baudrate=8_000_000, sck=clock, mosi=data)
```

Run the program again and watch the `s` number this time. Attacking the expensive part beats
optimizing the cheap one, every time — and you only knew which was which because you measured.

## Things to Try

1. **Predict first.** Write down how much faster you expect partial mode to be, then look.
   Getting it wrong is normal and is exactly the point.
2. **Break the box.** Set `MOUTH_BOX_W` to 20 and watch the smear appear at the corners.
3. **Speed up the wire.** Add the `baudrate` to `config.py` and watch the `s` number instead of
   the `d` number.
4. **Add the pupils** to the animation so the eyes sweep as well. You now need a third box. At
   what point does tracking boxes become harder than just redrawing the screen? There is no
   single right answer, and knowing that is the skill.
5. **Work out the theoretical time.** At 1 MHz, how long *should* 1024 bytes take to send? Compare
   your answer to the measured `s` number.

!!! mascot-celebration "You measured instead of assuming"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You made a real optimization, measured it honestly, found out it wasn't where the time went, and then found where the time actually went. That's the whole job.

## References

- [Trace and Watch](../trace-and-watch/index.md) — where the measure-don't-guess habit was introduced
- [Five Broken Faces](../broken-faces/index.md) — the ghosting bug that a wrong bounding box recreates
- [Rectangle](../rectangle/index.md) — `fill_rect()` and erasing a region by drawing it black
- [MicroPython Framebuf Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) — the frame buffer that keeps its contents between frames
- [MicroPython SPI Documentation](https://docs.micropython.org/en/latest/library/machine.SPI.html) — the `baudrate` setting that controls how fast `show()` can run
