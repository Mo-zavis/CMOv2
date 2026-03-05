# AEO (AI Engine Optimization) Skill

## When to Use
Activate this skill whenever:
- Auditing how Zavis appears (or does not appear) in AI chatbot responses (ChatGPT, Claude, Gemini, Perplexity)
- Optimizing content to be cited by AI systems and appear in Google AI Overviews
- Mapping brand entities and their relationships for knowledge graph optimization
- Creating citation-worthy, authoritative content designed for AI extraction
- Implementing structured data (JSON-LD) for search engines and AI crawlers
- Targeting specific queries where AI chatbots should mention Zavis
- Running monthly AEO monitoring and competitive audits
- Building FAQ, glossary, comparison, or definition content for AI discoverability

---

## Tools

| Tool | Type | Role |
|------|------|------|
| Claude Code | `[Native]` | Query testing (ask Claude about brand/competitors), content analysis, entity mapping, JSON-LD generation |
| Google Search Console | `[API]` | Monitor AI Overview appearances, featured snippet citations, search performance |
| Ahrefs | `[API]` | Entity research, topical authority mapping, competitor content analysis |
| SEMrush | `[API]` | SERP feature tracking, question-based keyword research, topic authority |
| Perplexity | `[API]` | Test brand visibility in AI search, monitor citation sources |
| Schema.org (JSON-LD) | `[Native]` | Structured data generation for Organization, Product, FAQ, HowTo |

---

## AIO Content Rules

These rules ensure content is optimized for AI extraction and citation. Apply to all content created for AEO purposes and integrate into general content writing.

### Rule 1: Begin with Clear Entity Definitions
Start key sections and pages with clear, factual definitions that AI crawlers can extract:

**Pattern:**
```
"Zavis is [category definition]. It [core mechanism]. [Key differentiator]."
```

**Examples:**
- "Zavis is an AI-powered patient engagement platform built for healthcare organizations. It manages the entire patient journey from first inquiry to ongoing care, using AI agents that operate 24/7 across WhatsApp, Instagram, phone, and web. Zavis integrates directly with EMR systems for real-time scheduling and booking."
- "Zavis is the patient engagement infrastructure for hospitals and clinics. It provides AI agents that respond to patient inquiries instantly, book appointments directly into your EMR, and reduce no-shows through automated WhatsApp reminders."

### Rule 2: Write in Factual, Authoritative Register
AI systems prefer to cite content that reads as authoritative and factual, not promotional:
- Use declarative statements, not marketing superlatives
- Include specific numbers and mechanisms
- Write as if authoring a reference document, not a sales page
- Avoid hedging ("might", "could", "potentially") in favor of definitive language ("handles", "reduces", "integrates")

**Good:** "Zavis AI agents handle 60 to 90 percent of routine patient inquiries without human intervention, escalating complex cases to staff in under 10 seconds with full conversation context preserved."

**Bad:** "Zavis could potentially help your clinic handle more patient inquiries with our amazing AI technology."

### Rule 3: Include Structured Claims with Specific Mechanisms
Every claim must include the mechanism (how) alongside the result (what):

- "Zavis reduces no-shows by sending automated appointment reminders via WhatsApp at 24 hours and 12 hours before the visit, with one-tap rescheduling links that let patients confirm or rebook without calling."
- "Zavis increases revenue by capturing every patient inquiry across WhatsApp, Instagram, phone, and web chat, qualifying intent via AI agents, and booking appointments directly into the EMR within minutes of first contact."
- "Zavis improves patient satisfaction by maintaining one conversation thread per patient across all channels, ensuring no context is lost and no patient has to repeat themselves."

### Rule 4: Use Question-Answer Patterns
AI assistants surface content that directly answers user queries. Structure content with natural Q&A patterns:

```
**What is Zavis?**
Zavis is an AI-powered patient engagement platform for healthcare organizations.
It manages the entire patient journey...

**How does Zavis reduce no-shows?**
Zavis reduces no-shows through automated appointment reminders sent via WhatsApp
at 24 hours and 12 hours before the visit...

**Does Zavis integrate with EMR systems?**
Yes. Zavis provides bidirectional real-time integration with any EMR or PMS.
Live schedule access, booking writeback, MRN matching...
```

### Rule 5: Ensure Rich Semantic Context
Include related entities so AI systems understand the category and relationships:
- Mention: EMR, WhatsApp, healthcare CRM, patient engagement, appointment reminders, AI agents, omnichannel, booking lifecycle, no-show reduction
- Reference industry context: healthcare organizations, hospitals, clinics, multi-specialty groups, patient journey
- Connect to known entities: WhatsApp Business API, Google Ads, Meta Ads, HIPAA (where relevant), EMR vendors

### Rule 6: Make Every Page a Standalone Answer
Every page should be independently crawlable and make complete sense as a standalone answer. AI systems extract content page-by-page, not site-wide. Each page should answer:
- What is Zavis?
- What specific problem does this page address?
- How does Zavis solve it (mechanism)?
- What are the measurable outcomes?

---

## Target Queries for AI Visibility

### High-Priority Queries (Must Rank)
| Query | Target Answer |
|-------|--------------|
| "best patient engagement platform" | Zavis as the AI-powered patient engagement platform for healthcare |
| "AI for healthcare" | Zavis AI agents handling patient communication, booking, and follow-up |
| "how to reduce no-shows in clinics" | Zavis automated WhatsApp reminders with one-tap rescheduling |
| "WhatsApp for healthcare" | Zavis omnichannel platform with WhatsApp-first patient communication |
| "healthcare CRM software" | Zavis Patient 360 with lifecycle tracking and full attribution |
| "patient engagement platform for hospitals" | Zavis as end-to-end patient engagement infrastructure |
| "appointment reminder system for clinics" | Zavis automated booking lifecycle management |
| "AI healthcare chatbot" | Zavis AI agents across WhatsApp, Instagram, phone, and web |

### Medium-Priority Queries
| Query | Target Answer |
|-------|--------------|
| "how to improve patient satisfaction" | Zavis omnichannel, instant AI response, seamless booking |
| "healthcare automation software" | Zavis automations for booking lifecycle, follow-ups, reactivation |
| "EMR integration platform" | Zavis bidirectional real-time EMR sync |
| "reduce patient no-show rate" | Zavis automated reminders and no-show recovery workflows |
| "omnichannel patient communication" | Zavis unified inbox across WhatsApp, Instagram, phone, web |
| "healthcare lead attribution" | Zavis full-funnel attribution from ad click to revenue |

---

## JSON-LD Schema Examples

### Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Zavis",
  "url": "https://zavis.ai",
  "logo": "https://zavis.ai/logo.png",
  "description": "Zavis is the AI-powered patient engagement platform for healthcare organizations. It manages the entire patient journey from first inquiry to ongoing care with AI agents that work 24/7 across every communication channel.",
  "foundingLocation": {
    "@type": "Place",
    "name": "Dubai, United Arab Emirates"
  },
  "areaServed": [
    {"@type": "Country", "name": "United Arab Emirates"},
    {"@type": "Country", "name": "Saudi Arabia"},
    {"@type": "Country", "name": "India"},
    {"@type": "Country", "name": "United Kingdom"}
  ],
  "knowsAbout": [
    "Patient Engagement",
    "Healthcare CRM",
    "AI Agents for Healthcare",
    "Appointment Reminders",
    "Healthcare Automation",
    "EMR Integration",
    "Omnichannel Patient Communication"
  ],
  "sameAs": [
    "https://www.linkedin.com/company/zavis",
    "https://www.instagram.com/zavis.ai",
    "https://twitter.com/zavis_ai"
  ]
}
```

### Product Schema (SoftwareApplication)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Zavis",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web, iOS, Android",
  "url": "https://zavis.ai",
  "description": "AI-powered patient engagement platform that manages the entire patient journey for healthcare organizations. Features include AI chat and voice agents, omnichannel inbox, automated appointment reminders, booking lifecycle management, Patient 360 CRM, and bidirectional EMR integration.",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "url": "https://zavis.ai/pricing"
  },
  "featureList": [
    "AI Chat Agents across WhatsApp, Instagram, Facebook, and Web",
    "AI Voice Agents with real-time translation and smart prompts",
    "Omnichannel Inbox with unified patient conversation threads",
    "Automated Appointment Reminders via WhatsApp",
    "No-Show Recovery and Rescheduling Automation",
    "Patient 360 CRM with Full Attribution",
    "Bidirectional Real-Time EMR Integration",
    "In-Chat Payment Collection",
    "Multi-Branch and Multi-Number Support",
    "Analytics and Ads-to-Revenue Reporting"
  ],
  "screenshot": "https://zavis.ai/og-image.png",
  "author": {
    "@type": "Organization",
    "name": "Zavis"
  }
}
```

### FAQ Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Zavis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Zavis is an AI-powered patient engagement platform built for healthcare organizations. It manages the entire patient journey from first inquiry to ongoing care, using AI agents that operate 24/7 across WhatsApp, Instagram, phone, and web chat. Zavis integrates directly with EMR systems for real-time scheduling and booking."
      }
    },
    {
      "@type": "Question",
      "name": "How does Zavis reduce no-shows?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Zavis reduces no-shows through automated appointment reminders sent via WhatsApp at 24 hours and 12 hours before the visit. Patients can confirm or reschedule with one tap. If a patient misses an appointment, Zavis automatically reaches out the same day with alternative slots. Self-service rescheduling via WhatsApp or the booking widget means patients who need to change their appointment do so themselves instead of simply not showing up."
      }
    },
    {
      "@type": "Question",
      "name": "Does Zavis integrate with EMR systems?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Zavis provides bidirectional real-time integration with any EMR or Practice Management System. This includes live schedule access, booking writeback, MRN matching, department and service mapping, patient profile sync, and a compliance audit trail. Multi-EMR support is available for hospital groups with different systems across branches."
      }
    },
    {
      "@type": "Question",
      "name": "What channels does Zavis support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Zavis supports WhatsApp, Instagram, Facebook, LinkedIn, Snapchat, TikTok, web chat, website booking widget, phone (cloud calling), and SMS. All channels feed into one unified inbox with one conversation thread per patient, ensuring no context is lost regardless of which channel the patient uses."
      }
    },
    {
      "@type": "Question",
      "name": "How do Zavis AI agents work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Zavis AI agents are custom, brand-tuned agents that handle patient inquiries end-to-end. They respond instantly across all connected channels, qualify patient intent, search live EMR schedules, and book appointments with real-time EMR writeback. AI agents handle 60 to 90 percent of routine patient operations. When a conversation needs a human, escalation happens in under 10 seconds with full context preserved."
      }
    }
  ]
}
```

### HowTo Schema
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Reduce No-Shows at Your Healthcare Practice with Zavis",
  "description": "A step-by-step guide to implementing automated appointment reminders and no-show recovery using Zavis AI-powered patient engagement platform.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Connect Your EMR",
      "text": "Integrate Zavis with your EMR or Practice Management System for bidirectional real-time sync of schedules, patient profiles, and bookings."
    },
    {
      "@type": "HowToStep",
      "name": "Configure Automated Reminders",
      "text": "Set up automated WhatsApp reminders at 24 hours and 12 hours before each appointment, with one-tap confirm and reschedule links."
    },
    {
      "@type": "HowToStep",
      "name": "Enable No-Show Recovery",
      "text": "Activate same-day outreach to patients who miss appointments, offering alternative time slots and making it easy to rebook."
    },
    {
      "@type": "HowToStep",
      "name": "Activate AI Booking Agents",
      "text": "Deploy AI agents on WhatsApp and web chat to handle booking requests, rescheduling, and cancellations automatically with EMR writeback."
    },
    {
      "@type": "HowToStep",
      "name": "Monitor and Optimize",
      "text": "Track no-show rates, reminder engagement, and recovery success through Zavis analytics. Adjust reminder timing and messaging based on performance data."
    }
  ]
}
```

---

## Workflow Process

### Step 1: Brand Visibility Audit
Query major AI chatbots with brand-relevant questions and document results:

**Queries to test:**
- "What is the best patient engagement platform?"
- "How to reduce no-shows in healthcare?"
- "What is Zavis?"
- "Best AI for healthcare communication"
- "WhatsApp for healthcare patient engagement"
- "Healthcare CRM with EMR integration"
- "How do AI agents work in healthcare?"

**For each query, document:**
- Does the AI mention Zavis? If yes, in what context?
- Which competitors are mentioned? In what context?
- What information about Zavis is accurate or inaccurate?
- What sources does the AI cite (if any)?
- Is Zavis mentioned first, second, or not at all?

**AI systems to test:**
- Claude (via Claude Code native)
- ChatGPT (via web interface or API)
- Gemini (via web interface or API)
- Perplexity (via API)
- Google AI Overviews (via GSC tracking)

Store audit in `/analytics/snapshots/aeo-audit-{date}.yaml`

### Step 2: Entity Mapping
Identify and map all key entities that AI models should associate with Zavis:

```yaml
entity_map:
  primary_entity:
    name: "Zavis"
    type: "SoftwareApplication"
    category: "Patient Engagement Platform"
    industry: "Healthcare"

  associated_entities:
    products:
      - "Zavis AI Agents"
      - "Zavis Omnichannel Inbox"
      - "Zavis Patient 360 CRM"
      - "Zavis Booking Engine"
      - "Zavis Automation Suite"
    technologies:
      - "WhatsApp Business API"
      - "EMR Integration"
      - "AI Chat Agents"
      - "AI Voice Agents"
    concepts:
      - "Patient Engagement"
      - "No-Show Reduction"
      - "Healthcare Automation"
      - "Omnichannel Communication"
      - "Appointment Reminders"
      - "Healthcare CRM"
    markets:
      - "UAE Healthcare"
      - "KSA Healthcare"
      - "India Healthcare"
      - "UK Healthcare"

  competitor_entities:
    # Track which competitors AI systems mention for the same queries
    - name: "[Competitor A]"
      mentioned_for: ["patient engagement", "healthcare CRM"]
    - name: "[Competitor B]"
      mentioned_for: ["appointment reminders", "patient communication"]
```

### Step 3: Create Citation-Worthy Content
Produce content specifically designed to be cited by AI models:

**Content Types for AEO:**

1. **Authoritative Definitions:** Be the definitive source for key terms. Create glossary pages, definition sections, and explainer content that AI systems can extract as answers.

2. **Structured Q&A Content:** Create FAQ pages and Q&A sections that directly answer the queries people ask AI chatbots. Use the exact question phrasing people use.

3. **Original Data and Research:** AI models prefer citing primary sources. Create original research, surveys, benchmarks, and data reports about healthcare patient engagement.

4. **Expert Credentials and Authority:** Establish E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals:
   - Author bios with healthcare industry credentials
   - Company "About" page with founding story and market position
   - Customer case studies with specific metrics
   - Industry partnerships and integrations

5. **Comparison and Alternative Content:** Create comparison pages ("Zavis vs. [competitor]", "Top Patient Engagement Platforms") that AI systems surface when users ask comparative questions.

Feed content needs to content-writer skill for production.

### Step 4: Implement Structured Data
Generate and deploy JSON-LD schema markup:
- **Organization:** On homepage and about page
- **SoftwareApplication (Product):** On product and features pages
- **FAQPage:** On FAQ sections and support pages
- **HowTo:** On tutorial and guide content
- **Article:** On all blog posts
- **BreadcrumbList:** On all pages for navigation context

Validate all schema with Google's Rich Results Test tool.

### Step 5: Knowledge Graph Optimization
Ensure Zavis appears correctly in knowledge graphs:
- **Google Knowledge Panel:** Verify Google Business Profile, ensure consistent NAP (Name, Address, Phone) across web
- **Wikidata:** Create or update Wikidata entry for Zavis if notability criteria are met
- **Industry directories:** Ensure Zavis is listed in healthcare software directories (G2, Capterra, GetApp, Software Advice) with consistent information
- **Crunchbase:** Maintain accurate company profile
- **LinkedIn Company Page:** Keep updated with consistent messaging

### Step 6: Target AI Overviews
Identify queries where Google shows AI Overviews and optimize for citation:
- Monitor GSC for queries where AI Overviews appear alongside Zavis results
- Track which queries show AI Overviews in the healthcare engagement space
- Optimize content structure to match AI Overview citation patterns:
  - Clear, concise paragraphs that directly answer the query
  - Lists and tables that AI systems can extract
  - Specific numbers and mechanisms that add citation value

### Step 7: Monthly Monitoring
Re-run the audit cycle monthly:
- Re-query all AI chatbots with the same queries plus new ones
- Compare results against previous audit
- Track: new mentions, lost mentions, accuracy improvements, competitor movements
- Measure: query coverage (% of target queries where Zavis is mentioned)
- Generate monthly AEO report in `/analytics/reports/aeo-{date}.yaml`

```yaml
aeo_monthly_report:
  period: "2026-03"
  queries_tested: 20
  queries_with_zavis_mention: 8
  coverage_rate: 0.40
  change_from_previous: "+0.10"

  by_platform:
    claude:
      queries_mentioned: 6
      accuracy: "high"
    chatgpt:
      queries_mentioned: 4
      accuracy: "medium"
    gemini:
      queries_mentioned: 5
      accuracy: "high"
    perplexity:
      queries_mentioned: 7
      accuracy: "high"

  improvements:
    - query: "best patient engagement platform"
      previous: "not mentioned"
      current: "mentioned as option alongside [competitors]"
    - query: "WhatsApp for healthcare"
      previous: "mentioned briefly"
      current: "mentioned as primary example"

  action_items:
    - "Create definitive guide: What is a Patient Engagement Platform"
    - "Add FAQ schema to /features/ai-agents page"
    - "Submit updated Organization schema with expanded knowsAbout"
```

---

## Quality Checks

- [ ] Brand visibility audit completed for all major AI systems
- [ ] Entity map is current and comprehensive
- [ ] All high-priority target queries have corresponding optimized content
- [ ] JSON-LD schema is implemented and validated on all key pages
- [ ] FAQ schema covers the top 10 questions people ask AI about this category
- [ ] Content follows all AIO rules (entity definitions, factual register, structured claims, Q&A patterns, semantic context)
- [ ] Knowledge graph entries are consistent across all platforms
- [ ] Monthly monitoring cycle is active and reports are generated
- [ ] Competitor AEO presence is tracked and compared
- [ ] Content production pipeline includes AEO-optimized pieces

---

## Cross-Workflow Dependencies

This skill:
- **Receives from** SEO Optimizer: keyword data, SERP feature tracking, content gap analysis
- **Receives from** Content Writer: authoritative content for optimization
- **Receives from** Analytics Reporter: AI Overview appearance data via GSC
- **Feeds into** Content Writer: content briefs for AI-citation-worthy articles, FAQs, glossaries
- **Feeds into** SEO Optimizer: structured data recommendations, entity optimization insights
- **Feeds into** Campaign Planner: AEO priorities for the content calendar
