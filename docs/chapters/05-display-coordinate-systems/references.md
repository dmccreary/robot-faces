# References: 5. Display & Coordinate Systems

1. [Pixel](https://en.wikipedia.org/wiki/Pixel) - Wikipedia - Explains what a pixel is, how bits per pixel set color depth, and how pixels form a raster grid. Grounds this chapter's definition of a pixel as the smallest addressable unit on a display.

2. [Framebuffer](https://en.wikipedia.org/wiki/Framebuffer) - Wikipedia - Covers how a framebuffer stores a bitmap in RAM that drives a display, including color palettes, double buffering, and the historical shift from vector to raster displays. Directly parallels the chapter's frame buffer concept.

3. [Color depth](https://en.wikipedia.org/wiki/Color_depth) - Wikipedia - Details how bit depth determines the number of colors or shades a pixel can represent, from 1-bit monochrome through 16-bit and 24-bit color. Underpins the chapter's OLED-versus-color-display bit depth comparison.

4. Computer Graphics: Principles and Practice (3rd Edition) - John F. Hughes, Andries van Dam, Morgan McGuire, David F. Sklar, James D. Foley, Steven K. Feiner, Kurt Akeley - Addison-Wesley Professional - The field's standard reference text; its early chapters on raster devices, frame buffers, and device coordinate systems ground the chapter's math in established computer-graphics theory.

5. Procedural Elements for Computer Graphics (2nd Edition) - David F. Rogers - McGraw-Hill - Works through rasterization, bit-plane organization, and frame buffer memory layout at a level of arithmetic detail matching the chapter's buffer-size and byte-alignment calculations.

6. [framebuf — MicroPython](https://docs.micropython.org/en/latest/library/framebuf.html) - MicroPython Documentation - Official reference for the FrameBuffer class used throughout this book, documenting pixel formats (MONO_HLSB, RGB565), buffer sizing rules, and drawing methods that this chapter's byte-math directly explains.

7. [Raster-Scan Displays](https://www.geeksforgeeks.org/computer-science-fundamentals/raster-scan-displays/) - GeeksforGeeks - Explains how a refresh/frame buffer stores pixel intensities that a display repeatedly redraws, and how scan conversion turns shapes into pixel data. Reinforces the chapter's frame buffer and refresh cycle sections.

8. [Drawing shapes with canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes) - MDN Web Docs - Introduces the HTML canvas coordinate grid, showing the origin at the upper-left corner with X increasing rightward and Y increasing downward. A working code parallel to this chapter's screen coordinate system.

9. [MicroPython: OLED Display with ESP32 and ESP8266](https://randomnerdtutorials.com/micropython-oled-display-esp32-esp8266/) - Random Nerd Tutorials - Walks through wiring an SSD1306 OLED, initializing the display object, and calling show() to push buffer contents to the screen, matching this chapter's initialization and show-method code examples.

10. [Various Kinds of Aspect Ratios](https://www.geeksforgeeks.org/various-kinds-of-aspect-ratios/) - GeeksforGeeks - Surveys common width-to-height ratios such as 1:1, 4:3, and 16:9 across displays and media, giving real-world context for the chapter's comparison of the OLED's 2:1 rectangle and the color display's 1:1 square.
