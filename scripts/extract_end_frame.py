#!/usr/bin/env python3
"""
Extract the last frame from a video clip using FFmpeg.

Usage:
    python extract_end_frame.py --input clip.mp4 --output end_frame.png
"""

import argparse
import json
import os
import subprocess
import sys


def extract_last_frame(input_path, output_path):
    """Extract the last frame from a video using FFmpeg."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    cmd = [
        "ffmpeg", "-y",
        "-sseof", "-0.04",
        "-i", input_path,
        "-frames:v", "1",
        "-update", "1",
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"FFmpeg error: {result.stderr}", file=sys.stderr)
        return False

    return os.path.exists(output_path)


def main():
    parser = argparse.ArgumentParser(description="Extract last frame from a video clip")
    parser.add_argument("--input", required=True, help="Input video file path")
    parser.add_argument("--output", required=True, help="Output image path (.png)")

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"ERROR: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    # Check FFmpeg is available
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("ERROR: FFmpeg not found. Install it: brew install ffmpeg", file=sys.stderr)
        sys.exit(1)

    print(f"Extracting last frame from {args.input}...")

    if extract_last_frame(args.input, args.output):
        file_size = os.path.getsize(args.output)
        print(f"SUCCESS: Frame saved to {args.output} ({file_size:,} bytes)")
        result = {
            "success": True,
            "output_path": args.output,
            "file_size_bytes": file_size,
            "source": args.input,
        }
        print(json.dumps(result))
    else:
        result = {"success": False, "error": "FFmpeg failed to extract frame", "output_path": None}
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()
