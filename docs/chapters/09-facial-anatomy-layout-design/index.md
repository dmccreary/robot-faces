---
title: Facial Anatomy & Layout Design
description: How to plan a face's proportions and symmetry, then combine ellipse(), poly(), and quadrant fill code into one reusable, parameterized draw_face() function.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 15:09:37
version: 0.09
---

# Facial Anatomy & Layout Design

## Summary

This chapter shows how to decompose a robot face into independently parameterized parts — face outline, eyes, pupils, eyebrows, mouth, and an optional nose — and combine them into a single, reusable draw_face() function driven by a face-state data structure. After completing this chapter, students will be able to write a parameterized draw_face() function and explain why independent, parameterized features make a face design easier to animate and extend.

## Concepts Covered

This chapter covers the following 23 concepts from the learning graph:

1. Face Outline
2. Eye Placement
3. Eye Size Parameter
4. Eye Spacing
5. Pupil
6. Pupil Size Parameter
7. Eyebrow Shape
8. Eyebrow Angle Parameter
9. Mouth Shape
10. Mouth Curvature Parameter
11. Bottom-Half Mouth Curve
12. Nose Representation
13. Facial Symmetry
14. Facial Proportion
15. Draw Face Function
16. Parameterized Face Design
17. Face Layout Grid
18. Feature Independence
19. Eyelid Representation
20. Cheek Representation
21. Face State Data Structure
22. Default Face Parameters
23. Feature Scaling For Screen Size

## Prerequisites

This chapter builds on concepts from:

- [Chapter 3: MicroPython Fundamentals I: Syntax, Data & Loops](../03-micropython-fundamentals-1/index.md)
- [Chapter 4: MicroPython Fundamentals II: Functions & the FrameBuf Module](../04-micropython-fundamentals-2/index.md)
- [Chapter 5: Display & Coordinate Systems](../05-display-coordinate-systems/index.md)
- [Chapter 7: Ellipse & Polygon Drawing](../07-ellipse-polygon-drawing/index.md)

---

## One Face, Built From Everything You Know

!!! mascot-welcome "Time to Build a Whole Face"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Six chapters of coordinates, frame buffers, and drawing calls have all been pointing at this moment. This chapter is where separate exercises stop being separate — eyes, eyebrows, and a mouth combine into one complete, reusable face.

Chapter 6 taught you rectangles and lines; Chapter 7 taught you `ellipse()` and `poly()`, including the quadrant fill code that draws just part of a curve. Every one of those tools still works exactly the way you learned it. What changes in this chapter is scale: instead of drawing one shape at a time, you will plan an entire face's layout, then write one function that draws every feature in the right place, at the right size, in the right order.

## The Boundary of a Face: Face Outline

Every drawing needs an edge to work inside, and a robot's face is no exception. The **face outline** is the overall shape or boundary that contains a face's features — the visible edge a viewer's eye reads as "this is where the face is."

What that boundary actually looks like depends heavily on which display a robot uses. On the round 240x240 color display Chapter 15 introduces later, the physical screen itself is already circular, so the face outline needs no code at all — the glass edge of the display does that job for free. On the rectangular 128x64 OLED, a face outline is more of a choice: you can leave it implicit, letting the rectangular screen edge simply be the boundary, or you can draw a soft outlined ellipse just inside the edges to suggest a rounder, friendlier head shape.

A bridge sentence before the code: this example draws an optional face outline on the OLED as a large outlined ellipse, leaving a small margin so the boundary never touches the physical screen edge.

```python
FACE_OUTLINE_MARGIN = 4  # pixels of breathing room from the screen edge

def draw_face_outline(fb, width, height, color):
    fb.ellipse(
        width // 2, height // 2,
        width // 2 - FACE_OUTLINE_MARGIN,
        height // 2 - FACE_OUTLINE_MARGIN,
        color
    )
```

Notice that `draw_face_outline()` never mentions the number 128 or 64 directly — it takes `width` and `height` as arguments instead. That habit matters far more than it looks like it does right now, and this whole chapter keeps coming back to it.

## Planning Before You Draw: Face Layout Grid

Jumping straight into coordinates for eyes, eyebrows, and a mouth invites a cluttered, lopsided result — features fighting each other for space instead of sitting where a viewer expects them. A **face layout grid** is a simple mental or literal grid drawn across the display's width and height, used to plan where each feature sits before any drawing code runs.

You do not need graph paper or special software to use a face layout grid. Sketching a rectangle on scratch paper, dividing it into rough horizontal bands — a margin at the top, a band for eyes, a band for a mouth, a margin at the bottom — is enough to catch layout mistakes before they become fifteen lines of `ellipse()` calls that need reworking.

Seeing a grid overlaid on a real face, with each band's purpose labeled, makes this planning habit far more concrete than a written description alone.

#### Diagram: Face Layout Grid Visualizer

<iframe src="../../sims/face-layout-grid-visualizer/main.html" width="100%" height="492px" scrolling="no"></iframe>

<details markdown="1">
<summary>Face Layout Grid Visualizer</summary>
Type: diagram
**sim-id:** face-layout-grid-visualizer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Understand (L2)
Bloom Taxonomy Verb: interpret, explain

Learning objective: Interpret how a face layout grid divides display height into margin, eye, nose/cheek, and mouth bands by hovering each band to reveal its proportion, and explain why a robot face adapts real face-proportion conventions rather than copying them exactly.

Canvas layout:
- Left 65% (responsive, roughly 420x300 at default width): a rectangle matching a 128x64 OLED's aspect ratio, overlaid with horizontal guideline bands, containing a simple neutral face drawn to fit the bands
- Right 35%: a legend listing each band, a display-shape toggle, and an infobox

Visual elements:
- Five horizontal bands stacked top to bottom: top margin, eye band, nose/cheek band, mouth band, bottom margin, each in a distinct pale color
- A simple neutral face (two eyes, a flat eyebrow each, a small flat mouth) drawn so each feature sits inside its intended band
- Percentage labels on each band showing what fraction of the total height it occupies
- An infobox that displays the hovered band's name, percentage, and a one-sentence note on why a robot face uses that proportion

Interactive controls:
- Hovering any band highlights it with a brighter border and updates the infobox with its name, height percentage, and purpose
- Toggle: "Display shape: 128x64 OLED / 240x240 Round" — re-renders the grid and face at the new aspect ratio, keeping each band's percentage of height the same
- "Show real-face reference lines" checkbox overlays a faint classic portrait guideline (eyes at the vertical midpoint) for comparison

Default parameters: 128x64 OLED shape selected, no band hovered, reference lines off

Behavior: hovering a band immediately highlights it and populates the infobox; toggling the display shape re-renders the entire grid and face at new pixel dimensions while keeping every band's percentage of height identical, visually demonstrating that proportions — not raw pixel counts — are what a layout grid actually plans.

Instructional Rationale: An Understand-level objective calling for interpretation and explanation is best served by a hover-to-reveal exploration with concrete percentage data at each stage, rather than a continuous animation, so the learner can pause on any single band and connect it to a specific, stated reason.

Responsive design: legend and infobox move below the canvas on viewports narrower than 600 pixels; the grid rectangle scales to fill its container's width while preserving the selected display's aspect ratio.

Implementation: p5.js for band rendering and the aspect-ratio toggle; band percentages are stored as constants shared between the two display-shape renders so the proportions never drift between toggles.
</details>

## How Much Room Each Feature Gets: Facial Proportion

A layout grid only helps once you know roughly how big each band should be, and that is exactly what **facial proportion** describes: roughly how much of a display's height and width gets reserved for eyes, for a mouth, and for margins around both. Classic portrait drawing has taught this kind of proportion for centuries — eyes near the vertical middle of a head, a nose and mouth filling out the lower half — and a robot face borrows that convention loosely, adapted for a much simpler cartoon-style design.

The table below is a starting point, not a rulebook — every emotion later chapters teach will nudge some of these numbers around.

| Feature | Classic Portrait Convention | Robot Face Adaptation |
|---|---|---|
| Eyes | roughly at the head's vertical midpoint | placed at or slightly above the display's vertical center |
| Nose and cheeks | occupy the middle third of the face | a thin, often minimal band between the eyes and the mouth |
| Mouth | sits in the lower third of the face | positioned in the lower third of the display's height |
| Margins | hairline and chin edges | a consistent top and bottom gap so no feature touches the screen edge |

Treat these as reasonable defaults to start from, not exact requirements — a robot face with eyes set slightly higher or lower than "textbook" proportion can still look completely natural, as long as the choice is deliberate rather than accidental.

## Mirror Image: Facial Symmetry

Look at almost any cartoon face, real face, or emoji, and one pattern jumps out immediately: the left and right sides mirror each other. **Facial symmetry** is the simplifying assumption that most facial features mirror left-right around a vertical centerline running down the middle of the display — useful because it means you only ever have to work out one side's math and reuse it for the other.

!!! mascot-thinking "Compute Once, Mirror Once"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here's the payoff of facial symmetry: you never have to think through where the right eye goes as its own separate problem. Work out the left eye's x-position relative to the center, then flip the sign of that distance for the right eye. One calculation, reflected — half the thinking, for a face that still looks correctly balanced.

A bridge sentence before the code: this example writes a small helper function that reflects any x-coordinate across a given centerline, then uses it to compute a right eye's position purely from a left eye's position.

```python
def mirror_x(x, center_x):
    """Reflect an x-coordinate across the face's vertical centerline."""
    return center_x + (center_x - x)

center_x = 64                 # horizontal center of a 128-pixel-wide OLED
left_eye_x = 44
right_eye_x = mirror_x(left_eye_x, center_x)   # 84
```

Facial symmetry is a simplification, not a law of nature — a wink, a raised single eyebrow, or a sideways glance all break it on purpose, and Chapter 11 explores exactly those asymmetrical expressions. For now, treat symmetry as the default behavior a neutral face follows, and something you deliberately override only when an expression calls for it.

Dragging one eye and watching its mirror image update automatically makes the reflection math behind facial symmetry click far faster than reading a formula.

#### Diagram: Facial Symmetry Mirror Demonstrator

<iframe src="../../sims/facial-symmetry-mirror-demonstrator/main.html" width="100%" height="507px" scrolling="no"></iframe>

<details markdown="1">
<summary>Facial Symmetry Mirror Demonstrator</summary>
Type: microsim
**sim-id:** facial-symmetry-mirror-demonstrator<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: demonstrate, apply

Learning objective: Demonstrate facial symmetry by adjusting one eye's x-position and size, and apply the mirroring rule to predict and verify how the opposite eye updates automatically around the vertical centerline.

Canvas layout:
- Left 65% (responsive, roughly 420x300 at default width): a face outline on a simulated frame buffer, with a dashed vertical centerline and two eyes
- Right 35%: sliders controlling the left eye only, a "Break symmetry" toggle, and a live code readout showing the `mirror_x()` calculation

Visual elements:
- A face outline with a dashed vertical centerline drawn down the middle
- A left eye the learner directly controls and a right eye that mirrors it
- A live readout: `mirror_x(44, 64) = 84`, updating as the left eye moves
- When "Break symmetry" is enabled, independent sliders appear for the right eye too, and the centerline label changes to "Symmetry off"

Interactive controls:
- Slider: left eye x-offset from center (range -40 to -5)
- Slider: left eye size (range 4-16)
- Toggle: "Break symmetry" (default off) — reveals independent right-eye sliders when on
- "Reset to Symmetric" button restores mirrored behavior and default positions

Default parameters: symmetry on, left eye x-offset -20 from center, eye size 8

Behavior: moving either left-eye slider immediately redraws both eyes, with the right eye's position and size recalculated through `mirror_x()` every frame; enabling "Break symmetry" freezes the right eye's current mirrored values into independent sliders so the learner can compare a symmetric face against a deliberately asymmetric one side by side.

Instructional Rationale: An Apply-level objective calling for direct parameter manipulation is best served by immediate, linked visual feedback, so the learner can form and test a prediction about the mirrored eye's position before the redraw confirms or corrects it.

Responsive design: control panel moves below the canvas on viewports narrower than 600 pixels; the face view scales to fill its container's width while preserving the OLED's 2:1 aspect ratio.

Implementation: p5.js for face rendering and the live `mirror_x()` calculation; the independent right-eye state used by "Break symmetry" is stored separately from the mirrored value so toggling back to symmetric mode can restore it exactly.
</details>

## Two Circles, Placed on Purpose: Eye Placement, Eye Size, and Eye Spacing

With a layout grid, a proportion plan, and a mirroring rule in place, actual eye-drawing code becomes almost simple. **Eye placement** means positioning both eyes using `ellipse()` from Chapter 7, with every value that controls where and how big they are exposed as a parameter, rather than typed in as fixed numbers.

Three specific parameters do the real work. The **eye size parameter** controls each eye's radius, exactly the `xradius`/`yradius` arguments Chapter 7 introduced for `fb.ellipse()`. The **eye spacing** parameter controls the horizontal gap between the two eyes' centers — a single number that, combined with facial symmetry, determines both eyes' x-positions at once.

A bridge sentence before the code: this function draws both eyes as filled circles, computing each eye's x-position from a shared center point and a spacing value instead of hardcoding two separate coordinates.

```python
def draw_eyes(fb, center_x, eye_y, eye_size, eye_spacing, color):
    left_x = center_x - eye_spacing // 2
    right_x = center_x + eye_spacing // 2
    fb.ellipse(left_x, eye_y, eye_size, eye_size, color, True)
    fb.ellipse(right_x, eye_y, eye_size, eye_size, color, True)
```

Every argument to `draw_eyes()` is a parameter, not a constant baked into the function body. Call `draw_eyes(fb, 64, 30, 8, 40, WHITE)` for a normal-looking pair of eyes, or call it again with `eye_spacing=20` for eyes set close together, and the exact same function body produces a completely different look.

## A Point of Focus: Pupil and Pupil Size Parameter

An eye without a pupil reads as a blank circle — friendly enough, but expressionless, with nothing for a viewer to focus on. A **pupil** is a smaller ellipse drawn centered, or deliberately offset, inside each eye, giving the face something concrete for a viewer's own eyes to land on. The **pupil size parameter** controls how large that inner ellipse is relative to the eye that contains it.

A bridge sentence before the code: this function draws both pupils, each offset from center by the same `gaze_offset_x` value, a small preview of the gaze-direction animation Chapter 12 builds later.

```python
def draw_pupils(fb, center_x, eye_y, eye_spacing, pupil_size, gaze_offset_x, color):
    left_x = center_x - eye_spacing // 2 + gaze_offset_x
    right_x = center_x + eye_spacing // 2 + gaze_offset_x
    fb.ellipse(left_x, eye_y, pupil_size, pupil_size, color, True)
    fb.ellipse(right_x, eye_y, pupil_size, pupil_size, color, True)
```

With `gaze_offset_x` left at 0, both pupils sit dead-center in their eyes, looking straight ahead — the setting every default, neutral face uses. Nudging that same parameter a few pixels left or right shifts both pupils together, since they share one offset value, previewing exactly how Chapter 12 will animate a robot's gaze without touching a single line of this drawing code.

## Half-Closed and Sleepy: Eyelid Representation

Not every expression needs a fully open, wide circle of an eye — a tired, relaxed, or content robot often needs an eye that looks partway shut. **Eyelid representation** reuses Chapter 7's quadrant fill code directly: redrawing the top portion of an eye's ellipse in the background color simulates a lowered lid without needing any new drawing method at all.

A bridge sentence before the code: this function draws a lowered eyelid by redrawing the top half of an already-drawn eye ellipse in the background color, the exact quadrant-mask technique Chapter 7's closing example used.

```python
TOP_HALF = 1 + 2   # upper-left + upper-right quadrants, from Chapter 7

def draw_eyelid(fb, x, y, eye_size, background_color):
    """Cover the top half of an eye with the background color to simulate a lowered lid."""
    fb.ellipse(x, y, eye_size, eye_size, background_color, True, TOP_HALF)
```

Calling `draw_eyelid()` right after `draw_eyes()` in a draw sequence produces a half-closed look with a single extra function call — no new shape, no new method, just the same quadrant mask idea from last chapter aimed at a new job.

## Shaping a Mood: Eyebrow Shape and Eyebrow Angle Parameter

Chapter 7's triangle eyebrow shape technique — a three-point `fb.poly()` triangle instead of a flat rectangle — is exactly what a robot face needs, because a slanted triangle reads as far more emotional than a straight bar ever could. **Eyebrow shape** is that triangle; the **eyebrow angle parameter** is the single number that controls how sharply it tilts, so the same drawing code can produce a neutral, raised, or furrowed brow just by changing one value.

A bridge sentence before the code: this function builds an eyebrow's point array from a width, a height, and an angle in degrees, tilting the triangle's outer points up or down based on that angle.

```python
import math
from array import array

def build_eyebrow_points(width, height, angle_degrees):
    """Return a 3-point array for one eyebrow triangle tilted by angle_degrees."""
    tilt = int(height * math.tan(math.radians(angle_degrees)))
    return array('B', [0, height - tilt, width, height + tilt, width, height])

def draw_eyebrow(fb, x, y, width, height, angle_degrees, color):
    points = build_eyebrow_points(width, height, angle_degrees)
    fb.poly(x, y, points, color, True)
```

Calling `draw_eyebrow(fb, 15, 10, 20, 6, 0, WHITE)` draws a flat, neutral brow. Changing only the fifth argument to `20` raises the outer edge for a curious, surprised look; changing it to `-20` drops the outer edge for a furrowed, serious one — the same function, the same point count, one parameter doing all the emotional work.

!!! mascot-warning "Hardcoded Numbers Can't Change Their Mind"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    It is tempting to skip the angle parameter entirely and just type in the exact point array for "the angry eyebrow" you want right now. That works — once. The moment you need a slightly less furrowed version, or want the same shape mirrored for a wink, you would have to redo that point array by hand from scratch. A parameter you can change with one number is worth the extra few lines of setup every single time.

## Curving a Mouth: Mouth Shape, Mouth Curvature Parameter, and Bottom-Half Mouth Curve

A mouth communicates as much as eyes and eyebrows combined, and it turns out to need nothing more than a shape you already know. **Mouth shape** on a robot face is almost always a **bottom-half mouth curve** — an ellipse drawn with only its bottom two quadrants filled, using the exact `BOTTOM_HALF` mask Chapter 7 introduced. A smile is a bottom-half ellipse bulging downward; a frown is that same technique inverted, using the top half instead, shifted lower on the screen.

The **mouth curvature parameter** controls how pronounced that curve is — in practice, the ellipse's `yradius` for the mouth. A small curvature value produces a nearly flat line, close to the neutral mouth Chapter 6 drew with `fb.hline()`; a large value produces a deep, obvious smile or frown.

A bridge sentence before the code: this function draws a smiling mouth when curvature is positive and a frowning mouth when curvature is negative, reusing one quadrant mask for the smile and its opposite for the frown.

```python
BOTTOM_HALF = 4 + 8   # lower-left + lower-right quadrants
TOP_HALF = 1 + 2       # upper-left + upper-right quadrants

def draw_mouth(fb, center_x, mouth_y, mouth_width, curvature, color):
    """Positive curvature draws a smile; negative curvature draws a frown."""
    if curvature >= 0:
        fb.ellipse(center_x, mouth_y, mouth_width // 2, curvature, color, True, BOTTOM_HALF)
    else:
        fb.ellipse(center_x, mouth_y + abs(curvature), mouth_width // 2, abs(curvature), color, True, TOP_HALF)
```

A `curvature` of `0` is a special case worth noticing: `yradius` becomes 0, so the "curve" flattens into something very close to a straight line — a calm, neutral mouth, without needing a separate function or a separate drawing method at all.

## Small But Not Unimportant: Nose Representation and Cheek Representation

Not every feature on a real face carries equal emotional weight, and a robot face can safely admit that. **Nose representation** is usually just a short vertical line, a single dot, or a tiny `poly()` shape — enough to suggest a nose exists without demanding much visual attention. **Cheek representation** is similarly minimal: a couple of small dots or short marks placed below the eyes, often used later for a blush effect rather than any structural purpose.

A bridge sentence before the code: this pair of small functions adds a simple tick-mark nose and two single-pixel cheek marks to a face, using the smallest tools this book has covered.

```python
def draw_nose(fb, center_x, nose_y, color):
    fb.vline(center_x, nose_y, 3, color)   # a short vertical tick is often all a nose needs

def draw_cheeks(fb, center_x, cheek_y, eye_spacing, color):
    fb.pixel(center_x - eye_spacing, cheek_y, color)
    fb.pixel(center_x + eye_spacing, cheek_y, color)
```

Both features are optional in nearly every face this book builds, and that is intentional. Chapters 10 and 11 explain why: research on emotional expression consistently shows eyes, eyebrows, and a mouth carry almost all of a face's readable emotion, while a nose and cheeks mostly just help a face look a little more face-shaped.

## Same Code, Every Screen: Feature Scaling For Screen Size

Every function built so far in this chapter takes a coordinate or a size as a plain number — 8 pixels for an eye, 40 pixels for spacing. Those numbers were chosen for a 128x64 OLED, and they will look completely wrong, tiny and clustered in one corner, on the much larger 240x240 color display Chapter 15 introduces. **Feature scaling for screen size** solves this by computing every parameter as a fraction of the display's actual width and height, instead of a fixed pixel count.

A bridge sentence before the code: this function builds a full set of face parameters from nothing but a target width and height, so the exact same face code produces a correctly proportioned result on either display.

```python
def default_state_for_display(width, height):
    return {
        "eye_size": height // 8,
        "eye_spacing": width // 3,
        "eye_y": height // 2 - height // 16,
        "pupil_size": height // 20,
        "mouth_width": width // 3,
        "mouth_y": int(height * 0.75),
    }
```

Call `default_state_for_display(128, 64)` and every value comes out sized for the OLED; call `default_state_for_display(240, 240)` and every value scales up proportionally for the round display, without a single number in the function itself needing to change. This is the same lesson `draw_face_outline()` demonstrated earlier in this chapter, just applied to every feature at once.

## A Design Principle, Not Just a Mechanic: Feature Independence

Every function this chapter has built so far shares one quiet property worth naming directly. **Feature independence** means each feature's drawing code should not depend on the internal details of any other feature's code — `draw_eyebrow()` does not need to know how `draw_mouth()` computes its curve, and `draw_eyes()` does not care what `draw_nose()` looks like.

This is a design principle, not just a technical requirement, and it pays off in concrete ways:

- A feature can be redesigned or replaced entirely — a new eyebrow shape, a different mouth style — without touching any other feature's function
- Individual features can be tested and debugged on their own, one `ellipse()` or `poly()` call at a time, instead of untangling one giant block of code
- New features can be added later — Chapter 11's blush marks, Chapter 12's animated blinking — by writing one new function, not editing every existing one

Feature independence is what makes the face state dictionary and the draw face function, both coming up next, actually manageable. A tangled web of features that all secretly depend on each other's internal variables would make both of those ideas far harder to build correctly.

## Bundling the Numbers: Face State Data Structure

Every function in this chapter takes several separate parameters — `eye_size`, `eye_spacing`, `eyebrow_angle`, `mouth_curvature`, and more. Passing each one as a separate function argument works for a single feature, but a whole face has a dozen or more of these values, and keeping them all straight as loose variables quickly gets unwieldy. A **face state data structure** solves this by bundling every current parameter value into one dictionary, the same dictionary data type Chapter 3 introduced for grouping related values together.

!!! mascot-thinking "One Dictionary, One Complete Expression"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here's a way to picture a face state dictionary: it is a complete snapshot of exactly one expression, frozen as data. Change even one value inside it — `mouth_curvature` from 6 to -6 — and you have described an entirely different emotion, without touching a single line of drawing code. The dictionary is the expression; the drawing functions just turn it into pixels.

A bridge sentence before the code: this dictionary bundles every parameter this chapter has introduced into one face state, ready to be handed to a single drawing function.

```python
face_state = {
    "eye_size": 8,
    "eye_spacing": 40,
    "eye_y": 30,
    "pupil_size": 3,
    "gaze_offset_x": 0,
    "eyebrow_angle": 0,
    "eyebrow_y": 18,
    "mouth_curvature": 6,
    "mouth_y": 46,
    "mouth_width": 30,
}
```

Every key in `face_state` matches a parameter name from a function earlier in this chapter, and every value is just a plain number. Nothing about this dictionary is complicated — its power comes entirely from being one single object that represents a whole expression at once.

## A Sensible Starting Point: Default Face Parameters

An empty face state dictionary, or one with wildly random values, is not a useful starting point for a new expression. **Default face parameters** are a sensible, neutral, starting set of values — calm eyes, level eyebrows, a relaxed mouth — the same concept Chapter 4 introduced when default parameter values gave a function a sensible fallback if a caller left an argument out.

A bridge sentence before the code: this function builds a default, neutral face state from just a target width and height, combining the scaling idea from earlier in this chapter with the default-values idea from Chapter 4.

```python
def default_face_state(width=128, height=64):
    return {
        "eye_size": height // 8,
        "eye_spacing": width // 3,
        "eye_y": height // 2 - height // 16,
        "pupil_size": height // 20,
        "gaze_offset_x": 0,
        "eyebrow_angle": 0,
        "eyebrow_y": height // 3,
        "mouth_curvature": height // 10,
        "mouth_y": int(height * 0.75),
        "mouth_width": width // 3,
    }
```

Because `width` and `height` themselves have default values — `128` and `64` — calling `default_face_state()` with no arguments at all still produces a complete, correctly scaled neutral face for the OLED. Every later chapter's expressions, from a small smile to a furrowed, worried brow, start from exactly this dictionary and then change just a few keys.

## The Big Idea: Parameterized Face Design

Step back from the individual functions for a moment, because there is one idea this whole chapter has been building toward. **Parameterized face design** is the principle that a face is not a fixed picture at all — it is a set of numbers, bundled into a face state dictionary, that a function turns into pixels on demand.

That reframing changes what "designing an expression" even means. Instead of drawing a new picture for every emotion a robot needs, you write the drawing code exactly once, then design an emotion by choosing a different set of numbers to feed it. A worried face and a happy face are not two different programs — they are the same `draw_face()` function, called with two different dictionaries.

This is the concrete, buildable version of the idea that runs through this entire book: two eyes, two eyebrows, and a mouth, controlled by nothing but numbers, are enough to make a robot's face say something real to the person looking at it.

## Putting Every Piece Together: The Draw Face Function

!!! mascot-encourage "This Function Is Big Because It's Doing a Lot"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    The function coming up next is longer than anything earlier in this book, and that is completely expected — it is combining nine chapters' worth of ideas into one place. You do not need to memorize it. Read it feature by feature, in the same order this chapter taught them, and each piece will already feel familiar.

Every idea in this chapter converges here. The **draw face function**, `draw_face(fb, state)`, reads a face-state dictionary and calls each feature's drawing code in the correct order — background first, large shapes next, smallest details last, exactly the draw call order optimization Chapter 6 taught.

A bridge sentence before the code: this function draws one complete neutral face, reading every parameter from a face-state dictionary and calling `ellipse()`, `poly()`, and the quadrant fill code in a deliberate background-to-foreground order.

```python
BLACK = 0
WHITE = 1
TOP_HALF = 1 + 2
BOTTOM_HALF = 4 + 8

def draw_face(fb, state, width=128, height=64):
    """Read a face-state dictionary and draw one complete face, feature by feature."""
    center_x = width // 2

    fb.fill(BLACK)                                                       # 1. background first

    fb.ellipse(center_x, height // 2, width // 2 - 4, height // 2 - 4, WHITE)   # 2. face outline

    # 3. eyebrows, mirrored around the centerline
    left_eyebrow_x = center_x - state["eye_spacing"] // 2 - 6
    right_eyebrow_x = mirror_x(left_eyebrow_x + 12, center_x) - 12
    draw_eyebrow(fb, left_eyebrow_x, state["eyebrow_y"], 12, 4, state["eyebrow_angle"], WHITE)
    draw_eyebrow(fb, right_eyebrow_x, state["eyebrow_y"], 12, 4, -state["eyebrow_angle"], WHITE)

    # 4. eyes, larger shapes drawn before their own smaller details
    left_eye_x = center_x - state["eye_spacing"] // 2
    right_eye_x = center_x + state["eye_spacing"] // 2
    fb.ellipse(left_eye_x, state["eye_y"], state["eye_size"], state["eye_size"], WHITE, True)
    fb.ellipse(right_eye_x, state["eye_y"], state["eye_size"], state["eye_size"], WHITE, True)

    # 5. pupils, the smallest eye detail, drawn last within the eyes
    gaze = state["gaze_offset_x"]
    fb.ellipse(left_eye_x + gaze, state["eye_y"], state["pupil_size"], state["pupil_size"], BLACK, True)
    fb.ellipse(right_eye_x + gaze, state["eye_y"], state["pupil_size"], state["pupil_size"], BLACK, True)

    # 6. mouth, a bottom-half ellipse curve
    fb.ellipse(center_x, state["mouth_y"], state["mouth_width"] // 2, state["mouth_curvature"], WHITE, True, BOTTOM_HALF)

    fb.show()                                                             # 7. push the buffer to the screen


state = default_face_state()
draw_face(fb, state)
```

Read through that draw order one more time: background, face outline, eyebrows, eyes, pupils, mouth — largest and farthest-back shapes first, smallest and most detailed shapes last. That is not an arbitrary choice; it is the same overdraw-avoiding sequence Chapter 6 taught, now applied to a complete face instead of two shapes. Every helper function `draw_face()` calls — `mirror_x()`, `draw_eyebrow()`, `default_face_state()` — was built earlier in this chapter, each doing exactly one job and staying independent of the others.

Turning sliders on live parameters and watching this exact function redraw a face in real time is the fastest way to feel how much expressive range a handful of numbers actually holds.

#### Diagram: Face Parameter Slider Playground

<iframe src="../../sims/face-parameter-slider-playground/main.html" width="100%" height="547px" scrolling="no"></iframe>

<details markdown="1">
<summary>Face Parameter Slider Playground</summary>
Type: microsim
**sim-id:** face-parameter-slider-playground<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Create (L6)
Bloom Taxonomy Verb: construct, design

Learning objective: Construct a complete, original facial expression by designing values for the eye size, eye spacing, eyebrow angle, and mouth curvature parameters, observing how draw_face() turns that one set of numbers into a complete rendered face.

Canvas layout:
- Left 60% (responsive, roughly 420x320 at default width): a live-rendered face on a simulated frame buffer, redrawn every time a parameter changes
- Right 40%: sliders for each parameter, a live face_state dictionary readout, and "Randomize" and "Reset to Default" buttons

Visual elements:
- A complete face — outline, mirrored eyebrows, eyes, pupils, and a mouth — rendered using the same ellipse, poly, and quadrant-mask techniques taught in this chapter
- A live-updating code readout showing the current face_state dictionary as Python, e.g. `{"eye_size": 8, "eye_spacing": 40, "eyebrow_angle": 15, "mouth_curvature": -4, ...}`
- A label beneath the face suggesting what the current combination "reads as" (e.g. "looks surprised," "looks upset") based on simple rule-of-thumb ranges, purely as a playful hint, not a graded judgment

Interactive controls:
- Slider: eye size (4-16)
- Slider: eye spacing (20-60)
- Slider: eyebrow angle (-30 to 30 degrees)
- Slider: mouth curvature (-10 to 10)
- "Randomize" button sets all four sliders to random valid values at once
- "Reset to Default" button restores default_face_state() values

Default parameters: default_face_state() values loaded on first render (eye_size 8, eye_spacing 40, eyebrow_angle 0, mouth_curvature 6)

Behavior: moving any slider immediately redraws the entire face and updates the face_state dictionary readout; "Randomize" produces an instantly recognizable, often funny new expression from one click, reinforcing that a face is nothing more than this dictionary of numbers; "Reset to Default" returns every slider and the face to the neutral starting point.

Instructional Rationale: A Create-level objective requires the learner to actively assemble a novel expression from independent design choices, which live slider-driven rendering supports far better than viewing fixed examples, since every adjustment is both a design decision and immediate visual proof of parameterized face design in action.

Responsive design: control panel and dictionary readout move below the canvas on viewports narrower than 600 pixels; the face view scales to fill its container's width while preserving the OLED's 2:1 aspect ratio.

Implementation: p5.js implementing draw_face(), mirror_x(), and draw_eyebrow() as JavaScript equivalents of the exact functions taught in this chapter, so the rendered result matches what the MicroPython code would actually produce on hardware.
</details>

## Chapter Summary

You now know how to plan a face's layout and proportions, and how to combine every drawing tool from Chapters 6 and 7 into one complete, parameterized face.

- A face outline is the boundary containing a face's features — often free on a round display, optionally drawn as an outlined ellipse on a rectangular OLED.
- A face layout grid plans where features sit using simple horizontal bands across a display's height; facial proportion sets roughly how large each band should be, loosely adapted from classic portrait convention.
- Facial symmetry lets you compute one eye's position and mirror it for the other with a simple `mirror_x()` reflection, though expressions can deliberately break symmetry later.
- Eye placement, the eye size parameter, and eye spacing turn `ellipse()` calls into a reusable `draw_eyes()` function driven entirely by parameters, not fixed coordinates.
- A pupil is a smaller ellipse inside each eye; the pupil size parameter controls its size, and offsetting it with `gaze_offset_x` previews Chapter 12's gaze animation.
- Eyelid representation reuses Chapter 7's quadrant fill code directly, redrawing an eye's top half in the background color to simulate a lowered lid.
- Eyebrow shape uses Chapter 7's triangle `poly()` technique; the eyebrow angle parameter tilts that triangle so one function can draw a neutral, raised, or furrowed brow.
- Mouth shape is almost always a bottom-half mouth curve — a quadrant-masked ellipse; the mouth curvature parameter controls how deep that curve bulges, with a smile and frown built from the same technique inverted.
- Nose representation and cheek representation are small, optional marks that matter far less for emotional readability than eyes, eyebrows, and a mouth.
- Feature scaling for screen size computes every parameter as a fraction of display width and height, so one draw_face() works correctly on both the OLED and the round display; feature independence keeps each feature's code free of dependencies on any other feature's internals.
- A face state data structure bundles every current parameter into one dictionary; default face parameters give that dictionary a sensible, neutral starting point.
- Parameterized face design is the overall principle behind all of it: a face is not a fixed picture, but a set of numbers a function turns into pixels — and the draw face function, `draw_face(fb, state)`, is the concrete deliverable that makes that principle real.

!!! mascot-celebration "You Just Built a Complete, Reusable Face"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Look at what `draw_face()` really is: one function, reading one dictionary, producing a complete expression out of shapes you already knew how to draw. Change a handful of numbers and it becomes a different face entirely, without touching a single drawing call. Chapters 10 and 11 build directly on this foundation, turning real emotion theory into exactly the parameter values that belong inside that dictionary.

??? question "Self-Check: You want the exact same draw_face() code to produce a correctly proportioned face on both the 128x64 OLED and the 240x240 round display, without editing any pixel numbers by hand. Which concept from this chapter makes that possible, and how? — Click to reveal"
    Feature scaling for screen size makes this possible. Instead of hardcoding pixel values like `eye_size = 8`, every parameter in `default_face_state(width, height)` is computed as a fraction of the display's actual `width` and `height` — for example, `eye_size = height // 8`. Calling that function with `(128, 64)` produces values scaled for the OLED, and calling it with `(240, 240)` produces proportionally larger values for the round display, all from the exact same function body. Combined with feature independence, this means `draw_face()` itself never needs to change at all — only the width and height passed into it do.

[See Annotated References](./references.md)
