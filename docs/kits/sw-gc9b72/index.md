# Robot Faces — 2.1" Smartwatch Kit

This kit is the [1.2" Smartwatch kit](../smartwatch/index.md) built on a bigger panel — a
**360 × 360 round color display** driven by a GC9B72 controller, instead of the smaller kit's
240 × 240 GC9A01. Every lab number means the same thing in both kits, so they can be taught side
by side, and the differences between them (mostly: a wire that got swapped, and a font that
doesn't scale the way you'd expect) are worth knowing before you start.

The display comes from [this AliExpress listing](./aliexpress-listing-6-dollars.png), for about
$6 — GalaxyCore has never published an official datasheet for the GC9B72, so building a driver for
it meant reverse-engineering one from the nearest public reference. See
[Datasheet](#datasheet) below.

## Three Facts That Drive Everything

Read these before the first lab. They are the same three facts the 1.2" kit is built around —
this panel just makes each one bigger.

| Fact | Consequence |
|---|---|
| **It is round.** The controller addresses a 360 × 360 square; the glass is the circle inside it. | A corner pixel is real, addressable, and permanently invisible — with no error message. |
| **It is color.** A pixel is a 16-bit RGB565 number, not a 0 or a 1. | Two bytes per pixel instead of one bit — sixteen times the memory of the OLED kit. |
| **There is no frame buffer, so there is no `show()`.** | Every drawing call goes straight down the SPI wire, and costs real time — 2.25× the pixels of the 1.2" kit. |

That third one is the big one, on this kit more than any other in the book. A full-screen wipe here
is 259,200 bytes down the wire — the single most expensive call you can make — which is why
animations erase **only the box that changed**, starting at lab 11 rather than waiting for lab 29.

## A Fourth Fact, Unique to This Kit: Text Doesn't Scale

The bitmap fonts are fixed 8×16 and 16×32 glyphs — they cannot get bigger just because the screen
did. A label that covered 3.3% of the 1.2" kit's width covers only 2.2% of this one.

So `face.label()` draws in the **16×32 font here**, where the 1.2" kit uses 8×16 — and that
one change had a consequence worth knowing before you write your own lesson: `text()` paints a
**background** behind every glyph, so a label is a solid block as tall as the font, not just some
letters. Doubling the font doubled that block to 32 rows, and on the first pass it was tall enough
to paint over the top of a raised eyebrow. `face.LABEL_Y` was moved from the naive scaled value to
32 to clear it. If you write a lesson that positions a label near the top of the face, check it
against the tallest eyebrow in the kit, not just against the circle.

## Getting Started

| Lesson | What you'll learn |
|--|--|
| [Connection Test](connection-test/index.md) | Blink GP25 and prove the board is alive before you wire anything |
| [Hello World](hello/index.md) | Confirm the display works, and that `text()` needs a font module |
| [Screen Coordinates](screen-coordinates/index.md) | The coordinate system — and that the corners are not there |

## The Drawing Primitives

These seven lessons cover every drawing command you will need. Work through them in order and you
will have the complete toolkit.

| Lesson | Command |
|--|--|
| [Pixel](pixel/index.md) | `pixel()` — the single dot, and why one call per dot is expensive here |
| [Lines](lines/index.md) | `hline()`, `vline()`, `line()`, and the eyebrow rule |
| [Rectangle](rect/index.md) | `rect()` vs `fill_rect()`, and erasing with black |
| [Ellipse](ellipse/index.md) | `shapes.ellipse()` and the quadrant fill codes |
| [Circle](circle/index.md) | Circles, and `ring()` — the shape a round screen was made for |
| [Polygon](poly/index.md) | `shapes.poly()` and the scanline fill behind it |
| [Blit](blit/index.md) | `blit_buffer()`, RGB565 sprite memory, and keyed transparency |

## Building Faces

| Lesson | What you'll learn |
|--|--|
| [Your First Face](happy-face/index.md) | The first complete expression: eyes + eyebrows + mouth |
| [Eye Scanner](eye-scanner/index.md) | Animating a pupil sweep by erasing only the eye boxes |
| [Making the Eye Scanner Fast](eye-scanner-speedup/index.md) | Measuring lab 11 on real hardware and taking it from 455 ms to 4.2 ms per frame |
| [Winking with a Smile](wink/index.md) | A closed-eye arc on just one eye |
| [Blinking](blink/index.md) | Reading a button with debounce, and closing both eyes |
| [Eyebrows](eyebrows/index.md) | Curved eyebrows built from `poly()` |
| [Don't Block the Loop](no-blocking/index.md) | Pacing with `ticks_ms()` — and how a slow draw blocks too |
| [Sleeping Face](sleepy/index.md) | Closed eyes, drooping brows, and a drifting `Zzz` |

## Buttons, Menus, and Demos

| Lesson | What you'll learn |
|--|--|
| [Reading Two Buttons](buttons/index.md) | Two buttons independently, and why text has to be erased first |
| [Mode Switching](modes/index.md) | Button A and B cycle forward and back through a list |
| [The Expression Menu](emotion-modes/index.md) | A two-button menu over all seven Ekman emotions |
| [Demo Reel](demo/index.md) | A self-running showcase, no buttons needed |
| [Standalone main.py](sample-main-demo/index.md) | Demo reel + button menu, meant to become `main.py` |
| [Live Face Parameters](face-parameters/index.md) | Tuning one face parameter live with two buttons |
| [Color and Resolution Demo](color-demo/index.md) | Six test patterns built for this kit alone — the first thing to run on brand-new hardware |

## Thinking About Your Code

The lessons above teach you how to make the hardware do something. These eleven teach you how to
*think* about the code you just wrote — the four habits that transfer to every program you will
ever write, taught on code you already understand.

Work them in order, and only after you have finished the lessons above.

| Lesson | Thinking skill | What you'll learn |
|--|--|--|
| [The Face Module](face-module/index.md) | Decomposition, abstraction | Move the duplicated face parts into one shared file |
| [The Emotion Table](emotion-table/index.md) | Pattern recognition | Seven emotions become seven rows of data — then color arrives as one more column |
| [Five Broken Faces](broken-faces/index.md) | Debugging | Five planted bugs, a method for finding them, and a symptom table |
| [Trace and Watch](trace-and-watch/index.md) | Debugging by measurement | An on-screen instrument panel for bugs you cannot photograph |
| [Keyframes](keyframes/index.md) | Algorithms | An animation is a list of poses, and one player runs them all |
| [A Face With a Memory](state-machine/index.md) | Abstraction, modeling | States and transitions as tables, instead of tangled if-statements |
| [Only Redraw What Changed](partial-redraw/index.md) | Decomposition, measurement | Redraw just the moving part, color the boxes to see it, then measure |
| [Design Your Own Emotion](design-your-own/index.md) | All four | Invent an expression and test whether a stranger can read it |
| [Eye Saccade](eye-saccade/index.md) | Modeling | A pupil that darts and settles, the way a real eye does |
| [How Fast Is a Face?](draw-speed-timing/index.md) | Measurement, algorithms | Race pixel-at-a-time drawing against row runs |
| [Color and Bits](color-bits/index.md) | Representation | RGB565 taken apart: masking, shifting, and what 16.7M colors lose |
| [The Color Wheel](color-wheel/index.md) | Measurement, optimization | Every color at once, and a question the smaller kit's version couldn't ask |

## What's in the Kit

1. Raspberry Pi Pico
2. 2.1" GC9B72 round display module, 360 × 360
3. Half-size solderless breadboard (400 tie points)
4. Ten-wire M-F Dupont cable
5. Two momentary push buttons

## Wiring

The 10-pad breakout reads, left to right: `GND VCC SDA SCL RST DC CS BL SDO TE`. Only 8 of those
are wired — `SDO` (read-back) and `TE` (frame-sync) are not used by this driver.

| Module pin | Pico pin | Wire color |
|---|---|---|
| SCL / CLK | GP2 | orange |
| SDA / MOSI | GP3 | yellow |
| RST | GP4 | green |
| DC | GP5 | blue |
| CS | GP6 | purple |
| BL | GP7 | gray |
| VCC | 3V3 | red |
| GND | GND | black |
| Button A | GP14 (PULL_UP, other leg to GND) | |
| Button B | GP15 (PULL_UP, other leg to GND) | |

Buttons A and B are on **GP14 and GP15 in every kit in this book**, so wiring habits carry across
when you swap displays. The three pins that matter for the *display*, though, do **not** carry
across unchanged: the 1.2" kit's GC9A01 puts DC/CS/RST on GP4/5/6 in that order, and this kit's
GC9B72 puts RST/DC/CS on the same three pins in a *different* order. Copying one kit's wiring
notes onto the other's breadboard will not work — check the table above, not your memory of the
other kit.

One backlight difference worth knowing: on the 1.2" kit's default wiring, `BL` is tied straight to
3V3 and `config.set_backlight()` is a no-op. On this kit `BL` is a real GPIO (GP7), so
`config.set_backlight(True)` genuinely does something — which also means a backlight left low by
mistake is a real way to get a "dead" screen here.

Full wiring notes, upload instructions, and troubleshooting are in the kit's
[README](https://github.com/dmccreary/robot-faces/blob/master/src/kits/sw-gc9b72/README.md).

## Porting Cheat Sheet

For anyone bringing 1.2" kit code across, or teaching the two kits together:

| 1.2" Smartwatch (GC9A01, 240×240) | 2.1" Smartwatch (GC9B72, 360×360) |
|---|---|
| Screen is 240 × 240 | Screen is 360 × 360 — every position and size is the 1.2" kit's number × 1.5 |
| `face.label()` uses the 8×16 font | `face.label()` uses the **16×32** font — see [above](#a-fourth-fact-unique-to-this-kit-text-doesnt-scale) |
| `config.SAFE_RADIUS = 112` | `config.SAFE_RADIUS = 168` — an *estimate*, not yet measured against this panel |
| DC/CS/RST on GP4/5/6, in that order | RST/DC/CS on GP4/5/6 — same pins, different roles |
| `BL` tied to 3V3, `set_backlight()` is a no-op | `BL` on GP7, `set_backlight()` really switches it |
| `lib/gc9a01.py` | `lib/gc9b72.py` — a new driver; no public datasheet exists for this chip |

## Lessons Unique to This Kit

- [Making the Eye Scanner Fast](eye-scanner-speedup/index.md) — a step-by-step
  optimization story: how timing code inside the program found the slow part,
  why the obvious fix made almost no difference, and how the eye scanner went
  from 455 ms per frame to 4.2 ms.
- [Color and Resolution Demo](color-demo/index.md) — six test patterns built to bring up
  brand-new GC9B72 hardware, with no lab-11-style twin on the smaller kit.

## References

- [AliExpress Listing for $6.12 USD](https://www.aliexpress.us/item/3256812369957516.html)

![](./aliexpress-listing-6-dollars.png)

### Datasheet

GalaxyCore has never published an official public datasheet for the
GC9B72. The closest thing that exists is the register-level init
sequence in this reference driver, which is what our own
[MicroPython driver](https://github.com/dmccreary/robot-faces/blob/master/src/kits/sw-gc9b72/lib/gc9b72.py) was
ported from:

- [xboot/xstar `fb-gc9b72.c`](https://github.com/xboot/xstar/blob/main/xstar/driver/framebuffer/fb-gc9b72.c) --
  a Linux framebuffer driver, and (per the credit below) "the only
  known-good public GC9B72 init" anyone has found.
- [MaliosDark/Arduino_GC9B72](https://github.com/MaliosDark/Arduino_GC9B72) --
  an Arduino_GFX driver that ports the same init sequence to C++, and
  documents the panel's silkscreen ID (`VER:TFT 2.1 0_10`,
  `Driver IC: GC9B72`, `Resolution: 360x360`) and pinout.
