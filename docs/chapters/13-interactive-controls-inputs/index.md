---
title: Interactive Controls: Inputs & Concurrency
description: How to read buttons and potentiometers in MicroPython, choose between polling and interrupts, and use a mode state machine to let a robot face respond to physical controls.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 16:01:46
version: 0.09
---

# Interactive Controls: Inputs & Concurrency

## Summary

This chapter explains how to read digital and analog input — buttons, potentiometers, and rotary encoders — using both interrupt-driven and polling approaches, how the RP2040's dual cores can be used cooperatively, and how a simple state machine with global state and a state-transition diagram lets a robot face respond to physical input. After completing this chapter, students will be able to read a physical control and use its value to change a face's behavior through a basic state machine.

## Concepts Covered

This chapter covers the following 13 concepts from the learning graph:

1. Cooperative Multitasking
2. Digital Input Reading
3. Analog Input Reading
4. Analog-To-Digital Conversion
5. Button Interrupt Handler
6. Potentiometer Value Mapping
7. Mode State Machine
8. Event-Driven Programming
9. Polling Input Loop
10. Dual-Core Processing
11. Core Task Assignment
12. Global State Variable
13. State Transition Diagram

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Hardware & Electronics Foundations](../01-hardware-electronics-foundations/index.md)
- [Chapter 4: MicroPython Fundamentals II: Functions & the FrameBuf Module](../04-micropython-fundamentals-2/index.md)
- [Chapter 12: Animating Expressions: Timing & Motion](../12-animating-expressions/index.md)

---

## From Watching to Listening

!!! mascot-welcome "Let's Give This Face Some Buttons"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Chapter 12 taught this face to blink and glance around all on its own, but it still cannot respond to anything a person does. This chapter fixes that: by the end of it, a real push button or twist of a knob will change what the face shows, in real time.

Every robot face built so far reacts to nothing outside its own code. Chapter 1 wired a momentary push button and a potentiometer onto a breadboard, connected to pull-up resistors and analog pins, but nothing has read those wires yet. This chapter is where that hardware finally gets a job: reading a button press, reading a knob's position, and using either one to change what `draw_face()` shows on screen. Along the way, this chapter also answers a question every animated program eventually runs into — how does a robot's face keep animating smoothly while also paying attention to a button that could be pressed at any instant?

## Reading a Button's State: Digital Input Reading

A momentary push button reports only two possible states — pressed or not pressed — which makes it a **digital** signal: one of exactly two values, HIGH or LOW, with nothing in between. **Digital input reading** is the act of asking a GPIO pin for its current logic level and getting back one of those two values. Chapter 1 explained why a button wired to a pin needs a pull-up resistor: without one, an unpressed button leaves the pin electrically floating, and a floating pin reads as a random, flickering mix of HIGH and LOW instead of a steady value.

A bridge sentence before the code: this snippet configures GPIO pin 14 as a digital input with the RP2040's built-in pull-up resistor enabled, then reads its current value.

```python
from machine import Pin

button = Pin(14, Pin.IN, Pin.PULL_UP)

print(button.value())   # 1 (HIGH) when released, 0 (LOW) when pressed
```

`Pin(14, Pin.IN, Pin.PULL_UP)` does two things at once: it sets pin 14 to act as an input rather than an output, and it turns on the RP2040's internal pull-up resistor for that pin, so no external resistor is required on the breadboard. With the pull-up enabled, `button.value()` returns `1` whenever the button is not being pressed, because the pull-up holds the pin at 3.3 volts. Pressing the button connects the pin directly to ground, and `.value()` immediately returns `0`. Every input technique in this chapter builds on this one method call.

## Checking Every Frame: The Polling Input Loop

The simplest way to notice a button press is to ask the button, over and over, "are you pressed right now?" A **polling input loop** checks a control's current state repeatedly — typically once per pass through an animation loop — rather than waiting to be told a change happened. This fits naturally into the non-blocking animation loop Chapter 12 already built, since that loop was already running continuously without ever calling `sleep()`.

A bridge sentence before the code: this loop reuses Chapter 12's non-blocking animation timing and adds one new check near the bottom, comparing the button's current state against its state on the previous pass to detect the exact moment a press begins.

```python
import time

last_button_state = 1   # 1 = released, matches the pull-up's resting HIGH

while True:
    now = time.ticks_ms()
    # ... Chapter 12's blink and gaze timing goes here ...

    current_button_state = button.value()
    if current_button_state == 0 and last_button_state == 1:
        handle_button_press()          # fires once, on the HIGH-to-LOW edge
    last_button_state = current_button_state

    fb.fill(BLACK)
    draw_face(fb, state)
    fb.show()
```

Notice that `handle_button_press()` only runs when `current_button_state` is `0` **and** `last_button_state` was `1` the previous pass — that comparison is what turns a button held down for half a second into a single event instead of hundreds of repeated calls while the loop keeps spinning. Polling is easy to reason about because the check sits in plain sight, right inside a loop whose order you already control. Its weakness is timing: a press that starts and finishes entirely between two passes through the loop can be missed completely, and a loop busy with something slow, like a long drawing operation, checks the button less often than it should.

## The Alternative: Button Interrupt Handler

Polling has to keep asking. An **interrupt** flips that relationship around: instead of the main program checking a pin, the pin tells the program the instant something changes. A **button interrupt handler** is a function registered with `Pin.irq()` that MicroPython runs automatically the moment a button's state changes, without the main loop needing to check that pin at all.

A bridge sentence before the code: this snippet registers a handler function that runs the instant pin 14 drops from HIGH to LOW, setting a flag the main loop can check whenever it is convenient.

```python
from machine import Pin

button_pressed_flag = False

def on_button_press(pin):
    global button_pressed_flag
    button_pressed_flag = True

button = Pin(14, Pin.IN, Pin.PULL_UP)
button.irq(trigger=Pin.IRQ_FALLING, handler=on_button_press)
```

`trigger=Pin.IRQ_FALLING` tells MicroPython to call `on_button_press()` only on a falling edge — the exact moment the pin drops from HIGH to LOW, which is when this pull-up-wired button is first pressed. The handler itself does almost nothing: it just sets `button_pressed_flag` to `True` and returns immediately, leaving the main loop to notice that flag and react to it on its own schedule.

!!! mascot-thinking "Two Ways to Notice the Same Press"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Polling and interrupts solve the exact same problem — "did the button change?" — from two opposite directions. Polling means your code keeps asking; an interrupt means the hardware keeps watching and taps your program on the shoulder. Neither one is simply "better" — each trades away something the other one has.

The table below lines up the two approaches side by side, the same way Chapter 12 compared `sleep()` and `ticks_ms()` timing.

| | Polling Input Loop | Button Interrupt Handler |
|---|---|---|
| How it notices a press | Main loop checks `.value()` every pass | `Pin.irq()` calls a handler automatically |
| Can miss a very brief press | Yes, if the press falls between two checks | No, the handler fires on the exact edge |
| Wastes cycles when idle | Yes, checks constantly even when nothing changed | No, the handler only runs when something happens |
| Code complexity | Simple — one `if` statement in a loop you already control | More complex — requires a short handler, often a flag, and debouncing |
| Timing predictability | Runs exactly where you placed the check | Can interrupt the main loop at any point, mid-instruction |

Watching a simulated press land at different moments makes the trade-off in that table far more concrete than reading it as a list of bullet points.

#### Diagram: Polling vs Interrupt Response Simulator

<iframe src="../../sims/polling-vs-interrupt-response-simulator/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Polling vs Interrupt Response Simulator</summary>
Type: microsim
**sim-id:** polling-vs-interrupt-response-simulator<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, examine

Learning objective: Differentiate polling-based button reading from interrupt-driven button reading by examining, for presses of varying length and timing, whether each approach detects a simulated button press.

Canvas layout:
- Left 70% (responsive, roughly 460x320 at default width): two stacked panels, top labeled "Polling loop" and bottom labeled "Interrupt handler", each showing a repeating loop-check tick marker (polling panel) or a "listening" indicator (interrupt panel)
- Right 30%: a "Press Button" control with a press-duration slider, a "Loop check interval" slider (polling panel only), a shared event log, and a "Reset" button

Visual elements:
- Polling panel: a horizontal timeline with small tick marks at each loop check (spaced by the check-interval slider); a press rendered as a shaded bar over the timeline
- Interrupt panel: a horizontal timeline with no discrete ticks, since the handler can fire at any instant; a press rendered the same shaded bar
- When a simulated press bar overlaps at least one polling tick, the polling panel flashes green ("CAUGHT"); when a very brief press falls entirely between two ticks, the polling panel flashes red ("MISSED")
- The interrupt panel always flashes green the instant the press begins, regardless of duration
- Event log lines such as "t=212ms: 15ms press started", "t=212ms: interrupt handler fired at t=212ms", "t=212ms: polling loop next checks at t=250ms — MISSED"

Interactive controls:
- Slider: "Press duration" from 5-500ms
- Slider: "Loop check interval (polling panel only)" from 10-200ms
- Button: "Press Button Now" — triggers a press at the current simulated time using the chosen duration
- Button: "Reset" — clears the log and restarts both timelines from zero

Default parameters: press duration 20ms, loop check interval 50ms, log empty

Data Visibility Requirements:
  Stage 1: Show both panels idle, with the polling panel's tick spacing matching the check-interval slider
  Stage 2: Triggering a press shows the exact press-start time logged for both panels simultaneously
  Stage 3: The interrupt panel logs its fire time as identical, or within 1ms, of the press-start time
  Stage 4: The polling panel logs either the next tick time (if caught) or "MISSED" if the press duration is shorter than the gap to the next tick

Instructional Rationale: An Analyze-level objective requires the learner to examine two detection mechanisms under the same triggering event and identify why one can fail where the other cannot; letting the learner control press duration and loop interval directly lets them construct the exact failure case — a very short press between two polling ticks — rather than being told about it.

Responsive design: controls and log move below the two panels on viewports narrower than 600 pixels; panels scale to fill their container's width.

Implementation: p5.js for the timeline rendering and simulated clock; a shared simulated millisecond counter drives both panels so press timing is directly comparable between them.
</details>

!!! mascot-warning "Keep Interrupt Handlers Short"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Never call `draw_face()`, `fb.show()`, or anything else slow directly inside an interrupt handler. The handler can fire in the middle of the main loop doing something else entirely, and a slow handler blocks that other work exactly the way a long `sleep()` call did in Chapter 12. Set a flag, and let the main loop do the real work when it is ready.

One more wrinkle deserves a mention before moving on: a real mechanical push button does not switch cleanly between HIGH and LOW. Its metal contacts physically bounce for a few milliseconds when pressed, so a single physical press can trigger an interrupt handler several times in quick succession — a problem called **switch bounce**. Production-quality interrupt code typically debounces a button by ignoring any second trigger that arrives within a few milliseconds of the first one, using a stored timestamp compared with `ticks_diff()`, the same tool Chapter 12 used for animation timing.

## The Bigger Idea: Event-Driven Programming

The interrupt handler in the previous section is one example of a much bigger idea in computer science. **Event-driven programming** is a paradigm in which code runs in response to something happening — a button press, a sensor trigger, an incoming message — rather than executing in one fixed, predetermined sequence from top to bottom. Every program in this book up through Chapter 12 has been **sequential**: `while True:` loops, functions called in a fixed order, one line always following the line before it. `Pin.irq()` breaks that pattern for the first time — `on_button_press()` might run between any two lines of the main loop, at a moment the programmer does not control and cannot predict in advance.

This shift matters beyond robot faces. Web browsers, phone apps, and video games are almost entirely event-driven: a click, a tap, or a network response triggers code, and the rest of the program waits and reacts rather than marching through a script. Recognizing "this is event-driven" the first time you meet `Pin.irq()` means recognizing the same underlying pattern the next time it shows up in a very different context.

## Reading a Smooth Signal: Analog Input Reading

A button only ever reports two states, but a potentiometer reports something richer. **Analog input reading** captures a continuously variable voltage — one that can be anywhere between two limits, not just HIGH or LOW — through one of the RP2040's dedicated analog input pins. Chapter 1 introduced the potentiometer itself: a knob that divides the board's voltage smoothly between 0 and 3.3 volts as it turns.

A bridge sentence before the code: this snippet creates an analog input on GPIO pin 26 and reads the potentiometer's current position as a raw digital number.

```python
from machine import ADC, Pin

pot = ADC(Pin(26))
raw_value = pot.read_u16()   # 0-65535
```

A microcontroller's internal circuitry cannot store or compute with a raw voltage directly — it needs numbers. **Analog-to-digital conversion** is the process that solves this: a dedicated piece of hardware called an ADC (analog-to-digital converter) measures an incoming analog voltage and converts it into a discrete digital number the RP2040's processor can actually use in code. The RP2040's ADC reports that number across a 16-bit range, from 0 (0 volts) up to 65535 (3.3 volts), which is why `read_u16()` — read as an unsigned 16-bit integer — is the method used to retrieve it.

## Turning a Raw Number Into Something Useful: Potentiometer Value Mapping

A raw ADC reading between 0 and 65535 is not, by itself, a useful number for a face parameter — nobody wants an eyebrow angle measured in tens of thousands. **Potentiometer value mapping** converts that raw ADC range into a smaller, meaningful range for a specific face parameter, such as an eyebrow angle running from -30 to 30 degrees, using a simple linear formula.

A bridge sentence before the code: this reusable function maps any value from one numeric range into a different numeric range, preserving its relative position — for example, a raw ADC reading exactly in the middle of its range maps to a value exactly in the middle of the output range.

```python
def map_range(value, in_min, in_max, out_min, out_max):
    """Linearly map value from [in_min, in_max] into [out_min, out_max]."""
    return out_min + (value - in_min) * (out_max - out_min) / (in_max - in_min)

raw_value = pot.read_u16()                              # e.g. 32768, roughly mid-turn
eyebrow_angle = map_range(raw_value, 0, 65535, -30, 30)  # -> 0.0 degrees, dead center
```

The formula works by first turning `value` into a fraction of the input range — how far along, from 0.0 to 1.0, the raw reading sits between `in_min` and `in_max` — and then applying that same fraction to the output range. A raw reading of 0 always maps to `out_min`, a raw reading of 65535 always maps to `out_max`, and anything in between lands proportionally in the output range. This exact `map_range()` function will reappear throughout the rest of this book any time a continuous control needs to drive a face parameter.

Turning a simulated knob and watching both the raw ADC number and the mapped output change together, with the formula's own arithmetic shown live, makes this conversion far easier to trust than reading the formula alone.

#### Diagram: Potentiometer ADC Mapping Visualizer

<iframe src="../../sims/potentiometer-adc-mapping-visualizer/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Potentiometer ADC Mapping Visualizer</summary>
Type: microsim
**sim-id:** potentiometer-adc-mapping-visualizer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3)
Bloom Taxonomy Verb: calculate, demonstrate

Learning objective: Calculate a mapped face-parameter value from a raw ADC reading using the linear mapping formula, and demonstrate how turning a simulated potentiometer knob changes the raw value, the mapped value, and the live arithmetic together.

Canvas layout:
- Left 45% (responsive, roughly 260x300 at default width): a rotating knob graphic the learner can drag, with a small eyebrow icon that tilts live to preview the mapped output
- Right 55%: raw ADC readout (0-65535), the `map_range()` formula with the current numbers substituted in, the mapped output readout, and range-editing number inputs

Visual elements:
- Knob graphic rotating from a 7-o'clock to 5-o'clock position as it is dragged, labeled with its current percentage of full travel
- Raw readout: "raw_value = 41,000 / 65535"
- Live formula line: "eyebrow_angle = -30 + (41000 - 0) * (30 - (-30)) / (65535 - 0) = 7.5"
- A small face preview showing one eyebrow tilted to the current mapped angle
- Editable number inputs for `out_min` and `out_max`, defaulting to -30 and 30, so the learner can see the same raw value map differently into a different output range

Interactive controls:
- Draggable knob (mouse drag or click-and-hold-and-move) sets the raw ADC value continuously from 0 to 65535
- Number inputs: "Output min" and "Output max" (default -30 and 30), re-rendering the formula line and mapped output immediately
- Button: "Snap to center" sets the knob to exactly the midpoint for a clean round-number example
- Button: "Reset ranges" restores -30/30 defaults

Default parameters: knob at 50% (raw_value = 32768), out_min = -30, out_max = 30

Data Visibility Requirements:
  Stage 1: Show the raw ADC value updating live as the knob is dragged, with no mapping applied yet
  Stage 2: Show the full map_range formula with the current raw_value, in_min, in_max, out_min, and out_max substituted in as concrete numbers
  Stage 3: Show the resulting mapped value and the eyebrow preview updating together, in sync with the knob
  Stage 4: Changing out_min/out_max re-maps the same raw_value to a visibly different output, reinforcing that mapping depends on both ranges

Instructional Rationale: An Apply-level objective calls for a parameter-exploration calculator rather than a passive animation — the learner must manipulate the raw input and directly observe the calculated output, with the formula's real numbers visible at every step, to be able to compute a mapped value themselves afterward.

Responsive design: the formula and readouts stack below the knob on viewports narrower than 600 pixels; the knob scales proportionally on window resize.

Implementation: p5.js for the knob drag interaction and live-updating formula text; the same `map_range()` logic taught in this chapter reimplemented directly in JavaScript so the displayed arithmetic always matches the MicroPython code exactly.
</details>

## Tracking Which Mode a Face Is In: The Mode State Machine

A button and a potentiometer are more useful together than either is alone, but combining them cleanly requires a way to track what the robot is currently doing. A **mode state machine** is a pattern for organizing a program around a small, fixed set of named modes, with clear rules for which button press moves the program from one mode to the next. A **global state variable** is the single piece of state, visible to the entire program, that stores which mode is currently active — the state machine's memory of where it is right now.

A bridge sentence before the code: this snippet names three modes as constants, then stores the currently active one in a single global variable that starts in the first mode.

```python
NEUTRAL_MODE = 0
GAZE_MODE = 1
ADJUST_MODE = 2

current_mode = NEUTRAL_MODE   # the global state variable
```

Naming each mode as a constant (`NEUTRAL_MODE`, `GAZE_MODE`, `ADJUST_MODE`) instead of using bare numbers like `0`, `1`, and `2` throughout the program makes every later comparison, like `if current_mode == GAZE_MODE:`, read clearly instead of forcing you to remember what each number means. `current_mode` is deliberately just one variable, storing exactly one of those three values at any moment — never more than one mode is active at the same time.

A picture of exactly which modes exist and which button presses move between them is called a **state transition diagram** — a small graph where each mode is a labeled circle, and each arrow shows a transition triggered by some event, most often a button press in this book's projects. This chapter's three-mode example uses the simplest possible transition rule: a single short button press always advances to the next mode in a fixed cycle, wrapping back to the first mode after the last one.

| Current Mode | Trigger | Next Mode | What the Face Does |
|---|---|---|---|
| NEUTRAL_MODE | Button press | GAZE_MODE | Face looks calm; button press begins gaze-following mode |
| GAZE_MODE | Button press | ADJUST_MODE | Pupils track a simulated target; button press switches to adjusting a parameter |
| ADJUST_MODE | Button press | NEUTRAL_MODE | Potentiometer controls eyebrow angle live; button press returns to neutral |

Clicking through the same three modes and transitions on an interactive diagram, instead of only reading the table above, makes the cycle's direction and triggers easier to remember.

#### Diagram: Mode State Transition Diagram

<iframe src="../../sims/mode-state-transition-diagram/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Mode State Transition Diagram</summary>
Type: graph-model
**sim-id:** mode-state-transition-diagram<br/>
**Library:** vis-network<br/>
**Status:** Specified

Bloom Taxonomy Level: Understand (L2)
Bloom Taxonomy Verb: explain, interpret

Learning objective: Explain the mode state machine's states and transitions by clicking each mode and each transition arrow to interpret what button action triggers it, what the global state variable's value becomes, and what the face does in that mode.

Purpose: Illustrate the three-mode cycle (NEUTRAL_MODE, GAZE_MODE, ADJUST_MODE) this chapter builds, letting the learner explore triggers and behaviors interactively rather than reading them only in prose or a table

Node types:
1. Mode node (rounded rectangle, one per mode)
   - Properties: mode name, constant value (0, 1, or 2), one-sentence description of face behavior
   - Examples: "NEUTRAL_MODE (0)", "GAZE_MODE (1)", "ADJUST_MODE (2)"

Edge types:
1. Transition arrow (directed, curved to show the cycle)
   - Properties: trigger event, resulting global state variable assignment
   - Example: NEUTRAL_MODE → GAZE_MODE labeled "button press"

Sample data:
- NEUTRAL_MODE --button press--> GAZE_MODE
- GAZE_MODE --button press--> ADJUST_MODE
- ADJUST_MODE --button press--> NEUTRAL_MODE

Layout: Circular layout with three nodes evenly spaced and curved directional arrows forming a visible cycle

Interactive features:
- Click a mode node: highlights it and opens a side panel showing its constant value, a one-sentence description of face behavior in that mode, and the code line that sets `current_mode` to it
- Click a transition arrow: opens a side panel showing the trigger ("a single short button press, detected on the HIGH-to-LOW edge") and the exact line of code that performs the reassignment, e.g. `current_mode = ADJUST_MODE`
- Hover a node or arrow: shows a short tooltip with its name before clicking for full detail
- Drag nodes to reposition; scroll to zoom; click background to deselect and clear the side panel

Visual styling:
- NEUTRAL_MODE node in teal, GAZE_MODE node in coral, ADJUST_MODE node in a neutral gray-blue, consistent with the mascot's color identity
- Selected node or edge highlighted with a thicker border and brighter color
- Arrows drawn with visible arrowheads showing direction of the cycle

Legend: A small key explaining that circles are modes and arrows are button-triggered transitions

Implementation: vis-network for the graph rendering, click and hover event handlers wired to a side-panel infobox; a small JavaScript object storing each node's and edge's descriptive text
</details>

## Doing Two Things Truly at Once: Cooperative Multitasking and Dual-Core Processing

Every technique so far — polling, interrupts, mode switching — has run on a single processor core, one instruction after another. Chapter 1 mentioned that the RP2040 actually contains two identical processor cores, and MicroPython can put that second core to work. **Dual-core processing** means running separate, independent code on each of the RP2040's two cores at the same time, rather than one core doing everything alone. **Core task assignment** is the design decision of which job goes on which core — for example, dedicating core 0 to redrawing and animating the face while core 1 does nothing but poll a button and a potentiometer.

A bridge sentence before the code: this snippet starts a second thread running on the RP2040's other core, using MicroPython's `_thread` module, dedicated entirely to polling input while the main loop keeps animating the face.

```python
import _thread
import time

def core1_input_task():
    """Runs on the second core: polls the button and potentiometer only."""
    while True:
        current_button_state = button.value()
        if current_button_state == 0:
            handle_button_press()
        time.sleep_ms(10)

_thread.start_new_thread(core1_input_task, ())

# core 0 keeps running the animation loop, uninterrupted by input polling
while True:
    fb.fill(BLACK)
    draw_face(fb, state)
    fb.show()
```

`_thread.start_new_thread()` hands `core1_input_task` off to the RP2040's second core, which then runs that function's `while True:` loop completely independently of the main program below it. The benefit is real: a slow or busy task on one core — a complicated draw call, for instance — can no longer make the other core late in checking a button. The cost is real too: both cores can potentially read and write the same global state variable, like `current_mode`, at the exact same instant, and getting that safe requires care.

That shared-safety idea is what the word **cooperative** in "cooperative multitasking" actually refers to here — the two cores are not fighting over the same resources because the program is written carefully, with each core sticking to its assigned job and touching shared state in predictable, limited ways, not because MicroPython enforces it automatically.

!!! mascot-encourage "This One's Optional — And That's Fine"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Dual-core code is genuinely more advanced than anything else in this chapter, and a single-core polling loop is completely sufficient for nearly every robot face project in this course. Understanding *why* dual-core task assignment exists — and that the RP2040 is unusual among cheap microcontrollers for having it — is the real goal here, not mastering every detail of `_thread` today.

## Putting It Together: A Button-Driven Mode Cycle

Every idea in this chapter converges in one small, complete program: a polling input loop, edge detection on a button press, and a three-mode state machine stored in a single global state variable — running comfortably on one core, exactly as most projects in this book will.

A bridge sentence before the code: this loop polls the button once per pass, advances `current_mode` through the NEUTRAL_MODE, GAZE_MODE, ADJUST_MODE cycle on each new press, and reads the potentiometer only while in ADJUST_MODE.

```python
import time
from machine import Pin, ADC

NEUTRAL_MODE = 0
GAZE_MODE = 1
ADJUST_MODE = 2

button = Pin(14, Pin.IN, Pin.PULL_UP)
pot = ADC(Pin(26))

current_mode = NEUTRAL_MODE      # global state variable
last_button_state = 1

while True:
    current_button_state = button.value()
    if current_button_state == 0 and last_button_state == 1:
        if current_mode == NEUTRAL_MODE:
            current_mode = GAZE_MODE
        elif current_mode == GAZE_MODE:
            current_mode = ADJUST_MODE
        else:
            current_mode = NEUTRAL_MODE
    last_button_state = current_button_state

    if current_mode == ADJUST_MODE:
        raw_value = pot.read_u16()
        state["eyebrow_angle"] = map_range(raw_value, 0, 65535, -30, 30)

    fb.fill(BLACK)
    draw_face(fb, state)
    fb.show()
```

Read that loop the way you would read the state transition diagram above: the button-edge check decides whether `current_mode` moves forward one step, the `if current_mode == ADJUST_MODE:` block only runs the potentiometer-mapping code while that specific mode is active, and the drawing call at the bottom runs every single pass no matter which mode is current. Chapter 14 takes this exact pattern and grows it into a full expression menu — more modes, more transitions, and a state transition diagram that looks a lot like a small map of a robot's personality.

## Chapter Summary

You now know how to read a button and a potentiometer in MicroPython, choose between polling and interrupts, and use a small state machine to let physical controls change a robot face's behavior.

- Digital input reading uses `machine.Pin(n, Pin.IN, Pin.PULL_UP)` and `.value()` to read a button as HIGH (1, released) or LOW (0, pressed), building directly on Chapter 1's pull-up resistor wiring.
- A polling input loop checks a control's state once per pass through the animation loop; it is simple to reason about but can miss very brief presses and wastes cycles checking nothing.
- A button interrupt handler, registered with `Pin.irq()`, runs automatically the instant a pin changes state, catching even very brief presses — at the cost of added complexity like debouncing and keeping the handler short.
- Event-driven programming is the general paradigm interrupt handlers exemplify: code that runs in response to an event rather than in one fixed sequential order.
- Analog input reading, through `machine.ADC()`, captures a potentiometer's continuously variable voltage; analog-to-digital conversion is the hardware process that turns that voltage into a discrete digital number, typically 0-65535 on the RP2040.
- Potentiometer value mapping uses a linear formula to convert that raw range into a useful range for a face parameter, such as -30 to 30 degrees of eyebrow angle.
- A mode state machine tracks which of a small set of named modes — like NEUTRAL_MODE, GAZE_MODE, and ADJUST_MODE — is currently active in one global state variable, with button presses driving transitions shown on a state transition diagram.
- Cooperative multitasking and dual-core processing let the RP2040 assign separate tasks, like animation and input polling, to its two cores independently; this is optional and advanced, since a single-core polling loop is enough for most robot face projects.

!!! mascot-celebration "Your Face Can Finally Listen"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Look at everything just connected: the button and potentiometer Chapter 1 wired, the non-blocking loop Chapter 12 built, and a small state machine now tying it all together. This robot face can finally respond to a person standing next to it — which is the whole point of drawing a face in the first place.

??? question "Self-Check: Why would you choose a button interrupt handler over a polling input loop, and what is the trade-off? — Click to reveal"
    An interrupt handler, registered with `Pin.irq()`, is the better choice when a press must never be missed — for example, if it could be very brief or arrive while the main loop is busy with something slow. Unlike a polling input loop, which only notices a button change on its next pass through the loop, an interrupt handler runs the instant the pin's state changes, regardless of what else the program is doing at that moment. The trade-off is complexity: an interrupt handler can fire in the middle of any other code, so it must be kept extremely short — usually just setting a flag — and real button hardware needs debouncing to avoid one physical press firing the handler several times. A polling input loop, by contrast, is simple to read and reason about, and is completely adequate for most robot face projects where missing an occasional very brief press is not a serious problem.
