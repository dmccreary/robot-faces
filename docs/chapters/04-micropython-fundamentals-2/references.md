# References: 4. MicroPython Fundamentals II: Functions & the FrameBuf Module

1. [Function (computer programming)](https://en.wikipedia.org/wiki/Function_(computer_programming)) - Wikipedia - Explains how named, reusable blocks of code accept parameters and produce return values across programming languages, with call-stack and implementation details that ground this chapter's function definitions, parameters, and multiple return values.

2. [Conditional (computer programming)](https://en.wikipedia.org/wiki/Conditional_(computer_programming)) - Wikipedia - Surveys if/elif/else branching and boolean-driven control flow across languages, directly matching this chapter's introduction to conditional statements and the comparison operators used to choose between a robot's battery-level responses.

3. [Bitwise operation](https://en.wikipedia.org/wiki/Bitwise_operation) - Wikipedia - Details AND, OR, XOR, and shift operations on binary representations, with diagrams showing how bits move during a shift, the same operators and shifting behavior this chapter applies to MicroPython integers.

4. Python Crash Course (3rd Edition) - Eric Matthes - No Starch Press - A beginner-focused introduction covering function definitions, parameters, default argument values, and f-string formatting with hands-on exercises, matching this chapter's approach of building runnable examples before deeper display work.

5. Learning Python (5th Edition) - Mark Lutz - O'Reilly Media - A comprehensive reference with extensive treatment of the LEGB scoping rule, the global statement, bitwise operators, and docstring conventions, useful for students who want deeper detail than this chapter's introductory treatment provides.

6. [framebuf - MicroPython latest documentation](https://docs.micropython.org/en/latest/library/framebuf.html) - MicroPython Docs - The official reference for the FrameBuffer class introduced in this chapter, documenting pixel formats like MONO_HLSB and the drawing methods (fill, pixel, ellipse, blit) explored in later chapters.

7. [Python Functions](https://www.geeksforgeeks.org/python/python-functions/) - GeeksforGeeks - A tutorial covering function definitions, positional and default parameters, return statements, and returning multiple values as tuples, mirroring the battery-status and screen-center examples used throughout this chapter.

8. [Python Bitwise Operators](https://www.geeksforgeeks.org/python-bitwise-operators/) - GeeksforGeeks - Walks through AND, OR, XOR, and the left/right shift operators with worked binary examples, directly supporting this chapter's bit-shifting exercises that preview the RGB565 color-packing technique used in Chapter 15.

9. [Python Global Keyword](https://www.programiz.com/python-programming/global-keyword) - Programiz - Explains why assigning inside a function creates a shadowing local variable and how the global keyword changes that behavior, using the exact bug pattern this chapter demonstrates with the eye_size example.

10. [Python String Formatting](https://www.w3schools.com/python/python_string_formatting.asp) - W3Schools - Compares f-strings against the older .format() method with runnable examples and format specifiers, reinforcing this chapter's preferred style for building clean debug output like "Eye size: 14px, Battery: 82%".
