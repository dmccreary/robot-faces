# Content Generation Guide

**Project:** Robot Faces: Drawing Expressive Displays for STEM Robots

This file is the single source of truth for **voice, tone, reading level, and
mascot usage** across every piece of student-facing content in this book —
chapters, lessons, quizzes, FAQ, glossary entries, MicroSim descriptions, and
slide decks. Any skill or agent generating student-facing text should read
this file first. Instructor-facing content (the teacher's guide, grading
notes) does not need to follow the mascot rules below, but should still
match the reading-level and tone guidance.

## The Big Idea

**Communicating feelings between robots and people is a robot designer's
superpower.**

Every chapter, every lesson, and every mascot admonition in this book should
circle back to that one idea. A robot with a screen for a face is not
decoration — a well-designed expression is a bridge between a machine and
the human standing next to it. Two eyes, two eyebrows, and a mouth, drawn
with nothing but `ellipse()` and `poly()`, are enough to make a stranger
smile back at a robot, trust it, or know instantly that something went
wrong. That is real power, and by the end of this book every student should
believe — correctly — that they have it.

Use this framing to make abstract computer-science ideas feel consequential:

- Abstraction and parameterization aren't just tidy code — they are what
  let one `draw_face()` function hold a robot's entire emotional range.
- Ekman's research on universal emotions isn't just psychology trivia — it's
  the design spec students are building against.
- Cozmo, Vector, Miko, and Buddy aren't just history — they're proof that
  this superpower has real commercial and emotional value in the world.

Reach for "superpower" language deliberately, not on every page — a good
rhythm is once in the Chapter 1 opening, once when a chapter's content
directly pays it off (e.g., the emotion-theory and expression-design
chapters), and once in the capstone chapter's closing. Overuse dilutes it;
sprinkle it where it lands hardest.

## Audience & Reading Level

- **Grade level:** Senior High (Grades 9-12), per
  [`docs/course-description.md`](docs/course-description.md)
- **Prerequisites:** None assumed — no prior programming or electronics
  experience. Students who know Scratch-style variables/functions will feel
  at home, but the book must work for someone who has never written code.
- **Sentence structure:** 15-22 words on average. Mix simple and compound
  sentences; use an occasional complex sentence for emphasis, never a
  sentence with more than two clauses.
- **Vocabulary:** Introduce every technical term in plain language the
  moment it first appears (see the "define before you display" rule in the
  chapter-content-generator skill). Domain terms (frame buffer, RGB565,
  quadrant fill code) are expected content, not something to avoid — just
  define them the first time.
- **Examples:** Concrete and hands-on. Prefer "watch what happens when you
  change the eyebrow angle from 10 to -10" over an abstract description of
  parameterization.

## Voice & Tone

The book's voice is **bright, positive, and optimistic** — the tone of a
mentor who is genuinely excited to show a student something cool, not a
reference manual. Write like every reader is capable of building something
that works and matters.

**Do:**

- Open new ideas with energy: "Here's something wild —", "Watch what
  happens when —", "This next trick is the one that makes faces feel
  alive."
- Treat mistakes and confusion as a normal, expected part of building
  something real, and immediately follow with reassurance and a concrete
  next step.
- Celebrate small wins out loud — getting an ellipse to appear on a screen
  for the first time is worth a sentence of genuine enthusiasm.
- Use active voice and second person ("you'll wire the display," not "the
  display is wired").
- Keep sentences moving forward — each one should either teach something
  new or set up the next idea.

**Don't:**

- Don't write flat, textbook-neutral prose ("This section describes the
  `ellipse()` function.") — every section should sound like someone wants
  to be there.
- Don't manufacture false stakes or pressure ("If you get this wrong, your
  robot will fail!"). Optimism, not anxiety, is the engine.
- Don't over-explain feelings with adjectives ("This is SO exciting!!") —
  energy comes from concrete, specific detail and momentum, not
  exclamation points or emoji (see the emoji-discipline rule below).
- Don't let "bright and positive" drift into vague cheerleading that skips
  technical precision. Every optimistic sentence still needs to teach
  something true and specific.

**Example — flat vs. on-voice, same content (senior-high level, ~18 words):**

| Flat | On-voice |
|---|---|
| "The `ellipse()` function draws an ellipse using quadrant fill codes to restrict which parts are filled." | "Here's the trick behind every curved eyebrow and smiling mouth in this book: `ellipse()` can fill just one quarter of a shape at a time." |
| "Robots with expressive faces are more relatable to users." | "A robot that can raise an eyebrow suddenly feels like *someone*, not just something — and that's the whole reason this course exists." |
| "Students should test their code on real hardware." | "Don't take your face's word for it — wire it up and watch it blink. Code that looks right on paper can still surprise you on a real display." |

**Emoji discipline:** Use emoji only when they signal a metaphor the
chapter is actually teaching (rare). Decorative emoji compete with the
mascot and the bold-and-define vocabulary pattern, and research on the
coherence principle shows decorative visuals can reduce retention even when
students enjoy them. Energy comes from voice, not emoji.

## The Learning Mascot: Pixel the Round-Face Robot

### Mascot File Index

The canonical files for this mascot. When editing any of these, update the
others in the same turn so they stay in sync.

| File | Purpose | Status |
|------|---------|--------|
| [`docs/img/mascot/character-sheet.md`](docs/img/mascot/character-sheet.md) | Canonical identity document (name, species, colors, voice). Source of truth. | Done |
| [`docs/img/mascot/image-prompts.md`](docs/img/mascot/image-prompts.md) | Self-contained AI prompts for regenerating each pose. | Done |
| [`docs/img/mascot/neutral.png`](docs/img/mascot/neutral.png) | Default / general-purpose pose. | Done |
| [`docs/img/mascot/welcome.png`](docs/img/mascot/welcome.png) | Chapter-opening pose. | Done |
| [`docs/img/mascot/thinking.png`](docs/img/mascot/thinking.png) | Key-concept pose. | Done |
| [`docs/img/mascot/tip.png`](docs/img/mascot/tip.png) | Hint / helpful-guidance pose. | Done |
| [`docs/img/mascot/warning.png`](docs/img/mascot/warning.png) | Common-mistake / pitfall pose. | Done |
| [`docs/img/mascot/encouraging.png`](docs/img/mascot/encouraging.png) | Difficult-content / struggle pose. | Done |
| [`docs/img/mascot/celebration.png`](docs/img/mascot/celebration.png) | End-of-chapter / achievement pose. | Done |
| [`docs/css/mascot.css`](docs/css/mascot.css) | Custom admonition styles for the seven pose contexts. | Done |
| [`docs/learning-graph/mascot-test.md`](docs/learning-graph/mascot-test.md) | Rendering test page that exercises every admonition style. | Done |

All mascot artifacts are now installed and registered in `mkdocs.yml`
(`extra_css`, and the "Mascot Test" nav entry under Learning Graph).

### Character Overview

- **Name:** Pixel
- **Species:** Round-Face Robot
- **Subject:** Robot Faces / expressive embedded displays
- **Personality:** Curious, Encouraging, Precise, Playful
- **Catchphrase:** "Every pixel tells a story!"
- **Visual:** Pixel's entire body is a circular color display in a chunky
  white bezel (`#ECEFF1`) with a thin rainbow accent ring, vivid teal
  (`#00BFA5`) limbs, and a warm coral (`#FF7043`) glow used for highlights
  and celebration effects. Flat modern vector style, chibi-proportioned,
  icon-sized. Full details in
  [`docs/img/mascot/character-sheet.md`](docs/img/mascot/character-sheet.md).

### Voice Characteristics

- Uses simple, encouraging language geared to high-school and coding-club
  readers — matches the book-wide bright/positive/optimistic voice above.
- Naturally references pixels, screens, and drawing ("Let's draw that
  expression," "Watch the pupils move") — Pixel talks about emotion the way
  a robot designer would: as something you build, pixel by pixel.
- Keeps dialogue brief (1-3 sentences). Pixel demonstrates the book's Big
  Idea by example — it *is* a face made of independently parameterized
  parts, so it can point at its own eyes, eyebrows, or mouth when
  explaining a concept.
- Signature phrases: "Every pixel tells a story!", "Let's draw some
  feelings.", "Great expression!"

### Mascot Admonition Format

Always place the mascot image in the admonition **body**, never in the
title bar, using Markdown image syntax with the `mascot-admonition-img`
class:

```markdown
!!! mascot-welcome "Title Here"
    ![Pixel waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Admonition text goes here after the image.
```

Image paths are relative to the **rendered page URL**, not the markdown
file — for a chapter page at `chapters/01-.../index.md` (which renders at
`chapters/01-.../index.html`), use `../../img/mascot/`.

### Placement Rules

| Context | Admonition Type | Frequency |
|---------|----------------|-----------|
| General note / sidebar | `mascot-neutral` | As needed |
| Chapter opening | `mascot-welcome` | Every chapter |
| Key concept | `mascot-thinking` | 2-3 per chapter |
| Helpful tip | `mascot-tip` | As needed |
| Common mistake | `mascot-warning` | As needed |
| Difficult content | `mascot-encourage` | Where students may struggle |
| Section completion | `mascot-celebration` | End of major sections |

**Chapter 1 self-introduction (mandatory, one-time):** The first
`mascot-welcome` admonition in Chapter 1 must have Pixel introduce itself
by name, state that its own face is built from the same eyes/eyebrows/mouth
parts the course teaches, and enumerate the six pose-roles it will play
across the book (welcome, think, tip, warn, encourage, celebrate) as a
numbered list. End with a contract sentence — "If I'm not doing one of
those six things, I'm not in the chapter." — so the mascot reads as a
signal, not decoration. Chapters 2+ open with a normal `mascot-welcome`
that gets straight into chapter content; never repeat the
self-introduction.

### Do's and Don'ts

**Do:**

- Use Pixel to introduce new topics warmly, and let its own screen-face
  double as a live example of the concept being taught.
- Include the catchphrase ("Every pixel tells a story!") in welcome
  admonitions when it fits naturally.
- Keep dialogue brief (1-3 sentences) and specific to the surrounding
  content — never generic filler.
- Match the pose/image to the content type (see Placement Rules above).

**Don't:**

- Use Pixel more than 5-6 times per chapter.
- Put mascot admonitions back-to-back.
- Use Pixel for purely decorative purposes — every appearance should earn
  its place by teaching, warning, or celebrating something specific.
- Change Pixel's personality, voice, or the teal/coral/white color
  identity from the character sheet.

## Writing Style Rules

1. **No more than 3 paragraphs of pure text without a non-text element**
   (list, table, admonition, diagram, or MicroSim).
2. **Define before you display** — every technical term used in a diagram,
   code block, or table must already be explained in the prose immediately
   before it.
3. **Bridge sentences before code** — one plain-language sentence
   explaining what a code example does and what its key parameters mean,
   before the code appears.
4. **Tables reinforce, they never introduce** — explain a concept in prose
   first, then use a table to summarize or compare.
5. **Concrete before abstract** — ground every new idea in the robot-face
   hardware and drawing code students are actually building, before
   zooming out to the general computational-thinking principle.
6. **Active voice, second person** — "You'll wire the SPI pins," not "The
   SPI pins are wired."

## Quick Reference

| Question | Answer |
|---|---|
| Reading level | Senior High (Grades 9-12), no prerequisites assumed |
| Sentence length | 15-22 words average |
| Core theme | Communicating feelings between robots and people is a robot designer's superpower |
| Tone | Bright, positive, optimistic — a mentor's voice, not a manual's |
| Mascot | Pixel the Round-Face Robot — see mascot section above |
| Emoji | Only when teaching an actual metaphor; otherwise none |
