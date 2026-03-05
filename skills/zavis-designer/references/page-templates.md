# Zavis Page Templates — Layout Blueprints

> Complete page structures that compose component patterns into full pages.
> Use these as blueprints when creating new pages in the Zavis design system.

---

## Template 1: Homepage

**Used for**: Main landing page, marketing homepage

### Structure

```
[Navbar — sticky, blurred]

[Hero — Split]
├── Badge (green pill with pulse dot)
├── H1 (58px, Bricolage, with green accent span)
├── Description (Geist, black/50)
├── CTA Button (black, rounded-full)
└── Hero Image (app screenshot, rounded-[32px], shadow-xl)

[Logo Ticker]
├── Infinite scroll animation (35s loop)
├── Grayscale logos at 40% opacity
└── Fade mask on edges

[Dashboard Preview]
├── Large app screenshot
├── Centered, max-w-[1000px]
└── Shadow + ring treatment

[Stats Grid]
├── 4-column grid (2 on mobile)
├── Green metric values
└── Muted labels

[Platform Pillars]
├── 6-column grid (2 on mobile, 3 on tablet)
├── Icon + label cards
└── Links to platform pages

[Tabbed Section]
├── 5 horizontal tabs (scrollable on mobile)
├── Split content (text left, image right)
├── Feature checklist with green check icons
└── Tab content has light gradient background

[Before/After Comparison]
├── 2-column card
├── "Today" (neutral bg) vs "With Zavis" (green tint bg)
└── Dot indicators + uppercase labels

[Timeline]
├── 8 steps with day markers
├── Circle + pill badge + content + image per step
├── Staggered animation
└── Green period on step titles

[Dark CTA Section]
├── Gradient background (#1c1c1c → #2a2a2a)
├── White heading with green accent
├── White/50 description
└── Inverted CTA button (white bg)

[Footer — black bg]
```

### Key Dimensions
- Hero max-width: 1400px
- Content max-width: 1200px
- Section padding: py-16 lg:py-24
- Hero padding: pt-12 sm:pt-16 pb-16 lg:pb-28

---

## Template 2: Specialty Page (Template-Based)

**Used for**: Dental*, Dermatology, Optometry, Orthopedics, ENT, Urgent Care, Mental Health, Veterinary, Homecare, Aesthetic, Longevity & Wellness

*Dental has a custom version with comparison table (see Template 2B)

### Structure

```
[Navbar]

[Hero — Centered]
├── Badge (green pill)
├── H1 (centered, max-w-3xl, with green accent span)
├── Description (centered, max-w-[560px])
├── CTA Button (centered)
└── Full-width Hero Image (max-w-[1000px], aspect-[16/9])

[Features Section]
├── Section header (badge + H2 + description, centered)
└── Zigzag Feature Cards (4 items)
    ├── Item 1: text left, image right
    ├── Item 2: text right, image left (flex-row-reverse)
    ├── Item 3: text left, image right
    └── Item 4: text right, image left
    Each item:
    ├── Green dot + label
    ├── H3 title
    ├── Border-left accent bar with subtitle + description
    └── Image (aspect-[16/10], rounded-2xl, shadow-lg)

[Result Callout Bar]
├── Green background (#006828)
├── Centered white text
└── Rounded-2xl, max-w-[800px]

[Results Metrics]
├── Section header (badge + H2)
└── 2-column grid of metric cards
    Each card:
    ├── Green metric value (text-2xl)
    └── Description (text-[13px], black/45)

[Dark CTA Section]
├── Same as homepage dark CTA
└── Specialty-specific heading

[Footer]
```

### Data Structure

```typescript
interface SpecialtyData {
  slug: string;
  name: string;
  icon: LucideIcon;
  badge: string;
  heroTitle: string;
  heroAccent: string;        // word(s) to highlight in green
  heroDescription: string;
  heroImage: string;
  featureHeading: string;
  featureAccent: string;
  features: Array<{
    label: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    align: "left" | "right";  // image position
  }>;
  resultBarText: string;
  resultHeading: string;
  results: Array<{
    metric: string;
    description: string;
  }>;
  ctaHeading: string;
  ctaDescription: string;
}
```

---

## Template 2B: Dental Page (Custom Specialty)

**Extends Template 2 with**:

```
[After Features Section, Before Results]

[Comparison Table]
├── Scrollable table (min-w-[700px])
├── Columns: Feature | Zavis | Traditional | DIY | Status Quo
├── Zavis column: green background (#006828) + white text + checkmarks
├── Other columns: white bg, muted text
└── Rounded-2xl border with shadow-sm
```

---

## Template 3: Platform Page (Split Hero)

**Used for**: Chat, Voice, Bookings, CRM, Analytics, AI Agents, EMR, Automations, Campaigns, Widgets, Integrations, Payments, Mobile

### Structure

```
[Navbar]

[Hero — Split]
├── Same as homepage split hero
├── Badge specific to feature
├── H1 with feature-specific green accent
├── Description
├── CTA
└── App screenshot or feature-specific image

[Feature-Specific Content]
├── Varies by page (see variants below)
└── 1-3 content sections

[Feature Grid]
├── Badge + H2 header
├── 2-3 column grid
└── Feature cards (icon + title + description)

[Dark CTA Section]

[Footer]
```

### Platform Page Variants

#### Chat Page
```
[Hero — Split]
[Channel Bar] — horizontal row of channel badges (WhatsApp, Instagram, etc.)
[Features Grid] — 2-column, 4-6 feature cards
[Dark CTA]
```

#### Voice Page
```
[Hero — Split]
[Phone Mockup Section] — dark gradient with phone UI illustration
[CTI Features] — 3-column grid
[Workflow Sections] — split content blocks
[Dark CTA]
```

#### Bookings Page
```
[Hero — Split]
[Features Grid] — 2-column
[Coordinator vs AI] — two side-by-side cards (status badges)
[Booking Flow] — step diagram or illustration
[Dark CTA]
```

#### CRM Page
```
[Hero — Split]
[Features Checklist] — green checkmarks with descriptions
[Patient 360 Section] — split content (text + screenshot)
[Revenue Attribution Grid] — metric cards
[Dark CTA]
```

---

## Template 4: About Page

### Structure

```
[Navbar]

[Hero — Split]
├── Badge
├── H1 ("About Zavis")
├── Description (company mission)
└── Team/office image

[Mission Statement]
├── Centered, single paragraph
├── Large text (Geist, text-lg)
└── max-w-[700px]

[Values Grid]
├── 3-column grid
├── Cards with alternating subtle bg colors
└── Each: icon + title + description

[Support Features]
├── Feature grid (what makes Zavis different)
└── 2-3 column layout

[Compliance/Security]
├── Grid of compliance badges/info
└── Trust indicators

[Dark CTA]
[Footer]
```

---

## Template 5: Contact Page

### Structure

```
[Navbar]

[Hero — Centered]
├── Badge
├── H1 ("Get in Touch")
└── Description

[Content — Split Layout]
├── Left Side:
│   ├── Contact info cards (icon + label + detail)
│   │   ├── Email
│   │   ├── Phone
│   │   └── Address
│   └── Office image
└── Right Side:
    └── Contact Form
        ├── Name input
        ├── Email input
        ├── Company input
        ├── Phone input
        ├── Message textarea
        └── Submit button (with Loader2 spinner on loading)

[Success State]
├── CheckCircle icon (green)
├── "Thank you" heading
└── Confirmation message

[Footer]
```

### Form Styling

```html
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-black/70 mb-1.5">Label</label>
    <input class="w-full px-4 py-3 rounded-xl border border-black/[0.06] bg-[#f3f3f5] text-sm
      focus:ring-2 focus:ring-[#006828]/20 focus:border-[#006828]/40 transition-all outline-none" />
  </div>
</form>
```

---

## Template 6: Error/404 Page

### Structure

```
[Navbar]

[Centered Content]
├── Large "404" number
├── Heading ("Page Not Found")
├── Description
└── CTA to go home

[Footer]
```

---

## Composition Rules

### Every Page Must Have

1. **Navbar** — sticky, blurred, with mega menus
2. **Main content** — wrapped in GSAP page transitions
3. **Footer** — black bg, 4-column link grid
4. **Dark CTA section** — above footer (unless it's a minimal page)

### Section Stacking Order

1. Hero (always first)
2. Social proof / logo ticker (optional, homepage only)
3. Primary content sections (features, grids, comparisons)
4. Secondary content (metrics, testimonials, tables)
5. Dark CTA card
6. Footer

### Responsive Layout Rules

- **Mobile (< 640px)**: Single column, stacked content, full-width images
- **Tablet (640-1023px)**: 2-column grids, still stacked heroes
- **Desktop (1024px+)**: Side-by-side heroes, 3-4 column grids, mega menus

### Animation Application

- Hero: No scroll animation (visible immediately)
- First content section: AnimatedSection with direction="up"
- Feature grids: StaggerContainer with StaggerItems
- Subsequent sections: AnimatedSection with increasing delay
- CTA: AnimatedSection direction="up"

### Max-Width Hierarchy

```
1400px — Hero container (widest)
1200px — Content sections (standard)
1000px — Focused content (dashboard previews, hero images)
 800px — CTA cards, callout bars
 600px — Description text blocks
 560px — Subtitles
 500px — Narrow descriptions
```
