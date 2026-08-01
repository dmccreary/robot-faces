---
title: A History of Screen-Based Robot Faces
description: A history of four commercial robots — Cozmo, Vector, Miko, and Buddy — that bet on animated screen faces, and what their business outcomes teach about scoping a robot face project.
generated_by: claude skill chapter-content-generator
date: 2026-07-27 10:53:08
version: 0.09
---

# A History of Screen-Based Robot Faces

## Summary

This chapter steps back from hardware and code to look at why this project exists: four real commercial robots — Anki's Cozmo and Vector, Emotix's Miko, and Blue Frog Robotics' Buddy — all bet that a screen-based face with animated eyes was enough to make a robot feel alive. Students examine each robot's design, funding, and business outcome (including two Anki shutdowns) to understand both the appeal and the risk of building expressive robots. After completing this chapter, students will be able to name each robot's company and approximate release year, and explain what their outcomes suggest about scoping a low-cost, display-only robot face project.

## Concepts Covered

This chapter covers the following 25 concepts from the learning graph:

1. Screen-Based Robot Face
2. Social Robot
3. Anki Cozmo
4. Anki Vector
5. Emotix Miko
6. Blue Frog Robotics Buddy
7. Cozmo Emotion Engine
8. Vector Companion App
9. Miko Educational Robot Design
10. Buddy Mobile Robot Base
11. Robot Startup Funding
12. Robot Product Discontinuation
13. Crowdfunding Campaign
14. Robot Commercial Outcome
15. Robot Face Design Scoping
16. Companion Robot Category
17. Mass-Market Robot Toy
18. Robot Voice Interaction
19. Robot Business Case Study
20. Hardware Cost Trade-Off
21. Anki Company History
22. Consumer Robotics Market
23. Robot Personality Branding
24. Screen As Face Metaphor
25. Educational Robotics Market

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Hardware & Electronics Foundations](../01-hardware-electronics-foundations/index.md)

---

## Why History Matters Before You Design a Face

!!! mascot-welcome "Before We Draw a Single Eyebrow..."
    ![Pixel waves hello](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Chapter 1 got your hardware wired up and ready to go. Before Chapter 3 hands you a `draw_face()` function, let's look at four real companies that bet real money on the exact idea this course teaches — a screen for a face — and see what happened when that idea met the real world.

In Chapter 1, you learned to wire a microcontroller to a small screen, a hardware decision that sits underneath every robot in this chapter too. Companies spend years and millions of dollars deciding exactly which screen, which chip, and which face design will make a robot feel alive to the person standing in front of it. Their decisions were bigger and more expensive than yours will be, but the underlying design problem is identical.

This chapter looks at four robots that made that bet at commercial scale: Anki's Cozmo and Vector, Emotix's Miko, and Blue Frog Robotics' Buddy. Two of them were discontinued, one pivoted through a dramatic shutdown and revival, and one is still selling robots to schools and families today. Studying why is a fast, low-cost way to learn what actually matters when you scope your own robot face project.

Before diving into any single robot, it helps to know exactly why this history is worth your time:

- It shows which face-design choices — a screen alone versus a screen paired with an elaborate moving body — actually made it to store shelves.
- It shows how a company's funding and crowdfunding story can hint at whether a hardware startup will survive long enough to support its product.
- It proves that even a large budget does not guarantee a robot ships, sells well, or stays supported for long.
- It hands you shared vocabulary — social robot, companion robot, screen-as-face metaphor — that the rest of this book uses without re-explaining.

## What Counts as a Screen-Based Robot Face?

A **screen-based robot face** is a design pattern in which some or all of a robot's facial expression appears as pixels on an electronic display, rather than being built from separate moving parts like motorized eyelids or mechanical eyebrows. Every robot in this book, and every robot in this chapter, uses this pattern: the "face" is software, redrawn many times a second, instead of a fixed physical shape.

That pattern only makes sense in the context of a broader category of machine. A **social robot** is a robot designed primarily to interact with people for emotional or relational purposes, rather than to complete a purely mechanical task such as vacuuming a floor or welding a car frame. Within that broader category sits the **companion robot category**: social robots specifically intended for an ongoing, personal relationship in a home or classroom, as opposed to a one-time task or a public-space greeter. All four robots in this chapter are companion robots first, and screen-based robot faces are how each one earns its "companion" label.

Designers who choose this pattern are leaning on what this book calls the **screen-as-face metaphor**: the deliberate choice to treat a rectangular or round display as a stand-in for a face, trusting that people will read two eyes and a mouth on a screen the same way they read a face on a person. This metaphor is not automatic or guaranteed — it works because of decades of psychology research on which facial features people actually notice, which later chapters in this book explore in depth.

!!! mascot-thinking "Same Idea, Bigger Budget"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Every robot in this chapter is doing exactly what you will do on your OLED and color displays: drawing eyes instead of building them out of gears and hinges. The difference is scale and budget, not the underlying idea — you are learning with `ellipse()` calls what these companies paid engineering teams to build with custom animation software.

These four robots also did not appear by accident. Interest in home robotics grew steadily through the 2010s, part of a larger **consumer robotics market** that includes everything from robot vacuums to smart speakers, and investors were eager to fund the next home robot that might become as familiar as those earlier hits. The timeline below lays out how the four robots in this chapter relate to each other in time, and lets you click any milestone to learn more about it.

#### Diagram: Screen-Based Robot Face Timeline

<iframe src="../../sims/robot-face-timeline-explorer/main.html" width="100%" height="582px" scrolling="no"></iframe>

<details markdown="1">
<summary>Screen-Based Robot Face Timeline</summary>
Type: timeline
**sim-id:** robot-face-timeline-explorer<br/>
**Library:** vis-timeline<br/>
**Status:** Specified

Bloom Taxonomy Level: Understand (L2)
Bloom Taxonomy Verb: summarize, interpret

Learning objective: Interpret the sequence of milestones across four commercial screen-faced robots and summarize how one company's outcome (Anki's shutdown) relates in time to the releases of the other robots.

Time period: 2010-2023

Orientation: Horizontal, left to right

Events:
- 2010: Anki is founded by a group of Carnegie Mellon robotics graduates
- 2015: Blue Frog Robotics announces Buddy and launches its Indiegogo crowdfunding campaign
- 2016: Anki releases Cozmo
- 2017: Emotix releases Miko in India
- 2018: Anki releases Vector
- 2019: Anki shuts down its operations
- 2019-2020: Vector's assets are acquired, and the robot is relaunched by a new company
- 2021: Blue Frog Robotics undergoes financial restructuring while continuing Buddy's development
- 2020s: Miko continues releasing new models for the educational robotics market

Visual style: horizontal timeline with color-coded event dots grouped by company

Detail level per event: each event shows a one-sentence description on hover, and a two-to-three-sentence expanded description with the event's significance on click

Color coding: teal for Anki (Cozmo and Vector), coral for Emotix Miko, purple for Blue Frog Robotics Buddy

Interactive features:
- Hover over any event dot to preview its one-sentence description in a tooltip
- Click an event dot to open a detail panel below the timeline with the full description and a "why it matters" note
- Filter buttons let a learner show only one company's events at a time, or select "Show All"
- Learner can zoom and pan the timeline horizontally with a scroll or drag gesture

Instructional Rationale: The Understand-level objective calls for interpreting relationships in a sequence rather than recalling isolated dates, so the filter-by-company and click-to-expand interactions let a learner isolate one company's story or compare all four side by side, building the sequence understanding the rest of the chapter depends on.

Responsive design: timeline compresses to a scrollable horizontal strip on narrow screens, with the detail panel stacking below rather than beside the timeline.

Implementation: vis-timeline JavaScript library for the timeline rendering; a JSON array of event objects (date, company, title, short description, long description) drives both the timeline and the detail panel.
</details>

## Anki and Cozmo: A Screen Face Becomes a Hit Toy (2016)

**Anki company history** starts in 2010, when a group of robotics graduate students from Carnegie Mellon University founded the company to bring consumer-friendly AI and robotics out of the research lab. Anki's first product was a set of AI-driven toy race cars; the company later shifted its focus toward home companion robots. Getting there required **robot startup funding** — money raised from investors and used to cover years of engineering, manufacturing, and marketing before a hardware product earns any profit. Anki raised well over $200 million across its lifetime, a figure that will matter again later in this chapter.

**Anki Cozmo** is the small, palm-sized robot that resulted from that funding, released in 2016 at a price of roughly $180. Cozmo moved on tank-style treads, used a small lift arm to interact with plastic play cubes, and displayed a pair of simple, expressive eyes on a compact OLED-style screen — a screen-based robot face in its purest, earliest commercial form.

Cozmo packed a surprising amount of behavior into that small package:

- Tank-tread mobility paired with a front-mounted lift arm for picking up and stacking cubes
- A built-in camera used to recognize faces, cubes, and its own charging dock
- Animated monochrome-style eyes that shifted with each interaction, from wide-eyed surprise to a narrow, satisfied squint
- Short chirps and beeps standing in for speech, reinforcing the eyes rather than replacing them

Anki gave the software driving those eyes its own name: the **Cozmo Emotion Engine**. This was Anki's marketing term for the animation system that translated Cozmo's internal state — things like how recently it had been played with, or whether a game had just been won or lost — into a matching facial expression and sound. In other words, the Cozmo Emotion Engine is a commercial, large-team version of the `draw_face()` function you will write later in this book: one system, mapping internal variables to a rendered expression.

Anki marketed Cozmo as a **mass-market robot toy**: a robot sold through mainstream toy and electronics retailers to a broad consumer audience, priced to compete with premium toys rather than specialty robotics kits. That mass-market positioning depended heavily on **robot personality branding** — the deliberate practice of giving a robot product a consistent name, backstory, and pattern of expressive behavior so that owners form an emotional attachment to it. Cozmo's growing "personality," its distinctive sounds, and its expressive eyes were central to how Anki advertised the toy, not an afterthought layered on at the end.

## Vector: Anki's Ambitious Follow-Up — and Its Shutdown (2018-2019)

**Anki Vector** was Cozmo's more ambitious successor, released in 2018 at a price of roughly $250. Vector kept a screen-based face but dropped Cozmo's tank treads and lift-arm play pattern in favor of a smaller, more stationary presence that stayed "awake" on a desk or shelf, using its camera and microphones to notice and react to people nearby without needing to be summoned first.

That always-on presence depended on new interaction channels beyond the screen itself. **Robot voice interaction** — a robot's ability to recognize a spoken wake word and respond to simple spoken commands — let Vector answer questions and take requests after hearing "Hey Vector," much like a smart speaker with a face attached. Setting Vector up, viewing its camera feed remotely, and adjusting its settings all happened through the **Vector companion app**, a smartphone application that paired with the robot over Wi-Fi. Pairing a physical robot with an app for setup and remote control became a standard pattern across this entire generation of companion robots.

Reaching the market with Vector meant drawing further on Anki's pool of robot startup funding, which had grown to more than $200 million across the company's history by that point. Despite that funding, real retail presence, and a genuinely loved toy in Cozmo, Anki abruptly shut down its operations in April 2019, laying off nearly its entire staff within days. This is a clear example of **robot product discontinuation**: the point in a hardware product's life cycle when a manufacturer stops producing, selling, or supporting a device, sometimes leaving existing units still physically functional but cut off from cloud services, software updates, and repairs.

!!! mascot-thinking "A Company Can Run Out of Runway"
    ![Pixel thinks it through](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    More than $200 million raised, real retail shelf space, and a genuinely beloved toy — and Anki still shut down within a few years. Funding buys time to build something great; it does not guarantee the business behind it survives long enough to keep selling it.

Vector's story did not end completely at the 2019 shutdown. A separate company later acquired Vector's technology and remaining inventory, and relaunched the robot for existing and new owners, restoring some of its cloud-connected features along the way. That revival kept Vector alive in a smaller, less certain form — a reminder that a **robot commercial outcome** is not always a simple "succeeded" or "failed," but can be a longer, messier story than a launch announcement suggests.

## Miko: An Educational Robot Built to Last

**Emotix Miko** is a tabletop companion robot from the Indian robotics company Emotix, released in 2017 at a price of roughly $300. Like Cozmo and Vector, Miko presents a round, colorful animated face on a display, but Miko's rolling base, camera, and microphones exist to support one clear purpose: helping a child learn.

That purpose shaped every part of **Miko educational robot design**. Instead of Cozmo's cube-based play or Vector's general-purpose assistant behavior, Miko ships with curated stories, quizzes, and simple coding lessons, plus parental controls that limit its content and internet access to material a parent or teacher has approved. Miko's screen face smiles and encourages a child through an activity the way a patient tutor would, turning correct answers and finished lessons into small animated celebrations. Choosing a simpler wheeled base and leaning harder on curated software, instead of open-ended room navigation, was itself a deliberate choice about where to spend a limited engineering budget.

Miko competes in the **educational robotics market**: robots, kits, and coding platforms built specifically for schools, homeschool programs, and after-school clubs, where buyers value measurable learning outcomes and safe, curated content as much as raw technical capability. That market rewards a different kind of staying power than the mass-market toy market Cozmo competed in — schools and parents often expect years of continued support, not just an exciting launch. Unlike Cozmo and Vector, Miko has continued to release new models, making it the one robot in this chapter whose business has kept going largely uninterrupted.

!!! mascot-tip "Simpler Can Survive Longer"
    ![Pixel gives a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Notice the pattern already forming: Miko kept its moving parts simple and leaned on its screen and its content instead. When you scope your own capstone face later in this book, ask the same question — which features earn their cost, and which ones just look impressive?

## Buddy: The Long Road From Crowdfunding to Shipping

**Blue Frog Robotics Buddy** is a home companion robot announced in 2015 by the French company Blue Frog Robotics, promising security monitoring, entertainment, and companionship in a single machine with an animated, cartoon-style pair of eyes rendered on a tablet-style screen.

To fund development, Blue Frog Robotics turned to a **crowdfunding campaign**: a funding method in which a company presells a not-yet-finished product directly to the public through a platform such as Kickstarter or Indiegogo, using pledged money and pre-order commitments instead of, or alongside, traditional venture investors. Buddy's 2015 Indiegogo campaign raised more than $600,000 from backers who were excited by its promise, well beyond the campaign's original funding goal.

What made Buddy's engineering challenge unusually large was its **Buddy mobile robot base**: a full wheeled platform designed to let the robot navigate autonomously from room to room around a home, rather than stay put on a desk or tabletop the way Cozmo, Vector, and Miko do. Reliable indoor navigation, obstacle avoidance, and mapping are hard robotics problems on their own, even before adding an expressive face on top, and that ambition contributed heavily to years of delay past Buddy's original promised ship date. Blue Frog Robotics later underwent a period of serious financial restructuring before continuing Buddy's development under changed circumstances.

Now that all four robots have been introduced, the table below reinforces their key facts side by side.

| Robot | Company | Approx. Release Year | Approx. Price | Face Design | Mobility |
|---|---|---|---|---|---|
| Cozmo | Anki | 2016 | ~$180 | Monochrome-style animated eyes on a small screen | Tank treads with a lift arm |
| Vector | Anki | 2018 | ~$250 | Full-color animated face, voice-activated | Mostly stationary, camera-aware |
| Miko | Emotix | 2017 | ~$300 | Round color animated face | Simple wheeled base, tabletop-oriented |
| Buddy | Blue Frog Robotics | announced 2015, shipped years later | ~$500+ (crowdfunding pledge) | Cartoon-style eyes on a tablet-style screen | Full wheeled base for room-to-room navigation |

## Four Robots, Four Business Outcomes

Together, these four robots form a compact **robot business case study**: a set of real companies that made similar bets on the same core idea — a screen-based face — and reached very different **robot commercial outcomes**. Comparing them side by side surfaces patterns that are hard to see from any single robot's story alone.

The table below reinforces the funding story and eventual outcome for each robot, already described in the sections above.

| Robot (Company) | Funding Story | Commercial Outcome |
|---|---|---|
| Cozmo (Anki) | Backed by Anki's overall venture funding, more than $200 million across the company's lifetime | Sold well through major retailers; discontinued when Anki shut down in 2019 |
| Vector (Anki) | Drew on the same Anki funding pool as Cozmo | Discontinued in 2019; assets acquired and the robot later revived by a new company |
| Miko (Emotix) | Multiple private funding rounds, reportedly tens of millions of dollars total | Still in active production, with newer models sold into the educational robotics market |
| Buddy (Blue Frog Robotics) | 2015 Indiegogo crowdfunding campaign raised over $600,000, plus later private investment | Years of delay past its original ship date; company underwent financial restructuring |

Reading price and funding numbers side by side raises an obvious question worth testing directly: did spending more money predict which robot survived? The interactive chart below lets you compare price and funding across all four robots and check that hypothesis for yourself.

#### Diagram: Robot Price and Funding Comparison Chart

<iframe src="../../sims/robot-funding-price-outcome-chart/main.html" width="100%" height="542px" scrolling="no"></iframe>

<details markdown="1">
<summary>Robot Price and Funding Comparison Chart</summary>
Type: chart
**sim-id:** robot-funding-price-outcome-chart<br/>
**Library:** Chart.js<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: compare, examine

Learning objective: Compare the approximate consumer price and approximate total funding raised across the four robots, and examine whether either figure predicted a robot's commercial outcome.

Chart type: Grouped bar chart with a toggle between two data views, "Price" and "Funding"

Purpose: Show that a high price or a large funding total did not guarantee commercial survival, reinforcing the chapter's comparison of business outcomes

X-axis: Robot (Cozmo, Vector, Miko, Buddy)
Y-axis: Price view shows approximate launch price in US dollars; Funding view shows approximate total funding raised, in millions of US dollars; the toggle swaps both the axis label and the bar values

Data series (Price view, approximate, rounded, for teaching purposes only):
- Cozmo: about $180
- Vector: about $250
- Miko: about $300
- Buddy: original crowdfunding pledge price around $500, with a higher final retail price after years of delay

Data series (Funding view, approximate, rounded, for teaching purposes only):
- Cozmo/Vector (Anki, combined company total): more than $200 million across the company's lifetime
- Miko (Emotix): tens of millions of dollars across multiple funding rounds
- Buddy (Blue Frog Robotics): roughly $600,000 from its 2015 Indiegogo campaign, plus later private investment rounds

Bar color coding by outcome: green for still in active production, orange for discontinued then revived by a new company, red for discontinued, gray for severely delayed or restructured

Title: "Price and Funding Told Only Part of the Story"
Legend: outcome color key, positioned top-right

Interactive controls:
- Toggle button switches between "Price" and "Funding" views and redraws the bars with a smooth transition
- Hovering any bar shows an exact tooltip value plus a one-sentence outcome note (for example, hovering the Vector funding bar shows "Anki raised over $200M across its history but shut down in 2019.")
- Clicking a bar highlights that robot's row in the outcome legend

Key insights to highlight: an annotation on the Vector/Anki bar reads "Highest funding, still discontinued," and an annotation on the Miko bar reads "Modest funding, still shipping"

Instructional Rationale: The Analyze-level objective requires examining numeric data for a pattern, or the absence of one, so a toggle-able bar chart with hover tooltips lets a learner test their own hypothesis — does more money mean more success — against the actual approximate figures, rather than being told the conclusion directly.

Responsive design: chart canvas and toggle control stack vertically below 600 pixels wide; bar labels rotate to remain readable at narrow widths.

Implementation: Chart.js bar chart with a custom toggle control switching the underlying dataset and axis labels; a small annotation layer draws the two highlighted callout labels.
</details>

Money alone does not explain these outcomes, so it helps to compare the robots' actual design decisions instead. The interactive infographic below breaks down each robot's mobility, interaction style, and target buyer so you can see which choices lined up with which outcome.

#### Diagram: Four Robots, Four Bets on a Screen Face

<iframe src="../../sims/robot-design-approach-infographic/main.html" width="100%" height="812px" scrolling="no"></iframe>

<details markdown="1">
<summary>Four Robots, Four Bets on a Screen Face</summary>
Type: infographic
**sim-id:** robot-design-approach-infographic<br/>
**Library:** HTML/CSS/JS<br/>
**Status:** Specified

Bloom Taxonomy Level: Analyze (L4)
Bloom Taxonomy Verb: differentiate, contrast

Learning objective: Differentiate the four robots' design approaches — face style, mobility, target buyer, and primary interaction mode — and contrast which choices coincided with which business outcome.

Purpose and main message: Show that "screen-based face" was the one idea all four robots shared, while every other design decision (mobility, camera use, target audience, price tier) varied, and that those other decisions explain most of the difference in outcomes

Layout: four large cards arranged in a horizontal row, stacking vertically on narrow screens, one per robot, each showing a simplified icon-style illustration of that robot's face and body silhouette

Data to display per card, revealed on click and collapsed by default:
- Cozmo: tank-tread mobility, tracked-vehicle body, monochrome-style animated eyes, camera-based cube and face recognition, target buyer general consumer/toy market, outcome discontinued with Anki's 2019 shutdown
- Vector: stationary/limited mobility, voice-activated always-on presence, cloud-connected AI, color animated face, target buyer tech-enthusiast consumer, outcome discontinued in 2019 and later revived by a new company
- Miko: simple wheeled rotation rather than full room navigation, round color animated face, curated educational content and voice interaction, target buyer parents of school-age children, outcome still in active production with newer models
- Buddy: full wheeled mobile base designed for room-to-room navigation, tablet-style animated face, home-monitoring and companionship features, target buyer households wanting a general home companion, outcome severely delayed for years with a financial restructuring

Interactive elements:
- Click any card to expand it, revealing the data fields above in a short infobox
- A "Compare Mobility" toggle highlights just the mobility feature across all four cards at once, from tank treads to a full navigation base
- A "Compare Outcome" toggle recolors each card's border by outcome (green, orange, red, gray), matching the chart's color key above
- Hovering a card's face illustration shows a one-line caption naming that robot's specific screen-as-face design detail (for example, Buddy's caption: "Cartoon eyes on a tablet-style face, mounted on a room-navigating base")

Color coding or visual hierarchy: each card uses a distinct accent color by company (teal for the Anki robots, coral for Miko, purple for Buddy); outcome color only appears when the "Compare Outcome" toggle is active, to avoid mixing two color systems at once

Responsive behavior: four cards in a row above 900 pixels wide, a two-by-two grid between 600 and 900 pixels, a single-column stack below 600 pixels; expanded infobox content reflows beneath its card at every width

Instructional Rationale: The Analyze-level objective requires breaking each robot down into comparable design dimensions and contrasting them, so toggled comparison views for mobility and then outcome let a learner examine one dimension at a time across all four robots instead of absorbing four unrelated descriptions.

Implementation: HTML/CSS grid for the card layout, vanilla JavaScript for click-to-expand behavior and toggle-driven recoloring; no external charting library needed.
</details>

## What This Means for Scoping Your Own Robot Face Project

Every decision covered in this chapter, from Cozmo's lift arm to Buddy's navigating base, involved a **hardware cost trade-off**: a design choice to spend a limited budget of money, engineering time, and risk on one feature instead of another, knowing that almost any added capability increases dollar cost, complexity, or both. Buddy's ambitious mobile base is the clearest example — full room navigation is expensive and hard to get right, and that single decision likely did more to delay the robot than its screen-based face ever did.

This is exactly the kind of decision-making that **robot face design scoping** describes: the deliberate process of choosing which features a project needs and which it can leave out, calibrated to the time, budget, and skill actually available. The four robots in this chapter each scoped their project differently, and their outcomes were not random. Miko, the robot with the simplest mobile base and the most tightly scoped feature set, is also the one still shipping new models today.

!!! mascot-encourage "You Don't Need $200 Million to Get This Right"
    ![Pixel cheers you on](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    If a company with hundreds of employees and hundreds of millions of dollars could still struggle to ship a robot, it might feel intimidating to start your own. Here's the flip side: your project doesn't need a navigating chassis, a cloud service, or a companion app to succeed — it needs one well-scoped screen and a face that clearly says something. That is well within reach with the hardware from Chapter 1.

Three lessons from this chapter are worth carrying into every project in the rest of this book. First, a screen-based face communicates emotion effectively on its own, without needing elaborate mobility layered on top of it — Miko and your own classroom project both prove that a stationary or simply mobile base is enough. Second, funding and crowdfunding numbers are exciting to read about, but they are not proof that a product will ship on time or stay supported; treat big-money headlines the way you would treat any other hype, and scope your own project to what you can actually finish. Third, personality branding like Cozmo's chirps or Miko's encouraging animations is powerful precisely because it is a software cost, not a hardware cost — it is something you, too, can add to a $30 kit with nothing more than careful animation code.

## Chapter Summary

Four companies bet that a screen could stand in for a face, and their outcomes teach a clear lesson about scoping a robot face project responsibly.

- A screen-based robot face renders expression as pixels on a display, and social robots use that pattern to build emotional connection rather than perform mechanical tasks.
- Anki's Cozmo (2016) proved a screen-based face could become a hit mass-market toy, driven by its Cozmo Emotion Engine mapping internal state to expression.
- Anki's Vector (2018) added voice interaction and a companion app, but Anki shut down in 2019 despite more than $200 million in total funding; Vector was later revived by a new company.
- Emotix's Miko (2017) paired a simpler wheeled base with curated educational content, and remains in active production in the educational robotics market today.
- Blue Frog Robotics' Buddy, announced in 2015 and funded through a $600,000-plus Indiegogo crowdfunding campaign, was delayed for years by the difficulty of its full room-navigating mobile base.
- Comparing all four shows that price and funding did not predict commercial outcome — thoughtful hardware cost trade-offs and tight design scoping mattered more.
- A well-scoped, display-only robot face, like the ones you will build in this book, can communicate emotion effectively without the expense and risk that slowed down several of these commercial robots.

!!! mascot-celebration "History Down — Now Let's Build"
    ![Pixel celebrates](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just compared four real companies, four funding stories, and four very different outcomes — all built on the same core idea you are about to code yourself. Chapter 3 puts that idea into your hands and starts turning your wired-up display into a working face.

??? question "Self-Check: Which robot kept shipping? — Click to reveal"
    Emotix's Miko is the robot from this chapter that has remained in active production, releasing newer models into the educational robotics market, while Cozmo and Vector were discontinued when Anki shut down in 2019 and Buddy was delayed for years past its original crowdfunded ship date.

[See Annotated References](./references.md)
