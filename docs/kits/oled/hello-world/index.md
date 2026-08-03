# Hello World

A "Hello World!" is the first program we usually write
on any new project.  The goal is to create the simplest
program that will verify that our tools are all
setup correctly.

## Hardware Configuration File

All of the labs in this section use a single shared file that
stores the hardware configuration for the OLED kit.

This configuration file makes all our sample programs simpler.

To use the configuration file called `config.py` you must add the
following line to your programs:

```
import config
```

## Sample Hello World

```python
import config

oled = config.init_display()

# fill the background with black (0)
oled.fill(0)
# draw "Hello World!" at x=16 across and y= 28 down in white (1)
oled.text("Hello World!", 16, 28, 1)
# send the screen data to the display
oled.show()
```