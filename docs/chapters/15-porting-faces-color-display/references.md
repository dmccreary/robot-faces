# References: 15. Porting Faces to a Color Display

1. [High color](https://en.wikipedia.org/wiki/High_color) - Wikipedia - Explains 16-bit color depth and the RGB565 bit layout (5 bits red, 6 bits green, 5 bits blue), including why green gets an extra bit for human vision. Directly explains this chapter's core color565() packing format.

2. [Color theory](https://en.wikipedia.org/wiki/Color_theory) - Wikipedia - Comprehensive overview of the color wheel, warm versus cool color groupings, and color harmony principles. Supports the chapter's coverage of color theory basics and how color choices reinforce or contrast a face's shape-based emotion signal.

3. [HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV) - Wikipedia - Detailed explanation of the hue-saturation-lightness/value color models used to describe any color with three independent numbers. Grounds the chapter's hue, saturation, and brightness (HSB) discussion and the color wheel function.

4. Digital Image Processing (4th Edition) - Rafael C. Gonzalez and Richard E. Woods - Pearson - Covers color image fundamentals, RGB and HSV color models, and quantization of color channels into limited bit budgets, paralleling this chapter's RGB565 bit-depth trade-offs.

5. The Elements of Color - Johannes Itten (edited by Faber Birren) - Wiley - A foundational color-theory text on hue, saturation, and warm-versus-cool contrast, and how color combinations create emotional effect. Informs the chapter's color contrast design and color emotion association sections.

6. [GC9A01_MPY: Fast MicroPython driver for GC9A01 display modules](https://github.com/russhughes/gc9a01_mpy) - GitHub (russhughes) - Source and documentation for the MicroPython driver used to initialize and draw to the GC9A01 round color display, directly supporting the chapter's display driver porting and init sequence sections.

7. [RGB565 Color Picker](https://barth-dev.de/online/rgb565-color-picker/) - barth-dev.de - Interactive tool that converts a chosen color into its packed RGB565 value, showing the 5-6-5 bit split and matching C code for the conversion. Lets students check color565() output by hand.

8. [Computer Graphics | The RGB Color Model](https://www.geeksforgeeks.org/computer-graphics/computer-graphics-the-rgb-color-model/) - GeeksforGeeks - Tutorial explaining how red, green, and blue intensities combine additively to form the RGB color cube, with worked examples. Reinforces the chapter's red-green-blue channel and color bit depth discussion.

9. [Using GC9A01 Round LCD Modules](https://dronebotworkshop.com/gc9a01/) - DroneBot Workshop - Practical tutorial covering GC9A01 wiring, SPI pin setup, and 16-bit color565() usage on real hardware, complementing the chapter's cross-display porting and color display init sequence walkthrough.

10. [Complete Color Theory Guide: Harmonies, Temperature, Advanced Palettes](https://bemyhex.com/theory/) - Be My HEX - Educational guide covering color wheel harmonies and warm-versus-cool color temperature with practical design examples. Reinforces the chapter's warm-versus-cool and color palette design guidance.
