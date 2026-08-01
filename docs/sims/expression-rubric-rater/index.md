---
title: Rubric Rater — Score This Expression
description: Interactive p5.js MicroSim for rubric rater — score this expression.
image: /sims/expression-rubric-rater/expression-rubric-rater.png
og:image: /sims/expression-rubric-rater/expression-rubric-rater.png
twitter:image: /sims/expression-rubric-rater/expression-rubric-rater.png
social:
   cards: false
quality_score: 0
---

# Rubric Rater — Score This Expression

<iframe src="main.html" height="702px" width="100%" scrolling="no"></iframe>

[Run the Rubric Rater — Score This Expression MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

This is the deliberate-practice version of the chapter's Emotional Design
Rubric. You load one of six sample face designs, see it rendered twice - close
up, and as a small low-contrast thumbnail standing in for classroom distance
and lighting - and then rate it against all seven rubric criteria. Every rating
needs a written reason, which is the whole point: a defensible judgment beats
"it looks fine." When you submit, you can put your ratings side by side with
the chapter's reference ratings and see exactly where your judgment differed.

## How to Use

1. Pick a design from the **Load Sample Design** menu. Design A, a very subtle
   smile, loads first.
2. Compare the close-up rendering with the classroom-distance thumbnail, and
   read the `face_state` parameters printed underneath.
3. For each of the seven rubric rows, click **Fails**, **Borderline**, or
   **Passes**, then type a short reason in the box beside it.
4. **Submit Assessment** unlocks once every row has both a rating and a reason.
5. Click **Compare to Reference Rating** to see the chapter's rating and reason
   next to your own, then **Back to My Ratings** to return.
6. Choose a different sample from the menu to start a fresh assessment.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/expression-rubric-rater/main.html"
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

- The face state dictionary and parameterized `draw_face()` from Chapter 9
- The thirteen named expression recipes from Chapter 10
- This chapter's seven Emotional Design Rubric criteria
- Viewing distance readability and classroom lighting consideration

### Activities

1. **Exploration** (5 min): Load design A and design B in turn. Without rating
   anything yet, write one sentence on what the thumbnail shows you that the
   close-up hides.
2. **Guided Practice** (5 min): Fully assess design C, the afraid face borrowed
   from surprised. Submit, compare, and note every criterion where you and the
   reference disagreed.
3. **Assessment** (5 min): Assess design E or F on your own, then propose one
   specific parameter change that would lift its weakest criterion to a pass.

### Assessment

- Completes all seven rows with reasons that name specific parameters
- Agrees with the reference rating on at least five of the seven criteria for
  design C
- Explains why design D can pass six criteria and still be the wrong choice
- Recommends a concrete, numeric fix for a failing criterion

## References

1. [Rubric (academic) - Wikipedia](https://en.wikipedia.org/wiki/Rubric_(academic)) -
   How scoring rubrics turn a judgment call into repeatable criteria.
2. [Human-robot interaction - Wikipedia](https://en.wikipedia.org/wiki/Human%E2%80%93robot_interaction) -
   The field that studies how people actually read a robot's expressions.
3. [Adafruit SSD1306 OLED guide](https://learn.adafruit.com/monochrome-oled-breakouts) -
   Real contrast and size limits of the small display these designs must survive.
4. [p5.js Reference](https://p5js.org/reference/) - The drawing functions behind
   both the close-up and the dimmed classroom-distance rendering.
