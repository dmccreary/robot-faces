---
title: MicroPython Fundamentals I: Syntax, Data & Loops
description: An introduction to the Thonny IDE and the MicroPython REPL, plus the core language building blocks of variables, data types, comments, indentation, loops, imports, and collections.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 14:06:50
version: 0.09
---

# MicroPython Fundamentals I: Syntax, Data & Loops

## Summary

This chapter covers the MicroPython development environment (the Thonny IDE and the MicroPython REPL) and the core language building blocks students need before writing any drawing code: variables, constants, basic data types, for/while loops, modules and imports, and the list/tuple/dictionary collection types. After completing this chapter, students will be able to write, run, and debug a simple MicroPython program on a Raspberry Pi Pico using Thonny.

## Concepts Covered

This chapter covers the following 17 concepts from the learning graph:

1. MicroPython
2. Thonny IDE
3. MicroPython REPL
4. Variable
5. Constant
6. Data Type
7. Integer Data Type
8. Boolean Data Type
9. For Loop
10. While Loop
11. Import Statement
12. Module
13. List Data Structure
14. Tuple Data Structure
15. Dictionary Data Structure
16. Comment Syntax
17. Indentation Rules

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Hardware & Electronics Foundations](../01-hardware-electronics-foundations/index.md)

---

## From Wired Hardware to Working Code

!!! mascot-welcome "Time to Write Some Code"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Your hardware is wired, and you've seen what four real companies bet on when they built a screen-based face. Now it's your turn — this chapter hands you the programming language every project in this book runs on: MicroPython. By the end, you'll be running your own code on the Pico you wired up in Chapter 1.

Every expression Pixel draws — every blinking eye, every arched eyebrow — starts as text you type into a program. That program has to be written in a language the Raspberry Pi Pico can actually run, and this chapter introduces exactly that language. You will not draw anything on a screen yet; that begins once Chapter 4 introduces the coordinate system displays use. Instead, this chapter builds the vocabulary and grammar every later chapter assumes you already know: how to store information, repeat an action, and organize related values together.

Think of this chapter as learning to hold a pencil before learning to sketch a face. The skills here — variables, loops, and a few ways of grouping data — are not exciting on their own, but they are exactly what a `draw_face()` function is built from underneath. Once they feel natural, the drawing chapters ahead move much faster.

## What Is MicroPython?

**MicroPython** is a compact reimplementation of the Python 3 programming language, rewritten to run directly on small microcontrollers such as the RP2040 chip inside your Pico. It supports most of the syntax and built-in features that make Python popular — readable code, no manual memory management, a huge standard vocabulary of ready-made tools — while fitting into a few hundred kilobytes of memory instead of the hundreds of megabytes a desktop Python installation needs.

The biggest practical difference between MicroPython and the desktop Python you may have heard of is what sits underneath it. Desktop Python runs as an application on top of an operating system like Windows, macOS, or Linux, which handles files, memory, and hardware on the interpreter's behalf. MicroPython has no operating system to lean on: it is flashed directly onto the Pico's chip and becomes the only program running, talking straight to the RP2040's memory and pins the moment the board powers on. That is also why MicroPython boots and starts running your code in a fraction of a second — there is no operating system to wait for.

!!! mascot-thinking "No Operating System, No Waiting"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here's the idea worth holding onto: when you plug in your Pico, there's no desktop, no login screen, and no other program competing for attention. MicroPython *is* the whole show, which is exactly why a $4 chip can redraw a face dozens of times per second without slowing down.

Because both languages share so much syntax, the table below is worth skimming once rather than memorizing — you will feel the differences the moment you start writing code.

| Feature | Desktop Python | MicroPython (on a Pico) |
|---|---|---|
| Runs on top of | An operating system (Windows, macOS, Linux) | Nothing — runs directly on the RP2040 chip |
| Typical memory available | Gigabytes | About 264 kilobytes |
| Startup time | Seconds (loads the OS first) | Near-instant on power-up |
| Talks directly to hardware pins | No, needs extra libraries | Yes, built in (`machine` module) |
| Core syntax (variables, loops, if/else) | Full Python 3 | Same syntax, smaller standard library |

## Meet Thonny: Your MicroPython Editor

Writing MicroPython code by hand and sending it to a Pico one instruction at a time would be slow and error-prone, so this book uses an editor built for exactly this job. The **Thonny IDE** is a free, beginner-friendly integrated development environment — a single application that combines a code editor, a way to run your program, and a window that shows what the program prints — with built-in support for talking to a MicroPython board over a USB cable.

Getting Thonny talking to your Pico takes only a few steps, and you only need to do it once per computer:

1. Install Thonny from its official website and open it.
2. Connect the Pico to your computer with a USB cable.
3. In the bottom-right corner of the Thonny window, select the interpreter labeled "MicroPython (Raspberry Pi Pico)."
4. Confirm the connection worked by checking that the Shell panel at the bottom of the window shows a `>>>` prompt instead of an error message.

Once connected, Thonny gives you two ways to run code, and this book uses both throughout every chapter. Clicking the green Run button (or pressing F5) sends the entire program in the editor to the Pico and runs it from the top. Typing directly into the Shell panel at the bottom of the window runs one line at a time — and that shell is actually a doorway into a tool worth understanding on its own.

## The REPL: Talking to Your Pico One Line at a Time

The Shell panel in Thonny is a window onto the **MicroPython REPL** — short for Read-Eval-Print Loop, an interactive prompt that reads one line of code you type, evaluates it immediately, prints any result, and then loops back to wait for your next line. Unlike a saved program that runs top to bottom all at once, the REPL lets you test a single idea, see the result instantly, and try something else without saving or re-running anything.

A bridge worth building now: everything after the `>>>` symbol below is something you would type; the line without it is what the Pico prints back.

```python
>>> 2 + 2
4
>>> print("Hello, robot!")
Hello, robot!
```

The REPL is especially useful for quick experiments — checking what a function returns, testing a math expression, or confirming a module is available — before committing that code to a saved program. Every code example in this chapter can be typed directly into the REPL to see its result immediately, and you're encouraged to do exactly that as you read.

!!! mascot-tip "Test It in the REPL First"
    ![Pixel gives a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Not sure what a line of code will do? Type it straight into Thonny's Shell panel before adding it to a saved program. The REPL answers in less than a second, and that habit will save you far more debugging time than it costs.

## Storing Information: Variables and Constants

Every program in this book needs to remember values while it runs — how big an eye should be, whether the robot is currently awake, which expression is showing. A **variable** is a named location in memory that holds a value, and that value can change while the program runs. Creating one in MicroPython takes a single line: a name, an equals sign, and a value.

MicroPython variable names follow a few firm rules and one strong convention. Names must start with a letter or an underscore, never a digit; they can contain letters, digits, and underscores after that first character; and they are case-sensitive, so `eyeSize` and `eyesize` are two different variables. This book follows Python's standard convention of **snake_case** — lowercase words separated by underscores — for every variable name.

A bridge before the code: this next example creates three variables that a robot-face program might use to track its current state.

```python
eye_size = 12
robot_name = "Pixel"
is_awake = True
```

Not every value should be free to change. A **constant** is a variable whose value is meant to stay fixed for the entire program — a screen width, a maximum brightness level, a pin number. MicroPython has no special keyword that locks a variable's value the way some languages do; instead, Python programmers signal "don't reassign this" by writing the name entirely in capital letters.

```python
MAX_BRIGHTNESS = 100
SCREEN_WIDTH = 128
```

Nothing stops MicroPython from letting you change `MAX_BRIGHTNESS` later in the same program — the all-capitals name is a promise between you and anyone reading your code, not a rule the language enforces. You will see this convention used constantly once display code introduces fixed values like screen dimensions and color numbers.

## Data Types: Integers and Booleans

Every value stored in a variable belongs to a **data type**: a category that describes what kind of value it is and which operations make sense to perform on it. Adding two numbers together makes sense; adding two names together does not, so MicroPython tracks each value's type to catch that kind of mistake.

This chapter introduces two of the simplest data types, and later chapters add more as drawing code demands them. The **integer data type** represents whole numbers — positive, negative, or zero — with no decimal point, and it is the type behind nearly every pixel coordinate, size, and angle you will use to draw a face. The **boolean data type** represents exactly one of two values, `True` or `False`, and it is the type behind every yes/no state a program tracks, such as whether the robot is currently blinking.

MicroPython's built-in `type()` function reports a value's data type back to you, which is a fast way to confirm what you are working with.

```python
eye_size = 12
is_awake = True
print(type(eye_size))
print(type(is_awake))
```

Running that code prints `<class 'int'>` for `eye_size` and `<class 'bool'>` for `is_awake` — MicroPython's way of confirming that a whole number and a `True`/`False` value are, in fact, two different kinds of data.

## Comments: Notes for Humans, Not the Computer

Code gets harder to remember the moment you look away from it for a day, so Python gives you a way to leave notes that the language itself completely ignores. **Comment syntax** in MicroPython starts with a `#` symbol: everything from that symbol to the end of the line is skipped entirely when the program runs, and exists purely for a human reader.

A comment can sit on its own line above a piece of code, or trail after it on the same line — both styles appear throughout this book.

```python
# Set the robot's eye size in pixels
eye_size = 12  # Larger values draw bigger eyes
```

Good comments explain *why* a value or a line matters, not just *what* it does — `eye_size = 12` is already readable on its own, so the useful comment is the one that says what changing it accomplishes.

## Indentation Rules: Python's Silent Grammar

Many programming languages mark which lines belong together — inside a loop, for example — using curly braces `{ }`. MicroPython, like desktop Python, uses **indentation rules** instead: consistent whitespace at the start of a line shows which lines are grouped together, with no braces required at all. The standard convention, used throughout this book, is four spaces per indentation level, and Thonny adds those spaces automatically when they're needed.

Here's a quick preview of the pattern, using a loop you'll learn to write properly in the next section. Notice that the second line is indented four spaces further than the first — that indentation is what tells MicroPython the `print()` line belongs *inside* the loop, not after it.

```python
for i in range(3):
    print("Blink", i)
```

Indentation is not a style preference in Python — it is part of the language's grammar, exactly the way a period ends a sentence in English. Mixing tabs and spaces, or indenting a line by an inconsistent number of spaces, produces an `IndentationError` that stops your program before it runs at all.

!!! mascot-warning "Watch Your Whitespace"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    An `IndentationError` trips up almost every new Python programmer at least once — it's one of the most common first bugs in this entire book. If Thonny reports one, check that every line inside the same block lines up with exactly the same number of spaces, and let Thonny's auto-indent do the counting for you whenever you can.

Seeing an indentation mistake happen, rather than just reading about it, makes the rule far easier to remember. The interactive tool below lets you nudge a line's indentation and watch exactly when MicroPython accepts it and when it throws an error.

#### Diagram: Indentation Error Visualizer

<iframe src="../../sims/indentation-error-visualizer/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Indentation Error Visualizer</summary>
Type: microsim
**sim-id:** indentation-error-visualizer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Understand (L2)
Bloom Taxonomy Verb: explain, classify

Learning objective: Explain why consistent indentation is required for a MicroPython code block to run, and classify a given indented line as correct, under-indented, or mixed-tabs-and-spaces.

Canvas layout:
- Left 65%: a short code listing (a `for` loop with one indented `print()` line) rendered as text with visible space-guide dots
- Right 35%: a control panel and a status readout box

Visual elements:
- The code listing shown with each space rendered as a small gray dot so indentation depth is visually countable
- A status readout reading "Valid" (green) or "IndentationError" (red) with the exact error message MicroPython would show
- A highlighted line showing which line is currently misaligned, when applicable

Interactive controls:
- Stepper control: "Indent depth of line 2" with buttons to increase or decrease the space count from 0 to 8
- Toggle: "Use a tab instead of spaces on line 2" (demonstrates mixed tabs/spaces errors)
- Reset button restoring the default, correctly indented state (4 spaces, no tabs)

Default parameters: line 2 indented by 4 spaces, no tabs, status "Valid"

Data Visibility Requirements:
  Stage 1 (4 spaces, no tab): status "Valid" — code block shown running with sample output "Blink 0 / Blink 1 / Blink 2"
  Stage 2 (0 spaces): status "IndentationError: expected an indented block"
  Stage 3 (2 spaces, inconsistent with a second indented line at 4 spaces): status "IndentationError: unindent does not match any outer indentation level"
  Stage 4 (tab toggle on): status "TabError: inconsistent use of tabs and spaces in indentation"

Behavior: every change to the stepper or toggle immediately updates the status readout and, when valid, shows the loop's printed output; when invalid, shows the exact error text and highlights the offending line in red.

Instructional Rationale: An Understand-level objective calls for tracing concrete cause and effect between an indentation choice and its result, so a stepper-driven readout showing the exact resulting state at each depth is appropriate; a continuous animation would hide the discrete, rule-based nature of indentation checking.

Responsive design: code listing and control panel stack vertically below 600 pixels wide; dot-per-space rendering scales down but remains countable.

Implementation: p5.js for rendering the code listing and space-guide dots; a small rule-based JavaScript function maps indent depth and tab usage to one of the four status states.
</details>

## For Loops: Repeating a Set Number of Times

Robot faces blink, and blinking is nothing more than an action repeated a fixed number of times. A **for loop** repeats a block of code a specific number of times, typically by stepping through a sequence of values one at a time — most often a range of numbers generated by MicroPython's built-in `range()` function.

The bridge sentence for this next example: `range(5)` generates the numbers 0 through 4, and the indented `print()` line runs once for each of those five values.

```python
for i in range(5):
    print("Blink", i)
```

That program prints five lines, `Blink 0` through `Blink 4`, then moves on to whatever code comes after the loop. The variable `i` is just a regular variable — it automatically takes on the next value in the sequence each time the loop repeats, and this book uses `i` by convention because it is short for "index."

`range()` also accepts a starting number and a step size, which becomes useful once you start counting something other than "0, 1, 2, 3...".

```python
for pupil_x in range(10, 30, 5):
    print("Move pupil to x =", pupil_x)
```

This version starts at 10, adds 5 each time, and stops before reaching 30 — printing pupil positions 10, 15, 20, and 25.

## While Loops: Repeating Until Something Changes

Not every repeated action has a number attached to it in advance. A **while loop** repeats a block of code for as long as a condition stays `True`, without a fixed count decided before the loop starts — useful for anything that should keep going "until" something happens, rather than "exactly five times."

Here's a bridge before the code: this example counts up from zero and keeps looping only while `count` is still less than 3, printing a message and increasing `count` by one on every pass.

```python
count = 0
while count < 3:
    print("Waiting for button press...", count)
    count = count + 1
```

Notice the last line inside the loop, `count = count + 1` — this is what eventually makes the condition `count < 3` become `False` and stops the loop. Forgetting a line like that creates an **infinite loop**, one that never stops on its own, because the condition never has a chance to change. Later chapters use a related pattern, `while True:`, deliberately — an animation loop that is supposed to run forever, redrawing a face again and again until the Pico loses power.

Predicting exactly what a loop will print, before running it, is one of the fastest ways to build real confidence with this syntax. The interactive tracer below lets you step through a short loop one iteration at a time and check your prediction against what actually happens.

#### Diagram: MicroPython Loop Tracer

<iframe src="../../sims/micropython-loop-tracer/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>MicroPython Loop Tracer</summary>
Type: microsim
**sim-id:** micropython-loop-tracer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: execute, demonstrate

Learning objective: Execute a short for loop or while loop mentally, one iteration at a time, and demonstrate correct prediction of each variable's value and each line printed before revealing the actual result.

Canvas layout:
- Left 55%: a short code listing (selectable between a `for` loop and a `while` loop example) with the current line highlighted
- Right 45%: a "Predict" input area, a running variable-state table, and a printed-output log

Visual elements:
- Code listing with a highlighted current line that advances one step at a time
- A live variable-state table (for example, columns for `i` or `count`) showing values only after they are confirmed, not in advance
- A printed-output log that fills in one line per confirmed step
- A "Prediction" text box where the learner types what they think the next printed line will be

Interactive controls:
- Dropdown: "Example: For Loop / While Loop"
- Text input: type a prediction for the next printed line, then a "Check" button reveals whether the prediction was correct
- "Next Step" button advances the trace by one loop iteration after a prediction is checked
- "Reset" button returns to the first line of the selected example

Default parameters: For Loop example selected, `for i in range(5): print("Blink", i)`, step 0 (before the loop starts)

Data Visibility Requirements:
  Stage 1: Show the unexecuted code with `i` undefined and an empty output log
  Stage 2: Learner predicts the first printed line, clicks Check, sees "Blink 0" confirmed or corrected, and the variable table updates to i = 0
  Stage 3: Same pattern repeats for i = 1 through i = 4
  Final: Show the complete output log alongside the final state of the loop variable after the loop exits

Interaction: Step-through with Predict/Check/Next Step controls, not automatic animation

Instructional Rationale: The Apply-level objective (execute, demonstrate) requires the learner to actively predict each step's outcome before seeing it confirmed, which is exactly what a predict-then-reveal step-through supports; continuous animation would let the learner passively watch instead of tracing the logic themselves.

Responsive design: code listing and state panel stack vertically below 600 pixels wide; the prediction input remains full-width at every size.

Implementation: p5.js for layout and rendering; a small interpreter-like JavaScript object steps through a pre-defined instruction list for each example and compares learner input against the expected next line.
</details>

## Bringing in Extra Powers: Import Statements and Modules

No program should have to reinvent basic tools like timing or hardware control from scratch, and MicroPython ships with a large collection of ready-made code to prevent exactly that. A **module** is a file containing pre-written code — variables, functions, and tools — bundled together so it can be reused in any program that needs it, instead of being retyped every time. MicroPython includes modules for timing (`time`), hardware pins (`machine`), and, as later chapters introduce, drawing to a display (`framebuf`).

An **import statement** is the line of code that loads a module, or a specific piece of one, into your program so you can use its contents. The most common form imports an entire module by name.

```python
import time

time.sleep(1)
print("One second has passed")
```

That example loads the whole `time` module, then calls its `sleep()` function using dot notation — `time.sleep(1)` pauses the program for one second before continuing. A second form of the import statement pulls out just one specific tool from a module, which is useful when you only need a single piece of a larger module.

```python
from machine import Pin

led = Pin(25, Pin.OUT)
```

This form imports only `Pin`, a tool from the `machine` module — the same module that connects your MicroPython code to the GPIO pins you wired up in Chapter 1 — so you can write `Pin(25, Pin.OUT)` directly instead of the longer `machine.Pin(25, Pin.OUT)`. Once display chapters begin, you will import two more modules by name: `ssd1306`, which speaks the OLED driver's command set, and `framebuf`, which provides the drawing methods — `fill()`, `ellipse()`, `poly()`, and more — that every face in this book is built from.

## Collections: Lists, Tuples, and Dictionaries

Real programs rarely work with just one value at a time — a robot face needs to track a whole set of possible expressions, a fixed color, or several related settings together. MicroPython groups related values using three collection types, and each one exists because it fits a different kind of data.

A **list data structure** is an ordered, changeable collection of values, written with square brackets and separated by commas. Because a list can grow, shrink, and have its items edited while a program runs, it fits data expected to change — such as the set of expressions a robot face can display.

```python
expressions = ["happy", "sad", "angry", "surprised"]
print(expressions[0])
```

That code prints `happy`, the first item in the list — Python counts positions starting at 0, so `expressions[0]` means "the first item," not the second.

A **tuple data structure** is also an ordered collection written with commas, but it uses parentheses instead of square brackets, and once created, its values cannot be changed. That permanence makes a tuple the right choice for a fixed value that should never accidentally be edited later in a program — a screen's color model, RGB565, represents each color as three fixed numbers, which is exactly the kind of value a tuple protects.

```python
eye_color = (0, 191, 165)  # a fixed teal color, similar to Pixel's own limbs
```

A **dictionary data structure** stores values in key-value pairs instead of by position, written with curly braces — each value is looked up by a name, called a key, rather than by counting its position in a sequence. This makes a dictionary the natural fit for a group of named settings that belong together, such as every parameter that defines a single facial expression.

```python
happy_face = {"eye_size": 14, "eyebrow_angle": 5, "mouth_curve": 20}
print(happy_face["mouth_curve"])
```

That code prints `20` — MicroPython looks up the value stored under the key `"mouth_curve"` directly, with no need to know or count its position among the other settings.

!!! mascot-encourage "Three Collections, Three Jobs"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    If lists, tuples, and dictionaries are starting to blur together, that's completely normal on a first read. Focus on the job each one is best at — a list for things that change, a tuple for a value that shouldn't, a dictionary for named settings — and the choice will start feeling automatic well before Chapter 5 asks you to make it.

Now that all three collection types have been introduced individually, the table below puts their key differences side by side.

| Collection | Written With | Changeable? | Accessed By | Typical Robot-Face Use |
|---|---|---|---|---|
| List | `[ ]` square brackets | Yes | Position (index) | A list of expression names to cycle through |
| Tuple | `( )` parentheses | No | Position (index) | A fixed RGB565 color value |
| Dictionary | `{ }` curly braces | Yes | Key (name) | Named parameters for one expression |

Choosing the right collection is itself a small design decision, and it is one worth practicing before real drawing code raises the stakes. The interactive infographic below lets you compare all three side by side and check your understanding against a short scenario.

#### Diagram: List vs Tuple vs Dictionary Comparison

<iframe src="../../sims/collection-types-comparison-infographic/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>List vs Tuple vs Dictionary Comparison</summary>
Type: infographic
**sim-id:** collection-types-comparison-infographic<br/>
**Library:** HTML/CSS/JS<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, distinguish

Learning objective: Differentiate lists, tuples, and dictionaries by mutability, syntax, and access method, and distinguish which collection type best fits a short scenario describing robot-face data.

Purpose and main message: Show that the three collection types are not interchangeable — each is the correct tool for a specific kind of data, and choosing the wrong one either invites accidental bugs (using a list when data must stay fixed) or awkward code (using a dictionary just to count through items in order)

Layout: three columns, one per collection type (List, Tuple, Dictionary), each column topped with its bracket symbol as a large icon; a scenario card area below the three columns

Data to display per column, visible by default:
- Symbol: `[ ]`, `( )`, `{ }`
- Mutability: Changeable / Not changeable / Changeable
- Access method: by position / by position / by key name
- One short robot-face code example matching the examples used earlier in the chapter (expressions list, eye_color tuple, happy_face dictionary)

Interactive elements:
- Clicking any column header expands a short "Why choose this one?" explanation beneath it
- A "Try a Scenario" panel presents one short scenario at a time (for example: "You need to store a fixed background color that must never change") with three buttons labeled List, Tuple, and Dictionary
- Selecting an answer highlights the chosen column green if correct or red if incorrect, and reveals a one-sentence explanation citing the mutability or access-method rule that decided the answer
- A "Next Scenario" button cycles through at least four scenarios covering each collection type at least once

Color coding or visual hierarchy: List column in teal, Tuple column in coral, Dictionary column in purple, matching Pixel's own color palette; correct/incorrect scenario feedback uses green/red overlays independent of the column colors

Responsive behavior: three columns side by side above 700 pixels wide, stacking to a single column below 700 pixels with the scenario panel remaining pinned beneath the visible column

Instructional Rationale: The Analyze-level objective requires distinguishing structural properties (mutability, access method) across three related data structures and applying that distinction to new cases, so a compare-then-test-with-scenarios pattern is appropriate; simply displaying the three definitions side by side would only support a Remember-level objective, not this Analyze-level one.

Implementation: HTML/CSS grid for the three-column layout, vanilla JavaScript for expand-on-click behavior and scenario-checking logic; no external charting library needed.
</details>

## Chapter Summary

You now have the full MicroPython vocabulary this book's drawing code is built from — from typing your first line into the REPL to choosing the right collection for a set of related values.

- MicroPython is a compact version of Python 3 that runs directly on the RP2040 chip with no operating system underneath it.
- Thonny is the IDE this book uses to connect to a Pico, edit programs, and run them either as a saved file or one line at a time in the REPL.
- Variables store values that can change; constants, written in ALL_CAPS by convention, store values meant to stay fixed.
- The integer and boolean data types cover whole numbers and True/False states, and `type()` reveals which type any value has.
- Comments, starting with `#`, are notes for human readers that MicroPython ignores completely when a program runs.
- Indentation is not a style choice — it is how MicroPython knows which lines belong to a loop, and inconsistent indentation raises an `IndentationError`.
- For loops repeat a known number of times, often using `range()`; while loops repeat until a condition becomes False, which risks an infinite loop if that condition never changes.
- Import statements load modules like `time` and `machine` so a program can reuse ready-made tools instead of rewriting them.
- Lists, tuples, and dictionaries each store multiple values, but differ in whether they can change and how their items are accessed — a distinction that matters the moment real expression data enters the picture.

!!! mascot-celebration "You Just Learned to Talk to a Pico"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Variables, loops, imports, and three kinds of collections — that's the entire language foundation this book needs, and it's already yours. Chapter 4 builds on every piece of it as you meet the screen's coordinate system and start drawing your very first pixels.

??? question "Self-Check: Which collection type would you choose? — Click to reveal"
    A fixed RGB565 color value that should never accidentally change belongs in a tuple, written with parentheses, because tuples are unchangeable once created — unlike a list, which is meant for values like a set of expression names that can grow or be edited, or a dictionary, which is meant for named settings looked up by key rather than by position.
