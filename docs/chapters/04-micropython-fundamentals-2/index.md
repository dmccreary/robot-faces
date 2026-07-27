---
title: MicroPython Fundamentals II: Functions & the FrameBuf Module
description: An introduction to conditional logic, function definitions with parameters and return values, bitwise operators, string formatting, and a first conceptual look at the FrameBuf module.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 14:12:02
version: 0.09
---

# MicroPython Fundamentals II: Functions & the FrameBuf Module

## Summary

Building on Part I, this chapter introduces conditional statements, function definitions with parameters and return values, bitwise operators and bit shifting, and string formatting — then closes with a first look at the FrameBuf module that every display-drawing chapter from here on depends on. After completing this chapter, students will be able to write a parameterized MicroPython function and explain what the FrameBuf module is for.

## Concepts Covered

This chapter covers the following 12 concepts from the learning graph:

1. Function Definition
2. Function Parameter
3. Function Return Value
4. Conditional Statement
5. Bitwise Operator
6. Bit Shifting
7. FrameBuf Module
8. String Formatting
9. Default Parameter Value
10. Multiple Return Values
11. Global Versus Local Scope
12. Docstring Convention

## Prerequisites

This chapter builds on concepts from:

- [Chapter 3: MicroPython Fundamentals I: Syntax, Data & Loops](../03-micropython-fundamentals-1/index.md)

---

## From Storing Data to Making Decisions

!!! mascot-welcome "Ready for the Fun Part"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Chapter 3 gave you variables, loops, and collections — the raw materials of a program. This chapter turns those materials into reusable tools: code that makes decisions and functions you can call again and again. By the end, you'll understand the exact building block `draw_face()` is made from.

Chapter 3 ended with `happy_face`, a dictionary bundling `eye_size`, `eyebrow_angle`, and `mouth_curve` into one named expression. That dictionary is data, sitting quietly until something acts on it. This chapter teaches the two skills that turn data like that into behavior: **conditional statements**, which let a program choose between different actions, and **function definitions**, which package a block of code under one reusable name.

Everything in this chapter points toward a single destination: a function called `draw_face()`, introduced properly starting in Chapter 9, that reads a set of parameters and redraws an entire expression from them. You will not write that function yet. Instead, you will build every skill it depends on — decisions, parameters, return values, and a conceptual look at the frame buffer a face gets drawn into — on smaller, simpler examples first.

## Making Decisions: Conditional Statements

Every program you wrote in Chapter 3 ran the exact same lines every time, from top to bottom, with no branching. Real robot-face code needs to behave differently depending on circumstances — dimming the display when a battery runs low, or choosing a different expression depending on how recently a button was pressed. A **conditional statement** is a block of code that runs only when a specified condition evaluates to `True`, using the boolean data type you met in Chapter 3.

MicroPython spells a conditional statement with the keywords `if`, `elif` (short for "else if"), and `else`. Only one branch of an `if`/`elif`/`else` chain ever runs: MicroPython checks each condition from top to bottom and executes the first branch whose condition is `True`, skipping every branch after it.

Here's a bridge before the code: this example checks a robot's battery level and prints a different message depending on which range that level falls into.

```python
battery_level = 45

if battery_level < 20:
    print("Battery low - dim the display")
elif battery_level < 60:
    print("Battery normal - full brightness")
else:
    print("Battery full - show a charging animation")
```

Running that code prints `Battery normal - full brightness`, because `45` fails the first condition (`45 < 20` is `False`) but passes the second (`45 < 60` is `True`). The `else` branch is a catch-all: it runs only when every earlier condition was `False`, and it never needs a condition of its own.

Conditional statements are built from **comparison operators**, which compare two values and produce a boolean result — exactly the kind of value Chapter 3's boolean data type was designed to hold. The table below is worth skimming once as a reference rather than memorizing right away.

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `==` | Equal to | `battery_level == 100` | `True` if exactly 100 |
| `!=` | Not equal to | `battery_level != 0` | `True` if not zero |
| `<` | Less than | `battery_level < 20` | `True` if under 20 |
| `>` | Greater than | `battery_level > 80` | `True` if over 80 |
| `<=` | Less than or equal to | `battery_level <= 20` | `True` if 20 or under |
| `>=` | Greater than or equal to | `battery_level >= 80` | `True` if 80 or over |

You can also combine multiple conditions with `and` and `or` — `battery_level > 20 and battery_level < 60` is `True` only when both sides are `True`. Later chapters lean on this pattern constantly, so it is worth trying a few combinations in Thonny's REPL now.

## Functions: Packaging Code You Can Reuse

Copying and pasting the battery-level conditional above every place a program needs it would be tedious and error-prone — change the low-battery threshold in one copy, forget the other three, and now your robot behaves inconsistently. A **function definition** solves this by giving a block of code a name, so it can be written once and reused anywhere.

A function definition starts with the `def` keyword, followed by a name, a pair of parentheses, and a colon; every line in the function's body is indented one level, exactly the way a loop's body is indented. Writing a function definition does not run its code — MicroPython only runs the body when the function is later *called* by writing its name followed by parentheses.

A bridge before the code: this function packages the battery-message logic from the previous section under the name `describe_battery`, so it can be called instead of retyped.

```python
def describe_battery(level):
    if level < 20:
        print("Battery low - dim the display")
    elif level < 60:
        print("Battery normal - full brightness")
    else:
        print("Battery full - show a charging animation")

describe_battery(45)
describe_battery(90)
```

The word `level` inside the parentheses is a **function parameter**: a named placeholder that receives whatever value is passed in when the function is called. Calling `describe_battery(45)` sends `45` into the function as `level`, and calling it again with `90` reuses the exact same code with a different value — the whole point of writing a function in the first place.

!!! mascot-thinking "One Function, Every Battery Level"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Notice what just happened: one function definition now handles every possible battery level, instead of three copies of the same conditional scattered through your program. This is exactly the trick `draw_face()` will use later — one function, many expressions, driven entirely by the values passed in as parameters.

Printing a message from inside a function is useful, but it only ever displays text — it hands nothing back to the code that called it. A **function return value** is a value a function sends back to its caller using the `return` keyword, so the result can be stored in a variable, printed, or passed into another function.

Here's the bridge: this version of the battery function returns a short status word instead of printing a full sentence, letting the caller decide what to do with it.

```python
def battery_status(level):
    if level < 20:
        return "low"
    elif level < 60:
        return "normal"
    else:
        return "full"

status = battery_status(45)
print("Current battery status:", status)
```

`return` immediately exits the function and hands the matching string back to whoever called it — here, that value is captured in the variable `status` and printed afterward. Unlike `print()`, which only displays a value on the screen, `return` makes a value available for further use elsewhere in the program, which is why almost every useful function you write from now on will end with a `return` statement.

## Default Parameter Values: Sensible Defaults, Optional Overrides

Not every parameter needs a value supplied at every call. A **default parameter value** is a fallback value assigned in the function definition itself, used automatically whenever the caller leaves that argument out.

A bridge before the code: this function sets a display's brightness, using `80` as a sensible default so most calls can omit the argument entirely.

```python
def set_brightness(level=80):
    print("Setting display brightness to", level)

set_brightness()
set_brightness(50)
```

The first call, `set_brightness()`, supplies no argument at all, so MicroPython falls back to the default and prints `Setting display brightness to 80`. The second call, `set_brightness(50)`, overrides that default and prints `50` instead. Default parameter values let a function support a common case with a short, simple call while still allowing a caller to be specific when needed — a pattern later chapters use constantly for expression functions where most parameters usually stay the same.

## Multiple Return Values: Handing Back More Than One Answer

Some calculations naturally produce more than one useful result at once — a pixel coordinate, for instance, needs both an X position and a Y position. MicroPython lets a single `return` statement send back **multiple return values** separated by commas, which the language automatically bundles into a tuple, the same unchangeable collection type introduced in Chapter 3.

Here's the bridge: this function calculates the center point of a rectangular screen and returns both coordinates at once.

```python
def screen_center(width, height):
    x = width // 2
    y = height // 2
    return x, y

center_x, center_y = screen_center(128, 64)
print("Center point:", center_x, center_y)
```

That code prints `Center point: 64 32` — `screen_center` returns the tuple `(64, 32)`, and writing two variable names on the left of the equals sign unpacks it, assigning `64` to `center_x` and `32` to `center_y` in one line. This exact pattern — a function returning an (x, y) pair — reappears constantly once drawing chapters begin computing pixel positions for eyes and pupils.

Now that functions, parameters, defaults, and multiple return values have all been introduced, tracing what a function actually returns — before running it — is a skill worth practicing deliberately.

#### Diagram: Predict the Return Value Tracer

<iframe src="../../sims/predict-return-value-tracer/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Predict the Return Value Tracer</summary>
Type: microsim
**sim-id:** predict-return-value-tracer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: execute, demonstrate

Learning objective: Execute a short MicroPython function definition mentally, given specific argument values, and demonstrate correct prediction of its return value, including cases using a default parameter value or multiple return values.

Canvas layout:
- Left 55%: a short function definition (selectable from four pre-written examples) with a call site shown below it
- Right 45%: a "Predict" input area, a call-arguments readout, and a "Reveal" result panel

Visual elements:
- Code listing showing the function definition and one call, with the call's argument values highlighted
- A "Predict the return value" text input box
- A result panel, hidden until the learner submits a prediction, showing the actual returned value(s) and a short explanation of how the function reached that result
- A running score readout ("3 of 4 correct") once more than one example has been tried

Interactive controls:
- Dropdown: "Example" with four choices — (1) `battery_status(level)` with plain if/elif/else, (2) `set_brightness(level=80)` called with no argument, exercising the default parameter value, (3) `screen_center(width, height)` returning two values, (4) `set_brightness(level=80)` called with an explicit override value
- Text input for the learner's predicted return value
- "Check Prediction" button reveals the actual result and explanation
- "Next Example" button advances to the next of the four examples
- "Reset" button returns to example 1

Default parameters: Example 1 selected, prediction field empty, result panel hidden

Data Visibility Requirements:
  Stage 1: Show the function definition and the exact call being made, with argument values visible
  Stage 2: Learner types a prediction and clicks Check Prediction
  Stage 3: Reveal panel shows the actual return value(s), and for the multiple-return-value example, shows the returned tuple before and after unpacking into two variable names
  Stage 4: Score readout updates and the learner can advance to the next example

Interaction: Step-through with Predict/Check/Next controls, not automatic animation

Instructional Rationale: The Apply-level objective (execute, demonstrate) requires the learner to actively trace a function call to its result before seeing the answer confirmed, which a predict-then-reveal pattern supports directly. Including a default-parameter example and a multiple-return-value example in the same rotation lets one interaction reinforce three related concepts instead of testing them in isolation.

Responsive design: code listing and prediction panel stack vertically below 600 pixels wide; the dropdown remains fully visible at every width.

Implementation: p5.js for layout and rendering; a small lookup table maps each of the four examples to its correct return value and explanation string, checked against the learner's typed prediction with simple string comparison.
</details>

## Global Versus Local Scope

Variables created inside a function behave differently from variables created outside one, and that difference causes one of the most common bugs a new programmer writes. **Global versus local scope** describes where in a program a variable's name is visible and usable: a variable created inside a function is **local**, existing only while that function runs and invisible everywhere else, while a variable created outside every function is **global**, visible throughout the entire program.

The trap appears the moment a function tries to *change* a global variable using a plain assignment. Here's a bridge before the code: this example defines `eye_size` as a global variable, then tries to grow it from inside a function.

```python
eye_size = 10

def grow_eyes():
    eye_size = 20
    print("Inside function:", eye_size)

grow_eyes()
print("Outside function:", eye_size)
```

This prints `Inside function: 20` followed by `Outside function: 10` — the global `eye_size` never actually changed. The line `eye_size = 20` inside the function did not modify the global variable at all; it silently created a brand-new *local* variable that happens to share the same name, and that local copy disappeared the moment `grow_eyes()` finished running.

!!! mascot-warning "The Global Variable That Wasn't"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    This is one of the sneakiest bugs in beginning Python: assigning to a name inside a function always creates a new local variable, even if a global variable with the same name already exists. MicroPython never warns you — it just quietly uses the local copy, and your global stays untouched.

Fixing this requires telling MicroPython, explicitly, that an assignment inside a function should modify the global variable instead of creating a local one. The `global` keyword does exactly that, declared on its own line before the variable is used.

```python
eye_size = 10

def grow_eyes():
    global eye_size
    eye_size = 20

grow_eyes()
print("Outside function:", eye_size)
```

With `global eye_size` declared first, the assignment inside `grow_eyes()` now modifies the same variable defined outside the function, and this version correctly prints `20`. As a general habit, most functions in this book pass values in as parameters and hand results back with `return` instead of reaching out to modify a global variable — it keeps a function's behavior easier to predict, since everything it depends on is visible right there in its parameter list.

The table below summarizes the difference now that both cases have been demonstrated in code.

| | Local Variable | Global Variable |
|---|---|---|
| Created | Inside a function body | Outside every function |
| Visible from | Only inside that function | Anywhere in the program |
| Lifetime | Exists only while the function runs | Exists for the whole program run |
| Modifying from inside a function | Plain assignment works normally | Requires a `global` declaration first |

Watching a function's local variables appear and disappear, separately from a program's global variables, makes this rule far easier to remember than reading about it alone.

#### Diagram: Global vs Local Scope Call Stack Explorer

<iframe src="../../sims/scope-call-stack-explorer/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Global vs Local Scope Call Stack Explorer</summary>
Type: microsim
**sim-id:** scope-call-stack-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, examine

Learning objective: Differentiate global variables from local variables by examining, step by step, which variable a given assignment inside a function actually modifies, including the case where a local variable shadows a global one of the same name.

Canvas layout:
- Left 60%: the `grow_eyes()` code example (toggle between the buggy version without `global` and the fixed version with `global eye_size`) with the current executing line highlighted
- Right 40%: two stacked boxes — a "Global Scope" box at the top listing global variables and their current values, and a "Local Scope: grow_eyes()" box below it that appears only while the function is executing

Visual elements:
- Global Scope box, always visible, showing `eye_size = 10` before the call
- Local Scope box that animates into view when `grow_eyes()` is called and animates out when it returns
- In the buggy version, the Local Scope box shows its own `eye_size = 20`, with a visual connector confirming it is a separate variable from the global one
- In the fixed version, no separate local `eye_size` appears; instead an arrow points from the local scope directly into the Global Scope box's `eye_size`, which updates to 20 in place

Interactive controls:
- Toggle: "Version: Without global / With global"
- "Step" button advances execution one line at a time
- "Reset" button returns to the first line, global scope showing only `eye_size = 10`

Default parameters: "Without global" version selected, step 0, Global Scope showing `eye_size = 10`, Local Scope box hidden

Data Visibility Requirements:
  Stage 1: Show only the Global Scope box with eye_size = 10, function not yet called
  Stage 2: grow_eyes() is called; Local Scope box appears, initially empty
  Stage 3: the assignment line executes; in the buggy version a local eye_size = 20 appears in the Local Scope box while the Global Scope box's eye_size stays 10; in the fixed version the Global Scope box's eye_size updates directly to 20
  Stage 4: the function returns; Local Scope box disappears; final print statement shows the Global Scope box's current eye_size value

Instructional Rationale: The Analyze-level objective requires examining exactly which variable an assignment affects and differentiating a shadowed local variable from the global it appears to modify, so a two-box scope visualization with step-by-step execution makes the otherwise invisible mechanism of variable shadowing directly observable.

Responsive design: Global Scope and Local Scope boxes stack vertically below 600 pixels wide, appearing beneath the code listing rather than beside it.

Implementation: p5.js for the code listing, scope boxes, and step-by-step highlighting; a small state object tracks which scope currently owns each variable name and drives the box animations.
</details>

## Docstring Convention: Documenting What a Function Does

A function's name and parameters hint at what it does, but they rarely explain everything a future reader — including you, weeks later — needs to know. The **docstring convention** is the standard Python practice of writing a short, triple-quoted string as the very first line inside a function's body, describing what the function does, what its parameters mean, and what it returns.

Here's a bridge before the code: this version of `battery_status` adds a one-line docstring describing its purpose, directly beneath the `def` line.

```python
def battery_status(level):
    """Return 'low', 'normal', or 'full' based on the battery level (0-100)."""
    if level < 20:
        return "low"
    elif level < 60:
        return "normal"
    return "full"
```

A docstring is just a string literal — MicroPython does not execute it as a command — but placing it directly after the `def` line lets tools and other programmers find it instantly. This book uses short, one-line docstrings throughout; longer functions in professional Python code often use several lines describing each parameter in detail, but a single clear sentence is enough for most of the functions you will write in this course.

## Thinking in Bits: Bitwise Operators and Bit Shifting

Every value stored in a Pico's memory is ultimately a sequence of individual bits, each one either a `0` or a `1`, and MicroPython gives you tools to work with those bits directly instead of treating a number only as a whole. A **bitwise operator** compares or combines two numbers one bit position at a time, rather than treating each number as a single value the way `+` or `*` do.

The three bitwise operators you will meet most often are `&` (AND), `|` (OR), and `^` (XOR). AND keeps a `1` only where both numbers have a `1` in that position; OR keeps a `1` where either number has a `1`; XOR keeps a `1` only where the two numbers *disagree*. Here's a bridge before the code: this example applies all three operators to the same pair of four-bit numbers so you can compare their results directly.

```python
a = 0b1100  # binary for 12
b = 0b1010  # binary for 10

print(a & b)   # AND: 0b1000 -> 8
print(a | b)   # OR:  0b1110 -> 14
print(a ^ b)   # XOR: 0b0110 -> 6
```

The `0b` prefix tells MicroPython that the digits after it are binary, not decimal — writing numbers this way makes each bit position visible, which is much harder to see in ordinary decimal notation. The table below summarizes what each operator keeps, reinforcing the pattern the code above just demonstrated.

| Operator | Name | Keeps a 1 when... |
|---|---|---|
| `&` | AND | Both bits are 1 |
| `\|` | OR | At least one bit is 1 |
| `^` | XOR | The two bits are different |

**Bit shifting** moves every bit in a number a fixed number of positions to the left or right, using the `<<` and `>>` operators. Shifting left by one position doubles a number, the same as multiplying by 2; shifting right by one position halves it, the same as dividing by 2 and dropping any remainder.

Here's the bridge for this next example: it shifts the same starting value both directions and prints the result of each.

```python
value = 0b00000101   # 5

print(value << 2)     # shift left 2 places -> 0b00010100 -> 20
print(value >> 1)     # shift right 1 place  -> 0b00000010 -> 2
```

Shifting left by 2 is the same as multiplying by 2 twice (5 × 2 × 2 = 20), and shifting right by 1 is the same as dividing by 2 once and discarding the remainder (5 ÷ 2 = 2.5, rounded down to 2).

!!! mascot-tip "You'll See This Trick Again in Chapter 15"
    ![Pixel gives a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Bitwise operators and shifting might feel abstract right now, but hold onto this example — Chapter 15's `color565()` function packs a red, a green, and a blue value into one single number by shifting each color into its own slot and combining them with `|`. You already know every operator that trick needs.

Watching individual bits slide left and right is far easier to follow than reading binary numbers on a page, so this next diagram lets you experiment directly with both kinds of operators.

#### Diagram: Bitwise Operator and Shift Visualizer

<iframe src="../../sims/bitwise-shift-visualizer/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Bitwise Operator and Shift Visualizer</summary>
Type: microsim
**sim-id:** bitwise-shift-visualizer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: calculate, demonstrate

Learning objective: Calculate the result of applying AND, OR, XOR, left-shift, or right-shift to an 8-bit value, and demonstrate how each bit position changes by adjusting operand values directly.

Canvas layout:
- Top: eight individual bit toggles (0 or 1) for an operand labeled "A", and, when a two-operand operator is selected, a second row of eight toggles for operand "B"
- Middle: an operator selector and a shift-amount stepper (for shift operators only)
- Bottom: a result row of eight bits, plus the decimal value of A, B (if shown), and the result

Visual elements:
- Each bit rendered as a clickable square showing 0 or 1, with A in teal and B in coral
- For `&`, `|`, and `^`: a per-column highlight showing which two input bits combined to produce each result bit
- For `<<` and `>>`: an animation showing bits physically sliding left or right by the selected shift amount, with new zero-bits appearing on the vacated side
- Decimal value readouts beneath each bit row, updating live

Interactive controls:
- Operator selector: AND, OR, XOR, Left Shift, Right Shift
- Eight clickable toggles for operand A (and operand B when relevant)
- Shift-amount stepper, 0 to 7, shown only for the two shift operators
- "Reset" button restores A = 0b00000101, B = 0b00000011, operator AND

Default parameters: A = 0b00000101 (5), B = 0b00000011 (3), operator AND

Data Visibility Requirements:
  Stage 1: Show operand A and operand B as toggleable bits with their decimal values
  Stage 2: Show the selected operator applied column by column (AND/OR/XOR) or as a slide (shift), with the result bits updating live
  Stage 3: Show the result row's decimal value, recalculated immediately after any toggle, operator change, or shift-amount change

Interaction: Direct manipulation — every toggle, operator change, and shift-amount change immediately recalculates and redraws the result row

Instructional Rationale: An Apply-level objective (calculate, demonstrate) is best served by direct parameter manipulation rather than a passive animation, since the learner must adjust real bit values and immediately see the calculated consequence to build an accurate mental model of each operator.

Responsive design: bit toggle rows shrink their square size on narrow screens while remaining individually tappable; the operator selector and stepper stack above the bit rows below 500 pixels wide.

Implementation: p5.js for the bit-toggle grid and shift animation; results computed directly in JavaScript using its native bitwise operators, mirroring MicroPython's behavior exactly for 8-bit values.
</details>

## String Formatting: Building Readable Debug Output

Printing several variables together, like `print("Eye size:", eye_size, "Battery:", battery)`, works but produces output that is easy to misread once a program prints many values in a debugging session. **String formatting** builds a single, precisely worded string by inserting variable values directly into specific positions inside a string literal.

MicroPython's preferred style is the f-string: a string literal prefixed with the letter `f`, where any expression inside curly braces `{ }` is evaluated and inserted directly into the text. Here's a bridge before the code: this example builds one clean debug line from two variables instead of printing them as separate comma-separated arguments.

```python
eye_size = 14
battery = 82

debug_message = f"Eye size: {eye_size}px, Battery: {battery}%"
print(debug_message)
```

That code prints `Eye size: 14px, Battery: 82%` — MicroPython replaces each `{eye_size}` and `{battery}` with the variable's current value at the moment the f-string is built, and everything else in the string appears exactly as written. An older alternative, the `.format()` method, achieves the same result with placeholder curly braces filled in by arguments passed to `.format()`; f-strings are generally shorter and easier to read, so this book uses them throughout.

You can also control how a number is displayed inside an f-string by adding a format specifier after a colon, such as `{value:.1f}` to show exactly one digit after a decimal point — a small trick that becomes useful once later chapters start printing timing measurements.

## A First Look at the FrameBuf Module

Every conditional statement, function, and bitwise operator introduced so far has worked with plain numbers and text — nothing has touched a display yet. That changes, conceptually, right now. The **FrameBuf module** is MicroPython's built-in tool for working with a **frame buffer**: an in-memory rectangle of pixels that a program draws into before that image is ever sent to a real screen.

Think of a frame buffer as a scratchpad the size of the display, held entirely in the Pico's memory. A program draws shapes into that scratchpad — an eye here, an eyebrow there — completely invisible to anyone looking at the actual screen, and only once every shape is finished does the program copy the whole scratchpad to the display in one step. Drawing this way avoids the flicker and half-finished shapes a viewer would see if every single pixel change were sent to the screen the instant it happened.

Importing the module follows the same pattern as `time` and `machine` from Chapter 3.

```python
import framebuf

buffer = bytearray(8 * 8 // 8)
fb = framebuf.FrameBuffer(buffer, 8, 8, framebuf.MONO_HLSB)
```

This code creates a tiny 8-by-8-pixel frame buffer, far smaller than either display in this book, purely to show the module's basic shape. `bytearray(8 * 8 // 8)` reserves exactly enough raw memory to hold 64 one-bit pixels, and `framebuf.FrameBuffer(...)` wraps that memory with width, height, and pixel-format information so MicroPython knows how to interpret it. The resulting object, `fb`, is the drawing surface itself — but this chapter stops here on purpose.

!!! mascot-encourage "You Don't Need Coordinates Yet"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    If that `FrameBuffer(...)` line looks mysterious, that's completely expected — you're not meant to fully understand it yet. Chapter 5 introduces the coordinate system a frame buffer uses, and Chapters 6 and 7 hand you the actual drawing methods. For now, just hold onto the big idea: a frame buffer is memory shaped like a screen.

A few facts about the FrameBuf module are worth remembering even before you draw a single pixel with it:

- A frame buffer lives entirely in memory — nothing appears on a physical display until that memory is explicitly sent to one.
- The same `framebuf` module works with both target displays in this book, despite their very different pixel formats.
- Drawing methods like `fill()`, `pixel()`, `ellipse()`, and `poly()` all operate on a frame buffer object, not on the display directly — Chapters 6 and 7 introduce them one at a time.
- A pixel format constant, such as `MONO_HLSB` above, tells the frame buffer how many bits each pixel uses and how those bits are packed — a detail that becomes important once the color display's RGB565 format arrives in Chapter 15.

## Chapter Summary

You now know how to make a MicroPython program branch, reuse logic through functions, work with raw bits, and picture what a frame buffer is — everything `draw_face()` will be built from later in this book.

- Conditional statements (`if`/`elif`/`else`) let a program run different code depending on whether a boolean condition is `True`, using comparison operators like `<`, `>`, and `==`.
- A function definition (`def`) packages a block of code under a reusable name; function parameters receive values passed in at the call site, and `return` hands a result back to the caller.
- A default parameter value lets a function support a common case with a short call, while still letting a caller override it when needed.
- A function can return multiple values at once, automatically bundled into a tuple and unpacked with multiple variable names.
- Local variables created inside a function are invisible outside it and disappear when the function returns; modifying a global variable from inside a function requires an explicit `global` declaration, or the assignment silently creates a shadowing local variable instead.
- A docstring, a triple-quoted string as a function's first line, documents what the function does for future readers.
- Bitwise operators (`&`, `|`, `^`) and bit shifting (`<<`, `>>`) work directly on a number's individual bits — the exact toolkit Chapter 15's RGB565 color packing will rely on.
- F-strings build clean, readable debug output by inserting variable values directly into a string using `{ }` placeholders.
- The FrameBuf module provides a frame buffer: an in-memory rectangle of pixels a program draws into before sending the finished image to a real display, with the coordinate system and drawing methods themselves still ahead in Chapters 5 through 7.

!!! mascot-celebration "You're Ready to Build Real Functions"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Conditionals, functions, scope, bits, and a first peek at the frame buffer — that's a huge amount of ground covered, and every piece of it points straight at `draw_face()`. Chapter 5 hands you the coordinate system a frame buffer actually uses, and the drawing begins for real.

??? question "Self-Check: Why didn't the global variable change? — Click to reveal"
    Assigning to `eye_size` inside `grow_eyes()` without a `global eye_size` declaration creates a brand-new local variable that only exists while the function runs, leaving the global `eye_size` completely untouched. Adding `global eye_size` as the first line of the function tells MicroPython to modify the existing global variable instead of shadowing it with a local one.
