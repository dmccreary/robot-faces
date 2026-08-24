# Drawing Circles

A circle is just an ellipse whose horizontal and vertical radii are equal, so `shapes.circle()` is
a two-line wrapper around [`shapes.ellipse()`](../ellipse/index.md). Circles can be drawn as an
outline or filled, in either color, which lets you put a dark shape on a light background or a
light shape on a dark one — on a screen 2.25 times the size of the [1.2" kit's](../../smartwatch/circle/index.md).

```py
shapes.circle(display, x, y, radius, color, fill_flag)
shapes.ring(display, x, y, radius, color, thickness)
```

That second one is new, and it is the shape a round display was made for.

## Sample Program Code

This program draws all four combinations of background and fill so you can compare them at once —
and it lays them out in a **diamond** rather than a 2 by 2 grid, because the four corners of a grid
on a round screen are exactly the four places you cannot see.

```py
import config
import shapes

display = config.init_display()
WHITE = config.WHITE
BLACK = config.BLACK
NO_FILL = config.NO_FILL
FILL = config.FILL

CENTER_X = config.CENTER_X
CENTER_Y = config.CENTER_Y
RADIUS = 39                 # 26 on the smartwatch kit
OFFSET = 87                 # 58 on the smartwatch kit
PATCH = 12                  # 8 on the smartwatch kit -- how much wider the
                            # white background patch is than the circle on it

display.fill(BLACK)

# top: white circle outline on black
shapes.circle(display, CENTER_X, CENTER_Y - OFFSET, RADIUS, WHITE, NO_FILL)

# bottom: white filled circle on black
shapes.circle(display, CENTER_X, CENTER_Y + OFFSET, RADIUS, WHITE, FILL)

# left: black circle outline on a white patch
shapes.circle(display, CENTER_X - OFFSET, CENTER_Y, RADIUS + PATCH,
              WHITE, FILL)
shapes.circle(display, CENTER_X - OFFSET, CENTER_Y, RADIUS, BLACK, NO_FILL)

# right: black filled circle on a white patch
shapes.circle(display, CENTER_X + OFFSET, CENTER_Y, RADIUS + PATCH,
              WHITE, FILL)
shapes.circle(display, CENTER_X + OFFSET, CENTER_Y, RADIUS, BLACK, FILL)

# The one shape a round display was made for: a ring that follows the rim.
# Three pixels thick rather than the smartwatch kit's two -- one pixel is
# the same physical hairline it always was, but it now has to read across
# a 50% wider circle.
shapes.ring(display, CENTER_X, CENTER_Y, config.SAFE_RADIUS, WHITE, 3)
```

Here's what that program draws on the display:

![Four circles arranged in a diamond inside a thin outer ring: an outline circle at top, a filled white circle at bottom, and on the left and right white discs — one with a black outline traced inside it, one with a black circle filled into it, leaving a white ring](sample-output.png)

## The Four Combinations

The whole display starts out black, so the top and bottom circles need no background at all. To put
a white background behind a black circle, draw a slightly larger filled white circle first and then
draw the black one on top of it — exactly the same trick as on the smaller kit, just with a 12 px
patch instead of an 8 px one.

| Position | Background | Circle color | Fill |
|---|---|---|---|
| Top | Black | White | Outline |
| Bottom | Black | White | Filled |
| Left | White patch | Black | Outline |
| Right | White patch | Black | Filled |

!!! mascot-thinking "A Diamond, Not a Grid"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Four shapes in a 2 by 2 grid would put one in each corner — and my screen has no corners. Rotate the whole arrangement 45 degrees and every shape lands where there is glass. Round screens want radial layouts, whether they're 240 px across or 360.

## The Ring Around the Rim

That thin outer circle is `shapes.ring()` drawn at `config.SAFE_RADIUS`, which is **168** on this
kit — and it is the one shape here that could not have existed on a rectangular display. It follows
the bezel exactly, which makes it useful as more than decoration: anything that crosses it is in
danger, and anything well inside it is safe.

Notice the call to `ring()` needed no change at all when this lab was ported from the 1.2" kit,
because it was never written as a literal number — it asks `config` for `SAFE_RADIUS`, so it moved
from 112 out to 168 on its own. That is the whole argument for naming a constant instead of typing
one, made real: one line of code, unedited, correct on two different screens.

!!! mascot-tip "Do the Arithmetic Before You Move Anything"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    A circle at `OFFSET` with radius `RADIUS` reaches `OFFSET + RADIUS` pixels from the center. Compare that sum to `config.SAFE_RADIUS` — 168 — before you run it, and you will stop being surprised by disappearing shapes.

## Things to Try

1. **Push `OFFSET` from 87 up to 120** and run it again. The circles start crossing the safe ring,
   and each one loses its outer edge first. The two with white patches cross it before the other
   two do, because a patch reaches `PATCH` pixels further out than the circle drawn on it.
2. **Work out the largest `RADIUS`** a circle at `OFFSET = 87` can have before it touches the safe
   ring. (Add the two numbers and compare with `config.SAFE_RADIUS`.) Check your answer on the
   glass, then do it again for the two circles that sit on a patch, which need `RADIUS + PATCH` to
   fit instead of `RADIUS`.
3. **Nudge the safe radius yourself.** `config.SAFE_RADIUS` was scaled from the 1.2" kit's panel
   and hasn't been measured against this one's real bezel yet. The ring this lab draws *is* the
   measuring tool — on real hardware, watch where it actually falls and adjust `SAFE_RADIUS` in
   `config.py` until the ring just clears the rim. Every other lab in the kit inherits your answer.
4. **Build an eye.** A filled white circle with a smaller black circle on top of it is an eye — you
   have already drawn one twice in this lab without calling it that.

## References

- [Drawing Ellipses](../ellipse/index.md) — the general case, and where the quadrant codes come from
- [Your First Face](../happy-face/index.md) — the first lab that turns two circles into a pair of eyes
- [Screen Coordinates](../screen-coordinates/index.md) — where `SAFE_RADIUS` comes from
- [Drawing Circles on the 1.2" kit](../../smartwatch/circle/index.md) — the same lab on the smaller 240×240 screen, where `SAFE_RADIUS` is 112
