---
title: Button Bounce Timeline Visualizer
description: Interactive p5.js MicroSim for button bounce timeline visualizer.
image: /sims/button-bounce-timeline-visualizer/button-bounce-timeline-visualizer.png
og:image: /sims/button-bounce-timeline-visualizer/button-bounce-timeline-visualizer.png
twitter:image: /sims/button-bounce-timeline-visualizer/button-bounce-timeline-visualizer.png
social:
   cards: false
quality_score: 0
---

# Button Bounce Timeline Visualizer

<iframe src="main.html" height="490px" width="100%" scrolling="no"></iframe>

[Run the Button Bounce Timeline Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Push a real button once and the metal contacts do not close cleanly. They chatter open and closed for a few milliseconds, and your board reads every one of those flickers. That chatter is called **contact bounce**, and the top timeline here shows it as a stack of narrow spikes.

The bottom timeline shows the **debounced output**, which is what your expression menu actually reacts to. Compare the two traces and you can identify exactly which raw edges the debounce rule accepted and which it threw away. Shrink the debounce time constant below the bounce duration and you will build the failure this chapter warns about: one press counted twice, so the menu skips an expression.

## How to Use

1. Look at the caption under the title. It compares how long the bounce lasts with how wide your debounce window is.
2. Click **Press the Button** to draw a fresh press on both timelines.
3. Drag **Bounce severity** from 1 to 8 spikes and watch the raw trace get messier and last longer.
4. Drag **Debounce time constant** and watch the yellow shaded window grow or shrink. The raw trace never changes, only what your code accepts.
5. Shrink the window until it is narrower than the bounce. A red "press 2 (false)" marker appears on the debounced trace.
6. Read the event log to see the exact millisecond of every ignored and every accepted edge.
7. Click **Reset** to clear both timelines and the log.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/button-bounce-timeline-visualizer/main.html"
        height="490px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Reading a button pin as HIGH or LOW with a pull-up resistor, from Chapter 13
- Knowing that `time.ticks_ms()` and `time.ticks_diff()` measure elapsed time, from Chapter 12
- Understanding that polling reads the pin only at certain moments, from Chapter 13
- Knowing that the expression menu advances one step per accepted press, from earlier in Chapter 14

### Activities

1. **Exploration** (5 min): Leave the defaults and compare the two traces edge by edge. Count how many edges appear on the raw trace and how many appear on the debounced trace.
2. **Guided Practice** (5 min): Set **Bounce severity** to 8, then drag **Debounce time constant** down step by step. Record the largest window value that still produces a false second press.
3. **Assessment** (5 min): Set the debounce time constant to 100 ms and explain, in two sentences, one drawback of choosing a window that is far larger than it needs to be.

### Assessment

- The student differentiates the raw trace from the debounced trace by naming at least two visible differences.
- The student states that the debounce window must be longer than the bounce duration for one press to be counted once.
- The student predicts, given a bounce duration and a window width, whether a false second press will occur.
- The student connects a false second press to a menu that skips an expression.
- The student names one cost of setting the debounce window much too long, such as ignoring a real fast second press.

## References

1. [Switch - Contact bounce - Wikipedia](https://en.wikipedia.org/wiki/Switch#Contact_bounce) - Why mechanical contacts chatter when they close.
2. [Schmitt trigger - Wikipedia](https://en.wikipedia.org/wiki/Schmitt_trigger) - A hardware circuit that cleans up a noisy signal, the alternative to fixing bounce in software.
3. [MicroPython machine.Pin documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html) - Reading a button pin and configuring its pull-up resistor.
4. [MicroPython time module documentation](https://docs.micropython.org/en/latest/library/time.html) - The `ticks_ms()` and `ticks_diff()` functions used to measure the debounce window.
