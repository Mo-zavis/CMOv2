# Analytics & Performance Reporting Skill

## When to Use
Activate this skill whenever:
- Generating weekly or monthly marketing performance reports
- Analyzing cross-channel campaign performance (paid, organic, email, social)
- Calculating ROI, ROAS, CPA, or other campaign efficiency metrics
- Investigating performance anomalies (traffic drops, conversion spikes, spend irregularities)
- Building attribution analysis (which channels drive demo bookings)
- Comparing performance across markets (UAE, KSA, India, UK)
- Creating executive summaries for marketing leadership
- Feeding performance insights back to campaign planning and optimization

---

## Tools

| Tool | Type | Role |
|------|------|------|
| Google Analytics 4 | `[API]` | Web traffic, user behavior, conversions, audience insights |
| Google Ads API | `[API]` | Paid search/display spend, impressions, clicks, conversions, ROAS |
| Meta Marketing API | `[API]` | Paid social spend, impressions, clicks, conversions, ROAS |
| Google Search Console | `[API]` | Organic search performance (queries, clicks, impressions, CTR, position) |
| SendGrid | `[API]` | Email performance (sends, opens, clicks, bounces, unsubscribes) |
| Platform APIs (LinkedIn, YouTube, Instagram, X, TikTok, Facebook) | `[API]` | Social engagement metrics |
| Claude Code | `[Native]` | Data analysis, insight generation, report writing, anomaly detection |

---

## Zavis-Specific Metrics

### Primary Conversion: Demo Bookings
Demo bookings are the north star metric for Zavis marketing. Every report must include:
- Total demo bookings in the period
- Demo bookings by channel (Google Ads, Meta Ads, organic search, email, social, direct)
- Demo bookings by market (UAE, KSA, India, UK)
- Cost per demo booking by channel
- Demo-to-customer conversion rate (if CRM data is available)

### Healthcare SaaS Metrics
| Metric | Definition | Target |
|--------|-----------|--------|
| CAC (Customer Acquisition Cost) | Total marketing spend / new customers | Track and optimize downward |
| LTV (Lifetime Value) | Average revenue per customer over lifetime | Track for LTV:CAC ratio |
| LTV:CAC Ratio | LTV / CAC | Target 3:1 or higher |
| Demo-to-Close Rate | Customers / demo bookings | Track, benchmark by channel |
| Cost per Demo | Total spend / demo bookings | Target: varies by channel |
| ROAS (Return on Ad Spend) | Revenue attributed / ad spend | Target 3x+ |
| MQL-to-Demo Rate | Demo bookings / marketing qualified leads | Track conversion funnel |
| Time-to-Demo | Average days from first touch to demo booking | Optimize downward |

### Attribution Chain
```
Ad Click / Organic Visit / Social Click / Email Click
  --> Landing Page Visit (GA4 session)
    --> Lead Captured (form fill, chat initiation, WhatsApp inquiry)
      --> MQL (marketing qualified based on criteria)
        --> Demo Booked (primary conversion)
          --> Customer Closed (revenue attributed)
```

Track attribution at every stage. Preserve UTM, GCLID, FBCLID through the entire chain.

---

## Report Structures

### Weekly Summary Report
Generated every Monday for the previous week.

```yaml
weekly_report:
  period: "2026-02-24 to 2026-03-02"
  generated: "2026-03-03"

  executive_summary: |
    Marketing generated 24 demo bookings this week, up 20% from the previous week.
    Google Ads drove 12 demos at $185 CPA (below $200 target). Meta Ads drove 8 demos
    at $210 CPA. Organic search traffic increased 8% with two target keywords entering
    the top 10. Email nurture sequence converted 4 leads to demos.

  demo_bookings:
    total: 24
    previous_week: 20
    change_pct: 20
    by_channel:
      google_ads: 12
      meta_ads: 8
      organic_search: 2
      email: 4
      social_organic: 1
      direct: 1
    by_market:
      uae: 14
      ksa: 6
      india: 3
      uk: 1

  paid_media:
    total_spend: 4850
    google_ads:
      spend: 2600
      impressions: 45000
      clicks: 890
      ctr: 0.0198
      cpc: 2.92
      conversions: 12
      cpa: 216.67
      roas: null  # Calculated when revenue data available
    meta_ads:
      spend: 2250
      impressions: 120000
      clicks: 2100
      ctr: 0.0175
      cpc: 1.07
      conversions: 8
      cpa: 281.25
      roas: null

  organic:
    sessions: 8900
    previous_week: 8200
    change_pct: 8.5
    top_landing_pages:
      - url: "/features/ai-agents"
        sessions: 1200
      - url: "/blog/reduce-no-shows-healthcare"
        sessions: 890
    keyword_highlights:
      - keyword: "patient engagement platform"
        position: 8
        change: +3

  email:
    campaigns_sent: 2
    total_sent: 4800
    open_rate: 0.312
    click_rate: 0.042
    conversions: 4

  social:
    total_posts: 12
    total_engagements: 1450
    top_platform: "linkedin"
    top_post_engagements: 380

  anomalies: []

  action_items:
    - "Increase Google Ads budget for no-show reduction keywords (CPA below target)"
    - "Refresh Meta Ads creative (CTR declining week-over-week)"
    - "Create new blog content for patient engagement platform keyword (entered top 10)"
```

### Monthly Deep-Dive Report
Generated on the first business day of each month.

```yaml
monthly_report:
  period: "2026-02"
  generated: "2026-03-03"

  executive_summary: |
    February delivered 89 demo bookings against a target of 80, exceeding goal by 11%.
    Total marketing spend was $18,200 against a $20,000 budget (91% utilization).
    Blended cost per demo was $204, below the $250 target. Organic traffic grew 15%
    month-over-month with 5 target keywords now in the top 20.

  kpi_scorecard:
    - metric: "Demo Bookings"
      target: 80
      actual: 89
      status: "exceeded"
    - metric: "Cost per Demo"
      target: 250
      actual: 204
      status: "exceeded"
    - metric: "Marketing Spend"
      budget: 20000
      actual: 18200
      utilization: 0.91
    - metric: "Organic Traffic"
      target: 35000
      actual: 38200
      change_pct: 15

  channel_breakdown:
    google_ads:
      spend: 8400
      demos: 38
      cpa: 221
      top_campaigns:
        - name: "Search | No-Show Reduction | UAE"
          spend: 3200
          demos: 18
          cpa: 178
        - name: "Search | Patient Engagement | KSA"
          spend: 2800
          demos: 12
          cpa: 233
      recommendations:
        - "Scale no-show reduction campaign (CPA 20% below target)"
        - "Test new ad copy for patient engagement campaign (CTR declining)"

    meta_ads:
      spend: 6800
      demos: 28
      cpa: 243
      top_ad_sets:
        - name: "Lookalike | Demo Bookers | UAE"
          spend: 2400
          demos: 14
          cpa: 171
        - name: "Interest | Healthcare CMOs | KSA"
          spend: 1800
          demos: 8
          cpa: 225
      recommendations:
        - "Expand lookalike audience from 1% to 2% (seed audience performing well)"
        - "Refresh creative for interest targeting (frequency above 3.5)"

    organic_search:
      sessions: 38200
      demos: 12
      top_keywords:
        - keyword: "patient engagement platform"
          position: 8
          clicks: 890
        - keyword: "reduce no-shows healthcare"
          position: 11
          clicks: 560
      recommendations:
        - "Create comparison page: Zavis vs competitors for patient engagement"
        - "Optimize /features/automations (keyword: appointment reminder system)"

    email:
      campaigns_sent: 8
      total_sent: 19200
      avg_open_rate: 0.298
      avg_click_rate: 0.039
      demos: 9
      recommendations:
        - "Test shorter subject lines (under 40 chars) for mobile optimization"
        - "Add case study email to drip sequence after Day 3"

    social_organic:
      total_posts: 48
      total_engagements: 5800
      demos: 2
      top_platform: "linkedin"
      recommendations:
        - "Increase video content on LinkedIn (3x engagement vs. image posts)"
        - "Start TikTok healthcare tech series (competitor gaining traction)"

  market_breakdown:
    uae:
      demos: 48
      spend: 9200
      cpa: 192
    ksa:
      demos: 24
      spend: 5600
      cpa: 233
    india:
      demos: 12
      spend: 2400
      cpa: 200
    uk:
      demos: 5
      spend: 1000
      cpa: 200

  attribution_analysis:
    first_touch:
      google_ads: 0.42
      meta_ads: 0.28
      organic: 0.18
      email: 0.07
      social: 0.03
      direct: 0.02
    last_touch:
      google_ads: 0.38
      meta_ads: 0.31
      organic: 0.14
      email: 0.10
      social: 0.04
      direct: 0.03

  content_performance:
    top_blog_posts:
      - title: "How AI Agents Reduce No-Shows in Healthcare"
        sessions: 2400
        avg_time: 245
        conversions: 3
      - title: "Patient Engagement Platform: Complete Guide"
        sessions: 1800
        avg_time: 312
        conversions: 2

  strategic_recommendations:
    - category: "Budget"
      recommendation: "Shift $1,000 from Meta interest targeting to Google no-show reduction campaign"
      rationale: "Google no-show campaign has 20% lower CPA and room to scale"
    - category: "Content"
      recommendation: "Prioritize 3 new blog posts targeting top content gap keywords"
      rationale: "Content gap analysis shows 3 high-volume keywords with low difficulty"
    - category: "Creative"
      recommendation: "Produce 2 new video ads for Meta (current creative showing fatigue)"
      rationale: "Meta ad frequency above 3.5, CTR declining week-over-week"
```

---

## Workflow Process

### Step 1: Data Collection
Pull data from all active channels:
- **GA4:** Sessions, users, pageviews, conversions, events, bounce rate, time on site
- **Google Ads:** Spend, impressions, clicks, CTR, CPC, conversions, CPA, ROAS
- **Meta Ads:** Spend, impressions, reach, clicks, CTR, CPC, conversions, CPA, ROAS
- **GSC:** Queries, clicks, impressions, CTR, average position
- **Email (SendGrid):** Sends, deliveries, opens, clicks, bounces, unsubscribes, conversions
- **Social platforms:** Posts published, impressions, engagements, followers, clicks
- Store raw snapshots in `/analytics/snapshots/{date}/`

### Step 2: Aggregation
Combine cross-channel data into a unified view:
- Total marketing spend across all channels
- Total conversions (demo bookings) by channel
- Blended CPA and channel-specific CPA
- Traffic by source (paid, organic, social, email, direct)
- Conversion funnel: visits -> leads -> MQLs -> demos -> customers

### Step 3: Analysis
Analyze the aggregated data:
- **Performance vs. targets:** How is each channel performing against KPI targets?
- **Trends:** Is performance improving, stable, or declining? Over what timeframe?
- **Top and bottom performers:** Which campaigns, ad groups, keywords, content pieces are winning or losing?
- **Channel efficiency:** Which channels have the best CPA? Which have the most room to scale?
- **Market performance:** How do UAE, KSA, India, and UK compare?

### Step 4: Anomaly Detection
Flag unusual patterns:
- Traffic drops of 20%+ day-over-day or week-over-week
- CPC spikes above 2x normal for any campaign
- Conversion rate drops below 50% of the trailing 30-day average
- Email bounce rates above 5%
- Social engagement drops of 50%+ post-over-post
- Budget overspend or underspend of 20%+ vs. pacing

For each anomaly:
- Identify possible cause (algorithm change, ad disapproval, site issue, seasonal)
- Recommend investigation or action
- Flag urgency (critical: requires immediate action, warning: monitor closely, info: note for context)

### Step 5: Report Generation
Generate the appropriate report format:
- **Weekly:** Summary metrics, highlights, anomalies, quick action items
- **Monthly:** Full deep-dive with channel breakdowns, market analysis, attribution, strategic recommendations
- Store reports in `/analytics/reports/{report-type}-{date}.yaml`
- Include visualizations where possible: trend lines, bar charts (described in YAML for rendering in web UI)

### Step 6: Human Review
Present the report with:
- Executive summary (3-5 sentences capturing the most important insights)
- KPI scorecard (target vs. actual for all key metrics)
- Top recommendations (prioritized, actionable, with rationale)
- Anomaly alerts (if any)
- Human reviews insights and approves or modifies strategic recommendations

### Step 7: Action Loop
Feed recommendations back to other workflows:
- **Campaign Planner:** Budget reallocation, new campaign initiatives, priority shifts
- **Ad Manager:** Pause/scale campaigns, creative refresh, audience adjustments
- **Content Writer:** New content priorities based on performance data
- **SEO Optimizer:** Organic search insights and keyword opportunities
- **Social Publisher:** Content type and posting cadence adjustments
- **Email Marketer:** Subject line and send time optimization

---

## Quality Checks

- [ ] Data pulled from all active channels (no channel missing)
- [ ] Demo booking numbers reconciled across GA4 and CRM
- [ ] Spend numbers match platform reports (no discrepancies above 5%)
- [ ] All metrics calculated correctly (CPA = spend / conversions, ROAS = revenue / spend)
- [ ] Anomalies flagged with cause analysis and recommended action
- [ ] Report follows the standard structure (executive summary, scorecard, breakdowns, recommendations)
- [ ] Recommendations are specific, actionable, and include rationale
- [ ] Market breakdown is included (UAE, KSA, India, UK)
- [ ] Attribution analysis uses consistent methodology
- [ ] Report is stored in `/analytics/reports/` with correct naming

---

## Cross-Workflow Dependencies

This skill:
- **Receives data from** ALL other workflows: ad spend (Ad Manager), organic traffic (SEO Optimizer), social engagement (Social Publisher), email performance (Email Marketer)
- **Feeds into** Campaign Planner: strategic insights, budget recommendations, priority shifts
- **Feeds into** Ad Manager: campaign optimization recommendations
- **Feeds into** Content Writer: content performance insights
- **Feeds into** SEO Optimizer: organic search performance data
- **Feeds into** Social Publisher: engagement analysis and posting recommendations
- **Feeds into** Email Marketer: email performance trends and optimization suggestions
