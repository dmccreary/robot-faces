---
title: Quiz - Basic Drawing Primitives
description: Ten multiple-choice questions covering fill, pixel, line, rectangle, scroll, blit, transparency keys, text, draw order layering, and overdraw.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Basic Drawing Primitives

Test your understanding of the FrameBuf drawing methods that every eye, eyebrow, and mouth in this book is built from.

---

#### 1. What does `fb.fill(BLACK)` do?

<div class="upper-alpha" markdown>
1. Draws a filled rectangle covering the center of the screen
2. Immediately clears the physical display glass
3. Sets every pixel in the entire frame buffer to black in one call
4. Removes the frame buffer from memory so a new one can be created
</div>

??? question "Show Answer"
    The correct answer is **C**. The fill method sets every pixel in the buffer to one color at once, which is why almost every drawing routine begins with it — clearing last frame's shapes so old and new eyebrows do not smear together. Note that it changes memory only; the glass shows nothing new until `.show()` is called.

    **Concept Tested:** Fill Method

    **See:** [Clearing the Canvas: The Fill Method](index.md#clearing-the-canvas-the-fill-method)

---

#### 2. What is the difference between `fb.rect(10, 10, 20, 12, WHITE)` and `fb.rect(40, 10, 20, 12, WHITE, True)`?

<div class="upper-alpha" markdown>
1. The first draws only the outline; the final `True` in the second fills the rectangle solid
2. The first draws in memory; the second draws directly to the physical screen
3. The first uses screen coordinates; the second uses coordinates relative to the last shape
4. The first is clipped at the screen edge; the second is not
</div>

??? question "Show Answer"
    The correct answer is **A**. The optional final argument switches `fb.rect()` from an outline to a solid fill. It is easy to omit by accident, which silently turns a thick, readable eyebrow into a thin hollow box — worth a deliberate glance every time you write a filled shape.

    **Concept Tested:** Filled Rectangle Method

    **See:** [Rectangles: Outlines and Filled Shapes](index.md#rectangles-outlines-and-filled-shapes)

---

#### 3. What does `fb.hline(30, 50, 60, WHITE)` draw?

<div class="upper-alpha" markdown>
1. A line from (30, 50) to (60, 60)
2. A vertical line 60 pixels tall starting at (30, 50)
3. A rectangle 30 pixels wide and 50 pixels tall
4. A horizontal line 60 pixels wide starting at (30, 50) and extending right
</div>

??? question "Show Answer"
    The correct answer is **D**. The arguments to `hline()` are x, y, width, color — the third value is a length, not a second endpoint. Option A confuses it with `fb.line()`, which does take two endpoints. Because `hline()` only ever moves in one direction, MicroPython can draw it faster than the general-purpose line method.

    **Concept Tested:** Horizontal Line Method

    **See:** [Straight Lines the Fast Way](index.md#straight-lines-the-fast-way-horizontal-and-vertical-line-methods)

---

#### 4. What happens when part of a shape is drawn past the edge of the display?

<div class="upper-alpha" markdown>
1. The program raises an out-of-range error and stops
2. FrameBuf silently trims the off-screen portion and draws only what fits
3. The shape wraps around and reappears on the opposite edge
4. The whole shape is discarded, and nothing is drawn at all
</div>

??? question "Show Answer"
    The correct answer is **B**. Clipping at the screen edge means a rectangle reaching x = 150 on a 128-wide OLED simply stops drawing at x = 127, with no crash and no error. This makes experimenting with coordinate math much safer — but a clipped shape still will not look the way you intended, so treat clipping as a safety net rather than a design tool.

    **Concept Tested:** Clipping At Screen Edge

    **See:** [Safety Net: Clipping at the Screen Edge](index.md#safety-net-clipping-at-the-screen-edge)

---

#### 5. What is a sprite?

<div class="upper-alpha" markdown>
1. A drawing method that repeats a shape at evenly spaced intervals
2. A special color value reserved for transparency
3. A small pre-drawn image stored so it can be placed onto a frame buffer as a single unit
4. The rectangular region of the screen a single drawing call may touch
</div>

??? question "Show Answer"
    The correct answer is **C**. A sprite — a blinking-eye icon, a small heart, a battery glyph — is drawn once, stored as a bitmap in a `bytearray`, and wrapped in its own small FrameBuffer object. From then on it can be reused anywhere with a single fast call instead of being recomputed pixel by pixel every frame.

    **Concept Tested:** Sprite

    **See:** [Pre-Drawn Art: Sprites, Bitmaps, and Byte Arrays](index.md#pre-drawn-art-sprites-bitmaps-and-byte-arrays)

---

#### 6. You blit a round pupil sprite onto a patterned background and a faint square patch appears around the pupil. What went wrong?

<div class="upper-alpha" markdown>
1. The sprite's bytearray was too small for its declared width and height
2. The sprite was blitted before the background instead of after it
3. The sprite's coordinates placed it partly off the screen edge
4. The `fb.blit()` call omitted its transparent color key, so the whole square bounding box was copied
</div>

??? question "Show Answer"
    The correct answer is **D**. Without a fourth argument, `fb.blit()` copies every pixel in the source buffer, background included, so the sprite's square bounding box paints over what was already there. Adding the key — `fb.blit(pupil_sprite, x, y, BLACK)` — tells FrameBuf to skip every black source pixel, letting the existing pattern show through around the circle.

    **Concept Tested:** Transparent Color Key

    **See:** [Making Backgrounds Show Through](index.md#making-backgrounds-show-through-the-transparent-color-key)

---

#### 7. Why is blitting a stored sprite faster than redrawing the same shape with individual drawing calls each frame?

<div class="upper-alpha" markdown>
1. Because the sprite's pixel data is already computed, so blitting only copies it into place
2. Because blitting sends pixels straight to the display, bypassing the frame buffer
3. Because sprites are stored on the display driver chip rather than in the Pico's memory
4. Because blitting automatically skips any pixel that has not changed since the last frame
</div>

??? question "Show Answer"
    The correct answer is **A**. Drawing a shape from scratch means recalculating which pixels it covers every single time. A sprite does that work once and stores the result, so `fb.blit()` reduces the per-frame cost to a memory copy. That saving is exactly why sprites exist.

    **Concept Tested:** Blit Method

    **See:** [Copying Pixels Fast: The Blit Method](index.md#copying-pixels-fast-the-blit-method)

---

#### 8. A program draws a filled eye rectangle and then a face-outline rectangle over the same area, and part of the eye disappears. What is the fix?

<div class="upper-alpha" markdown>
1. Call `fb.show()` between the two rectangle calls
2. Draw the background and face outline first, then layer the eye on top
3. Use `fb.scroll()` to shift the eye out from under the outline
4. Add a `True` argument to the face outline so it fills instead of outlines
</div>

??? question "Show Answer"
    The correct answer is **B**. Draw order layering means each call paints directly over whatever is already in the buffer, so the last call wins. Drawing background and large shapes first, then smaller features on top, mirrors how an artist blocks in a background before adding foreground detail. Option D would make the problem worse by covering even more of the eye.

    **Concept Tested:** Draw Order Layering

    **See:** [Order Matters: Draw Order Layering and Overdraw](index.md#order-matters-draw-order-layering-and-overdraw)

---

#### 9. What is overdraw, and why does it matter on a microcontroller?

<div class="upper-alpha" markdown>
1. Drawing past the edge of the buffer, which wastes memory on invisible pixels
2. Drawing a shape larger than its bounding box, which produces visual artifacts
3. Drawing more shapes than the display driver can accept in one `.show()` call
4. Drawing pixels that a later call immediately covers, so the CPU time spent on them is wasted
</div>

??? question "Show Answer"
    The correct answer is **D**. A frame buffer does not know a pixel is about to be hidden — it does the work regardless. A little overdraw rarely matters, but it accumulates once a face redraws dozens of shapes every animation frame, which is why draw call order optimization puts the background first and the smallest details last.

    **Concept Tested:** Overdraw

    **See:** [Order Matters: Draw Order Layering and Overdraw](index.md#order-matters-draw-order-layering-and-overdraw)

---

#### 10. What is `fb.text()` best suited for in a robot-face program?

<div class="upper-alpha" markdown>
1. Drawing curved mouths, since its font includes smooth arc characters
2. Replacing eyebrow rectangles with typed dash and slash characters
3. Debug labels and status readouts a developer needs while building and testing
4. Rendering the entire face, since text draws faster than shape methods
</div>

??? question "Show Answer"
    The correct answer is **C**. The built-in font is a blocky 8x8-pixel grid per character, deliberately simple and a little chunky. That makes it excellent for a line like `fb.text("BATT 82%", 0, 0, WHITE)` during development, but a smile or a raised eyebrow should be built from lines, rectangles, and the curved shapes Chapter 7 introduces.

    **Concept Tested:** Text Method

    **See:** [Labeling Your Work: The Text Method](index.md#labeling-your-work-the-text-method)
