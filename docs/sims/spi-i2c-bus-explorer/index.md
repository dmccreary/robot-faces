---
title: SPI vs I2C Bus Explorer
description: Interactive p5.js MicroSim for spi vs i2c bus explorer.
image: /sims/spi-i2c-bus-explorer/spi-i2c-bus-explorer.png
og:image: /sims/spi-i2c-bus-explorer/spi-i2c-bus-explorer.png
twitter:image: /sims/spi-i2c-bus-explorer/spi-i2c-bus-explorer.png
social:
   cards: false
quality_score: 0
---

# SPI vs I2C Bus Explorer

<iframe src="main.html" height="482px" width="100%" scrolling="no"></iframe>

[Run the SPI vs I2C Bus Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Two displays can look identical on the outside and still be wired in completely
different ways. SPI and I2C are the two buses you will meet in this book, and they
make opposite trades. This explorer draws both wiring patterns in the same space so
you can flip between them and count the difference yourself. Your goal is to
differentiate the two buses by wire count, by how devices are told apart, and by
speed, and then to look at any wiring diagram and name the bus it uses.

## How to Use

1. Start in the SPI view. Count the labeled signal wires and check your count against
   the "Wires used" readout in the corner.
2. Click each wire for its one-sentence definition. Note that CS is the wire that
   forces every extra SPI device to add another connection.
3. Click **Show I2C**. Watch the wire count drop while the number of devices goes up.
4. Click the two I2C device boxes to see their addresses, 0x3C and 0x68, and read
   how an address replaces a dedicated wire.
5. Hover any wire to trace its full path and see its short name in a tooltip.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/spi-i2c-bus-explorer/main.html"
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

- Can name the GPIO pins on a Raspberry Pi Pico, such as GP2 through GP6.
- Knows the five signal wires an SPI display needs: SCK, SDA, RES, DC, and CS.
- Understands that power and ground are separate from the wires carrying data.
- Can read a hexadecimal number such as 0x3C as a device label.

### Activities

1. **Exploration** (5 min): Click all seven wires in the SPI view, then all four in
   the I2C view. Build a two-column table of wire names for each bus.
2. **Guided Practice** (5 min): Answer in writing: how many wires would three SPI
   displays need, and how many would three I2C devices need? Use the CS definition
   in your reasoning.
3. **Assessment** (5 min): Sketch a wiring diagram of your own on paper, hand it to a
   partner, and have them name the bus and defend the answer with one piece of
   evidence from the diagram.

### Assessment

- States the signal wire count for each bus correctly: five for SPI, two for I2C.
- Explains that SPI selects a device with a dedicated CS wire while I2C selects one
  by sending an address.
- Identifies the bus used by an unlabeled diagram and names the clue that gave it away.
- Names one situation where the extra SPI wires are worth it, such as fast full-screen
  animation on a color display.

## References

1. [Serial Peripheral Interface (Wikipedia)](https://en.wikipedia.org/wiki/Serial_Peripheral_Interface) - Clock, data, and chip-select signals of the SPI bus.
2. [I2C (Wikipedia)](https://en.wikipedia.org/wiki/I%C2%B2C) - The two-wire bus and its 7-bit device addressing scheme.
3. [MicroPython machine.SPI Documentation](https://docs.micropython.org/en/latest/library/machine.SPI.html) - Creating an SPI bus object in MicroPython.
4. [MicroPython machine.I2C Documentation](https://docs.micropython.org/en/latest/library/machine.I2C.html) - Creating an I2C bus object and scanning for device addresses.
