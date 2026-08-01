---
title: Quiz - A History of Screen-Based Robot Faces
description: Ten multiple-choice questions covering Cozmo, Vector, Miko, and Buddy, their funding stories, business outcomes, and what they teach about scoping a robot face project.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: A History of Screen-Based Robot Faces

Test your understanding of four commercial robots that bet on animated screen faces, and what their outcomes teach about scoping your own project.

---

#### 1. What is a screen-based robot face?

<div class="upper-alpha" markdown>
1. A robot's face built from motorized eyelids, hinges, and mechanical eyebrows
2. A design pattern in which a robot's facial expression is drawn as pixels on an electronic display
3. A photograph of a human face printed and mounted on a robot's head
4. A camera mounted where a robot's face would be, used to recognize people
</div>

??? question "Show Answer"
    The correct answer is **B**. In a screen-based robot face, the "face" is software redrawn many times a second on a display, rather than a fixed physical shape built from moving parts. Option A describes the mechanical alternative this pattern replaces, and option D describes a camera, which several of these robots also had but which is an input, not an expression.

    **Concept Tested:** Screen-Based Robot Face

    **See:** [What Counts as a Screen-Based Robot Face?](index.md#what-counts-as-a-screen-based-robot-face)

---

#### 2. Which company released Cozmo, and in roughly what year?

<div class="upper-alpha" markdown>
1. Emotix, in 2017
2. Blue Frog Robotics, in 2015
3. Emotix, in 2018
4. Anki, in 2016
</div>

??? question "Show Answer"
    The correct answer is **D**. Anki, founded in 2010 by Carnegie Mellon robotics graduates, released Cozmo in 2016 at roughly $180. Emotix released Miko in 2017, and Blue Frog Robotics announced Buddy in 2015. Keeping these company-and-year pairings straight makes the later comparison of business outcomes much easier to follow.

    **Concept Tested:** Anki Cozmo

    **See:** [Anki and Cozmo](index.md#anki-and-cozmo-a-screen-face-becomes-a-hit-toy-2016)

---

#### 3. What was the Cozmo Emotion Engine?

<div class="upper-alpha" markdown>
1. Anki's animation system that translated Cozmo's internal state into a matching facial expression and sound
2. The small electric motor that drove Cozmo's tank treads
3. The rechargeable battery pack inside Cozmo's charging dock
4. A cloud service that let owners design custom faces on a phone
</div>

??? question "Show Answer"
    The correct answer is **A**. The Cozmo Emotion Engine was Anki's name for the software that mapped internal variables — such as whether a game had just been won or how recently Cozmo had been played with — onto a rendered expression and a matching sound. It is a large-team commercial version of the `draw_face()` function you will write later in this book.

    **Concept Tested:** Cozmo Emotion Engine

    **See:** [Anki and Cozmo](index.md#anki-and-cozmo-a-screen-face-becomes-a-hit-toy-2016)

---

#### 4. How does a crowdfunding campaign differ from traditional startup funding?

<div class="upper-alpha" markdown>
1. Crowdfunding money must be repaid with interest, while investor money never is
2. Crowdfunding is only available to companies that have already shipped a product
3. Crowdfunding presells a not-yet-finished product directly to the public, rather than raising money from investors
4. Crowdfunding raises far larger sums than venture investment typically does
</div>

??? question "Show Answer"
    The correct answer is **C**. In a crowdfunding campaign, a company uses a platform such as Kickstarter or Indiegogo to collect pledges and pre-orders from the public before the product exists. Buddy's 2015 Indiegogo campaign raised over $600,000 this way — a real sum, but far smaller than the more than $200 million Anki raised from investors, which makes option D backwards.

    **Concept Tested:** Crowdfunding Campaign

    **See:** [Buddy: The Long Road From Crowdfunding to Shipping](index.md#buddy-the-long-road-from-crowdfunding-to-shipping)

---

#### 5. Which robot in this chapter has remained in active production, releasing newer models?

<div class="upper-alpha" markdown>
1. Cozmo
2. Vector
3. Buddy
4. Miko
</div>

??? question "Show Answer"
    The correct answer is **D**. Emotix's Miko has continued shipping new models into the educational robotics market. Cozmo and Vector were both discontinued when Anki shut down in 2019, though Vector's assets were later acquired and the robot revived by a different company. Buddy was delayed for years past its promised ship date while Blue Frog Robotics restructured financially.

    **Concept Tested:** Robot Commercial Outcome

    **See:** [Miko: An Educational Robot Built to Last](index.md#miko-an-educational-robot-built-to-last)

---

#### 6. What does robot product discontinuation mean for the owners of an already-purchased robot?

<div class="upper-alpha" markdown>
1. The robot is automatically recalled and refunded by the manufacturer
2. The robot may still work physically but can lose cloud services, software updates, and repair support
3. The robot's source code is always released publicly so owners can maintain it themselves
4. The robot stops functioning immediately on the day the announcement is made
</div>

??? question "Show Answer"
    The correct answer is **B**. Discontinuation is the point where a manufacturer stops producing, selling, or supporting a device. Units already in homes often keep powering on, but features that depend on company servers — voice services, app pairing, updates — can quietly stop working. That is why Vector needed a new company to acquire its assets before some cloud features could be restored.

    **Concept Tested:** Robot Product Discontinuation

    **See:** [Vector: Anki's Ambitious Follow-Up](index.md)

---

#### 7. Which design decision did the most to delay Buddy past its original ship date?

<div class="upper-alpha" markdown>
1. Its full wheeled base built to navigate autonomously from room to room
2. Its cartoon-style animated eyes rendered on a tablet-sized screen
3. Its decision to use a crowdfunding platform instead of investors
4. Its choice to include a camera for recognizing faces
</div>

??? question "Show Answer"
    The correct answer is **A**. Reliable indoor navigation, obstacle avoidance, and mapping are difficult robotics problems on their own, and Buddy took them on in addition to an expressive face. The screen face was the comparatively easy part — the same part you will build in this book. This is the chapter's clearest example of an expensive hardware cost trade-off.

    **Concept Tested:** Buddy Mobile Robot Base

    **See:** [Buddy: The Long Road From Crowdfunding to Shipping](index.md#buddy-the-long-road-from-crowdfunding-to-shipping)

---

#### 8. A student team has eight weeks and a $30 budget to build a robot that clearly communicates four emotions. Based on this chapter, which scoping decision is wisest?

<div class="upper-alpha" markdown>
1. Add a wheeled base so the robot can follow a person around the room
2. Build a voice assistant with a wake word before designing any expressions
3. Keep the robot stationary and spend the effort on a clear, readable screen face
4. Delay building anything until the team can raise more money for better hardware
</div>

??? question "Show Answer"
    The correct answer is **C**. The chapter's central lesson is that a screen-based face communicates emotion effectively on its own, without elaborate mobility layered on top. Miko succeeded with a simple base and tightly scoped features, while Buddy's navigating base consumed years. Options A and B add the exact costs that delayed commercial robots, and option D mistakes budget for the real constraint, which is scope.

    **Concept Tested:** Robot Face Design Scoping

    **See:** [What This Means for Scoping Your Own Robot Face Project](index.md#what-this-means-for-scoping-your-own-robot-face-project)

---

#### 9. Anki raised more than $200 million yet shut down in 2019, while Emotix raised far less and kept shipping. What does this pattern suggest?

<div class="upper-alpha" markdown>
1. Crowdfunded robots always outlast investor-funded robots
2. Educational robots are inherently cheaper to manufacture than toys
3. Investors deliberately avoid funding companion robots
4. Total funding is a poor predictor of commercial survival compared with scoping and design trade-offs
</div>

??? question "Show Answer"
    The correct answer is **D**. Comparing price and funding across all four robots shows no reliable relationship with outcome: the best-funded company shut down, and a modestly funded one is still shipping. What separated them was how tightly each scoped its features against its budget and engineering time. Buddy, the crowdfunded robot, was delayed for years, which rules out option A.

    **Concept Tested:** Robot Commercial Outcome

    **See:** [Four Robots, Four Business Outcomes](index.md#four-robots-four-business-outcomes)

---

#### 10. Why is robot personality branding especially valuable for a low-budget project?

<div class="upper-alpha" markdown>
1. It is created in software, so a consistent character costs animation effort rather than added hardware
2. It legally protects a project's design from being copied by competitors
3. It replaces the need for a display, since personality is conveyed entirely by sound
4. It reduces the amount of memory a program needs on the microcontroller
</div>

??? question "Show Answer"
    The correct answer is **A**. Cozmo's chirps and Miko's encouraging animations gave each robot a consistent name, backstory, and expressive pattern that owners grew attached to — and none of it required extra motors, sensors, or chassis parts. That makes personality one of the few high-impact features a $30 kit can afford, since it is paid for in careful code rather than in components.

    **Concept Tested:** Robot Personality Branding

    **See:** [What This Means for Scoping Your Own Robot Face Project](index.md#what-this-means-for-scoping-your-own-robot-face-project)
