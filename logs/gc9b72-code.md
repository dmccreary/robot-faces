# GC9B72 Kit Session Log

**Date:** 2026-08-18
**Task:** Bring up a new 2.1" 360×360 round GC9B72 display on a Raspberry Pi
Pico, then port the entire smartwatch kit (GC9A01, 240×240) onto it.
**Target board:** Raspberry Pi Pico + bare GC9B72 module, SPI0
**Starting point:** no MicroPython driver for this chip existed anywhere

## Results

| Metric | Value |
|---|---|
| Labs in kit | 35 (`00`–`34`) |
| Kit `.py` total | 6,427 lines |
| Shared modules | `config.py` (147), `face.py` (397) |
| Vendored into `lib/` | `gc9b72.py` (347, new), `shapes.py` (229), two fonts |
| `check-labs.py` | 35 ok, 0 off-screen, 0 failed |
| `check-circle.py` (new) | 30 clean, 5 outside-by-design |
| Rendered doc images | 34 PNGs, 916 KB |
| smartwatch regression | 34 ok, 0 off-screen, 0 failed |
| OLED regression | 29 ok, 3 off-screen (all pre-existing) |

**Hardware status:** the driver is confirmed working on a real board
(`01-hello.py` and `34-color-demo.py` both render correctly). **Labs 02–33
have never run on hardware.** They pass both checkers, which proves they
execute and draw inside the glass — not that any face looks right.

## Files Created

- `src/lib/gc9b72.py` — the driver, repo-level vendored copy
- `src/kits/sw-gc9b72/` — 35 labs, `config.py`, `face.py`, `README.md`,
  `upload-code.sh`, `lib/` (driver, `shapes.py`, two fonts)
- `src/utils/check-circle.py` — round-screen visibility checker
- `docs/kits/sw-gc9b72/` — 34 rendered screenshots + manifest
- `logs/gc9b72-code.md` (this file)

## Files Modified

- `src/utils/render_kit_screens.py` — made display-agnostic, and much faster
- `src/utils/README.md` — documented both the renderer and the new checker
- `CONTENT-GENERATION-GUIDE.md` — added the screenshot workflow
- `CLAUDE.md` — clarified the kit-root vs. `lib/` rule
- `src/kits/smartwatch/` — `shapes.py` moved to `lib/`; one wrong figure fixed

---

## 1. Writing a Driver for a Chip With No Datasheet

GalaxyCore has never published a public datasheet for the GC9B72. Searching
GitHub, the web, and the component distributors turned up exactly one
known-good register init sequence: the xboot project's `fb-gc9b72.c`, reached
via a C++ Arduino_GFX port published days earlier. That sequence — about 60
undocumented register writes — was translated to MicroPython.

Everything *else* about the driver follows Russ Hughes' `gc9a01.py`, already
vendored here, so the two round kits share an API and labs port between them.

**The init sequence is unverifiable by inspection.** There is nothing to check
the magic numbers against, which is why the file says so and tells the reader
not to tidy them.

### The pinout was wrong in the original notes

The supplied pinout listed SDA on GPIO2 and SCL on GPIO3, which is backwards
for a Pico's fixed SPI0 pin table. Asking rather than guessing caught it: the
clock is GP2 and the data is GP3. A silently swapped clock/data pair produces
a dead screen and no error message, which is the single most expensive class
of bug in this whole kit.

The listing also advertised 640×640. The panel's own silkscreen reads
`Resolution: 360x360`, and the user confirmed it mid-session.

## 2. What the Driver Was Missing

`shapes.py` — the kit's `ellipse()`, `poly()`, `circle()`, `ring()` — is pure
geometry that only calls `hline`/`vline`/`line`/`blit_buffer`, so it moved
across untouched. But it needed `line()`, which the new driver did not have.
Added from the same Bresenham routine `gc9a01.py` uses. `poly()`'s outline
mode and every angled eyebrow depend on it.

### `shapes.py` moved to `lib/`, in both kits

Initially placed at the kit root to match `CLAUDE.md` ("shared modules the
labs import, such as `config.py` and `face.py`"). The user disagreed —
`shapes.py` is plumbing — and they were right, so it moved, the smartwatch
kit's copy moved with it for consistency, and `CLAUDE.md` was rewritten to
draw the line by **what the code knows** rather than who wrote it:

> If a file would have to change when you swap the display or redesign the
> face, it belongs at the root. If it would travel to another kit unchanged,
> it belongs in `lib/`.

Both locations import identically — MicroPython puts `/` and `/lib` on
`sys.path` — so this was organizational, not functional.

## 3. The Port: 34 Labs, 1.5× Scale

Eleven agents worked in parallel from a written spec. The spec mattered more
than the parallelism: it fixed the scale factor, the font rules, the
round-screen rules, and a rule forbidding carried-over measurements.

### Two user decisions shaped everything

**Buttons on GP14/GP15.** Sixteen labs are button-driven and the kit had no
buttons. Note that an unconnected pull-up pin reads 1 forever — identical to
"not pressed" — so a button lab with no buttons does not crash, it sits
still. That is documented in `config.py` where someone debugging will find it.

**Labels in the 16×32 font.** Chosen because bitmap fonts cannot scale: a
bigger screen makes text proportionally *smaller* (8×16 covered 3.3% of the
240 px panel, 2.2% of this one). This decision had a consequence that took
real work to find — see below.

### What does *not* scale

| Scales ×1.5 | Does not scale |
|---|---|
| Coordinates, radii, spacings, stroke widths | Font glyphs (fixed 8×16 / 16×32) |
| Erase-box dimensions | Milliseconds — time is not pixels |
| Pixel and byte counts (×2.25) | RGB565 bit widths — 5/6/5 either way |
| | The 8,192-byte color bitmap (a property of 65,536 colors) |

Text centering had to be *recomputed* from real font metrics, never scaled.
Several labs hid a font dimension inside a literal — an erase box written as
`ZZZ_STEP_X * 2 + 16`, where the 16 was one 8 px glyph plus margins. Scaling
those wholesale would have produced boxes that miss.

### Measured numbers were not carried over

The source quotes real measurements from a Pico driving a GC9A01: 18.3 s vs
2.2 s, 616 µs/pixel, "roughly 10×", "8.3×", 4,986 distinct colors. None are
valid here — different chip, a newly written driver, 2.25× the pixels. Each
was either attributed to the smartwatch kit or marked unmeasured, and **no
replacement figures were invented.** Labs 31 and 33 keep their measuring
machinery intact and now ask the student to take the reading.

Structural claims were kept, because they are facts about algorithms rather
than panels: batching into horizontal runs still beats one call per pixel,
and the RP2040 still has no FPU.

### Two numbers that survived, and one that broke

**Lab 29's ratio survived exactly.** Full redraw vs. mouth box is 57,600/8,208
= 7.0175 at 240×240 and 129,600/18,468 = 7.0175 at 360×360 — both sides grow
by 2.25, so the ratio is scale-invariant. "Seven times fewer" is still true
while both counts changed. The closing lesson now says why.

**Lab 33's central argument broke.** Its "you cannot show all 65,536 colors"
was arithmetic: 45,239 visible pixels < 65,536 colors. At 360×360 the circle
holds 101,788, so the impossibility no longer closes. Rewritten to pose the
question and let the program's own count answer it.

## 4. The Bug the Font Decision Created

`text()` paints a **background** behind every glyph, so a label is not letters
— it is a solid black band as tall as the font. Moving to 16×32 doubled that
band to 32 rows while every position around it grew only 1.5×.

At the scaled `LABEL_Y = 45` the band covers rows 45–76. Afraid's raised
eyebrow (lift 11, tilt 18) reaches row 64. Since nearly every lab draws its
label *after* the face, the label would have sliced the top off that eyebrow.

Found by one agent in one lab, then checked across the kit and fixed centrally
at `LABEL_Y = 32` (band 32–63, clearing row 64 by one), plus the three labs
that set it inline. The cost is width: 159 px of safe circle at row 32 against
144 px for "Surprised", which is why labels are capped at 12 characters.

**Verified visually** by rendering Afraid — the worst case — and looking at it.
Both eyebrows intact.

## 5. Two Tools Built Along the Way

### `check-circle.py` — the gap `check-labs.py` documents about itself

> "it only checks the 240x240 square, so a face drawn entirely in the corners
> passes"

On a round display the driver addresses a square and the glass is the circle
inside it. Scaling a kit up is exactly when that bites, because multiplying
coordinates by 1.5 moves every one of them *further from center*.

It imports `check-labs.py` and wraps the single method every draw already goes
through. It ignores black — erasing a full-width strip is normal with no frame
buffer, and erasing *more* than needed is safe — which cut false positives from
ten labs to five. All five remaining are outside by design.

Its first run found `05-rect.py` drawing a border 113 px out on a panel whose
safe radius is 112: a pre-existing miss in the smartwatch kit, not a port error.

### `render_kit_screens.py` — made display-agnostic

The only kit-specific coupling was a hardcoded `"gc9a01"` string. Replaced with
the rule `check-labs.py` already uses — any `lib/` module defining a class is
the driver — so it now names no controller at all and a third kit would work.

It also had to get faster: filling 360×360 a pixel at a time is 129,600 Python
calls per clear. `fill_rect` now slice-assigns per row, `blit_buffer` copies
slice-to-slice, `touched()` scans the raw buffer with `any()`.

**That speedup exposed a real bug.** Regenerating the smartwatch kit, 32 of 33
images came back byte-identical and one differed — because the committed
`broken-faces` image was **entirely blank**. Each lab races a 3-second wall
clock, so a slow renderer does not merely take longer, it silently emits a
truncated picture. The script's own "STILL BLANK after retry" warning had
fired and been passed over.

## 6. Errors Found in Existing Code

| Where | Problem |
|---|---|
| `smartwatch/11-eye-scanner.py` | Claimed partial redraw costs "roughly a tenth" of the pixels. Real figure is 17.9% (10,304 of 57,600) — and scale-invariant, so wrong in both kits. Fixed in both, with the arithmetic now written into the comment so the claim is checkable. |
| `smartwatch/05-rect.py` | Border corners 113 px out against a 112 px safe radius. |
| `smartwatch/09-blit.py` | Stripe band ends ~9 px past the glass edge once scaled. |
| `smartwatch/broken-faces` PNG | Committed blank (renderer timeout). |
| `smartwatch/_render-manifest.json` | Down to **one entry** — a past `--only` run overwrote it. Now documented as a footgun. |
| `08-poly.py` prose | Said `array('B')` (max 255) "still fits this screen"; false at 360, where x reaches 359. |

The OLED kit was checked for the "tenth" claim and does not have it — its lab
11 redraws the whole face, so the partial-redraw lesson does not exist there.

## 7. Content Guidance Added

`CONTENT-GENERATION-GUIDE.md` gained a **Screenshots** section, because the
renderer is only useful if content actually uses it. The rule: never describe
what a lab draws from reading the code — render it and look. It documents the
commands, the slug convention, the embed syntax, and four ways the tool gives
a bad image quietly (timeout truncation, `--only` clobbering the manifest, the
manifest flagging blank but never *wrong*, and button labs showing one frozen
state).

It closes with what a PNG is evidence of: **the code, not the panel.**

## Open Items

1. **Run labs 02–33 on hardware.** Nothing below the driver has been seen on
   glass. The button labs are the least proven, since the buttons are new.
2. **`SAFE_RADIUS = 168` is an estimate**, scaled proportionally from the
   GC9A01's measured 112, never measured here. Every clearance claim in the
   kit inherits that uncertainty, and several labs clear it by under 10 px.
   Draw a ring at that radius and adjust until it just clears the bezel.
3. **`BAUDRATE` is a conservative 10 MHz.** The Arduino ancestor reports ~20
   MHz working on short leads. Raise it once the labs are confirmed.
4. **Regenerate the smartwatch doc images** — one is blank, and its manifest
   is a one-entry file. Deliberately not done here: it would rewrite 33
   committed files to fix one.
5. **No lab pages written yet** for either round kit. The PNGs exist; only the
   OLED kit has authored `index.md` pages beside them.
