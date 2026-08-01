---
title: Draw Order and Overdraw Stepper
description: Interactive p5.js MicroSim for draw order and overdraw stepper.
image: /sims/draw-order-overdraw-stepper/draw-order-overdraw-stepper.png
og:image: /sims/draw-order-overdraw-stepper/draw-order-overdraw-stepper.png
twitter:image: /sims/draw-order-overdraw-stepper/draw-order-overdraw-stepper.png
social:
   cards: false
quality_score: 0
---

# Draw Order and Overdraw Stepper

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run the Draw Order and Overdraw Stepper MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Here is something that surprises almost every new display programmer: the order
of your draw calls changes what ends up on the screen. This MicroSim applies
five `FrameBuf` calls one at a time and lets you examine which pixels survive
into the final image and which ones a later call quietly threw away. Pixels that
an earlier call set and a later call overwrote flash coral, and a running counter
adds them up. Flip the order so the background is drawn first instead of last,
and you can differentiate wasted work from work that actually reaches the OLED.

## How to Use

1. Leave the **Reorder** dropdown on **Original (background last)** for your
   first run. The buffer starts completely black.
2. Click **Step Forward** to apply the next call. The code listing highlights
   the line that just ran, and the buffer view shows the result.
3. Watch for coral flashes. Every coral pixel is a pixel an earlier call had
   already set that this call just overwrote.
4. Read the **Overdrawn pixels so far** counter and the note under the buffer
   after each step.
5. Click **Step Back** to undo one call, or **Reset** to return to an empty
   buffer at step 0.
6. Switch the dropdown to **Optimized (background first)** and step all the way
   through again. Compare the two final counters and the two final images.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/draw-order-overdraw-stepper/main.html"
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

- Know that a frame buffer is a block of memory holding one value per pixel.
- Understand that the OLED is monochrome, so each pixel is only on or off.
- Recognize the `fb.fill()`, `fb.rect()`, `fb.fill_rect()`, and `fb.hline()`
  calls from the drawing primitives lesson.
- Be able to read a numbered list of code lines from top to bottom.

### Activities

1. **Exploration** (5 min): Step all the way through the **Original** order.
   Write down the overdraw counter after each step, and describe what the buffer
   looks like after the last call.
2. **Guided Practice** (5 min): Reset, switch to **Optimized**, and predict the
   overdraw counter for each step before you click **Step Forward**. Use
   **Step Back** to recheck any step you got wrong.
3. **Assessment** (5 min): Explain in two sentences why the very same five calls
   produce a blank screen in one order and a robot face in the other.

### Assessment

- The student states that `fb.fill(0)` writes to all 8,192 pixels in the buffer.
- The student identifies the exact call that overwrote the face in the Original
  order.
- The student reports the final overdraw count for each order and explains the
  difference.
- The student states a general rule: clear the background before you draw
  anything you want to keep.

## References

1. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the official reference for `fill()`, `rect()`, `fill_rect()`, and `hline()`.
2. [Framebuffer (Wikipedia)](https://en.wikipedia.org/wiki/Framebuffer) -
   background on how a block of memory becomes an image on a screen.
3. [Overdraw in computer graphics (Wikipedia: Hidden-surface determination)](https://en.wikipedia.org/wiki/Hidden-surface_determination) -
   why graphics systems work hard to avoid drawing pixels that will be covered.
4. [Adafruit SSD1306 OLED guide](https://learn.adafruit.com/monochrome-oled-breakouts) -
   the 128x64 monochrome display this MicroSim simulates.
