# Zavis Designer — Universal Design Replication Skill

> Replicate the Zavis design system across any medium: websites, video assets,
> social media graphics, targeted ads, pitch decks, email templates, and more.

## When to Activate

Trigger this skill for ANY design or visual production request involving Zavis:
- Website pages, landing pages, microsites
- Social media graphics (posts, stories, ads, covers)
- Video assets (thumbnails, title cards, lower thirds, end screens)
- Targeted ad creatives (Google, Meta, LinkedIn, Snapchat, TikTok)
- Email templates and headers
- Pitch decks and presentations
- Print materials (brochures, flyers, business cards)
- UI/UX mockups and prototypes
- Any request mentioning "Zavis design", "brand consistent", or "match our style"

## Skill Architecture

```
~/.claude/skills/zavis-designer/
├── SKILL.md                         ← You are here (workflow + rules)
├── references/
│   ├── design-tokens.md             ← Colors, fonts, spacing, shadows, radii, motion
│   ├── component-patterns.md        ← UI component catalog with exact classes
│   ├── page-templates.md            ← Full page layout blueprints
│   ├── brand-voice.md               ← Tone, messaging, content writing rules
│   ├── image-direction.md           ← Photography style, AI generation prompts
│   └── multi-format-specs.md        ← Specs for video, social, ads, email, print
```

---

## Core Design Philosophy

The Zavis design system is built on five principles:

1. **Warm Professionalism** — Healthcare-first aesthetics. Never cold, clinical, or
   generic corporate. Think: "a premium tool you'd trust with your patients."

2. **Restraint & Hierarchy** — Only 4 core colors. Two font families. Opacity-based
   text hierarchy. Subtle shadows and gradients. Let whitespace breathe.

3. **Consistency Over Novelty** — Every button, card, section, and page follows the
   same patterns. Predictability builds trust.

4. **Motion With Purpose** — Scroll-triggered animations, staggered reveals, hover
   micro-interactions. Always respect `prefers-reduced-motion`.

5. **Data-Driven Composition** — Layouts are template-driven. Content lives in data
   files. Pages are composed from a finite set of section patterns.

---

## Quick Reference — The 4 Colors

| Name       | Hex       | Role                                      |
|------------|-----------|-------------------------------------------|
| Off-White  | `#f8f8f6` | Page background — neutral warm, not cream  |
| Off-Black  | `#1c1c1c` | Primary text, headings — softer than #000  |
| Zavis Green| `#006828` | Brand accent — badges, links, focus states |
| White      | `#ffffff`  | Card surfaces, button text, dark-bg text   |

Supporting: True Black `#000000` for logo/buttons. All grays are `black/opacity`.

## Quick Reference — The 2 Fonts

| Font                  | Role            | Weights    | Character                         |
|-----------------------|-----------------|------------|-----------------------------------|
| Bricolage Grotesque   | Headings/Display| 400,500,600| Geometric, condensed, editorial   |
| Geist                 | Body/UI/Data    | 400,500,600| Clean, humanist, professional     |

---

## Workflow — Design Replication

### Step 1: Identify the Medium

Determine what you're creating. Read `references/multi-format-specs.md` for
format-specific dimensions, constraints, and adaptations.

### Step 2: Load Design Tokens

Read `references/design-tokens.md` for the exact color values, font stacks,
spacing scale, shadow definitions, border radii, gradients, and animation specs.

### Step 3: Select Component Patterns

Read `references/component-patterns.md` for the catalog of reusable UI patterns:
buttons, cards, badges, heroes, feature grids, CTAs, navigation, etc.

### Step 4: Choose a Page Template (if applicable)

Read `references/page-templates.md` for full-page layout blueprints that compose
the component patterns into complete page structures.

### Step 5: Apply Brand Voice

Read `references/brand-voice.md` for tone, messaging hierarchy, content rules,
and platform-specific feature descriptions.

### Step 6: Apply Image Direction (if visual assets needed)

Read `references/image-direction.md` for photography style, AI generation prompts,
subject direction, lighting rules, and anti-patterns to avoid.

### Step 7: Validate

Check every output against these non-negotiable rules:
- [ ] Only uses the 4 core colors (+ opacity variants + supporting surfaces)
- [ ] Headings use Bricolage Grotesque; body uses Geist
- [ ] Green is used sparingly as accent, never dominant
- [ ] Text hierarchy follows opacity rules (not named grays)
- [ ] Warm tone throughout — no cool blues, purples, or neon
- [ ] Spacing follows the 4px base grid
- [ ] Cards have consistent border/shadow/radius treatment
- [ ] CTAs are black with white text (or inverted on dark backgrounds)
- [ ] Photography is warm, natural, candid — never stock-generic

---

## Medium-Specific Quick Guides

### Website Pages
1. Load tokens + component patterns + page templates
2. Use React 18 + Tailwind CSS 4 + Vite + React Router
3. Follow mobile-first responsive patterns (sm → md → lg breakpoints)
4. Use GSAP + ScrollTrigger for scroll animations, Lenis for smooth inertial scrolling. Always respect prefers-reduced-motion.
5. Icons from `lucide-react`
6. The project uses GSAP for page transitions (not Framer Motion). The motion package has been completely removed.

### Social Media Graphics
1. Load tokens + image direction + multi-format specs
2. Background: Off-White `#f8f8f6` or gradient variant
3. Headline: Bricolage Grotesque, Off-Black `#1c1c1c`
4. Body: Geist, `black/50` opacity
5. Accent: Zavis Green `#006828` for badges/highlights
6. CTA: Black rounded pill with white text

### Video Assets
1. Load tokens + multi-format specs (video section)
2. Title cards: Off-White bg, Bricolage heading, Geist body
3. Lower thirds: Semi-transparent Off-White bar, Off-Black text
4. End screens: Dark gradient (`#1c1c1c` → `#2a2a2a`), white text
5. Transitions: Fade with 0.3s ease, or slide-up with spring curve

### Targeted Ads
1. Load tokens + brand voice + multi-format specs (ads section)
2. Hero image: Warm photography, natural healthcare settings
3. Headline: Bricolage Grotesque, bold metric or pain point
4. CTA: Black pill "Book a Demo" or "See It in Action"
5. Attribution: Small Zavis logo + green accent bar

### Email Templates
1. Load tokens + multi-format specs (email section)
2. Max width: 600px, Off-White background
3. Header: Zavis logo on Off-White, green accent line
4. Body: Geist 16px, Off-Black text
5. CTA: Black rounded button, centered
6. Footer: Light gray with unsubscribe link

### Pitch Decks
1. Load tokens + brand voice + multi-format specs (presentation section)
2. Slide bg: Off-White `#f8f8f6`
3. Title slides: Bricolage Grotesque 48-64px
4. Content slides: Geist 18-24px body
5. Accent slides: Dark gradient background with white text
6. Data viz: Zavis Green primary, Off-Black secondary, muted grays

---

## Image Generation Integration

This skill works with the **Nano Banana Pro** image generation system.
For image generation, also read:
- `~/.claude/skills/nano-banana/SKILL.md` for the generation API
- `references/image-direction.md` for Zavis-specific prompt engineering

### Quick Generate (Node.js)
```bash
node generate-image.mjs "<prompt>" "<filename>" [model] [aspectRatio]
```

### Production Generate (Python)
```bash
GEMINI_API_KEY=$(grep GEMINI_API_KEY .env | cut -d= -f2) \
python "Zavis Skill For Designing Assets/scripts/generate_image.py" \
  --prompt "..." --output assets/<name>.png
```

### API Key
Always source from `.env` — never hardcode.

---

## Cross-Project Usage

This skill is installed globally at `~/.claude/skills/zavis-designer/`.
It can be referenced from any project. When working outside the Zavis Landing
Pages repo:

1. The design tokens and patterns remain the same
2. Adapt the tech stack to the target project (e.g., Next.js, Vue, Svelte, HTML/CSS)
3. The brand rules are absolute — they don't change per project
4. Image generation scripts may need to be copied or path-adjusted

---

## Non-Negotiable Rules

1. **Never use cool colors** (blue, purple, cyan) as brand elements
2. **Never use stock-photo aesthetic** — always warm, candid, real
3. **Never use named grays** — always `black/opacity` for text hierarchy
4. **Never skip the green accent validation** — it must be `#006828` exactly
5. **Never make green dominant** — it's always an accent, never a background fill
6. **Never use more than 2 font families** (Bricolage Grotesque + Geist)
7. **Never skip reduced-motion support** in animated implementations
8. **Never use sharp corners on cards** — minimum `rounded-xl` (12px)
9. **Always end dark CTA sections** with the standard gradient pattern
10. **Always preserve the warm tone** — every output should feel like it belongs
    on an Off-White `#f8f8f6` page
