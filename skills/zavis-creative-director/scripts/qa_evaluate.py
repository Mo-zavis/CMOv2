#!/usr/bin/env python3
"""
Zavis Creative Director — QA Evaluation Script
Evaluates generated images against Zavis brand standards.

This script performs two types of checks:
1. Programmatic checks (file integrity, dimensions, aspect ratio)
2. Generates a structured evaluation prompt for Claude to assess the image visually

Usage:
    python qa_evaluate.py \
        --image /path/to/generated.png \
        --context "website hero banner for dental solutions page" \
        [--expected-text "AI-Powered Patient Success"] \
        [--expected-aspect-ratio "16:9"] \
        [--brand-guidelines /path/to/brand-guidelines.md]

Output: JSON evaluation report to stdout
"""

import argparse
import json
import os
import sys

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


# Zavis brand color reference (RGB values)
ZAVIS_COLORS = {
    "warm_cream": (250, 243, 235),     # #faf3eb
    "off_black": (28, 28, 28),          # #1c1c1c
    "true_black": (0, 0, 0),            # #000000
    "white": (255, 255, 255),           # #ffffff
    "zavis_green": (0, 104, 40),        # #006828
    "warm_gray": (236, 235, 232),       # #ecebe8
    "near_white_warm": (253, 254, 248), # #fdfef8
}

# Aspect ratio tolerances
ASPECT_RATIO_MAP = {
    "1:1": 1.0,
    "2:3": 2/3,
    "3:2": 3/2,
    "3:4": 3/4,
    "4:3": 4/3,
    "4:5": 4/5,
    "5:4": 5/4,
    "9:16": 9/16,
    "16:9": 16/9,
    "21:9": 21/9,
}

ASPECT_RATIO_TOLERANCE = 0.05  # 5% tolerance


def check_file(image_path):
    """Verify file exists and is a valid image."""
    checks = {
        "file_exists": False,
        "file_readable": False,
        "file_size_bytes": 0,
        "is_valid_image": False,
        "width": None,
        "height": None,
        "actual_aspect_ratio": None,
        "format": None,
    }

    if not os.path.exists(image_path):
        return checks, "File does not exist"

    checks["file_exists"] = True
    checks["file_size_bytes"] = os.path.getsize(image_path)

    if checks["file_size_bytes"] == 0:
        return checks, "File is empty (0 bytes)"

    checks["file_readable"] = True

    if HAS_PIL:
        try:
            img = Image.open(image_path)
            img.verify()  # Verify it's a valid image
            img = Image.open(image_path)  # Re-open after verify
            checks["is_valid_image"] = True
            checks["width"] = img.width
            checks["height"] = img.height
            checks["actual_aspect_ratio"] = round(img.width / img.height, 4)
            checks["format"] = img.format
        except Exception as e:
            return checks, f"Invalid image file: {e}"
    else:
        # Without PIL, we can only check file basics
        checks["is_valid_image"] = True  # Assume valid, can't verify
        return checks, None

    return checks, None


def check_aspect_ratio(actual_ratio, expected_ratio_str):
    """Check if the actual aspect ratio matches the expected one."""
    if expected_ratio_str not in ASPECT_RATIO_MAP:
        return {
            "matches": None,
            "expected": expected_ratio_str,
            "actual": actual_ratio,
            "note": f"Unknown expected ratio: {expected_ratio_str}"
        }

    expected = ASPECT_RATIO_MAP[expected_ratio_str]
    difference = abs(actual_ratio - expected) / expected

    return {
        "matches": difference <= ASPECT_RATIO_TOLERANCE,
        "expected_ratio": expected_ratio_str,
        "expected_numeric": round(expected, 4),
        "actual_numeric": actual_ratio,
        "difference_pct": round(difference * 100, 2),
    }


def check_dominant_colors(image_path):
    """Analyze dominant colors and check for brand alignment."""
    if not HAS_PIL:
        return {"available": False, "note": "PIL not installed, skipping color analysis"}

    try:
        img = Image.open(image_path).convert("RGB")
        # Sample from the image (resize for speed)
        img_small = img.resize((100, 100))
        pixels = list(img_small.getdata())

        # Calculate average color
        avg_r = sum(p[0] for p in pixels) / len(pixels)
        avg_g = sum(p[1] for p in pixels) / len(pixels)
        avg_b = sum(p[2] for p in pixels) / len(pixels)

        # Check warmth (warm images have R > B)
        is_warm = avg_r > avg_b
        warmth_delta = avg_r - avg_b

        # Check if cool-toned (a brand violation)
        is_cool_toned = avg_b > avg_r + 15  # Blue significantly exceeds red

        return {
            "available": True,
            "average_rgb": [round(avg_r), round(avg_g), round(avg_b)],
            "average_hex": f"#{int(avg_r):02x}{int(avg_g):02x}{int(avg_b):02x}",
            "is_warm_toned": is_warm,
            "warmth_delta": round(warmth_delta, 1),
            "is_cool_toned_violation": is_cool_toned,
        }
    except Exception as e:
        return {"available": False, "error": str(e)}


def generate_visual_evaluation_prompt(context, expected_text=None):
    """Generate the evaluation prompt that Claude should use when looking at the image."""

    prompt = f"""## Zavis Brand QA Evaluation

Evaluate this generated image for the Zavis brand. The intended context is: **{context}**

{"**Expected text in image:** " + expected_text if expected_text else "**No text expected in this image.**"}

Score each dimension 1-5 and provide specific observations:

### 1. Text Legibility (Weight: 35%)
{"- Is all expected text present and correctly spelled?" if expected_text else "- N/A (no text expected) — auto-score 5"}
{"- Is the text fully readable at the intended display size?" if expected_text else ""}
{"- Is the text properly styled (not distorted, clipped, or garbled)?" if expected_text else ""}
{"- Does the font style match the Zavis direction (geometric grotesque for headings, clean humanist for body)?" if expected_text else ""}

### 2. Brand Consistency (Weight: 30%)
- Does the color palette align with Zavis? (Warm cream #faf3eb, off-black #1c1c1c, green accent #006828)
- Is the overall tone warm and professional (not cold, clinical, or generic)?
- Does the photography direction match? (approachable healthcare, natural expressions, real settings)
- Are there any off-brand elements? (neon colors, cool blue tones, dark moody lighting)

### 3. Visual Quality (Weight: 20%)
- Is the image sharp and well-composed?
- Are there any AI artifacts, distortions, or uncanny-valley elements?
- Is the lighting natural and consistent?
- Do surfaces and materials look realistic?

### 4. Contextual Fit (Weight: 15%)
- Is the image appropriate for its delivery context ({context})?
- Is the composition right for the container? (negative space for text overlay if needed)
- Is the mood right for the section?
- Would this look professional on the Zavis website/material?

### Output Format
Respond with a JSON object:
```json
{{
    "text_legibility": {{
        "score": <1-5>,
        "observations": ["specific observation 1", "specific observation 2"],
        "hard_fail": <true/false — true if text is misspelled or illegible>
    }},
    "brand_consistency": {{
        "score": <1-5>,
        "observations": ["specific observation 1", "specific observation 2"],
        "hard_fail": <true/false — true if colors are clearly off-brand>
    }},
    "visual_quality": {{
        "score": <1-5>,
        "observations": ["specific observation 1", "specific observation 2"],
        "hard_fail": <true/false — true if visible artifacts at display size>
    }},
    "contextual_fit": {{
        "score": <1-5>,
        "observations": ["specific observation 1", "specific observation 2"],
        "hard_fail": <true/false — true if wrong aspect ratio for context>
    }},
    "composite_score": <weighted average>,
    "pass": <true/false — composite >= 3.5 AND no hard fails>,
    "summary": "One-sentence overall assessment",
    "learnings": ["Specific improvement to make if retrying"]
}}
```"""

    return prompt


def main():
    parser = argparse.ArgumentParser(description="QA evaluate a generated Zavis image")
    parser.add_argument("--image", required=True, help="Path to generated image")
    parser.add_argument("--context", required=True,
                        help="Delivery context (e.g., 'website hero banner for dental page')")
    parser.add_argument("--expected-text", default=None,
                        help="Text that should appear in the image")
    parser.add_argument("--expected-aspect-ratio", default=None,
                        help="Expected aspect ratio (e.g., '16:9')")
    parser.add_argument("--brand-guidelines", default=None,
                        help="Path to brand guidelines file (for reference)")
    parser.add_argument("--output", default=None,
                        help="Output JSON report path (default: stdout)")

    args = parser.parse_args()

    report = {
        "image_path": args.image,
        "context": args.context,
        "expected_text": args.expected_text,
        "programmatic_checks": {},
        "visual_evaluation_prompt": None,
        "overall_status": "pending_visual_review",
    }

    # === Programmatic Checks ===

    # 1. File integrity
    file_checks, file_error = check_file(args.image)
    report["programmatic_checks"]["file"] = file_checks
    if file_error:
        report["programmatic_checks"]["file"]["error"] = file_error
        report["overall_status"] = "FAIL_FILE_ERROR"
        output_report(report, args.output)
        return

    # 2. Aspect ratio (if expected)
    if args.expected_aspect_ratio and file_checks["actual_aspect_ratio"]:
        ar_check = check_aspect_ratio(
            file_checks["actual_aspect_ratio"],
            args.expected_aspect_ratio
        )
        report["programmatic_checks"]["aspect_ratio"] = ar_check
        if ar_check.get("matches") == False:
            report["programmatic_checks"]["aspect_ratio"]["warning"] = (
                f"Aspect ratio mismatch: expected {args.expected_aspect_ratio} "
                f"({ar_check['expected_numeric']}), got {ar_check['actual_numeric']} "
                f"({ar_check['difference_pct']}% off)"
            )

    # 3. Color analysis
    color_check = check_dominant_colors(args.image)
    report["programmatic_checks"]["colors"] = color_check
    if color_check.get("is_cool_toned_violation"):
        report["programmatic_checks"]["colors"]["warning"] = (
            "Image appears cool-toned (blue exceeds red). "
            "Zavis brand requires warm tones. This is likely a brand violation."
        )

    # 4. File size sanity check
    if file_checks["file_size_bytes"] < 10000:  # Less than 10KB
        report["programmatic_checks"]["size_warning"] = (
            f"Image is unusually small ({file_checks['file_size_bytes']} bytes). "
            "This may indicate a low-quality or placeholder image."
        )

    # === Visual Evaluation ===
    # Generate the prompt for Claude to evaluate the image visually
    report["visual_evaluation_prompt"] = generate_visual_evaluation_prompt(
        args.context, args.expected_text
    )

    # Summary of programmatic checks
    programmatic_issues = []
    if color_check.get("is_cool_toned_violation"):
        programmatic_issues.append("Cool color tone detected (brand violation)")
    if report["programmatic_checks"].get("aspect_ratio", {}).get("matches") == False:
        programmatic_issues.append("Aspect ratio mismatch")
    if report["programmatic_checks"].get("size_warning"):
        programmatic_issues.append("Unusually small file size")

    report["programmatic_issues"] = programmatic_issues
    report["programmatic_pass"] = len(programmatic_issues) == 0

    if not report["programmatic_pass"]:
        report["overall_status"] = "PROGRAMMATIC_ISSUES_FOUND"
    else:
        report["overall_status"] = "PROGRAMMATIC_PASS_AWAITING_VISUAL_REVIEW"

    output_report(report, args.output)

    # Print human-readable summary to stderr
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"QA REPORT: {args.image}", file=sys.stderr)
    print(f"Context: {args.context}", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)

    if file_checks["width"] and file_checks["height"]:
        print(f"Dimensions: {file_checks['width']}x{file_checks['height']}", file=sys.stderr)
    print(f"File size: {file_checks['file_size_bytes']:,} bytes", file=sys.stderr)

    if programmatic_issues:
        print(f"\n⚠️  PROGRAMMATIC ISSUES:", file=sys.stderr)
        for issue in programmatic_issues:
            print(f"  - {issue}", file=sys.stderr)
    else:
        print(f"\n✓ Programmatic checks passed", file=sys.stderr)

    print(f"\n→ Visual review required. Use the evaluation prompt to assess the image.", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)


def output_report(report, output_path=None):
    """Output the report as JSON."""
    report_json = json.dumps(report, indent=2)
    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, "w") as f:
            f.write(report_json)
        print(f"Report saved to: {output_path}", file=sys.stderr)
    else:
        print(report_json)


if __name__ == "__main__":
    main()
