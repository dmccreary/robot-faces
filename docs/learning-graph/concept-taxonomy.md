# Concept Taxonomy

This taxonomy organizes the 293 concepts in the Robot Faces learning graph into 13 categories.
Each concept is assigned exactly one primary category (`TaxonomyID`), used for coloring nodes in
the graph viewer and for the [Taxonomy Distribution Report](./taxonomy-distribution.md).

Categories are listed in roughly the order a student encounters them, from hardware and historical
motivation through to the capstone. Two categories sit slightly outside a strict linear order by
design: **History Of Screen-Based Robot Faces** is taught early (it is this book's very first
lesson) as motivation, while **MicroPython FrameBuf Version History** is deliberately taught later
because a student cannot appreciate *why* `ellipse()` and `poly()` shipping in v1.20.0 mattered
until they already know what those methods do.

## Categories

| # | Category | TaxonomyID | ID Range | Count |
|---|----------|:----------:|:--------:|:-----:|
| 1 | Hardware & Electronics Foundations | HWFND | 1-25 | 25 |
| 2 | History Of Screen-Based Robot Faces | HIST | 26-50 | 25 |
| 3 | MicroPython Programming Fundamentals | MPYFN | 51-79 | 29 |
| 4 | Display & Coordinate Systems | DISPC | 80-98 | 19 |
| 5 | Basic Drawing Primitives | PRIM | 99-119 | 21 |
| 6 | Ellipse & Polygon Drawing | SHAPE | 120-134 | 15 |
| 7 | MicroPython FrameBuf Version History | FBVER | 135-146 | 12 |
| 8 | Facial Anatomy & Layout | ANAT | 147-169 | 23 |
| 9 | Emotion Psychology & Expression Design | EMOT | 170-202 | 33 |
| 10 | Animation & Timing | ANIM | 203-225 | 23 |
| 11 | Interactive Controls & State Machines | INTER | 226-249 | 24 |
| 12 | Color Display & RGB565 Porting | COLOR | 250-270 | 21 |
| 13 | Computational Thinking & Capstone Design | CTCAP | 271-293 | 23 |

**Total: 293 concepts across 13 categories.** Largest category (EMOT) is 11.3% of the graph;
smallest (FBVER) is 4.1%. No category exceeds the 30% imbalance threshold.

## Category Descriptions

### 1. Hardware & Electronics Foundations (HWFND)

The physical components students wire up before writing any drawing code: the Raspberry Pi Pico
and RP2040, the two target displays (SSD1306 monochrome OLED and GC9A01 color round display) and
their driver chips, SPI/I2C buses and individual signal pins, breadboards and jumper wires, and the
buttons/potentiometer/rotary encoder used for interaction later in the course.

### 2. History Of Screen-Based Robot Faces (HIST)

The four pioneering commercial robots that motivate this course — Anki Cozmo, Anki Vector, Emotix
Miko, and Blue Frog Robotics Buddy — plus the shared design bet they all made (a small number of
screen-based facial features is enough to read emotion), their business outcomes, and what those
outcomes teach about scoping a low-cost classroom robot face project.

### 3. MicroPython Programming Fundamentals (MPYFN)

Core MicroPython language mechanics used throughout the course: variables, constants, data types,
functions and parameters, loops, conditionals, imports and modules, built-in data structures, and
the `framebuf` module itself as a Python import (its drawing methods are covered in categories 5
and 6; its release history is covered in category 7).

### 4. Display & Coordinate Systems (DISPC)

The conceptual model of a display as a grid of addressable pixels: the coordinate system and its
origin/axis conventions, the frame buffer as a block of memory, resolution, monochrome and depth
concepts, and the initialization sequence that brings a display to life.

### 5. Basic Drawing Primitives (PRIM)

The foundational FrameBuf drawing methods that predate `ellipse()`/`poly()`: `fill()`, `hline()`,
`vline()`, `line()`, `rect()`, `fill_rect()`, `scroll()`, and `blit()`, plus the supporting ideas of
sprites, bitmaps, byte arrays, and draw-order layering needed to compose a scene from primitives.

### 6. Ellipse & Polygon Drawing (SHAPE)

The `ellipse()` and `poly()` methods that this course relies on to draw eyes, eyebrows, and mouths:
quadrant fill codes, point arrays and polygon vertices, and the geometric reasoning (convex versus
concave, circles as special ellipses, approximating curves before these methods existed) that
explains why these two methods were such a leap forward for hobbyist display code.

### 7. MicroPython FrameBuf Version History (FBVER)

The granular, dated version history behind categories 5 and 6: `blit()` gaining cross-format
palette support in v1.17 (2021), the four-versions-long gap (v1.18-v1.19.1) where `ellipse()` and
`poly()` still did not exist, their merge into the development branch in August 2022, nightly/
unstable builds that shipped them months early, their arrival in the first official stable release
(v1.20.0, April 2023), and the later `ellipse()` zero-radius bug fix (v1.24.1, 2024).

### 8. Facial Anatomy & Layout (ANAT)

Decomposing a face into independently parameterized, independently drawable parts — face outline,
eyes, pupils, eyebrows, mouth, nose — and recombining them through a single `draw_face()` function
driven by a small set of parameters rather than hard-coded shapes.

### 9. Emotion Psychology & Expression Design (EMOT)

The psychological research behind facial expression (Paul Ekman's universal emotions, facial action
coding, minimal-feature robot face research) and its application to a concrete set of nine-plus
expressions (neutral, happy, sad, angry, afraid, surprised, disgusted, contempt, tired, stern,
sleepy, confused, excited), plus the design considerations — readability, ambiguity, cultural
universality, anthropomorphism — that determine whether an expression actually reads correctly.

### 10. Animation & Timing (ANIM)

Bringing a static face to life: animation loops, blinking, gaze/pupil movement, timing functions
(`sleep()`, `ticks_us()`), interpolation and easing between expressions, benchmarking draw time, and
the flicker/frame-rate trade-offs of redrawing a display repeatedly.

### 11. Interactive Controls & State Machines (INTER)

Reading physical input (digital buttons, analog potentiometers, rotary encoders) and using it to
drive expression choice: debouncing, interrupt handlers, mode/state-machine design, multi-mode
menus, live parameter tuning, and the dual-core processing model available on the RP2040.

### 12. Color Display & RGB565 Porting (COLOR)

Adapting monochrome face designs to the 240x240 color round display: the RGB565 color model and
`color565()`, named color constants and palettes, color-cycling effects, and the performance/memory
trade-offs of porting drawing code between a 1-bit monochrome buffer and a 16-bit color buffer.

### 13. Computational Thinking & Capstone Design (CTCAP)

The computational thinking skills the course explicitly names (abstraction, decomposition,
modularity, pattern recognition) applied in reflection on the concrete work of earlier categories,
design-evaluation practices (critique, trade-off analysis, iterative design, peer review), and the
culminating capstone project that draws on nearly every other category at once.
