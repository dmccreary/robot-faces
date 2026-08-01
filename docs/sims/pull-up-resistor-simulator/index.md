---
title: Pull-Up Resistor and Button Simulator
description: Interactive p5.js MicroSim for pull-up resistor and button simulator.
image: /sims/pull-up-resistor-simulator/pull-up-resistor-simulator.png
og:image: /sims/pull-up-resistor-simulator/pull-up-resistor-simulator.png
twitter:image: /sims/pull-up-resistor-simulator/pull-up-resistor-simulator.png
social:
   cards: false
quality_score: 0
---

# Pull-Up Resistor and Button Simulator

<iframe src="main.html" height="482px" width="100%" scrolling="no"></iframe>

[Run the Pull-Up Resistor and Button Simulator MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Wire a push button to a Pico pin and you would expect a clean answer: pressed or not
pressed. Leave out one small resistor and the pin instead reports pure nonsense. This
simulator starts with the resistor switched off so you see that problem first, then
lets you switch it on and watch the reading go rock steady. Your goal is to explain
why an undriven input pin is called *floating*, and to demonstrate that a pull-up
resistor turns a floating pin into a reliable HIGH.

## How to Use

1. Look at the readout before touching anything. The pull-up is OFF and the value
   flickers between HIGH and LOW on its own, because nothing is driving the pin.
2. Hold **PRESS AND HOLD BUTTON**. The flicker stops and the pin snaps to LOW,
   because the closed button ties GP15 straight to ground.
3. Let go. The flicker returns. That is the problem a pull-up resistor solves.
4. Click **Pull-up resistor: OFF** to turn it ON. The resistor symbol turns red and
   the released reading holds steady at HIGH.
5. Hold the button again with the pull-up ON. The pin still reads LOW, so both
   states are now trustworthy.
6. Click **Reset** to return to the starting conditions and try it again.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/pull-up-resistor-simulator/main.html"
        height="482px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knows that a GPIO pin can be set as an input that reads a voltage.
- Understands HIGH and LOW as the two digital values a pin can report.
- Can read a simple schematic with a supply rail and a ground rail.
- Knows that the Pico runs its logic at 3.3 volts.

### Activities

1. **Exploration** (5 min): With the pull-up OFF, watch the readout for ten seconds
   without clicking. Write down what the value does and why that is a problem for code.
2. **Guided Practice** (5 min): Fill in a four-row table for all four combinations of
   pull-up ON/OFF and button pressed/released. Record the state name for each row.
3. **Assessment** (5 min): Predict the reading for "pull-up ON, button released"
   before you set it up, then test your prediction and explain any surprise.

### Assessment

- Correctly reports the pin state for all four stages of the table.
- Defines a floating pin as an input with no circuit driving it to a known voltage.
- Explains that the pressed button always wins because it connects the pin to ground.
- States one real consequence of a floating pin in robot-face code, such as an
  expression that changes when nobody pressed anything.

## References

1. [Pull-up Resistor (Wikipedia)](https://en.wikipedia.org/wiki/Pull-up_resistor) - Definition, circuit role, and typical resistance values.
2. [MicroPython machine.Pin Documentation](https://docs.micropython.org/en/latest/library/machine.Pin.html) - The `Pin.PULL_UP` argument that enables the Pico's internal pull-up resistor.
3. [Raspberry Pi Pico Documentation](https://www.raspberrypi.com/documentation/microcontrollers/raspberry-pi-pico.html) - GPIO electrical characteristics for the RP2040 microcontroller.
4. [Push Button Switch (Wikipedia)](https://en.wikipedia.org/wiki/Push-button) - How a momentary switch opens and closes a circuit.
