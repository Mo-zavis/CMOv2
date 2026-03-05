# Zavis Component Patterns — Complete Catalog

> Every reusable UI pattern in the Zavis design system with exact Tailwind classes.

---

## 1. Buttons

### Primary CTA Button (Black)

```html
<button class="inline-flex items-center gap-2 bg-black text-white px-10 py-3.5 rounded-full font-['Bricolage_Grotesque',sans-serif] font-medium shadow-hero-btn hover:bg-gray-800 transition-all hover:gap-3">
  Book a Demo
  <ArrowRight class="w-4 h-4" />
</button>
```

**States**: hover → `bg-gray-800`, gap increases 2→3
**Shadow**: `shadow-hero-btn` (0px 4px 4px rgba(0,0,0,0.8))

### Inverted CTA Button (White on dark)

```html
<button class="inline-flex items-center gap-2 bg-white text-black px-10 py-3.5 rounded-full font-['Bricolage_Grotesque',sans-serif] font-medium shadow-hero-btn hover:bg-gray-100 transition-all hover:gap-3">
  Book a Demo
  <ArrowRight class="w-4 h-4" />
</button>
```

Used on dark gradient CTA sections.

### Navbar CTA Button

```html
<button class="bg-black text-white px-6 py-2.5 rounded-full font-['Bricolage_Grotesque',sans-serif] font-medium hover:bg-gray-800 transition-colors">
  Book a Demo
</button>
```

Smaller padding than hero CTA. No shadow.

### Text Link Button

```html
<a class="text-[#006828] font-medium hover:underline transition-colors">
  Learn more
</a>
```

---

## 2. Badges

### Green Accent Badge (Section Introductions)

```html
<div class="inline-flex items-center gap-2 bg-[#006828]/[0.08] rounded-full px-4 py-1.5 text-[#006828] text-sm font-medium font-['Geist',sans-serif]">
  <span class="w-2 h-2 rounded-full bg-[#006828] animate-pulse" />
  Badge Text Here
</div>
```

Used above H1/H2 headings to introduce sections.

### Status Badge (Pill)

```html
<span class="inline-block bg-black text-white font-['Geist',sans-serif] font-medium text-xs px-4 py-1.5 rounded-full">
  Label
</span>
```

Variants: `bg-white text-[#006828]` for light version.

### Uppercase Section Label

```html
<span class="uppercase text-xs tracking-widest font-medium text-black/40">
  SECTION HEADING
</span>
```

Used as column/section headings in mega menus and content areas.

---

## 3. Cards

### Feature Card

```html
<div class="bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] hover:shadow-card hover:border-[#006828]/15 hover:-translate-y-0.5 transition-all duration-300 h-full">
  <!-- Icon box -->
  <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#006828]/10 to-[#006828]/5 flex items-center justify-center mb-4 group-hover:from-[#006828]/20 group-hover:to-[#006828]/10 transition-all">
    <Icon class="w-5 h-5 text-[#006828]" />
  </div>
  <!-- Title -->
  <h3 class="font-['Bricolage_Grotesque',sans-serif] font-medium text-lg sm:text-xl tracking-tight text-[#1c1c1c] mb-2">
    Card Title
  </h3>
  <!-- Description -->
  <p class="font-['Geist',sans-serif] font-medium text-[13px] text-black/45 leading-relaxed">
    Card description text goes here.
  </p>
</div>
```

### Metric/Stat Card

```html
<div class="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] hover:border-[#006828]/20 transition-all group">
  <div class="font-['Bricolage_Grotesque',sans-serif] font-medium text-2xl sm:text-3xl lg:text-4xl text-[#006828] mb-2">
    98%
  </div>
  <div class="font-['Geist',sans-serif] font-medium text-xs sm:text-sm text-black/50">
    Patient Satisfaction Rate
  </div>
</div>
```

### Dark CTA Card

```html
<div class="bg-gradient-to-br from-[#1c1c1c] to-[#2a2a2a] rounded-3xl p-8 sm:p-12 text-center">
  <h2 class="font-['Bricolage_Grotesque',sans-serif] font-medium text-[24px] sm:text-[32px] lg:text-[40px] leading-[1.1] text-white mb-4">
    Ready to <span class="text-[#006828]">Transform</span> Your Practice?
  </h2>
  <p class="font-['Geist',sans-serif] font-medium text-sm text-white/50 max-w-[500px] mx-auto mb-8">
    Description text here.
  </p>
  <!-- Inverted CTA button (white) -->
  <button class="inline-flex items-center gap-2 bg-white text-black px-10 py-3.5 rounded-full font-['Bricolage_Grotesque',sans-serif] font-medium shadow-hero-btn hover:bg-gray-100 transition-all hover:gap-3">
    Book a Demo <ArrowRight />
  </button>
</div>
```

### Before/After Comparison Card

```html
<div class="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-black/[0.06] grid md:grid-cols-2">
  <!-- Before side -->
  <div class="p-6 sm:p-8 bg-black/[0.02] border-b md:border-b-0 md:border-r border-black/[0.06]">
    <div class="flex items-center gap-2 mb-4">
      <span class="w-2 h-2 rounded-full bg-black/30" />
      <span class="text-xs uppercase tracking-wider font-medium text-black/40">Today</span>
    </div>
    <p class="text-sm text-black/50">Current state description</p>
  </div>
  <!-- After side -->
  <div class="p-6 sm:p-8 bg-[#006828]/[0.03]">
    <div class="flex items-center gap-2 mb-4">
      <span class="w-2 h-2 rounded-full bg-[#006828]" />
      <span class="text-xs uppercase tracking-wider font-medium text-[#006828]">With Zavis</span>
    </div>
    <p class="text-sm text-black/70">Improved state description</p>
  </div>
</div>
```

---

## 4. Navigation

### Sticky Navbar

```html
<nav class="sticky top-0 z-50 bg-[#f8f8f6]/90 backdrop-blur-sm border-b border-black/5">
  <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo (left) -->
      <!-- Nav items (center, hidden lg:flex) -->
      <!-- CTA button (right) -->
      <!-- Hamburger (lg:hidden) -->
    </div>
  </div>
</nav>
```

### Mega Menu Panel

```html
<div class="absolute top-full left-0 right-0 bg-white border-b border-black/[0.06] shadow-lg">
  <div class="max-w-[1400px] mx-auto grid grid-cols-3 gap-8 p-8">
    <!-- Column with heading -->
    <div>
      <div class="uppercase text-xs tracking-wider font-medium text-black/40 mb-4">
        BY SPECIALTY
      </div>
      <!-- Items -->
      <a class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#006828]/5 transition-colors">
        <Icon class="w-4 h-4 opacity-60" />
        <span class="text-sm font-medium">Item Label</span>
      </a>
    </div>
  </div>
</div>
```

### Footer

```html
<footer class="bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
      <!-- Logo + description column (col-span-2 md:col-span-1) -->
      <!-- Link columns -->
      <div>
        <h4 class="font-['Bricolage_Grotesque',sans-serif] font-medium text-white mb-4">Section</h4>
        <div class="space-y-2">
          <a class="block text-white/60 text-sm hover:text-white transition-colors">Link</a>
        </div>
      </div>
    </div>
    <div class="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
      &copy; 2025 Zavis. All rights reserved.
    </div>
  </div>
</footer>
```

---

## 5. Hero Sections

### Split Hero (Text Left, Image Right)

```html
<section class="relative pt-12 sm:pt-16 pb-16 lg:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
  <!-- Decorative gradient blob -->
  <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#006828]/[0.04] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

  <div class="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
    <!-- Text side -->
    <div class="flex-1 text-center lg:text-left">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 bg-[#006828]/[0.08] rounded-full px-4 py-1.5 mb-6">
        <span class="w-2 h-2 rounded-full bg-[#006828] animate-pulse" />
        <span class="text-[#006828] text-sm font-medium">Badge Text</span>
      </div>
      <!-- H1 -->
      <h1 class="font-['Bricolage_Grotesque',sans-serif] font-medium text-[32px] sm:text-[44px] lg:text-[58px] leading-[1.05] text-[#1c1c1c] tracking-[-0.04em] mb-5">
        Heading with <span class="text-[#006828]">Green Accent</span>
      </h1>
      <!-- Description -->
      <p class="font-['Geist',sans-serif] font-medium text-sm sm:text-base text-black/50 leading-relaxed max-w-md mb-8">
        Description text here.
      </p>
      <!-- CTA -->
      <button class="inline-flex items-center gap-2 bg-black text-white px-10 py-3.5 rounded-full ...">
        Book a Demo <ArrowRight />
      </button>
    </div>
    <!-- Image side -->
    <div class="flex-1 relative">
      <div class="absolute -inset-4 bg-gradient-to-br from-[#006828]/10 via-transparent to-[#006828]/5 rounded-[40px] blur-xl" />
      <div class="relative rounded-2xl lg:rounded-[32px] overflow-hidden ring-1 ring-black/10 shadow-xl">
        <img class="w-full aspect-[4/3] object-cover" src="..." alt="..." />
      </div>
    </div>
  </div>
</section>
```

### Centered Hero (No Image)

```html
<section class="relative pt-12 sm:pt-16 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
  <div class="max-w-[1200px] mx-auto text-center">
    <!-- Badge (centered) -->
    <!-- H1 with max-w-3xl mx-auto -->
    <!-- Description with max-w-[560px] mx-auto -->
    <!-- CTA (centered) -->
  </div>
  <!-- Optional: large hero image below -->
  <div class="max-w-[1000px] mx-auto mt-12">
    <img class="w-full aspect-[16/9] object-cover rounded-2xl lg:rounded-[32px] ring-1 ring-black/10 shadow-xl" />
  </div>
</section>
```

---

## 6. Content Sections

### Feature Grid (2-3 columns)

```html
<section class="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
  <div class="max-w-[1200px] mx-auto">
    <!-- Section header -->
    <div class="text-center mb-12">
      <Badge />
      <h2 class="...">Section <span class="text-[#006828]">Heading</span></h2>
      <p class="text-sm text-black/50 max-w-[600px] mx-auto mt-4">Description</p>
    </div>
    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
      <!-- Feature cards -->
    </div>
  </div>
</section>
```

### Platform Pillars Grid (6-column)

```html
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
  <a class="bg-white rounded-2xl p-5 border border-black/[0.06] hover:shadow-card hover:border-[#006828]/15 hover:-translate-y-0.5 transition-all text-center group">
    <div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#006828]/10 to-[#006828]/5 flex items-center justify-center">
      <Icon class="w-5 h-5 text-[#006828]" />
    </div>
    <span class="font-['Bricolage_Grotesque',sans-serif] font-medium text-sm tracking-tight">Label</span>
  </a>
</div>
```

### Zigzag / Alternating Feature Cards

```html
<div class="space-y-12 lg:space-y-20">
  <!-- Item (image right) -->
  <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
    <!-- Text (lg:w-[45%]) -->
    <div class="lg:w-[45%]">
      <div class="inline-flex items-center gap-1.5 text-[#006828] text-sm mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-[#006828]" />
        Feature Label
      </div>
      <h3 class="font-['Bricolage_Grotesque',sans-serif] font-medium text-[22px] sm:text-[26px] lg:text-[32px] leading-tight tracking-tight mb-4">
        Feature Title
      </h3>
      <div class="border-l-2 border-[#006828]/20 pl-5">
        <p class="font-['Geist',sans-serif] font-semibold text-black text-sm mb-2">Subtitle</p>
        <p class="font-['Geist',sans-serif] font-medium text-[13px] text-black/45 leading-relaxed">Description</p>
      </div>
    </div>
    <!-- Image (lg:w-[55%]) -->
    <div class="lg:w-[55%] relative">
      <div class="absolute -inset-1 bg-gradient-to-br from-[#006828]/5 to-transparent rounded-[20px] blur-md" />
      <img class="relative rounded-2xl ring-1 ring-black/[0.06] shadow-lg w-full aspect-[16/10] object-cover" />
    </div>
  </div>

  <!-- Item (image left) — reverse with lg:flex-row-reverse -->
  <div class="flex flex-col lg:flex-row-reverse gap-8 lg:gap-12 items-center">
    ...
  </div>
</div>
```

### Tabbed Content Section

```html
<!-- Tab buttons -->
<div class="flex overflow-x-auto sm:justify-center gap-1 mb-10 px-2 pb-2 -mx-2 scrollbar-none">
  <button class="px-3 sm:px-5 py-2.5 font-['Bricolage_Grotesque',sans-serif] font-semibold text-xs sm:text-sm uppercase tracking-wide border-b-2 whitespace-nowrap flex-shrink-0
    [active]: text-[#006828] border-[#006828]
    [inactive]: text-black/30 border-transparent hover:border-black/10">
    TAB LABEL
  </button>
</div>

<!-- Tab content -->
<div class="bg-white rounded-2xl lg:rounded-[32px] overflow-hidden shadow-sm border border-black/[0.06] flex flex-col lg:flex-row">
  <!-- Text side -->
  <div class="p-6 sm:p-8 lg:p-10 lg:w-[50%]">
    <h3 class="...">Title</h3>
    <p class="...">Subtitle</p>
    <!-- Feature checklist -->
    <div class="space-y-4">
      <div class="flex gap-3">
        <CheckCircle2 class="w-5 h-5 text-[#006828] mt-0.5 flex-shrink-0" />
        <div>
          <p class="font-semibold text-black tracking-tight mb-1.5">Feature heading</p>
          <p class="font-medium text-[13px] text-black/45 leading-relaxed">Description</p>
        </div>
      </div>
    </div>
  </div>
  <!-- Image side -->
  <div class="lg:w-[50%] bg-gradient-to-br from-[#f8f9f4] to-[#f0f2ec] border-t lg:border-t-0 lg:border-l border-black/[0.06]">
    <img class="w-full h-full object-cover" />
  </div>
</div>
```

### Green Callout Bar

```html
<div class="bg-[#006828] rounded-2xl p-6 sm:p-8 text-center max-w-[800px] mx-auto">
  <p class="font-['Geist',sans-serif] font-medium text-white/90 text-sm sm:text-base leading-relaxed">
    Callout text here.
  </p>
</div>
```

### Comparison Table

```html
<div class="overflow-x-auto rounded-2xl border border-black/[0.06] scrollbar-none shadow-sm">
  <table class="w-full min-w-[700px]">
    <thead>
      <tr>
        <th class="bg-black/[0.02] p-4 text-left text-xs font-medium text-black/40">Feature</th>
        <th class="bg-[#006828] p-4 text-left text-white font-semibold text-sm">Zavis</th>
        <th class="bg-white p-4 text-center font-semibold text-sm text-black/50">Competitor</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t border-black/5">
        <td class="p-4 text-sm font-medium text-black/60">Feature name</td>
        <td class="bg-[#006828] p-4">
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-3.5 h-3.5 text-white/60 mt-0.5" />
            <span class="font-medium text-[13px] text-white/90 leading-relaxed">Description</span>
          </div>
        </td>
        <td class="p-4 text-center text-[13px] text-black/40">Limited</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 7. Icon Containers

### Standard Icon Box (in cards)

```html
<div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#006828]/10 to-[#006828]/5 flex items-center justify-center">
  <Icon class="w-5 h-5 text-[#006828]" />
</div>
```

### Small Icon Box (in nav/pillars)

```html
<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006828]/10 to-[#006828]/5 flex items-center justify-center">
  <Icon class="w-4 h-4 text-[#006828]" />
</div>
```

### Inline Feature Icon

```html
<CheckCircle2 class="w-5 h-5 text-[#006828] mt-0.5 flex-shrink-0" />
```

---

## 8. Stat/Metrics Display

### 4-Column Stat Grid

```html
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  <div class="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] hover:border-[#006828]/20 transition-all">
    <div class="font-['Bricolage_Grotesque',sans-serif] font-medium text-2xl sm:text-3xl lg:text-4xl text-[#006828] mb-2">
      60-90%
    </div>
    <div class="font-['Geist',sans-serif] font-medium text-xs sm:text-sm text-black/50">
      AI Automation Rate
    </div>
  </div>
</div>
```

---

## 9. Form Elements

### Text Input

```html
<input class="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-[#f3f3f5] font-['Geist',sans-serif] text-sm focus:ring-2 focus:ring-[#006828]/20 focus:border-[#006828]/40 transition-all outline-none" />
```

### Textarea

```html
<textarea class="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-[#f3f3f5] font-['Geist',sans-serif] text-sm focus:ring-2 focus:ring-[#006828]/20 focus:border-[#006828]/40 transition-all outline-none resize-none" rows="4" />
```

### Submit Button (in forms)

Same as Primary CTA Button pattern.

---

## 10. Logo Ticker / Carousel

```html
<div class="relative overflow-hidden" style="mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent)">
  <div class="flex gap-12" style="animation: logo-scroll 35s linear infinite">
    <!-- Logo items (duplicated for seamless loop) -->
    <img class="h-8 opacity-40 grayscale" />
    <!-- ... repeat all logos twice ... -->
  </div>
</div>
```

---

## 11. Timeline

```html
<div class="space-y-10 lg:space-y-16">
  <div class="flex flex-col lg:flex-row items-start gap-6">
    <!-- Timeline marker -->
    <div class="flex flex-col items-center gap-2">
      <div class="w-4 h-4 rounded-full border-2 border-[#006828] flex items-center justify-center">
        <div class="w-1.5 h-1.5 rounded-full bg-[#006828]" />
      </div>
      <span class="border border-[#006828]/30 rounded-full px-3 py-1 text-xs font-medium text-[#006828]">
        Day 1
      </span>
    </div>
    <!-- Content -->
    <div class="flex flex-col lg:flex-row flex-1 gap-6">
      <div class="lg:w-[45%]">
        <h3>Step Title<span class="text-[#006828]">.</span></h3>
        <p>Description</p>
      </div>
      <div class="lg:w-[55%]">
        <img class="rounded-2xl lg:rounded-[32px] aspect-[16/10]" />
      </div>
    </div>
  </div>
</div>
```

---

## 12. Animation Wrappers

### AnimatedSection

Wraps any section content with scroll-triggered fade-in animation using GSAP ScrollTrigger internally (not Framer Motion).

```jsx
<AnimatedSection direction="up" delay={0.1}>
  {/* Section content */}
</AnimatedSection>
```

Directions: `up` (default), `left`, `right`, `none`

### StaggerContainer + StaggerItem

Wraps lists/grids where children animate in sequence.

```jsx
<StaggerContainer className="grid grid-cols-3 gap-6">
  <StaggerItem>{/* Card 1 */}</StaggerItem>
  <StaggerItem>{/* Card 2 */}</StaggerItem>
  <StaggerItem>{/* Card 3 */}</StaggerItem>
</StaggerContainer>
```

---

## 13. Page Layout Wrapper

```tsx
// Layout.tsx — GSAP page transition wrapper
import { useRef, useEffect } from "react";
import gsap from "gsap";
import Lenis from "lenis";

// Lenis smooth scrolling initialized in Layout
// GSAP handles page enter/exit transitions
// AnimatePresence and motion.div are NOT used (motion package removed)
<div ref={pageRef} className="min-h-screen bg-[#f8f8f6] font-geist text-[#1c1c1c]">
  <Navbar />
  <main>{children}</main>
  <Footer />
</div>
```

---

## 14. Icon Library Reference

Icons sourced from **lucide-react**. Common icons used:

### Specialty Icons
Smile, Droplets, Eye, Bone, Ear, Clock, Brain, PawPrint

### Feature Icons
MessageSquare, Phone, Bot, Calendar, BarChart3, Zap, Users, Shield,
CreditCard, Smartphone, Globe, Link, Settings, Mail, BellRing

### UI/Navigation Icons
Menu, X, ChevronDown, ChevronRight, ArrowRight, CheckCircle2, Check,
Loader2, ExternalLink, Search

### Standard Sizes
- Navigation: `w-4 h-4 opacity-60`
- Feature cards: `w-5 h-5 text-[#006828]`
- Inline checks: `w-5 h-5 text-[#006828] mt-0.5 flex-shrink-0`
- Small inline: `w-3.5 h-3.5`
- Hero CTA arrow: `w-4 h-4`

---

## 15. New Shared Components (Visual Communication)

Six shared components for visual storytelling, replacing text-heavy sections:

### BrandIcons.tsx
26 inline SVG brand icons for channels, EMRs, telephony, and ad platforms.
Always use real official logos. Never hand-drawn SVG approximations.

Includes: WhatsApp, Instagram, Facebook, LinkedIn, Snapchat, TikTok, Telegram,
Twilio, Avaya, Google Ads, Meta, OpenAI, Practo, MeDAS, Unite, Helix, and more.

### IntegrationHub.tsx
Animated hub-and-spoke SVG diagram showing Zavis at the center with connected
integrations radiating outward. Uses CSS animations for dash flow effects.

### LogoBar.tsx
Infinite auto-scrolling CSS ticker for displaying partner/client logos.
- `overflow: hidden` (no scrollbars)
- Pause on hover
- Grayscale-to-color hover transitions
- Supports `iconSize` prop for different logo types (circular vs wordmark)
- Wordmark logos (Practo, MeDAS) use `h-10 w-36`; circular icons use `w-10 h-10`

### ChannelIconGrid.tsx
Visual icon grid replacing text-based channel lists. GSAP-powered hover
animations. Displays supported communication channels as recognizable brand icons.

### VisualFlow.tsx
Step-by-step flow diagrams (horizontal on desktop, vertical on mobile).
Uses Lucide icons for step indicators. Never emojis.

### brand-partners.ts
Centralized partner data file (EMR providers, channels, telephony partners,
ad platforms, tools). Single source of truth for all logo/partner references.
