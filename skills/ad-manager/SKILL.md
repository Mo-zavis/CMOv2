# Paid Ad Campaign Management Skill

## When to Use
Activate this skill whenever:
- Creating new Google Ads or Meta Ads campaigns
- Managing existing ad campaigns (budget changes, audience adjustments, creative swaps)
- Building audience segments for paid advertising
- Preparing ad creatives (copy + visuals) for campaign upload
- Reviewing ad performance and making optimization recommendations
- Setting up conversion tracking and attribution
- Any task involving paid media spend on Google or Meta platforms

**CRITICAL RULE: Ads NEVER auto-publish. Every campaign launch requires explicit human approval. This is a budget commitment and must always be manually authorized.**

---

## Tools

| Tool | Type | Role |
|------|------|------|
| Google Ads API v17 | `[API]` | Campaign CRUD, bidding strategies, targeting, keyword management, reporting |
| Meta Marketing API | `[API]` | Campaign CRUD, audience building, creative upload, placement, reporting |
| Google Analytics 4 | `[API]` | Conversion tracking, audience insights, attribution data |
| Google Tag Manager | `[API]` | Conversion tag management, event tracking setup |
| Claude Code | `[Native]` | Ad copy writing, strategy, budget optimization, reporting |

---

## Campaign Structure Patterns

### Google Ads Structure
```
Account
  └── Campaign (one per objective/product/market)
        ├── Campaign Settings
        │     ├── Objective: Leads / Sales / Traffic / Awareness
        │     ├── Budget: Daily budget
        │     ├── Bidding: Target CPA / Maximize Conversions / Manual CPC
        │     ├── Network: Search / Display / YouTube
        │     ├── Locations: UAE, KSA, India, UK
        │     └── Schedule: Start date, end date, day-parting
        │
        └── Ad Groups (one per theme/keyword cluster)
              ├── Keywords (exact, phrase, broad match)
              ├── Negative Keywords
              ├── Audiences (observation or targeting)
              └── Ads
                    ├── Responsive Search Ads (15 headlines, 4 descriptions)
                    ├── Responsive Display Ads (images + headlines)
                    └── Video Ads (YouTube pre-roll, in-feed)
```

### Meta Ads Structure
```
Ad Account
  └── Campaign (one per objective)
        ├── Campaign Settings
        │     ├── Objective: Leads / Conversions / Traffic / Awareness
        │     ├── Budget: Lifetime or daily (campaign or ad set level)
        │     ├── Bid Strategy: Lowest cost / Cost cap / Bid cap
        │     └── Special Ad Category: None (unless healthcare-restricted)
        │
        └── Ad Sets (one per audience/placement)
              ├── Audience
              │     ├── Custom Audiences (website, email list, engagement)
              │     ├── Lookalike Audiences (1-10% from seed)
              │     ├── Interest Targeting (healthcare, management, technology)
              │     └── Demographics (age, location, job title)
              ├── Placements: Feed, Stories, Reels, Audience Network
              ├── Schedule: Start/end dates, dayparting
              └── Ads
                    ├── Single Image Ads
                    ├── Carousel Ads
                    ├── Video Ads
                    └── Collection Ads
```

---

## Audience Targeting for Healthcare

### Google Ads Audiences
**Search Intent Keywords:**
- High intent: "patient engagement platform", "healthcare CRM software", "clinic management system"
- Medium intent: "reduce no-shows healthcare", "appointment reminder software", "WhatsApp for clinics"
- Broad: "healthcare automation", "AI in healthcare", "patient communication"

**Display/YouTube Audiences:**
- In-market: Healthcare software, CRM software, Business management software
- Affinity: Business professionals, Healthcare industry
- Custom intent: URLs of competitors (competitors' websites, healthcare SaaS review pages)

**Negative Keywords (always exclude):**
- "free", "open source", "jobs", "salary", "career", "training", "course", "certification"
- Patient-side queries: "book appointment near me", "doctor near me", "clinic near me"
- Unrelated healthcare: "medical equipment", "pharmaceuticals", "clinical trials"

### Meta Ads Audiences
**Job Title Targeting:**
- Chief Marketing Officer, CMO, VP Marketing
- Chief Operating Officer, COO, VP Operations
- Hospital Administrator, Clinic Manager, Practice Manager
- Patient Experience Director, Contact Center Manager
- Healthcare IT Director, CTO (healthcare)

**Industry Targeting:**
- Hospital and Healthcare
- Medical Practice
- Health, Wellness and Fitness

**Custom Audiences:**
- Website visitors (Pixel-based, 30/60/90 day windows)
- Email list uploads (prospect and customer lists)
- Video viewers (25%, 50%, 75%, 95% watched)
- Lead form engagers
- Instagram/Facebook page engagers

**Lookalike Audiences:**
- 1% lookalike from demo bookers (highest value)
- 1% lookalike from website converters
- 2-3% lookalike from email subscribers (broader reach)

---

## Attribution and Tracking Setup

### UTM Parameter Standards
Every ad must include UTM parameters in the destination URL:

```
https://zavis.ai/demo?
  utm_source={platform}        # google, meta, linkedin
  &utm_medium={medium}         # cpc, paid_social, display
  &utm_campaign={campaign_id}  # campaign-q2-2026-pe-launch
  &utm_content={ad_id}         # ad-search-noshows-v1
  &utm_term={keyword}          # reduce-no-shows-healthcare (Google only)
```

### Conversion Tracking
| Conversion Event | Platform | Trigger |
|-----------------|----------|---------|
| Demo Booking | GA4 + Google Ads + Meta | Form submission on /demo/thank-you |
| Lead Form Submit | Meta | On-platform lead form completion |
| Key Page View | GA4 | /pricing, /features, /demo page views |
| Engaged Session | GA4 | 60+ seconds OR 2+ page views |

### GCLID / FBCLID Preservation
- Google Ads auto-appends GCLID to destination URLs
- Meta auto-appends FBCLID to destination URLs
- Zavis CRM must capture and store these IDs on every lead for full attribution
- Attribution chain: Ad Click (GCLID/FBCLID) -> Lead Captured -> Demo Booked -> Customer Closed -> Revenue Attributed

---

## Campaign Setup YAML Structure

```yaml
ad_campaign:
  id: "adcam-2026-03-04-001"
  campaign_id: "campaign-q2-2026-pe-launch"
  platform: "google_ads"  # google_ads | meta_ads
  status: DRAFT  # DRAFT | PENDING_APPROVAL | APPROVED | LIVE | PAUSED | ENDED
  created: "2026-03-04"

  campaign_settings:
    name: "Zavis | Search | No-Show Reduction | UAE+KSA"
    objective: "leads"
    budget:
      type: "daily"
      amount: 150
      currency: "USD"
    bidding:
      strategy: "target_cpa"
      target_cpa: 200
    schedule:
      start_date: "2026-04-01"
      end_date: "2026-06-30"
    locations: ["AE", "SA"]
    languages: ["en", "ar"]
    network: "search"

  ad_groups:
    - name: "No-Show Reduction"
      keywords:
        exact: ["patient no-show solution", "reduce no-shows healthcare"]
        phrase: ["appointment reminder system", "no-show reduction"]
        broad: ["healthcare appointment reminders"]
      negative_keywords: ["free", "jobs", "training", "near me"]
      ads:
        - type: "responsive_search"
          headlines:
            - "Reduce No-Shows by 40%+"
            - "AI Appointment Reminders"
            - "Zavis Patient Engagement"
            - "WhatsApp Reminders for Clinics"
            - "Automated Booking Lifecycle"
          descriptions:
            - "AI agents send reminders via WhatsApp at 24h and 12h. Patients confirm or reschedule in one tap. Book a demo."
            - "Full booking lifecycle management. Confirmations, reminders, and no-show recovery. Built for healthcare."
          final_url: "https://zavis.ai/features/automations?utm_source=google&utm_medium=cpc&utm_campaign=adcam-2026-03-04-001"

  tracking:
    utm_source: "google"
    utm_medium: "cpc"
    utm_campaign: "adcam-2026-03-04-001"
    conversion_events: ["demo_booking", "key_page_view"]
    gclid: true
```

---

## Workflow Process

### Step 1: Define Campaign
Read the campaign brief from campaign-planner:
- What is the advertising objective? (Leads, conversions, traffic, awareness)
- What is the budget? (Daily or lifetime, per platform)
- What is the target geography and audience?
- Which platform(s)? (Google, Meta, or both)
- What is the campaign timeline?
- What is the target CPA or ROAS?

### Step 2: Build Audiences
Create audience segments based on the campaign brief:
- **Google:** Select keywords, build negative keyword lists, set audience layers
- **Meta:** Build custom audiences, create lookalikes, set interest/demographic targeting
- Document audience strategy in campaign YAML

### Step 3: Prepare Creatives
Pull approved assets from upstream workflows:
- Ad copy from content-writer (headlines, descriptions, CTAs)
- Images from image-creator (platform-specific dimensions)
- Videos from video-producer (15s, 30s variants)
- Generate 3-5 ad variations for A/B testing
- Ensure all creatives comply with platform policies (no prohibited healthcare claims, no misleading content)

### Step 4: Create Campaign via API
Build the campaign structure in the platform:
- Create campaign with settings (objective, budget, bidding, schedule)
- Create ad groups/ad sets with targeting
- Upload creatives and ad copy
- Set tracking parameters (UTM, conversion events)
- Save campaign in DRAFT status (NOT live)

### Step 5: HUMAN APPROVAL REQUIRED
**This step is mandatory and cannot be bypassed.**

Present the complete campaign for human review:
- Campaign structure tree (campaign -> ad groups -> ads)
- Budget breakdown and projected spend
- Audience targeting summary
- All ad creative previews (mock device previews: mobile feed, desktop feed, stories)
- Ad copy for every variation
- Tracking and attribution setup
- Estimated performance (impressions, clicks, conversions based on platform forecasts)

Human must explicitly approve before any campaign goes live. Document approval in campaign YAML.

### Step 6: Launch
After human approval:
- Activate campaign in the platform
- Verify tracking is firing correctly (test conversion pixels)
- Set up automated alerts for spend anomalies
- Update campaign status to `LIVE`

### Step 7: Monitor
Daily performance monitoring:
- Pull metrics: spend, impressions, clicks, CTR, CPC, conversions, CPA, ROAS
- Store daily snapshots in `/analytics/snapshots/ads/{date}.yaml`
- Flag anomalies: CPC spikes, conversion drops, budget pacing issues
- Check ad disapprovals and policy issues

### Step 8: Optimize
Based on performance data:
- Pause underperforming ads (CTR below threshold, CPA above target)
- Increase budget on top performers
- Adjust bids based on CPA trends
- Refine audience targeting (exclude non-converting segments)
- Rotate in new creative variants to combat ad fatigue
- Add new negative keywords based on search term reports
- Present optimization recommendations for human approval before major changes

### Step 9: Report
Weekly and monthly performance reports:
- Spend vs. budget pacing
- Key metrics: CPA, ROAS, CTR, conversion rate
- Top performing ads, ad groups, keywords, audiences
- Recommendations for next optimization cycle
- Feed data to analytics-reporter skill

---

## Healthcare Compliance Considerations

1. **No guaranteed medical outcomes.** Ad copy cannot promise specific health outcomes. Focus on operational outcomes (reduced no-shows, faster booking, revenue attribution).
2. **No patient data in targeting.** Never upload patient health data to ad platforms. Use operational data only (email lists of prospects, website visitors).
3. **Special Ad Category.** Meta may flag healthcare-adjacent ads. If required, enable the "Social Issues, Elections, or Politics" or "Credit, Employment, Housing" category. Healthcare SaaS typically does not require special category designation, but monitor for policy flags.
4. **Landing page compliance.** Ensure landing pages have privacy policy, terms of service, and clear product descriptions. No misleading claims.
5. **Regional regulations.** UAE and KSA may have specific advertising regulations for healthcare-related products. Ensure ad copy and landing pages comply with local requirements.

---

## Quality Checks Before Presenting for Approval

- [ ] Campaign structure is logical (one campaign per objective/market)
- [ ] Budget allocations are within approved limits
- [ ] Audience targeting is specific to healthcare decision-makers
- [ ] Negative keywords exclude irrelevant traffic
- [ ] All ad copy follows Zavis writing rules (no em dashes, no emojis, no negative framing, no questions)
- [ ] Ad creatives are platform-approved dimensions
- [ ] UTM parameters are set correctly on all destination URLs
- [ ] Conversion tracking is configured and tested
- [ ] GCLID/FBCLID preservation is verified
- [ ] A/B test variants are set up (minimum 3 ad variations per ad group)
- [ ] Healthcare compliance considerations are addressed
- [ ] Campaign is in DRAFT status (NOT live) pending approval

---

## Cross-Workflow Dependencies

This skill:
- **Receives from** Campaign Planner: campaign briefs, budgets, audience definitions
- **Receives from** Image Creator: ad creative images at platform-specific dimensions
- **Receives from** Video Producer: video ad creatives
- **Receives from** Content Writer: ad copy (headlines, descriptions, CTAs)
- **Feeds into** Analytics Reporter: ad spend and performance data
- **Feeds into** Campaign Planner: performance data for budget reallocation decisions
