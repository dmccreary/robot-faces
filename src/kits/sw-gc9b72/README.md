# sw-gc9b72 Kit (GC9B72 2.1" 360×360 Round Display)

A Raspberry Pi Pico wired to a 2.1" round GC9B72 SPI display. 
The panel's own silkscreen
reads `Driver IC: GC9B72, Resolution: 360x360`.

## The Driver

There was no public MicroPython driver for the GC9B72 when this kit was
written. [`lib/gc9b72.py`](lib/gc9b72.py) is a new one, whose register
init sequence is ported from the [xboot](https://github.com/xboot/xstar)
project's `fb-gc9b72.c` -- credited by
[MaliosDark/Arduino_GC9B72](https://github.com/MaliosDark/Arduino_GC9B72)
(MIT) as "the only known-good public GC9B72 init" -- via that project's
C++ Arduino_GFX driver. Everything else about the driver's shape (the
`_write()` command/data pattern, no frame buffer, `text()` taking a font
module) follows the [smartwatch kit](../smartwatch/README.md)'s GC9A01
driver, so labs written for one round display port easily to the other.

**The driver is confirmed working on real hardware.** `01-hello.py` and
the color/resolution reel now numbered `34-color-demo.py` both run
cleanly on a Pico wired per the table below -- text, solid colors,
gradients, and the full-screen rainbow disc all render correctly. If a
display wired differently than this shows nothing, see Troubleshooting.

**Labs 02 through 33 have not been run on a board.** They are ported
from the smartwatch kit and pass the two checkers below, which proves
they execute and draw inside the screen -- not that any face looks
right. Two things in particular are unconfirmed: `SAFE_RADIUS` (an
estimate, see below) and every button lab, since the buttons themselves
are new to this kit.

## Wiring

The 10-pad breakout reads, left to right: `GND VCC SDA SCL RST DC CS BL
SDO TE`. Only 8 are wired -- `SDO` (read-back) and `TE` (frame-sync) are
not used by this driver.

| Module pin | Wire color | Pico pin |
|---|---|---|
| GND | black | GND |
| VCC | red | 3V3 |
| SDA / MOSI | yellow | GP3 |
| SCL / CLK | orange | GP2 |
| RST | green | GP4 |
| DC | blue | GP5 |
| CS | purple | GP6 |
| BL | gray | GP7 |
| SDO | white | not connected |
| TE | brown | not connected |

All of this lives in one place, [`config.py`](config.py), which every lab
imports.

## Drawing Shapes

The GC9B72 driver, like the smartwatch kit's GC9A01 one, only knows how
to draw pixels, runs, rectangles, lines, text, and raw buffers -- there
is no `framebuf` underneath it, so there is no built-in `ellipse()` or
`poly()`. [`lib/shapes.py`](lib/shapes.py) builds those on top of what
the driver has, and it is a straight copy of the
[smartwatch kit's `shapes.py`](../smartwatch/lib/shapes.py): the geometry
(quadrant-masked ellipses, scanline-filled polygons, rings, sprites) only
ever calls `display.hline()`/`vline()`/`line()`/`blit_buffer()`, so it
never had to know which chip it's talking to.

It lives in `lib/` rather than at the kit root -- unlike `config.py` and
`face.py`, which hold facts specific to *this* kit (which pins, which
face), `shapes.py` is generic pixel-drawing plumbing that doesn't
mention this kit at all. `check-labs.py` still runs it for real rather
than stubbing it: it has no class definition, so the checker's
driver-vs-data-module heuristic loads it exactly like the vendored
fonts, and its bounds-checking still applies.

The one thing the GC9B72 driver was missing to make that copy work as-is
was `line()` -- `shapes.poly()`'s outline mode needs it, and so does an
eyebrow drawn at an angle. It's in [`lib/gc9b72.py`](lib/gc9b72.py) now,
ported from the same Bresenham routine `gc9a01.py` uses.

`config.py` also now carries the round-screen facts `shapes.py`'s
callers expect: `NO_FILL`/`FILL`, `CENTER_X`/`CENTER_Y`, and
`SAFE_RADIUS` -- the last one is a proportional **estimate** scaled from
the smartwatch kit's bezel margin, not yet measured against this panel.
Draw `shapes.ring(display, config.CENTER_X, config.CENTER_Y,
config.SAFE_RADIUS, WHITE)` on real hardware and nudge it until the ring
just clears the rim.

## Drawing Faces

[`face.py`](face.py) is a port of the
[smartwatch kit's `face.py`](../smartwatch/face.py) -- eyes, eyebrows,
mouths, labels, a bezel ring, all built from `shapes.py` and
`display.text()`/`fill_rect()`. None of it is GC9A01-specific, so
nothing needed to change except the numbers: every position and size is
the smartwatch kit's value scaled 1.5x (360 / 240 pixels), with the
original written alongside it in a comment so you can see where each
number came from.

That scaling is arithmetic, not a hardware measurement -- in particular
`bezel()`'s ring radius depends on `config.SAFE_RADIUS`, which is itself
an unverified estimate (see Drawing Shapes above). Watch for eyebrows or
the bezel ring crowding the rim, since that is what a wrong
`SAFE_RADIUS` would look like.

### Labels are bigger here, on purpose

The bitmap fonts cannot scale -- they are fixed 8x16 and 16x32 glyphs.
So a bigger screen does not make text bigger, it makes text
proportionally *smaller*: the 8x16 font covered 3.3% of the smartwatch
kit's width and covers 2.2% of this one.

So `face.label()` draws in the **16x32** font here, where the smartwatch
kit used 8x16. Two consequences worth knowing before you write a lab:

- **Keep labels to 12 characters.** At `LABEL_Y` the safe circle is
  about 199 px across, and 12 characters of 16x32 is 192 px. Every Ekman
  emotion name fits; "Surprised", the longest, is 144 px.
- **Dense readouts stay in the small font.** `face.text()` and
  `face.centered_text()` are still 8x16, because a 19-character string
  in the big font is 304 px and no row of this circle is that wide.
  Labs 26, 29, 31 and 32 all print instrument panels for this reason.

`face.erase_label()` clears 32 rows to match. Erasing only 16 leaves the
bottom half of every letter on the glass -- there is no frame buffer to
save you.

## Uploading the Code

```bash
./upload-code.sh
```

> **Quit or disconnect Thonny first.** Only one program can use the
> board's serial port at a time.

The script requires [`mpremote`](https://docs.micropython.org/en/latest/reference/mpremote.html)
(`pip install mpremote`), uploads everything in `lib/` to `:lib/` first
(the driver and both font modules), then `config.py`, then the labs, and
auto-detects the serial port. Override with `PORT=/dev/your-device
./upload-code.sh` if it picks the wrong one.

> **Everything `.py` in this folder gets uploaded**, with no allowlist.
> Only labs, `config.py`, and `lib/` belong here -- development tools go
> in [`src/utils/`](../../utils/README.md).

## Checking the Labs Without a Board

Two checkers, and they catch different things:

```bash
python3 src/utils/check-labs.py   src/kits/sw-gc9b72   # does it run?
python3 src/utils/check-circle.py src/kits/sw-gc9b72   # is it visible?
```

`check-labs.py` is a smoke test, not a simulator -- it proves a lab runs
in CPython and draws inside the 360x360 square, not that a
MicroPython-driven GC9B72 shows anything.

`check-circle.py` covers the gap that leaves. The driver addresses a
square; the glass is the circle inside it. A pixel in the corner is
legal, costs real SPI bytes, and is permanently invisible -- and scaling
a kit up is exactly when that bites, because multiplying coordinates by
1.5 moves every one of them *further from center*. It found three such
places during this port, plus two the smartwatch kit already had.

Neither proves a face looks right. Both read `SAFE_RADIUS`, which on
this kit is still an estimate.

## Labs

Labs 0 through 33 are ported from the [smartwatch kit](../smartwatch/README.md)
and **keep its numbering exactly**, so the two kits can be taught side by
side and lab 17 means the same thing in both. Lab 34 is the only one with
no counterpart there.

| Lab | File | What it teaches |
|--|--|--|
| 0 | `00-blink-onboard-led.py` | Confirm the board itself works: blink GP25, with nothing else imported |
| 1 | `01-hello.py` | Confirm the display works, and that `text()` needs a font module |
| 2 | `02-screen-coordinates.py` | The coordinate system -- and that the corners are not there |
| 3 | `03-pixel.py` | `pixel()`, and why one call per dot is expensive here |
| 4 | `04-lines.py` | `hline()`, `vline()`, `line()`, and the eyebrow rule |
| 5 | `05-rect.py` | `rect()` vs `fill_rect()`, and erasing with black |
| 6 | `06-ellipse.py` | `shapes.ellipse()` and the quadrant fill codes |
| 7 | `07-circle.py` | Circles, and `ring()` -- the shape a round screen was made for |
| 8 | `08-poly.py` | `shapes.poly()` and the scanline fill behind it |
| 9 | `09-blit.py` | `blit_buffer()`, RGB565 sprite memory, and keyed transparency |
| 10 | `10-happy-face.py` | The first complete expression: eyes + eyebrows + mouth |
| 11 | `11-eye-scanner.py` | Animating a pupil sweep -- erasing only the eye boxes |
| 12 | `12-wink.py` | A closed-eye arc on just one eye |
| 13 | `13-blink.py` | Reading button A (GP14) with debounce |
| 14 | `14-eyebrows.py` | Curved eyebrows built from `poly()` |
| 15 | `15-no-blocking.py` | Pacing with `ticks_ms()` -- and how a slow draw blocks too |
| 16 | `16-sleepy.py` | Closed eyes, drooping brows, a drifting `Zzz` |
| 17 | `17-buttons.py` | Reading both buttons, and why text has to be erased first |
| 18 | `18-modes.py` | Button A/B cycle forward/back through a mode list |
| 19 | `19-emotion-modes.py` | A two-button menu over all seven Ekman emotions |
| 20 | `20-demo.py` | A self-running demo reel, no buttons needed |
| 21 | `21-sample-main-demo.py` | Demo reel + button menu, meant to become `main.py` |
| 22 | `22-face-parameters.py` | Live-tuning one face parameter with two buttons |

### Computational Thinking Labs

Labs 0 through 22 teach you how to make the hardware do something. Labs
23 through 33 teach you how to think about the code you just wrote. Work
them in order, and only after lab 22.

| Lab | File | Thinking skill | What it teaches |
|--|--|--|--|
| 23 | `23-face-module.py` | Decomposition, abstraction | Move duplicated face parts into `face.py`; three expressions in nine lines |
| 24 | `24-emotion-table.py` | Pattern recognition | Seven emotions become seven rows of data and one drawing function |
| 25 | `25-broken-faces.py` | Debugging | Five faces, five planted bugs, and a symptom-to-cause table |
| 26 | `26-trace-and-watch.py` | Debugging by measurement | An on-screen instrument panel: frame rate, button state, missed presses |
| 27 | `27-keyframes.py` | Algorithms | An animation is a list of poses; one player runs all of them |
| 28 | `28-state-machine.py` | Abstraction, modeling | A face with a memory -- states and transitions as tables |
| 29 | `29-partial-redraw.py` | Decomposition, measurement | Redraw only what changed, color the boxes to see it, then measure it |
| 30 | `30-design-your-own.py` | Capstone | Design an original expression; test shape-only against shape-plus-color |
| 31 | `31-draw-speed-timing.py` | Measurement, algorithms | Time pixel-at-a-time drawing against row runs |
| 32 | `32-color-bits.py` | Representation | RGB565 taken apart: masking, shifting, and what gets lost |
| 33 | `33-color-wheel.py` | Measurement, optimization | Every color at once, a full timing report, and two dead ends kept in the file |
| 34 | `34-color-demo.py` | *(this kit only)* | Six color and resolution test patterns for GC9B72 bring-up. No buttons needed. |

Lab 25 is the one to reach for when a class is stuck. It is the only lab
whose goal is to be broken, and its symptom table doubles as a standing
troubleshooting reference for every other lab here.

**Making a lab run automatically:** MicroPython runs a file named
`main.py` from the root of the filesystem a few seconds after power-up,
with no computer attached. Copy `21-sample-main-demo.py` onto the board,
rename it to `main.py`, and the watch face becomes a standalone device.

## Troubleshooting

If `01-hello.py` shows nothing:

- Check the five signal wires (SCL, SDA, RST, DC, CS) against the wiring
  table above -- a swapped SCL/SDA is the single most common mistake, and
  it's what started this kit (the pinout notes above were corrected from
  an earlier draft that had them backwards).
- Confirm `gc9b72.py`, `vga1_8x16.py`, and `vga1_bold_16x32.py` all landed
  in `/lib` on the board, not the root.
- Confirm the module's VCC is on **3.3 V**, not 5 V.
- If the backlight (BL, GP7) is wired but the screen stays dark, try
  `config.set_backlight(True)` from the REPL.
- If wiring and files check out and the screen is still blank or garbled,
  the init sequence itself may need adjustment for this specific board
  revision -- open an issue with what you see (blank/black, white noise,
  a rotated or mirrored image, etc.), since that symptom narrows down
  which register is wrong.
