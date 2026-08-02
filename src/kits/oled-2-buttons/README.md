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

## Labs

Copy `config.py` plus whichever lab file you're working on onto the Pico's
filesystem and run it in Thonny. The labs are numbered so you can work
through them in order, each one building on ideas from the last:

| Lab | File | What it teaches |
|--|--|--|
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
| 21 | `21-sample-main-demo.py` | Idle animation + button menu, meant to become `main.py` |
| 22 | `22-face-parameters.py` | Live-tuning one face parameter with two buttons |

**Making a lab run automatically:** MicroPython looks for a file named
`main.py` in the root of the filesystem and runs it a few seconds after
power-up, with no computer attached. Copy `21-sample-main-demo.py` onto the
Pico, rename it to `main.py`, and the robot face becomes a standalone
device that starts as soon as it gets USB power.
