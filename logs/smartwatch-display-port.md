# Smartwatch Display Port Session Log

**Date:** 2026-08-04
**Task:** Copy `src/kits/oled-2-buttons/` to `src/kits/smartwatch/` and port every
program from the SSD1306 (128×64 mono, framebuf-backed) to the GC9A01
(240×240 round, RGB565, direct-draw).
**Target board:** Waveshare RP2040-LCD-1.28
**Reference:** [dmccreary/clocks-and-watches `src/kits/gc9a01`](https://github.com/dmccreary/clocks-and-watches/tree/main/src/kits/gc9a01)

## Results

| Metric | Value |
|---|---|
| Labs ported | 32 (`00`–`31`) |
| Shared modules | 3 — `config.py` (113 lines), `shapes.py` (229), `face.py` (280) |
| Vendored into `lib/` | `gc9a01.py` (40 KB), `vga1_8x16.py` (8 KB), `vga1_bold_16x32.py` (28 KB) |
| Kit `.py` total | 4,362 lines (source kit was 3,219) |
| `check-labs.py` | 32 ok, 0 off-screen, 0 failed |
| OLED kit regression | unchanged — 29 ok, 3 off-screen (all pre-existing) |

## Files Created

- `src/kits/smartwatch/` — 32 numbered labs, `config.py`, `shapes.py`, `face.py`,
  `README.md`, `upload-code.sh`, `lib/` (driver + two fonts)
- `logs/smartwatch-display-port.md` (this file)

## Files Modified

- `src/utils/check-labs.py` — five changes so the harness can run a non-framebuf kit
- `src/kits/smartwatch/README.md` — replaced the 4-line placeholder

---

## The Three Facts That Drove Every Decision

Before writing any code I read the vendored driver's public API and diffed it
against what the OLED labs actually call. Three gaps fell out, and essentially
every design decision below traces back to one of them.

### 1. No frame buffer, therefore no `show()`

The SSD1306 driver subclasses `framebuf.FrameBuffer`: drawing pokes bits in
RAM and `show()` ships 1,024 bytes to the glass. The GC9A01 driver holds no
buffer at all — every call is an SPI transaction against the panel.

Keeping a full-screen buffer was considered and rejected: 240 × 240 × 2 bytes
= 115,200, which is most of what MicroPython leaves free on an RP2040's 264 KB.
That is not a tuning problem, it is the reason the driver is written this way.

**Decision: drop `show()` entirely rather than provide a no-op.**

A no-op `show()` would have made the port nearly mechanical and kept the book's
existing lab prose valid. It was rejected because it teaches a false model of
the hardware. Students would carry "nothing appears until you call show()" into
a kit where the opposite is true, and lab 25's bug 1 would be unfixable-by-
inspection nonsense.

The consequence is that `face.clear()` (115,200 bytes) becomes the most
expensive call in the kit, so **partial redraw moves from lab 29 to lab 11**.
The OLED kit could wipe and rebuild every frame and nobody noticed. Here it
flickers visibly and crawls. Labs 11, 12, 13, 15, 16, 21, 22, 26, 27 and 29 all
erase only the box that changed; `face.erase(x, y, w, h)` was added for this and
is used far more than `face.clear()`.

This *improves* lab 29 rather than damaging it. The OLED version's honest
conclusion was "you optimized the cheap part" — the buffer shipped in full
regardless. Here every skipped pixel is a pixel never sent, so the same code
shape produces a large win. Same optimization, opposite verdict, and the lab now
says so explicitly and points back at the OLED kit's version for contrast.

### 2. No `ellipse()`, `poly()`, or `blit()`

Those three are `framebuf` methods compiled into the MicroPython firmware. The
GC9A01 driver offers only `pixel`, `hline`, `vline`, `line`, `rect`,
`fill_rect`, `fill`, `blit_buffer`, `text`, `bitmap`, `write`.

Every eye, eyebrow arc and mouth in the kit is an ellipse. So a porting layer
was unavoidable.

**Decision: a new `shapes.py` module, functions taking `display` as first arg.**

Alternatives weighed:

- *Monkey-patch the methods onto the display object in `init_display()`* so lab
  code stays byte-identical to the OLED kit. Rejected: the magic is invisible,
  and a student who opens the driver looking for `ellipse()` finds nothing.
- *Put the helpers in `face.py`.* Rejected: labs 06, 07, 08, 11 and 18 need
  primitives before `face.py` exists in the curriculum (it arrives at lab 23).
- *Modify the vendored driver.* Rejected: it should stay diffable against
  upstream, same policy the OLED kit's README states for `ssd1306.py`.

`shapes.ellipse(display, x, y, rx, ry, color, fill, mask)` keeps framebuf's
argument order and **the same quadrant codes** (1/2/4/8), so `TOP_HALF` still
frowns and `BOTTOM_HALF` still smiles and every emotion table transfers with
only its numbers changed.

**Sub-decision: rows, not pixels.** The implementation walks one scanline at a
time and emits a single `hline()` per row rather than calling `pixel()` per dot.
This is not premature optimization — on a direct-draw display each call carries
a window-set command plus coordinates, so per-pixel drawing pays that overhead
thousands of times per face. This choice became the new subject of lab 31 (see
below).

Also added: `circle()`, `ring()` (the shape a round screen was made for),
`poly()` with a scanline fill, `triangle()`, `sprite()`/`sprite_pixel()` helpers
for building RGB565 buffers, and `blit_keyed()` to replace framebuf's
`blit(key=...)` transparency.

### 3. No built-in font

`framebuf.text()` has a fixed 8×8 font baked in. `gc9a01.text()` takes a font
**module** as its first argument and has none.

**Decision: vendor two fonts and expose them from `config.py`.**

`vga1_8x16.py` (8 KB) as `config.SMALL_FONT` and `vga1_bold_16x32.py` (28 KB) as
`config.BIG_FONT`, both fetched from the reference kit's `lib/`. 36 KB of a
~1.4 MB filesystem, and both are pure data modules with no imports.

The 16×16 fonts were considered and dropped — two sizes cover "label" and
"readable across a classroom," and a third would be flash spent for nothing.

Two round-screen consequences documented in `face.py` and the README:
- **Labels are centered, not corner-tucked.** `(2, 2)` is under the bezel.
  `face.label()` centers at the top of the circle; `face.centered_text()`
  generalizes it.
- **Text overprints rather than replaces.** With no buffer, `"9"` drawn where
  `"10"` was leaves the `1` behind. `face.erase_label()` exists for this, and
  lab 17 makes students hit the bug first.

---

## Round-Screen Geometry

The controller addresses a 240×240 square; the glass is the inscribed circle.
A corner pixel is real, addressable, paid for, and permanently invisible —
with no error and no warning.

Constants settled on, in `config.py`:

| Name | Value | Why |
|---|---|---|
| `CENTER_X/Y` | 120 | |
| `RADIUS` | 120 | physical edge of the glass |
| `SAFE_RADIUS` | 112 | the rim curves away and sits under the bezel |
| `inside_circle(x, y, margin)` | — | the check students have to run themselves |

**Face layout was redesigned, not scaled.** The OLED was 128×64 — twice as wide
as tall — so its faces were vertically squashed by necessity. A 240×240 round
screen is not that shape, so a straight ×1.875/×3.75 multiply would have been
wrong in both axes. Final geometry in `face.py`:

| | OLED | Smartwatch |
|---|---|---|
| `EYE_SPACING` | 26 | 48 |
| `EYE_Y` | 24 | 102 |
| `PUPIL_RADIUS` | 3 | 8 |
| `EYEBROW_Y` | `EYE_Y - 10` | `EYE_Y - 40` |
| `MOUTH_Y` | 46 | 164 |
| `STROKE` | 3 | 4 |
| `CLOSED_THRESHOLD` | 2 | 5 |
| label position | `(2, 2)` | centered, `y = 30` / `y = 200` |

`MOUTH_Y` moved from 158 to 164 mid-build after checking that the Surprised
eyes (radius 32, bottom edge 134) would otherwise touch the open mouth's top
edge. `BOTTOM_LABEL_Y` moved 194 → 200 for the same reason against the Happy
smile's lower edge at 188.

Emotion table values were re-derived at roughly ×2.4 on eye radii and re-checked
against the circle, not blindly multiplied.

---

## Verification

### `check-labs.py` needed five changes

The harness's docstring already promised a new kit with a different driver would
work "without touching this file." That turned out to be true for the module
stubbing and false for four other things:

1. **Screen size.** `DisplayStub.__init__` reads dimensions from the driver's
   constructor, but `GC9A01(spi, dc=..., ...)` is never told its size — it knows
   it is always 240×240. Without a fix every bounds check ran against the
   128×64 fallback. Added `_read_kit_screen_size()`, which regex-reads
   `WIDTH`/`HEIGHT` out of the kit's own `config.py` as *text* (not an import,
   so it runs before the stubs are installed and cannot start a display).
2. **Two `text()` signatures.** framebuf is `text(string, x, y, colour)`;
   GC9A01 is `text(font, string, x, y, fg, bg)`. The stub now dispatches on
   whether the first argument is a `str`, and sizes the bounds check from the
   real `font.WIDTH`/`font.HEIGHT`.
3. **`blit_buffer()`** added to the stub, with origin and corner checks.
4. **Font modules must not be stubbed.** `_build_driver_module()` returns
   `DisplayStub` for *any* attribute, so `config.SMALL_FONT.WIDTH` would have
   been a class and every centered-text calculation meaningless. Lib modules are
   now split by a documented heuristic: **defines a top-level class → stub it
   (drivers do); no class → import it for real (data modules do).**
5. **The "no display was constructed" note** would have been misleading, since
   bounds now come from `config.py`. It reports which source it used.

The OLED kit's results were verified byte-identical before and after via
`git stash` — its 3 off-screen warnings (labs 06, 16, 21) are pre-existing and
unrelated.

### An offline rasterizer caught a real bug

`check-labs.py` explicitly cannot tell you whether a face *looks* right, and
this port made two claims it could not check: that the ellipse algorithm is
correct, and that every part of every emotion lands inside the visible circle.

So a throwaway rasterizer was written **in the scratchpad, not in `src/utils/`**
— it implements a `Raster` stand-in for the display that records pixels, flags
anything drawn outside `SAFE_RADIUS` or off the raster, and writes a PNG contact
sheet of all eight emotions with the bezel masked out.

Result: all eight emotions clean, worst radius 101.8 against a safe ring of 112.

**It also caught a genuine bug in `shapes.ellipse()`.** The outline path draws,
per row, the horizontal run between this row's edge and the previous row's, so
a steep curve stays connected. The first version computed:

```python
step_from = edge if previous is None else min(edge, previous)
run = edge - step_from + 1
```

which silently assumes the edge is *growing*. That holds on the way down to the
equator and fails after it: past the midpoint `edge < previous`, so
`min()` returns `edge`, `run` collapses to 1, and the entire bottom half of
every arc renders as a row of disconnected vertical ticks. Every smile in the
kit was a comb.

Frowns looked fine, which is exactly why this would have survived a casual
visual check on hardware — `TOP_HALF` never enters the shrinking region.

Fixed by measuring between the two edges without assuming which is larger, with
a comment naming the failure mode so nobody re-derives it.

---

## Notable Content Decisions

**Lab 00 blinks the backlight.** GP25 is `LCD_BL` on the RP2040-LCD-1.28, not
an onboard LED — the board has no user LED. Rather than delete the lab, it
blinks the backlight: same lesson (Pin, OUT, toggle, sleep), better first test
(board alive *and* display powered *and* correct pin), and it inoculates against
Pico code that strobes the screen. Filename kept for chapter cross-references.

**Three of lab 25's five bugs are new.** The bug set is hardware-specific, and
saying so is part of the lesson:

| # | OLED bug | Smartwatch bug |
|---|---|---|
| 1 | forgot `show()` | **backlight off** — the #1 "my display is dead" report; pixels correct, no light to see them by |
| 2 | forgot to clear the buffer | unchanged (ghosting is now permanent, on glass) |
| 3 | y went negative | **drawn where a rectangular display's corners would be** — legal coordinates, no error, nothing there |
| 4 | quadrant mask inverted | unchanged |
| 5 | `sleep()` blocks the loop | unchanged, plus a note that a slow *draw* blocks identically here |

Bug 3 carries the `check-labs: allow-offscreen` marker: at (30, 30) with radius
32 it both clips the raster *and* hides under the bezel — two real failures at
once, and the marker is required so the checker does not flag the intent.

**Lab 31 changed subject.** The original timed a hand-written ellipse against
framebuf's compiled built-in, and the answer was "compiled beats interpreted."
There is no built-in ellipse here, so that comparison is impossible. It now
times **pixel-at-a-time against row-runs — both interpreted MicroPython** — and
the answer becomes "batching your bus traffic beats optimizing the work inside
it," which generalizes to SD cards, sensors and networks. A closing note points
at `gc9a01_mpy` (the C driver, with a pre-built `WAVESHARE_RP2040_LCD_1.28`
image) as the third tier, and explains why this kit deliberately ships the
readable Python one.

**Lab 09 gained a `Sprite` class.** To build an RGB565 sprite you need
something drawable; `Sprite` wraps a buffer and implements the two methods
`shapes.ellipse()` actually calls. The lab points out that the drawing code
cannot tell it is not a display — a duck-typing lesson that arrives for free.

**Colors stayed white-on-black** per the request. `config.py` defines RED,
GREEN, BLUE, YELLOW, CYAN, MAGENTA for experimentation, and the README points at
`gc9a01.color565()`, but no lab uses them — the faces are meant to read the same
as the OLED kit's.

**Naming: `oled` → `display`.** Calling a 240×240 IPS LCD `oled` would be a
small lie repeated 400 times. `face.oled` became `face.display`; labs 25, 29 and
31 were updated accordingly.

---

## Constraints Respected

- **Kit directories upload wholesale.** Only labs, the three shared modules
  they import, `lib/`, `README.md` and `upload-code.sh` are in the kit dir. The
  rasterizer stayed in the scratchpad. `__pycache__` cleaned after each run.
- **Vendored driver untouched.** `lib/gc9a01.py` is a byte copy of
  `src/lib/gc9a01.py`; all gaps were filled in `shapes.py` instead.
- **No git worktrees**, per global instructions — worked directly in the main
  checkout.

## Open Items

- **Nothing has been run on real hardware.** The checker proves the labs run;
  the rasterizer proves the shapes are right. Neither says what a GC9A01 does at
  60 MHz. Two things to watch on first boot:
  - **SPI baud rate.** `config.BAUDRATE = 60_000_000` should be fine on the
    Waveshare board's short traces; drop to 20 MHz on jumper-wired modules, and
    the README says so.
  - **Frame rate of the pure-Python driver** in labs 11 and 20. If it drags,
    `gc9a01_mpy` is a drop-in swap.
- The rasterizer is currently disposable. If per-emotion visual regression
  checking is wanted for the book, it would belong in `src/utils/` alongside
  `check-labs.py` — it answers the one question that harness is explicit about
  not answering.
- The book's chapter 15 (*Porting Faces to a Color Display*) and chapter 12's
  SPI timing table were not touched. Chapter 15 now has a complete worked
  example to draw on if that is wanted.

---

# Revision — 2026-08-04, same day: real hardware wiring

Dan supplied a color-cycling program **confirmed working on his bench**. It
contradicted the board assumption above, so the kit was retargeted. Everything
before this line is left as originally written; this section is what actually
ships.

## What the working program established

```python
spi = SPI(0, baudrate=60000000, sck=Pin(2), mosi=Pin(3))
tft = gc9a01.GC9A01(spi, dc=Pin(4, Pin.OUT), cs=Pin(5, Pin.OUT),
                    reset=Pin(6, Pin.OUT), rotation=0)
```

| Fact | Previously assumed | Verified |
|---|---|---|
| Board | Waveshare RP2040-LCD-1.28 | **Pico + bare GC9A01 module** |
| SPI bus | SPI1 (GP10/GP11) | **SPI0 (GP2/GP3)** |
| DC / CS / RST | GP8 / GP9 / GP12 | **GP4 / GP5 / GP6** |
| Backlight | GP25, passed to the driver | **not passed at all** — BL tied to 3V3 |
| 60 MHz over Dupont jumpers | warned against; advised 20 MHz | **works** |
| GP25 | the backlight | the Pico's onboard LED |

The pin choice is not arbitrary: GP2–GP6 is the OLED kit's exact breadboard
block. A student who has built the OLED kit swaps the display and keeps their
wiring habits, with only the last three pins changing meaning (the OLED's
RES/DC/CS on 4/5/6 become the GC9A01's DC/CS/RST). That made "Pico + module"
clearly the intended kit shape, not a fallback.

## Decision: two board profiles, verified one is the default

`config.py` now opens with `BOARD = "pico"` and branches to one of two pin
blocks. Rejected alternatives:

- *Hard-code the verified pins and delete the Waveshare block.* Rejected —
  the Waveshare board is a real option and its pinout was already researched;
  throwing it away costs nothing to keep.
- *Keep Waveshare as default since the README was written around it.* Rejected
  outright. **You do not ship students a default that has never been run.**

The file says plainly which profile is tested and which came from a datasheet.

Also added, matching the working program's imports:
`from gc9a01 import color565`, re-exported as `config.color565()`.

## Handling "there is no backlight pin"

`BL_PIN = None` on the pico profile. `init_display()` passes `backlight=None`
to the driver (which already guards with `if backlight is not None`), exactly
reproducing the verified call.

Added `config.set_backlight(on)`, which **returns False when there is no pin
to toggle** rather than raising. A silent no-op would have been worse than
either alternative — a student wiring up brightness control deserves to be
told the pin does not exist.

## Two labs had to change, or the config edit would have broken them

**Lab 00** previously hard-coded "GP25 is the backlight." On a Pico it is the
onboard LED. Rewritten to work on both boards with the same line of code, and
the header now spells out both meanings.

It also gained an explicit note about *why* it imports nothing from the kit:
if the first diagnostic depends on the driver and fonts being installed, then
a missing file and a dead board look identical, and the lab is useless. That
constraint is why the fix was a comment change rather than `import config`.

**Lab 25's bug 1** was "backlight off," which is unreproducible when `BL_PIN`
is `None`. Replaced with **`face.clear()` in the wrong place** — the face is
drawn correctly and then wiped, one line, works on every board.

This turned out to be the better bug anyway. It is the true direct-draw
analogue of the OLED kit's forgotten `show()`: on a buffered display the
ordering of a clear is invisible until you push; here every call lands
immediately, so a wipe in the wrong position erases finished pixels off the
glass. The symptom is identical to the old bug ("black screen, shell still
printing"), so the lab's structure survives intact.

The backlight explanation was **not** discarded — it is the single most useful
field-troubleshooting fact in the kit. It now sits in the symptom table as
cause (b) for the same symptom, with the note that a student whose
`config.BL_PIN` is `None` can cross it off and look for cause (a). Two causes,
one symptom, and telling them apart is the skill.

## Files touched in this revision

- `config.py` — rewritten: two board profiles, `set_backlight()`, `color565`
  re-export, 60 MHz documented as verified
- `00-blink-onboard-led.py` — works on both boards; the no-imports rule made
  explicit
- `25-broken-faces.py` — new bug 1; `config.set_backlight()` in the reset path;
  symptom table now covers both causes; intro paragraph updated
- `README.md` — kit contents now Pico + module; two wiring tables with the
  verified one first; retracted the 20 MHz advice; troubleshooting rewritten

## Verification

- `check-labs.py src/kits/smartwatch` → **32 ok, 0 off-screen, 0 failed**
- Imported `config.py` under the harness stubs and printed every constant
  against the working program: SPI0, GP2/3/4/5/6, 60 MHz, `backlight=None`,
  `rotation=0` — exact match.
- `set_backlight(False)` returns `False` on the pico profile, as designed.

## Corrections to the record above

Two claims in the original log are now wrong and are superseded here, not
edited in place:

1. **"Target board: Waveshare RP2040-LCD-1.28."** It is a Pico plus a bare
   GC9A01 module; Waveshare is the alternate profile.
2. **"Drop to 20 MHz on jumper-wired modules."** Written from general caution
   about unshielded wiring, with no measurement behind it. 60 MHz is confirmed
   over ordinary Dupont jumpers, and the README now says to step *down* only if
   speckle or tearing actually appears.

The "nothing has been run on real hardware" open item is now **partly closed**:
the wiring, the SPI clock and display initialization are confirmed. The labs
themselves — frame rates, animation smoothness, whether the pure-Python driver
keeps up in labs 11 and 20 — are still untested on a board.
