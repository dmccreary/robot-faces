---
title: MicroPython Loop Tracer
description: Interactive p5.js MicroSim for micropython loop tracer.
image: /sims/micropython-loop-tracer/micropython-loop-tracer.png
og:image: /sims/micropython-loop-tracer/micropython-loop-tracer.png
twitter:image: /sims/micropython-loop-tracer/micropython-loop-tracer.png
social:
   cards: false
quality_score: 0
---

# MicroPython Loop Tracer

<iframe src="main.html" height="542px" width="100%" scrolling="no"></iframe>

[Run the MicroPython Loop Tracer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Loops are how a robot face blinks five times without you typing five lines of
code. This MicroSim walks you through a short `for` loop and a short `while`
loop one printed line at a time. Before each line appears, you type what you
think the loop will print, and only then does the tracer reveal the answer.
The goal is simple: you should be able to run a loop in your head, one
iteration at a time, and correctly predict every variable value and every
printed line before the computer shows you.

## How to Use

1. Pick an example from the **Example** dropdown: **For Loop** or **While Loop**.
2. Read the code and decide what the very next printed line will be.
3. Type your prediction in the text box, such as `Blink 0` or `Ready 3`.
4. Click **Check**. The tracer tells you whether you were right, adds the real
   line to the output log, and updates the variable table.
5. Click **Next Step** to move to the next iteration and predict again.
6. Click **Reset** at any time to start the selected example over from step 1.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/micropython-loop-tracer/main.html"
        height="542px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Know what a variable is and that it holds a value that can change.
- Know that `print()` sends one line of text to the serial console.
- Understand that indentation marks which lines belong inside a block.
- Be able to read a comparison such as `count > 0` as True or False.

### Activities

1. **Exploration** (5 min): Run the **For Loop** example all the way through
   without guessing carefully. Watch how `i` changes on every pass, and notice
   what value `i` still holds after the loop finishes.
2. **Guided Practice** (5 min): Reset, switch to the **While Loop** example,
   and predict every line before clicking Check. Pause at the last step and
   explain out loud why the loop stops instead of printing `Ready 0`.
3. **Assessment** (5 min): Predict all six lines of the For Loop example with
   no mistakes, then write on paper what `range(3)` would print instead.

### Assessment

- The student correctly predicts at least five of the six For Loop outputs.
- The student explains why `i` equals 4, not 5, after `range(5)` finishes.
- The student identifies the line that makes the `while` loop eventually stop.
- The student states one difference between a `for` loop and a `while` loop.

## References

1. [MicroPython Documentation](https://docs.micropython.org/en/latest/) - the
   official reference for the MicroPython language and its built-in modules.
2. [Python `for` statement reference](https://docs.python.org/3/reference/compound_stmts.html#the-for-statement) -
   the language definition that MicroPython follows for loops.
3. [Control flow (Wikipedia)](https://en.wikipedia.org/wiki/Control_flow) -
   background on loops, conditions, and iteration across programming languages.
4. [p5.js Reference](https://p5js.org/reference/) - the library used to build
   this MicroSim, useful if you want to modify it.
