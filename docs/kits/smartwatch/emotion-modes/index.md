# The Expression Menu

Here is the payoff for everything so far. The mode-switching pattern, applied to all seven
**Ekman emotions** — the expressions psychologist Paul Ekman found people recognize across every
culture he tested. Button A steps forward, button B steps back, and the name of the emotion sits at
the top of the circle so you always know what the robot thinks it is doing.

!!! mascot-welcome "Seven feelings, one robot"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    This is the whole superpower in one program. Press a button and a machine tells a stranger how it feels — and the stranger understands, without a word. Let's draw some feelings!

## The Seven Expressions

Every one of these is built from three decisions: how the eyes are shaped, how the eyebrows sit,
and which mouth shape gets drawn. Nothing else.

| Emotion | Eyes | Eyebrows | Mouth |
|---|---|---|---|
| Happy | Round, `(24, 24)` | Flat, lifted 5 | Wide upward curve |
| Sad | Round, slightly smaller | Inner ends up, tilt −7 | Downward curve |
| Angry | Squashed, `(24, 12)` | Inner ends down, tilt 12, lowered | Flat bar |
| Afraid | Wide, `(31, 31)` | Tilted up hard, lifted 7 | Tall open oval |
| Surprised | Widest, `(32, 32)` | Flat, lifted 14 | Wide open oval |
| Disgusted | Narrow, uneven | Lopsided — one at 10, one at −5 | Off-center raised lip |
| Contempt | Round, relaxed | Flat, no lift | Flat with one corner curled |

Read down the eyebrow column. Six of the seven are distinguished more by their brows than by
anything else, which is why the [eyebrows lab](../eyebrows/index.md) said what it said.

## Five Mouth Functions

The mouth is the one part that needs more than a change of numbers, so this lab defines five
separate shapes for it:

```py
draw_mouth_curve(radius_x, radius_y, mask)   # smile (mask 12) or frown (mask 3)
draw_mouth_flat(half_width)                  # a bar -- angry, bored
draw_mouth_open(radius_x, radius_y)          # a filled oval -- afraid, surprised
draw_mouth_smirk(half_width, side)           # flat, with one corner curled up
```

Notice that a smile and a frown are the *same function* with a different quadrant mask. That is the
[ellipse lab](../ellipse/index.md) paying you back.

## Sample Program Code

The seven drawing functions are the interesting part; the button loop underneath is the same one
from [Mode Switching](../modes/index.md), unchanged.

```py
# Lab 19: Expression Menu (excerpt -- the seven expressions)

def draw_happy():
    draw_eyes(24, 24)
    draw_eyebrows(0, 0, lift=5)
    draw_mouth_curve(50, 24, BOTTOM_HALF)


def draw_sad():
    draw_eyes(22, 22)
    draw_eyebrows(-7, -7, lift=0)
    draw_mouth_curve(40, 20, TOP_HALF)


def draw_angry():
    draw_eyes(24, 12)
    draw_eyebrows(12, 12, lift=-5)
    draw_mouth_flat(26)


def draw_afraid():
    draw_eyes(31, 31)
    draw_eyebrows(-12, -12, lift=7)
    draw_mouth_open(15, 22)


def draw_surprised():
    draw_eyes(32, 32)
    draw_eyebrows(0, 0, lift=14)
    draw_mouth_open(20, 26)


def draw_disgusted():
    draw_eyes(22, 15)
    draw_eyebrows(10, -5, lift=-3)
    for offset in range(STROKE):
        shapes.ellipse(display, HALF_WIDTH - 14, MOUTH_Y - offset, 30, 18,
                       WHITE, NO_FILL, TOP_HALF)


def draw_contempt():
    draw_eyes(24, 24)
    draw_eyebrows(0, 0, lift=0)
    draw_mouth_smirk(34, 1)


EMOTIONS = (
    ("Happy", draw_happy),
    ("Sad", draw_sad),
    ("Angry", draw_angry),
    ("Afraid", draw_afraid),
    ("Surprised", draw_surprised),
    ("Disgusted", draw_disgusted),
    ("Contempt", draw_contempt),
)


def show_emotion(index):
    name, draw = EMOTIONS[index]
    display.fill(BLACK)
    draw()
    x = HALF_WIDTH - (len(name) * FONT.WIDTH) // 2
    display.text(FONT, name, x, LABEL_Y, WHITE, BLACK)
```

The full program is `19-emotion-modes.py` in the kit.

Here's the first emotion in the list, which is what the program draws before you press anything:

![The word Happy at the top of the circle above a happy face with flat lifted eyebrows, round eyes with dark pupils, and a wide smile](sample-output.png)

The menu shows one emotion at a time, so a single picture can only ever show you one of the seven.
Press button A to walk the rest.

## Look How Much Repeats

Read those seven functions again, top to bottom. Every one has the same three lines in the same
order: set the eyes, set the eyebrows, set the mouth. **Only the numbers change.**

Hold on to that observation. It is the entire subject of the [emotion table](../emotion-table/index.md)
lab, and noticing it yourself here is worth more than being told about it later.

!!! mascot-tip "Test It on a Real Person"
    ![Pixel giving a tip](../../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Step through all seven without saying the names out loud and ask a friend to guess each one. The ones they get instantly are working. The ones they hesitate on are your homework — and hesitation is data.

## Things to Try

1. **Run the guessing test** above with three people. Write down every word they say, including the
   wrong ones. A wrong word tells you which feature is misleading them.
2. **Find the confusable pair.** Afraid and Surprised use nearly the same numbers. What is the
   smallest change that reliably separates them?
3. **Make Sad sadder** by editing only its numbers — try `eye_ry` of 17 and a brow tilt of −12.
4. **Add an eighth emotion.** Notice how much you have to write: a new function, a new tuple entry,
   and a hope that you matched the style of the other seven. Remember that cost.

## References

- [Mode Switching](../modes/index.md) — the button loop this lab reuses without changes
- [The Emotion Table](../emotion-table/index.md) — where these seven functions collapse into seven rows of data
- [Eyebrows](../eyebrows/index.md) — the feature doing most of the work in six of the seven faces
