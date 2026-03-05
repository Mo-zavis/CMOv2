# Zavis Multi-Format Specifications

> Dimensions, constraints, and adaptations for every output medium.
> Use this when producing assets for video, social media, ads, email,
> print, presentations, or any non-website format.

---

## 1. Website Assets

### Page Sections

| Section              | Container Width | Image Aspect | Image Treatment                    |
|----------------------|----------------|--------------|------------------------------------|
| Split hero           | 1400px         | 4:3          | rounded-[32px], ring, shadow-xl    |
| Centered hero image  | 1000px         | 16:9         | rounded-[32px], ring, shadow-xl    |
| Feature zigzag       | 1200px         | 16:10        | rounded-2xl, ring, shadow-lg       |
| Timeline step        | 1200px         | 16:10        | rounded-2xl lg:rounded-[32px]      |
| Tab content image    | 50% of card    | auto         | object-cover, light gradient bg    |
| Dashboard preview    | 1000px         | auto         | rounded-2xl, shadow-2xl            |
| Icon                 | 40-44px box    | 1:1          | rounded-xl, gradient bg            |
| Logo ticker          | auto           | auto         | h-8, opacity-40, grayscale         |

### Favicon / App Icon

| Format   | Size     | Notes                              |
|----------|----------|------------------------------------|
| Favicon  | 32x32    | Zavis "Z" mark or logomark         |
| Apple    | 180x180  | Touch icon, #f8f8f6 bg             |
| OG Image | 1200x630 | Off-White bg, centered branding    |

---

## 2. Social Media Graphics

### Instagram

| Format   | Dimensions  | Aspect | Zavis Adaptation                             |
|----------|-------------|--------|----------------------------------------------|
| Feed     | 1080x1080   | 1:1    | Off-White bg, Bricolage heading centered     |
| Feed     | 1080x1350   | 4:5    | More vertical space for copy                  |
| Story    | 1080x1920   | 9:16   | Full-screen, safe zones for text              |
| Reel     | 1080x1920   | 9:16   | Same as story, video-optimized                |
| Carousel | 1080x1080   | 1:1    | Consistent style across slides                |

**Instagram Layout Rules**:
- Background: Off-White `#f8f8f6` or subtle warm gradient
- Headline: Bricolage Grotesque, `#1c1c1c`, centered or left-aligned
- Body: Geist, `black/50`, 1-2 lines max
- Accent: Green `#006828` on key word or pill badge
- Image/screenshot: Rounded corners (24-32px equivalent), subtle shadow
- CTA overlay: Black rounded pill at bottom if applicable
- Safe zone: 100px from all edges for text

### LinkedIn

| Format   | Dimensions  | Aspect | Notes                                        |
|----------|-------------|--------|----------------------------------------------|
| Post     | 1200x1200   | 1:1    | Professional, data-forward                    |
| Post     | 1200x1500   | 4:5    | Extended for more content                     |
| Article  | 1200x627    | ~2:1   | Clean header, minimal text                    |
| Company  | 1128x191    | ~6:1   | Banner with logo + tagline                    |

**LinkedIn Layout Rules**:
- More whitespace than Instagram
- Metric or stat as visual anchor
- Bricolage heading, 36-48px equivalent
- Professional photography if used
- Subtle green accent, restrained

### Twitter/X

| Format   | Dimensions  | Aspect | Notes                                        |
|----------|-------------|--------|----------------------------------------------|
| Post     | 1200x675    | 16:9   | Horizontal, attention-grabbing                |
| Header   | 1500x500    | 3:1    | Profile banner                                |

**Twitter Layout Rules**:
- Bold headline, minimal copy
- High contrast for small display
- One clear visual focus point

### Facebook

| Format   | Dimensions  | Aspect | Notes                                        |
|----------|-------------|--------|----------------------------------------------|
| Post     | 1200x1200   | 1:1    | Same as Instagram feed                        |
| Ad       | 1080x1350   | 4:5    | Text overlay < 20% of image area             |
| Cover    | 820x312     | ~2.6:1 | Desktop banner                                |

### TikTok

| Format   | Dimensions  | Aspect | Notes                                        |
|----------|-------------|--------|----------------------------------------------|
| Video    | 1080x1920   | 9:16   | Vertical full-screen                          |
| Thumbnail| 1080x1920   | 9:16   | Large text, face close-up if applicable       |

---

## 3. Video Assets

### Title Cards / Intro Slides

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Background       | Off-White `#f8f8f6` or dark gradient                |
| Headline font    | Bricolage Grotesque, 48-72px equivalent             |
| Subtitle font    | Geist, 24-32px equivalent                           |
| Logo             | Zavis logomark, top-left or centered                |
| Accent           | Green `#006828` on 1-2 key words                    |
| Duration         | 2-3 seconds                                         |
| Transition       | Fade in (0.3s) or slide up from bottom              |

### Lower Thirds

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Bar              | Semi-transparent Off-White (90% opacity)            |
| Height           | 80-100px                                            |
| Name font        | Bricolage Grotesque, 20px, `#1c1c1c`               |
| Title font       | Geist, 14px, `black/50`                             |
| Green accent     | 3px left border or small pill                       |
| Position         | Bottom-left, 40px from edge                         |
| Corner radius    | 12px (rounded-xl equivalent)                        |
| Animation        | Slide in from left, 0.4s ease                       |

### End Screens

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Background       | Dark gradient `#1c1c1c` → `#2a2a2a`                |
| Headline         | Bricolage Grotesque, white, 40-56px                 |
| CTA text         | Geist, white, 20-28px                               |
| CTA button       | White rounded pill, black text                       |
| Logo             | White Zavis logo, centered or bottom-right           |
| Duration         | 5-8 seconds                                         |
| Green accent     | On 1-2 words in headline                            |

### Thumbnail Design

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Background       | Off-White or contextual photo                       |
| Headline         | Bricolage Grotesque, bold, 3-5 words max            |
| Text shadow      | Subtle dark shadow for readability on photos        |
| Face             | If applicable, clear face in left or right third    |
| Green accent     | Pill badge or highlighted word                      |
| Resolution       | 1280x720 minimum                                    |

### Motion Principles for Video

| Type             | Spec                                                |
|------------------|-----------------------------------------------------|
| Fade             | 0.3s ease-out                                       |
| Slide            | 0.4s with spring curve [0.25, 0.1, 0.25, 1]        |
| Scale            | 0.3s from 95% to 100%                              |
| Stagger          | 0.1s delay between sequential elements              |
| Text reveal      | Character-by-character or word-by-word, 0.05s each  |
| Screen capture   | Smooth 60fps, highlight cursor/clicks               |

### Video Color Grading

| Setting          | Value                                               |
|------------------|-----------------------------------------------------|
| Temperature      | Warm (+10-15 from neutral)                          |
| Tint             | Slight amber/cream shift                            |
| Contrast         | Medium (not flat, not harsh)                         |
| Saturation       | Slightly desaturated (-5 to -10)                    |
| Blacks           | Lifted slightly (not crushed)                       |
| Highlights       | Warm cream tone, not blown                          |

---

## 4. Targeted Ad Creatives

### Google Display Ads

| Size       | Dimensions  | Layout Notes                                  |
|------------|-------------|-----------------------------------------------|
| Leaderboard| 728x90      | Logo left, headline center, CTA right         |
| Rectangle  | 300x250     | Stacked: image top, copy + CTA bottom         |
| Skyscraper | 160x600     | Vertical stack: logo, image, copy, CTA        |
| Large rect | 336x280     | Same as rectangle, more breathing room        |
| Billboard  | 970x250     | Horizontal: image left, copy + CTA right      |
| Mobile     | 320x50      | Logo + short headline + CTA                   |
| Mobile lg  | 320x100     | Logo + headline + short desc + CTA            |

**Ad Layout Rules**:
- Background: Off-White `#f8f8f6`
- Headline: Bricolage Grotesque, `#1c1c1c`, 1 line
- CTA: Black pill with white text "Book a Demo"
- Green accent: On one metric or keyword
- Border: 1px `rgba(0,0,0,0.06)` — consistent with cards
- Logo: Zavis mark, small, corner or top-left

### Meta (Facebook/Instagram) Ads

| Format     | Ratio  | Notes                                          |
|------------|--------|-------------------------------------------------|
| Feed image | 4:5    | Most effective, text < 20%                      |
| Story      | 9:16   | Full-screen, swipe-up CTA area at bottom        |
| Carousel   | 1:1    | Consistent style per card                       |
| Collection | 4:5    | Hero image + product grid below                 |

**Meta Ad Structure**:
1. **Hook** (top 20%): Bold stat or pain point in Bricolage
2. **Visual** (middle 50%): Healthcare photography or screenshot
3. **Proof** (20%): Metric badge or social proof
4. **CTA** (bottom 10%): Black pill button

### LinkedIn Ads

| Format        | Dimensions  | Notes                                   |
|---------------|-------------|------------------------------------------|
| Single image  | 1200x627    | Professional, metric-led                  |
| Carousel      | 1080x1080   | Data/insight per card                    |
| Video         | 16:9        | Professional production quality           |

**LinkedIn Ad Rules**:
- More restrained than Meta
- Lead with industry metric or insight
- Screenshot of platform if applicable
- Professional photography only
- Headline: Direct benefit, no hype

### Snapchat / TikTok Ads

| Format     | Ratio  | Notes                                          |
|------------|--------|-------------------------------------------------|
| Full screen| 9:16   | 1080x1920, mobile-native feel                   |
| 6-second   | 9:16   | Ultra-short, one message                         |

**Rules**: More dynamic, faster cuts, but same warm color palette.

---

## 5. Email Templates

### Dimensions & Layout

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Max width        | 600px                                               |
| Background       | Off-White `#f8f8f6`                                 |
| Content bg       | White `#ffffff`                                     |
| Padding          | 24px horizontal, 32px vertical                       |
| Border           | 1px `rgba(0,0,0,0.06)` on content card             |
| Corner radius    | 16px on content card                                |

### Header

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Height           | 60-80px                                             |
| Logo             | Zavis logo, centered or left-aligned                |
| Accent           | 2px green `#006828` line below header               |
| Background       | Off-White `#f8f8f6`                                 |

### Body

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Headline         | Bricolage Grotesque, 24-28px, `#1c1c1c`            |
| Body text        | Geist, 16px, `#1c1c1c` at 60% opacity              |
| Line height      | 1.6                                                 |
| Max paragraphs   | 3 short paragraphs                                  |
| Links            | `#006828`, underlined                               |

### CTA Button

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Background       | Black `#000000`                                     |
| Text             | White, Geist medium, 16px                           |
| Padding          | 14px × 32px                                        |
| Border radius    | 999px (rounded-full)                                |
| Alignment        | Centered                                            |

### Footer

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Text             | Geist, 12px, `black/40`                            |
| Links            | `#006828`, unsubscribe required                     |
| Alignment        | Centered                                            |

### Email Header Image

| Aspect           | 3:1 (cropped from 3:2)                              |
| Width            | 600px (full content width)                           |
| Treatment        | Rounded top corners (16px), no bottom radius         |

---

## 6. Presentation / Pitch Deck

### Slide Dimensions

| Format     | Dimensions  | Notes                                    |
|------------|-------------|-------------------------------------------|
| Standard   | 1920x1080   | 16:9, default for all presentations       |
| Print      | 1920x1440   | 4:3, for printed handouts                 |

### Slide Types

#### Title Slide
- Background: Off-White `#f8f8f6`
- Company logo: Top-left or centered
- Title: Bricolage Grotesque, 56-72px, `#1c1c1c`
- Subtitle: Geist, 24px, `black/50`
- Green accent: On 1 key word
- Visual: Optional healthcare photo, bottom-right corner

#### Content Slide
- Background: Off-White `#f8f8f6`
- Title: Bricolage Grotesque, 36-44px, `#1c1c1c`
- Body: Geist, 18-22px, `black/60`
- Bullets: Green `#006828` dots or check icons
- Image: Right-aligned, rounded-2xl treatment

#### Data Slide
- Background: White or Off-White
- Chart colors: Zavis Green (primary), `black/20` (secondary), `black/10` (tertiary)
- Labels: Geist, 14-16px, `black/50`
- Values: Bricolage Grotesque, 32-44px, `#006828`

#### Quote / Testimonial Slide
- Background: Off-White
- Quote: Geist italic, 24-28px, `#1c1c1c`
- Attribution: Geist, 16px, `black/50`
- Green accent: Opening quotation mark in `#006828`

#### Dark Accent Slide
- Background: Dark gradient `#1c1c1c` → `#2a2a2a`
- Title: Bricolage Grotesque, 44-56px, white
- Body: Geist, 20px, `white/60`
- Green accent: On key words

#### Closing Slide
- Same as dark accent
- CTA prominent: "Book a Demo" in white pill
- Contact info: Geist, 16px, `white/50`

### Presentation Transitions
- Slide transition: Fade, 0.3s
- Element animation: Appear from bottom, 0.2s stagger
- No spinning, bouncing, or flashy transitions

---

## 7. Print Materials

### Business Card

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Size             | 3.5" x 2" (standard)                               |
| Background       | Off-White `#f8f8f6` (front), Black (back)           |
| Name             | Bricolage Grotesque, 12pt, `#1c1c1c`               |
| Title            | Geist, 9pt, `black/50`                              |
| Contact          | Geist, 8pt, `black/60`                              |
| Logo             | Zavis logomark + wordmark                           |
| Green accent     | Thin 1pt line or small logomark detail              |
| CMYK conversion  | Green: C90 M0 Y100 K50, Off-White: C2 M2 Y3 K1    |

### Brochure / Flyer

| Element          | Spec                                                |
|------------------|-----------------------------------------------------|
| Page bg          | Off-White `#f8f8f6`                                 |
| Headline         | Bricolage Grotesque, 28-36pt                        |
| Body             | Geist, 10-12pt, 1.5 line height                    |
| Margins          | 0.5" minimum                                        |
| Images           | CMYK, 300dpi minimum                                |
| CTA              | Black rounded rectangle with white text              |

### CMYK Color Conversions

| Color        | Hex       | CMYK (approximate)        |
|-------------|-----------|---------------------------|
| Off-White   | `#f8f8f6` | C2 M2 Y3 K1              |
| Off-Black   | `#1c1c1c` | C0 M0 Y0 K89             |
| Zavis Green | `#006828` | C90 M0 Y100 K50          |
| White       | `#ffffff` | C0 M0 Y0 K0              |
| True Black  | `#000000` | C0 M0 Y0 K100            |

---

## 8. Universal Spacing Grid

All formats use a **4px base grid** scaled to the medium:

| Medium        | Base Unit | Common Multiples            |
|---------------|-----------|------------------------------|
| Website       | 4px       | 8, 12, 16, 24, 32, 48, 64  |
| Social media  | 4px       | 16, 24, 32, 48 (scaled)    |
| Video (1080p) | 4px       | 20, 32, 48, 80             |
| Email         | 4px       | 8, 16, 24, 32              |
| Presentation  | 8px       | 16, 24, 32, 48, 64, 80     |
| Print         | 1mm       | 3mm, 5mm, 8mm, 12mm, 20mm  |

---

## 9. File Naming Convention

```
zavis-{medium}-{description}-{dimensions}-{version}.{ext}

Examples:
zavis-ig-post-ai-agents-1080x1350-v1.png
zavis-hero-dental-page-1920x1080-v2.png
zavis-linkedin-ad-crm-1200x627-v1.png
zavis-email-header-booking-confirmation-600x200-v1.png
zavis-deck-slide-title-1920x1080-v1.png
zavis-video-endscreen-demo-cta-1920x1080-v1.png
```

---

## 10. Export Settings

### Web (PNG/WebP)
- Format: PNG for transparency, WebP for photos
- Quality: 90% (WebP), lossless (PNG)
- Color space: sRGB
- Max file size: 500KB for page images, 200KB for thumbnails

### Social Media (PNG/JPG)
- Format: PNG for graphics, JPG for photos
- Quality: 95% (JPG)
- Color space: sRGB
- Resolution: Platform-specific (see dimensions above)

### Video (MP4)
- Codec: H.264 or H.265
- Resolution: 1920x1080 (16:9) or 1080x1920 (9:16)
- Frame rate: 30fps (standard), 60fps (screen recording)
- Bitrate: 8-12 Mbps

### Print (PDF/TIFF)
- Color space: CMYK
- Resolution: 300dpi minimum
- Bleed: 3mm / 0.125"
- Format: PDF/X-4 for commercial print
