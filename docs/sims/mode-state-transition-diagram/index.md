---
title: Mode State Transition Diagram
description: Interactive vis-network MicroSim for mode state transition diagram.
image: /sims/mode-state-transition-diagram/mode-state-transition-diagram.png
og:image: /sims/mode-state-transition-diagram/mode-state-transition-diagram.png
twitter:image: /sims/mode-state-transition-diagram/mode-state-transition-diagram.png
social:
   cards: false
quality_score: 0
---

# Mode State Transition Diagram

<iframe src="main.html" height="482px" width="100%" scrolling="no"></iframe>

[Run the Mode State Transition Diagram MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

A state transition diagram is a small map of everything a program can be doing and every way it can switch. This one shows the three-mode cycle Chapter 13 builds: NEUTRAL_MODE, GAZE_MODE, and ADJUST_MODE, connected by three arrows that all mean the same thing. Your goal is to explain each mode and each arrow in your own words, so click every box and every arrow and read what turns up. The whole cycle runs on one button and one variable, which is a surprisingly small amount of machinery for a robot that behaves three different ways.

## How to Use

1. Click a mode box to open its constant value, what the face does in that mode, and the code line that selects it.
2. Click an arrow to see the trigger and the exact lines of MicroPython that reassign `current_mode`.
3. Hover over any box or arrow for a quick label before you commit to clicking it.
4. Drag a box to rearrange the diagram, and use the navigation buttons in the corner to pan or zoom.
5. Click the empty background to clear the selection and return to the overview.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/mode-state-transition-diagram/main.html"
        height="482px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knowing that a variable stores exactly one value at a time, from Chapter 3
- Knowing how `if` and `elif` choose between branches, from Chapter 3
- Knowing that a button read with `Pin.PULL_UP` falls from 1 to 0 when pressed, from earlier in Chapter 13
- Knowing what edge detection means, from earlier in Chapter 13

### Activities

1. **Exploration** (5 min): Click all three mode boxes and write down each constant value. Then follow the arrows with your finger and say the cycle out loud, starting from NEUTRAL_MODE.
2. **Guided Practice** (5 min): Click each arrow and copy its code line. Arrange the three lines into a single `if` / `elif` / `else` block, then compare yours to the loop at the end of the chapter.
3. **Assessment** (5 min): Starting in NEUTRAL_MODE, predict the value of `current_mode` after four button presses. Check your answer by walking the arrows, then explain why the answer repeats every three presses.

### Assessment

- The student correctly names all three modes and their constant values 0, 1, and 2.
- The student states that every arrow is triggered by the same event, a single short button press.
- The student explains that `current_mode` holds exactly one mode at a time.
- The student traces four presses from NEUTRAL_MODE and lands on GAZE_MODE, explaining that the cycle wraps after three.
- The student describes what the face does in at least two of the three modes.

## References

1. [Finite-state machine - Wikipedia](https://en.wikipedia.org/wiki/Finite-state_machine) - The general computing idea behind naming a fixed set of modes and the rules for moving between them.
2. [State diagram - Wikipedia](https://en.wikipedia.org/wiki/State_diagram) - How diagrams like this one are drawn and read.
3. [MicroPython machine.Pin documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html) - Reading the button pin whose HIGH-to-LOW edge triggers every transition here.
4. [vis-network Documentation](https://visjs.github.io/vis-network/docs/network/) - The JavaScript graph library used to build this MicroSim.
