---
title: Interactive Breadboard Wiring Diagram
description: Interactive p5.js MicroSim for interactive breadboard wiring diagram.
image: /sims/breadboard-wiring-diagram/breadboard-wiring-diagram.png
og:image: /sims/breadboard-wiring-diagram/breadboard-wiring-diagram.png
twitter:image: /sims/breadboard-wiring-diagram/breadboard-wiring-diagram.png
social:
   cards: false
quality_score: 0
---

# Interactive Breadboard Wiring Diagram

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Interactive Breadboard Wiring Diagram MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Seven jumper wires stand between you and a robot face that actually lights up. This
diagram shows all of them at once: a Raspberry Pi Pico on a breadboard, a display
module above it, and a color-coded wire for each connection. Your goal here is to
examine the finished circuit, tell the two power wires apart from the five signal
wires, and name the Pico pin that each display wire lands on. Click any wire and the
simulation tells you whether you picked a power wire or a signal wire, and what that
wire actually does.

## How to Use

1. Click any wire in the diagram. The panel below the drawing names both ends of the
   connection and explains the wire's job.
2. Click a gold pin on the Pico or on the display header to select that same
   connection from either end.
3. Hover over a wire to trace its full path, which is highlighted in white.
4. Use the **Display** menu to switch between the OLED (128x64) and the round color
   display (240x240). Notice that the wiring pattern does not change.
5. Uncheck **Show pin labels** to quiz yourself, then click each wire to check your
   answer.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/breadboard-wiring-diagram/main.html"
        height="562px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knows what a breadboard is and how its rows of holes connect underneath.
- Can name a GPIO pin on the Raspberry Pi Pico, such as GP2 or GP15.
- Understands that 3.3 volts and 5 volts are different supply voltages.
- Has met the five signal wires an SPI display needs: SCK, SDA, RES, DC, and CS.

### Activities

1. **Exploration** (5 min): Click every wire from left to right and write down the
   Pico pin, the display pin, and whether the wire carries power or a signal.
2. **Guided Practice** (5 min): Turn off **Show pin labels**, then predict each
   wire's Pico pin from its color alone. Click to check, and keep score out of seven.
3. **Assessment** (5 min): Switch the **Display** menu to the round color display.
   Write one sentence explaining why the wiring pattern stayed the same.

### Assessment

- Correctly matches all seven display pins to their Pico pins with labels hidden.
- Sorts the seven wires into five signal wires and two power wires.
- Explains in one sentence why VCC connects to 3V3 and never to VBUS or 5V.
- States what changes, and what does not, when the display module is swapped.

## References

1. [Raspberry Pi Pico Documentation](https://www.raspberrypi.com/documentation/microcontrollers/raspberry-pi-pico.html) - Official pinout and power-supply notes for the Pico board.
2. [Breadboard (Wikipedia)](https://en.wikipedia.org/wiki/Breadboard) - How the internal strips of a solderless breadboard connect holes together.
3. [Serial Peripheral Interface (Wikipedia)](https://en.wikipedia.org/wiki/Serial_Peripheral_Interface) - Background on the SCK, MOSI, and CS signals used by these displays.
4. [Adafruit Monochrome OLED Breakouts](https://learn.adafruit.com/monochrome-oled-breakouts) - Wiring guide for SSD1306 OLED display modules.
