# Zavis Brand Guidelines — Visual Asset Reference

This document is the brand DNA for all visual asset generation. Every image, graphic, and
illustration produced for Zavis must align with these guidelines.

## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography Direction](#typography-direction)
4. [Photography Direction](#photography-direction)
5. [Image Containers & Treatment](#image-containers--treatment)
6. [Dimension Guide by Context](#dimension-guide-by-context)
7. [Cross-Vertical Adaptation](#cross-vertical-adaptation)
8. [Anti-Patterns](#anti-patterns)

---

## Brand Identity

**Zavis** is an AI-native Patient Success Platform for healthcare organizations. The product
suite includes: Dental, Chat, Voice, AI Agents, Bookings (solutions) and CRM, Analytics,
Automations (platform).

**Brand personality**: Professional, warm, approachable, trustworthy, modern. This is
healthcare, not a nightclub. But it's also not cold or clinical — Zavis sits at the
intersection of cutting-edge AI technology and human warmth.

**Visual philosophy**: Warm and grounded with a cream-dominant palette. Surfaces layer
subtly on top of each other. Green accents are used sparingly for emphasis. The overall
feeling should be "a premium tool you'd trust with your patients."

---

## Color System

### Primary Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Off-White | #f8f8f6 | 250, 243, 235 | Page background — the dominant color of the brand. Warm, not clinical. |
| Off-Black | #1c1c1c | 28, 28, 28 | Primary headings, card titles. Softer than pure black. |
| True Black | #000000 | 0, 0, 0 | Logo, buttons, strong UI elements. |
| White | #ffffff | 255, 255, 255 | Card surfaces, button text, footer text on dark. |
| Zavis Green | #006828 | 0, 104, 40 | Brand accent — pills, sub-headings, highlighted text, links. |

### Supporting Surfaces

| Name | Value | Usage |
|------|-------|-------|
| Warm Gray | #ecebe8 | Content containers, section wraps that nest cards. |
| Near-White Warm | #fdfef8 | Visual/screenshot panels inside feature cards. |
| Frosted Glass | rgba(217,217,217,0.2) | Navbar glass bar background. |

### Green Accent System
- **Pill background**: rgba(0,104,40,0.07) — a 7% tint of brand green on off-white
- **Pill/accent text**: #006828 — the full brand green

### Text Colors (Opacity-Based)
Text color is always black at varying opacity — never a named gray. This keeps the warm
undertone of the cream showing through.

| Opacity | CSS | Usage |
|---------|-----|-------|
| 100% | #000 | Logo, strong headings, feature headings |
| ~89% | #1c1c1c | Display headings, card titles ("soft black") |
| 60% | rgba(0,0,0,0.6) | Hero descriptions, longer body copy |
| 56% | rgba(0,0,0,0.56) | Primary muted — descriptions, sub-text |
| 50% | rgba(0,0,0,0.5) | Light muted text, secondary descriptions |
| 48% | rgba(0,0,0,0.48) | Inactive tab text |

### Key Color Rules for Image Generation
- **Backgrounds** in generated images should feel like they belong on the #f8f8f6 cream page
- **Never use cool grays, blues, or purples** as dominant tones — keep everything warm
- **The green accent** (#006828) should be used sparingly — it's a highlight, not a dominant color
- **Contrast**: Off-black text on off-white surfaces provides ~87% contrast — readable and warm
- When generating images with text overlays, ensure sufficient contrast against the background

---

## Typography Direction

Zavis uses exactly two typefaces: **Bricolage Grotesque** (display/headings) and **Geist**
(body/data). When generating images that contain text, describe fonts as follows:

### For Bricolage Grotesque (Headings, Display)
Prompt description: "bold, geometric grotesque sans-serif with a slightly condensed feel
and tight letter-spacing"
- Use for: headlines, hero text, section titles, navigation-style labels, brand statements
- Character: confident, modern, editorial
- Weight: medium (500) for display, semibold (600) for labels

### For Geist (Body, Data, UI)
Prompt description: "clean, modern humanist sans-serif with even proportions"
- Use for: body text, descriptions, data labels, buttons, form text
- Character: readable, neutral, professional
- Weight: medium (500) for body, semibold (600) for emphasis

### Text Rendering Rules
- **Bricolage Grotesque uses negative letter-spacing** — describe as "tightly tracked" in prompts
- **Tab bar labels are always UPPERCASE** in Bricolage
- **Signature brand detail**: timeline step titles end with a period in green (#006828).
  E.g., "Customer Support." where the period is green. Include this in prompts when relevant.

---

## Photography Direction

This is the most critical section for image generation quality.

### Tone
- Professional, warm, approachable
- This is healthcare — NOT a nightclub, NOT a tech startup's exposed-brick office
- Think: "a confident dental practice that genuinely cares about their patients"

### Subjects
- Dental professionals and patients in real clinical settings
- Modern equipment shown in context (not floating isolated devices)
- Team collaboration scenes (doctor-patient interaction, staff meetings)
- Real healthcare environments — treatment rooms, reception areas, consultation rooms

### What to Avoid (Critical)
- AVOID: Cold, sterile, blue-tinted clinical photography
- AVOID: Overly posed stock photography with fake smiles
- AVOID: Generic office environments (glass towers, open plan offices)
- AVOID: Floating devices or technology shown in isolation without context
- AVOID: People staring directly at camera with frozen expressions
- AVOID: Cool/blue color grading
- AVOID: Dark, moody, dramatic lighting
- AVOID: Neon or vibrant accent colors

### What to Embrace
- EMBRACE: Natural warm tones that feel at home on the #f8f8f6 off-white background
- EMBRACE: Golden hour or soft diffused natural lighting
- EMBRACE: Confident, natural expressions — mid-action, mid-conversation
- EMBRACE: Real healthcare settings with authentic details
- EMBRACE: Diverse patients and healthcare professionals represented naturally
- EMBRACE: Technology shown being used by real people in real settings
- EMBRACE: Warm color grading with slight cream/amber cast

### People in Images
- **Hero sections**: Background-removed person cutouts overlaid on off-white background,
  large scale (~50% of hero height)
- **Feature cards**: Contextual photos showing real interactions (doctor-patient, team
  collaboration)
- **Never**: Headshots in circles, floating faces without context, unrelated stock people
- **Scale**: People in feature cards shown at natural/medium distance — not zoomed tight on faces
- **Expression**: Confident, natural, mid-action — never staring directly at camera

### Product Screenshots
- Shown inside rounded containers with subtle shadow
- Full-bleed within container — no internal padding around the screenshot
- Show actual UI — dashboards, chat interfaces, booking flows
- Slightly zoomed/cropped to highlight key features, not full-screen captures

---

## Image Containers & Treatment

When generating images that will live inside Zavis's UI, understand the container they'll
sit in:

### Feature Card Visuals
- Container: rounded corners with multi-layer subtle shadow (2% opacity)
- Border: 1px at 25% black opacity
- Object-fit: `cover` for photography, `contain` for UI screenshots
- Visual column takes ~55-60% of card width

### Hero Images
- Container: warm gray (#ecebe8) background, generously rounded
- Large imagery may bleed slightly beyond container edges
- Background-removed person cutouts layered behind/beside text
- Device mockups: inner and outer rounding with heavy ring + cast shadow treatment

### Timeline Images
- Larger rounding, no shadow, clip-only
- Image takes the right portion (~50-55% of the row), text takes the left

---

## Dimension Guide by Context

### Website
| Section | Aspect Ratio | Notes |
|---------|-------------|-------|
| Hero banner | 16:9 | Needs negative space on left for headline text |
| Feature card visual | 3:2 landscape | Lives in 55-60% width column |
| Timeline step image | 4:3 | Right-aligned, ~50% row width |
| Product screenshot | 4:3 | Inside rounded container with shadow |
| Blog header | 16:9 | Full-width, text overlaid |

### Social Media
| Platform | Aspect Ratio | Notes |
|----------|-------------|-------|
| Instagram feed | 1:1 or 4:5 | Brand green accent, cream background |
| Instagram story | 9:16 | Full-screen, text overlay safe zones |
| LinkedIn post | 1:1 or 4:5 | Professional tone, minimal text |
| LinkedIn ad | 4:5 | Clear CTA area at bottom |
| Twitter/X post | 16:9 | Horizontal, attention-grabbing |
| Facebook ad | 4:5 | Text overlay < 20% of image area |

### Other
| Context | Aspect Ratio | Notes |
|---------|-------------|-------|
| Email header | 3:1 (crop from 3:2) | Must work at small sizes |
| Pitch deck slide | 16:9 | High contrast for projector viewing |
| Print brochure | 3:4 or custom | CMYK-safe colors (off-white maps well) |

---

## Cross-Vertical Adaptation

Zavis serves multiple healthcare verticals. The brand DNA stays the same, but the
subject matter and environmental details shift:

### Dental (Primary)
- Subjects: Dentists, hygienists, dental patients, reception staff
- Settings: Modern dental operatories, reception areas, consultation rooms
- Equipment: Dental chairs, monitors showing dental software, intraoral cameras
- Mood: Clean, bright, calming — "going to the dentist doesn't have to be scary"

### General Healthcare
- Subjects: Doctors, nurses, administrative staff, diverse patients
- Settings: Clinics, hospitals, telehealth setups, waiting rooms
- Equipment: General medical equipment, tablets/computers showing Zavis UI
- Mood: Efficient, caring, technology-enabled

### When in Doubt
Default to the dental vertical — it's Zavis's primary market and the design system was
built around it.

---

## Anti-Patterns

These are common failure modes in AI image generation. Watch for them:

1. **"AI Look"** — overly smooth skin, symmetrical faces, plastic-looking surfaces.
   Counter with: "natural skin texture, slight asymmetry, realistic material surfaces"
2. **Wrong color temperature** — AI models default to cool/neutral tones. Counter with:
   "warm color grading, amber undertones, golden natural lighting"
3. **Text garbling** — AI text generation is imperfect. Use Nano Banana 2 (gemini-3.1-flash-image-preview) as the default model. Use Pro (gemini-3-pro-image-preview) for complex scenes requiring extra detail.
   Keep text simple and short, and always verify every character in QA
4. **Stock photo energy** — diverse group standing in V-formation smiling at camera. Counter
   with: "candid moment, mid-conversation, natural body language, not posed"
5. **Floating technology** — devices shown against blank backgrounds. Counter with:
   "device held by a person / resting on a desk in a real environment"
6. **Generic healthcare** — stethoscope-on-white imagery. Counter with specific environmental
   details from the dental/healthcare settings described above

## Known Limitations

- AI image generation cannot produce precise UI composites with readable text. For exact UI mockups, create them in Figma or programmatically.
- The blended photography + UI overlay style works best with simple overlay elements (chat bubbles, notification badges) rather than full dashboard recreations.
- Always use kebab-case for filenames (e.g., `dental-hero.png`, not `Dental Hero.png`). Spaces in filenames break web paths.
