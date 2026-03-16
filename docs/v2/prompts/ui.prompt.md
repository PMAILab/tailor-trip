Perfect. I'll give you a **high-clarity, production-ready master prompt** you can paste into:

* Google Stitch / Google Sketch / Gemini-based design tools
* Figma AI
* Galileo AI
* Uizard
* Any AI wireframing tool

This prompt is structured so the tool understands:

* Product context
* UX principles
* Screen hierarchy
* Interaction logic
* Data components
* States and edge cases

---

# 🔥 MASTER WIREFRAME GENERATION PROMPT — v2

*(Copy everything below and paste into your design AI tool)*

---

You are a senior product designer creating high-fidelity wireframes for a mobile app called **TailorTrip**.

## Product Context

TailorTrip is an AI-powered Smart Travel Optimizer for Gen Z and Millennials in Indian metro cities.

It is NOT an OTA.
It is NOT a listing-heavy travel booking app.
It is a decision engine that helps users:

* Discover destinations based on mood
* See optimized timing insights
* Understand total trip cost upfront
* Compare trade-offs clearly
* Feel confident before booking

The design should feel:

* Intelligent
* Clean
* Minimal
* Data-forward
* Modern but not playful
* Trustworthy

Avoid:

* Clutter
* Overuse of icons
* Aggressive upsells
* Corporate OTA look

Mobile-first design (iPhone 14 Pro size).

---

# SCREENS TO DESIGN

Design the following complete user journey with full UI structure, components, states, and layout logic.

---

## 1️⃣ Splash Screen

Elements:

* TailorTrip logo
* Tagline: "Don't just book. Optimize."
* Subtle animated background (travel imagery gradient)
* CTA button: "Start Exploring"

---

## 2️⃣ Mood Selection Screen (Primary Entry)

Header:
"How do you want to feel?"

Subtext:
"Start with a vibe. We'll handle the rest."

Scrollable Mood Cards (2-column grid):

* Need a reset 🌿
* Adventure mode 🧗
* Budget weekend 💸
* Romantic escape ❤️
* Workation vibe 💻
* Explore something new ✨

Each card:

* Soft background image
* Large label
* Subtext (1 line description)
* Tap interaction state

Bottom:
"Or browse trending trips"

Design requirements:

* Spacious layout
* Card-first approach
* No overwhelming filters
* No dates required upfront

---

## 3️⃣ Destination Recommendation Feed

After mood selection.

Header:
"Optimized trips for your vibe"

Scrollable vertical cards (large, visual).

Each Smart Destination Card must include:

Top Section:

* Hero image
* Destination name
* 2–3 day tag (example duration)

Middle Section:

* Estimated Total Cost (₹ range)
* Cheapest Month Badge
* Crowd Indicator (Low / Medium / High)
* Weather Badge (Pleasant / Hot / Rainy)

Expandable Section:
"Why this fits you"
Expandable text box:
Example:
"July is 30% cheaper, lower crowd season, and fits your weekend duration."

Bottom Section:

* Save icon
* View Details button

Include card states:

* Default
* Saved
* Expanded explanation

---

## 4️⃣ Destination Detail / Optimization Dashboard Screen

This is the core screen.

Structure it clearly in sections.

SECTION A – Trip Snapshot

* Destination name
* Large hero image
* Estimated total trip cost
* Duration assumption (2–3 days)

SECTION B – Cost Breakdown
Card layout:

* Travel
* Stay
* Food & experiences
* Per person estimate

Include simple horizontal bar visual for cost distribution.

SECTION C – Timing Optimization
Include:

* Cheapest month graph (simple bar chart)
* Crowd calendar (small month grid with color codes)
* Weather summary panel

SECTION D – Trade-Off Toggle
Three pill buttons:

* Cheapest
* Least Crowded
* Balanced

Switching should update:

* Cost estimate
* Recommended month
* Crowd indicator

SECTION E – Budget Fit Meter
Optional salary input field.

If salary entered:
Show:
"This trip ≈ 18% of your monthly income"

If not:
Show:
"Affordable for most metro travelers"

SECTION F – CTA Area
Buttons:

* Save Trip
* Compare Later
* View Booking Options
* Generate Itinerary *(new in v2)*

Bottom disclaimer:
"Prices are estimated and may vary."

Design:

* Clean white space
* Clear section separation
* Data-first visualization
* No clutter

---

## 5️⃣ Saved Trips Screen

Header:
"Your Shortlist"

List of saved destinations:
Each shows:

* Thumbnail
* Cost range
* Cheapest month
* Remove icon
* "Plan This Trip →" action *(new in v2)*

Compare Selection Mode:
* Checkbox per card when in compare-select mode
* "Compare Selected (N)" button at bottom (active when ≥ 2 selected)

Empty State:
"Start exploring to build your shortlist."

---

## 6️⃣ Profile (Lightweight)

Minimal.

Sections:

* Name
* Optional salary input
* Travel preferences (editable later)
* Data privacy & settings

Keep extremely simple.

---

# ✨ NEW v2 SCREENS

---

## 7️⃣ Compare Trips Screen

Entry: from Shortlist when 2–3 trips are selected.

Header:
"Compare Trips"
Subheader: shows 2–3 destination names as pills.

Layout:
Horizontal scrollable grid.
Each column = one destination.
Each row = one comparison dimension.

Rows to include:

| Row | Content |
|-----|---------|
| Destination Header | Hero image + name + "Remove" (×) icon |
| Estimated Total Cost | ₹ range (highlight lowest in green) |
| Cost Breakdown | Mini bar chart (Travel / Stay / Food) |
| Cheapest Month | Badge |
| Crowd Level | Low / Med / High pill (highlight lowest in green) |
| Weather | Pleasant / Hot / Rainy |
| Duration | Days |
| AI Match Score | % match to mood (highlight highest) |
| Book This Trip | CTA button per column |

Below grid:
AI Recommendation Card:
* Section header: "TailorTrip's Pick"
* Streaming text: 2–3 sentence recommendation naming the winner
* "Regenerate" icon
* Typing animation during generation

Design:
* Sticky left column for row labels on small screens
* Green highlights for best value per row
* Clean, comparison-table feel (not cluttered)

---

## 8️⃣ AI Chatbot Panel (Overlay — appears on all screens)

Entry: floating chat bubble button (bottom right corner, all screens except splash).

Renders as: bottom sheet slide-up (70vh height). Does NOT navigate away.

Panel Structure:

Header:
* "TailorTrip AI" label
* Close (×) button

Disclaimer banner (below header):
"Prices are estimated. Not a booking service."

Message Area:
* Scrollable message list
* User messages: right-aligned, accent color bubble
* AI messages: left-aligned, light grey bubble
* AI message with linked destination: includes a mini card (thumbnail + name + cost + "View →" link)

Empty state (no messages yet):
Quick reply chips:
* "What's cheap right now?"
* "Help me pick a trip"
* "Plan my weekend"

Input Area (fixed at bottom):
* Text input field: "Ask anything about your trip..."
* Send button

States:
* Loading / streaming: animated typing dots in AI message bubble
* Error: "Couldn't connect. Tap to retry."
* Chat bubble badge: unread dot when panel is closed and AI replied

---

## 9️⃣ Itinerary Builder — Input Form (Screen 1 of 2)

Entry: from TripDetails "Generate Itinerary" button or Shortlist "Plan This Trip".

Header:
"Build Your Itinerary"
Step indicator: ● ○ (Step 1 of 2)

Fields:

1. **Destination** — text input (pre-filled, editable)
2. **Travel Dates** — From / To date inputs (side by side)
3. **Who's going?** — Pill select: Solo / Couple / Friends / Family
4. **Budget per person** — Pill select: Under ₹5K / ₹5K–₹10K / ₹10K–₹20K / ₹20K+

Bottom:
* "Next →" button
* "Generate Itinerary" CTA (shown but secondary; allows skip-ahead)

---

## 🔟 Itinerary Builder — Input Form (Screen 2 of 2)

Header:
"A little more about you"
Step indicator: ○ ● (Step 2 of 2)

Fields:

5. **Interests** — Multi-select chips (up to 5):
   Food & Cafes · Nature · History · Nightlife · Adventure · Spiritual · Shopping
   *(Selected chips fill with accent color)*

6. **Dietary Preference** — Pill select: Veg / Non-Veg / Both

7. **Pace** — Pill select: Relaxed / Moderate / Packed

Bottom:
* "← Back" link
* "Generate Itinerary ✨" primary CTA button (large, full width)

---

## 1️⃣1️⃣ Generated Itinerary View

Shown after generation completes (or as days stream in).

Header:
* Destination name + date range
* Party type + budget pills

Toolbar (below header):
* "Save Itinerary" button
* "Share" button (copy to clipboard icon)

Body — Day Cards (accordion, open by default):

Each day card:
* Day header: "Day 1 — Mon, 4 Jul" + Estimated Day Cost badge (right)
* "Refresh Day 🔄" icon button at header right
* Three slot sections:

  **Morning / Afternoon / Evening** (each slot):
  * Activity name (bold)
  * Venue name (light grey)
  * Duration · Cost (one line)
  * AI reason (italic, small text): e.g. "Best visited early to avoid weekend crowd."
  * Tap activity name to edit inline

Footer:
* "Regenerate All" button (ghost style)
* Empty space for comfortable scrolling

Streaming / Loading state:
* Show skeleton placeholder cards for days not yet generated
* Days appear one by one as streaming chunks arrive

---

# EDGE CASE SCREENS

Include:

1. No Recommendations Found
   Message:
   "Nothing matched perfectly — here's something trending instead."

2. Loading State
   Skeleton cards.

3. Data Updating State
   "Cost insights are refreshing."

4. Error State
   "Something went wrong. Retry."

5. Chat Error State *(new in v2)*
   "Couldn't connect to AI. Tap to retry."

6. Itinerary Generation Timeout *(new in v2)*
   "Taking longer than usual. We'll show what we have." + partial day display.

---

# UX PRINCIPLES TO FOLLOW

* Max 3 major actions per screen
* Primary CTA always visible
* No dark patterns
* Transparent cost labeling
* Minimal onboarding friction
* Soft shadows
* Rounded cards
* Clean typography (Inter / SF Pro style)

---

# INTERACTION BEHAVIOR

* Swiping on mood cards triggers subtle animation
* Expanding "Why this fits you" animates open
* Trade-off toggle updates data dynamically
* Save icon fills when active
* Compare grid scrolls horizontally; row labels stick to left
* Chat panel slides up from bottom with spring animation
* Itinerary day cards open/collapse with smooth accordion animation
* Activity name tapped → inline edit mode (cursor appears)

---

# VISUAL STYLE

* Light theme default
* Soft neutral background (#F7F8FA)
* Accent color: Deep Blue or Emerald
* Data visualization uses soft gradient bars
* No loud red/orange tones

---

# OUTPUT FORMAT

Generate:

* High-fidelity wireframes
* Auto layout compatible
* Component-based structure
* Organized layers
* Separate frames for each screen
* Include interaction notes

---

End of prompt.

---

# 🚀 How to Use This

Paste the above into:

* Google Stitch
* Figma AI
* Galileo AI
* Uizard

Then refine spacing and typography manually.

---

If you want next, I can:

* Convert this into a Design System prompt
* Or generate a clickable prototype interaction script
* Or help you structure this for developer handoff

What's the next move?
