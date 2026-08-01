---
title: Capstone Planning Worksheet
description: Interactive p5.js MicroSim for capstone planning worksheet.
image: /sims/capstone-planning-worksheet/capstone-planning-worksheet.png
og:image: /sims/capstone-planning-worksheet/capstone-planning-worksheet.png
twitter:image: /sims/capstone-planning-worksheet/capstone-planning-worksheet.png
social:
   cards: false
quality_score: 0
---

# Capstone Planning Worksheet

<iframe src="main.html" height="702px" width="100%" scrolling="no"></iframe>

[Run the Capstone Planning Worksheet MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

This worksheet is where your capstone stops being an idea and becomes a plan. You
name the expressions you intend to build, add a rough parameter note beside each
one, pick a target display and a control input, and describe the idle animation
that plays when nothing else is happening. A live Plan Completeness panel checks
your work against all five capstone requirements and turns each check green the
moment you meet it. The goal is a complete, personally-authored project plan
before you write a single new line of drawing code.

## How to Use

1. Type a name in the first expression row, then add a short parameter note
   beside it, such as `brows +6, eyes 12, mouth +8`.
2. Press **Add Expression** for another row, and keep going until the
   "8+ expressions named" check turns green. The small **x** on any row removes
   that row and shifts the rest up.
3. Choose one option from the **Target Display** menu: the OLED, the color round
   display, or both.
4. Tick one or more **Control Scheme** boxes: Push Button, Potentiometer, or
   Rotary Encoder.
5. Describe your idle animation in the **Idle Animation** box. Timing details
   help, such as "blink every 4 seconds using `ticks_ms()`".
6. Watch the **Plan Completeness** panel. Each requirement shows an open circle
   until it is met, then a green check.
7. Press **Export Plan** at any time to see your whole plan as plain text, then
   press **Select All Text** and copy it into your project documentation.
8. **Clear Worksheet** wipes everything, but only after you confirm.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/capstone-planning-worksheet/main.html"
        height="702px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- The `face_state` parameter system and the `draw_face()` function from
  Chapter 9, since every parameter note you write refers to those values.
- The thirteen core expressions from Chapter 10, which give you known-good
  starting numbers for most of your eight.
- Idle animation and `ticks_ms()` timing from Chapter 12.
- Button, potentiometer, and rotary encoder input from Chapter 13.

### Activities

1. **Exploration** (5 min): Fill in only the expressions you are already sure
   about, then read the Plan Completeness panel. Whichever requirement sits
   furthest from green is the part of your project you have thought about least.
2. **Guided Practice** (5 min): Build a full minimum viable feature set. Name
   eight expressions borrowed from Chapter 10, give each one a rough parameter
   note, pick a single display and a single control input, and describe the
   simplest idle animation that would still look alive.
3. **Assessment** (5 min): Export the plan, paste it into a document, and add one
   sentence under the expression list naming a trade-off you made. For example,
   why you chose one display instead of both.

### Assessment

- All five completeness checks are green before the plan is exported.
- At least eight expressions are named, and every one carries a parameter note
  specific enough for a classmate to rebuild it.
- The idle animation description names a timing, not just a behavior.
- The exported plan reads as the student's own design rather than the Chapter 10
  expression set copied over unchanged.

## References

1. [Minimum viable product - Wikipedia](https://en.wikipedia.org/wiki/Minimum_viable_product) -
   The industry practice behind this chapter's minimum viable feature set.
2. [Iterative design - Wikipedia](https://en.wikipedia.org/wiki/Iterative_design) -
   Build rough, test, refine, repeat: the process this plan feeds into.
3. [MicroPython `time` module](https://docs.micropython.org/en/latest/library/time.html) -
   `ticks_ms()` and `ticks_diff()`, the timing functions your idle animation needs.
4. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   The drawing surface every planned expression will eventually render onto.
