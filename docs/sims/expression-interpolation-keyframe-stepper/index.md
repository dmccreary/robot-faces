---
title: Expression Interpolation Keyframe Stepper
description: Interactive p5.js MicroSim for expression interpolation keyframe stepper.
image: /sims/expression-interpolation-keyframe-stepper/expression-interpolation-keyframe-stepper.png
og:image: /sims/expression-interpolation-keyframe-stepper/expression-interpolation-keyframe-stepper.png
twitter:image: /sims/expression-interpolation-keyframe-stepper/expression-interpolation-keyframe-stepper.png
social:
   cards: false
quality_score: 0
---

# Expression Interpolation Keyframe Stepper

<iframe src="main.html" height="522px" width="100%" scrolling="no"></iframe>

[Run the Expression Interpolation Keyframe Stepper MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A smooth expression change is really just a stack of small arithmetic steps, and this MicroSim slows that stack down until you can read every one. It walks the face from `keyframe_neutral` to `keyframe_happy` one frame at a time, showing the progress value `t` and the exact `interpolate_state()` math behind each parameter. Your goal is to interpret how those in-between values get computed, and to see for yourself how an easing curve reshapes `t` without ever changing where the transition ends. Nothing moves on its own here, so you can sit on any single frame as long as you like.

## How to Use

1. Press **Next Step** to advance one frame, and **Previous** to back up. The face redraws only when you press a button.
2. Read the `now` column of the table and the arithmetic below it. Both come from the same formula the chapter uses.
3. Switch **Interpolation** to **Eased (ease-in-out)** and compare the two `t` lines at the same step. The active mode is shown in black, the other in gray.
4. Drag **Total steps** between 5 and 20 to change how many frames the transition takes.
5. Press **Jump to End** and confirm that both modes land on exactly `eyebrow_angle: 10.00` and `mouth_curvature: 8.00`.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/expression-interpolation-keyframe-stepper/main.html"
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

- Reading a dictionary of face-state parameters such as `eyebrow_angle` and `mouth_curvature`, from Chapter 9
- Knowing that `draw_face(fb, state)` redraws the whole face from one dictionary, from Chapter 9
- Knowing what an animation keyframe is, from earlier in Chapter 12
- Comfort with the arithmetic of a fraction times a difference, such as `(10 - 0) * 0.4`

### Activities

1. **Exploration** (5 min): Starting at step 0, press **Next Step** five times in Linear mode. Write down `t` and both parameter values at each step. What amount does `eyebrow_angle` gain every single step, and why is it always the same?
2. **Guided Practice** (5 min): Stop at step 4 of 10 and note the linear `t`. Switch to **Eased (ease-in-out)** without changing the step. Record the new `t`, then describe how the face looks different at that same frame number.
3. **Assessment** (5 min): Set **Total steps** to 20 and press **Jump to End**. Compare the final dictionary in both modes and explain in one or two sentences why easing changes every frame in the middle but never changes the last one.

### Assessment

- The student states that `t` is the step number divided by the total number of steps, and that it always runs from 0.0 to 1.0.
- The student reads one arithmetic line correctly, for example `eyebrow_angle = 0 + (10 - 0) * 0.40 = 4.00`.
- The student states that linear interpolation adds the same amount every step, while easing adds less near the ends and more in the middle.
- The student confirms that both modes finish on the exact end keyframe, because `ease(1.0)` equals `1.0`.
- The student explains that raising the total step count makes each individual change smaller and the transition smoother.

## References

1. [Linear interpolation - Wikipedia](https://en.wikipedia.org/wiki/Linear_interpolation) - The formula `start + (end - start) * t` that this MicroSim shows one line at a time.
2. [Inbetweening - Wikipedia](https://en.wikipedia.org/wiki/Inbetweening) - The animation practice of filling frames between two keyframes, which interpolation automates.
3. [Smoothstep - Wikipedia](https://en.wikipedia.org/wiki/Smoothstep) - The ease-in-out curve `3t^2 - 2t^3` used by the eased mode here.
4. [MicroPython framebuf module documentation](https://docs.micropython.org/en/latest/library/framebuf.html) - The drawing calls that turn each interpolated face state into pixels.
5. [p5.js Reference](https://p5js.org/reference/) - The JavaScript library used to build this MicroSim.
