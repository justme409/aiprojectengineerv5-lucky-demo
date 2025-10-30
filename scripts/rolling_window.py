#!/usr/bin/env python3
import argparse
import os
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description="Maintain a rolling window of the last N bytes from stdin.")
    parser.add_argument("--output", required=True, help="Path to output file that will always contain the latest N bytes")
    parser.add_argument("--bytes", type=int, default=10000, help="Number of bytes to retain (default: 10000)")
    args = parser.parse_args()

    target_path = os.path.abspath(args.output)
    temp_path = f"{target_path}.tmp"
    max_bytes = max(1, args.bytes)

    buffer = bytearray()
    read = sys.stdin.buffer.read

    try:
        while True:
            chunk = read(8192)
            if not chunk:
                break
            buffer += chunk
            if len(buffer) > max_bytes:
                buffer = buffer[-max_bytes:]
            with open(temp_path, "wb") as tmpf:
                tmpf.write(buffer)
            os.replace(temp_path, target_path)
    except KeyboardInterrupt:
        pass
    except Exception as exc:
        # Write the error into the window file for visibility, then exit non-zero
        try:
            with open(temp_path, "wb") as tmpf:
                tmpf.write(str(exc).encode("utf-8", errors="ignore"))
            os.replace(temp_path, target_path)
        except Exception:
            pass
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


