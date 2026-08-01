---
title: Potentiometer ADC Mapping Visualizer
description: Interactive p5.js MicroSim for potentiometer adc mapping visualizer.
image: /sims/potentiometer-adc-mapping-visualizer/potentiometer-adc-mapping-visualizer.png
og:image: /sims/potentiometer-adc-mapping-visualizer/potentiometer-adc-mapping-visualizer.png
twitter:image: /sims/potentiometer-adc-mapping-visualizer/potentiometer-adc-mapping-visualizer.png
social:
   cards: false
quality_score: 0
---

# Potentiometer ADC Mapping Visualizer

<iframe src="main.html" height="427px" width="100%" scrolling="no"></iframe>

[Run the Potentiometer ADC Mapping Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A **potentiometer** is a knob that turns a physical position into a voltage your board can read. The board's **ADC**, short for analog-to-digital converter, reports that voltage as a whole number from 0 to 65535. That number is far too large to use as an eyebrow angle, so this chapter's `map_range()` function rescales it into a range you choose.

Drag the knob and every step of that calculation updates at once: the raw reading, the formula with your real numbers substituted in, the mapped result, and a robot eyebrow tilted to match. Once you can predict the mapped value before you look at it, you can calculate one yourself on paper.

## How to Use

1. Drag the knob from its 7 o'clock stop around to its 5 o'clock stop. Watch the raw reading climb toward 65535.
2. Read Step 2. Every name in the formula has been replaced by the number it holds right now.
3. Compare Step 3 with the tilted eyebrow beside the knob and the face preview on the right.
4. Click **Snap to center** to put the knob at exactly 32768, which gives clean numbers to check by hand.
5. Type new values into **Output min** and **Output max** and watch the same raw reading map to a different result.
6. Click **Reset ranges** to return to -30 and 30.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/potentiometer-adc-mapping-visualizer/main.html"
        height="427px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knowing that a function takes arguments and returns a value, from Chapter 5
- Knowing that eyebrow angle is one of the face parameters you can change, from Chapter 9
- Reading an analog pin with `machine.ADC` and `read_u16()`, from earlier in Chapter 13
- Arithmetic with negative numbers, including subtracting a negative number

### Activities

1. **Exploration** (5 min): Click **Snap to center** and read the mapped output. Now drag the knob fully left, then fully right. Record the raw value and the mapped value at all three positions.
2. **Guided Practice** (5 min): Set **Output min** to 0 and **Output max** to 100. Predict the mapped value for a raw reading near 16384 before you drag there, then check yourself.
3. **Assessment** (5 min): Set **Output min** to 10 and **Output max** to 60. Calculate on paper the mapped value for a raw reading of 32768, then use **Snap to center** to confirm it.

### Assessment

- The student writes the `map_range()` formula from memory using the names shown in Step 2.
- The student calculates a mapped value for a given raw reading and output range without using the MicroSim.
- The student explains that a raw reading of 0 always maps to `out_min` and 65535 always maps to `out_max`.
- The student explains why the same raw reading produces a different mapped value when the output range changes.

## References

1. [Potentiometer - Wikipedia](https://en.wikipedia.org/wiki/Potentiometer) - How a turning knob becomes a changing voltage.
2. [Analog-to-digital converter - Wikipedia](https://en.wikipedia.org/wiki/Analog-to-digital_converter) - How a voltage becomes the whole number this MicroSim calls `raw_value`.
3. [MicroPython machine.ADC documentation](https://docs.micropython.org/en/latest/library/machine.ADC.html) - The `read_u16()` method that returns the 0 to 65535 reading.
4. [Linear interpolation - Wikipedia](https://en.wikipedia.org/wiki/Linear_interpolation) - The mathematics behind the `map_range()` formula.
