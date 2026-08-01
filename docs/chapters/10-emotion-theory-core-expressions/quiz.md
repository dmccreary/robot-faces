---
title: Quiz - Emotion Theory & the Core Expression Set
description: Ten multiple-choice questions covering Ekman's universal emotions, facial action coding, minimal-feature robot research, recognition accuracy, and the thirteen expression recipes.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Emotion Theory & the Core Expression Set

Test your understanding of the research behind facial expression design and the thirteen named expressions built from Chapter 9's parameters.

---

#### 1. Which set of emotions does Ekman's cross-cultural research most commonly identify as universal?

<div class="upper-alpha" markdown>
1. Jealousy, nostalgia, pride, embarrassment, and guilt
2. Curiosity, boredom, confusion, and excitement
3. Only happiness and sadness, since all others vary by culture
4. Happiness, sadness, anger, fear, surprise, and disgust, with contempt sometimes added
</div>

??? question "Show Answer"
    The correct answer is **D**. Ekman showed photographs of expressions to people in dramatically different cultures, including some with little exposure to Western media, and found consistent recognition of this short list. Contempt was his later, more debated addition. Option A lists complex emotions that build on simpler ones over time — exactly the kind a minimal robot face cannot realistically convey.

    **Concept Tested:** Ekman Universal Emotions

    **See:** [A Short List, Recognized Everywhere](index.md#a-short-list-recognized-everywhere-ekman-universal-emotions)

---

#### 2. What have minimal-feature robot studies repeatedly found?

<div class="upper-alpha" markdown>
1. Robot faces need a full set of FACS action units before viewers read any emotion correctly
2. A small number of moving features, often just eyebrows and a mouth, is enough for viewers to correctly read an intended emotion
3. Viewers read emotion from a robot's body posture rather than its face
4. Monochrome displays cannot convey emotion reliably at any feature count
</div>

??? question "Show Answer"
    The correct answer is **B**. Researchers testing robots and screen-based characters with only two or three animatable features found recognition well above chance, even without a nose, cheeks, or forehead wrinkles. This is real evidence — not a convenient assumption — that `draw_face()` plus a handful of parameters can genuinely communicate emotion.

    **Concept Tested:** Minimal Feature Robot Research

    **See:** [How Few Features Are Enough?](index.md#how-few-features-are-enough-minimal-feature-robot-research)

---

#### 3. Comparing the happy and sad face-state dictionaries in this chapter, what is the entire difference between them?

<div class="upper-alpha" markdown>
1. Sad adds an eyelid key that happy does not have
2. Sad uses a different `eye_spacing` and `gaze_offset_x`
3. `eyebrow_angle` and `mouth_curvature` simply flip sign
4. Sad calls a different drawing function than happy does
</div>

??? question "Show Answer"
    The correct answer is **C**. Happy pushes both values positive; sad pushes both negative; neutral sits at zero on both. Three expressions from one shared pair of numbers moving in opposite directions is parameterized face design working exactly as Chapter 9 intended — the same drawing code produces all three.

    **Concept Tested:** Sad Expression

    **See:** [Sad Expression](index.md#sad-expression)

---

#### 4. Sad and angry both use a negative `eyebrow_angle`. Which other changes keep them visibly distinct?

<div class="upper-alpha" markdown>
1. Angry uses a much steeper eyebrow angle, narrowed eyes, and a flat mouth; sad uses a milder angle and a clearly downward mouth
2. Angry uses a positive mouth curvature while sad uses a negative one
3. Angry centers the pupils while sad offsets them to one side
4. Angry breaks facial symmetry while sad preserves it
</div>

??? question "Show Answer"
    The correct answer is **A**. Anger reads mainly through the eyebrows and eyes, so it pushes the brow furrow sharply and narrows `eye_size` while keeping the mouth near flat. Sadness keeps the brow gentle and puts its signal in a visible frown. Changing eye size and mouth curvature together — not just the eyebrow angle — is what separates them.

    **Concept Tested:** Angry Expression

    **See:** [Angry Expression](index.md#angry-expression)

---

#### 5. What is the Facial Action Coding System (FACS)?

<div class="upper-alpha" markdown>
1. A ranking of emotions by how reliably viewers recognize them
2. A standard file format for storing robot expression data
3. A set of guidelines for how large facial features should appear on a display
4. A method that breaks a facial expression into individual, measurable muscle movements called action units
</div>

??? question "Show Answer"
    The correct answer is **D**. Ekman and Friesen's system names movements such as Inner Brow Raiser, Brow Lowerer, and Lip Corner Puller. A robot face's few parameters collapse dozens of these action units into a handful of sliders — a huge simplification, but built on the same idea of independent, combinable features that Chapter 9 taught.

    **Concept Tested:** Facial Action Coding

    **See:** [Breaking a Face into Measurable Moves](index.md#breaking-a-face-into-measurable-moves-facial-action-coding)

---

#### 6. Which expression requires two independent eyebrow angles rather than one shared, mirrored value?

<div class="upper-alpha" markdown>
1. Stern
2. Excited
3. Confused
4. Tired
</div>

??? question "Show Answer"
    The correct answer is **C**. Confusion reads almost entirely through mismatched eyebrows — one raised, the other level or slightly dropped — so its dictionary carries `eyebrow_angle_left` and `eyebrow_angle_right` separately. It is the chapter's clearest example of overriding facial symmetry on purpose rather than breaking it by accident.

    **Concept Tested:** Confused Expression

    **See:** [Confused Expression](index.md#confused-expression)

---

#### 7. Why is surprised among the most reliably recognized expressions in minimal-feature robot studies?

<div class="upper-alpha" markdown>
1. Every feature moves in the same dramatic direction at once, leaving little room for another reading
2. It requires the fewest parameter changes from the neutral default
3. It is the only expression that uses an open mouth
4. It relies on asymmetry, which viewers notice faster than symmetric changes
</div>

??? question "Show Answer"
    The correct answer is **A**. Very raised eyebrows, very wide eyes, and a fully open mouth all push toward "opening up" simultaneously. That convergence is what makes it hard to misread. Afraid uses the same combination at lower intensity, which is precisely why it is more often confused with surprised or disgusted.

    **Concept Tested:** Surprised Expression

    **See:** [Surprised Expression](index.md#surprised-expression)

---

#### 8. Which pair of expressions does recognition-accuracy research flag as frequently confused with each other?

<div class="upper-alpha" markdown>
1. Happy and neutral
2. Afraid and disgusted
3. Sleepy and excited
4. Stern and happy
</div>

??? question "Show Answer"
    The correct answer is **B**. Their eyebrow and eye shapes overlap more than textbook descriptions suggest, and viewers also confuse both with surprised and angry. Happy and surprised, by contrast, are recognized very accurately even on simple faces. This uneven accuracy is the design constraint Chapter 11 builds a whole readability strategy around.

    **Concept Tested:** Emotion Recognition Accuracy

    **See:** [Not Every Expression Is Equally Easy to Read](index.md#not-every-expression-is-equally-easy-to-read-emotion-recognition-accuracy)

---

#### 9. A student building their first expression set on the 128x64 OLED asks whether to include contempt. What is the best advice?

<div class="upper-alpha" markdown>
1. Include it first, since Ekman ranked it the most universal of the seven
2. Include it, because a one-sided mouth raise is the easiest shape to draw
3. Exclude it permanently — asymmetric expressions cannot be drawn with `fb.ellipse()`
4. Skip it until the other twelve feel solid, since a subtle one-sided raise is easy to lose on a small display
</div>

??? question "Show Answer"
    The correct answer is **D**. Contempt is Ekman's most debated addition and consists of a single subtle asymmetric mouth raise while the rest of the face stays near neutral. That subtlety works against a low-resolution screen. It is worth knowing and worth adding later, once Chapter 11's readability tools can judge whether it survives on specific hardware.

    **Concept Tested:** Contempt Expression

    **See:** [Contempt Expression](index.md#contempt-expression)

---

#### 10. What distinguishes stern from angry, given that both lower the eyebrows?

<div class="upper-alpha" markdown>
1. Stern uses an open mouth while angry uses a closed one
2. Stern uses a much smaller eyebrow angle and keeps eyes at normal size, without anger's narrowed stare
3. Stern breaks symmetry while angry preserves it
4. Stern raises the pupils while angry centers them
</div>

??? question "Show Answer"
    The correct answer is **B**. Same general eyebrow direction, much smaller magnitude, and none of anger's narrowed eyes — that difference is what makes stern read as serious attention or listening rather than as being upset. Both keep the mouth flat and tight, so the eyes carry the distinction.

    **Concept Tested:** Stern Expression

    **See:** [Stern Expression](index.md#stern-expression)
