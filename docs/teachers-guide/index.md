---
title: Teachers Guide
description: A complete guide for teachers using Robot Faces in the classroom — how to use the chapters, lessons, MicroSims, quizzes, and hardware kit, plus how to customize and deploy your own version of the book.
---

# Robot Faces Teachers Guide

Welcome to the teacher's guide for *Robot Faces: Drawing Expressive Displays for STEM Robots*. This guide explains every feature of the textbook, how to use it in your classroom, what hardware you'll need, and how to customize the site for your own students. No prior technical knowledge is assumed — every technical term is defined before it is used.

## About This Interactive Intelligent Textbook

### What is an Intelligent Textbook?

An **intelligent textbook** is a digital textbook that goes beyond static text and images. It includes interactive simulations, self-grading quizzes, a searchable glossary, and a structured map of how concepts relate to each other. The goal is to give students a richer, more engaging learning experience than a traditional printed textbook.

### The Five Levels of Intelligent Textbooks

Not all digital textbooks are created equal. We categorize intelligent textbooks into five levels based on how interactive and adaptive they are:

<iframe src="https://dmccreary.github.io/intelligent-textbooks/sims/book-levels/main.html" width="100%" height="500px" scrolling="no"></iframe>

| Level | Name | Description | Example Features |
|-------|------|-------------|-----------------|
| **Level 1** | Static Digital | A PDF or basic web version of a print textbook | Text and images only, no interactivity |
| **Level 2** | Interactive | Adds interactive elements like simulations, quizzes, and searchable glossaries | MicroSims, self-check quizzes, concept search |
| **Level 3** | Adaptive | Adjusts content based on student performance | Personalized learning paths, difficulty adjustment |
| **Level 4** | AI-Assisted | Includes an AI tutor that can answer student questions | Chatbot integration, automated feedback |
| **Level 5** | Fully Adaptive AI | Continuously learns from student interactions and optimizes the experience | Real-time content generation, predictive analytics |

**Robot Faces is a Level 2 Intelligent Textbook.** It also has a dimension most Level 2 textbooks don't: a physical hardware lab kit. Every chapter is written to be worked through on real hardware — a Raspberry Pi Pico wired to an OLED or color display — so the "interactivity" isn't limited to the browser. Plan for both screen time and workbench time when you schedule this course.

### What Makes This Textbook Different

- **Interactive MicroSims** let students manipulate models directly in their browser — no software installation required, and no hardware required to explore the underlying concepts before wiring anything up
- **A real hardware kit** — every student can wire and program their own $30 robot face on a breadboard; see [Hardware & Software Requirements](#hardware-software-requirements) below
- **Critical thinking emphasis** — every chapter pushes students to evaluate whether a design choice actually communicates the intended emotion, using evidence-based criteria (Ekman's emotion categories, minimal-feature research, readability at classroom viewing distance) instead of guesswork
- **The "robot design superpower" framing** — the book's throughline is that communicating feelings between robots and people is a robot designer's superpower, which keeps abstraction, decomposition, and modularity feeling consequential rather than academic
- **Learning graph** — a visual map showing how all 293 concepts connect and build on each other
- **Pixel the mascot** — a friendly pedagogical agent who guides students through each chapter with tips, encouragement, and key insights
- **Completely free and open source** — licensed under Creative Commons for non-commercial use

## Hardware & Software Requirements

Unlike a purely digital course, Robot Faces asks every student to build something. Before you teach it, plan for:

**Per-student (or per-pair) hardware kit — about $30:**

- A Raspberry Pi Pico (RP2040 microcontroller)
- A mini solderless breadboard
- A 128x64 monochrome OLED display (SSD1306, SPI) for Chapters 1–14
- Optional: a 240x240 color round display (GC9A01, SPI) for Chapter 15's color-porting unit
- M-F jumper wires (20cm or 40cm both work)
- Optional, for Chapter 13: a push button, a potentiometer, and/or a rotary encoder

The full [Parts List](../parts-list.md) page has purchase links and per-part detail, and the [Getting Started](../getting-started.md) page walks through unboxing and first-run steps.

**Software (free, one-time setup):**

- [Thonny](http://thonny.org) — the editor used throughout the book to write and run MicroPython on the Pico. Thonny's Tools → Options → Interpreter menu installs the MicroPython runtime directly onto the board.
- A modern web browser (Chrome, Firefox, Safari, or Edge) for the textbook site and its MicroSims — no browser plugins required.

No prior electronics or programming experience is required of students, and none is required of you to run the course — the [Getting Started](../getting-started.md) page and Chapter 1 cover wiring and the Thonny workflow from scratch.

## Using the Chapters

### Chapter Structure

The textbook contains **16 chapters** organized in a deliberate sequence. Each chapter builds on concepts from previous chapters, so students should work through them in order:

| Chapters | Topic Area |
|----------|-----------|
| 1–2 | Foundations & context — hardware setup, breadboard wiring, and the history of screen-based robot faces (Cozmo, Vector, Miko, Buddy) |
| 3–4 | MicroPython programming fundamentals — variables, functions, loops, and the FrameBuf module |
| 5–8 | Drawing on the display — coordinate systems, basic drawing primitives, ellipses & polygons, and the version history of MicroPython's FrameBuf drawing support |
| 9–11 | Designing facial expressions — facial anatomy & layout, emotion theory (Ekman, FACS, minimal-feature research), and expression readability / human-robot interaction |
| 12–14 | Animation & interaction — timing & motion, buttons/potentiometers/encoders, and building a full expression menu |
| 15 | Porting a face to a 240x240 color round display (RGB565) |
| 16 | Computational thinking & the capstone project |

### What Each Chapter Contains

Every chapter follows a consistent structure:

1. **YAML front matter** — Metadata at the top of each chapter file (title, description, version). Students don't see this; it's used by search engines and the website builder.
2. **Summary** — A brief overview of what the chapter covers and what students will learn.
3. **Concepts covered** — A numbered list of the specific concepts addressed in the chapter, drawn from the learning graph.
4. **Prerequisites** — Links to prior chapters that should be completed first.
5. **A welcome from Pixel** — A mascot admonition that introduces the chapter topic in Pixel's friendly voice.
6. **Main content** — The core instructional material, written at a grades 9–12 reading level. Includes tables, code listings, diagrams, and embedded MicroSims.
7. **Mascot admonitions** — Throughout the chapter, Pixel appears a handful of times to highlight key insights (thinking), offer practical tips (tip), warn about common mistakes (warning), and support students on harder concepts (encourage). Admonitions are never placed back-to-back.
8. **Chapter Summary** — A closing recap of the most important concepts, usually paired with a celebration from Pixel.

### Suggested Classroom Use

- **Before class**: Assign the chapter as reading homework. The MicroSims keep students engaged during independent reading, even before hardware is wired up.
- **During class**: Use the MicroSims on a projector for whole-class demonstrations. Ask students to predict what will happen when you change a slider, then test their predictions — then move to the workbench and confirm it on real hardware.
- **After class**: Assign the chapter's quiz as a formative check, and point students to that chapter's references for anyone who wants to go deeper.
- **Pacing**: Each chapter is designed for approximately 2–3 class periods (90–135 minutes of instruction). Chapters with a hardware milestone (wiring, first display test, the capstone) will run longer — budget extra time the first time you teach it.

## Using the Lessons

In addition to the 16 main chapters, the book includes a **Lessons** section — shorter, standalone walkthroughs of one idea at a time, each with a complete program students can paste directly onto their microcontroller and a picture of what it draws on a real display. The lessons cover the same drawing primitives as the chapters (`pixel()`, `line()`, `rect()`, `ellipse()`, `poly()`, `text()`, `scroll()`, `blit()`) plus applied topics like basic face layouts, the eye-scanner effect, eyebrows, emotion types, and a winking-with-a-smile animation.

Use the lessons when you need a quick, focused reference for a single command during lab time, or as a remedial path for a student who needs one drawing primitive re-explained without re-reading a whole chapter.

## Using the Stories

The **Stories** section holds illustrated case studies about the people, products, and business decisions behind real expressive social robots — starting with "Bright Eyes, Closed Doors," the story of Anki's Cozmo and Vector. These are meant to be read, not quizzed on: they're a good five-minute opener for a class discussion about why a technically impressive robot (with genuinely great expressive eyes) can still fail as a business, and what that means for anyone designing hardware that depends on a company staying in business.

## Using the MicroSims

### What is a MicroSim?

A **MicroSim** (short for "micro-simulation") is a small, interactive simulation that runs directly in a web browser. Students don't need to install any software — MicroSims work on any device with a modern web browser (Chrome, Firefox, Safari, Edge).

Each MicroSim lets students manipulate one or more variables (using sliders, buttons, or drag-and-drop) and immediately see how the model responds. This "learn by doing" approach helps students build intuition for abstract concepts — especially useful here, where several MicroSims (the Coordinate Grid Explorer, the Quadrant Fill Code Explorer, the RGB565 Bit-Packing Visualizer) let students rehearse a drawing concept in the browser before spending scarce hardware time debugging it on a real display.

### How MicroSims Are Embedded

MicroSims appear within chapter text as rectangular interactive areas. They are embedded using **iframes** — a web technology that displays one web page inside another. You don't need to understand how iframes work; just know that the MicroSims load automatically when students view the chapter page.

### Types of MicroSims

The textbook includes **47 MicroSims** built with different visualization technologies:

| Technology | What It's Good For | Example MicroSims |
|-----------|-------------------|-------------------|
| **p5.js** | Interactive animations with sliders and buttons — the majority of the book's MicroSims | Coordinate Grid Explorer, Quadrant Fill Code Explorer, Expression Menu Live Simulator |
| **Chart.js** | Bar and comparison charts | Draw Call Benchmark Chart, Robot Price and Funding Comparison Chart |
| **vis-network** | Network diagrams showing connections between concepts or states | Computational Thinking Concept Map, Mode State Transition Diagram, and the Learning Graph Viewer itself |
| **Static HTML/CSS diagrams** | Timelines and infographic-style comparisons | FrameBuf Version Timeline, Screen-Based Robot Face Timeline |

### Tips for Using MicroSims in Class

1. **Project them on a screen** — MicroSims are designed to be visible on a projector. Have students call out predictions before you move a slider.
2. **Let students explore independently** — After a demonstration, give students 5–10 minutes to experiment on their own devices.
3. **Use the "Reset" button** — Most MicroSims have a reset button. Encourage students to reset and try different scenarios.
4. **Connect to the text and the hardware** — Each MicroSim is placed near the concept it illustrates. After exploring the sim, have students re-read the surrounding text, then reproduce the effect on their own display.
5. **Offline access** — MicroSims require an internet connection unless you have built the site locally (see "Customizing Your Own Textbook" below).

!!! mascot-tip "Pixel's Tip: Embed MicroSims Anywhere!"
    ![Pixel shares a tip](../img/mascot/tip.png){ class="mascot-admonition-img" }
    You can add any MicroSim to **any web page** — a Google Site, a
    WordPress blog, an LMS like Canvas or Schoology, or even a plain
    HTML file. Just paste a single line of HTML:

    ```html
    <iframe src="https://dmccreary.github.io/robot-faces/sims/YOUR-MICROSIM-NAME/main.html"
        width="100%" height="450px"
        scrolling="no">
    </iframe>
    ```

    Replace `YOUR-MICROSIM-NAME` with the name of any MicroSim from
    the [MicroSims list](../sims/index.md). That's it — one line of
    code and your students have an interactive simulation on any page
    you control.

### MicroSim Specifications

Within each chapter, you'll find a collapsible **details** section below each MicroSim labeled with its name. Click to expand and see the full specification including:

- **Bloom's Taxonomy level** — What cognitive level the MicroSim targets (Remember, Understand, Apply, Analyze, Evaluate, Create)
- **Learning objective** — What students should be able to do after using the MicroSim
- **Interactive controls** — What sliders, buttons, and inputs are available
- **Default parameters** — The starting values when the MicroSim loads

These specifications are useful for lesson planning and for understanding the pedagogical intent behind each simulation.

## Using the Glossary

### What is the Glossary?

The **glossary** is an alphabetical list of key terms used in the textbook, each with a precise, concise definition. It serves as a quick-reference dictionary for students encountering unfamiliar vocabulary.

### How to Access the Glossary

- Click **"Glossary"** in the left navigation sidebar from any page
- Use the browser's built-in search (Ctrl+F on Windows/Linux, Cmd+F on Mac) to find a specific term on the glossary page
- Use the site-wide **search bar** at the top of any page to search for a term across the entire textbook

### Tips for Using the Glossary in Class

- **Vocabulary preview** — Before starting a new chapter, have students look up the key terms in the glossary to build familiarity.
- **Definition matching** — Create a warm-up activity where students match glossary definitions to terms from the current chapter.
- **Student-generated definitions** — After reading a chapter, have students write their own definitions, then compare with the glossary.

## Using the Quizzes

### What Are the Quizzes?

Each of the 16 chapters has an accompanying **quiz page** with 10 multiple-choice questions (160 total) designed for self-assessment. Quizzes test understanding of the concepts covered in that chapter and are aligned to specific items from the learning graph.

### How Quizzes Work

- Quizzes are accessed by clicking the **"Quiz"** link under each chapter in the left navigation
- Questions are presented as expandable sections — students can click to reveal the answer and explanation after attempting the question
- Each answer explanation links back to the exact section of the chapter that covers it
- Quizzes are **not graded automatically** — they are designed as formative self-check tools, not summative assessments

### Tips for Using Quizzes in Class

- **Exit tickets** — Have students complete the quiz at the end of a class period as a quick check for understanding.
- **Post-reading review** — Use the quiz after reading to identify concepts that need re-teaching.
- **Collaborative quiz** — Have students work in pairs to discuss each question before revealing the answer.
- **Custom assessments** — Use the quiz questions as a bank to create your own tests. The questions are openly licensed (see "Understanding the License" below).

### Bloom's Taxonomy Levels

Each chapter's quiz was written against a per-chapter Bloom's Taxonomy target rather than a per-question tag stored in the quiz page itself:

| Level | Name | What It Means | Example Verb |
|-------|------|--------------|-------------|
| L1 | Remember | Recall facts and definitions | Define, list, name |
| L2 | Understand | Explain concepts in your own words | Explain, describe, compare |
| L3 | Apply | Use concepts to solve problems | Calculate, demonstrate, solve |
| L4 | Analyze | Break down and examine relationships | Differentiate, organize, compare |
| L5 | Evaluate | Make judgments based on criteria | Assess, argue, justify |
| L6 | Create | Produce original work or solutions | Design, construct, propose |

Chapters 1–3 weight toward Remember/Understand with light Apply; Chapters 4–14 balance Understand/Apply with a meaningful share of Analyze, including scenario-style questions ("A student wants…", "Given a raw ADC reading…"); Chapters 15–16 lean into Analyze and Evaluate-style justification questions (weighing the color-vs-mono trade-off, judging a design justification). The full per-chapter breakdown is in the [Quiz Generation Report](../learning-graph/quiz-generation-report.md) under Learning Graph.

## Using the References

### What Are the References?

Each chapter has an accompanying **references page** with a curated list of high-quality sources that students can use for further reading. References prioritize Wikipedia articles for accessibility and reliability, supplemented by authoritative books and research papers.

### How References Are Organized

Each reference includes:

- **Title** — The name of the source
- **URL** — A clickable link to the source
- **Relevance** — A brief description of why this source is useful and how it connects to the chapter content

### A Note About Link Rot

**Link rot** is when a web link (URL) stops working because the page has been moved, renamed, or deleted. This is a common problem with any resource that links to external websites. While we prioritize Wikipedia (which has very stable URLs), some links may become outdated over time.

If you or your students encounter a broken link:

1. Try searching for the article title on the source website
2. Use the [Wayback Machine](https://web.archive.org/) to find archived versions of the page
3. Report the broken link using GitHub Issues (see "Feedback" below)

## Feedback

### Reporting Issues and Suggestions

This textbook is an open-source project hosted on **GitHub**, a website where software and content projects are developed collaboratively. You don't need to understand programming to report a problem or suggest an improvement.

### What is a GitHub Issue?

A **GitHub Issue** is like a support ticket — it's a way to report a bug, suggest an improvement, or ask a question. Each issue gets a unique number and can be discussed by the project team and community.

### How to Submit Feedback

1. Go to the textbook's GitHub repository: [dmccreary/robot-faces](https://github.com/dmccreary/robot-faces)
2. Click the **"Issues"** tab at the top of the page
3. Click the green **"New issue"** button
4. Give your issue a clear title (e.g., "Broken link in Chapter 5 references" or "Suggestion: Add MicroSim for topic X")
5. In the description, provide as much detail as possible:
    - Which page or chapter has the problem
    - What you expected to see vs. what you actually see
    - Your browser and device (if relevant)
6. Click **"Submit new issue"**

You will need a free GitHub account to submit issues. If you prefer not to create an account, you can email feedback to the author using the contact page.

### Types of Feedback Welcome

- **Typos and errors** — factual mistakes, spelling errors, broken formatting
- **Broken links** — URLs that no longer work
- **MicroSim bugs** — simulations that don't load or behave unexpectedly
- **Content suggestions** — topics that should be covered, examples that could be improved
- **Accessibility issues** — content that is difficult to read or navigate for students with disabilities

## Understanding the License

### What is a Creative Commons License?

A **license** is a legal document that explains what others are allowed to do with a piece of work. A **Creative Commons (CC) license** is a standardized, easy-to-understand license used for educational and creative content. It tells you exactly what permissions you have without needing a lawyer.

### This Textbook's License

This textbook uses the **CC BY-NC-SA 4.0** license. Here's what each part means:

| Code | Full Name | What It Means |
|------|-----------|---------------|
| **CC** | Creative Commons | A standard open license |
| **BY** | Attribution | You must give credit to the original author |
| **NC** | Non-Commercial | You cannot use the material to make money |
| **SA** | Share-Alike | If you modify the material, you must share it under the same license |
| **4.0** | Version 4.0 | The version of the license (the current standard) |

### What You CAN Do

- **Copy** the entire textbook or individual chapters for your students
- **Share** the textbook link with other teachers, students, or parents
- **Print** chapters for classroom use
- **Modify** the content — add your own examples, remove sections, change the order
- **Translate** the content into other languages
- **Create derivative works** — build your own version of the textbook based on this one

### What You CANNOT Do

- **Sell** the textbook or charge students for access
- **Remove attribution** — you must credit the original author (Dan McCreary)
- **Use a different license** — if you modify and share, it must remain CC BY-NC-SA 4.0
- **Claim it as your own work** — the attribution requirement means you must acknowledge the original source

For the full legal text, see the **License** section on the [About This Book](../about.md#license) page.

## Customizing Your Own Textbook

One of the most powerful features of this textbook is that you can create your own customized version. This section explains how, step by step.

### Key Technical Terms

Before we begin, here are some terms you'll need to understand:

- **Repository (repo)** — A folder on GitHub that contains all the files for a project. Think of it as the project's home directory.
- **Git** — A version control tool that tracks changes to files. It lets you see what changed, when, and by whom.
- **Clone** — Making a complete copy of a repository on your own computer.
- **Fork** — Making a complete copy of a repository on your own GitHub account (stays on GitHub, not your computer).
- **MkDocs** — The software that converts the textbook's markdown files into a website. You don't need to learn MkDocs deeply — just enough to make basic changes.
- **Markdown** — A simple text formatting language. If you can write an email, you can write Markdown. `**bold**` makes **bold**, `# Heading` makes a heading, and `-` makes a bullet point.
- **mkdocs.yml** — The main configuration file for the textbook website. It controls the site title, navigation structure, colors, and which features are enabled.

### Step 1: Create a GitHub Account

If you don't already have one, go to [github.com](https://github.com) and create a free account.

### Step 2: Fork or Clone the Repository

**Option A: Fork (easier, stays on GitHub)**

1. Go to [dmccreary/robot-faces](https://github.com/dmccreary/robot-faces)
2. Click the **"Fork"** button in the upper-right corner
3. This creates a copy in your own GitHub account that you can edit

**Option B: Clone (more control, works on your computer)**

1. Install Git on your computer ([git-scm.com](https://git-scm.com/))
2. Open a terminal (Command Prompt on Windows, Terminal on Mac)
3. Run this command:

```bash
git clone https://github.com/dmccreary/robot-faces.git
```

This downloads the entire textbook to your computer.

### Step 3: Make Changes

All content files are in the `docs/` folder. They are written in **Markdown** (`.md` files) — plain text files with simple formatting. You can edit them with any text editor.

#### Changing the Title and Description

Open `mkdocs.yml` and edit these lines:

```yaml
site_name: "Your Custom Textbook Title"
site_description: "Your description here"
site_author: "Your Name"
```

#### Changing the Colors

In `mkdocs.yml`, find the `palette` section. Unlike most MkDocs Material sites, this book uses custom hex colors rather than the built-in named palette:

```yaml
theme:
  palette:
    primary: '#642580'    # custom purple — change to any hex color you like
    accent: '#41BAC1'     # custom teal — change to any hex color you like
```

You can also use one of MkDocs Material's built-in named colors instead of a hex code (red, pink, purple, deep purple, indigo, blue, light blue, cyan, teal, green, light green, lime, yellow, amber, orange, deep orange, brown, grey, blue grey) if you'd rather not pick a custom hex value.

#### Changing the Logo

This book uses Pixel the mascot's `welcome.png` pose as the site logo (`theme.logo: img/mascot/welcome.png` in `mkdocs.yml`). Replace that file with your own logo image, or point `theme.logo` at a different image path — either works, as long as the image is roughly square.

### Step 4: Preview Your Changes Locally

1. Install Python (version 3.8 or newer) from [python.org](https://python.org)
2. Install MkDocs and the Material theme:

```bash
pip install mkdocs mkdocs-material
```

3. Navigate to the project folder and start the preview server:

```bash
cd robot-faces
mkdocs serve
```

4. Open your browser to `http://127.0.0.1:8000/robot-faces/` to see your customized version

The preview server watches for file changes. When you edit and save a Markdown file, the page automatically refreshes in your browser.

### Step 5: Publish Your Version

To publish your customized textbook as a free website using GitHub Pages:

```bash
mkdocs gh-deploy
```

This command builds the website and publishes it to `https://YOUR-USERNAME.github.io/robot-faces/`. The process takes about 1–2 minutes.

## Customizing Your Analytics

### What is Web Analytics?

**Web analytics** is the process of measuring how visitors use a website — which pages they visit, how long they stay, and where they come from. For an educational textbook, analytics can help you understand which chapters students read most, which MicroSims they interact with, and where they might be struggling.

### Google Analytics

This textbook includes **Google Analytics** — a free service from Google that tracks website visits. The author's analytics property is already configured, but if you create your own fork, you'll want to set up your own.

#### Setting Up Your Own Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com/) and sign in with a Google account
2. Create a new **property** (Google's term for a tracked website)
3. Google will give you a **Measurement ID** — a code that looks like `G-XXXXXXXXXX`
4. In your `mkdocs.yml`, update this section:

```yaml
extra:
  analytics:
    provider: google
    property: G-YOUR-MEASUREMENT-ID
```

5. Rebuild and deploy your site. Analytics data will start appearing within 24–48 hours.

#### What You Can Learn from Analytics

- **Which chapters are most/least visited** — helps you identify where students might be skipping content
- **Average time on page** — longer times may indicate engagement or confusion
- **Device breakdown** — what percentage of students use phones vs. computers
- **Geographic distribution** — where your students are accessing from
- **Search terms** — what students search for on your site

### xAPI Monitoring (Advanced)

**xAPI** (Experience API, also called "Tin Can API") is an advanced standard for tracking detailed learning activities — not just page views, but specific interactions like "student moved a slider to position X" or "student answered quiz question 3 correctly."

#### What is an LRS?

An **LRS** (Learning Record Store) is a database that stores xAPI learning records. Think of it as a specialized analytics system designed specifically for education. If you use an LRS, you can track granular student learning data.

#### Important: Regulatory Considerations

Before collecting student-specific learning data, be aware of these regulations:

- **FERPA** (Family Educational Rights and Privacy Act) — U.S. federal law that protects student education records. If you collect data that can identify individual students, you must comply with FERPA.
- **COPPA** (Children's Online Privacy Protection Act) — U.S. federal law that applies to children under 13. If any of your students are under 13, additional restrictions apply.
- **State laws** — Many U.S. states have additional student privacy laws.
- **GDPR** (General Data Protection Regulation) — European Union law that applies if any of your students are in the EU.

**Recommendation**: The Google Analytics setup described above is anonymous by default — it tracks aggregate page views, not individual students. This is the safest approach. If you want individual student tracking via xAPI, consult your school district's data privacy officer before proceeding.

### Building a Student Progress Dashboard with AI

As AI tools become more accessible, it is becoming possible to build custom dashboards that visualize student progress through the textbook. For example:

- Which chapters each student has completed
- Quiz scores over time
- MicroSim engagement levels
- Concepts that need re-teaching based on quiz performance

Building such a dashboard requires programming knowledge (Python, JavaScript) and careful attention to student data privacy. This is an advanced topic beyond the scope of this guide, but the open-source nature of this textbook means all the data structures are available for developers to build upon.

## The Learning Graph

### What is a Learning Graph?

A **learning graph** is a visual map showing how concepts in the textbook depend on each other. It is structured as a **DAG** (Directed Acyclic Graph) — a diagram where arrows show which concepts must be understood before others.

Robot Faces is built on a learning graph of **293 interconnected concepts**. For example, understanding `poly()`'s point-array format requires first understanding the display's coordinate system — the learning graph makes dependency chains like this one visible.

### How Teachers Can Use the Learning Graph

- **Prerequisite checking** — Before teaching a concept, verify that students have covered its prerequisites
- **Remediation** — If a student struggles with a concept, trace back to its prerequisites to find the gap
- **Curriculum mapping** — Compare the learning graph to your existing syllabus to identify coverage gaps
- **Enrichment** — Advanced students can explore concepts ahead of the current chapter by following the graph forward

The interactive Learning Graph Viewer, concept list, taxonomy breakdown, and quality metrics are all available in the "Learning Graph" section of the left navigation.

## Pixel: Your Pedagogical Agent

### What is a Pedagogical Agent?

A **pedagogical agent** is a character that appears throughout a textbook to guide students. Research shows that pedagogical agents improve student engagement and perception of learning — a phenomenon called the **persona effect**.

### How Pixel Appears

Pixel — a round-face robot whose entire body is a circular display, matching the hardware students are building — appears as colored callout boxes (called **admonitions**) throughout each chapter. There are several types:

| Type | Purpose | Frequency |
|------|---------|-----------|
| Welcome | Introduces the chapter | Every chapter opening |
| Thinking | Highlights key insights | 1–2 per chapter |
| Tip | Shares practical advice | As needed |
| Warning | Alerts to common mistakes | As needed |
| Encouraging | Supports on harder concepts | Where students may struggle |
| Celebration | Celebrates progress | Every chapter ending |

Pixel appears no more than 5–6 times per chapter to avoid overuse, and mascot admonitions are never placed back-to-back. Pixel's catchphrase, "Every pixel tells a story!", ties back to the book's core theme: every drawing choice a student makes is a small piece of a larger, meaningful story about how a robot feels.

### Tips for Teachers

- **Read Pixel's tips aloud** — They're written in a conversational tone that works well when spoken
- **Use as discussion prompts** — Pixel's "thinking" admonitions highlight the most important insights in each chapter
- **Encourage struggling students** — Point students to Pixel's "encouraging" admonitions when they're frustrated with a concept, especially during the hardware-wiring chapters where frustration is most common
