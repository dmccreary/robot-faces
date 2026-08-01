---
title: Quiz Generation Quality Report
description: Quality metrics and coverage summary for the chapter quizzes generated for the Robot Faces textbook.
---

# Quiz Generation Quality Report

Generated: 2026-07-31
Execution Mode: Serial (1 agent)
Wall-clock Time: approximately 16 minutes

## Overall Statistics

- **Total Chapters:** 16
- **Total Questions:** 160
- **Avg Questions per Chapter:** 10
- **Overall Quality Score:** 86/100

## Per-Chapter Summary

| Chapter | Questions | Answer Balance (A/B/C/D) | Chapter Type |
|---|---|---|---|
| 1. Hardware & Electronics Foundations | 10 | 2/3/3/2 | Introductory |
| 2. A History of Screen-Based Robot Faces | 10 | 3/2/2/3 | Introductory |
| 3. MicroPython Fundamentals I | 10 | 2/3/3/2 | Introductory |
| 4. MicroPython Fundamentals II | 10 | 3/2/3/2 | Intermediate |
| 5. Display & Coordinate Systems | 10 | 2/3/2/3 | Intermediate |
| 6. Basic Drawing Primitives | 10 | 2/2/3/3 | Intermediate |
| 7. Ellipse & Polygon Drawing | 10 | 3/2/3/2 | Intermediate |
| 8. FrameBuf Version History | 10 | 3/3/2/2 | Intermediate |
| 9. Facial Anatomy & Layout Design | 10 | 2/2/3/3 | Intermediate |
| 10. Emotion Theory & Core Expressions | 10 | 2/3/2/3 | Intermediate |
| 11. Expression Design, Readability & HRI | 10 | 3/2/3/2 | Intermediate |
| 12. Animating Expressions | 10 | 2/3/3/2 | Intermediate |
| 13. Interactive Controls | 10 | 3/2/3/2 | Intermediate |
| 14. Expression Menu & Live Controls | 10 | 3/2/3/2 | Intermediate |
| 15. Porting Faces to a Color Display | 10 | 3/2/3/2 | Advanced |
| 16. Computational Thinking & Capstone | 10 | 3/2/3/2 | Advanced |

## Bloom's Taxonomy Distribution (Target vs. Design Intent)

Questions were written against per-chapter Bloom's targets rather than tagged
individually in the output files. Chapters 1–3 (introductory) were weighted
toward Remember/Understand with light Apply; Chapters 4–14 (intermediate)
balanced Understand/Apply with a meaningful share of Analyze, including
scenario-style stems ("A student wants...", "Given a raw ADC reading...");
Chapters 15–16 (advanced) leaned into Analyze and Evaluate-style justification
questions (e.g., weighing the color-vs-mono trade-off, judging a design
justification). This matches the skill's target distribution tables reasonably
well; no per-question Bloom tag is stored in the quiz files themselves.

## Answer Balance (Overall)

- A: 41 of 160 (25.6%)
- B: 38 of 160 (23.75%)
- C: 44 of 160 (27.5%)
- D: 37 of 160 (23.1%)

**Answer Balance Score:** 15/15 (all four options fall within the 20–30% target band; two chapters — 15 and 16 — were rebalanced after an initial draft skewed toward B/C with zero D answers)

## Concept Coverage

Every question is tagged with a **Concept Tested** line drawn directly from
that chapter's "Concepts Covered" list in `index.md`. Across 16 chapters
covering roughly 280 total learning-graph concepts, 160 questions were
written, prioritizing high-centrality concepts (those introduced in a
chapter's own section headers, given worked code examples, or reinforced in
the chapter summary) over peripheral, briefly-mentioned ones. Coverage is
therefore concentrated on Priority 1 concepts per chapter rather than
attempting one question per listed concept.

## Link Validation

Every `**See:**` link in every quiz points to `index.md` or `index.md#anchor`
within the same chapter directory. All anchors were programmatically checked
against the actual Markdown headings in each chapter's `index.md` (slugified
the same way MkDocs Material generates heading IDs) — **all 160 links
resolved successfully**, with no broken or guessed anchors.

## Quality Validation Checklist

- [x] 10 questions per chapter (160 total)
- [x] Every question uses the `#### N.` header + `<div class="upper-alpha" markdown>` + `??? question "Show Answer"` format
- [x] No "All of the above" / "None of the above" options anywhere
- [x] No duplicate or near-duplicate questions within or across chapters
- [x] Every question has a 50–100 word explanation naming why the correct answer is right and, where useful, why a specific distractor is wrong
- [x] Every question has a **Concept Tested** label matching the chapter's concept list
- [x] Every question has a **See:** link verified against real headings
- [x] Answer balance within 20–30% per option, overall and per chapter
- [x] `md_in_html` extension already enabled in `mkdocs.yml`, so `upper-alpha` styling renders correctly
- [x] No cultural, gender, or background-assumption bias identified in question language

## Recommendations

- The glossary (`docs/glossary.md`) currently has only 3 stub entries (Blit,
  Ellipse, RP2040). Definition-style quiz questions were instead grounded in
  each chapter's own inline definitions rather than the glossary. Expanding
  the glossary would let a future revision cross-link quiz explanations to
  glossary entries as well as chapter sections.
- Consider generating a `quiz-bank.json` aggregate and per-chapter metadata
  JSON files (Step 10/11 of the skill) if this quiz set will be exported to
  an LMS or used for spaced-repetition practice later — these were not
  generated in this pass since the immediate goal was chapter-embedded
  review quizzes.
- Chapters 15 and 16 needed a manual rebalancing pass after initial drafting
  produced skewed answer-letter distributions (5–6 correct answers landing on
  B or C, zero on D). Future generation passes should check running
  answer-letter tallies chapter-by-chapter rather than only at the end.
