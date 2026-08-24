# Eye Scanner Speedup Session Log

**Date:** 2026-08-18
**Task:** Make `11-eye-scanner.py` fast enough to use as a real robot
behavior on the GC9B72 kit.
**Target board:** Raspberry Pi Pico + 2.1" 360x360 GC9B72, SPI0, 20 cm
ribbon cables, MicroPython 1.28
**Motivating use case:** a collision-avoidance robot backs away from a
wall and runs the eye scanner while it "decides" which way to turn. The
scan has to read as deliberation, so it has to move at a believable
speed.

## Results

| Version | Per frame | Measured frame time |
|---|---|---|
| `11-eye-scanner.py` (v1) | 40,952 px, 222 calls | **455 ms** |
| `eye-scanner-fast.py` (v2, `STEP=7`) | 860 px, 76 calls | **118 ms** |
| `eye-scanner-sprite.py` (v3, `STEP=7`) | 2,356 px, 2 calls | **8.1 ms** |
| `eye-scanner-sprite.py` (v3, `STEP=1`) | 1,984 px, 2 calls | **7.2 ms** |
| v3 `STEP=1` at 24 MHz SPI | 1,984 px, 2 calls | **4.2 ms** |

All measured on hardware at 8 MHz actual SPI unless noted. End-to-end:
**455 ms to 4.2 ms, a 108x improvement**, or 2.2 fps to 239 fps.

`STEP = 1` with `DELAY = 0` is the shipped default and the configuration
the user demos.

### The baud-rate response is the cost model's best evidence

Timing v1 and v3 across all three achievable SPI clocks:

| Actual SPI | v1 (222 calls) | v3 (2 calls) |
|---|---|---|
| 8 MHz | 455 ms | 7.2 ms |
| 12 MHz | 420 ms | 6.1 ms |
| 24 MHz | 387 ms | 4.2 ms |

Tripling the clock buys v1 only **15%** and v3 **42%**. That is exactly
what "a call costs ~1 ms regardless of baud rate" predicts: v1 is
call-bound and cannot be clocked out of its problem, while v3 has so few
calls that bytes on the wire are finally the larger half of its bill.

## What Actually Happened

The session's value was not the code. It was that **two rounds of
measurement each overturned the theory that produced the previous
version.**

### Step 1 - the obvious optimization, from the wrong model

v1 erases two 138 x 84 boxes and rebuilds both eye ellipses every frame
to move a pupil one pixel. The natural fix is to repaint only the pixels
that differ. When a disk slides `dx` pixels sideways, only two thin
crescents change: the leading edge it just covered, and the trailing edge
it just left. Both runs are exactly `dx` wide on every row.

v2 does that, and cuts pixels per frame by **330x** (at `STEP = 1`).

### Step 2 - the measurement that killed the model

v2 measured **118 ms per frame**. Barely better than v1, despite sending
1/330th of the pixels.

Dividing is what broke the case open:

```
118 ms / 76 calls = 1.55 ms per call, to deliver 7-pixel runs
```

The 860 pixels v2 sends are 1,720 bytes, about 1.4 ms of wire time. So
**98% of the frame was per-call overhead**, not pixels. Every `fill_rect`
pays for a CASET command, a RASET command, a RAMWR command and four
chip-select toggles before one pixel of payload moves.

That also explained a visual artifact the user reported: pixel trails at
the top and bottom of each pupil at `STEP` 3-6. A 118 ms frame spans
about seven panel refreshes, and the 76 calls are strung across all of
it, so the panel repeatedly scans out a half-moved pupil. It was not
residue - the final framebuffer state was verified pixel-identical to a
full redraw. It was the redraw being visibly *in progress*.

### Step 3 - optimize the resource that actually costs

If calls are the bill, send more pixels in fewer calls. A pupil moving
`STEP` pixels only disturbs a rectangle `2r+1+STEP` wide by `2r+1` tall,
and every pixel in it is either pupil-black or eye-white, known before
the program runs. So v3 builds that rectangle once in RAM and stamps it
with one `blit_buffer()` per eye.

2.7x the pixels, 38x fewer calls: **118 ms to 8.1 ms**.

### Step 4 - the baud rate that was never applied

The user reported that changing `config.BAUDRATE` to 20 MHz and 30 MHz
made no difference. Reading the board directly found why:

```
board BAUDRATE = 10000000
```

The edit had not reached the Pico, so all three runs were the same run.
Then the SPI object's `repr()` showed something worse:

```
config.BAUDRATE : 10000000
SPI reports     : SPI(0, baudrate=8000000, ...)
```

**10 MHz was never 10 MHz.** MicroPython on the RP2040 divides a 48 MHz
peripheral clock and rounds down. The achievable ladder:

| requested | actual |
|---|---|
| 8-11 MHz | 8 MHz |
| 12-23 MHz | 12 MHz |
| 24 MHz and up | 24 MHz (ceiling) |

Nothing exists between 12 and 24. **Asking for 20 MHz silently gives you
12.** Even if the edit had landed, the result would have looked like a
weak effect and reinforced the wrong conclusion a second time.

Measured end to end on v3 at `STEP = 7`: 8.1 ms at 8 MHz, 6.9 ms at
12 MHz, 4.6 ms at 24 MHz. The full v1-vs-v3 matrix is in Results above.

## The Cost Model

From `spi-cost.py`, run on the board:

| Actual SPI | Fixed per call | Per byte | Delivered |
|---|---|---|---|
| 8 MHz | ~970 us (blit), ~1,138 us (`fill_rect`) | 1.185 us | 6.7 Mbit/s |
| 12 MHz | same | 0.791 us | 10.1 Mbit/s |
| 24 MHz | same | 0.396 us | 20.2 Mbit/s |

Two facts worth carrying into every other lab in this kit:

1. **A drawing call costs about 1 ms, whatever the baud rate.** It is
   chip-select and command bytes and MicroPython, not transfer. This is
   the single most useful number in the kit.
2. **Delivered throughput is ~84% of the wire rate at every rung**, so
   the SPI clock is a real lever once the call count is low enough for
   bytes to matter.

The model predicts v3 at 8 MHz, `STEP = 7`, as `970 + 2356 x 1.185 =
3,761 us` per blit, or 7,522 us for two. Measured: 8,129 us. Within 8%.

## Files

**Added to `src/kits/sw-gc9b72/`:**

| File | Purpose |
|---|---|
| `eye-scanner-fast.py` | v2, edge-only repaint. Kept as the teaching step and the measurement baseline, not as the recommended version. |
| `eye-scanner-sprite.py` | v3, one sprite stamp per eye. The one to use. |
| `spi-cost.py` | Measures fixed-cost-per-call and cost-per-byte on any board, and prints requested vs actual baud rate. |
| `eye-saccade.py` | Jump-and-hold gaze. Also added to `smartwatch/` and `oled-2-buttons/`, each using only techniques its own kit teaches. |

**Changed:**

- `config.py` - the `BAUDRATE` comment previously advised raising the
  rate "and see how far it goes," which fails silently on this chip. It
  now carries the measured ladder, the read-back recipe, and what each
  rung buys. **The value now ships at `24_000_000`.**
- `docs/kits/sw-gc9b72/index.md` and a new lesson page,
  `docs/kits/sw-gc9b72/eye-scanner-speedup/index.md`.

## Verification

- **Pixel-identity.** Both new labs were run against a simulated
  framebuffer and diffed against a from-scratch redraw at the same pupil
  offset. Zero mismatched pixels: v2 at `STEP` 1, 2, 3, 5, 7, 40, 45; v3
  at `STEP` 1, 2, 3, 5, 7, 9, 15. All three versions draw an identical
  face.
- **A caught defect.** v3's first fit-check only validated the pupil
  circle. The sprite is a *rectangle*, whose corners reach where the
  circle never does, and the eye ellipse is only 61 px wide at the
  pupil's top and bottom rows versus 66 across the middle. The corners
  clear by exactly one pixel at the shipped constants. The check was
  widened and now correctly rejects degenerate `STEP` values - confirmed
  by forcing `STEP = 100`, which warns and produces 712 wrong pixels.
- **A caught documentation error.** `spi-cost.py` originally claimed the
  RP2040 divides a 125 MHz clock. The measured ladder (8/12/24) proves
  it is 48 MHz. Corrected.
- `check-labs.py`: all labs pass, 0 off-screen, 0 failed, including with
  the edited `config.py`.
- Hardware: v3 timed at all three baud rungs; a signal-integrity pattern
  (full-screen white/red/green/blue fills) was left on the glass at
  24 MHz for visual inspection.

## Open Items

1. ~~Visual check at 24 MHz~~ **DONE.** Confirmed clean on 20 cm cables;
   `config.BAUDRATE` now ships at `24_000_000`. 10 cm cables are still on
   order and would only add margin.
2. ~~Saccade motion~~ **BUILT**, as `eye-saccade.py` in all three kits,
   with a lesson page each. Real eyes jump (30-80 ms) then fixate
   (200-400 ms); a linear sweep is smooth pursuit, which an eye does only
   when tracking a moving object.

   `SACCADE_STEP` was tuned by measurement, not taste. The first version
   used a step of 15 and crossed the eye in 13 ms -- three times faster
   than any human eye, which reads as a glitch rather than a glance. A
   step of 5 puts jumps at 3.9 ms (one step) to 72 ms (full crossing),
   measured at 24 MHz.

   That range is the interesting part: because a jump is a fixed number
   of equal steps, a long jump takes proportionally longer than a short
   one, which is exactly the amplitude-duration relationship real eyes
   follow (the "main sequence"). It falls out of the implementation for
   free.

   Cost: a full crossing is 72 ms of drawing followed by a 200-400 ms
   rest, versus the sweep's 2 calls every 4.2 ms forever -- under a fifth
   of the work, and the version that looks alive.
3. **Neither new lab is numbered**, so `check-labs.py` (which matches
   `NN-*.py`) skips them in place. They were verified via temporarily
   numbered copies. Renaming would bring them under the harness and into
   the kit README table.
