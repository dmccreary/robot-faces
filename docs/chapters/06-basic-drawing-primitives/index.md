---
title: Basic Drawing Primitives
description: The core FrameBuf drawing methods — fill, pixel, lines, rectangles, scroll, blit, and text — that every shape in this book is built from.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 14:22:42
version: 0.09
---

# Basic Drawing Primitives

## Summary

This chapter teaches the foundational FrameBuf drawing methods: fill, horizontal/vertical/general lines, rectangles (outlined and filled), blit (including transparency and palette mapping), and text. These primitives are the building blocks every later drawing technique in this book — ellipses, polygons, and full face layouts — is built from. After completing this chapter, students will be able to draw and combine basic shapes and sprites on either target display.

## Concepts Covered

This chapter covers the following 21 concepts from the learning graph:

1. Fill Method
2. Horizontal Line Method
3. Vertical Line Method
4. Line Method
5. Rectangle Method
6. Filled Rectangle Method
7. Scroll Method
8. Blit Method
9. Transparent Color Key
10. Blit Palette Mapping
11. Pixel Method
12. Drawing Color Value
13. Drawing Constants
14. Sprite
15. Bitmap
16. Unsigned Byte Array
17. Text Method
18. Draw Order Layering
19. Overdraw
20. Clipping At Screen Edge
21. Draw Call Order Optimization

## Prerequisites

This chapter builds on concepts from:

- [Chapter 3: MicroPython Fundamentals I: Syntax, Data & Loops](../03-micropython-fundamentals-1/index.md)
- [Chapter 5: Display & Coordinate Systems](../05-display-coordinate-systems/index.md)

---

## Your First Real Drawing Code

!!! mascot-welcome "Let's Actually Draw Something"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Every chapter so far has been building toward this moment. You know how coordinates work, you know what a frame buffer is, and now you get to put pixels on a screen. This chapter hands you the exact set of drawing methods every eye, eyebrow, and mouth in this book will use.

Chapter 5 explained how a frame buffer stores pixel state in memory and how the `.show()` method pushes that memory out to a physical screen. This chapter fills in the missing piece: the actual drawing methods that change what a frame buffer holds. Every example below assumes a variable named `fb`, an already-initialized FrameBuffer object exactly like the `display` object Chapter 5 created — you can call drawing methods directly on it and finish with `fb.show()` to make the result appear.

## Naming Colors: Drawing Constants and the Drawing Color Value

Every FrameBuf drawing method needs to know what color to use, and on the monochrome OLED that choice is simple. A **drawing color value** is the number a drawing method uses to decide what a pixel should look like once it is drawn. On a 1-bit monochrome display, only two drawing color values exist: `0`, meaning the pixel is off (black), and `1`, meaning the pixel is on (white).

Writing bare `0` and `1` throughout a program works, but it forces every reader to remember which number means what. **Drawing constants** solve this by giving those two values readable names, assigned once near the top of a program.

```python
BLACK = 0
WHITE = 1
```

From here forward, every example in this chapter uses `BLACK` and `WHITE` instead of raw `0` and `1`. Code that reads `fb.pixel(10, 10, WHITE)` explains itself; code that reads `fb.pixel(10, 10, 1)` makes a reader stop and think. This small habit pays off constantly once face-drawing code starts mixing many colors and shapes together in later chapters.

## The Pixel Method: One Dot at a Time

Every shape a frame buffer can draw is ultimately built from single dots, and MicroPython gives you a method that controls exactly one of them. The **pixel method**, called as `fb.pixel(x, y, color)`, sets the color of a single pixel at the given (x, y) coordinate — the most basic drawing primitive a frame buffer offers.

A bridge before the code: this example turns on one pixel dead center on the 128x64 OLED, using the coordinate system Chapter 5 taught.

```python
fb.pixel(64, 32, WHITE)
fb.show()
```

Nothing about `fb.pixel()` is complicated, but that simplicity is exactly the point — every method covered later in this chapter, from lines to rectangles to text, is really just many calls to something like `fb.pixel()` running automatically, one dot at a time, so you never have to write that loop yourself.

!!! mascot-thinking "Everything Is Built From Pixels"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Hold onto this idea for the rest of the chapter: `fb.line()`, `fb.rect()`, and even `fb.text()` are all just fast, pre-written ways of calling something equivalent to `fb.pixel()` many times in a row. Learning the pixel method first means every other method in this chapter is really just a shortcut you already understand.

## Clearing the Canvas: The Fill Method

Before drawing anything new, most robot-face programs need to erase whatever was drawn last frame — otherwise old eyebrows and new eyebrows would overlap into a smear. The **fill method**, called as `fb.fill(color)`, sets every single pixel in the entire frame buffer to the same color in one call.

A bridge before the code: this example clears the whole buffer to black, the way almost every drawing routine in this book starts.

```python
fb.fill(BLACK)
```

Calling `fb.fill(BLACK)` once at the start of every frame gives you a clean, predictable starting point, exactly the way erasing a whiteboard before drawing a new picture keeps old lines from bleeding into the new one. Most of the drawing code you write from Chapter 7 onward will begin with this exact line before anything else happens.

## Straight Lines the Fast Way: Horizontal and Vertical Line Methods

Many shapes on a robot's face — a flat eyebrow, the closed line of a resting mouth — are simply straight lines running directly across or down the screen. MicroPython gives these common cases their own optimized methods instead of making you use the general-purpose line drawer for everything.

The **horizontal line method**, called as `fb.hline(x, y, width, color)`, draws a straight line of pixels running sideways, starting at (x, y) and extending `width` pixels to the right. The **vertical line method**, called as `fb.vline(x, y, height, color)`, works the same way but draws downward, starting at (x, y) and extending `height` pixels.

A bridge before the code: this example draws one horizontal line for a simple flat mouth and one vertical line as a marker down the left edge of the screen.

```python
fb.hline(30, 50, 60, WHITE)   # a flat mouth, 60 pixels wide
fb.vline(5, 10, 40, WHITE)    # a vertical marker, 40 pixels tall
```

Because `fb.hline()` and `fb.vline()` only ever move in one direction, MicroPython can draw them faster internally than a method that has to check direction on every single pixel. That speed matters once a face redraws many lines every frame during an animation.

## Lines at Any Angle: The Line Method

A flat mouth is common, but an angry eyebrow tilted at a sharp angle or a smiling mouth's curve both need lines that run diagonally, not just sideways or straight down. The **line method**, called as `fb.line(x1, y1, x2, y2, color)`, draws a straight line between any two points on the screen, at any angle.

A bridge before the code: this example connects two corners of the screen with a single diagonal line.

```python
fb.line(0, 0, 100, 40, WHITE)
```

Under the hood, `fb.line()` uses an efficient pixel-stepping algorithm, conceptually similar to the classic Bresenham's line algorithm, that figures out which pixels best approximate a straight line between the two endpoints without needing any decimal math. You never have to understand that algorithm to use the method — just remember that any two coordinates on the screen can become a line with one call.

Now that you have four different ways to lay down straight lines — one pixel at a time, sideways, straight down, or at an angle — trying them out directly makes the differences click faster than reading about them.

#### Diagram: Pixel Drawing Sandbox

<iframe src="../../sims/pixel-drawing-sandbox/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Pixel Drawing Sandbox</summary>
Type: microsim
**sim-id:** pixel-drawing-sandbox<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: demonstrate, execute

Learning objective: Demonstrate the effect of `pixel()`, `hline()`, and `vline()` calls by drawing directly on a simulated frame buffer, and execute the correct tool choice for horizontal, vertical, and single-dot marks.

Canvas layout:
- Left 70% (responsive, roughly 450x300 at default width): a scaled-up 128x64 pixel grid representing the OLED frame buffer, drawn as small squares
- Right 30%: a tool selector, a live code readout, and a "Clear" button

Visual elements:
- A grid of squares, each square either black (off) or white (on), matching the monochrome OLED
- The currently selected tool highlighted in the tool selector
- A live-updating code readout showing the exact method call the last action generated, e.g. `fb.pixel(64, 32, WHITE)` or `fb.hline(10, 20, 45, WHITE)`
- A running list of the last five method calls made, scrollable

Interactive controls:
- Tool selector: "Pixel", "Horizontal Line", "Vertical Line"
- Clicking the grid with "Pixel" selected toggles that one pixel on or off and logs `fb.pixel(x, y, WHITE)`
- Clicking and dragging horizontally with "Horizontal Line" selected draws a line from the click point to the release point and logs the equivalent `fb.hline(x, y, width, WHITE)` call
- Clicking and dragging vertically with "Vertical Line" selected does the same for `fb.vline()`
- "Clear" button calls the fill-method equivalent, resetting the entire grid to black and logging `fb.fill(BLACK)`

Default parameters: "Pixel" tool selected, grid fully black, call log empty

Behavior: every click or drag immediately updates the grid and appends the equivalent FrameBuf method call to the code readout and the call history list, so the learner can connect a hand gesture directly to the exact line of MicroPython it represents.

Instructional Rationale: An Apply-level, direct-manipulation pattern is appropriate because the objective requires the learner to actively produce marks with each tool and see the resulting method call, building an accurate mental model of what each primitive does rather than reading a description of it.

Responsive design: the grid and control panel stack vertically below 600 pixels wide; the grid scales to fill its container's width while preserving the OLED's 2:1 aspect ratio.

Implementation: p5.js for the grid rendering, drag detection, and code-string generation; a 2D array tracks the on/off state of every simulated pixel.
</details>

## Rectangles: Outlines and Filled Shapes

Eyebrows, simple mouths, and status bars on a robot's face are often just rectangles, so FrameBuf gives you a method built specifically for that shape. The **rectangle method**, called as `fb.rect(x, y, width, height, color)`, draws only the outline of a rectangle — four straight lines forming a border, with the inside left untouched.

Many shapes on a robot's face, though, need to be solid rather than hollow — a thick, filled eyebrow reads far more clearly than a thin outlined one. The **filled rectangle method** uses that same `fb.rect()` call with one extra argument: `fb.rect(x, y, width, height, color, True)`, where the final `True` tells FrameBuf to fill the entire rectangle instead of just outlining it.

A bridge before the code: this example draws one outlined rectangle and one filled rectangle side by side so you can compare them directly.

```python
fb.rect(10, 10, 20, 12, WHITE)          # outline only
fb.rect(40, 10, 20, 12, WHITE, True)    # filled solid
```

That single `True` argument is easy to miss, so it is worth a deliberate glance every time you write a filled shape — leaving it off silently changes a solid eyebrow into a thin, hollow-looking box.

## Safety Net: Clipping at the Screen Edge

New programmers worry, reasonably, about what happens if a coordinate accidentally lands off the edge of the display — does the program crash? FrameBuf handles that situation gracefully. **Clipping at screen edge** describes how every FrameBuf drawing method automatically ignores or trims any part of a shape that falls outside the buffer's valid coordinate range, instead of raising an error. If a rectangle's corner math comes out slightly wrong and part of a shape would land at x = 140 on a 128-pixel-wide OLED, FrameBuf just quietly skips drawing that part — no crash, no error message. That safety net makes it much less risky to experiment with coordinate math while you are still learning.

A bridge before the code: this example deliberately draws a rectangle that extends past the OLED's right edge, to show that MicroPython simply clips it rather than failing.

```python
fb.rect(100, 20, 50, 10, WHITE)  # right edge would land at x=150, off a 128-wide screen
fb.show()
```

Running that code draws only the visible portion of the rectangle, from x = 100 up to the screen's actual edge at x = 127; the rest is silently discarded. Clipping is reassuring while you are experimenting, but it is not a substitute for correct math — a shape clipped at the edge still will not look the way you intended, so treat this as a safety net, not a design tool.

## Shifting Pixels: The Scroll Method

Sometimes a program needs to move everything already drawn in a frame buffer, rather than erasing it and redrawing from scratch. The **scroll method**, called as `fb.scroll(dx, dy)`, shifts every pixel already in the buffer by `dx` pixels horizontally and `dy` pixels vertically, without needing to know what shapes are currently drawn.

A bridge before the code: this example shifts the entire buffer's contents two pixels upward, the kind of call an animation might repeat every frame to make something appear to float.

```python
fb.scroll(0, -2)
```

Pixels that scroll past an edge simply disappear, and the space left behind is not automatically cleared — a scrolled buffer usually needs a fresh `fb.fill()` in the newly emptied area before it looks right. Chapter 12 builds full animations on exactly this method, so it is worth remembering that "moving" pixels on a frame buffer really means shifting existing memory, not redrawing shapes at new coordinates.

## Pre-Drawn Art: Sprites, Bitmaps, and Byte Arrays

Every shape so far in this chapter has been drawn live, one method call at a time, but robot-face code often reuses the exact same small image over and over — a blinking-eye icon, a tiny heart, a battery glyph. A **sprite** is a small, pre-drawn image, stored ready to be placed onto a frame buffer as a single unit instead of redrawn pixel by pixel every time it is needed.

A sprite has to be stored as data somewhere, and that data has a specific shape. A **bitmap** is pixel data stored as a raw sequence of bytes, where each byte (or group of bits within it) represents the color of one or more pixels — exactly the same idea behind the frame buffer itself, just usually much smaller. MicroPython represents a bitmap's raw bytes using an **unsigned byte array**, the `bytearray` data type Chapter 3 introduced, where every entry holds a whole number from 0 to 255 with no negative values possible.

A bridge before the code: this example builds a tiny 8x2-pixel sprite, two rows of solid pixels that could serve as a small eyebrow shape, and wraps it in its own FrameBuffer object.

```python
eyebrow_bitmap = bytearray([0b11111111, 0b11111111])
eyebrow_sprite = framebuf.FrameBuffer(eyebrow_bitmap, 8, 2, framebuf.MONO_HLSB)
```

`eyebrow_bitmap` is the raw unsigned byte array — two bytes, one per row, each holding eight `1` bits for eight lit pixels. Wrapping that bytearray in its own `framebuf.FrameBuffer(...)` object, exactly the way Chapter 4 first introduced that constructor, turns raw bytes into a drawable sprite with its own tiny coordinate system, ready to be placed onto a larger buffer.

## Copying Pixels Fast: The Blit Method

Once a sprite exists as its own small FrameBuffer, placing it onto a larger frame buffer needs a method built for copying pixels between buffers, not drawing shapes one at a time. The **blit method**, called as `fb.blit(source_fb, x, y)`, copies every pixel from a source frame buffer onto the destination buffer, positioned with its top-left corner at (x, y).

A bridge before the code: this example places the `eyebrow_sprite` built above onto the main display buffer, positioned above where a left eye will eventually go.

```python
fb.blit(eyebrow_sprite, 20, 15)
```

Blitting a sprite is dramatically faster than recalculating and redrawing its shape with individual `pixel()` or `rect()` calls every frame, because the pixel data is already fully computed — `fb.blit()` just copies it into place. This is exactly why sprites exist: draw a shape once, store it, then reuse it with a single fast call anywhere it is needed.

## Making Backgrounds Show Through: The Transparent Color Key

A plain `fb.blit()` call copies every pixel from a sprite, including its background — which is a problem the moment a sprite is not a perfect rectangle. Blitting a round pupil sprite with a square bounding box, for example, would paint over whatever was already drawn in that pupil's four corners. A **transparent color key** solves this: passing a fourth argument to `fb.blit()`, as in `fb.blit(source, x, y, key)`, tells FrameBuf to skip copying any source pixel that matches the `key` color, leaving whatever was already there untouched.

A bridge before the code: this example blits the same eyebrow sprite again, but treats `BLACK` as transparent so only the lit pixels actually get copied.

```python
fb.blit(eyebrow_sprite, 20, 15, BLACK)
```

With `BLACK` set as the color key, every pixel in `eyebrow_sprite` that is black gets skipped instead of overwriting the destination, so only the sprite's white pixels land on the buffer. This is the trick that lets a non-rectangular sprite — a circular pupil, a curved eyelid — blit over an existing background without leaving a visible box around it.

!!! mascot-warning "Forgetting the Color Key Leaves a Box"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A very common mistake: blitting a round or irregular sprite without a transparency key. The sprite's shape looks fine, but a faint rectangular patch appears around it wherever the background color didn't match — because every pixel in that bounding box got copied, background included. If a sprite looks like it has an invisible box around it, check whether you forgot the color-key argument.

Seeing a sprite blitted with and without a transparency key, side by side, makes this idea far more obvious than a written description alone.

#### Diagram: Blit Transparency Key Visualizer

<iframe src="../../sims/blit-transparency-key-visualizer/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Blit Transparency Key Visualizer</summary>
Type: microsim
**sim-id:** blit-transparency-key-visualizer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, examine

Learning objective: Differentiate a transparent blit from an opaque blit by examining how a circular sprite overlaps existing background content with and without a transparent color key.

Canvas layout:
- Left 65% (responsive, roughly 420x300 at default width): a simulated frame buffer already containing a striped or patterned background, with a draggable circular sprite (drawn inside a square bounding box) that can be moved on top of it
- Right 35%: a toggle for the transparency key, a legend, and a short readout of the current `fb.blit()` call

Visual elements:
- A background pattern of alternating teal and white stripes already "drawn" on the buffer before any blit happens
- A circular sprite (white circle inside a black square bounding box) that the learner can drag anywhere over the background
- When the transparency toggle is off, the sprite's full square bounding box is copied, visibly overwriting the striped background with a black square around the circle
- When the transparency toggle is on, only the circle's pixels are copied; the striped background remains visible around the circle, unbroken
- A live code readout showing either `fb.blit(sprite, x, y)` or `fb.blit(sprite, x, y, BLACK)` depending on the toggle state, with x and y updating as the sprite is dragged

Interactive controls:
- Toggle: "Transparent color key: Off / On" (default Off)
- Drag the sprite anywhere over the background to reposition it
- "Reset" button returns the sprite to its starting position and turns the toggle off

Default parameters: transparency toggle off, sprite positioned near the top-left corner of the background pattern

Behavior: dragging the sprite immediately redraws the buffer, showing the opaque square or the transparent circle depending on the toggle state; toggling transparency on or off instantly redraws the current sprite position under the new rule without requiring a fresh drag.

Instructional Rationale: An Analyze-level objective requires the learner to examine and differentiate two overlapping outcomes — opaque and transparent blitting — of the same underlying action, which direct side-by-side comparison through dragging and toggling supports better than a static before/after image pair.

Responsive design: control panel moves below the canvas on narrow viewports; the sprite remains draggable at every screen size using touch or mouse input.

Implementation: p5.js for the canvas, drag handling, and pixel-level compositing logic that checks each source pixel against the color key before drawing it onto the background layer.
</details>

## A Peek Ahead: Blit Palette Mapping

Blitting works cleanly when a sprite and its destination buffer share the same pixel format, but that is not always true — a sprite drawn for a monochrome buffer, for instance, does not automatically know how to become a specific RGB565 color on the color display. **Blit palette mapping** is an advanced `fb.blit()` feature that remaps colors from a source buffer's format into a destination buffer's format during the copy, using an extra palette argument.

This feature is genuinely useful once Chapter 15 introduces the color round display and its 16-bit RGB565 format, but it is worth flagging one detail now: blit palette mapping shipped in MicroPython version 1.17, not in every earlier release. Chapter 8 covers MicroPython's version history in full and explains why checking a feature's minimum version matters before relying on it in a project.

## Labeling Your Work: The Text Method

Every method so far draws geometric shapes, but sometimes the fastest way to communicate information on a display is simply to print words. The **text method**, called as `fb.text(string, x, y, color)`, draws a string of characters using a built-in, blocky 8x8-pixel font, starting with its top-left corner at (x, y).

A bridge before the code: this example writes a short debug label near the top of the screen, reporting a battery percentage while a program is being developed.

```python
fb.text("BATT 82%", 0, 0, WHITE)
```

The built-in font is deliberately simple and a little chunky, since it has to fit inside an 8x8 grid per character, so it reads best as a debugging or status tool rather than as part of a finished expression. A robot's smiling mouth or raised eyebrow should almost always be built from lines and rectangles, not text — save `fb.text()` for labels a developer needs to see while building and testing, not for the face itself.

## Order Matters: Draw Order Layering and Overdraw

Every method in this chapter draws onto the same shared frame buffer, and that has an important consequence: whatever gets drawn last is what actually ends up visible. **Draw order layering** describes how each drawing call paints directly over anything already in the buffer at those coordinates, so the sequence of calls in your code determines the final image just as much as the shapes themselves do.

A bridge before the code: this example deliberately draws a face's background rectangle after its eye, to show what goes wrong when draw order is backwards.

```python
fb.fill(BLACK)
fb.rect(50, 25, 8, 8, WHITE, True)   # draw the eye first
fb.rect(20, 10, 90, 45, WHITE)       # oops - background drawn second, covers the eye
```

Because the background rectangle in that second example was drawn after the eye, its outline paints directly across pixels the eye had already lit, and part of the eye disappears from view. Correct code draws a face's background first, then layers eyes, eyebrows, and a mouth on top of it — the same way an artist blocks in a background before adding foreground detail.

Layering shapes on top of each other is often unavoidable and completely fine, but it does have a cost worth naming. **Overdraw** is the waste of redrawing pixels that immediately get covered by something drawn afterward — CPU time and drawing calls spent on pixels the viewer will never actually see in the final image.

!!! mascot-thinking "Every Overwritten Pixel Was Still Work"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here's the part that's easy to miss: even a pixel that gets completely covered by something drawn afterward still cost time to draw the first time. A frame buffer doesn't know or care that a pixel is about to be hidden — it does the work regardless. On a fast microcontroller, a little overdraw rarely matters, but it adds up once a face redraws dozens of shapes every single animation frame.

## Drawing Smarter: Draw Call Order Optimization

Once you know that draw order determines the final image and that overdraw wastes work, the natural next step is choosing an order that minimizes both problems at once. **Draw call order optimization** is the practice of grouping and sequencing drawing calls deliberately — background first, then larger shapes, then the smallest details last — to reduce wasted overdraw and keep a program's frame rate high.

The table below summarizes the layering habit worth building into every face-drawing routine from here forward.

| Draw First | Draw Later | Why |
|---|---|---|
| Full-screen background fill | Eyes, eyebrows, mouth | Background must not cover features drawn after it |
| Large shapes (face outline) | Small shapes (pupils, highlights) | Large shapes drawn last would bury small detail underneath them |
| Static elements | Frequently changing elements | Keeps redraw cost concentrated on what actually needs to update |

This is not a strict rule enforced by MicroPython — nothing stops you from drawing in the wrong order, and clipping and layering will not throw an error either way. It is a habit worth building deliberately, because a face drawn in a sensible order is both correct and efficient, while a face drawn in a random order is at best lucky and at worst broken.

Stepping through a sequence of draw calls one at a time, watching exactly which pixels get covered and when, makes both layering and overdraw far easier to reason about than reading a rule.

#### Diagram: Draw Order and Overdraw Stepper

<iframe src="../../sims/draw-order-overdraw-stepper/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Draw Order and Overdraw Stepper</summary>
Type: microsim
**sim-id:** draw-order-overdraw-stepper<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: examine, differentiate

Learning objective: Examine a sequence of FrameBuf draw calls step by step to differentiate which pixels remain visible in the final image from which pixels were drawn and then overdrawn by a later call.

Canvas layout:
- Left 60%: a simulated frame buffer showing the cumulative drawing result after each step
- Right 40%: an ordered list of draw calls (a short code listing) with the current step highlighted, plus a running "wasted pixels" counter

Visual elements:
- A code listing of five to six FrameBuf calls, such as a background fill, a face outline rectangle, two eye rectangles, and a mouth line, each on its own numbered line
- The frame buffer view updates after each step, showing exactly what the buffer looks like at that point
- Pixels that were drawn in an earlier step and then overwritten by the current step flash briefly in coral before settling into their new color, visually marking overdraw
- A running counter: "Overdrawn pixels so far: N"

Interactive controls:
- "Step Forward" button applies the next draw call in the sequence
- "Step Back" button undoes the most recent draw call
- Toggle: "Reorder: Original / Optimized" — swaps between a version where the background is drawn last (causing heavy overdraw) and a version where it is drawn first (causing none)
- "Reset" button returns to an empty buffer and step 0

Default parameters: "Original" (unoptimized) order selected, step 0, empty buffer, overdraw counter at 0

Data Visibility Requirements:
  Stage 1: Show the empty buffer and the full list of upcoming draw calls
  Stage 2: Each step forward shows the exact call being applied, highlighted in the code listing
  Stage 3: Any pixel overwritten by that step flashes coral, and the overdraw counter increments by the number of overwritten pixels
  Stage 4: After the final step, compare the "Original" order's total overdraw count against the "Optimized" order's count using the same toggle

Interaction: Step-through with Step Forward/Step Back controls, not automatic animation, so the learner controls the pace of comparison

Instructional Rationale: The Analyze-level objective requires examining a sequence of individual actions and attributing specific pixels to "kept" versus "overdrawn" categories, which a controllable step-through with a visible overdraw counter supports far better than a single before/after image, since the learner can isolate exactly which call caused which overdraw.

Responsive design: code listing moves below the frame buffer view on narrow viewports; step controls remain reachable at every width.

Implementation: p5.js for the frame buffer rendering and step logic; each draw call is stored as a small function that records which pixels it touches, allowing the overdraw counter to compare each step's touched pixels against the buffer's prior state.
</details>

## Putting It Together: An Eyebrow and a Mouth

Every method in this chapter now has a name and a purpose, so it is worth combining a few of them into something that starts to look like part of a robot's face. A bridge before the code: this example clears the screen, draws one filled rectangle as a straight eyebrow, and draws one horizontal line as a simple neutral mouth, in a deliberately background-first order.

```python
BLACK = 0
WHITE = 1

fb.fill(BLACK)                          # 1. background first
fb.rect(20, 15, 24, 6, WHITE, True)     # 2. filled rectangle eyebrow
fb.hline(15, 45, 40, WHITE)             # 3. horizontal line mouth
fb.show()                               # 4. push the buffer to the screen
```

That short program uses exactly two shapes — a filled rectangle and a horizontal line — and already reads as the beginning of an expression. Chapter 7 adds curved shapes like ellipses to this toolkit, and Chapter 9 combines everything into complete, parameterized faces with eyes, eyebrows, and mouths that change together to express an emotion.

!!! mascot-encourage "You're Drawing With Real Primitives Now"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Twenty-one concepts in one chapter is genuinely a lot to hold onto, and if some of it — bitmaps, byte arrays, palette mapping — still feels a little fuzzy, that is completely normal. You do not need to memorize every detail today. Keep this chapter bookmarked; every drawing chapter from here on will point straight back to the exact methods you just met.

## Chapter Summary

You now know the core FrameBuf drawing methods, how they interact with each other on a shared buffer, and how to combine a few of them into a recognizable piece of a face.

- Drawing constants (`BLACK = 0`, `WHITE = 1`) give readable names to the raw drawing color values a monochrome display accepts.
- The pixel method (`fb.pixel()`) sets one dot and underlies every other drawing method; the fill method (`fb.fill()`) clears or fills the entire buffer in one call, typically once per frame.
- The horizontal and vertical line methods (`fb.hline()`, `fb.vline()`) are fast special cases for straight lines; the general line method (`fb.line()`) draws a line between any two points at any angle.
- The rectangle method (`fb.rect()`) draws an outline; adding a final `True` argument produces a filled rectangle instead.
- Clipping at the screen edge means FrameBuf safely ignores out-of-range coordinates instead of crashing, and the scroll method (`fb.scroll()`) shifts existing buffer content, a preview of animation techniques in Chapter 12.
- A sprite is a small pre-drawn image; a bitmap is that image's pixel data stored as raw bytes; MicroPython holds those bytes in a `bytearray`, an unsigned byte array where every value runs from 0 to 255.
- The blit method (`fb.blit()`) copies a sprite's frame buffer onto another at a given position; a transparent color key skips a chosen color during that copy so non-rectangular sprites blend in cleanly; blit palette mapping remaps colors between formats and requires MicroPython 1.17 or later.
- The text method (`fb.text()`) draws a blocky built-in font, useful for debug labels rather than a finished face.
- Draw order layering means later calls paint over earlier ones; overdraw wastes work on pixels that get covered anyway; draw call order optimization means drawing background, then large shapes, then small details, in that order.

!!! mascot-celebration "You Just Drew Part of a Face"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Look at what you built with just a fill, a filled rectangle, and a horizontal line — the beginning of a real expression, drawn with real MicroPython code. Every pixel really does tell a story, and you now know how to place them on purpose. Chapter 7 hands you curved shapes next, so eyebrows can arch and mouths can smile.

??? question "Self-Check: You blit a round pupil sprite onto a background that already has a pattern drawn on it, and a faint square patch appears around the pupil. What went wrong, and how do you fix it? — Click to reveal"
    The `fb.blit()` call was missing its transparent color key argument, so FrameBuf copied the sprite's entire square bounding box — including its background color — instead of skipping the pixels around the circular pupil. Adding the color key as a fourth argument, such as `fb.blit(pupil_sprite, x, y, BLACK)`, tells FrameBuf to skip any source pixel matching `BLACK`, so only the pupil's actual pixels get copied and the existing background pattern shows through everywhere else.
