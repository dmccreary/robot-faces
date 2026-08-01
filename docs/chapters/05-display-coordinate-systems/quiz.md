---
title: Quiz - Display & Coordinate Systems
description: Ten multiple-choice questions covering pixels, the screen coordinate system, bit depth, frame buffer size math, byte alignment, circular display geometry, and the show method.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Display & Coordinate Systems

Test your understanding of how a screen's pixels map to (x, y) coordinates and to bytes in a frame buffer.

---

#### 1. Where is the origin, coordinate (0, 0), located on both displays used in this book?

<div class="upper-alpha" markdown>
1. At the exact center of the screen
2. In the upper-left corner
3. In the bottom-left corner, as on a math-class graph
4. In the upper-right corner
</div>

??? question "Show Answer"
    The correct answer is **B**. Nearly every computer display, including both displays in this book, places the origin in the upper-left corner. The convention dates from early displays that drew pixels row by row starting at the top left — the same order English text reads on a page. Option C describes the math-class coordinate plane, which uses a different convention.

    **Concept Tested:** Origin At Upper-Left

    **See:** [The Origin Sits in the Upper-Left Corner](index.md#the-origin-sits-in-the-upper-left-corner)

---

#### 2. On a screen coordinate system, what happens to the Y value as you move down the display?

<div class="upper-alpha" markdown>
1. It decreases, reaching zero at the bottom edge
2. It stays the same, since only X changes across a screen
3. It increases, reaching its largest value at the bottom row
4. It becomes negative below the vertical midpoint
</div>

??? question "Show Answer"
    The correct answer is **C**. Because the origin sits at the top-left, Y grows downward — the topmost row has the smallest Y and the bottommost row the largest. This reverses the habit learned in math class, where Y increases upward. If an eyebrow meant for the top of the screen appears near the bottom, a flipped Y value is the first thing to check.

    **Concept Tested:** Y Axis Direction

    **See:** [Reading a Screen Like a Grid](index.md#reading-a-screen-like-a-grid)

---

#### 3. How many bytes does a 128x64 frame buffer at 1 bit per pixel require?

<div class="upper-alpha" markdown>
1. 1,024 bytes
2. 8,192 bytes
3. 192 bytes
4. 115,200 bytes
</div>

??? question "Show Answer"
    The correct answer is **A**. Applying the formula width × height × bit depth ÷ 8 gives 128 × 64 × 1 ÷ 8 = 1,024 bytes. Option B is the raw pixel count (8,192), which would be the answer in bits rather than bytes, and option D is the 240x240 color display's much larger buffer.

    **Concept Tested:** Frame Buffer Size Calculation

    **See:** [Calculating a Frame Buffer's Size](index.md)

---

#### 4. Why do so many small monochrome displays use widths that are multiples of 8, such as 128 or 96?

<div class="upper-alpha" markdown>
1. Because SPI can only transmit data in groups of 8 pixels at a time
2. Because the RP2040 cannot address memory beyond 8-pixel boundaries
3. Because the human eye reads 8-pixel groupings as smoother curves
4. Because 8 monochrome pixels pack into exactly one byte, so no bits are wasted at the end of a row
</div>

??? question "Show Answer"
    The correct answer is **D**. A byte holds 8 bits, so in a 1-bit buffer, 8 pixels share one byte. Since 128 ÷ 8 = 16 exactly, every row fills whole bytes with nothing left over. A 100-pixel width would give 12.5 bytes per row, leaving 4 bits of the final byte unused on every single row.

    **Concept Tested:** Byte Alignment In Buffer

    **See:** [Packing Pixels into Bytes: Byte Alignment](index.md#packing-pixels-into-bytes-byte-alignment)

---

#### 5. What is the coordinate of the bottom-right pixel on the 128x64 OLED?

<div class="upper-alpha" markdown>
1. (128, 64)
2. (127, 63)
3. (64, 32)
4. (0, 0)
</div>

??? question "Show Answer"
    The correct answer is **B**. Because counting starts at 0, a 128-pixel-wide display has valid X values from 0 to 127, and a 64-pixel-tall display has valid Y values from 0 to 63. Option A is the classic off-by-one mistake — those coordinates fall one pixel past both edges. Option C is the screen's center point, and option D is the origin.

    **Concept Tested:** Display Resolution

    **See:** [Resolution and Shape: Comparing the Two Displays](index.md#resolution-and-shape-comparing-the-two-displays)

---

#### 6. What is a bounding box?

<div class="upper-alpha" markdown>
1. The smallest rectangle that completely encloses a shape
2. The border drawn around the outer edge of the whole display
3. The region of memory reserved for one row of pixels
4. The visible circular area of a round display
</div>

??? question "Show Answer"
    The correct answer is **A**. A bounding box is described either by its corner coordinates or by a starting corner plus a width and height. Sketching one for each eye, eyebrow, and mouth lets a designer check that features do not overlap and fit within the screen before writing any drawing code at all.

    **Concept Tested:** Bounding Box

    **See:** [Framing a Shape: The Bounding Box](index.md#framing-a-shape-the-bounding-box)

---

#### 7. A program calls `display.fill(0)` and `display.pixel(64, 32, 1)` but never calls `display.show()`. What does the physical screen show?

<div class="upper-alpha" markdown>
1. A single lit pixel at the screen's center
2. A completely blank screen
3. A flickering image as the buffer updates
4. Whatever it was displaying before this code ran
</div>

??? question "Show Answer"
    The correct answer is **D**. Drawing commands change only the in-memory frame buffer. The `.show()` method is what copies that buffer out over SPI to the physical display, and without it the driver chip keeps holding its previous image. This design is deliberate: it lets a program assemble a whole expression and reveal it in one flicker-free update.

    **Concept Tested:** Show Method

    **See:** [Nothing Happens Until You Call .show()](index.md)

---

#### 8. Roughly what portion of the 240x240 color display's square frame buffer is never physically visible, and why?

<div class="upper-alpha" markdown>
1. None of it — the buffer matches the visible glass exactly
2. About 50 percent, because the buffer stores two frames at once
3. About 21 percent, because the round glass forms a circle inscribed inside the square buffer
4. About 21 percent, because those bytes are reserved for the display driver's own use
</div>

??? question "Show Answer"
    The correct answer is **C**. The buffer is a true 240x240 square because that is the simplest shape to address with (x, y) coordinates, but the physical glass is a 240-pixel-diameter circle inside it. Corner pixels accept drawing commands without error yet never light up. That matters for layout: a bounding box reaching too near a corner may be drawing where nobody can see it.

    **Concept Tested:** Circular Display Geometry

    **See:** [A Circle Inside a Square](index.md#a-circle-inside-a-square-circular-display-geometry)

---

#### 9. The color display has about seven times as many pixels as the OLED, yet its frame buffer is roughly 112 times larger. What explains the gap?

<div class="upper-alpha" markdown>
1. The color display stores a backup copy of each frame for error correction
2. Bit depth: each color pixel uses 16 bits instead of the OLED's 1 bit
3. The circular geometry forces the buffer to reserve extra rows
4. Color displays require one byte of padding between every pair of pixels
</div>

??? question "Show Answer"
    The correct answer is **B**. Buffer size is width × height × bit depth ÷ 8, so the 16× jump in bit depth multiplies with the roughly 7× jump in pixel count to produce the 112× difference. This is why the OLED's buffer occupies under 1 percent of the RP2040's 264 KB of RAM while the color buffer takes roughly 43 percent of it.

    **Concept Tested:** Bit Depth

    **See:** [How Many Colors Can a Pixel Hold? Bit Depth](index.md#how-many-colors-can-a-pixel-hold-bit-depth)

---

#### 10. A robot shows a calm neutral face and holds it for a full minute. How much drawing work does the program do during that minute?

<div class="upper-alpha" markdown>
1. It must redraw and call `.show()` about 60 times per second to keep the image lit
2. It must call `.show()` once per second or the display goes blank
3. It must continuously stream pixel data over SPI to hold the image steady
4. Essentially none — the driver holds the last image sent until `.show()` is called again
</div>

??? question "Show Answer"
    The correct answer is **D**. The screen refresh cycle on both displays is event-driven rather than continuous, unlike a television or monitor. The driver chip stores the last image in its own memory and displays it indefinitely with no ongoing work from your program. Animation, covered in Chapter 12, is simply calling `.show()` repeatedly with a slightly different buffer each time.

    **Concept Tested:** Screen Refresh Cycle

    **See:** [Static Images, Not Video: The Screen Refresh Cycle](index.md#static-images-not-video-the-screen-refresh-cycle)
