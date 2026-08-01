---
title: Face Parameter Slider Playground
description: Interactive p5.js MicroSim for face parameter slider playground.
image: /sims/face-parameter-slider-playground/face-parameter-slider-playground.png
og:image: /sims/face-parameter-slider-playground/face-parameter-slider-playground.png
twitter:image: /sims/face-parameter-slider-playground/face-parameter-slider-playground.png
social:
   cards: false
quality_score: 0
---

# Face Parameter Slider Playground

<iframe src="main.html" height="547px" width="100%" scrolling="no"></iframe>

[Run the Face Parameter Slider Playground MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

This playground puts you in the designer's chair. Four sliders set the eye size, eye spacing, eyebrow angle, and mouth curvature, and a simulated 128 by 64 OLED redraws the whole face the instant you move one. Beside the face, a live `face_state` dictionary shows the exact Python values `draw_face()` is reading right now. Your goal is to construct an original expression of your own design and watch one set of numbers become one complete face.

## How to Use

1. Drag the **Eye size** slider to make the eyes wider or narrower, from 4 to 16 pixels of radius.
2. Drag the **Eye spacing** slider to move both eyes closer together or farther apart around the centerline.
3. Drag the **Eyebrow angle** slider from -30 to 30 degrees. A positive angle raises each brow's outer end.
4. Drag the **Mouth curvature** slider from -10 to 10. Positive values curve the mouth up, negative values curve it down.
5. Click **Randomize** to set all four sliders at once and see an expression you did not plan.
6. Click **Reset to Default** to return every value to `default_face_state()`.
7. Watch the teal keys in the dictionary panel. Those are the four values your sliders change.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/face-parameter-slider-playground/main.html"
        height="547px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Chapter 7's `ellipse()` and `poly()` drawing methods, including the quadrant fill code that fills only part of a shape.
- Chapter 4's idea of a function parameter and a default parameter value.
- Chapter 9's face state dictionary, which bundles every facial parameter into one object.
- Chapter 9's `mirror_x()` rule, which places the right eye by reflecting the left one.

### Activities

1. **Exploration** (5 min): Start from the default face and change only the mouth curvature slider, from 6 down to -6. Write down the smallest curvature value at which the face still reads clearly as unhappy.
2. **Guided Practice** (5 min): Design a face that reads as surprised without touching the mouth curvature slider. Record the eye size and eyebrow angle values that got you there, then compare them with a partner's numbers.
3. **Assessment** (5 min): Click Randomize five times. For each result, name the one slider you would move first to make the expression read more clearly, and say which direction you would move it.

### Assessment

- The student can state which single parameter changes a smile into a frown, and name the sign change that does it.
- The student can produce a target expression, such as sleepy or curious, using only the four sliders.
- The student can read the `face_state` dictionary aloud and match each key to the slider that controls it.
- The student can explain why one `draw_face()` function plus a dictionary is easier to extend than a separate drawing for every emotion.

## References

1. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) - the official reference for `ellipse()`, `poly()`, and the quadrant fill argument this face uses.
2. [p5.js `arc()` reference](https://p5js.org/reference/p5/arc/) - how the half-ellipse mouth curve is drawn in this simulation.
3. [Facial expression - Wikipedia](https://en.wikipedia.org/wiki/Facial_expression) - background on how eyebrow, eye, and mouth position combine to signal emotion.
4. [Adafruit SSD1306 OLED guide](https://learn.adafruit.com/monochrome-oled-breakouts) - hardware details for the 128 by 64 monochrome display simulated here.
