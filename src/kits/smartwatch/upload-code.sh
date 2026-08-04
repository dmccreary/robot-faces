#!/usr/bin/env bash
# Upload all sample code from this directory to a connected RP2040 board with a
# GC9A01 round display (a Waveshare RP2040-LCD-1.28, or a Pico wired to a bare
# GC9A01 module) using mpremote. Run from within this directory or from
# anywhere — the script resolves its own location.
#
# Everything in lib/ goes to :lib/ first — the GC9A01 driver and the two font
# modules, all of which config.py imports. Then config.py, then the labs.
#
# The fonts are not optional. Unlike framebuf, this driver has no built-in
# font, so config.py fails to import if lib/vga1_8x16.py and
# lib/vga1_bold_16x32.py are not on the board.
#
# IMPORTANT: Quit (or "Stop/Disconnect" from) Thonny before running this.
# Only one program can use the Pico's serial port at a time. If Thonny is
# connected, mpremote fails with:
#   "failed to access /dev/cu.usbmodem... (it may be in use by another program)"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v mpremote >/dev/null 2>&1; then
    echo "Error: mpremote is not installed. Install with: pip install mpremote" >&2
    exit 1
fi

echo "NOTE: Quit or disconnect Thonny first — only one program can use the"
echo "      Pico's serial port at a time."
echo

echo "Checking for connected Pico..."
# We pass the exact serial port to mpremote rather than using "connect auto",
# which only matches a fixed list of vendor/product IDs and silently reports
# "no device found" for boards it does not recognize.
#
# You can force a specific port:  PORT=/dev/cu.usbmodem14301 ./upload-code.sh
if [[ -n "${PORT:-}" ]]; then
    echo "Using device from PORT environment variable: $PORT"
else
    # macOS uses /dev/cu.usbmodem* (preferred for outgoing connections);
    # Linux uses /dev/ttyACM* or /dev/ttyUSB*.
    shopt -s nullglob
    serial_devs=(
        /dev/cu.usbmodem*
        /dev/tty.usbmodem*
        /dev/ttyACM*
        /dev/ttyUSB*
    )
    shopt -u nullglob
    if (( ${#serial_devs[@]} == 0 )); then
        echo "Error: No Pico detected (no usbmodem/ttyACM/ttyUSB device). Plug it in and try again." >&2
        exit 1
    fi
    PORT="${serial_devs[0]}"
    if (( ${#serial_devs[@]} > 1 )); then
        echo "Multiple serial devices found; using the first:"
        printf '  %s\n' "${serial_devs[@]}"
        echo "Override with: PORT=/dev/your-device ./upload-code.sh"
    fi
    echo "Using device: $PORT"
fi

# Interrupt any running program before copying files.
mpremote connect "$PORT" soft-reset >/dev/null 2>&1 || true

shopt -s nullglob
all_files=( *.py )
lib_files=( lib/*.py )
shopt -u nullglob

if (( ${#all_files[@]} == 0 && ${#lib_files[@]} == 0 )); then
    echo "No .py files found in $SCRIPT_DIR" >&2
    exit 1
fi

# Upload lib/ first (display drivers other programs import), then config.py
# (other labs import it), then everything else.
if (( ${#lib_files[@]} > 0 )); then
    echo "Uploading ${#lib_files[@]} file(s) to Pico :lib/ ..."
    mpremote connect "$PORT" mkdir :lib >/dev/null 2>&1 || true
    for f in "${lib_files[@]}"; do
        name="$(basename "$f")"
        echo "  -> lib/$name"
        if ! mpremote connect "$PORT" cp "$f" ":lib/$name"; then
            echo >&2
            echo "Error: could not write to the Pico." >&2
            echo "If the port is 'in use by another program', QUIT or DISCONNECT" >&2
            echo "Thonny (or any other serial monitor) and run this script again." >&2
            exit 1
        fi
    done
fi

files=()
if [[ -f config.py ]]; then
    files+=( config.py )
fi
for f in "${all_files[@]}"; do
    [[ "$f" == "config.py" ]] && continue
    files+=( "$f" )
done

echo "Uploading ${#files[@]} file(s) to Pico..."
for f in "${files[@]}"; do
    echo "  -> $f"
    if ! mpremote connect "$PORT" cp "$f" ":$f"; then
        echo >&2
        echo "Error: could not write to the Pico." >&2
        echo "If the port is 'in use by another program', QUIT or DISCONNECT" >&2
        echo "Thonny (or any other serial monitor) and run this script again." >&2
        exit 1
    fi
done

echo "Done. Files on Pico:"
mpremote connect "$PORT" ls
mpremote connect "$PORT" ls :lib 2>/dev/null || true
