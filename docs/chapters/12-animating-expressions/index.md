---
title: Animating Expressions: Timing & Motion
description: How to make a robot face move without ever freezing — pacing a blinking, gazing animation with ticks_ms() instead of sleep(), then smoothing transitions between expressions.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 15:55:57
version: 0.09
---

# Animating Expressions: Timing & Motion

## Summary

This chapter introduces the animation loop and the timing tools MicroPython provides (sleep and ticks-based timing) to build blinking, eye-scanner gaze movement, expression interpolation, idle animation, and randomized blink timing, while managing frame rate, flicker, and draw-time performance through techniques like double buffering. After completing this chapter, students will be able to add a smooth, non-blocking animation to a robot face and measure its draw performance.

## Concepts Covered

This chapter covers the following 21 concepts from the learning graph:

1. Animation Loop
2. Frame Rate
3. Blinking Animation
4. Eye Scanner Animation
5. Pupil Movement Gaze
6. Timing Loop
7. Sleep Function Timing
8. Expression Interpolation
9. Easing Function
10. Idle Animation
11. Animation State Timer
12. Ticks Function Timing
13. Ticks Diff Calculation
14. Draw Time Benchmarking
15. Frame Buffer Redraw Rate
16. Flicker Reduction
17. Double Buffering
18. Animation Keyframe
19. Randomized Blink Timing
20. Smooth Transition Design
21. Non-Blocking Delay Pattern

## Prerequisites

This chapter builds on concepts from:

- [Chapter 3: MicroPython Fundamentals I: Syntax, Data & Loops](../03-micropython-fundamentals-1/index.md)
- [Chapter 5: Display & Coordinate Systems](../05-display-coordinate-systems/index.md)
- [Chapter 6: Basic Drawing Primitives](../06-basic-drawing-primitives/index.md)
- [Chapter 9: Facial Anatomy & Layout Design](../09-facial-anatomy-layout-design/index.md)
- [Chapter 11: Expression Design, Readability & Human-Robot Interaction](../11-expression-design-readability-hri/index.md)

---

## From Static to Alive

!!! mascot-welcome "Time to Make This Face Move"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Every face you built in Chapters 9 through 11 has been frozen in a single instant — one call to `draw_face()`, one expression, done. This chapter breaks that freeze. By the end of it, the same face will blink on its own, glance around a room, and glide smoothly from a neutral look into a smile.

`draw_face(fb, state)` already does everything a single frame needs: read a dictionary, call `ellipse()` and `poly()` in the right order, push the result to the screen. Animation does not require a new drawing method or a new display trick. It requires calling that exact same function over and over, changing a few numbers in `state` between calls, and controlling precisely when each call happens. That last part — the timing — turns out to be the real subject of this chapter.

## The Heartbeat of Every Animation: The Animation Loop

Chapter 3 taught `while True:` as a way to repeat code forever, and an animated face is one of the most natural uses that loop will ever have. The **animation loop** is the core pattern behind every moving robot face: a `while True:` loop that repeatedly clears the frame buffer, redraws the current state, and shows the result, over and over, for as long as the robot is powered on.

A bridge sentence before the code: this loop redraws a neutral face forever, using nothing but the `draw_face()` function Chapter 9 already built and the plain `while True:` loop Chapter 3 introduced.

```python
state = default_face_state()

while True:
    fb.fill(BLACK)
    draw_face(fb, state)
    fb.show()
```

Nothing in that loop changes `state` yet, so it currently redraws the exact same face thousands of times a second — technically an animation loop, just not a very interesting one. Every technique in the rest of this chapter is really just a different way of editing `state` (or deciding when to redraw) somewhere inside that same three-line pattern: clear, draw, show.

## How Often Is Often Enough? Frame Rate

Redrawing a face as fast as a microcontroller possibly can sounds like a good goal, but it usually is not the right one. **Frame rate** is how many times per second an animation loop redraws the screen, typically measured in frames per second (FPS). Video games often chase 60 FPS because fast-moving action needs to look perfectly fluid, but a robot's face is a very different kind of animation — eyebrows tilting, pupils drifting, an eyelid closing — and none of that motion needs anywhere near that speed to read as smooth and alive to a human viewer.

The following table gives rough, practical targets for the small monochrome and color displays this book uses, not strict requirements.

| Animation Type | Rough Target Frame Rate | Why |
|---|---|---|
| Static or idle face (occasional blink) | 5-10 FPS | Nothing is moving most of the time; redrawing faster wastes battery and CPU |
| Smooth gaze drift or expression transition | 15-30 FPS | Motion is continuous enough that a human eye can perceive stutter below this range |
| Fast blink close/open | 30+ FPS during the blink only | A blink happens in a fraction of a second, so those few frames benefit from a higher momentary rate |

A robot face does not need a single fixed frame rate at all — it is completely reasonable to redraw slowly while idle and briefly speed up during a blink or a transition. That flexibility is exactly why the timing tools later in this chapter matter more than simply "looping as fast as possible."

## The Simple Way to Wait: Sleep Function Timing

The most direct way to control an animation loop's frame rate is to make the loop pause between frames. **Sleep function timing** uses `time.sleep()` (or the MicroPython-specific `utime.sleep_ms()`) to pause a program's execution for a fixed amount of time before continuing — the simplest possible way to pace a loop, and a natural first tool to reach for.

A bridge sentence before the code: this loop blinks a face's eyes every two seconds, using `time.sleep()` to pause between the eyes closing and reopening.

```python
import time

while True:
    fb.fill(BLACK)
    draw_face(fb, state)          # eyes open
    fb.show()
    time.sleep(2)                  # wait two seconds

    fb.fill(BLACK)
    draw_eyelid(fb, left_eye_x, state["eye_y"], state["eye_size"], BLACK)
    draw_eyelid(fb, right_eye_x, state["eye_y"], state["eye_size"], BLACK)
    fb.show()
    time.sleep(0.2)                 # eyes stay closed briefly
```

`time.sleep(2)` takes a number of seconds and accepts fractions, so `time.sleep(0.2)` pauses for two-tenths of a second. MicroPython's own `utime.sleep_ms(200)` does the same thing using whole milliseconds instead, which is often more convenient for the short pauses an animation needs. Either version is easy to read and easy to reason about — which is exactly why `sleep()` is worth learning first, even though this chapter is about to show you why it cannot be the whole story.

## The Catch: Non-Blocking Delay Pattern

That blinking code works, but it hides a serious problem that only shows up once a robot needs to do more than one thing at a time. **Non-blocking delay pattern** describes the design goal that a program's other work — checking a button, reading a sensor, listening for a command — must keep happening even while an animation is pacing itself. The plain `sleep()` approach cannot deliver that, because it blocks: `time.sleep(2)` freezes the *entire* program for two full seconds, and nothing else can run during that time, not even a single line of code checking whether a button was pressed.

A bridge sentence before the code: this loop tries to check a button between animation frames, but the check only ever runs once every two seconds, because `sleep()` blocks everything in between.

```python
import time

while True:
    fb.fill(BLACK)
    draw_face(fb, state)
    fb.show()
    time.sleep(2)                    # the whole program freezes here

    if button.value() == 0:          # this line only runs once every 2 seconds
        handle_button_press()
```

!!! mascot-warning "A Long sleep() Call Is a Deaf Robot"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    While a program sits inside `time.sleep(2)`, it cannot see anything happen in the outside world — not a button press, not a sensor reading, nothing. A student presses a button at exactly the wrong moment, and the robot simply never notices, because the processor was frozen mid-nap. The longer the `sleep()` call, the longer the robot is effectively deaf and blind to everything else going on around it.

This is not a hypothetical inconvenience — it is the exact problem every interactive robot face eventually runs into. A face that blinks beautifully but ignores a button press for two seconds at a time will feel sluggish and unresponsive, even though the blink itself looks fine. Solving this problem, without giving up on timed animation entirely, is the single most important idea in this chapter.

## The Fix: Ticks Function Timing and Ticks Diff Calculation

!!! mascot-thinking "Stop Sleeping. Start Checking the Clock."
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here is the mental shift that unlocks non-blocking animation: instead of telling the program to freeze for a fixed time, you keep the loop running at full speed and simply ask it, on every single pass, "has enough time gone by yet?" If yes, update the animation. If no, skip the update and keep checking everything else — buttons, sensors, whatever else the robot needs to notice.

**Ticks function timing** uses `time.ticks_ms()`, a MicroPython function that returns a free-running millisecond counter — a number that keeps climbing as time passes, similar to a stopwatch that never gets reset. Reading it costs almost no time and never pauses anything. Because that counter is stored in a fixed number of bits, it eventually wraps back around to zero after running long enough, which makes naive subtraction unsafe. **Ticks diff calculation** solves that with `time.ticks_diff(new_time, old_time)`, a function that correctly computes elapsed time between two `ticks_ms()` readings even across a wraparound — always use it instead of plain subtraction when comparing two tick values.

The clearest way to see why this matters is to place the blocking and non-blocking approaches side by side, doing the same job: waiting roughly 300 milliseconds between animation updates while still staying responsive.

```python
import time

# --- Blocking approach: sleep() ---
while True:
    update_animation()
    time.sleep_ms(300)          # program is frozen for the entire 300ms
    if button.value() == 0:     # only ever checked once every 300ms
        handle_button_press()
```

```python
import time

# --- Non-blocking approach: ticks_ms() + ticks_diff() ---
last_update = time.ticks_ms()
UPDATE_INTERVAL_MS = 300

while True:
    now = time.ticks_ms()
    if time.ticks_diff(now, last_update) >= UPDATE_INTERVAL_MS:
        update_animation()
        last_update = now

    if button.value() == 0:     # checked on every single pass through the loop
        handle_button_press()
```

Both versions update the animation about every 300 milliseconds. The difference is everything in between: the `sleep()` version cannot check the button at all during its pause, while the `ticks_ms()` version loops continuously, checking the button on every single pass and only updating the animation when the stored elapsed time actually reaches the target. Watching a simulated button press land inside a `sleep()` window versus a `ticks_ms()` loop makes this difference far more concrete than reading the two code blocks side by side.

#### Diagram: Sleep vs Ticks Button Miss Simulator

<iframe src="../../sims/sleep-vs-ticks-button-miss-simulator/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Sleep vs Ticks Button Miss Simulator</summary>
Type: microsim
**sim-id:** sleep-vs-ticks-button-miss-simulator<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, examine

Learning objective: Differentiate blocking sleep()-based timing from non-blocking ticks_ms()-based timing by examining whether a simulated button press is detected during an animation delay under each approach.

Canvas layout:
- Left 70% (responsive, roughly 460x320 at default width): two stacked panels, top labeled "sleep(300) version" and bottom labeled "ticks_ms() version", each showing a small blinking face icon and a horizontal progress bar representing the current 300ms cycle
- Right 30%: a "Press Button Now" button, a running event log shared by both panels, and a "Reset" button

Visual elements:
- Each panel's progress bar fills left to right over each 300ms cycle and resets to empty when a cycle completes
- A small button icon that flashes yellow the instant "Press Button Now" is clicked
- The sleep() panel's bar turns solid red for the remainder of any cycle during which a press landed mid-bar, since that panel cannot react until the bar finishes
- The ticks_ms() panel flashes green almost immediately wherever in its cycle the press landed, since it checks on every loop pass
- Event log lines such as "t=142ms: button pressed", "t=142ms: sleep() version MISSED until t=300ms", "t=142ms: ticks_ms() version DETECTED at t=145ms"

Interactive controls:
- Button: "Press Button Now" — logs a simulated press at the current simulated time and triggers both panels' reactions simultaneously
- Button: "Reset" — clears the log and restarts both cycles from zero
- Slider: "Loop check interval (ticks_ms panel only)" from 1-50ms, showing how a coarser check interval slightly delays detection even in the non-blocking version

Default parameters: both panels running a continuous 300ms cycle, log empty, check interval 5ms

Behavior: clicking "Press Button Now" at any moment immediately logs the press and shows, panel by panel, exactly when each version actually notices it — instantly (within one loop check) for ticks_ms(), and only at the end of the current sleep() call for the blocking version; repeated presses build up a log the learner can scan to see the pattern hold every time, not just once.

Instructional Rationale: An Analyze-level objective requires differentiating two behaviors triggered by the same action; letting the learner choose exactly when to press the button and immediately seeing each version's detection time isolates the cause of the difference — blocking versus polling — far more clearly than a fixed, non-interactive comparison.

Responsive design: log and controls move below the two panels on viewports narrower than 600 pixels; panels scale to fill their container's width.

Implementation: p5.js for the panel rendering and simulated clock; a shared simulated millisecond counter drives both panels so button-press timing is directly comparable between them.
</details>

## Remembering When You Last Did Something: Timing Loop and Animation State Timer

Checking `ticks_diff()` against a fixed interval, the way the code above just did, is a pattern general enough to deserve its own name. A **timing loop** is a loop structured around repeatedly comparing the current `ticks_ms()` reading against a stored "last time this happened" value, updating something only when enough time has passed. The stored value itself — `last_update` in the example above — is called an **animation state timer**: a piece of state, sitting right alongside a face's other parameters, that tracks *when* an animation last advanced, not just *what* it currently looks like.

A bridge sentence before the code: this small helper function wraps the timing-loop pattern into one reusable check, so any animation can ask "is it time yet?" in a single line.

```python
def time_to_update(last_time_ms, interval_ms):
    """Return True if interval_ms has passed since last_time_ms."""
    now = time.ticks_ms()
    return time.ticks_diff(now, last_time_ms) >= interval_ms
```

Wrapping the comparison in a function like `time_to_update()` means an animation loop's main body reads almost like a sentence: "if it's time to update, update, and remember when." Every animation this chapter builds from here forward — blinking, gazing, transitioning between expressions — stores its own animation state timer and reuses exactly this pattern to decide when to act, never blocking the loop even once.

## Your First Animation: Blinking Animation

With non-blocking timing in hand, it is time to build a real animation instead of a demonstration of timing theory. **Blinking animation** briefly closes and reopens a face's eyes on a timer, reusing Chapter 9's eyelid representation — the quadrant-fill technique that redraws the top half of an eye in the background color to simulate a lowered lid.

A bridge sentence before the code: this loop blinks a face roughly every three seconds, redrawing the eyelids for a brief 150-millisecond window and the open eyes the rest of the time, entirely through non-blocking `ticks_ms()` timing.

```python
import time

BLINK_INTERVAL_MS = 3000     # roughly one blink every 3 seconds
BLINK_DURATION_MS = 150      # how long the eyes stay closed
last_blink_time = time.ticks_ms()
eyes_closed = False

while True:
    now = time.ticks_ms()

    if not eyes_closed and time.ticks_diff(now, last_blink_time) >= BLINK_INTERVAL_MS:
        eyes_closed = True
        last_blink_time = now
    elif eyes_closed and time.ticks_diff(now, last_blink_time) >= BLINK_DURATION_MS:
        eyes_closed = False
        last_blink_time = now

    fb.fill(BLACK)
    draw_face(fb, state)
    if eyes_closed:
        draw_eyelid(fb, left_eye_x, state["eye_y"], state["eye_size"], BLACK)
        draw_eyelid(fb, right_eye_x, state["eye_y"], state["eye_size"], BLACK)
    fb.show()
```

Notice that this loop never once calls `sleep()` — it redraws as fast as the hardware allows, but only *changes* `eyes_closed` when enough time has actually passed. A button check, a sensor read, or any other work could be added right inside this same loop without disturbing the blink timing at all, which is exactly the non-blocking payoff Chapter 12 has been building toward.

## Real Blinks Aren't Metronomes: Randomized Blink Timing

A blink firing at exactly the same 3000-millisecond mark, forever, has a subtle but noticeable problem: it feels mechanical, because real blinking is not perfectly periodic. **Randomized blink timing** uses MicroPython's `random` module to vary the interval between blinks, so a robot's face feels more alive instead of running on a metronome.

A bridge sentence before the code: this version picks a new random interval, somewhere between two and five seconds, every time a blink finishes, instead of reusing one fixed number forever.

```python
import time
import random

BLINK_DURATION_MS = 150
last_blink_time = time.ticks_ms()
next_blink_interval_ms = random.randint(2000, 5000)
eyes_closed = False

while True:
    now = time.ticks_ms()

    if not eyes_closed and time.ticks_diff(now, last_blink_time) >= next_blink_interval_ms:
        eyes_closed = True
        last_blink_time = now
    elif eyes_closed and time.ticks_diff(now, last_blink_time) >= BLINK_DURATION_MS:
        eyes_closed = False
        last_blink_time = now
        next_blink_interval_ms = random.randint(2000, 5000)   # pick a new, different wait

    fb.fill(BLACK)
    draw_face(fb, state)
    if eyes_closed:
        draw_eyelid(fb, left_eye_x, state["eye_y"], state["eye_size"], BLACK)
        draw_eyelid(fb, right_eye_x, state["eye_y"], state["eye_size"], BLACK)
    fb.show()
```

!!! mascot-tip "A Tiny Random Number Buys a Lot of Personality"
    ![Pixel gives a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    `random.randint(2000, 5000)` is one line of code, but it is doing real design work — it is the difference between a face that feels like a wind-up toy and one that feels like it is actually paying attention to the room. Small computational choices like this one shape how alive a robot feels, long before any complicated behavior gets involved.

## Looking Around: Eye Scanner Animation and Pupil Movement Gaze

Blinking moves an eyelid; the next animation moves what is *inside* the eye. **Pupil movement gaze** drives Chapter 9's pupil offset parameter — `gaze_offset_x` in the face-state dictionary — over time, shifting both pupils together so a robot appears to look left, right, or straight ahead. **Eye scanner animation** is the broader pattern this enables: sweeping the gaze back and forth, or toward a target, to make a robot appear to actively look around or track something in its environment.

This is not a made-up trick — Chapter 2 introduced Anki's Cozmo and Vector robots, and both used exactly this technique. Their expressive, oversized digital eyes constantly made small gaze movements, sometimes tracking a face or object, sometimes just idly scanning a room, and that motion was a large part of why people described those small robots as feeling genuinely alive.

A bridge sentence before the code: this loop sweeps `gaze_offset_x` smoothly back and forth between -6 and 6 pixels using a sine wave, updating the value on a non-blocking timer roughly 20 times per second.

```python
import time
import math

last_gaze_update = time.ticks_ms()
GAZE_UPDATE_INTERVAL_MS = 50    # about 20 updates per second
gaze_start_time = time.ticks_ms()

while True:
    now = time.ticks_ms()
    if time.ticks_diff(now, last_gaze_update) >= GAZE_UPDATE_INTERVAL_MS:
        elapsed_seconds = time.ticks_diff(now, gaze_start_time) / 1000
        state["gaze_offset_x"] = int(6 * math.sin(elapsed_seconds))
        last_gaze_update = now

    fb.fill(BLACK)
    draw_face(fb, state)
    fb.show()
```

`math.sin()` naturally rises and falls between -1 and 1, so multiplying it by 6 produces a smooth sweep between -6 and 6 pixels of pupil offset, with no sudden jumps. Combined with the blink animation from the previous section, a face built from these two independent timers already starts to feel like it is paying quiet attention to something, even with zero buttons pressed and zero sensors read.

## Naming a Moment: Animation Keyframe

Both animations so far have jumped between exactly two states — eyes open or eyes closed, gaze left or gaze right — and that pattern is common enough to deserve a name. An **animation keyframe** is a named, specific state at a particular point in time: "eyes fully open" and "eyes fully closed" are the two keyframes of a blink, just as "gaze left" and "gaze right" are the two keyframes of a scan.

A bridge sentence before the code: this pair of dictionaries names two keyframes of an expression change — a neutral face and a happy face — using the same face-state structure Chapter 9 introduced.

```python
keyframe_neutral = {
    "eyebrow_angle": 0,
    "mouth_curvature": 2,
}

keyframe_happy = {
    "eyebrow_angle": 10,
    "mouth_curvature": 8,
}
```

Keyframes describe *where an animation starts and ends*, but say nothing about what happens in between two of them. A blink's two keyframes are close enough together, and the transition fast enough, that the "in between" barely matters. A transition between a neutral face and a happy face is a very different story — and that gap is exactly what the next concept fills in.

## Getting From Here to There Smoothly: Expression Interpolation and Easing Function

Snapping directly from `keyframe_neutral` to `keyframe_happy` in a single frame works, but it looks like a jump cut, not an expression changing. **Expression interpolation** computes intermediate parameter values between two face-state dictionaries over several frames, so a transition plays out smoothly instead of happening instantly. The simplest version of this is **linear interpolation**: at each step, every parameter moves the same fractional distance from its start value toward its end value.

A bridge sentence before the code: this function computes one interpolated face-state dictionary, given a start keyframe, an end keyframe, and a progress value `t` between 0.0 (start) and 1.0 (end).

```python
def interpolate_state(start, end, t):
    """Linearly interpolate every shared key between two face-state dicts."""
    result = {}
    for key in start:
        result[key] = start[key] + (end[key] - start[key]) * t
    return result

# Example: 40% of the way from neutral to happy
mid_state = interpolate_state(keyframe_neutral, keyframe_happy, 0.4)
# {"eyebrow_angle": 4.0, "mouth_curvature": 4.4}
```

Calling `interpolate_state()` with `t` values that climb from 0.0 to 1.0 across, say, twenty frames produces twenty smoothly changing face states instead of one abrupt jump. Linear interpolation moves at a perfectly constant rate — the same fractional step every frame — which already looks far smoother than snapping instantly. An **easing function** goes one step further: instead of feeding `t` directly into `interpolate_state()`, it first reshapes `t` itself, so a transition can start slowly and speed up, or slow down as it approaches its target, rather than moving at that same constant rate the whole way through. This book keeps the math simple — linear interpolation is the baseline every transition in this chapter actually uses — but it is worth knowing easing curves exist for whenever a transition needs to feel less mechanical.

Stepping through the exact intermediate values an interpolation produces, frame by frame, makes the idea click far faster than a formula on its own.

#### Diagram: Expression Interpolation Keyframe Stepper

<iframe src="../../sims/expression-interpolation-keyframe-stepper/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Expression Interpolation Keyframe Stepper</summary>
Type: microsim
**sim-id:** expression-interpolation-keyframe-stepper<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Understand (L2)
Bloom Taxonomy Verb: interpret, exemplify

Learning objective: Interpret how expression interpolation computes intermediate face-state parameter values between two keyframes by stepping through individual frames with concrete numbers, and exemplify how an easing curve changes those values compared to plain linear interpolation.

Canvas layout:
- Left 55% (responsive, roughly 380x300 at default width): a rendered face at the current interpolation step, with a horizontal progress indicator showing step X of N
- Right 45%: the two keyframe dictionaries (start and end) shown as small tables, the current computed `t` value, the resulting interpolated dictionary, and step controls

Visual elements:
- Face rendering at the current step, redrawn only when "Next Step" or "Previous Step" is pressed (no continuous animation)
- Two small readout tables: "Start (neutral)" and "End (happy)" keyframe values for eyebrow_angle and mouth_curvature
- A live line showing the current step's math, e.g. `eyebrow_angle = 0 + (10 - 0) * 0.4 = 4.0`
- A toggle between "Linear" and "Eased (ease-in-out)" showing the same step's `t` value differing between modes, e.g. linear t=0.40 vs eased t=0.21

Interactive controls:
- "Next Step" / "Previous Step" buttons advance or rewind one frame at a time
- Slider: total number of steps in the transition (5-20, default 10)
- Toggle: "Linear" / "Eased (ease-in-out)" interpolation mode
- "Jump to Start" / "Jump to End" buttons snap directly to either keyframe

Default parameters: keyframe_neutral to keyframe_happy transition, 10 total steps, step 0, Linear mode selected

Data Visibility Requirements:

- Stage 1: Show the two full keyframe dictionaries with concrete values before any stepping begins
- Stage 2: Each "Next Step" press shows the current t value and the exact arithmetic for at least one parameter
- Stage 3: Toggling "Eased" at the same step shows the eased t value next to the linear t value, with the face redrawn slightly differently
- Final: Step 10 of 10 shows the interpolated dictionary now matches the end keyframe exactly in both modes

Interaction: Step-through with Next/Previous controls, not automatic animation

Instructional Rationale: This is an Understand-level objective asking the learner to interpret a data transformation, so a step-through interface with the interpolation arithmetic fully visible at each stage is appropriate; continuous animation would hide the concrete per-frame values the learner needs to see to understand how interpolation actually computes each step.

Responsive design: readout tables and controls move below the face view on viewports narrower than 600 pixels; the face view scales to fill its container's width while preserving the OLED's 2:1 aspect ratio.

Implementation: p5.js implementing `interpolate_state()` and a simple ease-in-out easing function as JavaScript equivalents of the MicroPython code taught in this chapter, driven entirely by step-button clicks rather than a frame-based animation timer.
</details>

## Choosing What Deserves a Transition: Smooth Transition Design

Not every change on a robot's face should be interpolated, and not every change should be instant — deciding which is which is itself a design skill. **Smooth transition design** is the practice of choosing, deliberately, which animations should be gradual and interpolated versus instant, based on what a transition is meant to communicate.

The table below captures the reasoning behind that choice for the animations this chapter has already built.

| Transition | Instant or Gradual? | Why |
|---|---|---|
| Blink (eyes closing) | Instant snap between keyframes | A real blink is fast; interpolating it would just look like slow, sleepy blinking instead of a normal one |
| Neutral to happy expression | Gradual, interpolated over several frames | A sudden mood swing reads as jarring or even alarming; a gradual shift reads as a real change in feeling |
| Gaze drift (pupil movement) | Gradual, continuous motion | A pupil that teleports between positions looks broken; smooth motion is what makes gaze feel like looking |
| Emergency or alert expression | Instant snap | Urgency should read immediately — a slow fade into a warning face undercuts the point of a warning |

The underlying question worth asking for any new animation is simple: does this change communicate something sudden, like a startle or an alert, or does it communicate something that unfolds, like a mood shifting? The answer decides whether that animation belongs on the instant-keyframe side of this chapter or the interpolated side.

## Alive Even When Idle: Idle Animation

A robot that only moves when explicitly told to do something still risks looking like a switched-off screen the rest of the time. **Idle animation** is a small amount of continuous, subtle motion — occasional blinks, a little gaze drift — that plays whenever a robot is not doing anything else in particular, keeping the face from ever looking frozen or dead.

Every piece needed for idle animation already exists earlier in this chapter: randomized blink timing and pupil movement gaze, running side by side, both driven by their own animation state timer, both entirely non-blocking. Chapter 14 later builds a full expression menu on top of this same idea, treating "idle" as just one more selectable expression state alongside "happy," "surprised," or "worried" — this chapter's job is only to make sure idle itself looks convincingly alive first.

## How Long Does a Frame Actually Take? Draw Time Benchmarking and Frame Buffer Redraw Rate

!!! mascot-encourage "Measuring Code Is a Skill Worth Building Now"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Timing your own code with a stopwatch function might feel like a strange new skill to add on top of everything else this chapter has covered, but it is a genuinely useful habit — one real embedded programmers reach for constantly. A few lines of measurement code is all it takes, and the payoff is knowing, with real numbers, whether an animation idea will actually run smoothly on the hardware you have.

Every animation in this chapter depends on drawing calls finishing quickly enough to keep up with the loop's timing. **Frame buffer redraw rate** is how frequently a program actually finishes drawing and calling `.show()` on a frame buffer, in practice — which is not automatically the same as the frame rate a program is aiming for, since a slow set of drawing calls can quietly hold that actual rate back. **Draw time benchmarking** measures exactly how long a single frame's drawing calls take, using `time.ticks_us()`, a microsecond-resolution counterpart to `ticks_ms()`, precise enough to time even a handful of fast `ellipse()` calls.

A bridge sentence before the code: this snippet measures how long one complete `draw_face()` call actually takes, in microseconds, by reading `ticks_us()` immediately before and after the call.

```python
import time

start_us = time.ticks_us()
fb.fill(BLACK)
draw_face(fb, state)
fb.show()
end_us = time.ticks_us()

draw_time_us = time.ticks_diff(end_us, start_us)
print("Frame draw time:", draw_time_us, "microseconds")
```

That single measurement is useful on its own, but it becomes genuinely informative once it is used to compare techniques — exactly the kind of benchmarking Chapter 6 first hinted at when it introduced `blit()` as a faster alternative to redrawing shapes from scratch. Comparing measured draw times across a few real techniques shows, in concrete numbers, why that claim holds up.

#### Diagram: Draw Call Benchmark Chart

<iframe src="../../sims/draw-call-benchmark-chart/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Draw Call Benchmark Chart</summary>
Type: chart
**sim-id:** draw-call-benchmark-chart<br/>
**Library:** Chart.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: examine, differentiate, compare

Learning objective: Analyze draw-time benchmarking data comparing full-primitive redraws against blitted-sprite redraws for a complete face frame, to differentiate which technique costs more microseconds per frame and examine why.

Chart type: Bar chart

Purpose: Show measured `ticks_us()` draw-time results for different ways of redrawing one animation frame, connecting the abstract "blit is faster" claim from Chapter 6 to concrete numbers relevant to this chapter's animation loops

X-axis: Technique
- "Full redraw, primitives only" (ellipse/poly calls for every feature, every frame)
- "Full redraw, blitted sprites" (pre-rendered eye/mouth sprites copied with blit())
- "Partial redraw, primitives" (only the eyelid region redrawn for a blink)
- "Partial redraw, blitted sprite" (only a small eyelid sprite blitted for a blink)

Y-axis: Draw time (microseconds per frame)

Data series (single series, one bar per technique):
- Full redraw, primitives only: 3,400 microseconds
- Full redraw, blitted sprites: 1,150 microseconds
- Partial redraw, primitives: 480 microseconds
- Partial redraw, blitted sprite: 190 microseconds

Title: "Draw Time per Frame: Primitives vs. Blitting"
Legend: not required (single series); axis labels suffice

Interactive elements:
- Hovering any bar shows a tooltip with the exact microsecond value and the equivalent maximum possible frame rate (1,000,000 / microseconds), e.g. "3,400 microseconds -> up to ~294 FPS theoretical max"
- Toggle: "Show as frames-per-second equivalent" re-renders the Y-axis and bar heights as maximum theoretical FPS instead of microseconds, so the learner can see the same data from both angles
- Clicking a bar highlights it and shows a one-sentence explanation in a side panel (e.g. "Partial redraw only touches the pixels that actually changed, avoiding the cost of redrawing an entire face every frame")

Annotations:
- Dashed reference line at the microsecond value equivalent to 20 FPS (50,000 microseconds), labeled "Well within budget for every technique shown here" — reassures the learner that even the slowest option easily supports this chapter's animation targets

Color scheme: teal bars for primitive-based techniques, coral bars for blit-based techniques, consistent with the mascot's color identity

Implementation: Chart.js bar chart with a custom tooltip callback for the FPS-equivalent conversion and a click handler that updates a side-panel explanation element
</details>

## Why the Screen Doesn't Flicker: Flicker Reduction and Double Buffering

One last practical question remains: why does redrawing a face many times a second not produce a visibly flickery, choppy mess on screen? **Flicker reduction** is the general goal of avoiding that visible choppiness, and the specific technique behind it is **double buffering** — maintaining an off-screen buffer that gets fully drawn before it is ever shown, instead of drawing new shapes directly onto whatever is currently on the display.

Without double buffering, a display redrawn feature-by-feature — background, then eyebrows, then eyes, then mouth — would briefly show each half-finished intermediate state to a viewer, since a real screen refreshes itself constantly regardless of what the drawing code is doing. Double buffering avoids that by finishing the *entire* frame somewhere the viewer cannot see it, and only then pushing the completed result to the actual screen in one clean step.

Chapter 5 already introduced this exact idea, just not by this name. The `framebuf` module's frame buffer, combined with a single `.show()` call at the end of a drawing sequence, already *is* double buffering — every drawing call in this chapter has been writing into an off-screen buffer in memory, and `fb.show()` is the one moment that buffer's finished contents get pushed out to the physical display. This chapter's animation loops have been flicker-free from the very first example, entirely because of a pattern Chapter 5 set up long before any of this animation code existed.

- Every `fb.fill()`, `ellipse()`, `poly()`, and `draw_eyelid()` call in this chapter writes only into memory, never directly to the screen
- `fb.show()` is the single moment a frame's changes actually become visible, all at once
- Calling `.show()` too often, or drawing directly to a display without a buffer, is what causes visible flicker on hardware that supports it — a mistake this book's `framebuf`-based pattern avoids by default

## Putting It All Together: A Blinking, Gazing, Non-Blocking Face

Every idea in this chapter converges into one loop: randomized blinking and a gentle idle gaze drift, running together, timed entirely with `ticks_ms()` and `ticks_diff()`, never once blocking the program with `sleep()`.

A bridge sentence before the code: this combined loop tracks two independent animation state timers — one for blinking, one for gaze — updating each on its own schedule while remaining free to check other things, like a button, on every single pass.

```python
import time
import random
import math

state = default_face_state()

BLINK_DURATION_MS = 150
last_blink_time = time.ticks_ms()
next_blink_interval_ms = random.randint(2000, 5000)
eyes_closed = False

GAZE_UPDATE_INTERVAL_MS = 50
last_gaze_update = time.ticks_ms()
gaze_start_time = time.ticks_ms()

while True:
    now = time.ticks_ms()

    # --- blink timer ---
    if not eyes_closed and time.ticks_diff(now, last_blink_time) >= next_blink_interval_ms:
        eyes_closed = True
        last_blink_time = now
    elif eyes_closed and time.ticks_diff(now, last_blink_time) >= BLINK_DURATION_MS:
        eyes_closed = False
        last_blink_time = now
        next_blink_interval_ms = random.randint(2000, 5000)

    # --- gaze timer ---
    if time.ticks_diff(now, last_gaze_update) >= GAZE_UPDATE_INTERVAL_MS:
        elapsed_seconds = time.ticks_diff(now, gaze_start_time) / 1000
        state["gaze_offset_x"] = int(4 * math.sin(elapsed_seconds * 0.5))
        last_gaze_update = now

    # --- draw the current frame ---
    fb.fill(BLACK)
    draw_face(fb, state)
    if eyes_closed:
        draw_eyelid(fb, left_eye_x, state["eye_y"], state["eye_size"], BLACK)
        draw_eyelid(fb, right_eye_x, state["eye_y"], state["eye_size"], BLACK)
    fb.show()

    # --- still free to check other things, every single pass ---
    if button.value() == 0:
        handle_button_press()
```

Read that loop from top to bottom one more time: two independent animation state timers, each compared with `ticks_diff()` against its own interval, each updating a small piece of `state` only when it is actually time — and a button check sitting right at the bottom, guaranteed to run on every single pass no matter what the blink or gaze timers are doing. This is the entire non-blocking animation pattern this chapter has been building toward, and it is now sitting in one file, ready to run on real hardware.

## Chapter Summary

You now know how to turn a static, parameterized face into a moving one, without ever freezing the program that draws it.

- The animation loop is a `while True:` loop that repeatedly clears, redraws, and shows a frame buffer; frame rate is how often that loop actually redraws per second, and small robot faces rarely need more than 10-30 FPS.
- Sleep function timing (`time.sleep()`, `utime.sleep_ms()`) is the simplest way to pace a loop, but it exposes the non-blocking delay pattern problem: a `sleep()` call freezes the entire program, so a button press or sensor read cannot be checked while it runs.
- Ticks function timing (`time.ticks_ms()`) and ticks diff calculation (`time.ticks_diff()`) solve that problem by reading a free-running millisecond counter and safely computing elapsed time, even across a wraparound, without ever blocking the loop.
- A timing loop compares the current tick count against a stored animation state timer to decide when to advance an animation, forming the non-blocking backbone every animation in this chapter uses.
- Blinking animation closes and reopens an eye on a timer using Chapter 9's eyelid representation; randomized blink timing varies that timer's interval with the `random` module so blinking feels alive instead of mechanical.
- Eye scanner animation and pupil movement gaze drive the `gaze_offset_x` parameter over time so a face appears to look around, the same core technique Cozmo and Vector used for their expressive digital eyes.
- An animation keyframe is a named, specific state, like "eyes open" or "eyes closed"; expression interpolation computes intermediate values between two keyframes over several frames, with linear interpolation as the simple baseline and easing functions as an optional way to shape that motion's pacing.
- Smooth transition design is the practice of choosing which changes should be instant (a blink, an alert) versus gradual (a mood shift, a gaze drift); idle animation combines subtle blinking and gaze drift into continuous motion that plays whenever a robot is not doing anything else.
- Draw time benchmarking uses `ticks_us()` to measure how long a frame's drawing calls actually take, revealing a face's real frame buffer redraw rate rather than just its intended frame rate.
- Flicker reduction is achieved through double buffering — finishing a frame entirely off-screen before showing it — which the `framebuf` module and its `.show()` method already provide by default, a pattern first introduced back in Chapter 5.

!!! mascot-celebration "This Face Is Officially Alive"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Look at what just happened: the exact same `draw_face()` function from Chapter 9, called inside a loop timed with nothing but `ticks_ms()` and a little arithmetic, now blinks on its own schedule and glances around a room — and it never once stops listening for a button press while it does it. That is the real trick behind every expressive robot face you have ever seen blink at you.

??? question "Self-Check: A blink animation and a neutral-to-happy expression change both need to look good on screen, but this chapter treats them very differently in terms of timing. Why does a blink snap instantly between keyframes while an expression change gets interpolated over several frames? — Click to reveal"
    This is smooth transition design in action. A real blink is fast and communicates nothing gradual — interpolating it would just make the eyes look slow and sleepy instead of performing a normal, quick blink, so it snaps directly between its "open" and "closed" keyframes. A mood change, like shifting from a neutral face to a happy one, is meant to read as a feeling developing over a moment, and snapping it instantly would feel jarring or even alarming, the same way a person's expression suddenly changing without warning looks unsettling. Expression interpolation computes intermediate face-state values between the two keyframes across several frames specifically so that kind of transition unfolds smoothly instead of jumping. The underlying design question is always the same: does this change communicate something sudden, or something that unfolds — and the answer decides whether it belongs on the instant side or the interpolated side of this chapter.
