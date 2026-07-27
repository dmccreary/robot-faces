---
title: Course Description for Course Robot Faces
description: A detailed course description for Robot Faces including overview, topics covered and learning objectives in the format of the 2001 Bloom Taxonomy
quality_score: 97
---

# Course Description

**Title:** Robot Faces: Drawing Expressive Displays for STEM Robots

**Target Audience:** High school students (grades 9-12) in STEM, robotics, or coding clubs. The
hands-on, low-cost hardware also works well for advanced middle-school students and CoderDojo-style
after-school programs with adult mentorship.

**Prerequisites:** None. No prior programming or electronics experience is required — MicroPython
syntax (variables, functions, loops) is introduced from scratch in the early lessons. Basic
computer literacy (using a file manager, editing a text file) is helpful. Students who have used a
block-based language such as Scratch will recognize the concepts of variables and functions
immediately, but this is not required.

## Course Overview

Robots that show emotion connect with people more easily, and one of the cheapest ways to give a
robot personality is to put a small screen where its face would be. This course teaches students
to program expressive robot faces on two low-cost hardware targets: a $20, 128x64 monochrome OLED
display and a $10, 240x240 color round display similar to a smartwatch face. Both run on a
Raspberry Pi Pico programmed in MicroPython, keeping a complete robot face kit under $30 so every
student in a classroom can build and keep their own.

Students learn to decompose a face into independently parameterized parts — eyes, pupils,
eyebrows, and a mouth — and to combine those parts into recognizable emotional expressions,
starting from Paul Ekman's research on universal human emotions and from published research on
which facial features actually matter for a robot to be read as "emotional." Along the way,
students practice core computational thinking skills: abstraction (a face is a set of parameters,
not a fixed picture), decomposition (breaking a face into independently drawable parts), and
modularity (writing one `draw_face()` function that works for many expressions).

This course is deliberately hardware-light and display-centric: it does not teach robot chassis
assembly, motor control, or navigation. It focuses entirely on the display, the drawing code, and
the design of expression — the same skills used by commercial social robots such as Anki's Cozmo
and Vector, Emotix's Miko, and Blue Frog Robotics' Buddy, all of which use animated screen-based
eyes as their primary emotional interface.

## Main Topics Covered

- Robot face hardware: Raspberry Pi Pico (RP2040), 128x64 monochrome OLED (SSD1306/SPI), 240x240
  color round display (GC9A01/SPI), breadboard wiring, and pin assignments
- MicroPython programming fundamentals as applied to embedded display code (variables, constants,
  functions, loops, imports)
- Screen coordinate systems and the FrameBuf drawing model (origin, X/Y axes, pixels, frame
  buffers)
- Basic drawing primitives: `fill()`, `hline()`/`vline()`, `line()`, `rect()`, and `scroll()`
- Drawing ellipses and polygons (`ellipse()` with quadrant fill codes, `poly()` with point arrays)
  to build eyes, pupils, eyebrows, mouths, and noses
- Facial anatomy and layout: decomposing a face into parameterized, independently drawable parts
  and combining them in a single `draw_face()` function
- The psychology and research behind robot facial expression design: Paul Ekman's universal
  emotions, minimal-feature robotic face research, and how commercial social robots design
  expressive eyes
- Designing a core emotion set: neutral, happy, sad, angry, afraid, surprised, tired, stern, and
  disgust, plus recognizing common variations (e.g., confused, sleepy, excited)
- Animating expressions: blinking, eye/pupil movement (gaze), timing loops, and interpolating
  between expressions
- Interactive controls: reading buttons, potentiometers, and rotary encoders to switch expressions
  or live-tune a face's parameters, including simple mode/state-machine designs
- Adapting monochrome face designs to a color round display using the RGB565 color model and
  `color565()`, and reasoning about performance differences between the two displays
- Capstone design: combining hardware, drawing, animation, and interaction into an original robot
  face personality

## Topics Not Covered

- Physical robot chassis assembly, motor control, wheel/servo driving, or autonomous navigation
- Computer vision or camera-based human emotion recognition
- Natural language processing, conversational AI, or voice/speech synthesis
- Non-display sensors and actuators (e.g., time-of-flight distance sensors, NeoPixel LED strips)
  beyond an optional "extensions" mention — these belong to a broader robotics course, not this one
- Custom PCB design or soldering (all wiring uses solderless breadboards and jumper wires)
- 3D-printed or laser-cut enclosure design
- General-purpose Python topics unrelated to embedded displays (e.g., data science, web
  development, desktop GUIs)

## Learning Outcomes

After completing this course, students will be able to:

### Remember

*Retrieving, recognizing, and recalling relevant knowledge from long-term memory.*

- Recall the pixel coordinate convention used by the 128x64 and 240x240 displays, including where
  the origin (0,0) sits and which direction is X versus Y.
- List the FrameBuf drawing methods available in MicroPython (`fill`, `hline`, `vline`, `line`,
  `rect`, `ellipse`, `poly`, `scroll`, `blit`) and what each one draws.
- Identify the SPI wiring pins (SCL, SDA, DC, RES, CS) used to connect an OLED or color display to
  a Raspberry Pi Pico.
- Recall Paul Ekman's set of universal human emotions and the additional expressions (tired,
  stern) commonly added to robot face designs.

### Understand

*Constructing meaning from instructional messages, including oral, written, and graphic
communication.*

- Explain how the `ellipse()` function's quadrant fill code restricts drawing to one or more
  quarters of a shape to create features like a smiling mouth or a closed eyelid.
- Explain why research on minimalist robot faces has found that a small number of moving features
  (eyes, eyebrows, mouth) is enough for people to correctly identify an emotion.
- Describe the difference between a 1-bit monochrome frame buffer and an RGB565 color frame
  buffer, and why this affects both memory use and drawing speed.
- Compare how two or more commercial social robots (e.g., Cozmo, Vector, Miko) use screen-based
  eyes to express emotion.

### Apply

*Carrying out or using a procedure in a given situation.*

- Use the `ellipse()` and `poly()` FrameBuf methods to draw a face outline, eyes, eyebrows, and a
  mouth on a 128x64 OLED display.
- Write a MicroPython `draw_face()` function that redraws a complete face from a small set of
  parameters (eye size, eyebrow angle, mouth curvature) rather than hard-coded shapes.
- Wire and initialize either an SSD1306 monochrome display or a GC9A01 color round display over
  SPI from a Raspberry Pi Pico and confirm it is working.
- Use a potentiometer or rotary encoder to let a user adjust one parameter of a face's expression
  in real time.

### Analyze

*Breaking material into constituent parts and determining how the parts relate to one another and
to an overall structure or purpose.*

- Break down a target emotion (for example, "surprised") into the specific combination of eyebrow
  position, eye size, and mouth shape needed to convey it.
- Compare drawing performance, using `ticks_us()` benchmarking, between drawing primitives
  directly and blitting a pre-built sprite, and explain why blitting is faster for repeated shapes.
- Given a reference photo or illustration of a facial expression, identify which minimal features
  (eyes, eyebrows, mouth) would need to change to reproduce it on a robot face.
- Differentiate between drawing and color choices that work well on a small monochrome display
  versus a round color display.

### Evaluate

*Making judgments based on criteria and standards through checking and critiquing.*

- Critique a classmate's robot face design for how clearly it communicates its intended emotion,
  using Ekman's emotion categories as a rubric.
- Judge whether a proposed animation (blinking, gaze shift, eyebrow twitch) improves or distracts
  from the clarity of an expression on a low-resolution display.
- Assess the trade-off between drawing complexity/frame rate and expressiveness on a
  resource-constrained microcontroller, and justify a design decision based on that trade-off.

### Create

*Putting elements together to form a coherent or functional whole; reorganizing elements into a
new pattern or structure.*

- Design and program an original robot face personality that displays at least six distinct,
  recognizable emotional expressions triggered by button or rotary-encoder input.
- Build a state-machine-driven "expression menu" that cycles between multiple robot faces using
  physical controls.
- **Capstone project:** Design a robot face program that runs on both the 128x64 monochrome OLED
  and the 240x240 color round display, includes an idle animation (blinking and/or gaze movement),
  supports at least eight recognizable emotions, and is demonstrated live to the class along with
  an explanation of the design choices behind each expression.
