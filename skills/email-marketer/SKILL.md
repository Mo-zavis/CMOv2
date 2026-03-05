# Email Campaign Creation & Sending Skill

## When to Use
Activate this skill whenever:
- Creating promotional email campaigns (product launches, feature announcements, offers)
- Writing and sending newsletters (monthly updates, industry insights, thought leadership)
- Building drip sequences (demo follow-up, onboarding, re-engagement, nurture)
- Designing email HTML templates
- Managing email audience segments
- A/B testing subject lines or email content
- Monitoring email deliverability and performance
- Any task involving email as a communication channel for marketing

---

## Tools

| Tool | Type | Role |
|------|------|------|
| SendGrid (Twilio) | `[API]` | Primary ESP: email sending, templates, analytics, deliverability |
| Claude Code | `[Native]` | Email copywriting, subject line generation, HTML template writing, strategy |

**Alternative ESPs (if SendGrid is not primary):**
| Mailchimp | `[API]` | Email campaigns, audience management, templates |
| Brevo (Sendinblue) | `[API]` | Email + SMS, automation workflows |
| Klaviyo | `[API]` | E-commerce email, advanced segmentation |

---

## Email Types and Strategy

### Promotional Emails
- Product launch announcements
- Feature releases and updates
- Event invitations (webinars, demos, conferences)
- Special offers or limited-time campaigns
- Case study and customer story highlights

### Newsletters
- Monthly industry insights and trends
- Product update roundups
- Healthcare AI and patient engagement thought pieces
- Curated content from the Zavis blog
- Upcoming events and milestones

### Drip Sequences
**Demo Follow-Up Sequence:**
1. Day 0: Demo confirmation and what to expect
2. Day 1: Key takeaways and feature highlights from the demo
3. Day 3: Case study relevant to their specialty
4. Day 7: ROI calculator or value proposition deep-dive
5. Day 14: Check-in, additional questions, offer second demo

**Nurture Sequence (Non-Demo Leads):**
1. Day 0: Welcome, introduce Zavis and the three pillars
2. Day 3: Blog content on their primary pain point
3. Day 7: Product feature spotlight relevant to their role
4. Day 14: Customer story from a similar organization
5. Day 21: Demo invitation with personalized CTA

**Re-Engagement Sequence (Inactive Contacts):**
1. Day 0: "We have been building something" update email
2. Day 7: New feature or improvement highlight
3. Day 14: Final engagement attempt with strong CTA
4. Day 21: If no engagement, suppress from active lists

---

## Email HTML Best Practices

### Technical Requirements
- **Width:** 600px maximum for the email body. Use a centered table layout.
- **CSS:** Inline CSS only. Email clients strip `<style>` tags inconsistently.
- **Images:** Include `alt` text for every image. Use absolute URLs for image sources.
- **Responsive:** Use fluid tables and media queries where supported. Stack columns on mobile.
- **Dark mode:** Test dark mode rendering. Use transparent PNGs. Set background colors explicitly on both `<td>` and `<table>` elements. Avoid relying on white backgrounds for contrast.
- **Fonts:** Use web-safe font stacks with fallbacks. Bricolage Grotesque may not render in email clients; use Arial or Helvetica as fallback for body, Georgia for serif headers.
- **Button CTAs:** Use bulletproof buttons (VML for Outlook, padded `<a>` tags for others). Minimum touch target: 44px height.
- **Preheader text:** Include a preheader (the text that appears after the subject line in inbox preview). 40-130 characters.
- **Unsubscribe:** Every email must include a clear, one-click unsubscribe link. Required by CAN-SPAM, GDPR, and regional laws.
- **Physical address:** Include the sender's physical mailing address in the footer. Required by CAN-SPAM.

### Email Template Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Subject Line Here</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f8f6; font-family: Arial, Helvetica, sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Preheader text goes here (40-130 characters)
  </div>

  <!-- Email Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f6;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Inner Container (600px max) -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <img src="https://zavis.ai/logo.png" alt="Zavis" width="120" style="display: block;">
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <h1 style="color: #1c1c1c; font-size: 24px; line-height: 1.3; margin: 0 0 12px 0;">
                Headline: Affirmative Statement
              </h1>
              <p style="color: #444444; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Body copy: mechanism and pillar connection.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #006828; border-radius: 6px;">
                    <a href="https://zavis.ai/demo?utm_source=email&utm_medium=email&utm_campaign=CAMPAIGN_ID"
                       style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                      Book a Demo
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f8f6; border-radius: 0 0 8px 8px;">
              <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                Zavis | AI-Powered Patient Engagement for Healthcare<br>
                Dubai, United Arab Emirates<br>
                <a href="{{unsubscribe_url}}" style="color: #999999;">Unsubscribe</a> |
                <a href="https://zavis.ai/privacy" style="color: #999999;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Subject Line Writing Rules

### A/B Testing
Always write 2-3 subject line variants for A/B testing:

**Variant A (Mechanism-focused):** Shows how something works
- "AI agents book patients into your EMR while you sleep"
- "How automated WhatsApp reminders cut no-shows by 40%"

**Variant B (Outcome-focused):** Shows the result
- "Your clinic schedule, fully booked, every day"
- "Revenue recovered: what happens when every call gets answered"

**Variant C (Curiosity-driven):** Creates information gap
- "The 3 AM inquiry that became a booked appointment"
- "What your front desk cannot do at midnight"

### Subject Line Rules
- 30-50 characters for mobile optimization (most engagement)
- No emojis in subject lines
- No all-caps words
- No spam trigger words (free, guaranteed, act now, limited time, urgent)
- Include the primary value proposition or pain point
- Personalization tokens where available: "{{first_name}}, your clinic schedule just got smarter"
- Preview text (preheader) complements the subject line, does not repeat it

---

## Workflow Process

### Step 1: Define Campaign
Read the brief from campaign-planner:
- What type of email? (Promotional, newsletter, drip sequence)
- What is the goal? (Demo bookings, event registrations, engagement, re-activation)
- Who is the audience segment? (All leads, demo requesters, inactive contacts, specific market)
- When should it send? (Immediate, scheduled, triggered by event)
- Is this part of a sequence or standalone?

### Step 2: Segment Audience
Build the audience segment:
- Pull contact data from CRM/ESP
- Apply segmentation criteria: role, market, engagement level, lifecycle stage, service interest
- Ensure suppression lists are applied (unsubscribed, bounced, complained)
- Estimate segment size and projected send volume
- Document segment criteria in campaign YAML

### Step 3: Write Copy
Write the email content following Zavis content writing rules:
- **Subject lines:** 2-3 A/B variants following subject line rules
- **Preheader:** 40-130 characters complementing the subject line
- **Body copy:** Copy hierarchy (headline, subhead, body, CTA). Every section connects to a pillar.
- **CTA:** Action-oriented button text ("Book a Demo", "See the Feature", "Read the Full Story")
- No em dashes. No emojis. No negative framing. No question headlines.
- "Patient" not "customer" throughout.
- Three-pillar messaging in every email: even if one pillar is primary, reference the others.

### Step 4: Design HTML
Build the email HTML template:
- Follow the HTML best practices above
- 600px max width, inline CSS, responsive tables
- Use brand colors: #006828 (green CTA), #1c1c1c (text), #f8f8f6 (background), #ffffff (content area)
- Pull images from image-creator if needed (email headers, product screenshots)
- Test dark mode rendering
- Include proper tracking pixels and UTM parameters on all links

### Step 5: Deliverability Check
Before sending, verify:
- **Spam score:** Run through a spam checker. Target score below 2.0 (SpamAssassin scale).
- **Link validation:** All links resolve correctly, no broken URLs
- **Image rendering:** All images have alt text and load correctly
- **Unsubscribe link:** Present and functional
- **Physical address:** Included in footer
- **Authentication:** SPF, DKIM, DMARC records are configured for the sending domain
- **List hygiene:** Remove bounces, complaints, and long-term unengaged (no open in 6+ months)

### Step 6: Present Preview
Show the email for human approval:
- Multi-client preview: how it renders in Gmail (web + mobile), Outlook (desktop + web), Apple Mail
- Subject line variants for A/B test selection
- Preheader text preview in inbox context
- Spam score results
- Audience segment summary (size, criteria)
- Scheduled send time

### Step 7: Send
After approval:
- Schedule send via ESP API (SendGrid)
- Set A/B test parameters (50/50 or 80/20 split, winner after 4 hours)
- Configure send throttling if list is large (warm up new sending domains)
- Set tracking: open tracking, click tracking, conversion tracking
- Log send confirmation with batch ID

### Step 8: Track Performance
Post-send monitoring:
- **Real-time (0-4h):** Delivery rate, bounce rate, initial opens
- **Short-term (24-48h):** Open rate, click rate, click-to-open rate, unsubscribe rate
- **Mid-term (7d):** Conversion rate (demo bookings, event registrations), revenue attributed
- **Long-term (30d):** Drip sequence completion rate, engagement trends

Key metrics and benchmarks:
| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Delivery rate | 98%+ | Below 95% |
| Open rate | 25-35% | Below 15% |
| Click rate | 3-5% | Below 1.5% |
| Unsubscribe rate | Below 0.3% | Above 0.5% |
| Bounce rate | Below 2% | Above 5% |
| Spam complaint rate | Below 0.1% | Above 0.1% |

Feed performance data to analytics-reporter skill.

---

## Email Campaign YAML Structure

```yaml
email_campaign:
  id: "email-2026-03-04-001"
  campaign_id: "campaign-q2-2026-pe-launch"
  type: "promotional"  # promotional | newsletter | drip_sequence
  status: DRAFT  # DRAFT | PENDING_APPROVAL | SCHEDULED | SENT | COMPLETED
  created: "2026-03-04"

  audience:
    segment: "healthcare-cmos-uae-ksa"
    criteria:
      role: ["CMO", "VP Marketing", "COO", "Operations Director"]
      market: ["UAE", "KSA"]
      lifecycle_stage: ["lead", "engaged"]
    estimated_size: 2400
    suppressions: ["unsubscribed", "bounced", "complained"]

  content:
    subject_lines:
      - variant: "A"
        text: "AI agents book patients into your EMR while you sleep"
        type: "mechanism"
      - variant: "B"
        text: "Your clinic schedule, fully booked, every day"
        type: "outcome"
    preheader: "See how healthcare organizations fill every appointment slot automatically"
    body_asset_id: "copy-2026-03-04-email-001"
    html_template: "/templates/email/promotional-v1.html"
    images:
      - asset_id: "img-2026-03-04-email-header"
        placement: "hero"

  send_config:
    scheduled_time: "2026-03-06T09:00:00+04:00"
    ab_test:
      enabled: true
      split: "50/50"
      winner_criteria: "open_rate"
      winner_wait: "4h"
    throttle: null
    from_name: "Zavis"
    from_email: "hello@zavis.ai"
    reply_to: "hello@zavis.ai"

  tracking:
    utm_source: "email"
    utm_medium: "email"
    utm_campaign: "email-2026-03-04-001"
    open_tracking: true
    click_tracking: true
    conversion_event: "demo_booking"

  pillar_connection: "increase_revenue"
```

---

## Zavis-Specific Email Rules

1. **Three-pillar messaging in every email.** Even if the email focuses on one pillar, reference the others. "AI agents book appointments directly into your EMR (revenue). Automated reminders keep patients on track (no-shows). One conversation thread across every channel (satisfaction)."
2. **Healthcare prospect nurturing.** Email sequences should follow the healthcare buying cycle: awareness of the problem, understanding the solution category, evaluating Zavis specifically, requesting a demo, post-demo follow-up.
3. **Demo booking is the primary CTA.** Unless the email is a newsletter or awareness piece, the primary CTA should drive toward a demo booking.
4. **Market-specific considerations.** UAE/KSA emails may need bilingual content (English + Arabic). Send times should respect local business hours and cultural considerations (avoid Fridays in UAE/KSA).
5. **No em dashes, no emojis, no negative framing.** These rules apply to email copy exactly as they apply to all other content.
6. **Consent-aware sending.** Only email contacts who have opted in. Maintain suppression lists rigorously. Comply with GDPR (UK, potentially EU contacts), UAE data protection laws, and CAN-SPAM.

---

## Quality Checks Before Sending

- [ ] Subject lines follow rules (30-50 chars, no emojis, no spam words, no all-caps)
- [ ] A/B test variants are meaningfully different
- [ ] Preheader text complements (not repeats) the subject line
- [ ] Body copy follows all Zavis writing rules
- [ ] Three-pillar messaging is present
- [ ] CTA is action-oriented and links to the correct URL with UTM parameters
- [ ] HTML renders correctly in Gmail, Outlook, and Apple Mail
- [ ] Dark mode rendering is acceptable
- [ ] Images have alt text and load correctly
- [ ] Unsubscribe link is present and functional
- [ ] Physical address is in the footer
- [ ] Spam score is below 2.0
- [ ] All links resolve correctly
- [ ] Audience segment is correct and suppressions are applied
- [ ] Send time is appropriate for target market timezone

---

## Cross-Workflow Dependencies

This skill:
- **Receives from** Campaign Planner: email campaign briefs, sequence definitions, audience segments
- **Receives from** Content Writer: email body copy, subject lines
- **Receives from** Image Creator: email header images, product screenshots
- **Feeds into** Analytics Reporter: email performance metrics (opens, clicks, conversions)
- **Feeds into** Campaign Planner: engagement data for audience segmentation refinement
