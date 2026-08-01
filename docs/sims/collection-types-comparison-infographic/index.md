---
title: List vs Tuple vs Dictionary Comparison
description: Interactive HTML/CSS/JS MicroSim for list vs tuple vs dictionary comparison.
image: /sims/collection-types-comparison-infographic/collection-types-comparison-infographic.png
og:image: /sims/collection-types-comparison-infographic/collection-types-comparison-infographic.png
twitter:image: /sims/collection-types-comparison-infographic/collection-types-comparison-infographic.png
social:
   cards: false
quality_score: 0
---

# List vs Tuple vs Dictionary Comparison

<iframe src="main.html" height="772px" width="100%" scrolling="no"></iframe>

[Run the List vs Tuple vs Dictionary Comparison MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

MicroPython gives you three ways to hold a group of related values, and they are not interchangeable. This infographic puts lists, tuples, and dictionaries side by side so you can tell them apart by three things: whether they can be changed, what brackets they use, and how you reach a value inside them. Your goal is to differentiate the three types, then decide which one fits a short robot-face scenario. Pick the wrong one and you either invite a bug, or write awkward code that fights the data.

## How to Use

1. Read the three columns from left to right and compare the **Changeable?** and **Access by** rows.
2. Click any column header to expand a short "why you would choose this one" explanation.
3. Read the scenario in the **Try a Scenario** panel and pick **List**, **Tuple**, or **Dictionary**.
4. Watch the column outline turn green for correct or red for incorrect, and read the rule that decided the answer.
5. Click **Next Scenario** to work through all six scenarios.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="sims/collection-types-comparison-infographic/main.html"
        height="772px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level
9-12 (High School)

### Duration
10-15 minutes

### Prerequisites

- Knowing that a variable stores a value your program can use later, from earlier in Chapter 3
- Having seen the `expressions` list, `eye_color` tuple, and `happy_face` dictionary examples in Chapter 3
- Understanding that MicroPython counts positions starting at 0, from earlier in Chapter 3
- Knowing that a display has a fixed pixel width and height, from Chapter 1

### Activities

1. **Exploration** (5 min): Compare the three columns and write down the one property that separates a tuple from a list, and the one property that separates a dictionary from both.
2. **Guided Practice** (5 min): Click all three column headers to expand the explanations. For each type, write a robot-face example of your own that it would suit.
3. **Assessment** (5 min): Work through all six scenarios without looking back at the columns. For each answer you get wrong, write down which rule you missed: mutability or access method.

### Assessment

- The student states that a tuple cannot be changed after it is created, while lists and dictionaries can.
- The student states that lists and tuples are accessed by position, while dictionaries are accessed by key name.
- The student answers at least five of the six scenarios correctly.
- The student justifies each scenario choice by naming either mutability or access method, not by guessing.

## References

1. [MicroPython Documentation](https://docs.micropython.org/en/latest/) - Official reference for the MicroPython language used throughout this book.
2. [Python Data Structures Tutorial](https://docs.python.org/3/tutorial/datastructures.html) - The standard Python guide to lists, tuples, and dictionaries.
3. [List (abstract data type) - Wikipedia](https://en.wikipedia.org/wiki/List_(abstract_data_type)) - Background on ordered collections in computer science.
4. [Associative array - Wikipedia](https://en.wikipedia.org/wiki/Associative_array) - The general idea behind key-value lookup, which dictionaries implement.
