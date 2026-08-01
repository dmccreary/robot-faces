---
title: Quiz - Porting Faces to a Color Display
description: Ten multiple-choice questions covering RGB565 color packing, color565(), palettes, round-display layout, cross-display compatibility, and the color-versus-mono trade-off.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Porting Faces to a Color Display

Test your understanding of adapting a monochrome face design to the GC9A01 color round display.

---

#### 1. In the RGB565 color model, why does green get 6 bits while red and blue each get only 5?

<div class="upper-alpha" markdown>
1. Human eyes have more receptors sensitive to green light, so more shades of green are perceptible
2. Green pixels take longer to refresh, so the extra bit compensates for lag
3. The GC9A01 driver chip only supports 5-bit red and blue channels natively
4. Green is reserved as a parity bit to catch transmission errors over SPI
</div>

??? question "Show Answer"
    The correct answer is **A**. RGB565 spends its limited 16 bits where human perception can actually tell the difference: 5 bits of red allows 32 intensities, 6 bits of green allows 64, and 5 bits of blue allows 32. The name "565" refers directly to this red-green-blue bit split.

    **Concept Tested:** RGB565 Color Model

    **See:** [The RGB565 Color Model](index.md#the-rgb565-color-model)

---

#### 2. What does `color565(r, g, b)` do?

<div class="upper-alpha" markdown>
1. Packs three ordinary 0-255 channel values into a single 16-bit RGB565 integer using shifting and masking
2. Converts an RGB565 integer back into three separate 0-255 channel values
3. Blends two named colors together into an average color
4. Selects the closest of 565 preset colors to a given RGB triple
</div>

??? question "Show Answer"
    The correct answer is **A**. It shrinks each channel to its RGB565 bit width with a right shift and mask, then positions the shrunken values with left shifts and combines them with `|` — the exact bitwise operators and shifting Chapter 4 introduced, now put to a concrete use.

    **Concept Tested:** Color565 Function

    **See:** [The color565() Function](index.md#the-color565-function-packing-three-colors-into-one-number)

---

#### 3. Why does `color565()` shift the red channel left by 11 places and the green channel left by 5, while leaving blue unshifted?

<div class="upper-alpha" markdown>
1. Because red and green need error-correction padding that blue does not
2. Because SPI transmits red and green in a different byte order than blue
3. Because the shifts convert each channel from 0-255 back into 0-31 or 0-63
4. Because those shift amounts position each channel's bits at its correct slot in the 16-bit number: red at positions 15-11, green at 10-5, blue at 4-0
</div>

??? question "Show Answer"
    The correct answer is **D**. RGB565 is read most-significant-bit first: red occupies the top 5 bits, green the middle 6, and blue the bottom 5. Shifting red left 11 and green left 5 slides each shrunken value into its designated slot so that combining all three with `|` produces one correct 16-bit number with no overlap.

    **Concept Tested:** Color565 Function

    **See:** [The color565() Function](index.md#the-color565-function-packing-three-colors-into-one-number)

---

#### 4. Why does this chapter recommend defining named color constants like `ORANGE = color565(255, 165, 0)` instead of calling `color565()` inline everywhere?

<div class="upper-alpha" markdown>
1. Named constants execute faster on the RP2040 than a function call
2. A named constant makes intent readable at the call site, the same discipline Chapter 6 used for `BLACK`/`WHITE` drawing constants
3. `color565()` can only be called once per program without causing a memory leak
4. Named constants are required by the `gc9a01` driver's initialization sequence
</div>

??? question "Show Answer"
    The correct answer is **B**. `display.fill(BLACK)` reads instantly as "clear the screen to black," while `display.fill(0)` on a color display leaves a reader guessing whether 0 even means black here. Computing the packed value once and naming it is exactly the pattern Chapter 6 taught for monochrome drawing constants.

    **Concept Tested:** Named Color Constants

    **See:** [Named Color Constants and a Color Palette](index.md#named-color-constants-and-a-color-palette)

---

#### 5. Why can an eyebrow's bounding box be perfectly safe on the OLED but get silently clipped on the round color display?

<div class="upper-alpha" markdown>
1. The OLED buffer is rectangular and fully visible edge to edge, while the round display's square buffer has an inscribed circle, so corner regions accept coordinates but are never physically visible
2. The round display's driver enforces a stricter maximum coordinate range than the OLED's driver
3. RGB565 colors near the buffer's corners are automatically shifted to black
4. The OLED has more usable pixels overall, so its margins are naturally more forgiving
</div>

??? question "Show Answer"
    The correct answer is **A**. A drawing command happily writes to a corner pixel with no error, but that corner sits outside the physical glass, so nothing lights up there. Planning every feature's bounding box within a safe area slightly smaller than the full inscribed circle avoids features silently vanishing at the edges.

    **Concept Tested:** Round Display Layout

    **See:** [Round Display Layout](index.md#round-display-layout)

---

#### 6. Which parts of a Chapter 9 draw_eye()-style function must change to port it from the OLED to the color round display?

<div class="upper-alpha" markdown>
1. Nothing needs to change — the exact same call site works unmodified on both displays
2. The whole function must be rewritten, since ellipse math differs between square and circular buffers
3. Only the color value passed to it and the display object it draws onto, since the function itself uses parameters scaled to width and height
4. Only the function's name, since `ellipse()` is not available on the GC9A01 driver
</div>

??? question "Show Answer"
    The correct answer is **C**. Because Chapter 9 taught writing feature-drawing code in terms of scaled parameters rather than hardcoded pixel positions, the function body stays identical. Only the call site changes: a real RGB565 color like `CYAN` replaces the OLED's `1`, and coordinates are computed from the new display's own width and height.

    **Concept Tested:** Cross-Display Code Compatibility

    **See:** [Cross-Display Code Compatibility](index.md#cross-display-code-compatibility)

---

#### 7. What are the two things that genuinely must change when porting a face from the OLED to the color display?

<div class="upper-alpha" markdown>
1. The eyebrow angle parameter and the mouth curvature parameter
2. The animation loop's frame rate and its use of `ticks_ms()`
3. Color values (since `1` no longer means anything) and the driver/init code (SSD1306 versus GC9A01)
4. The face state dictionary's key names and the quadrant fill code's bit values
</div>

??? question "Show Answer"
    The correct answer is **C**. The scaling discipline built into feature-drawing functions since Chapter 9 means shapes and layout logic carry over unchanged. What must change is exactly what differs between the two displays: what a color value means, and which driver module and initialization sequence connects to the physical chip.

    **Concept Tested:** Display Driver Porting

    **See:** [Display Driver Porting and the Color Display Init Sequence](index.md#display-driver-porting-and-the-color-display-init-sequence)

---

#### 8. Roughly how much more memory does the color display's frame buffer use compared to the OLED's, and why?

<div class="upper-alpha" markdown>
1. About 7 times more, matching the ratio of total pixel counts
2. About 2 times more, since RGB565 only adds one extra byte per pixel
3. About 112 times more, because bit depth jumps from a fraction of a byte per pixel to 2 full bytes per pixel
4. About 16 times more, matching the difference in bits per pixel alone
</div>

??? question "Show Answer"
    The correct answer is **C**. The OLED's 1 bit per pixel packs 8 pixels into a byte, while RGB565 spends 2 whole bytes per pixel. That shift, combined with roughly 7 times more pixels, produces the 1,024-byte versus 115,200-byte gap — a comparison rooted in Chapter 5's buffer size formula.

    **Concept Tested:** Memory Use Comparison

    **See:** [Color Versus Mono: Weighing the Trade-Off](index.md#color-versus-mono-weighing-the-trade-off)

---

#### 9. Why does a full-screen `.show()` call typically take longer on the color display than on the OLED?

<div class="upper-alpha" markdown>
1. The GC9A01 chip runs at a fundamentally slower clock speed than the SSD1306
2. The color display's much larger buffer means far more bytes must travel over the SPI bus for the same full-screen update
3. Color pixels require two separate `.show()` calls, one per color channel
4. The round shape forces the driver to redraw each row twice to fill the corners
</div>

??? question "Show Answer"
    The correct answer is **B**. Every `.show()` call sends the entire frame buffer over SPI, and a 115,200-byte buffer simply has 112 times more data to transmit than a 1,024-byte one. A faster SPI clock can help, but it cannot erase the fact that far more bytes must move for the same operation.

    **Concept Tested:** Display Performance Comparison

    **See:** [Color Versus Mono: Weighing the Trade-Off](index.md#color-versus-mono-weighing-the-trade-off)

---

#### 10. A robot needs the fastest possible redraw for rapid blinking animation on a tight memory budget. Which display does this chapter's trade-off analysis favor?

<div class="upper-alpha" markdown>
1. The color round display, since RGB565 always redraws faster than monochrome
2. Either display equally, since SPI bus speed is the only factor that matters
3. Neither — this scenario requires a third display type not covered in this book
4. The monochrome OLED, since its smaller buffer needs far less memory and far less data sent per `.show()` call
</div>

??? question "Show Answer"
    The correct answer is **D**. The color display is not a worse choice in general — it is a different choice suited to rich, colorful expression where the extra memory and slower redraws are worth it. A robot prioritizing tight memory and the fastest possible redraw is better served by the OLED's smaller buffer and lower per-frame data cost.

    **Concept Tested:** Color Versus Mono Trade-Off

    **See:** [Color Versus Mono: Weighing the Trade-Off](index.md#color-versus-mono-weighing-the-trade-off)
