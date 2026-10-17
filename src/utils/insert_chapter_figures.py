#!/usr/bin/env python3
"""Insert figure references into the chapter pages in docs/chapters/.

A one-time authoring helper, kept so the placements are reviewable and
repeatable. Each INSERTIONS row names a chapter, a section heading, where in
that section the figure goes, and the lead-in sentence plus alt text. Running
it twice is safe: a figure whose image file name already appears in the
chapter is skipped.

    python3 src/utils/insert_chapter_figures.py --dry-run
    python3 src/utils/insert_chapter_figures.py
"""

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHAPTERS = ROOT / "docs" / "chapters"

# where:
#   ("code", n)       after the n-th (0-based) code block in the section
#   ("para", phrase)  after the paragraph that contains `phrase`
#   ("heading",)      after the section's first paragraph
# path: image path relative to the chapter's index.md
INSERTIONS = [
    # ---- Chapter 5 -----------------------------------------------------------
    ("05-display-coordinate-systems", "## What Is a Pixel?", ("para", "staircase of individually lit squares"),
     "Zoom in on the curve of a small ellipse and the staircase shows up. Each square below is one pixel, "
     "and the numbers along the edges are their coordinates:",
     "pixel-staircase.png",
     "The top half of a small ellipse enlarged until each pixel is a visible square on a grid, with x and y coordinates along the edges"),
    ("05-display-coordinate-systems", "## The Origin Sits in the Upper-Left Corner", ("heading",),
     "Here are the four corners of the 128x64 OLED, with the lit pixels circled. Notice that the largest "
     "`y` value is 63, not 64, because counting starts at 0:",
     "screen-corners.png",
     "The OLED screen with arrows showing x increasing to the right and y increasing downward, and the four corner pixels labeled (0, 0), (127, 0), (0, 63) and (127, 63)"),
    ("05-display-coordinate-systems", "## Framing a Shape: The Bounding Box", ("heading",),
     "Here is that left eye, a filled circle with an orange bounding box drawn around it:",
     "bounding-box.png",
     "A white filled circle on the black OLED screen with an orange rectangle outlining its bounding box"),
    ("05-display-coordinate-systems", "## Nothing Happens Until You Call .show()", ("code", 0),
     "Zoomed in on the middle of the screen, here is the one pixel that code switches on:",
     "center-pixel.png",
     "A grid of enlarged pixels with one lit pixel highlighted and labeled (64, 32)"),

    # ---- Chapter 6 -----------------------------------------------------------
    ("06-basic-drawing-primitives", "## The Pixel Method: One Dot at a Time", ("code", 0),
     "That is one lit pixel, circled so you can find it:",
     "pixel-method.png", "The OLED screen with a single lit pixel at its center, circled in orange"),
    ("06-basic-drawing-primitives", "## Straight Lines the Fast Way: Horizontal and Vertical Line Methods", ("code", 0),
     "Here is what those two calls draw:",
     "hline-vline.png", "A flat horizontal line near the bottom of the screen and a tall vertical line down its left edge"),
    ("06-basic-drawing-primitives", "## Lines at Any Angle: The Line Method", ("code", 0),
     "Here is that diagonal, with every step of the pixel staircase visible:",
     "diagonal-line.png", "A diagonal line running from the top-left corner down and to the right"),
    ("06-basic-drawing-primitives", "## Rectangles: Outlines and Filled Shapes", ("code", 0),
     "Here are the two rectangles side by side:",
     "rectangles.png", "An outlined rectangle on the left and a solid filled rectangle on the right"),
    ("06-basic-drawing-primitives", "## Safety Net: Clipping at the Screen Edge", ("code", 0),
     "The rectangle simply runs off the right edge, and nothing breaks:",
     "clipping.png", "A rectangle outline near the right edge of the screen, cut off where the screen ends"),
    ("06-basic-drawing-primitives", "## Labeling Your Work: The Text Method", ("code", 0),
     "Each character fills an 8-by-8 pixel cell, so this label spans eight characters in the upper-left corner:",
     "text-label.png", "The text BATT 82% in the upper-left corner of the screen"),
    ("06-basic-drawing-primitives", "## Order Matters: Draw Order Layering and Overdraw", ("para", "disappears from view completely"),
     "Here are both orders side by side. The only difference is which shape is drawn first:",
     "draw-order.png",
     "Two screens: on the left a solid white face plate with no eye because the eye was drawn first and covered, and on the right the same plate with a black square eye visible on top"),
    ("06-basic-drawing-primitives", "## Putting It Together: An Eyebrow and a Mouth", ("code", 0),
     "Two shapes, and the beginning of a face:",
     "eyebrow-and-mouth.png", "A short filled rectangle eyebrow above a long thin horizontal line mouth"),

    # ---- Chapter 7 -----------------------------------------------------------
    ("07-ellipse-polygon-drawing", "## Drawing Curves: The Ellipse Method", ("code", 0),
     "Here is that ellipse, centered on the screen:",
     "one-ellipse.png", "An outlined ellipse, wider than it is tall, centered on the screen"),
    ("07-ellipse-polygon-drawing", "## Independent Radii: The Ellipse Radius Parameter", ("code", 0),
     "Three radii settings, three very different shapes:",
     "independent-radii.png", "Three outlined shapes: a wide flat oval, a tall narrow oval, and a circle"),
    ("07-ellipse-polygon-drawing", "## Solid or Hollow: Filled Versus Outlined Shape", ("code", 0),
     "The outlined pupil is on the left and the filled one is on the right:",
     "filled-vs-outline.png", "An outlined circle on the left and a solid white circle on the right"),
    ("07-ellipse-polygon-drawing", "## The Real Trick: Quadrant Fill Code", ("code", 0),
     "The top shape is the sleepy eye and the bottom one is the smile:",
     "smile-and-sleepy-eye.png",
     "A white half-circle dome above a wide white half-ellipse bowl, like a sleepy eyelid over a smile"),
    ("07-ellipse-polygon-drawing", "## Beyond Curves: The Poly Method", ("code", 0),
     "Here is that first triangle, tucked into the top-left corner:",
     "first-triangle.png", "A small white triangle in the top-left corner of the screen"),
    ("07-ellipse-polygon-drawing", "## Points in a List: The Point Array", ("code", 0),
     "Five points make a pentagon:",
     "pentagon.png", "A white filled pentagon near the top center of the screen"),
    ("07-ellipse-polygon-drawing", "## A Concrete Example: Triangle Eyebrow Shape", ("code", 0),
     "Both eyebrows slope down toward the center of the face:",
     "angry-eyebrows.png", "Two white wedge-shaped eyebrows whose inner ends slope downward toward the middle, an angry look"),
    ("07-ellipse-polygon-drawing", "## Corners Without the Sharp Edges: Rounded Rectangle Approximation", ("code", 0),
     "Here is the finished shape, with its corners softened:",
     "rounded-rectangle.png", "A solid white rectangle with rounded corners"),
    ("07-ellipse-polygon-drawing", "## Approximating Curves With Lines", ("code", 0),
     "Here is the arc. Notice the straight line along the bottom: `fb.poly()` always closes a shape, "
     "so it joins the last point back to the first.",
     "arc-from-lines.png", "A dome-shaped arc made of nine short line segments, with a straight line closing its base"),
    ("07-ellipse-polygon-drawing", "## Putting It Together: An Eye, an Eyelid, and an Eyebrow", ("code", 0),
     "The eyelid hides the top half of the eye, and the slanted eyebrow sits above it:",
     "eye-eyelid-eyebrow.png", "A half-closed white eye with a slanted white eyebrow above it"),

    # ---- Chapter 9 -----------------------------------------------------------
    ("09-facial-anatomy-layout-design", "## The Boundary of a Face: Face Outline", ("code", 0),
     "Here is the outline, with its margin of breathing room around the edge of the screen:",
     "face-outline.png", "A large outlined ellipse that fills most of the screen without touching its edges"),
    ("09-facial-anatomy-layout-design", "## Mirror Image: Facial Symmetry", ("code", 0),
     "Here are the two eyes that code places, with a dotted line marking the centerline they mirror across:",
     "eye-symmetry.png", "Two white circles, one on each side of a dotted vertical centerline, equally far from it"),
    ("09-facial-anatomy-layout-design", "## A Point of Focus: Pupil and Pupil Size Parameter", ("code", 0),
     "Slide `gaze_offset_x` from -4 to 4 and the pupils glance from one side to the other:",
     "pupil-gaze.png", "Three faces with only eyes: pupils shifted left, centered, and shifted right"),
    ("09-facial-anatomy-layout-design", "## Half-Closed and Sleepy: Eyelid Representation", ("code", 0),
     "Here are the same two eyes before and after the eyelid is drawn:",
     "eyelid.png", "Two white round eyes, then the same eyes with their top halves covered so only the lower half-circles remain"),
    ("09-facial-anatomy-layout-design", "## Shaping a Mood: Eyebrow Shape and Eyebrow Angle Parameter", ("code", 0),
     "Here is one pair of eyebrows at three angles:",
     "eyebrow-angles.png", "Three pairs of eyebrows: tilted one way at -30 degrees, flat at 0, and tilted the other way at 30"),
    ("09-facial-anatomy-layout-design", "## Curving a Mouth: Mouth Shape, Mouth Curvature Parameter, and Bottom-Half Mouth Curve", ("code", 0),
     "Positive curvature smiles, zero flattens, and negative curvature frowns:",
     "smile-and-frown.png", "Three mouths: a curved smile, a flat line, and a downturned frown"),
    ("09-facial-anatomy-layout-design", "## Putting Every Piece Together: The Draw Face Function", ("para", "staying independent of the others"),
     "Here is the neutral face that `draw_face()` produces from `default_face_state()`:",
     "default-face.png",
     "A complete face on the OLED: an oval outline, two flat eyebrows, two round eyes with dark pupils, and a smiling mouth"),

    # ---- Chapter 10 ----------------------------------------------------------
    ("10-emotion-theory-core-expressions", "### Sad Expression", ("code", 0),
     "Here are the neutral, happy, and sad faces drawn by Chapter 9's `draw_face()`, so you can see what a flipped "
     "`mouth_curvature` does:",
     "neutral-happy-sad.png", "Three faces: a neutral face, a happy face with a wide smile, and a sad face with a downturned mouth"),
    ("10-emotion-theory-core-expressions", "## Recipe Reference: All Thirteen Expressions at a Glance", ("para", "Default rest state"),
     "The recipes above are the design. The OLED kit's expression menu is one way to build them. Here are its seven "
     "Ekman expressions, one frame per press of button A:",
     "kit-seven-expressions.png",
     "Seven robot faces on the OLED labeled Happy, Sad, Angry, Afraid, Surprised, Disgusted and Contempt"),

    # ---- Chapter 11 ----------------------------------------------------------
    ("11-expression-design-readability-hri", "## Not a Light Switch: Expression Intensity", ("code", 0),
     "Here are the neutral face and both happy faces. They are the same expression at two strengths:",
     "subtle-vs-intense.png", "Three faces: neutral, a subtly happy face, and an intensely happy face with a bigger smile and higher eyebrows"),

    # ---- Chapter 12 ----------------------------------------------------------
    ("12-animating-expressions", "## Your First Animation: Blinking Animation", ("code", 0),
     "Here are the two states the loop switches between, eyes open and 150 milliseconds later with the eyelids down:",
     "blink-frames.png", "A face with round open eyes, then the same face with both eyes shut under lowered eyelids"),
    ("12-animating-expressions", "## Looking Around: Eye Scanner Animation and Pupil Movement Gaze", ("code", 0),
     "Here are three moments from that sweep, with the pupils at -6, 0, and 6:",
     "gaze-sweep.png", "Three faces looking left, straight ahead, and right"),
    ("12-animating-expressions", "## Getting From Here to There Smoothly: Expression Interpolation and Easing Function", ("code", 0),
     "Here are five steps from neutral to happy, from `t = 0` to `t = 1`. The values are rounded to whole pixels for drawing:",
     "interpolation-steps.png", "Five faces showing the smile growing step by step from a flat mouth to a wide smile"),

    # ---- Chapter 13 ----------------------------------------------------------
    ("13-interactive-controls-inputs", "## Checking Every Frame: The Polling Input Loop", ("code", 0),
     "The OLED kit's Lab 17 polls both buttons the same way. Here is its screen at power-up, "
     "after one press of A, and after A twice and B once:",
     "two-button-counter.png", "Three screens titled Two Buttons that count presses: 0 and 0, then A 1 and B 0, then A 2 and B 1"),

    # ---- Chapter 14 ----------------------------------------------------------
    ("14-expression-menu-live-controls", "## Building the Menu: Multi-Mode Menu and Expression Selection Menu", ("heading",),
     "The OLED kit's Lab 19 is a working expression menu. Here it is stepping through its first expressions, "
     "one press of button A at a time:",
     "kit-expression-menu.png", "Four faces labeled Happy, Sad, Angry, and Surprised, shown as button A is pressed"),

    ("08-framebuf-version-history", "## Faking Curves With Straight Lines", ("code", 1),
     "Here are both circles, drawn by the code above. The workaround traces an outline in short straight segments, "
     "while `ellipse()` fills the whole shape in one call:",
     "workaround-vs-ellipse.png",
     "Two screens: on the left a circle outline made of 24 short straight line segments, on the right a solid white filled circle"),
    ("11-expression-design-readability-hri", "## When One Face Could Mean Two Feelings: Expression Ambiguity", ("para", "Afraid and surprised are the clearest example"),
     "Here are the OLED kit's afraid and surprised faces side by side. Cover the labels and try telling them apart:",
     "afraid-vs-surprised.png",
     "Two faces labeled Afraid and Surprised, both with wide eyes and raised eyebrows and an open mouth, differing mainly in eye size and eyebrow lift"),

    # ---- Existing photos and diagrams from docs/img --------------------------
    ("01-hardware-electronics-foundations", "## Welcome to Robot Faces", ("para", "Welcome to Robot Faces. Over the chapters ahead"),
     "Here is where the chapters are heading: a small wheeled robot with a display for a face.",
     "../../img/facebot-23.jpg", "A small wheeled robot with a circuit board on top and a screen on the front showing a smiling face with wide eyes"),
    ("01-hardware-electronics-foundations", "## The Brains of the Operation: Microcontrollers", ("para", "The **Raspberry Pi Pico** is a $4 circuit board"),
     "Here is the board itself, about the length of a pinky finger:",
     "../../img/raspberry-pi-pico.png", "A green Raspberry Pi Pico circuit board with two rows of pins along its edges and a USB connector"),
    ("01-hardware-electronics-foundations", "## Building Circuits Without Solder", ("heading",),
     "Here is a small solderless breadboard, with its rows of holes and the long power rails down each side:",
     "../../img/solderless-mini-breadboard.jpg", "A white half-size solderless breadboard with a grid of holes and red and blue power rail lines"),
    ("01-hardware-electronics-foundations", "## Pricing Out Your Kit", ("heading",),
     "Cost is a design choice too. The goal is the top-left corner of this chart: as much fun as possible for as little money as possible.",
     "../../img/value-design.png", "A chart with Cost from $10 to $1,000 on the horizontal axis and Fun on the vertical axis, with an arrow from low value in the bottom right to high value in the top left"),
    ("02-history-of-robot-faces", "## Miko: An Educational Robot Built to Last", ("heading",),
     "Here are nine of Miko's expressions, each labeled with its emotion:",
     "../../img/miko-faces.png", "Nine faces of the Miko robot labeled Neutral, Happy, Sad, Angry, Afraid, Surprise, Tired, Stern and Disgust"),
    ("03-micropython-fundamentals-1", "## Meet Thonny: Your MicroPython Editor", ("para", "Confirm the connection worked"),
     "You can also pick the interpreter in Thonny's options window, on the Interpreter tab. Choose "
     "MicroPython (Raspberry Pi Pico) and leave the port on automatic detection:",
     "../../img/thonny-interpreter.png", "Thonny's options window on the Interpreter tab with MicroPython (Raspberry Pi Pico) selected and the port set to detect automatically"),
    ("06-basic-drawing-primitives", "## Putting It Together: An Eyebrow and a Mouth", ("para", "](eyebrow-and-mouth.png)"),
     "Rectangles and lines go a long way. Here is a face built only from them, on a real display:",
     "../../img/square-face.png", "A photographed display showing a face with two rectangular eyes, a thin horizontal line for a mouth, and a red rectangular smile below"),
    ("07-ellipse-polygon-drawing", "## Drawing Curves: The Ellipse Method", ("para", "](one-ellipse.png)"),
     "Here is how each parameter of `fb.ellipse()` maps onto the shape:",
     "../../img/ellipse-parameters.png", "A diagram of an ellipse with its horizontal radius and vertical radius marked from the x, y center point"),
    ("07-ellipse-polygon-drawing", "## The Real Trick: Quadrant Fill Code", ("para", "| Lower right | bottom-right quarter | 8 |"),
     "And here is the same table as a picture. Each quarter of the ellipse carries its own number:",
     "../../img/ellipse-quadrants.png", "An ellipse divided into four quadrants numbered 2 and 1 across the top and 4 and 8 across the bottom"),
    ("07-ellipse-polygon-drawing", "## Beyond Curves: The Poly Method", ("para", "](first-triangle.png)"),
     "The same method draws every shape you can list points for. Here are triangles, pentagons, hexagons, stars, "
     "and an arrow on a real display:",
     "../../img/polygons.jpg", "A photographed display filled with green outlined and solid polygons: triangles, pentagons, hexagons, octagons, stars, an arrow and a house shape"),
    ("09-facial-anatomy-layout-design", "## One Face, Built From Everything You Know", ("para", "Chapter 6 taught you rectangles"),
     "Here is the kind of face this chapter builds, running on a real 128x64 OLED:",
     "../../img/robot-face-01.jpg", "A photographed OLED showing a robot face with two wide cyan eyes with dark pupils and a curved smile"),
    ("10-emotion-theory-core-expressions", "## A Short List, Recognized Everywhere: Ekman Universal Emotions", ("para", "- Contempt (Ekman's later"),
     "Here are photographs of seven of these expressions, each labeled with its emotion:",
     "../../img/people-faces.png", "Seven photographed faces labeled Anger, Contempt, Disgust, Enjoyment, Fear, Sadness and Surprise"),
    ("12-animating-expressions", "## Looking Around: Eye Scanner Animation and Pupil Movement Gaze", ("para", "](gaze-sweep.png)"),
     "And here is a gaze sweep running on real hardware:",
     "../../img/eye-scanner.gif", "An animation of a robot face on a real display with its pupils sweeping from side to side"),
    ("15-porting-faces-color-display", "## Round Display Layout", ("heading",),
     "Here is a face on a real round display, with the code that drew it open in the editor behind it:",
     "../../img/watch-face.jpg", "A hand holding a small round display showing a smiling face with white eyes and blue pupils, in front of a laptop screen of MicroPython code"),
]

HEADING = re.compile(r"^(#{1,6}) ")


def section_bounds(lines, heading):
    start = next((i for i, l in enumerate(lines) if l.strip() == heading), None)
    if start is None:
        raise SystemExit(f"heading not found: {heading!r}")
    level = len(HEADING.match(heading).group(1))
    end = len(lines)
    in_fence = False
    for i in range(start + 1, len(lines)):
        if lines[i].lstrip().startswith("```"):
            in_fence = not in_fence
        m = HEADING.match(lines[i])
        if not in_fence and m and len(m.group(1)) <= level:
            end = i
            break
    return start, end


def paragraph_end(lines, i):
    """Index just past the paragraph (or block) containing line i."""
    while i < len(lines) and lines[i].strip() != "":
        i += 1
    return i


def insertion_point(lines, heading, where):
    start, end = section_bounds(lines, heading)
    kind = where[0]
    if kind == "code":
        fences = [i for i in range(start, end) if lines[i].startswith("```")]
        opening = fences[2 * where[1]]
        closing = fences[2 * where[1] + 1]
        return closing + 1
    if kind == "para":
        hits = [i for i in range(start, end) if where[1] in lines[i]]
        if len(hits) != 1:
            raise SystemExit(f"{heading}: phrase {where[1]!r} found {len(hits)} times")
        return paragraph_end(lines, hits[0])
    if kind == "heading":
        i = start + 1
        while lines[i].strip() == "":
            i += 1
        return paragraph_end(lines, i)
    raise SystemExit(f"unknown where {where!r}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    by_chapter = {}
    for row in INSERTIONS:
        by_chapter.setdefault(row[0], []).append(row)

    for chapter, rows in by_chapter.items():
        path = CHAPTERS / chapter / "index.md"
        text = path.read_text()
        for _, heading, where, lead, image, alt in rows:
            if f"]({image})" in text:
                print(f"skip   {chapter}/{image} (already placed)")
                continue
            lines = text.split("\n")
            at = insertion_point(lines, heading, where)
            block = ["", lead, "", f"![{alt}]({image})"]
            lines[at:at] = block
            text = "\n".join(lines)
            print(f"place  {chapter}/{image}  after line {at}")
        if not args.dry_run:
            path.write_text(text)


if __name__ == "__main__":
    main()
