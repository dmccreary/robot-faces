# Design Your Own Emotion

This is the last lesson, and it is the only one that does not tell you what to draw.

You are going to invent expressions nobody in this kit has drawn before, and then find out
whether a stranger can read them. That last part is the real test. A robot face is not art you
look at — it is a message you send, and a message only works if it arrives.

!!! mascot-welcome "Your face, not mine"
    ![Pixel waving welcome](../../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Everything from here is yours to design. If the person standing next to your robot can name the feeling without being told, you've built the bridge this whole book is about. Every pixel tells a story!

## Step 1: Write the Brief Before You Write Code

Fill this in with words, in a notebook, before you touch a single number:

- **My emotion is:** proud? confused? shy? suspicious? determined?
- **The eyes are:** wide? narrow? looking away?
- **The eyebrows are:** raised? one up? angled down?
- **The mouth is:** a smile? flat? open? off to one side?
- **The closest emotion it might be confused with is:** ...
- **and I will keep them apart by:** ...

This is not busywork. It is the decomposition step, and skipping it is why most first attempts
read as "generic robot". Deciding in words what each feature is doing forces you to know what
carries the meaning before you start fiddling with numbers.

Those last two lines matter most. Every expression lives next to a neighbor it can be mistaken
for, and designing the *difference* is harder than designing the face.

!!! mascot-thinking "One Feature Carries the Meaning"
    ![Pixel thinking](../../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    In almost every readable expression, one feature does most of the work and the others support it. If you can't say which one is carrying yours, testers probably can't either.

## Step 2: Turn the Brief Into a Row

Every line of the brief becomes a column in the table. One row is filled in as a worked example
— study it before you replace it. `Proud` is a small confident smile with the brows lifted and
the eyes relaxed: pleased, but not surprised.

```py
#            name    eye_rx eye_ry brow_L brow_R lift  mouth        x   y
MY_EMOTIONS = [
    ("Proud",        10,    8,     0,     0,     3,  face.SMILE,  16,  7),

    # TODO: your first emotion. Start by copying the row above and
    # changing ONE column at a time, looking after each change.

    # TODO: your second emotion. Make it one that could be confused with
    # your first, then push them apart until a tester can tell them apart.
]
```

Changing one column at a time is the debugging habit from earlier in the kit, used as a *design*
technique. Change three numbers at once and you learn nothing about which one improved the face.

Here is what you have to work with. Every one of these is a knob you have already turned by hand:

| Column | What it controls |
|---|---|
| `eye_rx`, `eye_ry` | Eye width and height — tall reads alert, flat reads sleepy or angry |
| `brow_L`, `brow_R` | Each brow's tilt; two different values give a skeptical, lopsided look |
| `lift` | How high both brows sit — a big lift is the fastest route to surprise |
| mouth style | `face.SMILE`, `FROWN`, `FLAT`, `OPEN`, `SMIRK`, or `SNEER` |
| `size_x`, `size_y` | Mouth width and curve depth |

## Step 3: Run the Readability Test

The program shows your face with **no label**. Ask someone who has not seen your code what the
robot is feeling, and write down their exact word. Only then press button A to reveal the name
you intended.

```py
def draw_emotion(row, reveal):
    name, eye_rx, eye_ry, brow_l, brow_r, lift, style, size_x, size_y = row

    face.clear()
    face.eyes(eye_rx, eye_ry)
    face.eyebrows(brow_l, brow_r, lift)
    face.mouth(style, size_x, size_y)
    if reveal:
        face.label(name)
    face.show()
```

Test at least three people. If two of them say something you did not intend, the expression needs
work — and their wrong word is your single best clue about which feature is misleading them.

!!! mascot-warning "You Cannot Test Yourself"
    ![Pixel warning](../../../img/mascot/warning.png){ class="mascot-admonition-img" }
    You know what you meant, so you'll always see it. That's why the label is hidden and why the testers have to be people who haven't seen your code. Their confusion is data, not criticism.

Write the results down like this, and the pattern in the wrong answers will tell you what to fix:

| Tester | Said | I intended | What that tells me |
|---|---|---|---|
| 1 | "sleepy" | Proud | The eyes are too flat |
| 2 | "happy" | Proud | The brow lift isn't reading; try 5 |
| 3 | "proud" | Proud | — |

## Step 4: Check Your Work

Before calling an expression finished, run it past this list:

| Check | Why it matters |
|---|---|
| I wrote the design brief in words before coding | Decomposition — you knew what you were building |
| Each emotion is one row of data, not a function | Pattern recognition — you saw the shape |
| I used only `face.py` parts, no raw `oled` calls | Abstraction — your face inherits every future fix |
| Three testers named it without a label | It communicates, which is the actual goal |
| I can say which single feature carries the meaning | You understand your own design |
| It still reads correctly from across the room | Robot faces are read at a distance, not at arm's length |

## Where to Take It Next

Every earlier lesson is a tool you can now point at your own design:

- **Keyframes** — give your emotion an entrance animation. A feeling that arrives over 300
  milliseconds reads far more alive than one that snaps on.
- **A face with a memory** — add it as a state, so the robot can arrive at your emotion on its
  own instead of waiting for a button.
- **Making it stand alone** — rename your finished program `main.py` and the robot wears your
  expression the moment it gets power, with no computer attached.

That last one is worth stopping to appreciate. You started this kit by blinking a single LED.
You are finishing it with a robot that has a face of your own design, a personality with a
memory, and opinions about being poked — and every part of it is something you can explain,
measure, and fix.

!!! mascot-celebration "Go build something with it"
    ![Pixel celebrating](../../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You can design a feeling, write it as data, and prove that strangers can read it. That's the superpower this whole book was about, and it's yours now. Great expression!

## References

- [The Emotion Table](../emotion-table/index.md) — the row format your design plugs into
- [The Face Module](../face-module/index.md) — the parts every new expression is built from
- [Emotion Types](../emotion-types/index.md) — the seven expressions yours has to stay distinct from
- [Keyframes](../keyframes/index.md) — giving your finished expression an entrance
- [A Face With a Memory](../state-machine/index.md) — letting the robot reach your emotion on its own
