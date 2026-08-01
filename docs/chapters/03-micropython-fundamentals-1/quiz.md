---
title: Quiz - MicroPython Fundamentals I
description: Ten multiple-choice questions covering MicroPython, Thonny, the REPL, variables, data types, comments, indentation, loops, imports, and collection types.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: MicroPython Fundamentals I — Syntax, Data & Loops

Test your understanding of the MicroPython language building blocks every drawing program in this book is made from.

---

#### 1. What is MicroPython?

<div class="upper-alpha" markdown>
1. A graphical editor for drawing robot faces without writing code
2. A hardware chip that plugs into the Raspberry Pi Pico
3. A compact reimplementation of Python 3 that runs directly on microcontrollers
4. An operating system that the Raspberry Pi Pico boots into
</div>

??? question "Show Answer"
    The correct answer is **C**. MicroPython keeps most of Python 3's syntax and readability but fits into a few hundred kilobytes so it can run on chips like the RP2040. Option D is the opposite of the truth: MicroPython runs with no operating system underneath it, which is exactly why a Pico starts running your code almost instantly on power-up.

    **Concept Tested:** MicroPython

    **See:** [What Is MicroPython?](index.md#what-is-micropython)

---

#### 2. What does the acronym REPL stand for, and what does it do?

<div class="upper-alpha" markdown>
1. Remote Editing Program Loader — it copies saved files onto the Pico over USB
2. Read-Eval-Print Loop — it reads one line, evaluates it, prints the result, and waits for the next line
3. Recursive Expression Parsing Language — it converts Python into machine code
4. Runtime Error Prevention Layer — it checks a program for mistakes before it runs
</div>

??? question "Show Answer"
    The correct answer is **B**. The REPL is the interactive prompt behind Thonny's Shell panel, marked by the `>>>` symbol. Because it responds to a single line instantly, it is ideal for testing a math expression or confirming a module is available before committing that code to a saved program.

    **Concept Tested:** MicroPython REPL

    **See:** [The REPL: Talking to Your Pico One Line at a Time](index.md#the-repl-talking-to-your-pico-one-line-at-a-time)

---

#### 3. How does a MicroPython programmer signal that a variable is meant to be a constant?

<div class="upper-alpha" markdown>
1. By declaring it with the `const` keyword before the name
2. By storing it inside a tuple so the language refuses to change it
3. By adding a `#` comment above it saying "do not change"
4. By writing its name entirely in capital letters as a convention
</div>

??? question "Show Answer"
    The correct answer is **D**. MicroPython has no keyword that locks a value, so programmers write names like `SCREEN_WIDTH` and `MAX_BRIGHTNESS` in all capitals. Nothing stops the language from letting you reassign it later — the all-caps name is a promise to whoever reads your code, not a rule the interpreter enforces.

    **Concept Tested:** Constant

    **See:** [Storing Information: Variables and Constants](index.md#storing-information-variables-and-constants)

---

#### 4. What will `print(type(is_awake))` display if `is_awake = True`?

<div class="upper-alpha" markdown>
1. `<class 'bool'>`
2. `<class 'int'>`
3. `True`
4. `<class 'str'>`
</div>

??? question "Show Answer"
    The correct answer is **A**. `True` belongs to the boolean data type, and MicroPython's `type()` function reports that as `<class 'bool'>`. Option C is what `print(is_awake)` alone would show — `type()` reports the category of the value, not the value itself. Booleans are the type behind every yes/no state a face program tracks, such as whether the robot is currently blinking.

    **Concept Tested:** Boolean Data Type

    **See:** [Data Types: Integers and Booleans](index.md#data-types-integers-and-booleans)

---

#### 5. Why does MicroPython treat indentation as part of the language's grammar rather than as a style preference?

<div class="upper-alpha" markdown>
1. Indentation determines how much memory each line of code uses
2. Indentation controls the order in which lines are sent over the USB cable
3. Indentation is how MicroPython knows which lines are grouped together inside a block such as a loop
4. Indentation tells the Pico how fast to run each line of the program
</div>

??? question "Show Answer"
    The correct answer is **C**. Where other languages use curly braces to mark a block, Python uses consistent leading whitespace — four spaces per level by convention. That is why a line indented under a `for` loop runs inside the loop while an unindented line runs after it, and why inconsistent spacing raises an `IndentationError` before the program runs at all.

    **Concept Tested:** Indentation Rules

    **See:** [Indentation Rules](index.md)

---

#### 6. What does the loop `for pupil_x in range(10, 30, 5):` print if its body is `print(pupil_x)`?

<div class="upper-alpha" markdown>
1. 10, 15, 20, 25
2. 10, 15, 20, 25, 30
3. 5, 10, 15, 20, 25, 30
4. 10, 20, 30
</div>

??? question "Show Answer"
    The correct answer is **A**. With three arguments, `range()` reads as start, stop, step: begin at 10, add 5 each pass, and stop *before* reaching 30. That exclusive stop value is why 30 never prints, which is the same reason `range(5)` produces 0 through 4 rather than 1 through 5.

    **Concept Tested:** For Loop

    **See:** [For Loops: Repeating a Set Number of Times](index.md#for-loops-repeating-a-set-number-of-times)

---

#### 7. A while loop keeps printing forever and never stops. What is the most likely cause?

<div class="upper-alpha" markdown>
1. The loop was indented with four spaces instead of a tab
2. The `range()` function was given too large a stop value
3. The loop was written in the REPL instead of a saved program
4. Nothing inside the loop changes the value the condition tests
</div>

??? question "Show Answer"
    The correct answer is **D**. A while loop repeats as long as its condition stays `True`, so a line such as `count = count + 1` must eventually make that condition `False`. Leaving it out creates an infinite loop. Later chapters use `while True:` deliberately for animation, where running forever is the intended behavior rather than a bug.

    **Concept Tested:** While Loop

    **See:** [While Loops: Repeating Until Something Changes](index.md#while-loops-repeating-until-something-changes)

---

#### 8. What is the difference between `import time` and `from machine import Pin`?

<div class="upper-alpha" markdown>
1. The first loads a module permanently onto the Pico; the second loads it only until power is lost
2. The first loads a whole module so its tools are used with dot notation; the second loads one specific tool that can then be used by name alone
3. The first works only in the REPL; the second works only in a saved program
4. The first is valid MicroPython; the second only works in desktop Python
</div>

??? question "Show Answer"
    The correct answer is **B**. After `import time`, you call its function as `time.sleep(1)`. After `from machine import Pin`, you write `Pin(25, Pin.OUT)` directly instead of the longer `machine.Pin(...)`. Both forms are valid MicroPython and both work equally well in the REPL or a saved file — they differ only in what name the tool ends up having in your program.

    **Concept Tested:** Import Statement

    **See:** [Bringing in Extra Powers: Import Statements and Modules](index.md#bringing-in-extra-powers-import-statements-and-modules)

---

#### 9. You need to store a fixed RGB565 color value that should never accidentally be edited later in the program. Which collection type fits best?

<div class="upper-alpha" markdown>
1. A list, because it can grow to hold more colors later
2. A tuple, because its values cannot be changed once created
3. A dictionary, because each color number can be given a name
4. A boolean, because a color is either set or unset
</div>

??? question "Show Answer"
    The correct answer is **B**. Tuples are written with parentheses and are unchangeable once created, which is exactly the protection a fixed value needs. A list would allow accidental edits, a dictionary adds key lookup that a three-number color does not need, and a boolean holds only `True` or `False`, not three numbers.

    **Concept Tested:** Tuple Data Structure

    **See:** [Collections: Lists, Tuples, and Dictionaries](index.md#collections-lists-tuples-and-dictionaries)

---

#### 10. Why is a dictionary the natural choice for storing the parameters of one facial expression?

<div class="upper-alpha" markdown>
1. Dictionaries store values in a fixed order that matches drawing order
2. Dictionaries use less memory than lists on a microcontroller
3. Each parameter is looked up by a descriptive key name rather than by counting positions
4. Dictionaries automatically prevent their values from being changed
</div>

??? question "Show Answer"
    The correct answer is **C**. Writing `happy_face["mouth_curve"]` retrieves the right setting without you having to remember whether mouth curve was the second or third value stored. That named access is what makes dictionaries fit a group of related settings. Dictionaries are changeable, which rules out option D, and they are accessed by key rather than position, which rules out option A.

    **Concept Tested:** Dictionary Data Structure

    **See:** [Collections: Lists, Tuples, and Dictionaries](index.md#collections-lists-tuples-and-dictionaries)
