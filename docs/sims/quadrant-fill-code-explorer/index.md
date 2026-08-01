---
title: Quadrant Fill Code Explorer
description: Interactive p5.js MicroSim for quadrant fill code explorer.
image: /sims/quadrant-fill-code-explorer/quadrant-fill-code-explorer.png
og:image: /sims/quadrant-fill-code-explorer/quadrant-fill-code-explorer.png
twitter:image: /sims/quadrant-fill-code-explorer/quadrant-fill-code-explorer.png
social:
   cards: false
quality_score: 0
---

# Quadrant Fill Code Explorer

<iframe src="main.html" height="587px" width="100%" scrolling="no"></iframe>

[Run the Quadrant Fill Code Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

The quadrant fill code is the seventh argument of `fb.ellipse()`, and it decides which quarters of an ellipse actually get drawn. This MicroSim lets you switch each quadrant on or off and watch a simulated 128 by 64 display redraw instantly. Your goal is to apply the bitmask yourself: combine the values 1, 2, 4, and 8 and demonstrate which portion of the ellipse each combination produces. The readout panel always shows the mask in binary and in decimal, next to the exact MicroPython call that would produce the shape on your own board.

## How to Use

1. Click any of the four toggle buttons — **Upper Left (2)**, **Upper Right (1)**, **Lower Left (4)**, **Lower Right (8)** — to turn that quadrant on or off. The buttons sit in the same 2x2 arrangement as the quadrants themselves.
2. Click directly on a quarter of the simulated display to toggle that same quadrant.
3. Drag the **xradius** and **yradius** sliders (5 to 40) to change the ellipse's width and height without changing the mask.
4. Uncheck **Filled** to draw the outline only, matching `fill=False` in MicroPython.
5. Click **Reset to Full Ellipse** to turn all four quadrants back on and return the mask to 15.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/quadrant-fill-code-explorer/main.html"
        height="587px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Reading a display's x and y coordinates, where (0, 0) sits in the top-left corner, from Chapter 5
- Drawing basic shapes into a frame buffer with methods such as `rect()` and `line()`, from Chapter 6
- Knowing that `fb.ellipse()` takes a center point, an x radius, and a y radius, from earlier in Chapter 7
- Adding whole numbers together to build a single combined value

### Activities

1. **Exploration** (5 min): Start with all four quadrants on and confirm the mask reads `0b1111` and 15. Turn quadrants off one at a time and record which bit disappears from the binary readout each time.
2. **Guided Practice** (5 min): Predict the mask for the left half of the ellipse before you touch anything. Then turn on only **Upper Left (2)** and **Lower Left (4)** and check whether the readout matches your prediction of 6. Repeat for the bottom half and the right half.
3. **Assessment** (5 min): Set the mask to 12, then explain in one sentence which quadrants that value selects and why. Next, uncheck **Filled** and drag **yradius** to 30. Describe what changed in the picture and what stayed the same in the mask.

### Assessment

- The student produces mask 6 for the left half and states that 2 plus 4 equals 6.
- The student explains that mask 12 selects lower left (4) and lower right (8), which is the bottom half of the ellipse.
- The student states that changing either radius slider changes the ellipse's size but never changes the mask value.
- The student identifies 15 as the default mask and explains that leaving the argument off draws the whole ellipse.

## References

1. [MicroPython framebuf Module Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) - The official reference for `ellipse()`, including the optional quadrant mask argument.
2. [Mask (computing) - Wikipedia](https://en.wikipedia.org/wiki/Mask_(computing)) - Background on bitmasks, the general technique behind the quadrant fill code.
3. [Ellipse - Wikipedia](https://en.wikipedia.org/wiki/Ellipse) - The geometry of the shape, including the x radius and y radius used by `fb.ellipse()`.
4. [p5.js Reference](https://p5js.org/reference/) - The JavaScript library used to render this simulation.
