---
title: Ellipse & Polygon Drawing
description: How the ellipse() method's quadrant fill code and the poly() method's point arrays let a handful of function calls draw every curved and angled feature on a robot's face.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 14:28:47
version: 0.09
---

# Ellipse & Polygon Drawing

## Summary

This chapter introduces the two drawing methods most of a robot face is built from: ellipse(), including its quadrant-fill code for drawing partial shapes like a half-closed eyelid, and poly(), including how to build point arrays for convex and concave shapes. After completing this chapter, students will be able to draw a filled or outlined ellipse in any quadrant and a custom polygon of their own design.

## Concepts Covered

This chapter covers the following 15 concepts from the learning graph:

1. Ellipse Method
2. Quadrant Fill Code
3. Ellipse Radius Parameter
4. Filled Versus Outlined Shape
5. Poly Method
6. Point Array
7. Polygon Vertex
8. Closed Polygon Path
9. Convex Polygon
10. Concave Polygon
11. Approximating Curves With Lines
12. Circle As Special Ellipse
13. Triangle Eyebrow Shape
14. Rounded Rectangle Approximation
15. Anti-Aliasing Limitation

## Prerequisites

This chapter builds on concepts from:

- [Chapter 5: Display & Coordinate Systems](../05-display-coordinate-systems/index.md)
- [Chapter 6: Basic Drawing Primitives](../06-basic-drawing-primitives/index.md)

---

## A Circle Is Just a Special Ellipse

Chapter 6 gave you rectangles built from straight edges and hard corners — great for a status bar, less great for an eye. Real eyes, pupils, and smiling mouths are curved, and curved shapes need different math than four straight lines meeting at right angles.

The shape you already know from geometry class turns out to be the easiest curve a frame buffer can draw. **Circle as special ellipse** describes the fact that an ellipse — an oval shape controlled by two independent radii, one for width and one for height — becomes a perfectly round circle whenever those two radii happen to be equal. You never need a separate "circle" method; a circle is simply the one special case where an ellipse's two radii match.

!!! mascot-welcome "The Chapter Where Faces Start Feeling Real"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Here's something wild: almost every curved shape on a robot's face — a round pupil, a drooping eyelid, a smiling mouth — comes from one single method call. Learning to control it well is genuinely a superpower for a robot designer, and this chapter hands it to you completely. Every pixel tells a story, and this is where the curved ones start.

## Drawing Curves: The Ellipse Method

FrameBuf gives both displays in this book exactly one method for drawing that curve, and it is arguably the most useful method in the entire toolkit. The **ellipse method**, called as `fb.ellipse(x, y, xradius, yradius, color)`, draws an ellipse centered at the point (x, y), with `xradius` controlling how far the shape extends left and right and `yradius` controlling how far it extends up and down.

A bridge sentence before the code: this example draws one plain, outlined ellipse near the center of a 128x64 OLED, using the coordinate system Chapter 5 taught.

```python
fb.ellipse(64, 32, 20, 12, WHITE)
fb.show()
```

Notice that `fb.ellipse()` takes a center point rather than a corner, unlike `fb.rect()` from Chapter 6, which starts from its top-left corner. That difference makes sense once you remember what ellipses are usually used for on a face — eyes and pupils are naturally described by where their middle sits, not by a corner that does not really exist on a curved shape.

## Independent Radii: The Ellipse Radius Parameter

Because `xradius` and `yradius` are two separate numbers, they never have to match, and that independence is what makes `fb.ellipse()` so flexible. The **ellipse radius parameter** refers to either of these two values, each controlling one dimension of the shape completely on its own. Set them equal and you get a round circle, as the previous section showed; set them differently and you get a wide oval, a tall oval, or anything in between.

A bridge sentence before the code: this example draws three ellipses side by side — one wide and flat, one tall and narrow, and one perfectly round — so the effect of changing each radius independently is easy to compare.

```python
fb.ellipse(20, 40, 15, 6, WHITE)    # wide, flat oval
fb.ellipse(64, 40, 6, 15, WHITE)    # tall, narrow oval
fb.ellipse(108, 40, 10, 10, WHITE)  # xradius == yradius, a circle
fb.show()
```

A wide, flat ellipse like the first one is exactly the shape a calm, resting mouth needs. A tall, narrow ellipse works well for a surprised or startled pupil. Once you can picture what each radius controls, choosing values for a specific expression becomes a matter of intent, not guesswork.

## Solid or Hollow: Filled Versus Outlined Shape

Every ellipse drawn so far in this chapter has been an outline — just the curved border, with the inside left untouched. Chapter 6 solved this exact problem for rectangles with a final `True` argument, and `fb.ellipse()` uses the same idea. **Filled versus outlined shape** describes the optional `fill` boolean argument shared by `fb.ellipse()`, `fb.rect()`, and `fb.poly()`: leaving it off (or `False`) draws only the border, while passing `True` fills the entire shape solid.

A bridge sentence before the code: this example draws one outlined pupil and one filled pupil next to each other so the difference is obvious at a glance.

```python
fb.ellipse(40, 30, 8, 8, WHITE)          # outline only
fb.ellipse(80, 30, 8, 8, WHITE, True)    # filled solid
```

A solid, filled pupil reads far more clearly on a small display than a thin outlined ring does, especially from across a classroom. Most eyes, pupils, and eyebrows in this book use `fill=True` for exactly that reason — hollow shapes are reserved for special effects, like a faint outline behind a highlight.

## The Real Trick: Quadrant Fill Code

Everything so far draws a whole ellipse, all the way around. The feature that makes `fb.ellipse()` genuinely powerful is the ability to draw only part of one, and that is exactly what a drooping eyelid or a curved smile needs.

The **quadrant fill code** is an optional bitmask argument that controls which of the four quarters of an ellipse actually get drawn. Picture an ellipse sliced into four pie-shaped quadrants by a horizontal line and a vertical line through its center. Each of the four quadrants has its own bit value, and adding those values together builds a single number — the mask — that tells `fb.ellipse()` exactly which quarters to draw and which to leave blank.

!!! mascot-thinking "One Number, Four Independent Switches"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Think of the quadrant fill code as four separate light switches, one per quarter of the ellipse, each with a fixed value: 1, 2, 4, or 8. Flip on the switches you want and add their values together — that sum is the whole mask. This single number is the mechanism behind a closed eyelid, a smiling mouth curve, and a dozen other expressions you will build in later chapters.

Here is the value assigned to each quadrant, matching the four quarters of the ellipse as they appear on screen.

| Quadrant | Screen Position | Bit Value |
|---|---|---|
| Upper right | top-right quarter | 1 |
| Upper left | top-left quarter | 2 |
| Lower left | bottom-left quarter | 4 |
| Lower right | bottom-right quarter | 8 |

Adding values together builds a combined mask. Because each of the four quadrant bits is either included or excluded, there are exactly sixteen possible combinations, from 0 (nothing drawn) to 15 (every quadrant drawn — the default whole ellipse).

| Goal | Quadrants Added | Mask Value |
|---|---|---|
| Top half only | upper right (1) + upper left (2) | 3 |
| Bottom half only | lower left (4) + lower right (8) | 12 |
| Right side only | upper right (1) + lower right (8) | 9 |
| Full ellipse | all four quadrants | 15 |

A bridge sentence before the code: this example draws only the bottom half of a wide, flat ellipse, producing a curved "smile" shape, and then draws only the top half of a small circle, producing the look of a drooping, half-closed eyelid.

```python
TOP_HALF = 1 + 2       # upper right + upper left = 3
BOTTOM_HALF = 4 + 8    # lower left + lower right = 12
FULL = 1 + 2 + 4 + 8   # all four quadrants = 15

fb.ellipse(64, 45, 20, 10, WHITE, True, BOTTOM_HALF)  # a smiling mouth curve
fb.ellipse(64, 20, 8, 8, WHITE, True, TOP_HALF)       # a sleepy, half-closed eye
fb.show()
```

The `fb.ellipse()` call's full signature is `fb.ellipse(x, y, xradius, yradius, color, fill, mask)` — the quadrant mask is the seventh and final argument, and it only matters once `fill` is already provided. Skip it entirely and MicroPython assumes 15, drawing the complete shape exactly like every earlier example in this chapter.

!!! mascot-warning "Adding the Wrong Bits Builds the Wrong Shape"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A common mistake: wanting the left half of an ellipse and adding 1 + 8 by accident, thinking of "left" as "the first and last quadrant." That combination actually draws upper-right and lower-right — the right side, not the left — because the bit values are tied to fixed screen quadrants, not to whichever side you happen to be picturing. Double-check each quadrant's position against the table above before adding bit values together.

Watching an ellipse redraw live as each quadrant bit toggles on and off makes this mechanism click far faster than reading a table of numbers.

#### Diagram: Quadrant Fill Code Explorer

<iframe src="../../sims/quadrant-fill-code-explorer/main.html" width="100%" height="587px" scrolling="no"></iframe>

<details markdown="1">
<summary>Quadrant Fill Code Explorer</summary>
Type: microsim
**sim-id:** quadrant-fill-code-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: demonstrate, apply

Learning objective: Apply the quadrant fill code bitmask by toggling individual quadrant bits and demonstrating how each combination changes which portion of an ellipse is drawn on a simulated frame buffer.

Canvas layout:
- Left 60% (responsive, roughly 420x320 at default width): a scaled-up simulated frame buffer showing one ellipse redrawn live
- Right 40%: four quadrant toggle buttons arranged in a 2x2 grid matching the ellipse's own quadrant layout, two radius sliders, a fill toggle, and a live readout panel

Visual elements:
- A grid-based simulated frame buffer, matching the monochrome OLED's on/off pixel look
- One ellipse drawn at the center of the buffer, redrawn every time a control changes
- Only the currently enabled quadrants are rendered; disabled quadrants show as empty background
- A live readout showing the binary mask (e.g. `0b1100`) and its decimal value (e.g. `12`)
- A live code readout showing the exact call, e.g. `fb.ellipse(64, 32, 20, 12, WHITE, True, 12)`

Interactive controls:
- Four toggle buttons labeled "Upper Right (1)", "Upper Left (2)", "Lower Left (4)", "Lower Right (8)", arranged spatially to match their quadrant
- Slider: xradius (5-40, default 20)
- Slider: yradius (5-40, default 12)
- Checkbox: "Filled" (default checked)
- "Reset to Full Ellipse" button, which enables all four quadrants

Default parameters: all four quadrant toggles on (mask = 15), xradius = 20, yradius = 12, filled checked

Behavior: toggling any quadrant button immediately redraws the ellipse using only the enabled quadrants and updates both the binary/decimal mask readout and the live code readout; moving either radius slider or the fill checkbox redraws instantly with the current mask unchanged.

Instructional Rationale: An Apply-level objective calling for direct parameter exploration is best served by a live, direct-manipulation pattern where every toggle produces immediate, concrete visual and numeric feedback, letting the learner build an accurate mental model of how bit values combine into a mask.

Responsive design: control panel moves below the canvas on viewports narrower than 600 pixels; the ellipse view scales to fill its container's width while preserving proportions.

Implementation: p5.js for the frame buffer rendering and quadrant-masked ellipse drawing; the four toggle states are combined with bitwise addition to compute the mask value shown in the readout.
</details>

## Why Curves Look a Little Blocky: Anti-Aliasing Limitation

Zoom in on any curved edge drawn so far in this chapter and you will notice something: it is not perfectly smooth. Each pixel on these displays is either fully on or fully off, with nothing in between, so a curve made of individual square pixels always has a slightly jagged, staircase-like edge.

**Anti-aliasing limitation** describes this fact directly: these frame buffers have no way to blend a pixel partway between two colors to smooth out a curve, the way a phone screen or a computer monitor often can. A curved eyebrow or a round pupil on a 128x64 OLED will always show some visible blockiness up close, and that is expected behavior, not a bug in your code.

!!! mascot-tip "Blocky Curves Are Normal, Not a Mistake"
    ![Pixel gives a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    If your `fb.ellipse()` call looks a little jagged around the edge, nothing in your code needs fixing. At this resolution, every curve is built from square pixels, and a small amount of blockiness is simply part of how these displays work. Step back a few feet — the same distance a person talking to your robot would stand — and the curve reads as smooth and expressive anyway.

## Beyond Curves: The Poly Method

Ellipses cover circles and ovals beautifully, but an angry eyebrow needs a sharp angle, not a curve, and `fb.ellipse()` has no way to produce one. FrameBuf's other major shape method fills that gap. The **poly method**, called as `fb.poly(x, y, coords, color, fill)`, draws a polygon — any shape made of straight-line segments connecting a list of points — offset so its coordinates are measured relative to the position (x, y).

A bridge sentence before the code: this example draws one small filled triangle near the top-left of the screen, using `fb.poly()` for the first time in this book.

```python
from array import array

triangle_points = array('B', [10, 0, 20, 10, 0, 10])
fb.poly(0, 0, triangle_points, WHITE, True)
fb.show()
```

That `coords` argument is doing most of the work in this call, and it deserves its own explanation before you can use `fb.poly()` with confidence.

## Points in a List: The Point Array

`fb.poly()` needs to know every corner of the shape you want drawn, and it expects all of those coordinates packed into one single, flat list rather than a list of separate (x, y) pairs. A **point array** is exactly that: an array of alternating x and y values — x1, y1, x2, y2, x3, y3, and so on — describing every corner of a polygon in order.

Chapter 3 introduced Python's built-in list and tuple types for holding collections of values; a point array uses a more specialized tool instead. MicroPython builds point arrays with the `array` module's `array('B', [...])` constructor, where `'B'` tells MicroPython to store each number as an unsigned byte, a whole number from 0 to 255 — plenty of range for coordinates on a 128-pixel-wide display, and far more memory-efficient than a general-purpose list.

A bridge sentence before the code: this example builds the point array for a five-point pentagon shape, showing the flat x, y, x, y pattern directly.

```python
from array import array

pentagon_points = array('B', [50, 0, 60, 10, 55, 20, 45, 20, 40, 10])
fb.poly(0, 0, pentagon_points, WHITE, True)
```

Reading that array two numbers at a time — (50, 0), then (60, 10), then (55, 20), and so on — reveals five separate coordinate pairs, one for each corner of the pentagon.

## Corners of a Shape: Polygon Vertex

Each of those coordinate pairs names one corner of the shape, and that corner has its own vocabulary term. A **polygon vertex** is a single corner point of a polygon — one (x, y) pair inside a point array. A triangle has three vertices, a pentagon has five, and a hexagon has six; the number of vertices in a point array always matches the number of corners in the final shape.

## Never Repeat the Start: Closed Polygon Path

Look back at the triangle example: three vertices were listed, but the triangle drawn on screen has three connected edges, meaning the last point somehow connects back to the first one automatically. **Closed polygon path** describes exactly this behavior: `fb.poly()` always draws a line from its final listed vertex back to its first vertex, closing the shape, without you needing to repeat that starting coordinate at the end of the array.

This detail saves both typing and memory — a point array for a hexagon only needs six vertex pairs, not seven, even though the finished shape has six visible edges forming a closed loop.

## Not Every Shape Bends the Same Way: Convex and Concave Polygons

Every polygon drawn so far in this chapter — the triangle, the pentagon — shares one property worth naming, because most eyebrow and mouth shapes you will design share it too. A **convex polygon** is a shape where every vertex points outward, with no corner "caving in" toward the shape's own interior; a straight line drawn between any two points inside the shape always stays entirely inside it.

The opposite is also possible, though it is rarer in face design. A **concave polygon** has at least one vertex that dents inward, creating a "caved in" notch — think of a crescent moon, an arrow, or a star shape, where a straight line between two interior points can briefly leave the shape and re-enter it.

| Property | Convex Polygon | Concave Polygon |
|---|---|---|
| Every vertex | points outward | at least one dents inward |
| Line between two interior points | always stays inside the shape | can briefly exit the shape |
| Typical use on a face | eyebrows, simple mouths, eye shapes | rare — decorative marks, stars |
| Easier to reason about? | yes | no, requires more care |

!!! mascot-encourage "Most of What You Design Will Be Convex, and That's Good News"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Concave shapes are trickier to plan, since it is easy to accidentally list vertices in an order that twists the outline. The reassuring part: almost every eyebrow, mouth, and eye shape you will build in this course is naturally convex. You can absolutely draw a concave shape later for a special decoration, but do not feel like you need to master that complexity right away.

## A Concrete Example: Triangle Eyebrow Shape

A straight rectangular eyebrow from Chapter 6 communicates "eyebrow" well enough, but it cannot express much emotion — it just sits there, flat and neutral. A **triangle eyebrow shape** replaces that rectangle with a three-point `fb.poly()` triangle, and because a triangle can slant, it reads as far more expressive than a straight bar ever could.

A bridge sentence before the code: this example draws two eyebrow triangles with points arranged to slant sharply toward the center, the shape a furrowed, angry eyebrow needs.

```python
from array import array

left_eyebrow = array('B', [0, 6, 20, 0, 20, 6])
right_eyebrow = array('B', [0, 0, 20, 6, 0, 6])

fb.poly(15, 10, left_eyebrow, WHITE, True)
fb.poly(75, 10, right_eyebrow, WHITE, True)
fb.show()
```

Notice that only the order and position of three vertices changed between the two eyebrows — no new method, no extra parameters, just a different point array. That is the real payoff of `fb.poly()`: a single flexible tool that reshapes an eyebrow's entire emotional read with nothing more than different numbers in a list.

## Corners Without the Sharp Edges: Rounded Rectangle Approximation

Sometimes a design calls for a rectangle that does not feel quite as blocky as Chapter 6's version, without needing a full custom polygon. **Rounded rectangle approximation** describes a practical shortcut: draw a plain `fb.rect()` for the body of the shape, then draw four small filled `fb.ellipse()` circles, one at each corner, to soften the hard right angles.

A bridge sentence before the code: this example builds one rounded rectangle from a body rectangle and four corner circles.

```python
fb.rect(20, 20, 40, 15, WHITE, True)      # flat-sided rectangle body
fb.ellipse(20, 20, 4, 4, WHITE, True)     # rounded corner, top-left
fb.ellipse(60, 20, 4, 4, WHITE, True)     # rounded corner, top-right
fb.ellipse(20, 35, 4, 4, WHITE, True)     # rounded corner, bottom-left
fb.ellipse(60, 35, 4, 4, WHITE, True)     # rounded corner, bottom-right
```

This is a shortcut, not a precise geometric technique — the corner circles have to be sized and positioned by eye until they line up cleanly with the rectangle's edges. It is a fast, practical option for a status bar or a rounded mouth outline when a fully custom `fb.poly()` shape would be more effort than the result is worth.

## Approximating Curves With Lines

`fb.ellipse()` only ever draws a regular oval, and `fb.rect()` with rounded corners only approximates gentle curves — but sometimes a design calls for a curve that neither shape can produce on its own, like an eyebrow arched into a very specific, irregular sweep. **Approximating curves with lines** means using `fb.poly()` with many closely spaced vertices to trace a smooth-looking curve out of many tiny straight segments, since a polygon with enough points is visually indistinguishable from a true curve at this display's resolution.

A bridge sentence before the code: this example uses a loop, the same kind of tool Chapter 3 introduced, to calculate nine points along a gentle arc and pack them into a point array.

```python
from array import array
import math

points = []
for i in range(9):                        # nine points sweep the arc
    angle = math.radians(180 + i * 22.5)
    points.append(40 + int(15 * math.cos(angle)))
    points.append(30 + int(6 * math.sin(angle)))

arc_points = array('B', points)
fb.poly(0, 0, arc_points, WHITE, False)
```

This technique connects the two headline methods of this chapter directly: `fb.ellipse()` is fast and simple for regular ovals, while `fb.poly()` with many points takes over exactly where a regular ellipse cannot reach. Knowing when to reach for each one is a design decision, not just a syntax choice.

Building a polygon vertex by vertex, watching the point array and the resulting shape update with every click, makes both point arrays and closed paths far easier to internalize than reading definitions alone.

#### Diagram: Poly Point Array Builder

<iframe src="../../sims/poly-point-array-builder/main.html" width="100%" height="452px" scrolling="no"></iframe>

<details markdown="1">
<summary>Poly Point Array Builder</summary>
Type: microsim
**sim-id:** poly-point-array-builder<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Create (L6)
Bloom Taxonomy Verb: construct, design

Learning objective: Construct a custom polygon by placing vertices on a simulated frame buffer grid, and design the resulting point array and matching `fb.poly()` call needed to reproduce it in code.

Canvas layout:
- Left 65% (responsive, roughly 420x320 at default width): a simulated frame buffer grid where the learner clicks to place vertices
- Right 35%: a live point array readout, a live `fb.poly()` code readout, a fill toggle, and Undo/Clear buttons

Visual elements:
- A grid-based simulated frame buffer matching the OLED's pixel look
- Each placed vertex shown as a numbered dot in click order
- Straight lines connecting vertices in the order they were placed
- A dashed line automatically shown connecting the most recent vertex back to the first vertex, illustrating the closed polygon path
- A live-updating point array readout, e.g. `array('B', [10, 0, 20, 10, 0, 10])`
- A live-updating code readout, e.g. `fb.poly(0, 0, my_points, WHITE, True)`

Interactive controls:
- Click anywhere on the grid to add the next vertex (maximum 10 vertices)
- "Undo Last Point" button removes the most recently placed vertex
- "Clear" button removes all vertices and resets the array to empty
- Checkbox: "Filled" (default unchecked) — toggles between an outlined and filled render of the current shape

Default parameters: empty grid, no vertices placed, fill unchecked

Behavior: each click immediately adds a numbered vertex, redraws the connecting lines including the dashed closing segment, and updates both the point array and code readouts; toggling "Filled" instantly re-renders the current shape solid or outlined without losing placed points.

Instructional Rationale: A Create-level objective requires the learner to actively assemble a novel shape from individual decisions, which a direct point-placement builder supports far better than a passive example, since every click is a design choice reflected immediately in both the visual shape and the underlying code.

Responsive design: control panel and readouts move below the grid on viewports narrower than 600 pixels; the grid scales to fill its container's width while preserving the OLED's 2:1 aspect ratio.

Implementation: p5.js for click detection, vertex storage as an ordered array of coordinate pairs, and live generation of the point-array and `fb.poly()` code strings from the current vertex list.
</details>

Classifying a shape as convex or concave is a skill that improves with practice on many different examples, not just the two shown earlier in this chapter.

#### Diagram: Convex vs Concave Shape Classifier

<iframe src="../../sims/convex-concave-shape-classifier/main.html" width="100%" height="502px" scrolling="no"></iframe>

<details markdown="1">
<summary>Convex vs Concave Shape Classifier</summary>
Type: microsim
**sim-id:** convex-concave-shape-classifier<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, examine

Learning objective: Differentiate convex polygons from concave polygons by examining a series of shapes and classifying each based on whether any vertex dents inward toward the shape's interior.

Canvas layout:
- Left 70% (responsive, roughly 420x320 at default width): one polygon shape displayed at a time on a simulated frame buffer grid
- Right 30%: two classification buttons, a running score readout, and a feedback/explanation panel

Visual elements:
- One polygon at a time, drawn as a filled or outlined shape on the grid
- After a guess is submitted, the vertex responsible for concavity (if the shape is concave) highlights in coral
- A running score readout: "Correct: N / M shapes seen"
- A short feedback message confirming or correcting the learner's classification, with a one-sentence explanation

Interactive controls:
- Button: "Convex"
- Button: "Concave"
- Button: "Next Shape" (enabled only after a guess has been submitted)
- Button: "Show Explanation" (reveals which vertex, if any, causes the dent)

Default parameters: first shape in the set displayed (a simple triangle), no guess submitted yet, score at 0/0

Behavior: clicking "Convex" or "Concave" immediately locks in a guess, shows correct/incorrect feedback, highlights the concave vertex in coral if one exists, and updates the running score; "Next Shape" advances through a fixed set of eight shapes (triangle, square, five-point star, arrow, L-shape, pentagon, chevron, hexagon) covering both convex and concave examples.

Instructional Rationale: An Analyze-level objective requires examining a shape's structure to identify a specific defining pattern — an inward-pointing vertex — which a classify-then-reveal pattern with immediate, specific feedback supports better than a passive gallery, since the learner must commit to a judgment before seeing the answer.

Responsive design: control panel and feedback text move below the shape display on viewports narrower than 600 pixels; the shape display scales to fill its container's width.

Implementation: p5.js for shape rendering; each of the eight shapes is stored as its own point array, with a pre-computed flag and, for concave shapes, the index of the offending vertex used to drive the coral highlight.
</details>

## Putting It Together: An Eye, an Eyelid, and an Eyebrow

Every concept in this chapter now has a name, so it is worth combining several of them into something that looks like a real piece of an expressive face. A bridge sentence before the code: this example draws one open eye as a full circle, redraws its top half in the background color to simulate a drooping eyelid, and adds a slanted triangle eyebrow above it — three techniques from this chapter working together.

```python
from array import array

BLACK = 0
WHITE = 1

TOP_HALF = 1 + 2       # upper right + upper left
FULL = 1 + 2 + 4 + 8   # all four quadrants

fb.fill(BLACK)                                        # 1. background first

# 2. open eye: a full white circle
fb.ellipse(40, 30, 10, 10, WHITE, True, FULL)

# 3. sleepy eyelid: redraw the top half in the background color
fb.ellipse(40, 30, 10, 10, BLACK, True, TOP_HALF)

# 4. angled eyebrow: a slanted triangle above the eye
eyebrow_points = array('B', [30, 8, 50, 4, 50, 10])
fb.poly(0, 0, eyebrow_points, WHITE, True)

fb.show()                                             # 5. push the buffer to the screen
```

Four different techniques from this chapter — a full ellipse, a quadrant-masked ellipse, a point array, and a `fb.poly()` triangle — combine into one small, recognizably expressive shape: a tired-looking eye with a lowered brow. Chapter 9 builds full faces out of exactly this kind of combination, applied to two eyes, two eyebrows, and a mouth at once.

## Chapter Summary

You now know the two curved-and-angled drawing methods behind nearly every expressive shape in this book, and how to combine them deliberately.

- A circle is simply the special case of an ellipse where `xradius` equals `yradius`; the ellipse method `fb.ellipse(x, y, xradius, yradius, color)` draws either shape from a center point.
- The ellipse radius parameter — `xradius` and `yradius` — controls width and height independently, producing wide, tall, or round shapes from the same method.
- Filled versus outlined shape works the same way on `fb.ellipse()`, `fb.rect()`, and `fb.poly()`: a final `True` argument fills the shape solid instead of drawing just its border.
- The quadrant fill code is a bitmask argument (1 = upper right, 2 = upper left, 4 = lower left, 8 = lower right) that restricts an ellipse to just the quadrants you add together — the exact mechanism behind a closed eyelid or a smiling mouth curve.
- Anti-aliasing limitation means curved edges on these displays always show some blockiness, since every pixel is fully on or fully off with no smoothing — that is expected, not a bug.
- The poly method `fb.poly(x, y, coords, color, fill)` draws any shape from a point array — a flat, alternating x, y list, typically built with the `array` module — where each pair is one polygon vertex.
- A closed polygon path means `fb.poly()` automatically connects the last vertex back to the first, so you never repeat the starting coordinate.
- A convex polygon has every vertex pointing outward; a concave polygon has at least one vertex denting inward — most eyebrow and mouth shapes you design will be convex.
- A triangle eyebrow shape, built from just three vertices, expresses far more emotion through its slant than a straight rectangle ever could.
- Rounded rectangle approximation combines `fb.rect()` with small corner `fb.ellipse()` circles, and approximating curves with lines uses `fb.poly()` with many points to trace a curve that a regular ellipse cannot produce on its own.

!!! mascot-celebration "You Can Draw Every Curve and Angle a Face Needs"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Look back at that final example — a real eye, a real drooping eyelid, and a real slanted eyebrow, built from two methods and a handful of numbers. That is the superpower this chapter promised: `ellipse()` and `poly()` together can draw almost any expressive shape a robot's face will ever need. Chapter 8 pauses to look at where these two methods came from, and Chapter 9 puts them to work building a complete face.

??? question "Self-Check: You want to draw only the left half of an eye ellipse — both the upper-left and lower-left quadrants. What mask value do you pass as the quadrant fill code, and why? — Click to reveal"
    The upper-left quadrant has a bit value of 2 and the lower-left quadrant has a bit value of 4, so the correct mask is 2 + 4 = 6. Passing `fb.ellipse(x, y, xradius, yradius, WHITE, True, 6)` draws only those two left-side quadrants, leaving the upper-right (1) and lower-right (8) quadrants blank. A common mistake is guessing 1 + 4 or 2 + 8 by picturing "left" incorrectly — always check each quadrant's bit value against its actual screen position rather than guessing from memory.

[See Annotated References](./references.md)
