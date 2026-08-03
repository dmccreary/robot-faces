# Robot Faces Glossary of Terms

#### 128x64 Monochrome OLED

A small self-lit screen with 128 horizontal and 64 vertical pixels, each either on or off, commonly driven by an SSD1306 chip in this course's projects.
**Example:** A 128x64 monochrome OLED can show a simple two-eyes-and-a-mouth robot face using only white pixels on a black background.
**Contrast with:** 240x240 Color Round Display

#### 240x240 Color Round Display

A circular screen with 240 by 240 pixels arranged in a square frame but visible through a round bezel, capable of full RGB565 color, typically driven by a GC9A01 chip.
**Example:** The 240x240 color round display lets a robot face use a pink blush or a red angry glow that the monochrome OLED cannot show.
**Contrast with:** 128x64 Monochrome OLED

#### Abstraction

The practice of hiding complex implementation details behind a simpler interface, such as a draw_face() function that lets other code request an expression without knowing how each shape is drawn.
**Example:** Abstraction lets a student call draw_face("happy") without needing to remember every ellipse and quadrant fill code involved.
**See also:** Parameterized Face Design

#### Affective Computing

The field of computing focused on systems that recognize, interpret, or express emotion, of which a robot face's expression system is one practical example.
**Example:** This course's draw_face() function is a hands-on example of affective computing: software that expresses an emotional state visually.

#### Afraid Expression

A facial expression signaling fear, typically drawn with wide, enlarged eyes, raised eyebrows, and a slightly open mouth.
**Example:** An afraid expression can be built by enlarging the eye size parameter and raising both eyebrows higher than the neutral position.

#### Algorithm Design

The process of planning a clear, ordered sequence of steps to solve a problem, such as deciding the exact order of operations needed to draw and update a complete expression.
**Example:** Algorithm design for a blink involves deciding the exact sequence: draw eyes closed, wait, then draw eyes open again.

#### Analog Input Reading

Reading a pin's value across a continuous range rather than just two states, used to measure a varying voltage such as one produced by a potentiometer.
**Example:** Analog input reading from a potentiometer returns a number that smoothly changes as the knob is turned.
**Contrast with:** Digital Input Reading

#### Analog-To-Digital Conversion

The process by which the RP2040's ADC hardware translates a continuous analog voltage into a discrete numeric value a program can read.
**Example:** Analog-to-digital conversion turns a potentiometer's voltage into a number from 0 to 65535 that MicroPython code can use directly.

#### Angry Expression

A facial expression signaling frustration or hostility, typically drawn with eyebrows angled sharply downward toward the nose and a flat or downturned mouth.
**Example:** An angry expression often uses a triangle eyebrow shape angled steeply toward the center of the face.

#### Animation Keyframe

A defined point in an animation sequence with a specific set of feature values, between which a program can interpolate to create smooth motion.
**Example:** A blink animation might use three animation keyframes: eyes open, eyes closed, and eyes open again.

#### Animation Loop

The repeating block of code, usually inside a while loop, that continuously updates and redraws a robot face over time to create motion or changing expressions.
**Example:** The animation loop checks the blink timer on every pass and redraws the eyes closed for a few frames when it's time to blink.

#### Animation State Timer

A variable that tracks how much time has passed since an animation event last occurred, used to decide when the next event, like a blink, should trigger.

#### Anki Company History

The timeline of the robotics company Anki, from its founding and product launches through its 2019 shutdown, used in this course as a case study in commercial risk.

#### Anki Cozmo

A small consumer social robot released in 2016 with a simple animated-eye screen face and physical treads, known for expressive personality-driven behavior on a limited budget of hardware.
**Example:** Cozmo's tiny screen showed only two animated eyes, yet reviewers described the robot as having real personality.

#### Anki Vector

Anki's more capable follow-up robot to Cozmo, adding voice-assistant features and cloud connectivity while keeping a similar animated-eye screen face.
**Example:** Anki Vector could answer spoken questions in addition to displaying Cozmo-style animated eyes.
**See also:** Anki Cozmo

#### Anthropomorphism

The tendency to attribute human traits, emotions, or intentions to non-human things, which is the underlying reason a simple screen face can feel alive to a viewer.
**Example:** Anthropomorphism explains why people say Cozmo seems "curious" even though it is only running pre-programmed animation code.
**See also:** Screen As Face Metaphor

#### Anti-Aliasing Limitation

The FrameBuffer module's inability to smooth jagged pixel edges along diagonal or curved lines, since every pixel is drawn fully on or off, or as one solid color.
**Example:** Anti-aliasing limitation means a diagonal eyebrow drawn with line() will always show a visible stair-step edge up close.

#### Approximating Curves With Lines

The technique of drawing many short straight line segments close together to visually simulate a smooth curve, used before ellipse() and poly() were available.
**Example:** Early robot face sketches used approximating curves with lines to fake a rounded mouth using dozens of tiny line() calls.
**See also:** Pre-2023 Curve Workaround

#### Aspect Ratio

The proportional relationship between a display's width and height, such as the OLED's wider-than-tall 128x64 ratio compared to the round display's square 240x240 ratio.
**Example:** Designing a face for the OLED's aspect ratio means keeping features closer together horizontally than on the square color display.

#### Basic Emotion Theory

The psychological theory, associated with Paul Ekman, that a small number of emotions are biologically universal and expressed through recognizable, consistent facial patterns.
**See also:** Ekman Universal Emotions

#### Bit Depth

The number of bits used to represent each pixel's color or brightness, which determines how many distinct colors or shades a display can show.
**Example:** The OLED's 1-bit depth allows only on or off, while the color round display's 16-bit depth allows thousands of colors.
**See also:** RGB565 Color Model

#### Bit Shifting

An operation that moves a number's bits left or right by a specified amount, effectively multiplying or dividing by powers of two, used when packing color or mask values.
**Example:** Bit shifting a red value left by 11 places positions it correctly within a 16-bit RGB565 color number.
**See also:** RGB565 Color Model

#### Bitmap

A grid of pixel values that together form an image, the underlying data format that both a frame buffer and a sprite are built from.

#### Bitwise Operator

An operator such as & (AND), | (OR), or ^ (XOR) that manipulates the individual bits of a number, used in this course to build quadrant fill codes for ellipse().
**Example:** Combining two bitwise operator flags with | selects the top-left and top-right quadrants of an ellipse to fill.

#### Blinking Animation

A short animation sequence that closes and reopens the eyes over a few frames, used to make a robot face feel alive even when its expression is not changing.
**Example:** A blinking animation might draw an eyelid representation fully closed for two frames before returning to open eyes.

#### Blit Cross-Format Support V1.17

The MicroPython 1.17 release milestone at which the blit method gained the ability to copy pixels between frame buffers using different color formats, using palette mapping.
**Example:** Blit cross-format support v1.17 makes it possible to blit a monochrome sprite onto a color frame buffer with the right palette.

#### Blit Method

The FrameBuffer method blit(source, x, y, key) that copies another frame buffer's pixels onto the current one at position (x, y), optionally skipping a transparent color.
**Example:** The blit method stamps a pre-drawn pupil sprite onto the eye at whatever position gaze tracking requires.
**See also:** Sprite

#### Blit Palette Mapping

An optional feature of the blit method that uses a palette frame buffer to translate a source image's pixel values into different destination color values during the copy.
**Example:** Blit palette mapping can recolor a single grayscale pupil sprite into different colors as it moves across a color display.

#### Blue Frog Robotics Buddy

A French-developed home companion robot project with a screen face and a mobile wheeled base, intended for family and eldercare use before the company faced financial difficulty.
**Example:** Blue Frog Robotics Buddy was designed to roll around a home checking on family members, using its screen face to show concern or greeting.

#### Boolean Data Type

A data type that holds only one of two values, True or False, commonly used as a flag such as whether a shape should be filled.
**Example:** The fill parameter of the rect() method uses the boolean data type to decide between an outline and a solid rectangle.

#### Bottom-Half Mouth Curve

A common mouth-drawing technique that uses only the lower two quadrants of an ellipse to create a smile or frown shape, leaving the top half unfilled.
**Example:** A bottom-half mouth curve drawn with a quadrant fill code of the lower quadrants produces a simple curved smile.

#### Bounding Box

The smallest rectangle that fully contains a shape or group of shapes, useful for calculating collision, centering, or layout before drawing.

#### Breadboard Wiring Diagram

A visual reference showing exactly which microcontroller pin connects to which breadboard hole or display pin, used to wire a circuit correctly before powering it on.

#### Buddy Mobile Robot Base

The wheeled locomotion platform beneath Blue Frog Robotics Buddy that let the robot navigate a home independently while its screen displayed a face.
**Example:** The Buddy Mobile Robot Base used sensors to avoid furniture while the screen above it displayed a neutral expression.

#### Button Debounce

A technique for ignoring the rapid, unintended on-off electrical noise a mechanical button produces the instant it is pressed or released, so one press registers as exactly one event.
**Example:** Without button debounce, a single press of the mode button might accidentally register as two or three presses in code.
**See also:** Debounce Time Constant

#### Button Interrupt Handler

A function registered to run automatically the instant a button pin changes state, rather than being detected by repeatedly checking the pin in a loop.
**Example:** A button interrupt handler can change the mood variable the moment a button is pressed, even during a slow drawing operation.

#### Byte Alignment In Buffer

The way a monochrome frame buffer packs eight vertical or horizontal pixels into each byte of memory, which programmers rarely handle directly but which explains buffer size.

#### Capstone Demonstration

The final presentation in which a student shows their completed capstone project working on real hardware and explains the design decisions behind it.
**Example:** During the capstone demonstration, a student cycled through every expression on the round display while explaining how each eyebrow angle was chosen.

#### Capstone Project

The culminating assignment of this course, in which a student designs, codes, and demonstrates an original expressive robot face that applies the course's full range of skills.
**Example:** For the capstone project, one student built a robot face with six original expressions and a rotary-encoder-driven expression menu.

#### Cheek Representation

An optional facial feature, often a small filled shape near the lower face, used to suggest blushing, exertion, or added warmth in an expression.
**Example:** A pink cheek representation on the color round display can make a happy expression feel warmer than eyes and a mouth alone.

#### Chip Select Pin

An SPI control line that tells a specific device on a shared bus to listen to the current data transmission, letting one microcontroller talk to multiple SPI devices.
**Example:** Pulling the chip select pin low tells the color display that the following bits are meant for it.

#### Circle As Special Ellipse

The observation that a circle is simply an ellipse whose horizontal and vertical radii are equal, so the same ellipse() method draws both shapes.
**Example:** Calling ellipse() with xr and yr both set to 8 draws a circle as a special case of an ellipse for a round pupil.

#### Circular Display Geometry

The design constraint that a round display's usable image area is a circle inscribed within its square pixel grid, so content near the corners is not visible.
**Example:** Circular display geometry means a robot face drawn on the round screen should keep its features near the center, away from the hidden corners.

#### Classroom Lighting Consideration

The effect of ambient light on how visible a display's expression appears, which can wash out a screen or make colors harder to distinguish.
**Example:** Classroom lighting consideration led one team to increase the color round display's brightness setting near a sunny window.

#### Clipping At Screen Edge

The FrameBuffer behavior of automatically ignoring or truncating any part of a drawing command that falls outside the buffer's width and height, preventing errors or memory corruption.
**Example:** Clipping at screen edge lets a program draw an eyebrow slightly off the top of the screen without crashing.

#### Closed Polygon Path

The property of the poly method that automatically connects the last vertex back to the first, ensuring the drawn shape's outline forms a complete loop.
**Example:** Because of the closed polygon path behavior, a three-point triangle eyebrow needs only three vertices, not four.

#### Code Reuse

Writing a function or module once and using it in multiple places, avoiding duplicated code and reducing the chance of inconsistent behavior between similar features.
**Example:** Code reuse lets a single draw_eyebrow() function serve both the left and right eyebrow just by passing different coordinates.

#### Color Bit Depth

The number of bits allocated to represent color in a display format, which determines how many distinct colors can be shown; RGB565 uses 16 bits total.

#### Color Contrast Design

Choosing colors for facial features so they remain clearly visible against the background and against each other, avoiding combinations that are hard to distinguish.
**Example:** Color contrast design avoids placing a dark blue mouth on a black background, since the two would be nearly impossible to tell apart.

#### Color Cycling Animation

An animation effect that continuously changes a shape's color over time, often using a color wheel function, to create a lively or festive visual effect.
**Example:** A color cycling animation might slowly shift a cheek highlight's color to celebrate a randomized excited expression.

#### Color Display Init Sequence

The specific series of setup commands sent to a color display driver, like GC9A01, during initialization, including timing delays and configuration bytes unique to that chip.
**Example:** The color display init sequence for the GC9A01 must run in the exact documented order or the screen may show garbled colors.

#### Color Emotion Association

Cultural and psychological associations between specific colors and emotional meanings, such as red with anger or blue with calm, used to reinforce an expression's message.
**Example:** Color emotion association might add a red glow behind an angry expression to strengthen the message the eyebrows and mouth already send.

#### Color Palette

A defined, limited set of colors chosen for a project, used consistently across expressions to keep a robot face's visual style coherent.

#### Color Theory Basics

Foundational principles about how colors relate to each other and combine, including concepts like primary colors and complementary pairs, applied here to expressive robot face design.
**Example:** Color theory basics helped one student choose an orange glow that stood out clearly against a teal-colored robot face background.

#### Color Versus Mono Trade-Off

The design decision between the richer expressive range of a color display and the lower cost, memory use, and complexity of a monochrome display.
**Example:** The color versus mono trade-off might lead a budget-conscious classroom to choose the OLED even though it can't show a blushing cheek.

#### Color Wheel Function

A function that generates a smoothly changing sequence of colors by sweeping through hue values, useful for rainbow or cycling animation effects.
**Example:** A color wheel function can cycle an idle glow ring through the full rainbow over several seconds on the round display.

#### Color565 Function

A helper function that converts separate red, green, and blue values into a single packed RGB565 number suitable for passing to a drawing method.
**Example:** Calling a color565 function with (255, 100, 50) returns one 16-bit number representing that orange color for use in fill_rect().

#### Comment Syntax

Text in a program, marked with a leading #, that MicroPython ignores when running the code, used by programmers to explain what a line or block does.

#### Companion Robot Category

The class of consumer robots designed to provide social interaction, emotional engagement, or assistance in daily life, as distinct from industrial or research robots.

#### Computational Thinking

A problem-solving approach that breaks challenges into steps a computer can carry out, using techniques like abstraction, decomposition, pattern recognition, and algorithm design.
**Example:** Computational thinking is what turns "draw a happy robot face" into a specific sequence of ellipse and poly method calls.
**See also:** Abstraction

#### Concave Polygon

A polygon with at least one interior angle greater than 180 degrees, creating a dent or notch in its outline.
**Example:** A jagged, lightning-bolt-shaped eyebrow drawn with poly() would be a concave polygon.
**Contrast with:** Convex Polygon

#### Conditional Statement

A control structure, written with if, elif, and else, that runs different blocks of code depending on whether a condition is true or false.
**Example:** A conditional statement checks if mood == "sad" and draws downward eyebrows only when that condition is true.

#### Confused Expression

A facial expression signaling puzzlement, typically drawn with asymmetrical eyebrows, such as one raised and one level, breaking facial symmetry.
**Example:** A confused expression often raises just the left eyebrow while keeping the right eyebrow at its neutral angle.
**See also:** Facial Symmetry

#### Constant

A named value in a program that is set once and not intended to change while the program runs, often used for fixed settings like screen dimensions.
**Example:** SCREEN_WIDTH = 128 defines a constant used throughout the drawing code instead of retyping the number 128.
**Contrast with:** Variable

#### Constraint-Driven Design

A design approach that treats fixed limitations, like screen resolution, available memory, or processing speed, as a starting framework rather than an afterthought.

#### Consumer Robotics Market

The overall industry and customer base for robots sold directly to individuals and families, rather than businesses or governments.

#### Contempt Expression

A facial expression signaling scorn or disdain, typically drawn asymmetrically, such as with only one side of the mouth raised.
**Example:** A contempt expression breaks facial symmetry deliberately, raising just one corner of the mouth into a slight smirk.

#### Control Mapping Design

The overall plan for which physical control, such as a button, potentiometer, or encoder, performs which function in a robot face project.

#### Convex Polygon

A polygon in which every interior angle is less than 180 degrees, so any line segment between two points inside the shape stays inside it.
**Example:** A simple triangular eyebrow is a convex polygon, with no dents in its outline.
**Contrast with:** Concave Polygon

#### Cooperative Multitasking

A style of program design where a single loop checks and briefly services multiple ongoing tasks, like animation timing and button reading, in turn, without true parallel execution.
**Example:** Cooperative multitasking lets one while loop handle blinking, gaze movement, and button checks all in the same pass.

#### Coordinate Plane Quadrant

One of the four regions a coordinate plane is divided into around a center point, used when reasoning about which part of a shape, like an ellipse, to fill.
**Example:** Selecting the top-left coordinate plane quadrant of an eyebrow ellipse leaves the rest of the shape unfilled for a raised-eyebrow look.

#### Core Task Assignment

The design decision of which specific task, such as display drawing or input reading, runs on which of the RP2040's two processor cores.

#### Cozmo Emotion Engine

The internal software system in Anki Cozmo that selected and blended animated behaviors and screen expressions based on the robot's simulated internal state.
**Example:** The Cozmo Emotion Engine could make the robot appear "frustrated" after repeatedly failing to stack a cube.

#### Cross-Cultural Recognition

The finding from basic emotion theory that people from different cultural backgrounds can identify the same basic facial expressions with similar accuracy.

#### Cross-Display Code Compatibility

The degree to which the same drawing code can run unchanged on both the monochrome OLED and the color round display, thanks to both being built on the FrameBuf module.

#### Crowdfunding Campaign

A public fundraising effort, typically run on a platform like Kickstarter, where a company pre-sells a product to backers to fund its development before mass production.

#### Cytron Maker Pi RP2040

A breakout board that hosts an RP2040 chip alongside built-in buttons, LEDs, and screw terminals, reducing the wiring needed to connect displays and controls.
**Example:** Some classroom kits use the Cytron Maker Pi RP2040 so students can skip building a breadboard circuit for buttons.

#### Data Command Pin

A control line on some SPI displays that tells the driver chip whether the incoming byte is a command, such as setting brightness, or actual pixel data.
**Example:** The GC9A01 driver checks the data command pin to know whether a byte configures the screen or fills a pixel.

#### Data Type

A classification that tells a program what kind of value a variable holds, such as a whole number, true/false value, or text, which determines what operations are valid on it.

#### Debounce Time Constant

The specific duration chosen for a button debounce delay, tuned to be long enough to filter noise but short enough to feel responsive.
**Example:** Testing found that a debounce time constant of 15 milliseconds worked reliably for the momentary push buttons used in this course.

#### Decomposition

The practice of breaking a large problem into smaller, more manageable parts, such as splitting a robot face project into separate eye-drawing, eyebrow-drawing, and mouth-drawing tasks.
**Example:** Decomposition turns "build an expressive robot face" into separate, testable pieces: wire the display, draw one feature, then combine all features into draw_face().

#### Default Face Parameters

The baseline set of feature values used to draw a neutral expression, serving as the starting point that other expressions modify.
**Example:** Default face parameters set both eyebrows level and the mouth flat, ready to be adjusted into any other emotion.

#### Default Idle State

The mode or expression a robot face program automatically returns to after a period of no input, ensuring the robot doesn't stay stuck in a menu or temporary mode.
**Example:** After ten seconds without a button press, the program returns to its default idle state and resumes the idle animation.

#### Default Parameter Value

A value automatically assigned to a function parameter when the caller does not supply one, letting a function be called with fewer arguments.
**Example:** def draw_face(mood="neutral") uses a default parameter value so calling draw_face() with no argument still shows a neutral expression.

#### Design Critique

A structured review process where a robot face design is evaluated by others against clear goals, such as readability and emotional clarity, to identify improvements.

#### Design Justification

A written or spoken explanation of why specific design choices were made, connecting decisions like an eyebrow angle or color choice back to emotional design goals.
**Example:** A design justification might explain that a mouth was kept small in the neutral expression specifically to make the happy expression's grin feel like a bigger change.

#### Design Trade-Off Analysis

The process of weighing competing design goals, such as visual richness against processing speed or memory use, to reach a reasonable final decision.

#### Dictionary Data Structure

A collection that stores values under named keys instead of numeric positions, letting a program look up a value by a descriptive label.
**Example:** A dictionary data structure like {"happy": 10, "sad": -10} maps each mood name directly to its eyebrow angle.

#### Digital Input Reading

Reading a pin's value as one of exactly two states, high or low, commonly used to detect whether a push button is pressed.
**Example:** Digital input reading on a button pin returns 0 when pressed and 1 when released, assuming a pull-up resistor is enabled.
**Contrast with:** Analog Input Reading

#### Disgusted Expression

A facial expression signaling revulsion, typically drawn with a scrunched or asymmetrical mouth and lowered, tightened eyebrows.
**Example:** A disgusted expression might combine a lopsided mouth shape with one eyebrow lower than the other.

#### Display Buffer Memory

The amount of microcontroller RAM reserved to hold one full frame buffer, which grows with both resolution and color bit depth.
**Example:** The OLED's display buffer memory is just 1,024 bytes, while the color round display needs far more RAM per frame.
**See also:** Frame Buffer Size Calculation

#### Display Driver Porting

The process of adapting drawing code written for one display driver, such as SSD1306, to work with a different driver, such as GC9A01, usually by changing only the driver setup.
**Example:** Display driver porting lets the same draw_face() function run on either screen, as long as the underlying FrameBuffer object is set up correctly.

#### Display Initialization

The one-time setup sequence, run near the start of a program, that configures a display driver's settings and prepares it to receive frame buffer data.
**Example:** Display initialization for the GC9A01 includes toggling the reset pin and sending configuration commands before any drawing happens.

#### Display Mounting Considerations

Practical factors such as viewing angle, cable strain, and enclosure fit that affect how a screen is physically attached to a robot body.

#### Display Performance Comparison

An evaluation of how the OLED and color round display differ in speed, resolution, and expressive range, used to choose the right display for a project's goals.
**Example:** A display performance comparison might show the OLED redraws faster but the round display shows richer emotional detail through color.

#### Display Power Requirements

The voltage and current a screen needs to operate safely, which must match what the microcontroller's pins or power rail can supply.

#### Display Reset Pin

A control line that, when pulsed low, restarts the display driver chip to a known starting state, typically toggled once during setup.
**Example:** The initialization code briefly pulls the display reset pin low before configuring the OLED.

#### Display Resolution

The number of pixels a screen has in each dimension, expressed as width by height, which determines how much detail an image can show.
**Example:** The color round display's 240x240 display resolution allows much finer curves than the OLED's 128x64.

#### Docstring Convention

A style of writing a short description as the first statement inside a function, using triple quotes, to document what the function does for other readers.

#### Double Buffering

A technique using two frame buffers, where one is displayed while the other is drawn to, then swapped, to prevent viewers from seeing a partially drawn frame.
**Example:** Double buffering could eliminate visible flicker during fast animations, though it requires enough extra RAM to hold a second buffer.

#### Draw Call Order Optimization

The practice of arranging drawing method calls in an order that reduces unnecessary overdraw and guarantees correct layering, such as background before foreground.

#### Draw Face Function

The central reusable function in this course's projects, typically named draw_face(), that accepts a mood or set of parameters and calls the drawing methods needed to render a complete expression.
**Example:** Calling draw_face("happy") clears the screen and draws every feature needed for a smiling expression in one function call.
**See also:** Parameterized Face Design

#### Draw Order Layering

The principle that shapes drawn later in a program overwrite pixels from shapes drawn earlier at the same position, so draw order determines the final visible image.
**Example:** Draw order layering means the background must be filled before the eyes are drawn, or the eyes would be erased.

#### Draw Time Benchmarking

The practice of measuring how long a set of drawing calls takes to execute, used to identify which drawing operations are slowing down an animation.
**Example:** Draw time benchmarking revealed that filling the entire screen every frame took longer than redrawing just the features that changed.

#### Drawing Color Value

The numeric value passed to a drawing method that specifies which color or on/off state to use, ranging from 0 or 1 on monochrome displays to a full RGB565 number on color displays.
**Example:** A drawing color value of 1 lights a pixel white on the OLED, while 0xF800 draws pure red on the round display.

#### Drawing Constants

Named values, often defined once at the top of a program, that stand in for colors or sizes used repeatedly in drawing code, improving readability.

#### Dual-Core Processing

Running separate tasks simultaneously on the RP2040's two processor cores, such as dedicating one core to animation and display updates and the other to reading inputs.
**Example:** Dual-core processing can keep button reading fully responsive on one core even while the other core is busy redrawing a complex expression.

#### Easing Function

A mathematical function that controls the rate of change during an animated transition, making motion speed up or slow down rather than move at a constant rate.
**Example:** An easing function can make an eyebrow's rise start slow, speed up, then settle gently instead of moving at one constant speed.

#### Educational Robotics Market

The segment of the robotics industry focused on products designed to teach STEM skills or support classroom and after-school learning.

#### Ekman Universal Emotions

Psychologist Paul Ekman's set of basic emotions, commonly happiness, sadness, anger, fear, surprise, and disgust, found to be recognized through facial expression across many different cultures.
**Example:** This course's core expression set is built directly from the Ekman universal emotions, giving robot faces a scientifically grounded design target.
**See also:** Basic Emotion Theory

#### Ellipse Bug Fix V1.24.1

A later MicroPython patch release that corrected a rendering defect in the ellipse() method's quadrant fill behavior.
**Example:** The ellipse bug fix v1.24.1 update resolved cases where certain quadrant fill codes produced slightly incorrect pixel edges.

#### Ellipse Method

The FrameBuffer method ellipse(x, y, xr, yr, c, f, m) that draws an oval centered at (x, y) with horizontal radius xr and vertical radius yr, optionally filled and optionally limited to certain quadrants.
**Example:** The ellipse method with equal xr and yr values draws a perfectly round pupil.
**See also:** Ellipse Radius Parameter

#### Ellipse Poly Dev Branch Merge

The point at which community-contributed code implementing ellipse() and poly() was reviewed and merged from a development branch into MicroPython's main source tree.
**Example:** The ellipse poly dev branch merge is documented in MicroPython's GitHub pull request history before the feature reached an official release.

#### Ellipse Radius Parameter

The xr and yr arguments of the ellipse method that set the oval's horizontal and vertical half-widths, independently controlling its shape.
**Example:** Setting a larger yr than xr in the ellipse radius parameter stretches a pupil into a tall oval instead of a circle.

#### Emotion Recognition Accuracy

A measure of how reliably viewers correctly identify the intended emotion from a drawn or displayed expression, used to evaluate and refine a robot face design.

#### Emotional Design Rubric

A scoring guide used to evaluate a student's robot face design against criteria like recognizability, proportion, and readability at a distance.
**Example:** An emotional design rubric might award points if classmates can correctly name an expression within two seconds of seeing it.

#### Emotix Miko

An Indian-made educational companion robot for children, featuring a screen face and content aimed at learning and emotional engagement rather than entertainment alone.
**Example:** Emotix Miko uses its screen face to react while guiding a child through an educational activity.

#### Encoder Direction Detection

The logic that reads a rotary encoder's two output signals to determine whether it is turning clockwise or counterclockwise.
**Example:** Encoder direction detection compares which of the two encoder pins changes first to decide whether the knob turned left or right.
**See also:** Encoder Quadrature Signal

#### Encoder Quadrature Signal

The pair of offset digital signals a rotary encoder produces, whose relative timing reveals both how far and in which direction the knob has turned.
**Example:** Reading the encoder quadrature signal on two pins lets the program distinguish a clockwise click from a counterclockwise one.
**See also:** Encoder Direction Detection

#### Event-Driven Programming

A programming style where code runs in response to specific triggering events, like a button interrupt, rather than being checked continuously in a loop.
**Example:** Event-driven programming using a button interrupt handler reacts to a press immediately instead of waiting for the next loop check.
**Contrast with:** Polling Input Loop

#### Excited Expression

A facial expression signaling enthusiasm, typically drawn with a wide open mouth, raised eyebrows, and enlarged eyes.
**Example:** An excited expression can combine a large happy-expression mouth curve with animated, quickly blinking eyes.

#### Expression Ambiguity

The situation where a drawn expression could reasonably be read as more than one emotion, often because too few distinguishing features were changed from neutral.

#### Expression Intensity

A parameter that scales how strongly an expression's features deviate from neutral, allowing a mild smile and a huge grin to share the same underlying drawing logic.
**Example:** Increasing expression intensity for happy pushes the mouth curvature parameter further from neutral for a bigger, more obvious smile.

#### Expression Interpolation

A technique that calculates intermediate feature values between two expressions' parameters, producing a smooth animated transition instead of an instant jump.
**Example:** Expression interpolation between neutral and happy might gradually increase the mouth curvature parameter over ten frames instead of switching it instantly.

#### Expression Selection Menu

A specific multi-mode menu interface that lets a user browse through a list of available expressions and choose one to display on the robot face.
**Example:** An expression selection menu shows the name of the currently highlighted mood on the OLED as the rotary encoder turns.

#### Expression Set Planning

The early planning stage of a project in which a student decides which specific expressions to include and sketches how each one's features will differ from neutral.
**Example:** Expression set planning for a capstone project might list six target expressions before any drawing code is written, ensuring the set covers a clear emotional range.

#### Expressiveness Versus Complexity

A specific design trade-off between how many nuanced expressions and animations a robot face supports and how complicated the resulting code becomes to write and maintain.
**Example:** Expressiveness versus complexity might lead a team to cut a planned contempt expression because it added confusing code for little added clarity.

#### Eye Emotion Signaling

The specific role eye size, pupil size, and eyelid position play in communicating emotion, especially for signaling intensity and alertness.

#### Eye Placement

The chosen x and y coordinates for each eye in a drawn face, which strongly affects how symmetrical, alert, or sleepy the face appears.
**Example:** Moving eye placement slightly higher on the screen can make a robot face look more surprised or attentive.

#### Eye Scanner Animation

An animation effect where a bar or highlight sweeps back and forth across the eyes, evoking classic sci-fi robot visuals rather than a realistic blink.
**Example:** An eye scanner animation on the OLED can sweep a bright horizontal bar left and right using the scroll method.

#### Eye Size Parameter

A variable controlling the radius or dimensions used to draw each eye, which can be adjusted to widen eyes for surprise or narrow them for suspicion.
**Example:** Increasing the eye size parameter for both eyes at once is a quick way to draw a startled expression.

#### Eye Spacing

The horizontal distance between the centers of the two drawn eyes, which affects facial proportion and must scale appropriately with screen size.
**Example:** Eye spacing on the round display needs to be wider than on the OLED simply because the round screen has more usable width.

#### Eyebrow Angle Parameter

A variable controlling the tilt of a drawn eyebrow, where a positive or negative value rotates the shape to signal different emotional states.
**Example:** Setting the eyebrow angle parameter to a steep downward tilt near the nose helps signal anger.
**See also:** Eyebrow Shape

#### Eyebrow Emotion Signaling

The specific role eyebrow angle and shape play in communicating emotion, often considered the single most important facial feature for reading a robot's mood.
**Example:** Eyebrow emotion signaling alone can shift a face from surprised to angry even if the mouth shape stays identical.

#### Eyebrow Shape

The overall form used to draw an eyebrow, such as a straight line, curved ellipse arc, or angular polygon, chosen based on the emotion being expressed.
**Example:** A curved eyebrow shape drawn with an ellipse arc reads as calm, while a sharp triangular one reads as angry.
**See also:** Eyebrow Angle Parameter

#### Eyelid Representation

A facial feature drawn as a filled rectangle or shape over part of an eye, used to show blinking, sleepiness, or a lowered gaze.
**Example:** An eyelid representation drawn as a thin filled rectangle across the top of each eye simulates a slow, sleepy blink.

#### Face Layout Grid

A planning tool that divides the screen into regions for each facial feature, helping a designer decide where eyes, eyebrows, and a mouth should sit before writing drawing code.
**Example:** Sketching a face layout grid on paper first helped one team avoid overlapping the eyebrows and eyes on the small OLED.

#### Face Outline

The overall boundary shape framing a robot's drawn face, which may be an explicit drawn border or simply the visible edge of the display itself.
**Example:** On the round color display, the face outline is simply the circular screen edge, so no extra border needs to be drawn.

#### Face State Data Structure

A dictionary or set of variables that stores the current values for every facial feature's position, size, and angle at a given moment.
**Example:** A face state data structure holding eye_size, eyebrow_angle, and mouth_curve lets one draw_face() call read every needed value at once.

#### Facial Action Coding

A detailed system for describing facial expressions in terms of individual muscle movements, used by researchers to precisely analyze which features signal which emotions.

#### Facial Proportion

The relative sizing and spacing of facial features to one another, which affects whether a drawn face reads as expressive and pleasant rather than distorted.

#### Facial Symmetry

The property of a drawn face where the left and right sides mirror each other in position and size, which most neutral and calm expressions rely on.
**Example:** Breaking facial symmetry by raising only one eyebrow can quickly signal confusion or skepticism.
**See also:** Confused Expression

#### Feature Independence

The design principle that each facial feature, such as an eyebrow or mouth, is drawn and controlled by its own separate parameters, so changing one does not require changing others.

#### Feature Scaling For Screen Size

The practice of calculating facial feature sizes as a proportion of screen dimensions rather than fixed pixel counts, so a face design works on both the OLED and round display.
**Example:** Feature scaling for screen size lets the same draw_face() logic produce a well-proportioned face on both the 128x64 OLED and the 240x240 round display.

#### Fill Method

The FrameBuffer method fill(c) that sets every pixel in the buffer to a single color value, typically used to clear the screen before drawing a new frame.
**Example:** oled.fill(0) clears the entire display to black before draw_face() draws the next expression.

#### Filled Rectangle Method

The FrameBuffer method fill_rect(x, y, w, h, c) that draws a solid rectangle, coloring every pixel within its width and height rather than just the outline.
**Example:** The filled rectangle method can quickly block in a solid rectangular cheek highlight.
**Contrast with:** Rectangle Method

#### Filled Versus Outlined Shape

The distinction, controlled by a boolean fill parameter on methods like rect() and ellipse(), between drawing only a shape's border and coloring its entire interior.
**Example:** Choosing filled versus outlined shape for an eyebrow determines whether it looks like a solid arc or just its edge.

#### Flicker Reduction

Techniques used to prevent a visibly jarring flash or blink each time the screen redraws, such as minimizing full-screen fills or using double buffering.
**Example:** Flicker reduction on the round display can involve redrawing only the mouth region instead of clearing and rebuilding the entire face every frame.

#### For Loop

A control structure that repeats a block of code a set number of times or once for each item in a sequence, such as a list of expressions.
**Example:** A for loop can step through a list of five expressions, drawing each one for two seconds during a demo.
**Contrast with:** While Loop

#### Frame Buffer

A region of memory that holds the color or on/off value of every pixel for one complete image before it is sent to the physical display.
**Example:** Every drawing call in this course, like fill() or ellipse(), changes values inside the frame buffer, not the screen itself, until show() is called.
**See also:** FrameBuf Module

#### Frame Buffer Redraw Rate

The practical upper limit on how often a program can update and push a full frame buffer to the display, constrained by SPI or I2C bus speed and drawing complexity.
**Example:** The frame buffer redraw rate on the color round display is lower than on the OLED because more pixel data must travel over SPI each frame.
**See also:** SPI Bus Speed

#### Frame Buffer Size Calculation

The arithmetic used to determine how many bytes a frame buffer needs, based on width, height, and bits used per pixel.
**Example:** A frame buffer size calculation for the 128x64 monochrome OLED gives 128 times 64 divided by 8, or 1,024 bytes.

#### Frame Rate

The number of times per second a program redraws and updates the display, which determines how smooth animations like blinking or gaze movement appear.
**Example:** A frame rate around 10 to 15 redraws per second is usually fast enough for smooth blinking on these displays without overloading the microcontroller.

#### Framebuf Method Set Before V1.20

The original collection of framebuf drawing methods available before ellipse() and poly() were added, including fill, pixel, hline, vline, line, rect, text, scroll, and blit.
**Example:** Under the framebuf method set before v1.20, drawing a round pupil required approximating curves with lines instead of calling ellipse().

#### FrameBuf Module

MicroPython's built-in software module that provides the FrameBuffer class and its drawing methods, such as fill, pixel, and ellipse, for building an image in memory before displaying it.
**Example:** The FrameBuf module supplies every drawing method this course uses, from fill() to the newer ellipse() and poly().
**See also:** Frame Buffer

#### FrameBuf Version Timeline

The sequence of MicroPython releases across which the framebuf module gained new drawing methods and bug fixes, from its original basic method set through the addition of ellipse() and poly().

#### Function Definition

A block of code introduced with the def keyword that names a reusable set of instructions, optionally accepting inputs and producing an output.
**Example:** The function definition def draw_face(mood): groups every drawing command needed to show one expression under a single reusable name.

#### Function Parameter

A named placeholder listed in a function definition that receives a value passed in when the function is called, letting the function behave differently each time.
**Example:** In def draw_face(mood), mood is a function parameter that lets the same function draw a happy or sad face depending on what is passed in.

#### Function Return Value

The result a function sends back to the code that called it, using the return keyword, which the caller can store or use immediately.
**Example:** A function that calculates eyebrow angle from a mood string produces a function return value the drawing code then uses directly.

#### GC9A01 Display Driver

The controller chip built into round color displays that receives RGB565 pixel data over SPI and refreshes the physical screen.
**Example:** MicroPython code creates a gc9a01 driver object to send a completed frame buffer to the round display.

#### Global State Variable

A variable defined outside any function, accessible throughout a program, commonly used to hold shared information like the current mood that both cores or multiple functions need to read.
**Example:** A global state variable named current_mood lets both the animation loop and the button handler agree on which expression to draw.

#### Global Versus Local Scope

The distinction between a variable defined outside any function, visible everywhere (global), and one defined inside a function, visible only within it (local).
**Example:** A blink_timer variable declared inside draw_face() has local scope and disappears once the function finishes, unlike a global mood variable.

#### Happy Expression

A facial expression signaling joy or pleasure, typically drawn with an upward-curved mouth and eyes that may narrow slightly.
**Example:** A happy expression uses a wide bottom-half mouth curve alongside level or slightly raised eyebrows.

#### Hardware Cost Trade-Off

A design decision that weighs a more capable or expensive component against a cheaper option that limits features, such as screen resolution or processor speed.
**Example:** Choosing the 128x64 monochrome OLED over the color round display is a hardware cost trade-off that saves money but removes color-based emotion cues.

#### Horizontal Line Method

The FrameBuffer method hline(x, y, w, c) that draws a straight line of w pixels wide starting at (x, y) and extending rightward.
**Example:** A horizontal line method call can draw a flat, unimpressed mouth as a single straight line.

#### Hue Saturation Brightness

An alternative way of describing a color using its base hue, how vivid or muted it is (saturation), and how light or dark it is (brightness), useful when designing a color palette.
**Example:** Adjusting hue saturation brightness values instead of raw RGB numbers made it easier for students to create a matching set of expression colors.

#### Human-Robot Interaction

The academic field studying how people and robots communicate and respond to each other, including how facial expressions affect trust and comfort.
**Example:** Human-robot interaction research shows that even a simple screen face can make a robot feel more approachable to a stranger.

#### I2C Interface

A two-wire serial communication protocol sharing one clock and one data line among multiple devices, commonly used to connect the monochrome OLED to the microcontroller.
**Example:** The SSD1306 OLED can be wired to the Pico using an I2C interface with just four wires total.
**Contrast with:** SPI Interface

#### Idle Animation

A subtle, repeating animation, such as occasional blinking or slight pupil drift, that plays automatically when a robot face is not actively changing expression.
**Example:** An idle animation keeps the neutral expression from looking frozen by blinking every few seconds even when no button has been pressed.

#### Import Statement

A line of code that loads a module's functions and classes into a program so they can be used, such as bringing in the framebuf or ssd1306 module.

#### Indentation Rules

MicroPython's requirement that lines inside a function, loop, or conditional statement be indented consistently, since indentation itself marks which code belongs to which block.
**Example:** Forgetting to indent a line inside a for loop breaks the indentation rules and causes MicroPython to raise an error.

#### Input Debouncing Delay

A short pause, often a few tens of milliseconds, inserted after detecting a button change to let electrical noise settle before reading the pin again.

#### Integer Data Type

A data type representing whole numbers with no decimal point, used throughout this course for pixel coordinates and sizes since displays address whole pixels only.
**Example:** The x and y arguments passed to pixel() must use the integer data type because there is no such thing as half a pixel.

#### Iterative Design Process

A development approach of repeatedly building, testing, and refining a design based on feedback, rather than trying to get it perfect on the first attempt.

#### Jumper Wires

Short wires with connector pins at each end, used to link a microcontroller's pins to a breadboard, sensor, or display without soldering.
**Example:** Four jumper wires carry the SPI clock, data, chip-select, and reset signals from the Pico to the OLED.

#### Line Method

The FrameBuffer method line(x1, y1, x2, y2, c) that draws a straight line between two arbitrary points, useful for diagonal features like an angled eyebrow.
**Example:** The line method draws a stern eyebrow by connecting a point near the nose to a lower point near the temple.

#### List Data Structure

An ordered, changeable collection of values stored under one variable name, written with square brackets, commonly used to hold a sequence of expressions or coordinates.
**Example:** expressions = ["happy", "sad", "angry"] stores three moods in a list data structure that a for loop can step through.
**Contrast with:** Tuple Data Structure

#### Live Parameter Tuning

Adjusting a facial feature's value, such as eyebrow angle, in real time using a potentiometer or encoder while immediately seeing the drawn result update.
**Example:** Live parameter tuning lets a student turn a knob and watch the mouth curvature parameter change the smile shape instantly on screen.

#### Low-Cost Robotics Kit

An affordable bundle of a microcontroller, display, and basic components assembled for classroom or hobbyist use, prioritizing accessibility over the polish of commercial robot products.

#### Mass-Market Robot Toy

A robot product manufactured and priced for a broad consumer audience rather than researchers or hobbyists, typically sold through retail toy channels.

#### Memory Use Comparison

An evaluation of how much RAM each display's frame buffer requires, important because the RP2040 has a limited, fixed amount of total memory.
**Example:** A memory use comparison shows the color round display's frame buffer needs far more bytes than the OLED's, leaving less RAM for other code.

#### Microcontroller

A single chip that combines a processor, memory, and input/output pins, designed to run one program and control physical hardware like sensors, buttons, and displays.
**Example:** The RP2040 on the Pico is the microcontroller that runs every robot face sketch in this course.
**Contrast with:** Raspberry Pi Pico

#### MicroPython

A compact implementation of the Python programming language designed to run directly on microcontrollers like the RP2040, giving students Python syntax with direct access to hardware pins.
**Example:** This course's every code example is written in MicroPython running on a Raspberry Pi Pico.
**See also:** Thonny IDE

#### MicroPython Firmware Update

The process of downloading a new .uf2 firmware file and copying it onto a Raspberry Pi Pico to upgrade the version of MicroPython it runs.
**Example:** A MicroPython firmware update from an older version can add access to the ellipse() and poly() drawing methods.

#### MicroPython GitHub Repository

The public online code repository hosting MicroPython's source code, issue tracker, and pull request history, including the record of how framebuf gained new features.
**Example:** Searching the MicroPython GitHub repository turns up the original pull request that added the ellipse() method.

#### MicroPython Release Versioning

The major.minor.patch numbering scheme, such as 1.20.0, that MicroPython uses to track feature releases and bug-fix updates over time.

#### MicroPython REPL

An interactive prompt built into MicroPython that lets a programmer type a single line of code and immediately see its result, without saving a full program first.
**Example:** Typing oled.fill(0) at the MicroPython REPL clears the display instantly, letting a student test drawing commands one at a time.

#### MicroPython V1.20.0 Release

The official stable MicroPython release in which the ellipse() and poly() FrameBuffer methods first became part of standard firmware, available to all users without custom builds.
**Example:** After the MicroPython v1.20.0 release, students could call ellipse() on a stock Pico without building custom firmware.

#### Miko Educational Robot Design

The product design approach behind Emotix Miko, combining a screen face with curated lessons and conversational interaction aimed at children's learning outcomes.
**Example:** The Miko Educational Robot Design pairs a friendly screen expression with a math quiz to keep young users engaged.

#### Minimal Feature Robot Research

Studies examining how few facial elements, such as just two animated eyes, a robot needs before people stop recognizing it as expressive.
**Example:** Minimal feature robot research helps explain why Cozmo's simple two-eye screen still read as emotionally expressive to users.

#### Minimum Viable Feature Set

The smallest collection of facial features and expressions needed for a robot face project to function and communicate emotion convincingly.
**Example:** A minimum viable feature set for a first prototype might include only eyes and a mouth, adding eyebrows and animation later.

#### Mode State Machine

A program structure that tracks which operating mode a robot face is currently in, such as expression-select mode or parameter-tuning mode, and changes behavior accordingly.
**Example:** A mode state machine determines whether pressing a button changes the current expression or adjusts an eyebrow angle setting.

#### Modularity

A design quality where a program is organized into independent, reusable pieces, such as separate functions for each facial feature, that can be changed without breaking the rest of the program.
**Example:** Modularity lets a student rewrite the eyebrow-drawing function to add a new shape without touching the mouth or eye code at all.

#### Module

A separate file of pre-written Python code, such as framebuf or machine, that a program can load with an import statement to reuse existing functionality.
**Example:** The ssd1306 module contains the code needed to talk to an SSD1306 display driver without students writing that logic themselves.
**See also:** Import Statement

#### Momentary Push Button

A switch that closes a circuit only while it is physically pressed and springs back open when released, commonly used to trigger a change in a robot's expression.
**Example:** Pressing a momentary push button cycles the robot face from neutral to happy.
**Contrast with:** Rotary Encoder

#### Monochrome Color Model

A display color scheme with only one color channel, where each pixel is simply on or off (or a single shade), as used by the SSD1306 OLED in this course.
**Example:** Under the monochrome color model, the OLED cannot show a red angry glow, only a lit or unlit pixel.
**Contrast with:** RGB565 Color Model

#### Mouth Curvature Parameter

A variable controlling how much a drawn mouth bends upward or downward, typically implemented using an ellipse's quadrant fill code or radius.
**Example:** A high mouth curvature parameter value produces a wide, cheerful smile using the bottom half of an ellipse.

#### Mouth Emotion Signaling

The specific role mouth shape and curvature play in communicating emotion, particularly for distinguishing positive expressions like happy from negative ones like sad.

#### Mouth Shape

The overall form used to draw a robot's mouth, ranging from a simple straight line to a curved arc or polygon, chosen to match an intended expression.
**Example:** A flat mouth shape reads as neutral, while a deeply curved one reads as clearly happy.

#### Multi-Mode Menu

A user interface pattern that lets a single set of physical controls, like one button and one knob, perform different functions depending on which mode is currently active.
**Example:** A multi-mode menu might use the same rotary encoder to browse expressions in one mode and adjust intensity in another.

#### Multimodal Emotion Cues

The combination of more than one channel, such as facial expression, sound, and motion, working together to communicate an emotion more clearly than any single channel alone.
**Example:** Multimodal emotion cues let Cozmo pair its screen expression with chirping sounds and body movement for a clearer emotional signal.

#### Multiple Return Values

A MicroPython function feature that lets a single return statement send back more than one value at once, separated by commas, which the caller unpacks into separate variables.
**Example:** A function that computes both eye_x and eye_y positions can use multiple return values instead of two separate function calls.

#### Named Color Constants

Pre-defined variables that assign a readable name to a specific RGB565 value, making drawing code easier to read than raw hexadecimal numbers.
**Example:** Defining named color constants like RED = 0xF800 lets draw_face() use RED instead of remembering the exact hex value.

#### Neutral Expression

A baseline facial expression showing no strong emotion, typically drawn with level eyebrows, evenly open eyes, and a flat mouth.
**Example:** The robot returns to its neutral expression by default whenever no button has been pressed recently.
**See also:** Default Face Parameters

#### Nightly Build Firmware

An automatically compiled, unofficial MicroPython firmware image built from the latest source code each day, containing features not yet in a stable release.
**Example:** Developers testing the new ellipse() method before its official release flashed nightly build firmware onto a Pico to try it early.

#### Non-Blocking Delay Pattern

A timing technique that checks elapsed time on each loop pass instead of pausing execution with sleep(), allowing a program to keep responding to buttons during a delay.
**Example:** A non-blocking delay pattern lets the robot keep reading button presses even while an animation state timer is counting down to the next blink.
**Contrast with:** Sleep Function Timing

#### Nose Representation

An optional, often minimal facial feature, such as a short line or small dot, used sparingly since most expressive information comes from the eyes, eyebrows, and mouth.
**Example:** Many robot face designs skip a nose representation entirely, since eyebrows and eyes carry nearly all of the emotional signal.

#### Open Source Contribution Model

The collaborative process by which volunteer developers propose code changes to a public project, which maintainers review and merge, as happened with MicroPython's ellipse() and poly() methods.
**Example:** The open source contribution model let outside developers add curve-drawing methods to framebuf without being employed by the MicroPython core team.

#### Origin At Upper-Left

The convention, used by both displays in this course, that pixel (0, 0) sits at the top-left corner of the screen rather than the bottom-left or center.

#### Original Robot Personality

A unique combination of expressions, colors, and animation style a student designs for their capstone project, distinguishing it from both classmates' projects and commercial robots like Cozmo or Vector.
**Example:** One student's original robot personality used exaggerated eyebrow movements and a bright coral color palette to feel unusually energetic.

#### Overdraw

Pixels that are drawn more than once during a single frame, wasting processing time since only the last color drawn at each pixel remains visible.
**Example:** Filling the whole screen black and then drawing a large face outline over it causes some overdraw at the outline's edges.

#### Parameterized Face Design

An approach to drawing robot faces where feature sizes, positions, and angles are controlled by variables rather than hard-coded numbers, allowing one function to produce many expressions.
**Example:** Parameterized face design lets draw_face() create a surprised look just by passing larger eye and eyebrow values.
**See also:** Draw Face Function

#### Pattern Recognition

The computational thinking skill of noticing similarities across problems or code, such as realizing that several expressions share the same eye-drawing logic with only size changed.
**Example:** Pattern recognition reveals that happy, excited, and surprised expressions all reuse the same mouth-drawing code with different curvature values.

#### Peer Design Review

A feedback session in which classmates examine and comment on each other's robot face designs, offering suggestions before a final version is built.
**Example:** During a peer design review, a classmate suggested widening the eye spacing to better fit the round display.

#### Pixel

The smallest individually controllable point of light or color on a display, addressed by an (x, y) coordinate and set to a single color or on/off value.
**Example:** A 128x64 monochrome OLED has 8,192 individual pixels, each either lit or dark.
**See also:** Display Resolution

#### Pixel Method

The FrameBuffer method pixel(x, y, c) that sets a single pixel at position (x, y) to color c, or returns its current color if no color is given.
**Example:** The pixel method can place one bright dot to represent a glint of light in an eye.

#### Point Array

The array.array object of alternating coordinate values passed to the poly method to define each vertex of the polygon being drawn.
**Example:** A point array like array('h', [0,0, 10,0, 5,-8]) defines the three corners of a triangular eyebrow.

#### Polling Input Loop

A programming style where code repeatedly checks an input's current state inside a loop to detect changes, rather than waiting for an automatic interrupt.
**Example:** A polling input loop checks the button pin's value on every single pass through the while loop.
**Contrast with:** Event-Driven Programming

#### Poly Method

The FrameBuffer method poly(x, y, coords, c, f) that draws or fills a polygon defined by a list of vertex coordinates, offset from position (x, y).
**Example:** The poly method can draw a sharp, angular eyebrow shape that ellipse() alone cannot produce.
**See also:** Point Array

#### Polygon Vertex

One corner point of a polygon, defined by an x and y coordinate, that together with other vertices outlines the shape's edges.

#### Potentiometer

A variable resistor with a rotating knob that produces a changing voltage, read by the microcontroller as an analog value used to control a continuously adjustable parameter.
**Example:** Turning a potentiometer smoothly widens or narrows the robot's eyebrow angle in real time.
**See also:** Analog Input Reading

#### Potentiometer Value Mapping

The process of converting a potentiometer's raw analog reading into a useful range for a program, such as mapping 0-65535 down to an eyebrow angle of -30 to 30 degrees.
**Example:** Potentiometer value mapping lets a full knob turn smoothly sweep the eyebrow angle parameter across its entire usable range.

#### Pre-2023 Curve Workaround

Code techniques programmers used before ellipse() and poly() were standard, such as drawing curves with many short lines or writing custom pixel-by-pixel routines.
**Example:** A pre-2023 curve workaround for a round pupil might loop through angles and place individual pixels using trigonometry.

#### Project Documentation

Written material accompanying a finished project that explains how the code works, how the hardware is wired, and what design choices were made.

#### Pull-Up Resistor

A resistor connected between a signal line and a positive voltage that keeps an input reading high until something actively pulls it low, commonly used with buttons.
**Example:** Enabling the Pico's internal pull-up resistor lets a button read "high" when unpressed and "low" when pressed, without an external resistor.

#### Pupil

The small dark circle drawn inside each eye that represents where the robot appears to be looking, often movable to simulate gaze.
**Example:** Shifting the pupil toward the left edge of the eye makes the robot appear to glance sideways.
**See also:** Pupil Movement Gaze

#### Pupil Movement Gaze

An animation technique that shifts pupil position within the eye over time to simulate the robot looking around or tracking something.
**Example:** Pupil movement gaze can make a robot appear to notice a hand waving nearby by shifting both pupils toward the same side.

#### Pupil Size Parameter

A variable controlling how large the pupil is drawn relative to the surrounding eye, which can shrink for focus or grow for surprise or delight.
**Example:** Enlarging the pupil size parameter briefly can simulate a robot's eyes widening in excitement.

#### Quadrant Fill Code

The optional mask parameter m of the ellipse method that selects which of the four quarters of the oval get drawn or filled, using a 4-bit value.
**Example:** A quadrant fill code that selects only the bottom two quarters of an ellipse produces a smiling, curved mouth shape.
**See also:** Ellipse Method

#### Randomized Blink Timing

A design choice that varies the interval between blinks using a random number instead of a fixed delay, making idle animation feel less mechanical.
**Example:** Randomized blink timing might choose a wait of anywhere from two to five seconds before the next blink, using MicroPython's random module.

#### Raspberry Pi Pico

A small, low-cost microcontroller board built around the RP2040 chip, used in this course as the brain that runs MicroPython code and drives the OLED or color display.
**Example:** Every robot face project in this book starts by loading a MicroPython script onto a Raspberry Pi Pico.
**See also:** RP2040 Microcontroller

#### Rectangle Method

The FrameBuffer method rect(x, y, w, h, c) that draws the outline of a rectangle at position (x, y) with the given width and height.
**Example:** The rectangle method can outline a simple screen border around the robot's face before drawing individual features.
**Contrast with:** Filled Rectangle Method

#### Red Green Blue Channels

The three separate intensity values, one each for red, green, and blue light, that combine to produce any color a display can show.
**Example:** Setting the red green blue channels to (0, 0, 0) produces black, while (255, 255, 255) produces white.

#### RGB565 Color Model

A 16-bit color format that packs 5 bits of red, 6 bits of green, and 5 bits of blue into a single number, used by the color round display.
**Example:** The RGB565 color model gives green one extra bit because human eyes are more sensitive to green shading than to red or blue.
**Contrast with:** Monochrome Color Model

#### Robot Business Case Study

A real company's product history, examined for lessons about design, cost, and market decisions, used in this course to ground design choices in real-world consequences.

#### Robot Commercial Outcome

The eventual market result of a robot product, ranging from sustained sales success to discontinuation, bankruptcy, or acquisition.

#### Robot Face Design Scoping

The process of deciding which facial features, expressions, and hardware a robot face project will include, given time, budget, and skill constraints.

#### Robot Personality Branding

The deliberate design of a robot's appearance, sounds, and behavior to create a consistent, recognizable character that users bond with.

#### Robot Product Discontinuation

The point at which a company stops manufacturing, selling, or supporting a robot product, often leaving existing units without software updates.

#### Robot Startup Funding

Money raised by a robotics company, often through venture capital or crowdfunding, to develop and manufacture a product before it generates enough sales revenue on its own.

#### Robot Voice Interaction

A robot feature that lets users speak commands or questions and receive a spoken or on-screen response, often paired with expressive facial feedback.

#### Rotary Encoder

An input device with a rotating knob that reports discrete clockwise or counterclockwise steps, letting a program track relative position or direction rather than an absolute voltage.
**Example:** Turning a rotary encoder one click to the right selects the next expression in a menu.
**Contrast with:** Potentiometer

#### Rotary Encoder Position Tracking

Keeping a running count of a rotary encoder's clockwise and counterclockwise steps in a variable, used to track a selected menu item or adjustable value over time.
**Example:** Rotary encoder position tracking increments a menu_index variable by one each time the knob clicks one step clockwise.

#### Round Display Layout

Design considerations specific to arranging facial features within a circular viewing area, keeping content centered and avoiding the display's hidden corners.
**Example:** Round display layout guided one design to keep the mouth closer to the display's center than it would sit on the rectangular OLED.
**See also:** Circular Display Geometry

#### Rounded Rectangle Approximation

A shape built by combining a filled rectangle with small filled ellipses or arcs at its corners, since FrameBuffer has no single method for rounded rectangles.
**Example:** A rounded rectangle approximation can give a mouth outline softer corners than a plain rect() call would produce.

#### RP2040 Microcontroller

The dual-core ARM chip at the heart of the Raspberry Pi Pico, providing the processing power, memory, and SPI/I2C hardware interfaces used to drive robot face displays.
**Example:** The RP2040's two cores let one core update the display while the other reads a button.
**See also:** Dual-Core Processing

#### Rubric-Based Assessment

An evaluation method that scores student work, such as a capstone robot face, against a published set of specific, weighted criteria rather than subjective impression alone.
**Example:** Rubric-based assessment for the capstone project might award separate points for code organization, emotional clarity, and animation smoothness.

#### Sad Expression

A facial expression signaling sorrow or disappointment, typically drawn with a downward-curved mouth and eyebrows angled upward at the inner corners.
**Example:** A sad expression lowers the outer corners of the mouth while tilting both eyebrows slightly upward toward the center.

#### Screen As Face Metaphor

The design idea of treating a digital screen as if it were a living face, using drawn eyes, eyebrows, and a mouth to stand in for facial muscles.
**Example:** This course's entire drawing model rests on the screen as face metaphor: two ellipses become eyes the moment they sit above a curved mouth.

#### Screen Coordinate System

The scheme that maps every pixel on a display to a unique (x, y) position, letting drawing methods specify exactly where a shape appears.
**Example:** The screen coordinate system lets draw_face() place the left eye at (30, 20) and the right eye at (90, 20) precisely.

#### Screen Refresh Cycle

The process of transferring the current frame buffer contents to the physical display so the new image becomes visible, typically triggered by the show() method.
**Example:** Each screen refresh cycle on the OLED sends 1,024 bytes over I2C to update every pixel at once.

#### Screen-Based Robot Face

A robot expression system that uses a digital screen to draw eyes, eyebrows, and a mouth instead of physical moving parts, allowing expressions to change instantly through code.
**Example:** This course's central project is a screen-based robot face that can switch from happy to surprised with a single function call.
**See also:** Anthropomorphism

#### Scroll Method

The FrameBuffer method scroll(dx, dy) that shifts the entire buffer's pixel content by a given horizontal and vertical offset, leaving vacated pixels unchanged.
**Example:** The scroll method can slide a scanning eye animation sideways across the display without redrawing it from scratch.

#### Show Method

The display driver method, such as oled.show(), that copies the current frame buffer's contents to the physical screen over SPI or I2C.
**Example:** Calling the show method after drawing a new expression is the only way the change actually appears on the OLED.

#### Sleep Function Timing

The use of MicroPython's time.sleep() or sleep_ms() functions to pause program execution for a fixed duration, a simple but blocking way to control animation pacing.
**Example:** Sleep function timing with sleep_ms(200) pauses the program for 200 milliseconds between animation frames.
**Contrast with:** Non-Blocking Delay Pattern

#### Sleepy Expression

A facial expression signaling drowsiness, typically drawn with mostly closed eyelid representations and slowly drooping eyebrows.
**Example:** A sleepy expression can be animated by gradually lowering an eyelid representation over several frames.
**Contrast with:** Tired Expression

#### Smooth Transition Design

The overall goal of designing expression changes so that features move gradually between states rather than snapping instantly, improving how lifelike a robot face appears.

#### Social Robot

A robot designed primarily to interact with people through recognizable behaviors like expression, voice, or gesture, rather than to perform an industrial task.
**Example:** Anki Cozmo was marketed as a social robot meant to feel like a companion, not a tool.

#### Software Display Emulator

A program that simulates how a frame buffer would appear on a physical OLED or round display, letting students test drawing code on a computer screen before using real hardware.
**Example:** A software display emulator lets a student preview draw_face() output on a laptop before ever wiring up the OLED.

#### Solderless Breadboard

A reusable plastic board with rows of connected holes that lets students build and rewire circuits by pushing in component legs and jumper wires, with no soldering.
**Example:** Students plug the OLED display's SPI pins into a solderless breadboard before wiring them to the Pico.

#### SPI Bus Speed

The rate, measured in bits or bytes per second, at which data can travel over an SPI connection, which limits how quickly a full frame buffer can be sent to a display.
**Example:** Higher SPI bus speed on the round display's connection helps offset the larger amount of color pixel data it must transfer each frame.
**See also:** Frame Buffer Redraw Rate

#### SPI Clock Line

The SPI wire that carries a timing signal from the microcontroller, synchronizing exactly when each bit of pixel data is read by the display.
**Example:** If the SPI clock line is disconnected, the color display receives no usable data even though power is connected.

#### SPI Data Line

The SPI wire that carries the actual stream of bits, such as pixel color values, from the microcontroller to the display.
**Example:** Every pixel color sent to the GC9A01 travels one bit at a time over the SPI data line.

#### SPI Interface

A high-speed serial communication protocol using separate clock and data lines plus a chip-select line, used in this course to send pixel data quickly to the color display.
**Example:** The GC9A01 round display connects to the Pico over an SPI interface.
**Contrast with:** I2C Interface

#### Sprite

A small, pre-drawn image, often stored as its own frame buffer, that can be copied onto a larger display using the blit method.
**Example:** A tiny heart-shaped sprite can be blitted over an eye to show a robot is delighted.
**See also:** Blit Method

#### SSD1306 Display Driver

The controller chip built into many small OLED modules that manages pixel data and translates FrameBuffer commands into signals the OLED panel can display.
**Example:** MicroPython's ssd1306 driver library talks to the SSD1306 display driver over I2C or SPI to show a drawn robot face.

#### State Transition Diagram

A visual diagram showing the different modes or states a program can be in and the events that cause it to move from one state to another.
**Example:** A state transition diagram for a robot face might show arrows from "idle" to "expression menu" labeled with a button-press event.

#### State-Based Animation Trigger

A design pattern where an animation begins because the robot's current state changed, such as a new expression or mode, rather than running on a fixed schedule.

#### Stern Expression

A facial expression signaling seriousness or firmness, typically drawn with level, slightly lowered eyebrows and a flat, closed mouth.
**Example:** A stern expression uses a flat mouth shape combined with eyebrows set lower than neutral but without the sharp angle of anger.

#### String Formatting

Techniques for building text output that inserts variable values into a fixed sentence structure, such as an f-string, useful for debugging expression values.

#### Surprised Expression

A facial expression signaling shock or astonishment, typically drawn with very wide eyes, high raised eyebrows, and a small open circular mouth.
**Example:** A surprised expression pairs an enlarged pupil size parameter with an eyebrow angle parameter set higher than any other expression.

#### Text Method

The FrameBuffer method text(string, x, y, c) that draws a line of characters using a built-in 8x8 pixel font starting at position (x, y).
**Example:** The text method can print a debug label like "HAPPY" in the corner of the OLED while testing expressions.

#### Thonny IDE

A beginner-friendly code editor that can connect to a Pico, upload MicroPython programs, and provide an interactive REPL, commonly used to write and test robot face code.
**Example:** Students write draw_face() in Thonny IDE, then click Run to see the expression appear on the display.

#### Ticks Diff Calculation

The use of MicroPython's time.ticks_diff() function to correctly compute the difference between two ticks_ms() readings, even when the counter has wrapped around.
**Example:** A ticks diff calculation between the current time and the last blink time tells the animation loop whether it's time to blink again.

#### Ticks Function Timing

The use of MicroPython's time.ticks_ms() function to read the microcontroller's internal millisecond counter, providing a reliable way to measure elapsed time.
**Example:** Ticks function timing captures a start value before an animation begins so the program can later calculate how much time has passed.

#### Timing Loop

A section of code responsible for controlling how often an action, like a redraw or blink, happens relative to real elapsed time rather than just loop iterations.

#### Tired Expression

A facial expression signaling fatigue, typically drawn with partially closed eyelid representations and a flat or slightly downturned mouth.
**Example:** A tired expression lowers an eyelid representation halfway over each eye rather than fully closing them.

#### Transparent Color Key

The optional color value passed to the blit method that marks which pixels in the source image should be skipped instead of copied, preserving the background underneath.
**Example:** Setting the transparent color key to black lets a round pupil sprite blit onto the eye without covering the white surrounding it.

#### Triangle Eyebrow Shape

A simple three-vertex polygon, drawn with the poly method, used as an efficient way to give an eyebrow a sharp, angular look for expressions like anger or surprise.
**Example:** A triangle eyebrow shape angled downward toward the nose helps signal an angry expression.

#### Tuple Data Structure

An ordered, unchangeable collection of values grouped under one variable name, written with parentheses, often used for fixed pairs like an x-y coordinate.
**Example:** eye_position = (40, 20) stores a fixed coordinate as a tuple data structure that the drawing code should not modify.
**Contrast with:** List Data Structure

#### Turtle Graphics Prototype

An early, exploratory sketch of a facial feature's shape built using Python's turtle graphics module, useful for testing an idea's geometry before translating it into FrameBuffer drawing calls.
**Example:** A turtle graphics prototype of a new eyebrow shape can be tested on a laptop before rewriting it with the poly method for the Pico.

#### Uncanny Valley Effect

The phenomenon where a robot or character that looks almost, but not quite, human causes viewers discomfort rather than warmth.
**Example:** Designers of screen-based robot faces often lean into simple, clearly non-human shapes partly to avoid the uncanny valley effect.

#### Unsigned Byte Array

The bytearray or bytes object used to store raw pixel values in memory, forming the actual storage a FrameBuffer object wraps and manipulates.

#### User Interface Feedback

Any visible or audible response a program gives to confirm a user's input was received, such as a brief flash or expression change after a button press.

#### Valence Arousal Model

A psychological framework describing emotions along two dimensions: valence, how positive or negative a feeling is, and arousal, how calm or energized it is.
**Example:** The valence arousal model places excited and afraid close together on arousal but far apart on valence.

#### Variable

A named storage location in a program that holds a value, such as a number or piece of text, which can be read or changed while the program runs.
**Example:** The variable eye_size holds a number that controls how large the robot's eyes are drawn.
**Contrast with:** Constant

#### Vector Companion App

The smartphone application used to set up, monitor, and customize Anki Vector, connecting the robot to Wi-Fi and cloud voice services.
**Example:** A user opened the Vector Companion App to check the robot's battery level and daily activity log.

#### Vertical Line Method

The FrameBuffer method vline(x, y, h, c) that draws a straight line of h pixels tall starting at (x, y) and extending downward.
**Example:** A vertical line method call can sketch a simple nose as one short downward stroke.

#### Viewing Distance Readability

How clearly a drawn expression's features can be distinguished from a typical distance a viewer would stand from the robot, which limits how small features can be.
**Example:** Viewing distance readability testing revealed that eyebrows thinner than two pixels became invisible from across a classroom.

#### Warm Versus Cool Color

The classification of colors as warm, like red and orange, or cool, like blue and teal, which carry different emotional associations useful in expression design.
**Example:** A warm versus cool color choice might use orange for an excited expression and blue for a calm, neutral one.

#### While Loop

A control structure that repeats a block of code as long as a given condition remains true, commonly used for a program's main animation loop that runs forever.
**Example:** The robot face program uses a while loop that keeps blinking and checking buttons until the Pico loses power.
**Contrast with:** For Loop

#### X Axis Direction

The horizontal axis of the screen coordinate system, where values increase moving rightward from the origin at the upper-left corner.
**Example:** Increasing a pupil's x axis direction value slides it toward the right side of the eye.
**Contrast with:** Y Axis Direction

#### Y Axis Direction

The vertical axis of the screen coordinate system, where values increase moving downward from the origin at the upper-left corner.
**Example:** A drooping eyebrow is drawn by increasing its y axis direction value toward the bottom of the screen.
**Contrast with:** X Axis Direction

