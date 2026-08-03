# How Fast Is a Face?

`oled.ellipse()` draws an eye in a single line. That line is so short and so ordinary-looking
that it is easy to assume it is doing something simple.

It is not. Somebody wrote a careful piece of code to make that ellipse appear, then compiled it
into the MicroPython firmware on your Pico. This lesson finds out what that work is worth, in
microseconds, by drawing the same face two ways and timing both.

!!! mascot-welcome "What is a built-in actually worth?"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    You're about to write your own ellipse from scratch — and then race it against the one that came with your Pico. The gap is bigger than almost anyone guesses.

## Writing an Ellipse From Scratch

You already know the ellipse equation from math class. A point is inside an ellipse when:

```
(dx * dx) / (rx * rx)  +  (dy * dy) / (ry * ry)  <=  1
```

`dx` and `dy` are how far the point sits from the center, and `rx` and `ry` are the two radii.
That equation is all you need to draw one: walk every pixel in the shape's bounding box, ask the
question, and light up the pixels that answer yes.

There is one improvement to make first. Division is slow on a microcontroller and it drags you
into decimals, so multiply both sides out. The same test becomes whole-number arithmetic with no
division at all:

```
dx*dx * ry*ry  +  dy*dy * rx*rx  <=  rx*rx * ry*ry
```

That trick is worth remembering on its own — clearing fractions to stay in integers is one of
the oldest speed tricks in graphics programming.

```py
def hand_ellipse(cx, cy, rx, ry, colour, fill, bottom_half=False):
    rx2 = rx * rx
    ry2 = ry * ry
    limit = rx2 * ry2

    # For an outline we keep the pixels that are inside the shape but NOT
    # inside a shape one pixel smaller. What is left over is the edge.
    inner_rx2 = (rx - 1) * (rx - 1)
    inner_ry2 = (ry - 1) * (ry - 1)
    inner_limit = inner_rx2 * inner_ry2
    has_inner = inner_rx2 > 0 and inner_ry2 > 0

    for dy in range(-ry, ry + 1):
        if bottom_half and dy < 0:
            continue
        dy2_rx2 = dy * dy * rx2
        for dx in range(-rx, rx + 1):
            if dx * dx * ry2 + dy2_rx2 > limit:
                continue                      # outside the ellipse
            if not fill and has_inner:
                if dx * dx * inner_ry2 + dy * dy * inner_rx2 <= inner_limit:
                    continue                  # inside the edge, so skip it
            oled.pixel(cx + dx, cy + dy, colour)
```

That is a real, working ellipse routine, and it handles fills, outlines, and the bottom-half arc
the mouth needs. Take a moment to appreciate it before you find out how slow it is.

!!! mascot-tip "Outlines Are Two Ellipses"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    The outline trick is a nice one: draw everything inside the shape, then throw away everything inside a shape one pixel smaller. What survives is exactly the edge.

## The Same Face, Twice

The test face is two filled eyes, two pupils, and a curved mouth. Every shape is an ellipse, so
the only thing that differs between the two versions is which ellipse code runs.

```py
def draw_face_by_hand():
    oled.fill(BLACK)
    hand_ellipse(face.LEFT_EYE_X, face.EYE_Y, EYE_R, EYE_R, WHITE, True)
    hand_ellipse(face.RIGHT_EYE_X, face.EYE_Y, EYE_R, EYE_R, WHITE, True)
    hand_ellipse(face.LEFT_EYE_X, face.EYE_Y, PUPIL_R, PUPIL_R, BLACK, True)
    hand_ellipse(face.RIGHT_EYE_X, face.EYE_Y, PUPIL_R, PUPIL_R, BLACK, True)
    hand_ellipse(face.HALF_WIDTH, face.MOUTH_Y, MOUTH_RX, MOUTH_RY,
                 WHITE, False, bottom_half=True)


def draw_face_built_in():
    oled.fill(BLACK)
    oled.ellipse(face.LEFT_EYE_X, face.EYE_Y, EYE_R, EYE_R, WHITE, FILL)
    oled.ellipse(face.RIGHT_EYE_X, face.EYE_Y, EYE_R, EYE_R, WHITE, FILL)
    oled.ellipse(face.LEFT_EYE_X, face.EYE_Y, PUPIL_R, PUPIL_R, BLACK, FILL)
    oled.ellipse(face.RIGHT_EYE_X, face.EYE_Y, PUPIL_R, PUPIL_R, BLACK, FILL)
    oled.ellipse(face.HALF_WIDTH, face.MOUTH_Y, MOUTH_RX, MOUTH_RY,
                 WHITE, NO_FILL, face.BOTTOM_HALF)
```

Press button B while the program runs to flip between the two faces. They are near-identical —
an eyelash of difference here and there, because two correct ways of rounding a curve onto a
grid of whole pixels can disagree by one pixel. That tiny difference is itself worth noticing:
"correct" is not the same as "identical" in graphics.

## Running an Honest Benchmark

A benchmark is only worth as much as the care you put into it. Two rules matter here, and both
are in the code:

```py
def time_drawing(draw, repeats):
    draw()                                    # warm-up, not counted

    started = ticks_us()
    for _ in range(repeats):
        draw()
    return ticks_diff(ticks_us(), started) // repeats
```

**Throw away the first run.** The first call has to allocate things that later calls reuse, so it
is never typical of the rest.

**Average several runs.** One reading of anything this fast is mostly noise. An average is a
measurement.

There is a third rule hiding in the program too: `show()` is timed *separately*. Pushing the
frame buffer to the glass takes the same time for both faces, so leaving it inside the
comparison would water down the very difference you are trying to see.

!!! mascot-warning "Never Time the Thing You Are Not Comparing"
    ![Pixel warning](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    If both versions had to wait the same 8 milliseconds for `show()`, a 40-times difference in drawing would look like barely 3 times. Measure the part that actually changes.

The report puts everything on one screen: the hand-coded time, the built-in time, the ratio, and
the `show()` time for context. Button A runs the whole thing again.

## Why the Built-In Wins

Predict the ratio before you run it. Write your guess down. Almost nobody guesses high enough.

When you see the number, resist the urge to file it under "built-ins are just faster." There are
**two** separate reasons, and they are worth keeping apart in your head because they are fixed in
completely different ways.

| Reason | What is happening | How you would fix it |
|---|---|---|
| It is compiled, not interpreted | Your code runs one bytecode instruction at a time, with the interpreter working out what each one means first. `ellipse()` was translated to machine code once, when the firmware was built. | You cannot, in MicroPython — this is what the language costs |
| It uses a better algorithm | `hand_ellipse()` tests every pixel in the bounding box. For a 10 by 10 eye that is 441 tests to draw about 314 pixels, so roughly a third of the work proves pixels are *not* part of the eye. | Write a smarter algorithm that walks only the curve |

The built-in uses the **midpoint ellipse algorithm**, which steps along the curve itself and
never looks at the empty corners at all. Doing that in Python would close part of the gap — and
measuring exactly how much is one of the experiments below.

## What This Does Not Mean

The lesson here is *not* "never write your own drawing code." You just wrote one, it works, and
understanding how a shape becomes pixels is genuinely valuable.

The lesson is that a library function is somebody else's careful work, already finished and
already compiled, and replacing one by hand almost always costs you speed you did not know you
had. Reach for the built-in first. Write your own when the built-in cannot do what you need —
and then measure it.

## Things to Try

1. **Predict the ratio** before running. Then look. The gap between your guess and the real
   number is the most useful thing this lesson gives you.
2. **Compare drawing time to `show()` time.** Which dominates for the hand-coded face? Which for
   the built-in? The answer flips — and that flip is exactly why the partial-redraw optimization
   mattered so little.
3. **Make the eyes bigger.** Change `EYE_R` from 10 to 20 and run again. The hand-coded time
   grows with the *area* of the bounding box, so doubling the radius roughly quadruples it. The
   built-in grows far more slowly. Growth rate matters more than any single measurement.
4. **Separate the two reasons.** Write a version that walks only the curve using the midpoint
   algorithm, and time it against both. Whatever gap remains is the interpreter — you will have
   measured "my algorithm was slower" apart from "my language was slower", which is a genuinely
   hard thing to do.
5. **Time the other built-ins.** How long does one `hline()` take compared to drawing the same
   row with `pixel()` in a loop? You now own a method that answers questions like that in two
   minutes.

!!! mascot-celebration "You can put a number on it"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You wrote an ellipse from an equation, raced it against compiled firmware, and explained the gap with two separate causes. That's not tinkering — that's measurement.

## References

- [Ellipse](../ellipse/index.md) — the built-in this lesson benchmarks, and its quadrant fill codes
- [Pixel](../pixel/index.md) — `pixel()`, the one primitive the hand-coded version is built from
- [Trace and Watch](../trace-and-watch/index.md) — where the measure-don't-guess habit started
- [Only Redraw What Changed](../partial-redraw/index.md) — the other timing lesson, and why `show()` dominated there
- [MicroPython Framebuf Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) — the C implementation behind `oled.ellipse()`
