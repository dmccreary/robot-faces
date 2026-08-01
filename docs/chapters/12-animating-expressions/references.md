# References: 12. Animating Expressions: Timing & Motion

1. [Frame rate](https://en.wikipedia.org/wiki/Frame_rate) - Wikipedia - Explains how frame rate measures how often a moving image is redrawn, how human perception of motion sets practical minimums, and how film, video, and games each target different rates, framing this chapter's 5-30 FPS guidance.

2. [Key frame](https://en.wikipedia.org/wiki/Key_frame) - Wikipedia - Describes how a key frame marks a drawing's starting or ending state in a transition, with the frames between them filled in or interpolated, the same idea behind this chapter's keyframe-based blinking, gazing, and expression changes.

3. [Multiple buffering](https://en.wikipedia.org/wiki/Multiple_buffering) - Wikipedia - Covers double, triple, and page-flip buffering techniques that prevent a viewer from ever seeing a partially drawn frame, the exact principle behind this chapter's flicker-free framebuf fill-draw-show pattern.

4. The Animator's Survival Kit (Expanded Edition) - Richard Williams - Faber & Faber - The definitive guide to timing, spacing, and keyframe-based motion from a veteran Disney and Who Framed Roger Rabbit animator; its principles of easing, anticipation, and pacing underlie this chapter's interpolation and transition-design lessons.

5. Making Embedded Systems: Design Patterns for Great Software (1st Edition) - Elecia White - O'Reilly Media - Covers real-world embedded-systems design patterns, including state machines and non-blocking timing loops on resource-constrained microcontrollers, directly paralleling this chapter's ticks_ms()-based approach to animating a display without ever blocking the main program.

6. [time - time related functions](https://docs.micropython.org/en/latest/library/time.html) - MicroPython Documentation - Official reference for MicroPython's `time` module, documenting `ticks_ms()`, `ticks_diff()`, and `sleep_ms()` exactly as used throughout this chapter, including the wraparound behavior that makes `ticks_diff()` necessary instead of plain subtraction.

7. [Using millis() for Timing](https://learn.adafruit.com/multi-tasking-the-arduino-part-1/using-millis-for-timing) - Adafruit Learning System - Adafruit's guide to replacing blocking delay() calls with a millis()-based timing check, the microcontroller-world equivalent of this chapter's ticks_ms() pattern, showing why non-blocking timing keeps a program free to notice button presses.

8. [Ease-in and Ease-out in CSS](https://www.geeksforgeeks.org/css/explain-the-ease-in-and-ease-out-in-css/) - GeeksforGeeks - A practical explanation, with runnable code examples, of ease-in and ease-out timing curves that speed up or slow down a transition instead of moving at a constant rate, the same easing idea introduced for expression interpolation.

9. [Double Buffering](https://www.geeksforgeeks.org/dbms/double-buffering/) - GeeksforGeeks - A concise explanation of how double buffering displays one finished frame while the next is drawn off-screen, preventing viewers from ever seeing a half-drawn image, the mechanism behind this chapter's flicker-free framebuf pattern.

10. [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/) - Gaffer On Games - A widely cited article on structuring a real-time loop so animation and physics stay correct regardless of how fast the loop actually runs, deepening this chapter's timing-loop and frame-buffer-redraw-rate discussion with a professional game-development perspective.
