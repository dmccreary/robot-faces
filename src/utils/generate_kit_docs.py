#!/usr/bin/env python3
"""Generate the smartwatch kit's documentation pages.

    python3 src/utils/generate_kit_docs.py

For every numbered lab in src/kits/smartwatch this writes
docs/kits/smartwatch/<slug>/index.md, inlining the lab's real current
source and referencing the PNG that render_kit_screens.py already put
next to it. Run that script first -- this one only assembles pages
around images it expects to already exist (checked against
_render-manifest.json, not re-derived).

It also rewrites docs/kits/smartwatch/index.md, the kit's own overview
page, into a table of contents over every lab.

WHY A GENERATOR AND NOT 34 HAND-WRITTEN FILES

The mechanical parts -- headers, code fences, image links, folder
creation -- are identical in shape across every lab and safest done by
code. LAB_META below is not mechanical: it is the actual authored
content, one entry per lab, written the way a person would write it. The
generator's job is only to assemble that content consistently, the same
division of labor check-labs.py and render_kit_screens.py already use
between "authored per-kit data" and "generic per-file machinery".
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
KIT_DIR = os.path.join(SCRIPT_DIR, "..", "kits", "smartwatch")
DOCS_DIR = os.path.join(SCRIPT_DIR, "..", "..", "docs", "kits", "smartwatch")
MASCOT = "../../../img/mascot/%s.png"

# --------------------------------------------------------------- content
#
# One entry per lab file, in the order the kit numbers them. Fields:
#
#   file       the real filename in src/kits/smartwatch/
#   slug       the doc folder name (filename with "NN-" and ".py" stripped)
#   title      page H1
#   group      which section of the kit index this lab is filed under
#   intro      list of paragraphs shown before the source code
#   code_lead  one sentence introducing the fenced source block
#   image_lead sentence introduced before the screenshot (skipped if no image)
#   heading    H2 for the explanation section after the image
#   explain    list of paragraphs for that section
#   mascot     optional (pose, text) -- used sparingly, not on every page
#   refs       optional list of (label, url) reference links

LAB_META = [
dict(file="00-blink-onboard-led.py", slug="blink-onboard-led",
    title="Lab 0: Blink Something", group="orient",
    intro=[
        "Before any display, any driver, any font, run this. It answers one "
        "question: is the board itself alive, and is Thonny actually talking "
        "to it? Nothing here depends on the GC9A01, the fonts, or even "
        "`config.py` -- if the round screen turns out to be miswired, this "
        "lab still tells you the board is fine, which is exactly the "
        "information you need to keep looking in the right place.",
        "GP25 means two different things depending on which board is on your "
        "desk. On a plain Raspberry Pi Pico it is the onboard LED. On a "
        "Waveshare RP2040-LCD-1.28 it is the display's **backlight** -- that "
        "board has no separate LED at all. Either way, this program blinks "
        "it, and either way that tells you the same thing: the board is "
        "running MicroPython and Thonny can reach it.",
    ],
    code_lead="This program imports nothing from the kit on purpose -- no "
             "`config`, no driver, no fonts -- so it still works even if one "
             "of those is broken or missing:",
    image_lead=None,
    heading="Why No Display Import",
    explain=[
        "If the very first program you run needs the display driver "
        "installed correctly, then a missing file and a dead board look "
        "identical -- both show you nothing. Cutting the display out of the "
        "loop entirely means this lab can only fail one way: the board isn't "
        "there, or Thonny isn't connected to it. Every later lab builds on "
        "the assumption that this one already passed.",
        "**On a Waveshare board, watch GP25.** Any code carried over from a "
        "plain Pico that toggles pin 25 \"to blink the LED\" will strobe the "
        "screen there instead, since that pin drives the backlight. It is a "
        "harmless surprise the first time you meet it, and a useful one to "
        "meet here rather than in the middle of a face you are trying to "
        "debug.",
    ],
    mascot=("welcome",
           "Every kit in this book starts the same way -- one blink, to "
           "prove the board is listening before we ask it to draw a single "
           "pixel."),
    refs=None),

dict(file="01-hello.py", slug="hello",
    title="Lab 1: Hello World", group="orient",
    intro=[
        "The classic first program, adapted for a driver with no built-in "
        "font. `config.init_display()` starts the SPI bus and the GC9A01 in "
        "one call, and then this lab writes two lines of text in the kit's "
        "two font sizes -- proof that the wiring, the driver, and both "
        "fonts are all reachable before anything more interesting is asked "
        "of them.",
    ],
    code_lead="Run this and you should see two lines of white text on a "
             "black circle:",
    image_lead="Here's what that program draws on the display:",
    heading="There Is No Built-In Font",
    explain=[
        "`framebuf`, the module behind the OLED kit's SSD1306 driver, ships "
        "a fixed 8-by-8 font for free. This driver is not built on "
        "`framebuf`, and it has no font of its own at all -- `text()` takes "
        "a font **module** as its first argument, so `display.text(\"Hi\", "
        "x, y, WHITE)` simply does not work here. `config.py` imports two "
        "font modules and hands them to you as `config.SMALL_FONT` (8x16) "
        "and `config.BIG_FONT` (16x32) so every later lab can just ask for "
        "one.",
        "The call shape is `display.text(font, string, x, y, fg, bg)` -- six "
        "arguments where the OLED kit needed four. The two new ones are not "
        "optional, and forgetting the font is the single most common first "
        "mistake anyone makes porting OLED code to this driver.",
    ],
    mascot=None, refs=None),

dict(file="02-screen-coordinates.py", slug="screen-coordinates",
    title="Lab 2: Screen Coordinates on a Round Display", group="orient",
    intro=[
        "The coordinate system itself hasn't changed from the OLED kit: "
        "(0, 0) is the upper-left corner, x grows right, y grows down. What "
        "changes is what happens at the edges. The GC9A01 addresses a "
        "240x240 **square** of pixels, but the glass in front of it is the "
        "circle inscribed in that square -- so a pixel at, say, (5, 5) is a "
        "real, legal, drawable pixel that a person looking at the watch "
        "will never see.",
    ],
    code_lead="This lab draws the same corner-and-center markers a "
             "rectangular display lesson would, so you can see exactly how "
             "many of them survive:",
    image_lead="Here's what actually reaches the glass:",
    heading="Count What Survived",
    explain=[
        "Four corner squares went in. Look at the image: how many corner "
        "labels can you actually read? A corner of the 240x240 square sits "
        "roughly 170 pixels from the center -- well outside the "
        "`SAFE_RADIUS` of 112 that `config.py` defines as the practical "
        "edge of the visible glass. Every one of them is gone, and nothing "
        "in the driver ever complained about drawing them.",
        "That silence is the lesson. On a rectangular display, a coordinate "
        "either fits on screen or it doesn't, and \"off screen\" behaves the "
        "same in every direction. Here, whether an x is usable depends on "
        "the y it's paired with -- the two are no longer independent. "
        "`config.inside_circle(x, y)` does that arithmetic so you don't "
        "have to reason about it by hand every time you place something "
        "near the rim.",
    ],
    mascot=None, refs=None),

dict(file="03-pixel.py", slug="pixel",
    title="Lab 3: Drawing Pixels", group="primitives",
    intro=[
        "`display.pixel(x, y, color)` is the smallest drawing command "
        "there is -- one dot, on or off. Every shape in this kit is built "
        "out of pixels underneath, which is exactly why it's worth meeting "
        "this command first, even though you'll almost never call it "
        "directly once `shapes.py` exists.",
    ],
    code_lead="Two dotted rulers, a diagonal drawn one dot at a time, and an "
             "eye with a catchlight punched out of it:",
    image_lead="Here's what that program draws:",
    heading="Every Pixel Is a Conversation",
    explain=[
        "On the OLED kit, `pixel()` poked one bit in a RAM buffer -- cheap, "
        "almost free. This driver keeps no buffer at all. Every single call "
        "to `pixel()` sets a drawing window on the GC9A01 and ships two "
        "bytes of color down the SPI wire, on its own, with its own "
        "command overhead. Run this lab and you can watch the dotted rulers "
        "appear one dot at a time on real hardware -- a visible crawl that "
        "never showed up on the OLED kit.",
        "That crawl is the entire reason `shapes.py` exists, and why it "
        "works in horizontal runs (one `hline()` per row) instead of "
        "walking pixel by pixel. `pixel()` is still the right tool for a "
        "handful of dots, like the four-pixel catchlight in this lab's eye "
        "-- reach for a shape command the moment you need more than a few.",
    ],
    mascot=None, refs=None),

dict(file="04-lines.py", slug="lines",
    title="Lab 4: Drawing Lines", group="primitives",
    intro=[
        "`hline()` and `vline()` take a start point and a length; `line()` "
        "takes two full end points and walks a diagonal. Reach for "
        "`hline`/`vline` whenever a line is perfectly horizontal or "
        "vertical -- they skip the angle math, and because they send one "
        "run of pixels instead of walking a diagonal dot by dot, they're "
        "also the faster call on this display.",
    ],
    code_lead="A box built from lines on top, an angry face built entirely "
             "out of lines on the bottom:",
    image_lead="Here's what that program draws:",
    heading="Lines Have Opinions About Direction",
    explain=[
        "Look at the eyebrows in the angry face: they angle down toward the "
        "nose. That's not a coincidence -- eyebrows angled down and inward "
        "read as angry or focused on every face this kit draws, human or "
        "robot. It's one of the cheapest, most reliable moves in the whole "
        "book: two straight lines, tilted the right way, do more emotional "
        "work than almost anything else you can draw.",
        "Every line in this lab stays safely inside the visible circle. Try "
        "moving the mouth's `hline()` down toward y=228 and running it "
        "again -- the ends disappear under the bezel before the middle "
        "does, because the screen gets narrower the further a shape sits "
        "from the vertical center. That's the round screen's signature "
        "failure mode, and it's worth seeing once on purpose.",
    ],
    mascot=None, refs=None),

dict(file="05-rect.py", slug="rect",
    title="Lab 5: Drawing Rectangles", group="primitives",
    intro=[
        "This driver splits what `framebuf` combined into one command. "
        "`display.rect(x, y, w, h, color)` always draws an outline -- there "
        "is no fill flag. `display.fill_rect(x, y, w, h, color)` is the "
        "separate call for a solid block. There's still no \"erase\" "
        "command anywhere in this kit: drawing in black **is** erasing, "
        "since black is just an unlit pixel.",
    ],
    code_lead="A border, a blocky retro face, and a mouth bar with teeth "
             "erased out of it in black:",
    image_lead="Here's what that program draws:",
    heading="The Fastest Eraser You Have",
    explain=[
        "`fill_rect(..., BLACK)` sends one long run of identical pixels, "
        "which makes it the cheapest way to take something back on a "
        "display with no frame buffer to simply overwrite in RAM. That "
        "single fact -- erasing is just filling with black, and filling a "
        "rectangle is the fastest thing this driver does -- is what makes "
        "later labs like partial redraw (Lab 29) possible at all.",
        "Try widening the border to span nearly the whole square (say, "
        "`rect(10, 10, 220, 220, WHITE)`) and run it again. The corners "
        "disappear and you're left with four disconnected arcs -- the same "
        "round-screen lesson from Lab 2, now showing up in a shape you "
        "built yourself.",
    ],
    mascot=None, refs=None),

dict(file="06-ellipse.py", slug="ellipse",
    title="Lab 6: Ellipse and Quadrant Fill Codes", group="primitives",
    intro=[
        "`shapes.ellipse(display, x, y, horz_radius, vert_radius, color, "
        "fill_flag, quad_code)` draws every eye, eyebrow arc, and mouth "
        "curve in this kit. The quadrant codes are unchanged from the OLED "
        "kit's `framebuf.ellipse()`: 1 for top-right, 2 for top-left, 4 for "
        "bottom-left, 8 for bottom-right, added together to combine "
        "quarters -- so `TOP_HALF` (3) still frowns and `BOTTOM_HALF` (12) "
        "still smiles.",
    ],
    code_lead="A filled reference ellipse, then the four quadrant "
             "combinations that matter most for a face:",
    image_lead="Here's what that program draws:",
    heading="This Ellipse Doesn't Come From the Firmware",
    explain=[
        "The OLED kit's `ellipse()` was compiled into MicroPython's "
        "`framebuf` module. This driver has no such thing, because it "
        "isn't built on `framebuf` at all -- so `shapes.ellipse()` is "
        "ordinary MicroPython, living in `shapes.py`, and you can open that "
        "file and read the whole implementation. It walks the shape one "
        "row at a time and sends each row as a single run of pixels, which "
        "is what keeps a filled eye fast on a display with no buffer to "
        "hide the cost of drawing slowly.",
        "Codes 3 and 12 are the two that matter most on a face: 3 is a "
        "frown, 12 is a smile. Two characters apart in the code, opposite "
        "feelings on the robot's face -- and Lab 25 plants exactly that bug "
        "on purpose, later, once you already know what correct looks like.",
    ],
    mascot=("thinking",
           "1 + 2 + 4 + 8 = 15, every quadrant on. Add just the ones you "
           "want and the code tells the shape exactly how much of itself "
           "to draw."),
    refs=None),

dict(file="07-circle.py", slug="circle",
    title="Lab 7: Drawing Circles", group="primitives",
    intro=[
        "A circle is an ellipse whose two radii happen to match, so "
        "`shapes.circle()` is a two-line wrapper around `shapes.ellipse()`. "
        "This lab draws every combination of outline/filled and "
        "black-on-white/white-on-black, arranged in a diamond around the "
        "center rather than a 2x2 grid -- because the four corners of a "
        "grid are exactly the four places a round screen hides.",
    ],
    code_lead="Four circles in a diamond, plus a ring following the rim "
             "itself:",
    image_lead="Here's what that program draws:",
    heading="The Shape a Round Screen Was Made For",
    explain=[
        "Every other primitive in this kit has to fight the circle a "
        "little -- a rectangle loses its corners, a horizontal line loses "
        "its ends near the top or bottom. A ring, drawn concentric with the "
        "display itself, is the one shape that follows the bezel exactly. "
        "`shapes.ring()` builds one by stacking several `circle()` outlines "
        "a pixel apart, and `face.bezel()` uses it later to frame a whole "
        "face just inside the visible edge.",
    ],
    mascot=None, refs=None),

dict(file="08-poly.py", slug="poly",
    title="Lab 8: Drawing Polygons", group="primitives",
    intro=[
        "`shapes.poly(display, x, y, point_array, color, fill_flag)` draws "
        "any shape you can list points for -- triangles, stars, a rocket, "
        "whatever you can describe as a sequence of offsets from a center "
        "point. The array type moved from `'B'` (unsigned bytes) on the "
        "OLED kit to `'h'` (signed shorts) here, since placing a shape "
        "relative to a center means half its offsets are negative.",
    ],
    code_lead="Filled and outlined versions of every shape, each placed by "
             "moving the same point array's anchor:",
    image_lead="Here's what that program draws:",
    heading="Filling a Polygon the Driver Can't Fill",
    explain=[
        "This driver has no `poly()` at all, filled or otherwise, so "
        "`shapes.poly()` has to build the fill itself -- with a **scanline "
        "fill**: for every row the shape covers, find where its edges "
        "cross that row, sort the crossings, and fill between them in "
        "pairs. That's the same algorithm essentially every 2-D graphics "
        "library on earth uses, and it fits in about twenty readable lines "
        "in `shapes.py`.",
        "A polygon is the one shape in this kit that can point in a "
        "direction, which is exactly why Lab 14 reaches for it to build a "
        "curved, angled eyebrow -- a shape no ellipse or straight line can "
        "produce on its own.",
    ],
    mascot=None, refs=None),

dict(file="09-blit.py", slug="blit",
    title="Lab 9: Blitting Buffers", group="primitives",
    intro=[
        "`display.blit_buffer(buffer, x, y, width, height)` stamps a whole "
        "block of pre-computed pixels onto the display in one shot. Build a "
        "sprite once into an off-screen buffer, then copy it wherever -- "
        "and however many times -- you need it.",
    ],
    code_lead="One eye built into a sprite, stamped twice for a matching "
             "pair, then stamped over a striped background two ways -- "
             "opaque and with the background key skipped:",
    image_lead="Here's what that program draws:",
    heading="Color Costs Memory, and Here's Where You Feel It",
    explain=[
        "On the OLED kit, a sprite was one **bit** per pixel. Here it's two "
        "**bytes** -- sixteen times more. A 64x48 eye sprite costs 6,144 "
        "bytes; a full-screen 240x240 buffer would cost 115,200, which is "
        "most of what MicroPython leaves free on an RP2040's 264 KB of "
        "RAM. That arithmetic is the real reason this driver keeps no "
        "frame buffer at all.",
        "It's also why `blit_buffer()` is **opaque** -- it has no "
        "transparency key the way `framebuf.blit()` did. `shapes.blit_keyed"
        "()` in this kit rebuilds that feature the hard way, scanning each "
        "row of the sprite for runs of non-key pixels and sending only "
        "those. Reading it once is the fastest way to understand exactly "
        "what `framebuf` was quietly doing for you on the OLED kit.",
    ],
    mascot=None, refs=None),

dict(file="10-happy-face.py", slug="happy-face",
    title="Lab 10: Happy Face", group="faces",
    intro=[
        "The first complete expression: two eyes, two eyebrows, and a "
        "curved smile, built from three small functions. Every later "
        "emotion in this kit reuses this exact pattern with different "
        "numbers -- which is the whole point, and Lab 24 turns that "
        "observation into a table.",
    ],
    code_lead="Fill the screen black, draw two filled eyes with punched "
             "pupils, two thick eyebrow lines, and a smile arc:",
    image_lead="Here's what that program draws:",
    heading="Numbers Bigger Than the OLED Kit's -- But Not by a Simple Factor",
    explain=[
        "The OLED kit was 128 pixels wide and only 64 tall -- twice as "
        "wide as it was tall -- so every face on it had to be squashed "
        "vertically to fit. This screen is 240 by 240: square, and round. "
        "The face finally gets to be face-shaped, which is why `EYE_Y`, "
        "`EYEBROW_Y`, and `MOUTH_Y` here aren't simply the OLED kit's "
        "numbers scaled up by some constant -- the whole layout was "
        "rethought for a screen with a different shape, not just a bigger "
        "one.",
        "Notice the strokes: every eyebrow line and mouth arc is drawn "
        "several times, a pixel apart, via a loop over `STROKE`. A "
        "single-pixel line is nearly invisible at this size and viewing "
        "distance; thickening it into a real stroke is what makes it read "
        "as a face feature instead of a scratch.",
    ],
    mascot=None, refs=None),

dict(file="11-eye-scanner.py", slug="eye-scanner",
    title="Lab 11: Eye Scanner", group="faces",
    intro=[
        "Sweeps both pupils back and forth by looping an x offset and "
        "redrawing on every step -- the kit's first real animation, and "
        "the first lab where this display's missing frame buffer changes "
        "how you're allowed to write the code.",
    ],
    code_lead="The mouth is drawn once, outside the loop; only the two eye "
             "boxes get erased and rebuilt on every step:",
    image_lead="Here's one frame of that sweep:",
    heading="This Is Where the Rules Actually Change",
    explain=[
        "On the OLED kit, every frame of an animation started with "
        "`oled.fill(BLACK)` and nobody noticed, because the wipe happened "
        "in RAM and the screen only ever saw the finished picture after "
        "`show()`. There is no RAM copy here and no `show()` -- a full "
        "wipe is 115,200 bytes sent down the wire, and you *watch* it "
        "happen. Do that every frame and the animation flickers hard and "
        "crawls.",
        "So this lab erases only the two eye boxes, not the whole screen. "
        "That is not an optimization saved for later, the way partial "
        "redraw is on the OLED kit (Lab 29 there) -- on this hardware it's "
        "the price of admission for any animation at all, starting here at "
        "Lab 11 instead of waiting twenty labs for the lesson.",
    ],
    mascot=None, refs=None),

dict(file="12-wink.py", slug="wink",
    title="Lab 12: Winking with a Smile", group="faces",
    intro=[
        "A closed eye is an arc -- the top half of an ellipse, drawn with "
        "quadrant mask `TOP_HALF` (3) instead of a full circle. Only the "
        "right eye closes here; the left stays open, which is what makes "
        "it read as a wink instead of a blink.",
    ],
    code_lead="The left eye and the smile are drawn once and never touched "
             "again; only the right eye's box gets erased and rebuilt:",
    image_lead="Here's what that program draws while winking:",
    heading="One Eye, Not the Whole Face",
    explain=[
        "Because only the right eye ever changes, `set_right_eye()` erases "
        "and redraws just that one region -- a small rectangle, not the "
        "screen. Time it on real hardware and a wink becomes two small "
        "boxes of work instead of two whole screens, which is exactly what "
        "keeps this animation from stuttering the way a full-screen redraw "
        "would.",
        "Left and right aren't interchangeable on a face. Try closing the "
        "left eye instead of the right and show it to a few people -- most "
        "read the two as having a slightly different tone, even though the "
        "geometry is a mirror image. Faces carry more information than the "
        "code that draws them admits to.",
    ],
    mascot=None, refs=None),

dict(file="13-blink.py", slug="blink",
    title="Lab 13: Blinking", group="faces",
    intro=[
        "Waits for a press on button A (GP14, `PULL_UP`) and closes both "
        "eyes at once -- two eyes shutting together reads as a blink, not "
        "a wink. This is the kit's first lab that reads a button at all.",
    ],
    code_lead="Debounced with a 20 ms settle check, exactly like the OLED "
             "kit's version:",
    image_lead="Here's the resting face, before any button is pressed:",
    heading="Wiring, Unchanged",
    explain=[
        "The button wiring is identical to the OLED kit: each button's "
        "other leg goes to ground, `PULL_UP` holds the pin at 1 until a "
        "press pulls it to 0, and `pressed()` waits 20 milliseconds after "
        "the first low reading before trusting it, to filter out the "
        "electrical bounce a real switch makes as its contacts settle. "
        "Nothing about buttons changed when the display did -- only the "
        "face on the other end of the wire.",
        "`set_eyes()` erases both eye boxes and redraws them open or shut, "
        "leaving the smile alone entirely. It never changes, so it never "
        "costs anything to touch.",
    ],
    mascot=None, refs=None),

dict(file="14-eyebrows.py", slug="eyebrows",
    title="Lab 14: Eyebrows with poly()", group="faces",
    intro=[
        "Builds a curved eyebrow out of a six-point polygon instead of a "
        "single straight line -- a bend that reads as far more expressive "
        "than a flat diagonal ever could.",
    ],
    code_lead="Each eyebrow is one array of offsets from the eye's center, "
             "placed with `shapes.poly()`:",
    image_lead="Here's what that program draws:",
    heading="A Filled Polygon Costs About a Dozen Rows",
    explain=[
        "`shapes.poly()` fills the eyebrow with the same scanline "
        "algorithm from Lab 8 -- one `hline()` per row the shape covers, "
        "which for a brow this size is roughly a dozen rows. That's cheap "
        "enough that a filled, curved eyebrow costs barely more than the "
        "straight-line version from Lab 10 did.",
        "Try drawing the brows with `NO_FILL` instead of `FILL`. An "
        "outlined brow is a thin wire frame, and at this size it reads as "
        "a scratch, not a brow -- which is exactly why every stroke in "
        "this kit, lines included, gets thickened rather than left as a "
        "single pixel wide.",
    ],
    mascot=None, refs=None),

dict(file="15-no-blocking.py", slug="no-blocking",
    title="Lab 15: Don't Block the Loop", group="faces",
    intro=[
        "Every earlier animated lab paced itself with `sleep()`, which "
        "freezes the entire program while it waits. This lab swaps "
        "`sleep()` for `ticks_ms()` so a face can blink on its own timer "
        "while the main loop stays free to do anything else -- like check "
        "a button, which the very next lab adds.",
    ],
    code_lead="The face blinks automatically every four seconds, without "
             "ever calling `sleep()`:",
    image_lead="Here's the resting face between blinks:",
    heading="A Second Kind of Blocking This Kit Has That the OLED Kit Didn't",
    explain=[
        "The non-blocking pattern itself is identical to the OLED kit's -- "
        "compare `ticks_diff()` against a remembered timestamp instead of "
        "sleeping through the wait. What's new is a **second** way to "
        "block that has nothing to do with `sleep()` at all: a slow "
        "**draw** blocks a loop exactly as hard as a `sleep()` call does, "
        "because `display.fill(BLACK)` takes real milliseconds to push "
        "115,200 bytes, and nothing else in the program runs while it "
        "does.",
        "So the non-blocking timer pattern here is always paired with the "
        "small-redraw pattern from Lab 11. Neither one alone is enough; a "
        "loop that never sleeps but still calls `face.clear()` on every "
        "blink is blocked in a different disguise.",
    ],
    mascot=None, refs=None),

dict(file="16-sleepy.py", slug="sleepy",
    title="Lab 16: Sleeping Face", group="faces",
    intro=[
        "Closed eyes, drooping eyebrows, a quiet round mouth, and three "
        "drifting `Zzz` characters that bob up and down as if floating "
        "away.",
    ],
    code_lead="Everything that never moves is drawn once; only the `Zzz` "
             "group's box is erased and rebuilt on every frame:",
    image_lead="Here's what that program draws:",
    heading="Where Do You Put a Sleeping Robot's Zzz's?",
    explain=[
        "On the OLED kit, the `Zzz` sat in the top-right **corner** -- an "
        "option this screen doesn't have. The obvious next choice, tucked "
        "up beside the right eye where the OLED put them, turns out to "
        "already be occupied: on this layout the right eyebrow reaches out "
        "to x=192 at almost exactly that height, so the first `Z` would "
        "land right on top of it. There's no free corner to retreat to on "
        "a circle, so the `Zzz` drift up out of the empty space below and "
        "to the right of the mouth instead.",
        "That's a real design decision forced by the shape of the screen, "
        "not an arbitrary choice -- and it's worth remembering the next "
        "time you're placing a detail near a busy part of a round layout.",
    ],
    mascot=None, refs=None),

dict(file="17-buttons.py", slug="buttons",
    title="Lab 17: Reading Two Buttons", group="controls",
    intro=[
        "Both buttons are wired exactly like the single button in the "
        "blinking lab. This lab reads them independently and keeps a "
        "running count for each, printed centered on the circle instead "
        "of tucked into a corner.",
    ],
    code_lead="Every line gets its strip erased before the new count is "
             "written, so a shorter number never leaves a stray digit "
             "behind:",
    image_lead="Here's the starting screen, before either button is "
             "pressed:",
    heading="Text Overprints -- It Does Not Replace",
    explain=[
        "With no frame buffer behind it, this driver has no concept of "
        "\"replace what was there.\" Draw the string `\"9\"` where `\"10\"` "
        "used to be and the leading `1` simply stays, because nothing told "
        "the display to paint over it. `centered()` in this lab erases the "
        "whole text strip first, every time, specifically to guard against "
        "that.",
        "Take that `fill_rect()` out and count a button past nine. Watching "
        "the old digit survive underneath the new one is a fast, memorable "
        "way to feel the difference between a buffered display and this "
        "one.",
    ],
    mascot=("warning",
           "Forgetting to erase before you redraw text is the single most "
           "common bug people bring from the OLED kit -- there, it just "
           "worked, because `fill()` reset everything on the next frame."),
    refs=None),

dict(file="18-modes.py", slug="modes",
    title="Lab 18: Mode Switching", group="controls",
    intro=[
        "Button A moves forward through a list of demo shapes; button B "
        "moves back. The `%` (modulo) operator wraps the index around "
        "automatically, so the list loops from the last entry back to the "
        "first with no extra `if` checks anywhere.",
    ],
    code_lead="Five modes, each a `(name, draw_function)` pair -- the same "
             "shape Lab 24's emotion table will generalize into data:",
    image_lead="Here's the first mode:",
    heading="Which Shapes Belong on a Round Screen?",
    explain=[
        "Step through all five modes and look for the two that feel out "
        "of place. The rectangle and the triangle both have corners "
        "pointing at a bezel that has none -- they read as slightly wrong "
        "on this screen in a way the circle and the ring never do. That's "
        "not a flaw in the code; it's a real design fact about round "
        "displays worth carrying into every layout decision from here on.",
        "Every mode switch here calls a full `display.fill(BLACK)`, and "
        "that's fine -- it happens once per button press, not sixty times "
        "a second. Knowing when a full wipe is harmless is just as useful "
        "as knowing when it isn't.",
    ],
    mascot=None, refs=None),

dict(file="19-emotion-modes.py", slug="emotion-modes",
    title="Lab 19: Expression Menu", group="controls",
    intro=[
        "The mode-switching pattern from Lab 18, applied to all seven "
        "Ekman emotions instead of demo shapes. Button A steps forward, "
        "button B steps back, and the emotion's name appears centered at "
        "the top of the circle so you always know which expression is on "
        "screen.",
    ],
    code_lead="Seven complete `draw_*()` functions, each combining eyes, "
             "eyebrows, and a mouth with its own numbers:",
    image_lead="Here's the first emotion in the menu:",
    heading="Every Function Has the Same Shape",
    explain=[
        "Open `draw_happy()`, `draw_sad()`, and `draw_angry()` side by "
        "side. Every one of them sets the eyes, sets the eyebrows, then "
        "sets the mouth -- in that order, every time. Only the *numbers* "
        "differ. That repetition is not a mistake; it's the exact pattern "
        "Lab 24 spots and collapses into a single table, so it's worth "
        "noticing here, on code you just watched yourself write, before "
        "the fix arrives.",
    ],
    mascot=None, refs=None),

dict(file="20-demo.py", slug="demo",
    title="Lab 20: Demo Reel", group="controls",
    intro=[
        "A self-running showcase that needs no buttons at all -- good for "
        "a science fair table or an open house. Cycles through all seven "
        "emotions, blinking briefly between each one so the transitions "
        "read as alive instead of a slideshow.",
    ],
    code_lead="Each emotion holds for two seconds, then a quick blink "
             "transition plays before the next one begins:",
    image_lead="Here's one frame from partway through the reel -- which "
             "emotion you land on depends on exactly when you look, since "
             "the reel never stops moving:",
    heading="A Full Wipe, on Purpose",
    explain=[
        "This is the one lab in the kit where a `display.fill(BLACK)` "
        "every couple of seconds is genuinely the right call rather than a "
        "shortcut to avoid. It happens once every two seconds, not sixty "
        "times a second, and it guarantees there's never a leftover pixel "
        "from the previous face bleeding into the next one. Compare that "
        "to Lab 11's eye scanner, which redraws dozens of times a second "
        "and could never afford the same wipe.",
    ],
    mascot=None, refs=None),

dict(file="21-sample-main-demo.py", slug="sample-main-demo",
    title="Lab 21: Sample main.py -- Self-Advancing Demo + Button Menu",
    group="controls",
    intro=[
        "Rename this file to `main.py`, copy it to the root of the board's "
        "filesystem, and the watch face becomes a standalone device -- no "
        "computer, no Thonny, just power. MicroPython looks for `main.py` "
        "a few seconds after boot and runs it automatically.",
        "It combines everything so far: the seven emotions from Lab 19, "
        "plus Blink, Wink, and Sleepy, auto-advancing every five seconds "
        "with no button press, and jumping to whatever mode you pick if "
        "you press A or B yourself.",
    ],
    code_lead="The full standalone program -- long, because it's the one "
             "file meant to run with nobody watching:",
    image_lead="Here's the demo reel's opening mode:",
    heading="Only One Full Wipe, and It's the Only One That Matters",
    explain=[
        "Read `enter_mode()` and `replay_mode()` as a pair. `enter_mode()` "
        "-- called once, whenever the mode actually changes -- is the "
        "**only** place in this whole program that calls "
        "`display.fill(BLACK)`. `replay_mode()`, called every few seconds "
        "while an animated mode like Blink or Sleepy is up, touches only "
        "the boxes that move. Get that split wrong -- call `enter_mode()` "
        "on every replay instead -- and the demo turns from a smooth loop "
        "into a visible strobe, which is exactly the mistake this lab is "
        "built to make impossible to miss.",
    ],
    mascot=None, refs=None),

dict(file="22-face-parameters.py", slug="face-parameters",
    title="Lab 22: Face Parameters -- Live Tuning", group="controls",
    intro=[
        "Every expression up to this point has used fixed numbers. This "
        "lab makes exactly one number live: button A widens the smile, "
        "button B narrows it into a frown, and the face redraws instantly "
        "so you can watch a single parameter bend the whole face's mood in "
        "real time.",
    ],
    code_lead="The eyes are drawn once and never touched again; only the "
             "mouth's box and the readout strip change on a press:",
    image_lead="Here's the starting curve:",
    heading="Instant Only Because Almost Nothing Redraws",
    explain=[
        "\"Instant\" is doing real work in that sentence. The eyes never "
        "change here, so they're drawn once and left alone for the "
        "program's whole lifetime -- only the mouth's bounding box and the "
        "small readout strip get erased and rebuilt on each press. Redraw "
        "the whole screen instead and the response stops feeling "
        "instant, even though the change itself (one number, "
        "`mouth_curve`) is exactly as small either way.",
        "`MOUTH_BOX_X/Y/W/H` are computed from the *widest possible* "
        "curve the mouth could ever reach, not the current one -- work "
        "backward from `MOUTH_CURVE_MIN`/`MAX` to see why, and shrink "
        "`MOUTH_BOX_H` on purpose to watch old pixels survive at the "
        "extremes when the box is too small.",
    ],
    mascot=None, refs=None),

dict(file="23-face-module.py", slug="face-module",
    title="Lab 23: The Face Module -- Decomposition and Abstraction",
    group="thinking",
    intro=[
        "Open Lab 19 and Lab 22 side by side. Both define their own "
        "`draw_eye()`, their own eyebrow function, their own mouth logic "
        "-- and the definitions are nearly identical. Every lab that draws "
        "a face has been carrying its own copy of the same code.",
        "This lab adds no new drawing trick at all. It moves those copies "
        "into `face.py`, one shared file every lab from here forward "
        "imports instead. That move has two names in computer science: "
        "**decomposition**, breaking a problem into parts small enough to "
        "name, and **abstraction**, hiding how a part works behind that "
        "name.",
    ],
    code_lead="Three complete expressions, in about nine lines, because "
             "`face.eyes()` already knows what an eye is:",
    image_lead="Here's the first expression:",
    heading="Count the Lines",
    explain=[
        "Lab 19 spends roughly 55 lines defining eyes, eyebrows, and "
        "mouths before it draws a single expression. This lab does the "
        "same three expressions in about a fifth of the code -- and every "
        "number you can still see in it is a number about *feeling* "
        "(how wide, how lifted, how curved), not a number about pixels. "
        "That's what abstraction buys: change `face.EYE_SPACING` once in "
        "`face.py` and every expression in every lab that imports it moves "
        "its eyes together.",
        "There's still no `show()` anywhere in this file, and there never "
        "will be again -- `face.clear()` paints black, the drawing calls "
        "go straight to the glass, and that's the entire cycle on a "
        "display with no buffer to flush.",
    ],
    mascot=("thinking",
           "Once you've named the parts -- eyes, eyebrows, a mouth -- you "
           "stop thinking in pixels and start thinking in faces. That's "
           "the whole trick behind every emotion this kit can draw."),
    refs=None),

dict(file="24-emotion-table.py", slug="emotion-table",
    title="Lab 24: The Emotion Table -- Pattern Recognition", group="thinking",
    intro=[
        "Look hard at Lab 19 again. Seven functions -- `draw_happy`, "
        "`draw_sad`, `draw_angry`, and four more -- and every one of them "
        "has the same three lines, in the same order: set the eyes, set "
        "the eyebrows, set the mouth. Only the *numbers* ever change.",
        "Spotting that is **pattern recognition**, and it pays off "
        "immediately. If seven functions differ only in their numbers, the "
        "numbers are the real content and the function is just "
        "packaging -- so put the numbers in a table, write the packaging "
        "once, and let a single function draw all seven.",
    ],
    code_lead="Eight columns per emotion, eight lines of data, and one "
             "function -- `draw_emotion()` -- that can draw any row you "
             "hand it, including a color:",
    image_lead="Here's the first row, drawn:",
    heading="One More Column Costs One More Column",
    explain=[
        "The table below adds a **color** column on top of the geometry "
        "columns, and drawing it required no new function and no change "
        "to `draw_emotion()` beyond unpacking one more name. That's the "
        "whole argument for tables over functions, proven a second time on "
        "a new axis: a brand-new dimension of expression costs exactly one "
        "column, for free.",
        "Notice that Contempt is deliberately left `WHITE`. \"No color\" "
        "is a design choice too, and a table that lets a row say so "
        "explicitly is a better table than one that forces every row to "
        "pick something.",
    ],
    mascot=("thinking",
           "Seven functions that differ only in their numbers were never "
           "seven functions -- they were one function and a table, "
           "waiting to be noticed."),
    refs=None),

dict(file="25-broken-faces.py", slug="broken-faces",
    title="Lab 25: Five Broken Faces -- Debugging", group="thinking",
    intro=[
        "Every face in this lab is broken on purpose, each by one bug "
        "real people make on this exact hardware all the time. The job is "
        "to fix all five, using a method rather than guessing: read the "
        "docstring, predict what should happen, observe what actually "
        "does, name the difference in one sentence, locate the smallest "
        "piece of code responsible, and fix one thing at a time.",
        "Three of the five bugs are different from the OLED kit's version "
        "of this same lab, and that's the lesson hiding inside the lesson: "
        "change the hardware, and you change which bugs are common.",
    ],
    code_lead="Button A moves to the next bug, button B goes back -- the "
             "bug number also prints to the shell, which matters for the "
             "first bug in particular:",
    image_lead="Here's what the lab actually shows on startup -- Bug 1, "
              "unfixed:",
    heading="This Screenshot Is Supposed to Be Blank",
    explain=[
        "Bug 1's default screen is solid black, and that's not a rendering "
        "failure -- it *is* the bug. The face draws correctly and then "
        "`face.clear()` runs one line too late, wiping it. On the OLED "
        "kit, the equivalent bug was a forgotten `show()`; here, where "
        "every draw call lands on the glass immediately, the bug had to "
        "become something a buffered display could never produce: work "
        "that gets erased the instant after it's finished, not work that "
        "never got sent at all.",
        "The other new bug worth knowing about before you go looking: Bug "
        "3 places eyes where a *rectangular* display's corners would sit "
        "comfortably. On this screen, the same coordinates fall partly "
        "off the addressable square and partly under the bezel -- and the "
        "driver never raises an error either way. Nothing warns you when a "
        "shape lands somewhere you can't see it.",
    ],
    mascot=None, refs=None),

dict(file="26-trace-and-watch.py", slug="trace-and-watch",
    title="Lab 26: Trace and Watch -- Debugging by Measurement",
    group="thinking",
    intro=[
        "Some bugs are invisible in a photograph. Lab 25's fifth bug was "
        "exactly that kind -- nothing looked wrong on screen, the program "
        "was just too slow to notice a finger. This lab turns the face "
        "into its own instrument: a heads-up display reports frame rate "
        "and live button state, both on screen and in the shell.",
    ],
    code_lead="`loops`, `fps`, and both button states, refreshed every "
             "iteration -- flip `SLOW_MODE` to `True` and watch every "
             "number fall apart:",
    image_lead="Here's the instrument panel mid-run:",
    heading="The Number That Means Something Different Here",
    explain=[
        "The OLED kit ran this same lab, and its `fps` number was almost "
        "entirely a measure of *your* code's speed, because `show()` cost "
        "the same fixed eight milliseconds no matter what you drew. Here, "
        "drawing **is** sending -- so the `fps` figure below is dominated "
        "by how many pixels you chose to touch, not by any fixed hardware "
        "cost. The same instrument, on different hardware, is measuring a "
        "different thing, which is a useful fact to know about instruments "
        "in general, not just this one.",
        "Only the eyes get erased and redrawn when blink state actually "
        "changes -- `was_blinking` guards it -- and the two instrument "
        "strips get their own small erase boxes at top and bottom, so "
        "watching the robot's vitals never costs as much as drawing the "
        "robot.",
    ],
    mascot=None, refs=None),

dict(file="27-keyframes.py", slug="keyframes",
    title="Lab 27: Keyframes -- An Animation Is Just Data", group="thinking",
    intro=[
        "Lab 24 turned seven expressions into seven rows of a table. This "
        "lab does the same trick to **motion**. An animation is really "
        "just a list of poses and how long each one holds -- which is a "
        "table -- so this lab writes one player, once, and every animation "
        "becomes three lines of data anyone on the team can tune without "
        "touching the player at all.",
    ],
    code_lead="Four animations -- Blink, Blink x2, Surprise, Doze off -- "
             "played by the same `update()` function:",
    image_lead="Here's the opening pose of the default animation:",
    heading="A Caption and an Erase Box, Fighting Over the Same Pixels",
    explain=[
        "This lab's own render caught a real bug worth knowing about: the "
        "eye-and-eyebrow erase box (`BOX_Y`, chosen to cover the highest "
        "eyebrow lift `SURPRISE` ever uses) started ten rows above the "
        "bottom of the animation's name caption. Every time `draw_frame()` "
        "erased the eyes, it silently clipped the last third of the letters "
        "sitting just above them -- no error, no warning, just letters "
        "missing their tails. The fix wasn't to move the erase box down "
        "(that would stop covering the eyebrows at their highest lift); it "
        "was to move the **label** up, out of the way, and give it its own "
        "named `LABEL_Y` instead of trusting the shared default.",
        "That's worth sitting with: two pieces of correct-looking code, "
        "each reasonable on its own, silently overlapping by exactly the "
        "wrong number of pixels. Nothing in `check-labs.py` could have "
        "caught it, because bounds-checking only asks whether a coordinate "
        "is on screen, never whether two different draws collide.",
    ],
    mascot=None, refs=None),

dict(file="28-state-machine.py", slug="state-machine",
    title="Lab 28: A Face With a Memory", group="thinking",
    intro=[
        "Lab 19's menu had no memory -- press A and you get the next "
        "emotion, forever, the same way no matter what happened ten "
        "seconds ago. Real creatures aren't like that. This lab gives the "
        "robot a **state machine**: a set of situations it can be in "
        "(`Idle`, `Curious`, `Happy`, `Annoyed`, `Asleep`) and a table of "
        "which state each event moves it to, from each starting point.",
    ],
    code_lead="Two tables -- `POSES` and `TRANSITIONS` -- and a main loop "
             "that shrinks to \"look up what happens next, then do it\":",
    image_lead="Here's the robot at rest, in its Idle state:",
    heading="What the Loop Doesn't Know",
    explain=[
        "Read the main loop and notice what it never mentions: the word "
        "\"Happy,\" the word \"Asleep,\" or anything at all about what a "
        "poke means. All of that lives entirely in the two tables. The "
        "loop just follows them -- which is exactly why adding a whole new "
        "mood later costs two rows of data, not another branch tangled "
        "into a growing pile of `if` statements.",
        "This is also the one lab in the kit that calls "
        "`display.fill(BLACK)` on every state change, and that's a "
        "defensible choice here -- states change a few times a minute at "
        "most, nothing like the sixty-times-a-second pace an animation "
        "runs at.",
    ],
    mascot=None, refs=None),

dict(file="29-partial-redraw.py", slug="partial-redraw",
    title="Lab 29: Only Redraw What Changed", group="thinking",
    intro=[
        "Ask the decomposition question that matters most on this "
        "hardware: **which pixels actually change?** This lab animates a "
        "mouth two ways -- wiping and rebuilding the whole face every "
        "frame, or erasing and redrawing only the mouth's box -- and "
        "reports the timing difference in microseconds, live, on screen.",
    ],
    code_lead="Button A toggles full versus partial redraw; button B "
             "toggles a debug color onto every erase box so you can *see* "
             "which pixels get touched:",
    image_lead="Here's the mouth mid-animation, with the debug erase color "
             "switched on:",
    heading="The Opposite Answer From the OLED Kit",
    explain=[
        "The OLED kit ran this exact lab, and its honest conclusion was "
        "\"you optimized the cheap part\" -- the driver shipped its entire "
        "frame buffer down the wire every time regardless of how little "
        "changed, so the saving was real but small. Here there is no "
        "buffer at all: every pixel you skip is a pixel that's never sent. "
        "Same optimization, same shape of code, and a completely different "
        "payoff -- which is the whole reason the measuring step in this "
        "lab is not optional. An optimization isn't fast or slow on its "
        "own; it's fast or slow **on something**, and looking is the only "
        "way to know which you have.",
        "Turn on the debug erase color and the difference stops being a "
        "number you have to trust -- a full wipe lights up the entire "
        "circle every frame; partial redraw lights up one small rectangle "
        "around the mouth. It costs nothing to look: a colored pixel and a "
        "black one are both the same two bytes.",
    ],
    mascot=("tip",
           "When a number surprises you, don't just believe it -- make it "
           "visible. A colored erase box turns \"trust me, it's faster\" "
           "into something you can watch happen."),
    refs=None),

dict(file="30-design-your-own.py", slug="design-your-own",
    title="Lab 30: Design Your Own Emotion -- The Capstone", group="thinking",
    intro=[
        "The last lab that follows a script, and the only one that "
        "doesn't tell you what to draw. Invent an expression nobody in "
        "this kit has drawn before, then find out whether a stranger can "
        "actually read it -- because a robot face is a message you send, "
        "not art you look at.",
        "The readability test here runs in three stages: your shape alone "
        "in plain white, the same shape with your chosen color added, "
        "then the name revealed. Only one thing changes between the first "
        "two stages, which is what turns this into an experiment instead "
        "of a demo.",
    ],
    code_lead="One worked example -- \"Proud\" -- filled in; two more rows "
             "are commented out, waiting for your own design:",
    image_lead="Here's the worked example, shown unlabeled -- the "
             "readability test's very first stage, exactly as a tester "
             "would see it:",
    heading="Pick the Color Last",
    explain=[
        "Choose your shape first and get it reading correctly in plain "
        "white before you ever touch a color. If color is there from the "
        "start, you'll end up tuning both at once and never know which one "
        "did the work when the test comes back positive. The three-stage "
        "test exists specifically to answer that question instead of "
        "leaving it a guess: did the color reinforce a shape that was "
        "already right, or was it quietly covering for one that wasn't?",
        "Two engineering reasons sit underneath that rule, not just taste. "
        "Roughly one boy in twelve has a red-green color deficiency, so a "
        "scheme where red means angry and green means happy says nothing "
        "at all to someone in most classrooms. And color survives a "
        "photograph, a video call, or a bright window far worse than shape "
        "does. Color may reinforce an expression. It must never be the "
        "only thing carrying it.",
    ],
    mascot=("celebration",
           "You started this kit blinking a single pin. You're finishing "
           "it designing an expression of your own, on a real round "
           "screen, and testing whether it actually lands with another "
           "person. That's the whole superpower this book is about."),
    refs=None),

dict(file="31-draw-speed-timing.py", slug="draw-speed-timing",
    title="Lab 31: How Fast Is a Face?", group="thinking",
    intro=[
        "The OLED kit's version of this lab compared a hand-written "
        "ellipse against `framebuf`'s compiled built-in, and the built-in "
        "won by roughly the gap between interpreted and compiled code. "
        "This driver has no built-in ellipse at all to compare against -- "
        "so the question changes into a better one.",
    ],
    code_lead="The same face, drawn two ways: one pixel at a time with "
             "`display.pixel()`, and once with `shapes.ellipse()`'s "
             "row-at-a-time runs -- both are ordinary MicroPython:",
    image_lead="Here's the timing report after a run:",
    heading="Fewer Conversations, Not Faster Math",
    explain=[
        "Both versions here do essentially the same amount of arithmetic "
        "-- the difference lives almost entirely in what they say to the "
        "display. Setting a drawing window costs a command and several "
        "bytes of coordinates, and a pixel-at-a-time ellipse pays that "
        "overhead on **every single pixel**. The row-based version pays it "
        "once per row instead, sending exactly the same bytes of color "
        "either way. For a filled eye roughly 24 pixels across, that's "
        "the difference between a few thousand device conversations and a "
        "few dozen.",
        "That's a lesson worth generalizing past this one lab: on any "
        "device you talk to over a bus -- a display, an SD card, a sensor "
        "-- batching your requests usually beats making the work inside "
        "each one cleverer. Lab 33's color wheel measures the exact same "
        "principle again, at a scale where it's worth eight and a third "
        "times the difference.",
    ],
    mascot=None, refs=None),

dict(file="32-color-bits.py", slug="color-bits",
    title="Lab 32: Color and Bits -- What a Number Has to Give Up",
    group="color",
    intro=[
        "On the OLED kit a pixel was one bit -- on or off, nothing to ask "
        "about it. Here a pixel is a 16-bit number, and there's a great "
        "deal to ask: `color565(red, green, blue)` takes three ordinary "
        "0-255 values and packs them into 5 bits of red, 6 of green, and "
        "5 of blue. Sixteen million colors go in; 65,536 come out.",
        "This is the one lab in the kit that couldn't have existed on a "
        "monochrome display, because the question it asks -- what does a "
        "number have to throw away to fit in a fixed number of bits -- "
        "has no answer when there's only one bit to begin with.",
    ],
    code_lead="Five views, stepped through with button A; button B prints "
             "the numbers behind whichever one is on screen:",
    image_lead="Here's the opening view, showing where the sixteen bits go:",
    heading="Why Green Gets the Extra Bit",
    explain=[
        "Your eye is not an equal-opportunity light detector. Most of "
        "your sense of brightness comes from green light, some from red, "
        "and comparatively little from blue -- so RGB565 spends its one "
        "spare bit on green, where a human is most likely to notice the "
        "difference. Count the bands in the red ramp against the green "
        "one in the second view: 32 steps against 64, a number you can "
        "read directly off the screen instead of taking on faith.",
        "The other question -- why not just store all 24 bits, the way a "
        "phone screen does -- comes down to the same arithmetic this kit "
        "keeps returning to: 240 x 240 x 2 bytes is 115,200; at 3 bytes "
        "per pixel it would be 172,800, against an RP2040's 264 KB of "
        "total RAM, most of which MicroPython is already using. That's the "
        "same constraint that explains why this driver has no frame "
        "buffer and no `show()` — this lab just puts a number on it.",
    ],
    mascot=None, refs=None),

dict(file="33-color-wheel.py", slug="color-wheel",
    title="Lab 33: The Color Wheel", group="color",
    intro=[
        "Every color this display can make, arranged in one ring -- hue "
        "as the angle around it, saturation as the distance outward, and "
        "button A stepping through three brightness levels. This is the "
        "one program in the kit whose shape and the screen's shape are "
        "the same shape: hue is an **angle**, and a color wheel *is* a "
        "circle, which is why red sits at both \"ends\" of a rainbow.",
        "It's a demo more than a fill-in-the-blanks exercise, but it earns "
        "its lab number -- it's smoke-tested with the rest, and it turned "
        "into the kit's best worked example of measuring before you "
        "optimize.",
    ],
    code_lead="`hsv_to_rgb()` converts hue/saturation/value into the red, "
             "green, and blue the display actually wants, and a `FAST` "
             "flag switches between a readable drawing function and a "
             "quick one -- both produce the same wheel:",
    image_lead="Here's the wheel at one of its three brightness levels:",
    heading="8.3x Faster, and Two Dead Ends Kept in the File",
    explain=[
        "Measured on a real Pico, the readable version takes **18.3 "
        "seconds** and 616 microseconds per pixel. The fast version takes "
        "**2.2 seconds** and 74 microseconds per pixel. About 4x of that "
        "comes from computing one color per 2x2 block instead of per "
        "pixel -- a quarter as many `atan2` and `sqrt` calls, which is "
        "exactly what you'd expect. The other roughly 2.1x comes from "
        "inlining two function calls and binding globals to local names -- "
        "**no change at all to what gets computed**, only to how the "
        "interpreter reaches it. That second number is the real finding: "
        "roughly half the original loop's cost was never arithmetic in "
        "the first place.",
        "The root cause is worth knowing before you meet it anywhere "
        "else: the RP2040 has no floating-point hardware, so every "
        "`atan2`, `sqrt`, and float multiply here runs in emulated "
        "software. This is the one program in the kit limited by "
        "arithmetic rather than by the SPI wire, which is exactly why the "
        "usual \"batch your drawing calls\" instinct -- the whole lesson "
        "of Lab 31 -- did nothing for it on its own.",
        "Two ideas that didn't work are kept in the source next to the "
        "ones that did, because a documented dead end teaches more than a "
        "quiet deletion. One reasoned correctly from a true measurement "
        "(pixels really do repeat colors) and still made things 19x "
        "worse. The other worked perfectly on a laptop and raised "
        "`TypeError` on the board, because MicroPython allows `bytes * "
        "int` but not `bytearray * int` -- a divergence no amount of "
        "testing on a computer, including everything this documentation "
        "site was built with, could ever have caught.",
    ],
    mascot=("celebration",
           "Every color this screen can make, in one picture -- and proof, "
           "measured twice, that guessing how fast code runs is no "
           "substitute for timing it."),
    refs=[("russhughes/gc9a01_mpy — the compiled driver",
          "https://github.com/russhughes/gc9a01_mpy")]),
]

GROUP_TITLES = {
    "orient": "Getting Oriented",
    "primitives": "The Drawing Primitives",
    "faces": "Building Faces",
    "controls": "Menus, Buttons, and Live Control",
    "thinking": "Thinking About Your Code",
    "color": "Color",
}

GROUP_INTRO = {
    "orient": "Confirm the board, the display, and the coordinate system "
             "before anything else depends on them.",
    "primitives": "Every drawing command `shapes.py` and the driver "
                 "together offer, one at a time.",
    "faces": "Eyes, eyebrows, mouths, and the first animations built out "
            "of them.",
    "controls": "Reading buttons, building menus, and tuning a face live.",
    "thinking": "The four habits that transfer to every program you'll "
               "ever write, taught on code you already understand: "
               "decomposition, pattern recognition, debugging, and "
               "algorithms.",
    "color": "What RGB565 actually is, and what it costs.",
}


def _em(text):
    """The prose in LAB_META was drafted with the plain-ASCII " -- " this
    repo's PYTHON COMMENTS use throughout the kit. The docs SITE's house
    style is a real em dash instead (compare docs/kits/oled/pixel/index.md).
    Applied only to prose lines this script builds itself -- never to the
    inlined .py source, which must stay byte-identical to the real file,
    ASCII dashes and all."""
    return text.replace(" -- ", " — ")


def load_manifest():
    path = os.path.join(DOCS_DIR, "_render-manifest.json")
    with open(path) as handle:
        return json.load(handle)


def render_page(meta, manifest):
    lines = ["# " + _em(meta["title"]), ""]
    lines.extend(_em(p) + "\n" for p in meta["intro"])

    lines.append("## " + ("Sample Program Code"))
    lines.append("")
    lines.append(_em(meta["code_lead"]))
    lines.append("")
    src_path = os.path.join(KIT_DIR, meta["file"])
    with open(src_path) as handle:
        source = handle.read().rstrip("\n")  # kept ASCII "--" -- real source
    lines.append("```py")
    lines.append(source)
    lines.append("```")
    lines.append("")

    entry = manifest.get(meta["slug"], {"has_image": False})
    if entry.get("has_image"):
        # A lab that HAS an image always shows it, even if this entry left
        # image_lead unset -- confirmed the hard way once already: lab 25
        # left it None meaning "I'll caption this myself" and the image
        # silently vanished instead, leaving a heading ("This Screenshot Is
        # Supposed to Be Blank") pointing at a screenshot nobody ever saw.
        lines.append(_em(meta["image_lead"] or "Here's what that program draws:"))
        lines.append("")
        lines.append("![Simulated output of " + meta["file"] + "](sample-output.png)")
        lines.append("")
        if entry.get("blank"):
            lines.append(_em(
                "> This image is genuinely blank. See the explanation below "
                "-- that is the point of this particular lab, not a broken "
                "render."))
            lines.append("")
    elif not entry.get("has_image"):
        lines.append(_em(
            "> This lab never constructs a display -- there is nothing to "
            "screenshot. See the explanation below for what it does "
            "instead."))
        lines.append("")

    lines.append("## " + _em(meta["heading"]))
    lines.append("")
    lines.extend(_em(p) + "\n" for p in meta["explain"])

    if meta.get("mascot"):
        pose, text = meta["mascot"]
        titles = {
            "welcome": "mascot-welcome \"Welcome\"",
            "thinking": "mascot-thinking \"Worth Thinking About\"",
            "tip": "mascot-tip \"Tip\"",
            "warning": "mascot-warning \"Watch Out\"",
            "encouraging": "mascot-encouraging \"Keep Going\"",
            "celebration": "mascot-celebration \"Nice Work\"",
        }
        lines.append("!!! " + titles[pose])
        lines.append("    ![Pixel](" + (MASCOT % pose) + "){ class=\"mascot-admonition-img\" }")
        lines.append("    " + _em(text))
        lines.append("")

    if meta.get("refs"):
        lines.append("## References")
        lines.append("")
        for label, url in meta["refs"]:
            lines.append("[%s](%s)" % (_em(label), url))
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def write_lab_pages():
    manifest = load_manifest()
    for meta in LAB_META:
        out_dir = os.path.join(DOCS_DIR, meta["slug"])
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "index.md")
        with open(out_path, "w") as handle:
            handle.write(render_page(meta, manifest))
        print("wrote", out_path)


def write_kit_index():
    groups = {}
    for meta in LAB_META:
        groups.setdefault(meta["group"], []).append(meta)

    lines = [
        "# Robot Faces Smartwatch Kit — List of Hands-On Labs",
        "",
        "This kit is the [OLED Two Button Kit](../oled/index.md) ported to a "
        "240x240 round color display — the same panel used in cheap "
        "smartwatches and round dev boards. Every lab number below means "
        "the same thing it does in the OLED kit, and the two are worth "
        "reading side by side: the differences between them are most of "
        "the lesson.",
        "",
        "**Board:** Raspberry Pi Pico wired to a bare GC9A01 module (also "
        "runs unchanged on a Waveshare RP2040-LCD-1.28). **Display:** "
        "GC9A01A, 240x240, round IPS, SPI, 16-bit RGB565 color. See the "
        "kit's own "
        "[README](https://github.com/dmccreary/robot-faces/tree/main/src/kits/smartwatch) "
        "for wiring, uploading, and troubleshooting.",
        "",
        "Every image on this site is a **simulated** screen — rasterized "
        "from the lab's real, current source using a tool that reproduces "
        "this driver's drawing calls pixel for pixel, masked to the "
        "circle a real GC9A01 actually shows. It is not a photograph. "
        "Always confirm on real hardware before handing a lab to "
        "students.",
        "",
        "## Why the Code Looks Different From the OLED Kit",
        "",
        "This isn't the OLED kit's code with new pin numbers. Almost "
        "every lab was rewritten, because three real differences in the "
        "hardware underneath it force different code on top of it — not "
        "stylistic choices, but things that will crash, clip, or silently "
        "do nothing if you port OLED code here by find-and-replace.",
        "",
        "| | OLED kit | Smartwatch kit | What that changes in the code |",
        "|---|---|---|---|",
        "| **Shape** | 128x64, rectangular | 240x240, **round** | The "
        "driver addresses a 240x240 square, but the glass only shows the "
        "circle inscribed in it — a coordinate can be perfectly legal and "
        "still land somewhere nobody will ever see. Every layout in this "
        "kit was worked out against `config.SAFE_RADIUS`, not just the "
        "screen's width and height. See "
        "[Screen Coordinates](screen-coordinates/index.md) and "
        "[Five Broken Faces](broken-faces/index.md). |",
        "| **Color** | 1 bit per pixel | 16-bit RGB565 | `WHITE` and "
        "`BLACK` are no longer `1` and `0` — they're `0xFFFF` and "
        "`0x0000`, and every other color is built with "
        "`config.color565(r, g, b)`. That also means a sprite costs 16x "
        "the memory it did on the OLED kit, which is most of the reason "
        "this driver keeps no frame buffer at all (next row). See "
        "[Blitting Buffers](blit/index.md) and "
        "[Color and Bits](color-bits/index.md). |",
        "| **Frame buffer** | Kept the whole screen in RAM; `show()` "
        "pushed it to the glass | **None at all** | Every drawing call "
        "goes straight down the SPI wire the instant you make it. There "
        "is no `show()` anywhere in this kit — and clearing the whole "
        "screen, free on the OLED kit, is now the single most expensive "
        "thing a lab can do. Animations erase only the box that changed, "
        "starting as early as [Lab 11](eye-scanner/index.md) instead of "
        "waiting for a dedicated optimization lab. See "
        "[Don't Block the Loop](no-blocking/index.md) and "
        "[Only Redraw What Changed](partial-redraw/index.md). |",
        "",
        "The driver itself is different too: this kit's GC9A01 has no "
        "built-in `ellipse()`, `poly()`, or font, so `shapes.py` rebuilds "
        "the first two in plain MicroPython and `config.py` imports two "
        "font modules to stand in for the third. Nothing about the "
        "*shapes* this kit draws is new — every eye, eyebrow, and mouth "
        "is the same idea as the OLED kit's — but almost everything about "
        "*how* they get onto the glass had to change to get there.",
        "",
        "## Uploading Your Code",
        "",
        "[`upload-code.sh`](https://github.com/dmccreary/robot-faces/blob/main/src/kits/smartwatch/upload-code.sh) "
        "copies everything this kit needs onto the board, in the order "
        "that matters: `lib/` first — the GC9A01 driver and the two font "
        "modules, since `config.py` fails to import without them — then "
        "`config.py` itself, then every lab. **Quit or disconnect Thonny "
        "first**; only one program can hold the Pico's serial port at a "
        "time, and `mpremote` fails outright if Thonny is still connected "
        "to it.",
        "",
        "Run it from inside the kit's own directory:",
        "",
        "```sh\n"
        "cd robot-faces/src/kits/smartwatch\n"
        "./upload-code.sh\n"
        "```",
        "",
        "A real run looks like this:",
        "",
        "```text\n"
        "NOTE: Quit or disconnect Thonny first — only one program can use the\n"
        "      Pico's serial port at a time.\n"
        "\n"
        "Checking for connected Pico...\n"
        "Multiple serial devices found; using the first:\n"
        "  /dev/cu.usbmodem14401\n"
        "  /dev/tty.usbmodem14401\n"
        "Override with: PORT=/dev/your-device ./upload-code.sh\n"
        "Using device: /dev/cu.usbmodem14401\n"
        "Uploading 3 file(s) to Pico :lib/ ...\n"
        "  -> lib/gc9a01.py\n"
        "  -> lib/vga1_8x16.py\n"
        "  -> lib/vga1_bold_16x32.py\n"
        "Uploading 38 file(s) to Pico...\n"
        "  -> config.py\n"
        "  -> 00-blink-onboard-led.py\n"
        "  -> 01-hello.py\n"
        "  ...\n"
        "  -> 33-color-wheel.py\n"
        "Done. Files on Pico:\n"
        "```",
        "",
        "That last line is followed by two `mpremote ls` listings — the "
        "board's root, then `:lib` — so you can confirm everything you "
        "expected actually landed before you disconnect and open a lab in "
        "Thonny.",
        "",
        "A few things worth knowing before you run it:",
        "",
        "- **It uploads *every* `.py` file in the directory, with no "
        "allowlist.** A stray tool or test script left in this folder "
        "gets copied onto the board along with the labs, and a Pico only "
        "has about 1.4 MB of filesystem to hold it all. Development tools "
        "belong in `src/utils/`, which is never uploaded — see the "
        "kit's own "
        "[README](https://github.com/dmccreary/robot-faces/tree/main/src/kits/smartwatch#uploading-the-code) "
        "for the full rule.",
        "- **`config-cytron-rp2040.py` is not imported by anything and "
        "still gets uploaded**, because the script has no way to tell an "
        "alternate config file apart from a lab. It's harmless taking up "
        "a few kilobytes on the board, just not automatic to enable.",
        "- **It auto-detects the port** by globbing "
        "`/dev/cu.usbmodem*`/`/dev/tty.usbmodem*` (macOS) or "
        "`/dev/ttyACM*`/`/dev/ttyUSB*` (Linux), and picks the first match "
        "if more than one shows up — which is exactly what happened in "
        "the transcript above. Override it with "
        "`PORT=/dev/your-device ./upload-code.sh` if it picks the wrong "
        "one.",
        "- **It requires [`mpremote`](https://docs.micropython.org/en/latest/reference/mpremote.html)** "
        "(`pip install mpremote`) and fails fast with a clear message if "
        "it isn't installed.",
        "",
    ]

    order = ["orient", "primitives", "faces", "controls", "thinking", "color"]
    for group in order:
        entries = groups.get(group, [])
        if not entries:
            continue
        lines.append("## " + GROUP_TITLES[group])
        lines.append("")
        lines.append(_em(GROUP_INTRO[group]))
        lines.append("")
        lines.append("| Lab | What you'll learn |")
        lines.append("|--|--|")
        for meta in entries:
            short_title = _em(meta["title"].split(": ", 1)[-1])
            summary = _em(meta["intro"][0].split(". ")[0] + ".")
            lines.append("| [%s](%s/index.md) | %s |" % (
                short_title, meta["slug"], summary))
        lines.append("")

    out_path = os.path.join(DOCS_DIR, "index.md")
    with open(out_path, "w") as handle:
        handle.write("\n".join(lines).rstrip() + "\n")
    print("wrote", out_path)


def print_mkdocs_nav():
    print()
    print("mkdocs.yml nav entries:")
    print("  - Introduction: kits/smartwatch/index.md")
    for meta in LAB_META:
        short_title = _em(meta["title"].split(": ", 1)[-1])
        print("  - %s: kits/smartwatch/%s/index.md" % (short_title, meta["slug"]))


if __name__ == "__main__":
    assert len(LAB_META) == 34, "expected 34 lab entries, found %d" % len(LAB_META)
    write_lab_pages()
    write_kit_index()
    print_mkdocs_nav()
