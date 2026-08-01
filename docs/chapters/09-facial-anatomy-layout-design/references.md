# References: 9. Facial Anatomy & Layout Design

1. [Facial expression](https://en.wikipedia.org/wiki/Facial_expression) - Wikipedia - Explains how eyes, eyebrows, and the mouth combine with pupil dilation and asymmetry to signal emotion. Grounds this chapter's choice to treat eyes, eyebrows, and the mouth as the features most worth parameterizing.

2. [Facial symmetry](https://en.wikipedia.org/wiki/Facial_symmetry) - Wikipedia - Describes bilateral facial symmetry alongside the small systematic and random asymmetries real faces show. Provides the scientific backdrop for this chapter's `mirror_x()` reflection technique and its default assumption that a neutral face mirrors left to right.

3. [Parametric design](https://en.wikipedia.org/wiki/Parametric_design) - Wikipedia - Surveys how algorithmic, parameter-driven processes generate and update shapes automatically when a single input value changes. Directly parallels parameterized face design, where one `draw_face()` function reshapes an entire expression from a dictionary of numbers.

4. Drawing the Head and Hands - Andrew Loomis - Titan Books - A classic illustrator's reference for constructing head proportions and placing eyes, eyebrows, nose, and mouth using simple guideline grids. Its proportion-first, construction-based method underlies this chapter's face layout grid and facial proportion sections.

5. Code Complete: A Practical Handbook of Software Construction (2nd Edition) - Steve McConnell - Microsoft Press - Covers designing functions around clear parameters, choosing sensible default values, and grouping related data into one structure. Supports the chapter's draw face function, default face parameters, and face state data structure design choices.

6. [Human Anatomy Fundamentals: Basics of the Face](https://design.tutsplus.com/tutorials/human-anatomy-fundamentals-basics-of-the-face--cms-20417) - Envato Tuts+ - Teaches classic proportional guidelines for spacing eyes, positioning eyebrows, and locating a mouth using a grid of midlines and divisions. A practical illustration of the eye spacing and facial proportion concepts this chapter introduces.

7. [Cartoon Fundamentals: How to Draw a Cartoon Face Correctly](https://design.tutsplus.com/articles/cartoon-fundamentals-how-to-draw-a-cartoon-face-correctly--vector-15792) - Envato Tuts+ - Shows how a circle plus a centerline and horizontal axis simplify a face into a small set of adjustable features for cartoon characters. Mirrors this chapter's face layout grid and minimal nose and cheek representation choices.

8. [Parametric Modeling in Computer Graphics](https://www.geeksforgeeks.org/computer-graphics/parametric-modeling-in-computer-graphics/) - GeeksforGeeks - Explains how changing one input parameter automatically updates a generated shape's geometry, with examples drawn from CAD-style modeling tools. Clarifies the general software concept behind this chapter's parameterized face design and draw face function.

9. [Python Dictionary](https://www.geeksforgeeks.org/python/python-dictionary/) - GeeksforGeeks - Reference on creating, reading, and updating key-value dictionaries in Python, including nested dictionaries and common methods. Directly supports the chapter's face state data structure, where every face parameter is bundled as one dictionary key.

10. [Abstraction by Parameterization and Specification in Java](https://www.geeksforgeeks.org/java/abstraction-by-parameterization-and-specification-in-java/) - GeeksforGeeks - Explains how replacing hardcoded values with parameters lets one function body produce many different outcomes. Reinforces the chapter's feature independence and parameterized face design principles, even though its code examples are written in Java rather than Python.
