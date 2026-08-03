Before generating content for the chapters, lesson plans, quizzes, FAQ, glossary, or other
student-facing text, read the `CONTENT-GENERATION-GUIDE.md` file. Note that the teacher's
guide, instructor's guide, or other instructor-facing content does not need to use the
mascot described in `CONTENT-GENERATION-GUIDE.md`.

## Kit Directories Are Uploaded Wholesale

Each kit lives in `src/kits/<kit-name>/`, and every kit has an `upload-code.sh` that copies
**every `.py` file in that directory** onto the microcontroller, plus everything in the kit's
`lib/` subdirectory. There is no allowlist and no ignore file — the script globs `*.py`.

That has a hard consequence: **anything you put in a kit directory ends up on the board.**
A Pico has about 1.4 MB of filesystem, so a stray tool or test script is not just clutter,
it competes for space with the code students actually run and shows up in their file listing.

Only these belong in a kit directory:

- Numbered lab programs (`NN-name.py`) that students run
- Shared modules the labs import, such as `config.py` and `face.py`
- Display drivers and other vendored libraries, in `lib/`
- `README.md` and `upload-code.sh`, which are not `.py` and are skipped

Everything else — test harnesses, build scripts, generators, one-off analysis code — goes in
`src/utils/`, which is never uploaded. See `src/utils/README.md`.

## Checking Labs Before Uploading

`src/utils/check-labs.py` runs a kit's labs against a fake microcontroller, catching crashes,
bad tuple unpacking, and drawing calls that land off the screen without a board attached:

```bash
python3 src/utils/check-labs.py                       # the OLED two-button kit
python3 src/utils/check-labs.py src/kits/smartwatch   # any other kit
```

It is a smoke test, not a simulator. It proves a lab *runs*; it cannot tell you whether a face
looks right, and every timing number a lab prints under it comes from a fake clock. Always test
on real hardware before handing anything to students.

A lab that draws off the screen on purpose — the debugging labs do — should carry the comment
marker `check-labs: allow-offscreen` so the checker does not report it as a mistake.
