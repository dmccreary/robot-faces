"""Pure-Python stand-in for MicroPython's framebuf + ssd1306 modules.

Backs a 1-bit display with a Pillow "L" image (pixel values 0/1) and
implements the framebuf.FrameBuffer drawing primitives on top of
ImageDraw. Used by render_oled.py to execute an unmodified MicroPython
script under CPython and capture what would have been sent to the OLED.
"""

import sys
import types

from PIL import Image, ImageDraw

import font8x8

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

    def text(self, s, x, y, c=1):
        # MicroPython's framebuf font is an 8x8 cell per character, drawn
        # transparently (only lit pixels are written). Glyph shapes come from
        # font8x8.py: the cell and layout are exact, letterforms are close.
        for i, ch in enumerate(s):
            code = ord(ch)
            if not font8x8.FIRST <= code <= font8x8.LAST:
                code = 0x20
            glyph = font8x8.GLYPHS[code - font8x8.FIRST]
            for row in range(8):
                bits = glyph[row]
                for col in range(8):
                    if bits & (0x80 >> col):
                        self.pixel(x + i * 8 + col, y + row, c)

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


class _Clock:
    """Fake millisecond clock. sleep_ms() advances it and every ticks_ms()
    call advances it by 1 ms, so busy-wait loops that compare ticks_diff()
    against a delay still finish instead of spinning forever."""

    def __init__(self):
        self.ms = 0

    def advance(self, ms):
        self.ms += ms

    def ticks_ms(self):
        self.ms += 1
        return self.ms


clock = _Clock()


class _Pin:
    """Fake machine.Pin. An input configured with PULL_UP reads 1 (button
    released) unless press() has scheduled a press that covers the current
    fake-clock time; every other pin reads 0.

    A press starts `delay` ms after it is scheduled and stays low for `hold`
    ms, like a thumb on a real button. Starting it later than "now" keeps it
    from merging with a press the script is still waiting out in
    wait_for_release(), which matters for scripts that redraw first and
    wait for the release afterwards."""

    OUT = 1
    IN = 0
    PULL_UP = 1
    PULL_DOWN = 2

    _presses = {}

    def __init__(self, id=None, mode=None, pull=None, *a, **kw):
        self.id = id
        self.pull = pull if pull is not None else kw.get("pull")

    @classmethod
    def press(cls, pin_id, delay=150, hold=100):
        start = clock.ms + delay
        cls._presses[pin_id] = (start, start + hold)

    def value(self, v=None):
        if v is not None:
            return None
        clock.advance(1)   # reading a pin takes time; guarantees busy-wait loops progress
        start, end = self._presses.get(self.id, (0, 0))
        if start <= clock.ms < end:
            return 0
        return 1 if self.pull == self.PULL_UP else 0

    __call__ = value

    def on(self):
        pass

    def off(self):
        pass

    def toggle(self):
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
    """Collects successive show() frames until max_frames is reached.

    `presses` maps a 1-based frame number to (pin, delay_ms, hold_ms) presses
    starting a short while after that frame is captured, so a script waiting on a button
    sees a press on its next loop pass.
    """

    def __init__(self, max_frames=1, presses=None):
        self.max_frames = max_frames
        self.presses = presses or {}
        self.frames = []

    def capture(self, img):
        self.frames.append(img.copy())
        for pin_id, delay, hold in self.presses.get(len(self.frames), ()):
            _Pin.press(pin_id, delay, hold)
        if len(self.frames) >= self.max_frames:
            raise StopRender()


def install_stubs(session):
    """Registers machine/utime/micropython/urandom/framebuf/ssd1306 fakes
    into sys.modules and returns the init_globals dict a caller should pass
    to runpy.run_path so bare `machine.Pin(...)` references (without an
    `import machine`) still resolve, which several sample scripts rely on.
    """
    machine_mod = types.ModuleType("machine")
    machine_mod.Pin = _Pin
    machine_mod.SPI = _NoOpBus
    machine_mod.I2C = _NoOpBus
    sys.modules["machine"] = machine_mod

    utime_mod = types.ModuleType("utime")
    clock.ms = 0
    _Pin._presses.clear()
    utime_mod.sleep = lambda s: clock.advance(int(s * 1000))
    utime_mod.sleep_ms = clock.advance
    utime_mod.sleep_us = lambda us: clock.advance(us // 1000)
    utime_mod.ticks_ms = clock.ticks_ms
    utime_mod.ticks_us = lambda: clock.ticks_ms() * 1000
    utime_mod.ticks_diff = lambda a, b: a - b
    utime_mod.ticks_add = lambda a, b: a + b
    sys.modules["utime"] = utime_mod
    # Scripts that `import time` must not really sleep either.
    import time as _time
    _time.sleep = utime_mod.sleep
    for name in ("sleep_ms", "sleep_us", "ticks_ms", "ticks_us", "ticks_diff", "ticks_add"):
        setattr(_time, name, getattr(utime_mod, name))

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
