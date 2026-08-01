# References: 7. Ellipse & Polygon Drawing

1. [Ellipse](https://en.wikipedia.org/wiki/Ellipse) - Wikipedia - Covers the geometric definition of an ellipse, its two independent axes, and how a circle is the special case where those axes are equal. Grounds the chapter's `xradius`/`yradius` parameters and the "circle as special ellipse" concept.

2. [Polygon](https://en.wikipedia.org/wiki/Polygon) - Wikipedia - Explains vertices, edges, closed polygonal chains, and the distinction between convex and non-convex (concave) polygons. Directly supports the point array, polygon vertex, closed polygon path, and convex/concave concepts built around `fb.poly()`.

3. [Spatial anti-aliasing](https://en.wikipedia.org/wiki/Spatial_anti-aliasing) - Wikipedia - Describes why raster displays produce jagged "staircase" edges on curves and how anti-aliasing techniques blend boundary pixels to smooth them. Explains the root cause behind this chapter's anti-aliasing limitation section.

4. Computer Graphics: Principles and Practice (3rd Edition) - John F. Hughes, Andries van Dam, Morgan McGuire, David F. Sklar, James D. Foley, Steven K. Feiner, and Kurt Akeley - Addison-Wesley Professional - The standard graphics reference; its chapters on rasterization, curve approximation with line segments, and polygon filling underpin the ellipse and poly methods taught here.

5. Computational Geometry: Algorithms and Applications (3rd Edition) - Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars - Springer - Formalizes polygon vertices, convexity testing, and simple closed paths with rigorous algorithms, giving a deeper theoretical grounding for the convex/concave polygon distinction introduced in this chapter.

6. [FrameBuffer - MicroPython Library Documentation](https://docs.micropython.org/en/latest/library/framebuf.html) - MicroPython Official Docs - Official reference for `FrameBuffer.ellipse()` and `FrameBuffer.poly()`, including the fill flag and quadrant bitmask argument. The primary technical source for every method call used in this chapter.

7. [Midpoint ellipse drawing algorithm](https://www.geeksforgeeks.org/dsa/midpoint-ellipse-drawing-algorithm/) - GeeksforGeeks - Walks through how ellipses are rasterized on a pixel grid by computing one quadrant and mirroring it with 4-way symmetry. Connects directly to the chapter's quadrant fill code, which exposes that same quadrant structure as a bitmask.

8. [Convex Polygon: Definition, Properties, Formulas, and Examples](https://www.geeksforgeeks.org/maths/convex-polygon/) - GeeksforGeeks - Defines convex polygons by interior angle and contrasts them with concave (dented) polygons, with worked examples. Reinforces the convex/concave classification used when designing eyebrow and mouth shapes with `fb.poly()`.

9. [Ellipse - Math Is Fun](https://www.mathsisfun.com/geometry/ellipse.html) - Math Is Fun - A visual, beginner-friendly explanation of ellipses, their foci, and major/minor axes, including the note that a circle is just an ellipse with equal axes. A gentler on-ramp than the Wikipedia article for students new to the shape.

10. [Polygons - Math Is Fun](https://www.mathsisfun.com/geometry/polygons.html) - Math Is Fun - Introduces polygons, naming conventions by side count, and the convex-versus-concave distinction in plain language with diagrams. Useful companion reading for students building point arrays for the first time.
