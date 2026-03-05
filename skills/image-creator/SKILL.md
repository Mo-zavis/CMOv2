# Static Image Content Creation Skill

## When to Use
Activate this skill whenever:
- Creating social media images (LinkedIn posts, Instagram feed/stories, X posts, Facebook posts)
- Designing ad banners (Google Display, Meta feed/stories, LinkedIn sponsored)
- Generating thumbnails for videos or blog posts
- Creating infographics or data visualizations
- Designing carousel images for LinkedIn or Instagram
- Producing email header images
- Creating any visual asset that requires brand consistency

---

## Tools

| Tool | Type | Role |
|------|------|------|
| Nano Banana (Gemini) | `[MCP]` | Primary AI image generation |
| Figma | `[MCP]` | Design refinement, template-based layouts, typography overlays |
| ComfyUI | `[API]` | Advanced workflows: inpainting, style transfer, upscaling, region editing |
| DALL-E (OpenAI) | `[API]` | Alternative image generation |
| Cloudinary | `[API]` | Image optimization, transformations, responsive variants, CDN delivery |
| Remove.bg | `[API]` | Background removal for product shots and headshots |
| Claude Code | `[Native]` | Prompt engineering, metadata generation, alt text, asset management |

---

## Platform Dimensions Reference

Always generate images at the correct dimensions for the target platform. When an asset serves multiple platforms, generate separate versions for each.

| Platform | Format | Dimensions (px) | Aspect Ratio | Notes |
|----------|--------|-----------------|--------------|-------|
| Instagram Feed | Square | 1080 x 1080 | 1:1 | Primary format |
| Instagram Feed | Portrait | 1080 x 1350 | 4:5 | Higher engagement |
| Instagram Stories/Reels | Vertical | 1080 x 1920 | 9:16 | Full screen |
| Instagram Carousel | Square | 1080 x 1080 | 1:1 | Up to 10 slides |
| LinkedIn Post | Landscape | 1200 x 627 | 1.91:1 | Optimal for feed |
| LinkedIn Article Cover | Landscape | 1280 x 720 | 16:9 | Blog header |
| LinkedIn Carousel | Square/Portrait | 1080 x 1080 or 1080 x 1350 | 1:1 or 4:5 | PDF upload |
| X (Twitter) Post | Landscape | 1600 x 900 | 16:9 | Single image |
| Facebook Post | Landscape | 1200 x 630 | 1.91:1 | Feed optimal |
| Facebook Cover | Landscape | 1640 x 924 | 16:9 | Page cover |
| Pinterest Pin | Vertical | 1000 x 1500 | 2:3 | Standard pin |
| Google Display (Medium Rectangle) | Landscape | 300 x 250 | 6:5 | Most common |
| Google Display (Leaderboard) | Landscape | 728 x 90 | 8:1 | Top banner |
| Google Display (Large Rectangle) | Landscape | 336 x 280 | 6:5 | High performance |
| Meta Ads (Feed) | Square | 1080 x 1080 | 1:1 | Recommended |
| Meta Ads (Stories) | Vertical | 1080 x 1920 | 9:16 | Full screen |
| YouTube Thumbnail | Landscape | 1280 x 720 | 16:9 | Video cover |
| Blog Featured Image | Landscape | 1200 x 630 | 1.91:1 | OG image size |
| Email Header | Landscape | 600 x 200 | 3:1 | Email safe width |

---

## Prompt Engineering for Nano Banana

Structure every image generation prompt with these components in order:

### Prompt Structure
```
[SUBJECT]: What is the main subject of the image
[SETTING]: Where the scene takes place
[COMPOSITION]: Camera angle, framing, focal point
[LIGHTING]: Light quality, direction, mood
[STYLE]: Visual style, artistic treatment
[COLORS]: Dominant colors and palette
[MOOD]: Emotional tone
[TEXT OVERLAY]: Any text that should appear on the image (if applicable)
[TECHNICAL]: Resolution, format, quality notes
```

### Example Prompt (Zavis Brand)
```
Subject: A healthcare coordinator smiling while reviewing patient appointments on a modern tablet interface
Setting: Bright, contemporary clinic reception area with natural wood accents and indoor plants
Composition: Medium close-up, slightly elevated angle, tablet interface visible but secondary to the coordinator's expression, shallow depth of field
Lighting: Natural golden hour light streaming through large clinic windows, warm and inviting
Style: Professional healthcare photography, candid and authentic, not stock-photo staged
Colors: Warm natural tones with subtle Zavis green (#006828) accents in the environment, off-white (#f8f8f6) walls, clean whites
Mood: Confident, efficient, warm, professional
Technical: High resolution, sharp focus on subject, photorealistic
```

### Prompt Rules
1. Always specify "real healthcare settings" not generic offices
2. Include diverse healthcare professionals and patients
3. Specify "candid expressions" not posed stock-photo looks
4. Reference Zavis brand colors for environmental accents, not artificial overlays
5. Default to "golden hour" or "natural warm" lighting unless the brief specifies otherwise
6. Never include text in AI-generated images (add text overlays in post-processing via Figma)
7. Avoid: neon colors, blue-tinted clinical looks, empty/sterile environments, stock-photo aesthetics

---

## Zavis Visual Identity Rules

### Colors
| Token | Hex | Usage in Images |
|-------|-----|-----------------|
| Off-White | `#f8f8f6` | Backgrounds, cards, content areas |
| Off-Black | `#1c1c1c` | Text overlays, dark sections |
| Zavis Green | `#006828` | Brand accent, CTAs, highlight elements |
| White | `#ffffff` | Clean areas, text on dark backgrounds |

### Typography for Text Overlays
- **Headlines:** Bricolage Grotesque, medium weight
- **Body text:** Geist, medium weight
- **Text overlays are added in Figma or post-processing, never in AI generation prompts**

### Visual Style Mandates
- Natural warm tones, golden hour lighting preference
- Real healthcare settings: clinics, consultation rooms, reception areas, hospital corridors
- Candid expressions on healthcare professionals and patients
- Diverse representation in every image set
- Clean, modern clinic environments (wood, plants, natural light)
- No neon, no blue-tinted clinical sterility, no stock-photo staging
- No emojis or emoji-like elements in any image

---

## Workflow Process

### Step 1: Read Brief
Read the campaign brief and asset requirements:
- What is the image for? (Social post, ad banner, thumbnail, infographic)
- Which platform(s) will it appear on?
- What is the key message or theme?
- What pillar does it connect to? (Revenue, no-shows, satisfaction)
- Are there specific elements that must be included? (Product UI, people, setting)
- What existing assets or templates should be referenced?

### Step 2: Check Platform Specs
Look up the target platform in the dimensions reference above. Determine:
- Primary dimensions for the target platform
- Whether multiple sizes are needed (e.g., same concept for LinkedIn + Instagram)
- Safe zones for text (keep critical elements away from edges)
- Platform-specific constraints (Instagram: no links in captions, Pinterest: vertical preferred)

### Step 3: Craft Prompt
Write a detailed generation prompt following the Nano Banana prompt structure:
- Incorporate brand visual identity rules
- Include specific subject, setting, and mood details from the brief
- Generate 3-4 variants with different compositions or angles
- Document the exact prompt used for reproducibility

### Step 4: Generate
Execute image generation:
- **Primary:** Nano Banana MCP for photorealistic healthcare imagery
- **Alternative:** ComfyUI for complex compositions requiring inpainting or style transfer
- **Alternative:** DALL-E for conceptual or illustrative styles
- Generate 3-4 variants per brief
- Review all variants against brand guidelines before presenting any

### Step 5: Post-Process
After generation:
- Resize for each target platform using the dimensions reference
- Add text overlays via Figma if required (headlines, CTAs, captions)
- Apply brand typography (Bricolage Grotesque for headings, Geist for body)
- Optimize file size via Cloudinary (maintain quality, reduce payload)
- Generate responsive variants if needed (1x, 2x for web)
- Remove backgrounds via Remove.bg if compositing is needed

### Step 6: Store with Metadata
Save assets with full metadata:
- Image file: `/assets/images/{asset-id}/v{n}.png`
- Metadata: `/assets/images/{asset-id}/metadata.yaml`

```yaml
asset:
  id: "img-2026-03-04-001"
  campaign_id: "campaign-q2-2026-pe-launch"
  type: "social_image"
  platform: "linkedin"
  dimensions: "1200x627"
  version: 1
  status: IN_REVIEW
  created: "2026-03-04"

generation:
  tool: "nano-banana"
  model: "gemini-image"
  prompt: "A healthcare coordinator smiling while reviewing..."
  seed: null
  variations_generated: 4
  selected_variant: 2

brand_compliance:
  colors_used: ["#f8f8f6", "#006828", "#1c1c1c"]
  typography: "Bricolage Grotesque (headline overlay)"
  visual_style: "golden hour, clinic setting, candid"
  pillar_connection: "reduce_no_shows"

files:
  original: "v1.png"
  optimized: "v1-optimized.png"
  variants:
    - "v1-linkedin-1200x627.png"
    - "v1-instagram-1080x1080.png"

alt_text: "Healthcare coordinator reviewing patient appointment schedule on a tablet in a modern clinic reception area"
```

### Step 7: Present for Review
Present the image for human feedback:
- Show all generated variants side by side
- Display at actual platform dimensions (not scaled)
- Include the prompt used and brand compliance checklist
- Enable region-specific feedback ("logo too small in bottom-right", "text unreadable on this background color")

### Step 8: Iterate
Process feedback and regenerate or edit:
- For composition changes: regenerate with modified prompt
- For region-specific edits: use ComfyUI inpainting to edit specific areas
- For text overlay adjustments: edit in Figma
- Save each iteration as a new version (v2.png, v3.png)
- Update metadata.yaml with version history

### Step 9: Approval
Once approved:
- Mark asset status as `APPROVED`
- Asset is now available for downstream workflows (social-publisher, ad-manager, email-marketer)
- Update the campaign status.yaml

---

## Quality Checks Before Presenting

- [ ] Image matches target platform dimensions exactly
- [ ] Brand colors are consistent (#006828 green, #1c1c1c, #f8f8f6)
- [ ] Typography uses Bricolage Grotesque for headings, Geist for body
- [ ] No emojis or emoji-like elements
- [ ] Natural warm tones, not cold/clinical blue
- [ ] Diverse representation in people-focused images
- [ ] Healthcare setting is authentic, not generic office
- [ ] Text overlays are readable with sufficient contrast
- [ ] Alt text is descriptive and accurate
- [ ] File size is optimized for web delivery
- [ ] Metadata YAML is complete and accurate
- [ ] Pillar connection is documented

---

## Cross-Workflow Dependencies

This skill feeds:
- **Social Publisher** with platform-ready images for posting
- **Ad Manager** with ad creative banners and visuals
- **Email Marketer** with email header images
- **Video Producer** with thumbnails and visual assets
- **Content Writer** with featured images for blog posts
