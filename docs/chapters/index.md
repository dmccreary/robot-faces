# Chapters

This textbook is organized into 16 chapters covering all 293 concepts from the [learning graph](../learning-graph/index.md).

## Chapter Overview

1. [Hardware & Electronics Foundations](01-hardware-electronics-foundations/index.md) - Introduces the microcontrollers, displays, and wiring components used throughout the book.
2. [A History of Screen-Based Robot Faces](02-history-of-robot-faces/index.md) - Traces the commercial history of expressive screen-based robot faces through Anki's Cozmo and Vector, Emotix's Miko, and Blue Frog Robotics' Buddy.
3. [MicroPython Fundamentals I: Syntax, Data & Loops](03-micropython-fundamentals-1/index.md) - Covers the MicroPython development environment and core language basics needed before any drawing code is introduced.
4. [MicroPython Fundamentals II: Functions & the FrameBuf Module](04-micropython-fundamentals-2/index.md) - Builds on Part I with conditionals, functions and parameters, bitwise operations, and a first look at the FrameBuf module.
5. [Display & Coordinate Systems](05-display-coordinate-systems/index.md) - Explains how pixels, frame buffers, and coordinate systems work on both the monochrome and color round displays.
6. [Basic Drawing Primitives](06-basic-drawing-primitives/index.md) - Teaches the foundational FrameBuf drawing methods that every more advanced drawing technique in this book builds on.
7. [Ellipse & Polygon Drawing](07-ellipse-polygon-drawing/index.md) - Introduces the ellipse() and poly() methods used to draw eyes, eyebrows, mouths, and other curved or angular facial features.
8. [A History of MicroPython's FrameBuf Drawing Support](08-framebuf-version-history/index.md) - Documents the version history behind the ellipse() and poly() methods just learned, from their 2022 development-branch merge to their first stable release.
9. [Facial Anatomy & Layout Design](09-facial-anatomy-layout-design/index.md) - Shows how to decompose a robot face into independently parameterized parts and combine them into a single, reusable draw_face() function.
10. [Emotion Theory & the Core Expression Set](10-emotion-theory-core-expressions/index.md) - Grounds facial expression design in Ekman's emotion research and minimal-feature robot studies, then applies that theory to build the book's core expressions.
11. [Expression Design, Readability & Human-Robot Interaction](11-expression-design-readability-hri/index.md) - Covers advanced expression-design concerns such as intensity, ambiguity, readability at a distance, anthropomorphism, and the uncanny valley.
12. [Animating Expressions: Timing & Motion](12-animating-expressions/index.md) - Introduces animation loops, blinking, gaze movement, and expression interpolation, along with the timing techniques needed for smooth animation.
13. [Interactive Controls: Inputs & Concurrency](13-interactive-controls-inputs/index.md) - Explains how to read buttons, potentiometers, and rotary encoders, and how dual-core processing and simple state machines let a robot face respond to input.
14. [Building an Expression Menu & Live Controls](14-expression-menu-live-controls/index.md) - Combines state machines and physical inputs into a working expression-selection menu with debounced buttons and rotary-encoder-driven live parameter tuning.
15. [Porting Faces to a Color Display](15-porting-faces-color-display/index.md) - Adapts monochrome face designs to the 240x240 color round display using the RGB565 color model.
16. [Computational Thinking & Capstone Design](16-computational-thinking-capstone/index.md) - Names the computational-thinking skills used throughout the book and guides students through planning, building, and presenting an original capstone robot face.

## How to Use This Textbook

Work through the chapters in order — each chapter's concepts depend only on concepts introduced in the same or an earlier chapter, so skipping ahead may mean missing a prerequisite. Chapters 3-4 (MicroPython fundamentals) and 10-11 (emotion design) are split into two parts each; complete both parts of a pair before moving on.

---

**Note:** Each chapter includes a list of concepts covered. Make sure to complete prerequisites before moving to advanced chapters.
