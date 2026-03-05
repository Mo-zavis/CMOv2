# Video Content Creation Skill

## When to Use
Activate this skill whenever:
- Creating YouTube Shorts, Instagram Reels, or TikTok videos
- Producing video ads for Meta or Google campaigns
- Building brand videos or product demo videos
- Creating testimonial or case study videos
- Producing educational or explainer content in video format
- Generating video thumbnails
- Any task requiring programmatic video assembly, AI footage generation, voice-over, or music

---

## Tools

| Tool | Type | Role |
|------|------|------|
| Remotion | `[CLI]` | Programmatic video rendering (React-based compositions) |
| Veo 3 (Google) | `[API]` | AI video clip generation for scenes and b-roll |
| Eleven Labs | `[API]` | Voice-over synthesis (narration, multilingual) |
| Suno | `[API]` | Background music generation (mood-matched) |
| Nano Banana (Gemini) | `[MCP]` | Thumbnail and still frame generation |
| FFmpeg | `[CLI]` | Video processing, encoding, format conversion, trimming |
| YouTube Data API | `[API]` | Upload, metadata, scheduling, publishing |
| Claude Code | `[Native]` | Script writing, Remotion composition code, creative direction |

---

## Video Format Reference

| Platform | Format | Dimensions | Duration | Notes |
|----------|--------|------------|----------|-------|
| YouTube Shorts | Vertical | 1080 x 1920 | 15-60s | Hook in first 3s, CTA in last 3s |
| Instagram Reels | Vertical | 1080 x 1920 | 15-90s | Captions mandatory, trending audio helps |
| TikTok | Vertical | 1080 x 1920 | 15-60s | Native feel, fast cuts |
| Meta Ads (Feed) | Square | 1080 x 1080 | 15-30s | Sound-off by default, captions critical |
| Meta Ads (Stories) | Vertical | 1080 x 1920 | 5-15s | Full screen, swipe-up CTA |
| YouTube Pre-roll | Landscape | 1920 x 1080 | 15-30s | Skip button at 5s, hook before 5s |
| LinkedIn Video | Landscape | 1920 x 1080 | 30-120s | Professional tone, subtitles |
| Brand Video | Landscape | 1920 x 1080 | 60-180s | Full production, storytelling arc |
| Product Demo | Landscape | 1920 x 1080 | 60-300s | Screen recording + narration |

---

## Script Structure

Every video script follows this structure. The hook is the most critical element.

### Hook (0-3 seconds)
The hook determines whether the viewer keeps watching. It must:
- Open with a bold visual or statement that stops the scroll
- Establish relevance to the viewer immediately
- Never start with a logo animation or generic intro
- Use one of these hook patterns:
  - **Problem statement:** "Your clinic lost 23 patients this week to no-shows."
  - **Bold claim:** "AI agents book patients while your front desk sleeps."
  - **Visual surprise:** A split-screen showing chaos vs. calm in patient communication.
  - **Statistic:** "67% of patients prefer booking via WhatsApp over phone calls."

### Body (3s to end minus 3s)
The body delivers the message:
- Show the mechanism (how it works), not just the outcome
- Use visual demonstrations: screen recordings, animated workflows, real clinic scenarios
- Keep scenes short (2-4 seconds each for short-form, 5-8 seconds for long-form)
- Include text overlays for key points (viewers often watch with sound off)
- Build toward the transformation: before state to after state

### CTA (final 3 seconds)
The call-to-action must be:
- Clear and specific: "Book a demo at zavis.ai" not "Learn more"
- Visually prominent with Zavis Green (#006828) background or accent
- Accompanied by the Zavis logo
- On screen for a minimum of 3 seconds

### Script Template

```yaml
script:
  title: "How AI Agents Reduce No-Shows"
  duration: 45
  format: "vertical"  # vertical | landscape | square
  platform: "instagram_reels"
  pillar: "reduce_no_shows"

  scenes:
    - scene: 1
      time: "0:00-0:03"
      type: "hook"
      visual: "Split screen: empty clinic chairs on left, full waiting room on right"
      audio: "Your clinic is losing revenue to empty chairs. Every single day."
      text_overlay: "Empty chairs = lost revenue"
      notes: "High contrast, immediate visual impact"

    - scene: 2
      time: "0:03-0:12"
      type: "problem"
      visual: "Animation showing missed calls, unanswered WhatsApp messages, patients forgetting appointments"
      audio: "Patients forget. Front desks miss calls. Reminders go unsent."
      text_overlay: "67% of no-shows are preventable"
      notes: "Show the pain, but briefly"

    - scene: 3
      time: "0:12-0:30"
      type: "solution"
      visual: "Screen recording of Zavis sending automated WhatsApp reminders, patient confirming with one tap, calendar filling up"
      audio: "Zavis sends automated reminders via WhatsApp. Patients confirm or reschedule in one tap. Your schedule stays full."
      text_overlay: "Automated reminders. One-tap rescheduling. Full schedule."
      notes: "Show the product in action, real UI"

    - scene: 4
      time: "0:30-0:42"
      type: "proof"
      visual: "Analytics dashboard showing no-show rate dropping, revenue graph climbing"
      audio: "Clinics using Zavis see no-show rates drop by 40% or more. That is revenue recovered, automatically."
      text_overlay: "40%+ reduction in no-shows"
      notes: "Data visualization, credibility"

    - scene: 5
      time: "0:42-0:45"
      type: "cta"
      visual: "Zavis logo on green background, zavis.ai URL, Book a Demo button"
      audio: "Book a demo at zavis.ai"
      text_overlay: "zavis.ai | Book a Demo"
      notes: "Clean, branded, 3 full seconds"
```

---

## Remotion Composition Patterns

Remotion compositions are React components that define the video programmatically. Store templates in `/templates/video/{template-name}/`.

### Basic Composition Structure

```tsx
// /templates/video/short-form/src/Composition.tsx
import { Composition } from 'remotion';
import { ShortFormVideo } from './ShortFormVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ShortFormVideo"
      component={ShortFormVideo}
      durationInFrames={45 * 30} // 45 seconds at 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: [], // Populated from script YAML
        voiceoverUrl: '', // Eleven Labs output
        musicUrl: '', // Suno output
        brandColors: {
          green: '#006828',
          offBlack: '#1c1c1c',
          offWhite: '#f8f8f6',
          white: '#ffffff',
        },
      }}
    />
  );
};
```

### Scene Transition Patterns
- **Cut:** Direct cut for fast-paced short-form content
- **Fade:** 0.5s crossfade for brand videos and product demos
- **Slide:** Horizontal slide for carousel-style content
- **Zoom:** Ken Burns effect for still images used as video scenes

### Text Overlay Patterns
- Always use Bricolage Grotesque for headlines in video
- Text overlays appear with a subtle fade-in (0.3s) and remain for the full scene duration
- Use a semi-transparent dark background behind text for readability: `rgba(28, 28, 28, 0.7)`
- Position: bottom-third for subtitles, center for key statements, top for scene titles

---

## Workflow Process

### Step 1: Write Script
Read the campaign brief and write the video script:
- Define the target platform, format, and duration
- Identify the pillar connection
- Write the hook first (this is the most critical 3 seconds)
- Structure scenes with visual direction, audio, and text overlays
- Time each scene precisely
- Store script as YAML in `/assets/videos/{asset-id}/script.yaml`

### Step 2: Prepare Assets
Gather and generate all visual assets:
- **AI video clips:** Generate via Veo 3 for scenes requiring footage (healthcare settings, patient interactions, clinic environments)
- **Screen recordings:** Capture Zavis product UI for demo scenes
- **Brand assets:** Pull logos, icons, and brand elements from `/knowledge/brand/`
- **Still images:** Generate via Nano Banana for scenes using static visuals with Ken Burns movement
- Store all source assets in `/assets/videos/{asset-id}/sources/`

### Step 3: Generate Voice-Over
Create narration via Eleven Labs:
- Select voice: professional, warm, authoritative (match the Zavis tone)
- Generate audio for each scene or as a continuous narration
- Adjust pacing to match scene timings
- Generate multilingual versions if needed (English, Arabic for UAE/KSA market)
- Store audio in `/assets/videos/{asset-id}/audio/voiceover.mp3`

### Step 4: Create Music
Generate or select background music via Suno:
- Match mood to the video tone (professional, uplifting, confident)
- Keep music subtle enough not to compete with narration
- Generate 2-3 variants to test against the voice-over
- Ensure music loops cleanly if video is short-form
- Store in `/assets/videos/{asset-id}/audio/music.mp3`

### Step 5: Build Remotion Composition
Write the React composition:
- Import all assets (video clips, images, audio, music)
- Define scene timing, transitions, and animations
- Add text overlays with brand typography
- Sync audio to visual scenes
- Render a preview at low resolution for quick review
- Store composition in `/templates/video/{template-name}/`

### Step 6: Render
Render the final video:
- Render at full resolution for each target platform
- Generate platform-specific versions (vertical for Shorts/Reels, landscape for YouTube/LinkedIn)
- Encode with FFmpeg for optimal file size and quality (H.264, AAC audio)
- Store final renders in `/assets/videos/{asset-id}/v{n}.mp4`

### Step 7: Generate Thumbnail
Create a thumbnail for each platform:
- Use Nano Banana to generate a compelling still frame
- Follow YouTube thumbnail best practices: bold text, high contrast, face close-up if applicable
- Dimensions: 1280 x 720 (16:9) for YouTube, 1080 x 1920 (9:16) for Reels/Shorts cover
- Store in `/assets/videos/{asset-id}/thumbnail.png`

### Step 8: Present for Review
Present the video for human feedback:
- Enable frame-by-frame scrubbing for precise feedback
- Allow reviewers to select time ranges and annotate ("transition at 0:04 too abrupt", "text at 0:08-0:10 unreadable")
- Show the script alongside the video for reference
- Include thumbnail preview
- Present all platform variants

### Step 9: Iterate
Process feedback:
- For timing changes: adjust Remotion composition and re-render
- For scene replacements: regenerate via Veo 3 or swap assets
- For audio changes: regenerate voice-over or music
- Save each iteration as a new version (v2.mp4, v3.mp4)
- Update metadata

### Step 10: Approval and Publishing
Once approved:
- Upload to target platforms via their APIs (YouTube Data API, etc.)
- Set metadata: title, description, tags, thumbnail, scheduled publish time
- Hand off to social-publisher skill for cross-platform distribution
- Mark asset as `APPROVED` in campaign status

---

## Zavis-Specific Video Rules

1. **Healthcare scenarios only.** Every video must be grounded in a healthcare setting: clinics, hospitals, consultation rooms, patient interactions, healthcare professional workflows.
2. **Patient journey demonstrations.** Show the actual patient journey: inquiry, booking, reminder, visit, follow-up. This is the core Zavis value proposition visualized.
3. **AI agent interactions.** When showing AI in action, demonstrate: instant response on WhatsApp, automated booking confirmation, reminder messages, no-show recovery outreach.
4. **Clinic environments.** Modern, warm, well-lit clinic settings. Natural wood, plants, natural light. No cold, sterile, blue-tinted hospital aesthetics.
5. **Product UI shots.** When showing the Zavis interface, use real or realistic product screenshots. Show the omnichannel inbox, booking calendar, patient 360 view, analytics dashboard.
6. **Three pillars in every video.** Every video should demonstrate at least one pillar. The best videos show all three in action.
7. **No emojis in text overlays.** Use Lucide icons or descriptive text instead.
8. **Multilingual consideration.** For UAE/KSA markets, consider Arabic voice-over and right-to-left text overlays.

---

## Metadata Structure

```yaml
asset:
  id: "vid-2026-03-04-001"
  campaign_id: "campaign-q2-2026-pe-launch"
  type: "video_short"
  platform: "instagram_reels"
  dimensions: "1080x1920"
  duration: 45
  fps: 30
  version: 1
  status: IN_REVIEW
  created: "2026-03-04"

script_path: "/assets/videos/vid-2026-03-04-001/script.yaml"
composition_path: "/templates/video/short-form-noshows/"
voiceover:
  tool: "eleven-labs"
  voice_id: "professional-warm-01"
  language: "en"
music:
  tool: "suno"
  mood: "uplifting-professional"
  duration: 45

brand_compliance:
  colors_used: ["#006828", "#1c1c1c", "#f8f8f6"]
  typography: "Bricolage Grotesque"
  visual_style: "warm clinic, golden hour"
  pillar_connection: "reduce_no_shows"

files:
  final: "v1.mp4"
  thumbnail: "thumbnail.png"
  variants:
    - "v1-reels-1080x1920.mp4"
    - "v1-youtube-1920x1080.mp4"
    - "v1-meta-feed-1080x1080.mp4"
```

---

## Quality Checks Before Presenting

- [ ] Hook captures attention within first 3 seconds
- [ ] CTA is clear, visible, and on screen for 3+ seconds
- [ ] Text overlays are readable with sufficient contrast and background
- [ ] Audio levels are balanced (voice-over clear over music)
- [ ] Brand colors are consistent throughout
- [ ] No emojis in any text overlay or title card
- [ ] Healthcare setting is authentic and warm
- [ ] Pillar connection is clear in the narrative
- [ ] Duration matches platform requirements
- [ ] All platform variants are rendered at correct dimensions
- [ ] Thumbnail is compelling and brand-consistent
- [ ] Metadata YAML is complete

---

## Cross-Workflow Dependencies

This skill:
- **Receives from** Image Creator: brand assets, still frames for Ken Burns scenes
- **Feeds into** Social Publisher: platform-ready videos for posting
- **Feeds into** Ad Manager: video ad creatives for Meta and YouTube campaigns
- **Uses** Content Writer output: scripts based on blog content, repurposed messaging
