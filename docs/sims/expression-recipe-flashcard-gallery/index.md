---
title: Expression Recipe Flashcard Gallery
description: Interactive p5.js MicroSim for expression recipe flashcard gallery.
image: /sims/expression-recipe-flashcard-gallery/expression-recipe-flashcard-gallery.png
og:image: /sims/expression-recipe-flashcard-gallery/expression-recipe-flashcard-gallery.png
twitter:image: /sims/expression-recipe-flashcard-gallery/expression-recipe-flashcard-gallery.png
social:
   cards: false
quality_score: 0
---

# Expression Recipe Flashcard Gallery

<iframe src="main.html" height="522px" width="100%" scrolling="no"></iframe>

[Run the Expression Recipe Flashcard Gallery MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

This flashcard drill turns the chapter's thirteen named expressions into quick
practice you can finish in a few minutes. One card at a time shows either a
rendered robot face or a written parameter recipe, and you pick the name you
think it produces. The goal is to predict a name from a recipe, and to infer a
recipe from a face, until both directions feel automatic. Every card ends with
one sentence naming the parameter that does the most work in that expression.

## How to Use

1. Read the card on the left. In **Face to Name** mode it shows a rendered
   face; in **Recipe to Name** mode it shows the parameter values instead.
2. Click one of the thirteen expression-name buttons to lock in your guess. The
   correct name turns green, and a wrong guess turns red.
3. Watch the card flip over. It then shows the answer plus the side you could
   not see before, and the panel on the right explains the key parameter.
4. Click **Reveal** instead of guessing when you want to study a card. Revealed
   cards are not scored.
5. Click **Next Card** for a new random expression, and **Reset Score** to start
   a fresh session.
6. Use the mode menu to switch between **Face to Name** and **Recipe to Name**.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/expression-recipe-flashcard-gallery/main.html"
        height="522px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Chapter 9's parameterized face: `eye_size`, `eye_spacing`, `eyebrow_angle`,
  `gaze_offset_x`, and `mouth_curvature`
- The face state dictionary, and the idea that one set of numbers describes one
  complete face
- The thirteen named expressions from this chapter's walkthrough
- Comfort reading a Python dictionary of key-value pairs

### Activities

1. **Exploration** (5 min): Stay in Face to Name mode and use **Reveal** on six
   or seven cards without guessing. For each one, write down the single
   parameter you think separates it from neutral.
2. **Guided Practice** (5 min): Switch to Recipe to Name mode and guess ten
   cards. Each time you miss, say out loud which number misled you, then find
   the expression you confused it with in the chapter's recipe table.
3. **Assessment** (5 min): Reset the score, then run ten cards in Face to Name
   mode. Record your score and list the two expressions you confused most.

### Assessment

- Scores at least 7 of 10 on a Face to Name run without using Reveal
- Names the defining parameter for happy, sad, angry, and surprised without
  looking at the chapter's recipe table
- Explains why afraid and surprised are easy to confuse, naming at least two
  parameters they share
- Identifies the three expressions that deliberately break facial symmetry

## References

1. [Paul Ekman - Wikipedia](https://en.wikipedia.org/wiki/Paul_Ekman) -
   Background on the cross-cultural emotion research behind this expression set.
2. [Facial Action Coding System - Wikipedia](https://en.wikipedia.org/wiki/Facial_Action_Coding_System) -
   The muscle-movement system that this book's few parameters simplify.
3. [p5.js Reference](https://p5js.org/reference/) - The drawing functions used
   to render every face in this MicroSim.
4. [MicroPython framebuf module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   The drawing library that puts these same faces on a real robot display.
