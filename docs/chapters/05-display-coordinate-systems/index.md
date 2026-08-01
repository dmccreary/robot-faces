---
title: Display & Coordinate Systems
description: How a screen's pixels map to (x, y) coordinates and an in-memory frame buffer, covering resolution, bit depth, buffer size math, and the circular display's square-buffer quirk.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 14:17:57
version: 0.09
---

# Display & Coordinate Systems

## Summary

This chapter explains how a screen is represented in software: pixels, the frame buffer that holds them, the screen coordinate system with its origin in the upper-left corner, and how resolution, bit depth, and circular versus rectangular geometry differ between the monochrome OLED and the color round display. After completing this chapter, students will be able to convert between a desired on-screen position and the (x, y) coordinates a drawing command expects, on either display.

## Concepts Covered

This chapter covers the following 19 concepts from the learning graph:

1. Screen Coordinate System
2. Origin At Upper-Left
3. X Axis Direction
4. Y Axis Direction
5. Pixel
6. Frame Buffer
7. Display Resolution
8. Monochrome Color Model
9. Display Buffer Memory
10. Screen Refresh Cycle
11. Aspect Ratio
12. Circular Display Geometry
13. Coordinate Plane Quadrant
14. Bounding Box
15. Display Initialization
16. Show Method
17. Frame Buffer Size Calculation
18. Bit Depth
19. Byte Alignment In Buffer

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Hardware & Electronics Foundations](../01-hardware-electronics-foundations/index.md)
- [Chapter 3: MicroPython Fundamentals I: Syntax, Data & Loops](../03-micropython-fundamentals-1/index.md)
- [Chapter 4: MicroPython Fundamentals II: Functions & the FrameBuf Module](../04-micropython-fundamentals-2/index.md)

---

## From Frame Buffer to Coordinates

!!! mascot-welcome "Ready to Draw Your First Pixel?"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Chapter 4 ended with a first look at the FrameBuf module and a promise that Chapter 5 would hand you the coordinate system a frame buffer actually uses. That promise starts paying off right now — by the end of this chapter, you'll be able to point at any spot on either display and know exactly which numbers to hand MicroPython to draw there.

Every shape you will ever draw on a robot's face — an eye, an eyebrow, a curved smiling mouth — starts as a set of numbers describing where pixels belong. Chapter 1 introduced the two target displays purely as hardware: chips, wires, and part numbers. Chapter 4 introduced the frame buffer conceptually, as memory shaped like a screen. This chapter connects those two ideas by teaching the coordinate system that turns a location on a screen into a location in memory — the exact translation every drawing command from Chapter 6 onward depends on.

## What Is a Pixel?

A **pixel** — short for "picture element" — is a single addressable point of light or color on a display, the smallest unit a screen can control on its own. Every image a display shows, from one glowing dot to a fully drawn face, is built entirely out of pixels, the same way a mosaic is built entirely out of small tiles. The 128x64 OLED from Chapter 1 has exactly 8,192 pixels arranged in a grid; the 240x240 color round display has 57,600. Neither display can show anything smaller than a single pixel — what looks like a smooth curved eyebrow up close is really a staircase of individually lit squares.

Because a display holds thousands of pixels, a program needs a reliable way to say *which one* it means every time it draws something. That naming scheme is the screen coordinate system, and it is the single most important idea in this chapter.

## Reading a Screen Like a Grid

A **screen coordinate system** is the scheme a display uses to address every pixel individually, treating the whole screen as a grid and giving each pixel a pair of numbers that names its exact position. Those two numbers are written as an **(x, y) pair**, where the first number locates a pixel horizontally and the second locates it vertically. Handing MicroPython the pair `(64, 32)` tells it, unambiguously, exactly one pixel out of the thousands available — no description in words could be that precise.

The two numbers in an (x, y) pair are not interchangeable, and each one moves along its own axis:

- **X axis direction:** the X value increases as you move to the right across the screen. The leftmost column of pixels has the smallest possible X value, and the rightmost column has the largest.
- **Y axis direction:** the Y value increases as you move *downward* on the screen. The topmost row of pixels has the smallest possible Y value, and the bottommost row has the largest.

That second rule — Y growing downward — is worth pausing on, because it breaks a habit almost every student already has.

## The Origin Sits in the Upper-Left Corner

The **origin** is the pixel at coordinate (0, 0), the fixed reference point every other coordinate is measured from. On both displays in this book, and on nearly every computer screen you have ever used, the origin sits in the **upper-left corner** — not the center, and not the bottom-left corner a math class coordinate plane usually uses.

!!! mascot-warning "Y Goes Down, Not Up"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    This one catches almost everybody the first time: in math class, Y increases as you go *up* the page. On a screen, Y increases as you go *down* the page, because (0, 0) lives in the upper-left corner instead of the bottom-left. If an eyebrow you meant to draw near the top of the screen shows up near the bottom instead, check your Y value first — you probably flipped this rule out of habit.

Placing the origin in the upper-left corner is a convention, not a law of physics — it exists because early computer displays drew pixels row by row, starting at the top-left and scanning rightward and downward, the same order English text reads on a page. Every drawing coordinate you write from here forward assumes this convention, so it is worth memorizing before Chapter 6 introduces actual drawing commands.

## One Quadrant, Not Four

A math-class coordinate plane usually shows four **quadrants**, formed where a horizontal X axis and a vertical Y axis cross at a center point, with positive and negative values extending in every direction. A **coordinate plane quadrant** is one of those four regions, distinguished by whether X and Y are each positive or negative in that region.

A screen coordinate system throws three of those four quadrants away. Because the origin sits in the corner rather than the center, and because pixel positions can never be negative, every valid coordinate on a display uses only positive X and positive Y values — the single quadrant where both numbers stay positive, just with the Y axis pointing down instead of up. This is a helpful simplification: you never need to worry about negative coordinates when planning where a shape belongs on screen, only about staying within the display's width and height.

Before looking at a diagram that puts the origin, the axes, and this positive-only region on screen together, it helps to define one more idea you'll use constantly when planning where a shape goes: the bounding box.

## Framing a Shape: The Bounding Box

A **bounding box** is the smallest rectangle that completely encloses a shape, described by the coordinates of its corners or by a starting corner plus a width and height. Before drawing a single pixel of an eye, a robot-face designer sketches its bounding box first — deciding, for example, that a left eye will occupy the rectangle from (20, 15) to (40, 35), a 20-by-20-pixel square, before worrying about the exact curve of the eyelid inside it.

Bounding boxes matter for a very practical reason: they let you plan a whole face's layout using simple rectangles, checking that an eye, an eyebrow, and a mouth don't overlap, before writing any drawing code at all. Later chapters use this exact habit to lay out every feature on a face.

Now that the origin, both axes, and the bounding box idea are all defined, the interactive grid below lets you test your understanding directly by clicking anywhere on a simulated display and reading back its coordinates.

#### Diagram: Coordinate Grid Explorer

<iframe src="../../sims/coordinate-grid-explorer/main.html" width="100%" height="482px" scrolling="no"></iframe>

<details markdown="1">
<summary>Coordinate Grid Explorer</summary>
Type: microsim
**sim-id:** coordinate-grid-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: demonstrate, identify

Learning objective: Demonstrate the mapping between a screen position and its (x, y) coordinate pair by clicking anywhere on a simulated pixel grid, and identify the origin, X axis direction, and Y axis direction when they are toggled into view.

Canvas layout:
- Left 70% (responsive, roughly 450x300 at default width): a scaled-up pixel grid representing the display, each simulated pixel drawn as a small square
- Right 30%: a control panel with toggles and a live coordinate readout

Visual elements:
- A grid of squares representing display pixels, with a faint darker gridline every 8 pixels to hint at byte boundaries
- An origin marker (a small teal circle) at the upper-left corner, shown only when "Show origin & axes" is checked
- Arrows along the top edge (labeled "X increases →") and the left edge (labeled "Y increases ↓") when axes are shown
- A crosshair marker placed at the most recently clicked pixel, in coral
- A shaded overlay covering the entire grid in a translucent teal when "Show valid quadrant" is checked, with the caption "Only positive X, positive Y — the rest of the plane is never used"

Interactive controls:
- Dropdown: "Display: 128x64 OLED / 240x240 Color Round" — changes the grid's proportions and pixel count
- Checkbox: "Show origin & axes" (default on)
- Checkbox: "Show valid quadrant shading" (default off)
- Click anywhere on the grid to drop a crosshair marker and update the coordinate readout
- "Reset" button clears the marker and restores default toggle states

Default parameters: 128x64 OLED selected, origin and axes shown, quadrant shading off, no marker placed

Behavior: clicking any grid cell immediately updates a readout reading "You clicked: (x, y)" with the exact integer coordinates of that cell, snapping to the nearest whole pixel. Switching the display dropdown redraws the grid at the new width and height and clears any placed marker. Toggling quadrant shading overlays or removes the teal tint without affecting the marker.

Instructional Rationale: An Apply-level, direct-manipulation pattern is appropriate because the objective requires the learner to actively test the coordinate mapping by clicking real positions and checking the reported (x, y) pair against their own prediction, rather than passively watching an animation demonstrate it.

Responsive design: the grid and control panel stack vertically below 600 pixels wide; the grid scales to fill its container's width on window resize while preserving the display's aspect ratio.

Implementation: p5.js for the grid rendering and click detection; a state object tracks the selected display size, toggle states, and the last-clicked coordinate.
</details>

## The Frame Buffer: Where Pixels Live Before They're Seen

Chapter 4 introduced the **frame buffer** as an in-memory rectangle of pixels a program draws into before that image is ever sent to a real screen — now that you know how coordinates work, it's worth returning to that idea with more precision. A frame buffer stores the current on/off or color state of every single pixel on a display, arranged in memory so that the coordinate system you just learned maps directly onto specific bytes.

!!! mascot-thinking "A Frame Buffer Is a Grid Twice Over"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here's the idea to hold onto: a frame buffer is a grid of pixel positions, just like the coordinate system you just explored, laid directly on top of a grid of memory addresses. Every `(x, y)` you hand a drawing method gets translated, behind the scenes, into "which byte, and which bit inside that byte." You'll never have to do that translation by hand — MicroPython's `framebuf` module does it for you — but knowing it happens explains everything else in this chapter.

Nothing about a frame buffer is visible to anyone looking at the physical screen while a program is drawing into it. A program can fill it, clear it, and redraw dozens of shapes, and the actual display keeps showing whatever it displayed last, completely unaffected, until that buffer is explicitly sent to the screen — a step covered later in this chapter.

## How Many Colors Can a Pixel Hold? Bit Depth

Not every pixel needs the same amount of information to describe its state. **Bit depth** is the number of bits of memory used to store each pixel's value in a frame buffer, and it determines how many distinct colors or shades that pixel can represent. A pixel described with more bits can represent more possible states, the same way a longer combination lock has more possible combinations.

The two displays from Chapter 1 sit at opposite ends of this scale. The 128x64 OLED uses 1-bit depth: each pixel's entire state fits in a single bit, which can only be `0` or `1`. The **monochrome color model** that results from this is strict — a pixel is either fully on (lit) or fully off (dark), with no gray levels, no dimming, and no in-between state possible. The 240x240 color round display uses 16-bit depth, following the **RGB565** color format briefly mentioned in the course description, which packs a red, green, and blue value into those 16 bits and can represent 65,536 distinct colors per pixel.

The table below reinforces the contrast between these two bit depths now that both have been explained in prose.

| Display | Bit Depth | Possible States per Pixel | Color Model |
|---|---|---|---|
| 128x64 OLED | 1 bit | 2 (on or off) | Monochrome |
| 240x240 Color Round | 16 bits | 65,536 | RGB565 color |

## Calculating a Frame Buffer's Size

Bit depth is not just an abstract property — it directly determines how much memory a frame buffer needs, and that number matters a great deal on a microcontroller with a limited memory budget. **Frame buffer size calculation** is the arithmetic that converts a display's width, height, and bit depth into a number of bytes: multiply width by height to get the total pixel count, multiply that by the bit depth to get the total number of bits, then divide by 8 because memory is addressed in whole bytes, not individual bits.

Written as a formula, that calculation is:

\[ \text{bytes} = \frac{\text{width} \times \text{height} \times \text{bit depth}}{8} \]

Seeing this formula applied to real numbers makes it concrete. The code below calculates the exact buffer size for both of this book's target displays, using the same formula for each.

```python
# 128x64 monochrome OLED: 1 bit per pixel
width = 128
height = 64
bits_per_pixel = 1
oled_bytes = width * height * bits_per_pixel // 8
print(oled_bytes)   # 1024 bytes (1 KB)

# 240x240 color round display: 16 bits per pixel (RGB565)
width = 240
height = 240
bits_per_pixel = 16
color_bytes = width * height * bits_per_pixel // 8
print(color_bytes)  # 115200 bytes (112.5 KB)
```

Running that code prints `1024` for the OLED and `115200` for the color display — a difference of more than 100 times, even though the color display has only about seven times as many pixels. Bit depth, not pixel count alone, is what drives a frame buffer's memory footprint. Now that you have seen the calculation worked out by hand, the interactive calculator below lets you change width, height, and bit depth independently and watch the byte count respond live.

#### Diagram: Frame Buffer Size Calculator

<iframe src="../../sims/buffer-size-calculator/main.html" width="100%" height="492px" scrolling="no"></iframe>

<details markdown="1">
<summary>Frame Buffer Size Calculator</summary>
Type: microsim
**sim-id:** buffer-size-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: calculate, demonstrate

Learning objective: Calculate the number of bytes a frame buffer requires given width, height, and bit depth, and demonstrate how independently changing each parameter changes the total memory footprint.

Canvas layout:
- Top: three controls in a row (width slider, height slider, bit-depth selector)
- Middle: the formula "bytes = width x height x bit depth / 8" with the current numbers substituted in live
- Bottom: a large byte/kilobyte readout and a horizontal comparison bar showing this buffer's size as a fraction of the RP2040's 264 KB of RAM

Visual elements:
- Width slider (8 to 240, step 8) and height slider (8 to 240, step 8), each showing its current value
- Bit-depth selector with two options: "1-bit monochrome" and "16-bit color (RGB565)"
- Live formula line, e.g. "bytes = 128 x 64 x 1 / 8 = 1024 bytes (1.0 KB)"
- A horizontal bar labeled "RP2040 total RAM: 264 KB" with a filled segment showing what fraction the current buffer size occupies, plus a percentage label
- Two preset buttons: "128x64 mono (OLED)" and "240x240 color (Round LCD)", each jumping all controls to that display's real values

Interactive controls:
- Width slider
- Height slider
- Bit-depth selector (radio buttons or dropdown)
- Preset buttons for the two real displays
- "Reset" button restores width 128, height 64, bit depth 1-bit

Default parameters: width 128, height 64, bit depth 1-bit monochrome (matching the OLED)

Behavior: moving any slider or changing the bit-depth selector immediately recalculates and redisplays the formula line, the byte/KB readout, and the RAM comparison bar. Clicking a preset button animates the sliders to that display's exact values so the learner can see the two real-world cases directly. The RAM comparison bar changes color from teal to coral once the buffer exceeds roughly 50% of the RP2040's 264 KB, to call attention to the color display's much larger footprint.

Instructional Rationale: An Apply-level calculator supports the objective directly, since the learner must manipulate the three inputs and observe the resulting calculation rather than watch a worked example passively; live recalculation on every input change lets the learner isolate the effect of each parameter one at a time.

Responsive design: controls stack vertically below 600 pixels wide; the comparison bar remains full-width and legible at every screen size.

Implementation: p5.js for the sliders, formula text, and comparison bar; the byte calculation is a single JavaScript expression re-evaluated on every input event.
</details>

## Packing Pixels into Bytes: Byte Alignment

The frame buffer size formula divides by 8 because a byte holds exactly 8 bits, and for a 1-bit monochrome buffer, that means 8 pixels share a single byte. **Byte alignment in buffer** describes how those 8 pixels pack together, and it explains why some display widths are more convenient to work with than others.

The 128-pixel width of the OLED is not an arbitrary choice — 128 divided by 8 is exactly 16, so every row of pixels packs into a whole number of bytes (16 of them) with nothing left over. If a designer instead chose a 100-pixel-wide display, 100 divided by 8 is 12.5, meaning the last byte in every row would only be half-filled with real pixels, wasting 4 bits of that byte on every single row. Widths that are multiples of 8 avoid this waste entirely, which is exactly why so many small monochrome displays, including this book's OLED, use dimensions like 128 and 64.

!!! mascot-tip "Multiples of 8 Are a Display Designer's Best Friend"
    ![Pixel gives a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Next time you see a display advertised as 128x64, 96x16, or 128x32, notice that both numbers are always multiples of 8. That's not a coincidence — it's byte alignment working in the manufacturer's favor, packing every row of pixels into whole bytes with nothing wasted.

## Resolution and Shape: Comparing the Two Displays

**Display resolution** is the exact pixel count of a screen, given as width times height, and it is the same number you have already been using throughout this chapter's coordinate and buffer-size examples. Revisiting Chapter 1's two displays in coordinate terms: the OLED's resolution of 128x64 means valid X coordinates run from 0 to 127 and valid Y coordinates run from 0 to 63, while the color display's 240x240 resolution means both X and Y run from 0 to 239.

Resolution alone does not describe a display's shape — two displays can have very different proportions even with a similar total pixel count. **Aspect ratio** is the ratio of a display's width to its height, expressed in simplest form, and it determines whether a screen reads as wide, tall, or square. The OLED's 128:64 ratio simplifies to 2:1, a wide rectangle exactly twice as wide as it is tall. The color display's 240:240 ratio simplifies to 1:1, a perfect square.

That difference in aspect ratio has a real design consequence worth stating plainly before it resurfaces in later chapters: a face designed for the OLED's wide rectangle needs to spread its eyes, eyebrows, and mouth across a horizontal band, while a face designed for the square color display has equal room in both directions — and, as the next section explains, that square buffer hides a further twist.

## A Circle Inside a Square: Circular Display Geometry

Chapter 1 described the 240x240 color display as physically round, shaped like a smartwatch face — but every frame buffer calculation so far has treated it as a 240x240 square. Both facts are true at once, and reconciling them is what **circular display geometry** is about. The display's frame buffer is genuinely a square, 240 pixels by 240 pixels, because that is the simplest shape to address with an (x, y) coordinate system. The physical glass, however, is round, with a diameter of 240 pixels — meaning the visible pixels form a circle inscribed inside that square buffer.

!!! mascot-encourage "Yes, Some Pixels Really Do Go Nowhere"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    This one takes a moment to sink in, and that's completely normal — a square buffer holding a round image feels backwards at first. Picture a circular cookie cutter pressed into a square sheet of dough: the corners of the dough are still there, still real dough, but they never become part of the cookie. The corner pixels of this buffer work the same way.

A pixel near one of the square buffer's four corners has valid (x, y) coordinates, and a drawing command will happily write to it without any error — but that corner sits outside the physical circular glass, so nothing ever lights up there. Roughly 21 percent of the pixels in this buffer are physically invisible, present only in memory and never seen by anyone looking at the screen; the remaining 79 percent fill the visible circle. This matters most when planning layout: an eye's bounding box that reaches too close to a corner may be drawing into space nobody will ever see.

Seeing exactly which buffer pixels fall inside the visible circle, and which ones are wasted in the corners, is far easier with a picture than with a percentage. The interactive diagram below lets you explore that boundary directly.

#### Diagram: Circular Buffer Waste Visualizer

<iframe src="../../sims/circular-buffer-waste-visualizer/main.html" width="100%" height="502px" scrolling="no"></iframe>

<details markdown="1">
<summary>Circular Buffer Waste Visualizer</summary>
Type: microsim
**sim-id:** circular-buffer-waste-visualizer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, examine

Learning objective: Analyze the relationship between the 240x240 square frame buffer and the circular physical display by examining which buffer pixels fall inside versus outside the visible circle, and differentiate "visible" pixels from "wasted" pixels.

Canvas layout:
- Left 65% (responsive, roughly 400x400 at default width): a 240x240 grid representing the frame buffer, with a circle of diameter 240 drawn inscribed inside it
- Right 35%: a control panel, a running pixel-count readout, and an infobox for the hovered pixel

Visual elements:
- The full square grid shown in light gray gridlines
- Pixels inside the inscribed circle shaded teal ("visible" region)
- Pixels outside the circle but inside the square shaded coral ("wasted" region), visible only when the "Show wasted pixels" toggle is on
- A running counter: "Visible pixels: 45,238 (78.5%) | Wasted pixels: 12,362 (21.5%)"
- A crosshair on the currently hovered pixel with a small infobox showing its (x, y) coordinate, its buffer byte offset, and whether it is Visible or Wasted

Interactive controls:
- Toggle: "Show wasted pixels" (default on)
- Toggle: "Show buffer byte grid" — overlays boundaries showing how bytes group pixels, for 16-bit color pixels
- Hover any cell to update the infobox with its coordinate, byte offset, and visible/wasted status
- Click a cell to pin the infobox open for closer reading
- "Reset" button clears any pinned selection and restores default toggles

Default parameters: "Show wasted pixels" on, "Show buffer byte grid" off, no pixel hovered or pinned

Behavior: hovering any grid cell immediately updates the infobox with that pixel's exact coordinate and whether it falls inside the visible circle; the running counter at the top recalculates once, at load time, and stays fixed since the circle's position never changes. Toggling "Show wasted pixels" instantly recolors or hides the coral corner regions without affecting the counter.

Instructional Rationale: An Analyze-level objective requires the learner to examine the structural relationship between two overlapping shapes — a square buffer and an inscribed circle — and correctly attribute individual pixels to one category or the other, which direct hover-driven examination supports better than a static labeled picture or a passive animation.

Responsive design: the grid scales proportionally to its container's width on window resize, remaining square at every size; the control panel moves below the grid on narrow viewports.

Implementation: p5.js for the grid rendering and circle-inclusion test (distance from center compared to radius); a precomputed lookup avoids recalculating the circle test on every frame.
</details>

## How Much Memory Does a Display Really Use?

The buffer size calculations from earlier in this chapter translate directly into a real constraint on the hardware from Chapter 1. **Display buffer memory** is the amount of the RP2040's onboard RAM a program must set aside to hold one display's frame buffer, and it competes with every other variable, list, and function your program needs while it runs.

Chapter 1 noted that the RP2040 includes 264 kilobytes of memory in total. Measured against that budget, the two displays could hardly be more different: the OLED's 1,024-byte buffer uses well under 1 percent of available RAM, leaving nearly all of it free for program logic, while the color display's 115,200-byte buffer uses roughly 43 percent of the RP2040's entire memory on its own. This is one of the real performance trade-offs Chapter 15 explores in depth when adapting a face design to the color display — for now, the key habit is remembering to check a buffer's byte size against the 264 KB budget before assuming memory will not be a problem.

## Turning On a Display: Initialization

Every idea in this chapter so far has described a frame buffer sitting quietly in memory. **Display initialization** is the step where a program creates that frame buffer object and connects it to a physical screen, using the exact SPI wiring pins introduced back in Chapter 1 — clock, data, chip select, data/command, and reset.

A bridge before the code: this example builds an SPI connection using the pins from Chapter 1's wiring table, then hands that connection to MicroPython's `ssd1306` driver module along with the OLED's width, height, and each control pin, creating a display object ready to draw into.

```python
from machine import Pin, SPI
import ssd1306

spi = SPI(0, sck=Pin(2), mosi=Pin(3))
display = ssd1306.SSD1306_SPI(
    128, 64, spi,
    dc=Pin(5), res=Pin(4), cs=Pin(6)
)
```

That single `SSD1306_SPI(...)` call does two things at once: it allocates a 1,024-byte frame buffer sized exactly the way this chapter's formula predicts, and it wires that buffer to the physical SPI pins so a later step can push pixel data out to the glass. Chapter 6 returns to this exact line of code and explains every argument in full; for now, the important idea is simpler — initialization is the moment a plain block of memory becomes a working display object your program can draw into.

## Nothing Happens Until You Call .show()

Drawing into a frame buffer, no matter how many shapes a program adds, changes nothing on the physical screen by itself — a detail introduced in Chapter 4 and worth restating precisely now that you know how initialization works. The **show method**, called as `.show()` on a display object, is the command that copies the entire in-memory frame buffer out over SPI to the physical display in one step, making every pending change visible at once.

Here's the bridge before this next example: it clears the buffer, turns on exactly one pixel at the screen's center, and only then calls `.show()` to make that single pixel actually appear.

```python
display.fill(0)           # clear the buffer to all-off (black)
display.pixel(64, 32, 1)  # turn on one pixel, dead center on the OLED
display.show()            # push the buffer to the physical screen
```

Until that final `display.show()` line runs, the OLED keeps showing whatever it displayed before this code started — the `fill()` and `pixel()` calls only change memory. This is a deliberate design, not a limitation: it lets a program build up a complex expression, adjusting eyes, eyebrows, and a mouth one drawing call at a time, and reveal the finished result to the viewer in a single, flicker-free update.

## Static Images, Not Video: The Screen Refresh Cycle

It is tempting to picture a display constantly scanning and redrawing itself many times per second, the way a television or a computer monitor does. Neither display in this book works that way. The **screen refresh cycle** for the OLED and the color round display is event-driven, not continuous: the driver chip holds whatever image was last sent to it, showing that exact static picture indefinitely, and it only changes when a program explicitly calls `.show()` again.

This has a genuinely useful consequence for robot-face programming: a face can sit perfectly still, showing a calm neutral expression, using essentially no drawing activity at all — the display keeps that same image lit with zero ongoing work from your program. Animation, covered fully in Chapter 12, is really just calling `.show()` repeatedly with a slightly different buffer each time, fast enough that a viewer's eye reads the sequence as smooth motion rather than as a series of individual static pictures.

## Chapter Summary

You now know exactly how a screen's pixels map to coordinates, how those coordinates map to bytes in a frame buffer, and how that buffer finally reaches the physical glass of a display.

- A pixel is the smallest addressable point on a display; a screen coordinate system names every pixel with an (x, y) pair.
- The origin (0, 0) sits in the upper-left corner; X increases rightward and Y increases *downward* — the opposite of a typical math-class graph.
- Because the origin sits in a corner, only one coordinate plane quadrant (positive X, positive Y) is ever used; a bounding box is the smallest rectangle enclosing a shape, useful for planning layout before drawing.
- A frame buffer stores every pixel's state in memory before it reaches a screen; bit depth (1-bit monochrome versus 16-bit RGB565 color) determines how much memory each pixel needs.
- Frame buffer size calculation (width × height × bit depth ÷ 8) gives 1,024 bytes for the 128x64 OLED and 115,200 bytes for the 240x240 color display — a difference driven mostly by bit depth, not pixel count.
- Byte alignment packs 8 monochrome pixels per byte, which is why display widths that are multiples of 8, like 128, avoid wasted bits.
- Display resolution and aspect ratio describe a screen's pixel count and shape; the OLED is a 2:1 wide rectangle, and the color display is a 1:1 square.
- The color display's square frame buffer holds an inscribed circle of visible pixels — roughly 21 percent of the buffer's pixels sit in the corners and are never physically visible.
- Display buffer memory competes with the RP2040's 264 KB of total RAM; the color display's buffer alone uses roughly 43 percent of it.
- Display initialization creates a frame buffer and wires it to physical SPI pins; the show method pushes that buffer to the screen; and the screen refresh cycle is static and event-driven, not continuous, until `.show()` is called again.

!!! mascot-celebration "You Can Now Speak in Pixels"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Every pixel really does tell a story — and now you know exactly how to find any one of them, on either display, and turn it on. Chapter 6 hands you the actual drawing methods — `fill()`, `hline()`, `vline()`, `line()`, and `rect()` — that put this coordinate system to work.

??? question "Self-Check: Why does the OLED buffer take so much less memory than the color display's buffer, even though the color display only has about seven times as many pixels? — Click to reveal"
    Memory footprint depends on bit depth as well as pixel count. The OLED uses 1 bit per pixel (128 x 64 x 1 / 8 = 1,024 bytes), while the color display uses 16 bits per pixel for RGB565 color (240 x 240 x 16 / 8 = 115,200 bytes). Multiplying by 16 instead of 1 accounts for most of the roughly 112x difference, even though the color display's pixel count is only about seven times larger.
