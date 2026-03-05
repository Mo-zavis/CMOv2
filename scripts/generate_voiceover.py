#!/usr/bin/env python3
"""
Eleven Labs Voice-Over Generator.

Usage:
    python generate_voiceover.py \
        --text "Your narration text" \
        --output /path/to/voiceover.mp3 \
        [--voice-id JBFqnCBsd6RMkjVDRZzb] \
        [--model eleven_multilingual_v2]
"""

import argparse
import json
import os
import sys

try:
    import requests
    USE_REQUESTS = True
except ImportError:
    USE_REQUESTS = False

DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George — warm professional
DEFAULT_MODEL = "eleven_multilingual_v2"
API_BASE = "https://api.elevenlabs.io/v1"


def generate_voiceover(text, voice_id, model, output_path):
    """Generate voiceover audio using Eleven Labs API."""
    if not USE_REQUESTS:
        print("ERROR: requests library not available. Install: pip install requests", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("ERROR: ELEVENLABS_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    url = f"{API_BASE}/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    payload = {
        "text": text,
        "model_id": model,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True,
        },
    }

    response = requests.post(url, headers=headers, json=payload, timeout=60)

    if response.status_code != 200:
        print(f"API ERROR ({response.status_code}): {response.text}", file=sys.stderr)
        return False

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    with open(output_path, "wb") as f:
        f.write(response.content)

    return True


def main():
    parser = argparse.ArgumentParser(description="Generate voiceover using Eleven Labs")
    parser.add_argument("--text", required=True, help="Narration text")
    parser.add_argument("--output", required=True, help="Output file path (.mp3)")
    parser.add_argument("--voice-id", default=DEFAULT_VOICE_ID, help=f"Voice ID (default: {DEFAULT_VOICE_ID})")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model (default: {DEFAULT_MODEL})")

    args = parser.parse_args()

    if not os.environ.get("ELEVENLABS_API_KEY"):
        print("ERROR: ELEVENLABS_API_KEY not set.", file=sys.stderr)
        print("Set it with: export ELEVENLABS_API_KEY=your-api-key", file=sys.stderr)
        sys.exit(1)

    print(f"Generating voiceover...")
    print(f"  Voice: {args.voice_id}")
    print(f"  Model: {args.model}")
    print(f"  Text: {args.text[:80]}{'...' if len(args.text) > 80 else ''}")
    print()

    if generate_voiceover(args.text, args.voice_id, args.model, args.output):
        file_size = os.path.getsize(args.output)
        print(f"SUCCESS: Audio saved to {args.output} ({file_size:,} bytes)")
        result = {
            "success": True,
            "output_path": args.output,
            "file_size_bytes": file_size,
            "voice_id": args.voice_id,
            "model": args.model,
            "text_length": len(args.text),
        }
        print(json.dumps(result))
    else:
        result = {"success": False, "error": "Eleven Labs API call failed", "output_path": None}
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()
