"""Pure-Python stand-in for MicroPython's framebuf + ssd1306 modules.

Backs a 1-bit display with a Pillow "L" image (pixel values 0/1) and
implements the framebuf.FrameBuffer drawing primitives on top of
ImageDraw. Used by render_oled.py to execute an unmodified MicroPython
script under CPython and capture what would have been sent to the OLED.
"""

import sys
import types

from PIL import Image, ImageDraw, ImageFont

MONO_VLSB = 0
RGB565 = 1
GS4_HMSB = 2
MONO_HLSB = 3
MONO_HMSB = 4


class StopRender(Exception):
    """Raised from show() once the requested number of frames is captured.

    Robot-face scripts almost always draw inside `while True:`, so this is
    the only reliable way to unwind out of the animation loop instead of
    guessing a timeout.
    """


def _decode_buffer(buffer, width, height, format):
    """Decode a pre-populated bytearray (e.g. a baked-in sprite bitmap) into
    an "L" image with 0/1 pixel values. Sample robot-face scripts build small
    icons this way (see blit-eyes.py's circle16) and then .blit() them onto
    the display, so an all-zero placeholder would silently render nothing.
    """
    img = Image.new("L", (width, height), 0)
    if buffer is None:
        return img
    data = bytes(buffer)
    if format == MONO_HLSB:
        stride = (width + 7) // 8
        for y in range(height):
            for x in range(width):
                idx = y * stride + (x // 8)
                if idx < len(data) and (data[idx] >> (7 - (x % 8))) & 1:
                    img.putpixel((x, y), 1)
    elif format == MONO_HMSB:
        stride = (width + 7) // 8
        for y in range(height):
            for x in range(width):
                idx = y * stride + (x // 8)
                if idx < len(data) and (data[idx] >> (x % 8)) & 1:
                    img.putpixel((x, y), 1)
    elif format == MONO_VLSB:
        for y in range(height):
            for x in range(width):
                idx = (y // 8) * width + x
                if idx < len(data) and (data[idx] >> (y % 8)) & 1:
                    img.putpixel((x, y), 1)
    # RGB565 / GS4_HMSB source buffers aren't decoded (out of scope for a
    # 1-bit 128x64 preview); such a buffer renders blank rather than raising.
    return img


class FrameBuffer:
    def __init__(self, buffer, width, height, format, stride=None):
        self.width = width
        self.height = height
        self.format = format
        self._img = _decode_buffer(buffer, width, height, format)
        self._draw = ImageDraw.Draw(self._img)

    def fill(self, c):
        self._draw.rectangle([0, 0, self.width - 1, self.height - 1], fill=c)

    def pixel(self, x, y, c=None):
        if c is None:
            if 0 <= x < self.width and 0 <= y < self.height:
                return self._img.getpixel((x, y))
            return 0
        if 0 <= x < self.width and 0 <= y < self.height:
            self._img.putpixel((x, y), c)

    def hline(self, x, y, w, c):
        if w <= 0:
            return
        self._draw.line([(x, y), (x + w - 1, y)], fill=c)

    def vline(self, x, y, h, c):
        if h <= 0:
            return
        self._draw.line([(x, y), (x, y + h - 1)], fill=c)

    def line(self, x1, y1, x2, y2, c):
        self._draw.line([(x1, y1), (x2, y2)], fill=c)

    def rect(self, x, y, w, h, c, f=False):
        box = [x, y, x + w - 1, y + h - 1]
        if f:
            self._draw.rectangle(box, fill=c)
        else:
            self._draw.rectangle(box, outline=c)

    def fill_rect(self, x, y, w, h, c):
        self._draw.rectangle([x, y, x + w - 1, y + h - 1], fill=c)

    # Quadrants are numbered counterclockwise from top-right (Q1..Q4), matching
    # http://docs.micropython.org/en/latest/library/framebuf.html#framebuf.FrameBuffer.ellipse
    _QUADRANTS = [(0, -90, 0), (1, 180, 270), (2, 90, 180), (3, 0, 90)]

    def ellipse(self, x, y, xr, yr, c, f=False, m=0b1111):
        box = [x - xr, y - yr, x + xr, y + yr]
        if m in (0b1111, 15):
            if f:
                self._draw.ellipse(box, fill=c)
            else:
                self._draw.ellipse(box, outline=c)
            return
        for bit, a0, a1 in self._QUADRANTS:
            if m & (1 << bit):
                if f:
                    self._draw.pieslice(box, a0, a1, fill=c)
                else:
                    self._draw.arc(box, a0, a1, fill=c)

    def poly(self, x, y, coords, c, f=False):
        pts = [(x + coords[i], y + coords[i + 1]) for i in range(0, len(coords), 2)]
        if f:
            self._draw.polygon(pts, fill=c)
        else:
            self._draw.polygon(pts, outline=c)

    _FONT = ImageFont.load_default()

    def text(self, s, x, y, c=1):
        # Approximation: MicroPython's built-in font is a fixed 8x8 bitmap
        # font; Pillow's default font is not pixel-identical but is close
        # enough for a visual preview.
        self._draw.text((x, y), s, fill=c, font=self._FONT)

    def scroll(self, dx, dy):
        shifted = Image.new("L", (self.width, self.height), 0)
        shifted.paste(self._img, (dx, dy))
        self._img = shifted
        self._draw = ImageDraw.Draw(self._img)

    def blit(self, fbuf, x, y, key=-1, palette=None):
        src = fbuf._img
        if key is not None and key >= 0:
            mask = src.point(lambda p: 0 if p == key else 255).convert("L")
            self._img.paste(src, (x, y), mask)
        else:
            self._img.paste(src, (x, y))


class _NoOpPin:
    OUT = 0
    IN = 1
    PULL_UP = 0
    PULL_DOWN = 1

    def __init__(self, *a, **kw):
        pass

    def __call__(self, *a, **kw):
        return 0

    def value(self, *a, **kw):
        return 0

    def on(self):
        pass

    def off(self):
        pass

    def init(self, *a, **kw):
        pass


class _NoOpBus:
    def __init__(self, *a, **kw):
        pass

    def write(self, *a, **kw):
        pass

    def writeto(self, *a, **kw):
        pass

    def readfrom(self, *a, **kw):
        return b""


class RenderSession:
    """Collects successive show() frames until max_frames is reached."""

    def __init__(self, max_frames=1):
        self.max_frames = max_frames
        self.frames = []

    def capture(self, img):
        self.frames.append(img.copy())
        if len(self.frames) >= self.max_frames:
            raise StopRender()


def install_stubs(session):
    """Registers machine/utime/micropython/urandom/framebuf/ssd1306 fakes
    into sys.modules and returns the init_globals dict a caller should pass
    to runpy.run_path so bare `machine.Pin(...)` references (without an
    `import machine`) still resolve, which several sample scripts rely on.
    """
    machine_mod = types.ModuleType("machine")
    machine_mod.Pin = _NoOpPin
    machine_mod.SPI = _NoOpBus
    machine_mod.I2C = _NoOpBus
    sys.modules["machine"] = machine_mod

    utime_mod = types.ModuleType("utime")
    utime_mod.sleep = lambda *a, **kw: None
    utime_mod.sleep_ms = lambda *a, **kw: None
    utime_mod.sleep_us = lambda *a, **kw: None
    utime_mod.ticks_us = lambda: 0
    utime_mod.ticks_ms = lambda: 0
    utime_mod.ticks_diff = lambda a, b: 0
    sys.modules["utime"] = utime_mod

    micropython_mod = types.ModuleType("micropython")
    micropython_mod.const = lambda x: x
    sys.modules["micropython"] = micropython_mod

    sys.modules["urandom"] = __import__("random")

    framebuf_mod = types.ModuleType("framebuf")
    framebuf_mod.FrameBuffer = FrameBuffer
    framebuf_mod.MONO_VLSB = MONO_VLSB
    framebuf_mod.MONO_HLSB = MONO_HLSB
    framebuf_mod.MONO_HMSB = MONO_HMSB
    framebuf_mod.RGB565 = RGB565
    framebuf_mod.GS4_HMSB = GS4_HMSB
    sys.modules["framebuf"] = framebuf_mod

    class SSD1306Sim(FrameBuffer):
        def __init__(self, width, height, *a, **kw):
            super().__init__(None, width, height, MONO_VLSB)

        def show(self):
            session.capture(self._img)

        def init_display(self):
            pass

        def poweroff(self):
            pass

        def poweron(self):
            pass

        def contrast(self, *a):
            pass

        def invert(self, *a):
            pass

        def rotate(self, *a):
            pass

    ssd1306_mod = types.ModuleType("ssd1306")
    ssd1306_mod.SSD1306_SPI = SSD1306Sim
    ssd1306_mod.SSD1306_I2C = SSD1306Sim
    sys.modules["ssd1306"] = ssd1306_mod

    return {
        "machine": machine_mod,
        "utime": utime_mod,
        "framebuf": framebuf_mod,
        "ssd1306": ssd1306_mod,
    }
