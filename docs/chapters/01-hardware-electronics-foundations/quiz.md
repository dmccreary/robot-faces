---
title: Quiz - Hardware & Electronics Foundations
description: Ten multiple-choice questions covering microcontrollers, breadboards, input controls, SPI and I2C wiring, and the two target displays.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Hardware & Electronics Foundations

Test your understanding of the microcontrollers, wiring, controls, and displays that every robot face in this book is built on.

---

#### 1. What is a microcontroller?

<div class="upper-alpha" markdown>
1. A power supply that converts wall voltage into a safe 3.3 volts
2. A software program that draws pixels onto a small screen
3. A complete small computer on a single chip that controls physical devices
4. A plastic block with spring clips used to build circuits without solder
</div>

??? question "Show Answer"
    The correct answer is **C**. A microcontroller combines a processor, memory, and input/output pins on one chip, and is designed to run a single program continuously to control devices such as displays, buttons, and motors. Option A describes a voltage regulator, option B describes drawing code rather than hardware, and option D describes a solderless breadboard.

    **Concept Tested:** Microcontroller

    **See:** [The Brains of the Operation: Microcontrollers](index.md#the-brains-of-the-operation-microcontrollers)

---

#### 2. Which driver chip controls the 128x64 monochrome OLED display used in this book?

<div class="upper-alpha" markdown>
1. SSD1306
2. GC9A01
3. RP2040
4. VBUS
</div>

??? question "Show Answer"
    The correct answer is **A**. The SSD1306 is the dedicated driver chip inside the 128x64 monochrome OLED module; it stores the full screen image in its own memory and refreshes the physical pixels from it. The GC9A01 drives the 240x240 color round display instead, the RP2040 is the microcontroller chip on the Pico, and VBUS is a 5-volt power pin, not a driver.

    **Concept Tested:** SSD1306 Display Driver

    **See:** [Two Displays, Two Personalities](index.md#two-displays-two-personalities)

---

#### 3. At what voltage should both of this book's displays be powered?

<div class="upper-alpha" markdown>
1. 1.8 volts
2. 5 volts from the Pico's VBUS pin
3. 12 volts from an external adapter
4. 3.3 volts from the Pico's 3V3 pin
</div>

??? question "Show Answer"
    The correct answer is **D**. Both displays expect 3.3 volts, the same voltage the RP2040's logic and GPIO pins use, supplied from the Pico's 3V3 output pin. Connecting a 3.3-volt display to the 5-volt VBUS pin can permanently damage its driver chip, which is why every wiring diagram in this book routes the display's power wire to 3V3.

    **Concept Tested:** Display Power Requirements

    **See:** [Keeping Displays Safe: Power and Mounting](index.md#keeping-displays-safe-power-and-mounting)

---

#### 4. What is the main structural difference between the SPI bus and the I2C bus?

<div class="upper-alpha" markdown>
1. SPI carries only commands while I2C carries only pixel data
2. SPI uses separate clock and data wires plus one dedicated wire per device, while I2C shares two wires among devices identified by address
3. SPI works only with color displays while I2C works only with monochrome displays
4. SPI requires a pull-up resistor on every wire while I2C requires none
</div>

??? question "Show Answer"
    The correct answer is **B**. SPI gives each device its own chip select wire on top of shared clock and data lines, which makes it fast but wire-hungry. I2C needs only a shared data wire and a shared clock wire no matter how many devices are attached, distinguishing them by a numeric address such as 0x3C. Both buses carry commands and data, and both can serve either display type.

    **Concept Tested:** SPI Interface / I2C Interface

    **See:** [How Chips Talk to Each Other: SPI and I2C](index.md#how-chips-talk-to-each-other-spi-and-i2c)

---

#### 5. Why does a momentary push button wired to a GPIO pin need a pull-up resistor?

<div class="upper-alpha" markdown>
1. Without one, the pin is left floating when the button is open and reads a random mix of HIGH and LOW
2. Without one, pressing the button would send 5 volts into a 3.3-volt pin
3. Without one, the button could only be read by the second processor core
4. Without one, the button would stay closed after being released
</div>

??? question "Show Answer"
    The correct answer is **A**. When the button is not pressed, the pin connects to nothing solid and floats, producing unpredictable readings that flicker between HIGH and LOW. A pull-up resistor ties the pin to 3.3 volts so it reads a steady HIGH until the button pulls it to ground. The RP2040 has built-in pull-ups a program can enable in software, so no external resistor is usually needed.

    **Concept Tested:** Pull-Up Resistor

    **See:** [Giving Students Control: Buttons, Dials, and Encoders](index.md#giving-students-control-buttons-dials-and-encoders)

---

#### 6. What does the Data Command (DC) pin tell the display driver?

<div class="upper-alpha" markdown>
1. Which of several displays on the bus should listen to the current message
2. How fast the clock line should pulse for the next byte
3. Whether the byte arriving on the data line is a drawing command or pixel data
4. When to erase the display's memory and start over from a blank state
</div>

??? question "Show Answer"
    The correct answer is **C**. Flipping the DC pin between two states lets a single data wire carry two very different kinds of information: instructions such as "set the cursor position," and the pixel data itself. Option A describes the chip select pin, option D describes the reset pin, and the clock line's timing is fixed by the SPI configuration rather than signaled on DC.

    **Concept Tested:** Data Command Pin

    **See:** [The Five Wires Every Display Needs](index.md#the-five-wires-every-display-needs)

---

#### 7. How does a rotary encoder differ from a potentiometer?

<div class="upper-alpha" markdown>
1. A rotary encoder reports an absolute voltage while a potentiometer reports clicks
2. A rotary encoder reports discrete clicks and direction while a potentiometer reports an absolute position as a voltage
3. A rotary encoder must be wired over SPI while a potentiometer uses I2C
4. A rotary encoder can only turn one direction while a potentiometer turns both
</div>

??? question "Show Answer"
    The correct answer is **B**. A potentiometer divides the supply voltage into a smoothly varying output read through an analog pin, giving a continuous value. A rotary encoder instead reports how many steps it turned and in which direction, and many models add a push button under the knob. That step-and-direction behavior is what makes encoders a natural fit for cycling through menus.

    **Concept Tested:** Rotary Encoder

    **See:** [Giving Students Control: Buttons, Dials, and Encoders](index.md#giving-students-control-buttons-dials-and-encoders)

---

#### 8. A student wants a control that lets them smoothly widen and narrow a robot's smile in real time, sweeping through every value in between. Which component fits best?

<div class="upper-alpha" markdown>
1. A momentary push button
2. A chip select pin
3. A pull-up resistor
4. A potentiometer
</div>

??? question "Show Answer"
    The correct answer is **D**. A potentiometer produces a continuous voltage between 0 and 3.3 volts as its knob turns, so an analog input pin can read every intermediate value — exactly what a smoothly adjustable parameter such as smile width needs. A push button reports only pressed or released, while a chip select pin and a pull-up resistor are wiring elements, not user controls.

    **Concept Tested:** Potentiometer

    **See:** [Giving Students Control: Buttons, Dials, and Encoders](index.md#giving-students-control-buttons-dials-and-encoders)

---

#### 9. Why do the wiring skills learned on the monochrome OLED transfer almost unchanged to the color round display?

<div class="upper-alpha" markdown>
1. Both displays have the same resolution and color depth
2. Both displays are driven by the same SSD1306 chip
3. Both driver chips use SPI with the same five signal roles: clock, data, chip select, data/command, and reset
4. Both displays plug directly into the Pico without any jumper wires
</div>

??? question "Show Answer"
    The correct answer is **C**. The SSD1306 and GC9A01 are different chips driving very different screens, but each is controlled over SPI using the identical five-wire signal pattern. Because the roles of the wires match, the same wiring habits and MicroPython patterns carry over. The displays differ sharply in resolution and color depth, and both still need jumper wires.

    **Concept Tested:** GC9A01 Display Driver

    **See:** [Two Displays, Two Personalities](index.md#two-displays-two-personalities)

---

#### 10. What makes a solderless breadboard well suited to prototyping a robot-face circuit?

<div class="upper-alpha" markdown>
1. It supplies its own regulated 3.3-volt power to every component plugged into it
2. Rows of holes are connected internally by spring clips, so wires and parts can be joined and rearranged in seconds
3. It permanently bonds components so a finished circuit cannot be disturbed
4. It converts SPI signals into I2C signals automatically
</div>

??? question "Show Answer"
    The correct answer is **B**. Hidden metal spring clips connect each row of holes internally, so pushing a wire and a component leg into the same row joins them electrically, and pulling either one out breaks the connection instantly. That makes rewiring fast and mistakes cheap. A breadboard supplies no power of its own, makes no permanent bonds, and performs no signal conversion.

    **Concept Tested:** Solderless Breadboard

    **See:** [Building Circuits Without Solder](index.md#building-circuits-without-solder)
