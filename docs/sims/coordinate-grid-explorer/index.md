---
title: Coordinate Grid Explorer
description: Interactive p5.js MicroSim for coordinate grid explorer.
image: /sims/coordinate-grid-explorer/coordinate-grid-explorer.png
og:image: /sims/coordinate-grid-explorer/coordinate-grid-explorer.png
twitter:image: /sims/coordinate-grid-explorer/coordinate-grid-explorer.png
social:
   cards: false
quality_score: 0
---

# Coordinate Grid Explorer

<iframe src="main.html" height="482px" width="100%" scrolling="no"></iframe>

[Run the Coordinate Grid Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Every drawing command you write for a robot face needs a position, and a
display describes position with an **(x, y) coordinate pair**. This MicroSim
scales one display up to a clickable grid so you can pick a spot and read back
its exact whole-number coordinate. Toggling the axes on shows the origin in the
upper-left corner and the two directions the numbers grow. Your goal is to show
the link between a place on the screen and its coordinate pair, and to identify
the origin, the X direction, and the Y direction on sight.

## How to Use

1. Click anywhere on the grid. A coral crosshair lands on that pixel and the
   panel reports "You clicked: (x, y)".
2. Predict a coordinate first, then click and check whether the readout matches
   your prediction.
3. Switch the **Display** dropdown between **128x64 OLED** and **240x240 Color
   Round** to redraw the grid at that display's real pixel count.
4. Uncheck **Show origin & axes** to hide the teal origin dot and the two
   direction arrows, then check it again.
5. Check **Show valid quadrant** to tint the grid and see that a display only
   ever uses positive x and positive y values.
6. Click **Reset** to clear the marker and restore the default toggles.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/coordinate-grid-explorer/main.html"
        height="482px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Know that a display is a grid of pixels with a fixed width and height.
- Be able to read an ordered pair such as (64, 32) as an x value and a y value.
- Know that computers usually count positions starting at 0, not 1.
- Have seen the 128x64 OLED and the 240x240 round display in earlier chapters.

### Activities

1. **Exploration** (5 min): Click each of the four corners of the 128x64 grid
   and write down all four coordinate pairs. Explain why the largest values are
   127 and 63 rather than 128 and 64.
2. **Guided Practice** (5 min): Turn the axes on and find the exact center of
   the OLED grid by prediction alone, then click to check. Repeat after
   switching to the 240x240 display.
3. **Assessment** (5 min): Turn on the quadrant shading and explain in two
   sentences how screen coordinates differ from the four-quadrant graph paper
   used in math class.

### Assessment

- The student identifies the origin (0, 0) as the upper-left pixel.
- The student states that x grows to the right and y grows downward.
- The student gives the corner coordinates of a 128x64 display as (0, 0),
  (127, 0), (0, 63), and (127, 63).
- The student explains why negative coordinates never appear on a display.

## References

1. [Cartesian coordinate system (Wikipedia)](https://en.wikipedia.org/wiki/Cartesian_coordinate_system) -
   the coordinate idea a display borrows and then flips vertically.
2. [Raster graphics (Wikipedia)](https://en.wikipedia.org/wiki/Raster_graphics) -
   how an image is stored as a rectangular grid of addressable pixels.
3. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the drawing calls that take these x and y values as arguments.
4. [Adafruit monochrome OLED guide](https://learn.adafruit.com/monochrome-oled-breakouts) -
   the 128x64 SSD1306 display and its pixel addressing.
