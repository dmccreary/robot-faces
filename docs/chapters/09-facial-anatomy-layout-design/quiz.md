---
title: Quiz - Facial Anatomy & Layout Design
description: Ten multiple-choice questions covering face layout grids, proportion, symmetry, eye and eyebrow parameters, mouth curvature, feature independence, and the draw_face() function.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Facial Anatomy & Layout Design

Test your understanding of how a face decomposes into independently parameterized parts, and how one `draw_face()` function assembles them all.

---

#### 1. What does facial symmetry let a face designer avoid doing?

<div class="upper-alpha" markdown>
1. Drawing eyebrows and a mouth in the same program
2. Using the quadrant fill code for eyelids
3. Working out the right eye's position as a separate problem from the left eye's
4. Storing face parameters in a dictionary
</div>

??? question "Show Answer"
    The correct answer is **C**. Because most facial features mirror around a vertical centerline, you compute one side's offset from center and flip its sign for the other. One calculation, reflected, gives a balanced face for half the thinking. Symmetry is a default a neutral face follows, not a law — a wink or a single raised eyebrow deliberately breaks it.

    **Concept Tested:** Facial Symmetry

    **See:** [Mirror Image: Facial Symmetry](index.md#mirror-image-facial-symmetry)

---

#### 2. What is a face state data structure?

<div class="upper-alpha" markdown>
1. A dictionary bundling every current face parameter into one object representing a complete expression
2. The frame buffer holding the currently displayed face image
3. A list of every drawing method `draw_face()` will call, in order
4. A record of which expressions the robot has shown most recently
</div>

??? question "Show Answer"
    The correct answer is **A**. The face state dictionary is a complete snapshot of one expression, frozen as data — keys like `eye_size`, `eyebrow_angle`, and `mouth_curvature` paired with plain numbers. Change one value and you have described a different emotion without touching any drawing code. The dictionary is the expression; the drawing functions just turn it into pixels.

    **Concept Tested:** Face State Data Structure

    **See:** [Bundling the Numbers: Face State Data Structure](index.md#bundling-the-numbers-face-state-data-structure)

---

#### 3. Using `mirror_x(x, center_x)`, which returns `center_x + (center_x - x)`, what is the right eye's x-position if the left eye sits at x = 44 and the centerline is at x = 64?

<div class="upper-alpha" markdown>
1. 20
2. 108
3. 64
4. 84
</div>

??? question "Show Answer"
    The correct answer is **D**. The left eye sits 20 pixels left of center (64 − 44 = 20), so the right eye sits 20 pixels right of center: 64 + 20 = 84. Option A is the distance from center rather than a coordinate, and option B would place the eye 44 pixels past center, doubling the offset by mistake.

    **Concept Tested:** Facial Symmetry

    **See:** [Mirror Image: Facial Symmetry](index.md#mirror-image-facial-symmetry)

---

#### 4. How does a lowered eyelid get drawn without introducing any new drawing method?

<div class="upper-alpha" markdown>
1. By calling `fb.scroll()` to shift the eye downward behind the face outline
2. By redrawing the eye's top half in the background color using a quadrant mask
3. By reducing the eye's `yradius` until only a thin sliver remains
4. By blitting a pre-drawn eyelid sprite over the eye
</div>

??? question "Show Answer"
    The correct answer is **B**. Eyelid representation reuses Chapter 7's quadrant fill code directly: `fb.ellipse(x, y, eye_size, eye_size, background_color, True, TOP_HALF)` covers the upper two quadrants of an already-drawn eye. One extra call after `draw_eyes()` produces a half-closed, sleepy look — no new shape, no new method.

    **Concept Tested:** Eyelid Representation

    **See:** [Half-Closed and Sleepy: Eyelid Representation](index.md#half-closed-and-sleepy-eyelid-representation)

---

#### 5. A face built for the 128x64 OLED looks tiny and clustered in one corner of the 240x240 round display. What is the right fix?

<div class="upper-alpha" markdown>
1. Redraw every feature at twice its pixel size by hand
2. Move the origin to the center of the round display
3. Increase the frame buffer's bit depth to match the color display
4. Compute each parameter as a fraction of the display's width and height instead of a fixed pixel count
</div>

??? question "Show Answer"
    The correct answer is **D**. Feature scaling for screen size means writing `eye_size = height // 8` rather than `eye_size = 8`. Calling `default_face_state(128, 64)` then produces OLED-sized values and `default_face_state(240, 240)` produces proportionally larger ones from the identical function body — `draw_face()` itself never changes, only the width and height passed in.

    **Concept Tested:** Feature Scaling For Screen Size

    **See:** [Same Code, Every Screen](index.md#same-code-every-screen-feature-scaling-for-screen-size)

---

#### 6. Why is an `eyebrow_angle` parameter better than hardcoding the exact point array for an angry eyebrow?

<div class="upper-alpha" markdown>
1. A hardcoded array uses more memory than a computed one
2. `fb.poly()` rejects point arrays that were typed in by hand
3. A hardcoded array works once, but any variation or mirrored version must be recomputed from scratch by hand
4. A hardcoded array cannot be filled, only outlined
</div>

??? question "Show Answer"
    The correct answer is **C**. Typing in "the angry eyebrow" you want right now works exactly once. The moment you need a slightly less furrowed version, or the mirrored shape for a wink, you would redo the coordinates by hand. One parameter you can change with a single number is worth the extra few lines of setup every time.

    **Concept Tested:** Eyebrow Angle Parameter

    **See:** [Shaping a Mood: Eyebrow Shape and Eyebrow Angle Parameter](index.md#shaping-a-mood-eyebrow-shape-and-eyebrow-angle-parameter)

---

#### 7. In what order does `draw_face()` draw a face's features?

<div class="upper-alpha" markdown>
1. Smallest details first, then progressively larger shapes, then the background
2. Background, face outline, eyebrows, eyes, then pupils and mouth
3. Whatever order the keys appear in the face state dictionary
4. Eyes first, since they carry the most emotional weight
</div>

??? question "Show Answer"
    The correct answer is **B**. Largest and farthest-back shapes come first; smallest and most detailed shapes come last. This is not arbitrary — it is the same draw call order optimization Chapter 6 taught, now applied to a full face, so no feature is buried under something drawn after it and overdraw stays low.

    **Concept Tested:** Draw Face Function

    **See:** [Putting Every Piece Together: The Draw Face Function](index.md#putting-every-piece-together-the-draw-face-function)

---

#### 8. What does a `mouth_curvature` of 0 produce, given that curvature becomes the mouth ellipse's `yradius`?

<div class="upper-alpha" markdown>
1. A nearly flat line, reading as a calm, neutral mouth
2. A deep frown, since 0 counts as negative curvature
3. An error, because an ellipse radius cannot be zero
4. A perfectly round mouth, since both radii would then match
</div>

??? question "Show Answer"
    The correct answer is **A**. With `yradius` at 0, the bottom-half curve flattens into something very close to the straight `fb.hline()` mouth from Chapter 6 — without needing a separate function or method. That single special case is why one `draw_mouth()` covers smiles, frowns, and neutral expressions alike.

    **Concept Tested:** Mouth Curvature Parameter

    **See:** [Curving a Mouth](index.md#curving-a-mouth-mouth-shape-mouth-curvature-parameter-and-bottom-half-mouth-curve)

---

#### 9. What practical benefit does feature independence give a face-drawing program?

<div class="upper-alpha" markdown>
1. It guarantees every feature stays within the display's bounding box
2. It reduces the total memory the frame buffer needs
3. One feature can be redesigned, tested, or replaced without touching any other feature's code
4. It removes the need to call `fb.show()` after drawing
</div>

??? question "Show Answer"
    The correct answer is **C**. Because `draw_eyebrow()` knows nothing about how `draw_mouth()` computes its curve, each can be debugged on its own and swapped out freely. It also means new features — blush marks in Chapter 11, blinking in Chapter 12 — arrive as one new function rather than edits scattered across every existing one.

    **Concept Tested:** Feature Independence

    **See:** [A Design Principle, Not Just a Mechanic: Feature Independence](index.md#a-design-principle-not-just-a-mechanic-feature-independence)

---

#### 10. Why are a nose and cheeks treated as optional on most faces in this book?

<div class="upper-alpha" markdown>
1. They cannot be drawn with `fb.ellipse()` or `fb.poly()`
2. They consume too much frame buffer memory to redraw each frame
3. They break facial symmetry and so complicate the mirroring math
4. Research shows eyes, eyebrows, and a mouth carry almost all of a face's readable emotion
</div>

??? question "Show Answer"
    The correct answer is **D**. A nose is usually a short `vline()` tick and cheeks a couple of pixels — enough to make a face look more face-shaped, but contributing little to which emotion a viewer reads. Chapters 10 and 11 explain the research behind that finding, which is why the emotional heavy lifting stays with the eyes, eyebrows, and mouth.

    **Concept Tested:** Nose Representation

    **See:** [Small But Not Unimportant](index.md#small-but-not-unimportant-nose-representation-and-cheek-representation)
