---
name: micropython-oled-render
description: Renders MicroPython framebuf/ssd1306 drawing code (fill, pixel, hline, vline, line, rect, fill_rect, ellipse, poly, text, blit, scroll) to a PNG image of a 128x64 monochrome OLED screen, scaled 5x to a 640x320 PNG. Use when the user wants to preview, test, or generate a sample image for a MicroPython robot-face/OLED script without physical hardware, e.g. "render this MicroPython drawing code", "show me what this face script looks like on the OLED", "generate a PNG of this ellipse/eye/face expression", or when validating sample code for the robot-faces book's chapters/lessons.
---

# MicroPython OLED Render

Executes an unmodified MicroPython script written against `framebuf.FrameBuffer` /
`ssd1306.SSD1306_SPI` / `ssd1306.SSD1306_I2C` under CPython, and saves what would have
appeared on the physical 128x64 display as a PNG. Built for this repo's robot-face
lessons and chapters, but works for any 128x64 monochrome framebuf script.

## Quick usage

```bash
python3 scripts/render_oled.py path/to/script.py -o output.png
```

Options:
- `--frames N` — capture N successive `.show()` calls instead of just the first (default 1). Useful for scripts with a `while True:` animation loop (eye scan, blink).
- `--scale N` — integer upscale factor (default 5, so 128x64 -> 640x320).
- `--fg R,G,B` / `--bg R,G,B` — lit/unlit pixel colors (default white-on-black).
- `--gif` — with `--frames > 1`, also write an animated GIF alongside the numbered PNG sequence.

With `--frames 1` (the default) one PNG is written to the `-o` path. With more frames,
numbered files `{stem}_frame001.png`, `{stem}_frame002.png`, ... are written next to it.

## How it works

`scripts/oled_sim.py` fakes `machine`, `utime`, `micropython`, `urandom`, `framebuf`, and
`ssd1306` in `sys.modules` and implements the framebuf drawing primitives on top of Pillow's
`ImageDraw`. `scripts/render_oled.py` runs the target script with `runpy.run_path`, and the
faked `.show()` method captures the current buffer as a frame. Since these scripts almost
always draw inside `while True:`, capture raises a `StopRender` exception once the requested
frame count is reached — this is what unwinds out of the infinite loop, rather than a
wall-clock timeout.

Some sample scripts in this repo reference `machine.Pin(...)` directly even though they only
wrote `from machine import Pin` (no `import machine`). The runner pre-binds `machine`,
`utime`, `framebuf`, and `ssd1306` as globals so those scripts still run unmodified.

## Input: bare drawing commands (no hardware boilerplate)

If the user supplies only drawing calls rather than a full script (e.g. a snippet meant for
a lesson), wrap it in this minimal template before rendering — fill in the marked section,
keep everything else as-is so the fake modules resolve correctly:

```python
from machine import Pin
from utime import sleep
import framebuf
import ssd1306

WIDTH = 128
HEIGHT = 64
spi = machine.SPI(0, sck=machine.Pin(2), mosi=machine.Pin(3))
oled = ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, machine.Pin(5), machine.Pin(4), machine.Pin(6))

# --- paste the user's drawing commands here, referencing `oled` ---
oled.fill(0)
oled.ellipse(64, 32, 30, 20, 1)
# --- end pasted commands ---

oled.show()
```

If the snippet already ends with `oled.show()`, don't add a second one.

## Supported framebuf API

`fill(c)`, `pixel(x,y[,c])`, `hline(x,y,w,c)`, `vline(x,y,h,c)`, `line(x1,y1,x2,y2,c)`,
`rect(x,y,w,h,c[,f])`, `fill_rect(x,y,w,h,c)`, `ellipse(x,y,xr,yr,c[,f[,m]])` (including the
quadrant-mask `m` bitmask), `poly(x,y,coords,c[,f])`, `text(s,x,y[,c])`, `scroll(dx,dy)`,
`blit(fbuf,x,y[,key])`. `FrameBuffer(buffer, w, h, format)` decodes pre-populated
`MONO_HLSB`/`MONO_HMSB`/`MONO_VLSB` bitmaps (needed for scripts that bake a sprite into a
`bytearray` and `.blit()` it, e.g. `blit-eyes.py`) — `RGB565`/`GS4_HMSB` source buffers are
out of scope and render blank. `SSD1306_SPI`/`SSD1306_I2C` constructors accept and ignore any
pin/bus arguments; `contrast`/`invert`/`rotate`/`poweron`/`poweroff` are no-ops.

## Known limitations

- `text()` uses Pillow's default font as an approximation, not MicroPython's pixel-exact 8x8 font.
- The script must be valid **Python 3** syntax. A few legacy MicroPython files use
  leading-zero integer literals (e.g. `05`), which CPython rejects — strip the leading zero
  before rendering if you hit `SyntaxError: leading zeros in decimal integer literals`.
- Only 1-bit 128x64-style displays are simulated (this repo's `ssd1306` driver). Color
  displays (e.g. `gc9a01`) aren't stubbed.
