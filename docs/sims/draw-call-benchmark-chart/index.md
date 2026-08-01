---
title: Draw Call Benchmark Chart
description: Interactive Chart.js MicroSim for draw call benchmark chart.
image: /sims/draw-call-benchmark-chart/draw-call-benchmark-chart.png
og:image: /sims/draw-call-benchmark-chart/draw-call-benchmark-chart.png
twitter:image: /sims/draw-call-benchmark-chart/draw-call-benchmark-chart.png
social:
   cards: false
quality_score: 0
---

# Draw Call Benchmark Chart

<iframe src="main.html" height="522px" width="100%" scrolling="no"></iframe>

[Run the Draw Call Benchmark Chart MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

Chapter 6 claimed that `blit()` runs faster than redrawing shapes from scratch. This chart turns that claim into four real `ticks_us()` measurements of a single animation frame. Your goal is to examine which way of redrawing a face costs the most microseconds, and to work out why. The best part comes last: even the slowest technique here finishes far inside the time budget for a smooth animation.

The draw times are representative readings for a 128x64 monochrome display on an RP2040-class board. Your exact numbers will differ on other hardware, but the ordering will not.

## How to Use

1. Start in the **Microseconds** view and rank the four bars from slowest to fastest.
2. Hover over any bar to see its exact draw time plus the highest frame rate that time allows.
3. Click **Frames per second** to flip the same four measurements into maximum theoretical frame rates.
4. Click any bar to open a short explanation of why that technique costs what it does.
5. Check **Show the 20 FPS budget** to stretch the axis out to a full frame budget and watch every bar shrink to a sliver.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/draw-call-benchmark-chart/main.html"
        height="522px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knowing that `blit()` copies a finished block of pixels instead of rebuilding shapes, from Chapter 6
- Knowing that `ellipse()` and `poly()` draw a face one feature at a time, from Chapter 7
- Knowing that `time.ticks_us()` measures elapsed microseconds, from earlier in Chapter 12
- Comfort reading a bar chart with a labeled vertical axis

### Activities

1. **Exploration** (5 min): In the **Microseconds** view, write down all four values. Which two techniques share the partial-redraw idea, and roughly how many times faster is each one than its full-redraw partner?
2. **Guided Practice** (5 min): Switch to the **Frames per second** view and hover every bar. Confirm that a smaller microsecond value always produces a larger frame rate, then explain in one sentence why the two views rank the bars in opposite directions.
3. **Assessment** (5 min): Turn on **Show the 20 FPS budget**, then answer in writing: if all four techniques fit inside the budget, when would you still choose the fastest one?

### Assessment

- The student reads all four microsecond values correctly and orders them from slowest to fastest.
- The student states that partial redraw saves time because it touches only the pixels that actually changed.
- The student states that blitting saves time because the shapes were already drawn once into a buffer.
- The student explains that frames per second is the inverse of draw time, so the tallest bar in one view becomes the shortest bar in the other.
- The student names at least one reason to keep saving draw time even inside budget, such as leaving room for button checks, sensor reads, or a slower display.

## References

1. [MicroPython time module documentation](https://docs.micropython.org/en/latest/library/time.html) - The `ticks_us()` and `ticks_diff()` functions used to measure draw time.
2. [MicroPython framebuf module documentation](https://docs.micropython.org/en/latest/library/framebuf.html) - The `blit()` method that copies a pre-rendered sprite into a frame buffer.
3. [Benchmark (computing) - Wikipedia](https://en.wikipedia.org/wiki/Benchmark_(computing)) - Why programmers measure code instead of guessing which version runs faster.
4. [Frame rate - Wikipedia](https://en.wikipedia.org/wiki/Frame_rate) - How frames per second relates to the time each frame is allowed to take.
5. [Chart.js Documentation](https://www.chartjs.org/docs/latest/) - The JavaScript charting library used to build this MicroSim.
