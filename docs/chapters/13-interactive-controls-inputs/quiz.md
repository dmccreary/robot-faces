---
title: Quiz - Interactive Controls
description: Ten multiple-choice questions covering digital and analog input, polling versus interrupts, event-driven programming, value mapping, mode state machines, and dual-core processing.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Interactive Controls — Inputs & Concurrency

Test your understanding of reading buttons and knobs, and using their values to change what a robot face does.

---

#### 1. With `button = Pin(14, Pin.IN, Pin.PULL_UP)`, what does `button.value()` return when the button is *not* being pressed?

<div class="upper-alpha" markdown>
1. 1, because the pull-up holds the pin at 3.3 volts
2. 0, because no current is flowing through the button
3. A floating value that flickers between 0 and 1
4. 65535, the maximum value the pin can report
</div>

??? question "Show Answer"
    The correct answer is **A**. The internal pull-up resistor holds the pin HIGH at rest, so a released button reads 1. Pressing it connects the pin to ground and `.value()` immediately returns 0. Option C describes what happens *without* a pull-up — the exact floating-pin problem Chapter 1 introduced.

    **Concept Tested:** Digital Input Reading

    **See:** [Reading a Button's State](index.md)

---

#### 2. Why does the polling loop compare `current_button_state == 0 and last_button_state == 1` instead of just checking for 0?

<div class="upper-alpha" markdown>
1. Because `.value()` sometimes returns values other than 0 and 1
2. Because the comparison compensates for the pull-up resistor's delay
3. Because it detects the moment a press begins, turning a held button into one event instead of hundreds
4. Because the previous state must be saved before the frame buffer can be cleared
</div>

??? question "Show Answer"
    The correct answer is **C**. A button held down for half a second would read 0 on every pass through a fast loop. Comparing against the previous pass isolates the HIGH-to-LOW edge, so `handle_button_press()` fires exactly once per physical press rather than repeatedly while the button is down.

    **Concept Tested:** Polling Input Loop

    **See:** [Checking Every Frame: The Polling Input Loop](index.md#checking-every-frame-the-polling-input-loop)

---

#### 3. What can a polling input loop miss that a button interrupt handler cannot?

<div class="upper-alpha" markdown>
1. A button that is held down for several seconds
2. A press that starts and finishes entirely between two passes through the loop
3. A press that occurs while the potentiometer is also being turned
4. Any press at all, since polling only reads the pin once at startup
</div>

??? question "Show Answer"
    The correct answer is **B**. Polling only notices a change on its next check, so a very brief press falling in the gap between two checks vanishes without a trace. An interrupt fires on the exact edge regardless of what the main loop is doing. A loop busy with slow drawing work checks even less often, widening that gap.

    **Concept Tested:** Button Interrupt Handler

    **See:** [The Alternative: Button Interrupt Handler](index.md#the-alternative-button-interrupt-handler)

---

#### 4. Why should an interrupt handler never call `draw_face()` or `fb.show()` directly?

<div class="upper-alpha" markdown>
1. Because interrupt handlers cannot access global variables like the frame buffer
2. Because `Pin.irq()` only permits handlers that take no arguments
3. Because drawing from an interrupt corrupts the frame buffer's byte alignment
4. Because a handler can fire mid-loop, and slow work inside it blocks everything else — the same problem a long `sleep()` caused
</div>

??? question "Show Answer"
    The correct answer is **D**. The handler should set a flag and return immediately, leaving the main loop to do the real work when it is ready. Handlers can access globals with a `global` declaration, and `Pin.irq()` passes the pin object as an argument, so options A and B are both incorrect.

    **Concept Tested:** Button Interrupt Handler

    **See:** [The Alternative: Button Interrupt Handler](index.md#the-alternative-button-interrupt-handler)

---

#### 5. Using `map_range(value, 0, 65535, -30, 30)`, what eyebrow angle does a raw ADC reading of 16384 produce?

<div class="upper-alpha" markdown>
1. About -15 degrees
2. About 15 degrees
3. About 0 degrees
4. About -30 degrees
</div>

??? question "Show Answer"
    The correct answer is **A**. A reading of 16384 sits at about one quarter of the 0–65535 input range. Applying that same fraction to the 60-degree output span gives 15, which added to `out_min` of −30 yields −15. A reading at the exact midpoint would map to 0, and a reading of 0 would map to −30.

    **Concept Tested:** Potentiometer Value Mapping

    **See:** [Turning a Raw Number Into Something Useful](index.md#turning-a-raw-number-into-something-useful-potentiometer-value-mapping)

---

#### 6. What does `pot.read_u16()` return, and what does the ADC actually do?

<div class="upper-alpha" markdown>
1. A voltage in volts, measured directly by the processor
2. Either 0 or 1, since all GPIO readings are digital
3. A number from 0 to 65535, produced by hardware that converts an analog voltage into a discrete digital value
4. A percentage from 0 to 100 representing the knob's travel
</div>

??? question "Show Answer"
    The correct answer is **C**. The processor cannot compute with a raw voltage — it needs numbers. The analog-to-digital converter measures the incoming voltage and reports it across a 16-bit range, where 0 corresponds to 0 volts and 65535 to 3.3 volts. That raw number then needs mapping before it is useful as a face parameter.

    **Concept Tested:** Analog-To-Digital Conversion

    **See:** [Reading a Smooth Signal: Analog Input Reading](index.md#reading-a-smooth-signal-analog-input-reading)

---

#### 7. What makes `Pin.irq()` the book's first example of event-driven programming?

<div class="upper-alpha" markdown>
1. It is the first function that requires importing the `machine` module
2. It is the first code that reads hardware rather than drawing to a display
3. It is the first pattern that uses a global variable inside a function
4. Its handler can run between any two lines of the main loop, rather than in one fixed sequence
</div>

??? question "Show Answer"
    The correct answer is **D**. Every program up through Chapter 12 was sequential: one line always following the line before it. An interrupt breaks that — the handler runs at a moment the programmer does not control. Browsers, phone apps, and games work this same way, so recognizing the pattern here helps you spot it elsewhere.

    **Concept Tested:** Event-Driven Programming

    **See:** [The Bigger Idea: Event-Driven Programming](index.md#the-bigger-idea-event-driven-programming)

---

#### 8. In the chapter's three-mode cycle, what happens when the button is pressed while `current_mode` is `GAZE_MODE`?

<div class="upper-alpha" markdown>
1. The mode returns to `NEUTRAL_MODE`
2. The mode advances to `ADJUST_MODE`, where the potentiometer begins driving the eyebrow angle
3. The mode stays at `GAZE_MODE` until the button is released
4. Both `GAZE_MODE` and `ADJUST_MODE` become active at once
</div>

??? question "Show Answer"
    The correct answer is **B**. A single short press always advances one step in the fixed cycle: NEUTRAL to GAZE to ADJUST and back to NEUTRAL. The global state variable stores exactly one value at a time, so option D is impossible by design — never more than one mode is active.

    **Concept Tested:** Mode State Machine

    **See:** [Tracking Which Mode a Face Is In](index.md#tracking-which-mode-a-face-is-in-the-mode-state-machine)

---

#### 9. What is the main benefit of assigning input polling to the RP2040's second core, and what is the cost?

<div class="upper-alpha" markdown>
1. Benefit: the display refreshes twice as fast. Cost: the frame buffer needs twice the memory
2. Benefit: interrupts become unnecessary. Cost: the potentiometer can no longer be read
3. Benefit: a slow drawing task on one core can no longer delay button checks on the other. Cost: both cores may touch the same global state at once, which needs care
4. Benefit: MicroPython automatically prevents any conflict between the cores. Cost: only one button may be connected
</div>

??? question "Show Answer"
    The correct answer is **C**. Independent cores mean a complicated draw call cannot make input checking late. The word "cooperative" refers to the fact that safety comes from writing each core's job carefully — MicroPython does not enforce it, so shared variables like `current_mode` must be touched in predictable, limited ways.

    **Concept Tested:** Dual-Core Processing

    **See:** [Doing Two Things Truly at Once](index.md#doing-two-things-truly-at-once-cooperative-multitasking-and-dual-core-processing)

---

#### 10. A project needs to catch a very brief button tap even while the face is mid-redraw. Which approach fits, and what extra work does it require?

<div class="upper-alpha" markdown>
1. An interrupt handler, which must be kept short and needs debouncing to stop one press firing it several times
2. A polling loop with a shorter check interval, which needs no additional handling
3. A `sleep()`-paced loop, which guarantees the button is read at fixed times
4. Dual-core processing, which removes any need to detect edges at all
</div>

??? question "Show Answer"
    The correct answer is **A**. An interrupt fires on the exact edge regardless of what the main loop is doing, which is what a brief tap during a slow redraw requires. The cost is complexity: the handler must do almost nothing but set a flag, and real mechanical contacts bounce for a few milliseconds, so a second trigger arriving right after the first must be ignored.

    **Concept Tested:** Button Interrupt Handler

    **See:** [The Alternative: Button Interrupt Handler](index.md#the-alternative-button-interrupt-handler)
