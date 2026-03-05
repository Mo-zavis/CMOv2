# Campaign Planning & Calendar Management Skill

## When to Use
Activate this skill whenever:
- Planning a new marketing campaign (product launch, seasonal push, always-on initiative)
- Populating or updating the marketing calendar with deliverables
- Sequencing deliverables across channels and workflows
- Reviewing or adjusting an existing campaign plan
- Creating quarterly or monthly marketing roadmaps
- Allocating budget across channels for a campaign
- Prioritizing campaigns against business objectives

This is the orchestration layer. Every other workflow (image, video, copy, ads, social, email, SEO, analytics, AEO) is triggered and sequenced from here.

---

## The 5-Layer Questioning Framework

Before generating any plan, ask first-principles questions across all five layers. Never skip a layer. Never assume. Every question must be answered before the plan is drafted.

### Layer 1: Strategic Questions
- What is the business objective? (Revenue growth, brand awareness, product adoption, market entry)
- What specific metric defines success? (Demo bookings, sign-ups, MQLs, revenue attributed)
- What is the budget? (Total and per-channel breakdown if available)
- What is the timeline? (Campaign start, end, key milestones)
- Is this tied to an external event? (Product launch, conference, seasonal moment, competitor move)
- What does the competitive landscape look like for this initiative?

### Layer 2: Audience Questions
- Who is the primary target persona? (Healthcare CMO, clinic owner, operations leader, patient experience manager)
- What is their current awareness level? (Unaware, problem-aware, solution-aware, Zavis-aware)
- What channels do they spend time on? (LinkedIn for B2B healthcare leaders, WhatsApp for clinic staff, Instagram for visual storytelling)
- What are their top pain points right now?
- Are there geographic or market-specific considerations? (UAE, KSA, India, UK)

### Layer 3: Creative Questions
- What content formats are needed? (Blog, social images, video, email, landing page, ads)
- Is there existing creative that can be repurposed or extended?
- Are there brand guidelines or visual themes specific to this campaign?
- Does this campaign introduce new messaging or use established pillar language?
- What tone is appropriate? (Thought leadership, product demo, customer story, educational)

### Layer 4: Channel Questions
- Which channels are primary? (Paid search, paid social, organic social, email, SEO, direct)
- What is the channel mix and budget split?
- Are there platform-specific requirements? (LinkedIn B2B targeting, Meta lookalikes, Google keyword strategy)
- How do channels interact? (Retargeting from blog to ads, email nurture from social leads)
- What is the publishing cadence per channel?

### Layer 5: Quality & Compliance Questions
- What are the approval requirements? (Who reviews, how many rounds, turnaround time)
- Are there healthcare compliance considerations? (Patient data, medical claims, testimonials)
- What are the brand non-negotiables for this campaign? (Pillar alignment, no negative framing, no emojis)
- How will we measure quality? (SEO scores, engagement benchmarks, conversion targets)
- What is the feedback loop? (Review cadence, iteration process)

---

## Campaign Plan YAML Structure

Every campaign plan is stored at `/campaigns/active/{campaign-name}/plan.yaml`:

```yaml
campaign:
  name: "Q2 2026 Patient Engagement Launch"
  id: "campaign-q2-2026-pe-launch"
  status: PLANNED  # PLANNED | IN_PROGRESS | IN_REVIEW | APPROVED | PUBLISHED
  created: "2026-03-04"
  updated: "2026-03-04"

objective:
  business_goal: "Generate 200 demo bookings from healthcare CMOs in UAE and KSA"
  primary_metric: "demo_bookings"
  target_value: 200
  secondary_metrics:
    - metric: "website_traffic"
      target: 50000
    - metric: "content_engagement_rate"
      target: 0.045

audience:
  primary_persona: "Healthcare CMO / Operations Leader"
  markets: ["UAE", "KSA"]
  awareness_level: "problem-aware"
  pain_points:
    - "High no-show rates consuming revenue"
    - "Manual patient communication across fragmented channels"
    - "No attribution from ad spend to booked appointments"

budget:
  total: 50000
  currency: "USD"
  allocation:
    google_ads: 20000
    meta_ads: 15000
    content_production: 8000
    email_marketing: 2000
    tools_and_subscriptions: 5000

timeline:
  start_date: "2026-04-01"
  end_date: "2026-06-30"
  milestones:
    - date: "2026-03-25"
      milestone: "All content assets approved"
    - date: "2026-04-01"
      milestone: "Campaign launch"
    - date: "2026-04-15"
      milestone: "First optimization cycle"
    - date: "2026-06-30"
      milestone: "Campaign wrap and reporting"

channels:
  - channel: "google_ads"
    role: "Capture high-intent healthcare SaaS searches"
    formats: ["search", "display"]
  - channel: "meta_ads"
    role: "Awareness and retargeting for healthcare leaders"
    formats: ["feed", "stories", "reels"]
  - channel: "linkedin_organic"
    role: "Thought leadership and product education"
    formats: ["posts", "articles", "carousels"]
  - channel: "email"
    role: "Nurture leads through demo booking"
    formats: ["drip_sequence", "newsletter"]
  - channel: "blog"
    role: "SEO and AEO content for organic discovery"
    formats: ["long_form", "comparison", "how_to"]

deliverables:
  - id: "del-001"
    type: "blog_post"
    title: "How AI Agents Reduce No-Shows in Healthcare"
    workflow: "content-writer"
    channel: "blog"
    due_date: "2026-03-20"
    status: PLANNED
    dependencies: []
  - id: "del-002"
    type: "social_image"
    title: "Patient engagement infographic"
    workflow: "image-creator"
    channel: "linkedin_organic"
    due_date: "2026-03-22"
    status: PLANNED
    dependencies: []
  - id: "del-003"
    type: "video_short"
    title: "60s product demo reel"
    workflow: "video-producer"
    channel: "meta_ads"
    due_date: "2026-03-25"
    status: PLANNED
    dependencies: ["del-002"]

kpis:
  - metric: "demo_bookings"
    target: 200
    measurement: "GA4 conversion events + CRM tracking"
  - metric: "cost_per_demo"
    target: 250
    measurement: "Total spend / demo bookings"
  - metric: "roas"
    target: 3.0
    measurement: "Revenue attributed / ad spend"

pillar_alignment:
  increase_revenue: "Full-funnel ads to demo pipeline with attribution"
  reduce_no_shows: "Content educating on automated reminder workflows"
  patient_satisfaction: "Showcase unified patient communication experience"
```

---

## Calendar Entry YAML Structure

Each deliverable becomes a calendar entry in `/calendar/2026/Q{n}.yaml`:

```yaml
calendar_entries:
  - id: "cal-2026-03-20-001"
    campaign_id: "campaign-q2-2026-pe-launch"
    deliverable_id: "del-001"
    date: "2026-03-20"
    type: "blog_post"
    title: "How AI Agents Reduce No-Shows in Healthcare"
    channel: "blog"
    workflow: "content-writer"
    status: PLANNED
    assignee: "cmo-runtime"
    dependencies: []
    notes: "Target keyword: reduce no-shows healthcare. 2000+ words."
```

---

## Status Lifecycle

Every deliverable and campaign moves through this lifecycle:

```
PLANNED --> IN_PROGRESS --> IN_REVIEW --> APPROVED --> PUBLISHED
```

| Status | Meaning |
|--------|---------|
| `PLANNED` | Defined in plan, not yet started |
| `IN_PROGRESS` | Actively being created by a workflow |
| `IN_REVIEW` | Submitted for human review and feedback |
| `APPROVED` | Human approved, ready for publishing or launch |
| `PUBLISHED` | Live, published, or launched |

Status is tracked in `/campaigns/active/{campaign-name}/status.yaml`:

```yaml
campaign_status:
  campaign_id: "campaign-q2-2026-pe-launch"
  overall_status: IN_PROGRESS
  deliverables:
    - id: "del-001"
      status: IN_REVIEW
      current_version: 2
      last_updated: "2026-03-18"
    - id: "del-002"
      status: IN_PROGRESS
      current_version: 1
      last_updated: "2026-03-17"
```

---

## Workflow Process

### Step 1: Brief Intake
Read all relevant knowledge files:
- `/knowledge/brand/` for brand identity, voice, visual guidelines
- `/knowledge/audience/` for persona definitions and pain points
- `/knowledge/product/` for feature details and pillar mappings
- `/campaigns/active/` for existing campaigns and calendar density

Ask the 5-layer questioning framework. Do not proceed until all layers are addressed.

### Step 2: Plan Generation
Draft the campaign plan as YAML following the structure above. Every plan must:
- Connect objectives to at least one of the three Zavis pillars (Increase Revenue, Reduce No-Shows, Patient Satisfaction)
- Include specific, measurable KPIs
- Map every deliverable to a specific workflow skill
- Define dependencies between deliverables
- Allocate budget with rationale

### Step 3: Calendar Population
Convert each deliverable into a calendar entry. Ensure:
- No scheduling conflicts with existing calendar items
- Dependencies are respected (image before social post, blog before email link)
- Buffer time for review cycles (minimum 2 business days between IN_REVIEW and target publish date)

### Step 4: Human Review
Present the complete plan for approval:
- Campaign summary (1 paragraph)
- Budget breakdown table
- Timeline visualization (key milestones)
- Full deliverables list with dates and dependencies
- KPI targets

Human can: approve, modify, or reject. If modified, update plan.yaml and re-present.

### Step 5: Execution Queue
Once approved, deliverables enter the execution queue:
- Ordered by dependency chain, then by due date
- Each item triggers its assigned workflow skill (image-creator, content-writer, video-producer, etc.)
- Status updates propagate back to status.yaml

### Step 6: Status Tracking
Continuously update status.yaml as deliverables progress. Flag:
- Items at risk of missing deadlines
- Blocked items (dependency not yet complete)
- Items requiring re-review after feedback

---

## Zavis-Specific Rules

1. **Every campaign must connect to at least one pillar.** Most should connect to all three. The `pillar_alignment` field in plan.yaml is mandatory.
2. **Healthcare-first language.** All campaign briefs use "patient" not "customer", reference healthcare workflows, and ground examples in clinic and hospital operations.
3. **Target markets matter.** UAE and KSA campaigns may need Arabic language variants. India campaigns should consider WhatsApp-first distribution. UK campaigns should reference NHS-adjacent language.
4. **Demo booking is the north star metric.** Unless explicitly stated otherwise, the primary conversion for Zavis campaigns is a demo booking.
5. **Attribution is non-negotiable.** Every campaign must define UTM parameters, GCLID/FBCLID tracking, and conversion event definitions before launch.

---

## Quality Checks Before Presenting Plan

- [ ] All 5 question layers addressed
- [ ] Every deliverable mapped to a workflow skill
- [ ] Dependencies form a valid DAG (no circular dependencies)
- [ ] Budget allocations sum to total budget
- [ ] KPI targets are specific and measurable
- [ ] Pillar alignment is explicit for the campaign
- [ ] Calendar entries do not conflict with existing items
- [ ] Review buffer time is built into the timeline
- [ ] Attribution tracking is defined
- [ ] Healthcare compliance considerations noted

---

## Cross-Workflow Dependencies

This skill feeds ALL other workflows:
- **Image Creator** receives briefs for social images, ad banners, thumbnails
- **Video Producer** receives briefs for video content with scripts and direction
- **Content Writer** receives briefs for blog posts, landing pages, ad copy
- **Ad Manager** receives campaign structure, budgets, and audience definitions
- **Social Publisher** receives content calendar and publishing schedule
- **Email Marketer** receives email campaign briefs and sequences
- **SEO Optimizer** receives keyword targets and content priorities
- **Analytics Reporter** receives KPI definitions and reporting cadence
- **AEO Optimizer** receives entity and query targets for AI visibility
