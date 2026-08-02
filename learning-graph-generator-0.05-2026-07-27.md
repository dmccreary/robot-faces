# Session Log: Learning Graph Generator

- **Skill:** learning-graph-generator
- **Skill version:** 0.05
- **Date:** 2026-07-27
- **Textbook:** Robot Faces: Drawing Expressive Displays for STEM Robots
- **Repository:** robot-faces (docs/ MkDocs Material site)

## Scope

Ran Steps 2 through 13 of the skill. Step 0 (setup) and Step 1 (course-description quality
assessment) had already been completed in an earlier session:

- `docs/course-description.md` frontmatter reported `quality_score: 98`, above the skill's 85
  threshold, so Step 1 was confirmed and skipped per the skill's own instructions (to save tokens).
- `docs/learning-graph/course-description-assessment.md` already existed with a matching 97/100
  independent assessment.

## Deviation from skill defaults (user-directed)

The user explicitly overrode the skill's default ~200-concept guidance ("up to 500 for complex
technical books, with approval"): *"use as many concepts as you feel are needed. Do not use a
200-concept limit."* The final concept count (293) was driven by the genuine granularity of the
course description's 13 main topics and six-level Bloom's outcomes, not by a target number, and no
trivial/duplicate concepts were added to inflate the count.

## Python programs copied into docs/learning-graph/ and versions used

| Program | Version | Used for |
|---|---|---|
| `add-taxonomy.py` | unversioned (no `VERSION` constant in file; header dated Nov 2, 2025) | Step 6 — added `TaxonomyID` column via range-based `taxonomy-config.json` |
| `analyze-graph.py` | unversioned (no `VERSION` constant in file; header dated Mar 16, 2025) | Step 4 — DAG validation and quality metrics |
| `csv-to-json.py` | **0.04** (`VERSION` constant in file) | Step 9 — CSV to `learning-graph.json` conversion |
| `taxonomy-distribution.py` | unversioned (no `VERSION` constant in file; header dated Feb 9, 2025) | Step 10 — taxonomy distribution report |
| `validate-learning-graph.py` / `validate-learning-graph.sh` | unversioned | Step 9 — schema validation |

## Step-by-step summary

- **Step 2 — Concept Labels:** Generated 293 concepts across 13 pedagogically ordered categories
  (see `concept-list.md`). All labels verified programmatically: unique, Title Case, ≤32 characters,
  entity names (no questions). Five initial labels exceeded 32 characters and were shortened
  (`Minimal Feature Robot Research`, `Cross-Cultural Recognition`, `Encoder Direction Detection`,
  `Color Versus Mono Trade-Off`, `Color Display Init Sequence`). Explicitly verified the required
  named concepts: **Anki Cozmo** (28), **Anki Vector** (29), **Emotix Miko** (30), **Blue Frog
  Robotics Buddy** (31), and the FrameBuf history milestones **FrameBuf Module** (74), **Blit
  Cross-Format Support V1.17** (136), **Ellipse Method** (120), **Poly Method** (124), **Ellipse
  Poly Dev Branch Merge** (138), and **MicroPython V1.20.0 Release** (140).
- **Step 3 — Dependency Graph:** Authored `learning-graph.csv` with hand-designed prerequisite
  edges (509 total) built via a scratch Python script for consistency. First pass produced 2
  orphaned nodes (I2C Interface, Indentation Rules) and a disconnected 4-node rotary-encoder
  cluster; fixed by adding I2C as an alternate SSD1306 wiring dependency, wiring Indentation Rules
  into Conditional Statement, and cross-linking the rotary-encoder cluster into Live Parameter
  Tuning.
- **Step 4 — Quality Validation:** Ran `analyze-graph.py`, producing `quality-metrics.md`. Final
  state: valid DAG, 0 cycles, 0 self-dependencies, 0 orphaned nodes, 1 connected component, 14
  foundational concepts, 101 terminal nodes (34.5%), average outdegree 1.82, longest chain 27 hops.
  **Overall quality score: 93/100.**
- **Step 5 / 5b — Taxonomy:** Defined 13 categories (`concept-taxonomy.md`) and
  `taxonomy-names.json`. Largest category 11.3% (Emotion Psychology & Expression Design), smallest
  4.1% (MicroPython FrameBuf Version History) — no category near the 30% cap.
- **Step 6 — Taxonomy in CSV:** Ran `add-taxonomy.py` with a range-based `taxonomy-config.json`
  (each category's ID range maps 1:1 to a contiguous block of the concept list). No concept fell
  back to `MISC`.
- **Steps 7-9 — JSON generation:** Wrote `metadata.json` and `color-config.json` (13 named CSS
  colors from the skill's recommended palette, no reuse), then ran `csv-to-json.py` to produce
  `learning-graph.json` (293 nodes, 509 edges, 13 groups, 14 foundational IDs, no missing
  classifier-name warnings). Validated with `validate-learning-graph.sh` against
  `learning-graph-schema.json` — passed with 0 orphaned nodes reported by the validator.
- **Step 10 — Taxonomy Distribution:** Ran `taxonomy-distribution.py`, producing
  `taxonomy-distribution.md`. Spread across categories: 7.2 percentage points (rated "Excellent
  balance" by the script itself); no `MISC` concepts.
- **Step 11 — Index page:** Created `index.md` from `index-template.md`, substituting the textbook
  name "Robot Faces" and updating the summary numbers (293 concepts, 14 foundational, 13
  categories, no MISC needed).
- **Step 12 — This session log.**

## Files created in docs/learning-graph/

- `concept-list.md`
- `learning-graph.csv`
- `taxonomy-config.json` (range-based input to `add-taxonomy.py`)
- `taxonomy-names.json`
- `metadata.json`
- `color-config.json`
- `learning-graph.json`
- `concept-taxonomy.md`
- `quality-metrics.md`
- `taxonomy-distribution.md`
- `index.md`
- `logs/learning-graph-generator-0.05-2026-07-27.md` (this file)
- Copied skill programs: `add-taxonomy.py`, `analyze-graph.py`, `csv-to-json.py`,
  `taxonomy-distribution.py`, `validate-learning-graph.py`, `validate-learning-graph.sh`,
  `index-template.md`, `learning-graph-schema.json`

## Files/config modified outside docs/learning-graph/

- `mkdocs.yml` — expanded the `Learning Graph` nav section to include the newly generated pages.

## Recommended next steps

1. Human review of `concept-list.md` and `learning-graph.csv` is still valuable even though this
   run was fully automated end-to-end — the skill's Step 2 review checkpoint was not paused on
   since this run was delegated without an interactive reviewer.
2. Optionally run the `book-installer` skill's "install learning graph viewer" guide to add an
   interactive MicroSim graph viewer at `docs/sims/graph-viewer`.
3. Next logical skill: `book-chapter-generator`, after reviewing the concept list, taxonomy, and
   dependency graph produced here.
