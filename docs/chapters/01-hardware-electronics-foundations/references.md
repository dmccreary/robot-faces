# References: 1. Hardware & Electronics Foundations

1. [Microcontroller](https://en.wikipedia.org/wiki/Microcontroller) - Wikipedia - Comprehensive overview of what a microcontroller is, its processor cores, memory, and I/O peripherals, and how it differs from a general-purpose computer. Grounds this chapter's introduction to the RP2040 and Raspberry Pi Pico.

2. [Serial Peripheral Interface](https://en.wikipedia.org/wiki/Serial_Peripheral_Interface) - Wikipedia - Detailed explanation of the SPI bus, including its clock, data, and chip-select lines, bus topologies, and common uses. Directly supports the chapter's coverage of the five-wire SPI pattern used by both target displays.

3. [I²C](https://en.wikipedia.org/wiki/I%C2%B2C) - Wikipedia - Thorough coverage of the I2C protocol's shared two-wire design, device addressing, and operating modes. Complements the chapter's comparison of SPI and I2C as the two communication buses used to drive displays and sensors.

4. Make: Electronics (2nd Edition) - Charles Platt - Maker Media, Inc. - A hands-on, experiment-driven introduction to breadboarding, switches, resistors, and basic circuit-building skills. Its early chapters mirror this chapter's coverage of breadboards, jumper wires, push buttons, and pull-up resistors.

5. Get Started with MicroPython on Raspberry Pi Pico - Gareth Halfacree and Ben Everard - Raspberry Pi Press - The official guide to the Raspberry Pi Pico and RP2040, covering board setup, breadboard wiring, buttons, and SPI/I2C peripherals. Provides the manufacturer-endorsed reference for the exact hardware this book builds on.

6. [Quick reference for the RP2 - MicroPython documentation](https://docs.micropython.org/en/latest/rp2/quickref.html) - MicroPython.org - Official MicroPython reference showing how to initialize hardware and software SPI and I2C buses on the RP2040 in code, with default pin assignments matching this chapter's wiring conventions.

7. [Microcontroller chips - Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/microcontrollers/rp2040.html) - Raspberry Pi Ltd - Official documentation describing the RP2040's dual-core processor, memory, and built-in SPI and I2C controllers. Authoritative source for the chip specifications summarized in this chapter.

8. [Pull-up Resistors](https://learn.sparkfun.com/tutorials/pull-up-resistors/all) - SparkFun Learn - Tutorial explaining why floating input pins occur and how a pull-up resistor stabilizes a digital reading, including guidance on choosing a resistor value such as the 10k-ohm example used in this chapter.

9. [What is Serial Peripheral Interface (SPI)?](https://www.geeksforgeeks.org/electronics-engineering/what-is-serial-peripheral-interface-spi/) - GeeksforGeeks - Clear walkthrough of the SPI protocol's clock, MOSI/MISO, and chip-select lines with diagrams. Reinforces the chapter's explanation of the five signal wires used to connect the OLED and color round displays.

10. [How to Use a Breadboard](https://learn.sparkfun.com/tutorials/how-to-use-a-breadboard/all) - SparkFun Learn - Beginner-friendly guide to breadboard anatomy, power rails, and jumper wire types, including a worked example circuit. Extends the chapter's introduction to solderless prototyping without soldering.
