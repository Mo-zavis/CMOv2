#!/usr/bin/env python3
"""
Veo 3 Video Clip Generator — Generates short video clips from a start frame + prompt.

Usage:
    python generate_video_clip.py \
        --prompt "Scene description" \
        --output /path/to/clip.mp4 \
        [--start-frame /path/to/start_frame.png] \
        [--duration 5] \
        [--aspect-ratio 9:16] \
        [--model veo-3.0-generate-preview]
"""

import argparse
import base64
import json
import os
import sys
import time

try:
    from google import genai
    from google.genai import types
    USE_SDK = True
except ImportError:
    USE_SDK = False

try:
    import requests
    USE_REQUESTS = True
except ImportError:
    USE_REQUESTS = False

DEFAULT_MODEL = "veo-3.0-generate-001"
MAX_RETRIES = 3
RETRY_DELAY = 10  # Veo generation takes longer
POLL_INTERVAL = 10  # seconds between polling for async generation


def generate_with_sdk(prompt, model, start_frame=None, duration=5, aspect_ratio="9:16"):
    """Generate video clip using the Google GenAI SDK (async video generation)."""
    client = genai.Client()

    # Build the image for start frame if provided
    image_param = None
    if start_frame and os.path.exists(start_frame):
        from PIL import Image as PILImage
        image_param = PILImage.open(start_frame)

    config = types.GenerateVideosConfig(
        aspect_ratio=aspect_ratio,
        number_of_videos=1,
    )

    # Use the dedicated video generation endpoint
    operation = client.models.generate_videos(
        model=model,
        prompt=prompt,
        image=image_param,
        config=config,
    )

    # Poll until complete
    print("  Waiting for video generation (this may take 1-3 minutes)...", file=sys.stderr)
    while not operation.done:
        time.sleep(POLL_INTERVAL)
        print(f"  Still generating...", file=sys.stderr)
        operation = client.operations.get(operation)

    return operation.result


def generate_with_rest(prompt, model, start_frame=None, duration=5, aspect_ratio="9:16"):
    """Generate video clip using the REST API."""
    if not USE_REQUESTS:
        print("ERROR: Neither google-genai SDK nor requests library available.", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    parts = []
    if start_frame and os.path.exists(start_frame):
        with open(start_frame, "rb") as f:
            img_data = base64.b64encode(f.read()).decode("utf-8")
        ext = os.path.splitext(start_frame)[1].lower()
        mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
        parts.append({"inline_data": {"mime_type": mime_map.get(ext, "image/png"), "data": img_data}})

    parts.append({"text": prompt})

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["VIDEO"],
            "videoConfig": {
                "aspectRatio": aspect_ratio,
                "durationSeconds": duration,
            },
        },
    }

    headers = {"x-goog-api-key": api_key, "Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=payload, timeout=300)
    return response.json()


def save_video_sdk(result, output_path):
    """Extract and save video from SDK GenerateVideosResponse."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    if not result or not result.generated_videos:
        print("ERROR: No videos in response.", file=sys.stderr)
        return False

    video = result.generated_videos[0]
    if video.video and video.video.uri:
        # Download from URI — must include API key for authenticated download
        api_key = os.environ.get("GEMINI_API_KEY", "")
        download_url = video.video.uri
        if "?" in download_url:
            download_url += f"&key={api_key}"
        else:
            download_url += f"?key={api_key}"

        if USE_REQUESTS:
            r = requests.get(download_url, timeout=120)
            r.raise_for_status()
            with open(output_path, "wb") as f:
                f.write(r.content)
        else:
            import urllib.request
            import ssl
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            urllib.request.urlretrieve(download_url, output_path, context=ctx)
        return True
    elif video.video and video.video.video_bytes:
        video_data = video.video.video_bytes
        if isinstance(video_data, str):
            video_data = base64.b64decode(video_data)
        with open(output_path, "wb") as f:
            f.write(video_data)
        return True
    return False


def save_video_rest(response_json, output_path):
    """Extract and save video from REST API response."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    if "error" in response_json:
        error = response_json["error"]
        print(f"API ERROR: {error.get('message', 'Unknown error')}", file=sys.stderr)
        return False

    candidates = response_json.get("candidates", [])
    if not candidates:
        print("ERROR: No candidates in response.", file=sys.stderr)
        return False

    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        if "inlineData" in part and part["inlineData"].get("mimeType", "").startswith("video/"):
            video_data = base64.b64decode(part["inlineData"]["data"])
            with open(output_path, "wb") as f:
                f.write(video_data)
            return True

    print("ERROR: No video data found in response.", file=sys.stderr)
    return False


def main():
    parser = argparse.ArgumentParser(description="Generate video clips using Veo 3 API")
    parser.add_argument("--prompt", required=True, help="Scene description prompt")
    parser.add_argument("--output", required=True, help="Output file path (.mp4)")
    parser.add_argument("--start-frame", help="Start frame image path (for continuity)")
    parser.add_argument("--duration", type=int, default=5, help="Clip duration in seconds (default: 5)")
    parser.add_argument("--aspect-ratio", default="9:16", help="Aspect ratio (default: 9:16)")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model (default: {DEFAULT_MODEL})")

    args = parser.parse_args()

    if not os.environ.get("GEMINI_API_KEY"):
        print("ERROR: GEMINI_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    print(f"Generating video clip...")
    print(f"  Model: {args.model}")
    print(f"  Duration: {args.duration}s")
    print(f"  Aspect ratio: {args.aspect_ratio}")
    if args.start_frame:
        print(f"  Start frame: {args.start_frame}")
    print()

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            if USE_SDK:
                response = generate_with_sdk(
                    args.prompt, args.model, args.start_frame, args.duration, args.aspect_ratio
                )
                success = save_video_sdk(response, args.output)
            else:
                response = generate_with_rest(
                    args.prompt, args.model, args.start_frame, args.duration, args.aspect_ratio
                )
                success = save_video_rest(response, args.output)

            if success:
                file_size = os.path.getsize(args.output)
                print(f"SUCCESS: Video saved to {args.output} ({file_size:,} bytes)")
                result = {
                    "success": True,
                    "output_path": args.output,
                    "file_size_bytes": file_size,
                    "model": args.model,
                    "duration": args.duration,
                    "aspect_ratio": args.aspect_ratio,
                    "attempts": attempt,
                }
                print(json.dumps(result))
                sys.exit(0)
            else:
                print(f"WARNING: No video on attempt {attempt}/{MAX_RETRIES}.", file=sys.stderr)
                if attempt < MAX_RETRIES:
                    print(f"Retrying in {RETRY_DELAY}s...", file=sys.stderr)
                    time.sleep(RETRY_DELAY)

        except Exception as e:
            print(f"ERROR on attempt {attempt}/{MAX_RETRIES}: {e}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                print(f"Retrying in {RETRY_DELAY}s...", file=sys.stderr)
                time.sleep(RETRY_DELAY)

    result = {"success": False, "error": "Failed after all retries", "attempts": MAX_RETRIES, "output_path": None}
    print(json.dumps(result))
    sys.exit(1)


if __name__ == "__main__":
    main()
