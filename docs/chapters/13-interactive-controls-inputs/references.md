# References: 13. Interactive Controls: Inputs & Concurrency

1. [Analog-to-digital converter](https://en.wikipedia.org/wiki/Analog-to-digital_converter) - Wikipedia - Explains how ADC hardware samples a continuous voltage and quantizes it into a discrete digital number, covering resolution, sampling rate, and converter types. Grounds the chapter's potentiometer reading and `read_u16()` conversion in the underlying electronics.

2. [Interrupt](https://en.wikipedia.org/wiki/Interrupt) - Wikipedia - Describes how a hardware interrupt suspends normal program execution so a processor can respond immediately to an event, including edge versus level triggering. Provides the conceptual foundation for this chapter's button interrupt handler and `Pin.irq()`.

3. [Finite-state machine](https://en.wikipedia.org/wiki/Finite-state_machine) - Wikipedia - Covers the formal model of a system that occupies exactly one of a fixed set of states at a time, with events triggering transitions between them, illustrated with worked examples and diagrams. Mirrors this chapter's mode state machine and state transition diagram.

4. Making Embedded Systems: Design Patterns for Great Software - Elecia White - O'Reilly Media - Covers interrupt service routines, debouncing, event-driven architectures, and state machine design for real microcontroller projects, giving deeper practical grounding for this chapter's polling, interrupt, and mode-switching techniques.

5. Programming with MicroPython: Embedded Programming with Microcontrollers and Python - Nicholas H. Tollervey - O'Reilly Media - Walks through GPIO, ADC, and interrupt handling directly in MicroPython on microcontroller boards, closely matching this chapter's `machine.Pin`, `machine.ADC`, and `Pin.irq()` examples.

6. [machine.ADC](https://docs.micropython.org/en/latest/library/machine.ADC.html) - MicroPython Documentation - Official reference for the ADC class used to read a potentiometer's voltage as a 0-65535 integer with `read_u16()`, including constructor options and example code. Directly documents the analog input reading code in this chapter.

7. [machine.Pin](https://docs.micropython.org/en/latest/library/machine.Pin.html) - MicroPython Documentation - Official reference for configuring GPIO pins as digital inputs with pull-up resistors and registering interrupt handlers with `irq()`, including trigger types like `IRQ_FALLING`. Documents the exact API this chapter's button-reading and interrupt code relies on.

8. [RP2040 Microcontroller Chip](https://www.raspberrypi.com/documentation/microcontrollers/rp2040.html) - Raspberry Pi Documentation - Official hardware documentation describing the RP2040's symmetric dual-core Arm Cortex-M0+ design, clock speed, and peripherals. Explains the physical two-core architecture behind this chapter's dual-core processing and core task assignment discussion.

9. [Difference between Interrupt and Polling](https://www.geeksforgeeks.org/operating-systems/difference-between-interrupt-and-polling/) - GeeksforGeeks - Side-by-side comparison of how polling and interrupts detect a hardware event, including efficiency and responsiveness trade-offs. Reinforces this chapter's polling-input-loop-versus-button-interrupt-handler comparison table with a second worked explanation.

10. [State Method - Python Design Patterns](https://www.geeksforgeeks.org/python/state-method-python-design-patterns/) - GeeksforGeeks - Introduces the state design pattern in Python, showing how an object's behavior changes with its internal state and how transitions between states are organized in code. Complements this chapter's simpler global-variable mode state machine.
