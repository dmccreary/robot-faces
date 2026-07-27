# Concept List

This is the enumerated list of concepts for the **Robot Faces: Drawing Expressive Displays for
STEM Robots** learning graph, generated from [course-description.md](../course-description.md).

Concepts are grouped below by taxonomy category purely for readability during review. The
authoritative ConceptID-to-label mapping used everywhere else (dependencies CSV, JSON graph) is
the numbering shown here.

- Total concepts: **293**
- Each label is Title Case, an entity name (not a question), and at most 32 characters long.

Please review this list. If concepts should be added, removed, split, or merged, do that now —
changes made after the dependency graph (Step 3) is built are much more expensive.

## Hardware & Electronics Foundations (1-25)

1. Raspberry Pi Pico
2. RP2040 Microcontroller
3. Microcontroller
4. Cytron Maker Pi RP2040
5. Solderless Breadboard
6. Jumper Wires
7. Momentary Push Button
8. Potentiometer
9. Rotary Encoder
10. SPI Interface
11. I2C Interface
12. SPI Clock Line
13. SPI Data Line
14. Chip Select Pin
15. Data Command Pin
16. Display Reset Pin
17. 128x64 Monochrome OLED
18. SSD1306 Display Driver
19. 240x240 Color Round Display
20. GC9A01 Display Driver
21. Pull-Up Resistor
22. Low-Cost Robotics Kit
23. Breadboard Wiring Diagram
24. Display Power Requirements
25. Display Mounting Considerations

## History Of Screen-Based Robot Faces (26-50)

26. Screen-Based Robot Face
27. Social Robot
28. Anki Cozmo
29. Anki Vector
30. Emotix Miko
31. Blue Frog Robotics Buddy
32. Cozmo Emotion Engine
33. Vector Companion App
34. Miko Educational Robot Design
35. Buddy Mobile Robot Base
36. Robot Startup Funding
37. Robot Product Discontinuation
38. Crowdfunding Campaign
39. Robot Commercial Outcome
40. Robot Face Design Scoping
41. Companion Robot Category
42. Mass-Market Robot Toy
43. Robot Voice Interaction
44. Robot Business Case Study
45. Hardware Cost Trade-Off
46. Anki Company History
47. Consumer Robotics Market
48. Robot Personality Branding
49. Screen As Face Metaphor
50. Educational Robotics Market

## MicroPython Programming Fundamentals (51-79)

51. MicroPython
52. Thonny IDE
53. MicroPython REPL
54. Variable
55. Constant
56. Data Type
57. Integer Data Type
58. Boolean Data Type
59. Function Definition
60. Function Parameter
61. Function Return Value
62. For Loop
63. While Loop
64. Conditional Statement
65. Import Statement
66. Module
67. List Data Structure
68. Tuple Data Structure
69. Dictionary Data Structure
70. Comment Syntax
71. Indentation Rules
72. Bitwise Operator
73. Bit Shifting
74. FrameBuf Module
75. String Formatting
76. Default Parameter Value
77. Multiple Return Values
78. Global Versus Local Scope
79. Docstring Convention

## Display & Coordinate Systems (80-98)

80. Screen Coordinate System
81. Origin At Upper-Left
82. X Axis Direction
83. Y Axis Direction
84. Pixel
85. Frame Buffer
86. Display Resolution
87. Monochrome Color Model
88. Display Buffer Memory
89. Screen Refresh Cycle
90. Aspect Ratio
91. Circular Display Geometry
92. Coordinate Plane Quadrant
93. Bounding Box
94. Display Initialization
95. Show Method
96. Frame Buffer Size Calculation
97. Bit Depth
98. Byte Alignment In Buffer

## Basic Drawing Primitives (99-119)

99. Fill Method
100. Horizontal Line Method
101. Vertical Line Method
102. Line Method
103. Rectangle Method
104. Filled Rectangle Method
105. Scroll Method
106. Blit Method
107. Transparent Color Key
108. Blit Palette Mapping
109. Pixel Method
110. Drawing Color Value
111. Drawing Constants
112. Sprite
113. Bitmap
114. Unsigned Byte Array
115. Text Method
116. Draw Order Layering
117. Overdraw
118. Clipping At Screen Edge
119. Draw Call Order Optimization

## Ellipse & Polygon Drawing (120-134)

120. Ellipse Method
121. Quadrant Fill Code
122. Ellipse Radius Parameter
123. Filled Versus Outlined Shape
124. Poly Method
125. Point Array
126. Polygon Vertex
127. Closed Polygon Path
128. Convex Polygon
129. Concave Polygon
130. Approximating Curves With Lines
131. Circle As Special Ellipse
132. Triangle Eyebrow Shape
133. Rounded Rectangle Approximation
134. Anti-Aliasing Limitation

## MicroPython FrameBuf Version History (135-146)

135. FrameBuf Version Timeline
136. Blit Cross-Format Support V1.17
137. Framebuf Method Set Before V1.20
138. Ellipse Poly Dev Branch Merge
139. Nightly Build Firmware
140. MicroPython V1.20.0 Release
141. Ellipse Bug Fix V1.24.1
142. Pre-2023 Curve Workaround
143. MicroPython Release Versioning
144. MicroPython Firmware Update
145. Open Source Contribution Model
146. MicroPython GitHub Repository

## Facial Anatomy & Layout (147-169)

147. Face Outline
148. Eye Placement
149. Eye Size Parameter
150. Eye Spacing
151. Pupil
152. Pupil Size Parameter
153. Eyebrow Shape
154. Eyebrow Angle Parameter
155. Mouth Shape
156. Mouth Curvature Parameter
157. Bottom-Half Mouth Curve
158. Nose Representation
159. Facial Symmetry
160. Facial Proportion
161. Draw Face Function
162. Parameterized Face Design
163. Face Layout Grid
164. Feature Independence
165. Eyelid Representation
166. Cheek Representation
167. Face State Data Structure
168. Default Face Parameters
169. Feature Scaling For Screen Size

## Emotion Psychology & Expression Design (170-202)

170. Ekman Universal Emotions
171. Basic Emotion Theory
172. Facial Action Coding
173. Minimal Feature Robot Research
174. Emotion Recognition Accuracy
175. Neutral Expression
176. Happy Expression
177. Sad Expression
178. Angry Expression
179. Afraid Expression
180. Surprised Expression
181. Disgusted Expression
182. Contempt Expression
183. Tired Expression
184. Stern Expression
185. Sleepy Expression
186. Confused Expression
187. Excited Expression
188. Expression Intensity
189. Expression Ambiguity
190. Eyebrow Emotion Signaling
191. Mouth Emotion Signaling
192. Eye Emotion Signaling
193. Cross-Cultural Recognition
194. Human-Robot Interaction
195. Emotional Design Rubric
196. Viewing Distance Readability
197. Classroom Lighting Consideration
198. Valence Arousal Model
199. Uncanny Valley Effect
200. Anthropomorphism
201. Affective Computing
202. Multimodal Emotion Cues

## Animation & Timing (203-225)

203. Animation Loop
204. Frame Rate
205. Blinking Animation
206. Eye Scanner Animation
207. Pupil Movement Gaze
208. Timing Loop
209. Sleep Function Timing
210. Expression Interpolation
211. Easing Function
212. Idle Animation
213. Animation State Timer
214. Ticks Function Timing
215. Ticks Diff Calculation
216. Draw Time Benchmarking
217. Frame Buffer Redraw Rate
218. Flicker Reduction
219. Double Buffering
220. Animation Keyframe
221. Randomized Blink Timing
222. Smooth Transition Design
223. State-Based Animation Trigger
224. Non-Blocking Delay Pattern
225. Cooperative Multitasking

## Interactive Controls & State Machines (226-249)

226. Digital Input Reading
227. Analog Input Reading
228. Analog-To-Digital Conversion
229. Button Debounce
230. Button Interrupt Handler
231. Potentiometer Value Mapping
232. Rotary Encoder Position Tracking
233. Encoder Direction Detection
234. Mode State Machine
235. Multi-Mode Menu
236. Expression Selection Menu
237. Live Parameter Tuning
238. Event-Driven Programming
239. Polling Input Loop
240. Dual-Core Processing
241. Core Task Assignment
242. Global State Variable
243. Input Debouncing Delay
244. User Interface Feedback
245. Control Mapping Design
246. State Transition Diagram
247. Default Idle State
248. Debounce Time Constant
249. Encoder Quadrature Signal

## Color Display & RGB565 Porting (250-270)

250. RGB565 Color Model
251. Color565 Function
252. Red Green Blue Channels
253. Color Bit Depth
254. Color Palette
255. Named Color Constants
256. Color Wheel Function
257. Color Cycling Animation
258. Round Display Layout
259. Color Versus Mono Trade-Off
260. Display Driver Porting
261. Cross-Display Code Compatibility
262. Color Contrast Design
263. Color Emotion Association
264. Display Performance Comparison
265. Memory Use Comparison
266. SPI Bus Speed
267. Color Display Init Sequence
268. Color Theory Basics
269. Warm Versus Cool Color
270. Hue Saturation Brightness

## Computational Thinking & Capstone Design (271-293)

271. Computational Thinking
272. Abstraction
273. Decomposition
274. Modularity
275. Pattern Recognition
276. Algorithm Design
277. Code Reuse
278. Design Critique
279. Design Trade-Off Analysis
280. Expressiveness Versus Complexity
281. Software Display Emulator
282. Turtle Graphics Prototype
283. Iterative Design Process
284. Peer Design Review
285. Rubric-Based Assessment
286. Constraint-Driven Design
287. Minimum Viable Feature Set
288. Capstone Project
289. Capstone Demonstration
290. Original Robot Personality
291. Project Documentation
292. Design Justification
293. Expression Set Planning
