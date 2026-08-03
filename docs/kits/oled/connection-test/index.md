# Connection Test

This tests if the Thonny editor is communicating with the Raspberry Pi Pico.

## Blink the Onboard LED

```python
from machine import Pin
import time

# Pin 25 is the onboard LED on a regular Raspberry Pi Pico
led = Pin(25, Pin.OUT)

while True:
    led.toggle()           # Switches LED on if off, or off if on
    time.sleep(0.25)       # Wait 0.25 seconds (half a full blink cycle)
```

Note that this test will not run on the "Pico W" since the pin used a label, not pin 25.