# Zavis Image Direction — Photography, Illustration & AI Generation

> Visual style rules for every image produced under the Zavis brand.
> Applies to photography, AI-generated images, illustrations, and screenshots.

---

## 1. Visual Philosophy

The Zavis visual identity is **warm, grounded, and premium**. Every image should
feel like it belongs on an Off-White `#f8f8f6` page. The overall impression:
"a premium tool you'd trust with your patients."

### Core Principles

1. **Warm over cool** — Always warm color grading. Golden hour feel. Cream/amber cast.
2. **Real over posed** — Candid moments, mid-action, mid-conversation. Never staged.
3. **Context over isolation** — People in real environments, not floating on white.
4. **Professional over casual** — Healthcare settings, not coffee shops or co-working.
5. **Diverse and natural** — Real people of diverse backgrounds, naturally represented.

---

## 2. Photography Direction

### Lighting

| Do                                      | Don't                                  |
|-----------------------------------------|----------------------------------------|
| Natural warm tones, golden hour feel    | Cold blue or clinical fluorescent      |
| Soft diffused natural light             | Harsh direct flash                     |
| Slight cream/amber color grading        | Cool/neutral color grading             |
| Window light in clinical settings       | Dark, moody, dramatic lighting         |

### Subjects

| Do                                      | Don't                                  |
|-----------------------------------------|----------------------------------------|
| Healthcare professionals with patients  | Generic business people                |
| Real clinical settings and equipment    | Abstract or out-of-context settings    |
| Team collaboration (doctor-patient)     | Isolated headshots in circles          |
| Mid-action, mid-conversation moments    | Posed, staring-at-camera shots         |
| Modern equipment shown in context       | Floating devices on blank backgrounds  |
| Natural expressions, confident smiles   | Frozen fake smiles                     |

### Settings

**Good settings**: Treatment rooms, consultation rooms, reception areas, modern
clinics, dental operatories, patient waiting areas, team huddle rooms.

**Bad settings**: Generic offices, glass tower lobbies, coffee shops, co-working
spaces, abstract backgrounds, pure white studios.

### Color Temperature

- Target: Warm (5500-6500K equivalent)
- Grading: Slight amber/cream cast
- Shadows: Warm, not blue
- Highlights: Soft, not blown out

---

## 3. Product Screenshots

### Treatment

- Inside rounded containers (`rounded-2xl lg:rounded-[32px]`)
- `ring-1 ring-black/10` frame
- `shadow-xl` elevation
- Full-bleed within container (no internal padding)
- Slightly zoomed/cropped to highlight key features

### What to Show

- Dashboard views with real data
- Chat interfaces with conversations
- Booking flows with appointment details
- CRM pipelines with patient stages
- Analytics charts and metrics

### Background for Screenshot Sections

```css
bg-gradient-to-br from-[#f8f9f4] to-[#f0f2ec]
```

---

## 3.1 Product Feature Illustration Style (CRITICAL)

> **This section overrides generic photography direction for product feature images.**
> Feature images on the website must look like polished product UI mockups — NOT
> stock photography, NOT generic healthcare photos.

### The Problem
AI-generated images with oversized text look unpolished and clunky. When showing
product features (inbox, booking, AI agents, campaigns, analytics), the images must
feel like real software screenshots with properly proportioned UI elements.

### Reference Style Characteristics

1. **Text Proportioning** — The single most important rule:
   - Body text in UI mockups: equivalent to 12-14px (tiny, clean, readable)
   - Heading text: equivalent to 16-20px (modest, not dominating)
   - Labels/badges: equivalent to 10-12px (small, subtle)
   - NEVER have text that dominates or overwhelms the image
   - Text should be one element among many, not the focal point

2. **Clean UI Mockup Aesthetic**:
   - Modern SaaS interface design (think Linear, Notion, Vercel dashboard)
   - Proper whitespace between elements
   - Subtle borders and separators (1px, light gray)
   - Clean grid-based layouts with consistent spacing
   - Sidebar + main content area pattern where appropriate
   - Small, clean status badges and pills

3. **UI Element Hierarchy**:
   - Navigation/sidebar: dark (#1c1c1c) or light with subtle borders
   - Content cards: white with subtle border/shadow
   - Action buttons: Zavis Green (#006828) — small, not oversized
   - Status indicators: small colored dots or pills
   - Metrics: clean numbers with small labels below

4. **Color Usage in UI Mockups**:
   - Primary background: off-white (#f8f8f6) or white (#ffffff)
   - Dark sidebar/nav: off-black (#1c1c1c)
   - Accent: Zavis Green (#006828) for active states, CTAs, success
   - Muted text: black/50 for secondary information
   - Borders: black/5 to black/10
   - NO bright accent colors, NO gradients on UI elements

5. **Composition for Feature Images**:
   - Show the actual software interface as if it's a real screenshot
   - Include realistic data (patient names, appointment times, metrics)
   - Multiple UI panels visible to show depth of the product
   - Subtle depth: clean cards floating on light backgrounds
   - Device context optional: can be bare UI or inside a browser/phone frame

6. **Context-Aware Image Selection** — Not every image is the same:

   | Image Use Case          | Style                                              |
   |-------------------------|-----------------------------------------------------|
   | Hero platform graphic   | Composite overview — multiple UI panels, polished    |
   | Dashboard preview       | Full dashboard screenshot, wide format, data-rich    |
   | Feature tab image       | Focused product UI for specific feature              |
   | Timeline step image     | Compact UI preview, less detail, clear focal point   |
   | Specialty hero          | Photography — warm, clinical setting, real people     |
   | About page hero         | Photography — team/office, warm and candid            |

### Anti-Patterns (NEVER do these in product feature images)

- Oversized text that dominates the image
- Chunky, thick UI elements
- Generic stock photography where a product UI should be
- Bright/neon accent colors
- 3D effects, glossy surfaces, glass morphism
- Floating UI elements with no container/structure
- Blurry or low-detail UI rendering
- Inconsistent font sizes within the mockup

---

## 4. AI Image Generation

### Model Selection

| Model | ID | Use For |
|-------|-----|---------|
| Nano Banana 2 (DEFAULT) | `gemini-3.1-flash-image-preview` | All use cases. Best balance of speed and quality. |
| Nano Banana Pro | `gemini-3-pro-image-preview` | Alternative for complex scenes requiring extra detail. |
| Nano Banana Flash (legacy) | `gemini-2.5-flash-image` | Quick drafts only. Lower quality. |

### Preferred Image Style: Blended Photography + UI Overlay

The current creative direction for Zavis feature images is **blended real photography with contextual UI overlays**. This means:

- **Base layer:** Real photography of people in warm healthcare settings (not pure stock, not pure AI dashboards)
- **Overlay layer:** Contextual UI elements woven into the scene (chat bubbles, booking confirmations, notification badges, analytics cards)
- **Purpose:** Show specific Zavis features in action within real-world healthcare contexts
- **Not:** Pure dashboard screenshots (too abstract) or pure stock photography (no product connection)

**Important limitation:** AI image generation (Gemini) cannot reliably produce precise UI composites with clean readable text. For images requiring exact UI elements, create them programmatically or in Figma and composite manually. Use AI generation for the photography base and simple visual compositions only.

### Prompt Engineering — The Zavis Way

Every AI generation prompt MUST include these elements:

#### 1. Scene Description (narrative, not keywords)
Describe what the viewer sees as if narrating a photograph.

Bad: "doctor patient clinic modern"
Good: "A dental hygienist in light blue scrubs reviewing a treatment plan on a tablet with a patient seated in a modern dental chair, both engaged in conversation"

#### 2. Zavis Color Grounding
Explicitly mention the warm color palette:

"warm natural lighting with soft amber undertones, cream and off-white tones dominant, professional healthcare environment with warm wood and neutral surfaces"

#### 3. Photography Direction
"professional and approachable healthcare setting, candid moment captured mid-conversation, natural expressions, not posed or staring at camera"

#### 4. Lighting Specification
"soft diffused natural light from large windows, golden hour warmth, no harsh shadows, no clinical fluorescent lighting"

#### 5. Composition Guidance
Specify negative space, framing, and context:

"composed with negative space on the left third for headline text overlay, subject positioned in the right two-thirds, medium distance framing"

#### 6. Text Rendering (CRITICAL — size matters)
For product UI mockups: "all text within the interface must be small and properly
proportioned — body text at 12-14px equivalent, headings at 16-20px equivalent,
labels at 10-12px equivalent. Text should never dominate the image. The UI should
feel like a real software screenshot with clean, modest typography."

For standalone text: "display the text '[EXACT TEXT]' in clean geometric sans-serif
lettering, white on dark surface, centered and clearly readable"

### Prompt Template

```
[SCENE]: {Narrative description of the scene}

[STYLE]: Professional, warm, approachable healthcare photography. Natural warm
color grading with soft amber/cream undertones. Soft diffused natural lighting,
golden hour feel. No cool blue tones, no clinical fluorescent, no stock-photo
aesthetic.

[SUBJECTS]: {Description of people — natural expressions, mid-action,
diverse representation, appropriate attire for setting}

[SETTING]: {Specific healthcare environment — modern, well-equipped,
real clinical context}

[COMPOSITION]: {Framing, negative space, aspect ratio considerations}

[AVOID]: Posed stiff expressions, staring at camera, cool/blue color grading,
dark moody lighting, overly smooth AI skin, generic stock photo aesthetic,
neon colors, floating devices without context.
```

### Aspect Ratios by Usage

| Context              | Ratio    | Notes                                     |
|----------------------|----------|-------------------------------------------|
| Website hero banner  | 16:9     | Negative space on left for headline        |
| Feature card image   | 3:2      | Right column, 55% width                   |
| Feature zigzag image | 16:10    | Alternating sides                          |
| Timeline step image  | 4:3      | Right-aligned, ~50% row width             |
| Product screenshot   | 4:3      | Inside rounded container                   |
| Instagram feed       | 1:1, 4:5 | Brand green accent, cream background       |
| Instagram story      | 9:16     | Full-screen, text safe zones               |
| LinkedIn post        | 1:1, 4:5 | Professional, minimal text                 |
| LinkedIn ad          | 4:5      | CTA area at bottom                         |
| Twitter/X post       | 16:9     | Horizontal, attention-grabbing             |
| Facebook ad          | 4:5      | Text overlay < 20%                         |
| Email header         | 3:1      | Must work at small sizes                   |
| Pitch deck slide     | 16:9     | High contrast for projectors               |
| Video thumbnail      | 16:9     | Large text, face close-up if applicable    |

### Resolution Guide

| Size | Dimensions       | Use Case                          |
|------|-----------------|-----------------------------------|
| 1K   | ~1024px long edge| Icons, thumbnails, rapid iteration|
| 2K   | ~2048px long edge| Standard web, social media        |
| 4K   | ~4096px long edge| Hero images, print, screenshots   |

---

## 5. Specialty-Specific Visual Direction

### Dental (Primary)
- Subjects: Dentists, hygienists, patients in dental chairs
- Settings: Modern operatories, reception areas, consultation rooms
- Equipment: Dental chairs, monitors with dental software, intraoral cameras
- Mood: Clean, bright, calming — "going to the dentist doesn't have to be scary"
- Colors: Warm cream walls, natural wood accents, soft sage/green touches

### Dermatology
- Subjects: Dermatologists, patients in consultation, skincare environments
- Settings: Clean aesthetic clinics, consultation rooms with good lighting
- Mood: Premium, refined, care-focused
- Colors: Light neutrals, touches of rose gold, warm whites

### Optometry
- Subjects: Optometrists, patients during eye exams, frame selection
- Settings: Modern eye clinics, optical shops with frame displays
- Mood: Clear, precise, design-forward
- Colors: Warm neutrals, subtle lens reflections for visual interest

### Orthopedics
- Subjects: Orthopedic surgeons, patients in rehab/consultation, physical therapy
- Settings: Orthopedic clinics, rehab facilities, consultation rooms
- Mood: Strong, reliable, supportive of recovery journey
- Colors: Warm neutrals, earthy tones, active/dynamic compositions

### ENT
- Subjects: ENT specialists, patients in examination
- Settings: ENT consultation rooms, examination areas
- Mood: Thorough, attentive, specialized care
- Colors: Warm clinical whites, natural wood accents

### Urgent Care
- Subjects: Urgent care staff, patients being seen quickly
- Settings: Clean, efficient urgent care facilities
- Mood: Responsive, efficient, reassuring
- Colors: Warm whites, efficient-looking but not cold

### Mental Health
- Subjects: Therapists, counselors, calm settings (no patient faces — privacy)
- Settings: Comfortable therapy offices, calming environments
- Mood: Empathetic, safe, serene
- Colors: Warm earth tones, soft greens, natural textures

### Veterinary
- Subjects: Veterinarians, pets with their owners, clinic settings
- Settings: Modern vet clinics, examination rooms, waiting areas with pets
- Mood: Caring, family-oriented, warm
- Colors: Warm neutrals, natural greens, pet-friendly atmosphere

### Homecare
- **Setting:** Warm, comfortable homes. Living rooms, bedrooms with medical equipment blended naturally.
- **Subjects:** Caregivers with elderly patients, family members present. Gentle, dignified interactions.
- **Lighting:** Soft natural light through windows, warm lamp light. Cozy, not clinical.
- **Mood:** Compassionate, safe, dignified. The patient is comfortable and cared for.

### Aesthetic
- **Setting:** Premium clinic interiors. Clean, modern treatment rooms with high-end equipment.
- **Subjects:** Confident patients, skilled practitioners. Pre/post consultation moments.
- **Lighting:** Bright, even, flattering. Studio-quality lighting that conveys precision.
- **Mood:** Premium, aspirational, confident. Results-focused without being clinical.

### Longevity & Wellness
- **Setting:** Modern wellness centers, bright consultation rooms, outdoor wellness activities.
- **Subjects:** Active, health-conscious patients across age groups. Preventive care moments.
- **Lighting:** Natural, bright, energizing. Golden hour for outdoor scenes.
- **Mood:** Proactive, optimistic, holistic. Health as a journey, not just treatment.

---

## 6. Critical Avoidances (Hard Rules)

These will ALWAYS fail QA:

1. **Cold/blue color grading** — Must be warm throughout
2. **Staring-at-camera poses** — Must be candid/mid-action
3. **Neon or vibrant accent colors** — Only Zavis Green #006828 as accent
4. **Generic stock-photo energy** — Diverse group in V-formation smiling
5. **Floating technology** — Devices must have context (hands, desks, settings)
6. **"AI look"** — Overly smooth skin, symmetrical faces, plastic surfaces
7. **Cool/purple tones** — Even in shadows, keep warm
8. **Clinical fluorescent lighting** — Always warm, natural light
9. **Empty/abstract backgrounds** — Real environments with context
10. **Text errors** — Every character must be correct if text is rendered
11. **Never use emojis** in any generated image, caption, description, or associated text. Use icons or descriptive text.
12. **Never use spaces in filenames.** Always use kebab-case (e.g., `dental-hero.png`, not `Dental Hero.png`). Spaces break web paths.
13. **Never use hand-drawn SVG logo approximations.** Always source real brand logos from Figma exports, react-icons, or provided asset files.

### Counter-Prompts for Common Failures

| Problem                | Counter-Prompt Addition                                       |
|------------------------|--------------------------------------------------------------|
| AI-smooth skin         | "natural skin texture, slight asymmetry, realistic surfaces"  |
| Cool color temperature | "warm color grading, amber undertones, golden natural light"  |
| Stock photo energy     | "candid moment, mid-conversation, natural body language"      |
| Floating technology    | "device held by person / resting on desk in real environment" |
| Generic healthcare     | Describe specific environmental details from specialty guide  |

---

## 7. QA Pass Criteria

### Four Dimensions (Weighted)

| Dimension          | Weight | Measures                                     |
|--------------------|--------|----------------------------------------------|
| Text Legibility    | 35%    | Correct spelling, readable, properly styled   |
| Brand Consistency  | 30%    | Colors match, warm tone, professional feel     |
| Visual Quality     | 20%    | Sharp, well-composed, artifact-free            |
| Contextual Fit     | 15%    | Right composition for container, proper mood   |

### Pass Threshold: 3.5 composite score

### Hard Fail Conditions (automatic fail)

- Text is misspelled or illegible
- Colors clearly outside Zavis palette
- Visible artifacts at display size
- Wrong aspect ratio for delivery context

### Scoring Scale (per dimension)

- 5: Exceptional — exceeds expectations
- 4: Good — meets all requirements
- 3: Acceptable — minor issues, usable
- 2: Below standard — noticeable problems
- 1: Failing — unusable

### Retry Protocol

- If score < 3.5 or hard fail: revise prompt, regenerate, re-QA
- Max 3 retries per request
- After 3 fails: show best attempt with honest score, ask for different approach
