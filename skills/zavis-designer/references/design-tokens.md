# Zavis Design Tokens — Complete Reference

> Every color, font, spacing value, shadow, radius, gradient, and animation
> used across the Zavis design system.

---

## 1. Color System

### Core Brand Palette

| Token           | Hex       | RGB              | Usage                                    |
|-----------------|-----------|------------------|------------------------------------------|
| `off-white`     | `#f8f8f6` | 248, 248, 246    | Page background — neutral warm           |
| `off-black`     | `#1c1c1c` | 28, 28, 28       | Primary headings, card titles            |
| `true-black`    | `#000000` | 0, 0, 0          | Logo, buttons, strong UI elements        |
| `white`         | `#ffffff` | 255, 255, 255    | Card surfaces, text on dark, buttons     |
| `zavis-green`   | `#006828` | 0, 104, 40       | Brand accent — badges, links, focus      |

### Extended Palette

| Token              | Hex       | Usage                                      |
|--------------------|-----------|--------------------------------------------|
| `dark-green`       | `#004d1c` | Dark green variant (hover/active states)    |
| `bright-green`     | `#20bd5a` | Success indicators, positive states         |
| `primary-dark`     | `#030213` | Theme primary (CSS variable fallback)       |
| `near-black`       | `#010101` | Ultra-dark surfaces                         |
| `dark-surface`     | `#111`    | Dark section backgrounds                    |
| `dark-surface-alt` | `#2a2a2a` | Dark CTA card gradient end                  |
| `warm-gray`        | `#ecebe8` | Content containers, section wraps           |
| `near-white-warm`  | `#fdfef8` | Screenshot panels in feature cards          |
| `light-section-a`  | `#f8f9f4` | Light section gradient start                |
| `light-section-b`  | `#f0f2ec` | Light section gradient end                  |
| `input-bg`         | `#f3f3f5` | Form input backgrounds                      |
| `muted-bg`         | `#ececf0` | Muted background surfaces                   |
| `switch-bg`        | `#cbced4` | Toggle switch background                    |
| `light-accent`     | `#e9ebef` | Accent surfaces                             |
| `destructive`      | `#d4183d` | Error states, destructive actions            |
| `orange-red`       | `#ff4000` | Warning/alert accents                        |

### Social Media Brand Colors (for integrations display only)

| Platform   | Hex       |
|------------|-----------|
| Facebook   | `#1877F2` |
| WhatsApp   | `#25D366` |
| Instagram  | `#E4405F` |
| LinkedIn   | `#0A66C2` |
| Snapchat   | `#FFFC00` |

### Text Opacity Hierarchy

Text is **always black at varying opacity** — never named grays. This preserves
the warm undertone of the background.

| Level      | Value             | CSS (Tailwind)    | Usage                           |
|------------|-------------------|-------------------|---------------------------------|
| Display    | `#1c1c1c`        | `text-[#1c1c1c]` | Page titles, hero headings      |
| Primary    | `black/70`        | `text-black/70`   | Main content paragraphs         |
| Secondary  | `black/50`        | `text-black/50`   | Descriptions, subtitles         |
| Tertiary   | `black/45`        | `text-black/45`   | Supporting text, card bodies    |
| Muted      | `black/40`        | `text-black/40`   | Labels, meta text               |
| Faint      | `black/30`        | `text-black/30`   | Section labels, inactive states |

### Green Opacity Scale (for backgrounds/borders)

| Usage               | Value                    | Tailwind                        |
|---------------------|--------------------------|---------------------------------|
| Badge background    | `#006828` at 8%          | `bg-[#006828]/[0.08]`           |
| Icon box gradient   | `#006828` at 10% → 5%   | `from-[#006828]/10 to-[#006828]/5` |
| Subtle section tint | `#006828` at 4%          | `bg-[#006828]/[0.04]`           |
| Hover border        | `#006828` at 15%         | `border-[#006828]/15`           |
| Hover border light  | `#006828` at 20%         | `border-[#006828]/20`           |
| Focus ring          | `#006828` at 20%         | `ring-[#006828]/20`             |
| Focus border        | `#006828` at 40%         | `border-[#006828]/40`           |

### Border & Divider Colors

| Usage                | Tailwind                    |
|----------------------|-----------------------------|
| Card border          | `border-black/[0.06]`       |
| Subtle divider       | `border-b border-black/5`   |
| Image frame          | `ring-1 ring-black/10`      |
| Dark theme divider   | `border-white/10`           |
| Dark theme frame     | `ring-1 ring-white/10`      |
| Navbar bottom        | `border-b border-black/5`   |

### CSS Custom Properties

```css
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}
```

---

## 2. Typography

### Font Families

```css
/* Headings / Display */
font-family: 'Bricolage Grotesque', sans-serif;

/* Body / UI / Data */
font-family: 'Geist', sans-serif;
```

### Font Imports

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
/* CSS @import */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap');
```

### Font Weight Scale

| Token    | Value | Tailwind        | Usage                          |
|----------|-------|-----------------|--------------------------------|
| Normal   | 400   | `font-normal`   | Body text (rare)               |
| Medium   | 500   | `font-medium`   | Most text — headings and body  |
| Semibold | 600   | `font-semibold`  | Emphasis, tab labels, bold body|

### Heading Scale

| Level     | Font             | Size (mobile → desktop)            | Weight | Line Height | Tracking          | Color         |
|-----------|------------------|------------------------------------|--------|-------------|-------------------|---------------|
| Page H1   | Bricolage        | 32px → 44px → 58px                | medium | 1.05        | -0.04em           | `#1c1c1c`     |
| Section H2| Bricolage        | 24px → 32px → 44px                | medium | 1.1         | tight             | `#1c1c1c`     |
| Feature H3| Bricolage        | 22px → 26px → 32px                | medium | tight       | tight             | `#1c1c1c`     |
| Card H3   | Bricolage        | lg (18px) → xl (20px)             | medium | tight       | tight             | `#1c1c1c`     |
| Label     | Bricolage/Geist  | xs (12px)                         | medium | —           | widest / wider    | `black/40`    |

### Tailwind Heading Classes

```
H1: font-['Bricolage_Grotesque',sans-serif] font-medium text-[32px] sm:text-[44px] lg:text-[58px] leading-[1.05] text-[#1c1c1c] tracking-[-0.04em]

H2: font-['Bricolage_Grotesque',sans-serif] font-medium text-[24px] sm:text-[32px] lg:text-[44px] leading-[1.1] text-[#1c1c1c] tracking-tight

H3 (feature): font-['Bricolage_Grotesque',sans-serif] font-medium text-[22px] sm:text-[26px] lg:text-[32px] leading-tight tracking-tight

H3 (card): font-['Bricolage_Grotesque',sans-serif] font-medium text-lg sm:text-xl tracking-tight
```

### Body Text Scale

| Role          | Font  | Size       | Weight | Color         | Line Height | Tailwind                                            |
|---------------|-------|------------|--------|---------------|-------------|-----------------------------------------------------|
| Large body    | Geist | 14px→16px  | medium | black/50      | relaxed     | `text-sm sm:text-base text-black/50 leading-relaxed`|
| Standard body | Geist | 14px       | medium | black/50      | relaxed     | `text-sm text-black/50 leading-relaxed`             |
| Small body    | Geist | 13px       | medium | black/45      | relaxed     | `text-[13px] text-black/45 leading-relaxed`         |
| Caption       | Geist | 12px       | medium | black/30-40   | normal      | `text-xs text-black/40`                             |
| Uppercase     | Geist | 12px       | medium | black/40      | normal      | `uppercase text-xs tracking-widest font-medium`     |

### Special Text Treatments

- **Green accent span**: `<span className="text-[#006828]">highlighted text</span>`
- **Tab labels**: UPPERCASE, Bricolage Grotesque, xs/sm, tracking-wide, semibold
- **Badge text**: Geist, sm, medium, `text-[#006828]`
- **Font variation**: `font-variation-settings: 'opsz' 14, 'wdth' 100;`

---

## 3. Spacing System

### Base Unit: 4px (Tailwind default)

### Section Vertical Padding

| Size     | Tailwind                 | Usage                     |
|----------|--------------------------|---------------------------|
| Small    | `py-8`                   | Compact sections          |
| Medium   | `py-12 lg:py-20`         | Standard sections         |
| Standard | `py-16 lg:py-24`         | Most content sections     |
| Large    | `pt-12 sm:pt-16 pb-16 lg:pb-28` | Hero sections      |

### Horizontal Padding (Responsive Container)

```
px-4 sm:px-6 lg:px-8
```

### Container Max-Widths

| Width   | Tailwind              | Usage                        |
|---------|-----------------------|------------------------------|
| 1400px  | `max-w-[1400px]`      | Hero sections                |
| 1200px  | `max-w-[1200px]`      | Standard content sections    |
| 1000px  | `max-w-[1000px]`      | Narrower focused sections    |
| 900px   | `max-w-[900px]`       | Narrow content               |
| 800px   | `max-w-[800px]`       | CTA cards                    |
| 700px   | `max-w-[700px]`       | Text-heavy sections          |
| 600px   | `max-w-[600px]`       | Description blocks           |
| 560px   | `max-w-[560px]`       | Subtitles                    |
| 500px   | `max-w-[500px]`       | Feature descriptions         |
| 480px   | `max-w-[480px]`       | Narrow text                  |

### Gap Scale

| Size    | Tailwind           | Usage                         |
|---------|--------------------|-------------------------------|
| Tight   | `gap-2` / `gap-3`  | Badge content, inline items   |
| Normal  | `gap-4 sm:gap-6`   | Card grids, list items        |
| Medium  | `gap-5 lg:gap-6`   | Feature card grids            |
| Wide    | `gap-8 lg:gap-12`  | Section content splits        |
| Hero    | `gap-10 lg:gap-16` | Hero text-to-image gap        |

### Component Internal Spacing

| Component       | Padding                | Tailwind                  |
|-----------------|------------------------|---------------------------|
| Card            | 24px → 28px            | `p-6 sm:p-7`             |
| Card compact    | 20px → 24px            | `p-5 sm:p-6`             |
| CTA section     | 32px → 48px            | `p-8 sm:p-12`            |
| Badge           | 6px × 16px             | `px-4 py-1.5`            |
| Button primary  | 14px × 40px            | `px-10 py-3.5`           |
| Button nav      | 10px × 24px            | `px-6 py-2.5`            |
| Tab button      | 10px × 12-20px         | `px-3 sm:px-5 py-2.5`    |

---

## 4. Border Radius

### Standard Scale

| Token    | Value | Tailwind       | Usage                          |
|----------|-------|----------------|--------------------------------|
| none     | 0     | `rounded-none` | Tables, dividers               |
| sm       | 2px   | `rounded-sm`   | Subtle rounding                |
| md       | 6px   | `rounded-md`   | Inputs, small elements         |
| lg       | 8px   | `rounded-lg`   | Buttons, small cards           |
| xl       | 12px  | `rounded-xl`   | Icon containers, medium cards  |
| 2xl      | 16px  | `rounded-2xl`  | Standard cards, images         |
| 3xl      | 24px  | `rounded-3xl`  | Large cards, CTA sections      |
| full     | 9999px| `rounded-full` | Buttons, badges, pills         |

### Custom Values (frequently used)

| Value   | Tailwind            | Usage                              |
|---------|---------------------|------------------------------------|
| 20px    | `rounded-[20px]`    | Medium image containers            |
| 28-32px | `rounded-[32px]`    | Large images on desktop            |
| 36-40px | `rounded-[40px]`    | Decorative gradient backdrops      |
| 44-48px | `rounded-[44px]`    | Large container elements           |

### Responsive Radius Pattern

```
rounded-2xl lg:rounded-[32px]    /* Images: 16px mobile → 32px desktop */
rounded-2xl sm:rounded-3xl       /* Cards: 16px mobile → 24px tablet+ */
```

---

## 5. Shadows

### Custom Shadow Definitions

#### `.shadow-card` — Subtle multi-layer card shadow (hover state)
```css
box-shadow:
  0px 0.7px 0.7px -0.4px rgba(0,0,0,0.03),
  0px 1.8px 1.8px -0.8px rgba(0,0,0,0.03),
  0px 3.6px 3.6px -1.25px rgba(0,0,0,0.03),
  0px 6.9px 6.9px -1.7px rgba(0,0,0,0.03),
  0px 13.6px 13.6px -2.1px rgba(0,0,0,0.03),
  0px 30px 30px -2.5px rgba(0,0,0,0.03);
```

#### `.shadow-cta` — Enhanced shadow for CTA elements
```css
box-shadow:
  0px 0.7px 0.7px -0.4px rgba(0,0,0,0.13),
  0px 1.8px 1.8px -0.8px rgba(0,0,0,0.13),
  0px 3.6px 3.6px -1.1px rgba(0,0,0,0.13),
  0px 6.9px 6.9px -1.4px rgba(0,0,0,0.13),
  0px 13.6px 13.6px -1.8px rgba(0,0,0,0.13),
  0px 25px 25px -2.1px rgba(0,0,0,0.13),
  0px 38px 38px -2.4px rgba(0,0,0,0.13),
  0px 50px 50px -2.8px rgba(0,0,0,0.13);
```

#### `.shadow-hero-btn` — Bold button shadow
```css
box-shadow: 0px 4px 4px rgba(0,0,0,0.8);
```

### Tailwind Shadow Usage

| Class        | Usage                              |
|--------------|------------------------------------|
| `shadow-none`| Default card state                 |
| `shadow-sm`  | Subtle elevation                   |
| `shadow-lg`  | Feature images                     |
| `shadow-xl`  | Hero images                        |
| `shadow-card`| Card hover state (custom)          |
| `shadow-hero-btn` | Primary CTA buttons (custom)  |
| `shadow-cta` | CTA section elements (custom)      |

---

## 6. Gradients

### Background Gradients

| Name              | Direction | Colors                                         | Usage                      |
|-------------------|-----------|-------------------------------------------------|---------------------------|
| Green accent light| to-br     | `#006828/10` → `#006828/5`                     | Icon box backgrounds       |
| Green accent subtle| to-br    | `#006828/8` via transparent → `#006828/4`      | Section accents            |
| Green decorative  | to-bl     | `#006828/[0.04]` via transparent → transparent | Hero decorative blurs      |
| Dark section      | to-br     | `#1c1c1c` → `#111`                            | Dark content sections      |
| Dark CTA          | to-br     | `#1c1c1c` → `#2a2a2a`                         | End-of-page CTA cards      |
| Light section     | to-br     | `#f8f9f4` → `#f0f2ec`                         | Tab content backgrounds    |
| Fade top          | to-b      | `black/10` → transparent                       | Subtle top shadows         |
| Comparison green  | to-br     | `#006828/[0.03]`                               | "With Zavis" comparison    |

### Mask Gradients (for carousels)

```css
mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
```

### Decorative Gradient Blobs

```
position: absolute
size: w-[500px] h-[500px] or w-[600px] h-[600px]
shape: rounded-full
blur: blur-3xl
pointer-events: none
gradient: from-[#006828]/[0.04] via-transparent to-transparent
```

---

## 7. Animations & Motion

### Page Transitions (GSAP)

Page transitions use GSAP for enter/exit animations:

- **Enter**: `gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })`
- **Exit**: `gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.in" })`
- Framer Motion (`motion`, `AnimatePresence`, `motion.div`) has been completely removed from the project.

### Scroll-Triggered Animations (GSAP ScrollTrigger)

AnimatedSection uses GSAP ScrollTrigger internally. The component API remains the same:

```jsx
<AnimatedSection direction="up" delay={0.1}>
  {children}
</AnimatedSection>
```

Under the hood, GSAP ScrollTrigger handles:
- `start: "top 85%"` trigger point
- `gsap.fromTo()` with direction-based transforms (up/down/left/right)
- Automatic cleanup on unmount
- `prefers-reduced-motion` media query disables animations

### Smooth Scrolling (Lenis)

Lenis provides buttery-smooth inertial scrolling:
- Initialized in Layout.tsx
- Synced with GSAP ticker for compatibility
- Destroyed on unmount

### CSS Keyframe Animations

```css
/* Logo carousel scroll */
@keyframes logo-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
animation: logo-scroll 35s linear infinite;
```

### Transition Properties

| Property    | Duration | Easing | Tailwind                              |
|-------------|----------|--------|---------------------------------------|
| All         | 300ms    | ease   | `transition-all duration-300`         |
| Colors      | 200ms    | ease   | `transition-colors duration-200`      |
| Opacity     | 200ms    | ease   | `transition-opacity duration-200`     |
| Transform   | 300ms    | ease   | `transition-transform duration-300`   |

### Hover Micro-Interactions

| Element    | Effect                                                           |
|------------|------------------------------------------------------------------|
| Cards      | `hover:shadow-card hover:border-[#006828]/15 hover:-translate-y-0.5` |
| Buttons    | `hover:bg-gray-800 hover:gap-3` (gap widens)                    |
| Links      | `hover:text-[#006828]` or `hover:underline`                     |
| Icon boxes | `group-hover:from-[#006828]/20 group-hover:to-[#006828]/10`     |
| Nav items  | `hover:bg-[#006828]/5`                                           |

### Reduced Motion

All animated components MUST check `prefers-reduced-motion` and fall back
to static rendering (no opacity fade, no position shifts, instant display).

---

## 8. Focus & Accessibility

### Focus Ring System

```css
/* Global focus-visible */
a:focus-visible,
button:focus-visible,
[role="menuitem"]:focus-visible {
  outline: 2px solid #006828;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Form Focus States

```
focus:ring-2 focus:ring-[#006828]/20 focus:border-[#006828]/40
```

### ARIA Attributes Used

- `aria-label` on icon buttons and hamburger menu
- `aria-expanded` on mega menu buttons, accordions
- `aria-haspopup="true"` on menu triggers
- `role="img"` on SVG logo

---

## 9. Responsive Breakpoints

| Breakpoint | Width  | Tailwind | Primary Usage                          |
|------------|--------|----------|----------------------------------------|
| Default    | 0px    | —        | Mobile-first base styles               |
| sm         | 640px  | `sm:`    | Small tablet adjustments               |
| md         | 768px  | `md:`    | Tablet layouts, 2-column grids         |
| lg         | 1024px | `lg:`    | Desktop nav, side-by-side heroes       |
| xl         | 1280px | `xl:`    | Rarely used (wide desktop tweaks)      |

### Common Responsive Patterns

```css
/* Text scaling */
text-[32px] sm:text-[44px] lg:text-[58px]

/* Padding scaling */
px-4 sm:px-6 lg:px-8

/* Layout shifts */
flex flex-col lg:flex-row
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Visibility */
hidden lg:flex    /* Desktop only */
lg:hidden         /* Mobile only */
```

---

## 10. Z-Index Scale

| Layer         | Value | Tailwind | Usage                    |
|---------------|-------|----------|--------------------------|
| Background    | auto  | —        | Default stacking         |
| Elevated      | 10    | `z-10`   | Relative stacking        |
| Navigation    | 50    | `z-50`   | Sticky navbar, modals    |

---

## 11. Effects

### Blur

| Class       | Usage                              |
|-------------|------------------------------------|
| `blur-sm`   | Minimal (frosted glass)            |
| `blur-md`   | Subtle overlays                    |
| `blur-lg`   | Medium decorative                  |
| `blur-xl`   | Strong decorative                  |
| `blur-3xl`  | Large gradient blobs               |

### Backdrop Blur

```
backdrop-blur-sm    /* Navbar frosted glass */
backdrop-blur-md    /* Overlay panels */
```

### Scrollbar Hiding

```css
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```
