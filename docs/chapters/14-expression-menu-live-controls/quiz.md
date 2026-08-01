---
title: Quiz - Building an Expression Menu & Live Controls
description: Ten multiple-choice questions covering button debounce, idle states, menu cycling, state-based animation triggers, control mapping, quadrature encoders, and live parameter tuning.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Building an Expression Menu & Live Controls

Test your understanding of debounced buttons, rotary encoders, and the complete expression menu they combine into.

---

#### 1. What causes button bounce, and what does debouncing do about it?

<div class="upper-alpha" markdown>
1. Electrical noise on the SPI bus; debouncing filters that noise out of the display signal
2. A button's metal contacts physically springing apart and touching again for a few milliseconds; debouncing ignores further changes for a short window after the first edge
3. A pull-up resistor discharging too slowly; debouncing adds a second resistor to speed it up
4. The main loop reading the pin faster than the ADC can convert; debouncing slows the loop down
</div>

??? question "Show Answer"
    The correct answer is **B**. Contact bounce is mechanical, not a software mistake, and it typically lasts 1 to 20 milliseconds — invisible to a finger but easily fast enough for a microcontroller to catch several times. The fix is not a better button; it is patient code that ignores extra edges within the debounce window.

    **Concept Tested:** Button Debounce

    **See:** [Real Buttons Are Messy](index.md#real-buttons-are-messy-button-debounce-and-the-debounce-time-constant)

---

#### 2. What is the unmistakable symptom of an expression menu whose "next" button is not debounced?

<div class="upper-alpha" markdown>
1. The face freezes on one expression and stops responding entirely
2. The knob stops adjusting the mouth curve
3. The display flickers each time the button is pressed
4. One press jumps several expressions ahead, skipping the ones in between
</div>

??? question "Show Answer"
    The correct answer is **D**. Each bounce edge counts as its own press, so a menu that advances one expression per press can leap from "happy" past "sad" and "surprised" to "angry" in the time a thumb takes to finish pressing down. If a menu ever seems to have a mind of its own, check the debounce logic first.

    **Concept Tested:** Button Debounce

    **See:** [Real Buttons Are Messy](index.md#real-buttons-are-messy-button-debounce-and-the-debounce-time-constant)

---

#### 3. What is a typical value for a debounce time constant?

<div class="upper-alpha" markdown>
1. 20 to 50 milliseconds
2. 1 to 2 microseconds
3. 200 to 500 milliseconds
4. 2 to 5 seconds
</div>

??? question "Show Answer"
    The correct answer is **A**. The constant needs to be comfortably longer than the button's actual bounce duration but short enough to stay responsive. Option B is far too short to outlast any bounce, while options C and D would make a menu feel sluggish by refusing to register a genuinely quick second press.

    **Concept Tested:** Debounce Time Constant

    **See:** [Real Buttons Are Messy](index.md#real-buttons-are-messy-button-debounce-and-the-debounce-time-constant)

---

#### 4. What does `(current_index + 1) % len(EXPRESSION_NAMES)` accomplish in the menu?

<div class="upper-alpha" markdown>
1. It skips any expression whose index is an even number
2. It converts the index into the expression's name string
3. It advances to the next expression and wraps back to the first after the last one
4. It counts how many expressions have been shown since startup
</div>

??? question "Show Answer"
    The correct answer is **C**. Adding 1 normally advances one step, and the modulo operator resets the index to 0 the moment it would run past the final entry — from "bored" straight back to "neutral" with no special-case code. Cycling in one direction is also friendlier for a user, who never has to guess how far "back" is.

    **Concept Tested:** Expression Selection Menu

    **See:** [Building the Menu](index.md#building-the-menu-multi-mode-menu-and-expression-selection-menu)

---

#### 5. How does a program determine which direction a rotary encoder was turned?

<div class="upper-alpha" markdown>
1. By measuring the voltage on a single encoder pin, since higher voltage means clockwise
2. By comparing two out-of-phase square-wave signals to see which one changed first
3. By counting how many milliseconds the knob was held between clicks
4. By reading an absolute position sensor built into the knob's shaft
</div>

??? question "Show Answer"
    The correct answer is **B**. Two switches inside the encoder produce square waves offset by a quarter step cycle. Turning clockwise makes signal A lead signal B; counter-clockwise reverses the order. That comparison alone recovers direction — the encoder never reports absolute position, which rules out option D.

    **Concept Tested:** Encoder Quadrature Signal

    **See:** [Going Deeper on the Knob](index.md#going-deeper-on-the-knob-rotary-encoder-position-direction-and-the-quadrature-signal)

---

#### 6. What goes wrong if a debounce time constant is set too short, and what goes wrong if it is set far too long?

<div class="upper-alpha" markdown>
1. Too short crashes the program; too long has no effect at all
2. Too short delays the display refresh; too long drains the battery
3. Too short prevents the interrupt from firing; too long fires it repeatedly
4. Too short lets bounce edges slip through as extra presses; too long makes the menu ignore a genuinely fast second press
</div>

??? question "Show Answer"
    The correct answer is **D**. The constant must outlast the button's real bounce duration, or extra edges reach the program and the menu skips expressions. Push it far past that, though, and the code starts rejecting real input, which reads to a user as a sluggish or unresponsive menu.

    **Concept Tested:** Debounce Time Constant

    **See:** [Real Buttons Are Messy](index.md#real-buttons-are-messy-button-debounce-and-the-debounce-time-constant)

---

#### 7. What is the default idle state in this chapter's menu?

<div class="upper-alpha" markdown>
1. A completely blank screen, to save power when nobody is present
2. A frozen copy of whichever expression was selected last
3. A neutral expression that keeps Chapter 12's blink-and-gaze idle animation running
4. A scrolling text label listing all thirteen expression names
</div>

??? question "Show Answer"
    The correct answer is **C**. The idle state is a sensible "home" the menu falls back to after a stretch of inactivity — and it is deliberately not frozen. Chapter 12 built idle animation precisely so a resting face still blinks and glances around rather than staring motionless like a broken screen.

    **Concept Tested:** Default Idle State

    **See:** [A Home Base: The Default Idle State](index.md#a-home-base-the-default-idle-state)

---

#### 8. Chapter 13 warned to keep interrupt handlers short, yet this chapter puts a `sleep_ms(20)` inside one. Why is that acceptable here?

<div class="upper-alpha" markdown>
1. Because 20 milliseconds is short enough not to meaningfully delay other work, and rechecking the pin after the bounce settles is exactly what debouncing requires
2. Because `sleep_ms()` behaves differently inside a handler and does not actually pause anything
3. Because the handler runs on the RP2040's second core, so the main loop is unaffected
4. Because interrupt handlers are exempt from the blocking problem entirely
</div>

??? question "Show Answer"
    The correct answer is **A**. This is a narrow exception, not a reversal of the rule. After the brief pause the handler rechecks the pin: still LOW means the press was real, already back HIGH means it was bounce. The main risk is sleeping longer than necessary, which would delay other interrupt-driven work.

    **Concept Tested:** Input Debouncing Delay

    **See:** [Waiting It Out: Input Debouncing Delay](index.md#waiting-it-out-input-debouncing-delay)

---

#### 9. In the chapter's complete menu program, a student turns the potentiometer while `tuning_mode` is `False`. What happens?

<div class="upper-alpha" markdown>
1. The mouth curve changes, but only after tuning mode is switched on
2. The menu advances to the next expression instead
3. Nothing changes, because the potentiometer is read only inside the `if tuning_mode:` block
4. The face returns immediately to its default idle state
</div>

??? question "Show Answer"
    The correct answer is **C**. `tuning_mode` acts as a gate: `pot.read_u16()` and the `map_range()` call sit inside that conditional, so the knob touches nothing while the gate is closed. This is exactly why the chapter recommends a visible tuning-mode indicator — otherwise a dead-feeling knob reads as broken hardware.

    **Concept Tested:** Live Parameter Tuning

    **See:** [Putting It All Together](index.md#putting-it-all-together-a-complete-expression-menu)

---

#### 10. Why does this chapter assign "toggle tuning mode" to its own dedicated second button rather than, say, a long press of the first button?

<div class="upper-alpha" markdown>
1. Because a rare action deserves a control it cannot be triggered by accident, while the most frequent action gets the simplest control
2. Because MicroPython cannot measure how long a button is held
3. Because a single button can only be registered with one interrupt handler
4. Because tuning mode must be toggled before any expression can be selected
</div>

??? question "Show Answer"
    The correct answer is **A**. Control mapping design is a deliberate, documented decision, not something to figure out while wiring. Advancing expressions is the frequent action, so it gets the simplest control; toggling tuning is rare, so a separate confirm-style button keeps it from firing unintentionally. Writing this mapping down before wiring also answers the most common bug report — "the knob does nothing" usually means tuning mode was never switched on.

    **Concept Tested:** Control Mapping Design

    **See:** [Deciding What Each Control Does](index.md#deciding-what-each-control-does-control-mapping-design)
