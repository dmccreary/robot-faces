# Smartwatch Kit (GC9A01 240×240 Round Display)

This kit is the [OLED Two Button Kit](../oled-2-buttons/README.md) ported to a
240×240 circular color display — the same panel used in cheap smartwatches and
round dev boards. Every lab number means the same thing it does in the OLED
kit, so the two can be taught side by side, and the differences between them
are most of the lesson.

## What's in the Kit

1. Raspberry Pi Pico ($3.99)
2. 1.28" GC9A01 round display module, 240×240
3. 1/2 size solderless breadboard (400 tie points)
4. 7 wire M-F Dupont cable
5. Two momentary push buttons

This is the same shape as the OLED kit — a Pico plus a display module — and it
uses the same five pins on the breadboard rail, so a student who has built the
OLED kit can swap the display and keep their wiring habits.

The labs also run unchanged on a **Waveshare RP2040-LCD-1.28**, which has the
round display soldered onto an RP2040. Flip one line in `config.py` — see
[Wiring](#wiring) below.

## The Display

**Controller: GC9A01A**, 240×240, round IPS, SPI, 16-bit RGB565 color.

Three facts about it drive every difference between this kit and the OLED kit.
They are worth reading before the first lab, because each one shows up as a
different bug when a student forgets it.

### 1. It is round

The controller addresses a 240×240 **square** of pixels, but the glass is the
circle inscribed in that square. Pixel (0, 0) is real, addressable, paid for —
and permanently invisible. Nothing warns you.

| Landmark | Value |
|---|---|
| Center | (120, 120) |
| Physical edge of the glass | radius 120 |
| `config.SAFE_RADIUS` | 112 |
| Corner of the addressable square | radius ≈ 170 — never visible |

`config.inside_circle(x, y)` does the arithmetic when you're placing something
near the rim. Labs 02 and 25 make students prove the corners are gone.

### 2. It is color

A pixel is a 16-bit RGB565 number, not a 0 or a 1. `config.py` defines RED,
GREEN, BLUE, YELLOW, CYAN and MAGENTA, and `config.color565(r, g, b)` builds
any other from three ordinary 0–255 values.

The cost of color is memory: 2 bytes per pixel instead of 1 bit. A 64×48
sprite is 6,144 bytes, and a full-screen buffer would be 115,200 — most of
what MicroPython leaves free on an RP2040. Lab 09 makes students do that
arithmetic themselves, and **lab 32** takes the encoding apart bit by bit.

**The default is still white on black, deliberately.** Three reasons:

- White on black is the highest contrast this screen can produce, and lab 30
  asks students to make an expression readable from across a room. Every color
  is dimmer than white.
- It keeps the two kits a *controlled comparison*. If this kit shipped rainbow
  and the OLED kit shipped mono, students could not tell which differences come
  from having no frame buffer and which come from having color.
- It makes color something a student **chooses**, which is where the creative
  ownership actually lives.

Color then enters at four places where it earns its keep:

| Where | What it teaches |
|---|---|
| `face.DEBUG_ERASE` (labs 11, 29) | Makes partial redraw *visible* — see below |
| One more column in lab 24's table | A new axis of expression costs one column, no new code |
| Lab 30's three-stage readability test | Color as a controlled variable in a real experiment |
| Lab 32, `32-color-bits.py` | RGB565 packing: masking, shifting, lossy encoding |

### Color is free here, and that matters

A red pixel and a black pixel are both two bytes of RGB565. Coloring something
costs nothing extra — only *adding shapes* costs, and lab 31 gives students the
method to measure that. This is why `DEBUG_ERASE` is worth having: your program
can explain itself for free.

### The one rule the kit enforces

**Color may reinforce an expression. It must never be the only thing carrying
it.** Lab 24 exercise 6 and lab 30's checklist both test this, for two concrete
reasons: roughly one boy in twelve has a red-green color deficiency, so an
angry-red/happy-green scheme says nothing to someone in most classrooms; and
color survives photographs, video calls and bright windows far worse than shape
does.

There is also a perceptual trap worth knowing before students pick colors. Your
eye takes most of its brightness from green light and almost none from blue, so
pure blue (`0x001F`) on black is startlingly dim. Measured as perceived
luminance against white at 255:

| Color | Perceived brightness |
|---|---|
| pure green `0x07E0` | 180 |
| pure red `0xF800` | 53 |
| pure blue `0x001F` | 18 |

That is why every color in lab 24's table is a pale mix with plenty of green in
it, rather than a pure channel.

### 3. There is no frame buffer, and therefore no `show()`

This is the big one. The SSD1306 driver kept a copy of the whole screen in RAM;
`oled.show()` shipped it to the glass. **This driver has no such buffer.** Every
drawing call goes straight down the SPI wire.

| | OLED kit | This kit |
|---|---|---|
| Drawing a shape | pokes bits in RAM, nearly free | sends bytes over SPI, costs real time |
| `show()` | required, or nothing appears | **does not exist** |
| Clearing the screen | free (it's a `memset`) | 115,200 bytes — the most expensive call in the kit |
| Forgetting to erase | ghosting in the buffer | ghosting on the glass, permanently |
| Partial redraw (lab 29) | small win — the whole buffer ships anyway | large win — skipped pixels are never sent |

The practical consequence: **animations erase only the box that changed.**
`face.erase(x, y, w, h)` is used far more than `face.clear()`, starting at
lab 11 rather than waiting for lab 29. On this hardware that isn't an
optimization you save for later, it's the price of admission.

**And you can watch it happen.** Erasing normally paints black onto black, so
the single most important thing the kit does is invisible. Set
`face.DEBUG_ERASE = config.RED` (button B toggles it live in lab 29) and every
erase box becomes a colored rectangle with the redrawn part on top of it:

| Mode | What lights up | Pixels repainted |
|---|---|---|
| Full redraw | the entire circle, every frame | 57,600 |
| Partial redraw | one rectangle around the mouth | 8,208 |

Seven times fewer, and no one has to be talked into believing it. It also turns
lab 29's "make the box too small" exercise self-diagnosing: the leftover pixels
sit plainly outside a boundary you can see.

## Wiring

`config.py` opens with a single `BOARD` setting that selects one of the two
pinouts below. Nothing else in the kit needs to change.

### `BOARD = "pico"` — Pico + bare GC9A01 module (default, **confirmed working**)

| Module pin | Pico pin |
|---|---|
| SCL / CLK | 2 |
| SDA / MOSI | 3 |
| DC | 4 |
| CS | 5 |
| RST | 6 |
| VCC | 3V3 |
| GND | GND |
| BL | 3V3 (tied on — see below) |
| Button A | 14 (PULL_UP, other leg to GND) |
| Button B | 15 (PULL_UP, other leg to GND) |

This is SPI0, and these are deliberately the same five pins in the same order
the OLED kit uses. Only the last three change meaning: the OLED's RES/DC/CS on
4/5/6 become the GC9A01's DC/CS/RST.

**60 MHz is confirmed working on this wiring, over ordinary M-F Dupont
jumpers.** If you ever see speckled pixels or torn frames — usually from long,
loose, or bundled wires — step `BAUDRATE` down to `20_000_000` and work back up.

**Most bare modules tie BL to 3V3**, so the backlight is permanently on and no
software can dim it. `config.BL_PIN` is `None` and `config.set_backlight()`
quietly does nothing and returns `False`. If you want brightness control, move
the BL wire off 3V3 onto a free GPIO and set `BL_PIN` to that number.

### `BOARD = "waveshare"` — Waveshare RP2040-LCD-1.28

The display is soldered on, so only the two buttons need wiring:

| Signal | GPIO | Note |
|---|---|---|
| LCD_DC | 8 | fixed on the board |
| LCD_CS | 9 | fixed on the board |
| LCD_CLK | 10 | **SPI1**, not SPI0 |
| LCD_DIN (MOSI) | 11 | fixed on the board |
| LCD_RST | 12 | fixed on the board |
| LCD_BL | 25 | **the backlight — not an onboard LED** |
| Button A | 14 | PULL_UP, other leg to GND |
| Button B | 15 | PULL_UP, other leg to GND |

> **⚠️ GP25 is the backlight on this board.** On a plain Pico it is the onboard
> LED, so any code brought across that toggles GP25 "to blink the LED" will
> strobe the screen instead. Lab 00 uses GP25 on purpose and works either way —
> the Pico blinks its LED, the Waveshare pulses its screen.
>
> A backlight accidentally left low is also the classic "my display is dead"
> report: the pixels are set correctly and there is no light to see them by.
> Lab 25's symptom table covers it, and `config.set_backlight(True)` is the one
> line that rescues you. It cannot happen on the default `"pico"` wiring, where
> BL is tied to 3V3.

These pin numbers come from the board's documentation and have not been run
here — the `"pico"` wiring above is the one that has been tested.

## Three Shared Modules

Three files in this folder are not labs. They are libraries the labs import:

| File | What it holds |
|---|---|
| [`config.py`](config.py) | The **hardware** facts — which pin, which pixel size, the circle's geometry, how to start the display and the buttons. Every lab imports it. |
| [`shapes.py`](shapes.py) | The **drawing commands this driver does not have** — `ellipse()`, `poly()`, `circle()`, `ring()`, keyed blitting. Labs 06 and up import it. |
| [`face.py`](face.py) | The **face** facts — how wide an eye is, where an eyebrow sits, how to draw each style of mouth, and what color it all draws in. Labs 23 and up import it. |

`face.py` also holds the two color switches. `face.set_color(c)` changes what
every part draws in from then on; every part function also takes an optional
`color=` for a one-off override; and `face.DEBUG_ERASE` turns erase boxes
visible. All three default to the old white-on-black behavior, so nothing in
labs 23–31 changed shape when color arrived.

`shapes.py` is the file with no counterpart in the OLED kit, and it exists
because of a real gap. The SSD1306 driver is built on MicroPython's `framebuf`
module, which ships `ellipse()`, `poly()` and `blit()` compiled into the
firmware. The GC9A01 driver is not built on `framebuf` and has none of them.
So `shapes.py` rebuilds them in MicroPython, in about 200 readable lines,
working in horizontal runs rather than single pixels because on this display
every separate drawing call is a separate conversation over SPI. Lab 31
measures what that choice is worth (roughly 10×).

Quadrant codes are unchanged — 1 = top-right, 2 = top-left, 4 = bottom-left,
8 = bottom-right, so `TOP_HALF` (3) still frowns and `BOTTOM_HALF` (12) still
smiles.

`face.py` does not introduce any new drawing tricks. Every function in it is a
copy of code students already wrote by hand in labs 10 through 22. Lab 23 is
where they move those copies into one file and see why that matters, so don't
hand out `face.py` as a starting point before then — feeling the duplication
first is what makes the lesson land.

## Text Is Different

There is no built-in font. `framebuf` gave the SSD1306 a fixed 8×8 font for
free; this driver has none, so `text()` takes a font **module** as its first
argument:

```python
display.text(config.SMALL_FONT, "Hello", x, y, WHITE, BLACK)
#            ^^^^^^^^^^^^^^^^^ not optional
```

Two fonts are vendored in `lib/`, and `config.py` imports both:

| Constant | Module | Size | Fits across the widest part |
|---|---|---|---|
| `config.SMALL_FONT` | `vga1_8x16.py` | 8 × 16 | 30 characters |
| `config.BIG_FONT` | `vga1_bold_16x32.py` | 16 × 32 | 15 characters |

Two more things about text on a round screen:

- **Corners don't exist, so labels are centered.** The OLED kit tucked a label
  into `(2, 2)`. Here `face.label()` centers it at the top of the circle, and
  `face.centered_text()` does the same at any y. How wide a line can be depends
  on how far down the screen it sits.
- **Text overprints; it does not replace.** With no frame buffer, drawing "9"
  where "10" was leaves the "1" behind. Erase the strip first —
  `face.erase_label()` exists for this. Lab 17 makes students hit it.

## Display Library

`config.init_display()` calls `import gc9a01`, so the driver has to be on the
board too. It lives in [`lib/gc9a01.py`](lib/gc9a01.py), which matches where
MicroPython looks for modules automatically (`/lib` is on `sys.path` by
default). The two font modules live there for the same reason, and they are
**not optional** — `config.py` fails to import without them.

`lib/gc9a01.py` is Russ Hughes' pure-MicroPython GC9A01 driver (MIT), which
descends from Ivan Belokobylskiy's `st7789py` work. It is the same file already
vendored at [`src/lib/gc9a01.py`](../../lib/gc9a01.py) in this repo.

**If the labs feel slow on real hardware**, the same author publishes
[`gc9a01_mpy`](https://github.com/russhughes/gc9a01_mpy) — the driver rewritten
in C and compiled into a custom MicroPython firmware, with a pre-built image
for `WAVESHARE_RP2040_LCD_1.28`. It is a drop-in speedup and it has a real
`ellipse()`. This kit deliberately uses the Python driver so students can open
it and read it; reach for the C one after lab 31 has shown them what they're
buying.

## Uploading the Code

Use the `upload-code.sh` script to copy `lib/`, `config.py`, and every lab onto
the board:

```bash
./upload-code.sh
```

> **⚠️ Quit or disconnect Thonny first.** Only one program can use the board's
> serial port at a time. If Thonny is still connected, the upload fails with
> *"failed to access ... (it may be in use by another program)"*. In Thonny,
> click **Stop/Restart** then **Run → Disconnect**, or just quit Thonny, then
> run the script again.

The script requires [`mpremote`](https://docs.micropython.org/en/latest/reference/mpremote.html)
(`pip install mpremote`), uploads everything in `lib/` to `:lib/` first
(creating `/lib` on the board if it isn't there yet), then `config.py` so the
other labs can import it, and auto-detects the serial port. If it picks the
wrong one, override it: `PORT=/dev/your-device ./upload-code.sh`.

If you'd rather upload by hand in Thonny, make sure `gc9a01.py`,
`vga1_8x16.py` and `vga1_bold_16x32.py` all end up in a `/lib` folder on the
board, not the root — otherwise `import gc9a01` fails with `ImportError: no
module named 'gc9a01'`.

> **⚠️ Everything `.py` in this folder gets uploaded.** The script globs `*.py`
> with no allowlist, so a stray tool or test script would land on the board and
> take up filesystem space students need. Only labs, the shared modules they
> import (`config.py`, `shapes.py`, `face.py`), and `lib/` belong here.
> Development tools go in [`src/utils/`](../../utils/README.md).

## Checking the Labs Without a Board

[`src/utils/check-labs.py`](../../utils/check-labs.py) runs every lab in this
folder against a fake microcontroller, which catches crashes, bad table rows,
and drawing calls that fall off the screen before you upload anything:

```bash
python3 src/utils/check-labs.py src/kits/smartwatch
```

It is a smoke test, not a simulator — it proves a lab *runs*, not that a face
looks right, and any timing number a lab prints under it comes from a fake
clock. Two things it specifically **cannot** tell you on this kit:

- whether a shape is inside the visible **circle** — it only checks the 240×240
  square, so a face drawn entirely in the corners passes
- anything about **speed**, which on this display is the main thing that
  separates good code from bad

Run the labs on real hardware before handing them out.

## Lab 33: The Color Wheel

`33-color-wheel.py` is a demo rather than a numbered exercise with things to
fill in, but it earns a lab number anyway — it is smoke-tested with the rest,
and it turned into the kit's best worked example of measuring before you
optimize. It fills the round screen with an HSV color wheel — hue around the
ring, saturation outward, button A stepping through three brightness levels.

It is the one program whose shape and the screen's shape are the same shape. A
color wheel *is* a circle, because hue is an angle, which is why red appears at
both ends of a rainbow. On a 128×64 rectangle the demo could not have existed.

It also answers a question worth asking out loud: **how many of the display's
65,536 colors can you actually see at once?** The wheel counts the distinct
RGB565 values it produced and prints the number. At full brightness it is about
**4,986** — and it drops as you dim it, because scaling a channel down before
the encoder truncates its low bits makes more values collapse onto each other.
Dim colors are coarser colors. Ask students to guess first; nearly everyone
guesses far too high.

### It is also the kit's worked example of optimization

The demo prints a full timing report — start, end, drawing, counting, rate,
microseconds per pixel — and a `FAST` flag switches between two drawing
functions that produce the same wheel. Both numbers below are measured on a
Pico:

| `FAST` | Time | Per pixel |
|---|---|---|
| `False` — written to be read | 18.3 s | 616 µs |
| `True` — written to be quick | 2.2 s | 74 µs |

The 8.3× splits into about **4×** from computing one color per 2×2 block, and
about **2.1×** from inlining two function calls and binding globals to locals —
no change to *what* is computed, only to how the interpreter reaches it. That
second figure is the lesson: roughly half the cost of the original loop was
never arithmetic at all.

The root cause is worth knowing before students meet it: **the RP2040 has no
FPU.** Every `atan2`, `sqrt` and float multiply is emulated in software. This is
the one program in the kit limited by arithmetic rather than by the wire, which
is exactly why the usual "batch your drawing calls" instinct did nothing for it.

Two dead ends are kept in the file next to the working code, because they teach
more than the successes:

- Merging same-colored blocks into single `fill_rect` calls — reasoning from the
  demo's own true measurement that 25,591 pixels repeat a color. It took display
  calls from 324 to 6,359. The repeats are real but scattered, not adjacent.
- `blit_buffer(line * BLOCK, ...)` to send a whole strip at once. Fine in
  CPython, `TypeError` on the board: MicroPython repeats a `bytes` with `*` but
  not a `bytearray`. `check-labs.py` cannot catch this, and now says so with
  this exact case in its docstring.

## Labs

Copy `config.py`, `shapes.py`, plus whichever lab file you're working on onto
the board's filesystem and run it in Thonny. The labs are numbered so you can
work through them in order, each one building on ideas from the last:

| Lab | File | What it teaches |
|--|--|--|
| 0 | `00-blink-onboard-led.py` | Confirm the board works: blink GP25, with nothing else imported |
| 1 | `01-hello.py` | Confirm the display works, and that `text()` needs a font module |
| 2 | `02-screen-coordinates.py` | The coordinate system — and that the corners are not there |
| 3 | `03-pixel.py` | `pixel()`, and why one call per dot is expensive here |
| 4 | `04-lines.py` | `hline()`, `vline()`, `line()`, and the eyebrow rule |
| 5 | `05-rect.py` | `rect()` vs `fill_rect()`, and erasing with black |
| 6 | `06-ellipse.py` | `shapes.ellipse()` and the quadrant fill codes |
| 7 | `07-circle.py` | Circles, and `ring()` — the shape a round screen was made for |
| 8 | `08-poly.py` | `shapes.poly()` and the scanline fill behind it |
| 9 | `09-blit.py` | `blit_buffer()`, RGB565 sprite memory, and keyed transparency |
| 10 | `10-happy-face.py` | The first complete expression: eyes + eyebrows + mouth |
| 11 | `11-eye-scanner.py` | Animating a pupil sweep — erasing only the eye boxes, and coloring them to see it |
| 12 | `12-wink.py` | A closed-eye arc on just one eye |
| 13 | `13-blink.py` | Reading button A (GP14) with debounce |
| 14 | `14-eyebrows.py` | Curved eyebrows built from `poly()` |
| 15 | `15-no-blocking.py` | Pacing with `ticks_ms()` — and how a slow draw blocks too |
| 16 | `16-sleepy.py` | Closed eyes, drooping brows, a drifting `Zzz` |
| 17 | `17-buttons.py` | Reading both buttons, and why text has to be erased first |
| 18 | `18-modes.py` | Button A/B cycle forward/back through a mode list |
| 19 | `19-emotion-modes.py` | A two-button menu over all seven Ekman emotions |
| 20 | `20-demo.py` | A self-running demo reel, no buttons needed |
| 21 | `21-sample-main-demo.py` | Self-advancing demo reel + button menu, meant to become `main.py` |
| 22 | `22-face-parameters.py` | Live-tuning one face parameter with two buttons |

### Computational Thinking Labs

Labs 0 through 22 teach students how to *make the hardware do something*.
Labs 23 through 33 teach them how to *think about the code they just wrote* —
the four habits that transfer to every program they will ever write, taught on
code they already understand.

Each of these labs refactors or interrogates something from an earlier lab, so
work them in order and only after lab 22.

| Lab | File | Thinking skill | What it teaches |
|--|--|--|--|
| 23 | `23-face-module.py` | Decomposition, abstraction | Move the duplicated face parts into `face.py`; three expressions in nine lines |
| 24 | `24-emotion-table.py` | Pattern recognition | Seven emotions become seven rows of data and one drawing function — then color arrives as one more column |
| 25 | `25-broken-faces.py` | Debugging | Five faces, five planted bugs, and a symptom-to-cause table |
| 26 | `26-trace-and-watch.py` | Debugging by measurement | An on-screen instrument panel: frame rate, button state, missed presses |
| 27 | `27-keyframes.py` | Algorithms | An animation is a list of poses; one player runs all of them |
| 28 | `28-state-machine.py` | Abstraction, modeling | A face with a memory — states and transitions as tables, not if-chains |
| 29 | `29-partial-redraw.py` | Decomposition, measurement | Redraw only what changed, color the boxes to see it, then measure how much it helped |
| 30 | `30-design-your-own.py` | Capstone | Design an original expression; test shape-only against shape-plus-color on real strangers |
| 31 | `31-draw-speed-timing.py` | Measurement, algorithms | Time pixel-at-a-time drawing against row runs and find out why batching wins |
| 32 | `32-color-bits.py` | Representation | RGB565 taken apart: masking, shifting, and what 16.7M colors lose on the way to 65,536 |
| 33 | `33-color-wheel.py` | Measurement, optimization | Every color at once, a full timing report, and an 8.3x speedup with two dead ends kept in the file |

Lab 25 is the one to reach for when a class is stuck. It is the only lab whose
goal is to be broken, and its symptom table doubles as a standing
troubleshooting reference for every other lab in the kit.

**Three of lab 25's five bugs are different from the OLED kit's version**, and
that is the lesson hiding inside the lesson: change the hardware and you change
the bugs. There is no forgotten `show()` here because there is no `show()`.
What replaces them are two failures that display could never have: work that
gets erased the instant after you draw it, and a face drawn perfectly onto
glass you cannot see.

**If `01-hello.py` doesn't show anything:** don't start rewiring yet — first
run `00-blink-onboard-led.py` to find out whether the problem is the board or
the display. That lab imports nothing from the kit on purpose, so it still
works when the driver or the fonts are missing.

- **The LED blinks** (or, on a Waveshare board, the screen pulses) — the board,
  the USB cable and Thonny's connection are all fine, so the trouble is
  downstream. Check the seven Dupont wires against the wiring table above,
  make sure `gc9a01.py` and BOTH font modules landed in `/lib` on the board
  (not the root), and confirm the module's VCC, GND and BL pins are seated in
  the breadboard.
- **Nothing happens at all** — the problem is the board or how you're talking
  to it. Try a different USB cable (many cheap cables are charge-only and carry
  no data), a different USB port, and check that Thonny's interpreter is set to
  *MicroPython (Raspberry Pi Pico)* on the right serial port. If Thonny can't
  see the board at all, MicroPython may not be installed on it yet.

**Making a lab run automatically:** MicroPython looks for a file named
`main.py` in the root of the filesystem and runs it a few seconds after
power-up, with no computer attached. Copy `21-sample-main-demo.py` onto the
board, rename it to `main.py`, and the watch face becomes a standalone device
that starts as soon as it gets power.

## Porting Cheat Sheet

For anyone bringing OLED code across, or teaching the two kits together:

| OLED (SSD1306 / framebuf) | Smartwatch (GC9A01) |
|---|---|
| `oled = config.init_display()` | `display = config.init_display()` |
| `oled.fill(BLACK)` | `display.fill(BLACK)` — same call, far higher cost |
| `oled.show()` | *(delete it — there is no buffer to push)* |
| `oled.ellipse(x, y, rx, ry, c, f, m)` | `shapes.ellipse(display, x, y, rx, ry, c, f, m)` |
| `oled.poly(x, y, coords, c, f)` | `shapes.poly(display, x, y, coords, c, f)` |
| `oled.rect(x, y, w, h, c, fill)` | `display.rect(...)` outline / `display.fill_rect(...)` solid |
| `oled.text(s, x, y, c)` | `display.text(FONT, s, x, y, fg, bg)` |
| `oled.blit(fb, x, y, key)` | `display.blit_buffer(buf, x, y, w, h)` or `shapes.blit_keyed(...)` |
| `WHITE = 1`, `BLACK = 0` | `WHITE = 0xFFFF`, `BLACK = 0x0000` |
| Any x with any y | `config.inside_circle(x, y)` — they are no longer independent |
| Clear-draw-show every frame | Erase one box, draw one box |
