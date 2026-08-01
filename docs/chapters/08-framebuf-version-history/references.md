# References: 8. A History of MicroPython's FrameBuf Drawing Support

1. [MicroPython](https://en.wikipedia.org/wiki/MicroPython) - Wikipedia - Overview of MicroPython's origin, design goals, and supported hardware. Provides the background on the language and project this whole chapter's version history belongs to.

2. [Open-source software development](https://en.wikipedia.org/wiki/Open-source_software_development) - Wikipedia - Explains how publicly available source code is built and improved by a community, including project history, collaborative methods, and version-control tools that make a project like MicroPython possible.

3. [Software versioning](https://en.wikipedia.org/wiki/Software_versioning) - Wikipedia - Describes major.minor.patch numbering and other versioning schemes used to track software changes. Directly supports the chapter's explanation of how v1.20.0 and v1.24.1 signal different kinds of updates.

4. The Cathedral and the Bazaar: Musings on Linux and Open Source by an Accidental Revolutionary - Eric S. Raymond - O'Reilly Media - A foundational essay collection contrasting closed, top-down development with open, community-driven development. Frames why pull requests, public review, and maintainer approval matter for a project like MicroPython.

5. Software Engineering (10th Edition) - Ian Sommerville - Pearson - Covers software evolution, release planning, and configuration management in professional practice. Gives students a broader engineering context for why features merge into a development branch before reaching a stable, numbered release.

6. [micropython/micropython](https://github.com/micropython/micropython) - GitHub - The official MicroPython source code repository referenced throughout the chapter, showing the public commit history, issue discussions, and pull requests that document exactly how features like ellipse() and poly() were proposed and merged.

7. [MicroPython v1.20.0 Release Notes](https://github.com/micropython/micropython/releases/tag/v1.20.0) - GitHub - The official release notes confirming that framebuf gained ellipse() and polygon-drawing methods in this April 2023 release, the primary source for the chapter's central "first stable release" claim.

8. [MicroPython v1.24.1 Release Notes](https://github.com/micropython/micropython/releases/tag/v1.24.1) - GitHub - Official patch-release notes listing the fix for a zero-radius bug in FrameBuffer.ellipse(), the primary source verifying the chapter's account of the 2024 ellipse bug fix.

9. [framebuf — Frame buffer manipulation](https://docs.micropython.org/en/latest/library/framebuf.html) - MicroPython Documentation - Official reference for every framebuf method, including fill(), blit(), ellipse(), and poly(). Lets students compare the pre-v1.20 method set against the full current toolkit described in this chapter.

10. [Introduction to Semantic Versioning](https://www.geeksforgeeks.org/software-engineering/introduction-semantic-versioning/) - GeeksforGeeks - A worked explanation of major.minor.patch version numbers with concrete examples of how each part changes. Reinforces the chapter's table distinguishing minor releases like v1.20.0 from patch releases like v1.24.1.
