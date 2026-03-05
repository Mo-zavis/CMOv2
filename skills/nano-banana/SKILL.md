---
name: nano-banana-image-generation
description: Generate images using Nano Banana (Gemini) API and save them as assets in any project
metadata:
  tags: nano-banana, nanobanana, image-generation, gemini, assets, images, ai-images
  triggers: nano banana, nanobanana, image generation, generate image, create image, generate asset, create asset
---

# Nano Banana Image Generation

Generate AI images using the Nano Banana (Google Gemini) image generation API and save them directly into the current project.

## When to use

Activate this skill whenever:
- The user mentions "Nano Banana", "NanoBanana", or "nano banana"
- The user asks to generate, create, or produce images/assets using AI
- The user says "use Nano Banana image generation skill"
- Image assets need to be created for any project

## Project-Specific Extensions

### Zavis Brand (Creative Director Mode)
When working in any Zavis project (detected by a `Zavis Skill For Designing Assets/` folder
in the project root), **defer to the Zavis Creative Director skill** instead of using the
generic workflow below. The Zavis skill provides:
- Brand-specific prompt engineering (warm cream palette, Zavis green accents, healthcare tone)
- Python-based generation with resolution control (1K/2K/4K) and reference image support
- Automated QA evaluation pipeline with weighted scoring
- Full brand guidelines and anti-pattern documentation

The Zavis skill is located at:
```
<project-root>/Zavis Skill For Designing Assets/SKILL.md
```

Read that file and follow its instructions for ALL image generation in Zavis projects.

## API Key

The Gemini API key is stored globally at:
```
~/.claude/skills/nano-banana/.env
```
Always load the key from this file. NEVER hardcode the key in project files. When a project already has a `.env` with `GEMINI_API_KEY`, use that instead.

## Setup (run once per project if needed)

If the project does not already have the required dependencies, install them:

```bash
npm install @google/genai dotenv
```

## Generator Script

If the project does not already contain a `generate-image.mjs` file (or equivalent), create one at the project root with this exact content:

```javascript
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";

const ASSETS_DIR = path.resolve("assets");

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate an image using NanoBanana (Gemini) API
 *
 * @param {string} prompt - Text description of the image to generate
 * @param {string} filename - Output filename (without extension)
 * @param {object} options
 * @param {"gemini-3.1-flash-image-preview"|"gemini-3-pro-image-preview"|"gemini-2.5-flash-image"} options.model
 * @param {"1:1"|"2:3"|"3:2"|"3:4"|"4:3"|"4:5"|"5:4"|"9:16"|"16:9"|"21:9"} options.aspectRatio
 */
export async function generateImage(prompt, filename, options = {}) {
  const {
    model = "gemini-3.1-flash-image-preview",
    aspectRatio = "16:9",
  } = options;

  console.log(`Generating: "${prompt}"`);
  console.log(`Model: ${model} | Aspect Ratio: ${aspectRatio}`);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      ...(aspectRatio && { aspectRatio }),
    },
  });

  const outputPath = path.join(ASSETS_DIR, `${filename}.png`);

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log("AI notes:", part.text);
    } else if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync(outputPath, buffer);
      console.log(`Saved: ${outputPath}`);
      return outputPath;
    }
  }

  throw new Error("No image was returned by the API");
}

// --- CLI usage ---
const args = process.argv.slice(2);

if (args.length >= 2) {
  const [prompt, filename, model, aspectRatio] = args;
  generateImage(prompt, filename, {
    ...(model && { model }),
    ...(aspectRatio && { aspectRatio }),
  }).catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
} else if (args.length > 0) {
  console.error("Usage: node generate-image.mjs <prompt> <filename> [model] [aspectRatio]");
  process.exit(1);
}
```

## How to Generate Images

### Step 1: Ensure environment

Before generating, make sure the API key is available. If the project has no `.env` with `GEMINI_API_KEY`:

```bash
cp ~/.claude/skills/nano-banana/.env .env
```

Or append if `.env` already exists with other variables:

```bash
grep -q GEMINI_API_KEY .env 2>/dev/null || cat ~/.claude/skills/nano-banana/.env >> .env
```

### Step 2: Ensure dependencies

```bash
# Check if @google/genai is installed, install if not
node -e "require.resolve('@google/genai')" 2>/dev/null || npm install @google/genai dotenv
```

### Step 3: Ensure the generator script exists

If `generate-image.mjs` does not exist in the project, create it using the template above.

### Step 4: Generate the image

```bash
node generate-image.mjs "<detailed prompt>" "<filename-without-extension>" [model] [aspectRatio]
```

## Available Models

| Model | Speed | Quality | Use for |
|-------|-------|---------|---------|
| `gemini-3.1-flash-image-preview` | Fast | Highest | All use cases, best balance of speed & quality (DEFAULT) |
| `gemini-3-pro-image-preview` | Slower | High | Alternative for detailed scenes |
| `gemini-2.5-flash-image` | Fast | Good | Legacy, quick drafts |

## Available Aspect Ratios

| Ratio | Use for |
|-------|---------|
| `16:9` | Hero banners, website headers, landscape (DEFAULT) |
| `9:16` | Mobile screens, stories, vertical content |
| `1:1` | Social media, thumbnails, icons |
| `4:3` | Presentations, traditional landscape |
| `3:4` | Portrait photos, cards |
| `3:2` | Photography standard |
| `2:3` | Tall portrait |
| `4:5` | Instagram portrait |
| `5:4` | Slight landscape |
| `21:9` | Ultra-wide banners, cinematic |

## Prompt Best Practices

- Be specific and descriptive: "A modern healthcare dashboard UI with blue and white color scheme, clean design, showing patient analytics graphs" rather than "dashboard"
- Specify style: "photorealistic", "flat illustration", "3D render", "minimalist", "isometric"
- Mention colors, lighting, and composition when they matter
- For UI assets: include "clean background", "isolated on white", "transparent background" as needed
- For website assets: specify the intended context like "hero section background", "feature icon", "testimonial headshot"
- For complex scenes, use layer-by-layer prompting: describe (1) background/environment, (2) subjects and positioning, (3) any overlay elements, (4) lighting and color direction separately rather than in one narrative

## Output

- All images are saved as PNG files in the project's `assets/` directory
- The function returns the absolute path to the saved image
- The `assets/` directory is created automatically if it doesn't exist

## Known Limitations

- **No precise UI composites.** AI image generation cannot reliably produce pixel-perfect UI mockups with correctly spelled, readable text. Use for photography, illustrations, and simple compositions.
- **Text rendering is unreliable.** Any text rendered in generated images may be misspelled, clipped, or distorted. Always verify text legibility in generated images.
- **Filenames must use kebab-case.** Never use spaces in output filenames (e.g., `dental-hero.png`, not `Dental Hero.png`). Spaces break web paths on case-sensitive systems.
- **No emojis.** Never include emoji characters in prompts, filenames, or output descriptions. Use descriptive text instead.

## Quick Reference

```bash
# Generate a hero banner
node generate-image.mjs "futuristic healthcare AI dashboard with glowing blue interface" hero-banner

# Generate with pro model
node generate-image.mjs "detailed medical illustration" medical-hero gemini-3-pro-image-preview

# Generate a square thumbnail
node generate-image.mjs "modern app icon, gradient blue" app-icon gemini-2.5-flash-image 1:1

# Generate a mobile asset
node generate-image.mjs "mobile onboarding screen illustration" onboarding gemini-2.5-flash-image 9:16
```
