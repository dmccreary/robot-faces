# The Face Module

Open the [expression menu](../emotion-modes/index.md) and the
[live tuning lab](../face-parameters/index.md) side by side. Both define a function that draws an
eye. Both define one that draws an eyebrow. Both define a mouth. The definitions are nearly
identical, and every program you have written for this kit has been carrying its own private copy.

That duplication is about to become a superpower, because getting rid of it is the single
highest-leverage move in programming.

!!! mascot-welcome "Time to clean up the workshop"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    You already know how to draw every part of my face. This lesson is about writing it down once, in one place, so you never have to write it again. Every pixel tells a story!

## Two Ideas With Real Names

This lab does not teach a single new drawing command. It teaches two ways of thinking that computer
scientists named a long time ago, because they matter that much.

**Decomposition** means breaking a problem into parts small enough to name. A face is not one thing
you draw — it is eyes, plus eyebrows, plus a mouth. Once each part has a name, you can work on one
without holding the other two in your head.

**Abstraction** means hiding *how* a part works behind *what* it is called. After this lab you will
write `face.eyes(36, 36)` and stop thinking about ellipses entirely. The ellipse is still there; you
just do not have to look at it anymore.

| Idea | The question it answers | What it looks like in code |
|---|---|---|
| Decomposition | What are the pieces? | Separate functions for eyes, eyebrows, and mouth |
| Abstraction | What do I call this piece, and what can I forget? | `face.eyes(36, 36)` instead of four `shapes.ellipse()` calls |

## Where the Facts Live Now

Your kit already had one shared file, `config.py`, holding the **hardware** facts — which pin the
clock is on, how many pixels wide the screen is, where the circle's center sits.

`face.py` does the same job for the **face** facts: how far apart the eyes sit, how long an eyebrow
is, how to draw each style of mouth, and what color it all draws in.

| File | What it knows | Lives at |
|---|---|---|
| `config.py` | Pins, screen size, circle geometry | The kit root |
| `face.py` | Eye spacing, brow length, mouth styles, colors | The kit root |
| `lib/shapes.py` | Generic geometry — ellipse, poly, ring | `lib/` |

That split is about what each file knows. `config.py` and `face.py` describe *this* kit. `shapes.py`
never mentions the kit at all, which is why it lives in `lib/` and why it is the one file that moved
to this second round-display kit completely unchanged.

## Three Expressions in Nine Lines

Here is the payoff. Lab 19, the expression menu, spends about 70 lines defining face parts before it
draws anything. With `face.py` doing that work, three complete expressions — happy, sad, and
surprised — take nine.

```py
import face
from utime import sleep

# The names below come from face.py. Nothing is redefined here -- if you
# ever want to change how an eyebrow is drawn, there is now exactly one
# place to change it, and every lab gets the fix.


def happy():
    face.eyes(36, 36)
    face.eyebrows(0, 0, lift=8)
    face.mouth(face.SMILE, 75, 36)


def sad():
    face.eyes(33, 33)
    face.eyebrows(-10, -10, lift=0)
    face.mouth(face.FROWN, 60, 30)


def surprised():
    face.eyes(48, 48)
    face.eyebrows(0, 0, lift=21)
    face.mouth(face.OPEN, 30, 39)


# A list of (name, function) pairs, the same shape lab 18 used for modes.
EXPRESSIONS = (
    ("Happy", happy),
    ("Sad", sad),
    ("Surprised", surprised),
)


def show(name, draw):
    """The one place that knows the clear-draw-label sequence. Every
    expression above trusts this function to handle it."""
    face.clear()
    draw()
    face.label(name)


while True:
    for name, draw in EXPRESSIONS:
        show(name, draw)
        sleep(1.5)
```

Here's the first expression in the cycle:

![The word Happy in white at the top of the circle above a white face: flat eyebrows, round eyes with dark pupils, and a wide curved smile](sample-output.png)

## The Label Uses a Different Font Here

That `face.label(name)` call inside `show()` is doing more work on this kit than it looks like.
Bitmap fonts are fixed-size glyphs — they do not get bigger just because the screen did — so on a
360×360 panel the same small font the 1.2" kit uses for labels would cover an even smaller slice of
the glass, not a bigger one. `face.py` answers that by drawing `label()` in a wider 16×32 font
instead, which is why "Happy" reads clearly from across a room in the picture above.

That switch was not free. `text()` paints a solid background behind every glyph, so doubling the
font doubled the label's black band from 16 rows to 32. A naively scaled position would place the
label at row 45, covering rows 45 through 76. But the tallest eyebrow in the kit — Afraid's, with a
lift of 11 and a tilt of 18 — reaches row 64, right inside that band. `face.LABEL_Y` sits at 32
instead, so the band covers rows 32 through 63 and clears that eyebrow by exactly one row. That is
also why labels on this kit top out around 12 characters.

## Notice What Is Missing

There is no display `show()` call anywhere inside that `show()` function — the shared name is a
coincidence. `face.clear()` paints black, the drawing calls go straight to the glass, and that is
the entire cycle.

Compare all three kits and you can see the abstraction absorbing a hardware difference and a
screen-size difference at the same time:

| | OLED kit's `face.py` | 1.2" kit's `face.py` | This kit's `face.py` |
|---|---|---|---|
| Draw a shape | Pokes bits in a RAM buffer | Sends bytes over SPI | Sends bytes over SPI |
| End of a frame | `oled.show()` — required | Nothing — already on the glass | Nothing — already on the glass |
| Erase | `oled.fill(0)`, essentially free | `face.erase(x, y, w, h)`, sized to the change | `face.erase(x, y, w, h)`, sized to the change |
| What the lab code looks like | `face.eyes(10, 10)` | `face.eyes(24, 24)` | `face.eyes(36, 36)` |

The last row is the point. Three different displays, three different pixel counts, and the lab code
above is the same shape every time. That is what abstraction is *for*.

!!! mascot-thinking "Moved, Not Rewritten"
    ![Pixel thinks it through](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Refactoring means changing how code is organized without changing what it does. If my face looks different after this lab, something went wrong — a clean refactor is invisible from the outside.

## One Mouth Function Instead of Six

Faces need more than one kind of mouth, and `face.py` gives you one function plus a **style** name
that picks the shape:

```py
SMILE = "smile"
FROWN = "frown"
FLAT = "flat"
OPEN = "open"
SMIRK = "smirk"
SNEER = "sneer"


def mouth(style, size_x, size_y=0, color=None):
    """Draw whichever mouth `style` names."""
```

That single function is what makes the next lab possible. Because the mouth style is now a *value*
you can pass around, an entire expression can be written as a row of data instead of a block of
code.

## The Trade You Are Making

Abstraction is not free, and pretending otherwise would be dishonest. When you hide the
`shapes.ellipse()` calls behind `face.eyes()`, you hide them from yourself too. A beginner reading
your program can no longer see how an eye is drawn without opening a second file.

That trade is almost always worth it, and here is the rule of thumb: **hide a detail once you have
written it correctly three times.** Before then, writing it out teaches you something. After then,
writing it out just gives you three places to make the same typo.

| Before `face.py` | After `face.py` |
|---|---|
| Every program has its own `draw_eye()` | One copy, in one file |
| Fixing an eyebrow means editing 8 programs | Fixing an eyebrow means editing 1 file |
| You can see the `ellipse()` call right there | You have to open `face.py` to see it |
| New expression: copy 70 lines, then edit | New expression: 3 lines |

!!! mascot-celebration "One file to rule them all"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Your face parts now live in one place, which means every program you write from here on starts with a face already built. Great expression!

## Things to Try

1. **Add a fourth expression.** You should not need to write a single `shapes.ellipse()` call —
   only `face.eyes()`, `face.eyebrows()`, and `face.mouth()` with different numbers.
2. **Change `face.EYE_SPACING` from 72 to 90** and run again. One edit just moved the eyes on every
   expression at once. (Go too far and they start hitting the bezel, which is the round screen
   reminding you it has opinions.)
3. **Break it on purpose.** Set `face.EYE_Y` to 330. Because every expression shares one definition,
   every expression breaks the same way — which is exactly what makes the bug easy to find. Change
   it back when you are done.
4. **Compare this lab to lab 19.** Same three expressions, roughly nine lines of drawing code
   against lab 19's seventy, and every number you can still see is a number about *feeling* rather
   than about pixels.
5. **Call `face.text("Happy", 100, 200)`** somewhere and compare it to the label above. Same word,
   same screen, but the small font next to the wide one — proof that a bigger screen made this text
   proportionally smaller, not larger.

## References

- [The Expression Menu](../emotion-modes/index.md) — the duplicated drawing code this lab consolidates
- [The Emotion Table](../emotion-table/index.md) — what becomes possible once a mouth style is a value
- [Your First Face](../happy-face/index.md) — where the eye spacing and mouth position numbers came from
- [The Face Module on the 1.2" kit](../../smartwatch/face-module/index.md) — the same lesson at 240×240, worth comparing to see exactly what scaled and what didn't
