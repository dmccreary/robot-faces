# Robot Faces

**Drawing Expressive Displays for STEM Robots**

[![MkDocs](https://img.shields.io/badge/Made%20with-MkDocs-526CFE?logo=materialformkdocs)](https://www.mkdocs.org/)
[![Material for MkDocs](https://img.shields.io/badge/Material%20for%20MkDocs-526CFE?logo=materialformkdocs)](https://squidfunk.github.io/mkdocs-material/)
[![GitHub Pages](https://img.shields.io/badge/View%20on-GitHub%20Pages-blue?logo=github)](https://dmccreary.github.io/robot-faces/)
[![MicroPython](https://img.shields.io/badge/MicroPython-2B2728?logo=micropython&logoColor=white)](https://micropython.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![p5.js](https://img.shields.io/badge/p5.js-ED225D?logo=p5.js&logoColor=white)](https://p5js.org/)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-DA7857?logo=anthropic)](https://claude.ai/code)
[![Uses Claude Skills](https://img.shields.io/badge/Uses-Claude%20Skills-DA7857?logo=anthropic)](https://github.com/dmccreary/claude-skills)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## View the Live Site

**[https://dmccreary.github.io/robot-faces/](https://dmccreary.github.io/robot-faces/)**

## Overview

Robots that show emotion connect with people more easily, and one of the cheapest ways to give a
robot personality is to put a small screen where its face would be. This is an interactive
intelligent textbook that teaches high school and advanced middle school students to program
expressive robot faces on two low-cost hardware targets: a ~$20 monochrome OLED display and a ~$10
color round "smartwatch" display, both driven by a Raspberry Pi Pico running MicroPython. A complete
kit costs under $30.

Students learn to decompose a face into independently parameterized parts — eyes, pupils, eyebrows,
and a mouth — then combine those parts into recognizable emotional expressions, starting from Paul
Ekman's research on universal human emotions. Along the way they practice the same computational
thinking skills used by commercial social robots like Anki's Cozmo and Vector, Emotix's Miko, and
Blue Frog Robotics' Buddy. No prior programming or electronics experience is required; MicroPython
syntax is introduced from scratch in the early chapters.

The book is built on a 293-concept **learning graph** that orders every topic by its prerequisites,
so the 16 chapters, 32 hands-on hardware labs, 47 browser-based interactive simulations, and 160
quiz questions sit in a dependency-checked sequence rather than an arbitrary one. Learning outcomes
follow the 2001 revision of Bloom's Taxonomy. Eight illustrated **stories** profile the researchers
and companies behind screen-based robot faces — Cynthia Breazeal, Masahiro Mori, Paul Ekman, Rodney
Brooks, Rosalind Picard, Hideki Kozima, Joy Buolamwini, and the rise and fall of Anki.

## Site Status and Metrics

| Metric | Count |
|--------|-------|
| Concepts in Learning Graph | 293 |
| Chapters | 16 |
| Hands-On Hardware Labs | 32 |
| Interactive MicroSims | 47 |
| Illustrated Stories | 8 |
| Glossary Terms | 293 |
| FAQ Questions | 124 |
| Quiz Questions | 160 |
| Annotated References | 160 |
| Diagrams & Visualizations | 47 |
| Markdown Files | 167 |
| Images | 189 |
| Total Words | 262,142 |
| Equivalent Printed Pages | ~1,083 |

Book-wide totals come from `docs/learning-graph/book-metrics.json`. See
[book-metrics.md](docs/learning-graph/book-metrics.md) and
[chapter-metrics.md](docs/learning-graph/chapter-metrics.md) for the full breakdown.

**Status:** All 16 chapters, quizzes, and references are complete. The OLED two-button kit is
complete with 32 labs; the color smartwatch kit is in progress.

## The Hardware

| Kit | Display | Bus | Status |
|-----|---------|-----|--------|
| `src/kits/oled-2-buttons` | 128x64 or 2.42" mono OLED (SSD1306/SSD1309) + two buttons | SPI | Complete — 32 labs |
| `src/kits/smartwatch` | 240x240 round color display | SPI | In progress |

Both kits run on a Raspberry Pi Pico with MicroPython. See the
[Parts List](docs/parts-list.md) for exact part numbers, classroom bulk-buying strategies, and
supplier notes.

## Getting Started

### Read the Book

No installation needed — the textbook is live at
[dmccreary.github.io/robot-faces](https://dmccreary.github.io/robot-faces/). Start with
[Getting Started](docs/getting-started.md) to order parts and set up your development environment.

### Run the Site Locally

```bash
git clone https://github.com/dmccreary/robot-faces.git
```

```bash
pip install mkdocs mkdocs-material
```

```bash
mkdocs serve
```

Open `http://localhost:8000` in your browser. Edits to files under `docs/` reload automatically.

### Build and Deploy

```bash
mkdocs build
```

```bash
mkdocs gh-deploy
```

### Load Code onto a Microcontroller

Each kit directory ships an upload script that copies every `.py` file in that directory — plus the
kit's `lib/` folder — onto a connected board:

```bash
./src/kits/oled-2-buttons/upload-code.sh
```

> **Note:** kit directories are uploaded wholesale. Anything you drop into a kit folder ends up on
> the board and competes for the Pico's ~1.4 MB of filesystem. Tools, generators, and test harnesses
> belong in `src/utils/`, which is never uploaded.

### Check Labs Without Hardware

`src/utils/check-labs.py` runs a kit's labs against a fake microcontroller, catching crashes, bad
tuple unpacking, and drawing calls that land off-screen:

```bash
python3 src/utils/check-labs.py
```

```bash
python3 src/utils/check-labs.py src/kits/smartwatch
```

It is a smoke test, not a simulator — it proves a lab *runs*, not that a face *looks right*. Always
test on real hardware before handing anything to students.

## Repository Structure

```
robot-faces/
├── docs/                        # MkDocs documentation source (the book itself)
│   ├── chapters/                # 16 chapters, each with index.md, quiz.md, references.md
│   ├── kits/oled/               # 32 hands-on lab write-ups for the OLED two-button kit
│   ├── sims/                    # 47 interactive MicroSims (p5.js, Chart.js, vis-network)
│   ├── stories/                 # 8 illustrated stories about robot-face pioneers
│   ├── learning-graph/          # 293-concept dependency graph, taxonomy, quality metrics
│   ├── teachers-guide/          # Instructor-facing pacing and classroom guidance
│   ├── img/                     # Cover art, chapter images, and the Pixel mascot
│   ├── glossary.md              # 293 ISO 11179-compliant definitions
│   ├── faq.md                   # 124 frequently asked questions
│   └── parts-list.md            # Bill of materials and bulk-buying guidance
├── src/
│   ├── kits/oled-2-buttons/     # Numbered lab programs uploaded to the board
│   ├── kits/smartwatch/         # Color round-display kit (in progress)
│   ├── utils/                   # Dev tools — never uploaded to a board
│   ├── drivers/                 # Display drivers
│   └── emulator/                # Desktop face emulator
├── plugins/social_override.py   # MkDocs hook for per-page og:image / twitter:image
├── mkdocs.yml                   # Site configuration and navigation
├── CONTENT-GENERATION-GUIDE.md  # Voice, reading level, and mascot rules for new content
└── README.md                    # This file
```

## For Teachers

The [Teachers Guide](docs/teachers-guide/index.md) covers pacing, prerequisites, and classroom
setup. The [Parts List](docs/parts-list.md) includes strategies for outfitting a class of 10-30
students — standardizing on one part number, ordering spares, and pre-bagging kits before class.
Every chapter ships with a quiz and annotated references, and a printable QR code sheet
(`qr-code-sheet.html`) links students directly to individual labs from a paper handout.

## Reporting Issues

Found a bug, a typo, a lab that does not work on your hardware, or have a suggestion?

**[Open an issue](https://github.com/dmccreary/robot-faces/issues)**

When reporting, please include:

- A description of the problem or suggestion
- Steps to reproduce, for bugs
- Your exact display model and driver chip (SSD1306 vs. SSD1309 matters), for hardware issues
- Your MicroPython version, for lab failures
- Browser and screenshots, for MicroSim issues

## License

This work is licensed under the
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

**You are free to:**

- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

**Under the following terms:**

- **Attribution** — Give appropriate credit with a link to the original
- **NonCommercial** — No commercial use without permission
- **ShareAlike** — Distribute your contributions under the same license

See the License section of [About This Book](docs/about.md) for full details.

## Acknowledgements

This project stands on the shoulders of the open source community:

- **[MicroPython](https://micropython.org/)** — the Python implementation that makes a $6 microcontroller teachable
- **[Raspberry Pi Foundation](https://www.raspberrypi.org/)** — the Pico and its educational mission
- **[Thonny](https://thonny.org/)** — the beginner-friendly Python IDE students use to talk to their boards
- **[MkDocs](https://www.mkdocs.org/)** — static site generator for project documentation
- **[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)** — the responsive theme powering this site
- **[p5.js](https://p5js.org/)** — creative coding library from NYU ITP, behind most of the MicroSims
- **[vis-network](https://visjs.org/)** — network visualization for the learning graph viewer
- **[Chart.js](https://www.chartjs.org/)** — charting for the data-driven simulations
- **[Claude](https://claude.ai)** by Anthropic — AI-assisted content generation via [Claude Skills](https://github.com/dmccreary/claude-skills)
- **[GitHub Pages](https://pages.github.com/)** — free hosting for open educational resources

Thanks also to the researchers whose work this book teaches — Paul Ekman, Cynthia Breazeal,
Masahiro Mori, Rodney Brooks, Rosalind Picard, Hideki Kozima, and Joy Buolamwini — and to the
coding club students whose obsession with getting an eyebrow *just right* is the reason this book
exists.

## How to Cite

```
McCreary, D. (2026). Robot Faces: Drawing Expressive Displays for STEM Robots.
GitHub. https://dmccreary.github.io/robot-faces/
```

```bibtex
@misc{mccreary_robot_faces_2026,
  author    = {McCreary, Dan},
  title     = {Robot Faces: Drawing Expressive Displays for STEM Robots},
  year      = {2026},
  publisher = {GitHub},
  url       = {https://dmccreary.github.io/robot-faces/}
}
```

## Contact

**Dan McCreary**

- LinkedIn: [linkedin.com/in/danmccreary](https://www.linkedin.com/in/danmccreary/)
- GitHub: [@dmccreary](https://github.com/dmccreary)

Questions, suggestions, or collaboration opportunities? Connect on LinkedIn or
[open an issue](https://github.com/dmccreary/robot-faces/issues).
