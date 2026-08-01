---
title: Poly Point Array Builder
description: Interactive p5.js MicroSim for poly point array builder.
image: /sims/poly-point-array-builder/poly-point-array-builder.png
og:image: /sims/poly-point-array-builder/poly-point-array-builder.png
twitter:image: /sims/poly-point-array-builder/poly-point-array-builder.png
social:
   cards: false
quality_score: 0
---

# Poly Point Array Builder

<iframe src="main.html" height="452px" width="100%" scrolling="no"></iframe>

[Run the Poly Point Array Builder MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

This is your polygon workshop. Click anywhere on the simulated OLED screen to
place a vertex, and the builder connects your points in the order you placed
them, closes the path with a gold dashed line, and writes the matching
MicroPython on the right. The point array and the `fb.poly()` call update on
every click, so you can construct a shape by hand and design the exact code
needed to reproduce it on real hardware. Any eyebrow, mouth, or nose you invent
here is a shape you can type straight into your robot's face.

## How to Use

1. Move the mouse over the screen. The coordinate readout shows the pixel you
   are about to click.
2. Click to place a vertex. Vertex 0 is coral, and every later vertex is blue
   and numbered in click order.
3. Watch the **Point array** box grow by two numbers, an x and a y, with every
   click.
4. Notice the gold dashed line from your newest vertex back to vertex 0. That is
   the closing edge `fb.poly()` draws for you.
5. Check the **Filled** box to switch between an outline and a solid shape. The
   last argument of the draw call flips between `False` and `True`.
6. Click **Undo Last Point** to remove your most recent vertex, or **Clear** to
   start a new design. You can place up to 10 vertices.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/poly-point-array-builder/main.html"
        height="452px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
15-20 minutes

### Prerequisites

- Know that a polygon is a closed shape made of straight edges joined at
  vertices.
- Be able to read x and y screen coordinates, with x = 0, y = 0 at the top left.
- Understand that a point array holds coordinate pairs in a flat, ordered list.
- Know the difference between a convex and a concave polygon.

### Activities

1. **Exploration** (5 min): Place three vertices to build a triangle, then read
   the six numbers in the point array out loud and match each one to a dot on
   the screen.
2. **Guided Practice** (5 min): Design an angry eyebrow, a raised eyebrow, and a
   mouth. Copy each generated `array` line into your notes with a label.
3. **Assessment** (5-10 min): Construct a concave shape of at least six vertices,
   toggle **Filled** on, and explain what changed in the code and on the screen.

### Assessment

- The student explains that the point array stores x and y alternating in click
  order.
- The student predicts how the array changes before placing the next vertex.
- The student states what the fifth argument of `fb.poly()` controls.
- The student produces a working point array for an original face feature.

## References

1. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the reference for `poly(x, y, coords, c, f)` and its point-array argument.
2. [Python `array` module](https://docs.python.org/3/library/array.html) - what
   a typecode such as `'h'` means and how much space each value takes.
3. [Polygon (Wikipedia)](https://en.wikipedia.org/wiki/Polygon) - vertices,
   edges, and closed paths.
4. [Adafruit MicroPython SSD1306 guide](https://learn.adafruit.com/micropython-hardware-ssd1306-oled-display) -
   the 128x64 monochrome display this builder simulates.
