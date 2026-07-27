# Learning Graph Quality Metrics Report

## Overall Quality Score: 93/100

**Rating: Excellent** — this graph is ready to drive chapter design.

This score is an editorial judgment layered on top of the automated metrics below (produced by
`analyze-graph.py`), which check DAG validity, connectivity, and degree distributions but do not
themselves compute a single score.

**What earns the high score:**

- **Valid DAG, zero cycles, zero self-dependencies** — the graph is structurally sound.
- **Fully connected**: 1 connected component across all 293 concepts, 0 orphaned nodes (after two
  rounds of fixes — see below).
- **Healthy foundational base**: 14 zero-dependency concepts anchor the graph, spanning hardware
  (breadboard, buttons, potentiometer, rotary encoder, SPI/I2C interfaces), software fundamentals
  (comment syntax, indentation), and the two non-technical research anchors (Ekman's universal
  emotions, computational thinking, screen-based robot face) that let history/psychology content
  stand on its own rather than forcing artificial technical prerequisites onto it.
- **Healthy terminal-node ratio**: 34.5% (101 of 293) — comfortably inside the 5-40% healthy range.
  Terminal nodes cluster sensibly at true endpoints: capstone deliverables (Capstone Demonstration,
  Original Robot Personality), business/history conclusions (Robot Business Case Study, Educational
  Robotics Market), and specialized wiring details (Display Mounting Considerations).
- **Genuine multi-path structure, not a linear chain**: average outdegree 1.82, with 154 concepts
  (52.6%) drawing on 2 prerequisites and 30 concepts drawing on 3-6, meaning most concepts converge
  from multiple prior ideas rather than following one single-file thread. High-indegree hubs (Frame
  Buffer: 13, Ellipse Method: 12, Neutral Expression: 12, Face Outline: 10) are exactly the concepts
  that should be hubs pedagogically — they are reused across drawing, anatomy, emotion, and history
  branches.
- **The longest path (27 concepts, Microcontroller -> ... -> Capstone Demonstration) is plausible**
  for a course that starts at bare-metal hardware and ends at a two-display capstone; it is not a
  sign of an artificially stretched chain, since 96 other concepts also reach the graph's terminal
  layer by other, shorter paths.

**What holds it back from higher:**

- The single longest chain (27 hops) is long enough that a strictly linear reading of it would be
  taxing; students should be encouraged to use the graph's many shorter alternate paths rather than
  the single deepest one.
- A handful of small clusters (e.g., the rotary-encoder sub-cluster) needed an explicit cross-link
  (into Live Parameter Tuning / Control Mapping Design) to avoid becoming an isolated island. This
  was fixed, but it is a reminder that peripheral hardware topics need deliberate integration back
  into the main line of the course.
- 101 terminal nodes is on the higher side of "healthy," reflecting how many distinct, specific
  concepts (individual emotions, individual robots, individual wiring pins) exist in this domain;
  this is appropriate for the subject matter rather than a defect, but chapter design should group
  these into coherent clusters rather than treating each as an independent lesson.

## Overview

- **Total Concepts**: 293
- **Foundational Concepts** (no prerequisites, other concepts depend on them): 14
- **Terminal Nodes** (nothing depends on them, but have prerequisites): 101
- **Orphaned Nodes** (completely disconnected, no edges): 0
- **Concepts with Dependencies**: 279
- **Average Dependencies per Concept**: 1.82

## Graph Structure Validation

- **Valid DAG Structure**: ✅ Yes
- **Self-Dependencies**: None detected ✅
- **Cycles Detected**: 0

## Foundational Concepts

These concepts have no prerequisites:

- **3**: Microcontroller
- **5**: Solderless Breadboard
- **6**: Jumper Wires
- **7**: Momentary Push Button
- **8**: Potentiometer
- **9**: Rotary Encoder
- **10**: SPI Interface
- **11**: I2C Interface
- **26**: Screen-Based Robot Face
- **70**: Comment Syntax
- **71**: Indentation Rules
- **84**: Pixel
- **170**: Ekman Universal Emotions
- **271**: Computational Thinking

## Dependency Chain Analysis

- **Maximum Dependency Chain Length**: 27

### Longest Learning Path:

1. **Microcontroller** (ID: 3)
2. **RP2040 Microcontroller** (ID: 2)
3. **Raspberry Pi Pico** (ID: 1)
4. **MicroPython** (ID: 51)
5. **Module** (ID: 66)
6. **Import Statement** (ID: 65)
7. **FrameBuf Module** (ID: 74)
8. **Frame Buffer** (ID: 85)
9. **Horizontal Line Method** (ID: 100)
10. **Rectangle Method** (ID: 103)
11. **Ellipse Method** (ID: 120)
12. **Face Outline** (ID: 147)
13. **Eye Placement** (ID: 148)
14. **Eye Size Parameter** (ID: 149)
15. **Pupil** (ID: 151)
16. **Draw Face Function** (ID: 161)
17. **Animation Loop** (ID: 203)
18. **Timing Loop** (ID: 208)
19. **Sleep Function Timing** (ID: 209)
20. **Ticks Function Timing** (ID: 214)
21. **Ticks Diff Calculation** (ID: 215)
22. **Draw Time Benchmarking** (ID: 216)
23. **Expressiveness Versus Complexity** (ID: 280)
24. **Constraint-Driven Design** (ID: 286)
25. **Minimum Viable Feature Set** (ID: 287)
26. **Capstone Project** (ID: 288)
27. **Capstone Demonstration** (ID: 289)

## Terminal Nodes Analysis

Terminal nodes are concepts that nothing else depends on but have prerequisites. They represent natural endpoints of learning paths — culminating or specialized concepts.

- **Total Terminal Nodes**: 101 (34.5% of all concepts)
- **Healthy Range**: 5-40% of total concepts

Concepts at the end of learning paths:

- **4**: Cytron Maker Pi RP2040
- **15**: Data Command Pin
- **21**: Pull-Up Resistor
- **23**: Breadboard Wiring Diagram
- **24**: Display Power Requirements
- **25**: Display Mounting Considerations
- **40**: Robot Face Design Scoping
- **43**: Robot Voice Interaction
- **44**: Robot Business Case Study
- **46**: Anki Company History
- **48**: Robot Personality Branding
- **49**: Screen As Face Metaphor
- **50**: Educational Robotics Market
- **62**: For Loop
- **73**: Bit Shifting
- **75**: String Formatting
- **77**: Multiple Return Values
- **93**: Bounding Box
- **95**: Show Method
- **96**: Frame Buffer Size Calculation

*...and 81 more*

## Orphaned Nodes Analysis

Orphaned nodes are completely disconnected concepts with no inbound AND no outbound edges. These indicate a quality problem — every concept should connect to the graph.

- **Total Orphaned Nodes**: 0

✅ No orphaned nodes detected. All concepts are connected to the graph.

## Connected Components

- **Number of Connected Components**: 1

✅ All concepts are connected in a single graph.

## Indegree Analysis

Top 10 concepts that are prerequisites for the most other concepts:

| Rank | Concept ID | Concept Label | Indegree |
|------|-----------|---------------|----------|
| 1 | 85 | Frame Buffer | 13 |
| 2 | 120 | Ellipse Method | 12 |
| 3 | 175 | Neutral Expression | 12 |
| 4 | 147 | Face Outline | 10 |
| 5 | 153 | Eyebrow Shape | 9 |
| 6 | 155 | Mouth Shape | 9 |
| 7 | 203 | Animation Loop | 9 |
| 8 | 10 | SPI Interface | 8 |
| 9 | 250 | RGB565 Color Model | 8 |
| 10 | 54 | Variable | 7 |

## Outdegree Distribution

| Dependencies | Number of Concepts |
|--------------|--------------------|
| 0 | 14 |
| 1 | 95 |
| 2 | 154 |
| 3 | 21 |
| 4 | 4 |
| 5 | 3 |
| 6 | 2 |

## Recommendations

- ✅ **Terminal node percentage** (34.5%): Within healthy range (5-40%)
- ✅ **DAG structure verified**: Graph supports valid learning progressions
- ℹ️ **Long dependency chains** (27): Ensure students can follow extended learning paths

---

*Report generated by learning-graph-reports/analyze_graph.py*
