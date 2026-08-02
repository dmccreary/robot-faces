---
title: Pixel Drawing Sandbox
description: Interactive p5.js MicroSim for pixel drawing sandbox.
image: /sims/pixel-drawing-sandbox/pixel-drawing-sandbox.png
og:image: /sims/pixel-drawing-sandbox/pixel-drawing-sandbox.png
twitter:image: /sims/pixel-drawing-sandbox/pixel-drawing-sandbox.png
social:
   cards: false
quality_score: 0
---

# Pixel Drawing Sandbox

<iframe src="main.html" height="452px" width="100%" scrolling="no"></iframe>

[Run the Pixel Drawing Sandbox MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

This is a simulated 128 by 64 monochrome OLED that you can draw on with your
mouse. Pick a tool, make a mark, and the sandbox writes the exact MicroPython
line that would produce it, such as `fb.pixel(64, 32, WHITE)` or
`fb.hline(10, 20, 45, WHITE)`. The goal is to demonstrate what each drawing
primitive really does, and to execute the right tool choice for a dot, a
horizontal run, or a vertical run. Every gesture you make connects directly to
one line of code you will type on real hardware.

## How to Use

1. Choose a tool from the **Tool** dropdown: **Pixel**, **Horizontal Line**, or
   **Vertical Line**.
2. With **Pixel** selected, click one square to turn that pixel on. Click it
   again to turn it back off.
3. With **Horizontal Line** selected, press the mouse down and drag left or
   right. The coral preview shows the run you are about to draw.
4. With **Vertical Line** selected, press and drag up or down instead.
5. Watch the **Last method call** box after every mark, and use the coordinate
   readout under the screen to aim precisely.
6. Read the **Recent calls** list to see your calls in order, newest first. The
   list holds far more calls than it can show at once, so scroll it with your
   mouse wheel or drag the scrollbar on its right edge to reach older ones.
7. Click **Clear** to wipe the screen, which logs `fb.fill(BLACK)`.
8. Click **Copy Code** to copy every call you have made, in the order you drew
   them, to your clipboard as a runnable MicroPython block. Paste it into your
   editor or your notes.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/pixel-drawing-sandbox/main.html"
        height="452px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Know that a frame buffer stores one value per pixel before it reaches the
  screen.
- Understand that a monochrome OLED pixel has only two states, on and off.
- Be able to read x and y screen coordinates, with x = 0, y = 0 at the top left.
- Know that a method call such as `fb.pixel(x, y, color)` takes its arguments in
  a fixed order.

### Activities

1. **Exploration** (5 min): Use the **Pixel** tool to turn on five separate
   pixels. Write down the five calls the sandbox generated, then predict the
   coordinates of a sixth pixel before you click it.
2. **Guided Practice** (5 min): Draw a rectangle outline using only horizontal
   and vertical lines. Count how many calls it took, and compare that to the one
   `fb.rect()` call that would do the same job.
3. **Assessment** (5 min): Draw a simple robot mouth using at most three calls,
   then use **Copy Code** to paste the generated lines into your notes as
   working MicroPython.

### Assessment

- The student picks the correct tool for a dot, a horizontal mark, and a
  vertical mark without hesitating.
- The student explains what each argument in `fb.hline(x, y, width, color)`
  controls.
- The student predicts the coordinates a click will generate before clicking.
- The student states what `fb.fill(BLACK)` does to the whole buffer.

## References

1. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the official reference for `pixel()`, `hline()`, `vline()`, and `fill()`.
2. [Adafruit MicroPython SSD1306 guide](https://learn.adafruit.com/micropython-hardware-ssd1306-oled-display) -
   wiring and driver setup for the display this sandbox simulates.
3. [Raster graphics (Wikipedia)](https://en.wikipedia.org/wiki/Raster_graphics) -
   background on how images are stored as a rectangular grid of pixels.
4. [Monochrome (Wikipedia)](https://en.wikipedia.org/wiki/Monochrome) - why a
   one-bit-per-pixel display has only two possible pixel values.
