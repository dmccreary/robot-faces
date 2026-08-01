---
title: Quiz - Ellipse & Polygon Drawing
description: Ten multiple-choice questions covering the ellipse method, quadrant fill codes, radii, point arrays, polygon vertices, convex and concave shapes, and curve approximation.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Ellipse & Polygon Drawing

Test your understanding of the two methods — `ellipse()` and `poly()` — that draw nearly every curved and angled feature on a robot's face.

---

#### 1. Why does FrameBuf have no separate method for drawing a circle?

<div class="upper-alpha" markdown>
1. Because a circle is simply an ellipse whose `xradius` and `yradius` are equal
2. Because circles must be built from many small `fb.poly()` segments instead
3. Because circles cannot be drawn on a rectangular display
4. Because `fb.rect()` with rounded corners already produces a circle
</div>

??? question "Show Answer"
    The correct answer is **A**. An ellipse is controlled by two independent radii, one for width and one for height, and it becomes a perfectly round circle whenever those two values match. A single method therefore covers wide ovals, tall ovals, and circles — which is why `fb.ellipse(108, 40, 10, 10, WHITE)` draws a circle with no special syntax.

    **Concept Tested:** Circle As Special Ellipse

    **See:** [A Circle Is Just a Special Ellipse](index.md#a-circle-is-just-a-special-ellipse)

---

#### 2. You want to draw only the left half of an eye — the upper-left and lower-left quadrants. What quadrant fill code do you pass?

<div class="upper-alpha" markdown>
1. 3
2. 9
3. 12
4. 6
</div>

??? question "Show Answer"
    The correct answer is **D**. Upper left has bit value 2 and lower left has bit value 4, so the mask is 2 + 4 = 6. Option A (3) is the top half, option C (12) is the bottom half, and option B (9) is the right side. Because the bit values are tied to fixed screen quadrants, always check each value against its actual position rather than guessing which numbers mean "left."

    **Concept Tested:** Quadrant Fill Code

    **See:** [The Real Trick: Quadrant Fill Code](index.md#the-real-trick-quadrant-fill-code)

---

#### 3. How does `fb.ellipse()` interpret its first two arguments, compared with `fb.rect()`?

<div class="upper-alpha" markdown>
1. Both treat them as the top-left corner of the shape
2. `fb.ellipse()` treats them as the shape's center; `fb.rect()` treats them as its top-left corner
3. `fb.ellipse()` treats them as the top-left corner; `fb.rect()` treats them as its center
4. Both treat them as the center of the shape
</div>

??? question "Show Answer"
    The correct answer is **B**. An ellipse is positioned by its center point, while a rectangle is positioned by its top-left corner. The difference makes sense in practice: eyes and pupils are naturally described by where their middle sits, since a curved shape has no meaningful corner to measure from.

    **Concept Tested:** Ellipse Method

    **See:** [Drawing Curves: The Ellipse Method](index.md#drawing-curves-the-ellipse-method)

---

#### 4. A student's curved eyebrow looks jagged and staircase-like along its edge. What should they do?

<div class="upper-alpha" markdown>
1. Increase both radii so the curve has more pixels to work with
2. Redraw the curve with `fb.poly()`, which produces smooth edges
3. Nothing — every pixel is fully on or off, so some blockiness is expected at this resolution
4. Enable the anti-aliasing argument in the `fb.ellipse()` call
</div>

??? question "Show Answer"
    The correct answer is **C**. The anti-aliasing limitation means these frame buffers cannot blend a pixel partway between two colors to soften an edge. Blockiness is how the hardware works, not a bug in the code, and there is no anti-aliasing argument to enable. Viewed from conversational distance — where a person would actually stand — the curve reads as smooth anyway.

    **Concept Tested:** Anti-Aliasing Limitation

    **See:** [Why Curves Look a Little Blocky](index.md#why-curves-look-a-little-blocky-anti-aliasing-limitation)

---

#### 5. Which quadrant fill code produces a smiling mouth curve — the bottom half of a wide, flat ellipse?

<div class="upper-alpha" markdown>
1. 12
2. 3
3. 15
4. 5
</div>

??? question "Show Answer"
    The correct answer is **A**. The bottom half combines lower left (4) and lower right (8), giving 12. Option B (3) is the top half, which would read as a frown or a drooping eyelid instead, and option C (15) is the full ellipse drawn by default when the mask is omitted entirely.

    **Concept Tested:** Quadrant Fill Code

    **See:** [The Real Trick: Quadrant Fill Code](index.md#the-real-trick-quadrant-fill-code)

---

#### 6. What is a point array?

<div class="upper-alpha" markdown>
1. A dictionary mapping vertex names to their coordinates
2. A list of (x, y) tuples, one per corner of a polygon
3. A flat array of alternating x and y values describing every corner of a polygon in order
4. An array holding one entry per pixel the polygon will light up
</div>

??? question "Show Answer"
    The correct answer is **C**. `fb.poly()` expects all coordinates packed into one flat sequence — x1, y1, x2, y2, x3, y3 — not separate pairs. MicroPython builds these with `array('B', [...])`, where `'B'` stores each number as an unsigned byte from 0 to 255, which is ample for screen coordinates and far more memory-efficient than a general-purpose list.

    **Concept Tested:** Point Array

    **See:** [Points in a List: The Point Array](index.md#points-in-a-list-the-point-array)

---

#### 7. A triangle's point array lists three vertices. Why does the drawn shape still show three connected edges?

<div class="upper-alpha" markdown>
1. Because `fb.poly()` silently adds a fourth vertex at the shape's center
2. Because the `fill=True` argument closes any gap in the outline
3. Because the array module repeats the first coordinate pair automatically
4. Because `fb.poly()` always draws a closing line from the last vertex back to the first
</div>

??? question "Show Answer"
    The correct answer is **D**. The closed polygon path behavior means you never repeat the starting coordinate at the end of the array. A hexagon needs only six vertex pairs, not seven, even though the finished shape has six visible edges — which saves both typing and memory.

    **Concept Tested:** Closed Polygon Path

    **See:** [Never Repeat the Start: Closed Polygon Path](index.md#never-repeat-the-start-closed-polygon-path)

---

#### 8. Why does a triangle eyebrow express emotion more effectively than the rectangle eyebrow from Chapter 6?

<div class="upper-alpha" markdown>
1. A triangle uses fewer drawing calls, so it can be redrawn more often
2. A triangle can slant, so reordering just three vertices changes the eyebrow's emotional read
3. A triangle is a concave polygon, and concave shapes read as more dynamic
4. A triangle can be filled while a rectangle can only be outlined
</div>

??? question "Show Answer"
    The correct answer is **B**. A flat rectangular bar communicates "eyebrow" but stays neutral. Because a triangle's three vertices can be arranged to slant sharply inward or outward, the same method with a different point array turns a calm brow into a furrowed, angry one. Both shapes can be filled, and a triangle is convex, which rules out options C and D.

    **Concept Tested:** Triangle Eyebrow Shape

    **See:** [A Concrete Example: Triangle Eyebrow Shape](index.md#a-concrete-example-triangle-eyebrow-shape)

---

#### 9. When should a designer reach for `fb.poly()` with many closely spaced vertices instead of `fb.ellipse()`?

<div class="upper-alpha" markdown>
1. Whenever a shape needs to be filled rather than outlined
2. Whenever a shape must be drawn faster than an ellipse allows
3. When the design calls for an irregular curve that a regular oval cannot produce
4. When the shape must stay entirely within one quadrant of the screen
</div>

??? question "Show Answer"
    The correct answer is **C**. `fb.ellipse()` is fast and simple, but it only ever draws a regular oval. Approximating curves with lines — computing many points along an arc and packing them into a point array — takes over exactly where a regular ellipse cannot reach, such as an eyebrow arched into a specific irregular sweep. Many small segments are visually indistinguishable from a true curve at this resolution.

    **Concept Tested:** Approximating Curves With Lines

    **See:** [Approximating Curves With Lines](index.md#approximating-curves-with-lines)

---

#### 10. What is the effect of these two consecutive calls: `fb.ellipse(40, 30, 10, 10, WHITE, True, 15)` followed by `fb.ellipse(40, 30, 10, 10, BLACK, True, 3)`?

<div class="upper-alpha" markdown>
1. A circle whose top half is erased, producing a drooping, half-closed eye
2. A circle whose bottom half is erased, producing a wide, startled eye
3. Two overlapping circles, one white and one black, side by side
4. Nothing visible, because the second call erases the entire first circle
</div>

??? question "Show Answer"
    The correct answer is **A**. The first call draws a full white circle (mask 15). The second redraws the same circle in the background color with mask 3 — upper right plus upper left — erasing only the top half. Because later draw calls paint over earlier ones, the result is a lowered eyelid. Mask 3 covers just two of four quadrants, which rules out option D.

    **Concept Tested:** Quadrant Fill Code

    **See:** [Putting It Together: An Eye, an Eyelid, and an Eyebrow](index.md#putting-it-together-an-eye-an-eyelid-and-an-eyebrow)
