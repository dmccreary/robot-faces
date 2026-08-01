---
title: Quiz - Computational Thinking & Capstone Design
description: Ten multiple-choice questions covering abstraction, decomposition, modularity, constraint-driven design, iteration, peer review, design justification, and the capstone project requirements.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Computational Thinking & Capstone Design

Test your understanding of the problem-solving habits behind this book's projects, and what the capstone project requires.

---

#### 1. Which computational-thinking skill is best illustrated by Chapter 9's `face_state` dictionary reducing "surprised" to a handful of numbers like `eyebrow_angle` and `mouth_curvature`?

<div class="upper-alpha" markdown>
1. Abstraction
2. Decomposition
3. Code reuse
4. Algorithm design
</div>

??? question "Show Answer"
    The correct answer is **A**. Abstraction means representing something complex using a small set of values instead of a full, literal picture. It is not about capturing everything a human face can express — it is about capturing exactly enough to solve the problem, which Chapter 10's recognition research confirmed was the right amount of detail.

    **Concept Tested:** Abstraction

    **See:** [Abstraction: A Feeling Becomes a Handful of Numbers](index.md#abstraction-a-feeling-becomes-a-handful-of-numbers)

---

#### 2. Why could one `draw_face(fb, state)` function produce all thirteen of Chapter 10's named expressions?

<div class="upper-alpha" markdown>
1. Because modularity let one reusable function be called with different state dictionaries instead of needing thirteen near-identical functions
2. Because the RP2040's dual cores each ran half of the expression set
3. Because each expression required its own dedicated frame buffer
4. Because `draw_face()` automatically interpolates between any two expressions it is given
</div>

??? question "Show Answer"
    The correct answer is **A**. Modularity means writing one reusable piece of code instead of duplicating separate code for every case. Without it, thirteen expressions would have meant thirteen near-identical drawing functions — a maintenance nightmare where fixing one bug meant fixing it thirteen times.

    **Concept Tested:** Modularity

    **See:** [Modularity: One Function, Every Expression](index.md#modularity-one-function-every-expression)

---

#### 3. What insight does pattern recognition contribute that abstraction and modularity alone do not?

<div class="upper-alpha" markdown>
1. That happy, sad, angry, and every other expression are the same few parameters set to different values, not thirteen unrelated drawing problems
2. That a display's frame buffer can be split across two SPI buses
3. That a button interrupt handler must be kept short
4. That a color display needs 16 bits per pixel instead of 1
</div>

??? question "Show Answer"
    The correct answer is **A**. Once you see that every expression shares the same three parameters just set differently, expression design stops being "invent a new algorithm per emotion" and becomes "find the right numbers for a function that already exists" — turning thirteen engineering problems into one problem solved thirteen times.

    **Concept Tested:** Pattern Recognition

    **See:** [Pattern Recognition](index.md#pattern-recognition-why-one-function-could-make-thirteen-faces)

---

#### 4. Why does this chapter recommend planning a minimum viable feature set before writing any capstone drawing code?

<div class="upper-alpha" markdown>
1. Because MicroPython requires all expressions to be declared before the display initializes
2. Because it eliminates the need for peer design review later
3. Because a minimum viable feature set is a formal requirement enforced by the rubric-scoring tool
4. Because it defines the smallest version that would still count as finished, protecting the project from running out of time before it reaches "done"
</div>

??? question "Show Answer"
    The correct answer is **D**. Defining the smallest complete version first — a handful of familiar expressions, one idle animation, one control input, one display — and building that end to end before adding stretch goals protects ambition rather than lowering it. A project that reaches "done" with room to spare beats an ambitious one that never quite gets there.

    **Concept Tested:** Minimum Viable Feature Set

    **See:** [Minimum Viable Feature Set](index.md#minimum-viable-feature-set-start-small-add-more-later)

---

#### 5. A student catches that their planned "surprised" and "afraid" expressions sit too close together by filling out a parameter table before coding either one. Which practice does this illustrate?

<div class="upper-alpha" markdown>
1. Rubric-based assessment
2. Design critique
3. Expression set planning
4. Constraint-driven design
</div>

??? question "Show Answer"
    The correct answer is **C**. Expression set planning means sketching expressions and rough parameter values on paper before writing drawing code, specifically so a confusable pair can be caught and fixed at zero cost — instead of after it is already implemented and needs reworking.

    **Concept Tested:** Expression Set Planning

    **See:** [Expression Set Planning](index.md#expression-set-planning-put-it-on-paper-before-you-touch-code)

---

#### 6. What is the purpose of a turtle graphics prototype or software display emulator during capstone planning?

<div class="upper-alpha" markdown>
1. To generate the final MicroPython code that ships on the robot
2. To measure the exact draw time of the finished `draw_face()` function
3. To speed up the earliest, roughest layout iteration without wiring or re-flashing real hardware each time
4. To replace the need for a physical display entirely in the finished project
</div>

??? question "Show Answer"
    The correct answer is **C**. Sketching five eyebrow placements with a turtle-graphics loop takes minutes, while wiring and re-flashing a real OLED five times to test the same question takes much longer. Neither tool produces final code — both exist to speed up early iteration before exact coordinates matter.

    **Concept Tested:** Turtle Graphics Prototype

    **See:** [Prototyping Before the Hardware](index.md#prototyping-before-the-hardware-turtle-graphics-and-software-display-emulators)

---

#### 7. How does the book's own chapter order — primitives before ellipses, a static face before animation — model a specific concept from this chapter?

<div class="upper-alpha" markdown>
1. Constraint-driven design, since each chapter had a fixed page budget
2. Code reuse, since later chapters copy earlier chapters' code verbatim
3. Peer design review, since each chapter was reviewed before the next was written
4. The iterative design process: build a rough version, test it, refine it, and repeat
</div>

??? question "Show Answer"
    The correct answer is **D**. The book deliberately built rough versions first — lines and rectangles before curves, one feature before a whole face, a static face before a moving one — testing each on real hardware before the next, more capable version. The capstone deserves the same treatment: one expression working and tested before moving to the next.

    **Concept Tested:** Iterative Design Process

    **See:** [Iterative Design Process](index.md#iterative-design-process-build-rough-test-refine-repeat)

---

#### 8. Which of the following is a strong design justification, according to this chapter?

<div class="upper-alpha" markdown>
1. "I made the eyebrows asymmetric because I wanted it to look confused."
2. "I made the eyebrows asymmetric because Chapter 10 showed that reads clearly as confused, and I wanted it distinguishable from my symmetric surprised face at classroom distance."
3. "I made the eyebrows asymmetric because it was the first idea I tried."
4. "I made the eyebrows asymmetric because the rubric requires at least one asymmetric expression."
</div>

??? question "Show Answer"
    The correct answer is **B**. A strong justification names a specific source of evidence, a specific goal, and a specific alternative it beat out. A weak justification, like option A, simply restates the choice without connecting it to evidence or a considered alternative.

    **Concept Tested:** Design Justification

    **See:** [Design Justification](index.md#design-justification-explaining-the-why-behind-every-choice)

---

#### 9. What does "original" mean in the context of an original robot personality, according to this chapter?

<div class="upper-alpha" markdown>
1. Inventing a completely new visual language with no reference to any prior research
2. Refusing to reuse the `draw_face()` function so no code is shared with earlier chapters
3. Making enough personal design choices — a distinctive eye shape, palette, or quirk — that the result reads as the student's own, while still building on the course's research and code
4. Avoiding any expression that overlaps with Cozmo, Vector, Miko, or Buddy's expression sets
</div>

??? question "Show Answer"
    The correct answer is **C**. Chapter 2's commercial robots did not invent facial expression from scratch either — they built on the same research this book taught and still ended up visibly distinct. A capstone stands on everything the course taught while still being recognizably personal through specific choices like a distinctive eye shape or palette.

    **Concept Tested:** Original Robot Personality

    **See:** [Original Robot Personality](index.md#original-robot-personality-make-it-yours)

---

#### 10. Which of the following is an explicit requirement of the capstone project checklist in this chapter?

<div class="upper-alpha" markdown>
1. The project must run on both the OLED and the color display
2. The project must include at least 8 distinct, recognizable expressions, an idle animation, and a physical control input
3. The project must use dual-core processing for all input handling
4. The project must include at least one concave polygon shape
</div>

??? question "Show Answer"
    The correct answer is **B**. The checklist requires at least 8 distinct expressions, continuous idle animation, a physical control input, and operation on at least one target display, presented with a live design justification. Porting to both displays is strongly encouraged but explicitly not a strict requirement, which rules out option A.

    **Concept Tested:** Capstone Project

    **See:** [The Capstone Project and Capstone Demonstration](index.md#the-capstone-project-and-capstone-demonstration)
