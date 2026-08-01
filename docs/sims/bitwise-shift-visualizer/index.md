---
title: Bitwise Operator and Shift Visualizer
description: Interactive p5.js MicroSim for bitwise operator and shift visualizer.
image: /sims/bitwise-shift-visualizer/bitwise-shift-visualizer.png
og:image: /sims/bitwise-shift-visualizer/bitwise-shift-visualizer.png
twitter:image: /sims/bitwise-shift-visualizer/bitwise-shift-visualizer.png
social:
   cards: false
quality_score: 0
---

# Bitwise Operator and Shift Visualizer

<iframe src="main.html" height="472px" width="100%" scrolling="no"></iframe>

[Run the Bitwise Operator and Shift Visualizer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Inside a frame buffer, eight pixels of your robot's face are packed into a
single byte. To turn one of those pixels on without disturbing the other seven,
you need bitwise operators. This MicroSim gives you eight clickable bit squares
for operand A, eight more for operand B, and a result row that recalculates the
instant you change anything. Your goal is to be able to calculate the result of
`&`, `|`, `^`, `<<`, and `>>` on an 8-bit value yourself, and to show exactly
how each bit position changes.

## How to Use

1. Click any square in the **Operand A** row to flip that bit between 0 and 1.
   The decimal value beside the label updates right away.
2. Do the same in the **Operand B** row when a two-operand operator is selected.
3. Choose an operator from the **Operator** dropdown: AND, OR, XOR, Left Shift,
   or Right Shift.
4. Hover over any column to see that single column's math, such as `1 & 0 = 0`.
5. For Left Shift or Right Shift, drag the **Shift amount** slider from 0 to 7
   and watch the bits slide sideways while zeros fill the vacated side.
6. Click **Reset** to return to A = `0b00000101`, B = `0b00000011`, operator AND.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/bitwise-shift-visualizer/main.html"
        height="472px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Read a binary number such as `0b00000101` and convert it to decimal.
- Know that one byte holds eight bits, numbered 7 down to 0.
- Understand that a frame buffer stores pixels as bits packed into bytes.
- Be comfortable with MicroPython variables and integer literals.

### Activities

1. **Exploration** (5 min): Set A to `0b11110000` and B to `0b00001111`, then
   step through AND, OR, and XOR. Write down what each operator does to a
   column where the two input bits differ.
2. **Guided Practice** (5 min): Switch to Left Shift with A = `0b00000101`.
   Predict the decimal result for shift amounts 1, 2, and 3 before moving the
   slider, then state the rule connecting shifting left to multiplying.
3. **Assessment** (5 min): Using only the operators here, describe how you
   would turn on bit 3 of a byte while leaving the other seven bits unchanged,
   then verify your answer in the MicroSim.

### Assessment

- The student calculates `0b00001100 & 0b00001010` correctly before checking.
- The student explains that XOR gives 1 only when the two input bits differ.
- The student states that `x << 1` doubles a value and `x >> 1` halves it.
- The student explains why bits shifted past bit 7 are lost in an 8-bit value.

## References

1. [Bitwise operation (Wikipedia)](https://en.wikipedia.org/wiki/Bitwise_operation) -
   a clear overview of AND, OR, XOR, and the two shift operators.
2. [MicroPython Documentation](https://docs.micropython.org/en/latest/) - the
   official reference for MicroPython, including integer behavior.
3. [MicroPython `framebuf` module](https://docs.micropython.org/en/latest/library/framebuf.html) -
   the module that packs monochrome pixels into bytes on your display.
4. [Python expressions: binary bitwise operations](https://docs.python.org/3/reference/expressions.html#binary-bitwise-operations) -
   the language rules MicroPython follows for these operators.
