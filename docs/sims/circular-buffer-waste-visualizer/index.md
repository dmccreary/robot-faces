---
title: Circular Buffer Waste Visualizer
description: Interactive p5.js MicroSim for circular buffer waste visualizer.
image: /sims/circular-buffer-waste-visualizer/circular-buffer-waste-visualizer.png
og:image: /sims/circular-buffer-waste-visualizer/circular-buffer-waste-visualizer.png
twitter:image: /sims/circular-buffer-waste-visualizer/circular-buffer-waste-visualizer.png
social:
   cards: false
quality_score: 0
---

# Circular Buffer Waste Visualizer

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run the Circular Buffer Waste Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A round display still stores its pixels in a **square** frame buffer, which is
the block of memory holding one full screen. The 240 by 240 buffer feeding a
round screen keeps every corner pixel in memory even though the glass never
shows them. Point at any pixel here and the panel tells you its coordinate, its
byte offset in memory, and whether it is visible or wasted. Your goal is to
examine the square buffer against the circle inside it and tell the two groups
of pixels apart.

## How to Use

1. Move the pointer across the buffer. The panel updates with that pixel's
   (x, y) coordinate, its byte offset, and a VISIBLE or WASTED label.
2. Click any pixel to pin the reading so you can study it without holding the
   pointer still.
3. Uncheck **Show wasted pixels** to hide the coral corners, then check it
   again to bring them back.
4. Check **Show buffer byte grid** to add bolder lines every 16 pixels and see
   how the 2-bytes-per-pixel color format lays out in memory.
5. Compare the two running totals in the panel: they are counted once at load
   time, because the circle never moves.
6. Click **Reset** to clear the pinned pixel and restore the default toggles.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/circular-buffer-waste-visualizer/main.html"
        height="502px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Read a pixel position as an (x, y) coordinate pair with the origin at the
  upper-left corner.
- Know that a frame buffer stores pixels in a straight line of bytes, row by
  row.
- Know that a 16-bit color pixel takes two bytes of memory.
- Be able to compare a distance to a radius to test whether a point sits
  inside a circle.

### Activities

1. **Exploration** (5 min): Hover the four corners of the buffer, then the
   middle of each edge. Record which of those eight positions are wasted and
   describe the pattern you see.
2. **Guided Practice** (5 min): Find a pair of pixels with the same y value
   where one is visible and one is wasted. Write both coordinates and explain,
   using distance from the center, why they land in different groups.
3. **Assessment** (5 min): Turn on the byte grid and pin pixel (0, 1). Predict
   its byte offset before you read it, using the fact that each row holds 240
   pixels at 2 bytes each.

### Assessment

- The student states that about 21.5% of the square buffer is never displayed.
- The student explains that a pixel is visible when its distance from the
  center is no more than the 120-pixel radius.
- The student calculates the byte offset of a given pixel as
  `(y * 240 + x) * 2`.
- The student explains why the wasted corner pixels still consume RAM.

## References

1. [Framebuffer (Wikipedia)](https://en.wikipedia.org/wiki/Framebuffer) - how a
   screen of pixels is stored as a linear block of memory.
2. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the buffer class used on these displays, including the RGB565 format.
3. [Circle (Wikipedia)](https://en.wikipedia.org/wiki/Circle) - the radius and
   distance relationship behind the inside-or-outside test.
4. [Adafruit 1.28" round TFT display guide](https://learn.adafruit.com/adafruit-1-28-tft-round) -
   a real round 240 by 240 display and the driver that feeds it.
