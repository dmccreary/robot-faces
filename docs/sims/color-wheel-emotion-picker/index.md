---
title: Color Wheel Emotion Picker
description: Interactive p5.js MicroSim for color wheel emotion picker.
image: /sims/color-wheel-emotion-picker/color-wheel-emotion-picker.png
og:image: /sims/color-wheel-emotion-picker/color-wheel-emotion-picker.png
twitter:image: /sims/color-wheel-emotion-picker/color-wheel-emotion-picker.png
social:
   cards: false
quality_score: 0
---

# Color Wheel Emotion Picker

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Color Wheel Emotion Picker MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Color gives a robot face a second channel for feeling, on top of the shapes you
already know how to draw. This picker lets you interpret a color by its three
independent properties - hue, saturation, and brightness - and then classify it
as warm or cool while reading the emotion most often associated with that hue.

The wheel uses the same angle convention as the chapter's `color_wheel(angle)`
function: 0 degrees is red, 120 degrees is green, and 240 degrees is blue. Every
selection also prints its packed RGB565 value, so you can see the exact number
the display driver would receive.

## How to Use

1. **Drag inside the wheel** to set hue and saturation at the same time. Moving
   around the ring changes the hue, and moving outward from the center makes the
   color more intense.
2. **Drag the vertical bar** beside the wheel to change brightness only. Watch
   the hue and saturation readouts stay put while the swatch darkens.
3. Read the **Warm** or **Cool** badge, then the closest named hue and its
   common emotion associations, in the panel on the right.
4. Pick an emotion from the **Try a Preset Emotion** dropdown to watch the
   selector glide to a representative color for anger, calm, happiness,
   sadness, or excitement.
5. Click **Reset** to return to the unselected neutral gray at the wheel's
   center with brightness back at 75 percent.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/color-wheel-emotion-picker/main.html"
        height="562px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Hue, saturation, and brightness as three independent properties of one color,
  introduced earlier in this chapter.
- The warm-versus-cool grouping and why it is a design convention rather than a
  physical property of light.
- The RGB565 color model and the `color565()` function that packs three 0-255
  channel values into one 16-bit number.
- Chapter 11's readability thinking, which this chapter extends from shape to
  color.

### Activities

1. **Exploration** (5 min): Drag the selector slowly around the rim and record
   the angle where the badge flips from Warm to Cool, and where it flips back.
   Compare those two angles against the chapter's warm-versus-cool table.
2. **Guided Practice** (5 min): Choose the Anger preset and write down its
   RGB565 hex value. Now drag the brightness bar to about 30 percent without
   touching the wheel. Note which readouts changed and which stayed the same,
   and explain why brightness is a separate dial.
3. **Assessment** (5 min): Pick a color you would use for a robot's calm idle
   face and a second color for a low-battery alert. Write down both RGB565 hex
   values and one sentence defending each choice using warm/cool and contrast.

### Assessment

- The student can name the hue, saturation, and brightness of a chosen color and
  explain what each number controls.
- The student can classify a hue as warm or cool and justify the call using the
  chapter's convention.
- The student can explain why a low-saturation color reads as neutral gray
  rather than warm or cool.
- The student can name one emotion association for red, blue, and yellow, and
  explain the difference between reinforcing and clashing with an expression's
  shape.

## References

1. [Color wheel - Wikipedia](https://en.wikipedia.org/wiki/Color_wheel) -
   The circular hue arrangement this MicroSim renders.
2. [HSL and HSV - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV) -
   How hue, saturation, and brightness relate to red, green, and blue values.
3. [Color psychology - Wikipedia](https://en.wikipedia.org/wiki/Color_psychology) -
   Background and cautions on the emotion associations shown in the panel.
4. [High color (RGB565) - Wikipedia](https://en.wikipedia.org/wiki/High_color) -
   The 16-bit color format behind the packed hex value under each swatch.
