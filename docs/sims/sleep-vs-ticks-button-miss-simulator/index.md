---
title: Sleep vs Ticks Button Miss Simulator
description: Interactive p5.js MicroSim for sleep vs ticks button miss simulator.
image: /sims/sleep-vs-ticks-button-miss-simulator/sleep-vs-ticks-button-miss-simulator.png
og:image: /sims/sleep-vs-ticks-button-miss-simulator/sleep-vs-ticks-button-miss-simulator.png
twitter:image: /sims/sleep-vs-ticks-button-miss-simulator/sleep-vs-ticks-button-miss-simulator.png
social:
   cards: false
quality_score: 0
---

# Sleep vs Ticks Button Miss Simulator

<iframe src="main.html" height="407px" width="100%" scrolling="no"></iframe>

[Run the Sleep vs Ticks Button Miss Simulator MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Two robot faces blink the exact same way here, on the exact same 300 millisecond cycle, driven by one shared clock. The only difference is how each one waits: the top panel calls `sleep(300)` and the bottom panel checks `ticks_ms()` on every loop pass. Your job is to press the button at a moment of your choosing and examine how long each version takes to notice, then work out what causes the gap. The event log keeps a running record so you can confirm the pattern holds on every press, not just the lucky one.

The simulated clock runs five times slower than real hardware so you can aim your press at a specific point in the cycle.

## How to Use

1. Watch both progress bars fill from 0 ms to 300 ms. That bar is one animation cycle.
2. Press **Press Button Now**, or click anywhere in the drawing area, at any moment you like.
3. Watch the `sleep()` bar turn red from your press point to the end of the cycle. That red stretch is time the program cannot look at the button.
4. Watch the `ticks_ms()` panel flash green almost immediately, then read both delay values in the event log.
5. Drag **ticks_ms() check interval** up toward 50 ms and press again. Notice that the non-blocking version gets slower too, but never as slow as blocking.
6. Press **Reset** to clear the log and start both cycles over.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/sleep-vs-ticks-button-miss-simulator/main.html"
        height="407px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knowing that `time.sleep()` pauses the whole program, from Chapter 3
- Knowing that `time.ticks_ms()` returns a free-running millisecond counter, from earlier in Chapter 12
- Knowing that `time.ticks_diff()` measures elapsed time safely between two readings, from earlier in Chapter 12
- Understanding that a `while True:` loop runs its body over and over

### Activities

1. **Exploration** (5 min): Press the button five times at different points in the cycle. Record the delay for each version each time. Which version's delay changes a lot, and which stays small?
2. **Guided Practice** (5 min): Try to press right at the very start of a cycle, then right at the very end. Explain why the blocking version's delay is huge in one case and tiny in the other, while the non-blocking version barely changes.
3. **Assessment** (5 min): Set the check interval to 50 ms and press a few more times. Write two sentences explaining the difference between a program that is blocked and a program that is simply checking less often.

### Assessment

- The student states that the `sleep()` version cannot detect a press until the current sleep call finishes.
- The student states that the `ticks_ms()` version detects a press within one check interval, no matter where in the cycle the press lands.
- The student predicts the worst-case delay for each version: up to 300 ms when blocking, and up to one check interval when polling.
- The student explains that raising the check interval slows detection without ever blocking the loop.
- The student identifies at least one real consequence of a missed press, such as a robot that ignores its own button while animating.

## References

1. [MicroPython time module documentation](https://docs.micropython.org/en/latest/library/time.html) - The `sleep()`, `ticks_ms()`, and `ticks_diff()` functions compared in this MicroSim.
2. [Polling (computer science) - Wikipedia](https://en.wikipedia.org/wiki/Polling_(computer_science)) - The repeated-checking pattern the non-blocking version uses.
3. [Blocking (computing) - Wikipedia](https://en.wikipedia.org/wiki/Blocking_(computing)) - Why a paused program cannot respond to anything until it resumes.
4. [Event loop - Wikipedia](https://en.wikipedia.org/wiki/Event_loop) - The general idea behind a loop that keeps checking for input while other work continues.
5. [p5.js Reference](https://p5js.org/reference/) - The JavaScript library used to build this MicroSim.
