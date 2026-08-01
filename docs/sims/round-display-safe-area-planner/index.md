---
title: Round Display Safe-Area Layout Planner
description: Interactive p5.js MicroSim for round display safe-area layout planner.
image: /sims/round-display-safe-area-planner/round-display-safe-area-planner.png
og:image: /sims/round-display-safe-area-planner/round-display-safe-area-planner.png
twitter:image: /sims/round-display-safe-area-planner/round-display-safe-area-planner.png
social:
   cards: false
quality_score: 0
---

# Round Display Safe-Area Layout Planner

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Round Display Safe-Area Layout Planner MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

The round color display hands you a 240x240 square frame buffer, but only the
inscribed circle is real glass. This planner lets you examine candidate feature
boxes on that buffer and distinguish safe placements from placements the
circular boundary will quietly clip. Nothing on real hardware warns you when a
feature drifts into a corner, so learning to spot it here saves debugging later.

Every box is judged by its four corners. All four inside the dashed safe-area
circle reads Safe, a corner in the band between the safe area and the visible
circle reads At Risk, and a corner outside the visible circle reads Clipped.

## How to Use

1. Click **Add Eye**, **Add Eyebrow**, or **Add Mouth** to drop a default-sized
   box near the center of the buffer.
2. **Drag a box** anywhere on the buffer. Its color and its line in the status
   list update the instant a corner crosses either circle.
3. **Drag the small square** on a box's bottom-right corner to resize it, and
   watch a box that was Safe turn At Risk as it grows.
4. Read the **status list** on the right for each box's verdict and how far its
   farthest corner sits from the center of the display.
5. Click **Reset Layout** to clear every box and plan a different face.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/round-display-safe-area-planner/main.html"
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

- Chapter 5's frame buffer: a block of memory shaped like the display, where
  the round display's buffer is a 240x240 square holding a visible circle.
- Chapter 5's coordinate system, with (0, 0) at the top-left corner.
- Chapter 9's habit of planning eyes, eyebrows, and a mouth as bounding boxes
  before drawing anything.
- The distance formula, used here to measure each corner from the center.

### Activities

1. **Exploration** (5 min): Add one Eye box and drag it slowly toward a corner
   of the buffer. Record the position where it first turns yellow and the
   position where it first turns red, then explain what changed at each point.
2. **Guided Practice** (5 min): Build a full face - two eyes, two eyebrows, and
   a mouth - with every box reading Safe. Write down the coordinates you chose
   and how much room the widest feature had left over.
3. **Assessment** (5 min): Take a Safe eyebrow near the top of the display and
   resize it wider until it turns At Risk without moving it. Explain why
   widening a box near the top edge is riskier than widening one near the
   center.

### Assessment

- The student can explain why the corners of a 240x240 buffer are never visible
  on a round display.
- The student can classify a given box as Safe, At Risk, or Clipped and justify
  the verdict using the distance from each corner to the center.
- The student can produce a full five-feature face layout where every box is
  Safe.
- The student can explain why a designer plans against the safe area rather
  than the true visible circle.

## References

1. [Framebuffer - Wikipedia](https://en.wikipedia.org/wiki/Framebuffer) -
   Background on the block of memory this planner represents as a square.
2. [MicroPython framebuf documentation](https://docs.micropython.org/en/latest/library/framebuf.html) -
   The drawing API whose coordinates land inside or outside this safe area.
3. [Safe area (television) - Wikipedia](https://en.wikipedia.org/wiki/Safe_area_(television)) -
   The broadcast design convention this chapter's safe-area circle borrows from.
4. [Adafruit 1.28 inch round TFT (GC9A01) guide](https://learn.adafruit.com/adafruit-1-28-tft-round) -
   Documentation for a real 240x240 round display of the kind modeled here.
