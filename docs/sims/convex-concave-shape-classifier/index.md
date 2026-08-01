---
title: Convex vs Concave Shape Classifier
description: Interactive p5.js MicroSim for convex vs concave shape classifier.
image: /sims/convex-concave-shape-classifier/convex-concave-shape-classifier.png
og:image: /sims/convex-concave-shape-classifier/convex-concave-shape-classifier.png
twitter:image: /sims/convex-concave-shape-classifier/convex-concave-shape-classifier.png
social:
   cards: false
quality_score: 0
---

# Convex vs Concave Shape Classifier

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run the Convex vs Concave Shape Classifier MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Some polygons are safe to hand straight to `fb.poly()` with fill turned on, and
some will surprise you. The difference is whether any vertex dents inward toward
the middle of the shape. This MicroSim shows you eight polygons one at a time and
asks you to commit to an answer before it reveals anything. After each guess the
dented vertices light up in coral, so you can examine exactly which corner made
the shape concave and differentiate that pattern from a shape where every corner
turns the same way.

## How to Use

1. Look at the polygon on the simulated screen and decide whether any corner
   bends back toward the inside.
2. Click **Convex** or **Concave** to lock in your answer. You get one guess per
   shape.
3. Read the feedback panel. Blue dots mark ordinary vertices, and coral dots mark
   vertices that dent inward.
4. Click **Show Explanation** for the reason, plus a gold dashed line joining a
   dented vertex to its two neighbors.
5. Click **Next Shape** to move on. Your running score appears at the top of the
   feedback panel.
6. After the eighth shape the button becomes **Start Over**, which resets the
   score and runs the set again.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/convex-concave-shape-classifier/main.html"
        height="502px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Know that a polygon is a closed shape made of straight edges joined at
  vertices.
- Understand that `fb.poly()` draws a shape from an ordered list of points.
- Be able to read a shape's outline as a path that visits each vertex in order.
- Know the words vertex, edge, and interior.

### Activities

1. **Exploration** (5 min): Classify all eight shapes without using **Show
   Explanation**. Write down the two shapes you found hardest to judge.
2. **Guided Practice** (5 min): Start over, and this time open **Show
   Explanation** for every concave shape. Describe in one sentence what the gold
   dashed line tells you about a dented vertex.
3. **Assessment** (5 min): Sketch one convex and one concave polygon of your own,
   then circle the vertex that would light up coral in your concave shape.

### Assessment

- The student defines a concave polygon as one with at least one vertex that
  dents inward.
- The student correctly classifies at least seven of the eight shapes.
- The student identifies the dented vertex in the L-shape and in the arrow.
- The student explains why a five-point star has five dented vertices, not one.

## References

1. [Convex polygon (Wikipedia)](https://en.wikipedia.org/wiki/Convex_polygon) -
   the formal definition this MicroSim tests you against.
2. [Concave polygon (Wikipedia)](https://en.wikipedia.org/wiki/Concave_polygon) -
   including the reflex-angle rule that makes a vertex dent inward.
3. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the `poly()` method that draws polygons from a point array.
4. [Polygon (Wikipedia)](https://en.wikipedia.org/wiki/Polygon) - vertices,
   edges, and the vocabulary used throughout this chapter.
