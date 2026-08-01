---
title: Encoder Quadrature Signal Visualizer
description: Interactive p5.js MicroSim for encoder quadrature signal visualizer.
image: /sims/encoder-quadrature-signal-visualizer/encoder-quadrature-signal-visualizer.png
og:image: /sims/encoder-quadrature-signal-visualizer/encoder-quadrature-signal-visualizer.png
twitter:image: /sims/encoder-quadrature-signal-visualizer/encoder-quadrature-signal-visualizer.png
social:
   cards: false
quality_score: 0
---

# Encoder Quadrature Signal Visualizer

<iframe src="main.html" height="402px" width="100%" scrolling="no"></iframe>

[Run the Encoder Quadrature Signal Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A **rotary encoder** is a knob with two output pins instead of one. Those pins, called A and B, each produce a square wave as you turn, and the two waves are deliberately out of step with each other by a quarter of a cycle. Engineers call that arrangement **quadrature**, and it is the trick that lets a single knob report not just how far it turned but which way.

Turn the knob clockwise and Signal A always changes first. Turn it counter-clockwise and Signal B always changes first. This MicroSim advances one step at a time and pauses between the two edges of each step, so you can freeze on a single step, examine which signal led, and connect it directly to the `encoder_position += 1` line in your code.

## How to Use

1. Click **Step CW** once. Watch Signal A move, then Signal B a moment later. The "1st" marker names the signal that led.
2. Click **Step CCW** once and compare. The same two signals move, but now B leads.
3. Read the position counter under the knob. It goes up by one for each clockwise step and down by one for each counter-clockwise step.
4. Check the highlighted row in the rule box. It always matches the direction badge above the waves.
5. Turn on **Slow motion** to stretch the pause between the two edges of a step.
6. Drag the knob in a circle to generate many steps in a row and watch the waveform pattern repeat.
7. Click **Reset position to 0** to clear the traces and start over.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/encoder-quadrature-signal-visualizer/main.html"
        height="402px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Reading a digital pin as HIGH or LOW, from Chapter 13
- Knowing that a potentiometer reports an absolute position while an encoder reports change, from Chapter 13
- Understanding that a variable can be increased with `+= 1` and decreased with `-= 1`, from Chapter 4
- Knowing that the expression menu selects the next or previous face, from earlier in Chapter 14

### Activities

1. **Exploration** (5 min): Turn on **Slow motion**. Take three clockwise steps, then three counter-clockwise steps. Write down which signal led each time.
2. **Guided Practice** (5 min): Reset, then take four clockwise steps in a row. Sketch the two waveforms on paper and mark every point where only one signal changed.
3. **Assessment** (5 min): Have a partner take a hidden sequence of steps. Look only at the waveforms, then state the direction of each step and the final position before checking the counter.

### Assessment

- The student explains that Signal A and Signal B are offset by a quarter cycle, so only one of them changes at any single edge.
- The student differentiates clockwise from counter-clockwise by naming which signal changes first.
- The student reads a short waveform and reports the correct final position without looking at the counter.
- The student connects a leading A edge to `encoder_position += 1` and a leading B edge to `encoder_position -= 1`.

## References

1. [Rotary encoder - Wikipedia](https://en.wikipedia.org/wiki/Rotary_encoder) - How the two output pins of an incremental encoder work.
2. [Incremental encoder - Wikipedia](https://en.wikipedia.org/wiki/Incremental_encoder) - Quadrature output and the four-phase sequence used in this MicroSim.
3. [Gray code - Wikipedia](https://en.wikipedia.org/wiki/Gray_code) - Why changing only one signal at a time makes the sequence reliable.
4. [MicroPython machine.Pin documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html) - Reading the encoder's A and B pins and attaching an interrupt handler with `irq()`.
