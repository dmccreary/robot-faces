# OLED Two Button Kit

This kit contains:

1. Raspberry Pi Pico ($3.99)
2. 2.42" OLED SPI display
3. 1/2 size solderless breadboard (400 tie points)
4. 7 wire M-F Dupont cable
5. Two momentary push buttons

## Wiring

| Signal | Pico Pin |
|---|---|
| OLED SCL | 2 |
| OLED SDA | 3 |
| OLED RES | 4 |
| OLED DC | 5 |
| OLED CS | 6 |
| Button A | 14 (PULL_UP, other leg to GND) |
| Button B | 15 (PULL_UP, other leg to GND) |

All of these pin numbers live in one place, [`config.py`](config.py), which
every lab below imports for its display and button setup.

## Display Library

`config.init_display()` calls `import ssd1306`, so the driver has to be on
the Pico too. It lives in [`lib/ssd1306.py`](lib/ssd1306.py) here, which
matches where MicroPython looks for modules automatically (`/lib` is on
`sys.path` by default, so `import ssd1306` finds it with no extra setup).

**Kept in sync with upstream (checked August 2026):** this copy matches
[`micropython/micropython-lib`](https://github.com/micropython/micropython-lib/blob/master/micropython/drivers/display/ssd1306/ssd1306.py)
byte-for-byte, the current canonical source — the driver moved there from
the main `micropython/micropython` repo in September 2022. It includes a
[June 2021 fix](https://github.com/micropython/micropython/commit/bc7822d8e95c40a9d5e403fd22c82b1bbad53b8b)
that (1) sends an `SET_IREF_SELECT` command during init, needed by some
SSD1315-based panels and harmless on true SSD1306 displays, and (2)
generalizes `show()`'s column-centering from a hardcoded `width == 64` case
to any width narrower than 128 — neither of which affects this kit's
128x64 display, but both matter if a narrower panel is ever used. If you
pull a newer `ssd1306.py` from elsewhere, diff it against the file at that
URL first rather than assuming it's safe to drop in.

## Uploading the Code

Use the `upload-code.sh` script to copy the library, `config.py`, and every
lab onto the Pico:

```bash
./upload-code.sh
```

> **⚠️ Quit or disconnect Thonny first.** Only one program can use the Pico's
> serial port at a time. If Thonny is still connected, the upload fails with
> *"failed to access ... (it may be in use by another program)"*. In Thonny,
> click **Stop/Restart** then **Run → Disconnect**, or just quit Thonny, then
> run the script again.

The script requires [`mpremote`](https://docs.micropython.org/en/latest/reference/mpremote.html)
(`pip install mpremote`), uploads `lib/ssd1306.py` to `:lib/ssd1306.py` first
(creating the `/lib` directory on the Pico if it isn't there yet), then
`config.py` so the other labs can import it, and auto-detects the Pico's
serial port. If it picks the wrong port, override it:
`PORT=/dev/your-device ./upload-code.sh`.

If you'd rather upload by hand in Thonny instead of running the script,
make sure `ssd1306.py` ends up in a `/lib` folder on the Pico, not the
root — otherwise `import ssd1306` fails with `ImportError: no module named
'ssd1306'`.

## Labs

Copy `config.py` plus whichever lab file you're working on onto the Pico's
filesystem and run it in Thonny. The labs are numbered so you can work
through them in order, each one building on ideas from the last:

| Lab | File | What it teaches |
|--|--|--|
| 0 | `00-blink-onboard-led.py` | Confirm the Pico itself works: blink the onboard LED |
| 1 | `01-hello.py` | Confirm the wiring works: print "Hello World!" |
| 2 | `02-screen-coordinates.py` | The (0,0)-at-top-left coordinate system |
| 3 | `03-pixel.py` | `pixel()`, the single dot everything else builds on |
| 4 | `04-lines.py` | `hline()`, `vline()`, `line()`, and the eyebrow rule |
| 5 | `05-rect.py` | `rect()`, `fill_rect()`, and erasing with black |
| 6 | `06-ellipse.py` | `ellipse()` and the quadrant fill codes |
| 7 | `07-circle.py` | Circles as a special case of the ellipse |
| 8 | `08-poly.py` | `poly()` for triangles, stars, and any shape |
| 9 | `09-blit.py` | `blit()` for stamping a sprite, with transparency |
| 10 | `10-happy-face.py` | The first complete expression: eyes + eyebrows + mouth |
| 11 | `11-eye-scanner.py` | Animating a pupil sweep |
| 12 | `12-wink.py` | A closed-eye arc on just one eye |
| 13 | `13-blink.py` | Reading button A (pin 14) with debounce |
| 14 | `14-eyebrows.py` | Curved eyebrows built from `poly()` |
| 15 | `15-no-blocking.py` | Pacing an animation with `ticks_ms()` instead of `sleep()` |
| 16 | `16-sleepy.py` | Closed eyes, drooping brows, a drifting `Zzz` |
| 17 | `17-buttons.py` | Reading both buttons (14 and 15) independently |
| 18 | `18-modes.py` | Button A/B cycle forward/back through a mode list |
| 19 | `19-emotion-modes.py` | A two-button menu over all seven Ekman emotions |
| 20 | `20-demo.py` | A self-running demo reel, no buttons needed |
| 21 | `21-sample-main-demo.py` | Self-advancing demo reel + button menu, meant to become `main.py` |
| 22 | `22-face-parameters.py` | Live-tuning one face parameter with two buttons |

**If `01-hello.py` doesn't show anything on the display:** don't start
rewiring yet — first run `00-blink-onboard-led.py` to find out whether the
problem is the Pico/USB connection or the display wiring. That lab uses
nothing but the LED built into the Pico itself, so it needs no breadboard,
no jumper wires, and no OLED.

- **The onboard LED blinks** — the Pico, the USB cable, and Thonny's
  connection are all fine, so the trouble is downstream: check the seven
  Dupont wires against the wiring table above, make sure `ssd1306.py` landed
  in `/lib` on the Pico (not the root), and confirm the OLED's power and
  ground pins are seated in the breadboard.
- **The onboard LED does nothing** — the problem is the Pico or how you're
  talking to it. Try a different USB cable (many cheap cables are
  charge-only and carry no data), a different USB port, and check that
  Thonny's interpreter is set to *MicroPython (Raspberry Pi Pico)* on the
  right serial port. If Thonny can't see the Pico at all, MicroPython may
  not be installed on it yet.

**Making a lab run automatically:** MicroPython looks for a file named
`main.py` in the root of the filesystem and runs it a few seconds after
power-up, with no computer attached. Copy `21-sample-main-demo.py` onto the
Pico, rename it to `main.py`, and the robot face becomes a standalone
device that starts as soon as it gets USB power.
