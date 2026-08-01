# References: 6. Basic Drawing Primitives

1. [Bresenham's line algorithm](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm) - Wikipedia - Explains the classic integer-only algorithm for plotting straight lines on a pixel grid, the technique this chapter's line method uses internally to connect any two points without floating-point math.

2. [Sprite (computer graphics)](https://en.wikipedia.org/wiki/Sprite_(computer_graphics)) - Wikipedia - Covers the history and technical definition of sprites as small pre-drawn bitmap images composited onto a larger scene, directly matching this chapter's coverage of sprites, bitmaps, and the blit method.

3. [Bitmap](https://en.wikipedia.org/wiki/Bitmap) - Wikipedia - Describes how raster images are stored as grids of pixel data in memory, the same underlying byte-array structure this chapter uses to explain bitmaps, unsigned byte arrays, and frame buffers.

4. Computer Graphics: Principles and Practice (3rd Edition) - John F. Hughes, Andries van Dam, Morgan McGuire, David F. Sklar, James D. Foley, Steven K. Feiner, Kurt Akeley - Addison-Wesley Professional - The field's standard reference; its chapters on rasterization, line and polygon drawing, and compositing supply the theory behind FrameBuf's pixel, line, rectangle, and blit methods.

5. Procedural Elements for Computer Graphics (2nd Edition) - David F. Rogers - McGraw-Hill - A classic, algorithm-focused text on line drawing, area filling, and clipping at the boundary of a raster device — precisely the operations this chapter's hline, vline, rect, and clipping sections implement.

6. [framebuf — Frame buffer manipulation](https://docs.micropython.org/en/latest/library/framebuf.html) - MicroPython Official Documentation - The authoritative API reference for every method this chapter covers: fill, pixel, hline, vline, line, rect, blit, scroll, and text, including exact argument order and the FrameBuffer format constants.

7. [Using a SSD1306 OLED display](https://docs.micropython.org/en/latest/esp8266/tutorial/ssd1306.html) - MicroPython Official Documentation - An official walkthrough of wiring and driving an SSD1306 OLED with MicroPython, demonstrating fill, pixel, line, rect, text, scroll, and blit calls on real hardware, just like this chapter's examples.

8. [Bresenham's Line Generation Algorithm](https://www.geeksforgeeks.org/dsa/bresenhams-line-generation-algorithm/) - GeeksforGeeks - A step-by-step tutorial deriving the integer decision-parameter math behind line drawing, with worked examples and code in multiple languages, expanding on the algorithm this chapter's line method uses internally.

9. [Filled Area Primitives in Computer Graphics](https://www.geeksforgeeks.org/filled-area-primitives-computer-graphics/) - GeeksforGeeks - Compares flood fill, boundary fill, and scan-line fill algorithms for coloring solid regions, giving background on how methods like fill_rect or the fill method could be implemented under the hood.

10. [MicroPython: SSD1306 OLED Display Scroll Functions and Draw Shapes](https://randomnerdtutorials.com/micropython-ssd1306-oled-scroll-shapes-esp32-esp8266/) - Random Nerd Tutorials - A hands-on MicroPython project guide demonstrating scrolling text and shape-drawing routines on an SSD1306 OLED with ESP32/ESP8266 boards, reinforcing this chapter's scroll method and shape-drawing primitives with runnable code.
