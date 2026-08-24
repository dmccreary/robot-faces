---
name: kit-box-cover-generator
description: Generates a printable, single-page HTML box cover for a Robot Faces hardware kit (src/kits/<kit-name>/) — a 6"x4" retail-style cover with the kit's real photo, a punchy feature list pulled from its README, audience badges, and a footer specs bar, in the same visual style as docs/kits/oled/box-cover-2.html. Use this whenever the user asks for a "box cover", "kit cover", "packaging design", "product cover", asks to make a kit "look sellable" or "print-ready", wants something to print and glue onto a physical box, or names a kit (e.g. "sw-gc9b72", "smartwatch", "oled kit") together with any of those words — even if they don't say "HTML". Requires a photo of the assembled kit; if the user hasn't supplied one, ask for a path before generating anything.
---

# Kit Box Cover Generator

Turns a kit's engineering README into a compelling, print-ready retail box cover: a
single self-contained HTML file with the kit's own photo front and center, a handful
of reasons a student would want to build it, and the display/microcontroller specs —
styled to match the rest of the Robot Faces kit family.

## Why this needs judgment, not just templating

A kit's `README.md` in `src/kits/<kit-name>/` is written for the next person
maintaining the driver — wiring tables, troubleshooting notes, credit for where a
register sequence came from. None of that is box-cover copy. Your job is to *read*
that README and figure out what's actually compelling about the kit to a student who
has never seen it, not to copy sentences out of it. See `references/box-cover-2.html`
line-for-line and you'll notice the shipped OLED cover doesn't say "monochrome
128x64 SSD1306 driver" anywhere — it says "Learn Interactive Graphics." That's the
translation this skill exists to do.

## Required inputs

Before writing anything, make sure you have all three. If any are missing, ask the
user rather than guessing:

1. **The kit's source directory** — `src/kits/<kit-name>/`, containing `README.md`.
   If the user names a kit ambiguously, list `src/kits/*` and confirm which one.
2. **A photo of the assembled kit** — a real picture, not a stock/marketplace listing
   image. Some kit folders under `docs/kits/<kit-name>/` have more than one image
   (e.g. `sw-gc9b72` has both `kit-photo.jpg`, a phone photo of the actual build, and
   `aliexpress-listing-6-dollars.png`, a screenshot of the display's product listing).
   Use the real build photo; the listing screenshot is a citation for the datasheet
   section elsewhere in the book, not box art. If no kit photo exists yet, ask the
   user for one or where to find it — don't substitute a stock image or leave the
   `<img>` pointing at something that doesn't exist.
3. **The output kit directory** — normally `docs/kits/<kit-name>/`, but check first:
   `src/kits/` and `docs/kits/` names don't always match (`src/kits/oled-2-buttons`
   publishes to `docs/kits/oled/`, for instance). If `docs/kits/<kit-name>/` doesn't
   exist under the same name as the source kit, search `mkdocs.yml`'s nav for which
   `docs/kits/<slug>/` corresponds to this kit, or ask the user.

## Workflow

1. **Read the kit's `README.md`** in full. While reading, note down (you'll use these
   in step 3):
   - What display it has and its size/resolution/controller chip
   - What microcontroller it uses
   - Whether it's breadboard/no-solder or requires soldering
   - Anything that makes *this* kit different from its siblings (a new driver someone
     had to write, a display shape, extra buttons, a scaling trick) — these make the
     strongest feature bullets because they're specific, not generic
   - Whether the README flags anything as unconfirmed/untested on real hardware —
     don't turn a caveat into a confident marketing claim

2. **Check the voice guidance.** Read the "Audience & Reading Level" and "Voice &
   Tone" sections of `/CONTENT-GENERATION-GUIDE.md` (bright, positive, second person,
   active voice — see that file for the full standard). Box cover copy is
   student-facing, so it should read like that guide, not like the README. You do
   **not** need the Pixel mascot here — that's for chapter admonitions, and a box
   cover has no room for it.

3. **Draft the content** (see "Filling in the template" below for exactly which
   fields these become):
   - A subtitle naming the display (e.g. "GC9B72 Round Display Kit")
   - Audience badges — default to the family's standard three (ages, audience,
     soldering claim) but adjust the soldering badge if this kit actually requires
     soldering; don't repeat a claim you haven't verified against the README
   - Four feature bullets: reuse the family bullet that's true of every kit
     ("Learn how robots express feelings" or equivalent) plus up to three that are
     specific to *this* kit's hardware or what makes it interesting to build
   - Two footer spec items: the display (size + controller) and the microcontroller
   - A short page title for the `<title>` tag and on-screen toolbar heading

4. **Fill in the template.** Copy `assets/box-cover-template.html` to the output
   path and replace every `{{PLACEHOLDER}}` token — there are two nearly-identical
   `<!-- COVER PANEL -->` blocks in the file (that's not a front/back pair, it's two
   copies of the same cover so one printed sheet yields two cut-apart covers), and
   each placeholder appears once per panel, so replace it in both places with the
   same value. Search the finished file for `{{` afterward to confirm nothing was
   left unfilled.

5. **Wire up the photo.** Set `{{PHOTO_SRC}}` to the photo's path *relative to the
   output HTML file* — if the cover and the photo live in the same
   `docs/kits/<kit-name>/` directory (the normal case), this is just the filename,
   e.g. `kit-photo.jpg`. Write a real `{{PHOTO_ALT}}` describing what's in the photo
   (e.g. "Assembled sw-gc9b72 robot face kit on a breadboard"), not a generic label.

6. **Save the output** to `docs/kits/<kit-name>/box-cover.html` (matching the
   `docs/kits/oled/box-cover-2.html` naming precedent — use `box-cover.html` unless
   the directory already has a cover file, in which case ask the user before
   overwriting or picking a different name).

7. **Sanity-check before reporting done:**
   - No `{{...}}` tokens remain anywhere in the file
   - The `<img src>` path actually resolves to a file that exists
   - Nothing you wrote in the feature bullets or badges is a claim the README
     doesn't support

8. **Optional follow-up — ask, don't assume:** sibling kits also have a
   `docs/kits/<kit-name>/box-cover/index.md` page (see
   `docs/kits/oled/box-cover/index.md`) with printing instructions and an entry in
   `mkdocs.yml`'s nav. Offer to add these to match convention, but the box cover HTML
   itself is the deliverable the user asked for — don't create extra pages or edit
   `mkdocs.yml` without checking first.

## Filling in the template

`assets/box-cover-template.html` is a full copy of the shipped `box-cover-2.html`
design with the OLED-specific expression gallery replaced by a single large photo
frame, and every kit-specific string replaced by a `{{PLACEHOLDER}}`. The CSS,
print button, corner crop marks, and page-sheet layout are all unchanged — don't
redesign those, just fill in content. Placeholders:

| Placeholder | What goes here | Example |
|---|---|---|
| `{{PAGE_TITLE}}` | `<title>` and toolbar heading | `Robot Faces sw-gc9b72 Kit — 6" x 4" Dual Box Covers (8.5" x 11" Printable)` |
| `{{BRAND_TAG}}` | Small pill above the title | `MicroPython STEM Kit` |
| `{{MAIN_TITLE}}` | Big headline — the book/series name | `Robot Faces` |
| `{{SUBTITLE}}` | What's different about this kit | `GC9B72 Round Display Kit` |
| `{{AUDIENCE_BADGE_1}}` | Highlighted pill (top) | `AGES 8+ TO ADULT` |
| `{{AUDIENCE_BADGE_2}}` | Second pill | `STUDENTS • LIBRARIES • CLUBS` |
| `{{AUDIENCE_BADGE_3}}` | Third pill — verify against README | `NO SOLDERING REQUIRED` |
| `{{PHOTO_CARD_LABEL}}` | Small label above the photo | `Real Kit Photo` |
| `{{PHOTO_CARD_SPEC}}` | Right-aligned spec next to that label | `2.1" Round Display` |
| `{{PHOTO_SRC}}` | Path to the photo, relative to the output file | `kit-photo.jpg` |
| `{{PHOTO_ALT}}` | Real alt text describing the photo | `Assembled sw-gc9b72 kit on a breadboard` |
| `{{FEATURE_ICON_1..4}}` | One emoji per feature | `🧠` `🎨` `🐍` `🤖` |
| `{{FEATURE_TEXT_1..4}}` | Short, punchy, second-person-adjacent | `Learn how robots express feelings` |
| `{{SPEC_ITEM_1}}` | Footer: display spec | `2.1" GC9B72 Display` |
| `{{SPEC_ITEM_2}}` | Footer: microcontroller | `Raspberry Pi Pico` |
| `{{KIT_INCLUDES}}` | Footer, right side | `FULL HARDWARE & ONLINE BOOK` |

Feature icons and bullets aren't fixed to the four shown in the example — pick emoji
that fit what you actually wrote, and it's fine to reuse an icon if two bullets are
thematically close. What matters is that at least one bullet is specific to this
kit's hardware, not just the four generic ones copied from another kit's cover.

## Reference

- `references/box-cover-2.html` — the original shipped OLED kit cover, kept as-is so
  you can compare your output's structure against a known-good rendering if
  something looks off.
