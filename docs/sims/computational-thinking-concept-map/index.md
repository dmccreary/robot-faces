---
title: Computational Thinking Concept Map
description: Interactive vis-network MicroSim for computational thinking concept map.
image: /sims/computational-thinking-concept-map/computational-thinking-concept-map.png
og:image: /sims/computational-thinking-concept-map/computational-thinking-concept-map.png
twitter:image: /sims/computational-thinking-concept-map/computational-thinking-concept-map.png
social:
   cards: false
quality_score: 0
---

# Computational Thinking Concept Map

<iframe src="main.html" height="602px" width="100%" scrolling="no"></iframe>

[Run the Computational Thinking Concept Map MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

Computational thinking is not a new topic you have to learn. It is a name for six
habits you have been practicing since your first `face_state` dictionary. This map
puts all six around a central hub and links each one to the exact chapter and code
example where you already used it. Click a skill to read what it means in plain
language and what separates it from the other five. Click an outer chapter node to
start from the concrete code and discover which skill it demonstrates.

## How to Use

1. Click the coral **Computational Thinking** hub in the middle for a one-paragraph
   description of the whole idea.
2. Click any teal skill node, such as **Modularity**, to open its definition, the
   job that makes it different from the other five, and where you already used it.
   Its two connections light up in coral and everything else fades.
3. Click any gray outer node, such as **Chapter 9 `draw_face()`**, to go the other
   direction: read what that code actually was, then see which skill it proves.
4. Click empty space to clear the highlight and return to the starting message.
5. Drag any node to move it. The force-directed physics gently nudges its
   neighbors out of the way.
6. Press **Reset Layout** to put every node back on its starting ring.
7. On wide screens, the navigation buttons in the lower corners pan and zoom the
   map without stealing your page scroll.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/computational-thinking-concept-map/main.html"
        height="602px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- The `face_state` dictionary and the `draw_face()` function from Chapter 9,
  which two of the outer nodes point straight back at.
- The thirteen-expression set from Chapter 10, all produced by that one function.
- Blink timing and button state machines from Chapters 12 through 14.

### Activities

1. **Exploration** (5 min): Click all six teal skill nodes in turn. For each one,
   read only the "Its own job" line and try to say out loud how that skill differs
   from the one you clicked before it.
2. **Guided Practice** (5 min): Work backward. Click each gray outer node first,
   predict which skill it demonstrates before reading the answer, then check
   yourself against the panel.
3. **Assessment** (5 min): Close the map and write down three of the six skills
   from memory. Beside each one, name the chapter where you first used it and one
   sentence on how your capstone will use it again.

### Assessment

- The student can state each of the six skills in their own words without reading
  the panel.
- Each skill is correctly paired with its earlier chapter and code example.
- The student can explain what makes decomposition different from modularity, and
  modularity different from code reuse.
- Each skill is connected to a specific, plausible use in the student's own
  capstone plan.

## References

1. [Computational thinking - Wikipedia](https://en.wikipedia.org/wiki/Computational_thinking) -
   The umbrella term and its history as a named set of problem-solving habits.
2. [Abstraction (computer science) - Wikipedia](https://en.wikipedia.org/wiki/Abstraction_(computer_science)) -
   Why representing a face as a few numbers is a design decision, not a shortcut.
3. [Modular programming - Wikipedia](https://en.wikipedia.org/wiki/Modular_programming) -
   The idea behind writing one `draw_face()` instead of thirteen near-copies.
4. [Code reuse - Wikipedia](https://en.wikipedia.org/wiki/Code_reuse) -
   The practical payoff that makes an eight-expression capstone finishable.
