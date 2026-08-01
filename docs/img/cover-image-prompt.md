# Cover Image Prompt

Please generate a professional-quality cover image for this textbook.
This image will be used in social media previews and must follow the
formatting guidelines for an Open Graph image preview.

**Required specifications:**
- Format: PNG
- Wide-landscape format
- Size: 1200x630 pixels (1.91:1 aspect ratio)
- This is the Open Graph standard for social media previews

The image has four layers, back to front: background montage, color
treatment, mascot, and title text.

## Subject & Tone

**Robot Faces** is a textbook that teaches high school students to program expressive,
emotion-showing robot faces on two low-cost hardware displays (a $20 monochrome OLED and
a $10 color round display) using a Raspberry Pi Pico and MicroPython. Students learn to
decompose a face into independently parameterized parts — eyes, pupils, eyebrows, and a
mouth — and combine them into recognizable emotional expressions grounded in Paul Ekman's
research on universal emotions, referencing commercial screen-faced robots like Anki's
Cozmo and Vector. The intended audience is high school students (grades 9-12) in STEM,
robotics, or coding clubs, with no prior programming experience required. The visual tone
should be **playful and technical** — approachable enough for a first-time coder, but
clearly rooted in real embedded-electronics and drawing-code craftsmanship, not childish.

## Title

Place **Robot Faces** in the center of the image, in a clean, highly legible sans-serif
font, large and bold. Below it, in a smaller weight, set the subtitle **Drawing
Expressive Displays for STEM Robots**. Use a light/white font color with a subtle drop
shadow or dark scrim behind both lines so they stay readable against the busy montage
background. Keep the main title short enough to render at a large size — do not shrink
it to fit; simplify the background directly behind the text instead.

## Background Montage

Arrange a montage of the following 8 concepts around the title, each rendered in a
consistent illustration style (see Style below) so the composition reads as one image
rather than a collage of unrelated styles:

- **Robot Expression Grid** — a horizontal row of three or four small round-screen robot
  heads, each showing a different minimalist glowing expression (happy upturned eyes,
  sad downturned eyes, surprised wide-open eyes, angry angled eyebrows) rendered as
  simple glowing cyan/teal shapes on a dark screen — echoes the many emotional faces
  students learn to draw.
- **Raspberry Pi Pico Board** — a small green microcontroller board with two rows of
  gold header pins along its long edges and a single black chip in the center,
  simplified into flat vector style.
- **Round Color Display Module** — a small circular color screen mounted on a blue
  PCB tab with a short ribbon of SPI connector pins, echoing the 240x240 round display.
- **Ellipse Drawing Diagram** — a simple gray ellipse shape labeled with "x", "y",
  "horizontal radius", and "vertical radius" arrows, evoking the `ellipse()` drawing
  primitive used to build eyes and mouths.
- **OLED Screen Coordinate Grid** — a small blue rectangular screen with two white
  circular "eyes" and faint coordinate axis tick marks/labels at its corners, echoing
  the monochrome OLED coordinate system.
- **MicroPython Code Snippet** — a short, faint block of monospace code resembling a
  `draw_face()` function definition, rendered small and slightly desaturated so it reads
  as texture rather than something requiring paragraph-level legibility.
- **Breadboard & Jumper Wires** — a solderless breadboard with a few colorful jumper
  wires connecting to a small display module, evoking the hands-on hardware build.
- **Blinking Eye Animation Frames** — a short sequence of three small circles (open,
  half-closed, closed) side by side with a subtle motion arrow, evoking the blinking
  animation students program.

## Mascot

Place the book's mascot, Pixel, in the lower-left corner, sized so it does not overlap
the title text. Use the attached reference image (`docs/img/mascot/welcome.png`) for
exact likeness. Pixel is a round-face robot whose entire body is a circular color
display: a white/light-gray chassis (`#ECEFF1`) in a chunky rounded bezel ringed by a
thin rainbow-gradient accent line, with a vivid teal (`#00BFA5`) waving hand, two short
jointed arms, two stubby legs, and a simple friendly face (round eyes with pupils,
curved eyebrows, an open smiling mouth) drawn on its circular screen. Flat modern vector
illustration style with clean bold outlines and soft cel-shading, matching the reference
image exactly.

## Style & Composition

- Illustration style: flat modern vector illustration with clean bold outlines and soft
  cel-shading — apply this same style to every montage element for visual consistency
  with the mascot.
- Color palette: deep navy-blue background, with vivid teal (`#00BFA5`) and warm
  coral/orange (`#FF7043`) accents drawn from the mascot's own color scheme.
- Lighting/mood: bright, energetic, and optimistic — glowing screen elements against
  the dark background for a "screens come alive" feel.
- Composition: title centered with generous negative space immediately behind it,
  montage elements arranged in a loose ring or grid around the title, Pixel in the
  lower-left corner.

## Avoid

- Do not render dense paragraphs of illegible text anywhere in the image.
- Avoid generic stock-photo cliches (handshakes, isolated lightbulbs, people pointing at
  whiteboards).
- Avoid photorealistic human faces or photorealistic product photography — keep every
  montage element in the same flat vector illustration style as the mascot.
- Do not let montage elements visually compete with or overlap the title or Pixel.
