---
title: Polling vs Interrupt Response Simulator
description: Interactive p5.js MicroSim for polling vs interrupt response simulator.
image: /sims/polling-vs-interrupt-response-simulator/polling-vs-interrupt-response-simulator.png
og:image: /sims/polling-vs-interrupt-response-simulator/polling-vs-interrupt-response-simulator.png
twitter:image: /sims/polling-vs-interrupt-response-simulator/polling-vs-interrupt-response-simulator.png
social:
   cards: false
quality_score: 0
---

# Polling vs Interrupt Response Simulator

<iframe src="main.html" height="452px" width="100%" scrolling="no"></iframe>

[Run the Polling vs Interrupt Response Simulator MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Two timelines here share one simulated clock and one simulated button, so the only thing that differs is how each approach watches the pin. **Polling** means your loop reads the button at fixed moments, and the tick marks show exactly when those moments are. An **interrupt** is a handler the hardware calls the instant the pin changes, so the interrupt timeline has no ticks at all. Your job is to differentiate the two by examining presses of different lengths and timings and deciding whether each approach detects them.

The interesting case is a very short press that starts and ends in the gap between two polling ticks. Build that case yourself and the polling panel reports MISSED while the interrupt panel still reports CAUGHT.

## How to Use

1. Watch the yellow cursor sweep both timelines. That cursor is the shared clock.
2. Drag **Press duration** to set how long your finger holds the button, from 5 ms to 500 ms.
3. Drag **Loop check interval** to set how often the polling loop reads the pin. The tick marks respread as you drag.
4. Click **Press Button Now** to press at the moving cursor, or click directly on either timeline to place a press at that exact instant.
5. Read the verdict line in each panel and the three-line record in the event log.
6. Click **Reset** to clear both timelines and the log.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/polling-vs-interrupt-response-simulator/main.html"
        height="452px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Reading a digital input pin with `Pin.value()`, from earlier in Chapter 13
- Knowing that a `while True:` loop runs its body over and over
- Understanding that `time.ticks_ms()` returns a free-running millisecond counter, from Chapter 12
- Knowing that a blocking call like `sleep()` stops the loop from doing anything else, from Chapter 12

### Activities

1. **Exploration** (5 min): Leave the defaults at 20 ms press duration and 50 ms check interval. Press ten times using **Press Button Now** and tally how many the polling panel caught. Explain why the same settings sometimes catch and sometimes miss.
2. **Guided Practice** (5 min): Set **Press duration** to 5 ms, then click on a timeline exactly halfway between two tick marks. Predict the verdict before you click, then check both panels and the log.
3. **Assessment** (5 min): Find the smallest press duration that the polling loop catches every single time at a 100 ms check interval. Write one sentence explaining the rule you discovered.

### Assessment

- The student states that a polling loop can only detect a press that is still held when a check tick arrives.
- The student states that an interrupt handler fires at the leading edge of the press, so press duration does not matter.
- The student predicts that a press shorter than the check interval can be missed, and a press longer than the check interval never can.
- The student explains one real robot-face consequence of a missed press, such as a mode button that seems to work only some of the time.

## References

1. [Polling (computer science) - Wikipedia](https://en.wikipedia.org/wiki/Polling_(computer_science)) - The repeated-checking pattern the top panel uses.
2. [Interrupt - Wikipedia](https://en.wikipedia.org/wiki/Interrupt) - How hardware pauses your program to run a handler immediately.
3. [MicroPython machine.Pin documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html) - The `value()` method used for polling and the `irq()` method used to attach an interrupt handler.
4. [p5.js Reference](https://p5js.org/reference/) - The JavaScript library used to build this MicroSim.
