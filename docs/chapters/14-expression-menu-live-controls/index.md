---
title: Building an Expression Menu & Live Controls
description: How to debounce buttons, track a rotary encoder's quadrature signal, and combine both with Chapter 9's parameterized face into a working expression menu with live parameter tuning.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 16:05:51
version: 0.09
---

# Building an Expression Menu & Live Controls

## Summary

This chapter combines the previous chapter's state machine and input-reading skills into a complete, working interaction design: a multi-mode expression-selection menu with a default idle state, properly debounced buttons, rotary-encoder position and direction tracking, and live tuning of a face parameter in response to user input. After completing this chapter, students will be able to build a menu that lets a user cycle through and adjust a robot's expressions with physical controls.

## Concepts Covered

This chapter covers the following 13 concepts from the learning graph:

1. State-Based Animation Trigger
2. Button Debounce
3. Rotary Encoder Position Tracking
4. Encoder Direction Detection
5. Multi-Mode Menu
6. Expression Selection Menu
7. Live Parameter Tuning
8. Input Debouncing Delay
9. User Interface Feedback
10. Control Mapping Design
11. Default Idle State
12. Debounce Time Constant
13. Encoder Quadrature Signal

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Hardware & Electronics Foundations](../01-hardware-electronics-foundations/index.md)
- [Chapter 9: Facial Anatomy & Layout Design](../09-facial-anatomy-layout-design/index.md)
- [Chapter 10: Emotion Theory & the Core Expression Set](../10-emotion-theory-core-expressions/index.md)
- [Chapter 12: Animating Expressions: Timing & Motion](../12-animating-expressions/index.md)
- [Chapter 13: Interactive Controls: Inputs & Concurrency](../13-interactive-controls-inputs/index.md)

---

## From Two Chapters to One Working Menu

!!! mascot-welcome "Time to Build the Real Thing"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Chapter 13 taught you to read a button, read a knob, and track a mode with a small state machine. This chapter turns those separate skills into one real project: a menu a person can actually use to make a robot face smile, frown, or look surprised, on command, with a knob to fine-tune whatever expression is showing.

Every piece this chapter needs already exists somewhere in this book. Chapter 9 gave every expression a dictionary of parameters — an eyebrow angle here, a mouth curve there. Chapter 10 gave those dictionaries thirteen named expressions to choose between. Chapter 12 taught a face to animate smoothly over time instead of snapping between poses. Chapter 13 taught a program to notice a button press or a knob turn. This chapter's job is to wire all four of those skills into a single menu, and to fix a hardware wrinkle — a button's messy electrical behavior — that would otherwise sabotage the whole thing.

## Real Buttons Are Messy: Button Debounce and the Debounce Time Constant

Chapter 13 mentioned, in passing, that a real mechanical push button does not switch cleanly from released to pressed. It is time to take that seriously. When a metal contact inside a button snaps shut, it physically bounces — springing apart and touching again several times over the space of a few milliseconds — before settling into a steady connection. **Button debounce** is the general problem this causes: a single physical press can register as several rapid, separate presses if a program reads the pin during that bouncing window instead of after it.

For a menu, this is not a minor annoyance. A polling loop or an interrupt handler that reacts to every raw edge sees three, five, or even eight presses where a person made exactly one. In an expression menu that advances one expression per press, an undebounced button does not calmly advance from "happy" to "sad" — it can leap straight past "sad," "surprised," and "angry" in the time it takes a thumb to finish pressing down.

!!! mascot-thinking "Milliseconds You Can't See, But Definitely Feel"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Contact bounce usually lasts somewhere between 1 and 20 milliseconds — far too fast for a human finger to notice, but easily fast enough for a microcontroller running millions of instructions per second to catch several times. The fix is not to make the button better; it is to make the code patient.

The fix is a fixed waiting period. A **debounce time constant** is the short amount of time — typically somewhere between 20 and 50 milliseconds — that a program deliberately ignores any further changes on a pin after it first detects a press. As long as the debounce time constant is longer than the button's actual bounce duration, every one of those extra bounce edges arrives during the ignore window and never reaches the rest of the program. Choosing a value too short leaves bounce edges free to slip through; choosing a value far too long, on the other hand, can make a program feel sluggish by refusing to notice a genuinely fast second press.

## Waiting It Out: Input Debouncing Delay

Knowing that a debounce time constant is needed is only half the job — a program still needs a concrete way to enforce it. **Input debouncing delay** is the practical implementation of that waiting period, and this book uses two different techniques depending on whether a button is read by polling or by interrupt.

The first technique fits naturally into a polling input loop, the same style of loop Chapter 13 built for reading buttons every pass through the animation loop. Instead of ignoring changes for a fixed stretch of code, the loop remembers the timestamp of the last accepted press and simply refuses to accept a new one until enough time has passed.

A bridge sentence before the code: this loop reuses Chapter 13's edge-detection pattern, but only accepts a new HIGH-to-LOW transition as a real press if the debounce time constant has already elapsed since the previous accepted press.

```python
import time
from machine import Pin

button = Pin(14, Pin.IN, Pin.PULL_UP)

last_button_state = 1     # 1 = released, matches the pull-up's resting HIGH
last_press_time = 0
DEBOUNCE_MS = 30          # the debounce time constant

while True:
    now = time.ticks_ms()
    current_button_state = button.value()

    if current_button_state == 0 and last_button_state == 1:
        if time.ticks_diff(now, last_press_time) > DEBOUNCE_MS:
            handle_button_press()
            last_press_time = now
    last_button_state = current_button_state
```

Every bounce still produces its own HIGH-to-LOW transition, so the `if current_button_state == 0 and last_button_state == 1:` check still fires several times during a single physical press. What stops those extra firings from reaching `handle_button_press()` is the inner check: `time.ticks_diff(now, last_press_time)` measures how long it has been since the last *accepted* press, and any bounce arriving within `DEBOUNCE_MS` of that timestamp is silently dropped.

The second technique works inside an interrupt handler instead, and it takes advantage of the fact that the handler already knows the exact instant a change occurred. Chapter 13 warned that interrupt handlers must stay short — this is the one narrow exception, because a very brief pause of 20 milliseconds is short enough not to meaningfully delay the rest of the program, and it is exactly what a debounce time constant calls for.

A bridge sentence before the code: this handler pauses for the debounce time constant the instant it fires, then rechecks the pin — if the pin is still LOW after that pause, the press was real; if it has already bounced back HIGH, the handler ignores it.

```python
from machine import Pin
import time

button = Pin(14, Pin.IN, Pin.PULL_UP)
button_pressed_flag = False

def on_button_press(pin):
    global button_pressed_flag
    time.sleep_ms(20)          # the debounce time constant, held inside the handler
    if pin.value() == 0:       # still pressed after the bounce has settled?
        button_pressed_flag = True

button.irq(trigger=Pin.IRQ_FALLING, handler=on_button_press)
```

Both techniques solve the same problem from opposite directions, which the table below lines up side by side.

| | Polling Cooldown | Interrupt Recheck |
|---|---|---|
| Where the wait happens | Comparing `ticks_diff()` against the last accepted press | A short `sleep_ms()` inside the handler itself |
| Extra bounce edges | Rejected by the cooldown timestamp check | Never even seen — the handler recheck confirms the pin is still LOW |
| Fits which style | Polling input loops | Button interrupt handlers |
| Main risk if done wrong | Debounce window too short, letting a bounce through | Sleeping too long, delaying other interrupt-driven work |

Watching a real bounce pattern next to its cleaned-up debounced output makes the whole idea click faster than reading timestamps in a table.

#### Diagram: Button Bounce Timeline Visualizer

<iframe src="../../sims/button-bounce-timeline-visualizer/main.html" width="100%" height="490px" scrolling="no"></iframe>

<details markdown="1">
<summary>Button Bounce Timeline Visualizer</summary>
Type: microsim
**sim-id:** button-bounce-timeline-visualizer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, examine

Learning objective: Differentiate a raw, bouncing button signal from a properly debounced signal by examining a shared timeline, and identify how the debounce time constant determines which transitions get accepted as a single press.

Canvas layout:
- Top panel (responsive, roughly 600x120 at default width): raw signal timeline labeled "Raw pin reading"
- Middle panel (same width, 120px tall): debounced signal timeline labeled "Debounced output"
- Bottom: "Press the Button" button, "Bounce severity" slider, "Debounce time constant" slider, event log

Visual elements:
- Raw trace as a stepped HIGH/LOW line with 3-8 rapid spikes within the first 5-15ms after a simulated press begins, spike count set by the bounce-severity slider
- Debounced trace as a single clean HIGH-to-LOW step, delayed until the debounce window has elapsed since the first raw edge
- A shaded band overlaid on both timelines marking the active debounce time constant window after the first detected edge
- Event log lines such as "t=0ms: contact bounce begins", "t=3ms: bounce", "t=7ms: bounce", "t=30ms: debounce window closes, press accepted"

Interactive controls:
- Button: "Press the Button" triggers one simulated press with bounce
- Slider: "Bounce severity" from 1-8 spikes
- Slider: "Debounce time constant" from 5-100ms
- Button: "Reset" clears the timelines and log

Default parameters: bounce severity 4 spikes, debounce time constant 30ms

Behavior: setting the debounce time constant comfortably longer than the bounce duration always produces exactly one clean debounced edge. Dragging the debounce time constant below the actual bounce duration lets a second raw spike slip past the shaded window, producing a second, incorrect step in the debounced trace — a direct, visible demonstration of the "menu skips expressions" failure this chapter warns about.

Instructional Rationale: An Analyze-level objective requires examining two related signals side by side and identifying the structural cause of correct versus incorrect debouncing; letting the learner shrink the debounce time constant below the bounce duration lets them construct the exact failure mode described in this chapter rather than being told about it.

Responsive design: panels stack vertically below 600px, with sliders and buttons moving beneath the timelines.

Implementation: p5.js for the timeline rendering and a simulated bounce generator; a shared simulated millisecond clock drives both panels so the debounce window is visibly synchronized to the raw trace.
</details>

!!! mascot-warning "Skip the Debounce, Skip the Expressions"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Forget to debounce a menu button and the symptom is unmistakable: one press of "next expression" jumps from "happy" straight to "angry," skipping two or three expressions in between. Every bounce edge counted as its own press. If your menu ever seems to have a mind of its own, check the debounce logic first.

## A Home Base: The Default Idle State

A menu that only ever reacts to buttons has a gap: what does the face show before anyone touches a control, or after a person walks away? A **default idle state** is the expression, and its accompanying animation, that a face returns to or starts in whenever nothing else is happening — a sensible "home" the menu falls back to rather than freezing on whatever was last selected.

The idle state is not a blank or frozen face. Chapter 12 built idle animation specifically so a resting face still blinks occasionally and glances around, rather than staring, motionless, like a broken screen. This chapter's menu reuses that exact idle animation as its default state: neutral eyebrows, a relaxed mouth, and the same slow blink-and-gaze behavior from Chapter 12, active any time the menu has not been touched for a while. A simple inactivity timer — comparing the current time against a timestamp updated on every button press or knob turn — decides when to fall back to idle.

## Building the Menu: Multi-Mode Menu and Expression Selection Menu

With debouncing solved and a default state defined, the menu structure itself can finally be built. A **multi-mode menu** organizes a program around more than one distinct interaction mode — browsing expressions, tuning a parameter, sitting idle — the same way Chapter 13's mode state machine organized a face around NEUTRAL_MODE, GAZE_MODE, and ADJUST_MODE. An **expression selection menu** is this chapter's specific multi-mode menu: one button press advances forward through Chapter 10's named expressions, with each expression showing immediately as a live preview the instant it is selected.

Cycling forward through a fixed list, wrapping back to the start after the last item, is one of the simplest and most reliable menu patterns available — a student never needs to guess how far "back" is, because there is only one direction to press.

A bridge sentence before the code: this snippet stores Chapter 10's expression names in order, keeps a single index of which one is currently selected, and advances that index by one, wrapping around, every time the menu button is pressed.

```python
EXPRESSION_NAMES = [
    "neutral", "happy", "sad", "surprised", "angry",
    "disgusted", "fearful", "sleepy", "curious",
    "confused", "mischievous", "loving", "bored",
]   # Chapter 10's full 13-expression core set

current_index = 0

def next_expression():
    global current_index
    current_index = (current_index + 1) % len(EXPRESSION_NAMES)
    enter_expression(EXPRESSION_NAMES[current_index])
```

`(current_index + 1) % len(EXPRESSION_NAMES)` is the wraparound trick: adding 1 normally advances to the next name in the list, and the `%` (modulo) operator resets the index back to 0 the moment it would otherwise run past the last entry — from "bored" straight back to "neutral," with no special-case code required. `enter_expression()` is a function this chapter defines next, and it is where a plain index turns into an actual face change.

## Making an Entrance: State-Based Animation Trigger

Simply swapping one expression's parameter dictionary for another, instantly, works but feels flat — real faces do not snap into surprise, they widen their eyes first and then settle. A **state-based animation trigger** is a short, automatic animation that fires the moment a face enters a particular state, before that state's resting parameters take over. Entering "surprised" is the clearest example in this chapter's expression set: the eyebrows should briefly overshoot upward before easing back down to their normal surprised position.

A bridge sentence before the code: this pair of functions records the exact time an expression is entered, and — only while that expression is "surprised" and only for the first 150 milliseconds after entering it — overrides the eyebrow angle with a dramatic, temporary overshoot value before letting the expression's normal parameters take over.

```python
import time

surprise_burst_start = None

def enter_expression(name):
    global current_expression, surprise_burst_start
    current_expression = name
    if name == "surprised":
        surprise_burst_start = time.ticks_ms()   # arms the eyebrow-flick trigger

def apply_animation_triggers(state):
    if current_expression == "surprised" and surprise_burst_start is not None:
        elapsed = time.ticks_diff(time.ticks_ms(), surprise_burst_start)
        if elapsed < 150:
            state["eyebrow_angle"] = 40   # brief overshoot, well past the resting angle
        else:
            state["eyebrow_angle"] = EXPRESSIONS["surprised"]["eyebrow_angle"]
    return state
```

This is the exact same "compare elapsed time against a threshold" pattern Chapter 12 used for blinking and gazing — nothing new is invented here, it is simply pointed at a state entry instead of a repeating idle behavior. Any expression could get its own trigger this way: a "mischievous" entry could flick one eyebrow up and back down, or a "sleepy" entry could ease the eyes half-shut over half a second instead of snapping shut instantly.

## Deciding What Each Control Does: Control Mapping Design

A menu with two buttons and a knob has several controls, and nothing forces any particular one of them to mean "next expression" instead of "adjust a parameter." **Control mapping design** is the deliberate decision of which physical control performs which function — and it is a decision, not something to leave implicit or figure out later while wiring. A well-documented control mapping is the difference between a menu a classmate can pick up and use immediately, and one only its original builder can operate.

This chapter's expression menu uses a simple, three-control mapping that every example from here forward assumes.

| Control | Function | Why |
|---|---|---|
| Button 1 ("Next") | Advance to the next expression | The most frequent action deserves the simplest control |
| Button 2 ("Tune") | Toggle live-tuning mode on/off | A rare action gets its own dedicated confirm-style button, so it is never triggered by accident |
| Potentiometer or encoder | Adjust the current expression's parameter, only while tuning mode is on | A continuous control naturally fits a continuously adjustable value |

Writing this table down before wiring a single breadboard connection is worth the five minutes it takes. A control mapping documented this clearly also becomes the answer key for a common bug report — "the knob does nothing" almost always turns out to mean tuning mode was never toggled on.

## Going Deeper on the Knob: Rotary Encoder Position, Direction, and the Quadrature Signal

Chapter 1 introduced the rotary encoder as a knob that reports discrete clicks of rotation instead of an absolute voltage. It is time to see how that actually works, because a menu that lets a student turn a knob to fine-tune a parameter depends on tracking that rotation accurately.

!!! mascot-thinking "Two Signals, Slightly Out of Step"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A rotary encoder doesn't send one signal — it sends two, and the whole trick to reading it lives in the tiny timing gap between them. Once that gap makes sense, direction detection stops feeling like magic.

Inside a rotary encoder are two separate switches, wired to two separate GPIO pins, both toggling on and off as the knob turns. An **encoder quadrature signal** is the pattern these two square-wave outputs form together: the two signals are offset from each other by a quarter of a full step cycle, so one of them always changes slightly before the other. Turning the knob clockwise makes signal A lead signal B; turning it counter-clockwise reverses that order, making B lead A. Comparing which signal changed first is a complete, reliable way to know which direction the knob just turned — no absolute position sensor required.

**Encoder direction detection** is the act of making that comparison in code: reading both pins whenever either one changes, and checking whether they currently agree or disagree with each other. **Rotary encoder position tracking** is the running total this comparison feeds — a single counter that increases by one for every detected clockwise step and decreases by one for every counter-clockwise step, giving a program a continuously updated sense of "how far has this knob turned, and in which direction," even though the knob itself never reports an absolute position.

A bridge sentence before the code: this snippet wires both encoder pins to interrupts, and on every edge, compares the two pins' current values — if they differ, the knob just moved one step clockwise; if they match, it moved one step counter-clockwise.

```python
from machine import Pin

encoder_a = Pin(16, Pin.IN, Pin.PULL_UP)
encoder_b = Pin(17, Pin.IN, Pin.PULL_UP)

encoder_position = 0

def on_encoder_turn(pin):
    global encoder_position
    if encoder_a.value() != encoder_b.value():
        encoder_position += 1      # A led B: clockwise step
    else:
        encoder_position -= 1      # B led A: counter-clockwise step

encoder_a.irq(trigger=Pin.IRQ_FALLING, handler=on_encoder_turn)
encoder_b.irq(trigger=Pin.IRQ_FALLING, handler=on_encoder_turn)
```

Both `encoder_a` and `encoder_b` are registered on the same handler, so `on_encoder_turn()` runs the instant either pin changes — exactly the moment needed to compare the two pins' current values against each other. This is a simplified version of the pattern; production MicroPython code often reaches for a small dedicated encoder library that also filters out electrical noise, but the underlying idea — compare two out-of-phase signals to recover direction — is exactly what is happening either way.

Watching two square waves scroll by, one step at a time, makes the phase relationship far easier to trust than reading the comparison in code alone.

#### Diagram: Encoder Quadrature Signal Visualizer

<iframe src="../../sims/encoder-quadrature-signal-visualizer/main.html" width="100%" height="402px" scrolling="no"></iframe>

<details markdown="1">
<summary>Encoder Quadrature Signal Visualizer</summary>
Type: microsim
**sim-id:** encoder-quadrature-signal-visualizer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Understand (L2) / Analyze (L4)
Bloom Taxonomy Verb: explain, differentiate

Learning objective: Explain how a quadrature encoder's two out-of-phase square-wave signals encode rotation, and differentiate clockwise from counter-clockwise rotation by examining which of the two signals changes first on each step.

Canvas layout:
- Top (responsive, roughly 300x300 at default width): a rotating knob graphic with a "Position: N" counter beneath it
- Right/bottom 500x220: two stacked square-wave timelines labeled "Signal A" and "Signal B", scrolling as the knob turns, with a direction indicator above them

Visual elements:
- Two square waves offset by a quarter cycle from each other, redrawn live as the knob turns
- A vertical marker line at each edge showing which signal (A or B) transitioned first
- Direction indicator flashing green "CW" or blue "CCW" the instant a new step completes
- Position counter incrementing or decrementing by exactly 1 per detected step

Interactive controls:
- Draggable knob: dragging clockwise or counter-clockwise generates both signals live
- Button: "Step CW" and button "Step CCW" advance exactly one quadrature step at a time for careful inspection
- Toggle: "Slow motion" slows the timeline scroll speed
- Button: "Reset position to 0"

Default parameters: position 0, knob at rest, slow motion off

Data Visibility Requirements:
  Stage 1: Show both signals flat and idle with the knob at rest
  Stage 2: Turning the knob one step CW shows Signal A's edge arriving before Signal B's edge, with the marker line highlighting A's edge first
  Stage 3: Turning the knob one step CCW shows the reverse: Signal B's edge arrives before Signal A's edge
  Stage 4: The position counter and direction indicator update in sync with the completed step, tying the waveform directly to the chapter's `encoder_position += 1` / `-= 1` code

Instructional Rationale: This concept sits between explaining what quadrature signals are and analyzing two signals to derive direction, so step-by-step controls ("Step CW" / "Step CCW") are provided instead of relying only on continuous dragging — the learner can freeze on a single step and see exactly which signal led, keeping concrete data visible rather than relying on a fast-moving animation.

Responsive design: the knob and timelines stack vertically below 600px; timelines scale their horizontal span to the container width.

Implementation: p5.js for the knob-drag interaction and the two-signal timeline; a small state machine generates only valid quadrature transitions (exactly one signal changes per step, never both at once) so the visualization always matches real encoder behavior.
</details>

## Watching a Parameter Change Live: Live Parameter Tuning

Tracking an encoder's position, or reading a potentiometer's voltage, is only useful once that number actually changes something on screen. **Live parameter tuning** connects a continuous control's current value directly to one of Chapter 9's face parameters, updating the drawn face in real time as a student turns a knob — the same `map_range()` function from Chapter 13, now applied while the face is actively being watched rather than read once at startup.

A bridge sentence before the code: this loop only recalculates `mouth_curve` when the encoder's position has actually changed since the last pass, mapping its running position count onto a sensible mouth-curve range and immediately redrawing the face with the new value.

```python
last_encoder_position = 0

while True:
    if encoder_position != last_encoder_position:
        state["mouth_curve"] = map_range(encoder_position, -20, 20, -10, 10)
        last_encoder_position = encoder_position

    fb.fill(BLACK)
    draw_face(fb, state)
    fb.show()
```

Notice what makes this feel "live": the loop keeps redrawing every single pass regardless of whether the knob moved, so the instant `encoder_position` changes, the very next frame shows the new mouth curve — no separate "apply" step, no delay. A student turning the knob sees the mouth reshape under their fingers in real time, which is exactly the payoff Chapter 9's parameterization work was building toward all along.

## Confirming What Just Happened: User Interface Feedback

A menu that changes something the instant a button is pressed still needs one more thing: proof, for the person operating it, that the press actually registered. **User interface feedback** is the general design principle that a good interface confirms what just happened, rather than leaving a user to wonder whether their input landed. Chapter 11's readability and design-rubric thinking applies directly here — a clearly readable expression is itself a form of feedback, but a menu can do even better.

!!! mascot-tip "Let the Face Be Its Own Confirmation"
    ![Pixel gives a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    The simplest feedback in this entire chapter costs nothing extra to build: the expression itself changing on screen *is* confirmation that a button press worked. A student pressing "next" and immediately seeing "sad" turn into "surprised" never has to wonder if anything happened.

Beyond the expression change itself, a few small techniques make a menu feel noticeably more responsive:

- Briefly flash the new expression's name as text on screen for half a second whenever the menu advances, so a student glancing away from the face for a moment still knows what changed.
- Use a short state-based animation trigger, like the surprised eyebrow flick from earlier in this chapter, as motion-based confirmation that is hard to miss even out of the corner of an eye.
- Reset the idle timer on every input, so a control that was just used never appears to have been ignored by the face suddenly drifting off into idle animation mid-adjustment.
- Give tuning mode a visible indicator — a small icon or label — so a knob turn that does nothing (because tuning mode is off) does not read as a broken control.

## Putting It All Together: A Complete Expression Menu

Every concept from this chapter converges here: a debounced "next" button cycling through Chapter 10's named expressions, a debounced "tune" button toggling live parameter tuning on and off, a potentiometer adjusting the current expression's mouth curve only while tuning mode is active, and a default idle state the face falls back to after a stretch of no input at all.

A bridge sentence before the code: this program follows the control mapping documented earlier — Button 1 advances the expression, Button 2 toggles tuning mode, and the potentiometer adjusts the live-tuned parameter — while an inactivity timer returns the face to its default idle state whenever nothing has been touched recently.

```python
import time
from machine import Pin, ADC

# ---- Hardware, following this chapter's documented control mapping ----
next_button = Pin(14, Pin.IN, Pin.PULL_UP)     # Button 1: next expression
tune_button = Pin(15, Pin.IN, Pin.PULL_UP)     # Button 2: toggle tuning mode
pot = ADC(Pin(26))                             # Live parameter tuning

# ---- Expression data (Chapter 9's parameterized face-state dictionaries) ----
EXPRESSION_NAMES = ["neutral", "happy", "sad", "surprised", "angry"]  # full set has 13
EXPRESSIONS = {
    "neutral":   {"eyebrow_angle": 0,   "mouth_curve": 0,  "eye_openness": 1.0},
    "happy":     {"eyebrow_angle": 5,   "mouth_curve": 8,  "eye_openness": 0.9},
    "sad":       {"eyebrow_angle": -10, "mouth_curve": -8, "eye_openness": 0.7},
    "surprised": {"eyebrow_angle": 30,  "mouth_curve": 2,  "eye_openness": 1.3},
    "angry":     {"eyebrow_angle": -25, "mouth_curve": -5, "eye_openness": 0.8},
}

DEBOUNCE_MS = 30
IDLE_TIMEOUT_MS = 8000

current_index = 0
tuning_mode = False
state = dict(EXPRESSIONS["neutral"])        # default idle state at startup

last_next_state = 1
last_tune_state = 1
last_next_time = 0
last_tune_time = 0
last_activity_time = time.ticks_ms()

def enter_expression(index):
    global current_index, state, last_activity_time
    current_index = index
    state = dict(EXPRESSIONS[EXPRESSION_NAMES[current_index]])
    last_activity_time = time.ticks_ms()

while True:
    now = time.ticks_ms()

    # --- Button 1: next expression, debounced with a polling cooldown ---
    next_state = next_button.value()
    if next_state == 0 and last_next_state == 1:
        if time.ticks_diff(now, last_next_time) > DEBOUNCE_MS:
            enter_expression((current_index + 1) % len(EXPRESSION_NAMES))
            last_next_time = now
    last_next_state = next_state

    # --- Button 2: toggle live-tuning mode, debounced the same way ---
    tune_state = tune_button.value()
    if tune_state == 0 and last_tune_state == 1:
        if time.ticks_diff(now, last_tune_time) > DEBOUNCE_MS:
            tuning_mode = not tuning_mode
            last_activity_time = now
            last_tune_time = now
    last_tune_state = tune_state

    # --- Potentiometer: live parameter tuning, only while tuning_mode is on ---
    if tuning_mode:
        raw_value = pot.read_u16()
        state["mouth_curve"] = map_range(raw_value, 0, 65535, -10, 10)

    # --- Default idle state: fall back to neutral after inactivity ---
    if time.ticks_diff(now, last_activity_time) > IDLE_TIMEOUT_MS:
        enter_expression(0)   # back to "neutral"

    fb.fill(BLACK)
    draw_face(fb, state)
    fb.show()
```

Trace this loop the same way you traced Chapter 13's mode cycle: each button gets its own debounce cooldown so bounce never leaks through, `tuning_mode` acts as a gate that only lets the potentiometer touch `mouth_curve` while it is `True`, and the idle-timeout check quietly resets the whole menu to neutral if a person walks away mid-adjustment. Every one of this chapter's thirteen concepts has a line of code — or a design decision behind one — living somewhere in this loop.

Clicking through a simulated version of this exact menu, rather than only reading the code, is the best way to feel how all these pieces click together into one responsive interface.

#### Diagram: Expression Menu Live Simulator

<iframe src="../../sims/expression-menu-live-simulator/main.html" width="100%" height="682px" scrolling="no"></iframe>

<details markdown="1">
<summary>Expression Menu Live Simulator</summary>
Type: microsim
**sim-id:** expression-menu-live-simulator<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Apply (L3) / Create (L6)
Bloom Taxonomy Verb: demonstrate, construct

Learning objective: Demonstrate a complete expression-menu program's behavior by operating simulated buttons and a knob to cycle expressions, trigger a state-based animation, and live-tune a parameter; optionally construct a custom control mapping by reassigning which control performs which function.

Canvas layout:
- Left 60% (responsive, roughly 320x320 at default width): a live preview face drawn from the same state-dictionary parameters taught in Chapter 9, plus a simulated two-button panel
- Right 40%: current expression name label, tuning-mode indicator, control-mapping legend, and an "Advanced: remap controls" toggle

Visual elements:
- Preview face redrawn live from the current state dictionary (eyebrow_angle, mouth_curve, eye_openness)
- Two simulated push buttons labeled by their currently mapped function (default "NEXT" and "TUNE")
- A simulated rotary knob for live parameter tuning, enabled only while tuning mode is on and visibly dimmed when it is off
- A name label that flashes the new expression's name for about 500ms every time the menu advances
- An idle indicator appearing after a few seconds of no input, showing the face has returned to its default idle state

Interactive controls:
- Click "NEXT": advances to the next of 13 expressions, applies its full parameter dictionary, flashes the name label, and resets the idle timer
- Click "TUNE": toggles live-tuning mode on/off
- Drag the knob (only while tuning mode is on): live-adjusts the current expression's mouth_curve and updates the preview face immediately
- Toggle "Advanced: remap controls": lets the learner drag function labels ("Next", "Tune", "Adjust") onto the two buttons and the knob, rebuilding the control mapping and immediately changing what each control does
- Slider: idle timeout speed, so the default idle state can be observed without a long real wait

Default parameters: expression index 0 ("neutral"), tuning mode off, idle timeout 8 simulated seconds, default control mapping (Button 1 = Next, Button 2 = Tune, Knob = Adjust)

Behavior: clicking NEXT cycles current_index forward through the 13 expressions, applying that expression's parameter dictionary in one step; entering "surprised" briefly overshoots eyebrow_angle before settling, demonstrating the state-based animation trigger; leaving all controls untouched for the idle timeout returns the preview face to the default idle state; remapping controls in advanced mode changes which click or drag performs which function without changing the underlying expression data.

Instructional Rationale: As the chapter's capstone interactive, this targets Apply by default — operate a working menu and observe cause and effect exactly as the chapter's final code example does — with an optional Create-level extension letting a student design their own control mapping and immediately see the consequences, matching this chapter's create-leaning learning outcome.

Responsive design: preview face and controls stack vertically below 650px; the face canvas scales to its container width, and remapping drag targets rearrange into a stacked list on narrow screens.

Implementation: p5.js for the preview face rendering, reusing the same parameterized drawing approach as Chapter 9, and for the simulated button/knob interactions; a JavaScript object mirrors the chapter's EXPRESSIONS dictionary so preview values match the MicroPython code exactly.
</details>

## Chapter Summary

You now know how to combine debounced buttons, a rotary encoder's quadrature signal, and a default idle state into one complete expression menu that lets a person cycle through expressions and tune a parameter live.

- Button debounce solves contact bounce — a mechanical button's contacts physically bouncing for a few milliseconds — using a debounce time constant, typically 20-50ms, during which further changes are ignored.
- Input debouncing delay can be implemented as a ticks-based cooldown check in a polling loop, or as a short recheck delay inside an interrupt handler; both compare a debounce time constant against real elapsed time.
- A default idle state gives a face a sensible "home" — Chapter 12's blink-and-gaze idle animation — that it falls back to after a period without any input.
- A multi-mode menu, built as an expression selection menu, cycles forward through Chapter 10's 13 named expressions using a wraparound index, showing a live preview of each one as it is selected.
- A state-based animation trigger fires a short automatic animation, like a brief eyebrow overshoot, the moment a face enters a particular expression, before that expression's resting parameters take over.
- Control mapping design is a deliberate, documented decision about which physical control performs which function — this chapter mapped Button 1 to "next expression," Button 2 to "toggle tuning mode," and a potentiometer or encoder to "adjust the current parameter."
- A rotary encoder reports rotation through an encoder quadrature signal — two square waves offset from each other — and comparing which one changes first gives encoder direction detection; a running total from that comparison gives rotary encoder position tracking.
- Live parameter tuning connects an encoder's position or a potentiometer's mapped value directly to one of Chapter 9's face parameters, updating the drawn face in real time as a control is adjusted.
- User interface feedback — a flashing label, a state-based animation, or simply the expression itself changing — confirms to a user that their input was received, connecting back to Chapter 11's readability and design-rubric thinking.

!!! mascot-celebration "You Built a Real Interface"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Look at what just came together: debounced buttons, a quadrature-tracked knob, thirteen expressions, and a default idle state, all working as one menu a person can actually pick up and use. This is the moment a robot face stops being a program you watch, and becomes something you talk to.

??? question "Self-Check: Why does an expression menu need both button debounce and a default idle state, even though they solve completely different problems? — Click to reveal"
    Button debounce and a default idle state solve different problems, but a menu without either one feels broken in its own way. Button debounce prevents a single physical press from being read as several rapid presses, because a mechanical button's contacts bounce for a few milliseconds when pressed; without it, one press of "next expression" can skip past two or three expressions at once. A default idle state solves a completely separate problem: what the face should do when nobody is touching any control at all. Without it, a face would either freeze on whatever expression was last selected, looking static and lifeless, or would need to be manually reset every time a person walked away. Together, they cover both ends of a menu's behavior — debounce makes sure every intended input is read correctly exactly once, and the default idle state makes sure the face still looks alive during the much longer stretches of time when no input is happening at all.
