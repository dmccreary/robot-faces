# Development Utilities

Tools for working *on* the kits. Nothing in this directory ever runs on a
microcontroller.

## Why This Directory Exists

Every kit's `upload-code.sh` copies **all** `*.py` files from the kit
directory onto the board — there is no allowlist and no ignore file. A
test harness dropped next to the labs would be uploaded along with them,
eating filesystem space and cluttering the file listing students see.

So the rule is simple:

| Belongs in `src/kits/<kit>/` | Belongs here in `src/utils/` |
|---|---|
| Numbered labs (`NN-name.py`) | Test harnesses |
| Shared modules the labs import (`config.py`, `face.py`) | Build and generation scripts |
| Vendored drivers, in `lib/` | One-off analysis code |
| `README.md`, `upload-code.sh` | Anything students never run |

## `check-labs.py`

Runs a kit's labs against a fake microcontroller — no board required.

```bash
python3 src/utils/check-labs.py                       # the OLED two-button kit
python3 src/utils/check-labs.py src/kits/smartwatch   # any other kit
python3 src/utils/check-labs.py --only 26 -v          # one lab, with its output
```

It stubs `machine`, `utime`, and the display driver, then runs each
numbered lab as an ordinary CPython program. The kit's own `config.py`
runs unmodified on top of those stubs, which is what makes the results
mean anything. All 32 labs in the OLED kit check in about a second.

### What it catches

- `NameError`, typos, undefined globals, missing `global` declarations
- Wrong number of values in a tuple-unpacking table row — the silent
  killer in any lab that stores expressions as rows of data
- Wrong argument counts on shared helper functions
- Drawing calls that land off the edge of the screen

That last one is not hypothetical. Its first run across the OLED kit
found a heads-up display whose counter ran off the right edge once it
reached three digits, plus a lesson title two characters too long to fit.

### What it does not catch

- **Whether the face looks right.** Every draw call is bounds-checked and
  then discarded. Nothing is rasterized.
- **Anything about timing.** The clock is fake, so a lab that measures
  microseconds reports meaningless numbers here.
- **MicroPython-only failures.** This is CPython. CPython accepting your
  code does not prove MicroPython will.
- **Wiring, SPI speed, or button bounce.** No hardware is modeled.

Passing means a lab is worth uploading. It does not mean the lab works.
Test on real hardware before handing anything to students.

### Using it with a new kit

Usually nothing to do. The screen size is read from whatever the display
driver is constructed with, and every module in the kit's `lib/` folder
is stubbed automatically, so a kit with a completely different display —
the **smartwatch kit** being the next one — works without editing the
checker.

Two things a new kit may need:

1. If it imports a MicroPython module that has no CPython equivalent and
   is not already stubbed, add it to `STUB_MODULES` in `install_stubs()`.
2. If it uses a peripheral beyond `Pin`, `SPI`, `I2C`, `ADC`, `PWM`, and
   `Timer`, add a stub class alongside the ones in `_build_machine()`.

Both are a few lines. The driver stub in particular needs no changes at
all: it hands back a display object for *any* class name, so
`SSD1306_SPI`, `ST7789`, and `GC9A01` all work as-is.

### Deliberately broken labs

A lab that draws off the screen on purpose — the debugging labs do —
should carry this comment marker so the checker does not report it:

```py
# check-labs: allow-offscreen
```

The checker still counts those draws and says so in its output, it just
does not fail the run over them.

### Exit codes

`0` if every lab ran clean, `1` if any lab crashed or drew off-screen
without a marker, `2` if the kit directory or its labs could not be
found. That makes it usable as a pre-commit or CI check.

## `render_kit_screens.py`

`check-labs.py` proves a lab *runs*. This proves what it *draws* — it
rasterizes every drawing call onto a real pixel buffer and saves a PNG:

```bash
python3 src/utils/render_kit_screens.py src/kits/smartwatch docs/kits/smartwatch
python3 src/utils/render_kit_screens.py src/kits/sw-gc9b72  docs/kits/sw-gc9b72
```

It needs Pillow (`pip install pillow`), and writes
`<outdir>/<name>/sample-output.png` per lab plus a `_render-manifest.json`.

### It does not know what a GC9A01 is

Nothing in it names a controller. Screen size, center and radius come
from the kit's own `config.py`, and the driver is whichever `lib/`
module defines a class — the same rule `check-labs.py` uses to tell a
driver from a data module. That is what lets the 240x240 GC9A01 kit and
the 360x360 GC9B72 kit both render, and a third kit would too. A kit
with no `RADIUS` is treated as rectangular and left unmasked.

The one thing that is *not* generic is the pixel format: the buffer and
`color565()` are RGB565, because both round kits are.

### Why it draws in slices, not pixels

Filling a 360x360 screen one pixel at a time is 129,600 Python-level
calls, and the labs clear the screen constantly. `fill_rect` packs a
row's bytes once and assigns the whole run per row; `blit_buffer` copies
slice-to-slice; `touched()` scans the raw buffer with `any()`.

This is not just tidiness. Each lab races a 3-second wall clock, so a
slow renderer does not merely take longer — **it silently produces a
truncated picture.** The committed `smartwatch/broken-faces` image was
entirely blank for exactly that reason, and the speedup is what
revealed it. If you ever see a render that looks half-drawn, suspect the
clock before you suspect the lab.

### What a rendered PNG is evidence of

The code, not the panel. It will happily render a lab that has never run
on the hardware it depicts — which is the case for every ported lab in
the sw-gc9b72 kit. It models drawing calls, not timing, not color under
real ambient light, and not the bezel. Compare against a real board.

## `check-circle.py`

Covers the gap `check-labs.py` documents about itself — that it checks
the square, not the circle:

```bash
python3 src/utils/check-circle.py src/kits/sw-gc9b72
python3 src/utils/check-circle.py src/kits/smartwatch --only 16
```

On a round display the driver addresses a square of pixels but the glass
is the circle inscribed in it. A pixel in the corner is legal, costs real
SPI bytes, and is permanently invisible. This tool imports `check-labs.py`
and wraps the single method every drawing call already funnels through,
then measures each point's distance from center against the kit's own
`CENTER_X` / `CENTER_Y` / `SAFE_RADIUS`.

It only runs on kits whose `config.py` defines `SAFE_RADIUS`, which is
what makes a kit "round" as far as this tool is concerned.

### Why it earns its place

**Scaling a kit up is exactly when this breaks.** Multiplying every
coordinate by 1.5 moves each one *further from center*, so a shape that
sat comfortably inside a 240x240 circle can slide under the bezel at
360x360 while still passing every square-bounds check.

Its first run found `05-rect.py` drawing a border whose corners land 113
px out on a panel whose safe radius is 112 — a pre-existing miss in the
smartwatch kit, not a porting error.

### Black does not count

Erasing on a display with no frame buffer means painting black, and the
normal way to clear a line of text is a full-width strip whose ends
necessarily overhang a round screen. Erasing *more* than you need is
safe; erasing less leaves ghosts. So a black draw outside the circle is
reported as harmless rather than as a finding — that alone is most of
what this tool would otherwise shout about. On the sw-gc9b72 kit it cuts
the flagged labs from ten to five.

Anything whose color it cannot determine — text, `blit_buffer` — counts
as visible, which is the safe direction to be wrong in.

### What it does not prove

- **`SAFE_RADIUS` is a judgement, not a measurement.** In the sw-gc9b72
  kit it is currently an estimate scaled from another panel. A report is
  only as good as that number.
- **Only sampled points are tested** — a shape's origin and extremes,
  not every pixel. An ellipse whose center is safe can still bulge past
  the rim.
- **Some labs are outside on purpose.** `02-screen-coordinates.py` draws
  in the corners precisely to prove they are invisible; a clean report
  there would mean the lab stopped teaching its lesson.

So it always exits `0` — findings are "look at this", not "this is
broken". It is a reading aid, not a gate.
