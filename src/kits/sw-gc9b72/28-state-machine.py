# Lab 28: A State Machine -- Giving the Face a Memory
#
# Lab 19's menu had no memory. Press A and you get the next emotion, over
# and over, and the face reacts to your finger the same way no matter what
# happened ten seconds ago. Real creatures are not like that. Poke someone
# who is already annoyed and you get a different answer than poking
# someone who is asleep.
#
# The idea that fixes this is a STATE MACHINE, and it is one of the most
# useful abstractions in all of computing -- vending machines, traffic
# lights, game characters, and network protocols are all built on it. It
# needs only two things:
#
#   STATES       the situations the face can be in, one at a time
#   TRANSITIONS  which state each event moves you to, from each state
#
# Write both as tables and the main loop shrinks to "look up what happens
# next, then do it." Adding a whole new mood becomes two rows of data
# instead of another branch tangled into a growing pile of if-statements.
#
# Worth noticing while you read the two tables below: only ONE of them
# changed when this lab came across from the smartwatch kit's 240x240
# panel. POSES is full of pixels, so every number in it was multiplied by
# 1.5. TRANSITIONS contains no pixels at all -- just state names and
# timeouts -- so it is character for character the table from the other
# kit. A state machine is a fact about behavior, and behavior does not
# have a resolution.
#
# Button A pokes the robot. Button B calms it. Wait long enough and it
# gets bored, then falls asleep on its own.

import config
import face
from utime import ticks_ms, ticks_diff, sleep_ms

button_a, button_b = config.init_buttons()

# What each state LOOKS like, in the column format from lab 24.
#           eye_rx  eye_ry  brow_L  brow_R  lift  mouth        x   y
POSES = {
    "Idle":    (36, 33,   0,   0,   0, face.FLAT,  45,  0),
    "Curious": (39, 44, -11,   8,  15, face.SMIRK, 45,  0),
    "Happy":   (36, 36,   0,   0,   8, face.SMILE, 75, 36),
    "Annoyed": (36, 18,  18,  18,  -8, face.FLAT,  39,  0),
    "Asleep":  (36,  3,   0,   0, -11, face.FLAT,  21,  0),
}

# What each state DOES, which is a different question. Read a row like a
# sentence: "from Idle, A leads to Curious, B leads to Annoyed, and after
# 8000 ms of nobody touching anything, we fall Asleep."
#
#          state         A -> ...     B -> ...     after ms -> ...
TRANSITIONS = {
    "Idle":    {"a": "Curious", "b": "Annoyed", "timeout": (8000, "Asleep")},
    "Curious": {"a": "Happy",   "b": "Idle",    "timeout": (5000, "Idle")},
    "Happy":   {"a": "Happy",   "b": "Idle",    "timeout": (4000, "Idle")},
    "Annoyed": {"a": "Asleep",  "b": "Idle",    "timeout": (6000, "Idle")},
    "Asleep":  {"a": "Curious", "b": "Curious", "timeout": None},
}

# WHERE THE STATE'S NAME GOES, and why it is not just face.LABEL_Y.
#
# On the smartwatch kit this lab let face.label() use its default spot and
# the caption was 8x16, sixteen rows tall. Here face.label() draws in the
# 16x32 font -- twice as tall, while every position around it only grew by
# 1.5. A caption at the default row 45 therefore paints its black glyph
# background all the way down to row 76, and Curious lifts its eyebrows to
# row 67, so the inner tip of one brow would simply vanish under the name.
# It would look like a drawing bug and it would really be a font that
# refused to scale.
#
# Row 32 puts the caption's bottom edge at 63, four rows clear of the
# highest brow this lab ever draws, and the safe circle is still about
# 159 px wide up there -- comfortable for the 112 px that "Curious" and
# "Annoyed", the longest names here, actually need.
LABEL_Y = 32


def draw_state(name):
    eye_rx, eye_ry, brow_l, brow_r, lift, style, size_x, size_y = POSES[name]
    face.clear()
    face.eyes(eye_rx, eye_ry)
    face.eyebrows(brow_l, brow_r, lift)
    face.mouth(style, size_x, size_y)
    face.label(name, y=LABEL_Y)
    if name == "Asleep":
        face.label("zZ", y=face.BOTTOM_LABEL_Y)


state = "Idle"
entered_at = ticks_ms()
draw_state(state)
print("state:", state)


def go_to(next_state, because):
    """The only place in the program that changes state. Funnelling every
    change through one function means there is exactly one line to watch
    when the face ends up somewhere you did not expect."""
    global state, entered_at
    print(state, "--", because, "->", next_state)
    state = next_state
    entered_at = ticks_ms()
    draw_state(state)


while True:
    rules = TRANSITIONS[state]

    if face.pressed(button_a):
        face.wait_for_release(button_a)
        go_to(rules["a"], "poke")

    elif face.pressed(button_b):
        face.wait_for_release(button_b)
        go_to(rules["b"], "calm")

    elif rules["timeout"] is not None:
        after_ms, next_state = rules["timeout"]
        if ticks_diff(ticks_ms(), entered_at) >= after_ms:
            go_to(next_state, "waited " + str(after_ms) + "ms")

    sleep_ms(10)

# Notice what the loop above does NOT contain: the word "Happy", the word
# "Asleep", or any knowledge of what a poke means. All of that lives in
# the tables. The loop just follows them.
#
# Things to try:
#
# 1. Draw the machine on paper first -- a circle for each state, an arrow
#    for each transition, labeled A, B, or the timeout. Five circles,
#    fourteen arrows. That drawing IS the two tables above, and it is how
#    engineers design this kind of code before writing any.
#
# 2. Add a "Startled" state: eyes wide, brows way up, mouth open. Give it
#    a 700 ms timeout back to Curious, and make Asleep + A go to Startled
#    instead. Two rows of data, no new logic -- waking a sleeping robot
#    should surprise it. When you pick the brow lift, remember the note
#    above LABEL_Y: a lift past 14 pushes the brows up under the caption.
#
# 3. Find the trap. From Happy, button A leads back to Happy forever. Is
#    that a bug or a personality? Try changing it to "Annoyed" and see
#    whether a robot that gets tired of being poked feels more alive.
#
# 4. Watch the shell while you play. Every transition prints, so you get a
#    written history of the robot's mood -- the technique from lab 26,
#    aimed at behavior instead of speed.
#
# 5. draw_state() calls face.clear() on every transition, and on this
#    screen that is 129,600 pixels -- 259,200 bytes down the SPI wire, and
#    you can watch the wipe happen. Because states change at most a few
#    times a second, it is still a defensible choice. Rewrite it to erase
#    only the boxes that differ between the old pose and the new one, and
#    decide for yourself whether the extra bookkeeping earned its keep.
#    There is no single right answer, and knowing that is the skill.
