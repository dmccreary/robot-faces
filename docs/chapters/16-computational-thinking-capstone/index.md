---
title: Computational Thinking & Capstone Design
description: Naming the computational-thinking skills used throughout the book and applying constraint-driven design, iteration, peer review, and justification to plan, build, document, and present an original capstone robot face.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 16:19:53
version: 0.09
---

# Computational Thinking & Capstone Design

## Summary

This final chapter names the computational-thinking skills used throughout the book — abstraction, decomposition, modularity, pattern recognition, and algorithm design — and applies them, along with an iterative, constraint-driven design process and peer review, to a capstone project: designing, building, documenting, and presenting an original robot face personality on one or both displays. After completing this chapter, students will be able to plan, build, and justify the design of an original robot face expression set and present it to an audience.

## Concepts Covered

This chapter covers the following 23 concepts from the learning graph:

1. Computational Thinking
2. Abstraction
3. Decomposition
4. Modularity
5. Pattern Recognition
6. Algorithm Design
7. Code Reuse
8. Design Critique
9. Design Trade-Off Analysis
10. Expressiveness Versus Complexity
11. Software Display Emulator
12. Turtle Graphics Prototype
13. Iterative Design Process
14. Peer Design Review
15. Rubric-Based Assessment
16. Constraint-Driven Design
17. Minimum Viable Feature Set
18. Capstone Project
19. Capstone Demonstration
20. Original Robot Personality
21. Project Documentation
22. Design Justification
23. Expression Set Planning

## Prerequisites

This chapter builds on concepts from:

- [Chapter 2: A History of Screen-Based Robot Faces](../02-history-of-robot-faces/index.md)
- [Chapter 3: MicroPython Fundamentals I: Syntax, Data & Loops](../03-micropython-fundamentals-1/index.md)
- [Chapter 4: MicroPython Fundamentals II: Functions & the FrameBuf Module](../04-micropython-fundamentals-2/index.md)
- [Chapter 5: Display & Coordinate Systems](../05-display-coordinate-systems/index.md)
- [Chapter 6: Basic Drawing Primitives](../06-basic-drawing-primitives/index.md)
- [Chapter 7: Ellipse & Polygon Drawing](../07-ellipse-polygon-drawing/index.md)
- [Chapter 9: Facial Anatomy & Layout Design](../09-facial-anatomy-layout-design/index.md)
- [Chapter 11: Expression Design, Readability & Human-Robot Interaction](../11-expression-design-readability-hri/index.md)
- [Chapter 12: Animating Expressions: Timing & Motion](../12-animating-expressions/index.md)
- [Chapter 13: Interactive Controls: Inputs & Concurrency](../13-interactive-controls-inputs/index.md)
- [Chapter 15: Porting Faces to a Color Display](../15-porting-faces-color-display/index.md)

---

## One Last Chapter, One Big Project

!!! mascot-welcome "This Is It — The Last One"
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Fifteen chapters in, you've wired hardware, drawn ellipses, animated blinks, and read buttons — and now it's time to put all of it into one project that's entirely yours. This chapter has two jobs: name the thinking skills you've been quietly building all along, then help you plan a capstone that shows them off.

You did not learn a pile of unrelated tricks across the last fifteen chapters. You learned a small set of powerful problem-solving habits and practiced each one on a real, physical robot face. This chapter first gives those habits their proper names, then walks you through planning, building, documenting, and presenting a capstone project that is entirely your own design. Nothing here is a new programming skill — it's about thinking clearly with skills you already have.

## Computational Thinking: A Name for What You Already Do

**Computational Thinking** is the general term for a set of problem-solving habits — abstraction, decomposition, modularity, pattern recognition, and algorithm design — that let a person break a complicated real-world problem into pieces a computer can actually solve. It is not a new topic. It is a label for habits you have been practicing since the very first `draw_face()` call in Chapter 9, whether you noticed it or not.

!!! mascot-thinking "You Were Already Doing This"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Here's a strange but true fact about computational thinking: you cannot really be taught it from scratch in one chapter, because you have already been doing it since Chapter 9. What this chapter gives you is the vocabulary to notice it, name it, and use it on purpose next time.

Naming a skill you already have is not busywork. Once you can say "this is decomposition" or "this is an abstraction problem," you can recognize the same shape of problem next time it shows up, in any project or language. The sections below walk through each habit in the order the book taught it, pointing back to the exact chapter and code where you first used it.

## Abstraction: A Feeling Becomes a Handful of Numbers

**Abstraction** means representing something complex — in this book's case, a human facial expression — using a small set of numbers or values instead of a full, literal picture. Chapter 9's `face_state` dictionary is abstraction in its purest form: a feeling as rich and nuanced as "surprised" gets reduced to a handful of key-value pairs like `eyebrow_angle`, `eye_size`, and `mouth_curvature`.

That reduction sounds like it should lose something, and in a sense it does — three numbers cannot capture everything a human face can express. But abstraction is not about capturing everything; it is about capturing exactly enough to solve the problem in front of you. Chapter 10 proved a handful of well-chosen parameters is enough for a viewer to correctly identify thirteen emotions, so Chapter 9's abstraction was not a compromise — it was the right amount of detail for the job.

## Decomposition: Breaking the Face Into Parts

**Decomposition** means breaking a complicated whole into smaller, independent pieces that are each easier to design and build on their own. Chapter 9 decomposed "a face" into eyes, eyebrows, and a mouth — three separately parameterized, separately drawable parts — rather than treating a face as one giant, indivisible shape.

That decomposition is why Chapter 11 could treat eyebrow, mouth, and eye signaling as three distinct research questions instead of one blob of a topic, and why you could debug a broken eyebrow without touching your mouth-drawing code. Decomposition is not just a coding convenience — it is what let this book teach expression design one testable piece at a time.

## Modularity: One Function, Every Expression

**Modularity** means writing one reusable piece of code — a single function — instead of duplicating separate code for every situation it needs to handle. Chapter 9's `draw_face()` function is the clearest example of modularity anywhere in this book: one function, called with a different `face_state` dictionary, draws a completely different expression every time.

Here is the same function signature you first wrote in Chapter 9, still doing exactly the job it always has — reading a state dictionary and drawing the face it describes onto a frame buffer:

```python
def draw_face(fb, state):
    draw_eyebrows(fb, state["eyebrow_angle"])
    draw_eyes(fb, state["eye_size"])
    draw_mouth(fb, state["mouth_curvature"])
```

Without modularity, Chapter 10's thirteen-expression set would have needed thirteen near-identical drawing functions — a maintenance nightmare where fixing one bug meant fixing it thirteen times. With modularity, one tiny function handles all thirteen, and every capstone expression you invent will run through that same function too.

## Pattern Recognition: Why One Function Could Make Thirteen Faces

**Pattern Recognition** means noticing that many different-looking problems actually share the same underlying structure. Chapter 10's entire thirteen-expression set exists because of a pattern recognition insight: happy, sad, angry, surprised, and every other expression are not thirteen unrelated drawing problems — they are the same three parameters, `eyebrow_angle`, `eye_size`, and `mouth_curvature`, just set to thirteen different combinations of values.

Once you see that pattern, expression design stops being "invent a new drawing algorithm for every emotion" and becomes "find the right numbers, using a function that already exists" — the difference between thirteen separate engineering problems and one problem solved thirteen times. Your own capstone expressions will lean on exactly this pattern.

## Algorithm Design: The Recipes Behind the Motion

**Algorithm Design** means planning a clear, ordered, step-by-step procedure for solving a problem, before worrying about the exact code that implements it. Every animation loop, every blinking routine, and every button-driven state machine in Chapters 12 through 14 started life as an algorithm — a numbered list of steps — before it became working MicroPython.

Consider the blink routine from Chapter 12: close the eyelids over a few frames, hold briefly, then reopen over a few more, all timed with `ticks_ms()` instead of a blocking `sleep()` call. That sequence is an algorithm regardless of language. Chapter 13's state machines — cycling a face between expressions on each button press — are algorithms too: a defined set of states and defined rules for moving between them. Thinking through the steps clearly before typing a line is a skill you will lean on heavily when planning your capstone's animation and control logic.

## Code Reuse: The Practical Payoff

**Code Reuse** means building new work on top of code that already exists and already works, instead of starting over from a blank file. This is where abstraction and modularity stop being tidy ideas and start saving you real time: your capstone project will not need a new drawing engine. It will reuse the exact `draw_face()` function and `face_state` parameter system you have already built, tested, and trusted since Chapter 9.

That is the single biggest practical reason this book spent so much time on abstraction, decomposition, and modularity — not just because they are elegant ideas, but because they make a capstone possible in the time you actually have. A student starting from zero would need weeks to get a shape on a screen; you already have a working face-drawing engine in hand.

The table below collects all five computational-thinking skills in one place, alongside exactly where in the book you first practiced each one.

| Computational-Thinking Skill | What It Means Here | Where You Already Used It |
|---|---|---|
| Abstraction | Representing a facial expression as a small set of numbers instead of a full picture | Chapter 9's `face_state` dictionary (`eyebrow_angle`, `eye_size`, `mouth_curvature`) |
| Decomposition | Breaking a face into independent, separately drawable parts | Chapter 9's eyes / eyebrows / mouth breakdown, revisited by Chapter 11's per-feature signaling research |
| Modularity | Writing one reusable function instead of one function per expression | Chapter 9's single `draw_face(fb, state)` function |
| Pattern Recognition | Noticing that many expressions share the same underlying structure and just vary a few values | Chapter 10's 13-expression set, all produced from one function |
| Algorithm Design | Designing a clear, ordered, step-by-step procedure | Chapters 12–14's blink timing, gaze animation, and button/encoder state machines |
| Code Reuse | Building new work on proven code instead of starting from scratch | Your capstone project, reusing Chapter 9's `draw_face()` and parameter system directly |

Reading that table is one thing — tracing the actual connections yourself, chapter by chapter, is what makes the pattern stick. The concept map below lets you click each computational-thinking skill and see exactly which earlier chapter and code example it traces back to.

#### Diagram: Computational Thinking Concept Map

<iframe src="../../sims/computational-thinking-concept-map/main.html" width="100%" height="602px" scrolling="no"></iframe>

<details markdown="1">
<summary>Computational Thinking Concept Map</summary>
Type: diagram
**sim-id:** computational-thinking-concept-map<br/>
**Library:** vis-network<br/>
**Status:** Specified

Bloom Taxonomy Level: Understand (L2) / Analyze (L4)
Bloom Taxonomy Verb: explain, relate, differentiate

Learning objective: Explain each computational-thinking skill in plain language and relate it to the specific earlier chapter and code example where the student already practiced it, differentiating the five skills from one another by the distinct role each one plays.

Canvas layout:
- Center: one large "Computational Thinking" hub node
- Middle ring: six skill nodes — Abstraction, Decomposition, Modularity, Pattern Recognition, Algorithm Design, Code Reuse — connected to the hub by lines
- Outer ring: one matching "earlier chapter" node per skill (Chapter 9 face_state, Chapter 9 eyes/eyebrows/mouth, Chapter 9 draw_face(), Chapter 10 13-expression set, Chapters 12-14 timing/state machines, Capstone project), each linked only to its skill node

Visual elements: hub node in coral, larger than the rest; six skill nodes in teal; six outer example nodes in a neutral color, each labeled with a short chapter tag; plain lines with no arrowheads, since this is a relationship map, not a flowchart

Interactive controls:
- Click any skill node to open an infobox with a one-sentence definition and highlight its edges to the hub and its matching outer node
- Click any outer chapter/example node to open an infobox naming the specific code or concept, and highlight the edge back to its skill
- Drag any node to reposition it (force-directed physics gently repositions neighbors); mouse wheel to zoom, drag empty canvas to pan
- "Reset Layout" button restores the default positions

Default parameters: default force-directed layout, no node selected, infobox reads "Click any node to learn what it connects to"

Behavior: clicking a skill node highlights its hub and example edges in coral, dims all others, and opens the infobox with the skill's definition; clicking an outer node does the reverse, starting from the concrete example and revealing which skill it demonstrates. Only one node's connections are highlighted at a time.

Instructional Rationale: A clickable force-directed concept map fits an Understand/Analyze objective because the point is relating each skill to a concrete, already-familiar example, not memorizing six isolated definitions — clicking back and forth between skill and instance is what cements the connection, which a static list cannot provide.

Responsive design: canvas fills its container width and reflows on resize; on narrow viewports the infobox moves below the canvas.

Implementation: vis-network for force-directed rendering and click/hover handling; node and edge data stored as a local JSON array pairing each skill with its definition and matching chapter example.
</details>

## Constraint-Driven Design: Limits Are Normal, Not a Problem

With the vocabulary in place, it's time to turn from naming what you have already done to planning what comes next. **Constraint-Driven Design** means treating real limits — a fixed display resolution, the RP2040's limited memory and speed, a budget under $30 — as a normal, productive part of engineering, not an obstacle standing between you and a good design.

Every chapter in this book was already shaped by constraints you may not have noticed. Chapter 1's $30 kit budget determined which displays were even options; Chapter 5's fixed pixel grid determined how much detail an eyebrow could show. This chapter does not remove those limits for your capstone — it hands them to you on purpose, because working productively within real constraints is one of the most transferable skills this course teaches. Professional engineers almost never design with unlimited time, memory, or budget; they get good at building something excellent inside the limits they are actually given.

## Minimum Viable Feature Set: Start Small, Add More Later

!!! mascot-tip "Start Smaller Than You Think You Need To"
    ![Pixel gives a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Here's a trick every experienced builder uses: define the smallest version of your project that would still count as finished, build that first, and only then decide what to add. A capstone that reaches "done" with room to spare beats an ambitious one that never quite gets there.

A **Minimum Viable Feature Set** is the smallest collection of expressions and features that would still make a complete, demonstrable project — the version you could show the class tomorrow if you had to stop today. Before sketching a single expression, decide what that smallest complete version looks like: which expressions are non-negotiable, which display you'll target first, and which control scheme is simplest to get working.

A practical minimum viable feature set for this course's capstone might look like this:

- Eight required expressions, chosen from familiar Chapter 10 territory (happy, sad, angry, surprised, afraid, neutral, tired, disgust) so the parameter values are mostly known quantities
- One idle animation — a simple blink loop is enough to start
- One control input — a single button cycling forward through the expression list
- One target display — whichever one you already have wired and tested

Only after that minimum works end to end should you consider stretch goals: extra expressions, gaze movement layered onto the blink, a second control input, or a port to the second display. Planning a minimum first is not lowering your ambition — it is protecting your ambition from running out of time.

## Expressiveness Versus Complexity: The Tension You'll Manage All Project

**Expressiveness Versus Complexity** names the design tension between adding more visual richness or more features and keeping a project simple enough to finish, debug, and demonstrate with confidence. Every extra expression, animation layer, or control input makes your capstone more expressive — and also adds more code that can break, more states to test, and more chances your demonstration goes wrong in front of the class.

Chapter 11's readability rubric already warned about one side of this: a face that says too much at once, with too many features changing simultaneously, becomes harder to read, not easier. That same tension now shows up at the project level. A ten-expression capstone with clean, well-tested code is a stronger project than a twenty-expression one that crashes mid-presentation because half its states were never fully tested. Managing this tension deliberately, rather than by accident, is one of the real skills this capstone builds.

## Expression Set Planning: Put It on Paper Before You Touch Code

**Expression Set Planning** means sketching out, on paper or in a simple table, exactly which expressions your capstone will include and roughly what parameter values each will use — before writing a single line of drawing code. This is where your minimum viable feature set turns from a list of names into something concrete enough to build.

A planning table does not need to be fancy: the expression's name, its rough parameter values (refine exact numbers later), and a short note on what makes it distinct from its nearest neighbor on Chapter 11's valence-arousal grid. Here is a partial example partway through planning:

| Expression | Eyebrow Angle | Eye Size | Mouth Curvature | Design Note |
|---|---|---|---|---|
| Happy | +6 | 12 | +8 | Baseline positive expression, moderate intensity |
| Surprised | +10 | 18 | +4 (open) | Push eyebrows and eyes further than Afraid to stay distinct |
| Afraid | +9 | 17 | +2, slight pull | Mouth pulls rather than opens symmetrically, per Chapter 11 |
| Curious (original) | (+8, -2) asymmetric | 12 | +1 | One eyebrow raised, inspired by Confused but a distinct read |

Planning expressions this way, before coding any of them, is what lets you catch a confusable pair — like Surprised and Afraid sitting too close together — on paper, where fixing it costs nothing, instead of after it is already implemented in code.

## Prototyping Before the Hardware: Turtle Graphics and Software Display Emulators

A **Turtle Graphics Prototype** is a rough sketch of a face's layout drawn using simple turtle-graphics-style commands — move forward, turn, draw a line — well before that layout touches a real display or real FrameBuf code. A **Software Display Emulator** is a program that mimics the look of the OLED or color display on a computer screen, letting you preview roughly how a face will appear without wiring up any hardware.

Neither tool produces final code. Both exist to speed up the earliest, roughest stage of iteration, when you are still deciding where an eyebrow sits relative to an eye, long before exact pixel coordinates or `ellipse()` quadrant codes matter. Sketching five eyebrow placements with a turtle-graphics loop takes minutes; wiring and re-flashing a real OLED five times to test the same question takes much longer. Once a rough layout feels right, only then is it worth translating into the real `draw_face()` function on real hardware.

## Iterative Design Process: Build Rough, Test, Refine, Repeat

!!! mascot-thinking "This Book Taught You Iteration by Doing It To You"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Look back at how this book itself was structured: drawing primitives before ellipses, ellipses before a full face, a full face before animation. That was never an accident — it was the iterative design process, used on you, one chapter at a time.

The **Iterative Design Process** means building a rough version of something, testing it, refining it based on what you learned, and repeating — rather than trying to get every detail perfect on the first attempt. This book modeled that process on you deliberately: plain lines and rectangles before curved ellipses, single features before a whole face, a static face before one that moves. Each chapter was a rough version, tested against real code on real hardware, refined into the next chapter's more capable version.

Your capstone deserves the same treatment. Do not try to write a final, polished `draw_face()` call for all eight-plus expressions in one sitting. Build one, get it rendering correctly, test it at classroom distance, then move to the next. Add the idle animation only once the static expressions work; add the second display port only once the first is solid. Each rough pass earns you the right to attempt the next, more polished one.

## Design Trade-Off Analysis: Reasoning You've Already Practiced

**Design Trade-Off Analysis** is the general skill of weighing two or more competing design options against each other and choosing deliberately, rather than by accident or default. You have already done this twice without naming it: Chapter 11's rubric forced a trade-off between visual richness and classroom-distance readability, and Chapter 15's color-versus-monochrome comparison traded expressive range against memory and drawing-time cost.

Your capstone will present its own version of this reasoning, over and over. Should eyebrows move smoothly across ten animation frames, or is a simpler three-frame version just as readable and far less code to debug? Should remaining project time go to a second-display port, or to polishing the idle animation? None of these questions has one universally correct answer — that is what makes them trade-offs. What matters is that you can name the options you considered and explain, specifically, why you chose the one you did.

## Peer Design Review and Rubric-Based Assessment

**Peer Design Review** means having classmates examine and critique your capstone design before you consider it finished, using a shared rubric rather than casual opinions. **Rubric-Based Assessment** is the broader practice of scoring a design against explicitly named criteria instead of one overall impression — the same approach Chapter 11's Emotional Design Rubric introduced for individual expressions.

The capstone extends that same rubric idea to a whole project. Beyond Chapter 11's original seven criteria — identifiability, confusable-neighbor distance, classroom-distance readability, lighting robustness, appropriate intensity, deliberate symmetry, and face-only clarity — a capstone review adds criteria that only make sense at the project level: does the expression set reach the required eight, does the idle animation look natural rather than jittery, does the control input respond promptly, and is the project documented well enough for a reviewer who has never seen your code to understand it. A classmate applying this fuller rubric before your final demonstration is one of the most useful checks available — a second, less attached pair of eyes almost always catches something you stopped noticing.

Reading a rubric is very different from actually using one on somebody else's real project. Try scoring a sample capstone plan yourself, criterion by criterion, and see how much more specific your feedback becomes once you have to justify every rating in writing.

#### Diagram: Capstone Rubric Scoring Tool

<iframe src="../../sims/capstone-rubric-scoring-tool/main.html" width="100%" height="722px" scrolling="no"></iframe>

<details markdown="1">
<summary>Capstone Rubric Scoring Tool</summary>
Type: microsim
**sim-id:** capstone-rubric-scoring-tool<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Evaluate (L5)
Bloom Taxonomy Verb: judge, assess, justify, critique

Learning objective: Given a summary of a sample classmate's capstone plan (expression list, chosen display, control scheme, and idle animation description), assess it against an extended capstone rubric that builds on Chapter 11's Emotional Design Rubric, assigning a rating and a required written justification per criterion, and compose that feedback into a peer-review summary ready to hand to the presenter.

Canvas layout:
- Left 45% (responsive, roughly 340px at default width): a scrollable "capstone plan summary" card showing a sample classmate's plan — 8+ planned expressions with brief parameter notes, chosen display target, control scheme, and a one-paragraph idle-animation description
- Right 55%: twelve rubric rows (Chapter 11's original seven plus five capstone additions: Expression Set Completeness, Idle Animation Naturalness, Control Responsiveness, Documentation Clarity, Original Personality), each with a four-point rating control (Needs Work / Developing / Solid / Excellent) and a required justification text box
- Bottom: "Load Sample Plan" dropdown, "Compose Peer Feedback" button, and a feedback-summary output panel

Visual elements: the plan summary card, styled like a filled-in worksheet rather than a rendered face, since the object under review is the whole project plan, not one expression; twelve rubric rows with rating buttons and justification fields; an auto-composed feedback panel, appearing after all rows are rated, formatted as a short paragraph per criterion suitable for handing to the plan's author

Interactive controls:
- Dropdown: "Load Sample Plan" offering 3-4 pre-authored plans of varying quality, including one with fewer than eight expressions and one clearly complete plan
- Four-point rating buttons and a required short-text justification field per row; "Compose Peer Feedback" stays disabled until every row has both
- "Compose Peer Feedback" button assembles all twelve justifications into one readable summary
- "Start New Review" button clears all ratings, justifications, and the output panel

Default parameters: first sample plan lists only six expressions with a vague idle-animation description, giving Expression Set Completeness and Idle Animation Naturalness an obvious issue to flag; no ratings entered yet

Behavior: loading a plan populates the summary card; the learner rates and justifies all twelve rows before the compose button activates; composing feedback assembles a single summary, ordered by rubric row, directly from the learner's own justification text, modeling a real written peer-review handoff; loading a different plan resets everything.

Instructional Rationale: An Evaluate-level Rubric Rater fits this objective because judging a full project against an extended, named rubric with required written justification is exactly the peer-review skill the capstone needs; composing justifications into one output models the actual deliverable — written peer feedback — rather than a private self-check.

Responsive design: the plan card and rubric rows stack vertically below 700 pixels; the output panel appears below both sections.

Implementation: p5.js or plain HTML/CSS for the form; sample plans and rubric criteria stored as local JSON; the compose step is string concatenation of the learner's own justification fields, not a generated response.
</details>

## Design Critique: Giving and Receiving Feedback Well

**Design Critique** is the general skill of giving and receiving specific, constructive feedback on a design — the skill the rubric tool above only pays off if the people using it also practice well. A useful critique names a specific criterion, points to specific evidence, and suggests a next step; a vague critique like "it looks kind of confusing" gives the designer nothing to act on.

A few habits separate a useful critique from a discouraging one:

- Point to a specific rubric criterion instead of a general impression — "confusable-neighbor distance" is actionable, "something feels off" is not.
- Describe what you observed, not what you assume the designer intended.
- Pair every criticism with a concrete next step the designer could take.
- Receive critique as information about your design, not a judgment of you — every designer in this book, including the ones behind Cozmo and Vector, shipped designs that later needed revision.

Design critique gets easier with practice, and the peer review step of your capstone is exactly the practice round this course gives you before you defend your project live in front of the class.

## Design Justification: Explaining the "Why" Behind Every Choice

**Design Justification** means being able to explain, specifically, why a particular design choice was made — not just that it was made. This is the Evaluate-level thinking this entire course has been building toward, now aimed squarely at defending your own work instead of critiquing someone else's.

A weak justification restates the choice: "I made the eyebrows asymmetric because I wanted it to look confused." A strong one connects the choice to evidence: *"I made the eyebrows asymmetric because Chapter 10 showed that reads clearly as confused, and I wanted this expression distinguishable from my symmetric surprised face at classroom distance."* The strong version names a specific source of evidence, a specific goal, and a specific alternative it beat out — exactly what your demonstration audience and rubric scorers will be listening for when they ask "why did you design it that way?"

## Project Documentation: Writing It Down for the Demo and Beyond

**Project Documentation** means writing down what your project does and how it works, both to support your live demonstration and for anyone who might build on it later. Documentation is not an afterthought — it is the record that lets your design justifications survive past the moment you say them out loud.

Useful capstone documentation does not need to be long. It needs to cover:

- Which display or displays your project runs on, and how it is wired
- The full list of expressions included, with a one-line design note for each — essentially your expression set planning table, cleaned up
- How the control input works (which button or encoder action does what)
- A short description of the idle animation
- At least one design trade-off you made deliberately, and why

Written this way, your documentation doubles as a cheat sheet for your live demonstration — you won't need to remember every justification if you already wrote the strongest version of each one down in advance.

## Original Robot Personality: Make It Yours

An **Original Robot Personality** is a face design with its own distinct visual style and expression choices — not a copy of Cozmo, Vector, Miko, or Buddy from Chapter 2, even though all four clearly helped inspire why this course, and your capstone, exist.

"Original" does not mean inventing an entirely new visual language from nothing. It means making enough of your own choices that the result reads as yours: a distinctive eye shape, a particular color palette on the round display, an expression or two beyond the required core set, or a quirk in how your idle animation behaves. Chapter 2's four commercial robots did not invent facial expression from scratch either — they built on decades of the same research this book taught you, and still ended up with four visibly distinct personalities. Your capstone gets to do the same: stand on everything this course taught you, and still be recognizably, personally yours.

## The Capstone Project and Capstone Demonstration

!!! mascot-encourage "A Little Nervous About the Capstone? Good Sign."
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Feeling a flutter of nerves about presenting your own project to the class is completely normal — it means you actually care how it lands. You have already built every skill this project needs; the capstone just asks you to put them all in one place at once.

The **Capstone Project** is the assignment this chapter has been preparing you for: an original robot face program pulling together hardware wiring, expression design, animation, and interactive control into one finished piece of work. The **Capstone Demonstration** is presenting that project live to the class, running on real hardware, with a spoken explanation of the design choices behind it.

Here is exactly what the capstone project requires, spelled out as a checklist you can hold yourself to from the very first planning session:

| Requirement | What It Means | Where You Learned the Skill |
|---|---|---|
| At least 8 distinct, recognizable expressions | Each one identifiable within a couple of seconds, distinguishable from its nearest confusable neighbor | Chapters 9–11 |
| Idle animation | Blinking and/or gaze movement plays continuously while the robot is not showing a specific triggered emotion | Chapter 12 |
| Physical control input | A button, potentiometer, or rotary encoder triggers expression changes or tunes a parameter live | Chapter 13 |
| Runs on at least one target display | The 128x64 OLED or the 240x240 color round display, fully wired and working — porting to both is strongly encouraged | Chapters 1, 15 |
| Live demonstration with design justification | Presented to the class on real hardware, explaining the specific design choice behind each expression | This chapter |

"Runs on both displays" is not a strict requirement, but it is worth aiming for. Chapter 15 already did the hard conceptual work of porting a `draw_face()` design from monochrome to RGB565 color — porting your own original expressions the same way is one of the strongest ways to show a rubric scorer you understand the parameter system, not just one display's code.

Everything from this chapter — minimum viable feature set, expression set planning, prototyping, iteration, peer review, trade-off analysis, justification — exists to get you to this checklist with confidence instead of a last-minute scramble. The planning tool below is where that work starts: fill it in honestly, before writing a single new line of drawing code.

#### Diagram: Capstone Planning Worksheet

<iframe src="../../sims/capstone-planning-worksheet/main.html" width="100%" height="702px" scrolling="no"></iframe>

<details markdown="1">
<summary>Capstone Planning Worksheet</summary>
Type: microsim
**sim-id:** capstone-planning-worksheet<br/>
**Library:** p5.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Create (L6)
Bloom Taxonomy Verb: design, plan, formulate, construct

Learning objective: Design an original capstone plan by formulating a minimum viable expression set of at least eight named expressions with rough parameter notes, selecting a target display and control scheme, and describing an idle animation — producing a complete, personally-authored project plan that satisfies every capstone requirement before any drawing code is written.

Canvas layout:
- Left 60% (responsive, roughly 480px at default width): an editable worksheet with a growable list of expression-name rows, a display-target selector, a control-scheme selector, and an idle-animation description field
- Right 40%: a live "Plan Completeness" panel listing the five capstone requirements with a checkmark or open circle, updating in real time, plus "Export Plan as Text" and "Clear Worksheet" buttons

Visual elements: an expression list starting with one empty row and an "Add Expression" button, each row holding a name field and a short design-note field; a "Target Display" selector (OLED / Color Round / Both); "Control Scheme" checkboxes (Push Button, Potentiometer, Rotary Encoder); a multi-line "Idle Animation Description" field; the completeness panel's five rows toggling green once each condition is met (for example, "8+ Expressions" checks once eight rows have non-empty names)

Interactive controls:
- "Add Expression" appends a blank row; a small "remove" control on each row deletes it
- Text input on every name and design-note field, the display selector, control-scheme checkboxes, and the idle-animation text area
- "Export Plan as Text" assembles all entered fields into a copyable, formatted plain-text summary suitable for pasting into a documentation file
- "Clear Worksheet" resets all fields after a confirmation prompt

Default parameters: worksheet starts with one blank expression row, no display or control scheme selected, empty idle-animation field; all five completeness rows shown as open circles

Behavior: every keystroke or selection updates the completeness panel immediately; the "8+ Expressions" check turns green only once at least eight rows have non-empty names, while the other checks turn green as soon as their fields are non-empty; "Export Plan as Text" stays enabled at any time but shows a warning if fewer than all five checks are green, so a student can still export an in-progress plan.

Instructional Rationale: A Create-level Model Editor / Synthesis Canvas pattern fits because the objective asks the learner to design and formulate an original plan, not evaluate someone else's — a free-entry worksheet with live completeness feedback lets the learner build the actual capstone plan inside the tool, tied directly to this section's checklist requirements.

Responsive design: the worksheet and completeness panel stack vertically below 700 pixels, with the completeness panel moving above the worksheet so students see the requirements first.

Implementation: p5.js or plain HTML/CSS/JavaScript for the form; expression rows stored as a local array of {name, note} objects; completeness checks are boolean conditions evaluated on every input event; export concatenates current field values into a formatted string.
</details>

## Chapter Summary

Zoom all the way out, and this is the arc the whole book just walked you through: hardware and history, MicroPython fundamentals and coordinate systems, drawing primitives that grew into ellipses and polygons, a parameterized face brought to life with emotion theory, animation, and physical controls, a port to a second display, and now — a project entirely your own.

- Computational Thinking names the abstraction, decomposition, modularity, pattern recognition, algorithm design, and code reuse habits you have practiced since Chapter 9's first `face_state` dictionary — not a new topic, a new label.
- Abstraction reduced a feeling to a handful of numbers; Decomposition split a face into eyes, eyebrows, and a mouth; Modularity turned every expression into one `draw_face()` function; Pattern Recognition made thirteen expressions possible from that one function; Algorithm Design shaped the timing loops and state machines in Chapters 12–14; Code Reuse is why your capstone starts from working code, not a blank file.
- Constraint-Driven Design treats display resolution, RP2040 memory, and a tight budget as normal engineering conditions; a Minimum Viable Feature Set gives you a realistic starting target before stretch goals.
- Expressiveness Versus Complexity is a tension you'll manage all project; Expression Set Planning — sketching expressions and parameters on paper first — is how you catch problems before they cost coding time.
- Turtle Graphics Prototypes and a Software Display Emulator speed up early iteration before real hardware; the Iterative Design Process — build rough, test, refine, repeat — is the same process this book used on you, chapter by chapter.
- Design Trade-Off Analysis, Peer Design Review, and Rubric-Based Assessment extend Chapter 11's rubric to a whole project; Design Critique is the skill of giving and receiving that feedback well.
- Design Justification means explaining specifically why, not just what, you chose; Project Documentation preserves those justifications past your live Capstone Demonstration.
- An Original Robot Personality is inspired by Cozmo, Vector, Miko, and Buddy without copying any of them, and the Capstone Project asks for at least eight expressions, an idle animation, physical control input, one working display, and a live demonstration of your design choices.

!!! mascot-celebration "Every Pixel Really Did Tell a Story"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Think back to Chapter 1, when a single lit pixel on a bare OLED felt like a small victory. Since then you've wired real hardware, drawn eyes and eyebrows and mouths from nothing but ellipses and polygons, taught a face to blink and change its mind on a button press, judged your own designs against a real rubric, and ported a whole personality across two displays. Now you're about to design one that's entirely yours. Communicating feelings between robots and people is a robot designer's superpower, and after everything you've built across this book, it is genuinely, provably yours — go build a face that makes someone smile back at it. Every pixel tells a story!

??? question "Self-Check: Name three computational-thinking skills used in this book, and for each one, name the specific earlier chapter or code example where you first used it — then explain in one sentence how your capstone project will reuse that same skill. — Click to reveal"
    Sample answer: (1) Abstraction — first used in Chapter 9's `face_state` dictionary; my capstone reuses this by describing each original expression as its own small dictionary of the same parameters instead of inventing new drawing code per expression. (2) Modularity — first used in Chapter 9's single `draw_face(fb, state)` function; my capstone reuses that exact function, unmodified, to render every original expression. (3) Algorithm Design — first used in Chapter 12's blink timing loop built on `ticks_ms()`; my capstone reuses that same timing pattern for its idle animation, just with different hold and transition durations. Any three of Abstraction, Decomposition, Modularity, Pattern Recognition, Algorithm Design, or Code Reuse, paired with a correct chapter reference and a plausible capstone connection, count as a correct answer.

[See Annotated References](./references.md)
