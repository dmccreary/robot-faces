---
title: Blit Transparency Key Visualizer
description: Interactive p5.js MicroSim for blit transparency key visualizer.
image: /sims/blit-transparency-key-visualizer/blit-transparency-key-visualizer.png
og:image: /sims/blit-transparency-key-visualizer/blit-transparency-key-visualizer.png
twitter:image: /sims/blit-transparency-key-visualizer/blit-transparency-key-visualizer.png
social:
   cards: false
quality_score: 0
---

# Blit Transparency Key Visualizer

<iframe src="main.html" height="472px" width="100%" scrolling="no"></iframe>

[Run the Blit Transparency Key Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A **blit** copies a rectangle of stored pixels straight into the frame buffer,
which is how a robot face stamps a ready-made eye or mouth onto the screen. The
catch is that the rectangle is always a rectangle, even when the picture inside
it is round. Here you drag a circular sprite over a striped background and flip
a **transparency key** on and off, so the same copy produces two very different
results. Your goal is to tell an opaque blit from a transparent one by
examining what happens to the background around the circle.

## How to Use

1. Drag the sprite anywhere over the striped buffer. The dashed red outline
   shows the 24 by 24 source rectangle the blit reads from.
2. Watch the live `fb.blit()` line in the panel: the x and y arguments change
   as you drag.
3. With **Transparent color key** unchecked, look at the black square that
   erases the stripes around the circle.
4. Check **Transparent color key** and watch the same square vanish. The call
   gains a fourth argument, `BLACK`, and every black source pixel is skipped.
5. Compare the legend swatches with the pixels on the screen to confirm which
   color is being treated as the key.
6. Click **Reset** to send the sprite back to the upper-left corner and turn
   the key off.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/blit-transparency-key-visualizer/main.html"
        height="472px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Know that a frame buffer holds one screen of pixels in memory.
- Read an (x, y) coordinate pair with the origin at the upper-left corner.
- Know that drawing commands write over whatever pixels were already there.
- Have used a `framebuf` drawing call such as `fill_rect()` or `ellipse()`.

### Activities

1. **Exploration** (5 min): With the key off, drag the sprite over a teal
   stripe and then over a white stripe. Describe exactly which background
   pixels survive in each case.
2. **Guided Practice** (5 min): Park the sprite on a stripe boundary, then
   toggle the key on and off five times. List every difference you can see
   between the two results.
3. **Assessment** (5 min): Explain why the dashed outline stays the same size
   in both modes, and predict what would happen if the sprite's circle were
   black and its corners white.

### Assessment

- The student states that a blit always copies a rectangle, never a circle.
- The student explains that the fourth argument names the color to skip.
- The student predicts that swapping the sprite's colors would make the key
  erase the circle instead of the corners.
- The student gives one situation in a robot face where an opaque blit is
  actually the better choice.

## References

1. [MicroPython `framebuf.blit()`](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the official signature `blit(fbuf, x, y, key, palette)` and what the key
   argument does.
2. [Bit blit (Wikipedia)](https://en.wikipedia.org/wiki/Bit_blit) - the origin
   of the block-transfer operation and its use in graphics hardware.
3. [Sprite (computer graphics) (Wikipedia)](https://en.wikipedia.org/wiki/Sprite_(computer_graphics)) -
   how small stored images are composited over a background.
4. [Transparency (graphic) (Wikipedia)](https://en.wikipedia.org/wiki/Transparency_(graphic)) -
   color-key transparency compared with the alpha channel approach.
