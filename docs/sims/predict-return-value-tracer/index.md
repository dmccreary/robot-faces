---
title: Predict the Return Value Tracer
description: Interactive p5.js MicroSim for predict the return value tracer.
image: /sims/predict-return-value-tracer/predict-return-value-tracer.png
og:image: /sims/predict-return-value-tracer/predict-return-value-tracer.png
twitter:image: /sims/predict-return-value-tracer/predict-return-value-tracer.png
social:
   cards: false
quality_score: 0
---

# Predict the Return Value Tracer

<iframe src="main.html" height="532px" width="100%" scrolling="no"></iframe>

[Run the Predict the Return Value Tracer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A function hands a value back to whoever called it, and knowing that value in
advance is what separates reading code from guessing at it. This MicroSim shows
four short MicroPython functions with one call each, and asks you to type the
return value before it reveals the answer. Two of the four use a default
parameter value, and one returns two values at once as a tuple. By the end you
should be able to run any of these calls in your head and demonstrate the right
answer before the screen confirms it.

## How to Use

1. Pick one of the four functions from the **Example** dropdown.
2. Read the highlighted call line and the argument values shown beside it.
3. Type the value you think is returned, such as `Low`, `160`, or `64, 32`.
4. Click **Check Prediction**. The Result panel reveals the real return value
   plus a short explanation of how the function got there.
5. Click **Next Example** to move to the next function.
6. Once you have tried two or more examples, a score line appears under the
   code. Click **Reset** to clear the score and start at example 1.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/predict-return-value-tracer/main.html"
        height="532px"
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
- Understand that indentation marks which lines belong to the function body.
- Be able to evaluate a comparison such as `level > 60` as True or False.
- Know that `//` divides two integers and throws away the remainder.

### Activities

1. **Exploration** (5 min): Work through example 1. Trace the `if`, `elif`, and
   `else` branches out loud, and say which one runs for `level = 45` and why the
   other two never execute.
2. **Guided Practice** (5 min): Compare examples 2 and 4, which call the same
   function. Predict both return values, then explain in one sentence what a
   default parameter value actually does.
3. **Assessment** (5 min): Predict example 3 correctly on the first try, then
   write down what `x` and `y` would be if the call were
   `screen_center(240, 240)`.

### Assessment

- The student predicts at least three of the four return values correctly.
- The student explains why `battery_status(45)` returns `"Low"` and not `"Full"`.
- The student states what value `level` takes when `set_brightness()` is called
  with no argument.
- The student explains that `return a, b` hands back one tuple, which a caller
  can unpack into two variables.

## References

1. [MicroPython Documentation](https://docs.micropython.org/en/latest/) - the
   official reference for the MicroPython language.
2. [Python tutorial: defining functions](https://docs.python.org/3/tutorial/controlflow.html#defining-functions) -
   covers parameters, default values, and return statements.
3. [Return statement (Wikipedia)](https://en.wikipedia.org/wiki/Return_statement) -
   background on how functions hand values back to their callers.
4. [Tuple (Wikipedia)](https://en.wikipedia.org/wiki/Tuple) - the data structure
   behind returning two values at once.
