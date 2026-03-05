#!/usr/bin/env python3
"""
Zavis Creative Director — Image Generation Script
Wraps the Nano Banana Pro (Gemini) API for brand-consistent image generation.

Usage:
    python generate_image.py \
        --prompt "Your prompt" \
        --output /path/to/output.png \
        [--model gemini-3-pro-image-preview] \
        [--aspect-ratio 16:9] \
        [--resolution 2K] \
        [--reference-images /path/to/ref1.png /path/to/ref2.png] \
        [--search-grounding]
"""

import argparse
import base64
import json
import os
import sys
import time

# Try to use the Google GenAI SDK first, fall back to REST API
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


VALID_ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"]
VALID_RESOLUTIONS = ["1K", "2K", "4K"]
DEFAULT_MODEL = "gemini-3-pro-image-preview"
DEFAULT_ASPECT_RATIO = "16:9"
DEFAULT_RESOLUTION = "2K"
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds


def generate_with_sdk(prompt, model, aspect_ratio, resolution, reference_images=None, search_grounding=False):
    """Generate image using the Google GenAI Python SDK."""
    client = genai.Client()

    # Build contents
    contents = [prompt]

    # Add reference images if provided
    if reference_images:
        from PIL import Image as PILImage
        for ref_path in reference_images:
            if not os.path.exists(ref_path):
                print(f"WARNING: Reference image not found: {ref_path}", file=sys.stderr)
                continue
            img = PILImage.open(ref_path)
            contents.append(img)

    # Build config
    config_kwargs = {
        "response_modalities": ["TEXT", "IMAGE"],
        "image_config": types.ImageConfig(
            aspect_ratio=aspect_ratio,
            image_size=resolution
        ),
    }

    if search_grounding:
        config_kwargs["tools"] = [{"google_search": {}}]

    config = types.GenerateContentConfig(**config_kwargs)

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=config,
    )

    return response


def generate_with_rest(prompt, model, aspect_ratio, resolution, reference_images=None, search_grounding=False):
    """Generate image using the REST API directly."""
    if not USE_REQUESTS:
        print("ERROR: Neither google-genai SDK nor requests library available.", file=sys.stderr)
        print("Install one: pip install google-genai Pillow  OR  pip install requests", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    # Build parts
    parts = [{"text": prompt}]

    # Add reference images
    if reference_images:
        for ref_path in reference_images:
            if not os.path.exists(ref_path):
                print(f"WARNING: Reference image not found: {ref_path}", file=sys.stderr)
                continue
            with open(ref_path, "rb") as f:
                img_data = base64.b64encode(f.read()).decode("utf-8")

            # Detect MIME type
            ext = os.path.splitext(ref_path)[1].lower()
            mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                        ".gif": "image/gif", ".webp": "image/webp"}
            mime_type = mime_map.get(ext, "image/png")

            parts.append({
                "inline_data": {
                    "mime_type": mime_type,
                    "data": img_data
                }
            })

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "imageSize": resolution
            }
        }
    }

    if search_grounding:
        payload["tools"] = [{"google_search": {}}]

    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=payload, timeout=120)
    return response.json()


def extract_image_sdk(response):
    """Extract image data and text from SDK response."""
    text_parts = []
    image_data = None

    for part in response.parts:
        if part.text is not None:
            # Skip thought text
            if not getattr(part, 'thought', False):
                text_parts.append(part.text)
        elif part.inline_data is not None:
            # Skip thought images, take the last non-thought image
            if not getattr(part, 'thought', False):
                image_data = part.inline_data.data
                if hasattr(part, 'as_image'):
                    image_data = part  # Store the part itself for as_image()

    return text_parts, image_data


def extract_image_rest(response_json):
    """Extract image data and text from REST API response."""
    text_parts = []
    image_data = None

    if "error" in response_json:
        error = response_json["error"]
        print(f"API ERROR: {error.get('message', 'Unknown error')}", file=sys.stderr)
        print(f"Error code: {error.get('code', 'N/A')}", file=sys.stderr)
        return text_parts, None

    candidates = response_json.get("candidates", [])
    if not candidates:
        print("ERROR: No candidates in response.", file=sys.stderr)
        return text_parts, None

    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        if "text" in part and not part.get("thought", False):
            text_parts.append(part["text"])
        elif "inlineData" in part and not part.get("thought", False):
            image_data = base64.b64decode(part["inlineData"]["data"])

    return text_parts, image_data


def save_image(image_data, output_path, use_sdk=False):
    """Save image data to file."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    if use_sdk and hasattr(image_data, 'as_image'):
        # SDK provides PIL-compatible image
        img = image_data.as_image()
        img.save(output_path)
    elif isinstance(image_data, bytes):
        with open(output_path, "wb") as f:
            f.write(image_data)
    else:
        print("ERROR: Unexpected image data type.", file=sys.stderr)
        return False

    return True


def main():
    parser = argparse.ArgumentParser(description="Generate images using Nano Banana Pro API")
    parser.add_argument("--prompt", required=True, help="Image generation prompt")
    parser.add_argument("--output", required=True, help="Output file path (.png)")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model ID (default: {DEFAULT_MODEL})")
    parser.add_argument("--aspect-ratio", default=DEFAULT_ASPECT_RATIO,
                        help=f"Aspect ratio (default: {DEFAULT_ASPECT_RATIO})")
    parser.add_argument("--resolution", default=DEFAULT_RESOLUTION,
                        help=f"Resolution (default: {DEFAULT_RESOLUTION})")
    parser.add_argument("--reference-images", nargs="*", help="Reference image paths")
    parser.add_argument("--search-grounding", action="store_true",
                        help="Enable Google Search grounding")

    args = parser.parse_args()

    # Validate inputs
    if args.aspect_ratio not in VALID_ASPECT_RATIOS:
        print(f"ERROR: Invalid aspect ratio '{args.aspect_ratio}'. Valid: {VALID_ASPECT_RATIOS}",
              file=sys.stderr)
        sys.exit(1)

    if args.resolution not in VALID_RESOLUTIONS:
        print(f"ERROR: Invalid resolution '{args.resolution}'. Valid: {VALID_RESOLUTIONS}",
              file=sys.stderr)
        sys.exit(1)

    # Check API key
    if not os.environ.get("GEMINI_API_KEY"):
        print("ERROR: GEMINI_API_KEY environment variable not set.", file=sys.stderr)
        print("Set it with: export GEMINI_API_KEY=your-api-key", file=sys.stderr)
        sys.exit(1)

    print(f"Generating image...")
    print(f"  Model: {args.model}")
    print(f"  Aspect ratio: {args.aspect_ratio}")
    print(f"  Resolution: {args.resolution}")
    if args.reference_images:
        print(f"  Reference images: {len(args.reference_images)}")
    if args.search_grounding:
        print(f"  Search grounding: enabled")
    print()

    # Generate with retries
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            if USE_SDK:
                response = generate_with_sdk(
                    args.prompt, args.model, args.aspect_ratio, args.resolution,
                    args.reference_images, args.search_grounding
                )
                text_parts, image_data = extract_image_sdk(response)
            else:
                response = generate_with_rest(
                    args.prompt, args.model, args.aspect_ratio, args.resolution,
                    args.reference_images, args.search_grounding
                )
                text_parts, image_data = extract_image_rest(response)

            # Print any text response
            if text_parts:
                print("Model response:")
                for t in text_parts:
                    print(f"  {t}")
                print()

            if image_data is None:
                print(f"WARNING: No image returned on attempt {attempt}/{MAX_RETRIES}.",
                      file=sys.stderr)
                if attempt < MAX_RETRIES:
                    print(f"Retrying in {RETRY_DELAY}s...", file=sys.stderr)
                    time.sleep(RETRY_DELAY)
                    continue
                else:
                    print("FAILURE: No image generated after all retries.", file=sys.stderr)
                    # Output structured failure for the QA pipeline to read
                    result = {
                        "success": False,
                        "error": "No image returned by API after all retries",
                        "attempts": MAX_RETRIES,
                        "output_path": None
                    }
                    print(json.dumps(result))
                    sys.exit(1)

            # Save image
            if save_image(image_data, args.output, use_sdk=USE_SDK):
                file_size = os.path.getsize(args.output)
                print(f"SUCCESS: Image saved to {args.output} ({file_size:,} bytes)")

                result = {
                    "success": True,
                    "output_path": args.output,
                    "file_size_bytes": file_size,
                    "model": args.model,
                    "aspect_ratio": args.aspect_ratio,
                    "resolution": args.resolution,
                    "attempts": attempt
                }
                print(json.dumps(result))
                sys.exit(0)
            else:
                print(f"ERROR: Failed to save image on attempt {attempt}.", file=sys.stderr)

        except Exception as e:
            print(f"ERROR on attempt {attempt}/{MAX_RETRIES}: {e}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                print(f"Retrying in {RETRY_DELAY}s...", file=sys.stderr)
                time.sleep(RETRY_DELAY)
            else:
                result = {
                    "success": False,
                    "error": str(e),
                    "attempts": MAX_RETRIES,
                    "output_path": None
                }
                print(json.dumps(result))
                sys.exit(1)


if __name__ == "__main__":
    main()
