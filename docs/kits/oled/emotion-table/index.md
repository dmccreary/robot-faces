# The Emotion Table

Go back and look hard at the emotion menu program. It has seven functions — `draw_happy`,
`draw_sad`, `draw_angry`, and four more — and every single one has the same three lines in the
same order: set the eyes, set the eyebrows, set the mouth.

Only the numbers change.

Once you see that, you cannot unsee it, and that moment has a name.

!!! mascot-welcome "Spot the repeat"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Seven functions that differ only in their numbers are not really seven functions. Let's find out what they actually are.

## Pattern Recognition

**Pattern recognition** means noticing that several things share a structure, so you can handle
them all with one piece of code instead of one piece each. It is the thinking skill that turns
a long program into a short one.

Here are three of those seven functions, stripped to their essentials. Read down the columns
instead of across the lines:

```py
def draw_happy():
    draw_eyes(10, 10)
    draw_eyebrows(0, 0, lift=2)
    draw_mouth_curve(22, 12, BOTTOM_HALF)


def draw_sad():
    draw_eyes(9, 9)
    draw_eyebrows(-3, -3, lift=0)
    draw_mouth_curve(16, 8, TOP_HALF)


def draw_angry():
    draw_eyes(10, 5)
    draw_eyebrows(5, 5, lift=-2)
    draw_mouth_flat(10)
```

The structure is identical every time. The `def` line, the three calls, the order — all the
same. What differs is nine numbers and a mouth style.

So the numbers are the real content, and the function around them is just packaging. If that is
true, then the honest thing to do is put the numbers in a table, write the packaging once, and
let one function draw all seven.

!!! mascot-thinking "Data and Code Are Different Things"
    ![Pixel thinking](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Ten numbers describing a feeling are *data*. The instructions for turning numbers into pixels are *code*. Keeping them in separate places is one of the oldest good ideas in programming.

## Seven Emotions, Eight Lines

Each emotion becomes one row. Read the columns straight across, and the whole emotional range of
the robot fits on one screen:

```py
#            name  eye_rx eye_ry brow_L brow_R lift  mouth style  size_x size_y
EMOTIONS = (
    ("Happy",     10, 10,  0,  0,  2, face.SMILE, 22, 12),
    ("Sad",        9,  9, -3, -3,  0, face.FROWN, 16,  8),
    ("Angry",     10,  5,  5,  5, -2, face.FLAT,  10,  0),
    ("Afraid",    13, 13, -5, -5,  3, face.OPEN,   6,  9),
    ("Surprised", 14, 14,  0,  0,  6, face.OPEN,   8, 11),
    ("Disgusted",  9,  6,  4, -2, -1, face.SNEER, 12,  7),
    ("Contempt",  10, 10,  0,  0,  0, face.SMIRK, 14,  0),
)
```

Before you can read that table you need to know what each column controls. Every one of these
is a knob you already turned by hand in an earlier lesson:

| Column | What it controls | What changing it does |
|---|---|---|
| `eye_rx`, `eye_ry` | The eye's width and height | A tall eye reads alert; a squashed one reads angry or bored |
| `brow_L`, `brow_R` | Each eyebrow's tilt | Positive angles the inner end down into an angry V |
| `lift` | How high both brows sit | A big lift is the fastest way to say "surprised" |
| `mouth style` | Which shape the mouth takes | `SMILE`, `FROWN`, `FLAT`, `OPEN`, `SMIRK`, or `SNEER` |
| `size_x`, `size_y` | The mouth's width and curve depth | A wide shallow curve reads friendlier than a deep one |

## One Function Draws All of Them

Here is the entire drawing half of the program. There is no `draw_happy`, no `draw_angry`, and
no `if` statement asking which emotion this is.

```py
def draw_emotion(row):
    """Draw ANY row from the table above."""
    name, eye_rx, eye_ry, brow_l, brow_r, lift, style, size_x, size_y = row

    face.clear()
    face.eyes(eye_rx, eye_ry)
    face.eyebrows(brow_l, brow_r, lift)
    face.mouth(style, size_x, size_y)
    face.label(name)
    face.show()

    print("drawing", name, row[1:])
```

That first line does the work. **Tuple unpacking** takes the nine values in the row and hands
each one its own name, in order, in a single statement. From there, the function does not know
or care which emotion it is drawing.

The `print()` at the end sends the same row to the Thonny shell, so you can compare the numbers
against the picture they produced. That habit becomes a real tool two lessons from now.

!!! mascot-warning "The Columns Must Line Up"
    ![Pixel warning](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Unpacking matches by position, not by name. Put the mouth style where the lift belongs and MicroPython will happily try to draw an eyebrow lifted by the word "smile" — so count your columns when you add a row.

## Stepping Through the Menu

The button-handling half is unchanged from the earlier menu, because the modulo trick already
worked and there was no reason to touch it:

```py
index = 0
draw_emotion(EMOTIONS[index])

while True:
    if face.pressed(button_a):
        index = (index + 1) % len(EMOTIONS)
        draw_emotion(EMOTIONS[index])
        face.wait_for_release(button_a)

    if face.pressed(button_b):
        index = (index - 1) % len(EMOTIONS)
        draw_emotion(EMOTIONS[index])
        face.wait_for_release(button_b)
```

Note that `pressed()` and `wait_for_release()` now come from `face.py` as well. Debouncing a
button is another thing you had written correctly several times, so it moved into the shared
module along with the drawing.

## The Real Payoff

Adding an eighth emotion to the old program meant writing a new function, then adding it to the
menu tuple, then hoping you matched the style of the other seven. Adding one here costs a single
line, and there is no new code to get wrong:

```py
    ("Bored", 10, 4, 0, 0, -3, face.FLAT, 12, 0),
```

That is the difference this lesson is really about. When you separate data from code, changing
what your program *knows* stops requiring you to change what your program *does*.

| Task | Seven functions | One table |
|---|---|---|
| Add an emotion | Write a function, register it | Add one row |
| Reorder the menu | Reorder a tuple of function names | Reorder rows |
| Make every mouth wider | Edit seven functions | Edit one column |
| Store the set on disk or send it over a network | Not possible — code is not data | Straightforward — rows are just numbers |

That last row is worth a second look. Because your emotions are now plain numbers, a robot could
download a new personality the way it downloads a file.

## Things to Try

1. **Add the "Bored" row above.** You just extended the menu without writing one line of drawing
   code. Now invent a row of your own.
2. **Make "Sad" sadder** by editing only its numbers — try an `eye_ry` of 7 and a brow tilt of
   -5. You are tuning a face the way a designer would, by changing values instead of rewriting
   code.
3. **Give one emotion a lopsided brow.** Set `brow_L` to 5 and `brow_R` to -3 on Contempt, and
   see how much a single mismatched eyebrow changes the meaning.
4. **Sort the table** so the emotions run from most positive to most negative. Because they are
   data, sorting the menu is just reordering lines.
5. **Count the columns you never change.** If one is always the same, it does not belong in the
   table — move it into `face.py` as a constant instead.

!!! mascot-celebration "Seven feelings, one function"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just replaced forty lines of near-identical code with eight rows of numbers, and gained the ability to add a feeling in one line. Let's draw some feelings!

## References

- [The Face Module](../face-module/index.md) — the `face.mouth()` style names that make a row of data able to pick a shape
- [Emotion Types](../emotion-types/index.md) — the seven hand-written functions this lesson replaces, and where the numbers came from
- [Eyebrows](../eyebrows/index.md) — why the brow tilt column carries so much of the meaning
- [MicroPython Framebuf Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) — the drawing commands underneath `face.py`
