---
title: Quiz - Expression Design, Readability & Human-Robot Interaction
description: Ten multiple-choice questions covering feature signaling, expression intensity and ambiguity, the valence-arousal model, readability constraints, anthropomorphism, the uncanny valley, and the emotional design rubric.
generated_by: claude skill quiz-generator
version: 0.4
---

# Quiz: Expression Design, Readability & Human-Robot Interaction

Test your understanding of how to judge whether a robot's expression actually works, not just whether the code runs.

---

#### 1. Which single facial feature do studies often find to be the strongest individual signal of which emotion is present?

<div class="upper-alpha" markdown>
1. The mouth, since curvature is the most visible change
2. The eyebrows, whose position and angle read as anger or alarm almost instantly
3. The pupils, whose position pinpoints emotional focus
4. The cheeks, whose marks indicate emotional intensity
</div>

??? question "Show Answer"
    The correct answer is **B**. Studies on both real and animated faces have found eyebrows to be a stronger identity signal than the mouth, which most people assume is the main emotional feature. Chapter 9's single `eyebrow_angle` parameter does more emotional work per number than almost anything else in the face state dictionary.

    **Concept Tested:** Eyebrow Emotion Signaling

    **See:** [The Feature That Talks the Loudest](index.md#the-feature-that-talks-the-loudest-eyebrow-emotion-signaling)

---

#### 2. What are the two dimensions of the valence-arousal model?

<div class="upper-alpha" markdown>
1. Intensity and duration
2. Symmetry and contrast
3. Recognition accuracy and cultural variation
4. Valence, how positive or negative a feeling is, and arousal, how energetic or calm it is
</div>

??? question "Show Answer"
    The correct answer is **D**. Plotting valence horizontally and arousal vertically places every emotion in one of four quadrants — pleasant-energetic, pleasant-calm, unpleasant-energetic, or unpleasant-calm. It is a complementary framework to Ekman's named categories, not a replacement, and it describes any feeling with two numbers rather than a label.

    **Concept Tested:** Valence Arousal Model

    **See:** [A Second Way to Map a Feeling](index.md#a-second-way-to-map-a-feeling-valence-arousal-model)

---

#### 3. What does the valence-arousal model reveal about why afraid and surprised are so often confused?

<div class="upper-alpha" markdown>
1. They occupy nearly the same coordinates on the grid, so their feature combinations overlap heavily
2. They sit in opposite quadrants, and opposites are inherently harder to distinguish
3. They both have zero arousal, so no feature needs to move at all
4. They cannot be plotted on the grid, since both are high-intensity emotions
</div>

??? question "Show Answer"
    The correct answer is **A**. Both are high-arousal and close to neutral or mildly negative in valence, which is exactly why both raise the eyebrows, widen the eyes, and often open the mouth. Two emotions occupying nearly the same grid coordinates will always be harder to tell apart on a simple face than two sitting in opposite quadrants.

    **Concept Tested:** Expression Ambiguity

    **See:** [When One Face Could Mean Two Feelings](index.md#when-one-face-could-mean-two-feelings-expression-ambiguity)

---

#### 4. A robot acknowledges a student's correct answer during a quiet activity. Which happy face state fits best?

<div class="upper-alpha" markdown>
1. `{"eyebrow_angle": 25, "mouth_curvature": 10, "mouth_open": True}`
2. `{"eyebrow_angle": 0, "mouth_curvature": 0}`
3. `{"eyebrow_angle": 3, "mouth_curvature": 3}`
4. `{"eyebrow_angle": -8, "mouth_curvature": -6}`
</div>

??? question "Show Answer"
    The correct answer is **C**. Expression intensity is a real design decision, not an afterthought. A subtle happy state reads as quietly pleased, which matches a small everyday moment. Option A is closer to excited and would be overkill, even slightly strange, here. Option B is neutral and option D is sad — neither acknowledges anything positive.

    **Concept Tested:** Expression Intensity

    **See:** [Not a Light Switch: Expression Intensity](index.md#not-a-light-switch-expression-intensity)

---

#### 5. What are eyes best at signaling when working alone, and what are they weakest at?

<div class="upper-alpha" markdown>
1. Best at valence; weakest at arousal
2. Best at arousal, how energetic or calm a face reads; weakest at identifying which specific emotion is present
3. Best at identifying the specific emotion; weakest at showing intensity
4. Best at gaze direction; weakest at anything emotional
</div>

??? question "Show Answer"
    The correct answer is **B**. Wide eyes alone could mean afraid, surprised, or excited, and a viewer genuinely cannot tell which without help from the eyebrows or mouth. What eye size and eyelid coverage do communicate clearly is how aroused or calm a face reads. Pupil position mostly signals gaze direction, which Chapter 12 covers separately.

    **Concept Tested:** Eye Emotion Signaling

    **See:** [Windows, Not Just Openings](index.md#windows-not-just-openings-eye-emotion-signaling)

---

#### 6. A classmate's happy face looks perfect on their laptop but unrecognizable in a photo taken from across the room. Which rubric criterion did it fail, and what is the likely cause?

<div class="upper-alpha" markdown>
1. Classroom-distance readability — the mouth curvature is too subtle to survive at small apparent size
2. Deliberate symmetry — the face must be asymmetric to read at distance
3. Face-only clarity — the design depends on a voice cue the robot lacks
4. Confusable-neighbor distance — happy is being mistaken for excited
</div>

??? question "Show Answer"
    The correct answer is **A**. A design tested only at six inches from a laptop screen is tested in the one condition it is least likely to be viewed under. A one- or two-pixel difference that carries the whole expression will vanish at classroom distance, and no larger display can rescue a design that relies on it. Step back, or view a photo from across a room, before calling an expression done.

    **Concept Tested:** Viewing Distance Readability

    **See:** [Two Very Different Screens, Two Very Different Rooms](index.md#two-very-different-screens-two-very-different-rooms-viewing-distance-readability-and-classroom-lighting-consideration)

---

#### 7. Why do the simple, abstract faces taught in this book largely avoid the uncanny valley?

<div class="upper-alpha" markdown>
1. Because monochrome displays cannot render enough detail to trigger discomfort
2. Because the valley only affects physical robots, not screen-based ones
3. Because animation speed keeps viewers from examining the face closely
4. Because a face that never attempts photorealism cannot fall into the gap reserved for faces that almost achieve it
</div>

??? question "Show Answer"
    The correct answer is **D**. The uncanny valley is a sharp dip in comfort that appears when a robot looks almost, but not quite, fully human. Flat colors, ellipse eyes, and triangle eyebrows sit on the safe, rising side of that curve. Staying simple is not a limitation this course works around — it sidesteps one of the hardest problems in robot design entirely.

    **Concept Tested:** Uncanny Valley Effect

    **See:** [The Dip Your Simple Face Skips](index.md#the-dip-your-simple-face-skips-uncanny-valley-effect)

---

#### 8. What is anthropomorphism, and why does it matter for this course?

<div class="upper-alpha" markdown>
1. The study of how robots physically resemble human skeletons, which guides face proportions
2. A rendering technique that smooths curves to look more organic
3. The tendency to attribute human characteristics and emotions to non-human objects, which is what makes a screen face work at all
4. A measure of how accurately a robot recognizes human emotions in its camera feed
</div>

??? question "Show Answer"
    The correct answer is **C**. People readily describe Cozmo, Vector, Miko, and Buddy as curious, moody, or affectionate based on nothing more than two eyes on a screen and some motion. That wiring is not a bug clever design exploits — it is simply how people read intention into anything that moves and reacts, and this entire course exists because it is real.

    **Concept Tested:** Anthropomorphism

    **See:** [Why a Screen Ever Feels Like Someone](index.md)

---

#### 9. Why does a screen-only robot face have to work harder than a face on a robot with voice and motion?

<div class="upper-alpha" markdown>
1. It carries the whole emotional signal alone, with no tone of voice or posture to reinforce an unclear expression
2. Screens refresh too slowly to hold a viewer's attention without sound
3. Voice and motion make an expression more ambiguous, so removing them is always simpler
4. A screen face must render every FACS action unit to compensate
</div>

??? question "Show Answer"
    The correct answer is **A**. Multimodal emotion cues — voice tone, body motion, sound effects, light color — let a full robot communicate redundantly, so one weak channel is forgiven. This course deliberately focuses on the face alone, which is precisely why readability, intensity, and ambiguity deserve this much design attention.

    **Concept Tested:** Multimodal Emotion Cues

    **See:** [Sound, Motion, and Voice This Book Leaves Out](index.md#sound-motion-and-voice-this-book-leaves-out-multimodal-emotion-cues)

---

#### 10. According to the emotional design rubric, what does the "appropriate intensity" criterion ask you to check?

<div class="upper-alpha" markdown>
1. That the display's brightness is high enough for the room
2. That every expression uses the widest parameter range the hardware allows
3. That the intensity matches the situation rather than defaulting to maximum every time
4. That the expression uses at least three moving features
</div>

??? question "Show Answer"
    The correct answer is **C**. A subtle moment should get a subtle expression and a big moment a big one. Pushing every parameter to its extreme by default flattens a robot's emotional range and makes genuinely big moments read as ordinary. The rubric turns this from a gut feeling into a criterion you can point at during a critique.

    **Concept Tested:** Emotional Design Rubric

    **See:** [Judging Your Own Work Like a Designer Would](index.md#judging-your-own-work-like-a-designer-would-emotional-design-rubric)
