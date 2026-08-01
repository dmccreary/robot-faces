---
title: Quiz - A History of MicroPython's FrameBuf Drawing Support
description: Ten multiple-choice questions covering the open source contribution model, the framebuf version timeline, release versioning, nightly builds, and firmware updates.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: A History of MicroPython's FrameBuf Drawing Support

Test your understanding of how `ellipse()` and `poly()` traveled from a pull request to a stable release, and what that journey teaches about open source software.

---

#### 1. Which MicroPython release was the first stable version to include `ellipse()` and `poly()` in `framebuf`?

<div class="upper-alpha" markdown>
1. v1.17, released in 2021
2. v1.20.0, released in April 2023
3. v1.19.1, released in 2022
4. v1.24.1, released in 2024
</div>

??? question "Show Answer"
    The correct answer is **B**. Version 1.20.0 shipped in April 2023 and is the version this book assumes throughout. Option A is the release that gave `blit()` cross-format support, option C is the last release *without* the two new methods, and option D is the later patch that fixed an `ellipse()` edge-case bug.

    **Concept Tested:** MicroPython V1.20.0 Release

    **See:** [v1.20.0: The Release This Book Assumes](index.md)

---

#### 2. In the open source contribution model, what is a pull request?

<div class="upper-alpha" markdown>
1. A request asking maintainers to release a new version of the project
2. A message asking another programmer to explain how their code works
3. A formal proposal of a specific set of code changes, submitted for maintainer review before merging
4. A download of the project's latest source code onto a contributor's own computer
</div>

??? question "Show Answer"
    The correct answer is **C**. A contributor writes the code and opens a pull request saying, in effect, "here is a complete set of changes; please review them and add them if you agree." Maintainers then read it line by line, test it, and request revisions before merging. That review step is what makes code shipped to millions of microcontrollers likely to be correct rather than accidentally so.

    **Concept Tested:** Open Source Contribution Model

    **See:** [How an Idea Becomes Code](index.md#how-an-idea-becomes-code-the-open-source-contribution-model)

---

#### 3. Which of these drawing methods was NOT available in `framebuf` before v1.20?

<div class="upper-alpha" markdown>
1. `poly()`
2. `scroll()`
3. `blit()`
4. `text()`
</div>

??? question "Show Answer"
    The correct answer is **A**. Through v1.19.1, `framebuf` offered exactly nine methods: `fill()`, `pixel()`, `hline()`, `vline()`, `line()`, `rect()`, `scroll()`, `blit()`, and `text()` — everything Chapter 6 covered. Neither `poly()` nor `ellipse()` was among them, so anything curved or many-sided had to be built by hand from straight lines and rectangles.

    **Concept Tested:** Framebuf Method Set Before V1.20

    **See:** [What framebuf Could Draw Before v1.20](index.md#what-framebuf-could-draw-before-v120)

---

#### 4. In August 2022, the `ellipse()`/`poly()` pull request was merged into MicroPython's development branch. What could an ordinary user do with those methods at that point?

<div class="upper-alpha" markdown>
1. Use them immediately, since a merge automatically ships to all installed boards
2. Use them after a small configuration change in Thonny
3. Nothing — merged code is permanently separate from released firmware
4. Nothing through official releases; only an unofficial nightly build offered early access
</div>

??? question "Show Answer"
    The correct answer is **D**. Merged into the development branch is not the same as shipped in a release. The code existed and worked, but no official downloadable release included it for another eight months. During that gap, the only route was flashing a nightly build — an option this book does not recommend for most students.

    **Concept Tested:** Ellipse Poly Dev Branch Merge

    **See:** [The Merge That Changed Everything](index.md#the-merge-that-changed-everything-august-2022)

---

#### 5. In MicroPython's major.minor.patch versioning, what does a change to the minor number usually signal?

<div class="upper-alpha" markdown>
1. A foundational rewrite affecting the whole project
2. New features have been added
3. Bug fixes only, with no behavior changes
4. A change to which boards the firmware supports
</div>

??? question "Show Answer"
    The correct answer is **B**. A minor bump — v1.19 to v1.20 — is where new features like `ellipse()` and `poly()` appear. A major bump signals a rare foundational change, and a patch bump such as v1.24.0 to v1.24.1 signals bug fixes only. Reading a version number this way tells you what to expect before you even open the release notes.

    **Concept Tested:** MicroPython Release Versioning

    **See:** [Understanding Version Numbers](index.md#understanding-version-numbers-major-minor-patch)

---

#### 6. The 2024 `ellipse()` fix shipped as v1.24.1 rather than v1.25.0. What does that version number tell you about the change?

<div class="upper-alpha" markdown>
1. It corrected existing behavior without adding any new capability
2. It added new drawing methods alongside the fix
3. It was an unofficial nightly build rather than a stable release
4. It removed `ellipse()` pending a redesign
</div>

??? question "Show Answer"
    The correct answer is **A**. The patch position incremented, so by MicroPython's own versioning convention this was a bug fix, not a feature release. `ellipse()` did not gain the ability to draw anything new — it simply became more correct in certain edge cases. Shipped features continuing to be refined is a healthy sign of an actively maintained project.

    **Concept Tested:** Ellipse Bug Fix V1.24.1

    **See:** [Even Shipped Features Keep Improving](index.md)

---

#### 7. You find a 2022 tutorial that draws a circle using `import math`, a loop, and repeated `fb.line()` calls. What is the most reasonable conclusion?

<div class="upper-alpha" markdown>
1. The tutorial's author made an error, since `ellipse()` has always existed
2. The tutorial targets a different microcontroller that lacks `framebuf`
3. The tutorial predates `ellipse()` reaching a stable release, so it uses the pre-2023 curve workaround
4. The tutorial is drawing a polygon, not a circle, since circles need `fb.rect()`
</div>

??? question "Show Answer"
    The correct answer is **C**. Looping through small angle steps, computing an (x, y) point with trigonometry, and connecting consecutive points with `line()` is exactly how real projects drew circles before v1.20.0. The code is not wrong — it is simply older. Checking `sys.implementation.version` before assuming `ellipse()` is available is the habit worth building.

    **Concept Tested:** Pre-2023 Curve Workaround

    **See:** [Faking Curves With Straight Lines](index.md#faking-curves-with-straight-lines)

---

#### 8. What is nightly build firmware?

<div class="upper-alpha" markdown>
1. Firmware that reduces a display's brightness automatically after dark
2. A stable release published on a fixed monthly schedule
3. A backup copy of the previous official release, kept for rollbacks
4. An unofficial build generated automatically from the latest development code, without a full release's testing
</div>

??? question "Show Answer"
    The correct answer is **D**. Nightly builds bundle the very latest merged changes, which is how some programmers used `ellipse()` months before April 2023. The trade-off is stability: they can carry undiscovered bugs, they change from day to day, and published tutorials are not tested against them.

    **Concept Tested:** Nightly Build Firmware

    **See:** [Nightly Build Firmware](index.md)

---

#### 9. Why does this book recommend official numbered releases over nightly builds for classroom projects?

<div class="upper-alpha" markdown>
1. Because nightly builds skip most testing, shift daily, and are not what tutorials are written against
2. Because nightly builds cannot be installed on a Raspberry Pi Pico at all
3. Because nightly builds omit the `framebuf` module entirely
4. Because nightly builds require a paid MicroPython subscription
</div>

??? question "Show Answer"
    The correct answer is **A**. The wait between a dev-branch merge and a stable release exists on purpose, so real-world testing can catch problems before millions of devices run the code. A nightly build trades that safety for early access, and it also makes troubleshooting harder, since help written for stable releases may not match what you are running.

    **Concept Tested:** Nightly Build Firmware

    **See:** [Nightly Build Firmware](index.md)

---

#### 10. What is the correct process for updating a Raspberry Pi Pico to a newer MicroPython release?

<div class="upper-alpha" markdown>
1. Run a MicroPython command in the REPL that downloads and installs the update over Wi-Fi
2. Hold BOOTSEL while plugging in the USB cable, then drag the official `.uf2` file onto the drive that appears
3. Replace the RP2040 chip with one preloaded with the newer firmware
4. Edit the version number in Thonny's interpreter settings and restart the board
</div>

??? question "Show Answer"
    The correct answer is **B**. Holding BOOTSEL makes the Pico appear as a small removable drive; dropping the downloaded `.uf2` file onto it triggers an automatic reboot into the new version a few seconds later. That drag-and-drop simplicity is why keeping firmware reasonably current is practical rather than risky.

    **Concept Tested:** MicroPython Firmware Update

    **See:** [Updating Your Own Pico's Firmware](index.md)
