# Social Media Publishing & Scheduling Skill

## When to Use
Activate this skill whenever:
- Publishing or scheduling posts to LinkedIn, YouTube, Instagram, X, TikTok, Facebook, or Pinterest
- Adapting existing content for platform-specific formatting
- Building a social media publishing schedule
- Monitoring post-publish engagement metrics
- Writing platform-native captions with hashtags and CTAs
- Cross-posting content across multiple platforms with per-platform adaptations
- Managing social media content calendar entries

---

## Tools

| Tool | Type | Role |
|------|------|------|
| LinkedIn API | `[API]` | Post publishing, article publishing, analytics |
| YouTube Data API v3 | `[API]` | Video upload, metadata, scheduling, thumbnail |
| Instagram Graph API | `[API]` | Post/Reel publishing via Facebook API, stories |
| X (Twitter) API v2 | `[API]` | Tweet publishing, media upload, threads |
| TikTok Content Posting API | `[API]` | Video upload, scheduling |
| Facebook Graph API | `[API]` | Post publishing, page management, stories |
| Pinterest API v5 | `[API]` | Pin creation, board management |
| Buffer | `[API]` | Cross-platform scheduling (alternative to direct APIs) |
| Claude Code | `[Native]` | Caption writing, hashtag research, content adaptation |

---

## Platform-Specific Formatting Rules

### LinkedIn
- **Character limit:** 3,000 characters for posts, 120,000 for articles
- **Hashtags:** 3-5 hashtags at the end of the post (not in body text)
- **Image dimensions:** 1200 x 627 (landscape), 1080 x 1080 (square), 1080 x 1350 (portrait)
- **Video:** Up to 10 minutes, landscape preferred, subtitles mandatory
- **Carousel:** PDF upload, 1080 x 1080 or 1080 x 1350, up to 300 pages
- **Best posting times:** Tuesday through Thursday, 8-10 AM and 12-1 PM (target market timezone)
- **Tone:** Professional thought leadership, B2B healthcare insights, industry commentary
- **CTA style:** "Comment below" / "Share your experience" / "Link in comments" (LinkedIn deprioritizes posts with links in body)
- **Zavis strategy:** Primary B2B platform. Healthcare CMO and operations leader audience. Thought leadership, product insights, customer stories, industry data.

### YouTube
- **Title:** Up to 100 characters (keep under 70 for full display)
- **Description:** Up to 5,000 characters. First 2-3 lines visible above fold.
- **Tags:** Up to 500 characters total. Include primary keyword, variations, and brand name.
- **Thumbnail:** 1280 x 720, max 2MB, custom thumbnail strongly recommended
- **Shorts:** Vertical 1080 x 1920, 15-60 seconds, #Shorts in title or description
- **Chapters:** Add timestamps in description for videos over 3 minutes
- **Zavis strategy:** Product demos, feature walkthroughs, customer stories, healthcare technology education. Shorts for quick tips and feature highlights.

### Instagram
- **Caption:** Up to 2,200 characters (first 125 visible before "more")
- **Hashtags:** Up to 30, place in first comment or at end of caption. Use 15-20 for optimal reach.
- **Image dimensions:** 1080 x 1080 (square), 1080 x 1350 (portrait, highest engagement), 1080 x 566 (landscape)
- **Stories:** 1080 x 1920, up to 60 seconds per story frame
- **Reels:** 1080 x 1920, 15-90 seconds, captions mandatory, trending audio helps
- **Carousel:** Up to 10 slides, 1080 x 1080 or 1080 x 1350
- **Best posting times:** Monday through Friday, 11 AM - 1 PM and 7 PM - 9 PM
- **Zavis strategy:** Visual healthcare stories, behind-the-scenes at clinics, product UI showcases, healthcare team spotlights, educational carousels.

### X (Twitter)
- **Character limit:** 280 characters (X Premium: 25,000)
- **Hashtags:** 1-2 maximum (X penalizes hashtag-heavy posts)
- **Image dimensions:** 1600 x 900 (16:9), up to 4 images per tweet
- **Video:** Up to 2 minutes 20 seconds (140 seconds)
- **Thread:** Use threads for longer narratives (each tweet 280 chars)
- **Best posting times:** Monday through Friday, 8-10 AM and 12-1 PM
- **Tone:** Sharp, concise, opinion-driven. Industry commentary and real-time relevance.
- **Zavis strategy:** Healthcare industry commentary, quick insights, product updates, engaging with healthcare technology conversations.

### TikTok
- **Caption:** Up to 2,200 characters
- **Hashtags:** 3-5, mix of broad and niche
- **Video:** 1080 x 1920 (vertical), 15-60 seconds optimal (up to 10 minutes)
- **Best posting times:** Tuesday through Thursday, 10 AM - 12 PM and 7 PM - 9 PM
- **Tone:** Native, authentic, fast-paced. Not corporate. Even B2B content should feel organic.
- **Zavis strategy:** Healthcare tech tips, "day in the life" at a smart clinic, AI agent demonstrations, quick product features. Keep it authentic and educational, not salesy.

### Facebook
- **Character limit:** 63,206 characters (but engagement drops after 80 characters for the preview)
- **Hashtags:** 1-2 maximum, or none
- **Image dimensions:** 1200 x 630 (landscape), 1080 x 1080 (square)
- **Video:** Up to 240 minutes, 1080p recommended
- **Best posting times:** Monday through Friday, 1 PM - 4 PM
- **Zavis strategy:** Community building, healthcare industry news sharing, event promotion, longer-form content. Lower priority than LinkedIn for B2B.

### Pinterest
- **Pin description:** Up to 500 characters
- **Hashtags:** Up to 20 (in description)
- **Pin dimensions:** 1000 x 1500 (2:3, standard), 1000 x 2100 (long pin)
- **Best posting times:** Saturday and Sunday, 8 PM - 11 PM; weekdays 2 PM - 4 PM
- **Zavis strategy:** Infographics, data visualizations, healthcare workflow diagrams, educational visual content. Lower priority but useful for SEO link equity.

---

## Workflow Process

### Step 1: Content Adaptation
Take approved assets from upstream workflows and adapt for each platform:
- **From Image Creator:** Resize images for platform-specific dimensions
- **From Video Producer:** Ensure video meets platform duration and format requirements
- **From Content Writer:** Adapt blog content into platform-native captions

Adaptation rules:
- LinkedIn: Professional, mechanism-focused, link in first comment
- Instagram: Visual-first, caption supports the image, hashtags in first comment
- X: Concise, opinion-driven, no more than 2 hashtags
- TikTok: Authentic, fast-paced, educational angle
- YouTube: SEO-optimized title and description, custom thumbnail
- Facebook: Community-oriented, longer narrative if appropriate
- Pinterest: Visual, descriptive, keyword-rich for search

### Step 2: Platform-Specific Formatting
For each post, apply the platform rules from the reference above:
- Verify character limits
- Set correct image/video dimensions
- Write platform-appropriate hashtags
- Format CTA for the platform (link in bio, link in comments, swipe up, etc.)
- Add captions/subtitles to all video content
- Generate alt text for all images

### Step 3: Scheduling
Assign publish times based on:
- Optimal posting times for each platform (see reference above)
- Target market timezones (UAE: GMT+4, KSA: GMT+3, India: GMT+5:30, UK: GMT+0/+1)
- Calendar density (avoid posting to the same platform within 2 hours)
- Campaign milestones and external events
- Store schedule in `/calendar/` entries with platform, time, and content reference

### Step 4: Human Review
Present each post for approval:
- Show platform-native preview (mock how it will appear in-feed)
- Display caption, hashtags, image/video, scheduled time
- Show all platform variants side by side for cross-platform consistency check
- Include content checklist: brand voice, pillar connection, no emojis, no em dashes, no negative framing

### Step 5: Publishing
Execute via platform APIs at scheduled time:
- Upload media assets
- Set caption, hashtags, mentions, location tags
- Schedule for the approved time
- Configurable auto-publish: if approved, posts can auto-publish at scheduled time (set in `/config/automation-rules.yaml`)
- For manual-publish preference: hold in queue until explicit publish command
- Log publish confirmation with post ID and URL

### Step 6: Engagement Monitoring
After publishing, track engagement metrics:
- **Immediate (24h):** Impressions, reach, likes, comments, shares, saves
- **Short-term (7d):** Engagement rate, click-through rate, follower growth
- **Long-term (30d):** Total reach, engagement trends, conversion attribution
- Flag posts with unusually high or low engagement for analysis
- Respond to comments if community management is needed (or flag for human response)

### Step 7: Reporting
Feed engagement data to analytics-reporter:
- Per-platform performance summary
- Top performing posts by engagement rate
- Content type analysis (image vs. video vs. carousel vs. text)
- Hashtag performance
- Best posting time analysis based on actual data
- Recommendations for content mix and posting cadence adjustments

---

## Social Post YAML Structure

```yaml
social_post:
  id: "social-2026-03-04-001"
  campaign_id: "campaign-q2-2026-pe-launch"
  content_source:
    asset_id: "img-2026-03-04-001"
    type: "image"
  status: SCHEDULED  # DRAFT | PENDING_APPROVAL | SCHEDULED | PUBLISHED | FAILED

  platforms:
    - platform: "linkedin"
      caption: |
        Healthcare coordinators spend 3 hours a day on phone calls that AI agents can handle in seconds.

        Zavis AI agents respond to patient inquiries instantly across WhatsApp, Instagram, and web chat. They qualify intent, check live EMR schedules, and book appointments directly. No hold music. No missed calls. No lost leads.

        The result: your team focuses on complex patient care while AI handles the routine. Revenue captured, patients satisfied, schedule full.

        Link in comments.
      hashtags: ["#PatientEngagement", "#HealthcareAI", "#HealthTech"]
      image: "img-2026-03-04-001-linkedin-1200x627.png"
      scheduled_time: "2026-03-05T09:00:00+04:00"
      cta: "Link to zavis.ai/demo in first comment"

    - platform: "instagram"
      caption: |
        AI agents that book patients while your front desk focuses on care.

        Instant responses on WhatsApp. Live EMR scheduling. 24/7 availability in every language your patients speak.

        This is what patient engagement looks like when it is built for healthcare.
      hashtags: ["#PatientEngagement", "#HealthcareAI", "#HealthTech", "#ClinicManagement", "#AIinHealthcare", "#PatientExperience", "#HealthcareAutomation", "#WhatsAppBusiness", "#DigitalHealth", "#MedTech"]
      image: "img-2026-03-04-001-instagram-1080x1080.png"
      scheduled_time: "2026-03-05T12:00:00+04:00"
      cta: "Link in bio"

    - platform: "x"
      caption: "Healthcare coordinators spend 3 hours a day on calls AI can handle in seconds. Zavis AI agents book patients directly into your EMR, 24/7, across every channel."
      hashtags: ["#HealthcareAI"]
      image: "img-2026-03-04-001-x-1600x900.png"
      scheduled_time: "2026-03-05T09:30:00+04:00"
      cta: "zavis.ai/demo"
```

---

## Quality Checks Before Publishing

- [ ] Caption follows Zavis writing rules (no em dashes, no emojis, no negative framing, no question headlines)
- [ ] Character count is within platform limits
- [ ] Image/video dimensions match platform requirements
- [ ] Hashtags are platform-appropriate (count and placement)
- [ ] CTA is clear and appropriate for the platform
- [ ] Scheduled time is during optimal posting window for target market
- [ ] Alt text is set for all images
- [ ] Captions/subtitles are included for all video content
- [ ] Content connects to at least one Zavis pillar
- [ ] No scheduling conflicts (2+ hour gap between posts on same platform)
- [ ] Cross-platform consistency verified (same message, adapted format)

---

## Zavis Platform Strategy Summary

| Platform | Role | Priority | Audience |
|----------|------|----------|----------|
| LinkedIn | B2B thought leadership, product education | **Primary** | Healthcare CMOs, operations leaders, IT directors |
| YouTube | Product demos, education, Shorts | **Primary** | Healthcare decision-makers, practitioners |
| Instagram | Visual healthcare stories, product showcases | **Secondary** | Healthcare professionals, clinic teams |
| X | Industry commentary, quick insights | **Secondary** | Healthcare tech community, industry analysts |
| TikTok | Authentic healthcare tech tips, product features | **Secondary** | Younger healthcare professionals, tech-savvy clinic staff |
| Facebook | Community, news sharing, events | **Tertiary** | Broader healthcare community |
| Pinterest | Infographics, visual education | **Tertiary** | Healthcare content researchers, SEO value |

---

## Cross-Workflow Dependencies

This skill:
- **Receives from** Image Creator: platform-ready images
- **Receives from** Video Producer: platform-ready videos with thumbnails
- **Receives from** Content Writer: captions, social copy, blog content to repurpose
- **Receives from** Campaign Planner: publishing schedule and calendar entries
- **Feeds into** Analytics Reporter: engagement metrics and platform performance data
