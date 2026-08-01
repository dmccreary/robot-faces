---
title: Facial Symmetry Mirror Demonstrator
description: Interactive p5.js MicroSim for facial symmetry mirror demonstrator.
image: /sims/facial-symmetry-mirror-demonstrator/facial-symmetry-mirror-demonstrator.png
og:image: /sims/facial-symmetry-mirror-demonstrator/facial-symmetry-mirror-demonstrator.png
twitter:image: /sims/facial-symmetry-mirror-demonstrator/facial-symmetry-mirror-demonstrator.png
social:
   cards: false
quality_score: 0
---

# Facial Symmetry Mirror Demonstrator

<iframe src="main.html" height="507px" width="100%" scrolling="no"></iframe>

[Run the Facial Symmetry Mirror Demonstrator MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

You control the left eye and nothing else. The right eye is placed by `mirror_x()`, the one-line reflection rule from this chapter, and the panel prints the arithmetic while you drag. The goal is to apply that rule yourself: predict where the right eye will land before you release the slider, then check your answer against the readout. A "Break symmetry" toggle hands you the right eye's own sliders, so you can see exactly how much extra work asymmetry costs.

## How to Use

1. Drag the **Left eye offset** slider from -40 to -5 to move the left eye toward or away from the centerline.
2. Before you release the slider, predict the right eye's x-value. Then read `mirror_x()` in the panel to check.
3. Drag the **Left eye size** slider from 4 to 16. The right eye's size mirrors it too.
4. Check **Break symmetry** to reveal two more sliders that control the right eye on its own.
5. Build a deliberately lopsided face, then uncheck the box to snap back to a mirrored one.
6. Click **Reset to Symmetric** at any time to return to the default face with the mirroring rule back on.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/facial-symmetry-mirror-demonstrator/main.html"
        height="507px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Chapter 5's coordinate grid, where x increases to the right across the display.
- Chapter 7's `ellipse()` method, used here to draw each eye and each pupil.
- Chapter 9's layout grid, which sets where the eye band sits on a 128 by 64 screen.
- Comfort with negative numbers, since an offset to the left of center is negative.

### Activities

1. **Exploration** (5 min): Set the left eye offset to -30. Predict the right eye's x-value on paper, then check the readout. Repeat for -12 and -40 until your predictions are right every time.
2. **Guided Practice** (5 min): Find the left eye offset that puts the two eye centers exactly 30 pixels apart. Explain in one sentence how the centerline value of 64 made that easy to work out.
3. **Assessment** (5 min): Turn on Break symmetry and build a face with one large eye and one small eye. Count how many numbers you had to choose with symmetry on, then with symmetry off.

### Assessment

- The student can predict the mirrored eye's x-value before the redraw, for at least three different offsets.
- The student can state the `mirror_x()` rule in words: reflect a point by placing it the same distance on the other side of the centerline.
- The student can explain why symmetry halves the number of values a face designer must choose.
- The student can name one expression from a later chapter that breaks symmetry on purpose.

## References

1. [Reflection (mathematics) - Wikipedia](https://en.wikipedia.org/wiki/Reflection_(mathematics)) - the general geometric idea behind reflecting a point across a line.
2. [Facial symmetry - Wikipedia](https://en.wikipedia.org/wiki/Facial_symmetry) - how left-right symmetry appears in real human faces.
3. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) - the `ellipse()` method used to draw each eye on the real display.
4. [p5.js `ellipse()` reference](https://p5js.org/reference/p5/ellipse/) - the drawing call this simulation uses for the same job.
