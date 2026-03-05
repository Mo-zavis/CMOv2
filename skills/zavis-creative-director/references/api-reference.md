# Nano Banana Pro — API Reference

Quick reference for the Gemini image generation API used by this skill.

## Models

| Model | ID | Notes |
|-------|-----|-------|
| Nano Banana 2 (DEFAULT) | `gemini-3.1-flash-image-preview` | Best balance of speed and quality. Use for all standard generation. |
| Nano Banana Pro | `gemini-3-pro-image-preview` | Higher detail for complex scenes. Slower. |
| Nano Banana Flash (legacy) | `gemini-2.5-flash-image` | Quick drafts only. Lower quality. |

## API Basics

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
**Auth**: `x-goog-api-key` header or `GEMINI_API_KEY` env var via SDK
**Response format**: Parts array containing text and/or inline_data (base64 image)

## Generation Config

```python
config = types.GenerateContentConfig(
    response_modalities=['TEXT', 'IMAGE'],
    image_config=types.ImageConfig(
        aspect_ratio="16:9",   # Options: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
        image_size="2K"        # Options: 1K, 2K, 4K (uppercase K required)
    ),
)
```

## Key Capabilities

### Text-to-Image
Simple prompt → image generation.

### Image Editing (Reference Images)
Pass up to **14 reference images** along with a text prompt:
- Up to 6 images of objects (for high-fidelity inclusion)
- Up to 5 images of humans (for character consistency)

Reference images are sent as `inline_data` parts with base64 encoding.

### Multi-Turn Editing
Use the chat/conversation API to iteratively refine images. Each turn can modify the
previous output. The SDK handles thought signatures automatically when using the chat API.

### Google Search Grounding
Enable `tools=[{"google_search": {}}]` to let the model generate images based on real-time
information. Useful for current event graphics or data-driven visuals.

### Thinking Mode
Pro model uses "Thinking" by default (cannot be disabled). It generates up to 2 interim
thought images before the final output. These thought images are not billed.

## Resolution Options

| Size | Approximate Dimensions | Use Case |
|------|----------------------|----------|
| 1K | ~1024px on long edge | Icons, thumbnails, rapid iteration |
| 2K | ~2048px on long edge | Standard web assets, social media |
| 4K | ~4096px on long edge | Product screenshots, hero images, print |

## Error Handling

- API may return no image if safety filters trigger — retry with adjusted prompt
- Rate limits apply — the script includes retry logic with backoff
- Response `parts` array may contain only text (no image) — always check for `inline_data`
- The `finish_reason` field indicates if generation completed normally

## Known Limitations

- **No precise UI composites.** The API cannot reliably generate pixel-perfect UI mockups with correctly spelled, legible text. Use for photography and simple compositions only.
- **Text rendering is unreliable.** Rendered text may be misspelled, clipped, distorted, or illegible. Always QA text in generated images.
- **Layer-by-layer prompting recommended.** For complex scenes, describe each visual layer separately rather than using a single narrative prompt.

## SDK Setup (Python)

```bash
pip install google-genai Pillow
```

```python
from google import genai
from google.genai import types

client = genai.Client()  # Uses GEMINI_API_KEY env var
```

## SDK Setup (Node.js)

```bash
npm install @google/genai
```

```javascript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});  // Uses GEMINI_API_KEY env var
```
