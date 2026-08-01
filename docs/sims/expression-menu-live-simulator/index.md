---
title: Expression Menu Live Simulator
description: Interactive p5.js MicroSim for expression menu live simulator.
image: /sims/expression-menu-live-simulator/expression-menu-live-simulator.png
og:image: /sims/expression-menu-live-simulator/expression-menu-live-simulator.png
twitter:image: /sims/expression-menu-live-simulator/expression-menu-live-simulator.png
social:
   cards: false
quality_score: 0
---

# Expression Menu Live Simulator

<iframe src="main.html" height="682px" width="100%" scrolling="no"></iframe>

[Run the Expression Menu Live Simulator MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

This is a working expression menu you can operate without any hardware on your
desk. Two simulated push buttons and one rotary knob run the same logic as the
chapter's final MicroPython program: one button advances through the thirteen
named expressions, the other toggles live-tuning mode, and the knob reshapes
the mouth curve while tuning is on. Your goal here is to demonstrate that whole
program's behavior by operating it, and then to construct your own control
mapping and watch what that decision costs or buys a user.

Watch for three things the code alone cannot show you. The name label flashes
for half a second after every advance, the surprised expression overshoots its
eyebrow angle to 40 before settling at 30, and the face drops back to its
default idle state once the idle timeout passes with no input.

## How to Use

1. Click the **NEXT** button to advance one expression at a time. The name
   flashes on screen and the state dictionary on the right updates instantly.
2. Keep clicking until you reach **surprised**, and watch `eyebrow_angle` jump
   to 40 for 150 milliseconds before settling to 30. That is the state-based
   animation trigger firing.
3. Click **TUNE** to turn live-tuning mode on. The knob brightens the moment
   tuning is enabled, because a dimmed knob means turning it does nothing.
4. Drag the **knob** left or right to rewrite `mouth_curve` live, and watch the
   mouth reshape on the very next frame.
5. Drag the **Idle timeout** slider down to 1 or 2 seconds, then stop touching
   anything. The IDLE badge appears and the face returns to neutral and blinks.
6. Check **Advanced: remap controls**, then drag a teal function label from one
   control onto another to swap what those two controls do.
7. Click **Reset Menu** to return to neutral with the chapter's default
   control mapping.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/expression-menu-live-simulator/main.html"
        height="682px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Chapter 9's parameterized face state: one dictionary of numbers, such as
  `eyebrow_angle` and `mouth_curve`, describes a whole expression.
- Chapter 10's thirteen named expressions and the recipes behind them.
- Chapter 12's animation loop and its "compare elapsed time to a threshold"
  timing pattern.
- Chapter 13's mode state machine, which this menu extends into browsing,
  tuning, and idle modes.

### Activities

1. **Exploration** (5 min): Click NEXT through all thirteen expressions once,
   writing down the `eyebrow_angle` and `mouth_curve` values for neutral,
   happy, sad, angry, and surprised. Compare your list against the chapter's
   `EXPRESSIONS` dictionary and confirm every number matches.
2. **Guided Practice** (5 min): Turn tuning mode on and drag the knob until the
   happy face reads as sad without touching NEXT. Record the `mouth_curve`
   value where the expression flips. Then set the idle timeout to 2 seconds and
   let the menu fall back to idle, noting what the face does while idling.
3. **Assessment** (5 min): Turn on remap mode and move the Adjust function onto
   a push button. Operate the menu for a minute, then write one sentence
   explaining why the chapter mapped a continuous value to a knob instead.

### Assessment

- The student can state which button performs which function and why the
  chapter assigned the most frequent action to the simplest control.
- The student can describe what a state-based animation trigger does, using the
  surprised eyebrow overshoot as the example.
- The student can explain why the knob appears dimmed until tuning mode is on,
  and why that gate is a deliberate design decision rather than a bug.
- The student can predict what the face will show after the idle timeout
  elapses, and name the variable in the chapter's code that controls it.

## References

1. [Switch (bounce) - Wikipedia](https://en.wikipedia.org/wiki/Switch#Contact_bounce) -
   Explains the mechanical contact bounce that makes button debouncing necessary.
2. [Rotary encoder - Wikipedia](https://en.wikipedia.org/wiki/Rotary_encoder) -
   Background on incremental encoders and the quadrature signal this menu's
   knob simulates.
3. [MicroPython machine.Pin documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html) -
   The API used to read the real buttons and encoder pins behind this menu.
4. [MicroPython time.ticks_ms documentation](https://docs.micropython.org/en/latest/library/time.html) -
   The millisecond clock behind the debounce cooldown and the idle timeout.
