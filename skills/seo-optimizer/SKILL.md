# SEO Monitoring & Optimization Skill

## When to Use
Activate this skill whenever:
- Setting up or reviewing keyword tracking for Zavis target terms
- Running a technical SEO audit (site health, crawl issues, Core Web Vitals)
- Performing content gap analysis against competitors
- Optimizing existing content for better search rankings
- Monitoring weekly/monthly keyword position changes
- Analyzing search performance data from Google Search Console
- Generating SEO reports and action item lists
- Auditing site speed, accessibility, and SEO scores via Lighthouse
- Planning new content based on keyword opportunities

---

## Tools

| Tool | Type | Role |
|------|------|------|
| Google Search Console | `[API]` | Search performance (queries, clicks, impressions, CTR, position), index coverage, Core Web Vitals, AI Overview tracking |
| Ahrefs | `[API]` | Keyword tracking, backlink analysis, content explorer, content gap analysis, competitor research |
| SEMrush | `[API]` | Keyword research, site audit, position tracking, topic research, SERP features |
| Surfer SEO | `[API]` | On-page content optimization scoring, NLP-based content guidelines |
| Screaming Frog | `[CLI]` | Technical crawl: broken links, redirects, missing meta tags, duplicate content, page structure |
| Lighthouse | `[CLI]` | Page speed (LCP, FID, CLS), accessibility score, SEO score, best practices |
| Claude Code | `[Native]` | Analysis, recommendations, content optimization, report generation |

---

## Zavis Target Keywords

### Primary Keywords (Track Weekly)
| Keyword | Intent | Current Priority |
|---------|--------|-----------------|
| patient engagement platform | Commercial | P0 |
| healthcare CRM | Commercial | P0 |
| AI healthcare platform | Commercial | P0 |
| reduce no-shows healthcare | Commercial | P0 |
| patient communication platform | Commercial | P0 |
| healthcare automation software | Commercial | P1 |
| WhatsApp for healthcare | Informational/Commercial | P1 |
| EMR integration platform | Commercial | P1 |
| clinic management software | Commercial | P1 |
| patient booking system | Commercial | P1 |
| healthcare AI agents | Informational | P1 |
| patient retention healthcare | Informational/Commercial | P1 |
| appointment reminder system | Commercial | P1 |
| healthcare omnichannel | Informational | P2 |
| medical CRM software | Commercial | P2 |
| patient scheduling software | Commercial | P2 |
| healthcare chatbot | Informational/Commercial | P2 |
| reduce patient no-shows | Informational | P2 |

### Long-Tail Keywords (Track Monthly)
- "how to reduce no-shows in clinics"
- "best patient engagement platform for hospitals"
- "WhatsApp appointment reminders for healthcare"
- "AI agents for healthcare booking"
- "healthcare CRM with EMR integration"
- "patient communication platform UAE"
- "omnichannel patient engagement"
- "automated patient follow-up system"
- "healthcare lead attribution software"
- "clinic scheduling automation"

### Competitor Keywords to Monitor
Track which keywords competitors rank for that Zavis does not. Key competitors in the healthcare engagement space should be monitored via Ahrefs Content Gap analysis.

---

## Workflow Process

### Step 1: Baseline Setup
On initial activation or quarterly refresh:
- Connect Google Search Console API and verify site ownership
- Pull current search performance: top queries, impressions, clicks, CTR, average position
- Pull keyword rankings from Ahrefs/SEMrush for all target keywords
- Run Screaming Frog crawl for site structure baseline
- Run Lighthouse audit on key pages (homepage, features, pricing, blog)
- Store baseline in `/analytics/snapshots/seo-baseline-{date}.yaml`

```yaml
seo_baseline:
  date: "2026-03-04"
  domain: "zavis.ai"

  search_performance:
    total_clicks_28d: 12450
    total_impressions_28d: 345000
    average_ctr: 0.036
    average_position: 18.4

  keyword_rankings:
    - keyword: "patient engagement platform"
      position: 14
      impressions_28d: 8900
      clicks_28d: 312
      url: "/features/patient-engagement"
    - keyword: "healthcare CRM"
      position: 22
      impressions_28d: 12400
      clicks_28d: 198
      url: "/"

  technical_health:
    pages_crawled: 156
    broken_links: 3
    redirect_chains: 1
    missing_meta_descriptions: 7
    duplicate_titles: 2
    lighthouse_scores:
      homepage:
        performance: 82
        accessibility: 91
        seo: 95
        best_practices: 88
```

### Step 2: Weekly Keyword Tracking
Every week:
- Pull updated keyword positions from Ahrefs/SEMrush
- Compare against previous week and baseline
- Flag significant changes:
  - Position improved by 5+ places (positive signal, investigate what worked)
  - Position dropped by 5+ places (negative signal, investigate cause)
  - New keyword entered top 20 (opportunity to push to top 10)
  - Keyword fell out of top 50 (may need content refresh or new content)
- Track SERP feature presence (Featured Snippets, AI Overviews, People Also Ask)
- Store weekly snapshot in `/analytics/snapshots/seo-weekly-{date}.yaml`

### Step 3: Monthly Technical Audit
Every month:
- Run full Screaming Frog crawl:
  - Check for new broken links (404s)
  - Identify redirect chains (301 -> 301 -> destination)
  - Find missing or duplicate meta titles and descriptions
  - Check canonical tags
  - Verify robots.txt and sitemap.xml
  - Check hreflang tags (for multi-market sites: UAE, UK, India)
- Run Lighthouse on top 10 pages by traffic:
  - Performance: target 90+ (LCP < 2.5s, FID < 100ms, CLS < 0.1)
  - Accessibility: target 95+
  - SEO: target 95+
- Check Core Web Vitals via GSC:
  - Flag pages with "Poor" or "Needs Improvement" status
  - Prioritize fixes for high-traffic pages
- Store audit in `/analytics/snapshots/seo-audit-{date}.yaml`

### Step 4: Content Gap Analysis
Quarterly (or when planning new content):
- Run Ahrefs Content Gap: compare zavis.ai against top 3-5 competitors
- Identify keywords where competitors rank in top 20 but Zavis does not
- Categorize gaps by:
  - **Quick wins:** Zavis has related content but does not target the keyword specifically (optimize existing page)
  - **New content needed:** No existing Zavis content covers this topic (create new page/blog)
  - **Not relevant:** Competitor ranks for terms outside Zavis's scope (ignore)
- Prioritize by search volume, keyword difficulty, and business relevance
- Feed content needs to content-writer and campaign-planner skills

### Step 5: On-Page Optimization
For existing content that needs improvement:
- Run Surfer SEO analysis on the target page:
  - Check keyword density and placement (H1, H2, first paragraph)
  - Check heading structure and hierarchy
  - Check content length vs. top-ranking competitors
  - Check NLP terms and entities that should be included
  - Check internal linking density
- Optimize:
  - Update title tag to include primary keyword (under 60 characters)
  - Update meta description to include keyword and CTA (150-160 characters)
  - Ensure H1 contains primary keyword exactly
  - Add missing H2s with keyword variations
  - Improve internal linking (target: 1 internal link per 300 words)
  - Add FAQ section with question-based keywords (feeds AEO as well)
  - Update schema markup (Article, FAQ, HowTo as applicable)
- Queue content updates through content-writer workflow
- Re-run Surfer SEO after updates to verify improvement

### Step 6: Reporting
Monthly SEO report structure:

```yaml
seo_report:
  period: "2026-03"
  domain: "zavis.ai"

  executive_summary: |
    Organic traffic increased 12% month-over-month. Three target keywords
    entered the top 10. Technical health improved with zero critical issues.
    Content gap analysis identified 8 new content opportunities.

  search_performance:
    clicks:
      current: 14200
      previous: 12450
      change_pct: 14.1
    impressions:
      current: 389000
      previous: 345000
      change_pct: 12.8
    average_ctr:
      current: 0.0365
      previous: 0.0361
    average_position:
      current: 16.2
      previous: 18.4

  keyword_movements:
    improved:
      - keyword: "patient engagement platform"
        from: 14
        to: 8
        change: +6
    declined:
      - keyword: "healthcare chatbot"
        from: 18
        to: 25
        change: -7
    new_top_20:
      - keyword: "WhatsApp for healthcare"
        position: 16

  technical_health:
    broken_links: 0
    redirect_issues: 0
    missing_metas: 2
    core_web_vitals: "Good (all pages)"
    lighthouse_avg:
      performance: 88
      seo: 97

  content_opportunities:
    - keyword: "AI patient scheduling"
      volume: 1200
      difficulty: 34
      action: "Create new blog post"
    - keyword: "healthcare appointment automation"
      volume: 880
      difficulty: 28
      action: "Optimize /features/automations page"

  action_items:
    - priority: "P0"
      action: "Create blog: AI Patient Scheduling for Healthcare Organizations"
      owner: "content-writer"
      deadline: "2026-04-10"
    - priority: "P1"
      action: "Optimize /features/automations title tag and meta description"
      owner: "seo-optimizer"
      deadline: "2026-04-05"
    - priority: "P1"
      action: "Fix 2 missing meta descriptions on /blog/ pages"
      owner: "seo-optimizer"
      deadline: "2026-04-03"
```

### Step 7: Action Items
Generate a prioritized list of SEO tasks:
- **P0 (Do this week):** Critical technical fixes, top keyword optimization opportunities
- **P1 (Do this month):** New content for high-value gaps, on-page optimization for ranking pages
- **P2 (Next quarter):** Backlink outreach, lower-priority content creation, minor technical improvements

Feed action items to:
- **Content Writer:** New blog posts and content updates
- **Campaign Planner:** Content calendar additions and priority adjustments
- **AEO Optimizer:** Overlap between SEO and AI search optimization

---

## Healthcare SaaS SEO Strategy

### Content Pillar Structure
Organize site content into topic clusters around the three Zavis pillars:

**Pillar 1: Revenue Growth**
- Hub page: /solutions/increase-revenue
- Cluster: AI lead capture, missed-call recovery, payment collection, attribution, reactivation campaigns
- Target keywords: "healthcare lead generation", "patient acquisition platform", "healthcare revenue growth"

**Pillar 2: No-Show Reduction**
- Hub page: /solutions/reduce-no-shows
- Cluster: Appointment reminders, self-service rescheduling, no-show recovery, booking lifecycle
- Target keywords: "reduce no-shows healthcare", "appointment reminder system", "patient no-show solution"

**Pillar 3: Patient Satisfaction**
- Hub page: /solutions/patient-satisfaction
- Cluster: Omnichannel inbox, AI agents, post-visit care, self-service booking, multilingual support
- Target keywords: "patient engagement platform", "patient communication software", "patient experience technology"

### Internal Linking Strategy
- Every blog post links to its pillar hub page
- Every pillar hub page links to the homepage and to the other two pillar pages
- Feature pages link to related blog posts and vice versa
- Use descriptive anchor text with keyword variations (not "click here" or "read more")

### Backlink Strategy Considerations
- Guest posts on healthcare industry publications
- Original research and data that others cite
- Customer case studies that get shared in healthcare communities
- Healthcare conference and event sponsorships with link placements

---

## Quality Checks

- [ ] All target keywords are being tracked weekly
- [ ] Technical audit ran within the last 30 days
- [ ] No critical technical issues (broken links, missing metas, redirect chains)
- [ ] Core Web Vitals are in "Good" range for all high-traffic pages
- [ ] Content gap analysis is current (within last quarter)
- [ ] Surfer SEO scores for top 10 pages are 80+
- [ ] Monthly report is generated and delivered
- [ ] Action items are prioritized and assigned to appropriate workflows
- [ ] Internal linking structure follows the pillar model
- [ ] Schema markup is present on all key pages (Organization, Product, FAQ, HowTo)

---

## Cross-Workflow Dependencies

This skill:
- **Receives from** Content Writer: new and updated content to optimize
- **Receives from** Campaign Planner: priority topics and keyword targets
- **Feeds into** Content Writer: content briefs based on keyword opportunities and gaps
- **Feeds into** AEO Optimizer: keyword and SERP feature data for AI search overlap
- **Feeds into** Analytics Reporter: organic search performance data
- **Feeds into** Campaign Planner: SEO-driven content priorities for the calendar
