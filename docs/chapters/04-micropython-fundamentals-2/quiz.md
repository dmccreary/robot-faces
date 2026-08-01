---
title: Quiz - MicroPython Fundamentals II
description: Ten multiple-choice questions covering conditionals, functions, parameters, return values, scope, docstrings, bitwise operators, string formatting, and the FrameBuf module.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: MicroPython Fundamentals II — Functions & the FrameBuf Module

Test your understanding of decisions, reusable functions, bit-level operations, and the frame buffer every face in this book is drawn into.

---

#### 1. What is a docstring?

<div class="upper-alpha" markdown>
1. A comment starting with `#` placed above a function definition
2. A special MicroPython keyword that validates a function's parameters
3. A string returned by every function that has no explicit `return` statement
4. A triple-quoted string written as the first line inside a function's body, describing what it does
</div>

??? question "Show Answer"
    The correct answer is **D**. The docstring convention places a short triple-quoted description directly after the `def` line, documenting the function's purpose, parameters, and return value. MicroPython does not execute it as a command — it is a string literal — but its fixed position lets tools and other programmers find it instantly. Option A describes an ordinary comment, which is a different mechanism.

    **Concept Tested:** Docstring Convention

    **See:** [Docstring Convention](index.md#docstring-convention-documenting-what-a-function-does)

---

#### 2. In an `if` / `elif` / `else` chain, how many branches run?

<div class="upper-alpha" markdown>
1. Exactly one — the first branch whose condition is `True`, or the `else` if none are
2. Every branch whose condition evaluates to `True`
3. All branches run, but only the last one's output is displayed
4. None run unless an `else` branch is present
</div>

??? question "Show Answer"
    The correct answer is **A**. MicroPython checks each condition from the top down, runs the first branch that evaluates to `True`, and skips every branch after it. The `else` branch is a catch-all with no condition of its own, running only when every earlier test failed. That is why `battery_level = 45` prints the "normal" message and never reaches the `else`.

    **Concept Tested:** Conditional Statement

    **See:** [Making Decisions: Conditional Statements](index.md#making-decisions-conditional-statements)

---

#### 3. Given `def set_brightness(level=80):`, what does calling `set_brightness()` with no argument do?

<div class="upper-alpha" markdown>
1. Raises an error, because a required argument is missing
2. Sets `level` to `None` and skips the function body
3. Uses 80 as the value of `level`
4. Prompts the user to type a value into the REPL
</div>

??? question "Show Answer"
    The correct answer is **C**. A default parameter value is a fallback written into the function definition, used automatically whenever the caller omits that argument. Calling `set_brightness()` prints 80, while `set_brightness(50)` overrides the default with 50. This pattern lets common cases stay short while still allowing a caller to be specific.

    **Concept Tested:** Default Parameter Value

    **See:** [Default Parameter Values](index.md#default-parameter-values-sensible-defaults-optional-overrides)

---

#### 4. If `value = 0b00000101`, what does `value << 2` produce?

<div class="upper-alpha" markdown>
1. 7
2. 20
3. 2
4. 10
</div>

??? question "Show Answer"
    The correct answer is **B**. Shifting left by one position doubles a number, so shifting left by two positions multiplies by 2 twice: 5 × 2 × 2 = 20, or `0b00010100` in binary. Option C is the result of `value >> 1`, which halves the number and discards any remainder, and option D would be a single left shift rather than two.

    **Concept Tested:** Bit Shifting

    **See:** [Thinking in Bits](index.md#thinking-in-bits-bitwise-operators-and-bit-shifting)

---

#### 5. A global variable `eye_size = 10` is assigned `eye_size = 20` inside a function, but after the function runs, printing `eye_size` still shows 10. Why?

<div class="upper-alpha" markdown>
1. The function returned before reaching the assignment line
2. Global variables in MicroPython cannot hold integer values
3. Printing happened before the function was called
4. The assignment created a new local variable that shadowed the global and vanished when the function ended
</div>

??? question "Show Answer"
    The correct answer is **D**. Assigning to a name inside a function always creates a local variable, even when a global of the same name already exists. MicroPython issues no warning — it quietly uses the local copy, which disappears when the function returns. Adding `global eye_size` as the function's first line makes the assignment modify the global instead.

    **Concept Tested:** Global Versus Local Scope

    **See:** [Global Versus Local Scope](index.md#global-versus-local-scope)

---

#### 6. What is the key difference between `print()` and `return` inside a function?

<div class="upper-alpha" markdown>
1. `print()` is faster because it does not create a variable
2. `return` displays text on screen while `print()` stores it in memory
3. `print()` only displays a value, while `return` hands it back so the caller can store or reuse it
4. `return` can only be used once per program, while `print()` can be used freely
</div>

??? question "Show Answer"
    The correct answer is **C**. A function that only prints leaves its caller with nothing to work with. `return` immediately exits the function and passes a value back, so it can be captured in a variable such as `status = battery_status(45)` and used later. That is why almost every useful function ends with a `return` statement rather than a `print()`.

    **Concept Tested:** Function Return Value

    **See:** [Functions: Packaging Code You Can Reuse](index.md#functions-packaging-code-you-can-reuse)

---

#### 7. What is a frame buffer?

<div class="upper-alpha" markdown>
1. An in-memory rectangle of pixels that a program draws into before sending the finished image to a display
2. A queue of drawing commands waiting to be transmitted over the SPI bus
3. A physical chip on the display module that stores the previous frame for comparison
4. A limit on how many frames per second a MicroPython program may draw
</div>

??? question "Show Answer"
    The correct answer is **A**. A frame buffer is a scratchpad the size of the display, held entirely in the Pico's memory. A program draws every shape into it invisibly, then copies the whole thing to the screen in one step. Drawing this way avoids the flicker and half-finished shapes a viewer would otherwise see as each pixel changed.

    **Concept Tested:** FrameBuf Module

    **See:** [A First Look at the FrameBuf Module](index.md#a-first-look-at-the-framebuf-module)

---

#### 8. What does `center_x, center_y = screen_center(128, 64)` assign, given that `screen_center` ends with `return x, y`?

<div class="upper-alpha" markdown>
1. `center_x` gets the tuple `(64, 32)` and `center_y` gets `None`
2. `center_x` gets 64 and `center_y` gets 32
3. `center_x` gets 128 and `center_y` gets 64
4. An error, because a function can only return one value
</div>

??? question "Show Answer"
    The correct answer is **B**. A `return` statement with comma-separated values bundles them into a tuple, and writing two variable names on the left of the equals sign unpacks that tuple in one line. Since `128 // 2` is 64 and `64 // 2` is 32, the center point is (64, 32). This (x, y) pattern reappears constantly once drawing code starts computing pixel positions.

    **Concept Tested:** Multiple Return Values

    **See:** [Multiple Return Values](index.md#multiple-return-values-handing-back-more-than-one-answer)

---

#### 9. If `eye_size = 14` and `battery = 82`, what does `print(f"Eye size: {eye_size}px, Battery: {battery}%")` display?

<div class="upper-alpha" markdown>
1. `Eye size: {eye_size}px, Battery: {battery}%`
2. `Eye size: 14 px , Battery: 82 %`
3. `Eye size: 14px, Battery: 82%`
4. `f"Eye size: 14px, Battery: 82%"`
</div>

??? question "Show Answer"
    The correct answer is **C**. The `f` prefix marks the literal as an f-string, so each expression inside curly braces is evaluated and its value inserted in place at the moment the string is built. Every other character appears exactly as written, with no extra spaces added. Without the `f` prefix, the braces would print literally as shown in option A.

    **Concept Tested:** String Formatting

    **See:** [String Formatting](index.md#string-formatting-building-readable-debug-output)

---

#### 10. Why is drawing into a frame buffer preferable to sending each pixel change straight to the display?

<div class="upper-alpha" markdown>
1. The viewer never sees half-finished shapes, because the completed image is copied to the screen in one step
2. A frame buffer uses less of the Pico's memory than direct drawing does
3. Only a frame buffer can store color, so direct drawing would be monochrome
4. The display driver chip rejects any command that is not sent from a frame buffer
</div>

??? question "Show Answer"
    The correct answer is **A**. Because every shape is assembled invisibly in memory first, the screen only ever shows finished frames — eliminating the flicker and partial images that per-pixel updates would produce. A frame buffer actually costs memory rather than saving it, and the same `framebuf` module serves both the monochrome OLED and the color display in this book.

    **Concept Tested:** FrameBuf Module

    **See:** [A First Look at the FrameBuf Module](index.md#a-first-look-at-the-framebuf-module)
