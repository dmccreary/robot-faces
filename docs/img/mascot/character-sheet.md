# Character Sheet: Pixel the Round-Face Robot

The canonical identity document for Pixel, the pedagogical mascot for the
**Robot Faces: Drawing Expressive Displays for STEM Robots** textbook.
Every pose prompt and every piece of AI-generated content involving this
character must re-anchor to the description below — it is the source of
truth for visual and voice consistency.

## Identity

- **Name:** Pixel
- **Species:** Round-Face Robot
- **Subject:** Robot Faces / expressive embedded displays
- **Catchphrase:** "Every pixel tells a story!"

## Visual Description

- **Body color:** White / light gray chassis — hex `#ECEFF1`
- **Accent color:** Vivid teal — hex `#00BFA5`
- **Secondary accent:** Warm coral/orange — hex `#FF7043` (used for glows, mouth highlights, celebration effects)
- **Clothing / accessories:** None — a thin rainbow-gradient accent ring runs around the outer edge of the circular bezel
- **Expression:** Calm, friendly, curious by default; expression changes via the eyes, pupils, eyebrows, and mouth drawn on the circular screen "face"
- **Size proportion:** Small and compact, chibi-proportioned — a large circular head-body relative to short limbs, icon-sized
- **Art style:** Flat modern vector illustration, clean bold outlines, soft cel-shading, transparent background

## Body Structure

Pixel has no separate torso — its entire head *is* its body: a circular
color display (echoing the course's 240x240 GC9A01 round display) set
inside a chunky rounded white bezel with a thin rainbow-gradient accent
ring. Two short, jointed arms extend from the left and right sides of the
disc, each ending in a simple three-fingered rounded hand. Two stubby legs
extend from the bottom of the disc, each ending in a rounded foot. Pixel
always stands or gestures using these four limbs; the disc itself may tilt
a few degrees to convey head-like body language (e.g., a curious tilt).

## The On-Screen Face

The face shown on Pixel's circular screen is built from the same
independently parameterized features taught in the book: two eyes with
pupils, two independently-angled eyebrows, and a mouth whose curvature
changes per emotion, drawn as clean vector arcs (as if drawn with
`ellipse()` and `poly()`). The screen's background glow shifts subtly per
pose to reinforce the emotional tone.

## Personality

- Curious
- Encouraging
- Precise
- Playful

## Voice

- Uses simple, encouraging language geared to high-school and coding-club readers
- Naturally references pixels, screens, and drawing (e.g., "Let's draw that expression," "Watch the pupils move")
- Keeps dialogue brief (1-3 sentences)
- Signature phrases: "Every pixel tells a story!", "Let's draw some feelings.", "Great expression!"

## Pose Set

| Pose | Filename | Use |
|------|----------|-----|
| Neutral | `neutral.png` | General-purpose / sidebars |
| Welcome | `welcome.png` | Chapter openings |
| Thinking | `thinking.png` | Key concepts |
| Tip | `tip.png` | Hints and helpful guidance |
| Warning | `warning.png` | Common mistakes / pitfalls |
| Encouraging | `encouraging.png` | Difficult content / struggle |
| Celebration | `celebration.png` | End of chapter / achievements |

See [`image-prompts.md`](image-prompts.md) for the full text of each pose
prompt. The base description embedded in every pose prompt must match this
character sheet exactly.

## Why This Mascot

Pixel's head is literally the round color display students learn to
program in this course, and its on-screen face is built from the exact
same parameterized parts (eyes, pupils, eyebrows, mouth) taught in the
Facial Anatomy and Emotion Theory chapters. Small arms and legs give Pixel
body language beyond the screen alone, echoing the commercial
screen-faced social robots (Cozmo, Vector, Miko, Buddy) discussed in the
course.
