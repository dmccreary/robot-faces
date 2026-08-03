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
