---
title: Quiz - Animating Expressions
description: Ten multiple-choice questions covering animation loops, frame rate, blocking versus non-blocking timing, blinking, gaze, keyframes, interpolation, benchmarking, and double buffering.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Animating Expressions — Timing & Motion

Test your understanding of how to make a robot face blink, gaze, and change expression without ever freezing the program that draws it.

---

#### 1. What is the fundamental problem with pacing an animation loop using `time.sleep(2)`?

<div class="upper-alpha" markdown>
1. It drifts out of sync, so the delay is never exactly two seconds
2. It only accepts whole seconds, so short pauses are impossible
3. It freezes the entire program, so nothing else — a button check, a sensor read — can run during the pause
4. It clears the frame buffer as a side effect, erasing the current face
</div>

??? question "Show Answer"
    The correct answer is **C**. While a program sits inside `sleep()`, it cannot see anything happen in the outside world. A student presses a button mid-nap and the robot simply never notices. `sleep()` also accepts fractions such as `sleep(0.2)`, which rules out option B — the problem is blocking, not precision.

    **Concept Tested:** Non-Blocking Delay Pattern

    **See:** [The Catch: Non-Blocking Delay Pattern](index.md#the-catch-non-blocking-delay-pattern)

---

#### 2. Why should elapsed time be computed with `time.ticks_diff(now, last)` rather than plain subtraction?

<div class="upper-alpha" markdown>
1. Because the millisecond counter eventually wraps back to zero, which makes naive subtraction give wrong results
2. Because subtraction is not defined for the integers `ticks_ms()` returns
3. Because `ticks_diff()` also pauses the loop for the requested interval
4. Because plain subtraction returns seconds while `ticks_diff()` returns milliseconds
</div>

??? question "Show Answer"
    The correct answer is **A**. `ticks_ms()` is a free-running counter stored in a fixed number of bits, so after running long enough it rolls over. `ticks_diff()` handles that wraparound correctly. It also costs almost no time and never pauses anything, which is exactly what makes non-blocking timing possible.

    **Concept Tested:** Ticks Diff Calculation

    **See:** [The Fix: Ticks Function Timing](index.md#the-fix-ticks-function-timing-and-ticks-diff-calculation)

---

#### 3. Given `keyframe_neutral = {"eyebrow_angle": 0, "mouth_curvature": 2}` and `keyframe_happy = {"eyebrow_angle": 10, "mouth_curvature": 8}`, what does `interpolate_state(neutral, happy, 0.4)` return?

<div class="upper-alpha" markdown>
1. `{"eyebrow_angle": 0.4, "mouth_curvature": 0.4}`
2. `{"eyebrow_angle": 10, "mouth_curvature": 8}`
3. `{"eyebrow_angle": 6.0, "mouth_curvature": 3.6}`
4. `{"eyebrow_angle": 4.0, "mouth_curvature": 4.4}`
</div>

??? question "Show Answer"
    The correct answer is **D**. Linear interpolation computes `start + (end - start) * t` for each key: eyebrow_angle is 0 + (10 − 0) × 0.4 = 4.0, and mouth_curvature is 2 + (8 − 2) × 0.4 = 4.4. Option C reverses the direction, returning the values at t = 0.6 instead.

    **Concept Tested:** Expression Interpolation

    **See:** [Getting From Here to There Smoothly](index.md#getting-from-here-to-there-smoothly-expression-interpolation-and-easing-function)

---

#### 4. Why does varying the blink interval with `random.randint(2000, 5000)` matter?

<div class="upper-alpha" markdown>
1. It prevents the millisecond counter from wrapping around during long runs
2. Real blinking is not perfectly periodic, so a fixed interval makes the face feel mechanical
3. It reduces the number of drawing calls the loop must make each second
4. It is required because `ticks_diff()` cannot compare against a constant
</div>

??? question "Show Answer"
    The correct answer is **B**. One line of randomness is doing real design work: it is the difference between a face that feels like a wind-up toy and one that feels like it is paying attention to the room. Small computational choices like this shape how alive a robot feels long before any complicated behavior is involved.

    **Concept Tested:** Randomized Blink Timing

    **See:** [Real Blinks Are Not Metronomes](index.md)

---

#### 5. Why do the animation loops in this chapter never flicker, even redrawing many times per second?

<div class="upper-alpha" markdown>
1. Because the OLED driver chip smooths transitions between frames automatically
2. Because the frame rate is kept below the threshold at which flicker becomes visible
3. Because every drawing call writes to an off-screen buffer, and `fb.show()` reveals the finished frame all at once
4. Because `fb.fill()` synchronizes the loop with the display's refresh cycle
</div>

??? question "Show Answer"
    The correct answer is **C**. That is double buffering, and the `framebuf` module has provided it since Chapter 5 — just not by that name. Without it, a viewer would briefly glimpse each half-finished intermediate state as features were drawn one at a time. Calling `.show()` only once per completed frame is what keeps the display clean.

    **Concept Tested:** Double Buffering

    **See:** [Why the Screen Does Not Flicker](index.md)

---

#### 6. Which pair of animations should be instant rather than gradually interpolated?

<div class="upper-alpha" markdown>
1. Gaze drift and a neutral-to-happy mood shift
2. A neutral-to-happy mood shift and a gaze drift toward a target
3. Gaze drift and an eye blink
4. An eye blink and an emergency alert expression
</div>

??? question "Show Answer"
    The correct answer is **D**. Smooth transition design asks whether a change communicates something sudden or something that unfolds. A real blink is fast, and interpolating it just looks sleepy; an alert must read immediately, and a slow fade undercuts the warning. Mood shifts and gaze motion both unfold, so both are interpolated.

    **Concept Tested:** Smooth Transition Design

    **See:** [Choosing What Deserves a Transition](index.md#choosing-what-deserves-a-transition-smooth-transition-design)

---

#### 7. What is an animation keyframe?

<div class="upper-alpha" markdown>
1. The single frame in which a program calls `fb.show()`
2. A named, specific state at a particular point in time, such as "eyes fully open" or "eyes fully closed"
3. A stored timestamp marking when an animation last advanced
4. The maximum number of frames a buffer can hold before it must be cleared
</div>

??? question "Show Answer"
    The correct answer is **B**. Keyframes describe where an animation starts and ends but say nothing about what happens between two of them. Option C describes an animation state timer, a separate idea that tracks *when* an animation last advanced rather than *what* it looks like.

    **Concept Tested:** Animation Keyframe

    **See:** [Naming a Moment: Animation Keyframe](index.md#naming-a-moment-animation-keyframe)

---

#### 8. In the chapter's combined blinking-and-gazing loop, how often does the button check at the bottom actually run?

<div class="upper-alpha" markdown>
1. On every single pass through the loop, regardless of what the blink and gaze timers are doing
2. Once every 150 milliseconds, matching the blink duration
3. Only when both the blink timer and the gaze timer fire on the same pass
4. Once every 50 milliseconds, matching the gaze update interval
</div>

??? question "Show Answer"
    The correct answer is **A**. That is the whole payoff of non-blocking timing. The loop never sleeps — it runs at full speed and each timer only *changes state* when `ticks_diff()` says enough time has passed. The button check sits outside every timer condition, so it executes on each iteration no matter what else is scheduled.

    **Concept Tested:** Non-Blocking Delay Pattern

    **See:** [Putting It All Together](index.md#putting-it-all-together-a-blinking-gazing-non-blocking-face)

---

#### 9. Why does a robot face rarely need the 60 FPS that video games target?

<div class="upper-alpha" markdown>
1. Because the SPI bus cannot transmit a full frame faster than about 10 times per second
2. Because MicroPython cannot execute a loop more than 30 times per second
3. Because face motion — a tilting eyebrow, a drifting pupil, a closing eyelid — reads as smooth well below that rate, and redrawing faster wastes battery and CPU
4. Because the OLED driver rejects `.show()` calls made more than 30 times per second
</div>

??? question "Show Answer"
    The correct answer is **C**. An idle face with occasional blinks reads fine at 5–10 FPS; smooth gaze drift or an expression transition wants 15–30 FPS. A face does not even need one fixed rate — redrawing slowly while idle and speeding up briefly during a blink is entirely reasonable, which is why flexible timing matters more than raw speed.

    **Concept Tested:** Frame Rate

    **See:** [How Often Is Often Enough? Frame Rate](index.md#how-often-is-often-enough-frame-rate)

---

#### 10. How do you measure how long a single frame's drawing calls actually take?

<div class="upper-alpha" markdown>
1. Count the number of `ellipse()` and `poly()` calls and multiply by a fixed per-call cost
2. Read `time.ticks_us()` immediately before and after the drawing calls, then compare them with `ticks_diff()`
3. Subtract the target frame rate from the achieved frame rate
4. Call `fb.show()` twice and measure the delay the display driver reports
</div>

??? question "Show Answer"
    The correct answer is **B**. `ticks_us()` is the microsecond-resolution counterpart to `ticks_ms()`, precise enough to time even a handful of fast `ellipse()` calls. Draw time benchmarking reveals a face's real frame buffer redraw rate, which is not automatically the same as the frame rate the program is aiming for.

    **Concept Tested:** Draw Time Benchmarking

    **See:** [How Long Does a Frame Actually Take?](index.md#how-long-does-a-frame-actually-take-draw-time-benchmarking-and-frame-buffer-redraw-rate)
