---
title: Frame Buffer Size Calculator
description: Interactive p5.js MicroSim for frame buffer size calculator.
image: /sims/buffer-size-calculator/buffer-size-calculator.png
og:image: /sims/buffer-size-calculator/buffer-size-calculator.png
twitter:image: /sims/buffer-size-calculator/buffer-size-calculator.png
social:
   cards: false
quality_score: 0
---

# Frame Buffer Size Calculator

<iframe src="main.html" height="492px" width="100%" scrolling="no"></iframe>

[Run the Frame Buffer Size Calculator MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A **frame buffer** is the block of memory that holds one whole screen of pixels
before it is sent to the display. This MicroSim lets you calculate how many
bytes that block needs, using the rule `bytes = width x height x bit depth / 8`.
Change the width, the height, or the bits per pixel, and watch the answer and
the memory bar respond immediately. The goal is for you to calculate a buffer
size yourself and show what happens to memory when each parameter changes on
its own.

## How to Use

1. Drag the **Width** slider from 8 to 240 pixels and watch only the width
   number change in the formula line.
2. Drag the **Height** slider the same way, and compare how the byte total
   responds.
3. Choose **1-bit monochrome** or **16-bit color (RGB565)** from the **Bit
   depth** dropdown to see the cost of color.
4. Click **128x64 mono OLED** or **240x240 color LCD** to walk the sliders to
   the real values of the two displays used in this book.
5. Read the bar at the bottom: it fills to show your buffer's share of the
   264 KB of RAM on an RP2040 microcontroller, turning coral above 40%.
6. Click **Reset** to return to 128 by 64 pixels at 1 bit per pixel.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/buffer-size-calculator/main.html"
        height="492px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Know that one byte holds eight bits.
- Understand that a display is a rectangular grid of pixels with a width and
  a height.
- Know that a monochrome pixel needs one bit, while a color pixel needs more.
- Be able to multiply and divide whole numbers with a calculator.

### Activities

1. **Exploration** (5 min): Leave bit depth at 1-bit and double the width from
   64 to 128. Predict the new byte total before you release the slider, then
   check your prediction against the formula line.
2. **Guided Practice** (5 min): Set the sliders to 240 by 240, then switch the
   bit depth from 1-bit to 16-bit. Record both byte totals and explain in one
   sentence why the second is sixteen times the first.
3. **Assessment** (5 min): Click each preset in turn and write down both real
   buffer sizes. Then answer: how many 128x64 monochrome buffers would fit in
   the RAM that one 240x240 color buffer uses?

### Assessment

- The student calculates the 128x64 monochrome buffer as 1,024 bytes without
  using the MicroSim.
- The student states that doubling either width or height doubles the byte
  total.
- The student explains that 16-bit color needs sixteen times the memory of
  1-bit monochrome for the same pixel count.
- The student explains why a 240x240 color buffer is a serious problem on a
  microcontroller with only 264 KB of RAM.

## References

1. [Framebuffer (Wikipedia)](https://en.wikipedia.org/wiki/Framebuffer) - what a
   frame buffer is and how bit depth sets its size.
2. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the module that allocates and draws into these buffers, including the
   MONO_HLSB and RGB565 formats.
3. [RP2040 product page (Raspberry Pi)](https://www.raspberrypi.com/products/rp2040/) -
   the official specification listing the 264 KB of on-chip SRAM.
4. [Color depth (Wikipedia)](https://en.wikipedia.org/wiki/Color_depth) -
   background on bits per pixel and the RGB565 packing used by color displays.
