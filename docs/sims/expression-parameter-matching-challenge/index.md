---
title: Build This Expression Challenge
description: Interactive p5.js MicroSim for build this expression challenge.
image: /sims/expression-parameter-matching-challenge/expression-parameter-matching-challenge.png
og:image: /sims/expression-parameter-matching-challenge/expression-parameter-matching-challenge.png
twitter:image: /sims/expression-parameter-matching-challenge/expression-parameter-matching-challenge.png
social:
   cards: false
quality_score: 0
---

# Build This Expression Challenge

<iframe src="main.html" height="547px" width="100%" scrolling="no"></iframe>

[Run the Build This Expression Challenge MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

The sim names one of this chapter's thirteen expressions and hands you four sliders. Your job is to apply the recipe you just learned and build that face yourself, then check how close you got. Scoring uses an acceptable range for each parameter, not one exact value, because several reasonable builds should all count as correct. When a build misses, the feedback names the single parameter that is furthest off and which way to move it.

## How to Use

1. Read the banner at the top. It names your target expression and gives a one-line description.
2. Drag the **Eyebrow angle** slider from -30 to 30 degrees. Positive values raise each brow's outer end.
3. Drag the **Eye size** slider from 4 to 16 to widen or narrow both eyes.
4. Drag the **Pupil position** slider from -10 to 10 to shift the gaze sideways.
5. Drag the **Mouth curvature** slider from -10 to 10, and check **Mouth open** when the expression needs a real opening.
6. Press **Check My Build** to see your match percentage, the one parameter to fix next, and a reference face that scores 100%.
7. Press **New Challenge** to reset the sliders to neutral and draw a different target.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/expression-parameter-matching-challenge/main.html"
        height="547px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Chapter 9's `draw_face()` function and the face state dictionary it reads.
- Chapter 9's four expression parameters: eyebrow angle, eye size, gaze offset, and mouth curvature.
- This chapter's thirteen-expression recipe table, which describes each target in words.
- This chapter's Emotion Recognition Accuracy discussion, which explains why some builds feel harder than others.

### Activities

1. **Exploration** (5 min): Build the Happy target, then press New Challenge until Sad appears and build that. Write down exactly which two parameters you changed between the two builds.
2. **Guided Practice** (5 min): Take on Angry and Stern back to back. Record the eyebrow angle and eye size you used for each, and explain in one sentence what keeps the two faces apart.
3. **Assessment** (5 min): Work through three random challenges. For each, aim to reach 100% in three or fewer Check My Build presses by acting on the feedback line each time.

### Assessment

- The student scores 85% or higher on at least three different target expressions.
- The student can explain why an acceptable range scores better than a single exact value for this kind of task.
- The student can predict, before pressing Check My Build, which parameter the feedback will call out.
- The student can name one expression from the set that these four sliders cannot fully build, and explain what is missing.

## References

1. [Facial expression - Wikipedia](https://en.wikipedia.org/wiki/Facial_expression) - how eyebrow, eye, and mouth position combine into a recognizable emotion.
2. [Paul Ekman - Wikipedia](https://en.wikipedia.org/wiki/Paul_Ekman) - the universal emotion research behind several of these targets.
3. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) - the `ellipse()` and `poly()` calls that draw this face on real hardware.
4. [p5.js `arc()` reference](https://p5js.org/reference/p5/arc/) - how the half-ellipse mouth curve is produced in this simulation.
