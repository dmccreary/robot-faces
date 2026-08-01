---
title: Face Layout Grid Visualizer
description: Interactive p5.js MicroSim for face layout grid visualizer.
image: /sims/face-layout-grid-visualizer/face-layout-grid-visualizer.png
og:image: /sims/face-layout-grid-visualizer/face-layout-grid-visualizer.png
twitter:image: /sims/face-layout-grid-visualizer/face-layout-grid-visualizer.png
social:
   cards: false
quality_score: 0
---

# Face Layout Grid Visualizer

<iframe src="main.html" height="492px" width="100%" scrolling="no"></iframe>

[Run the Face Layout Grid Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A face layout grid splits a display's height into horizontal bands before you write a single line of drawing code. This MicroSim shows those five bands on a simulated screen, with a simple neutral face drawn so every feature sits inside its own band. Your goal is to interpret how the grid divides the height and explain why a robot face adapts real face proportions instead of copying them exactly. Switching between the 128 by 64 OLED and the 240 by 240 round display keeps every percentage identical, which shows that a layout grid plans proportions rather than pixel counts.

## How to Use

1. Hover over any band on the display to highlight it and read its name, its percentage, and its purpose in the infobox.
2. Hover over a row in the **Bands, top to bottom** list to highlight the same band. The two twelve-percent margins are easier to reach this way.
3. Read the percentage labels in the column to the right of the display to see each band's share of the total height.
4. Change **Display shape** between **128 x 64 OLED** and **240 x 240 Round** and watch every percentage stay the same.
5. Check **Show real-face reference lines** to add the classic portrait guideline that puts the eyes at the vertical middle.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/face-layout-grid-visualizer/main.html"
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

- Reading a display's x and y coordinates, where y increases downward, from Chapter 5
- Knowing that a 128 by 64 OLED is much wider than it is tall, from Chapter 1
- Drawing eyes and a mouth with `fb.ellipse()` and `fb.rect()`, from Chapters 6 and 7
- Converting a percentage of a total into a pixel count

### Activities

1. **Exploration** (5 min): Hover each band from top to bottom and write down its name and percentage. Add the five percentages together and confirm they total 100.
2. **Guided Practice** (5 min): Multiply each percentage by 64 to get the band's height in pixels on a 128 by 64 OLED. Then switch to **240 x 240 Round** and recalculate using 240. Explain what changed and what did not.
3. **Assessment** (5 min): Check **Show real-face reference lines**. Describe where the red line sits, where this robot's eyes sit, and write two sentences explaining why a robot face lifts its eyes above the middle.

### Assessment

- The student reports all five band percentages correctly and confirms that they sum to 100.
- The student converts a percentage into pixels for both display shapes and states that only the pixel counts change.
- The student explains that the eye band gets the largest share because eyes carry most of the expression.
- The student explains that a robot face raises its eyes above the real-face midpoint so the mouth band still has room on a short display.

## References

1. [Facial Proportions in Portrait Drawing - Wikipedia](https://en.wikipedia.org/wiki/Portrait_painting) - Background on the classic conventions a robot face adapts.
2. [MicroPython framebuf Module Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) - The drawing methods used to place each feature inside its band.
3. [OLED display - Wikipedia](https://en.wikipedia.org/wiki/OLED) - How the 128 by 64 monochrome display in this course works.
4. [p5.js Reference](https://p5js.org/reference/) - The JavaScript library used to render this simulation.
