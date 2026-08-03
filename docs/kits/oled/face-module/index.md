# The Face Module

Open the emotion menu from an earlier lesson and the live-tuning program side by side. Both of
them define a function that draws an eye. Both define one that draws an eyebrow. Both define a
mouth. The definitions are nearly identical, and every program you have written that draws a
face has been carrying its own private copy.

That duplication is about to become a superpower, because getting rid of it is the single
highest-leverage move in programming.

!!! mascot-welcome "Time to clean up the workshop"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    You already know how to draw every part of my face. This lesson is about writing it down once, in one place, so you never have to write it again. Every pixel tells a story!

## Two Ideas With Real Names

This lesson does not teach a single new drawing command. It teaches two ways of thinking that
computer scientists gave names to a long time ago, because they matter that much.

**Decomposition** means breaking a problem into parts small enough to name. A face is not one
thing you draw — it is eyes, plus eyebrows, plus a mouth. Once each part has a name, you can
work on one part without holding the other two in your head.

**Abstraction** means hiding *how* a part works behind *what* it is called. After this lesson
you will write `face.eyes(10, 10)` and stop thinking about ellipses entirely. The ellipse is
still there; you just do not have to look at it anymore.

| Idea | The question it answers | What it looks like in code |
|---|---|---|
| Decomposition | What are the pieces? | Separate functions for eyes, eyebrows, and mouth |
| Abstraction | What do I call this piece, and what can I forget? | `face.eyes(10, 10)` instead of two `ellipse()` calls |

## Where the Face Facts Live Now

Your kit already has one shared file, `config.py`, and it holds the **hardware** facts — which
pin the display's clock is on, how many pixels wide the screen is. Every program imports it so
those numbers only exist in one place.

`face.py` does exactly the same job for the **face** facts: how far apart the eyes sit, how
long an eyebrow is, how to draw each style of mouth.

```py
import config
from utime import sleep_ms

# The display is created once, here, and shared by every lab that
# imports this module.
oled = config.init_display()

EYE_SPACING = 26
LEFT_EYE_X = (config.WIDTH // 2) - EYE_SPACING
RIGHT_EYE_X = (config.WIDTH // 2) + EYE_SPACING
EYE_Y = 24
PUPIL_RADIUS = 3


def eye(x, radius_x, radius_y, pupil_dx=0, pupil_dy=0):
    """One eye: a filled white ellipse with a black pupil punched out."""
    oled.ellipse(x, EYE_Y, radius_x, radius_y, WHITE, FILL)
    oled.ellipse(x + pupil_dx, EYE_Y + pupil_dy,
                 PUPIL_RADIUS, PUPIL_RADIUS, BLACK, FILL)


def eyes(radius_x, radius_y, pupil_dx=0, pupil_dy=0):
    """Both eyes at once -- the shape that carries most of the emotion."""
    eye(LEFT_EYE_X, radius_x, radius_y, pupil_dx, pupil_dy)
    eye(RIGHT_EYE_X, radius_x, radius_y, pupil_dx, pupil_dy)
```

Look closely at that code and notice what is *not* new. Those are the same two `ellipse()`
calls you wrote in the face-layout lesson, in the same order, with the same numbers. Nothing
was invented. It was only moved.

!!! mascot-thinking "Moved, Not Rewritten"
    ![Pixel thinking](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Refactoring means changing how code is organized without changing what it does. If the face looks different after this lesson, something went wrong — a clean refactor is invisible from the outside.

## One Mouth Function Instead of Five

Faces need more than one kind of mouth. A smile is an arc curving up, a frown is the same arc
flipped, an open mouth is a filled ellipse, and a smirk is a flat line with one corner curled.
Rather than five separate names to remember, `face.py` gives you one function and a **style**
name that picks the shape.

```py
SMILE = "smile"
FROWN = "frown"
FLAT = "flat"
OPEN = "open"
SMIRK = "smirk"
SNEER = "sneer"


def mouth(style, size_x, size_y=0):
    if style == SMILE:
        mouth_curve(size_x, size_y, BOTTOM_HALF)
    elif style == FROWN:
        mouth_curve(size_x, size_y, TOP_HALF)
    elif style == FLAT:
        mouth_flat(size_x)
    elif style == OPEN:
        mouth_open(size_x, size_y)
    elif style == SMIRK:
        mouth_smirk(size_x, 1)
    elif style == SNEER:
        mouth_sneer(size_x, size_y)
```

That single function is what makes the next lesson possible. Because the mouth style is now a
*value* you can pass around, an entire expression can be written as a row of data instead of a
block of code.

## Three Expressions in Nine Lines

Here is the payoff. The emotion menu spends about 55 lines defining face parts before it draws
anything at all. With `face.py` doing that work, three complete expressions take nine lines.

```py
import face
from utime import sleep


def happy():
    face.eyes(10, 10)
    face.eyebrows(0, 0, lift=2)
    face.mouth(face.SMILE, 22, 12)


def sad():
    face.eyes(9, 9)
    face.eyebrows(-3, -3, lift=0)
    face.mouth(face.FROWN, 16, 8)


def surprised():
    face.eyes(14, 14)
    face.eyebrows(0, 0, lift=6)
    face.mouth(face.OPEN, 8, 11)


EXPRESSIONS = (
    ("Happy", happy),
    ("Sad", sad),
    ("Surprised", surprised),
)


def show(name, draw):
    face.clear()
    draw()
    face.label(name)
    face.show()


while True:
    for name, draw in EXPRESSIONS:
        show(name, draw)
        sleep(1.5)
```

Notice that `show()` is the only place in the whole program that knows the clear-draw-label-show
sequence. Every expression trusts it to get that right, which means there is exactly one place
to fix if it ever gets it wrong.

!!! mascot-tip "The Test That Proves It Worked"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Open `face.py` and change `EYE_SPACING` from 26 to 34. Run the program again. One edit just moved the eyes on every expression at once — that is abstraction paying you back.

## The Trade You Are Making

Abstraction is not free, and pretending otherwise would be dishonest. When you hide the
`ellipse()` calls behind `face.eyes()`, you also hide them from yourself. A beginner reading
your program can no longer see how an eye is drawn without opening a second file.

That trade is almost always worth it, and here is the rule of thumb: hide a detail once you
have written it correctly three times. Before then, writing it out teaches you something.
After then, writing it out just gives you three places to make the same typo.

| Before `face.py` | After `face.py` |
|---|---|
| Every program has its own copy of `draw_eye()` | One copy, in one file |
| Fixing an eyebrow means editing 8 programs | Fixing an eyebrow means editing 1 file |
| You can see the `ellipse()` call right there | You have to open `face.py` to see it |
| New expression: copy 55 lines, then edit | New expression: 3 lines |

## Things to Try

1. **Add a fourth expression.** You should not need to write a single `oled.ellipse()` call —
   only `face.eyes()`, `face.eyebrows()`, and `face.mouth()` with different numbers.
2. **Break it on purpose.** Change `face.EYE_Y` to 60 and run again. Because every expression
   shares one definition, every expression breaks the same way — which is exactly what makes
   the bug easy to find. Change it back.
3. **Go back and shrink an old program.** Rewrite the winking face using only `face.py` parts,
   and count how many lines disappear.
4. **Find the third copy.** Look through your earlier programs for any other block of code that
   appears in three or more of them, and move it into `face.py` too.

!!! mascot-celebration "One file to rule them all"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Your face parts now live in one place, which means every program you write from here on starts with a face already built. Great expression!

## References

- [Emotion Types](../emotion-types/index.md) — the seven expressions whose duplicated drawing code this lesson consolidates
- [Basic Face Layouts](../basic-face-layouts/index.md) — where the eye spacing and mouth position numbers came from
- [Ellipse](../ellipse/index.md) — the quadrant fill codes that `face.mouth()` now hides behind a style name
- [MicroPython Framebuf Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) — the drawing commands `face.py` wraps
