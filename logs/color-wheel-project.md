# Color Wheel Project Session Log

**Date:** 2026-08-04
**Kit:** `src/kits/smartwatch` (GC9A01 240×240 round display)
**Hardware:** Raspberry Pi Pico + bare GC9A01 module, SPI0, 60 MHz
**Deliverable:** `src/kits/smartwatch/color-wheel.py` (600 lines)

A demo that fills the round screen with an HSV color wheel — and, by accident
of how it turned out, the kit's best worked example of measuring before
optimizing.

## Headline Result

| | Time | Per pixel | Rate |
|---|---|---|---|
| First working version | **18.3 s** | 616 µs | 1,621 px/s |
| After optimization | **2.2 s** | 74 µs | 13,500 px/s |

**8.3× faster.** Both measured on the actual board, not estimated. Two dead
ends along the way were kept in the source next to the working code, because
they teach more than the successes did.

## Files Created

- `src/kits/smartwatch/color-wheel.py`
- `logs/color-wheel-project.md` (this file)

## Files Modified

- `src/kits/smartwatch/README.md` — new "Demos" section framing the wheel as
  the kit's worked optimization example
- `src/utils/check-labs.py` — docstring now names the concrete CPython /
  MicroPython divergence this project hit

---

## What Came Before It

The wheel sits on color infrastructure added earlier in the same session, which
is worth listing because the demo depends on all of it:

- `face.py` gained `COLOR`, `set_color()`, per-part `color=` overrides, and
  `PUPIL_COLOR` (black — the pupil is a hole punched to the background, not a
  shape, so it stays black however the eye is colored).
- `face.DEBUG_ERASE` — set it to a color and every `erase()` box becomes
  visible. Full redraw lights 57,600 pixels; partial lights 8,208.
- Lab 24 gained a color column; lab 30 became a three-stage readability
  experiment (shape-only → shape-plus-color → reveal); lab 32 (`32-color-bits.py`)
  takes RGB565 apart.
- `config.color565` was re-exported so labs can build colors without importing
  the driver directly. The wheel uses it constantly.

That work deserves its own log entry; this one covers the wheel.

---

## Design Decisions

### A ring, not a disc

The wheel is drawn between `INNER_R = 52` and `OUTER_R = 110`, not filled to
the center.

The justification is not visual. Near the center, saturation approaches zero
and **every hue collapses to the same gray**, so the hole discards nothing —
and it buys a clean black panel to print the readout in. Two goals, one
decision, no compromise on either.

### Hue as angle — why this demo could not exist on the OLED kit

Hue is an **angle**, which is why red appears at both ends of a rainbow. A
color wheel *is* a circle. This is the only program in the kit whose shape and
the screen's shape are the same shape, and on a 128×64 rectangle it would have
been an awkward translation of the idea rather than the idea itself.

### The panel eraser must be a circle, not a rectangle

Caught by rendering, not by reasoning. The first version wiped the readout area
with `fill_rect`. The largest square that fits inside a 52-pixel-radius circle
has 73-pixel sides; a 96-pixel square centered on the same point pokes its four
corners **16 pixels out past the rim**, punching black notches into the wheel.

Now `shapes.circle(..., FILL)`. The comment in the file explains the arithmetic
so nobody re-derives it.

Text placement was verified separately rather than eyeballed — every line was
checked against the hole's chord at its own worst row:

| Line | Needs | Hole allows |
|---|---|---|
| `V = 100%` (y=96) | 32.0 px | 46.1 px |
| `4986` (y=114) | 16.0 px | 51.2 px |
| `colors` (y=132) | 24.0 px | 44.4 px |
| `drawing` (y=114) | 28.0 px | 51.2 px |

### Counting distinct colors with a bitmap

The demo answers "how many of the display's 65,536 colors are on screen right
now?" A `set` of 30,000 integers would not fit in RAM. A **bitmap of 65,536
bits = 8,192 bytes** does, and it answers the question exactly.

Counting the set bits was then a second slow loop — 65,536 shift-and-test steps
— so `BIT_COUNTS`, a 256-entry table built once at import, reduced it to 8,192
lookups. Measured on hardware at **59 ms**, small enough to stop worrying about.

### An on-screen "drawing" message

Added after the first hardware run. Thirty thousand `atan2` calls take seconds,
and a demo that sits silent that long reads as *crashed*, not *busy*. The
distinction is not cosmetic.

---

## The Optimization Arc

### Step 1: measure

The user asked for start/end timestamps and a rendering time. The file already
timed the drawing, but two things were wrong with that: the number was buried in
a list, and **`count_seen()` was not timed at all** — a slow loop hiding behind
an unrelated one.

The report was rebuilt to time drawing and counting separately, print both
timestamps, and derive a rate and a per-pixel figure. That report is what made
everything after it possible.

It also documents why `ticks_ms()` is not a clock: it counts from power-up and
**wraps**, so subtracting two readings can return a large negative number. Every
elapsed value goes through `ticks_diff()`. Same rule lab 15 depends on.

### Step 2: diagnose

First hardware run: **18,317 ms drawing, 616 µs per pixel.**

The same code on a laptop ran at 1.6 µs per pixel — a **380× gap**, far past
MicroPython's usual 30–60× penalty. That ratio was the clue that something
specific was wrong rather than "interpreted languages are slow".

**The RP2040 is a Cortex-M0+ and has no floating-point unit.** Every `atan2`,
`sqrt`, multiply and divide in the inner loop is emulated in software. Nearly
every other program in this kit is limited by how fast it can talk to the
display; this one is limited by arithmetic, and it is the only one that is.

That inverts the kit's usual advice. Lab 31 teaches "batch your display calls" —
and the wheel had *already* done that, blitting whole rows instead of pixels.
The right instinct, applied to the wrong bottleneck.

Second cost, under-weighted at first: **two Python function calls per pixel**
(`hsv_to_rgb`, `config.color565`), each packing arguments, building a frame, and
allocating a tuple to return, 30,000 times over.

### Step 3: three fixes, and one that backfired

Implemented behind a `FAST` flag rather than replacing the readable version:

1. **One color per 2×2 block** — a quarter of the transcendental calls.
2. **Both function calls inlined**, with the 255 scaling hoisted so `r`, `g`, `b`
   leave the branch already in 0–255 range.
3. **Globals bound to locals** — `sqrt`, `atan2`, `int`, `blit_buffer`. A global
   name costs a dictionary lookup on every use; a local is a slot index.

**And one that made things worse.** The first attempt flushed runs of
same-colored blocks as single `fill_rect` calls, reasoning from the demo's own
true measurement that 25,591 of 29,810 pixels repeat a color already on screen.

It took display calls from 324 to **6,359** — nineteen times worse. The repeated
colors are real but **scattered, not adjacent**: hue slides continuously along a
row, so almost every neighbor differs by a little.

A true fact about the data, an obvious-looking inference, and a large step
backwards. Caught offline before it ever reached the board. It is now written
into the source next to the working code, because it is the most useful thing in
the file.

The fix was to keep the readable version's row-and-buffer structure and only
sample the math more coarsely. Display calls: **326**, essentially identical to
the readable version's 324.

### Step 4: a CPython/MicroPython divergence

The restructured version used `blit_buffer(line * BLOCK, ...)` to send a whole
strip of identical rows in one call — 163 display calls.

On the board:

```
TypeError: unsupported types for __mul__: 'bytearray', 'int'
```

**MicroPython repeats a `bytes` with `*` but not a `bytearray`.** CPython fills
in that corner; MicroPython does not. The offline harness runs on CPython and
ran the line without complaint.

Fixed by sending the same row buffer to each of the `BLOCK` screen rows in turn
— 326 calls instead of 163, costing perhaps 30 ms against a multi-second draw.
The colors are still computed once; only the *sending* repeats, and sending was
never the expensive half.

The rest of the kit was swept for the same pattern. Only `shapes.py:189`
multiplies a buffer, and it is `bytes(...) * int`, which is legal.

### Step 5: the result, and what it decomposes into

**2,208 ms drawing, 2,610 ms total, 74 µs per pixel.**

The 8.3× comes apart cleanly, because one factor is known exactly:

| Factor | Source |
|---|---|
| ~4.0× | one color per 2×2 block — a quarter as many `atan2`/`sqrt` calls |
| ~2.1× | inlining and local binding — no change to *what* is computed |

Derivation of the second: 74 µs per painted pixel, with one color computed per
four painted pixels, is ~296 µs per computed color, against 616 µs before. It is
approximate — the fast path also does byte writes per painted pixel — but the
shape of it is solid.

**That second number is the finding.** Roughly half the cost of the original
loop was never arithmetic at all. It was interpreter overhead for calling a
function and looking up a global name. Before making the math cleverer, find out
how much of the time is not math.

### On the prediction

Before running it, the estimate written into the file was "around 3 to 5
seconds". The answer was 2.2 — wrong by about 1.6×, in the conservative
direction.

That was left in the file as a note rather than quietly edited to match the
outcome. An estimate built from counting operations being off by ~2× either way
is normal, and saying so is the honest version of the lesson.

---

## Measured vs. Modeled

Worth keeping straight, since this log mixes both.

**Measured on the board:**
18,317 ms and 616 µs/px (slow) · 2,208 ms drawing, 59 ms counting, 2,610 ms
total, 74 µs/px, 13,500 px/s (fast) · 29,692 and 29,810 pixels painted · 4,986
and 4,219 distinct colors.

**Modeled offline, against a fake display:**
display-call counts (324 / 6,359 / 163 / 326) · pixel coverage (100.4% of the
readable version) · distinct-color ratio (84.6%) · distinct counts at the dimmer
brightness levels (2,282 at V=66%, 562 at V=33%) · all text-fits-in-the-hole
geometry.

---

## Known Limitations

- ~~`color-wheel.py` has no `NN-` prefix, so `check-labs.py` skips it.~~
  **Resolved 2026-08-04:** renamed to `33-color-wheel.py`. It now gets the
  same smoke test every other lab gets, and its "Things to try" section is
  written as lab exercises rather than demo notes.
- The fast path is **not pixel-identical** to the readable one: block sampling
  finds ~85% of the distinct colors and leaves a slightly blockier stair-step at
  the hole's inner rim. Visually equivalent at arm's length; the report tells you
  the difference rather than hiding it.
- `BLOCK` is a tunable knob. 3 would be faster and visibly chunkier. Untested.
- Distinct-color counts at V=66% and V=33% have only been produced offline on
  the slow path. The dimming trend is confirmed, the exact figures on the fast
  path are not.

## What This Changed Elsewhere

`src/utils/check-labs.py`'s "WHAT IT DOES NOT CATCH" section previously warned
about CPython/MicroPython divergence in the abstract. It now carries this
project's actual failure — the `bytearray * int` case, with the code that
triggered it — because an abstract warning did not stop anyone from writing the
line.

## Open Items

- Record the fast path's distinct-color counts at V=66% and V=33% from hardware.
- Try `BLOCK = 3` and record the time and the visual cost.
- The exercise inviting students to comment out `atan2` and re-time (isolating
  arithmetic from wire) has not been run by anyone yet. It should produce a
  number worth printing in the chapter.
