---
title: Global vs Local Scope Call Stack Explorer
description: Interactive p5.js MicroSim for global vs local scope call stack explorer.
image: /sims/scope-call-stack-explorer/scope-call-stack-explorer.png
og:image: /sims/scope-call-stack-explorer/scope-call-stack-explorer.png
twitter:image: /sims/scope-call-stack-explorer/scope-call-stack-explorer.png
social:
   cards: false
quality_score: 0
---

# Global vs Local Scope Call Stack Explorer

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run the Global vs Local Scope Call Stack Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Here is the bug that catches almost everyone: you set `eye_size = 20` inside a
function, the function runs, and your robot's eyes stay exactly the same size.
This MicroSim steps through a tiny `grow_eyes()` function one line at a time and
draws two boxes, one for the global scope and one for the local scope, so you
can see which variable each assignment really changes. Flip between the version
without `global` and the version with it, and you will be able to tell a local
variable from a global one that happens to share its name.

## How to Use

1. Leave the **Version** dropdown on **Without global** for your first run.
2. Click **Step** to execute one line. The highlighted line shows where you are.
3. Watch the Global Scope box, which is always on screen, and the Local Scope
   box, which appears only while `grow_eyes()` is running.
4. Read the note under the boxes at each step. It says which variable that line
   actually changed.
5. Click **Reset**, switch the dropdown to **With global**, and step through
   again. Compare the two runs at the moment the assignment executes.
6. Notice the final console output: `10` in one version and `20` in the other.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/scope-call-stack-explorer/main.html"
        height="502px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Know how to define a function with `def` and call it by name.
- Understand that an assignment such as `eye_size = 10` creates a variable.
- Know that `print()` sends one line of text to the console.
- Be able to trace a short program line by line, as in the Loop Tracer MicroSim.

### Activities

1. **Exploration** (5 min): Step all the way through the **Without global**
   version. Stop at the step where the Local Scope box shows `eye_size = 20` and
   write down what the Global Scope box says at that same moment.
2. **Guided Practice** (5 min): Reset, switch to **With global**, and step to
   the same assignment line. Describe in one sentence what the arrow between the
   two boxes is showing you.
3. **Assessment** (5 min): Predict the console output for each version before
   stepping to the final line, then explain the difference in your own words.

### Assessment

- The student predicts that the version without `global` prints `10`.
- The student explains that assigning inside a function creates a local variable
  unless `global` says otherwise.
- The student defines shadowing: a local name hiding a global name.
- The student states when the local scope is created and when it is discarded.

## References

1. [MicroPython Documentation](https://docs.micropython.org/en/latest/) - the
   official reference for the MicroPython language.
2. [Python reference: the `global` statement](https://docs.python.org/3/reference/simple_stmts.html#the-global-statement) -
   the exact rule MicroPython follows for global declarations.
3. [Scope (computer science) (Wikipedia)](https://en.wikipedia.org/wiki/Scope_(computer_science)) -
   background on how programming languages decide which variable a name means.
4. [Variable shadowing (Wikipedia)](https://en.wikipedia.org/wiki/Variable_shadowing) -
   the specific behavior this MicroSim makes visible.
