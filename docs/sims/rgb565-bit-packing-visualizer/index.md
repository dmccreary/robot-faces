---
title: RGB565 Bit-Packing Visualizer
description: Interactive p5.js MicroSim for rgb565 bit-packing visualizer.
image: /sims/rgb565-bit-packing-visualizer/rgb565-bit-packing-visualizer.png
og:image: /sims/rgb565-bit-packing-visualizer/rgb565-bit-packing-visualizer.png
twitter:image: /sims/rgb565-bit-packing-visualizer/rgb565-bit-packing-visualizer.png
social:
   cards: false
quality_score: 0
---

# RGB565 Bit-Packing Visualizer

<iframe src="main.html" height="582px" width="100%" scrolling="no"></iframe>

[Run the RGB565 Bit-Packing Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

This is the chapter's `color565()` function turned into a live calculator. You
set red, green, and blue on three ordinary 0-255 sliders, and the sim applies
the exact same bit shifting the MicroPython code does, one visible stage at a
time. Your goal is to calculate a packed RGB565 value yourself and watch every
step of the arithmetic recalculate as you move a slider.

It opens on the chapter's worked example, orange at `color565(255, 165, 0)`, so
you can check the sim against the walkthrough in the text before exploring new
colors. Notice the two swatches in Stage 1: the left one is the true color you
mixed, and the right one is what a real RGB565 display can actually produce
after the low bits are thrown away.

## How to Use

1. Drag the **Red**, **Green**, and **Blue** sliders to set each channel from 0
   to 255. Every stage below recalculates immediately.
2. Read **Stage 2** to see each channel shift right - 3 places for red and blue,
   only 2 for green, because green keeps an extra bit.
3. Watch **Stage 3** place those shrunken values into the 16-bit word: five red
   boxes, six green boxes, and five blue boxes, numbered 15 down to 0.
4. Read **Stage 4** for the finished packed value in binary, hexadecimal, and
   decimal - the single number a display driver receives.
5. Use the **Try a Named Color** dropdown to jump to a preset, or click **Reset
   to Black** to send all three channels to 0.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/rgb565-bit-packing-visualizer/main.html"
        height="582px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Chapter 4's bitwise operators, especially the right shift `>>`, the left
  shift `<<`, and the OR operator `|`.
- Chapter 5's idea of bit depth: how many bits are spent storing one pixel.
- Red, green, and blue channels as the three intensities a display mixes.
- Binary and hexadecimal as two ways to write the same whole number.

### Activities

1. **Exploration** (5 min): Leave the sliders on the opening orange and check
   every stage against the chapter's walkthrough. Confirm that red shrinks to
   `11111`, green to `101001`, and blue to `00000`.
2. **Guided Practice** (5 min): Set green to 165, then nudge it up one step at
   a time. Count how many single-step slider moves it takes before the 6-bit
   green value changes, and do the same for red. Explain why red changes less
   often than green.
3. **Assessment** (5 min): Predict the packed hex value for pure red
   (255, 0, 0) on paper before touching the sliders, then check your answer
   with the dropdown. Repeat for white.

### Assessment

- The student can state how many bits each channel receives and why green gets
  the extra one.
- The student can perform the right shift for one channel by hand and match the
  sim's Stage 2 result.
- The student can explain why the two Stage 1 swatches sometimes differ, in
  terms of discarded low bits.
- The student can convert the 16-bit binary strip into the same hex value the
  sim reports in Stage 4.

## References

1. [High color - Wikipedia](https://en.wikipedia.org/wiki/High_color#16-bit_high_color) -
   Describes the 5-6-5 bit split and why green receives the extra bit.
2. [Bitwise operation - Wikipedia](https://en.wikipedia.org/wiki/Bitwise_operation) -
   Reference for the shift and OR operators this packing depends on.
3. [Adafruit GFX graphics library: color](https://learn.adafruit.com/adafruit-gfx-graphics-library/coordinate-system-and-units) -
   Shows the same 16-bit color packing used by real display drivers.
4. [Python bitwise operators - Python documentation](https://docs.python.org/3/reference/expressions.html#binary-bitwise-operations) -
   The language reference behind MicroPython's `>>`, `<<`, and `|`.
