---
title: Hardware & Electronics Foundations
description: An introduction to the microcontrollers, breadboards, input controls, communication buses, and displays used to build a low-cost robot face.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 10:43:24
version: 0.09
---

# Hardware & Electronics Foundations

## Summary

This chapter introduces the physical hardware every project in this book is built on: the Raspberry Pi Pico and its RP2040 microcontroller, the two target displays (a 128x64 monochrome OLED and a 240x240 color round display), and the breadboard wiring, buses, and buttons that connect them. It is the starting point for the whole book — every later chapter assumes this hardware is wired up and working. After completing this chapter, students will be able to identify each component in a robot-face kit, explain what SPI and I2C wiring pins do, and recognize the trade-offs between the two display options.

## Concepts Covered

This chapter covers the following 25 concepts from the learning graph:

1. Raspberry Pi Pico
2. RP2040 Microcontroller
3. Microcontroller
4. Cytron Maker Pi RP2040
5. Solderless Breadboard
6. Jumper Wires
7. Momentary Push Button
8. Potentiometer
9. Rotary Encoder
10. SPI Interface
11. I2C Interface
12. SPI Clock Line
13. SPI Data Line
14. Chip Select Pin
15. Data Command Pin
16. Display Reset Pin
17. 128x64 Monochrome OLED
18. SSD1306 Display Driver
19. 240x240 Color Round Display
20. GC9A01 Display Driver
21. Pull-Up Resistor
22. Low-Cost Robotics Kit
23. Breadboard Wiring Diagram
24. Display Power Requirements
25. Display Mounting Considerations

## Prerequisites

This chapter assumes only the prerequisites listed in the [course description](../../course-description.md).

---

## Welcome to Robot Faces

!!! mascot-welcome "Hi! I'm Pixel."
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Welcome to Robot Faces! I'm **Pixel**, a round-face robot whose entire body is a circular screen — the same kind of display you're about to learn to program. I'll pop up in the margins throughout this book, but never just for decoration. I have exactly six jobs, and you can tell which one I'm doing by my pose:

    1. **Welcome you** at the start of every chapter — that's what I'm doing right now.
    2. **Help you think** through a key concept when an idea is worth pausing on.
    3. **Give you a tip** — a practical trick a robot builder would know.
    4. **Warn you gently** about a mistake that's easy to make and costly to fix.
    5. **Encourage you** when the material gets genuinely tricky.
    6. **Celebrate with you** when you finish a big section or a whole chapter.

    That's it. If I'm not doing one of those six things, I'm not in the chapter. Every pixel tells a story — let's go build some faces!

Welcome to Robot Faces. Over the chapters ahead, you will write MicroPython programs that turn a small screen into a character with a personality — eyes that blink, eyebrows that arch in surprise, and a mouth that curls into a smile or flattens into a frown. You will work with two low-cost displays: a 128x64 monochrome OLED about the size of a postage stamp, and a 240x240 color round display shaped like a smartwatch face. Both run on the same $4 microcontroller, so the drawing skills you learn on one display carry over almost unchanged to the other.

Before any of that drawing code can run, though, the physical hardware has to be connected and working. This chapter is a tour of every component in a robot-face kit: the microcontroller that runs your programs, the breadboard and wires that hold the circuit together, the buttons and dials students use to control a face, and the wiring that lets a tiny chip talk to a display. Nothing here involves programming yet — that begins in Chapter 3. Your job in this chapter is to learn what each part does and how it connects to the others, so that when the code arrives, you already understand the hardware underneath it.

## The Brains of the Operation: Microcontrollers

Every robot face in this book needs something to run its program, store the shapes it draws, and send pixels to a screen. That job belongs to a **microcontroller**: a complete, small computer built onto a single chip, combining a processor, memory, and input/output pins that connect to the outside world. Unlike the processor inside a laptop, a microcontroller has no operating system managing windows or web browsers. It runs one program continuously and is designed to control physical devices such as motors, sensors, and displays.

!!! mascot-thinking "One Chip, One Job"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here's the idea to hold onto: a microcontroller isn't a tiny laptop — it's built to do one job, over and over, forever. That's exactly what a robot face needs: a chip that never stops redrawing your expressions.

The specific microcontroller chip used throughout this book is the **RP2040**, designed by Raspberry Pi Ltd. The RP2040 contains two processor cores, so it can run two independent tasks — such as animating a face while reading a button — at nearly the same time. It also includes 264 kilobytes of built-in memory, enough to hold the frame buffers for both target displays, along with hardware support for SPI and I2C communication and dozens of general-purpose input/output (GPIO) pins for connecting buttons, sensors, and screens.

The **Raspberry Pi Pico** is a $4 circuit board that packages the RP2040 chip with a USB connector, a voltage regulator, and two rows of pins spaced to fit directly into a breadboard. It is the reference board this book builds every project on: cheap enough that every student can keep one, and simple enough that connecting it to a breadboard requires no soldering.

A second board built around the identical RP2040 chip, the **Cytron Maker Pi RP2040**, trades some of that bare-bones simplicity for classroom convenience. It adds an onboard RGB LED, two push buttons, a buzzer, and screw-terminal and Grove-style connectors directly on the board, so many beginner circuits need no breadboard at all. Because it uses the same RP2040 chip and runs the same MicroPython firmware as the plain Pico, every drawing technique in this book works on either board without modification.

Before comparing the two boards side by side, notice that both prices below are approximate — hobbyist electronics prices shift with suppliers and shipping costs, but the relative gap between them stays consistent.

The table below summarizes the practical differences between the two boards; use it to decide which one fits your classroom or budget.

| Feature | Raspberry Pi Pico | Cytron Maker Pi RP2040 |
|---|---|---|
| Core chip | RP2040 | RP2040 |
| Approximate price | $4 | $12–$15 |
| Onboard buttons | None | 2 |
| Onboard RGB LED | None | 1 |
| Breadboard required for basics | Yes | No |
| Best for | Lowest-cost kits, breadboard practice | Classrooms wanting fewer loose parts |

## Building Circuits Without Solder

Every component in this book that is not built onto a board — buttons, potentiometers, and the OLED display — needs to be physically connected to the Pico's pins. A **solderless breadboard** makes those connections without a soldering iron: it is a plastic block filled with rows of metal spring clips, hidden under a grid of holes, that grip the legs of components and wires pushed into them. Rows of five holes are electrically connected internally, so plugging a wire and a component leg into the same row joins them electrically, and pulling either one out breaks the connection instantly. This makes a breadboard ideal for prototyping: a circuit can be rewired in seconds, and mistakes cost nothing but a few minutes of rework.

**Jumper wires** are the short, flexible wires used to connect one breadboard hole to another, or to connect a breadboard directly to a pin on the Pico. They come with different end connectors — male ends that plug into breadboard holes, and female ends that slide over a pin — so a kit typically includes male-to-male wires for breadboard-to-breadboard connections and male-to-female wires for breadboard-to-Pico connections.

A minimal robot-face kit — the same one used throughout this book — combines just a handful of these parts:

- A Raspberry Pi Pico (or a Cytron Maker Pi RP2040)
- A solderless breadboard
- A 128x64 monochrome OLED display, or a 240x240 color round display
- Male-to-female and male-to-male jumper wires
- A USB cable for power and programming

## Giving Students Control: Buttons, Dials, and Encoders

Later chapters use physical controls to let a user switch between a robot's expressions or adjust a face parameter live. Three kinds of controls appear throughout this book, and each reports a different kind of information to the microcontroller.

A **momentary push button** is a simple switch that closes a circuit only while it is physically held down, and opens again the instant it is released — unlike a toggle switch, which stays in whatever position it was last moved to. Wired to a GPIO pin, a momentary push button lets a program detect a single press, such as "advance to the next expression."

Push buttons create a wiring problem: when the button is not pressed, the GPIO pin it connects to is left electrically **floating**, meaning it is connected to nothing solid, and a floating pin can read as a random, flickering mix of HIGH and LOW. A **pull-up resistor** solves this by connecting the pin to the board's 3.3-volt supply through a resistor, commonly rated at 10 kilo-ohms, so the pin reads a steady HIGH when the button is open and only drops to LOW when the button is pressed and connects the pin directly to ground. The RP2040 includes built-in pull-up resistors that a MicroPython program can enable in software, so many circuits in this book need no external resistor at all.

!!! mascot-encourage "Floating Pins Trip Up Everyone at First"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    If "a pin can float and read randomly" sounds strange, you're in good company — every robot builder finds this counterintuitive the first time. Play with the simulator below until the flicker makes sense, and it will click.

A **potentiometer** is a variable resistor with a rotating knob or sliding lever. As the knob turns, it divides the board's voltage into a smaller output voltage that changes smoothly between 0 and 3.3 volts. Read through one of the RP2040's analog input pins, a potentiometer gives a program a continuous value — ideal for letting a student smoothly adjust something like the width of a smile.

A **rotary encoder** looks similar to a potentiometer but works differently: instead of reporting an absolute position, it reports discrete clicks of rotation in either direction, plus, on many models, a built-in push button activated by pressing straight down on the knob. Because it reports direction and step count rather than an absolute voltage, a rotary encoder is well suited to menus — for example, turning clockwise to cycle forward through a list of expressions.

The floating-pin problem described above is easier to understand by watching it happen than by reading about it. The interactive circuit below lets you press a simulated button and watch how a GPIO pin's logic level responds, with and without a pull-up resistor enabled.

#### Diagram: Pull-Up Resistor and Button Simulator

<iframe src="../../sims/pull-up-resistor-simulator/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Pull-Up Resistor and Button Simulator</summary>
Type: microsim
**sim-id:** pull-up-resistor-simulator<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Understand (L2) / Apply (L3)
Bloom Taxonomy Verb: explain, demonstrate

Learning objective: Explain why a floating GPIO pin needs a pull-up resistor, and demonstrate how enabling one produces a stable HIGH/LOW reading when a momentary push button is pressed and released.

Canvas layout:
- Left 60%: schematic showing a Pico outline, GPIO pin GP15, a push button wired to ground, and a resistor symbol to the 3.3V rail
- Right 40%: toggle switch, a press-and-hold button, and a digital readout

Visual elements:
- Live-redrawn circuit diagram
- Readout showing "HIGH (3.3V)" in green or "LOW (0V)" in red
- A floating-pin warning icon, shown only when pull-up is off and the button is released
- Resistor symbol grayed out when pull-up is off

Interactive controls:
- Toggle: "Pull-up resistor: ON / OFF" (default OFF, so students see the problem first)
- Press-and-hold "PRESS BUTTON" control; readout updates instantly on press and release
- Reset button restoring the default state

Default parameters: pull-up OFF, button released

Data Visibility Requirements:
  Stage 1 (pull-up OFF, released): pin state "FLOATING / UNDEFINED" with a flickering HIGH/LOW readout
  Stage 2 (pull-up OFF, pressed): pin state snaps to "LOW (0V)"
  Stage 3 (pull-up ON, released): pin state holds steady at "HIGH (3.3V)"
  Stage 4 (pull-up ON, pressed): pin state "LOW (0V)"

Behavior: with pull-up off and the button released, the readout flickers randomly between HIGH and LOW and shows the warning icon. Pressing the button always forces LOW while held. Releasing with pull-up on snaps back to a steady HIGH; releasing with pull-up off returns to flickering.

Instructional Rationale: An Apply-level control-and-observe interaction, not a continuous animation, because the objective requires the student to manipulate the toggle and button and observe the concrete voltage state that results. A passive animation could not let a student test "what happens if I remove the resistor."

Responsive design: canvas and control panel stack vertically on narrow screens and resize on window resize events.

Implementation: p5.js for the circuit drawing and readout; a small JavaScript state machine for pull-up/button state; a timed pseudo-random flicker used only in the floating state.
</details>

## How Chips Talk to Each Other: SPI and I2C

The Pico does not draw pixels on a display directly — it sends a stream of commands and pixel data to a separate driver chip built into the display module, which does the work of lighting the correct pixels. That conversation between microcontroller and display happens over a standardized wiring pattern called a communication bus, and this book's displays use one of two buses: SPI and I2C.

The **SPI (Serial Peripheral Interface)** is a high-speed communication bus that uses separate wires for clock and data, plus one dedicated wire per connected device. SPI is the faster of the two buses covered in this book, and both target displays communicate over it, which is why the wiring diagrams throughout this book center on SPI connections.

The **I2C (Inter-Integrated Circuit) interface** is a slower, two-wire alternative bus that shares a single data wire and a single clock wire among every connected device, distinguishing devices by a unique numeric address instead of a dedicated wire. Because I2C needs only two signal wires no matter how many devices share the bus, it is popular for sensors, and many OLED breakout boards — including some versions of the 128x64 display used in this book — can be wired for either SPI or I2C mode depending on how their driver chip is configured.

!!! mascot-thinking "Same Idea, Different Wiring"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    SPI and I2C are both just agreed-upon patterns for wiring a conversation between chips — nothing about them is magic. Once you see one bus as "more wires, faster" and the other as "fewer wires, shared," you'll recognize both in any hardware you meet later.

Because wire count is the clearest practical difference between the two buses, the interactive diagram below lets you switch between an SPI wiring view and an I2C wiring view and click each wire to see what it carries.

#### Diagram: SPI vs I2C Bus Explorer

<iframe src="../../sims/spi-i2c-bus-explorer/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>SPI vs I2C Bus Explorer</summary>
Type: diagram
**sim-id:** spi-i2c-bus-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, compare

Learning objective: Differentiate SPI and I2C wiring by comparing wire count, addressing scheme, and typical speed, and identify which bus a given wiring diagram uses.

Canvas layout:
- Top: two toggle buttons, "Show SPI" and "Show I2C" (one active at a time)
- Center (about 500x300, responsive): a Pico rectangle on the left wired to one or two device rectangles on the right with labeled, colored wires
- Bottom: an infobox panel showing definitions when a wire or pin is clicked

Visual elements (SPI view): one Pico box wired to one display box with five labeled wires — SCK (clock, yellow), MOSI/SDA (data, orange), CS (chip select, red), DC (data/command, blue), RES (reset, purple) — plus gray 3.3V and GND wires; caption "One CS wire needed per device"

Visual elements (I2C view): one Pico box wired to two device boxes sharing SDA (orange) and SCL (yellow), plus 3.3V and GND; each device box shows an address label such as "0x3C" or "0x68"; caption "Same two wires serve every device; addresses tell them apart"

Interactive controls:
- Toggle redraws the diagram for the selected bus
- Clicking any wire or pin opens an infobox with a one-sentence definition (for example, "CS" shows "Chip Select: tells one specific device to listen; each device on an SPI bus needs its own CS wire.")
- Hovering highlights the wire and shows a short-name tooltip

Default parameters: initial view SPI; no wire selected, infobox prompts "Click any wire to learn what it does"

Behavior: switching buses updates a counter reading "Wires used: 5" (SPI) or "Wires used: 2" (I2C), excluding power and ground. A clicked wire's infobox stays open until another wire is clicked or the view toggles.

Instructional Rationale: A clickable comparison diagram fits the Analyze-level objective because the student must examine two wiring patterns side by side and identify the structural difference — a dedicated wire per device versus shared wires with addressing — rather than recall a definition.

Responsive design: reflows to a single column below 600 pixels wide; the wire diagram scales proportionally on window resize.

Implementation: p5.js canvas for the wiring diagram and click/hover detection; a state object holding the current view mode and selected wire.
</details>

## The Five Wires Every Display Needs

The SPI wiring diagram above named five signal wires used to connect a display, and every display driver wired in this book expects all five. This book's example programs connect them to Pico pins GP2 through GP6, though a program can use different pins as long as its wiring matches its code. Here is what each wire does, and the exact pin this book uses for it on the 128x64 OLED:

- **SPI Clock Line (GP2):** carries a repeating timing pulse generated by the Pico. Every bit sent over the data line is only valid at the instant of a clock pulse, which keeps the sender and receiver synchronized without a separate clock chip on the display.
- **SPI Data Line (GP3):** carries the actual bits, one at a time, from the Pico to the display driver — pixel data, and, when the Data Command pin is set correctly, drawing commands as well. On the display module used in this book, the silkscreen label for this pin often reads "SDA," borrowed from I2C wiring diagrams, even though it functions here as SPI's data-out line.
- **Chip Select Pin (GP6):** tells one specific display, out of possibly several sharing the same clock and data wires, to pay attention to what is being sent. Pulling this pin LOW activates that display; any other SPI device sharing the bus ignores the traffic while its own chip select pin stays HIGH.
- **Data Command Pin (GP5):** tells the display driver whether the byte arriving over the data line is a drawing command, such as "set the cursor position," or actual pixel data to store in the display's memory. Flipping this one pin between two states is what lets a single wire carry two very different kinds of information.
- **Display Reset Pin (GP4):** briefly pulled LOW and back HIGH when a program starts, forcing the display driver chip into a known blank starting state — the same purpose a reset button serves on a stalled computer.

Because this exact five-pin pattern is reused for both displays in this book, it is worth memorizing as a table rather than as five separate facts.

| Pico Pin | Signal Name | Role |
|---|---|---|
| GP2 | SCK (clock) | Times each bit of data |
| GP3 | MOSI/SDA (data) | Carries commands and pixel data |
| GP4 | RES (reset) | Resets the display to a known state |
| GP5 | DC (data/command) | Flags each byte as a command or as data |
| GP6 | CS (chip select) | Activates this specific display |

## Two Displays, Two Personalities

With the wiring pattern established, the two target displays can finally be introduced properly.

The **128x64 monochrome OLED** is a small, rectangular organic light-emitting diode screen, 128 pixels wide and 64 pixels tall, where every pixel is either lit or off — there is no gray scale and no color. Because each pixel produces its own light rather than being lit from behind, OLED displays have high contrast and stay readable at a wide viewing angle, and the whole display draws very little power when showing mostly dark frames. At roughly $20 and needing only SPI wiring, it is the default, lowest-friction display for a first robot face.

Inside that OLED module sits the **SSD1306 display driver**, a dedicated chip that stores the OLED's entire 128x64 pixel image in its own onboard memory and continuously refreshes the physical pixels from that memory. This means the Pico only has to send updated pixel data when something changes, rather than stream a constant video signal. MicroPython includes a ready-made `ssd1306` driver module that speaks the SSD1306's command set, so a program controls the display through simple method calls instead of raw SPI commands.

The **240x240 color round display** is a circular color LCD, 240 pixels across in every direction, styled after a smartwatch face. Unlike the OLED's binary on/off pixels, each pixel on this display can show one of thousands of colors, opening up eyebrows in red, pupils in blue, or a background color that shifts with mood. At around $10, it is even cheaper than the OLED, though its circular shape and color depth introduce layout and performance trade-offs explored fully in Chapter 15.

That color display is controlled by the **GC9A01 display driver** chip, which, like the SSD1306, holds the full-screen image in its own memory and is controlled over SPI using the identical five-wire pattern — clock, data, chip select, data/command, and reset — covered earlier in this chapter. Because both driver chips use the same signal roles, the wiring skills and MicroPython patterns learned on the monochrome OLED carry over directly to the color display, typically using a second set of Pico GPIO pins so both displays could even be connected and tested at the same time.

The table below puts the two displays side by side so you can compare them at a glance.

| Feature | 128x64 Monochrome OLED | 240x240 Color Round Display |
|---|---|---|
| Driver chip | SSD1306 | GC9A01 |
| Shape | Rectangle | Circle |
| Resolution | 128 x 64 pixels | 240 x 240 pixels |
| Color depth | 1 bit (on/off) | 16-bit color (RGB565) |
| Interface | SPI | SPI |
| Approximate price | $20 | $10 |
| Typical strength | High contrast, low power | Color, larger drawable area |

## Keeping Displays Safe: Power and Mounting

A display is the most fragile and often the most expensive part of a robot-face kit, so it deserves careful handling before it is ever wired into a circuit.

Both displays in this book expect **3.3 volts** for power, the same voltage the Pico's GPIO pins and internal logic use — never the 5 volts available on the Pico's VBUS pin. Applying 5 volts directly to a 3.3-volt-only display can permanently damage its driver chip, so every wiring diagram in this book connects a display's power wire to the Pico's 3V3 output pin, not VBUS. This requirement is what the concept **Display Power Requirements** refers to throughout the rest of the book.

!!! mascot-warning "Check the Voltage Before You Power On"
    ![Pixel warns you](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Before connecting power to any display for the first time, trace the red wire back to its source pin and confirm it reads 3V3, not VBUS or VSYS. A single mis-wired power connection is the most common way to destroy a display permanently, and displays are the most expensive part of the kit to replace.

Because both displays are thin, glass-fronted modules with a delicate ribbon or pin connection to their circuit board, how a display is physically mounted matters almost as much as how it is wired. Keep the following **display mounting considerations** in mind as you build an enclosure for a robot face:

- Support a display by its circuit board edges, never by pressing on the glass or plastic screen surface.
- Leave header pins unbent; repeated flexing can crack the solder joints connecting a driver chip to its board.
- Mount the round color display so its flat ribbon connector is not pinched or sharply folded when a case closes.
- Route jumper wires away from moving parts if a display is mounted on a robot chassis, so cables are not pulled loose during motion.
- Keep a small air gap between the OLED glass and any enclosure window to avoid pressure marks on the display surface.

## Putting It All Together: The Breadboard Wiring Diagram

Every component introduced in this chapter — the Pico, the breadboard, jumper wires, and a display's five SPI wires — comes together in a single reference drawing called a **breadboard wiring diagram**: a picture that shows components positioned roughly as they would sit on a physical breadboard, connected by color-coded wires, so a student can replicate the circuit without reading a single line of code. Every hardware-dependent chapter in this book begins by pointing back to a diagram in this style.

The interactive version below lets you explore the full wiring for the 128x64 OLED, then switch to see how nearly identical wiring connects the color round display.

#### Diagram: Interactive Breadboard Wiring Diagram

<iframe src="../../sims/breadboard-wiring-diagram/main.html" width="100%" height="550px" scrolling="no"></iframe>

<details markdown="1">
<summary>Interactive Breadboard Wiring Diagram</summary>
Type: diagram
**sim-id:** breadboard-wiring-diagram<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: examine, distinguish, organize

Learning objective: Examine a complete breadboard wiring diagram, distinguish power wires from signal wires, and correctly identify which Pico pin each display wire connects to.

Canvas layout:
- Top (about 700x400, responsive): illustrated breadboard with a Pico straddling the center gap and a display module above it, connected by seven color-coded jumper wires
- Control strip: display selector and a label-visibility toggle
- Infobox area below the canvas showing details of the clicked wire or pin

Visual elements: a breadboard rectangle with a visible hole grid and center gap; a Pico outline with labeled pins GP2, GP3, GP4, GP5, GP6, 3V3, and GND; a display outline (switchable between an OLED rectangle and a round color-display circle) with matching pins SCK, SDA, RES, DC, CS, VCC, and GND; seven wires in distinct colors — yellow (SCK), orange (SDA/MOSI), purple (RES), blue (DC), red (CS), plus a red/black power pair

Interactive controls:
- Toggle: "Display: OLED (128x64) / Color Round (240x240)" swaps the display outline and, optionally, its pin set
- Checkbox "Show pin labels" (default on)
- Clicking any wire or pin opens an infobox describing that connection (for example, the red wire shows "3V3 to VCC: supplies power to the display — never connect this to VBUS or 5V.")
- Hovering highlights the full wire path in white

Default parameters: OLED display selected, pin labels shown, no wire selected (infobox prompts "Click a wire or pin to see what it does")

Behavior: clicking a signal wire highlights it and echoes the definitions from the "Five Wires Every Display Needs" section; clicking a power wire repeats the 3.3-volt/VBUS warning; toggling the display keeps the same interaction so students see the wiring pattern, not just the labels, is identical between displays.

Instructional Rationale: An Analyze-level objective requires the learner to examine the full assembled circuit and correctly attribute each wire's role within the larger structure, which a single static picture cannot verify. Clicking each wire and receiving the correct definition back confirms the learner can distinguish the wires rather than having merely seen them.

Responsive design: the breadboard illustration scales to its container's width on window resize, with the control strip stacking below on narrow viewports.

Implementation: p5.js for the breadboard, Pico, and display outlines, with clickable pin and wire regions as rectangles and line segments; a state object tracks the selected display type and wire.
</details>

## Pricing Out Your Kit

Every component in this chapter was chosen for one more reason beyond its technical role: cost. Robot faces are more useful as a teaching tool when every student can own the hardware rather than share it, which is only realistic if a complete kit stays inexpensive.

Adding up the approximate prices introduced throughout this chapter shows how a complete **low-cost robotics kit** — one Pico, one breadboard, and one display — comfortably fits under $30, even with the higher-priced OLED.

| Part | Approximate Cost |
|---|---|
| Raspberry Pi Pico | $4 |
| Solderless breadboard | $2 |
| Jumper wire set | $2 |
| 128x64 monochrome OLED | $20 |
| Momentary push button | $0.10 |
| **Total (OLED kit)** | **≈ $28** |

Swapping the OLED for the $10 color round display drops the total closer to $18, leaving room in a classroom budget for a potentiometer, a rotary encoder, or a spare display in case one is damaged during testing. This combination of an under-$30 price and a shared RP2040 foundation is what makes it realistic to put a working robot face project in front of every student in a class, rather than a handful of shared demo units passed from group to group.

## Chapter Summary

You now know every physical component used in this book's robot-face projects, from the RP2040 chip at the center of the Raspberry Pi Pico to the five wires that connect a display driver to that chip. Chapter 2 sets this hardware aside briefly to look at the history of screen-based robot faces before Chapter 3 begins programming it.

- A microcontroller like the RP2040 is a complete small computer built for controlling physical devices, not for running general-purpose software.
- Breadboards and jumper wires let circuits be built and rewired without solder.
- Momentary push buttons need a pull-up resistor, often built into the RP2040, to avoid a floating, unreliable pin.
- SPI uses five wires per device (clock, data, chip select, data/command, and reset) and runs fast; I2C uses two shared wires plus device addresses and is simpler to wire when many devices are needed.
- The SSD1306 driver runs the 128x64 monochrome OLED, and the GC9A01 driver runs the 240x240 color round display; both speak SPI using the same five-wire pattern.
- Displays must be powered at 3.3 volts, never 5 volts, and mounted by their board edges rather than their screens.
- A complete robot-face kit built from these parts costs well under $30, which is what makes a one-kit-per-student classroom realistic.

!!! mascot-celebration "You Just Met Your Whole Toolkit!"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Every wire, chip, and display in this book just introduced itself to you — that's the entire hardware foundation, done. Chapter 2 takes a quick look at where screen-based robot faces came from before Chapter 3 puts this hardware to work in code.

??? question "Self-Check: Which wire is which? — Click to reveal"
    On the SPI wiring diagram, the wire that tells the display driver whether an incoming byte is a command or pixel data is the Data Command (DC) pin — on this book's OLED wiring, that is Pico pin GP5.
