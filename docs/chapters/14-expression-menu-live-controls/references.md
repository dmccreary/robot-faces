# References: 14. Building an Expression Menu & Live Controls

1. [Switch (Contact bounce)](https://en.wikipedia.org/wiki/Switch#Contact_bounce) - Wikipedia - Explains why mechanical switch contacts physically bounce apart and reconnect several times when closed, producing a rapid pulse train instead of one clean transition, and surveys hardware and software debouncing approaches.

2. [Rotary encoder](https://en.wikipedia.org/wiki/Rotary_encoder) - Wikipedia - Surveys absolute and incremental encoder designs, explaining how an incremental encoder outputs two periodic signals whose phase relationship reveals which direction a knob is turning, the foundation of this chapter's encoder tracking.

3. [Incremental encoder](https://en.wikipedia.org/wiki/Incremental_encoder) - Wikipedia - Detailed technical breakdown of quadrature encoding, showing how output signals A and B's 90-degree phase offset lets a decoder recover both step count and rotation direction from two overlapping square waves.

4. Practical Electronics for Inventors (4th Edition) - Paul Scherz and Simon Monk - McGraw-Hill Education - Hands-on electronics reference covering mechanical switch behavior, hardware and software debounce circuits, and potentiometer and rotary-encoder wiring, written for exactly the kind of physical control panel this chapter builds.

5. The Art of Electronics (3rd Edition) - Paul Horowitz and Winfield Hill - Cambridge University Press - Rigorous classic electronics text covering switch contact bounce, Schmitt-trigger and flip-flop debounce circuits, and digital signal conditioning that underlies the software debounce techniques this chapter teaches.

6. [Basic Debouncing](https://learn.adafruit.com/debouncer-library-python-circuitpython-buttons-sensors/basic-debouncing) - Adafruit Learning System - Walks through a Python-based Debouncer class that samples a pin repeatedly and only reports a change once its value has stayed stable, directly paralleling this chapter's cooldown-timer and interrupt-recheck debounce techniques.

7. [Rotary Encoder Overview](https://learn.adafruit.com/rotary-encoder/overview) - Adafruit Learning System - Explains how a mechanical incremental encoder's A and B pins contact ground in a specific order depending on rotation direction, the same quadrature comparison this chapter's `on_encoder_turn()` handler performs.

8. [machine.Pin - Control I/O pins](https://docs.micropython.org/en/latest/library/machine.Pin.html) - MicroPython Documentation - Official reference for configuring GPIO pins, pull-up resistors, and interrupt handlers with `Pin.irq()`, the exact API this chapter uses to read buttons and encoder pins on falling edges.

9. [A Guide to Debouncing](http://www.ganssle.com/debouncing.htm) - Jack Ganssle, The Ganssle Group - Widely cited embedded-systems guide presenting real oscilloscope measurements of bounce duration across many switch types, giving concrete evidence for why a 20-50ms debounce time constant is a safe design choice.

10. [Principles and Patterns of User Interface Design](https://www.geeksforgeeks.org/websites-apps/principles-and-patterns-of-user-interface-design/) - GeeksforGeeks - Surveys interface-design principles such as consistency, feedback, and recoverability, giving a software-design vocabulary for this chapter's control mapping design and user interface feedback decisions.
