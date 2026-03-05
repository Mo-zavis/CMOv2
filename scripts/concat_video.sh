#!/bin/bash
#
# Concatenate video clips and optionally mix in voiceover audio.
#
# Usage:
#   ./concat_video.sh --clips s1_clip.mp4 s2_clip.mp4 s3_clip.mp4 --output final.mp4
#   ./concat_video.sh --clips s1.mp4 s2.mp4 --voiceover voiceover.mp3 --output final.mp4
#

set -e

CLIPS=()
VOICEOVER=""
OUTPUT=""

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --clips)
      shift
      while [[ $# -gt 0 && ! "$1" =~ ^-- ]]; do
        CLIPS+=("$1")
        shift
      done
      ;;
    --voiceover)
      VOICEOVER="$2"
      shift 2
      ;;
    --output)
      OUTPUT="$2"
      shift 2
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 1
      ;;
  esac
done

if [[ ${#CLIPS[@]} -eq 0 ]]; then
  echo "ERROR: No clips provided. Use --clips clip1.mp4 clip2.mp4 ..." >&2
  exit 1
fi

if [[ -z "$OUTPUT" ]]; then
  echo "ERROR: No output path. Use --output final.mp4" >&2
  exit 1
fi

# Check ffmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: ffmpeg not found. Install: brew install ffmpeg" >&2
  exit 1
fi

# Create temp dir for concat
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Write concat file list
CONCAT_FILE="$TMPDIR/filelist.txt"
for clip in "${CLIPS[@]}"; do
  echo "file '$(realpath "$clip")'" >> "$CONCAT_FILE"
done

echo "Concatenating ${#CLIPS[@]} clips..."

if [[ -n "$VOICEOVER" && -f "$VOICEOVER" ]]; then
  # Step 1: Concat video clips
  CONCAT_VIDEO="$TMPDIR/concat.mp4"
  ffmpeg -y -f concat -safe 0 -i "$CONCAT_FILE" -c copy "$CONCAT_VIDEO" 2>/dev/null

  # Step 2: Mix in voiceover
  echo "Mixing voiceover..."
  ffmpeg -y -i "$CONCAT_VIDEO" -i "$VOICEOVER" \
    -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest \
    "$OUTPUT" 2>/dev/null
else
  # Just concat without audio mixing
  ffmpeg -y -f concat -safe 0 -i "$CONCAT_FILE" -c copy "$OUTPUT" 2>/dev/null
fi

if [[ -f "$OUTPUT" ]]; then
  SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT" 2>/dev/null)
  echo "SUCCESS: Output saved to $OUTPUT ($SIZE bytes)"
  echo "{\"success\": true, \"output_path\": \"$OUTPUT\", \"file_size_bytes\": $SIZE, \"clips\": ${#CLIPS[@]}}"
else
  echo "FAILURE: Output not created" >&2
  echo "{\"success\": false, \"error\": \"FFmpeg concat failed\"}"
  exit 1
fi
